import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, USER_ID_COOKIE_NAME } from '@/lib/auth';

export const runtime = 'nodejs';
function logoutResponse() {
  const response = NextResponse.json({ ok: true });
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  };

  response.cookies.set(AUTH_COOKIE_NAME, '', cookieOptions);
  response.cookies.set(USER_ID_COOKIE_NAME, '', cookieOptions);
  return response;
}

export async function POST() {
  return logoutResponse();
}

export async function GET() {
  return logoutResponse();
}
