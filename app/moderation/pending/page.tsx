import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function ModerationPendingPage() { const user = await getCurrentUser(); if (!user || (!user.isModerator && user.role !== 'admin')) redirect('/dashboard'); const items = await prisma.challengeSubmission.findMany({ where: { status: 'pending' }, include: { user: { select: { name: true } }, challenge: true } }); return <><Header simplified /><main className="page-shell"><section className="glass-card stack"><h1>Модерация</h1>{items.map(i => <article className="glass-card" key={i.id}><b>{i.challenge.title}</b><p>{i.user.name}</p><p>{i.videoUrl}</p></article>)}</section></main></>; }
