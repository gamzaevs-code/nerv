import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="page-shell">
      <div className="glass-card stack" style={{ maxWidth: 600, margin: '120px auto', textAlign: 'center' }}>
        <span className="badge">НЕРВ</span>
        <h1 className="neon-text" style={{ fontSize: 48, margin: '16px 0' }}>Добро пожаловать</h1>
        <p>Технологичная игровая платформа заданий, голосований и наград.</p>
        
        {user ? (
          <div className="nav-links" style={{ marginTop: 24 }}>
            <Link className="neon-button" href="/dashboard">🚀 Войти в систему</Link>
            <Link className="neon-button-outline" href="/profile">👤 Профиль</Link>
          </div>
        ) : (
          <div className="nav-links" style={{ marginTop: 24 }}>
            <Link className="neon-button" href="/login">🔑 Войти</Link>
            <Link className="neon-button-outline" href="/signup">📝 Регистрация</Link>
          </div>
        )}
      </div>
    </main>
  );
}