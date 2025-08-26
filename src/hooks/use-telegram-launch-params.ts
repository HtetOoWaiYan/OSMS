'use client';

import { useEffect, useState } from 'react';
import { useLaunchParams } from '@telegram-apps/sdk-react';

/**
 * Type definition for stored launch parameters
 */
interface StoredLaunchParams {
  tgWebAppVersion?: string;
  tgWebAppData?: string;
  tgWebAppPlatform?: string;
  tgWebAppThemeParams?: string | object;
  tgWebAppStartParam?: string;
  tgWebAppShowSettings?: string;
  tgWebAppBotInline?: string;
  tgWebAppFullscreen?: string;
  [key: string]: string | object | undefined;
}

/**
 * Hook to access Telegram launch parameters from both SDK and sessionStorage
 * This provides a fallback mechanism for accessing launch parameters
 */
export function useTelegramLaunchParams() {
  const sdkLaunchParams = useLaunchParams();
  const [storedParams, setStoredParams] = useState<StoredLaunchParams | null>(null);

  useEffect(() => {
    // Get stored launch parameters from sessionStorage
    try {
      const stored = sessionStorage.getItem('telegramLaunchParams');
      if (stored) {
        setStoredParams(JSON.parse(stored) as StoredLaunchParams);
      }
    } catch (error) {
      console.error('Failed to parse stored launch parameters:', error);
    }
  }, []);

  // Prefer SDK parameters over stored ones
  const launchParams =
    sdkLaunchParams && Object.keys(sdkLaunchParams).length > 0 ? sdkLaunchParams : storedParams;

  return {
    launchParams,
    isFromSDK: Boolean(sdkLaunchParams && Object.keys(sdkLaunchParams).length > 0),
    isFromStorage: Boolean(storedParams && !sdkLaunchParams),
    hasParams: Boolean(launchParams && Object.keys(launchParams).length > 0),
  };
}

/**
 * Hook to check if the app is running in Telegram environment
 */
export function useIsTelegramEnvironment() {
  const { hasParams } = useTelegramLaunchParams();

  return {
    isTelegram: hasParams,
    isWeb: !hasParams,
  };
}
