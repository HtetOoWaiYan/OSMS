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

  // Initialize Telegram on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Get Telegram data when initialized
  useEffect(() => {
    if (isInitialized && !rawInitData) {
      getTelegramData();
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
