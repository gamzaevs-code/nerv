import Link from 'next/link';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const messages = await prisma.message.findMany({
    where: { OR: [{ fromUserId: user.id }, { toUserId: user.id }] },
    include: {
      fromUser: { select: { id: true, name: true, avatar: true } },
      toUser: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const dialogs = new Map<number, { user: { id: number; name: string; avatar: string | null }; lastMessage: string; unreadCount: number }>();
  for (const message of messages) {
    const partner = message.fromUserId === user.id ? message.toUser : message.fromUser;
    const dialog = dialogs.get(partner.id);
    if (!dialog) {
      dialogs.set(partner.id, {
        user: partner,
        lastMessage: message.text,
        unreadCount: message.toUserId === user.id && !message.isRead ? 1 : 0,
      });
    } else if (message.toUserId === user.id && !message.isRead) {
      dialog.unreadCount += 1;
    }
  }

  const users = await prisma.user.findMany({
    where: { id: { not: user.id }, isBanned: false },
    select: { id: true, name: true, role: true, avatar: true },
    orderBy: { name: 'asc' },
    take: 30,
  });

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <section className="glass-card stack">
          <span className="badge">Личные сообщения</span>
          <h1>Диалоги</h1>
          <p>Общайтесь с игроками и зрителями напрямую.</p>
        </section>

        <section className="two-grid">
          <article className="glass-card stack">
            <h2 className="neon-title">Активные диалоги</h2>
            {dialogs.size === 0 && <p>Диалогов пока нет.</p>}
            {Array.from(dialogs.values()).map((dialog) => (
              <Link className="glass-card" href={`/messages/${dialog.user.id}`} key={dialog.user.id}>
                <strong>{dialog.user.name}</strong>
                {dialog.unreadCount > 0 && <span className="badge" style={{ marginLeft: 8 }}>{dialog.unreadCount}</span>}
                <p className="muted">{dialog.lastMessage}</p>
              </Link>
            ))}
          </article>
          <article className="glass-card stack">
            <h2 className="neon-title">Начать переписку</h2>
            {users.length === 0 && <p>Других пользователей пока нет.</p>}
            {users.map((target) => (
              <Link className="neon-button-outline" href={`/messages/${target.id}`} key={target.id}>
                {target.name} · {target.role}
              </Link>
            ))}
          </article>
        </section>
      </main>
    </>
  );
}
