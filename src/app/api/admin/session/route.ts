import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  getSessionCookieOptions,
  isAdminAuthenticated,
  isSameOrigin,
  revokeCurrentSession,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

function jsonNoStore(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE_HEADERS });
}

export async function GET() {
  return jsonNoStore({ authenticated: await isAdminAuthenticated() });
}

export async function DELETE(req: Request) {
  if (!isSameOrigin(req)) {
    return jsonNoStore({ error: 'Origem inválida' }, 403);
  }

  await revokeCurrentSession();

  const response = jsonNoStore({ success: true });
  response.cookies.set(ADMIN_COOKIE_NAME, '', getSessionCookieOptions(0));
  return response;
}
