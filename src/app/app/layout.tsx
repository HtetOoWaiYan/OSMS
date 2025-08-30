import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Purple Shopping - Mini App',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#8b5cf6',
};

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return <div className="container mx-auto max-w-md py-6">{children}</div>;
}
