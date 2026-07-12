'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Токен не указан.');
      return;
    }

    fetch(`/api/auth/verify?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Email подтверждён!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Ошибка подтверждения.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Ошибка сети.');
      });
  }, [token]);

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="badge">{status === 'loading' ? '⏳' : status === 'success' ? '✅' : '❌'}</div>
      <h1>{status === 'loading' ? 'Подтверждение...' : status === 'success' ? 'Email подтверждён!' : 'Ошибка'}</h1>
      <p>{message}</p>
      {status === 'success' && <Link className="neon-button" href="/dashboard">Войти</Link>}
    </div>
  );
}