import Header from '@/components/Header';

export default function HeaderWrapper({ simplified }: { simplified?: boolean }) {
  return <Header simplified={simplified} />;
}
