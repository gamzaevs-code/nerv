import Link from 'next/link';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const TYPE_LABELS: Record<string, string> = {
  reward: 'Награда',
  platform_fee: 'Комиссия платформы',
  task_payment: 'Оплата задания',
  task_rejected: 'Задание отклонено',
  daily_bonus: 'Ежедневный бонус',
  deposit: 'Пополнение',
  withdraw: 'Вывод',
  bet: 'Ставка',
  bet_win: 'Выигрыш ставки',
  referral: 'Реферал',
  achievement: 'Достижение',
  challenge: 'Челлендж',
};

function parseDate(value?: string, endOfDay = false) {
  if (!value) return null;
  const date = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function money(amount: number) {
  if (amount > 0) return `+${amount} ₽`;
  if (amount < 0) return `${amount} ₽`;
  return '0 ₽';
}

export default async function TransactionsPage({ searchParams }: { searchParams: { type?: string; from?: string; to?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const selectedType = searchParams.type?.trim() || '';
  const from = parseDate(searchParams.from);
  const to = parseDate(searchParams.to, true);

  const where = {
    userId: user.id,
    ...(selectedType ? { type: selectedType } : {}),
    ...((from || to) ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
  };

  const [transactions, availableTypes] = await Promise.all([
    prisma.transaction.findMany({ where, orderBy: { createdAt: 'desc' }, take: 300 }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      distinct: ['type'],
      select: { type: true },
      orderBy: { type: 'asc' },
    }),
  ]);

  const income = transactions.filter((tx) => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
  const expense = transactions.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <section className="glass-card page-hero-card stack">
          <span className="badge">Transactions / Ledger</span>
          <h1>Операции</h1>
          <p>Все начисления, списания, комиссии платформы, бонусы и игровые выплаты вашего аккаунта.</p>
          <div className="nav-links">
            <Link className="neon-button-outline" href="/profile">← Профиль</Link>
            <Link className="neon-button-outline" href="/wallet">Кошелёк</Link>
          </div>
        </section>

        <section className="grid">
          <article className="stat-card"><p className="stat-label">Операций</p><div className="metric">{transactions.length}</div></article>
          <article className="stat-card"><p className="stat-label">Начисления</p><div className="balance">+{income} ₽</div></article>
          <article className="stat-card"><p className="stat-label">Списания</p><div className="balance">{expense} ₽</div></article>
        </section>

        <section className="glass-card stack" style={{ marginTop: 22 }}>
          <form className="form" action="/transactions">
            <div className="grid" style={{ marginTop: 0 }}>
              <label>
                Тип
                <select name="type" defaultValue={selectedType}>
                  <option value="">Все типы</option>
                  {availableTypes.map(({ type }) => (
                    <option value={type} key={type}>{TYPE_LABELS[type] || type}</option>
                  ))}
                </select>
              </label>
              <label>
                C даты
                <input name="from" type="date" defaultValue={searchParams.from || ''} />
              </label>
              <label>
                По дату
                <input name="to" type="date" defaultValue={searchParams.to || ''} />
              </label>
            </div>
            <div className="nav-links">
              <button className="neon-button" type="submit">Применить фильтры</button>
              <Link className="neon-button-outline" href="/transactions">Сбросить</Link>
            </div>
          </form>
        </section>

        <section className="card-list" style={{ marginTop: 22 }}>
          {transactions.length === 0 && <article className="glass-card"><p>Операций по выбранным фильтрам нет.</p></article>}
          {transactions.map((tx) => (
            <article className="glass-card task-card" key={tx.id}>
              <div className="leaderboard-row" style={{ padding: 0 }}>
                <div>
                  <span className="badge">{TYPE_LABELS[tx.type] || tx.type}</span>
                  <h2 style={{ marginTop: 12 }}>{tx.reason || 'Операция'}</h2>
                  <p className="muted">
                    {tx.createdAt.toLocaleString('ru-RU')} · статус: {tx.status}
                  </p>
                </div>
                <div className="balance" style={{ color: tx.amount < 0 ? 'var(--danger)' : 'var(--cyan)' }}>
                  {money(tx.amount)}
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
