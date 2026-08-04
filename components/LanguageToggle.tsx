'use client';

import { useState, useEffect } from 'react';

export default function LanguageToggle() {
  const [lang, setLang] = useState('ru');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nerv-language');
    if (saved) setLang(saved);
  }, []);

  const switchLang = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem('nerv-language', newLang);
    setIsOpen(false);
    // Перезагружаем страницу для применения переводов
    window.location.reload();
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(139,92,246,0.25)',
          borderRadius: 10,
          padding: '6px 14px',
          color: '#fff',
          fontSize: 14,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'all 0.2s ease',
          minHeight: 40,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
        }}
      >
        🌐 {lang.toUpperCase()}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            minWidth: 120,
            background: '#1a1a2e',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: 10,
            overflow: 'hidden',
            zIndex: 100,
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          }}
        >
          <button
            onClick={() => switchLang('ru')}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px 16px',
              background: lang === 'ru' ? 'rgba(139,92,246,0.15)' : 'none',
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              color: lang === 'ru' ? '#8B5CF6' : '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: 14,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = lang === 'ru' ? 'rgba(139,92,246,0.15)' : 'none';
            }}
          >
            🇷🇺 Русский
          </button>
          <button
            onClick={() => switchLang('en')}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px 16px',
              background: lang === 'en' ? 'rgba(139,92,246,0.15)' : 'none',
              border: 'none',
              color: lang === 'en' ? '#8B5CF6' : '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: 14,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = lang === 'en' ? 'rgba(139,92,246,0.15)' : 'none';
            }}
          >
            🇬🇧 English
          </button>
        </div>
      )}
    </div>
  );
}