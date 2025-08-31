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
          console.log(`Telegram initialization attempt ${attempt}/3`);

          const telegram = (window as unknown as Record<string, unknown>).Telegram;
          console.log('Telegram object check:', {
            attempt,
            hasWindow: typeof window !== 'undefined',
            hasTelegram: !!telegram,
            telegramType: typeof telegram,
            hasWebApp: telegram && typeof telegram === 'object' && 'WebApp' in telegram,
            telegramKeys: telegram && typeof telegram === 'object' ? Object.keys(telegram) : [],
          });

          if (telegram && typeof telegram === 'object' && 'WebApp' in telegram) {
            set({ isInitialized: true });
            console.log('Telegram WebApp environment detected');
            break;
          }

          // If not found and this isn't the last attempt, wait and try again
          if (attempt < 3) {
            console.log(`Telegram not found, waiting 500ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        // If Telegram WebApp API is still not available, try URL fallback
        if (!get().isInitialized) {
          // Try to get data from URL parameters as fallback
          const urlParams = new URLSearchParams(window.location.search);
          const initData = urlParams.get('tgWebAppData');
          console.log('URL fallback check:', {
            hasInitData: !!initData,
            initDataLength: initData?.length,
            urlParams: Array.from(urlParams.entries()),
          });

          if (initData) {
            set({ isInitialized: true });
            console.log('Telegram data found in URL');
          } else {
            set({ isInitialized: false });
            console.log('Not in Telegram environment');
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
      console.log('Getting Telegram data...');

      // Try to get data from Telegram WebApp API directly
      if (typeof window !== 'undefined') {
        const telegram = (window as unknown as Record<string, unknown>).Telegram;
        console.log('Telegram object:', telegram);

        if (telegram && typeof telegram === 'object' && 'WebApp' in telegram) {
          const webApp = telegram.WebApp as Record<string, unknown>;
          const initData = webApp.initData;
          const initDataUnsafe = webApp.initDataUnsafe;

          console.log('WebApp data:', { initData, initDataUnsafe });

          if (initData) {
            set({
              launchParams: (initDataUnsafe as Record<string, unknown>) || null,
              rawInitData: (initData as string) || null,
            });
            console.log('Telegram data retrieved from WebApp API');
            return {
              params: initDataUnsafe as Record<string, unknown> | null,
              initData: initData as string,
            };
          }
        }
      }

      // Fallback: try to get from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const initData = urlParams.get('tgWebAppData');

      if (initData) {
        set({
          launchParams: null,
          rawInitData: initData,
        });
        console.log('Telegram data retrieved from URL');
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

    console.log('Validating user with projectId:', projectId);
    console.log('Raw initData available:', !!rawInitData);

    if (!rawInitData) {
      set({
        error: 'No initData available',
        isLoading: false,
      });
      return;
    }

    try {
      set({ isLoading: true, error: null });

      console.log('Validating Telegram user with:', {
        hasInitData: !!rawInitData,
        projectId,
        initDataLength: rawInitData?.length,
      });

      const result = await validateTelegramUser(rawInitData, projectId);
      set({ validationResult: result });

      console.log('Validation result:', {
        success: result.success,
        error: result.error,
        hasUser: !!result.user,
      });

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
