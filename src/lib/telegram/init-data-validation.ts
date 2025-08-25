import "server-only";
import { createHmac } from "crypto";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface InitDataValidationResult {
  isValid: boolean;
  user?: TelegramUser;
  error?: string;
  authDate?: number;
}

/**
 * Validates Telegram Mini App initData using the bot token
 * Based on: https://docs.telegram-mini-apps.com/platform/init-data#using-telegram-bot-token
 */
export async function validateTelegramInitData(
  initDataRaw: string,
  botToken: string,
): Promise<InitDataValidationResult> {
  try {
    // Step 1: Parse initData as query parameters
    const params = new URLSearchParams(initDataRaw);
    const hash = params.get("hash");

    if (!hash) {
      return {
        isValid: false,
        error: "No hash found in initData",
      };
    }

    // Step 2: Create key-value pairs excluding 'hash'
    const pairs: string[] = [];

    for (const [key, value] of params.entries()) {
      if (key !== "hash") {
        pairs.push(`${key}=${value}`);
      }
    }

    // Step 3: Sort the pairs alphabetically
    pairs.sort();

    // Step 4: Join with newline
    const dataCheckString = pairs.join("\n");

    // Step 5: Create HMAC-SHA256 using WebAppData as key and bot token
    const secretKey = createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();

    // Step 6: Create HMAC-SHA256 using secretKey and dataCheckString
    const calculatedHash = createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    // Step 7: Compare hashes
    if (calculatedHash !== hash) {
      return {
        isValid: false,
        error: "Hash validation failed",
      };
    }

    // Step 8: Parse user data if present
    const userParam = params.get("user");
    let user: TelegramUser | undefined;

    if (userParam) {
      try {
        user = JSON.parse(decodeURIComponent(userParam));
      } catch (parseError) {
        console.warn("Failed to parse user data from initData:", parseError);
      }
    }

    // Step 9: Get auth date
    const authDateParam = params.get("auth_date");
    const authDate = authDateParam ? parseInt(authDateParam, 10) : undefined;

    // Step 10: Validate auth date (not older than 24 hours)
    if (authDate) {
      const now = Math.floor(Date.now() / 1000);
      const maxAge = 24 * 60 * 60; // 24 hours

      if (now - authDate > maxAge) {
        return {
          isValid: false,
          error: "initData is too old (more than 24 hours)",
        };
      }
    }

    return {
      isValid: true,
      user,
      authDate,
    };
  } catch (error) {
    console.error("Error validating Telegram initData:", error);
    return {
      isValid: false,
      error: error instanceof Error
        ? error.message
        : "Unexpected validation error",
    };
  }
}

/**
 * Extract initData from URL search params (for client components)
 */
export function extractInitData(
  searchParams: { [key: string]: string | string[] | undefined },
): string | null {
  const initData = searchParams.initData;

  if (typeof initData === "string") {
    return initData;
  }

  return null;
}
