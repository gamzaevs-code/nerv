'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
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
      <AnimatePresence>
        {showSplash && (
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
            {/* Видео — muted=true для автовоспроизведения */}
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

            {/* Аудио */}
            <audio
              ref={audioRef}
              src="/splash-audio.mp3"
              loop={false}
              preload="auto"
            />

            {/* Прогресс-бар */}
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

            {/* Кнопка "Пропустить" */}
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
              Пропустить ⏭
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </>
  );
}