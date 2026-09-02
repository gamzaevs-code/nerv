import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('❌ BOT_TOKEN is not set');
}

const bot = token ? new TelegramBot(token) : null;

// ✅ ПРОСТАЯ ВЕРСИЯ ДЛЯ ПРОВЕРКИ
export async function POST(req: Request) {
  try {
    console.log('📨 Webhook received!');
    
    if (!bot) {
      console.error('❌ Bot not configured');
      return NextResponse.json({ error: 'Bot not configured' }, { status: 500 });
    }

    const body = await req.json();
    console.log('📨 Body:', body);
    
    const { message } = body;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text;

    console.log(`📨 Chat ID: ${chatId}, Text: ${text}`);

    // /start - ОБЯЗАТЕЛЬНО ОТВЕЧАЕТ
    if (text === '/start') {
      await bot.sendMessage(chatId, '✅ Бот работает! Отправь /help для списка команд.');
      return NextResponse.json({ ok: true });
    }

    // /help
    if (text === '/help') {
      await bot.sendMessage(
        chatId,
        `📖 *Команды бота:*\n\n` +
        `/start — Проверка работы\n` +
        `/profile — Мой профиль\n` +
        `/tasks — Список заданий\n` +
        `/help — Помощь`,
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
          '❌ Ты не привязан к аккаунту. Перейди на сайт и привяжи Telegram.'
        );
        return NextResponse.json({ ok: true });
      }

      await bot.sendMessage(
        chatId,
        `👤 *Твой профиль*\n\n` +
        `Баланс: *${user.balance} ₽*\n` +
        `Репутация: *${user.reputation}*\n` +
        `Роль: *${user.role}*\n` +
        `Уровень: *${user.level}*`,
        { parse_mode: 'Markdown' }
      );
      return NextResponse.json({ ok: true });
    }

    // /tasks
    if (text === '/tasks') {
      const tasks = await prisma.task.findMany({
        where: { status: 'open' },
        take: 5,
        include: { creator: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      });

      if (tasks.length === 0) {
        await bot.sendMessage(chatId, '📭 Нет открытых заданий.');
        return NextResponse.json({ ok: true });
      }

      let msg = '📋 *Список заданий*\n\n';
      tasks.forEach((task, i) => {
        msg += `${i + 1}. *${task.title}*\n`;
        msg += `   Награда: *${task.reward} ₽*\n`;
        msg += `   Создатель: ${task.creator.name}\n\n`;
      });

      await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
      return NextResponse.json({ ok: true });
    }

    // Неизвестная команда
    await bot.sendMessage(chatId, '🤔 Неизвестная команда. Используй /help.');

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('❌ Telegram webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ✅ Добавляем GET для проверки
export async function GET() {
  return NextResponse.json({ 
    ok: true, 
    message: 'Webhook is alive!',
    time: new Date().toISOString()
  });
}