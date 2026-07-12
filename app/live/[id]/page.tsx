import { notFound, redirect } from 'next/navigation';
import Header from '@/components/Header';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function LiveStreamPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();

  const stream = await prisma.liveStream.findUnique({
    where: { id: Number(params.id) },
    include: { user: { select: { name: true } } },
  });

  if (!stream) notFound();

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <div className="glass-card stack" style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                background: '#EF4444',
                color: 'white',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              🔴 LIVE
            </span>
            <h1 style={{ margin: 0 }}>{stream.title}</h1>
          </div>

          <p className="muted">
            Ведущий: {stream.user.name} · 👁️ Зрителей: {stream.viewers || 0}
          </p>

          {/* ✅ ЗАГЛУШКА ДЛЯ СТРИМА */}
          <div
            style={{
              width: '100%',
              aspectRatio: '16/9',
              background: 'linear-gradient(135deg, #0A0A0F, #1a1a2e)',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(139,92,246,0.2)',
              padding: 24,
            }}
          >
            <span style={{ fontSize: 64, marginBottom: 16 }}>📡</span>
            <h2 style={{ color: '#8B5CF6' }}>Скоро здесь будет стрим!</h2>
            <p className="muted" style={{ textAlign: 'center', maxWidth: 400 }}>
              Прямой эфир будет доступен позже. Следите за обновлениями!
            </p>
          </div>

          {stream.description && <p style={{ marginTop: 8 }}>{stream.description}</p>}

          {user && user.id === stream.userId && (
            <button
              className="neon-button-outline"
              style={{ marginTop: 8 }}
              onClick={async () => {
                if (confirm('Завершить стрим?')) {
                  await fetch(`/api/live/end`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: stream.id }),
                  });
                  window.location.href = '/live';
                }
              }}
            >
              ⏹️ Завершить стрим
            </button>
          )}
        </div>
      </main>
    </>
  );
}