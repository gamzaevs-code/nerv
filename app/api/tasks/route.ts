import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserIdFromCookies } from '@/lib/auth';
import { addExperience, checkAchievements } from '@/lib/gamification';
import { sendPushToRole } from '@/lib/push';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();
  const minReward = Number(searchParams.get('minReward') || 0);
  const maxReward = Number(searchParams.get('maxReward') || 0);
  const sort = searchParams.get('sort') || 'new';
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const take = 20;

  const where = {
    status: 'open',
    ...(q ? { title: { contains: q } } : {}),
    ...((minReward > 0 || maxReward > 0) ? { reward: { ...(minReward > 0 ? { gte: minReward } : {}), ...(maxReward > 0 ? { lte: maxReward } : {}) } } : {}),
  };

  const orderBy = sort === 'reward_asc'
    ? { reward: 'asc' as const }
    : sort === 'reward_desc'
      ? { reward: 'desc' as const }
      : { createdAt: 'desc' as const };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: { creator: { select: { name: true } } },
      orderBy,
      skip: (page - 1) * take,
      take,
    }),
    prisma.task.count({ where }),
  ]);

  return NextResponse.json({ tasks, total, page, pages: Math.max(1, Math.ceil(total / take)) });
}

export async function POST(request: Request) {
  const userId = getAuthUserIdFromCookies();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // TODO: временно отключено по требованию — вернуть после стабилизации email verification.
  // const current = await prisma.user.findUnique({ where: { id: userId }, select: { emailVerified: true } });
  // if (!current?.emailVerified) return NextResponse.json({ error: 'Подтвердите email, чтобы создавать задания.' }, { status: 403 });

  const { title, description, reward } = await request.json();
  const normalizedTitle = String(title || '').trim();
  const normalizedReward = Number(reward);

  if (!normalizedTitle) return NextResponse.json({ error: 'Название обязательно.' }, { status: 400 });
  if (!Number.isInteger(normalizedReward) || normalizedReward <= 0) {
    return NextResponse.json({ error: 'Награда должна быть положительным целым числом.' }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: { title: normalizedTitle, description: String(description || '').trim() || null, reward: normalizedReward, creatorId: userId },
  });
  await addExperience(userId, 20);
  await checkAchievements(userId);
  await sendPushToRole('player', { title: 'Новое задание', body: task.title, url: `/task/${task.id}` });
  return NextResponse.json(task, { status: 201 });
}
