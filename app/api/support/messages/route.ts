import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const targetUserId = Number(searchParams.get('userId') || user.id);
  if (user.role !== 'admin' && targetUserId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const messages = await prisma.supportMessage.findMany({ where: { userId: targetUserId }, orderBy: { createdAt: 'asc' } });
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { message, userId } = await request.json();
  const targetUserId = user.role === 'admin' && userId ? Number(userId) : user.id;
  const created = await prisma.supportMessage.create({ data: { userId: targetUserId, message: String(message || '').trim(), isFromAdmin: user.role === 'admin' } });
  return NextResponse.json(created, { status: 201 });
}
