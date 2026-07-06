'use client';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function SkeletonCard({ variant = 'card', count = 1 }: { variant?: 'card' | 'profile' | 'list'; count?: number }) {
  const card = (index: number) => (
    <article className="glass-card stack" key={index}>
      {variant === 'profile' ? (
        <>
          <Skeleton circle width={88} height={88} />
          <Skeleton height={34} width="60%" />
          <Skeleton count={3} />
        </>
      ) : variant === 'list' ? (
        <>
          <Skeleton height={22} width="35%" />
          <Skeleton height={18} count={3} />
        </>
      ) : (
        <>
          <Skeleton height={28} width="45%" />
          <Skeleton height={18} count={4} />
          <Skeleton height={48} width="100%" />
        </>
      )}
    </article>
  );

  return (
    <SkeletonTheme baseColor="rgba(255,255,255,0.06)" highlightColor="rgba(139,92,246,0.22)">
      {Array.from({ length: count }, (_, index) => card(index))}
    </SkeletonTheme>
  );
}
