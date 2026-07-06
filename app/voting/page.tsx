import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import VoteControls from '@/components/VoteControls';
import VotingAutoRefresh from '@/components/VotingAutoRefresh';
import MobileSwipeContainer from '@/components/MobileSwipeContainer';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function VotingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const tasks = await prisma.task.findMany({
    where: { status: 'voting' },
    include: {
      creator: { select: { name: true } },
      player: { select: { name: true } },
      votes: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <>
      <Header simplified />
      <VotingAutoRefresh initialCount={tasks.length} />
      <main className="page-shell">
        <section className="glass-card page-hero-card stack">
          <span className="badge">Voting / Verdict room</span>
          <h1>Зачёт или не зачёт?</h1>
          <p>Смотрите доказательства, голосуйте и влияйте на награды, репутацию и итоговый статус задания.</p>
        </section>

        <MobileSwipeContainer>
          {tasks.length === 0 && <article className="glass-card vote-card"><p>Заданий на голосовании пока нет.</p></article>}
          {tasks.map((task) => {
            const approveCount = task.votes.filter((vote) => vote.value === 'approve').length;
            const rejectCount = task.votes.filter((vote) => vote.value === 'reject').length;
            return (
              <article className="glass-card vote-card stack" key={task.id}>
                <span className="badge">#{task.id} · {task.reward} ₽</span>
                <h2 className="neon-title">{task.title}</h2>
                <p>{task.description || 'Без описания'}</p>
                <p className="muted">Игрок: {task.player?.name || '—'} · Зритель: {task.creator.name}</p>
                {task.videoUrl && (
                  <video src={task.videoUrl} controls style={{ width: '100%', borderRadius: 18, margin: '4px 0' }} />
                )}
                <div className="two-grid" style={{ marginTop: 0 }}>
                  <article className="glass-card"><p className="stat-label">Зачёт</p><div className="metric">{approveCount}</div></article>
                  <article className="glass-card"><p className="stat-label">Не зачёт</p><div className="metric">{rejectCount}</div></article>
                </div>
                {task.votingEndsAt && <p className="muted">Дедлайн: {task.votingEndsAt.toLocaleTimeString('ru-RU')}</p>}
                <VoteControls
                  taskId={task.id}
                  votingEndsAt={task.votingEndsAt?.toISOString() ?? null}
                  hasVoted={task.votes.some((vote) => vote.voterId === user.id)}
                />
              </article>
            );
          })}
        </MobileSwipeContainer>
      </main>
    </>
  );
}
