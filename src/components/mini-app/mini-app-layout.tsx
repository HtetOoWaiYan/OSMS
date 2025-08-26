'use client';

import { TelegramProvider } from '@/components/telegram-provider';
import { MiniAppHeader } from './mini-app-header';
import { MiniAppBottomNav } from './mini-app-bottom-nav';

interface MiniAppLayoutProps {
  children: React.ReactNode;
  projectId: string;
  showHeader?: boolean;
  showBottomNav?: boolean;
}

export function MiniAppLayout({
  children,
  projectId,
  showHeader = true,
  showBottomNav = true,
}: MiniAppLayoutProps) {
  return (
    <TelegramProvider projectId={projectId}>
      <div className="bg-background flex min-h-screen flex-col">
        {showHeader && <MiniAppHeader projectId={projectId} />}

        <main className={`flex-1 ${showBottomNav ? 'pb-16' : ''}`}>{children}</main>

        {showBottomNav && <MiniAppBottomNav projectId={projectId} />}
      </div>
    </TelegramProvider>
  );
}
