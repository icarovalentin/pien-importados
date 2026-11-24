import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  getSessionCookieOptions,
  isAdminAuthenticated,
} from '@/lib/auth';

export async function GET() {
  return NextResponse.json({ authenticated: isAdminAuthenticated() });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE_NAME, '', getSessionCookieOptions(0));
  return response;
}
