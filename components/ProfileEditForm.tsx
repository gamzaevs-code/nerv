'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

type Profile = { name: string; bio: string | null; location: string | null };

export default function ProfileEditForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || 'Не удалось обновить профиль.');
        return;
      }
      setMessage('Профиль обновлён.');
      router.refresh();
    } catch {
      setError('Ошибка сети.');
    } finally {
      setLoading(false);
    }
  }

  async function onAvatar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/profile/avatar', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || 'Не удалось загрузить аватарку.');
        return;
      }
      setMessage('Аватарка обновлена.');
      router.refresh();
    } catch {
      setError('Ошибка сети.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <form className="form" onSubmit={onSubmit}>
        <label>Имя<input name="name" defaultValue={profile.name} required /></label>
        <label>О себе<textarea name="bio" defaultValue={profile.bio || ''} placeholder="Расскажите о себе" /></label>
        <label>Город<input name="location" defaultValue={profile.location || ''} placeholder="Москва" /></label>
        <button className="neon-button" disabled={loading} type="submit">Сохранить профиль</button>
      </form>
      <form className="form" onSubmit={onAvatar}>
        <label>Аватарка<input name="avatar" type="file" accept="image/*" required /></label>
        <button className="neon-button-outline" disabled={loading} type="submit">Загрузить аватарку</button>
      </form>
      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
