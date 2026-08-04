'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from './LanguageSelector';

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [showLanguage, setShowLanguage] = useState(true);
  const [language, setLanguage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    setShowLanguage(false);
    // Сохраняем язык в localStorage
    localStorage.setItem('nerv-language', lang);
    // Запускаем заставку
    setTimeout(() => setShowSplash(true), 300);
  };

  useEffect(() => {
    // Проверяем, есть ли сохранённый язык
    const savedLang = localStorage.getItem('nerv-language');
    if (savedLang) {
      setLanguage(savedLang);
      setShowLanguage(false);
      setShowSplash(true);
    }

    // Автовоспроизведение музыки
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {});
    }

    // Скрыть заставку через 8 секунд
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* ✅ ВЫБОР ЯЗЫКА */}
      {showLanguage && <LanguageSelector onSelect={handleLanguageSelect} />}

      {/* ✅ ЗАСТАВКА С ВИДЕО */}
      <AnimatePresence>
        {showSplash && !showLanguage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: '#0A0A0F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <video
              src="/splash.mp4"
              autoPlay
              muted={true}
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onEnded={() => {
                setTimeout(() => setShowSplash(false), 500);
              }}
            />

            <audio
              ref={audioRef}
              src="/splash-audio.mp3"
              loop={false}
              preload="auto"
            />

            <div
              style={{
                position: 'absolute',
                bottom: 40,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 200,
                height: 3,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 8, ease: 'linear' }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #00E5FF, #6D28D9)',
                }}
              />
            </div>

            <button
              onClick={() => setShowSplash(false)}
              style={{
                position: 'absolute',
                bottom: 80,
                right: 40,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '8px 20px',
                borderRadius: 20,
                cursor: 'pointer',
                fontSize: 14,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }}
            >
              {language === 'en' ? 'Skip ⏭' : 'Пропустить ⏭'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </>
  );
}