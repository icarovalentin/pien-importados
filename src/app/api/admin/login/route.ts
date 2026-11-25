import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createSessionToken,
  getServerAdminPassword,
  getSessionCookieOptions,
  getSessionSecret,
  isSameOrigin,
  verifyAdminPassword,
} from '@/lib/auth';
import { addFailure, getFailureCount, resetFailures } from '@/lib/rate-limit';

const MAX_ATTEMPTS_PER_IP = 5;
const GLOBAL_MAX_FAILURES = 50; // teto global, independe do IP informado
const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const MAX_CONTENT_LENGTH = 4096;
const GLOBAL_KEY = 'login:global';
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

function jsonNoStore(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE_HEADERS });
}

function logError(context: string, error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : error && typeof error === 'object' && typeof (error as { message?: unknown }).message === 'string'
        ? (error as { message: string }).message
        : String(error);
  const code =
    error && typeof error === 'object' && 'code' in error
      ? (error as { code?: unknown }).code
      : undefined;
  console.error(`[${context}] ${message}${code !== undefined ? ` (code: ${String(code)})` : ''}`);
}

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
      return jsonNoStore({ success: false, error: 'Origem inválida' }, 403);
    }

    const contentLength = req.headers.get('content-length');
    if (contentLength !== null) {
      const length = Number(contentLength);
      if (!Number.isFinite(length) || length < 0) {
        return jsonNoStore({ success: false, error: 'Content-Length inválido' }, 400);
      }
      if (length > MAX_CONTENT_LENGTH) {
        return jsonNoStore({ success: false, error: 'Corpo da requisição muito grande' }, 413);
      }
    }

    const contentType = req.headers.get('content-type');
    if (!contentType || contentType.split(';')[0].trim().toLowerCase() !== 'application/json') {
      return jsonNoStore(
        { success: false, error: 'Content-Type deve ser application/json' },
        415
      );
    }

    const requiresSessionSecret = process.env.NODE_ENV === 'production';
    if (!getServerAdminPassword() || (requiresSessionSecret && !getSessionSecret())) {
      return jsonNoStore(
        {
          success: false,
          error:
            'Servidor sem ADMIN_PASSWORD ou ADMIN_SESSION_SECRET (mín. 32 caracteres) configurados.',
        },
        503
      );
    }

    const ipKey = `login:ip:${getClientIp(req)}`;
    const [ipFailures, globalFailures] = await Promise.all([
      getFailureCount(ipKey, WINDOW_MS),
      getFailureCount(GLOBAL_KEY, WINDOW_MS),
    ]);

    if (ipFailures >= MAX_ATTEMPTS_PER_IP || globalFailures >= GLOBAL_MAX_FAILURES) {
      return jsonNoStore(
        {
          success: false,
          error: 'Muitas tentativas incorretas. Aguarde alguns minutos.',
        },
        429
      );
    }

    const parsedBody = await req.json().catch(() => null);
    if (
      !parsedBody ||
      typeof parsedBody !== 'object' ||
      Array.isArray(parsedBody) ||
      typeof (parsedBody as { password?: unknown }).password !== 'string'
    ) {
      return jsonNoStore({ success: false, error: 'Requisição inválida' }, 400);
    }

    const password = (parsedBody as { password: string }).password;

    if (verifyAdminPassword(password)) {
      await resetFailures(ipKey);

      const token = createSessionToken();
      if (!token) {
        return jsonNoStore(
          { success: false, error: 'Erro ao iniciar sessão segura.' },
          500
        );
      }

      const response = jsonNoStore({ success: true });
      response.cookies.set(ADMIN_COOKIE_NAME, token, getSessionCookieOptions());
      return response;
    }

    await Promise.all([addFailure(ipKey, WINDOW_MS), addFailure(GLOBAL_KEY, WINDOW_MS)]);

    return jsonNoStore(
      { success: false, error: 'Senha incorreta' },
      401
    );
  } catch (error) {
    logError('POST /api/admin/login', error);
    return jsonNoStore(
      { success: false, error: 'Erro no servidor' },
      500
    );
  }
}
