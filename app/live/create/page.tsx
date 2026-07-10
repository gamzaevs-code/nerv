'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import QRCode from 'qrcode';

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
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStreamData(null);
    setQrCode(null);

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

      const serverUrl = data.stream.rtmpsUrl.split('/app')[0];
      const streamKey = data.stream.streamKey;

      setStreamData({
        streamKey: streamKey,
        rtmpsUrl: data.stream.rtmpsUrl,
        id: data.stream.id,
        title: data.stream.title,
      });

      // Генерируем QR-код с данными для OBS
      const qrData = `obs://connect?server=${serverUrl}&key=${streamKey}`;
      const qr = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#8B5CF6',
          light: '#0A0A0F',
        },
      });
      setQrCode(qr);

      setLoading(false);
    } catch {
      setError('Ошибка сети');
      setLoading(false);
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

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
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <code
                  style={{
                    flex: 1,
                    background: '#0A0A0F',
                    padding: 10,
                    borderRadius: 6,
                    wordBreak: 'break-all',
                    fontSize: 14,
                  }}
                >
                  {streamData.rtmpsUrl.split('/app')[0]}
                </code>
                <button
                  onClick={() => copyToClipboard(streamData.rtmpsUrl.split('/app')[0], 'Сервер')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid rgba(139,92,246,0.3)',
                    background: 'rgba(139,92,246,0.1)',
                    color: '#8B5CF6',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  📋
                </button>
              </div>

              <p style={{ marginTop: 16, marginBottom: 8 }}>
                <strong>🔑 Ключ потока (streamKey):</strong>
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <code
                  style={{
                    flex: 1,
                    background: '#0A0A0F',
                    padding: 10,
                    borderRadius: 6,
                    wordBreak: 'break-all',
                    fontSize: 14,
                  }}
                >
                  {streamData.streamKey}
                </code>
                <button
                  onClick={() => copyToClipboard(streamData.streamKey, 'streamKey')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid rgba(139,92,246,0.3)',
                    background: 'rgba(139,92,246,0.1)',
                    color: '#8B5CF6',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  📋
                </button>
              </div>

              {copied && (
                <p style={{ color: '#34D399', fontSize: 13, marginTop: 8 }}>
                  ✅ Скопировано!
                </p>
              )}

              {/* QR-код для настройки OBS с телефона */}
              {qrCode && (
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <p className="muted" style={{ fontSize: 13 }}>
                    📱 Отсканируй QR-код, чтобы быстро настроить OBS:
                  </p>
                  <img
                    src={qrCode}
                    alt="QR-код для настройки OBS"
                    style={{
                      width: 200,
                      height: 200,
                      marginTop: 8,
                      borderRadius: 8,
                    }}
                  />
                </div>
              )}
            </div>

            <p className="muted" style={{ fontSize: 14 }}>
              Вставь эти данные в OBS → Настройки → Трансляция
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
                onClick={() => {
                  setStreamData(null);
                  setQrCode(null);
                }}
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
