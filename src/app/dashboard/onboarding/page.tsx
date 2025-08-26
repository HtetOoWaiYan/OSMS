import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Check } from 'lucide-react';

// Force dynamic rendering since this page may need to check authentication
export const dynamic = 'force-dynamic';

export default function WelcomePage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto max-w-md px-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mb-6 flex justify-center">
              <Image
                src="/logo.svg"
                alt="Purple Shopping"
                width={200}
                height={32}
                className="h-8 w-auto"
              />
            </div>
            <CardTitle className="text-xl">Welcome!</CardTitle>
            <CardDescription>Set up your shop management system in 4 simple steps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* What You Get */}
            <div>
              <h3 className="mb-3 font-semibold">What you get:</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Manage inventory and process orders</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Telegram Mini-App for customers</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Order tracking and customer management</span>
                </div>
              </div>
            </div>

            {/* Setup Steps */}
            <div className="border-t pt-6">
              <h3 className="mb-3 font-semibold">Quick setup:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-3">
                  <span className="bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
                    1
                  </span>
                  <span>Create your Telegram bot</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-muted text-muted-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
                    2
                  </span>
                  <span>Set up your shop details</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-muted text-muted-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
                    3
                  </span>
                  <span>Configure payment methods</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-muted text-muted-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
                    4
                  </span>
                  <span>Start managing your business</span>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="pt-4">
              <Button className="w-full" asChild>
                <Link href="/dashboard/onboarding/bot-setup">
                  Start Setup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
