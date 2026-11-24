import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  getSessionCookieOptions,
  isAdminAuthenticated,
  isSameOrigin,
} from '@/lib/auth';

export async function GET() {
  return NextResponse.json({ authenticated: await isAdminAuthenticated() });
}

export async function DELETE(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Origem inválida' }, { status: 403 });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE_NAME, '', getSessionCookieOptions(0));
  return response;
}
