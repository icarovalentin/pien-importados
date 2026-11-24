import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createSessionToken,
  getServerAdminPassword,
  getSessionSecret,
  isSameOrigin,
  getSessionCookieOptions,
  verifyAdminPassword,
} from '@/lib/auth';

// Limite simples de tentativas por IP para mitigar força bruta
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const attemptsByIp = new Map<string, { count: number; resetAt: number }>();

const MAX_TRACKED_IPS = 5000;
const GLOBAL_MAX_FAILURES = 50; // teto global, independe do IP informado
let globalFailures = { count: 0, resetAt: 0 };

// Atrás de proxy confiável (Vercel etc.), x-real-ip é definido pela plataforma;
// no x-forwarded-for usamos a última entrada (adicionada pelo proxy), nunca a primeira (forjável).
function getClientIp(req: Request): string {
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',');
    return parts[parts.length - 1].trim();
  }
  return 'unknown';
}

function pruneAttempts(now: number) {
  if (attemptsByIp.size < MAX_TRACKED_IPS) return;
  attemptsByIp.forEach((v, k) => {
    if (v.resetAt <= now) attemptsByIp.delete(k);
  });
  if (attemptsByIp.size >= MAX_TRACKED_IPS) attemptsByIp.clear();
}

export async function POST(req: Request) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Origem inválida' }, { status: 403 });
    }

    if (!getServerAdminPassword() || !getSessionSecret()) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Servidor sem ADMIN_PASSWORD ou ADMIN_SESSION_SECRET (mín. 32 caracteres) configurados.',
        },
        { status: 503 }
      );
    }

    const ip = getClientIp(req);
    const now = Date.now();
    if (globalFailures.resetAt <= now) globalFailures = { count: 0, resetAt: now + WINDOW_MS };
    const record = attemptsByIp.get(ip);

    if (
      globalFailures.count >= GLOBAL_MAX_FAILURES ||
      (record && record.resetAt > now && record.count >= MAX_ATTEMPTS)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Muitas tentativas incorretas. Aguarde alguns minutos.',
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const password = body?.password;

    if (verifyAdminPassword(password)) {
      attemptsByIp.delete(ip);

      const token = createSessionToken();
      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Erro ao iniciar sessão segura.' },
          { status: 500 }
        );
      }

      const response = NextResponse.json({ success: true });
      response.cookies.set(ADMIN_COOKIE_NAME, token, getSessionCookieOptions());
      return response;
    }

    globalFailures.count += 1;
    pruneAttempts(now);
    if (!record || record.resetAt <= now) {
      attemptsByIp.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    } else {
      record.count += 1;
      attemptsByIp.set(ip, record);
    }

    return NextResponse.json(
      { success: false, error: 'Senha incorreta' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return NextResponse.json(
      { success: false, error: 'Erro no servidor' },
      { status: 500 }
    );
  }
}
