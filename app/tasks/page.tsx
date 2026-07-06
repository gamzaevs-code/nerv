import Link from 'next/link';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import TakeTaskButton from '@/components/TakeTaskButton';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function TasksPage({ searchParams }: { searchParams: { q?: string; minReward?: string; maxReward?: string; sort?: string; page?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const q = searchParams.q?.trim() || '';
  const minReward = Number(searchParams.minReward || 0);
  const maxReward = Number(searchParams.maxReward || 0);
  const sort = searchParams.sort || 'new';
  const page = Math.max(1, Number(searchParams.page || 1));
  const take = 20;

  const where = {
    status: 'open',
    ...(q ? { title: { contains: q } } : {}),
    ...((minReward > 0 || maxReward > 0) ? { reward: { ...(minReward > 0 ? { gte: minReward } : {}), ...(maxReward > 0 ? { lte: maxReward } : {}) } } : {}),
  };
  const orderBy = sort === 'reward_asc' ? { reward: 'asc' as const } : sort === 'reward_desc' ? { reward: 'desc' as const } : { createdAt: 'desc' as const };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({ where, include: { creator: { select: { name: true } } }, orderBy, skip: (page - 1) * take, take }),
    prisma.task.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / take));
  const queryBase = `q=${encodeURIComponent(q)}&minReward=${minReward || ''}&maxReward=${maxReward || ''}&sort=${sort}`;

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <section className="glass-card page-hero-card stack">
          <span className="badge">Tasks / Player mode</span>
          <h1>Доступные задания</h1>
          <p>Фильтруйте открытые испытания по названию, награде и свежести. Берите задачу — и запускайте игровой цикл.</p>
          <form className="form" action="/tasks">
            <input name="q" defaultValue={q} placeholder="Поиск по названию" />
            <div className="grid" style={{ marginTop: 0 }}>
              <input name="minReward" type="number" min="0" defaultValue={minReward || ''} placeholder="Мин. награда" />
              <input name="maxReward" type="number" min="0" defaultValue={maxReward || ''} placeholder="Макс. награда" />
              <select name="sort" defaultValue={sort}>
                <option value="new">Сначала новые</option>
                <option value="reward_asc">Награда ↑</option>
                <option value="reward_desc">Награда ↓</option>
              </select>
            </div>
            <button className="neon-button" type="submit">Применить фильтр</button>
          </form>
        </section>

        <section className="grid">
          {tasks.length === 0 && <article className="glass-card task-card"><p>Открытых заданий пока нет.</p></article>}
          {tasks.map((task) => (
            <article className="glass-card task-card stack" key={task.id}>
              <span className="badge">#{task.id}</span>
              <h2 className="neon-title">{task.title}</h2>
              <p>{task.description || 'Без описания'}</p>
              <p className="muted">Создатель: {task.creator.name}</p>
              <div className="balance">{task.reward} ₽</div>
              <TakeTaskButton taskId={task.id} />
            </article>
          ))}
        </section>
        <div className="nav-links" style={{ marginTop: 24, justifyContent: 'center' }}>
          {page > 1 && <Link className="neon-button-outline" href={`/tasks?${queryBase}&page=${page - 1}`}>← Назад</Link>}
          <span className="badge">{page} / {pages}</span>
          {page < pages && <Link className="neon-button-outline" href={`/tasks?${queryBase}&page=${page + 1}`}>Вперёд →</Link>}
        </div>
      </main>
    </>
  );
}
