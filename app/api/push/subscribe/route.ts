import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const subscription = await request.json();
  const endpoint = String(subscription.endpoint || '');
  const p256dh = String(subscription.keys?.p256dh || '');
  const auth = String(subscription.keys?.auth || '');
  if (!endpoint || !p256dh || !auth) return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });

  const saved = await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { userId: user.id, p256dh, auth },
    create: { userId: user.id, endpoint, p256dh, auth },
  });
  return NextResponse.json(saved);
}
