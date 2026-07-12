import Header from '@/components/Header';
import CreateTaskForm from '@/components/CreateTaskForm';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CreatePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <>
      <Header />
      <main className="page-shell">
        <div className="glass-card stack" style={{ maxWidth: 600, margin: '0 auto' }}>
          <span className="badge">Создать задание</span>
          <h1>Опишите испытание</h1>
          <p className="muted">Задайте награду и отправьте его в общий список для игроков.</p>
          <CreateTaskForm role={user.role} />
        </div>
      </main>
    </>
  );
}