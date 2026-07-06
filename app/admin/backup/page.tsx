import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { requireAdmin } from '@/lib/admin';

export default async function BackupPage() { const admin = await requireAdmin(); if (!admin) redirect('/dashboard'); return <><Header simplified /><main className="page-shell"><section className="glass-card stack"><h1>Backup</h1><a className="neon-button" href="/api/admin/backup">Скачать JSON backup</a><p>Ежедневные backup-и настраиваются cron-задачей сервера/Vercel Cron.</p></section></main></>; }
