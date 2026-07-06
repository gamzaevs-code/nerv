import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import TwoFactorSettings from '@/components/TwoFactorSettings';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function SecuritySettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const twoFactor = await prisma.twoFactor.findUnique({ where: { userId: user.id } });
  return <><Header simplified /><main className="page-shell"><TwoFactorSettings enabled={!!twoFactor?.isEnabled} /></main></>;
}
