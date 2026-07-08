import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';  // ✅ Есть

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const presence = await prisma.userPresence.upsert({
    where: { userId: user.id },
    update: { isOnline: false, lastSeen: new Date() },
    create: { userId: user.id, isOnline: false },
  });

  return NextResponse.json({ presence });
}
