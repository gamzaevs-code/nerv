import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { DepositForm, WithdrawForm } from '@/components/WalletForms';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function WalletPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const transactions = await prisma.transaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 100 });
  return <><Header simplified /><main className="page-shell"><section className="glass-card stack"><span className="badge">Wallet</span><h1>Кошелёк</h1><div className="balance">{user.balance} ₽</div></section><section className="two-grid"><article className="glass-card stack"><h2>Пополнение</h2><DepositForm /></article><article className="glass-card stack"><h2>Вывод</h2><WithdrawForm /></article></section><section className="glass-card stack" style={{ marginTop: 18 }}><h2 className="neon-title">История</h2>{transactions.map(t => <p key={t.id}>{t.createdAt.toLocaleString('ru-RU')} · {t.type} · {t.amount} ₽ · {t.status} · {t.reason}</p>)}</section></main></>;
}
