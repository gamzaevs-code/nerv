'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const MuxPlayer = dynamic(
  () => import('@mux/mux-player-react'),
  { ssr: false }
);

interface MuxPlayerWrapperProps {
  playbackId: string;
  title?: string;
  poster?: string;
  width?: string | number;
  height?: string | number;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export default function MuxPlayerWrapper({
  playbackId,
  title,
  poster,
  width = '100%',
  height = 'auto',
  autoPlay = false,
  loop = false,
  muted = false,
}: MuxPlayerWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !playbackId) {
    return (
      <div
        style={{
          width,
          height: 300,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p className="muted">Загрузка плеера...</p>
      </div>
    );
  }

  return (
    <MuxPlayer
      playbackId={playbackId}
      metadata={{
        video_title: title || 'НЕРВ — видео',
        viewer_user_id: 'anonymous',
      }}
      envKey={process.env.NEXT_PUBLIC_MUX_ENV_KEY}
      streamType="on-demand"
      style={{
        width,
        height: height === 'auto' ? undefined : height,
        aspectRatio: '16/9',
        borderRadius: 12,
        backgroundColor: '#0A0A0F',
      }}
      poster={poster}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      primaryColor="#00E5FF"
      accentColor="#6D28D9"
    />
  );
}