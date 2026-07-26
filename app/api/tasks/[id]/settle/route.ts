import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { notifyUser } from '@/lib/notifications';
import { addExperience, checkAchievements } from '@/lib/gamification';
import { sendPushToUser } from '@/lib/push';

export const runtime = 'nodejs';

const PLATFORM_FEE_RATE = 0.1;

class SettlementError extends Error {
  status: number;

  constructor(message: string, status = 409) {
    super(message);
    this.status = status;
  }
}

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Некорректный id задания.' }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        where: { id },
        include: {
          votes: true,
          creator: { select: { id: true, name: true } },
          player: { select: { id: true, name: true } },
        },
      });

      if (!task || task.status !== 'voting' || !task.playerId) {
        throw new SettlementError('Задание нельзя завершить.');
      }

      const canSettle = user.role === 'admin' || user.id === task.creatorId || user.id === task.playerId;
      if (!canSettle) {
        throw new SettlementError('Нет прав на завершение этого задания.', 403);
      }

      const approveCount = task.votes.filter((vote) => vote.value === 'approve').length;
      const rejectCount = task.votes.filter((vote) => vote.value === 'reject').length;
      const approved = approveCount > rejectCount;
      const playerPayout = approved ? Math.floor(task.reward * (1 - PLATFORM_FEE_RATE)) : 0;
      const platformFee = approved ? task.reward - playerPayout : 0;

      if (approved) {
        // Атомарно списываем награду только если у создателя всё ещё достаточно средств.
        const creatorCharge = await tx.user.updateMany({
          where: { id: task.creatorId, balance: { gte: task.reward } },
          data: { balance: { decrement: task.reward } },
        });

        if (creatorCharge.count !== 1) {
          throw new SettlementError('Недостаточно средств у создателя задания для выплаты награды.');
        }

        await tx.user.update({
          where: { id: task.playerId },
          data: {
            balance: { increment: playerPayout },
            reputation: { increment: 1 },
            completedTasksCount: { increment: 1 },
          },
        });

        await tx.transaction.createMany({
          data: [
            {
              userId: task.creatorId,
              type: 'task_payment',
              status: 'completed',
              amount: -task.reward,
              reason: `Оплата зачтённого задания ${task.id}`,
            },
            {
              userId: task.playerId,
              type: 'reward',
              status: 'completed',
              amount: playerPayout,
              reason: `Награда за задание ${task.id} за вычетом комиссии ${platformFee}`,
            },
          ],
        });
      } else {
        await tx.user.update({
          where: { id: task.playerId },
          data: { reputation: { decrement: 1 }, failedTasksCount: { increment: 1 } },
        });
        await tx.transaction.create({
          data: {
            userId: task.playerId,
            type: 'task_rejected',
            status: 'completed',
            amount: 0,
            reason: `Задание ${task.id} отклонено голосованием`,
          },
        });
      }

      const outcome = approved ? 'approve' : 'reject';
      const bets = await tx.bet.findMany({ where: { taskId: task.id, status: 'pending' } });
      const totalBetPool = bets.reduce((sum, bet) => sum + bet.amount, 0);
      const winningPool = bets
        .filter((bet) => bet.chosenOutcome === outcome)
        .reduce((sum, bet) => sum + bet.amount, 0);

      for (const bet of bets) {
        if (bet.chosenOutcome === outcome && winningPool > 0) {
          // Выплата идёт из общего пула прогнозов пропорционально размеру выигравшего прогноза.
          // Так баланс системы не создаёт деньги из воздуха.
          const payout = Math.floor((totalBetPool * bet.amount) / winningPool);
          if (payout > 0) {
            await tx.user.update({ where: { id: bet.userId }, data: { balance: { increment: payout } } });
            await tx.transaction.create({
              data: {
                userId: bet.userId,
                type: 'bet_win',
                amount: payout,
                status: 'completed',
               reason: `Бонус за точный прогноз по заданию ${task.id}`,
              },
            });
          }
          await tx.bet.update({ where: { id: bet.id }, data: { status: 'won', payout } });
        } else {
          await tx.bet.update({ where: { id: bet.id }, data: { status: 'lost', payout: 0 } });
        }
      }

      const settledTask = await tx.task.update({
        where: { id },
        data: { status: approved ? 'approved' : 'rejected' },
        include: {
          creator: { select: { name: true } },
          player: { select: { name: true } },
          votes: true,
        },
      });

      return { settledTask, approved, approveCount, rejectCount, reward: task.reward, platformFee, playerPayout, taskTitle: task.title, creatorId: task.creatorId, playerId: task.playerId };
    });

    const resultText = result.approved ? 'зачтено' : 'отклонено';
    await Promise.all([
      notifyUser(result.playerId, 'voting_result', `Задание «${result.taskTitle}» ${resultText}.`, `/dashboard`),
      notifyUser(result.creatorId, 'voting_result', `Голосование по заданию «${result.taskTitle}» завершено: ${resultText}.`, `/dashboard`),
      addExperience(result.playerId, result.approved ? 80 : 20),
      addExperience(result.creatorId, 10),
      sendPushToUser(result.playerId, { title: 'Итог голосования', body: `Задание «${result.taskTitle}» ${resultText}`, url: '/dashboard' }),
      sendPushToUser(result.creatorId, { title: 'Итог голосования', body: `Задание «${result.taskTitle}» ${resultText}`, url: '/dashboard' }),
    ]);
    await Promise.all([checkAchievements(result.playerId), checkAchievements(result.creatorId)]);

    return NextResponse.json({
      task: result.settledTask,
      approved: result.approved,
      approveCount: result.approveCount,
      rejectCount: result.rejectCount,
      reward: result.reward,
      platformFee: result.platformFee,
      playerPayout: result.playerPayout,
    });
  } catch (error) {
    if (error instanceof SettlementError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Task settlement failed', error);
    return NextResponse.json({ error: 'Не удалось завершить задание.' }, { status: 500 });
  }
}
