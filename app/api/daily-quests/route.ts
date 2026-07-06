import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { ensureDailyQuests } from '@/lib/daily';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await ensureDailyQuests();
  const quests = await prisma.dailyQuest.findMany({ include: { users: { where: { userId: user.id } } } });
  return NextResponse.json(quests);
}
