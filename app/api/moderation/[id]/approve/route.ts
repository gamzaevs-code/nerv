import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(_r: Request, { params }: { params: { id: string } }) { const user = await getCurrentUser(); if (!user || (!user.isModerator && user.role !== 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); const sub = await prisma.challengeSubmission.update({ where: { id: Number(params.id) }, data: { status: 'approved' }, include: { challenge: true } }); await prisma.user.update({ where: { id: sub.userId }, data: { balance: { increment: sub.challenge.reward } } }); await prisma.moderatorLog.create({ data: { moderatorId: user.id, action: 'approve_challenge', targetId: sub.id } }); return NextResponse.json(sub); }