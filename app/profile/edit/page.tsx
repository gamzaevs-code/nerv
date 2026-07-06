import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import ProfileEditForm from '@/components/ProfileEditForm';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ProfileEditPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, bio: true, location: true, avatar: true },
  });
  if (!profile) redirect('/login');

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <section className="glass-card stack">
          <span className="badge">Профиль</span>
          <h1>Редактирование</h1>
          {profile.avatar && <img src={profile.avatar} alt="avatar" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '1px solid #00E5FF' }} />}
          <ProfileEditForm profile={profile} />
        </section>
      </main>
    </>
  );
}
