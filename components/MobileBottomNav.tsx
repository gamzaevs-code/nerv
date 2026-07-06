'use client';

import Link from 'next/link';

export default function MobileBottomNav() {
  return <nav className="mobile-bottom-nav">
    <Link href="/dashboard">🏠<span>Дом</span></Link>
    <Link href="/tasks">📋<span>Задания</span></Link>
    <Link href="/voting">🗳️<span>Голос</span></Link>
    <Link href="/messages">💬<span>Чат</span></Link>
    <Link href="/profile">👤<span>Профиль</span></Link>
  </nav>;
}
