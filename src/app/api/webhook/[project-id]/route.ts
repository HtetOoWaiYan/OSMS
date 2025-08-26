import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { Bot } from "grammy";
import { getProjectById } from "@/lib/data/projects";

/**
 * Dynamic webhook handler for multiple Telegram bots
 * Route: /api/webhook/[project-id]
 * Each project can have its own bot with different token
 * 
 * Launch Parameters Implementation:
 * - Mini App URLs include launch parameters in the hash (e.g., #tgWebAppData=...&tgWebAppStartParam=...)
 * - Client-side handler converts hash parameters to search parameters for server-side processing
 * - This ensures compatibility with Telegram Mini Apps specification while supporting SSR
 */

// Store bot instances in memory (consider Redis for production with multiple servers)
const botInstances = new Map<string, Bot>();

/**
 * Generate mini app URL for a project - simplified for best practice
 */
function generateMiniAppUrl(projectId: string): string {
  // Use environment variable or default to localhost for development
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${baseUrl}/app/${projectId}`;
}

/**
 * Get or create bot instance for a project
 */
async function getBotForProject(projectId: string): Promise<Bot | null> {
  try {
    // Check if bot instance already exists
    if (botInstances.has(projectId)) {
      const existingBot = botInstances.get(projectId)!;
      // Ensure the bot is initialized
      if (!existingBot.botInfo) {
        await existingBot.init();
      }
      return existingBot;
    }

    // Get project data from database
    const projectResult = await getProjectById(projectId);
    if (!projectResult.success || !projectResult.data?.telegram_bot_token) {
      console.error(`Project ${projectId} not found or missing bot token`);
      return null;
    }

    // Create new bot instance
    const bot = new Bot(projectResult.data.telegram_bot_token);

    // Initialize the bot (required for Grammy)
    await bot.init();

    // Set up basic commands
    setupBotCommands(bot, projectId, projectResult.data.name);

    // Store bot instance
    botInstances.set(projectId, bot);

    return bot;
  } catch (error) {
    console.error(`Error creating bot for project ${projectId}:`, error);
    return null;
  }
}

/**
 * Set up basic bot commands
 */
function setupBotCommands(bot: Bot, projectId: string, projectName: string) {
  // Handle /start command
  bot.command("start", async (ctx) => {
    const user = ctx.from;
    if (!user) return;

    const welcomeMessage = `🌟 Welcome to ${projectName}! 🌟

Hello ${user.first_name}! I'm your shopping assistant.

Here are some things I can help you with:
• Browse our product catalog
• Add items to cart
• Place orders directly through chat
• Check order status
• Get help and support

Use /catalog to start browsing our products!`.trim();

    // Generate mini app URL for this project
    const miniAppUrl = generateMiniAppUrl(projectId);

    await ctx.reply(welcomeMessage, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🚀 Launch Mini App", web_app: { url: miniAppUrl } }],
          [{ text: "🛍️ Browse Catalog", callback_data: "catalog" }],
          [{ text: "📦 My Orders", callback_data: "orders" }],
          [{ text: "❓ Help", callback_data: "help" }],
        ],
      },
    });
  });

  // Handle /help command
  bot.command("help", async (ctx) => {
    const helpMessage = `🆘 Help & Support

Available commands:
/start - Welcome message and main menu
/launch - Open the mini app
/catalog - Browse our product catalog
/orders - View your order history
/help - Show this help message

🚀 Launch Mini App button - Opens our mobile shopping app
You can also send me messages and I'll assist you with your shopping needs!

For support, contact our team directly.`.trim();

    await ctx.reply(helpMessage);
  });

  // Handle /catalog command
  bot.command("catalog", async (ctx) => {
    // TODO: Implement catalog browsing
    await ctx.reply("🛍️ Product catalog feature coming soon! Stay tuned.");
  });

  // Handle /orders command
  bot.command("orders", async (ctx) => {
    // TODO: Implement order history
    await ctx.reply("📦 Order history feature coming soon! Stay tuned.");
  });

  // Handle /launch command
  bot.command("launch", async (ctx) => {
    const miniAppUrl = generateMiniAppUrl(projectId);

    await ctx.reply(
      `🚀 **Launch Mini App**

Click the button below to open our mobile shopping app:`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🛍️ Open Purple Shopping", web_app: { url: miniAppUrl } }],
          ],
        },
        parse_mode: "Markdown",
      }
    );
  });

  // Handle callback queries from inline keyboards
  bot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data;

    switch (data) {
      case "catalog":
        await ctx.editMessageText(
          "🛍️ Product catalog feature coming soon! Stay tuned.",
        );
        break;
      case "orders":
        await ctx.editMessageText(
          "📦 Order history feature coming soon! Stay tuned.",
        );
        break;
      case "help":
        const helpMessage = `🆘 Help & Support

Available commands:
/start - Welcome message and main menu
/launch - Open the mini app
/catalog - Browse our product catalog
/orders - View your order history
/help - Show this help message`.trim();
        await ctx.editMessageText(helpMessage);
        break;
      default:
        await ctx.answerCallbackQuery("Unknown action");
    }

    await ctx.answerCallbackQuery();
  });

  // Handle text messages
  bot.on("message:text", async (ctx) => {
    const message = ctx.message.text.toLowerCase();

    // Simple keyword responses
    if (message.includes("hello") || message.includes("hi")) {
      await ctx.reply(
        `Hello! Welcome to ${projectName}. How can I help you today?`,
      );
    } else if (message.includes("catalog") || message.includes("product")) {
      await ctx.reply(
        "🛍️ Product catalog feature is coming soon! Use /catalog to browse when available.",
      );
    } else if (message.includes("order")) {
      await ctx.reply(
        "📦 Order management feature is coming soon! Use /orders to check your orders when available.",
      );
    } else {
      // Default response for unrecognized messages
      await ctx.reply(
        `I understand you said: "${ctx.message.text}"\n\nI'm still learning! For now, please use the commands above or type /help for assistance.`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "🆘 Help", callback_data: "help" }],
            ],
          },
        },
      );
    }
  });

  console.log(`Bot commands set up for project: ${projectName} (${projectId})`);
}

/**
 * Handle GET requests for webhook verification
 * Telegram sends a GET request to verify the webhook URL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ "project-id": string }> },
) {
  try {
    const { "project-id": projectId } = await params;

    console.log(`Webhook verification request for project: ${projectId}`);

    // Get bot instance to verify project exists
    const bot = await getBotForProject(projectId);

    if (!bot) {
      console.error(`Bot setup failed for project: ${projectId}`);
      return NextResponse.json(
        { error: "Bot not configured for this project" },
        { status: 404 },
      );
    }

    // Return success for webhook verification
    return NextResponse.json({
      status: "ok",
      message: "Webhook verified successfully",
      project_id: projectId,
    });
  } catch (error) {
    console.error("Webhook GET error:", error);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 500 },
    );
  }
}

/**
 * Handle POST requests for incoming Telegram updates
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ "project-id": string }> },
) {
  try {
    const { "project-id": projectId } = await params;

    console.log(`Incoming webhook for project: ${projectId}`);

    // Get bot instance
    const bot = await getBotForProject(projectId);

    if (!bot) {
      console.error(`Bot not found for project: ${projectId}`);
      return NextResponse.json(
        { error: "Bot not configured for this project" },
        { status: 404 },
      );
    }

    // Get raw request body
    const body = await request.text();

    // Parse the update
    let update;
    try {
      update = JSON.parse(body);
    } catch (parseError) {
      console.error("Failed to parse webhook body:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in webhook body" },
        { status: 400 },
      );
    }

    console.log("Received update:", JSON.stringify(update, null, 2));

    // Handle the update with Grammy
    try {
      await bot.handleUpdate(update);
      console.log("Update handled successfully");
    } catch (handleError) {
      console.error("Error handling update:", handleError);
      // Still return 200 to acknowledge receipt even if processing failed
    }

    // Return 200 OK to acknowledge receipt
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook POST error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
