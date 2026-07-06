'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSound from 'use-sound';

type SoundContextValue = {
  soundsEnabled: boolean;
  hapticsEnabled: boolean;
  setSoundsEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  playClick: () => void;
  playSuccess: () => void;
  playError: () => void;
  vibrate: (pattern: VibratePattern) => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundsEnabled, setSoundsEnabledState] = useState(true);
  const [hapticsEnabled, setHapticsEnabledState] = useState(true);
  const [click] = useSound('/sounds/click.mp3', { volume: 0.35, soundEnabled: soundsEnabled });
  const [success] = useSound('/sounds/success.mp3', { volume: 0.45, soundEnabled: soundsEnabled });
  const [error] = useSound('/sounds/error.mp3', { volume: 0.45, soundEnabled: soundsEnabled });

  useEffect(() => {
    setSoundsEnabledState(localStorage.getItem('nerv-sounds') !== 'off');
    setHapticsEnabledState(localStorage.getItem('nerv-haptics') !== 'off');
  }, []);

  function setSoundsEnabled(enabled: boolean) {
    setSoundsEnabledState(enabled);
    localStorage.setItem('nerv-sounds', enabled ? 'on' : 'off');
  }

  function setHapticsEnabled(enabled: boolean) {
    setHapticsEnabledState(enabled);
    localStorage.setItem('nerv-haptics', enabled ? 'on' : 'off');
  }

  function vibrate(pattern: VibratePattern) {
    if (hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
  }

  function playClick() { click(); vibrate(10); }
  function playSuccess() { success(); vibrate([30, 50, 30]); }
  function playError() { error(); vibrate([100, 50, 100]); }

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('button,a,[role="button"]')) playClick();
    };
    const onSuccess = () => playSuccess();
    const onError = () => playError();
    document.addEventListener('click', onClick, true);
    window.addEventListener('nerv-success', onSuccess);
    window.addEventListener('nerv-error', onError);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('nerv-success', onSuccess);
      window.removeEventListener('nerv-error', onError);
    };
  });

  const value = useMemo(() => ({ soundsEnabled, hapticsEnabled, setSoundsEnabled, setHapticsEnabled, playClick, playSuccess, playError, vibrate }), [soundsEnabled, hapticsEnabled]);
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useNervSound() {
  const context = useContext(SoundContext);
  if (!context) throw new Error('useNervSound must be used within SoundProvider');
  return context;
}
