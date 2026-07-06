'use client';

import { useState } from 'react';

export default function PresenceSettings({ enabled }: { enabled: boolean }) {
  const [checked, setChecked] = useState(enabled);
  const [status, setStatus] = useState('');

  async function toggle() {
    const next = !checked;
    setChecked(next);
    setStatus('Сохраняем...');
    const res = await fetch('/api/presence/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: next }) });
    setStatus(res.ok ? 'Настройка сохранена.' : 'Не удалось сохранить настройку.');
  }

  return (
    <div className="glass-card stack">
      <h2 className="neon-text">Онлайн-уведомления</h2>
      <label className="nav-links" style={{ justifyContent: 'space-between' }}>
        <span>Уведомления о входе игроков</span>
        <input type="checkbox" checked={checked} onChange={toggle} style={{ width: 24 }} />
      </label>
      {status && <p className="muted">{status}</p>}
    </div>
  );
}
