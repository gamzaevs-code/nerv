import Header from '@/components/Header';
import AuthForm from '@/components/AuthForm';

export default function SignupPage() {
  return (
    <>
      <Header simplified />
      <main className="auth-shell">
        <div className="auth-layout">
          <section className="auth-visual">
            <div className="auth-visual-copy stack">
              <span className="badge">Создание доступа</span>
              <div className="auth-brand-title">Нерв</div>
              <p>Регистрация в игровой системе с тёмной эстетикой, фиолетовым неоном и контролем над каждым действием.</p>
            </div>
            <div className="nav-links" style={{ position: 'relative', zIndex: 1 }}>
              <span className="badge">Viewer</span>
              <span className="badge">Player</span>
              <span className="badge">Rating</span>
            </div>
          </section>

          <section className="auth-panel stack">
            <span className="badge">Регистрация</span>
            <h1 style={{ fontSize: 'clamp(42px, 6vw, 66px)' }}>Создать аккаунт</h1>
            <p>Выберите роль, задайте сильный пароль и подключайтесь к контуру «Нерва».</p>
            <AuthForm mode="signup" />
          </section>
        </div>
      </main>
    </>
  );
}
