'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Проверяем токен...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Токен не указан в ссылке.');
      return;
    }

    fetch(`/api/auth/verify?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setStatus('success');
          setMessage(data.message || 'Email успешно подтверждён!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Не удалось подтвердить email.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Ошибка при проверке токена.');
      });
  }, [token]);

  return (
    <>
      {status === 'loading' && (
        <>
          <div className="badge" style={{ margin: '0 auto' }}>Проверка</div>
          <h1>Подтверждение email</h1>
          <p>{message}</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div className="badge success" style={{ margin: '0 auto' }}>✓ Подтверждён</div>
          <h1 className="neon-title">Email подтверждён!</h1>
          <p>{message}</p>
          <button className="neon-button" onClick={() => router.push('/')} style={{ marginTop: 20 }}>
            На главную
          </button>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="badge" style={{ margin: '0 auto', borderColor: 'var(--danger)', color: 'var(--danger)' }}>✗ Ошибка</div>
          <h1>Неверный или истёкший токен</h1>
          <p>{message}</p>
          {email && (
            <button
              className="neon-button-outline"
              onClick={async () => {
                await fetch('/api/auth/resend-verification', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email }),
                });
                setMessage('Письмо отправлено повторно! Проверьте почту.');
              }}
              style={{ marginTop: 20 }}
            >
              Отправить повторно
            </button>
          )}
        </>
      )}
    </>
  );
}
