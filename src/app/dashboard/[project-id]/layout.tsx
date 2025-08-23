import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProject, checkUserPermissions } from '@/lib/data/projects';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    'project-id': string;
  }>;
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const supabase = await createClient();
  const { 'project-id': projectId } = await params;

  // Check authentication
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect('/dashboard/auth/login');
  }

  // Verify project exists and user has access to it
  const projectResult = await getProject(projectId);
  if (!projectResult.success) {
    redirect('/dashboard'); // Redirect to project listing
  }

  // Check user permissions for this project
  const permissionsResult = await checkUserPermissions(projectId);
  if (!permissionsResult.success) {
    redirect('/dashboard'); // Redirect to project listing
  }

  const project = projectResult.data!;
  const permissions = permissionsResult.data!;

  return (
    <SidebarProvider>
      <AppSidebar
        user={data.claims}
        isAdmin={permissions.isAdmin}
        project={project}
        projectId={projectId}
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
