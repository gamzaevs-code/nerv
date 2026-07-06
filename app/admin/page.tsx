import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { BalanceForm, BanButton, DeleteTaskButton } from '@/components/AdminActions';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function daysAgo(days: number) { return new Date(Date.now() - days * 24 * 60 * 60 * 1000); }

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/dashboard');

  const [users, tasks, userCount, taskCount, txDay, txWeek, txMonth] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.task.findMany({ include: { creator: { select: { name: true } }, player: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.user.count(),
    prisma.task.count(),
    prisma.transaction.count({ where: { createdAt: { gte: daysAgo(1) } } }),
    prisma.transaction.count({ where: { createdAt: { gte: daysAgo(7) } } }),
    prisma.transaction.count({ where: { createdAt: { gte: daysAgo(30) } } }),
  ]);

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <section className="glass-card stack">
          <span className="badge">Admin</span>
          <h1>Админ-панель</h1>
          <p>Пользователи, задания, блокировки и баланс.</p>
        </section>
        <section className="grid">
          <article className="glass-card"><p className="muted">Пользователей</p><div className="metric">{userCount}</div></article>
          <article className="glass-card"><p className="muted">Заданий</p><div className="metric">{taskCount}</div></article>
          <article className="glass-card"><p className="muted">Транзакции день/неделя/месяц</p><div className="metric">{txDay}/{txWeek}/{txMonth}</div></article>
        </section>
        <section className="glass-card stack" style={{ marginTop: 18 }}>
          <h2 className="neon-title">Пользователи</h2>
          {users.map((user) => (
            <div className="glass-card stack" key={user.id}>
              <strong>{user.name} · {user.email}</strong>
              <p className="muted">role: {user.role} · balance: {user.balance} ₽ · {user.isBanned ? 'banned' : 'active'}</p>
              <div className="nav-links"><BanButton userId={user.id} isBanned={user.isBanned} /><BalanceForm userId={user.id} /></div>
            </div>
          ))}
        </section>
        <section className="glass-card stack" style={{ marginTop: 18 }}>
          <h2 className="neon-title">Задания</h2>
          {tasks.map((task) => (
            <div className="glass-card stack" key={task.id}>
              <strong>{task.title}</strong>
              <p className="muted">status: {task.status} · reward: {task.reward} ₽ · creator: {task.creator.name} · player: {task.player?.name || '—'}</p>
              <DeleteTaskButton taskId={task.id} />
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
