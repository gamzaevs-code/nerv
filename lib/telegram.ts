export async function sendTelegram(chatId: string | null | undefined, text: string) {
  if (!chatId || !process.env.TELEGRAM_BOT_TOKEN) return { ok: false, skipped: true };
  const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text }),
  });
  return res.json();
}
