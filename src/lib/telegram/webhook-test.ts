import "server-only";
import { getProjectById } from "@/lib/data/projects";

/**
 * Test utility for webhook functionality
 * This can be used to validate webhook setup and bot configuration
 */

export interface WebhookTestResult {
  success: boolean;
  message: string;
  project?: {
    id: string;
    name: string;
    hasBotToken: boolean;
    isActive: boolean;
  };
  error?: string;
}

/**
 * Test webhook setup for a specific project
 */
export async function testWebhookSetup(
  projectId: string,
): Promise<WebhookTestResult> {
  try {
    console.log(`Testing webhook setup for project: ${projectId}`);

    // Test project retrieval
    const projectResult = await getProjectById(projectId);

    if (!projectResult.success) {
      return {
        success: false,
        message: "Project not found or inactive",
        error: projectResult.error,
      };
    }

    const project = projectResult.data!;
    const hasBotToken = !!project.telegram_bot_token;

    if (!hasBotToken) {
      return {
        success: false,
        message: "Project exists but no bot token configured",
        project: {
          id: project.id,
          name: project.name || "Unnamed Project",
          hasBotToken: false,
          isActive: project.is_active || false,
        },
      };
    }

    // Test bot token format (basic validation)
    const token = project.telegram_bot_token!;
    const tokenParts = token.split(":");

    if (tokenParts.length !== 2) {
      return {
        success: false,
        message: "Invalid bot token format",
        project: {
          id: project.id,
          name: project.name || "Unnamed Project",
          hasBotToken: true,
          isActive: project.is_active || false,
        },
        error: "Bot token should be in format: bot_id:secret",
      };
    }

    const [botId, secret] = tokenParts;

    // Basic validation
    if (!botId || !secret || secret.length < 30) {
      return {
        success: false,
        message: "Bot token appears invalid",
        project: {
          id: project.id,
          name: project.name || "Unnamed Project",
          hasBotToken: true,
          isActive: project.is_active || false,
        },
        error: "Bot token format or length is suspicious",
      };
    }

    return {
      success: true,
      message: "Webhook setup validated successfully",
      project: {
        id: project.id,
        name: project.name || "Unnamed Project",
        hasBotToken: true,
        isActive: project.is_active || false,
      },
    };
  } catch (error) {
    console.error("Webhook test error:", error);
    return {
      success: false,
      message: "Unexpected error during webhook test",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate webhook URL for a project
 */
export function generateWebhookUrl(
  projectId: string,
  baseUrl?: string,
): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  return `${base}/api/webhook/${projectId}`;
}

/**
 * Validate webhook URL format
 */
export function validateWebhookUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);

    // Check if it's HTTPS (required for Telegram webhooks)
    if (parsedUrl.protocol !== "https:") {
      return false;
    }

    // Check if it matches our expected pattern
    const pathMatch = parsedUrl.pathname.match(/^\/api\/webhook\/[^\/]+$/);
    if (!pathMatch) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
