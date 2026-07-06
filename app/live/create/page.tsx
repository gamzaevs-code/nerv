import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import LiveCreateForm from '@/components/LiveCreateForm';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function CreateLivePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'player' && user.role !== 'admin') redirect('/dashboard');

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <section className="glass-card neon-border stack">
          <span className="badge">Go Live</span>
          <h1 className="neon-text">Запустить эфир</h1>
          <p>Создайте live-комнату. Для production подключите Mux или Cloudflare Stream и вставьте playback URL.</p>
          <LiveCreateForm />
        </section>
      </main>
    </>
  );
}
