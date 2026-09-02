import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('❌ BOT_TOKEN is not set');
}

const bot = token ? new TelegramBot(token) : null;

export async function POST(req: Request) {
  try {
    if (!bot) {
      return NextResponse.json({ error: 'Bot not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text;

    // --- КОМАНДЫ ---

    // /start
    if (text === '/start') {
      await bot.sendMessage(
        chatId,
        `🤖 *Добро пожаловать в НЕРВ Бот!*

💰 Управляй заданиями, балансом и репутацией прямо из Telegram.

📋 *Доступные команды:*
/start — Главное меню
/profile — Мой профиль
/tasks — Список заданий
/create — Создать задание
/wallet — Кошелёк
/link — Привязать аккаунт

🎯 Выбери действие!`,
        { parse_mode: 'Markdown' }
      );
      return NextResponse.json({ ok: true });
    }

    // /profile
    if (text === '/profile') {
      const user = await prisma.user.findFirst({
        where: { telegramChatId: String(chatId) },
      });

      if (!user) {
        await bot.sendMessage(
          chatId,
          '❌ *Ты не привязан к аккаунту НЕРВ!*\n\n' +
          'Перейди на сайт и привяжи Telegram в настройках профиля.\n' +
          'Или используй команду /link для привязки.',
          { parse_mode: 'Markdown' }
        );
        return NextResponse.json({ ok: true });
      }

      await bot.sendMessage(
        chatId,
        `👤 *Твой профиль*

Баланс: *${user.balance} ₽*
Репутация: *${user.reputation}*
Роль: *${user.role}*
Уровень: *${user.level}*
Выполнено заданий: *${user.completedTasksCount}*`,
        { parse_mode: 'Markdown' }
      );
      return NextResponse.json({ ok: true });
    }

    // /tasks
    if (text === '/tasks') {
      const tasks = await prisma.task.findMany({
        where: { status: 'open' },
        take: 5,
        include: {
          creator: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (tasks.length === 0) {
        await bot.sendMessage(
          chatId,
          '📭 *Нет открытых заданий*\n\n' +
          'Загляни позже или создай своё задание через /create',
          { parse_mode: 'Markdown' }
        );
        return NextResponse.json({ ok: true });
      }

      let message = '📋 *Список заданий*\n\n';
      tasks.forEach((task, index) => {
        message += `${index + 1}. *${task.title}*\n`;
        message += `   Награда: *${task.reward} ₽*\n`;
        message += `   Создатель: ${task.creator.name}\n`;
        message += `   Статус: ${task.status}\n\n`;
      });

      await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      return NextResponse.json({ ok: true });
    }

    // /help
    if (text === '/help') {
      await bot.sendMessage(
        chatId,
        `📖 *Помощь по командам*

/start — Главное меню
/profile — Мой профиль
/tasks — Список заданий
/create — Создать задание
/wallet — Кошелёк
/link — Привязать аккаунт

📌 *Скоро появятся:*
- Уведомления о новых заданиях
- Голосование через бота
- Вывод средств`,
        { parse_mode: 'Markdown' }
      );
      return NextResponse.json({ ok: true });
    }

    // Неизвестная команда
    await bot.sendMessage(
      chatId,
      '🤔 *Неизвестная команда*\n\n' +
      'Используй /start для списка доступных команд.',
      { parse_mode: 'Markdown' }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}