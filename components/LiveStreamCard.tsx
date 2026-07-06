import Link from 'next/link';

export type LiveStreamCardData = {
  id: number;
  title: string;
  description?: string | null;
  viewers: number;
  startedAt: Date;
  user: { id: number; name: string; avatar?: string | null; reputation?: number };
};

export default function LiveStreamCard({ stream }: { stream: LiveStreamCardData }) {
  return (
    <Link className="glass-card neon-border stack live-card" href={`/live/${stream.id}`}>
      <span className="badge">● LIVE</span>
      <h2 className="neon-text">{stream.title}</h2>
      <p>{stream.description || 'Прямой эфир игрока НЕРВ.'}</p>
      <p className="muted">Ведущий: {stream.user.name} · зрителей: {stream.viewers}</p>
      <span className="feature-cta">Смотреть →</span>
    </Link>
  );
}
