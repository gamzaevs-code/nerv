import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyUser } from '@/lib/notifications';
import { sendPushToUser } from '@/lib/push';

export const runtime = 'nodejs';

type Body = { action?: 'accept' | 'decline' };

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = Number(params.id);
  const { action } = (await request.json().catch(() => ({}))) as Body;
  if (!['accept', 'decline'].includes(String(action))) return NextResponse.json({ error: 'Некорректное действие.' }, { status: 400 });

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.status !== 'offered' || task.offeredTo !== user.id) {
    return NextResponse.json({ error: 'Предложение не найдено.' }, { status: 404 });
  }

  const updated = await prisma.task.update({
    where: { id },
    data: action === 'accept' ? { status: 'open', playerId: user.id } : { status: 'declined' },
  });

  if (task.offeredBy) {
    const message = `Игрок ${user.name} ${action === 'accept' ? 'принял' : 'отклонил'} задание «${task.title}».`;
    await Promise.all([
      notifyUser(task.offeredBy, 'task_offer_response', message, `/task/${task.id}`),
      sendPushToUser(task.offeredBy, { title: 'Ответ на предложение', body: message, url: `/task/${task.id}` }),
    ]);
  }

  return NextResponse.json({ task: updated });
}
