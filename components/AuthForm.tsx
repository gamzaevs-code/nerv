'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';

type Mode = 'login' | 'signup';

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isSignup = mode === 'signup';
  const checks = useMemo(() => [
    { label: '8 символов', ok: password.length >= 8 },
    { label: 'Заглавная буква', ok: /[A-ZА-ЯЁ]/.test(password) },
    { label: 'Цифра', ok: /\d/.test(password) },
  ], [password]);
  const score = checks.filter((check) => check.ok).length;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || 'Произошла ошибка. Попробуйте снова.');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Не удалось связаться с сервером.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form auth-form" onSubmit={onSubmit}>
      {isSignup && (
        <>
          <label>
            Имя
            <input className="neon-input" name="name" type="text" placeholder="Ваше имя" autoComplete="name" required />
          </label>
          <label>
            Роль
            <select className="neon-input" name="role" defaultValue="viewer">
              <option value="viewer">Зритель</option>
              <option value="player">Игрок</option>
            </select>
          </label>
        </>
      )}

      <label>
        Email
        <input className="neon-input" name="email" type="email" placeholder="you@nerv.local" autoComplete="email" required />
      </label>

      <label>
        Пароль
        <span className="password-input-wrap">
          <input
            className="neon-input"
            name="password"
            type={showPassword ? 'text' : 'password'}
            minLength={isSignup ? 8 : 6}
            placeholder={isSignup ? '8+ символов, A-Z и цифра' : 'Ваш пароль'}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            required
          />
          <button className="password-eye" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}>
            {showPassword ? '🙈' : '👁️'}
          </button>
        </span>
      </label>

      {isSignup && (
        <div className="password-meter" aria-label="Индикатор надежности пароля">
          <div className="password-meter-track">
            <div
              className={`password-meter-bar ${score === checks.length ? 'good' : ''}`}
              style={{ width: `${(score / checks.length) * 100}%` }}
            />
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
      )}

      {!isSignup && (
        <label>
          Код 2FA
          <input className="neon-input" name="twoFactorCode" inputMode="numeric" placeholder="Если включена двухфакторная защита" autoComplete="one-time-code" />
        </label>
      )}

      {isSignup && (
        <div className="two-grid auth-social-grid" style={{ marginTop: 0 }}>
          <label>
            Реферальный код
            <input className="neon-input" name="referralCode" placeholder="Необязательно" />
          </label>
          <label>
            Инвайт-код
            <input className="neon-input" name="inviteCode" placeholder="Если доступ закрыт" />
          </label>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {!isSignup && (
        <div className="two-grid auth-social-grid" style={{ marginTop: 0 }}>
          <a className="neon-button-outline" href="/api/auth/signin/google">Войти через Google</a>
          <a className="neon-button-outline" href="/api/auth/signin/github">Войти через GitHub</a>
        </div>
      )}

      <button className="neon-button auth-submit" type="submit" disabled={loading}>
        {loading ? 'Подождите...' : isSignup ? 'Создать аккаунт' : 'Войти в Нерв'}
      </button>

      {!isSignup && (
        <p className="muted">
          <Link className="neon-title" href="/forgot-password">Забыли пароль?</Link>
        </p>
      )}

      <p className="muted">
        {isSignup ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
        <Link className="neon-title" href={isSignup ? '/login' : '/signup'}>
          {isSignup ? 'Войти' : 'Зарегистрироваться'}
        </Link>
      </p>
    </form>
  );
}
