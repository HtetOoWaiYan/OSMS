import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserProjects } from '@/lib/data/projects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default async function ProjectsPage() {
  const supabase = await createClient();

  // Check authentication
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect('/dashboard/auth/login');
  }

  // Get all user projects
  const projectsResult = await getUserProjects();
  if (!projectsResult.success) {
    throw new Error(projectsResult.error || 'Failed to load projects');
  }

  const projects = projectsResult.data || [];

  // If user has no projects, redirect to onboarding
  if (projects.length === 0) {
    redirect('/dashboard/onboarding');
  }

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-2">
            <Image
              src="/logo.svg"
              alt="Purple Shopping"
              width={180}
              height={32}
              className="h-8 w-auto"
            />
          </div>
          <div className="text-muted-foreground text-sm">Welcome, {data.claims.email}</div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto max-w-7xl p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Your Projects</h1>
              <p className="text-muted-foreground">
                Select a project to manage or create a new one
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/onboarding">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Link>
            </Button>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {project.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    <Badge variant={project.userRole.role === 'admin' ? 'default' : 'secondary'}>
                      {project.userRole.role}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-muted-foreground space-y-1 text-sm">
                      <p>Created: {new Date(project.created_at || '').toLocaleDateString()}</p>
                      {project.updated_at && project.updated_at !== project.created_at && (
                        <p>Updated: {new Date(project.updated_at).toLocaleDateString()}</p>
                      )}
                    </div>

                    <Button asChild className="w-full">
                      <Link href={`/dashboard/${project.id}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Project
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
