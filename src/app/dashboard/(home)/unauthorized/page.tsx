import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader 
        title="Access Denied"
        description="You don't have permission to access this page"
      />
      
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <ShieldX className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl">Access Restricted</CardTitle>
            <CardDescription>
              This page requires admin privileges. Contact your project administrator if you need access.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/dashboard">
                Return to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
