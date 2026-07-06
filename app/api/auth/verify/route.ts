import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyUser } from '@/lib/notifications';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Токен не указан.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { verificationToken: token },
    select: { id: true, email: true, verificationTokenExpires: true, emailVerified: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'Неверный токен подтверждения.' }, { status: 400 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ ok: true, message: 'Email уже подтверждён.' });
  }

  if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
    return NextResponse.json({ error: 'Токен истёк. Запросите повторную отправку.' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });

  await notifyUser(user.id, 'welcome', 'Добро пожаловать в НЕРВ! Ваш email подтверждён. Теперь вы можете создавать задания.', '/');

  return NextResponse.json({ ok: true, message: 'Email успешно подтверждён!' });
}
