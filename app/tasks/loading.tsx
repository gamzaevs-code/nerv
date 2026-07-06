import Header from '@/components/Header';
import SkeletonCard from '@/components/ui/SkeletonCard';

export default function TasksLoading() {
  return <><Header simplified /><main className="page-shell"><section className="grid"><SkeletonCard variant="list" count={8} /></section></main></>;
}
