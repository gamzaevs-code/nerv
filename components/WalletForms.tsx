'use client';

import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';

export function DepositForm() {
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const amount = new FormData(e.currentTarget).get('amount');
    const res = await fetch('/api/wallet/deposit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount }) });
    const data = await res.json();
    if (data.checkoutUrl) location.href = data.checkoutUrl;
    else alert(data.message || 'Заявка создана');
  }
  return <form className="form" onSubmit={submit}><input name="amount" type="number" min="1" placeholder="Сумма пополнения" required /><button className="neon-button">Пополнить через Stripe</button></form>;
}

export function WithdrawForm() {
  const router = useRouter();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const amount = new FormData(e.currentTarget).get('amount');
    await fetch('/api/wallet/withdraw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount }) });
    e.currentTarget.reset();
    router.refresh();
  }
  return <form className="form" onSubmit={submit}><input name="amount" type="number" min="1" placeholder="Сумма вывода" required /><button className="neon-button-outline">Запросить вывод</button></form>;
}
