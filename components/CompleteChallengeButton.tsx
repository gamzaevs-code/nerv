'use client';

import { useRouter } from 'next/navigation';

export default function CompleteChallengeButton({ id }: { id: number }) {
  const router = useRouter();
  return <button className="neon-button" onClick={async () => { const r = await fetch(`/api/challenges/${id}/complete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }); alert(r.ok ? 'Челлендж выполнен!' : 'Нельзя выполнить повторно в этом периоде'); router.refresh(); }}>Выполнить</button>;
}
