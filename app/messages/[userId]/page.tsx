import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import Header from '@/components/Header';
import MessageComposer from '@/components/MessageComposer';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ConversationPage({ params }: { params: { userId: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const partnerId = Number(params.userId);
  if (!Number.isInteger(partnerId) || partnerId === user.id) notFound();

  const partner = await prisma.user.findUnique({
    where: { id: partnerId },
    select: { id: true, name: true, role: true, avatar: true, bio: true },
  });
  if (!partner) notFound();

  await prisma.message.updateMany({
    where: { fromUserId: partnerId, toUserId: user.id, isRead: false },
    data: { isRead: true },
  });

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { fromUserId: user.id, toUserId: partnerId },
        { fromUserId: partnerId, toUserId: user.id },
      ],
    },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <section className="glass-card stack">
          <Link href="/messages" className="neon-button-outline" style={{ width: 'fit-content' }}>← Диалоги</Link>
          <h1>{partner.name}</h1>
          <p>{partner.role}{partner.bio ? ` · ${partner.bio}` : ''}</p>
        </section>

        <section className="glass-card stack" style={{ marginTop: 18 }}>
          {messages.length === 0 && <p>Сообщений пока нет. Начните диалог.</p>}
          {messages.map((message) => {
            const mine = message.fromUserId === user.id;
            return (
              <div key={message.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                <div className="glass-card" style={{ maxWidth: '72%', borderColor: mine ? 'rgba(0,229,255,.55)' : 'rgba(255,255,255,.12)' }}>
                  <p style={{ color: '#fff' }}>{message.text}</p>
                  <p className="muted" style={{ fontSize: 12 }}>{message.createdAt.toLocaleString('ru-RU')}</p>
                </div>
              </div>
            );
          })}
          <MessageComposer toUserId={partner.id} />
        </section>
      </main>
    </>
  );
}
