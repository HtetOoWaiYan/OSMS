import { create } from 'zustand';
import { TelegramValidationResult, validateTelegramUser } from '@/lib/actions/telegram-validation';

interface TelegramState {
  // State
  isLoading: boolean;
  validationResult: TelegramValidationResult | null;
  launchParams: Record<string, unknown> | null;
  rawInitData: string | null;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  getTelegramData: () => Promise<{
    params: Record<string, unknown> | null;
    initData: string;
  } | null>;
  validateUser: (projectId: string) => Promise<void>;
}

export const useTelegramStore = create<TelegramState>((set, get) => ({
  // Initial state
  isLoading: true,
  validationResult: null,
  launchParams: null,
  rawInitData: null,
  isInitialized: false,
  error: null,

  // Actions
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      // Check if we're in a Telegram WebApp environment
      if (typeof window !== 'undefined') {
        // Try multiple times with delays to handle timing issues
        for (let attempt = 1; attempt <= 3; attempt++) {
          const telegram = (window as unknown as Record<string, unknown>).Telegram;

          if (telegram && typeof telegram === 'object' && 'WebApp' in telegram) {
            set({ isInitialized: true });
            break;
          }

          // If not found and this isn't the last attempt, wait and try again
          if (attempt < 3) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        // If Telegram WebApp API is still not available, try URL fallback
        if (!get().isInitialized) {
          // Try to get data from URL fragment as fallback
          const hash = window.location.hash;
          const fragmentParams = new URLSearchParams(hash.substring(1)); // Remove the # symbol
          const initData = fragmentParams.get('tgWebAppData');

          if (initData) {
            set({ isInitialized: true });
          } else {
            set({ isInitialized: false });
          }
        }
      }

      set({ isLoading: false });
    } catch (err) {
      console.error('Failed to initialize Telegram:', err);
      set({
        error: 'Failed to initialize Telegram',
        isLoading: false,
      });
    }
  },

  setError: (error: string) => {
    set({ error });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  getTelegramData: async () => {
    try {
      // Try to get data from Telegram WebApp API directly
      if (typeof window !== 'undefined') {
        const telegram = (window as unknown as Record<string, unknown>).Telegram;

        if (telegram && typeof telegram === 'object' && 'WebApp' in telegram) {
          const webApp = telegram.WebApp as Record<string, unknown>;
          const initData = webApp.initData;
          const initDataUnsafe = webApp.initDataUnsafe;

          if (initData) {
            set({
              launchParams: (initDataUnsafe as Record<string, unknown>) || null,
              rawInitData: (initData as string) || null,
            });
            return {
              params: initDataUnsafe as Record<string, unknown> | null,
              initData: initData as string,
            };
          }
        }
      }

      // Fallback: try to get from URL fragment
      const hash = window.location.hash;
      const fragmentParams = new URLSearchParams(hash.substring(1)); // Remove the # symbol
      const initData = fragmentParams.get('tgWebAppData');

      if (initData) {
        set({
          launchParams: null,
          rawInitData: initData,
        });
        return { params: null, initData: initData as string };
      }

      return null;
    } catch (err) {
      console.error('Failed to get Telegram data:', err);
      return null;
    }
  },

  validateUser: async (projectId: string) => {
    const { rawInitData } = get();

    if (!rawInitData) {
      set({
        error: 'No initData available',
        isLoading: false,
      });
      return;
    }

    try {
      set({ isLoading: true, error: null });

      const result = await validateTelegramUser(rawInitData, projectId);
      set({ validationResult: result });

      if (!result.success) {
        set({ error: result.error || 'Validation failed' });
      }
    } catch (err) {
      console.error('Validation error:', err);
      set({
        error: 'Validation failed',
        validationResult: { success: false, error: 'Validation failed' },
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Convenience hooks
export const useTelegramUser = () => {
  const { validationResult, isLoading, error } = useTelegramStore();

  return {
    user: validationResult?.success ? validationResult.user : null,
    project: validationResult?.success ? validationResult.project : null,
    authDate: validationResult?.success ? validationResult.authDate : null,
    isLoading,
    error: error || (validationResult?.success === false ? validationResult.error : null),
    isAuthenticated: validationResult?.success === true,
  };
};

export const useIsTelegram = () => {
  const { rawInitData, isInitialized } = useTelegramStore();
  return isInitialized && !!rawInitData;
};
