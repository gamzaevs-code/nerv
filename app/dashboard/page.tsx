import Link from 'next/link';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import QuickActions from '@/components/QuickActions';
import DashboardTabs from '@/components/DashboardTabs';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function sevenDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [fullUser, createdTasks, playingTasks, votes, transactions] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id } }),
    prisma.task.findMany({ where: { creatorId: user.id }, include: { player: { select: { name: true } }, votes: true }, orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.task.findMany({ where: { playerId: user.id }, include: { creator: { select: { name: true } }, votes: true }, orderBy: { updatedAt: 'desc' }, take: 20 }),
    prisma.vote.findMany({ where: { voterId: user.id }, include: { task: { select: { title: true } } }, orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.transaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 200 }),
  ]);

  const isPlayer = user.role === 'player';
  const earned = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const days = sevenDays();
  const chart = days.map((day) => {
    const next = new Date(day); next.setDate(day.getDate() + 1);
    const actions = [...createdTasks, ...playingTasks].filter((task) => task.createdAt >= day && task.createdAt < next).length
      + votes.filter((vote) => vote.createdAt >= day && vote.createdAt < next).length;
    return { day: day.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }), actions };
  });

  const tabTasks = (isPlayer ? playingTasks : createdTasks).map((task) => ({ id: task.id, title: task.title, status: task.status, reward: task.reward }));

  return (
    <>
      <Header simplified={false} />
      <main className="page-shell dashboard-shell">
        <section className="glass-card neon-border page-hero-card stack">
          <span className="badge">Dashboard / Control center</span>
          <h1 className="neon-text">Привет, {user.name || user.email}.</h1>
          <p>Игровой центр «Нерва»: быстрые действия, статистика, задания, голосования и личный прогресс.</p>
          <div className="nav-links" style={{ marginTop: 8 }}>
            {isPlayer ? <Link className="neon-button" href="/tasks">Доступные задания</Link> : <Link className="neon-button" href="/create">Создать задание</Link>}
            <Link href="/leaderboard" className="neon-button-outline">🏆 Рейтинг</Link>
            <Link className="neon-button-outline" href="/voting">Голосование</Link>
            <Link className="neon-button-outline" href="/profile">Профиль</Link>
          </div>
        </section>

        <section className="grid dashboard-stats">
          <article className="stat-card neon-border"><p className="stat-label">Баланс</p><div className="balance stat-value">{user.balance} ₽</div></article>
          <article className="stat-card neon-border"><p className="stat-label">Репутация</p><div className="metric stat-value">{fullUser?.reputation ?? 0}</div></article>
          <article className="stat-card neon-border"><p className="stat-label">Роль</p><div className="metric stat-value">{user.role}</div></article>
        </section>

        <div style={{ marginTop: 18 }}><QuickActions role={user.role} /></div>
        {/* ✅ Активные задания — для игрока */}
{isPlayer && playingTasks.filter(t => t.status === 'taken').length > 0 && (
  <section className="glass-card stack" style={{ marginTop: 18 }}>
    <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22C55E' }}>🎯 Активные задания</span>
    <h2 className="neon-title">Загрузите видео</h2>
    <div className="grid">
      {playingTasks.filter(t => t.status === 'taken').map(task => (
        <Link key={task.id} href={`/task/${task.id}`} className="glass-card stack" style={{ textDecoration: 'none' }}>
          <strong>{task.title}</strong>
          <p className="muted">Награда: {task.reward} ₽</p>
          <span className="neon-button" style={{ padding: '4px 12px', fontSize: 12 }}>
            📹 Загрузить видео
          </span>
        </Link>
      ))}
    </div>
  </section>
)}
        <DashboardTabs stats={{ earned, completed: fullUser?.completedTasksCount ?? 0, reputation: fullUser?.reputation ?? 0 }} tasks={tabTasks} votes={votes} chart={chart} />
      </main>
    </>
  );
}
