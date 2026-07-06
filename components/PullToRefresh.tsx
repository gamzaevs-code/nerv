'use client';

import { useEffect } from 'react';

export default function PullToRefresh() {
  useEffect(() => {
    let startY = 0;
    let armed = false;
    const onStart = (e: TouchEvent) => { if (window.scrollY === 0) { startY = e.touches[0].clientY; armed = true; } };
    const onMove = (e: TouchEvent) => { if (armed && e.touches[0].clientY - startY > 90) { armed = false; window.location.reload(); } };
    const onEnd = () => { armed = false; };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    return () => { window.removeEventListener('touchstart', onStart); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); };
  }, []);
  return null;
}
