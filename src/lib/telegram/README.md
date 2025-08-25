# Telegram Bot Integration

This directory contains the Telegram bot integration for the Purple Shopping system.

## Webhook Setup

### Dynamic Webhook Handler
The webhook handler is located at `/api/webhook/[project-id]` and supports multiple bots for different projects.

**Features:**
- Dynamic bot instances per project
- Basic commands: `/start`, `/help`, `/catalog`, `/orders`
- Inline keyboard support
- Automatic bot token retrieval from database
- Webhook verification support

### Setting Up a Bot for a Project

1. **Create a Telegram Bot:**
   - Message @BotFather on Telegram
   - Send `/newbot` command
   - Follow prompts to create your bot
   - Copy the bot token

2. **Configure Bot Token:**
   - Go to your project settings in the dashboard
   - Enter the bot token in the Telegram Bot Token field
   - The system will automatically handle webhook setup

3. **Webhook URL Format:**
   ```
   https://your-domain.com/api/webhook/project-id
   ```

### Testing the Webhook

Use the test utility to validate webhook setup:

```typescript
import { testWebhookSetup } from '@/lib/telegram/webhook-test';

const result = await testWebhookSetup('your-project-id');
console.log(result);
```

### Available Commands

- `/start` - Welcome message with inline keyboard
- `/help` - Show available commands
- `/catalog` - Browse products (coming soon)
- `/orders` - View order history (coming soon)

### Bot Commands Setup

The bot automatically responds to:
- Text messages with keyword recognition
- Callback queries from inline keyboards
- Basic conversational patterns

### Security Notes

- Bot tokens are stored encrypted in the database
- Webhooks use service role client to bypass RLS
- Each project has its own isolated bot instance
- All webhook endpoints are protected by project ID validation

### Development

To test locally:
1. Use ngrok or similar to expose your local server
2. Set the webhook URL in your project settings
3. The bot will receive messages at the exposed URL

### Future Enhancements

- Product catalog browsing
- Order placement through chat
- Order status notifications
- Customer support integration
- Mini-app integration
