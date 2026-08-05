'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ResendVerificationForm from './ResendVerificationForm';

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  // ✅ ОТЛАДКА: выводим токен в консоль
  console.log('🔑 Token from URL:', token);
  console.log('🔗 URL:', typeof window !== 'undefined' ? window.location.href : 'SSR');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Токен не указан. Запросите новое письмо с ссылкой подтверждения.');
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

  // ✅ Если токена нет — предлагаем форму повторной отправки
  if (!token) {
    return (
      <div className="stack" style={{ textAlign: 'center', padding: '40px 20px', width: '100%' }}>
        <div className="badge" style={{ margin: '0 auto' }}>⚠️</div>
        <h1>Подтвердите email</h1>
        <p className="muted">
          Для подтверждения перейдите по ссылке из письма.
          Если письмо не пришло — отправьте новое:
        </p>
        <div className="glass-card stack" style={{ width: '100%', textAlign: 'left' }}>
          <ResendVerificationForm />
        </div>
        <Link className="neon-button-outline" href="/login" style={{ marginTop: 16 }}>
          🔑 На страницу входа
        </Link>
      </div>
    );
  }

  return (
    <div className="stack" style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div className="badge" style={{ margin: '0 auto' }}>
        {status === 'loading' ? '⏳' : status === 'success' ? '✅' : '❌'}
      </div>
      <h1>
        {status === 'loading' ? 'Подтверждение...' : status === 'success' ? 'Email подтверждён!' : 'Ошибка'}
      </h1>
      <p>{message}</p>

      {status === 'loading' && <p className="muted">Обрабатываем запрос...</p>}

      {status === 'success' && (
        <Link className="neon-button" href="/dashboard">🚀 Войти в систему</Link>
      )}

      {status === 'error' && (
        <div className="stack" style={{ width: '100%' }}>
          <div className="glass-card stack" style={{ width: '100%', textAlign: 'left' }}>
            <ResendVerificationForm />
          </div>
          <Link className="neon-button-outline" href="/login">🔑 На страницу входа</Link>
        </div>
      )}
    </div>
  );
}