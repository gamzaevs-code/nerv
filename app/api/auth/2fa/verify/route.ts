import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type Body = { token?: string };

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { token } = (await request.json().catch(() => ({}))) as Body;
  const twoFactor = await prisma.twoFactor.findUnique({ where: { userId: user.id } });
  if (!twoFactor) return NextResponse.json({ error: 'Сначала создайте 2FA секрет.' }, { status: 400 });

  const verified = speakeasy.totp.verify({ secret: twoFactor.secret, encoding: 'base32', token: token || '', window: 1 });
  if (!verified) return NextResponse.json({ error: 'Неверный код.' }, { status: 400 });

  const backupCodes = Array.from({ length: 8 }, () => crypto.randomBytes(4).toString('hex').toUpperCase());
  const updated = await prisma.twoFactor.update({ where: { userId: user.id }, data: { isEnabled: true, backupCodes } });
  return NextResponse.json({ ok: true, backupCodes: updated.backupCodes });
}
