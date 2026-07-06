import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const tournament = await prisma.tournament.findUnique({ where: { id: Number(params.id) }, include: { participants: { include: { user: { select: { name: true, avatar: true } } }, orderBy: [{ score: 'desc' }] } } });
  if (!tournament) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(tournament);
}
