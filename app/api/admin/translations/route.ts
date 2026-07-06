import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() { const admin = await requireAdmin(); if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); return NextResponse.json(await prisma.translation.findMany({ orderBy: [{ locale: 'asc' }, { key: 'asc' }] })); }
export async function POST(request: Request) { const admin = await requireAdmin(); if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); const { locale, key, value } = await request.json(); const t = await prisma.translation.upsert({ where: { locale_key: { locale, key } }, update: { value }, create: { locale, key, value } }); return NextResponse.json(t); }
