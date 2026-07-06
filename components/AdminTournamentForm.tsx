'use client';
import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
export default function AdminTournamentForm() {
  const router = useRouter();
  async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const data = Object.fromEntries(new FormData(e.currentTarget).entries()); await fetch('/api/tournaments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); e.currentTarget.reset(); router.refresh(); }
  return <form className="form" onSubmit={submit}><input name="name" placeholder="Название" required /><textarea name="description" placeholder="Описание" /><input name="startDate" type="datetime-local" required /><input name="endDate" type="datetime-local" required /><input name="prizePool" type="number" placeholder="Призовой фонд" /><select name="status"><option value="upcoming">upcoming</option><option value="active">active</option><option value="finished">finished</option></select><button className="neon-button">Создать турнир</button></form>;
}
