'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function CreateTaskForm() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || 'Не удалось создать задание.');
        return;
      }

      event.currentTarget.reset();
      setMessage('Задание создано и доступно игрокам.');
      router.refresh();
    } catch {
      setError('Не удалось связаться с сервером.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        Название
        <input name="title" placeholder="Пробежать 1 км" required />
      </label>
      <label>
        Описание
        <textarea name="description" placeholder="Опиши условия задания" />
      </label>
      <label>
        Награда
        <input name="reward" type="number" min="1" step="1" defaultValue="100" required />
      </label>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
      <button className="neon-button" disabled={loading} type="submit">
        {loading ? 'Создаём...' : 'Создать задание'}
      </button>
    </form>
  );
}
