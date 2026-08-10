import { redirect } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function MyTasksPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const tab = searchParams.tab || 'created';

  // Задания, которые пользователь создал
  const createdTasks = await prisma.task.findMany({
    where: { creatorId: user.id },
    include: {
      player: { select: { name: true } },
      votes: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Задания, которые пользователь взял
  const takenTasks = await prisma.task.findMany({
    where: { playerId: user.id },
    include: {
      creator: { select: { name: true } },
      votes: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  const tasks = tab === 'created' ? createdTasks : takenTasks;

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <div className="glass-card stack">
          <span className="badge">📋 Мои задания</span>
          <h1>Загрузите видео</h1>
          <p className="muted">
            {tab === 'created'
              ? 'Задания, которые вы создали.'
              : 'Задания, которые вы взяли. Загрузите видео, чтобы открыть голосование.'}
          </p>

          {/* ✅ ВКЛАДКИ */}
          <div className="nav-links" style={{ marginTop: 8 }}>
            <Link
              href="/my-tasks?tab=created"
              className={tab === 'created' ? 'neon-button' : 'neon-button-outline'}
            >
              📋 Созданные ({createdTasks.length})
            </Link>
            <Link
              href="/my-tasks?tab=taken"
              className={tab === 'taken' ? 'neon-button' : 'neon-button-outline'}
            >
              🎯 Взятые ({takenTasks.length})
            </Link>
          </div>

          {/* ✅ СПИСОК ЗАДАНИЙ */}
          {tasks.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ fontSize: 48 }}>📭</p>
              <p className="muted">
                {tab === 'created'
                  ? 'Вы ещё не создали ни одного задания.'
                  : 'У вас нет взятых заданий. Перейдите в раздел "Доступные задания", чтобы взять.'}
              </p>
              {tab === 'taken' && (
                <Link href="/tasks" className="neon-button" style={{ marginTop: 16 }}>
                  📋 Доступные задания
                </Link>
              )}
            </div>
          ) : (
            <div className="grid">
              {tasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/task/${task.id}`}
                  className="glass-card stack"
                  style={{ textDecoration: 'none' }}
                >
                  <span className="badge">
                    {task.status === 'taken'
                      ? '🎯 Взято'
                      : task.status === 'voting'
                      ? '🗳️ Голосование'
                      : task.status === 'approved'
                      ? '✅ Зачтено'
                      : task.status === 'open'
                      ? '📢 Открыто'
                      : task.status}
                  </span>
                  <h3>{task.title}</h3>
                  <p className="muted">{task.description || 'Без описания'}</p>
                  <div className="balance" style={{ fontSize: 24 }}>
                    {task.reward} ₽
                  </div>
                  {task.player && (
                    <p className="muted" style={{ fontSize: 12 }}>
                      Игрок: {task.player.name}
                    </p>
                  )}
                  {task.status === 'taken' && (
                    <span
                      className="neon-button"
                      style={{ padding: '4px 12px', fontSize: 12, textAlign: 'center' }}
                    >
                      📹 Загрузить видео
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}