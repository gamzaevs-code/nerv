import Header from '@/components/Header';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function LivePage() {
  const user = await getCurrentUser();

  const streams = await prisma.liveStream.findMany({
    where: { isActive: true },
    include: { user: { select: { name: true } } },
    orderBy: { startedAt: 'desc' },
  });

  return (
    <>
      <Header simplified={!user} />
      <main className="page-shell">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1>🎥 Прямые эфиры</h1>
          {user && (
            <Link href="/live/create" className="neon-button">
              ➕ Создать стрим
            </Link>
          )}
        </div>

        {streams.length === 0 ? (
          <div className="glass-card stack" style={{ textAlign: 'center', padding: 48 }}>
            <p style={{ fontSize: 48 }}>📡</p>
            <h2>Стримов пока нет</h2>
            <p className="muted">
              {user ? 'Стань первым — создай свой стрим!' : 'Войдите, чтобы создавать стримы.'}
            </p>
            {user && (
              <Link href="/live/create" className="neon-button" style={{ marginTop: 16 }}>
                🚀 Создать стрим
              </Link>
            )}
          </div>
        ) : (
          <div className="streams-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {streams.map((stream) => (
              <Link
                key={stream.id}
                href={`/live/${stream.id}`}
                className="glass-card"
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: '100%',
                      height: 180,
                      background: 'linear-gradient(135deg, #1a1a2e, #0A0A0F)',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(139,92,246,0.2)',
                    }}
                  >
                    <span style={{ fontSize: 48 }}>🔴</span>
                  </div>
                  <span
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      background: '#EF4444',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    LIVE
                  </span>
                </div>
                <h3 style={{ marginTop: 12 }}>{stream.title}</h3>
                <p className="muted" style={{ fontSize: 14 }}>
                  {stream.user.name} · 👁️ {stream.viewers || 0}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}