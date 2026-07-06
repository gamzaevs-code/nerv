import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function Tree({ userId, depth }: { userId: number; depth: number }) {
  if (depth <= 0) return null;
  const users = await prisma.user.findMany({ where: { referredBy: userId }, select: { id: true, name: true, balance: true } });
  return <div className="stack" style={{ marginLeft: 20 }}>{users.map(u => <div className="glass-card" key={u.id}><b>{u.name}</b> · {u.balance} ₽<Tree userId={u.id} depth={depth - 1} /></div>)}</div>;
}

export default async function ReferralTreePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return <><Header simplified /><main className="page-shell"><section className="glass-card stack"><span className="badge">MLM</span><h1>Древо рефералов</h1><Tree userId={user.id} depth={3} /></section></main></>;
}
