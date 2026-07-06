import { prisma } from './prisma';

export const DEFAULT_DAILY_QUESTS = [
  { description: 'Проголосовать 5 раз', reward: 75, requirementType: 'VOTE_5_TIMES', requirementValue: 5 },
  { description: 'Создать 2 задания', reward: 120, requirementType: 'CREATE_2_TASKS', requirementValue: 2 },
  { description: 'Взять 3 задания', reward: 150, requirementType: 'COMPLETE_3_TASKS', requirementValue: 3 },
];

export async function ensureDailyQuests() {
  const count = await prisma.dailyQuest.count();
  if (count > 0) return;
  await prisma.dailyQuest.createMany({ data: DEFAULT_DAILY_QUESTS });
}
