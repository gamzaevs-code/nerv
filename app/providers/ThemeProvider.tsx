'use client';

import { createContext, useContext, useEffect, useMemo } from 'react';

type Theme = 'dark';
type ThemeContextValue = { theme: Theme; setTheme: (theme: Theme) => void; toggleTheme: () => void };

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    localStorage.setItem('nerv-theme', 'dark');
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.style.colorScheme = 'dark';
  }, []);

  function setTheme() {
    localStorage.setItem('nerv-theme', 'dark');
    document.documentElement.dataset.theme = 'dark';
    window.dispatchEvent(new CustomEvent('nerv-theme-change', { detail: 'dark' }));
  }

  const value = useMemo<ThemeContextValue>(() => ({ theme: 'dark', setTheme, toggleTheme: setTheme }), []);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
