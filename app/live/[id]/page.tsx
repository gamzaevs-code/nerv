import { notFound, redirect } from 'next/navigation';
import Header from '@/components/Header';
import LiveStreamPlayer from '@/components/LiveStreamPlayer';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function LiveStreamPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const stream = await prisma.liveStream.findUnique({
    where: { id: Number(params.id) },
    include: { user: { select: { name: true } } },
  });

  if (!stream) notFound();

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <div className="glass-card stack">
          <span className="badge">🔴 LIVE</span>
          <h1>{stream.title}</h1>
          <p className="muted">
            Ведущий: {stream.user.name} · Зрителей: {stream.viewers || 0}
          </p>

          <LiveStreamPlayer
            id={stream.id}
            playbackUrl={stream.playbackUrl}
            title={stream.title}
          />

          {stream.description && <p>{stream.description}</p>}
        </div>
      </main>
    </>
  );
}
