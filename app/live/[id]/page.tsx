import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import LiveStreamPlayer from '@/components/LiveStreamPlayer';
import LiveStreamControls from '@/components/LiveStreamControls';
import OnlineIndicator from '@/components/OnlineIndicator';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function LiveDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const [user, stream] = await Promise.all([
    getCurrentUser(),
    prisma.liveStream.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, level: true, reputation: true, presence: true } } },
    }),
  ]);
  if (!stream) notFound();
  const owner = user?.id === stream.userId || user?.role === 'admin';

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <section className="glass-card neon-border page-hero-card stack">
          <span className="badge">{stream.isActive ? '● LIVE' : 'Завершён'}</span>
          <h1 className="neon-text">{stream.title}</h1>
          <p>{stream.description || 'Прямой эфир игрока НЕРВ.'}</p>
          <p className="muted">Ведущий: {stream.user.name} · зрителей: {stream.viewers} <OnlineIndicator presence={stream.user.presence} /></p>
        </section>
        <section className="two-grid">
          <LiveStreamPlayer id={stream.id} title={stream.title} playbackUrl={stream.playbackUrl} />
          {owner ? <LiveStreamControls streamId={stream.id} streamKey={stream.streamKey} /> : <article className="glass-card"><p className="neon-text">Живой пульс системы</p><p>Подключение к production-видео выполняется через Mux/Cloudflare Stream.</p></article>}
        </section>
      </main>
    </>
  );
}
