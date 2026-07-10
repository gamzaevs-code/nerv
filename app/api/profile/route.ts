import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserIdFromCookies } from '@/lib/auth';

export const runtime = 'nodejs';

// ✅ Нужно для WalletPage и других клиентов
export async function GET() {
  const userId = getAuthUserIdFromCookies();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      balance: true,
      isModerator: true,
      level: true,
      experience: true,
      theme: true,
      avatar: true,
      bio: true,
      location: true,
      createdAt: true,
    },
  });

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const userId = getAuthUserIdFromCookies();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, bio, location } = await request.json();
  const normalizedName = String(name || '').trim();

  if (!normalizedName) {
    return NextResponse.json({ error: 'Имя обязательно.' }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: normalizedName,
      bio: String(bio || '').trim() || null,
      location: String(location || '').trim() || null,
    },
    select: { id: true, name: true, bio: true, location: true, avatar: true },
  });

  return NextResponse.json(user);
}
