import Header from '@/components/Header';
import SkeletonCard from '@/components/ui/SkeletonCard';

export default function VotingLoading() {
  return <><Header simplified /><main className="page-shell"><section className="grid"><SkeletonCard count={6} /></section></main></>;
}
