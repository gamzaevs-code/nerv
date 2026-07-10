import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import AdminCharts from '@/components/AdminCharts';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/dashboard');

  const [users, tasks, txDay, txWeek, txMonth, rewardSum] = await Promise.all([
    prisma.user.count(),
    prisma.task.count(),
    prisma.transaction.count({ where: { createdAt: { gte: daysAgo(1) } } }),
    prisma.transaction.count({ where: { createdAt: { gte: daysAgo(7) } } }),
    prisma.transaction.count({ where: { createdAt: { gte: daysAgo(30) } } }),
    prisma.transaction.aggregate({ where: { type: 'reward' }, _sum: { amount: true } }),
  ]);

  const chart = [
    { period: 'day', users, tasks, transactions: txDay },
    { period: 'week', users, tasks, transactions: txWeek },
    { period: 'month', users, tasks, transactions: txMonth },
  ];

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <section className="glass-card stack">
          <span className="badge">Admin / Dashboard</span>
          <h1>Аналитика</h1>
          <p>Общая статистика платформы НЕРВ.</p>
        </section>

        <AdminCharts data={chart} />

        <section className="grid" style={{ marginTop: 18 }}>
          <article className="glass-card">
            <p className="stat-label">Пользователей</p>
            <div className="metric">{users}</div>
          </article>
          <article className="glass-card">
            <p className="stat-label">Заданий</p>
            <div className="metric">{tasks}</div>
          </article>
          <article className="glass-card">
            <p className="stat-label">Транзакций (день)</p>
            <div className="metric">{txDay}</div>
          </article>
          <article className="glass-card">
            <p className="stat-label">Транзакций (неделя)</p>
            <div className="metric">{txWeek}</div>
          </article>
          <article className="glass-card">
            <p className="stat-label">Транзакций (месяц)</p>
            <div className="metric">{txMonth}</div>
          </article>
          <article className="glass-card">
            <p className="stat-label">Всего выплачено</p>
            <div className="balance">{rewardSum._sum.amount || 0} ₽</div>
          </article>
        </section>
      </main>
    </>
  );
}
