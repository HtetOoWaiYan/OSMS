'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Authentication error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-red-600">Authentication Error</CardTitle>
          <CardDescription>
            There was a problem with the authentication process. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 rounded bg-gray-100 p-3 text-left text-sm">
              <strong>Error details:</strong>
              <pre className="mt-2 overflow-auto text-xs">{error.message}</pre>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-2">
          <Button onClick={() => reset()} variant="default">
            Try again
          </Button>
          <Button
            onClick={() => (window.location.href = '/dashboard/auth/login')}
            variant="outline"
          >
            Back to login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
