import { redirect } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import PresenceSettings from '@/components/PresenceSettings';
import SoundSettings from '@/components/SoundSettings';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <>
      <Header simplified />
      <main className="page-shell">
        <section className="glass-card stack">
          <span className="badge">Settings / Preferences</span>
          <h1>⚙️ Настройки</h1>
          <p>Управляйте профилем, уведомлениями, звуками и безопасностью.</p>
        </section>

        {/* Настройки профиля */}
        <section className="glass-card stack" style={{ marginTop: 18 }}>
          <h2 className="neon-title">👤 Настройки профиля</h2>
          <p className="muted">Имя, город, био и аватар</p>
          <div className="nav-links" style={{ marginTop: 8 }}>
            <Link className="neon-button-outline" href="/profile/edit">✏️ Редактировать профиль</Link>
            <Link className="neon-button-outline" href="/profile/export">📥 Экспорт данных</Link>
          </div>
          <form
            action="/api/profile/avatar"
            method="POST"
            encType="multipart/form-data"
            className="form"
            style={{ marginTop: 12 }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="file" name="avatar" accept="image/*" required style={{ flex: 1, minHeight: 44 }} />
              <button className="neon-button" type="submit" style={{ minHeight: 44 }}>📷 Сменить аватар</button>
            </div>
          </form>
        </section>

        {/* Уведомления */}
        <section className="glass-card stack" style={{ marginTop: 18 }}>
          <h2 className="neon-title">🔔 Уведомления</h2>
          <p className="muted">Управление push-уведомлениями и оповещениями</p>
          <div className="nav-links" style={{ marginTop: 8 }}>
            <Link className="neon-button-outline" href="/settings/notifications">⚙️ Настроить уведомления</Link>
            <Link className="neon-button-outline" href="/settings/telegram">📱 Telegram</Link>
          </div>
        </section>

        {/* Микро-интеракции */}
        <section className="glass-card stack" style={{ marginTop: 18 }}>
          <h2 className="neon-title">🔊 Микро-интеракции</h2>
          <p className="muted">Звуки, вибрация и тактильный отклик</p>
          <div className="stack" style={{ marginTop: 8 }}>
            <SoundSettings />
          </div>
        </section>

        {/* Конфиденциальность */}
        <section className="glass-card stack" style={{ marginTop: 18 }}>
          <h2 className="neon-title">🔒 Конфиденциальность</h2>
          <p className="muted">Онлайн-статус, предложения заданий</p>
          <div className="stack" style={{ marginTop: 8 }}>
            <PresenceSettings />
          </div>
        </section>

        {/* Безопасность */}
        <section className="glass-card stack" style={{ marginTop: 18 }}>
          <h2 className="neon-title">🛡️ Безопасность</h2>
          <p className="muted">Пароль, двухфакторная аутентификация</p>
          <div className="nav-links" style={{ marginTop: 8 }}>
            <Link className="neon-button-outline" href="/settings/security">🔑 Сменить пароль и 2FA</Link>
            <Link className="neon-button-outline" href="/settings/logs">📋 Логи активности</Link>
          </div>
        </section>

        {/* Кнопка назад */}
        <div className="nav-links" style={{ marginTop: 24, justifyContent: 'center' }}>
          <Link className="neon-button" href="/profile">← Назад в профиль</Link>
        </div>
      </main>
    </>
  );
}