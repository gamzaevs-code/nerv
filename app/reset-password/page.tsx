import Header from '@/components/Header';
import ResetPasswordForm from './ResetPasswordForm';

export const dynamic = 'force-dynamic';

export default function ResetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  return (
    <>
      <Header simplified />
      <main className="auth-shell">
        <section className="auth-layout">
          <div className="auth-visual">
            <span className="badge">Новый ключ</span>
            <div className="auth-visual-copy stack">
              <h1 className="auth-brand-title">Новый пароль</h1>
              <p>Придумайте надёжный пароль для входа в НЕРВ.</p>
            </div>
          </div>
          <div className="auth-panel">
            <div className="auth-card stack">
              <span className="badge">Сброс пароля</span>
              <h1 style={{ fontSize: 'clamp(42px, 6vw, 66px)' }}>Защитить аккаунт</h1>
              <ResetPasswordForm token={searchParams.token || ''} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
