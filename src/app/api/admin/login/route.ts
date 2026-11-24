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
import { addFailure, getFailureCount, resetFailures } from '@/lib/rate-limit';

const MAX_ATTEMPTS_PER_IP = 5;
const GLOBAL_MAX_FAILURES = 50; // teto global, independe do IP informado
const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const GLOBAL_KEY = 'login:global';

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

    const ipKey = `login:ip:${getClientIp(req)}`;
    const [ipFailures, globalFailures] = await Promise.all([
      getFailureCount(ipKey, WINDOW_MS),
      getFailureCount(GLOBAL_KEY, WINDOW_MS),
    ]);

    if (ipFailures >= MAX_ATTEMPTS_PER_IP || globalFailures >= GLOBAL_MAX_FAILURES) {
      return NextResponse.json(
        {
          success: false,
          error: 'Muitas tentativas incorretas. Aguarde alguns minutos.',
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);

    if (verifyAdminPassword(body?.password)) {
      await resetFailures(ipKey);

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

    await Promise.all([addFailure(ipKey, WINDOW_MS), addFailure(GLOBAL_KEY, WINDOW_MS)]);

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
