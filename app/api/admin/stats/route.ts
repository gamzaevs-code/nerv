import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function daysAgo(days: number) { return new Date(Date.now() - days * 24 * 60 * 60 * 1000); }

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const [users, tasks, txDay, txWeek, txMonth, rewardSum, topViewers, topPlayers] = await Promise.all([
    prisma.user.count(),
    prisma.task.count(),
    prisma.transaction.count({ where: { createdAt: { gte: daysAgo(1) } } }),
    prisma.transaction.count({ where: { createdAt: { gte: daysAgo(7) } } }),
    prisma.transaction.count({ where: { createdAt: { gte: daysAgo(30) } } }),
    prisma.transaction.aggregate({ where: { type: 'reward' }, _sum: { amount: true } }),
    prisma.user.findMany({ where: { role: 'viewer' }, select: { name: true, _count: { select: { createdTasks: true } } }, take: 10, orderBy: { createdTasks: { _count: 'desc' } } }),
    prisma.user.findMany({ where: { role: 'player' }, select: { name: true, balance: true, _count: { select: { playingTasks: true } } }, take: 10, orderBy: { playingTasks: { _count: 'desc' } } }),
  ]);
  const chart = [1, 7, 30].map((d) => ({ period: `${d}d`, users, tasks, transactions: d === 1 ? txDay : d === 7 ? txWeek : txMonth }));
  return NextResponse.json({ users, tasks, transactions: { day: txDay, week: txWeek, month: txMonth }, rewardSum: rewardSum._sum.amount || 0, topViewers, topPlayers, chart });
}
