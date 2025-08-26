'use server';

import { validateTelegramInitData } from '@/lib/telegram/init-data-validation';
import { getProjectById } from '@/lib/data/projects';

export interface TelegramValidationResult {
  success: boolean;
  error?: string;
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
  };
  authDate?: number;
  project?: {
    id: string;
    name: string;
  };
}

/**
 * Server action to validate Telegram initData
 */
export async function validateTelegramUser(
  initDataRaw: string,
  projectId: string,
): Promise<TelegramValidationResult> {
  try {
    // Get project to retrieve bot token
    const projectResult = await getProjectById(projectId);

    if (!projectResult.success || !projectResult.data?.telegram_bot_token) {
      return {
        success: false,
        error: 'Project not found or bot token missing',
      };
    }

    const project = projectResult.data;

    // Validate the initData using the bot token
    const validationResult = await validateTelegramInitData(
      initDataRaw,
      project.telegram_bot_token!,
    );

    if (!validationResult.isValid) {
      return {
        success: false,
        error: 'Invalid initData signature',
      };
    }

    if (!validationResult.user) {
      return {
        success: false,
        error: 'No user data in initData',
      };
    }

    return {
      success: true,
      user: validationResult.user,
      authDate: validationResult.authDate,
      project: {
        id: project.id,
        name: project.name || 'Purple Shopping',
      },
    };
  } catch (error) {
    console.error('Telegram validation error:', error);
    return {
      success: false,
      error: 'Validation failed',
    };
  }
}
