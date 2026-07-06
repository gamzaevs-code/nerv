import Link from 'next/link';
import Header from '@/components/Header';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function TournamentsPage() {
  const tournaments = await prisma.tournament.findMany({ include: { _count: { select: { participants: true } } }, orderBy: { startDate: 'desc' } });
  return <><Header simplified /><main className="page-shell"><section className="glass-card stack"><span className="badge">Соревнования</span><h1>Турниры</h1></section><section className="grid">{tournaments.map(t => <Link className="glass-card stack" href={`/tournaments/${t.id}`} key={t.id}><h2 className="neon-title">{t.name}</h2><p>{t.description}</p><p className="balance">{t.prizePool} ₽</p><p className="muted">{t.status} · участников: {t._count.participants}</p></Link>)}</section></main></>;
}
