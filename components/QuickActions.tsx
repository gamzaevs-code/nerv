'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

function saveAction(label: string) {
  const key = 'nerv-last-actions';
  const prev = JSON.parse(localStorage.getItem(key) || '[]') as string[];
  localStorage.setItem(key, JSON.stringify([`${new Date().toLocaleTimeString()} ${label}`, ...prev].slice(0, 8)));
}

export default function QuickActions({ role }: { role: string }) {
  const router = useRouter();
  const [depositOpen, setDepositOpen] = useState(false);

  async function randomTask() {
    saveAction('Случайное задание');
    const res = await fetch('/api/tasks?sort=new');
    const data = await res.json();
    const tasks = data.tasks || [];
    if (!tasks.length) return router.push('/tasks');
    const task = tasks[Math.floor(Math.random() * tasks.length)];
    router.push(`/task/${task.id}`);
  }

  async function deposit(amount: number) {
    saveAction(`Пополнение ${amount}`);
    const res = await fetch('/api/wallet/deposit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount }) });
    const data = await res.json();
    if (data.checkoutUrl) location.href = data.checkoutUrl;
    else alert(data.message || 'Заявка создана');
  }

  return <section className="glass-card stack">
    <span className="badge">Быстрые действия</span>
    <div className="nav-links">
      {role === 'player' ? <button className="neon-button" onClick={randomTask}>🎮 Взять случайное задание</button> : <button className="neon-button" onClick={() => { saveAction('Создать задание'); router.push('/create'); }}>✏️ Создать задание</button>}
      <button className="neon-button-outline" onClick={() => setDepositOpen(true)}>💰 Пополнить баланс</button>
      <button className="neon-button-outline" onClick={() => { saveAction('Голосовать'); router.push('/voting'); }}>🗳️ Голосовать</button>
    </div>
    {depositOpen && <div className="glass-card stack"><b>Выберите сумму</b><div className="nav-links">{[100, 500, 1000].map((amount) => <button key={amount} className="neon-button" onClick={() => deposit(amount)}>{amount} ₽</button>)}<button className="neon-button-outline" onClick={() => setDepositOpen(false)}>Закрыть</button></div></div>}
  </section>;
}
