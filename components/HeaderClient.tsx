'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useTheme } from '@/app/providers/ThemeProvider';
import LogoutButton from './LogoutButton';
import LanguageThemeControls from './LanguageThemeControls';
import NervLogo from './NervLogo';
import BackButton from './BackButton';

export default function HeaderClient({
  simplified = false,
  authenticated = false,
  role = null,
}: {
  simplified?: boolean;
  authenticated?: boolean;
  role?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const { toggleTheme } = useTheme();

  const renderMenu = () => {
    // Неавторизованный
    if (!authenticated || !role) {
      return (
        <>
          <Link className="neon-button-outline" href="/dashboard" onClick={() => setOpen(false)}>📊 Дашборд</Link>
          <LanguageThemeControls />
          <button className="neon-button-outline theme-toggle" type="button" onClick={toggleTheme} aria-label="Тёмный неоновый режим" title="Тёмный неоновый режим">✦</button>
          <Link className="neon-button-outline" href="/login" onClick={() => setOpen(false)}>🔑 Войти</Link>
          <Link className="neon-button" href="/signup" onClick={() => setOpen(false)}>📝 Зарегистрироваться</Link>
        </>
      );
    }

    // Общие пункты для всех авторизованных
    const commonItems = (
      <>
        <Link className="neon-button-outline" href="/dashboard" onClick={() => setOpen(false)}>📊 Дашборд</Link>
        <Link className="neon-button-outline" href="/leaderboard" onClick={() => setOpen(false)}>🏆 Рейтинг</Link>
        <Link className="neon-button-outline" href="/voting" onClick={() => setOpen(false)}>🗳️ Голосование</Link>
        <Link className="neon-button-outline" href="/live" onClick={() => setOpen(false)}>📡 Прямой эфир</Link>
      </>
    );

    // Пункты в зависимости от роли
    const roleItems = () => {
      switch (role) {
        case 'viewer':
          return (
            <>
              <Link className="neon-button nav-create-link" href="/create" onClick={() => setOpen(false)}>➕ Создать задание</Link>
              <Link className="neon-button-outline" href="/profile" onClick={() => setOpen(false)}>👤 Профиль</Link>
            </>
          );
        case 'player':
          return (
            <>
              <Link className="neon-button" href="/my-tasks" onClick={() => setOpen(false)}>📋 Мои задания</Link>
              <Link className="neon-button-outline" href="/profile" onClick={() => setOpen(false)}>👤 Профиль</Link>
            </>
          );
        case 'admin':
          return (
            <>
              <Link className="neon-button-outline" href="/admin" onClick={() => setOpen(false)}>⚙️ Админ-панель</Link>
              <Link className="neon-button nav-create-link" href="/create" onClick={() => setOpen(false)}>➕ Создать задание</Link>
            </>
          );
        default:
          return (
            <Link className="neon-button-outline" href="/profile" onClick={() => setOpen(false)}>👤 Профиль</Link>
          );
      }
    };

    return (
      <>
        {commonItems}
        <LanguageThemeControls />
        <button className="neon-button-outline theme-toggle" type="button" onClick={toggleTheme} aria-label="Тёмный неоновый режим" title="Тёмный неоновый режим">✦</button>
        {roleItems()}
        <LogoutButton />
      </>
    );
  };

  if (simplified) {
    return (
      <motion.header className="container nav neon-header simplified-header" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
        <Link className="logo" href="/dashboard" aria-label="НЕРВ — дашборд"><NervLogo /></Link>
        <nav className="nav-links simplified-nav"><BackButton /></nav>
      </motion.header>
    );
  }

  return (
    <motion.header className="container nav neon-header" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
      <Link className="logo" href="/" aria-label="НЕРВ — главная"><NervLogo /></Link>
      <button className="burger-button" type="button" onClick={() => setOpen((value) => !value)} aria-label="Открыть меню" aria-expanded={open}>
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.18 }}>{open ? '✕' : '☰'}</motion.span>
      </button>
      <nav className="nav-links desktop-nav">{renderMenu()}</nav>
      <AnimatePresence>
        {open && (
          <motion.nav
            className="mobile-menu glass-card neon-border"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {renderMenu()}
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}