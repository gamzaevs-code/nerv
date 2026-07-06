import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export async function GET() {
  return NextResponse.json(await prisma.challenge.findMany({ where: { status: 'active' }, orderBy: { createdAt: 'desc' } }));
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { title, description, requiredAction, reward, difficulty, imageUrl, category, status } = await request.json();
  const challenge = await prisma.challenge.create({
    data: {
      title,
      description,
      requiredAction: requiredAction || null,
      reward: Number(reward || 0),
      difficulty: difficulty || 'easy',
      imageUrl: imageUrl || null,
      category: category || 'daily',
      status: status || 'active',
    },
  });
  return NextResponse.json(challenge, { status: 201 });
}
