import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import AdminInviteForm from '@/components/AdminInviteForm';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export default async function AdminInvitesPage() {
  const admin = await requireAdmin(); if (!admin) redirect('/dashboard');
  const invites = await prisma.inviteCode.findMany({ orderBy: { createdAt: 'desc' } });
  return <><Header simplified /><main className="page-shell"><section className="glass-card stack"><h1>Инвайт-коды</h1><AdminInviteForm />{invites.map(i => <p key={i.id}><b>{i.code}</b> · {i.usedCount}/{i.maxUses} · до {i.expiresAt?.toLocaleString('ru-RU') || '∞'}</p>)}</section></main></>;
}
