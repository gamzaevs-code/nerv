'use client';

import { useState } from 'react';

export default function ReportButton({ targetType, targetId }: { targetType: 'user' | 'task'; targetId: number }) {
  const [sent, setSent] = useState(false);
  async function send() {
    const reason = window.prompt('Причина жалобы');
    if (!reason) return;
    const response = await fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetType, targetId, reason }) });
    setSent(response.ok);
  }
  return <button className="neon-button-outline" onClick={send}>{sent ? 'Жалоба отправлена' : 'Пожаловаться'}</button>;
}
