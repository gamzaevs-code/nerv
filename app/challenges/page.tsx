import Header from '@/components/Header';
import CompleteChallengeButton from '@/components/CompleteChallengeButton';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ChallengesPage() {
  const user = await getCurrentUser();
  const challenges = await prisma.challenge.findMany({ where: { status: 'active' }, include: { users: user ? { where: { userId: user.id } } : false }, orderBy: { createdAt: 'desc' } });
  return <><Header simplified /><main className="page-shell"><section className="glass-card stack"><span className="badge">Challenges</span><h1>Челленджи</h1><p>Daily можно выполнить 1 раз в день, weekly — 1 раз в неделю.</p></section><section className="grid">{challenges.map(c => <article className="glass-card stack" key={c.id}>{c.imageUrl && <img src={c.imageUrl} alt="" style={{ width: '100%', borderRadius: 14, maxHeight: 160, objectFit: 'cover' }} loading="lazy" />}<h2>{c.title}</h2><p>{c.description}</p><p className="muted">{c.category} · {c.difficulty}</p><div className="balance">+{c.reward} ₽</div>{user && <CompleteChallengeButton id={c.id} />}</article>)}</section></main></>;
}
