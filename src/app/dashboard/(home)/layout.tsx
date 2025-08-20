import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserProject } from '@/lib/data/projects';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // Check authentication
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect('/auth/login');
  }

  // Check if user has a project - redirect to onboarding if they don't
  const projectResult = await getUserProject();
  if (projectResult.success && !projectResult.data) {
    redirect('/dashboard/onboarding');
  }

  return (
    <SidebarProvider>
      <AppSidebar user={data.claims} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
