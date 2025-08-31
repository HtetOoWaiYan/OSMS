'use client';

import { useEffect } from 'react';
import { useTelegramStore } from '@/hooks/use-telegram-store';

interface TelegramProviderProps {
  children: React.ReactNode;
  projectId: string;
}

export function TelegramProvider({ children, projectId }: TelegramProviderProps) {
  const { initialize, getTelegramData, validateUser, isInitialized, rawInitData } =
    useTelegramStore();

  // Initialize Telegram SDK on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Get Telegram data when SDK is initialized
  useEffect(() => {
    if (isInitialized && !rawInitData) {
      // Poll for data every 100ms until we get it
      const interval = setInterval(async () => {
        const data = await getTelegramData();
        if (data?.initData) {
          clearInterval(interval);
        }
      }, 100);

      // Cleanup after 5 seconds
      setTimeout(() => clearInterval(interval), 5000);

      return () => clearInterval(interval);
    }
  }, [isInitialized, rawInitData, getTelegramData]);

  // Validate user when we have initData
  useEffect(() => {
    if (rawInitData) {
      validateUser(projectId);
    }
  }, [rawInitData, projectId, validateUser]);

  return <>{children}</>;
}

// Re-export the hooks for convenience
export { useTelegramUser, useIsTelegram } from '@/hooks/use-telegram-store';
