import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = Number(params.id);
  const { amount, reason } = await request.json();
  const delta = Number(amount);
  if (!Number.isInteger(id) || !Number.isInteger(delta) || delta === 0) {
    return NextResponse.json({ error: 'Некорректная сумма.' }, { status: 400 });
  }

  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({ where: { id }, data: { balance: { increment: delta } }, select: { id: true, balance: true } });
    await tx.transaction.create({ data: { userId: id, amount: delta, reason: String(reason || 'Админская корректировка') } });
    return updated;
  });

  return NextResponse.json(user);
}
