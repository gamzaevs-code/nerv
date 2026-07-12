import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('avatar') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 });
  }

  // ✅ Заглушка — сохраняем как base64
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const avatarUrl = `data:${file.type};base64,${base64}`;

  await prisma.user.update({
    where: { id: user.id },
    data: { avatar: avatarUrl },
  });

  return NextResponse.json({ success: true, avatar: avatarUrl });
}