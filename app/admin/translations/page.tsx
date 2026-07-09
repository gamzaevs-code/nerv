import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import AdminTranslationForm from '@/components/AdminTranslationForm';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminTranslationsPage() { const admin = await requireAdmin(); if (!admin) redirect('/dashboard'); const items = await prisma.translation.findMany({ orderBy: [{ locale: 'asc' }, { key: 'asc' }] }); return <><Header simplified /><main className="page-shell"><section className="glass-card stack"><h1>Переводы</h1><AdminTranslationForm />{items.map(i => <p key={i.id}>{i.locale}.{i.key}: {i.value}</p>)}</section></main></>; }
