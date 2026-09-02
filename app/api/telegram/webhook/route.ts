import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text;

    // Отправляем ответ напрямую через Telegram API
    const token = process.env.BOT_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'No token' }, { status: 500 });
    }

    let replyText = '🤔 Неизвестная команда. Используй /help.';
    
    if (text === '/start') {
      replyText = '✅ Бот работает!';
    } else if (text === '/help') {
      replyText = '📖 Команды: /start, /help';
    }

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyText,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Webhook is alive!' });
}