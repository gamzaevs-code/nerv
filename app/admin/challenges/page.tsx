import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { AdminChallengeForm, DeleteChallengeButton } from '@/components/AdminChallengeActions';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export default async function AdminChallengesPage() {
  const admin = await requireAdmin(); if (!admin) redirect('/dashboard');
  const challenges = await prisma.challenge.findMany({ orderBy: { createdAt: 'desc' } });
  return <><Header simplified /><main className="page-shell"><section className="glass-card stack"><h1>CRUD челленджей</h1><AdminChallengeForm /></section><section className="grid">{challenges.map(c => <article className="glass-card stack" key={c.id}><b>{c.title}</b><p>{c.category} · {c.difficulty} · {c.reward} ₽</p><DeleteChallengeButton id={c.id} /></article>)}</section></main></>;
}
