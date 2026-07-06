'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function beep() {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gain.gain.value = 0.05;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.16);
  } catch {
    // browser may block audio before user interaction
  }
}

export default function VotingAutoRefresh({ initialCount }: { initialCount: number }) {
  const router = useRouter();

  useEffect(() => {
    let previousCount = Number(window.localStorage.getItem('nerv-voting-count') || initialCount);
    window.localStorage.setItem('nerv-voting-count', String(previousCount));

    const timer = window.setInterval(async () => {
      try {
        const response = await fetch('/api/voting', { cache: 'no-store' });
        const data = await response.json();
        if (typeof data.count === 'number' && data.count > previousCount) beep();
        previousCount = Number(data.count || 0);
        window.localStorage.setItem('nerv-voting-count', String(previousCount));
      } finally {
        router.refresh();
      }
    }, 5000);

    return () => window.clearInterval(timer);
  }, [initialCount, router]);

  return null;
}
