'use client';

import { useEffect, useState } from 'react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from(rawData.split('').map((char) => char.charCodeAt(0)));
}

export default function PushSettings() {
  const [status, setStatus] = useState('');
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ tasks: true, videos: true, votes: true, messages: true });

  useEffect(() => {
    const saved = localStorage.getItem('nerv-push-prefs');
    if (saved) setPrefs(JSON.parse(saved));
  }, []);

  function toggle(key: string) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    localStorage.setItem('nerv-push-prefs', JSON.stringify(next));
  }

  async function subscribe() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('Push не поддерживается этим браузером.');
      return;
    }
    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!key) {
      setStatus('NEXT_PUBLIC_VAPID_PUBLIC_KEY не настроен.');
      return;
    }
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) });
    await fetch('/api/push/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(subscription) });
    setStatus('Push-уведомления включены.');
  }

  return (
    <div className="stack">
      {Object.entries({ tasks: 'Новые задания', videos: 'Загрузка видео', votes: 'Итоги голосования', messages: 'Сообщения' }).map(([key, label]) => (
        <label key={key} className="nav-links"><input type="checkbox" checked={!!prefs[key]} onChange={() => toggle(key)} style={{ width: 22 }} /> {label}</label>
      ))}
      <button className="neon-button" onClick={subscribe}>Включить Web Push</button>
      {status && <p>{status}</p>}
    </div>
  );
}
