'use client';

import { useRouter } from 'next/navigation';
export default function JoinTournamentButton({ id }: { id: number }) {
  const router = useRouter();
  return <button className="neon-button" onClick={async () => { await fetch(`/api/tournaments/${id}/join`, { method: 'POST' }); router.refresh(); }}>Участвовать</button>;
}
