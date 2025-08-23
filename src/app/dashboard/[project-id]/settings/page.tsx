import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getProject, maskBotToken, checkUserPermissions } from '@/lib/data/projects';
import { updateProjectAction } from '@/lib/actions/projects';
import { ProjectSettingsForm } from '@/components/project-settings-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Force dynamic rendering since we need to access cookies for authentication
export const dynamic = 'force-dynamic';

interface SettingsPageProps {
  params: Promise<{
    'project-id': string;
  }>;
}

async function ProjectSettingsContent({ projectId }: { projectId: string }) {
  // Check permissions first
  const permissionsResult = await checkUserPermissions(projectId);
  if (!permissionsResult.success || !permissionsResult.data?.isAdmin) {
    redirect(`/dashboard/${projectId}/unauthorized`);
  }

  // Get project data
  const result = await getProject(projectId);
  if (!result.success || !result.data) {
    redirect('/dashboard');
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

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { 'project-id': projectId } = await params;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your project settings and configuration</p>
      </div>

      <Suspense fallback={<ProjectSettingsLoading />}>
        <ProjectSettingsContent projectId={projectId} />
      </Suspense>
    </div>
  );
}
