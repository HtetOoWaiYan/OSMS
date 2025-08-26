import 'server-only';
import { validateTelegramInitData } from '@/lib/telegram/init-data-validation';
import { getProjectById } from '@/lib/data/projects';

interface AppPageProps {
  params: Promise<{ 'project-id': string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AppPage({ params, searchParams }: AppPageProps) {
  try {
    const { 'project-id': projectId } = await params;
    const searchParamsData = await searchParams;

    console.log(`Mini App accessed for project: ${projectId}`);

    // Get initData from search params (passed by Telegram)
    const initDataRaw = searchParamsData.initData as string;

    console.log({ searchParamsData });

    if (!initDataRaw) {
      console.error('No initData provided');
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
              Missing initData. Please open this app through Telegram.
            </p>
          </div>
        </div>
      );
    }

    // Get project to retrieve bot token
    const projectResult = await getProjectById(projectId);

    if (!projectResult.success || !projectResult.data?.telegram_bot_token) {
      console.error(`Project not found or no bot token for project: ${projectId}`);
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/20">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <span className="font-medium text-red-700 dark:text-red-300">❌ Project Error</span>
            </div>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              Project not found or bot token is missing.
            </p>
          </div>
        </div>
      );
    }

    const project = projectResult.data;

    // Validate the initData using the bot token
    const validationResult = await validateTelegramInitData(
      initDataRaw,
      project.telegram_bot_token!,
    );

    if (!validationResult.isValid) {
      console.error(`Invalid initData for project ${projectId}:`, validationResult.error);
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/20">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <span className="font-medium text-red-700 dark:text-red-300">
                ❌ Validation Error
              </span>
            </div>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              Invalid initData. Please try reopening the app.
            </p>
          </div>
        </div>
      );
    }

    if (!validationResult.user) {
      console.error(`No user data in valid initData for project ${projectId}`);
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/20">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <span className="font-medium text-red-700 dark:text-red-300">❌ User Data Error</span>
            </div>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              No user data found. Please try again.
            </p>
          </div>
        </div>
      );
    }

    const user = validationResult.user;

    console.log(`Valid Telegram initData for user: ${user.id}`);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-foreground text-2xl font-bold">
            🛍️ {project.name || 'Purple Shopping'}
          </h1>
          <p className="text-muted-foreground">Welcome, {user.first_name}! 🎉</p>
          <p className="text-muted-foreground text-sm">Authentication successful!</p>
        </div>

        {/* User Info Card */}
        <div className="bg-card space-y-3 rounded-lg border p-4">
          <h2 className="text-card-foreground font-semibold">Your Information</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="text-card-foreground">
                {user.first_name} {user.last_name || ''}
              </span>
            </div>

            {user.username && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Username:</span>
                <span className="text-card-foreground">@{user.username}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID:</span>
              <span className="text-card-foreground font-mono">{user.id}</span>
            </div>

            {user.language_code && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Language:</span>
                <span className="text-card-foreground">{user.language_code}</span>
              </div>
            )}

            {user.is_premium && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Premium:</span>
                <span className="text-amber-500">⭐ Premium</span>
              </div>
            )}

            {validationResult.authDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Auth Time:</span>
                <span className="text-card-foreground font-mono text-xs">
                  {new Date(validationResult.authDate * 1000).toLocaleString()}
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

        {/* Coming Soon */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
          <h3 className="mb-2 font-semibold text-blue-700 dark:text-blue-300">🚀 Coming Soon</h3>
          <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-400">
            <li>• Browse product catalog</li>
            <li>• Add items to cart</li>
            <li>• Place orders</li>
            <li>• Track order status</li>
          </ul>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <details className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-950/20">
            <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
              🔍 Debug Info (Development Only)
            </summary>
            <div className="mt-3 space-y-2 font-mono text-xs">
              <div>
                <span className="text-gray-500">Project ID:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">{projectId}</span>
              </div>
              <div>
                <span className="text-gray-500">Project Name:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">{project.name}</span>
              </div>
              <div>
                <span className="text-gray-500">Auth Date:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  {validationResult.authDate
                    ? new Date(validationResult.authDate * 1000).toISOString()
                    : 'N/A'}
                </span>
              </div>
            </div>
          </details>
        )}
      </div>
    );
  } catch (error) {
    console.error('Unexpected error in AppPage:', error);
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/20">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <span className="font-medium text-red-700 dark:text-red-300">❌ Unexpected Error</span>
          </div>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            An unexpected error occurred. Please try again later.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-2 text-xs text-red-500">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
