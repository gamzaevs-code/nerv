import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import DailyBonusButton from '@/components/DailyBonusButton';
import { getCurrentUser } from '@/lib/auth';
import { ensureDailyQuests } from '@/lib/daily';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function DailyQuestsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  await ensureDailyQuests();
  const quests = await prisma.dailyQuest.findMany({ include: { users: { where: { userId: user.id } } } });
  const full = await prisma.user.findUnique({ where: { id: user.id }, select: { loginStreak: true } });
  return <><Header simplified /><main className="page-shell"><section className="glass-card stack"><span className="badge">Daily</span><h1>Ежедневные задания</h1><p>Серия входов: {full?.loginStreak || 0}/30 дней</p><DailyBonusButton /></section><section className="grid">{quests.map(q => { const uq = q.users[0]; return <article className="glass-card stack" key={q.id}><h2>{q.description}</h2><p>Прогресс: {uq?.progress || 0}/{q.requirementValue}</p><div className="balance">+{q.reward} ₽</div>{uq?.completed && <span className="badge">Выполнено</span>}</article>; })}</section></main></>;
}
