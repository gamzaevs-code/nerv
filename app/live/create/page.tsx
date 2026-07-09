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
              <input
                name="title"
                type="text"
                placeholder="Мой супер-стрим"
                required
                className="neon-input"
              />
            </label>
            <label>
              Описание
              <textarea
                name="description"
                placeholder="Расскажи, о чём стрим"
                className="neon-input"
                rows={3}
              />
            </label>

            {error && <div className="error">{error}</div>}

            <button
              type="submit"
              className="neon-button"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Создаём...' : '🚀 Начать стрим'}
            </button>
          </form>
        ) : (
          <div className="stack" style={{ textAlign: 'center' }}>
            <h2>✅ Стрим создан!</h2>
            <p className="muted">{streamData.title}</p>

            <div
              style={{
                background: 'rgba(0,0,0,0.4)',
                padding: 20,
                borderRadius: 12,
                textAlign: 'left',
              }}
            >
              <p style={{ marginBottom: 8 }}>
                <strong>📡 Сервер (RTMPS):</strong>
              </p>
              <code
                style={{
                  display: 'block',
                  background: '#0A0A0F',
                  padding: 10,
                  borderRadius: 6,
                  wordBreak: 'break-all',
                  fontSize: 14,
                  marginBottom: 16,
                }}
              >
                {streamData.rtmpsUrl.split('/app')[0]}
              </code>

              <p style={{ marginBottom: 8 }}>
                <strong>🔑 Ключ потока (streamKey):</strong>
              </p>
              <code
                style={{
                  display: 'block',
                  background: '#0A0A0F',
                  padding: 10,
                  borderRadius: 6,
                  wordBreak: 'break-all',
                  fontSize: 14,
                  marginBottom: 16,
                }}
              >
                {streamData.streamKey}
              </code>
            </div>

            <p className="muted" style={{ fontSize: 14 }}>
              Вставь эти данные в OBS → Настройки → Стрим
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                className="neon-button"
                onClick={() => router.push(`/live/${streamData.id}`)}
              >
                👀 Смотреть стрим
              </button>
              <button
                className="neon-button-outline"
                onClick={() => setStreamData(null)}
              >
                🔁 Создать ещё
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
