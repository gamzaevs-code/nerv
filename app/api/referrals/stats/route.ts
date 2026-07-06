import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { ensureReferralCode } from '@/lib/referrals';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const code = await ensureReferralCode(user.id, user.email);
  const [friends, earnings] = await Promise.all([
    prisma.user.count({ where: { referredBy: user.id } }),
    prisma.referralEarning.aggregate({ where: { userId: user.id }, _sum: { amount: true } }),
  ]);
  return NextResponse.json({ referralCode: code, friends, earned: earnings._sum.amount || 0 });
}
