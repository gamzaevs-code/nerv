import Header from '@/components/Header';
import SkeletonCard from '@/components/ui/SkeletonCard';

export default function DashboardLoading() {
  return <><Header simplified={false} /><main className="page-shell"><section className="grid"><SkeletonCard count={6} /></section></main></>;
}
