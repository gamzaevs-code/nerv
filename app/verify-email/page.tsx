import { Suspense } from 'react';
import VerifyEmailClient from '@/components/VerifyEmailClient';

export default function VerifyEmailPage() {
  return (
    <main className="auth-shell">
      <div className="auth-layout" style={{ gridTemplateColumns: '1fr', maxWidth: 500, margin: '0 auto' }}>
        <section className="auth-panel stack">
          <Suspense fallback={<p>Загрузка...</p>}>
            <VerifyEmailClient />
          </Suspense>
        </section>
      </div>
    </main>
  );
}