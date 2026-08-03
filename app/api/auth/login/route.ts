import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AUTH_COOKIE_NAME, USER_ID_COOKIE_NAME, signAuthToken } from '@/lib/auth';
import { ensureReferralCode } from '@/lib/referrals';
import { enforceRateLimit } from '@/lib/rate-limit';
import { logAction } from '@/lib/logger';

export const runtime = 'nodejs';

type LoginBody = { email?: string; password?: string };

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    const rateLimited = await enforceRateLimit(request, 'login', email);
    if (rateLimited) return rateLimited;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Неверный email или пароль.' },
        { status: 401 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        { error: 'Аккаунт заблокирован.' },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Неверный email или пароль.' },
        { status: 401 }
      );
    }

    await ensureReferralCode(user.id, user.email);
    await logAction(user.id, 'login', { email }, request);

    const refreshed = await prisma.user.findUnique({
      where: { id: user.id },
    });

    // ✅ Проверяем подтверждение email (мягкое уведомление, не блокирует)
    const emailVerifiedFlag = !!refreshed?.emailVerified || !!user.emailVerified;

    const token = signAuthToken({ userId: user.id, email: user.email });
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        balance: refreshed?.balance ?? user.balance,
        emailVerified: emailVerifiedFlag, // ✅ ДОБАВЛЕНО
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, cookieOptions);
    response.cookies.set(USER_ID_COOKIE_NAME, String(user.id), cookieOptions);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Не удалось выполнить вход.' },
      { status: 500 }
    );
  }
}