import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const { code } = await request.json();
  const invite = await prisma.inviteCode.findUnique({ where: { code: String(code || '').trim() } });
  const valid = !!invite && (!invite.expiresAt || invite.expiresAt > new Date()) && invite.usedCount < invite.maxUses;
  return NextResponse.json({ valid });
}
