'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
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
      }
    } catch {
      setError('Не удалось загрузить баланс');
    }
  }

  async function handleDeposit() {
    const amount = Number(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Введите корректную сумму');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка пополнения');
        return;
      }

      setMessage(`✅ Баланс пополнен на ${amount} ₽`);
      setBalance(data.newBalance);
      setDepositAmount('');
    } catch {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdraw() {
    const amount = Number(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Введите корректную сумму');
      return;
    }

    if (amount < 100) {
      setError('Минимальная сумма вывода — 100 ₽');
      return;
    }

    if (balance !== null && amount > balance) {
      setError('Недостаточно средств');
      return;
    }

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

      setMessage(data.message || `✅ Вывод ${amount} ₽ выполнен`);
      setBalance(data.newBalance);
      setWithdrawAmount('');
    } catch {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  }

  if (balance === null) {
    return (
      <main className="page-shell">
        <div className="glass-card stack" style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
          <p>Загрузка...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="glass-card stack" style={{ maxWidth: 480, margin: '0 auto' }}>
        <span className="badge">💳 Кошелёк</span>
        <h1 style={{ fontSize: 48, margin: '8px 0' }}>{balance} ₽</h1>
        <p className="muted">Текущий баланс</p>

        <hr style={{ borderColor: 'rgba(139,92,246,0.2)', margin: '16px 0' }} />

        {/* ✅ ПОПОЛНЕНИЕ */}
        <div className="stack" style={{ marginTop: 8 }}>
          <h3>💰 Пополнить баланс</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[100, 500, 1000, 5000].map((sum) => (
              <button
                key={sum}
                className="neon-button-outline"
                onClick={() => setDepositAmount(String(sum))}
                style={{ flex: 1, minWidth: 80 }}
              >
                +{sum} ₽
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Сумма"
              className="neon-input"
              min={1}
            />
            <button
              className="neon-button"
              onClick={handleDeposit}
              disabled={loading}
              style={{ minWidth: 120 }}
            >
              {loading ? '...' : 'Пополнить'}
            </button>
          </div>
        </div>

        <hr style={{ borderColor: 'rgba(139,92,246,0.2)', margin: '16px 0' }} />

        {/* ВЫВОД */}
        <div className="stack" style={{ marginTop: 8 }}>
          <h3>💸 Вывод средств</h3>
          <p className="muted" style={{ fontSize: 13 }}>Минимальная сумма: 100 ₽</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Сумма вывода"
              className="neon-input"
              min={100}
            />
            <button
              className="neon-button-outline"
              onClick={handleWithdraw}
              disabled={loading}
              style={{ minWidth: 120 }}
            >
              {loading ? '...' : 'Вывести'}
            </button>
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
          ⚠️ Демо-режим. Пополнение и вывод работают в тестовом режиме.
        </p>
      </div>
    </main>
  );
}