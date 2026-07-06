import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sendPushToRole, sendPushToUser } from '@/lib/push';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { userId, role, title, body, url } = await request.json();
  if (role && user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const result = role ? await sendPushToRole(role, { title, body, url }) : await sendPushToUser(Number(userId || user.id), { title, body, url });
  return NextResponse.json(result);
}
