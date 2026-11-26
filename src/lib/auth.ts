import crypto from 'crypto';
import { cookies } from 'next/headers';
import { isSessionJtiRevoked, revokeSessionJti } from '@/lib/rate-limit';

export const ADMIN_COOKIE_NAME = 'pien_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 horas

interface SessionPayload {
  role: 'admin';
  jti?: string;
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
  const baseSecret =
    secret ?? (process.env.NODE_ENV === 'production' ? null : getServerAdminPassword());

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
 * Cria um token assinado com HMAC-SHA256 e identificador único (jti) para permitir revogação no logout.
 */
export function createSessionToken(): string | null {
  const key = getSigningKey();
  if (!key) return null;

  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    role: 'admin',
    jti: crypto.randomBytes(16).toString('hex'),
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

function parseVerifiedPayload(token: string | undefined): SessionPayload | null {
  if (!token) return null;

  const key = getSigningKey();
  if (!key) return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, providedSig] = parts;
  if (!encodedPayload || !providedSig) return null;

  const expectedSig = crypto
    .createHmac('sha256', key)
    .update(encodedPayload)
    .digest('base64url');

  const providedBuf = Buffer.from(providedSig);
  const expectedBuf = Buffer.from(expectedSig);

  if (providedBuf.length !== expectedBuf.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(providedBuf, expectedBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf-8')
    ) as SessionPayload;

    const now = Math.floor(Date.now() / 1000);
    if (parsed.role !== 'admin' || typeof parsed.exp !== 'number' || parsed.exp <= now) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Valida a assinatura HMAC, expiração e revogação de um token de sessão.
 */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  const parsed = parseVerifiedPayload(token);
  if (!parsed) return false;
  if (parsed.jti && (await isSessionJtiRevoked(parsed.jti))) {
    return false;
  }
  return true;
}

/**
 * Verifica nos Route Handlers se a requisição possui sessão administrativa válida.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    return await verifySessionToken(token);
  } catch {
    return false;
  }
}

/**
 * Revoga a sessão atual ao fazer logout.
 */
export async function revokeCurrentSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const parsed = parseVerifiedPayload(token);
    if (!parsed?.jti) return;
    const remaining = parsed.exp - Math.floor(Date.now() / 1000);
    if (remaining > 0) {
      await revokeSessionJti(parsed.jti, remaining);
    }
  } catch {
    // Segue com limpeza do cookie mesmo se falhar revogação remota
  }
}

export function getSessionCookieOptions(maxAgeSeconds = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

/**
 * Defesa contra CSRF: requisições de escrita devem vir explicitamente da mesma origem.
 */
export function isSameOrigin(req: Request): boolean {
  const rawHost = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const host = rawHost?.split(',')[0]?.trim().toLowerCase();
  if (!host) return false;

  const secFetchSite = req.headers.get('sec-fetch-site');
  if (secFetchSite && secFetchSite !== 'same-origin') {
    return false;
  }

  const origin = req.headers.get('origin');
  if (origin) {
    if (origin === 'null') return false;
    try {
      return new URL(origin).host.toLowerCase() === host;
    } catch {
      return false;
    }
  }

  // Alguns navegadores mais antigos omitem Origin e enviam apenas Referer em same-origin
  const referer = req.headers.get('referer');
  if (!referer) return false;
  try {
    return new URL(referer).host.toLowerCase() === host;
  } catch {
    return false;
  }
}
