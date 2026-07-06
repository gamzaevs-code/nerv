import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminSupportPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/dashboard');
  const users = await prisma.user.findMany({ where: { supportMessages: { some: {} } }, select: { id: true, name: true, email: true, supportMessages: { orderBy: { createdAt: 'desc' }, take: 5 } } });
  return <><Header simplified /><main className="page-shell"><section className="glass-card stack"><span className="badge">Support</span><h1>Чат поддержки</h1>{users.map(u => <article className="glass-card stack" key={u.id}><b>{u.name}</b>{u.supportMessages.map(m => <p key={m.id}>{m.isFromAdmin ? 'Admin' : u.name}: {m.message}</p>)}<form className="form" action="/api/support/messages" method="post"><p className="muted">Ответы отправляйте через API POST /api/support/messages с userId={u.id}</p></form></article>)}</section></main></>;
}
