import { notFound, redirect } from 'next/navigation';
import Header from '@/components/Header';
import MuxPlayerWrapper from '@/components/MuxPlayer';
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

  // Для демонстрации используем заглушку
  // В реальном проекте нужно получить playbackId из Mux Live Stream
  const playbackId = stream.streamKey || '';

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

          {playbackId ? (
            <MuxPlayerWrapper
              playbackId={playbackId}
              title={stream.title}
              autoPlay
              muted={false}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: 400,
                background: 'linear-gradient(135deg, #0A0A0F, #1A1A2E)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                border: '1px solid rgba(139,92,246,0.2)',
              }}
            >
              <p style={{ fontSize: 48 }}>🎥</p>
              <p className="muted">Прямой эфир (заглушка)</p>
              <p className="muted" style={{ fontSize: 12 }}>
                ID стрима: {stream.id}
              </p>
            </div>
          )}

          {stream.description && <p>{stream.description}</p>}
        </div>
      </main>
    </>
  );
}
