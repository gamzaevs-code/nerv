'use client';
import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
export default function AdminTranslationForm() { const router = useRouter(); async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); await fetch('/api/admin/translations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget).entries())) }); e.currentTarget.reset(); router.refresh(); } return <form className="form" onSubmit={submit}><select name="locale"><option value="ru">ru</option><option value="en">en</option></select><input name="key" placeholder="key" required /><input name="value" placeholder="value" required /><button className="neon-button">Сохранить перевод</button></form>; }
