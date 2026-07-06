import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import JoinTournamentButton from '@/components/JoinTournamentButton';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function TournamentPage({ params }: { params: { id: string } }) {
  const tournament = await prisma.tournament.findUnique({ where: { id: Number(params.id) }, include: { participants: { include: { user: { select: { name: true } } }, orderBy: { score: 'desc' } } } });
  if (!tournament) notFound();
  return <><Header simplified /><main className="page-shell"><section className="glass-card stack"><span className="badge">{tournament.status}</span><h1>{tournament.name}</h1><p>{tournament.description || 'Правила турнира появятся позже.'}</p><div className="balance">Призовой фонд: {tournament.prizePool} ₽</div><JoinTournamentButton id={tournament.id} /></section><section className="glass-card stack" style={{ marginTop: 18 }}><h2 className="neon-title">Таблица лидеров</h2>{tournament.participants.map((p, i) => <p key={p.id}>#{i + 1} {p.user.name} · {p.score} очков</p>)}</section></main></>;
}
