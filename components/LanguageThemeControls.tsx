'use client';

import { useEffect, useRef, useState } from 'react';

export default function LanguageThemeControls() {
  const [lang, setLang] = useState('ru');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLang(localStorage.getItem('nerv-lang') || 'ru');
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function changeLang(value: string) {
    setLang(value);
    localStorage.setItem('nerv-lang', value);
    setOpen(false);
  }

  return (
    <div className="lang-switch" ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="lang-btn"
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Язык"
        style={{
          background: 'none',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: 6,
          padding: '2px 6px',
          fontSize: 13,
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.7)',
          lineHeight: 1.4,
        }}
      >
        🌐 {lang.toUpperCase()}
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 4,
            background: '#1a1a2e',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: 8,
            padding: 4,
            zIndex: 100,
            minWidth: 60,
          }}
        >
          <button
            type="button"
            onClick={() => changeLang('ru')}
            style={{
              display: 'block',
              width: '100%',
              background: lang === 'ru' ? 'rgba(139,92,246,0.2)' : 'none',
              border: 'none',
              borderRadius: 4,
              padding: '4px 12px',
              cursor: 'pointer',
              color: lang === 'ru' ? '#8B5CF6' : 'rgba(255,255,255,0.7)',
              fontSize: 13,
              textAlign: 'left',
            }}
          >
            🇷🇺 RU
          </button>
          <button
            type="button"
            onClick={() => changeLang('en')}
            style={{
              display: 'block',
              width: '100%',
              background: lang === 'en' ? 'rgba(139,92,246,0.2)' : 'none',
              border: 'none',
              borderRadius: 4,
              padding: '4px 12px',
              cursor: 'pointer',
              color: lang === 'en' ? '#8B5CF6' : 'rgba(255,255,255,0.7)',
              fontSize: 13,
              textAlign: 'left',
            }}
          >
            🇬🇧 EN
          </button>
        </div>
      )}
    </div>
  );
}