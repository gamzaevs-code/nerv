import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { BanButton, BalanceForm } from '@/components/AdminActions';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/dashboard');

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, balance: true, isBanned: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <section className="glass-card stack">
          <span className="badge">Admin / Users</span>
          <h1>Пользователи</h1>
          <p className="muted">Всего: {users.length}</p>
        </section>

        <div className="admin-table">
          {users.map((user) => (
            <div className={`glass-card stack ${user.isBanned ? 'banned' : ''}`} key={user.id}>
              <div className="admin-row">
                <div>
                  <strong>{user.name}</strong>
                  <p className="muted">{user.email}</p>
                  <p className="muted">
                    role: {user.role} · balance: {user.balance} ₽ · 
                    {user.isBanned ? <span className="error"> blocked</span> : ' active'} · 
                    {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <div className="nav-links">
                  <BanButton userId={user.id} isBanned={user.isBanned} />
                  <BalanceForm userId={user.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
