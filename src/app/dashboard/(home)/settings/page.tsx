import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { getUserProject, maskBotToken } from '@/lib/data/projects';
import { updateProjectAction } from '@/lib/actions/projects';
import { requireAdmin } from '@/lib/auth/roles';
import { ProjectSettingsForm } from '@/components/project-settings-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Force dynamic rendering since we need to access cookies for authentication
export const dynamic = 'force-dynamic';

async function ProjectSettingsContent() {
  const result = await getUserProject();

  if (!result.success) {
    redirect('/dashboard/onboarding');
  }

  if (!result.data) {
    redirect('/dashboard/onboarding');
  }

  const project = result.data;
  const maskedToken = maskBotToken(project.telegram_bot_token || '');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>
            Manage your shop settings and Telegram bot configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectSettingsForm
            project={project}
            maskedBotToken={maskedToken}
            updateAction={updateProjectAction}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>View additional information about your project.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <dt className="text-muted-foreground text-sm font-medium">Project ID</dt>
            <dd className="font-mono text-sm">{project.id}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm font-medium">Created</dt>
            <dd className="text-sm">
              {project.created_at
                ? new Date(project.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Unknown'}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm font-medium">Last Updated</dt>
            <dd className="text-sm">
              {project.updated_at
                ? new Date(project.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Unknown'}
            </dd>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectSettingsLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>
            Manage your shop settings and Telegram bot configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>View additional information about your project.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default async function SettingsPage() {
  // Require admin role to access settings
  await requireAdmin();

  return (
    <>
      <PageHeader title="Settings" description="Manage your project settings and configuration" />

      <Suspense fallback={<ProjectSettingsLoading />}>
        <ProjectSettingsContent />
      </Suspense>
    </>
  );
}
