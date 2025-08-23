import { getUserRole } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const userRole = await getUserRole();

  // If no user role found, redirect to login
  if (!userRole) {
    redirect('/dashboard/auth/login');
  }

  // If user is not admin, redirect to unauthorized page
  if (userRole.role !== 'admin') {
    redirect('/dashboard/unauthorized');
  }

  return <>{children}</>;
}
