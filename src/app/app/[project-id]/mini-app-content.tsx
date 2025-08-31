'use client';

import { useTelegramUser, useIsTelegram } from '@/components/telegram-provider';
import { useTelegramStore } from '@/hooks/use-telegram-store';

export default function MiniAppContent() {
  const { user, project, authDate, isLoading, error, isAuthenticated } = useTelegramUser();
  const { launchParams } = useTelegramStore();
  const isTelegram = useIsTelegram();

  // Type-safe access to launch parameters
  const startParam = launchParams?.tgWebAppStartParam as string;
  const platform = launchParams?.tgWebAppPlatform as string;
  const version = launchParams?.tgWebAppVersion as string;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="bg-primary/5 dark:border-primary/20 rounded-lg border p-6">
          <div className="flex items-center space-x-3">
            <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"></div>
            <span className="text-primary">Connecting to Telegram...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not in Telegram environment
  if (!isTelegram) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="border-destructive/20 bg-destructive/5 rounded-lg border p-6">
          <div className="flex items-center space-x-2">
            <div className="bg-destructive h-2 w-2 rounded-full"></div>
            <span className="text-destructive font-medium">⚠️ Telegram Required</span>
          </div>
          <p className="text-destructive/80 mt-2 text-sm">
            This app must be opened through Telegram.
          </p>
        </div>
      </div>
    );
  }

  // Authentication error
  if (error || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="border-destructive/20 bg-destructive/5 rounded-lg border p-6">
          <div className="flex items-center space-x-2">
            <div className="bg-destructive h-2 w-2 rounded-full"></div>
            <span className="text-destructive font-medium">❌ Authentication Error</span>
          </div>
          <p className="text-destructive/80 mt-2 text-sm">
            {error || 'Failed to authenticate with Telegram'}
          </p>
          <p className="text-destructive/70 mt-1 text-xs">
            Please try reopening the app from Telegram.
          </p>
        </div>
      </div>
    );
  }

  // Success - show the main app
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-foreground text-2xl font-bold">
          🛍️ {project?.name || 'Purple Shopping'}
        </h1>
        <p className="text-muted-foreground">Welcome, {user?.first_name}! 🎉</p>
        <p className="text-muted-foreground text-sm">Authentication successful!</p>

        {/* Start parameter indicator */}
        {startParam && (
          <div className="border-primary/20 bg-primary/5 mx-auto max-w-md rounded-lg border p-2">
            <p className="text-primary text-xs">
              🚀 Start parameter: <span className="font-mono">{startParam}</span>
            </p>
          </div>
        )}
      </div>

      {/* User Info Card */}
      <div className="bg-card space-y-3 rounded-lg border p-4">
        <h2 className="text-card-foreground font-semibold">Your Information</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span className="text-card-foreground">
              {user?.first_name} {user?.last_name || ''}
            </span>
          </div>

          {user?.username && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Username:</span>
              <span className="text-card-foreground">@{user.username}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-muted-foreground">User ID:</span>
            <span className="text-card-foreground font-mono">{user?.id}</span>
          </div>

          {user?.language_code && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Language:</span>
              <span className="text-card-foreground">{user.language_code}</span>
            </div>
          )}

          {user?.is_premium && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Premium:</span>
              <span className="text-chart-3">⭐ Premium</span>
            </div>
          )}

          {authDate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Auth Time:</span>
              <span className="text-card-foreground font-mono text-xs">
                {new Date(authDate * 1000).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Status Card */}
      <div className="border-chart-1/20 bg-chart-1/5 rounded-lg border p-4">
        <div className="flex items-center space-x-2">
          <div className="bg-chart-1 h-2 w-2 rounded-full"></div>
          <span className="text-chart-1 font-medium">✅ Verification Complete</span>
        </div>
        <p className="text-chart-1/80 mt-2 text-sm">
          Your Telegram Mini App has been successfully verified and authenticated.
        </p>
      </div>

      {/* App Environment Info */}
      <div className="bg-primary/5 rounded-lg border p-4">
        <h3 className="text-primary mb-2 font-semibold">📱 App Environment</h3>
        <div className="text-primary/80 space-y-1 text-sm">
          {platform && (
            <div>
              <span className="font-medium">Platform:</span> {platform}
            </div>
          )}
          {version && (
            <div>
              <span className="font-medium">Version:</span> {version}
            </div>
          )}
        </div>
      </div>

      {/* Coming Soon */}
      <div className="border-chart-2/20 bg-chart-2/5 rounded-lg border p-4">
        <h3 className="text-chart-2 mb-2 font-semibold">🚀 Coming Soon</h3>
        <ul className="text-chart-2/80 space-y-1 text-sm">
          <li>• Browse product catalog</li>
          <li>• Add items to cart</li>
          <li>• Place orders</li>
          <li>• Track order status</li>
        </ul>
      </div>

      {/* Development Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <details className="bg-muted rounded-lg border p-4">
          <summary className="text-muted-foreground cursor-pointer font-medium">
            🔍 Debug Info (Development Only)
          </summary>
          <div className="mt-3 space-y-2 font-mono text-xs">
            <div>
              <span className="text-muted-foreground">Project:</span>
              <span className="text-foreground ml-2">
                {project?.name} ({project?.id})
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">User ID:</span>
              <span className="text-foreground ml-2">{user?.id}</span>
            </div>
            {authDate && (
              <div>
                <span className="text-muted-foreground">Auth Date:</span>
                <span className="text-foreground ml-2">
                  {new Date(authDate * 1000).toISOString()}
                </span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Launch Parameters:</span>
              <pre className="bg-muted text-foreground mt-1 overflow-x-auto rounded p-2">
                {JSON.stringify(launchParams, null, 2)}
              </pre>
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
