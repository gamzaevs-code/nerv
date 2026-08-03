import Header from '@/components/Header';
import CreateTaskForm from '@/components/CreateTaskForm';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CreatePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // ✅ УБИРАЕМ ПРОВЕРКУ EMAIL В UI
  // const currentUser = await prisma.user.findUnique({
  //   where: { id: user.id },
  //   select: { emailVerified: true },
  // });
  // if (!currentUser?.emailVerified) {
  //   return (
  //     <>
  //       <Header />
  //       <main className="page-shell">
  //         <div className="glass-card stack" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
  //           <span className="badge">⚠️ Email не подтверждён</span>
  //           <h1>Подтвердите email</h1>
  //           <p className="muted">Чтобы создавать задания, необходимо подтвердить ваш email.</p>
  //           <Link href="/verify-email" className="neon-button">Подтвердить email</Link>
  //         </div>
  //       </main>
  //     </>
  //   );
  // }

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