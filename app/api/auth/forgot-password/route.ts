import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { enforceRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

type ForgotPasswordBody = { email?: string };

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request: Request) {
  try {
    const { email: rawEmail } = (await request.json()) as ForgotPasswordBody;
    const email = rawEmail?.trim().toLowerCase();
    const rateLimited = await enforceRateLimit(request, 'forgot-password', email);
    if (rateLimited) return rateLimited;

    if (!email) {
      return NextResponse.json({ error: 'Email обязателен.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, name: true } });

    // Не раскрываем, существует ли email в системе.
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const token = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
      const resetUrl = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${rawToken}`;

      await prisma.passwordResetToken.create({
        data: { token, userId: user.id, expiresAt },
      });

      await sendEmail({
        to: user.email,
        subject: 'Восстановление пароля НЕРВ',
        text: `Здравствуйте, ${user.name}!\n\nСсылка для сброса пароля действует 1 час:\n${resetUrl}\n\nЕсли вы не запрашивали восстановление, просто проигнорируйте письмо.`,
        html: `<p>Здравствуйте, ${user.name}!</p><p>Ссылка для сброса пароля действует 1 час:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Если вы не запрашивали восстановление, просто проигнорируйте письмо.</p>`,
      });
    }

    return NextResponse.json({ ok: true, message: 'Если email зарегистрирован, мы отправили ссылку для восстановления.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Не удалось отправить письмо восстановления.' }, { status: 500 });
  }
}
