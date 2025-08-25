# Telegram Integration

This directory contains all Telegram-related functionality for the Purple Shopping system.

## Mini App Setup

### Route Structure
- **Mini App URL**: `/app/[project-id]`
- **Example**: `https://your-domain.com/app/project-uuid-123`
- **Authentication**: Automatic via `initData` validation

### InitData Validation

The mini app uses server-side validation of Telegram's `initData` to ensure authenticity:

```typescript
// Automatic validation in layout.tsx
const validationResult = await validateTelegramInitData(
  initDataRaw,
  project.telegram_bot_token
);
```

**Validation Process:**
1. Parse `initData` as query parameters
2. Extract key-value pairs (excluding `hash`)
3. Sort alphabetically
4. Create HMAC-SHA256 with `WebAppData` + bot token
5. Create HMAC-SHA256 with result + sorted pairs
6. Compare with provided `hash`
7. Validate timestamp (not older than 24 hours)

### Webhook Setup

Webhooks are automatically configured when projects are created or updated:

```typescript
// Automatic webhook setup during project creation
const webhookUrl = `https://your-domain.com/api/webhook/${projectId}`;
await setWebhook(botToken, webhookUrl);
```

## API Functions

### Webhook Management
```typescript
import { setWebhook, removeWebhook, getWebhookInfo } from '@/lib/telegram/api';

// Set webhook for a bot
await setWebhook(botToken, webhookUrl);

// Remove webhook
await removeWebhook(botToken);

// Get webhook status
const info = await getWebhookInfo(botToken);
```

### InitData Validation
```typescript
import { validateTelegramInitData } from '@/lib/telegram/init-data-validation';

// Validate initData
const result = await validateTelegramInitData(initDataRaw, botToken);

if (result.isValid) {
  console.log('User:', result.user);
  console.log('Auth Date:', result.authDate);
}
```

## Mini App Features

### Current Status
- ✅ **Authentication**: Server-side `initData` validation
- ✅ **User Verification**: Automatic user data extraction
- ✅ **Error Handling**: Comprehensive error pages
- ✅ **Loading States**: Smooth loading experience
- ⏳ **Product Catalog**: Coming in Phase 4
- ⏳ **Shopping Cart**: Coming in Phase 4
- ⏳ **Order Management**: Coming in Phase 4

### URL Parameters
Telegram passes the following via URL search params:
- `initData`: Authentication data (required)
- Other parameters as documented in Telegram Mini Apps spec

### Error Codes
- `no_init_data`: No authentication data provided
- `project_not_found`: Project doesn't exist or has no bot token
- `invalid_init_data`: Hash validation failed
- `invalid_user`: User data parsing failed

## Development

### Testing Locally
1. Use ngrok to expose local server: `ngrok http 3000`
2. Update project webhook URL to: `https://xxx.ngrok.io/api/webhook/project-id`
3. Test mini app at: `https://xxx.ngrok.io/app/project-id`

### Environment Variables
```env
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
# For local development: http://localhost:3000
```

### Mini App Launch

The bot includes a **Launch Mini App** button that opens the Telegram Mini App:

- **Button in /start**: Primary launch button in welcome message
- **/launch command**: Direct command to open mini app
- **Web App URL**: Uses `web_app` type for seamless opening
- **Dynamic URLs**: Automatically generates project-specific URLs

### Debugging
- Check server logs for validation results
- Use the debug panel in development mode
- Verify webhook setup with `getWebhookInfo()`

## Security Notes

- **Server-side validation**: All `initData` is validated on the server
- **Bot token security**: Tokens are encrypted in database
- **Timestamp validation**: `initData` must be less than 24 hours old
- **Project isolation**: Each project has its own bot and webhook
- **HTTPS required**: All webhooks must use HTTPS in production