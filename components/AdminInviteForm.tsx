'use client';
import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
export default function AdminInviteForm() { const router = useRouter(); async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); await fetch('/api/admin/invites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget).entries())) }); e.currentTarget.reset(); router.refresh(); } return <form className="form" onSubmit={submit}><input name="code" placeholder="Код (пусто = auto)" /><input name="maxUses" type="number" min="1" defaultValue="1" /><input name="expiresAt" type="datetime-local" /><button className="neon-button">Создать инвайт</button></form>; }
