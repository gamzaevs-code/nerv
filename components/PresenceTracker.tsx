'use client';

import { useEffect } from 'react';

export default function PresenceTracker() {
  useEffect(() => {
    const markOnline = () => fetch('/api/presence/online', { method: 'POST' }).catch(() => null);
    const markOffline = () => {
      const body = new Blob([], { type: 'application/json' });
      if (navigator.sendBeacon) navigator.sendBeacon('/api/presence/offline', body);
      else fetch('/api/presence/offline', { method: 'POST', keepalive: true }).catch(() => null);
    };
    markOnline();
    const interval = setInterval(markOnline, 60_000);
    window.addEventListener('beforeunload', markOffline);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') markOnline();
    });
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', markOffline);
    };
  }, []);
  return null;
}
