import Link from 'next/link';
import Header from '@/components/Header';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage({ searchParams }: { searchParams: { page?: string; sort?: string } }) {
  const page = Math.max(1, Number(searchParams.page || 1));
  const sort = searchParams.sort === 'reputation' ? 'reputation' : 'balance';
  const take = 20;
  const [players, total] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'player' },
      orderBy: sort === 'reputation' ? { reputation: 'desc' } : { balance: 'desc' },
      skip: (page - 1) * take,
      take,
      select: { id: true, name: true, balance: true, reputation: true, completedTasksCount: true, failedTasksCount: true, _count: { select: { playingTasks: true } } },
    }),
    prisma.user.count({ where: { role: 'player' } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / take));

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <section className="glass-card page-hero-card stack">
          <span className="badge">Leaderboard / Top players</span>
          <h1>Рейтинг игроков</h1>
          <p>Сравнивайте баланс, репутацию, выполненные задания и активность участников «Нерва».</p>
          <div className="nav-links">
            <Link className={sort === 'balance' ? 'neon-button' : 'neon-button-outline'} href="/leaderboard?sort=balance">По балансу</Link>
            <Link className={sort === 'reputation' ? 'neon-button' : 'neon-button-outline'} href="/leaderboard?sort=reputation">По репутации</Link>
            <Link href="/dashboard" className="neon-button-outline">← Дашборд</Link>
          </div>
        </section>

        <section className="leaderboard-card" style={{ marginTop: 22 }}>
          {players.length === 0 ? (
            <p style={{ textAlign: 'center', padding: 24 }}>Пока нет игроков</p>
          ) : (
            players.map((player, index) => {
              const rank = (page - 1) * take + index + 1;
              return (
                <article className="leaderboard-row" key={player.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span className={`rank-number ${rank <= 3 ? 'top' : ''}`}>#{rank}</span>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 24 }}>{player.name}</h2>
                      <p className="muted">Выполнено: {player.completedTasksCount} · Провалено: {player.failedTasksCount} · Взято: {player._count.playingTasks}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="balance">{sort === 'reputation' ? player.reputation : `${player.balance} ₽`}</div>
                    <p className="muted">rep: {player.reputation}</p>
                    <div className="nav-links" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                      <Link className="neon-button-outline" href={`/player/${player.id}`}>Профиль</Link>
                      <Link className="neon-button" href={`/player/${player.id}`}>Предложить задание</Link>
                    </div>
                  </div>
                </article>
              );
            })
          )}
          <div className="nav-links" style={{ marginTop: 20, justifyContent: 'center' }}>
            {page > 1 && <Link className="neon-button-outline" href={`/leaderboard?sort=${sort}&page=${page - 1}`}>← Назад</Link>}
            <span className="badge">{page} / {pages}</span>
            {page < pages && <Link className="neon-button-outline" href={`/leaderboard?sort=${sort}&page=${page + 1}`}>Вперёд →</Link>}
          </div>
        </section>
      </main>
    </>
  );
}
