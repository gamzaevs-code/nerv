import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await prisma.twoFactor.updateMany({ where: { userId: user.id }, data: { isEnabled: false, backupCodes: [] } });
  return NextResponse.json({ ok: true });
}
