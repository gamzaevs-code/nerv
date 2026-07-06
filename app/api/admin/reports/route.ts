import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const reports = await prisma.report.findMany({ include: { reporter: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(reports);
}
