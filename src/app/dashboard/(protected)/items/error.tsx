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
    console.error('Items management error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-lg text-red-600">Items Loading Error</CardTitle>
          <CardDescription>
            Unable to load items. There might be a connection issue or server problem.
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
            Retry loading
          </Button>
          <Button onClick={() => (window.location.href = '/dashboard')} variant="outline">
            Back to dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
