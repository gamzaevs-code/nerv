import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const data = {
    users: await prisma.user.findMany(),
    tasks: await prisma.task.findMany(),
    votes: await prisma.vote.findMany(),
    transactions: await prisma.transaction.findMany(),
    tournaments: await prisma.tournament.findMany(),
    createdAt: new Date().toISOString(),
  };
  return NextResponse.json(data);
}
