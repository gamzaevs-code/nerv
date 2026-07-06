'use client';

import { useRouter } from 'next/navigation';

export default function AdminReportActions({ id }: { id: number }) {
  const router = useRouter();
  async function act(action: 'resolve' | 'reject') {
    await fetch(`/api/admin/reports/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
    router.refresh();
  }
  return <div className="nav-links"><button className="neon-button" onClick={() => act('resolve')}>Принять</button><button className="neon-button-outline" onClick={() => act('reject')}>Отклонить</button></div>;
}
