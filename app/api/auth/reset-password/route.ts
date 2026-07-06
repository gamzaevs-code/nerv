import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enforceRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

type ResetPasswordBody = { token?: string; password?: string };

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request: Request) {
  try {
    const { token: rawToken, password } = (await request.json()) as ResetPasswordBody;
    const rateLimited = await enforceRateLimit(request, 'reset-password', rawToken?.slice(0, 12));
    if (rateLimited) return rateLimited;

    if (!rawToken || !password) {
      return NextResponse.json({ error: 'Токен и новый пароль обязательны.' }, { status: 400 });
    }

    if (password.length < 8 || !/[A-ZА-ЯЁ]/.test(password) || !/\d/.test(password)) {
      return NextResponse.json({ error: 'Пароль должен содержать минимум 8 символов, заглавную букву и цифру.' }, { status: 400 });
    }

    const token = hashToken(rawToken);
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Ссылка недействительна или истекла.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { used: true } }),
      prisma.passwordResetToken.updateMany({
        where: { userId: resetToken.userId, used: false, id: { not: resetToken.id } },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({ ok: true, message: 'Пароль обновлён. Теперь можно войти.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Не удалось обновить пароль.' }, { status: 500 });
  }
}
