import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const bets = await prisma.bet.findMany({ where: { taskId: Number(params.id) }, include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(bets);
}
