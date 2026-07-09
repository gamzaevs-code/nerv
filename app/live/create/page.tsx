'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LiveCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [streamData, setStreamData] = useState<{
    streamKey: string;
    rtmpsUrl: string;
    id: number;
    title: string;
  } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStreamData(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    try {
      const res = await fetch('/api/live/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Не удалось создать стрим');
        setLoading(false);
        return;
      }

      setStreamData({
        streamKey: data.stream.streamKey,
        rtmpsUrl: data.stream.rtmpsUrl,
        id: data.stream.id,
        title: data.stream.title,
      });
      setLoading(false);
    } catch {
      setError('Ошибка сети');
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="glass-card stack" style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1>🎥 Создать прямой эфир</h1>

        {!streamData ? (
          <form onSubmit={onSubmit} className="stack">
            <label>
              Название
              <input name="title" type="text" required className="neon-input" />
            </label>
            <label>
              Описание
              <textarea name="description" className="neon-input" rows={3} />
            </label>
            {error && <div className="error">{error}</div>}
            <button type="submit" className="neon-button" disabled={loading}>
              {loading ? 'Создаём...' : '🚀 Начать стрим'}
            </button>
          </form>
        ) : (
          <div className="stack" style={{ textAlign: 'center' }}>
            <h2>✅ Стрим создан!</h2>
            <p className="muted">{streamData.title}</p>

            <div style={{ background: 'rgba(0,0,0,0.4)', padding: 20, borderRadius: 12, textAlign: 'left' }}>
              <p><strong>📡 Сервер (RTMPS):</strong></p>
              <code style={{ display: 'block', background: '#0A0A0F', padding: 10, borderRadius: 6, wordBreak: 'break-all' }}>
                {streamData.rtmpsUrl.split('/app')[0]}
              </code>

              <p style={{ marginTop: 12 }}><strong>🔑 Ключ потока (streamKey):</strong></p>
              <code style={{ display: 'block', background: '#0A0A0F', padding: 10, borderRadius: 6, wordBreak: 'break-all' }}>
                {streamData.streamKey}
              </code>
            </div>

            <button className="neon-button" onClick={() => router.push(`/live/${streamData.id}`)}>
              👀 Смотреть стрим
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
