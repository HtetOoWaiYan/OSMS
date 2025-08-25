import "server-only";

/**
 * Telegram API utilities for bot management
 */

export interface SetWebhookResult {
  success: boolean;
  error?: string;
  webhookInfo?: {
    url: string;
    has_custom_certificate: boolean;
    pending_update_count: number;
    max_connections?: number;
    ip_address?: string;
  };
}

/**
 * Set webhook for a Telegram bot
 * @param botToken - The bot token from @BotFather
 * @param webhookUrl - The full webhook URL (e.g., https://mydomain.com/api/webhook/project-id)
 * @returns Promise<SetWebhookResult>
 */
export async function setWebhook(
  botToken: string,
  webhookUrl: string,
): Promise<SetWebhookResult> {
  try {
    // Validate inputs
    if (!botToken || !webhookUrl) {
      return {
        success: false,
        error: "Bot token and webhook URL are required",
      };
    }

    // Validate bot token format (basic check)
    if (!botToken.includes(":")) {
      return {
        success: false,
        error: "Invalid bot token format",
      };
    }

    // Validate webhook URL format
    try {
      const url = new URL(webhookUrl);
      if (url.protocol !== "https:") {
        return {
          success: false,
          error: "Webhook URL must use HTTPS protocol",
        };
      }
    } catch {
      return {
        success: false,
        error: "Invalid webhook URL format",
      };
    }

    // Call Telegram API to set webhook
    const apiUrl = `https://api.telegram.org/bot${botToken}/setWebhook`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: webhookUrl,
        max_connections: 100, // Allow up to 100 concurrent connections
        drop_pending_updates: true, // Drop any pending updates when setting webhook
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error("Telegram setWebhook API error:", data);

      return {
        success: false,
        error: data.description || "Failed to set webhook with Telegram API",
      };
    }

    console.log(`Webhook set successfully for bot: ${webhookUrl}`);

    return {
      success: true,
      webhookInfo: {
        url: data.result.url,
        has_custom_certificate: data.result.has_custom_certificate,
        pending_update_count: data.result.pending_update_count,
        max_connections: data.result.max_connections,
        ip_address: data.result.ip_address,
      },
    };
  } catch (error) {
    console.error("Error setting Telegram webhook:", error);
    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : "Unexpected error setting webhook",
    };
  }
}

/**
 * Remove webhook for a Telegram bot
 * @param botToken - The bot token from @BotFather
 * @returns Promise<{success: boolean, error?: string}>
 */
export async function removeWebhook(
  botToken: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!botToken || !botToken.includes(":")) {
      return {
        success: false,
        error: "Invalid bot token",
      };
    }

    const apiUrl = `https://api.telegram.org/bot${botToken}/deleteWebhook`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        drop_pending_updates: true,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error("Telegram deleteWebhook API error:", data);
      return {
        success: false,
        error: data.description || "Failed to remove webhook",
      };
    }

    console.log(
      `Webhook removed successfully for bot token ending with: ...${
        botToken.slice(-10)
      }`,
    );

    return { success: true };
  } catch (error) {
    console.error("Error removing Telegram webhook:", error);
    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : "Unexpected error removing webhook",
    };
  }
}

/**
 * Get webhook info for a Telegram bot
 * @param botToken - The bot token from @BotFather
 * @returns Promise<{success: boolean, error?: string, webhookInfo?: any}>
 */
export async function getWebhookInfo(botToken: string): Promise<{
  success: boolean;
  error?: string;
  webhookInfo?: {
    url: string;
    has_custom_certificate: boolean;
    pending_update_count: number;
    max_connections?: number;
    ip_address?: string;
    last_error_date?: number;
    last_error_message?: string;
    last_synchronization_error_date?: number;
  };
}> {
  try {
    if (!botToken || !botToken.includes(":")) {
      return {
        success: false,
        error: "Invalid bot token",
      };
    }

    const apiUrl = `https://api.telegram.org/bot${botToken}/getWebhookInfo`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error("Telegram getWebhookInfo API error:", data);
      return {
        success: false,
        error: data.description || "Failed to get webhook info",
      };
    }

    return {
      success: true,
      webhookInfo: data.result,
    };
  } catch (error) {
    console.error("Error getting Telegram webhook info:", error);
    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : "Unexpected error getting webhook info",
    };
  }
}

/**
 * Generate webhook URL for a project
 * @param projectId - The project ID
 * @param baseUrl - Optional base URL, defaults to NEXT_PUBLIC_APP_URL or localhost
 * @returns string - The complete webhook URL
 */
export function generateWebhookUrl(
  projectId: string,
  baseUrl?: string,
): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  return `${base}/api/webhook/${projectId}`;
}
