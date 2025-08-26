'use client';

import React from 'react';
import { TelegramProvider } from '@/components/telegram-provider';

interface CartPageProps {
  params: Promise<{ 'project-id': string }>;
}

export default function CartPage({ params }: CartPageProps) {
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
      <CartPageContent />
    </TelegramProvider>
  );
}

function CartPageContent() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-md">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold mb-2">Cart Page</h2>
          <p className="text-muted-foreground mb-4">Coming soon!</p>
          <p className="text-sm text-muted-foreground">
            Cart functionality will be implemented here
          </p>
        </div>
      </div>
    </div>
  );
}