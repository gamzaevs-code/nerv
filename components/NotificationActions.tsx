'use client';

import { useRouter } from 'next/navigation';

export default function NotificationActions({ id }: { id: number }) {
  const router = useRouter();

  async function markRead() {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    router.refresh();
  }

  async function remove() {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="nav-links">
      <button className="neon-button-outline" type="button" onClick={markRead}>Прочитано</button>
      <button className="neon-button-outline" type="button" onClick={remove}>Удалить</button>
    </div>
  );
}
