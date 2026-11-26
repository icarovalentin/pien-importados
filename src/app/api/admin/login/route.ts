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
import { logServerError } from '@/lib/server-error';

const MAX_ATTEMPTS_PER_IP = 5;
const MAX_ATTEMPTS_PER_SUBNET = 15;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const WINDOW_SECONDS = Math.ceil(WINDOW_MS / 1000);
const MAX_CONTENT_LENGTH = 4096;
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

function jsonNoStore(body: unknown, status = 200, extraHeaders?: Record<string, string>) {
  return NextResponse.json(body, {
    status,
    headers: { ...NO_STORE_HEADERS, ...extraHeaders },
  });
}

function normalizeIp(raw: string): string {
  const cleaned = raw.trim().toLowerCase();
  if (cleaned.startsWith('::ffff:')) return cleaned.slice(7);
  return cleaned;
}

// Atrás de proxy confiável (Vercel etc.), x-real-ip é definido pela plataforma;
// no x-forwarded-for usamos a última entrada (adicionada pelo proxy), nunca a primeira (forjável).
function getClientIp(req: Request): string {
  const real = req.headers.get('x-real-ip');
  if (real) return normalizeIp(real);
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',');
    return normalizeIp(parts[parts.length - 1]);
  }
  return 'unknown';
}

function getSubnetPrefix(ip: string): string | null {
  if (!ip || ip === 'unknown') return null;
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
  }
  if (ip.includes(':')) {
    const parts = ip.split(':').filter(Boolean);
    if (parts.length >= 3) return `${parts.slice(0, 3).join(':')}::/48`;
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

    const ip = getClientIp(req);
    const ipKey = `login:ip:${ip}`;
    const subnet = getSubnetPrefix(ip);
    const subnetKey = subnet ? `login:net:${subnet}` : null;

    const [ipFailures, subnetFailures] = await Promise.all([
      getFailureCount(ipKey, WINDOW_MS),
      subnetKey ? getFailureCount(subnetKey, WINDOW_MS) : Promise.resolve(0),
    ]);

    if (ipFailures >= MAX_ATTEMPTS_PER_IP || subnetFailures >= MAX_ATTEMPTS_PER_SUBNET) {
      return jsonNoStore(
        {
          success: false,
          error: 'Muitas tentativas incorretas. Aguarde alguns minutos.',
        },
        429,
        { 'Retry-After': String(WINDOW_SECONDS) }
      );
    }

    const rawBody = await req.text().catch(() => null);
    if (rawBody === null || Buffer.byteLength(rawBody, 'utf8') > MAX_CONTENT_LENGTH) {
      return jsonNoStore({ success: false, error: 'Corpo da requisição muito grande' }, 413);
    }

    let parsedBody: unknown = null;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      parsedBody = null;
    }

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
      await Promise.all([
        resetFailures(ipKey),
        subnetKey ? resetFailures(subnetKey) : Promise.resolve(),
      ]);

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

    const [nextIpFailures] = await Promise.all([
      addFailure(ipKey, WINDOW_MS),
      subnetKey ? addFailure(subnetKey, WINDOW_MS) : Promise.resolve(0),
    ]);

    // Atraso progressivo leve para desacelerar força bruta sem bloquear outros IPs legítimos
    if (nextIpFailures > 1) {
      await sleep(Math.min(1500, (nextIpFailures - 1) * 300));
    }

    return jsonNoStore(
      { success: false, error: 'Senha incorreta' },
      401
    );
  } catch (error) {
    logServerError('POST /api/admin/login', error);
    return jsonNoStore(
      { success: false, error: 'Erro no servidor' },
      500
    );
  }
}
