import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserProject } from '@/lib/data/projects';

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // Check authentication
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect('/dashboard/auth/login');
  }

  try {
    // Check if user already has a project
    const result = await getUserProject();

    // If there's an error, log it but don't block the onboarding flow
    if (!result.success) {
      console.log('Could not check existing project:', result.error);
    }
  } catch (error) {
    // Log error but don't block onboarding flow
    console.log('Error in onboarding layout:', error);
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
