'use client';
import { useRouter } from 'next/navigation';
export default function DailyBonusButton() { const router = useRouter(); return <button className="neon-button" onClick={async () => { const r = await fetch('/api/daily-bonus/claim', { method: 'POST' }); alert(r.ok ? '+50 ₽ получено' : 'Бонус уже получен'); router.refresh(); }}>Получить ежедневный бонус</button>; }
