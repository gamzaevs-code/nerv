import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type Body = { enabled?: boolean };

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as Body;
  const enabled = body.enabled !== false;

  const subscription = await prisma.userPresenceSubscription.upsert({
    where: { userId: user.id },
    update: { enabled },
    create: { userId: user.id, enabled },
  });

  return NextResponse.json({ subscription });
}
