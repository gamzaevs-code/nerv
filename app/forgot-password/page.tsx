import Header from '@/components/Header';
import ForgotPasswordForm from './ForgotPasswordForm';

export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
  return (
    <>
      <Header simplified />
      <main className="auth-shell">
        <section className="auth-layout">
          <div className="auth-visual">
            <span className="badge">Доступ к контуру</span>
            <div className="auth-visual-copy stack">
              <h1 className="auth-brand-title">Восстановление</h1>
              <p>Введите email — мы отправим одноразовую ссылку для сброса пароля.</p>
            </div>
          </div>
          <div className="auth-panel">
            <div className="auth-card stack">
              <span className="badge">Забыли пароль?</span>
              <h1 style={{ fontSize: 'clamp(42px, 6vw, 66px)' }}>Сброс пароля</h1>
              <ForgotPasswordForm />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
