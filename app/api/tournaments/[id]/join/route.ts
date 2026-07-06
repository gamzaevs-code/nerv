import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const entry = await prisma.tournamentParticipant.upsert({ where: { tournamentId_userId: { tournamentId: Number(params.id), userId: user.id } }, update: {}, create: { tournamentId: Number(params.id), userId: user.id } });
  return NextResponse.json(entry);
}
