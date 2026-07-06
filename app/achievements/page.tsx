import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { getCurrentUser } from '@/lib/auth';
import { ensureAchievements, progressForAchievement, xpForNextLevel } from '@/lib/gamification';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export default async function AchievementsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  await ensureAchievements();

  const [fullUser, achievements] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, include: { achievements: { include: { achievement: true } } } }),
    prisma.achievement.findMany({ orderBy: { id: 'asc' } }),
  ]);
  const unlocked = new Set(fullUser?.achievements.map((ua) => ua.achievementId) || []);
  const nextXp = xpForNextLevel(fullUser?.level || 1);

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <section className="glass-card stack">
          <span className="badge">Уровни</span>
          <h1>Достижения</h1>
          <p>Уровень {fullUser?.level || 1} · опыт {fullUser?.experience || 0}/{nextXp}</p>
          <div style={{ height: 10, border: '1px solid #00E5FF', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, ((fullUser?.experience || 0) / nextXp) * 100)}%`, height: '100%', background: '#00E5FF' }} />
          </div>
        </section>
        <section className="grid">
          {await Promise.all(achievements.map(async (achievement) => {
            const progress = await progressForAchievement(user.id, achievement.conditionType);
            const done = unlocked.has(achievement.id);
            return (
              <article className="glass-card stack" key={achievement.id} style={{ opacity: done ? 1 : 0.75 }}>
                <div style={{ fontSize: 42 }}>{achievement.icon}</div>
                <h2 className="neon-title">{achievement.name}</h2>
                <p>{achievement.description}</p>
                <p className="muted">Прогресс: {Math.min(progress.current, progress.target)} / {progress.target}</p>
                <p className="balance">+{achievement.reward} ₽</p>
                {done && <span className="badge">Открыто</span>}
              </article>
            );
          }))}
        </section>
      </main>
    </>
  );
}
