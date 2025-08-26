'use server';

import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createProjectSchema, updateProjectSchema } from '@/lib/validations/projects';
import { createProject, getUserProject, updateProject } from '@/lib/data/projects';
import type { Json } from '@/lib/supabase/database.types';

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
        error: result.error || 'Failed to create project',
      };
    }

    // Revalidate cache and redirect to the new project dashboard
    revalidatePath('/dashboard');

    // Log webhook setup result for debugging
    if (result.webhookSetup) {
      if (result.webhookSetup.success) {
        console.log(`Webhook setup successful for new project: ${result.data!.id}`);
      } else {
        console.warn(
          `Webhook setup failed for new project: ${result.data!.id} - ${result.webhookSetup.error}`,
        );
      }
    }

    // Return success with redirect to the specific project
    return {
      success: true,
      data: result.data,
      redirect: `/dashboard/${result.data!.id}`,
      webhookSetup: result.webhookSetup,
    };
  } catch (error) {
    console.error('Create project action error:', error);

    // Handle validation errors from Zod
    if (error instanceof Error && 'issues' in error) {
      const zodError = error as { issues: Array<{ message: string }> };
      const firstIssue = zodError.issues[0];
      return {
        success: false,
        error: firstIssue?.message || 'Invalid input data',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create project',
    };
  }
}

/**
 * Check if user has an existing project and redirect appropriately
 * If user has only one project, redirect to that project
 * If user has multiple projects, redirect to project listing
 * If user has no projects, proceed with onboarding
 */
export async function checkUserProjectAndRedirect() {
  try {
    const result = await getUserProject();

    if (!result.success) {
      // If there's an error, let them proceed to onboarding
      return null;
    }

    if (result.data) {
      // User has at least one project, redirect to project listing
      redirect('/dashboard');
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
 * Payment method configuration type
 */
interface PaymentMethodConfig {
  enabled: boolean;
  name: string;
  phone?: string;
  hasQR?: boolean;
  qrCodeFileName?: string;
}

type PaymentMethodsData = Record<string, PaymentMethodConfig>;

/**
 * Update project payment methods configuration
 */
export async function updateProjectPaymentMethodsAction(data: {
  projectId: string;
  paymentMethods: PaymentMethodsData;
}) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();
    if (getUserError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Check if user has permission to update this project
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('project_id', data.projectId)
      .eq('is_active', true)
      .single();

    if (roleError || !userRole || userRole.role !== 'admin') {
      return { success: false, error: 'Permission denied' };
    }

    // Update the project's payment methods
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        payment_methods: data.paymentMethods as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.projectId);

    if (updateError) {
      console.error('Update payment methods error:', updateError);
      return { success: false, error: 'Failed to update payment methods' };
    }

    // Revalidate project data
    revalidateTag(`project-${data.projectId}`);
    revalidateTag('user-projects');

    return { success: true };
  } catch (error) {
    console.error('Update payment methods error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update payment methods',
    };
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
      error: error instanceof Error ? error.message : 'Failed to get project',
    };
  }
}

/**
 * Server action to update project information
 */
export async function updateProjectAction(formData: FormData) {
  try {
    // Extract form data
    const rawData = {
      projectId: formData.get('projectId') as string,
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null,
      telegram_bot_token: formData.get('telegram_bot_token') as string,
    };

    // Validate project ID
    if (!rawData.projectId) {
      return {
        success: false,
        error: 'Project ID is required',
      };
    }

    // If no new bot token provided, get the current one from the project
    let botTokenToUse = rawData.telegram_bot_token;
    if (!botTokenToUse || botTokenToUse.trim() === '') {
      // Get current project to use existing bot token
      const currentProject = await getUserProject();
      if (!currentProject.success || !currentProject.data) {
        return {
          success: false,
          error: 'Current project not found',
        };
      }
      botTokenToUse = currentProject.data.telegram_bot_token || '';
    }

    // Validate the data
    const validatedData = updateProjectSchema.parse({
      name: rawData.name,
      description: rawData.description,
      telegram_bot_token: botTokenToUse,
    });

    // Update project through data access layer
    const result = await updateProject(rawData.projectId, validatedData);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to update project',
      };
    }

    // Revalidate the settings page to show updated data
    revalidatePath(`/dashboard/${rawData.projectId}/settings`);
    revalidatePath('/dashboard'); // Also revalidate project listing

    // Log webhook setup result for debugging
    if (result.webhookSetup) {
      if (result.webhookSetup.success) {
        console.log(`Webhook setup successful for updated project: ${rawData.projectId}`);
      } else {
        console.warn(
          `Webhook setup failed for updated project: ${rawData.projectId} - ${result.webhookSetup.error}`,
        );
      }
    }

    return {
      success: true,
      message: 'Project updated successfully',
      data: result.data,
      webhookSetup: result.webhookSetup,
    };
  } catch (error) {
    console.error('Error in updateProjectAction:', error);

    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as { issues: Array<{ path: string[]; message: string }> };
      const firstError = zodError.issues[0];
      return {
        success: false,
        error: firstError?.message || 'Validation failed',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update project',
    };
  }
}
