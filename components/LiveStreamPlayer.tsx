'use client';

import { useEffect, useRef } from 'react';
import MuxPlayer from '@mux/mux-player-react';

export default function LiveStreamPlayer({
  playbackId,
  title,
}: {
  playbackId?: string | null;
  title: string;
}) {
  const playerRef = useRef<any>(null);

  // Если playbackId не указан, показываем заглушку
  if (!playbackId) {
    return (
      <div className="glass-card neon-border stack live-placeholder">
        <div className="pulse" />
        <h2 className="neon-text">LIVE</h2>
        <p>Трансляция ещё не началась. Подождите, пока стример подключится через OBS.</p>
      </div>
    );
  }

  return (
    <div className="glass-card neon-border stack">
      <div className="live-player-frame">
        <MuxPlayer
          ref={playerRef}
          playbackId={playbackId}
          streamType="live"
          metadata={{
            video_title: title,
          }}
          accentColor="#8B5CF6"
          style={{ width: '100%', height: '100%', aspectRatio: '16/9' }}
          autoPlay
        />
      </div>
    </div>
  );
}
