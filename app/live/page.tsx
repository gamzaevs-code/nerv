import Link from 'next/link';
import Header from '@/components/Header';
import LiveStreamCard from '@/components/LiveStreamCard';
import OnlineList from '@/components/OnlineList';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Stream = {
  id: number;
  title: string;
  description: string | null;
  viewers: number;
  startedAt: Date;
  user: { id: number; name: string; avatar: string | null; reputation: number };
};

export default async function LivePage() {
  let streams: Stream[] = [];
  let dbUnavailable = false;
  try {
    streams = await prisma.liveStream.findMany({
      where: { isActive: true },
      include: { user: { select: { id: true, name: true, avatar: true, reputation: true } } },
      orderBy: { startedAt: 'desc' },
    });
  } catch (error) {
    dbUnavailable = true;
    console.warn('LivePage DB fallback:', error);
  }

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <section className="glass-card neon-border page-hero-card stack">
          <span className="badge">Live / Stream</span>
          <h1 className="neon-text">Прямой эфир</h1>
          <p>Смотрите активные трансляции игроков и подключайтесь к живому пульсу НЕРВ.</p>
          <div className="nav-links"><Link className="neon-button" href="/live/create">Запустить эфир</Link></div>
          {dbUnavailable && <p className="muted">Локальная база PostgreSQL не подключена. На Vercel подключите Neon DATABASE_URL.</p>}
        </section>
        <section className="two-grid">
          <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
            {streams.length ? streams.map((stream) => <LiveStreamCard key={stream.id} stream={stream} />) : <article className="glass-card"><p>Сейчас нет активных эфиров.</p></article>}
          </div>
          <OnlineList />
        </section>
      </main>
    </>
  );
}
