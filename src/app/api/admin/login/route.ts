import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createSessionToken,
  getServerAdminPassword,
  getSessionCookieOptions,
  verifyAdminPassword,
} from '@/lib/auth';

// Limite simples de tentativas por IP para mitigar força bruta
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const attemptsByIp = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req: Request) {
  try {
    if (!getServerAdminPassword()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Variável ADMIN_PASSWORD não configurada no servidor.',
        },
        { status: 503 }
      );
    }

    const ip = getClientIp(req);
    const now = Date.now();
    const record = attemptsByIp.get(ip);

    if (record && record.resetAt > now && record.count >= MAX_ATTEMPTS) {
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
