import { getUserRole } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  params,
  children,
}: {
  children: React.ReactNode;
  params: Promise<{
    'project-id': string;
  }>;
}) {
  const { 'project-id': projectId } = await params;
  const userRole = await getUserRole(projectId);

  // If no user role found, redirect to login
  if (!userRole) {
    redirect('/dashboard/auth/login');
  }

  // If user is not admin, redirect to unauthorized page
  if (userRole.role !== 'admin') {
    redirect(`/dashboard/${projectId}/unauthorized`);
  }

  return <>{children}</>;
}
