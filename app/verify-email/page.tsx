import { Suspense } from 'react';
import HeaderWrapper from '@/components/HeaderWrapper';
import VerifyEmailClient from './VerifyEmailClient';

export default function VerifyEmailPage() {
  return (
    <>
      <HeaderWrapper simplified />
      <main className="auth-shell">
        <div className="auth-layout" style={{ gridTemplateColumns: '1fr', maxWidth: 500, margin: '0 auto' }}>
          <section className="auth-panel stack" style={{ textAlign: 'center' }}>
            <Suspense fallback={
              <>
                <div className="badge" style={{ margin: '0 auto' }}>Проверка</div>
                <h1>Подтверждение email</h1>
                <p>Проверяем токен...</p>
              </>
            }>
              <VerifyEmailClient />
            </Suspense>
          </section>
        </div>
      </main>
    </>
  );
}
