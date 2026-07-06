import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { action } = await request.json();
  const report = await prisma.report.findUnique({ where: { id: Number(params.id) } });
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (action === 'resolve') {
    if (report.targetType === 'user') await prisma.user.update({ where: { id: report.targetId }, data: { isBanned: true } }).catch(() => null);
    if (report.targetType === 'task') {
      await prisma.vote.deleteMany({ where: { taskId: report.targetId } });
      await prisma.task.delete({ where: { id: report.targetId } }).catch(() => null);
    }
  }

  const updated = await prisma.report.update({ where: { id: report.id }, data: { status: action === 'resolve' ? 'resolved' : 'rejected', resolvedAt: new Date() } });
  return NextResponse.json(updated);
}
