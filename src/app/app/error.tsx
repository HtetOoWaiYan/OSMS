'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

// Type declaration for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        close(): void;
      };
    };
  }
}

export default function AppErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'no_init_data':
        return {
          title: 'Missing Authentication',
          description:
            'No authentication data was provided. Please launch this app through Telegram.',
          icon: '🚫',
        };
      case 'project_not_found':
        return {
          title: 'Shop Not Found',
          description: 'The requested shop could not be found or is not configured properly.',
          icon: '🏪',
        };
      case 'invalid_init_data':
        return {
          title: 'Authentication Failed',
          description:
            'The authentication data could not be verified. Please try launching the app again.',
          icon: '🔐',
        };
      case 'invalid_user':
        return {
          title: 'User Verification Failed',
          description:
            'Could not verify your user information. Please try launching the app again.',
          icon: '👤',
        };
      default:
        return {
          title: 'Something Went Wrong',
          description: 'An unexpected error occurred. Please try again later.',
          icon: '⚠️',
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  const handleRetry = () => {
    // Try to reload the mini app
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.close();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-2 text-4xl">{errorInfo.icon}</div>
          <CardTitle className="text-xl">{errorInfo.title}</CardTitle>
          <CardDescription className="text-center">{errorInfo.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-destructive mt-0.5 h-4 w-4 flex-shrink-0" />
              <div className="space-y-2">
                <div className="text-destructive text-sm font-medium">Error Details</div>
                <div className="text-destructive/80 text-xs">Code: {error || 'unknown'}</div>
                <div className="text-destructive/80 text-xs">
                  If this problem persists, please contact support.
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleRetry} className="flex-1" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="rounded-lg border bg-gray-50 p-3 dark:bg-gray-950/20">
              <summary className="cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300">
                🔍 Debug Info (Development Only)
              </summary>
              <div className="mt-2 space-y-1 font-mono text-xs">
                <div>
                  <span className="text-gray-500">Error Code:</span>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">{error || 'null'}</span>
                </div>
                <div>
                  <span className="text-gray-500">User Agent:</span>
                  <span className="ml-2 break-all text-gray-700 dark:text-gray-300">
                    {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">URL:</span>
                  <span className="ml-2 break-all text-gray-700 dark:text-gray-300">
                    {typeof window !== 'undefined' ? window.location.href : 'N/A'}
                  </span>
                </div>
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
