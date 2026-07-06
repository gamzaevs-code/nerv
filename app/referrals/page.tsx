import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { getCurrentUser } from '@/lib/auth';
import { ensureReferralCode } from '@/lib/referrals';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ReferralsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const code = await ensureReferralCode(user.id, user.email);
  const [friends, earnings] = await Promise.all([
    prisma.user.findMany({ where: { referredBy: user.id }, select: { name: true, createdAt: true } }),
    prisma.referralEarning.findMany({ where: { userId: user.id }, include: { fromUser: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }),
  ]);
  const total = earnings.reduce((sum, e) => sum + e.amount, 0);
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return (
    <><Header simplified /><main className="page-shell">
      <section className="glass-card stack"><span className="badge">Рефералы</span><h1>Приглашай друзей</h1><p>Код: <b className="neon-title">{code}</b></p><p>Ссылка: {origin}/signup?ref={code}</p></section>
      <section className="grid"><article className="glass-card"><p>Друзей</p><div className="metric">{friends.length}</div></article><article className="glass-card"><p>Заработано</p><div className="balance">{total} ₽</div></article></section>
      <section className="glass-card stack" style={{ marginTop: 18 }}><h2 className="neon-title">Начисления</h2>{earnings.map(e => <p key={e.id}>{e.amount} ₽ · уровень {e.level} · от {e.fromUser.name}</p>)}</section>
    </main></>
  );
}
