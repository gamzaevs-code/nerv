import JSZip from 'jszip';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = {
    profile: await prisma.user.findUnique({ where: { id: user.id }, select: { id: true, email: true, name: true, role: true, balance: true, avatar: true, bio: true, location: true, level: true, experience: true, referralCode: true, referredBy: true, createdAt: true, updatedAt: true } }),
    createdTasks: await prisma.task.findMany({ where: { creatorId: user.id } }),
    playingTasks: await prisma.task.findMany({ where: { playerId: user.id } }),
    transactions: await prisma.transaction.findMany({ where: { userId: user.id } }),
    votes: await prisma.vote.findMany({ where: { voterId: user.id } }),
    sentMessages: await prisma.message.findMany({ where: { fromUserId: user.id } }),
    receivedMessages: await prisma.message.findMany({ where: { toUserId: user.id } }),
  };

  const zip = new JSZip();
  zip.file('nerv-user-data.json', JSON.stringify(data, null, 2));
  zip.file('README.txt', 'Экспорт данных пользователя Нерв. Email-отправка подключается через SMTP/Resend в production; сейчас ZIP возвращается напрямую.');
  const buffer = await zip.generateAsync({ type: 'arraybuffer' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="nerv-export-${user.id}.zip"`,
    },
  });
}
