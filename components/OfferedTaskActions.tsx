'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function OfferedTaskActions({ taskId }: { taskId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function respond(action: 'accept' | 'decline') {
    setLoading(true);
    await fetch(`/api/tasks/${taskId}/offer/respond`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="nav-links">
      <button className="neon-button" disabled={loading} onClick={() => respond('accept')}>Принять</button>
      <button className="neon-button-outline" disabled={loading} onClick={() => respond('decline')}>Отклонить</button>
    </div>
  );
}
