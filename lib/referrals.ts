import { prisma } from './prisma';

export function makeReferralCode(seed: string) {
  return `${seed.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6) || 'NERV'}${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

export async function ensureReferralCode(userId: number, email: string) {
  const existing = await prisma.user.findUnique({ where: { id: userId }, select: { referralCode: true } });
  if (existing?.referralCode) return existing.referralCode;
  let code = makeReferralCode(email);
  for (let i = 0; i < 5; i++) {
    const found = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!found) break;
    code = makeReferralCode(email);
  }
  await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
  return code;
}

export async function applyReferralBonuses(newUserId: number, referralCode?: string | null) {
  if (!referralCode) return;
  const referrer = await prisma.user.findUnique({ where: { referralCode }, select: { id: true, referredBy: true } });
  if (!referrer || referrer.id === newUserId) return;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: newUserId }, data: { referredBy: referrer.id, balance: { increment: 50 } } });
    await tx.user.update({ where: { id: referrer.id }, data: { balance: { increment: 100 } } });
    await tx.transaction.create({ data: { userId: newUserId, type: 'referral', amount: 50, status: 'completed', reason: 'Бонус за регистрацию по рефералу' } });
    await tx.transaction.create({ data: { userId: referrer.id, type: 'referral', amount: 100, status: 'completed', reason: 'Бонус за приглашение друга' } });
    await tx.referralEarning.create({ data: { userId: referrer.id, fromUserId: newUserId, level: 1, amount: 100 } });

    if (referrer.referredBy) {
      await tx.user.update({ where: { id: referrer.referredBy }, data: { balance: { increment: 30 } } });
      await tx.referralEarning.create({ data: { userId: referrer.referredBy, fromUserId: newUserId, level: 2, amount: 30 } });
    }
  });
}

export async function distributeDepositReferralEarnings(userId: number, amount: number) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { referredBy: true } });
  let currentReferrerId = user?.referredBy || null;
  const percents = [0.1, 0.05, 0.02];
  for (let level = 1; level <= 3 && currentReferrerId; level++) {
    const bonus = Math.floor(amount * percents[level - 1]);
    const referrer = await prisma.user.findUnique({ where: { id: currentReferrerId }, select: { id: true, referredBy: true } });
    if (!referrer || bonus <= 0) break;
    await prisma.user.update({ where: { id: referrer.id }, data: { balance: { increment: bonus } } });
    await prisma.referralEarning.create({ data: { userId: referrer.id, fromUserId: userId, level, amount: bonus } });
    currentReferrerId = referrer.referredBy;
  }
}
