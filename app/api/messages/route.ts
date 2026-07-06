import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserIdFromCookies } from '@/lib/auth';
import { notifyUser } from '@/lib/notifications';
import { sendPushToUser } from '@/lib/push';

export const runtime = 'nodejs';

export async function GET() {
  const userId = getAuthUserIdFromCookies();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const messages = await prisma.message.findMany({
    where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
    include: {
      fromUser: { select: { id: true, name: true, avatar: true } },
      toUser: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const dialogs = new Map<number, {
    user: { id: number; name: string; avatar: string | null };
    lastMessage: string;
    createdAt: Date;
    unreadCount: number;
  }>();

  for (const message of messages) {
    const partner = message.fromUserId === userId ? message.toUser : message.fromUser;
    const existing = dialogs.get(partner.id);
    if (!existing) {
      dialogs.set(partner.id, {
        user: partner,
        lastMessage: message.text,
        createdAt: message.createdAt,
        unreadCount: message.toUserId === userId && !message.isRead ? 1 : 0,
      });
    } else if (message.toUserId === userId && !message.isRead) {
      existing.unreadCount += 1;
    }
  }

  return NextResponse.json(Array.from(dialogs.values()));
}

export async function POST(request: Request) {
  const userId = getAuthUserIdFromCookies();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { toUserId, text } = await request.json();
  const recipientId = Number(toUserId);
  const normalizedText = String(text || '').trim();

  if (!Number.isInteger(recipientId) || recipientId === userId) {
    return NextResponse.json({ error: 'Некорректный получатель.' }, { status: 400 });
  }

  if (!normalizedText) {
    return NextResponse.json({ error: 'Сообщение не может быть пустым.' }, { status: 400 });
  }

  const sender = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  const message = await prisma.message.create({
    data: { fromUserId: userId, toUserId: recipientId, text: normalizedText },
  });

  await notifyUser(recipientId, 'message', `Новое сообщение от ${sender?.name || 'пользователя'}`, `/messages/${userId}`);
  await sendPushToUser(recipientId, { title: 'Новое сообщение', body: sender?.name || 'Нерв', url: `/messages/${userId}` });
  return NextResponse.json(message, { status: 201 });
}
