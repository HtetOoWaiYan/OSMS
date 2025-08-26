import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { PaymentMethodsSetupForm } from '@/components/onboarding/payment-methods-setup-form';

// Force dynamic rendering since this page may need to check authentication
export const dynamic = 'force-dynamic';

interface PaymentSetupPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PaymentSetupPage({ searchParams }: PaymentSetupPageProps) {
  const resolvedSearchParams = await searchParams;
  const projectId =
    typeof resolvedSearchParams.projectId === 'string' ? resolvedSearchParams.projectId : '';

  return (
    <div className="bg-background min-h-screen">
      {/* Navigation */}
      <div className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/onboarding/create-project" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Project Setup
            </Link>
          </Button>
          <Image
            src="/logo.svg"
            alt="Purple Shopping"
            width={120}
            height={19}
            className="h-5 w-auto"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Payment Methods Setup</CardTitle>
            <CardDescription>
              Configure payment options for your Telegram Mini-App customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentMethodsSetupForm projectId={projectId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
