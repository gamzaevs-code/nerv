import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AUTH_COOKIE_NAME, USER_ID_COOKIE_NAME, signAuthToken } from '@/lib/auth';
import { applyReferralBonuses, ensureReferralCode } from '@/lib/referrals';
import { enforceRateLimit } from '@/lib/rate-limit';
import { sendEmail } from '@/lib/email';
import { logAction } from '@/lib/logger';

export const runtime = 'nodejs';

type SignupBody = {
  email?: string;
  password?: string;
  name?: string;
  role?: string;
  referralCode?: string;
  inviteCode?: string;
};

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
};

async function validateInvite(inviteCode?: string) {
  const inviteCount = await prisma.inviteCode.count();
  if (inviteCount === 0) return null;
  if (!inviteCode) return 'Регистрация доступна только по инвайт-коду.';
  const invite = await prisma.inviteCode.findUnique({ where: { code: inviteCode.trim() } });
  if (!invite) return 'Инвайт-код не найден.';
  if (invite.expiresAt && invite.expiresAt < new Date()) return 'Инвайт-код истёк.';
  if (invite.usedCount >= invite.maxUses) return 'Инвайт-код уже использован.';
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupBody;
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const name = body.name?.trim();
    const role = body.role === 'player' ? 'player' : 'viewer';
    const rateLimited = await enforceRateLimit(request, 'signup', email);
    if (rateLimited) return rateLimited;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Имя, email и пароль обязательны.' }, { status: 400 });
    }

    const inviteError = await validateInvite(body.inviteCode);
    if (inviteError) return NextResponse.json({ error: inviteError }, { status: 403 });

    if (password.length < 8 || !/[A-ZА-ЯЁ]/.test(password) || !/\d/.test(password)) {
      return NextResponse.json({ error: 'Пароль должен содержать минимум 8 символов, заглавную букву и цифру.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(24).toString('hex');
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        verificationToken,
        verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      select: { id: true, email: true, name: true, role: true, balance: true },
    });

    await ensureReferralCode(user.id, user.email);
    await applyReferralBonuses(user.id, body.referralCode?.trim() || null);
    if (body.inviteCode) {
      await prisma.inviteCode.update({ where: { code: body.inviteCode.trim() }, data: { usedCount: { increment: 1 } } });
    }

    // ✅ ИСПРАВЛЕНО: ссылка на /verify-email
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin}/verify-email?token=${verificationToken}`;

    await Promise.all([
      sendEmail({
        to: user.email,
        subject: 'Подтвердите email НЕРВ',
        text: `Ссылка подтверждения: ${verifyUrl}`,
        html: `<p>Подтвердите email:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
      }),
      logAction(user.id, 'signup', { email: user.email, role }, request),
    ]);

    const refreshed = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, role: true, balance: true },
    });

    const token = signAuthToken({ userId: user.id, email: user.email });
    const response = NextResponse.json({ user: refreshed || user }, { status: 201 });
    response.cookies.set(AUTH_COOKIE_NAME, token, cookieOptions);
    response.cookies.set(USER_ID_COOKIE_NAME, String(user.id), cookieOptions);

    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Пользователь с таким email уже существует.' }, { status: 409 });
    }

    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Не удалось создать пользователя.' }, { status: 500 });
  }
}