import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import ExportButton from '@/components/ExportButton';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function ExportPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return <><Header simplified /><main className="page-shell"><section className="glass-card stack"><span className="badge">GDPR</span><h1>Экспорт данных</h1><p>Скачайте ZIP-архив со всеми данными профиля, заданиями, транзакциями, голосами и сообщениями.</p><ExportButton /></section></main></>;
}
