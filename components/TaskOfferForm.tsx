'use client';

import { FormEvent, useState } from 'react';

export default function TaskOfferForm({ playerId }: { playerId: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    try {
      const response = await fetch(`/api/player/${playerId}/offer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || 'Не удалось предложить задание.');
        return;
      }
      setMessage('Задание отправлено игроку.');
      event.currentTarget.reset();
    } catch {
      setError('Ошибка сети.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <button className="neon-button" type="button" onClick={() => setOpen((value) => !value)}>Предложить задание</button>
      {open && (
        <form className="form glass-card" onSubmit={onSubmit}>
          <label>Название<input name="title" required /></label>
          <label>Описание<textarea name="description" /></label>
          <label>Награда<input name="reward" type="number" min="1" required /></label>
          <label>Срок выполнения<input name="deadlineAt" type="datetime-local" /></label>
          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}
          <button className="neon-button" disabled={loading}>{loading ? 'Отправляем...' : 'Отправить предложение'}</button>
        </form>
      )}
    </div>
  );
}
