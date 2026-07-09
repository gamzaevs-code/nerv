import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import PushSettings from '@/components/PushSettings';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function NotificationSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return <><Header simplified /><main className="page-shell"><section className="glass-card stack"><span className="badge">Push</span><h1>Настройки уведомлений</h1><p>Включите Web Push и выберите типы уведомлений. Предпочтения сохраняются локально.</p><PushSettings /></section></main></>;
}
