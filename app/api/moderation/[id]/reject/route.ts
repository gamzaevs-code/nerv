import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request, { params }: { params: { id: string } }) { const user = await getCurrentUser(); if (!user || (!user.isModerator && user.role !== 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); const { reason } = await request.json().catch(() => ({ reason: '' })); const sub = await prisma.challengeSubmission.update({ where: { id: Number(params.id) }, data: { status: 'rejected' } }); await prisma.moderatorLog.create({ data: { moderatorId: user.id, action: 'reject_challenge', targetId: sub.id, reason } }); return NextResponse.json(sub); }
