import Link from 'next/link';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import NotificationActions from '@/components/NotificationActions';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <section className="glass-card stack">
          <span className="badge">Уведомления</span>
          <h1>Колокольчик</h1>
          <p>Все игровые события, сообщения и результаты голосований.</p>
        </section>

        <section className="glass-card stack" style={{ marginTop: 18 }}>
          {notifications.length === 0 && <p>Уведомлений пока нет.</p>}
          {notifications.map((notification) => (
            <article className="glass-card stack" key={notification.id} style={{ borderColor: notification.isRead ? 'rgba(0,229,255,.18)' : 'rgba(0,229,255,.65)' }}>
              <div className="nav-links" style={{ justifyContent: 'space-between' }}>
                <strong>{notification.type}</strong>
                {!notification.isRead && <span className="badge">new</span>}
              </div>
              <p>{notification.message}</p>
              <p className="muted">{notification.createdAt.toLocaleString('ru-RU')}</p>
              <div className="nav-links">
                {notification.link && <Link className="neon-button" href={notification.link}>Открыть</Link>}
                <NotificationActions id={notification.id} />
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
