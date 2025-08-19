import { z } from 'zod';

/**
 * Telegram Bot Token Validation Schema
 * Bot tokens follow the format: {bot_id}:{secret_key}
 * - bot_id: sequence of digits
 * - secret_key: alphanumeric string with underscores and hyphens
 */
export const telegramBotTokenSchema = z
  .string()
  .min(1, 'Telegram bot token is required')
  .regex(
    /^\d+:[A-Za-z0-9_-]+$/,
    'Invalid bot token format. Should be in format: 123456789:AAEhBOweik6ad...'
  )
  .refine(
    (token) => {
      const parts = token.split(':');
      return parts.length === 2 && parts[0].length > 0 && parts[1].length >= 35;
    },
    'Bot token appears to be invalid. Please check the format from @BotFather'
  );

/**
 * Project Creation Schema
 */
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
  telegram_bot_token: telegramBotTokenSchema,
});

/**
 * Project Update Schema (for future use)
 */
export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
  telegram_bot_token: telegramBotTokenSchema.optional(),
});

// Type definitions for TypeScript
export type CreateProjectData = z.infer<typeof createProjectSchema>;
export type UpdateProjectData = z.infer<typeof updateProjectSchema>;
export type TelegramBotToken = z.infer<typeof telegramBotTokenSchema>;
