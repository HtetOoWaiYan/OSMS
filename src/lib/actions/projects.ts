'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createProjectSchema } from '@/lib/validations/projects';
import { createProject, getUserProject } from '@/lib/data/projects';

/**
 * Server Actions for project management
 * These are thin wrappers that handle form validation, user feedback, and redirects
 */

export async function createProjectAction(formData: FormData) {
  try {
    // Extract and validate form data
    const validatedData = createProjectSchema.parse({
      name: formData.get('name'),
      description: formData.get('description') || null,
      telegram_bot_token: formData.get('telegram_bot_token'),
    });

    // Call data layer
    const result = await createProject(validatedData);

    if (!result.success) {
      return { 
        success: false, 
        error: result.error || 'Failed to create project' 
      };
    }

    // Revalidate cache and redirect to dashboard
    revalidatePath('/dashboard');
    
    // Return success with redirect
    return {
      success: true,
      data: result.data,
      redirect: '/dashboard/(protected)'
    };

  } catch (error) {
    console.error('Create project action error:', error);
    
    // Handle validation errors from Zod
    if (error instanceof Error && 'issues' in error) {
      const zodError = error as { issues: Array<{ message: string }> };
      const firstIssue = zodError.issues[0];
      return { 
        success: false, 
        error: firstIssue?.message || 'Invalid input data' 
      };
    }

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create project' 
    };
  }
}

/**
 * Check if user has an existing project and redirect appropriately
 */
export async function checkUserProjectAndRedirect() {
  try {
    const result = await getUserProject();
    
    if (!result.success) {
      // If there's an error, let them proceed to onboarding
      return null;
    }

    if (result.data) {
      // User has a project, redirect to dashboard
      redirect('/dashboard/(protected)');
    }

    // User has no project, they can proceed with onboarding
    return null;
  } catch (error) {
    console.error('Check user project error:', error);
    // On error, let them proceed to onboarding
    return null;
  }
}

/**
 * Get user project information for UI display
 */
export async function getUserProjectAction() {
  try {
    const result = await getUserProject();
    return result;
  } catch (error) {
    console.error('Get user project action error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get project' 
    };
  }
}
