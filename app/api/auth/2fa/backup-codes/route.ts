import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const twoFactor = await prisma.twoFactor.findUnique({ where: { userId: user.id }, select: { backupCodes: true, isEnabled: true } });
  return NextResponse.json({ backupCodes: twoFactor?.backupCodes || [], isEnabled: !!twoFactor?.isEnabled });
}
