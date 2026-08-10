import { notFound, redirect } from 'next/navigation';
import Header from '@/components/Header';
import BetForm from '@/components/BetForm';
import ReportButton from '@/components/ReportButton';
import UploadVideoForm from '@/components/UploadVideoForm';
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

  // ✅ Получаем playbackId из Mux по assetId (только если есть ключи)
  let playbackId = null;
  if (task.streamAssetId && process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET) {
    try {
      const Mux = (await import('@mux/mux-node')).default;
      const mux = new Mux({
        tokenId: process.env.MUX_TOKEN_ID,
        tokenSecret: process.env.MUX_TOKEN_SECRET,
      });
      const asset = await mux.video.assets.get(task.streamAssetId);
      playbackId = asset.playback_ids?.[0]?.id || null;
    } catch {
      playbackId = null;
    }
  }

  const canTake = user.role === 'player' && task.status === 'open' && task.playerId === null;
  const isPlayer = user.role === 'player' && task.playerId === user.id;
  const isTaken = task.status === 'taken';
  const isCreator = user.id === task.creatorId;

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

          {/* ✅ ВИДЕО — С ПЛЕЙСХОЛДЕРОМ ДЛЯ ЗАГЛУШКИ */}
          {playbackId ? (
            <MuxPlayerWrapper playbackId={playbackId} title={task.title} />
          ) : task.videoUrl && task.videoUrl !== '/uploads/dummy-video.mp4' ? (
            <video src={task.videoUrl} controls style={{ width: '100%', borderRadius: 16 }} />
          ) : task.status === 'voting' ? (
            <div
              style={{
                width: '100%',
                padding: 60,
                textAlign: 'center',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 16,
                border: '1px dashed rgba(139,92,246,0.3)',
              }}
            >
              <p style={{ fontSize: 48 }}>🎬</p>
              <p className="muted">Видео загружается... Ожидайте появления.</p>
            </div>
          ) : task.status === 'taken' ? (
            <p className="muted" style={{ textAlign: 'center', padding: 16 }}>
              🎬 Видео пока не загружено
            </p>
          ) : null}

          {canTake && (
            <form action={`/api/tasks/${task.id}/take`} method="POST">
              <button className="neon-button" type="submit" style={{ width: '100%' }}>
                🎯 Взять задание
              </button>
            </form>
          )}

          {isPlayer && isTaken && (
            <UploadVideoForm taskId={task.id} />
          )}

          {task.playerId && task.playerId !== user.id && (
            <p className="muted" style={{ textAlign: 'center' }}>
              ⚡ Это задание уже выполняет {task.player?.name}
            </p>
          )}

          {user.role === 'player' && task.playerId === user.id && task.status === 'taken' && (
            <p className="muted" style={{ textAlign: 'center', color: '#22C55E' }}>
              ✅ Вы взяли это задание. Загрузите видео, чтобы завершить.
            </p>
          )}

          <ReportButton targetType="task" targetId={task.id} />
        </section>

        <section className="two-grid">
          <article className="glass-card stack">
            <h2>Прогноз</h2>
            {user.role === 'viewer' || user.role === 'admin' ? (
              <BetForm taskId={task.id} />
            ) : (
              <p className="muted" style={{ textAlign: 'center' }}>
                🎯 Только зрители могут делать прогнозы
              </p>
            )}
          </article>

          <article className="glass-card stack">
            <h2>Прогнозы</h2>
            {task.bets.length === 0 && <p className="muted">Нет прогнозов</p>}
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