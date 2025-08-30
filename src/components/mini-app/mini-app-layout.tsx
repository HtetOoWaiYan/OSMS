'use client';

import { TelegramProvider } from '@/components/telegram-provider';
import { MiniAppHeader } from './mini-app-header';

interface MiniAppLayoutProps {
  children: React.ReactNode;
  projectId: string;
  showHeader?: boolean;
  showBottomNav?: boolean;
}

export function MiniAppLayout({ children, projectId, showHeader = true }: MiniAppLayoutProps) {
  return (
    <TelegramProvider projectId={projectId}>
      <div className="bg-background flex min-h-screen flex-col">
        {showHeader && <MiniAppHeader projectId={projectId} />}

        <main className="flex-1">{children}</main>
      </div>
    </TelegramProvider>
  );
}
