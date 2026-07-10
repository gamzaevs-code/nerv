'use client';

import { useEffect, useState } from 'react';

const MIN_WITHDRAW = 100;

export default function WalletPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBalance();
  }, []);

  async function fetchBalance() {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (data.user) {
        setBalance(data.user.balance);
      } else {
        setError('Не удалось загрузить баланс');
      }
    } catch {
      setError('Ошибка сети при загрузке баланса');
    }
  }

  async function handleWithdraw() {
    setLoading(true);
    setMessage('');
    setError('');

    const numAmount = Number(amount);

    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numAmount }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка вывода');
        return;
      }

      setMessage(data.message || '✅ Вывод выполнен!');
      setBalance(data.newBalance ?? (balance ? balance - numAmount : null));
      setAmount('');
    } catch {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  }

  const numAmount = amount === '' ? 0 : Number(amount);
  const canWithdraw =
    balance !== null &&
    numAmount >= MIN_WITHDRAW &&
    numAmount <= balance;

  if (balance === null) {
    return (
      <main className="page-shell">
        <div className="glass-card stack" style={{ maxWidth: 400, margin: '0 auto' }}>
          <h1>💳 Кошелёк</h1>
          <p className="muted">Загрузка...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="glass-card stack" style={{ maxWidth: 400, margin: '0 auto' }}>
        <h1>💳 Кошелёк</h1>
        <p style={{ fontSize: 32, fontWeight: 'bold' }}>{balance} ₽</p>

        <label>
          Сумма вывода
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Введите сумму"
            min={1}
            max={balance}
            className="neon-input"
          />
        </label>

        {balance < MIN_WITHDRAW && (
          <div className="error">Минимальная сумма вывода — {MIN_WITHDRAW} ₽. Пополните баланс.</div>
        )}

        {numAmount > 0 && numAmount < MIN_WITHDRAW && (
          <div className="error">Минимальная сумма вывода — {MIN_WITHDRAW} ₽</div>
        )}

        {numAmount > balance && (
          <div className="error">Недостаточно средств</div>
        )}

        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        <button
          className="neon-button"
          onClick={handleWithdraw}
          disabled={loading || !canWithdraw}
          style={{ width: '100%' }}
        >
          {loading ? 'Обработка...' : '💸 Вывести'}
        </button>

        <p className="muted" style={{ fontSize: 12 }}>
          ⚠️ Минимальная сумма вывода: {MIN_WITHDRAW} ₽ · Доступно: {balance} ₽
        </p>
      </div>
    </main>
  );
}
