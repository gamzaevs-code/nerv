'use client';

import { FormEvent, useState } from 'react';

interface Props {
  email: string;
}

export default function ResendVerificationForm({ email }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');

    await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    setStatus('sent');
  }

  return (
    <form onSubmit={onSubmit}>
      <input type="hidden" name="email" value={email} />
      <button
        type="submit"
        className="neon-button"
        style={{ marginTop: 16 }}
        disabled={status === 'sending'}
      >
        {status === 'sending'
          ? 'Отправляем...'
          : status === 'sent'
            ? '✓ Отправлено'
            : 'Отправить письмо повторно'}
      </button>
    </form>
  );
}
