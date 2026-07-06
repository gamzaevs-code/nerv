import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import AdminReportActions from '@/components/AdminReportActions';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/dashboard');
  const reports = await prisma.report.findMany({ include: { reporter: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' } });
  return <><Header simplified /><main className="page-shell"><section className="glass-card stack"><span className="badge">Moderation</span><h1>Жалобы</h1>{reports.map(r => <article className="glass-card stack" key={r.id}><b>{r.targetType} #{r.targetId}</b><p>{r.reason}</p><p className="muted">{r.status} · от {r.reporter.name}</p>{r.status === 'pending' && <AdminReportActions id={r.id} />}</article>)}</section></main></>;
}
