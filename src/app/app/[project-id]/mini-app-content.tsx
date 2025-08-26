'use client';

import { useTelegramUser, useTelegram, useIsTelegram } from '@/components/telegram-provider';

export default function MiniAppContent() {
  const { user, project, authDate, isLoading, error, isAuthenticated } = useTelegramUser();
  const { launchParams } = useTelegram();
  const isTelegram = useIsTelegram();

  // Type-safe access to launch parameters
  const startParam = launchParams?.tgWebAppStartParam as string;
  const platform = launchParams?.tgWebAppPlatform as string;
  const version = launchParams?.tgWebAppVersion as string;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="rounded-lg border bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/20">
          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-blue-700 dark:text-blue-300">Connecting to Telegram...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not in Telegram environment
  if (!isTelegram) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-950/20">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
            <span className="font-medium text-yellow-700 dark:text-yellow-300">
              ⚠️ Telegram Required
            </span>
          </div>
          <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
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
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/20">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <span className="font-medium text-red-700 dark:text-red-300">
              ❌ Authentication Error
            </span>
          </div>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error || 'Failed to authenticate with Telegram'}
          </p>
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">
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
          <div className="mx-auto max-w-md rounded-lg border border-blue-200 bg-blue-50 p-2 dark:border-blue-800 dark:bg-blue-950/20">
            <p className="text-xs text-blue-600 dark:text-blue-400">
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
              <span className="text-amber-500">⭐ Premium</span>
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
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="font-medium text-green-700 dark:text-green-300">
            ✅ Verification Complete
          </span>
        </div>
        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
          Your Telegram Mini App has been successfully verified and authenticated.
        </p>
      </div>

      {/* App Environment Info */}
      <div className="rounded-lg border bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
        <h3 className="mb-2 font-semibold text-blue-700 dark:text-blue-300">📱 App Environment</h3>
        <div className="space-y-1 text-sm text-blue-600 dark:text-blue-400">
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
      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950/20">
        <h3 className="mb-2 font-semibold text-purple-700 dark:text-purple-300">🚀 Coming Soon</h3>
        <ul className="space-y-1 text-sm text-purple-600 dark:text-purple-400">
          <li>• Browse product catalog</li>
          <li>• Add items to cart</li>
          <li>• Place orders</li>
          <li>• Track order status</li>
        </ul>
      </div>

      {/* Development Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <details className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-950/20">
          <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
            🔍 Debug Info (Development Only)
          </summary>
          <div className="mt-3 space-y-2 font-mono text-xs">
            <div>
              <span className="text-gray-500">Project:</span>
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                {project?.name} ({project?.id})
              </span>
            </div>
            <div>
              <span className="text-gray-500">User ID:</span>
              <span className="ml-2 text-gray-700 dark:text-gray-300">{user?.id}</span>
            </div>
            {authDate && (
              <div>
                <span className="text-gray-500">Auth Date:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  {new Date(authDate * 1000).toISOString()}
                </span>
              </div>
            )}
            <div>
              <span className="text-gray-500">Launch Parameters:</span>
              <pre className="mt-1 overflow-x-auto rounded bg-gray-100 p-2 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {JSON.stringify(launchParams, null, 2)}
              </pre>
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
