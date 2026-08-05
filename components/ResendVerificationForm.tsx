'use client';

import { FormEvent, useState } from 'react';

interface Props {
  email?: string; // необязательный — если email неизвестен, покажем поле для ввода
}

export default function ResendVerificationForm({ email }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setMessage('');

    const formData = new FormData(e.currentTarget);
    const emailValue = email || (formData.get('email') as string);

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue }),
      });
      const data = await res.json();
      setMessage(data.message || (res.ok ? 'Письмо отправлено повторно.' : 'Не удалось отправить.'));
      setStatus('sent');
    } catch {
      setMessage('Ошибка сети. Попробуйте позже.');
      setStatus('idle');
    }
  }

  return (
    <form onSubmit={onSubmit} className="stack" style={{ gap: 8 }}>
      {!email && (
        <input
          name="email"
          type="email"
          placeholder="Ваш email"
          required
          className="neon-input"
        />
      )}
      <button
        type="submit"
        className="neon-button"
        disabled={status === 'sending'}
      >
        {status === 'sending'
          ? 'Отправляем...'
          : status === 'sent'
            ? '✓ Отправлено'
            : 'Отправить ссылку повторно'}
      </button>
      {message && <p className="muted" style={{ margin: 0 }}>{message}</p>}
    </form>
  );
}