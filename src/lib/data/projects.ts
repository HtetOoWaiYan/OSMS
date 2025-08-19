import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import type { 
  Tables, 
  TablesInsert, 
  Enums 
} from '@/lib/supabase/database.types';
import type { CreateProjectData } from '@/lib/validations/projects';

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
 * Check if the current user has any existing projects
 */
export async function getUserProject(): Promise<{
  success: boolean;
  error?: string;
  data?: Project & { userRole?: UserRole };
}> {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Get user's project through user_roles relationship
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select(`
        *,
        projects:project_id (*)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (roleError) {
      // User has no active roles (no projects)
      if (roleError.code === 'PGRST116') {
        return { success: true, data: undefined };
      }
      throw roleError;
    }

    // Extract project data from the relationship
    const project = userRole.projects as unknown as Project;
    
    return { 
      success: true, 
      data: { 
        ...project,
        userRole: userRole
      } 
    };
  } catch (error) {
    console.error('Error getting user project:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get user project' 
    };
  }
}

/**
 * Create a new project and automatically assign the creator as admin
 */
export async function createProject(data: CreateProjectData): Promise<{
  success: boolean;
  error?: string;
  data?: Project;
}> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Check if user already has a project (MVP constraint: one project per user)
    const existingProject = await getUserProject();
    if (existingProject.success && existingProject.data) {
      return { success: false, error: 'You already have a project. Only one project per user is allowed.' };
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

    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert(userRoleData);

    if (roleError) {
      // If role assignment fails, clean up the project
      await supabaseAdmin
        .from('projects')
        .delete()
        .eq('id', project.id);
      
      throw new Error('Failed to assign admin role');
    }

    return { success: true, data: project };
  } catch (error) {
    console.error('Error creating project:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create project' 
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
    const { data: { user }, error: authError } = await supabase.auth.getUser();
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
      error: error instanceof Error ? error.message : 'Failed to get project' 
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
    const { data: { user }, error: authError } = await supabase.auth.getUser();
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
      error: error instanceof Error ? error.message : 'Failed to check permissions' 
    };
  }
}
