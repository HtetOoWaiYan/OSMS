import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Purple Shopping - Online Shop Management System',
    template: '%s | Purple Shopping',
  },
  description:
    'Comprehensive web-based management system for online shops. Manage items, orders, payments, and customer messaging with integrated Telegram support.',
  keywords: [
    'shop management',
    'e-commerce',
    'inventory',
    'orders',
    'telegram bot',
    'myanmar',
    'purple shopping',
  ],
  authors: [{ name: 'Purple Shopping Team' }],
  creator: 'Purple Shopping',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Purple Shopping - Online Shop Management System',
    description: 'Comprehensive web-based management system for online shops',
    siteName: 'Purple Shopping',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Purple Shopping - Online Shop Management System',
    description: 'Comprehensive web-based management system for online shops',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
