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

  // Задания, которые пользователь взял (в процессе)
  const takenTasks = await prisma.task.findMany({
    where: {
      playerId: user.id,
      status: { in: ['taken', 'voting'] },
    },
    include: {
      creator: { select: { name: true } },
      votes: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  // ✅ Задания, которые пользователь выполнил (зачтены)
  const completedTasks = await prisma.task.findMany({
    where: {
      playerId: user.id,
      status: { in: ['approved', 'rejected'] },
    },
    include: {
      creator: { select: { name: true } },
      votes: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  let tasks = [];
  let emptyMessage = '';

  if (tab === 'created') {
    tasks = createdTasks;
    emptyMessage = 'Вы ещё не создали ни одного задания.';
  } else if (tab === 'taken') {
    tasks = takenTasks;
    emptyMessage = 'У вас нет взятых заданий. Перейдите в "Доступные задания".';
  } else if (tab === 'completed') {
    tasks = completedTasks;
    emptyMessage = 'У вас нет выполненных заданий.';
  }

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <div className="glass-card stack">
          <span className="badge">📋 Мои задания</span>
          <h1>Мои задания</h1>
          <p className="muted">
            {tab === 'created'
              ? 'Задания, которые вы создали.'
              : tab === 'taken'
              ? 'Задания, которые вы взяли. Загрузите видео, чтобы открыть голосование.'
              : 'Задания, которые вы выполнили.'}
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
            <Link
              href="/my-tasks?tab=completed"
              className={tab === 'completed' ? 'neon-button' : 'neon-button-outline'}
            >
              ✅ Выполненные ({completedTasks.length})
            </Link>
          </div>

          {/* ✅ СПИСОК ЗАДАНИЙ */}
          {tasks.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ fontSize: 48 }}>📭</p>
              <p className="muted">{emptyMessage}</p>
              {tab === 'taken' && (
                <Link href="/tasks" className="neon-button" style={{ marginTop: 16 }}>
                  📋 Доступные задания
                </Link>
              )}
            </div>
          ) : (
            <div className="grid">
              {tasks.map((task) => {
                const statusMap: Record<string, { label: string; color: string }> = {
                  open: { label: '📢 Открыто', color: '#8B5CF6' },
                  taken: { label: '🎯 Взято', color: '#FBBF24' },
                  voting: { label: '🗳️ Голосование', color: '#F97316' },
                  approved: { label: '✅ Зачтено', color: '#22C55E' },
                  rejected: { label: '❌ Отклонено', color: '#EF4444' },
                };
                const statusInfo = statusMap[task.status] || { label: task.status, color: '#94A3B8' };

                return (
                  <Link
                    key={task.id}
                    href={`/task/${task.id}`}
                    className="glass-card stack"
                    style={{ textDecoration: 'none' }}
                  >
                    <span
                      className="badge"
                      style={{
                        background: `${statusInfo.color}20`,
                        color: statusInfo.color,
                        borderColor: statusInfo.color,
                      }}
                    >
                      {statusInfo.label}
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
                    {task.creator && task.creatorId !== user.id && (
                      <p className="muted" style={{ fontSize: 12 }}>
                        Создатель: {task.creator.name}
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
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}