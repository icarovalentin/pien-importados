import crypto from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'pien_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 horas

interface SessionPayload {
  role: 'admin';
  iat: number;
  exp: number;
}

/**
 * Retorna a senha configurada em variável de ambiente no servidor.
 * Nunca utiliza senha padrão em código (fail-closed).
 */
export function getServerAdminPassword(): string | null {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) {
    return null;
  }
  // Variáveis coladas na Vercel podem carregar espaço ou quebra de linha nas pontas.
  const trimmed = pwd.trim();
  if (trimmed.length === 0) {
    return null;
  }
  return trimmed;
}

/**
 * Retorna o segredo de assinatura da sessão (obrigatório em produção).
 */
export function getSessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) {
    return null;
  }
  return secret;
}

function getSigningKey(): Buffer | null {
  const secret = getSessionSecret();
  // Em produção, a chave vem exclusivamente do segredo independente.
  // Em desenvolvimento, aceita a senha como fallback quando o segredo falta.
  const baseSecret = secret ?? (
    process.env.NODE_ENV === 'production' ? null : getServerAdminPassword()
  );

  if (!baseSecret) {
    return null;
  }

  return crypto
    .createHash('sha256')
    .update(`pien-importados-session-key:${baseSecret}`)
    .digest();
}

/**
 * Compara a senha informada com a variável de ambiente em tempo constante.
 */
export function verifyAdminPassword(inputPassword: unknown): boolean {
  const serverPassword = getServerAdminPassword();
  if (!serverPassword || typeof inputPassword !== 'string') {
    return false;
  }

  if (inputPassword.length === 0 || inputPassword.length > 256) {
    return false;
  }

  const inputDigest = crypto.createHash('sha256').update(inputPassword.trim()).digest();
  const serverDigest = crypto.createHash('sha256').update(serverPassword).digest();

  return crypto.timingSafeEqual(inputDigest, serverDigest);
}

/**
 * Cria um token assinado com HMAC-SHA256 para o cookie HttpOnly.
 */
export function createSessionToken(): string | null {
  const key = getSigningKey();
  if (!key) return null;

  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    role: 'admin',
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', key)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

/**
 * Valida a assinatura HMAC e a expiração de um token de sessão.
 */
export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;

  const key = getSigningKey();
  if (!key) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [encodedPayload, providedSig] = parts;
  if (!encodedPayload || !providedSig) return false;

  const expectedSig = crypto
    .createHmac('sha256', key)
    .update(encodedPayload)
    .digest('base64url');

  const providedBuf = Buffer.from(providedSig);
  const expectedBuf = Buffer.from(expectedSig);

  if (providedBuf.length !== expectedBuf.length) {
    return false;
  }

  if (!crypto.timingSafeEqual(providedBuf, expectedBuf)) {
    return false;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf-8')
    ) as SessionPayload;

    const now = Math.floor(Date.now() / 1000);
    return parsed.role === 'admin' && typeof parsed.exp === 'number' && parsed.exp > now;
  } catch {
    return false;
  }
}

/**
 * Verifica nos Route Handlers se a requisição possui sessão administrativa válida.
 */
export function isAdminAuthenticated(): boolean {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    return verifySessionToken(token);
  } catch {
    return false;
  }
}

export function getSessionCookieOptions(maxAgeSeconds = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

/**
 * Defesa extra contra CSRF: requisições de escrita devem vir da mesma origem.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) {
    // Navegadores sempre enviam Origin em POST/PUT/DELETE cross-site; ausência = cliente não-navegador
    return req.headers.get('sec-fetch-site') !== 'cross-site';
  }

  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
