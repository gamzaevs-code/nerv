import { redirect } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function daysAgo(days: number) { return new Date(Date.now() - days * 24 * 60 * 60 * 1000); }

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/dashboard');

  const [userCount, taskCount, txDay, txWeek, txMonth] = await Promise.all([
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
          <p>Управление платформой НЕРВ.</p>
          <div className="nav-links" style={{ marginTop: 8 }}>
            <Link className="neon-button" href="/admin/dashboard">📊 Дашборд</Link>
            <Link className="neon-button" href="/admin/users">👥 Пользователи</Link>
            <Link className="neon-button" href="/admin/tasks">📋 Задания</Link>
            <Link className="neon-button" href="/admin/reports">🚩 Жалобы</Link>
            <Link className="neon-button" href="/admin/challenges">🏅 Челленджи</Link>
            <Link className="neon-button" href="/admin/invites">🔑 Инвайты</Link>
            <Link className="neon-button" href="/admin/translations">🌍 Переводы</Link>
            <Link className="neon-button" href="/admin/tournaments">🏆 Турниры</Link>
            <Link className="neon-button" href="/admin/support">📞 Поддержка</Link>
            <Link className="neon-button" href="/admin/backup">💾 Бэкап</Link>
          </div>
        </section>
        <section className="grid" style={{ marginTop: 18 }}>
          <article className="glass-card"><p className="stat-label">Пользователей</p><div className="metric">{userCount}</div></article>
          <article className="glass-card"><p className="stat-label">Заданий</p><div className="metric">{taskCount}</div></article>
          <article className="glass-card"><p className="stat-label">Транзакции</p><div className="metric">{txDay} / {txWeek} / {txMonth}</div></article>
        </section>
        <section className="glass-card stack" style={{ marginTop: 18 }}>
          <h2 className="neon-title">Быстрые действия</h2>
          <div className="nav-links">
            <Link className="neon-button" href="/admin/dashboard">📊 Статистика</Link>
            <Link className="neon-button" href="/admin/users">👥 Список пользователей</Link>
            <Link className="neon-button" href="/admin/tasks">📋 Список заданий</Link>
            <Link className="neon-button" href="/admin/reports">🚩 Жалобы (модерация)</Link>
          </div>
        </section>
      </main>
    </>
  );
}
