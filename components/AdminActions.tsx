'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export function BanButton({ userId, isBanned }: { userId: number; isBanned: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}/ban`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBanned: !isBanned }),
    });
    setLoading(false);
    router.refresh();
  }
  return <button className="neon-button-outline" onClick={toggle} disabled={loading}>{isBanned ? 'Разблокировать' : 'Заблокировать'}</button>;
}

export function BalanceForm({ userId }: { userId: number }) {
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await fetch(`/api/admin/users/${userId}/balance`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    event.currentTarget.reset();
    router.refresh();
  }
  return (
    <form className="nav-links" onSubmit={submit}>
      <input name="amount" type="number" placeholder="± сумма" style={{ width: 120 }} required />
      <input name="reason" placeholder="Причина" style={{ width: 160 }} />
      <button className="neon-button" type="submit">OK</button>
    </form>
  );
}

export function DeleteTaskButton({ taskId }: { taskId: number }) {
  const router = useRouter();
  async function remove() {
    if (!window.confirm('Удалить задание?')) return;
    await fetch(`/api/admin/tasks/${taskId}`, { method: 'DELETE' });
    router.refresh();
  }
  return <button className="neon-button-outline" onClick={remove}>Удалить</button>;
}
