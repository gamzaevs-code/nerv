import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export const runtime = 'nodejs';

export async function GET() {
  const tournaments = await prisma.tournament.findMany({ include: { _count: { select: { participants: true } } }, orderBy: { startDate: 'desc' } });
  return NextResponse.json(tournaments);
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { name, description, startDate, endDate, prizePool, status } = await request.json();
  const tournament = await prisma.tournament.create({ data: { name, description, startDate: new Date(startDate), endDate: new Date(endDate), prizePool: Number(prizePool || 0), status: status || 'upcoming' } });
  return NextResponse.json(tournament, { status: 201 });
}
