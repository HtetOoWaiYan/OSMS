'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { init, useLaunchParams, useRawInitData } from '@telegram-apps/sdk-react';
import { validateTelegramUser, TelegramValidationResult } from '@/lib/actions/telegram-validation';

interface TelegramContextValue {
  isLoading: boolean;
  validationResult: TelegramValidationResult | null;
  launchParams: Record<string, unknown> | null;
  rawInitData: string | null;
  isInitialized: boolean;
  error: string | null;
}

const TelegramContext = createContext<TelegramContextValue>({
  isLoading: true,
  validationResult: null,
  launchParams: null,
  rawInitData: null,
  isInitialized: false,
  error: null,
});

interface TelegramProviderProps {
  children: React.ReactNode;
  projectId: string;
}

export function TelegramProvider({ children, projectId }: TelegramProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [validationResult, setValidationResult] = useState<TelegramValidationResult | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Telegram SDK
  useEffect(() => {
    try {
      init();
      setIsInitialized(true);
      console.log('Telegram SDK initialized');
    } catch (err) {
      console.error('Failed to initialize Telegram SDK:', err);
      setError('Failed to initialize Telegram SDK');
      setIsLoading(false);
    }
  }, []);

  // Get launch parameters and initData from SDK
  const launchParams = useLaunchParams();
  const rawInitData = useRawInitData();

  // Validate initData when we have it
  useEffect(() => {
    if (!isInitialized || !rawInitData) return;

    const validateData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await validateTelegramUser(rawInitData, projectId);
        setValidationResult(result);

        if (!result.success) {
          setError(result.error || 'Validation failed');
        }
      } catch (err) {
        console.error('Validation error:', err);
        setError('Validation failed');
        setValidationResult({ success: false, error: 'Validation failed' });
      } finally {
        setIsLoading(false);
      }
    };

    validateData();
  }, [isInitialized, rawInitData, projectId]);

  const contextValue: TelegramContextValue = {
    isLoading,
    validationResult,
    launchParams: launchParams || null,
    rawInitData: rawInitData || null,
    isInitialized,
    error,
  };

  return <TelegramContext.Provider value={contextValue}>{children}</TelegramContext.Provider>;
}

/**
 * Hook to access Telegram data
 */
export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider');
  }
  return context;
}

/**
 * Hook to get validated user data
 */
export function useTelegramUser() {
  const { validationResult, isLoading, error } = useTelegram();

  return {
    user: validationResult?.success ? validationResult.user : null,
    project: validationResult?.success ? validationResult.project : null,
    authDate: validationResult?.success ? validationResult.authDate : null,
    isLoading,
    error: error || (validationResult?.success === false ? validationResult.error : null),
    isAuthenticated: validationResult?.success === true,
  };
}

/**
 * Hook to check if we're in Telegram environment
 */
export function useIsTelegram() {
  const { rawInitData, isInitialized } = useTelegram();
  return isInitialized && !!rawInitData;
}
