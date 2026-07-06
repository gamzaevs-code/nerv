import Header from '@/components/Header';
import NervLogo from '@/components/NervLogo';

export default function HomePage() {
  return (
    <>
      <Header simplified={false} />
      <main className="container home-neon-shell">
        <section className="minimal-hero neon-border glass-card">
          <div className="minimal-logo-orb" aria-hidden="true">
            <NervLogo compact />
          </div>
          <h1 className="neon-text home-title">НЕРВ</h1>
          <p className="home-slogan neon-text">Живой пульс системы</p>
          <div className="home-neon-rings" aria-hidden="true" />
        </section>
      </main>
    </>
  );
}
