import { notFound, redirect } from 'next/navigation';
import Header from '@/components/Header';
import BetForm from '@/components/BetForm';
import ReportButton from '@/components/ReportButton';
import MuxPlayerWrapper from '@/components/MuxPlayer';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const task = await prisma.task.findUnique({
    where: { id: Number(params.id) },
    include: {
      creator: { select: { name: true } },
      player: { select: { name: true } },
      bets: { include: { user: { select: { name: true } } } },
      votes: true,
    },
  });
  if (!task) notFound();

  // Получаем playbackId из Mux
  // Если у тебя в задании хранится assetId или uploadId, нужно получить playbackId
  // Вариант 1: если у тебя есть поле playbackId
  // const playbackId = task.playbackId;

  // Вариант 2: если у тебя только assetId — нужно запросить playbackId
  // const asset = await mux.video.assets.get(task.assetId);
  // const playbackId = asset.playback_ids?.[0]?.id;

  // Для демонстрации используем заглушку
  const playbackId = task.videoUrl?.split('/').pop() || '';

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="glass-card stack">
          <span className="badge">Задание</span>
          <h1>{task.title}</h1>
          <p>{task.description}</p>
          <p className="muted">
            Создатель: {task.creator.name} · Игрок: {task.player?.name || '—'} · статус: {task.status}
          </p>
          <div className="balance">{task.reward} ₽</div>

          {/* Mux плеер */}
          {playbackId ? (
            <MuxPlayerWrapper
              playbackId={playbackId}
              title={task.title}
              poster={task.thumbnailUrl || undefined}
            />
          ) : task.videoUrl ? (
            <video src={task.videoUrl} controls style={{ width: '100%', borderRadius: 16 }} />
          ) : (
            <p className="muted" style={{ textAlign: 'center', padding: 24 }}>
              🎬 Видео не загружено
            </p>
          )}

          <ReportButton targetType="task" targetId={task.id} />
        </section>

        <section className="two-grid">
          <article className="glass-card stack">
            <h2>Ставка</h2>
            <BetForm taskId={task.id} />
          </article>
          <article className="glass-card stack">
            <h2>Ставки</h2>
            {task.bets.length === 0 && <p className="muted">Нет ставок</p>}
            {task.bets.map((bet) => (
              <p key={bet.id}>
                {bet.user.name}: {bet.amount} ₽ на {bet.chosenOutcome}
              </p>
            ))}
          </article>
        </section>
      </main>
    </>
  );
}
