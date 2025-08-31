/**
 * Re-export Telegram hooks for easier importing
 */
export { useIsTelegram, useTelegramUser } from '@/components/telegram-provider';
export { useTelegramStore } from '@/hooks/use-telegram-store';

export type { TelegramValidationResult } from '@/lib/actions/telegram-validation';
