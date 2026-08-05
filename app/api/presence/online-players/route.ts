import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const players = await prisma.userPresence.findMany({
      where: {
        isOnline: true,
        lastSeen: { gte: fiveMinutesAgo },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        lastSeen: 'desc',
      },
    });

    return NextResponse.json({
      players: players.map((p) => ({
        id: p.user.id,
        name: p.user.name,
        role: p.user.role,
        lastSeen: p.lastSeen,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch online players:', error);
    return NextResponse.json(
      { error: 'Не удалось получить список онлайн-игроков' },
      { status: 500 }
    );
  }
}