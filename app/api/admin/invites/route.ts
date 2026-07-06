import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { code, maxUses, expiresAt } = await request.json();
  const invite = await prisma.inviteCode.create({ data: { code: String(code || Math.random().toString(36).slice(2, 10)).toUpperCase(), createdBy: admin.id, maxUses: Number(maxUses || 1), expiresAt: expiresAt ? new Date(expiresAt) : null } });
  return NextResponse.json(invite, { status: 201 });
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json(await prisma.inviteCode.findMany({ orderBy: { createdAt: 'desc' } }));
}
