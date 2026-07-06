'use client';

import { useNervSound } from '@/app/providers/SoundProvider';

export default function SoundSettings() {
  const { soundsEnabled, hapticsEnabled, setSoundsEnabled, setHapticsEnabled } = useNervSound();
  return (
    <div className="glass-card stack">
      <h2 className="neon-text">Микро-интеракции</h2>
      <label className="nav-links" style={{ justifyContent: 'space-between' }}>
        <span>Звуки</span>
        <input type="checkbox" checked={soundsEnabled} onChange={(event) => setSoundsEnabled(event.target.checked)} style={{ width: 24 }} />
      </label>
      <label className="nav-links" style={{ justifyContent: 'space-between' }}>
        <span>Вибрация</span>
        <input type="checkbox" checked={hapticsEnabled} onChange={(event) => setHapticsEnabled(event.target.checked)} style={{ width: 24 }} />
      </label>
    </div>
  );
}
