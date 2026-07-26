import Link from 'next/link';
import { xpForNextLevel } from '@/lib/gamification';
import ReportButton from '@/components/ReportButton';
import OfferedTaskActions from '@/components/OfferedTaskActions';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      _count: { select: { createdTasks: true, playingTasks: true, votes: true } },
      transactions: { orderBy: { createdAt: 'desc' }, take: 10 },
      presenceSubscription: true,
      offeredTasksMade: {
        where: { status: { in: ['offered', 'declined'] } },
        include: { offerTarget: { select: { name: true } } },
        orderBy: { offeredAt: 'desc' },
        take: 10,
      },
      offeredTasksReceived: {
        where: { status: 'offered' },
        include: { offerAuthor: { select: { name: true } } },
        orderBy: { offeredAt: 'desc' },
        take: 10,
      },
    },
  });
  if (!fullUser) redirect('/login');

  const earned = fullUser.transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const nextXp = xpForNextLevel(fullUser.level);
  const initials = fullUser.name.slice(0, 2).toUpperCase();

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <section className="glass-card page-hero-card stack">
          <span className="badge">Profile / Identity</span>
          <div className="profile-head">
            <div className="avatar-ring">
              {fullUser.avatar ? <img src={fullUser.avatar} alt="avatar" /> : initials}
            </div>
            <div>
              <h1>{fullUser.name}</h1>
              <p>{fullUser.bio || 'Описание пока не заполнено.'}</p>
              <p className="muted">{fullUser.location || 'Город не указан'} · {fullUser.role} · {fullUser.email}</p>
            </div>
            <Link className="neon-button-outline" href="/profile/edit">Редактировать</Link>
          </div>

          <div className="stack">
            <p className="neon-title">Уровень {fullUser.level} · опыт {fullUser.experience}/{nextXp}</p>
            <div className="xp-track">
              <div
                className="xp-fill"
                style={{
                  width: `${Math.min(100, (fullUser.experience / nextXp) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="nav-links">
            <Link className="neon-button-outline" href="/settings">⚙️ Настройки</Link>
            <Link className="neon-button-outline" href="/achievements">🏅 Достижения</Link>
            <Link className="neon-button-outline" href="/referrals">🤝 Рефералы</Link>
            <Link className="neon-button-outline" href="/wallet">💳 Кошелёк</Link>
            <Link className="neon-button-outline" href="/transactions">📒 Операции</Link>
            <Link className="neon-button-outline" href="/profile/export">Экспорт данных</Link>
            <ReportButton targetType="user" targetId={fullUser.id} />
          </div>
        </section>

        <section className="grid">
          <Link href="/wallet" className="stat-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <p className="stat-label">Баланс</p>
            <div className="balance">{fullUser.balance} ₽</div>
          </Link>
          <Link href="/my-tasks?type=created" className="stat-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <p className="stat-label">Создано заданий</p>
            <div className="metric">{fullUser._count.createdTasks}</div>
          </Link>
          <Link href="/my-tasks?type=taken" className="stat-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <p className="stat-label">Взято / выполнено</p>
            <div className="metric">{fullUser._count.playingTasks}</div>
          </Link>
          <Link href="/transactions" className="stat-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <p className="stat-label">Заработано</p>
            <div className="balance">{earned} ₽</div>
          </Link>
          <Link href="/voting" className="stat-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <p className="stat-label">Голосов</p>
            <div className="metric">{fullUser._count.votes}</div>
          </Link>
          <Link href="/leaderboard" className="stat-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <p className="stat-label">Репутация</p>
            <div className="metric">{fullUser.reputation}</div>
          </Link>
          <Link href="/my-tasks?type=history" className="stat-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <p className="stat-label">Успешно / провалено</p>
            <div className="metric">
              {fullUser.completedTasksCount} / {fullUser.failedTasksCount}
            </div>
          </Link>
        </section>

        <section className="two-grid" style={{ marginTop: 18 }}>
          <article className="glass-card stack">
            <h2 className="neon-text">Предложения</h2>
            {fullUser.offeredTasksReceived.length === 0 ? (
              <p className="muted">Новых предложений нет.</p>
            ) : (
              fullUser.offeredTasksReceived.map((task) => (
                <div className="glass-card stack" key={task.id}>
                  <b>{task.title}</b>
                  <p>{task.description}</p>
                  <p className="muted">
                    От: {task.offerAuthor?.name || 'пользователь'} · {task.reward} ₽
                  </p>
                  <OfferedTaskActions taskId={task.id} />
                </div>
              ))
            )}
          </article>
        </section>

        <section className="glass-card stack" style={{ marginTop: 18 }}>
          <h2 className="neon-text">Предложенные задания</h2>
          {fullUser.offeredTasksMade.length === 0 ? (
            <p className="muted">Вы пока не предлагали задания игрокам.</p>
          ) : (
            fullUser.offeredTasksMade.map((task) => (
              <p key={task.id}>
                <b>{task.title}</b> → {task.offerTarget?.name || 'игрок'} · {task.status} · {task.reward} ₽
              </p>
            ))
          )}
        </section>
      </main>
    </>
  );
}