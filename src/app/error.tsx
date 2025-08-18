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
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-red-600">Something went wrong!</CardTitle>
          <CardDescription>
            We encountered an unexpected error. Please try again or contact support if the problem
            persists.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 rounded bg-gray-100 p-3 text-left text-sm">
              <strong>Error details:</strong>
              <pre className="mt-2 overflow-auto text-xs">{error.message}</pre>
              {error.digest && (
                <p className="mt-2">
                  <strong>Error ID:</strong> {error.digest}
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-2">
          <Button onClick={() => reset()} variant="default">
            Try again
          </Button>
          <Button onClick={() => (window.location.href = '/')} variant="outline">
            Go home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
