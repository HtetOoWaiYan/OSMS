import { redirect } from 'next/navigation';
import { getUserProject } from '@/lib/data/projects';

/**
 * Dashboard root page that redirects users based on their project status:
 * - Users with projects → Dashboard protected area
 * - Users without projects → Onboarding flow
 */
export default async function DashboardPage() {
  const result = await getUserProject();

  // If there's an error or user has no project, send to onboarding
  if (!result.success || !result.data) {
    redirect('/dashboard/onboarding');
  }

  // User has a project, send to protected dashboard
  redirect('/dashboard/(protected)');
}
