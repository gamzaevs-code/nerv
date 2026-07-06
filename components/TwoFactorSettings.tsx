'use client';

import { useState } from 'react';

export default function TwoFactorSettings({ enabled }: { enabled: boolean }) {
  const [qrCode, setQrCode] = useState('');
  const [token, setToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [status, setStatus] = useState(enabled ? '2FA включена.' : '2FA выключена.');

  async function setup() {
    const res = await fetch('/api/auth/2fa/setup', { method: 'POST' });
    const data = await res.json();
    if (res.ok) { setQrCode(data.qrCode); setStatus('Отсканируйте QR-код и введите код из приложения.'); }
    else setStatus(data?.error || 'Ошибка настройки 2FA.');
  }
  async function verify() {
    const res = await fetch('/api/auth/2fa/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
    const data = await res.json();
    if (res.ok) { setBackupCodes(data.backupCodes || []); setStatus('2FA включена. Сохраните резервные коды.'); }
    else setStatus(data?.error || 'Ошибка проверки кода.');
  }
  async function disable() {
    const res = await fetch('/api/auth/2fa/disable', { method: 'POST' });
    setStatus(res.ok ? '2FA отключена.' : 'Не удалось отключить 2FA.');
    setQrCode(''); setBackupCodes([]);
  }

  return (
    <div className="glass-card stack">
      <h2 className="neon-text">Двухфакторная аутентификация</h2>
      <p className="muted">{status}</p>
      {qrCode && <img src={qrCode} alt="2FA QR" style={{ width: 220, borderRadius: 16 }} />}
      {qrCode && <label>Код из приложения<input value={token} onChange={(e) => setToken(e.target.value)} inputMode="numeric" /></label>}
      {backupCodes.length > 0 && <code className="code-block">{backupCodes.join('\n')}</code>}
      <div className="nav-links">
        <button className="neon-button" type="button" onClick={setup}>Настроить 2FA</button>
        {qrCode && <button className="neon-button" type="button" onClick={verify}>Подтвердить</button>}
        <button className="neon-button-outline" type="button" onClick={disable}>Отключить</button>
      </div>
    </div>
  );
}
