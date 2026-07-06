import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import TelegramForm from '@/components/TelegramForm';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function TelegramSettingsPage() { const user = await getCurrentUser(); if (!user) redirect('/login'); const full = await prisma.user.findUnique({ where: { id: user.id }, select: { telegramChatId: true, telegramLinked: true } }); return <><Header simplified /><main className="page-shell"><section className="glass-card stack"><span className="badge">Telegram</span><h1>Telegram уведомления</h1><p>Статус: {full?.telegramLinked ? 'привязан' : 'не привязан'}</p><TelegramForm chatId={full?.telegramChatId} /></section></main></>; }
