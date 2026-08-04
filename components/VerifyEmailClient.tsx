'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  // ✅ ОТЛАДКА: выводим токен в консоль
  console.log('🔑 Token from URL:', token);
  console.log('🔗 Full URL:', typeof window !== 'undefined' ? window.location.href : 'SSR');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Токен не указан. Проверьте ссылку в письме.');
      return;
    }

    fetch(`/api/auth/verify?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Email успешно подтверждён!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Не удалось подтвердить email.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Ошибка сети. Попробуйте позже.');
      });
  }, [token]);

  return (
    <div className="stack" style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div className="badge" style={{ margin: '0 auto' }}>
        {status === 'loading' ? '⏳' : status === 'success' ? '✅' : '❌'}
      </div>
      <h1>
        {status === 'loading' ? 'Подтверждение...' : status === 'success' ? 'Email подтверждён!' : 'Ошибка'}
      </h1>
      <p>{message}</p>
      {status === 'success' && (
        <Link className="neon-button" href="/dashboard">🚀 Войти в систему</Link>
      )}
      {status === 'error' && (
        <Link className="neon-button-outline" href="/login">🔑 На страницу входа</Link>
      )}
    </div>
  );
}