import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Webhook is alive!' });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat?.id;
    const text = message.text || '';

    const token = process.env.BOT_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'No token' }, { status: 500 });
    }

    let reply = '🤔 Неизвестная команда. Используй /start.';
    if (text === '/start') reply = '✅ Бот работает!';
    else if (text === '/help') reply = '📖 Команды: /start, /help';

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: reply }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}