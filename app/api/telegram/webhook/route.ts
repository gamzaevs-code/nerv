import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Безопасная инициализация бота
let bot: any = null;

try {
  // Динамический импорт, чтобы не ломать сборку
  const TelegramBot = require('node-telegram-bot-api');
  const token = process.env.BOT_TOKEN;
  
  if (token) {
    bot = new TelegramBot(token);
    console.log('✅ Telegram bot initialized');
  } else {
    console.warn('⚠️ BOT_TOKEN not set, bot disabled');
  }
} catch (error) {
  console.warn('⚠️ Telegram bot not available:', error);
}

export async function POST(req: Request) {
  try {
    // Если бот не инициализирован — просто отвечаем ok
    if (!bot) {
      console.warn('⚠️ Bot not available, ignoring request');
      return NextResponse.json({ ok: true, warning: 'Bot disabled' });
    }

    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text;

    // /start — ОБЯЗАТЕЛЬНО ОТВЕЧАЕТ
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

    // Неизвестная команда
    await bot.sendMessage(chatId, '🤔 Неизвестная команда. Используй /help.');

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('❌ Telegram webhook error:', error);
    // Всегда возвращаем ok, чтобы Telegram не пересылал снова
    return NextResponse.json({ ok: true, error: String(error) });
  }
}

// GET для проверки
export async function GET() {
  return NextResponse.json({ 
    ok: true, 
    message: 'Webhook is alive!',
    bot_available: !!bot,
    time: new Date().toISOString()
  });
}