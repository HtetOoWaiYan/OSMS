import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // Check authentication
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
