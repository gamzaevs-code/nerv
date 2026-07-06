import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { targetType, targetId, reason } = await request.json();
  if (!['user', 'task'].includes(String(targetType)) || !Number.isInteger(Number(targetId)) || !String(reason || '').trim()) {
    return NextResponse.json({ error: 'Некорректная жалоба.' }, { status: 400 });
  }
  const report = await prisma.report.create({ data: { reporterId: user.id, targetType, targetId: Number(targetId), reason: String(reason).trim() } });
  return NextResponse.json(report, { status: 201 });
}
