import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import OnlineIndicator from './OnlineIndicator';

export default async function OnlineList() {
  let players: { id: number; name: string; level: number; reputation: number; presence: { isOnline: boolean; lastSeen: Date } | null }[] = [];
  try {
    players = await prisma.user.findMany({
      where: { role: 'player', presence: { isOnline: true, lastSeen: { gte: new Date(Date.now() - 2 * 60 * 1000) } } },
      select: { id: true, name: true, level: true, reputation: true, presence: true },
      orderBy: { reputation: 'desc' },
      take: 20,
    });
  } catch (error) {
    console.warn('OnlineList fallback:', error);
  }

  return (
    <aside className="glass-card stack">
      <h2 className="neon-text">Игроки онлайн</h2>
      {players.length === 0 ? <p className="muted">Сейчас никто не онлайн.</p> : players.map((player) => (
        <Link className="leaderboard-row" href={`/player/${player.id}`} key={player.id}>
          <span>{player.name}</span>
          <OnlineIndicator presence={player.presence} />
        </Link>
      ))}
    </aside>
  );
}
