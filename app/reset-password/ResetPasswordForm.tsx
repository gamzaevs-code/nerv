'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const checks = useMemo(() => [
    { label: '8 символов', ok: password.length >= 8 },
    { label: 'Заглавная буква', ok: /[A-ZА-ЯЁ]/.test(password) },
    { label: 'Цифра', ok: /\d/.test(password) },
  ], [password]);
  const score = checks.filter((check) => check.ok).length;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || 'Не удалось обновить пароль.');
        return;
      }
      setMessage(data?.message || 'Пароль обновлён.');
    } catch {
      setError('Не удалось связаться с сервером.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return <div className="error">Ссылка сброса некорректна. Запросите восстановление ещё раз.</div>;
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        Новый пароль
        <span className="password-input-wrap">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            minLength={8}
            placeholder="8+ символов, A-Z и цифра"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            required
          />
          <button className="password-eye" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}>
            {showPassword ? '🙈' : '👁️'}
          </button>
        </span>
      </label>

      <div className="password-meter" aria-label="Индикатор надежности пароля">
        <div className="password-meter-track">
          <div className={`password-meter-bar ${score === checks.length ? 'good' : ''}`} style={{ width: `${(score / checks.length) * 100}%` }} />
        </div>
        <div className="password-checks">
          {checks.map((check) => (
            <span className={`password-check ${check.ok ? 'ok' : ''}`} key={check.label}>
              <span className="password-check-dot" />
              {check.label}
            </span>
          ))}
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
      <button className="neon-button" type="submit" disabled={loading}>{loading ? 'Сохраняем...' : 'Сохранить пароль'}</button>
      <p className="muted"><Link className="neon-title" href="/login">Перейти ко входу</Link></p>
    </form>
  );
}
