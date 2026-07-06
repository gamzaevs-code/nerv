import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ActivityLogsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/dashboard');
  const logs = await prisma.activityLog.findMany({ include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
  return (
    <><Header simplified /><main className="page-shell"><section className="glass-card stack"><span className="badge">Admin</span><h1 className="neon-text">Activity Log</h1>{logs.map((log) => <article className="glass-card" key={log.id}><b>{log.action}</b><p>{log.user.name} · {log.user.email}</p><p className="muted">{log.createdAt.toLocaleString('ru-RU')} · {log.ip || 'no ip'}</p><code className="code-block">{JSON.stringify(log.details, null, 2)}</code></article>)}</section></main></>
  );
}
