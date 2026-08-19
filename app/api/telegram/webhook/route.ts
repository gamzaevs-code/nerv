import { NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error('BOT_TOKEN is not set');
}

const bot = new TelegramBot(token);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text;

    // /start
    if (text === '/start') {
      await bot.sendMessage(
        chatId,
        '🤖 *Добро пожаловать в НЕРВ Бот!*\n\n' +
        'Здесь ты можешь:\n' +
        '📋 Смотреть задания (/tasks)\n' +
        '💰 Проверить баланс (/profile)\n' +
        '📝 Создать задание (/create)\n' +
        '💳 Пополнить или вывести деньги (/wallet)\n\n' +
        'Используй кнопки ниже для навигации.',
        { parse_mode: 'Markdown' }
      );
      return NextResponse.json({ ok: true });
    }

    // /profile
    if (text === '/profile') {
      // Находим пользователя по chatId (нужно связать с аккаунтом)
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

    // Неизвестная команда
    await bot.sendMessage(chatId, '🤔 Неизвестная команда. Используй /start для списка команд.');

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}