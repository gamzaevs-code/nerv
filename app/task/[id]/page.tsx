import { notFound, redirect } from 'next/navigation';
import Header from '@/components/Header';
import BetForm from '@/components/BetForm';
import ReportButton from '@/components/ReportButton';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      creator: { select: { name: true } },
      player: { select: { name: true } },
      bets: { include: { user: { select: { name: true } } } },
      votes: true,
    },
  });

  if (!task) notFound();

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <section className="glass-card stack">
          <span className="badge">Задание</span>
          <h1>{task.title}</h1>
          <p>{task.description}</p>
          <p className="muted">Создатель: {task.creator.name} · Игрок: {task.player?.name || '—'} · статус: {task.status}</p>
          <div className="balance">{task.reward} ₽</div>
          {task.videoUrl && <video src={task.videoUrl} controls style={{ width: '100%', borderRadius: 16 }} />}
          <ReportButton targetType="task" targetId={task.id} />
        </section>
        <section className="two-grid">
          <article className="glass-card stack"><h2>Ставка</h2><BetForm taskId={task.id} /></article>
          <article className="glass-card stack"><h2>Ставки</h2>{task.bets.map((bet) => <p key={bet.id}>{bet.user.name}: {bet.amount} ₽ на {bet.chosenOutcome}</p>)}</article>
        </section>
      </main>
    </>
  );
}
