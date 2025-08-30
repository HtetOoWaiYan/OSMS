import { createHmac } from "crypto";

/**
 * Mock Telegram user data for development
 */
export interface MockTelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

/**
 * Generate mock Telegram Mini App initData for localhost development
 * This creates valid initData that can be used to simulate Telegram environment
 */
export function generateMockInitData(
  user: MockTelegramUser,
  botToken?: string,
) {
  // Current timestamp
  const authDate = Math.floor(Date.now() / 1000);

  // Clean user data (remove undefined values)
  const cleanUserData = Object.fromEntries(
    Object.entries(user).filter(([, value]) => value !== undefined),
  );

  // Create initData parameters
  const initDataParams = new URLSearchParams();
  initDataParams.set("user", JSON.stringify(cleanUserData));
  initDataParams.set("auth_date", authDate.toString());
  initDataParams.set("start_param", "debug_mode");
  initDataParams.set("chat_type", "sender");
  initDataParams.set("chat_instance", Date.now().toString());

  // Use provided bot token or mock token for development
  const tokenToUse = botToken || "mock_token_for_development";

  // Generate hash according to Telegram spec
  const dataCheckString = Array.from(initDataParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(tokenToUse)
    .digest();
  const hash = createHmac("sha256", secretKey).update(dataCheckString).digest(
    "hex",
  );

  initDataParams.set("hash", hash);

  return {
    raw: initDataParams.toString(),
    userData: cleanUserData,
    authDate,
    hash,
  };
}

/**
 * Create a complete mock Telegram environment URL for localhost testing
 */
export function createMockTelegramUrl(
  projectId: string,
  user: MockTelegramUser,
  baseUrl: string = "http://localhost:3000",
  botToken?: string,
): string {
  const mockInitData = generateMockInitData(user, botToken);
  return `${baseUrl}/app/${projectId}?initData=${
    encodeURIComponent(mockInitData.raw)
  }`;
}

/**
 * Predefined mock users for testing
 */
export const MOCK_USERS = {
  john: {
    id: 123456789,
    first_name: "John",
    last_name: "Doe",
    username: "johndoe",
    language_code: "en",
    is_premium: false,
  },
  jane: {
    id: 987654321,
    first_name: "Jane",
    last_name: "Smith",
    username: "janesmith",
    language_code: "en",
    is_premium: true,
  },
  premium_user: {
    id: 555666777,
    first_name: "Premium",
    last_name: "User",
    username: "premiumuser",
    language_code: "en",
    is_premium: true,
  },
} as const;

/**
 * Generate mock theme parameters for Telegram Mini Apps
 */
export function generateMockThemeParams(
  colorScheme: "light" | "dark" = "light",
) {
  const lightTheme = {
    bg_color: "#ffffff",
    text_color: "#000000",
    hint_color: "#999999",
    link_color: "#2481cc",
    button_color: "#2481cc",
    button_text_color: "#ffffff",
    secondary_bg_color: "#f1f1f1",
  };

  const darkTheme = {
    bg_color: "#212121",
    text_color: "#ffffff",
    hint_color: "#aaaaaa",
    link_color: "#8774e1",
    button_color: "#8774e1",
    button_text_color: "#ffffff",
    secondary_bg_color: "#181818",
  };

  return colorScheme === "light" ? lightTheme : darkTheme;
}

/**
 * Generate complete mock launch parameters for sessionStorage
 */
export function generateMockLaunchParams(
  user: MockTelegramUser,
  colorScheme: "light" | "dark" = "light",
  botToken?: string,
) {
  const initData = generateMockInitData(user, botToken);
  const themeParams = generateMockThemeParams(colorScheme);

  return {
    tgWebAppVersion: "7.0",
    tgWebAppData: initData.raw,
    tgWebAppPlatform: "web",
    tgWebAppThemeParams: JSON.stringify(themeParams),
    tgWebAppStartParam: "debug_mode",
    tgWebAppShowSettings: "false",
    tgWebAppBotInline: "false",
    tgWebAppFullscreen: "false",
  };
}
