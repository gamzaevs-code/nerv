'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || 'Не удалось отправить письмо.');
        return;
      }
      setMessage(data?.message || 'Проверьте почту.');
    } catch {
      setError('Не удалось связаться с сервером.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        Email
        <input name="email" type="email" placeholder="you@nerv.local" autoComplete="email" required />
      </label>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
      <button className="neon-button" type="submit" disabled={loading}>{loading ? 'Отправляем...' : 'Отправить ссылку'}</button>
      <p className="muted"><Link className="neon-title" href="/login">Вернуться ко входу</Link></p>
    </form>
  );
}
