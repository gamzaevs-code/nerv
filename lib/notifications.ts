import { prisma } from './prisma';

export async function notifyUser(userId: number, type: string, message: string, link?: string) {
  return prisma.notification.create({
    data: { userId, type, message, link },
  });
}

export async function notifyViewers(type: string, message: string, link?: string) {
  const viewers = await prisma.user.findMany({
    where: { role: 'viewer', isBanned: false },
    select: { id: true },
  });

  if (viewers.length === 0) return { count: 0 };

  return prisma.notification.createMany({
    data: viewers.map((viewer) => ({ userId: viewer.id, type, message, link })),
  });
}
