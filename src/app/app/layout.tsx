import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Purple Shopping - Mini App',
  themeColor: '#8b5cf6',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return <div className="container mx-auto max-w-md px-4 py-6">{children}</div>;
}
