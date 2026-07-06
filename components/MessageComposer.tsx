'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function MessageComposer({ toUserId }: { toUserId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(event.currentTarget);
    const text = String(formData.get('text') || '');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId, text }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || 'Не удалось отправить сообщение.');
        return;
      }
      event.currentTarget.reset();
      router.refresh();
    } catch {
      setError('Ошибка сети.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <textarea name="text" placeholder="Написать сообщение..." required />
      {error && <div className="error">{error}</div>}
      <button className="neon-button" type="submit" disabled={loading}>{loading ? 'Отправка...' : 'Отправить'}</button>
    </form>
  );
}
