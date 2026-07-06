import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

async function children(userId: number, depth: number): Promise<unknown[]> {
  if (depth <= 0) return [];
  const refs = await prisma.user.findMany({ where: { referredBy: userId }, select: { id: true, name: true, balance: true } });
  return Promise.all(refs.map(async (u) => ({ ...u, children: await children(u.id, depth - 1) })));
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ id: user.id, name: user.name, children: await children(user.id, 3) });
}
