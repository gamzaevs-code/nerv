import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import TaskOfferForm from '@/components/TaskOfferForm';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function getOnlineStatus(lastSeen: Date) {
  const now = new Date();
  const diff = (now.getTime() - new Date(lastSeen).getTime()) / 1000 / 60;
  if (diff < 1) return { text: 'В сети сейчас', color: '#22C55E' };
  if (diff < 5) return { text: 'Был(а) менее 5 мин назад', color: '#22C55E' };
  if (diff < 60) return { text: `Был(а) ${Math.floor(diff)} мин назад`, color: '#FBBF24' };
  return { text: `Был(а) ${Math.floor(diff / 60)} ч назад`, color: '#94A3B8' };
}

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const playerId = Number(params.id);
  if (Number.isNaN(playerId)) notFound();

  const [player, presence] = await Promise.all([
    prisma.user.findUnique({
      where: { id: playerId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balance: true,
        reputation: true,
        level: true,
        experience: true,
        completedTasksCount: true,
        createdAt: true,
        avatar: true,
        bio: true,
        location: true,
      },
    }),
    prisma.userPresence.findUnique({
      where: { userId: playerId },
      select: { isOnline: true, lastSeen: true },
    }),
  ]);

  if (!player) notFound();

  const onlineStatus = presence
    ? getOnlineStatus(presence.lastSeen)
    : { text: 'Не в сети', color: '#94A3B8' };

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <div className="glass-card stack" style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="avatar-ring" style={{ width: 80, height: 80 }}>
              {player.avatar ? <img src={player.avatar} alt={player.name} /> : player.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1>{player.name}</h1>
              <p className="muted">
                {player.role === 'player' ? '🎮 Игрок' : '👀 Зритель'} · Уровень {player.level}
              </p>
              <p className="muted">{player.location || 'Город не указан'}</p>
              {/* ✅ ОНЛАЙН-СТАТУС */}
              <span style={{ color: onlineStatus.color, fontSize: 14 }}>
                ● {onlineStatus.text}
              </span>
            </div>
          </div>

          <p>{player.bio || 'Описание пока не заполнено.'}</p>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 8 }}>
            <div className="stat-card">
              <p className="stat-label">Репутация</p>
              <div className="metric">{player.reputation}</div>
            </div>
            <div className="stat-card">
              <p className="stat-label">Заданий выполнено</p>
              <div className="metric">{player.completedTasksCount}</div>
            </div>
            <div className="stat-card">
              <p className="stat-label">В системе</p>
              <div className="metric" style={{ fontSize: 16 }}>
                {new Date(player.createdAt).toLocaleDateString('ru-RU')}
              </div>
            </div>
          </div>

          {/* ✅ ПРЕДЛОЖИТЬ ЗАДАНИЕ — форма (исправление сломанной ссылки /offer) */}
          <div style={{ marginTop: 8 }}>
            <TaskOfferForm playerId={player.id} />
          </div>

          {/* ✅ НАПИСАТЬ */}
          <div className="nav-links" style={{ marginTop: 8 }}>
            <Link href={`/messages/${player.id}`} className="neon-button-outline">
              💬 Написать
            </Link>
          </div>

          <Link href="/dashboard" className="neon-button-outline" style={{ textAlign: 'center' }}>
            ← Назад
          </Link>
        </div>
      </main>
    </>
  );
}