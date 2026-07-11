import { notFound, redirect } from 'next/navigation';
import Header from '@/components/Header';
import BetForm from '@/components/BetForm';
import ReportButton from '@/components/ReportButton';
import UploadVideoForm from '@/components/UploadVideoForm';
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

          {/* Видео (если есть) */}
          {task.videoUrl && (
            <video src={task.videoUrl} controls style={{ width: '100%', borderRadius: 16 }} />
          )}
          {!task.videoUrl && task.status === 'taken' && (
            <p className="muted" style={{ textAlign: 'center', padding: 16 }}>
              🎬 Видео пока не загружено
            </p>
          )}

          {/* ✅ КНОПКА "ВЗЯТЬ ЗАДАНИЕ" — ТОЛЬКО ДЛЯ ИГРОКОВ, ЕСЛИ ЗАДАНИЕ ОТКРЫТО */}
          {canTake && (
            <form action={`/api/tasks/${task.id}/take`} method="POST">
              <button className="neon-button" type="submit" style={{ width: '100%' }}>
                🎯 Взять задание
              </button>
            </form>
          )}

          {/* ✅ ЗАГРУЗКА ВИДЕО — ЕСЛИ ИГРОК ВЗЯЛ ЗАДАНИЕ */}
          {isPlayer && isTaken && (
            <UploadVideoForm taskId={task.id} />
          )}

          {/* Если задание уже взято другим игроком */}
          {task.playerId && task.playerId !== user.id && (
            <p className="muted" style={{ textAlign: 'center' }}>
              ⚡ Это задание уже выполняет {task.player?.name}
            </p>
          )}

          {/* Если пользователь — игрок, но задание уже взято им */}
          {user.role === 'player' && task.playerId === user.id && task.status === 'taken' && (
            <p className="muted" style={{ textAlign: 'center', color: '#22C55E' }}>
              ✅ Вы взяли это задание. Загрузите видео, чтобы завершить.
            </p>
          )}

          <ReportButton targetType="task" targetId={task.id} />
        </section>

        <section className="two-grid">
          {/* ✅ СТАВКИ — ТОЛЬКО ДЛЯ ЗРИТЕЛЕЙ */}
          <article className="glass-card stack">
            <h2>Ставка</h2>
            {user.role === 'viewer' || user.role === 'admin' ? (
              <BetForm taskId={task.id} />
            ) : (
              <p className="muted" style={{ textAlign: 'center' }}>
                🎯 Только зрители могут делать ставки
              </p>
            )}
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