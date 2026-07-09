import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import AdminCharts from '@/components/AdminCharts';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function daysAgo(days: number) { return new Date(Date.now() - days * 24 * 60 * 60 * 1000); }
export default async function AdminDashboardPage() { const admin = await requireAdmin(); if (!admin) redirect('/dashboard'); const [users, tasks, txDay, txWeek, txMonth, rewardSum] = await Promise.all([prisma.user.count(), prisma.task.count(), prisma.transaction.count({ where: { createdAt: { gte: daysAgo(1) } } }), prisma.transaction.count({ where: { createdAt: { gte: daysAgo(7) } } }), prisma.transaction.count({ where: { createdAt: { gte: daysAgo(30) } } }), prisma.transaction.aggregate({ where: { type: 'reward' }, _sum: { amount: true } })]); const chart = [{ period: 'day', users, tasks, transactions: txDay }, { period: 'week', users, tasks, transactions: txWeek }, { period: 'month', users, tasks, transactions: txMonth }]; return <><Header simplified /><main className="page-shell"><section className="glass-card stack"><h1>Admin Analytics</h1><AdminCharts data={chart} /></section><section className="grid"><article className="glass-card"><p>Users</p><div className="metric">{users}</div></article><article className="glass-card"><p>Tasks</p><div className="metric">{tasks}</div></article><article className="glass-card"><p>Выплаты</p><div className="balance">{rewardSum._sum.amount || 0} ₽</div></article></section></main></>; }
