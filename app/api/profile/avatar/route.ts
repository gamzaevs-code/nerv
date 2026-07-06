import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserIdFromCookies } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const userId = getAuthUserIdFromCookies();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('avatar');

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'Файл аватарки обязателен.' }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
  await mkdir(uploadDir, { recursive: true });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `${Date.now()}-${userId}-${safeName}`;
  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

  const avatar = `/uploads/avatars/${fileName}`;
  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatar },
    select: { id: true, avatar: true },
  });

  return NextResponse.json(user);
}
