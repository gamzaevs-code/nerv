'use client';

import { useRef } from 'react';
import { useSwipeable } from 'react-swipeable';

export default function MobileSwipeContainer({ children, className = 'grid' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLElement | null>(null);
  const handlers = useSwipeable({
    trackMouse: false,
    onSwipedLeft: () => ref.current?.scrollBy({ left: window.innerWidth * 0.9, behavior: 'smooth' }),
    onSwipedRight: () => ref.current?.scrollBy({ left: -window.innerWidth * 0.9, behavior: 'smooth' }),
  });

  return (
    <section {...handlers} ref={ref as any} className={`${className} swipe-container`}>
      {children}
    </section>
  );
}
