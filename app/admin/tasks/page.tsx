import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { DeleteTaskButton } from '@/components/AdminActions';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminTasksPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/dashboard');

  const tasks = await prisma.task.findMany({
    include: { creator: { select: { name: true } }, player: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <section className="glass-card stack">
          <span className="badge">Admin / Tasks</span>
          <h1>Задания</h1>
          <p className="muted">Всего: {tasks.length}</p>
        </section>

        <div className="admin-table">
          {tasks.map((task) => (
            <div className="glass-card stack" key={task.id}>
              <div className="admin-row">
                <div>
                  <strong>{task.title}</strong>
                  <p className="muted">{task.description || 'Без описания'}</p>
                  <p className="muted">
                    status: <span className={`status-${task.status}`}>{task.status}</span> · 
                    reward: {task.reward} ₽ · creator: {task.creator.name} · 
                    player: {task.player?.name || '—'} · 
                    {new Date(task.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <DeleteTaskButton taskId={task.id} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
