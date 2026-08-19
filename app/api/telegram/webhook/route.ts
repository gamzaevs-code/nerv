import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// ✅ Правильный импорт через require
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('❌ BOT_TOKEN is not set');
}

// ✅ Создаём бота ТОЛЬКО если есть токен
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

    if (text === '/start') {
      await bot.sendMessage(
        chatId,
        '🤖 *Добро пожаловать в НЕРВ Бот!*\n\n' +
        '📋 /tasks — задания\n' +
        '💰 /profile — баланс\n' +
        '📝 /create — создать задание\n' +
        '💳 /wallet — кошелёк',
        { parse_mode: 'Markdown' }
      );
      return NextResponse.json({ ok: true });
    }

    if (text === '/profile') {
      const user = await prisma.user.findFirst({
        where: { telegramChatId: String(chatId) },
      });

      if (!user) {
        await bot.sendMessage(
          chatId,
          '❌ Ты не привязан к аккаунту НЕРВ.\n' +
          'Перейди на сайт и привяжи Telegram в настройках.'
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

    await bot.sendMessage(chatId, '🤔 Неизвестная команда. Используй /start.');

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}