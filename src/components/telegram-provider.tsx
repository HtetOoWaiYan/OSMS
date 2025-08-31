'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
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

// Client-only component that actually uses Telegram hooks
function TelegramProviderClient({ children, projectId }: TelegramProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [validationResult, setValidationResult] = useState<TelegramValidationResult | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic import to load Telegram SDK hooks only on client
  const [telegramHooks, setTelegramHooks] = useState<{
    init: () => void;
    useLaunchParams: () => Record<string, unknown> | undefined;
    useRawInitData: () => string | undefined;
  } | null>(null);

  useEffect(() => {
    const loadTelegramSDK = async () => {
      try {
        const telegram = await import('@telegram-apps/sdk-react');
        setTelegramHooks(telegram);

        // Initialize SDK
        telegram.init();
        setIsInitialized(true);
        console.log('Telegram SDK initialized');
      } catch (err) {
        console.error('Failed to load Telegram SDK:', err);
        setError('Failed to load Telegram SDK');
        setIsLoading(false);
      }
    };

    loadTelegramSDK();
  }, []);

  // Get Telegram data using imported hooks
  const [launchParams, setLaunchParams] = useState<Record<string, unknown> | null>(null);
  const [rawInitData, setRawInitData] = useState<string | null>(null);

  useEffect(() => {
    if (!telegramHooks || !isInitialized) return;

    try {
      const params = telegramHooks.useLaunchParams();
      const initData = telegramHooks.useRawInitData();
      setLaunchParams(params || null);
      setRawInitData(initData || null);
      console.log('Telegram data retrieved');
    } catch (err) {
      console.debug('Telegram hooks not available:', err);
      setLaunchParams(null);
      setRawInitData(null);
    }
  }, [telegramHooks, isInitialized]);

  // Validate initData when we have it
  useEffect(() => {
    if (!isInitialized || !rawInitData) {
      setIsLoading(false);
      return;
    }

    const validateData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Validating Telegram user with:', {
          hasInitData: !!rawInitData,
          projectId,
          initDataLength: rawInitData?.length,
        });

        const result = await validateTelegramUser(rawInitData, projectId);
        setValidationResult(result);

        console.log('Validation result:', {
          success: result.success,
          error: result.error,
          hasUser: !!result.user,
        });

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
    launchParams,
    rawInitData,
    isInitialized,
    error,
  };

  return <TelegramContext.Provider value={contextValue}>{children}</TelegramContext.Provider>;
}

// Wrapper that provides SSR-safe fallback
function TelegramProviderSSRFallback({ children }: { children: React.ReactNode }) {
  const contextValue: TelegramContextValue = {
    isLoading: true,
    validationResult: null,
    launchParams: null,
    rawInitData: null,
    isInitialized: false,
    error: null,
  };

  return <TelegramContext.Provider value={contextValue}>{children}</TelegramContext.Provider>;
}

// Dynamic import with no SSR
const DynamicTelegramProvider = dynamic(() => Promise.resolve(TelegramProviderClient), {
  ssr: false,
  loading: () => null,
});

export function TelegramProvider({ children, projectId }: TelegramProviderProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <TelegramProviderSSRFallback>{children}</TelegramProviderSSRFallback>;
  }

  return <DynamicTelegramProvider projectId={projectId}>{children}</DynamicTelegramProvider>;
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
