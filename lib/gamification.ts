import { PrismaClient } from '@prisma/client';
import { prisma } from './prisma';

export const DEFAULT_ACHIEVEMENTS = [
  { name: 'Первые 10 выполнений', description: 'Взять и выполнить 10 заданий', icon: '🔥', conditionType: 'TASKS_COMPLETED_10', reward: 200 },
  { name: 'Создатель 5 заданий', description: 'Создать 5 заданий', icon: '🧠', conditionType: 'TASKS_CREATED_5', reward: 150 },
  { name: 'Капитал 5000', description: 'Достичь баланса 5000 ₽', icon: '💎', conditionType: 'BALANCE_5000', reward: 500 },
  { name: 'Голос народа', description: 'Проголосовать 5 раз', icon: '🗳️', conditionType: 'VOTES_5', reward: 100 },
];

export function xpForNextLevel(level: number) {
  return Math.max(100, level * 250);
}

export async function ensureAchievements(client: PrismaClient = prisma) {
  await Promise.all(
    DEFAULT_ACHIEVEMENTS.map((achievement) =>
      client.achievement.upsert({
        where: { conditionType: achievement.conditionType },
        update: achievement,
        create: achievement,
      })
    )
  );
}

export async function addExperience(userId: number, amount: number, client: PrismaClient = prisma) {
  const user = await client.user.findUnique({ where: { id: userId }, select: { level: true, experience: true } });
  if (!user) return null;

  let level = user.level;
  let experience = user.experience + amount;
  while (experience >= xpForNextLevel(level)) {
    experience -= xpForNextLevel(level);
    level += 1;
  }

  return client.user.update({ where: { id: userId }, data: { level, experience } });
}

export async function checkAchievements(userId: number) {
  await ensureAchievements();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: { select: { createdTasks: true, playingTasks: true, votes: true } },
      achievements: { select: { achievement: { select: { conditionType: true } } } },
    },
  });
  if (!user) return [];

  const unlocked = new Set(user.achievements.map((ua) => ua.achievement.conditionType));
  const shouldUnlock = DEFAULT_ACHIEVEMENTS.filter((a) => {
    if (unlocked.has(a.conditionType)) return false;
    if (a.conditionType === 'TASKS_COMPLETED_10') return user._count.playingTasks >= 10;
    if (a.conditionType === 'TASKS_CREATED_5') return user._count.createdTasks >= 5;
    if (a.conditionType === 'BALANCE_5000') return user.balance >= 5000;
    if (a.conditionType === 'VOTES_5') return user._count.votes >= 5;
    return false;
  });

  const created = [];
  for (const achievement of shouldUnlock) {
    const dbAchievement = await prisma.achievement.findUnique({ where: { conditionType: achievement.conditionType } });
    if (!dbAchievement) continue;
    created.push(await prisma.userAchievement.create({ data: { userId, achievementId: dbAchievement.id } }));
    await prisma.user.update({ where: { id: userId }, data: { balance: { increment: achievement.reward } } });
    await prisma.transaction.create({ data: { userId, type: 'achievement', amount: achievement.reward, status: 'completed', reason: `Достижение: ${achievement.name}` } });
  }
  return created;
}

export async function progressForAchievement(userId: number, conditionType: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { _count: { select: { createdTasks: true, playingTasks: true, votes: true } } },
  });
  if (!user) return { current: 0, target: 1 };
  if (conditionType === 'TASKS_COMPLETED_10') return { current: user._count.playingTasks, target: 10 };
  if (conditionType === 'TASKS_CREATED_5') return { current: user._count.createdTasks, target: 5 };
  if (conditionType === 'BALANCE_5000') return { current: user.balance, target: 5000 };
  if (conditionType === 'VOTES_5') return { current: user._count.votes, target: 5 };
  return { current: 0, target: 1 };
}
