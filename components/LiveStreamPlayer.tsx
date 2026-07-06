'use client';

import { useEffect } from 'react';

export default function LiveStreamPlayer({ id, playbackUrl, title }: { id: number; playbackUrl?: string | null; title: string }) {
  useEffect(() => {
    fetch('/api/live/viewers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, delta: 1 }) }).catch(() => null);
  }, [id]);

  if (playbackUrl) {
    return (
      <div className="glass-card neon-border stack">
        <div className="live-player-frame">
          <iframe src={playbackUrl} title={title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card neon-border stack live-placeholder">
      <div className="pulse" />
      <h2 className="neon-text">LIVE</h2>
      <p>Плеер готов к подключению WebRTC/HLS. Для production подключите Mux или Cloudflare Stream и передайте playback URL.</p>
    </div>
  );
}
