'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface OnlinePlayer {
  id: number;
  name: string;
  role: string;
  lastSeen: string;
}

export default function OnlinePlayers() {
  const [players, setPlayers] = useState<OnlinePlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOnlinePlayers();
    const interval = setInterval(fetchOnlinePlayers, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchOnlinePlayers() {
    try {
      const res = await fetch('/api/presence/online-players');
      if (res.ok) {
        const data = await res.json();
        setPlayers(data.players || []);
      }
    } catch (error) {
      console.error('Failed to fetch online players:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="glass-card stack" style={{ padding: 16 }}>
        <p className="muted">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="glass-card stack" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 18, margin: 0 }}>🟢 Кто в сети</h3>
        <span className="badge" style={{ fontSize: 12 }}>
          {players.length} {players.length === 1 ? 'игрок' : 'игроков'}
        </span>
      </div>

      {players.length === 0 ? (
        <p className="muted" style={{ textAlign: 'center', padding: 12 }}>
          Сейчас никого нет в сети
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {players.map((player) => (
            <Link
              key={player.id}
              href={`/player/${player.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.03)',
                textDecoration: 'none',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#22C55E',
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontWeight: 600 }}>{player.name}</span>
              <span className="muted" style={{ fontSize: 12, marginLeft: 'auto' }}>
                {player.role === 'player' ? '🎮' : '👀'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}