'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface LanguageSelectorProps {
  onSelect: (lang: string) => void;
}

export default function LanguageSelector({ onSelect }: LanguageSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const languages = [
    { code: 'ru', label: '🇷🇺 Русский', flag: '🇷🇺' },
    { code: 'en', label: '🇬🇧 English', flag: '🇬🇧' },
  ];

  const handleSelect = (lang: string) => {
    setSelected(lang);
    setTimeout(() => {
      onSelect(lang);
    }, 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: '#0A0A0F',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          fontSize: 64,
          fontWeight: 1000,
          color: '#00E5FF',
          textShadow: '0 0 40px rgba(0,229,255,0.6)',
        }}
      >
        Н
      </motion.div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, letterSpacing: 4 }}>
          ВЫБЕРИТЕ ЯЗЫК / SELECT LANGUAGE
        </p>

        <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
          {languages.map((lang) => (
            <motion.button
              key={lang.code}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(lang.code)}
              style={{
                padding: '16px 36px',
                borderRadius: 16,
                border: selected === lang.code
                  ? '2px solid #00E5FF'
                  : '1px solid rgba(255,255,255,0.15)',
                background: selected === lang.code
                  ? 'rgba(0,229,255,0.12)'
                  : 'rgba(255,255,255,0.05)',
                color: selected === lang.code ? '#00E5FF' : '#fff',
                fontSize: 20,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: 140,
              }}
            >
              {lang.flag} {lang.label}
            </motion.button>
          ))}
        </div>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
        {selected === 'ru' ? 'Загрузка...' : selected === 'en' ? 'Loading...' : ''}
      </p>
    </motion.div>
  );
}