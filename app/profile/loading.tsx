import Header from '@/components/Header';
import SkeletonCard from '@/components/ui/SkeletonCard';

export default function ProfileLoading() {
  return <><Header simplified /><main className="page-shell"><section className="glass-card"><SkeletonCard variant="profile" /></section><section className="grid" style={{ marginTop: 18 }}><SkeletonCard count={6} /></section></main></>;
}
