import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const earnings = await prisma.referralEarning.findMany({ where: { userId: user.id }, include: { fromUser: { select: { name: true } } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(earnings);
}
