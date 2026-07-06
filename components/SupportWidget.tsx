'use client';

import { FormEvent, useEffect, useState } from 'react';

type Msg = { id: number; message: string; isFromAdmin: boolean };

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);

  async function load() {
    const res = await fetch('/api/support/messages');
    if (res.ok) setMessages(await res.json());
  }

  useEffect(() => {
    if (!open) return;
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [open]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const message = new FormData(form).get('message');
    await fetch('/api/support/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) });
    form.reset();
    load();
  }

  return <div style={{ position: 'fixed', right: 18, bottom: 18, zIndex: 50 }}>
    {open && <div className="glass-card stack" style={{ width: 320, maxWidth: 'calc(100vw - 36px)', marginBottom: 12 }}>
      <b className="neon-title">Поддержка</b>
      <div className="stack" style={{ maxHeight: 260, overflow: 'auto' }}>{messages.map(m => <p key={m.id} style={{ color: m.isFromAdmin ? '#00E5FF' : '#fff' }}>{m.isFromAdmin ? 'Support: ' : 'Вы: '}{m.message}</p>)}</div>
      <form className="form" onSubmit={submit}><input name="message" placeholder="Сообщение" required /><button className="neon-button">Отправить</button></form>
    </div>}
    <button className="neon-button" onClick={() => setOpen(!open)}>💬 Support</button>
  </div>;
}
