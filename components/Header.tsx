import { getCurrentUser } from '@/lib/auth';
import HeaderClient from './HeaderClient';

export default async function Header({ simplified = false }: { simplified?: boolean }) {
  const user = simplified ? null : await getCurrentUser();
  return <HeaderClient simplified={simplified} authenticated={!!user} />;
}
