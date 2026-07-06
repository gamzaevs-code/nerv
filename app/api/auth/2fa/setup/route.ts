import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const secret = speakeasy.generateSecret({ name: `НЕРВ (${user.email})`, issuer: 'НЕРВ' });
  const otpauthUrl = secret.otpauth_url || '';
  const qrCode = await QRCode.toDataURL(otpauthUrl);

  await prisma.twoFactor.upsert({
    where: { userId: user.id },
    update: { secret: secret.base32, isEnabled: false, backupCodes: [] },
    create: { userId: user.id, secret: secret.base32, isEnabled: false, backupCodes: [] },
  });

  return NextResponse.json({ secret: secret.base32, qrCode, otpauthUrl });
}
