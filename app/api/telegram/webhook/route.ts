import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = (message.text || '').toString();

    const token = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'Bot not configured' }, { status: 500 });
    }

    if (!chatId) {
      return NextResponse.json({ error: 'No chat_id' }, { status: 400 });
    }

    let replyText = '🤔 Неизвестная команда. Используй /help.';
    if (text === '/start') replyText = '✅ Бот работает!';
    else if (text === '/help') replyText = '📖 Команды: /start, /help';

    // ✅ ИСПРАВЛЕНО — правильный URL с токеном
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyText,
      }),
    });

    if (!response.ok) {
      console.error('Telegram API error:', await response.text());
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Webhook is alive!' });
}
