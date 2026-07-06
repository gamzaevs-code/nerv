import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import OnlineIndicator from '@/components/OnlineIndicator';
import TaskOfferForm from '@/components/TaskOfferForm';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const player = await prisma.user.findFirst({
    where: { id, role: 'player', isBanned: false },
    include: {
      presence: true,
      playingTasks: { where: { status: { in: ['approved', 'completed'] } }, orderBy: { updatedAt: 'desc' }, take: 12 },
      _count: { select: { playingTasks: true } },
    },
  });
  if (!player) notFound();

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <section className="glass-card neon-border page-hero-card stack">
          <span className="badge">Player</span>
          <div className="profile-head">
            <div className="avatar-ring">{player.avatar ? <img src={player.avatar} alt="avatar" /> : player.name.slice(0, 2).toUpperCase()}</div>
            <div>
              <h1 className="neon-text">{player.name}</h1>
              <p>{player.bio || 'Игрок НЕРВ.'}</p>
              <p className="muted">Уровень {player.level} · репутация {player.reputation} · баланс {player.balance} ₽ · <OnlineIndicator presence={player.presence} /></p>
            </div>
            <TaskOfferForm playerId={player.id} />
          </div>
        </section>

        <section className="grid">
          <article className="stat-card neon-border"><p className="stat-label">Выполнено</p><div className="metric">{player.completedTasksCount}</div></article>
          <article className="stat-card neon-border"><p className="stat-label">Провалено</p><div className="metric">{player.failedTasksCount}</div></article>
          <article className="stat-card neon-border"><p className="stat-label">Всего взято</p><div className="metric">{player._count.playingTasks}</div></article>
        </section>

        <section className="glass-card stack" style={{ marginTop: 18 }}>
          <h2 className="neon-text">Выполненные задания</h2>
          {player.playingTasks.length === 0 ? <p className="muted">Пока нет выполненных заданий.</p> : player.playingTasks.map((task) => (
            <article className="glass-card" key={task.id}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p className="muted">{task.reward} ₽ · {task.status}</p>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
