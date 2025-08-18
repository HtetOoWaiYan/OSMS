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
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-5xl">⚠️</div>
          <CardTitle className="text-xl text-red-600">Dashboard Unavailable</CardTitle>
          <CardDescription>
            We&apos;re experiencing technical difficulties with the dashboard. Our team has been
            notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4 text-sm">
            This could be a temporary issue. Please try refreshing the page or check back in a few
            minutes.
          </p>
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
        <CardFooter className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => reset()} variant="default">
            Try Again
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/auth/login">Re-login</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/">Go Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
