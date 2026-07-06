import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() { const user = await getCurrentUser(); if (!user || (!user.isModerator && user.role !== 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); const items = await prisma.challengeSubmission.findMany({ where: { status: 'pending' }, include: { user: { select: { name: true } }, challenge: true }, orderBy: { createdAt: 'desc' } }); return NextResponse.json(items); }