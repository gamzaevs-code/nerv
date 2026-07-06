'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LiveStreamControls({ streamId, streamKey }: { streamId: number; streamKey: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const ingestUrl = `rtmp://live.nerv.local/app/${streamKey}`;

  async function endStream() {
    setLoading(true);
    await fetch('/api/live/end', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: streamId }) });
    router.push('/live');
    router.refresh();
  }

  return (
    <div className="glass-card stack">
      <h2 className="neon-text">Управление эфиром</h2>
      <p className="muted">Stream key</p>
      <code className="code-block">{streamKey}</code>
      <p className="muted">RTMP ingest placeholder</p>
      <code className="code-block">{ingestUrl}</code>
      <button className="neon-button" type="button" onClick={endStream} disabled={loading}>{loading ? 'Завершаем...' : 'Завершить эфир'}</button>
    </div>
  );
}
