import Header from '@/components/Header';
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <>
      <Header simplified />
      <main className="auth-shell">
        <div className="auth-layout">
          <section className="auth-visual">
            <div className="auth-visual-copy stack">
              <span className="badge">Вход в систему</span>
              <div className="auth-brand-title">Нерв</div>
              <p>Возвращайтесь в тёмный контур заданий, голосований и рейтингов. Всё важное — на одном неоновом экране.</p>
            </div>
            <div className="nav-links" style={{ position: 'relative', zIndex: 1 }}>
              <span className="badge">24/7 арена</span>
              <span className="badge">Prisma DB</span>
              <span className="badge">Live voting</span>
            </div>
          </section>

          <section className="auth-panel stack">
            <span className="badge">Авторизация</span>
            <h1 style={{ fontSize: 'clamp(42px, 6vw, 66px)' }}>Добро пожаловать обратно</h1>
            <p>Введите email и пароль, чтобы открыть дашборд, задания и профиль.</p>
            <AuthForm mode="login" />
          </section>
        </div>
      </main>
    </>
  );
}
