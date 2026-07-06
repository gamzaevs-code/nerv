'use client';

import { ButtonHTMLAttributes } from 'react';
import { useNervSound } from '@/app/providers/SoundProvider';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  feedback?: 'click' | 'success' | 'error';
};

export default function HapticFeedback({ feedback = 'click', onClick, children, ...props }: Props) {
  const sound = useNervSound();
  return (
    <button
      {...props}
      onClick={(event) => {
        if (feedback === 'success') sound.playSuccess();
        else if (feedback === 'error') sound.playError();
        else sound.playClick();
        onClick?.(event);
      }}
    >
      {children}
    </button>
  );
}
