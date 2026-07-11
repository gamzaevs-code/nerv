import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import CreateTaskForm from '@/components/CreateTaskForm';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function CreatePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const tasks = await prisma.task.findMany({
    where: { creatorId: user.id },
    include: { player: { select: { name: true } }, votes: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <section className="glass-card stack">
          <span className="badge">Зритель</span>
          <h1>Создать задание</h1>
          <p>Опишите испытание, задайте награду и отправьте его в общий список для игроков.</p>
        </section>

        <section className="two-grid">
          <article className="glass-card">
            <CreateTaskForm />
          </article>

          <article className="glass-card stack">
            <h2 className="neon-title">Мои задания</h2>
            {tasks.length === 0 && <p>Пока нет созданных заданий.</p>}
            {tasks.map((task) => (
              <div key={task.id} className="glass-card">
                <strong>{task.title}</strong>
                <p>{task.description || 'Без описания'}</p>
                <p className="muted">
                  Награда: {task.reward} ₽ · Статус: {task.status}
                </p>
                {task.player && (
                  <p className="muted">Игрок: {task.player.name}</p>
                )}
                {task.votes.length > 0 && (
                  <p className="muted">Голосов: {task.votes.length}</p>
                )}
              </div>
            ))}
          </article>
        </section>
      </main>
    </>
  );
}