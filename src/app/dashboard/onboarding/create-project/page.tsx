import ProjectCreationForm from '../../../../components/project-creation-form';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function CreateProjectPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Navigation */}
      <div className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/onboarding/bot-setup" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Bot Setup
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
      <div className="container mx-auto max-w-md px-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Your Project</CardTitle>
            <CardDescription>
              Set up your online shop to start managing items and orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectCreationForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
