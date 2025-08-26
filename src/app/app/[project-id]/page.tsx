'use client';

import React from 'react';
import { TelegramProvider } from '@/components/telegram-provider';
import MiniAppContent from './mini-app-content';

interface AppPageProps {
  params: Promise<{ 'project-id': string }>;
}

export default function AppPage({ params }: AppPageProps) {
  // Since this is now client-side, we need to handle the async params differently
  const [projectId, setProjectId] = React.useState<string | null>(null);

  React.useEffect(() => {
    params.then((resolvedParams) => {
      setProjectId(resolvedParams['project-id']);
    });
  }, [params]);

  if (!projectId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <TelegramProvider projectId={projectId}>
      <MiniAppContent />
    </TelegramProvider>
  );
}
