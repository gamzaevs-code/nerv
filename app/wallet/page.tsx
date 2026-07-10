'use client';

import { useEffect, useState } from 'react';

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBalance();
  }, []);

  async function fetchBalance() {
    const res = await fetch('/api/profile');
    const data = await res.json();
    if (data.user) setBalance(data.user.balance);
  }

  async function handleWithdraw() {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка вывода');
        return;
      }

      setMessage(data.message || '✅ Вывод выполнен!');
      setBalance(prev => prev - amount);
    } catch {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
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
            onChange={(e) => setAmount(Number(e.target.value))}
            min={1}
            max={balance}
            className="neon-input"
          />
        </label>

        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        <button
          className="neon-button"
          onClick={handleWithdraw}
          disabled={loading || amount > balance || amount < 1}
          style={{ width: '100%' }}
        >
          {loading ? 'Обработка...' : '💸 Вывести'}
        </button>

        <p className="muted" style={{ fontSize: 12 }}>
          ⚠️ Демо-режим. Деньги списываются с баланса без реального вывода.
        </p>
      </div>
    </main>
  );
}
