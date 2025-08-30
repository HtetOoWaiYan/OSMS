'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home } from 'lucide-react';

export default function AppNotFoundPage() {
  const handleClose = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.close();
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-2 text-4xl">🏪</div>
          <CardTitle className="text-xl">Shop Not Found</CardTitle>
          <CardDescription className="text-center">
            The shop you&apos;re looking for doesn&apos;t exist or has been removed.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="border-chart-3/20 bg-chart-3/5 rounded-lg border p-4">
            <div className="text-chart-3 text-sm">
              <strong>Possible reasons:</strong>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>The shop link might be incorrect</li>
                <li>The shop might have been deactivated</li>
                <li>You might need to check with the shop owner</li>
              </ul>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleClose} variant="outline" className="flex-1" size="sm">
              <Home className="mr-2 h-4 w-4" />
              Close App
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
