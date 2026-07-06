'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function LiveCreateForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    try {
      const response = await fetch('/api/live/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || 'Не удалось запустить эфир.');
        return;
      }
      router.push(`/live/${data.stream.id}`);
      router.refresh();
    } catch {
      setError('Ошибка сети.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>Название<input name="title" placeholder="Например: Ночной челлендж" required /></label>
      <label>Описание<textarea name="description" placeholder="Кратко опишите эфир" /></label>
      <label>Playback URL<input name="playbackUrl" placeholder="Mux/Cloudflare iframe или HLS player URL — необязательно" /></label>
      {error && <div className="error">{error}</div>}
      <button className="neon-button" disabled={loading}>{loading ? 'Запускаем...' : 'Начать прямой эфир'}</button>
    </form>
  );
}
