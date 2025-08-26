import 'server-only';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import type { Tables, TablesInsert, Enums } from '@/lib/supabase/database.types';
import type { CreateProjectData, UpdateProjectData } from '@/lib/validations/projects';
import { setWebhook, generateWebhookUrl } from '@/lib/telegram/api';

// Type aliases for better readability
type Project = Tables<'projects'>;
type UserRole = Tables<'user_roles'>;
type ProjectInsert = TablesInsert<'projects'>;
type UserRoleInsert = TablesInsert<'user_roles'>;
type UserRoleEnum = Enums<'user_role_enum'>;

/**
 * Data access layer for project management
 * Follows the Data Access Layer pattern as recommended by Next.js security best practices
 */

/**
 * Get all projects that the current user has access to
 */
export async function getUserProjects(): Promise<{
  success: boolean;
  error?: string;
  data?: Array<Project & { userRole: UserRole }>;
}> {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Get all user's projects through user_roles relationship
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select(
        `
        *,
        projects:project_id (*)
      `,
      )
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (roleError) {
      throw roleError;
    }

    // Transform data to include project info with user role
    const projectsWithRoles =
      userRoles?.map((userRole) => {
        const project = userRole.projects as unknown as Project;
        return {
          ...project,
          userRole: userRole,
        };
      }) || [];

    return { success: true, data: projectsWithRoles };
  } catch (error) {
    console.error('Error getting user projects:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user projects',
    };
  }
}

/**
 * Check if the current user has any existing projects (legacy function for backwards compatibility)
 */
export async function getUserProject(): Promise<{
  success: boolean;
  error?: string;
  data?: Project & { userRole?: UserRole };
}> {
  try {
    const projectsResult = await getUserProjects();
    if (!projectsResult.success) {
      return { success: false, error: projectsResult.error };
    }

    // Return the first project if any exist, otherwise undefined
    const firstProject = projectsResult.data?.[0];
    return {
      success: true,
      data: firstProject,
    };
  } catch (error) {
    console.error('Error getting user project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user project',
    };
  }
}

/**
 * Create a new project and automatically assign the creator as admin
 */
export async function createProject(data: CreateProjectData): Promise<{
  success: boolean;
  error?: string;
  data?: Project & { telegram_webhook_url?: string };
  webhookSetup?: {
    success: boolean;
    error?: string;
    webhookInfo?: {
      url: string;
      has_custom_certificate: boolean;
      pending_update_count: number;
      max_connections?: number;
      ip_address?: string;
    };
  };
}> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Create the project using service role client (bypasses RLS)
    const projectData: ProjectInsert = {
      name: data.name,
      description: data.description,
      telegram_bot_token: data.telegram_bot_token,
      is_active: true,
    };

    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (projectError) {
      throw projectError;
    }

    // Automatically assign creator as admin using service role client
    const userRoleData: UserRoleInsert = {
      user_id: user.id,
      project_id: project.id,
      role: 'admin' as UserRoleEnum,
      is_active: true,
    };

    const { error: roleError } = await supabaseAdmin.from('user_roles').insert(userRoleData);

    if (roleError) {
      // If role assignment fails, clean up the project
      await supabaseAdmin.from('projects').delete().eq('id', project.id);

      throw new Error('Failed to assign admin role');
    }

    // Set up Telegram webhook (don't fail project creation if this fails)
    let webhookSetupResult:
      | {
          success: boolean;
          error?: string;
          webhookInfo?: {
            url: string;
            has_custom_certificate: boolean;
            pending_update_count: number;
            max_connections?: number;
            ip_address?: string;
          };
        }
      | undefined;

    try {
      const webhookUrl = generateWebhookUrl(project.id);

      // Update the project with the webhook URL
      await supabaseAdmin
        .from('projects')
        .update({ telegram_webhook_url: webhookUrl })
        .eq('id', project.id);

      // Set the webhook with Telegram
      const setupResult = await setWebhook(data.telegram_bot_token, webhookUrl);
      webhookSetupResult = setupResult;

      if (!setupResult.success) {
        console.warn(`Webhook setup failed for project ${project.id}: ${setupResult.error}`);
        // Don't fail the project creation, just log the warning
      } else {
        console.log(`Webhook setup successful for project ${project.id}`);
      }
    } catch (webhookError) {
      console.warn(`Unexpected error setting up webhook for project ${project.id}:`, webhookError);
      // Don't fail the project creation for webhook setup issues
    }

    return {
      success: true,
      data: {
        ...project,
        telegram_webhook_url: generateWebhookUrl(project.id),
      },
      webhookSetup: webhookSetupResult,
    };
  } catch (error) {
    console.error('Error creating project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create project',
    };
  }
}

/**
 * Get project details by ID (for future use)
 */
export async function getProject(projectId: string): Promise<{
  success: boolean;
  error?: string;
  data?: Project;
}> {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Get project with RLS automatically checking user access
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Project not found or access denied' };
      }
      throw error;
    }

    return { success: true, data: project };
  } catch (error) {
    console.error('Error getting project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get project',
    };
  }
}

/**
 * Get project by ID without authentication (for webhooks)
 * Uses service role client to bypass RLS since webhooks don't have user context
 */
export async function getProjectById(projectId: string): Promise<{
  success: boolean;
  error?: string;
  data?: Project;
}> {
  try {
    const supabaseAdmin = await createServiceRoleClient();

    // Get project using service role client (bypasses RLS)
    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Project not found' };
      }
      throw error;
    }

    return { success: true, data: project };
  } catch (error) {
    console.error('Error getting project by ID:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get project',
    };
  }
}

/**
 * Check if user has admin access to a project
 */
export async function checkUserPermissions(projectId: string): Promise<{
  success: boolean;
  error?: string;
  data?: {
    role: UserRoleEnum;
    isAdmin: boolean;
    isAgent: boolean;
  };
}> {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Get user role for the project
    const { data: userRole, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Access denied to this project' };
      }
      throw error;
    }

    return {
      success: true,
      data: {
        role: userRole.role,
        isAdmin: userRole.role === 'admin',
        isAgent: userRole.role === 'agent',
      },
    };
  } catch (error) {
    console.error('Error checking user permissions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check permissions',
    };
  }
}

/**
 * Update project information
 */
export async function updateProject(
  projectId: string,
  data: UpdateProjectData,
): Promise<{
  success: boolean;
  error?: string;
  data?: Project & { telegram_webhook_url?: string };
  webhookSetup?: {
    success: boolean;
    error?: string;
    webhookInfo?: {
      url: string;
      has_custom_certificate: boolean;
      pending_update_count: number;
      max_connections?: number;
      ip_address?: string;
    };
  };
}> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Check if user has admin access to this project
    const permissions = await checkUserPermissions(projectId);
    if (!permissions.success || !permissions.data?.isAdmin) {
      return { success: false, error: 'Only project administrators can update project settings' };
    }

    // Prepare update data (only include provided fields)
    const updateData: Partial<Project> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.telegram_bot_token !== undefined)
      updateData.telegram_bot_token = data.telegram_bot_token;

    // Always update the timestamp
    updateData.updated_at = new Date().toISOString();

    // Update project using service role client (bypasses RLS)
    const { data: project, error: updateError } = await supabaseAdmin
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Set up or update Telegram webhook if bot token was provided
    let webhookSetupResult:
      | {
          success: boolean;
          error?: string;
          webhookInfo?: {
            url: string;
            has_custom_certificate: boolean;
            pending_update_count: number;
            max_connections?: number;
            ip_address?: string;
          };
        }
      | undefined;

    if (data.telegram_bot_token && data.telegram_bot_token.trim() !== '') {
      try {
        const webhookUrl = generateWebhookUrl(projectId);

        // Update the project with the webhook URL
        await supabaseAdmin
          .from('projects')
          .update({ telegram_webhook_url: webhookUrl })
          .eq('id', projectId);

        // Set the webhook with Telegram
        const setupResult = await setWebhook(data.telegram_bot_token, webhookUrl);
        webhookSetupResult = setupResult;

        if (!setupResult.success) {
          console.warn(`Webhook setup failed for project ${projectId}: ${setupResult.error}`);
          // Don't fail the project update, just log the warning
        } else {
          console.log(`Webhook setup successful for project ${projectId}`);
        }
      } catch (webhookError) {
        console.warn(`Unexpected error setting up webhook for project ${projectId}:`, webhookError);
        // Don't fail the project update for webhook setup issues
      }
    }

    return {
      success: true,
      data: {
        ...project,
        telegram_webhook_url: generateWebhookUrl(projectId),
      },
      webhookSetup: webhookSetupResult,
    };
  } catch (error) {
    console.error('Error updating project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update project',
    };
  }
}

/**
 * Mask bot token for display (show only first parts and last 4 characters)
 * Format: 123456789:AAEhBOweik***************ew11
 */
export function maskBotToken(token: string): string {
  if (!token || token.length < 15) {
    return token; // Too short to mask effectively
  }

  const colonIndex = token.indexOf(':');
  if (colonIndex === -1) {
    // No colon found, mask middle part
    const start = token.slice(0, 6);
    const end = token.slice(-4);
    const maskedLength = Math.min(15, token.length - 10);
    return `${start}${'*'.repeat(maskedLength)}${end}`;
  }

  // Mask the secret part after the colon
  const botId = token.slice(0, colonIndex + 1); // Include the colon
  const secret = token.slice(colonIndex + 1);

  if (secret.length < 10) {
    return token; // Secret too short to mask effectively
  }

  const secretStart = secret.slice(0, 6);
  const secretEnd = secret.slice(-4);
  const maskedLength = Math.min(15, secret.length - 10);

  return `${botId}${secretStart}${'*'.repeat(maskedLength)}${secretEnd}`;
}
