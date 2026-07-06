import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import UploadVideoForm from '@/components/UploadVideoForm';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function MyTasksPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const tasks = await prisma.task.findMany({
    where: { playerId: user.id, status: 'taken' },
    include: { creator: { select: { name: true } } },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <section className="glass-card stack">
          <span className="badge">Мои задания</span>
          <h1>Загрузка видео</h1>
          <p>Задания со статусом taken. Загрузите видео, чтобы открыть голосование на 30 секунд.</p>
        </section>

        <section className="grid">
          {tasks.length === 0 && <article className="glass-card"><p>У вас нет взятых заданий.</p></article>}
          {tasks.map((task) => (
            <article className="glass-card stack" key={task.id}>
              <h2 className="neon-title">{task.title}</h2>
              <p>{task.description || 'Без описания'}</p>
              <p className="muted">Создатель: {task.creator.name} · Награда: {task.reward} ₽</p>
              <UploadVideoForm taskId={task.id} />
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
