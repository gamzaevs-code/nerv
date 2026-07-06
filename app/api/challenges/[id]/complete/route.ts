import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function periodStart(category: string) {
  const now = new Date();
  if (category === 'weekly') {
    const day = now.getDay() || 7;
    const start = new Date(now);
    start.setDate(now.getDate() - day + 1);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  now.setHours(0, 0, 0, 0);
  return now;
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const challenge = await prisma.challenge.findUnique({ where: { id: Number(params.id) } });
  if (!challenge || challenge.status !== 'active') return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });

  const start = periodStart(challenge.category);
  const existing = await prisma.userChallenge.findFirst({
    where: { userId: user.id, challengeId: challenge.id, completed: true, completedAt: { gte: start } },
  });
  if (existing) return NextResponse.json({ error: 'Челлендж уже выполнен в текущем периоде.' }, { status: 409 });

  const result = await prisma.$transaction(async (tx) => {
    const uc = await tx.userChallenge.create({ data: { userId: user.id, challengeId: challenge.id, completed: true, completedAt: new Date() } });
    await tx.user.update({ where: { id: user.id }, data: { balance: { increment: challenge.reward }, experience: { increment: 25 } } });
    await tx.transaction.create({ data: { userId: user.id, type: 'challenge', amount: challenge.reward, status: 'completed', reason: `Челлендж: ${challenge.title}` } });
    return uc;
  });
  return NextResponse.json(result, { status: 201 });
}
