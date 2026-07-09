import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import AdminTournamentForm from '@/components/AdminTournamentForm';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminTournamentsPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/dashboard');
  const tournaments = await prisma.tournament.findMany({ orderBy: { createdAt: 'desc' } });
  return <><Header simplified /><main className="page-shell"><section className="glass-card stack"><h1>Управление турнирами</h1><AdminTournamentForm /></section><section className="grid">{tournaments.map(t => <article className="glass-card" key={t.id}><b>{t.name}</b><p>{t.status} · {t.prizePool} ₽</p></article>)}</section></main></>;
}
