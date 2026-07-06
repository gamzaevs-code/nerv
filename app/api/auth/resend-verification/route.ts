import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email обязателен.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: String(email).trim().toLowerCase() },
    select: { id: true, email: true, emailVerified: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'Пользователь с таким email не найден.' }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ ok: true, message: 'Email уже подтверждён.' });
  }

  const verificationToken = crypto.randomBytes(24).toString('hex');

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationToken,
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verifyUrl = `${appUrl}/api/auth/verify?token=${verificationToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Подтвердите email НЕРВ (повторная отправка)',
    text: `Ссылка подтверждения: ${verifyUrl}`,
    html: `<p>Повторная отправка. Подтвердите email:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });

  return NextResponse.json({ ok: true, message: 'Письмо отправлено повторно.' });
}
