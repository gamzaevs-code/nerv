import type { Metadata, Viewport } from 'next';
import PwaRegister from '@/components/PwaRegister';
import SupportWidget from '@/components/SupportWidget';
import MobileBottomNav from '@/components/MobileBottomNav';
import PullToRefresh from '@/components/PullToRefresh';
import PresenceTracker from '@/components/PresenceTracker';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import PageTransitionProvider from '@/app/providers/PageTransitionProvider';
import { SoundProvider } from '@/app/providers/SoundProvider';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'НЕРВ',
    template: '%s | НЕРВ',
  },
  description: 'НЕРВ — технологичная игровая платформа заданий, голосований и наград.',
  applicationName: 'НЕРВ',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'НЕРВ',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'icon', type: 'image/svg+xml', url: '/logo.svg' },
    { rel: 'apple-touch-icon', sizes: '192x192', url: '/icon-192x192.png' },
    { rel: 'apple-touch-icon', sizes: '512x512', url: '/icon-512x512.png' },
    { rel: 'apple-touch-icon-precomposed', url: '/icon-192x192.png' },
    { rel: 'mask-icon', url: '/logo.svg', color: '#8B5CF6' },
  ],
  other: {
    'mobile-web-app-capable': 'yes',
  },
  openGraph: {
    title: 'НЕРВ',
    description: 'Игровые задания, видео-доказательства, голосования и награды в едином контуре.',
    type: 'website',
    images: ['/icon-512x512.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#8B5CF6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" data-theme="dark">
      <body>
        <ThemeProvider>
          <SoundProvider>
            <PwaRegister />
            <PullToRefresh />
            <PresenceTracker />
            <PageTransitionProvider>{children}</PageTransitionProvider>
            <footer className="site-footer">© 2026 НЕРВ | Powered by Next.js</footer>
            <SupportWidget />
            <MobileBottomNav />
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
