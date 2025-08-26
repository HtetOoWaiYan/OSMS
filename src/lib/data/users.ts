'server-only';

import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import type {
  InviteUserData,
  UpdateUserRoleData,
  RemoveUserData,
  ResendInvitationData,
} from '@/lib/validations/users';

export interface ProjectUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent';
  isActive: boolean;
  invitationStatus: 'confirmed' | 'pending';
  joinedAt: string;
}

/**
 * Get all users for the current project
 */
export async function getProjectUsers(): Promise<{
  success: boolean;
  error?: string;
  data?: ProjectUser[];
}> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Check authentication
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();
    if (getUserError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Get current user's project
    const { data: currentUserRole, error: roleError } = await supabase
      .from('user_roles')
      .select('project_id, role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (roleError || !currentUserRole) {
      return { success: false, error: 'No project access found' };
    }

    // Check if user has permission to view users (admin only)
    if (currentUserRole.role !== 'admin') {
      return {
        success: false,
        error: 'Only administrators can view project users',
      };
    }

    // Get all user roles for this project (using admin client since this is admin-only operation)
    const { data: userRoles, error: usersError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('project_id', currentUserRole.project_id)
      .eq('is_active', true);

    if (usersError) {
      console.error('Error fetching project user roles:', usersError);
      return { success: false, error: 'Failed to fetch project users' };
    }

    // Get auth user data for all users in the project
    const { data: authUsersData, error: authUsersError } =
      await supabaseAdmin.auth.admin.listUsers();
    if (authUsersError) {
      console.error('Error fetching auth users:', authUsersError);
      return { success: false, error: 'Failed to fetch user details' };
    }

    // Create a map of user IDs to auth user data
    const authUsersMap = new Map(authUsersData.users.map((u) => [u.id, u]));

    // Transform data to ProjectUser format
    const projectUsers: ProjectUser[] = userRoles
      .map((userRole) => {
        const authUser = authUsersMap.get(userRole.user_id);
        if (!authUser) {
          return null;
        }

        return {
          id: userRole.user_id,
          email: authUser.email || '',
          name:
            authUser.user_metadata?.name ||
            authUser.user_metadata?.full_name ||
            authUser.email?.split('@')[0] ||
            'Unknown',
          role: userRole.role as 'admin' | 'agent',
          isActive: userRole.is_active || false,
          invitationStatus: authUser.email_confirmed_at ? 'confirmed' : 'pending',
          joinedAt: userRole.created_at || new Date().toISOString(),
        };
      })
      .filter((user): user is ProjectUser => user !== null);

    return { success: true, data: projectUsers };
  } catch (error) {
    console.error('Error getting project users:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get project users',
    };
  }
}

/**
 * Invite a new user to the current project
 */
export async function inviteUserToProject(data: InviteUserData): Promise<{
  success: boolean;
  error?: string;
  data?: { userId: string; email: string; isReactivation?: boolean; isNewUser?: boolean };
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

    // Get current user's project and verify admin permissions
    const { data: currentUserRole, error: roleError } = await supabase
      .from('user_roles')
      .select('project_id, role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (roleError || !currentUserRole) {
      return { success: false, error: 'No project access found' };
    }

    if (currentUserRole.role !== 'admin') {
      return { success: false, error: 'Only administrators can invite users' };
    }

    // Check if email is already invited by looking up auth.users
    const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();
    if (authUsersError) {
      return { success: false, error: 'Failed to check existing users' };
    }

    const existingAuthUser = authUsers.users.find((u) => u.email === data.email);

    // Check if user already has a role in this project (active or inactive)
    let existingUserRole = null;
    if (existingAuthUser) {
      const { data: userRole, error: roleCheckError } = await supabaseAdmin
        .from('user_roles')
        .select('user_id, is_active, role')
        .eq('user_id', existingAuthUser.id)
        .eq('project_id', currentUserRole.project_id)
        .single();

      if (roleCheckError && roleCheckError.code !== 'PGRST116') {
        return { success: false, error: 'Failed to check existing user role' };
      }

      existingUserRole = userRole;
    }

    // If user exists and is active, they're already a member
    if (existingUserRole?.is_active) {
      return {
        success: false,
        error: 'User is already a member of this project',
      };
    }

    // Create the redirect URL for the invitation
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/auth/sign-up`;

    let finalUserId: string;
    let finalUserEmail: string;

    if (existingAuthUser) {
      // User already exists in Supabase Auth, we just need to reactivate their role
      // No need to send invitation email, they can log in with existing credentials
      finalUserId = existingAuthUser.id;
      finalUserEmail = existingAuthUser.email || data.email;
    } else {
      // New user - send invitation email
      const { data: inviteData, error: inviteError } =
        await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
          data: {
            ...(data.name && { name: data.name }),
            invited_to_project: currentUserRole.project_id,
            invited_role: data.role,
          },
          redirectTo: redirectUrl,
        });

      if (inviteError) {
        console.error('Error inviting user:', inviteError);
        return { success: false, error: `Failed to send invitation email: ${inviteError.message}` };
      }

      if (!inviteData?.user) {
        return { success: false, error: 'Failed to create user invitation' };
      }

      finalUserId = inviteData.user.id;
      finalUserEmail = inviteData.user.email || data.email;
    }

    // Handle user role assignment - either create new or reactivate existing
    let userRoleError = null;

    if (existingUserRole && !existingUserRole.is_active) {
      // Reactivate existing inactive user role
      const { error } = await supabaseAdmin
        .from('user_roles')
        .update({
          role: data.role,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', finalUserId)
        .eq('project_id', currentUserRole.project_id);

      userRoleError = error;
    } else {
      // Create new user role record
      const { error } = await supabaseAdmin.from('user_roles').insert({
        user_id: finalUserId,
        project_id: currentUserRole.project_id,
        role: data.role,
        is_active: true,
      });

      userRoleError = error;
    }

    if (userRoleError) {
      console.error('Error managing user role:', userRoleError);
      // Only try to clean up if this was a new user (not existing user)
      if (!existingAuthUser) {
        await supabaseAdmin.auth.admin.deleteUser(finalUserId);
      }
      return { success: false, error: 'Failed to assign user role' };
    }

    return {
      success: true,
      data: {
        userId: finalUserId,
        email: finalUserEmail,
        isReactivation: !!(existingUserRole && !existingUserRole.is_active),
        isNewUser: !existingAuthUser,
      },
    };
  } catch (error) {
    console.error('Error inviting user to project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to invite user',
    };
  }
}

/**
 * Update a user's role in the current project
 */
export async function updateUserRole(data: UpdateUserRoleData): Promise<{
  success: boolean;
  error?: string;
  data?: { userId: string; role: string };
}> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Check authentication
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();
    if (getUserError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Get current user's project and verify admin permissions
    const { data: currentUserRole, error: roleError } = await supabase
      .from('user_roles')
      .select('project_id, role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (roleError || !currentUserRole) {
      return { success: false, error: 'No project access found' };
    }

    if (currentUserRole.role !== 'admin') {
      return { success: false, error: 'Only administrators can update user roles' };
    }

    // Check if user exists in the project using service role client (bypasses RLS)
    const { data: existingUserRole, error: existingError } = await supabaseAdmin
      .from('user_roles')
      .select('user_id, role')
      .eq('user_id', data.userId)
      .eq('project_id', currentUserRole.project_id)
      .eq('is_active', true)
      .single();

    if (existingError || !existingUserRole) {
      return { success: false, error: 'User not found in this project' };
    }

    // Prevent updating own role
    if (data.userId === user.id) {
      return { success: false, error: 'You cannot change your own role' };
    }

    // Update user role using service role client
    const { error: updateError } = await supabaseAdmin
      .from('user_roles')
      .update({ role: data.role, updated_at: new Date().toISOString() })
      .eq('user_id', data.userId)
      .eq('project_id', currentUserRole.project_id)
      .eq('is_active', true);

    if (updateError) {
      console.error('Error updating user role:', updateError);
      return { success: false, error: 'Failed to update user role' };
    }

    return {
      success: true,
      data: {
        userId: data.userId,
        role: data.role,
      },
    };
  } catch (error) {
    console.error('Error updating user role:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user role',
    };
  }
}

/**
 * Remove a user from the current project
 */
export async function removeUserFromProject(data: RemoveUserData): Promise<{
  success: boolean;
  error?: string;
  data?: { userId: string };
}> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Check authentication
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();
    if (getUserError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Get current user's project and verify admin permissions
    const { data: currentUserRole, error: roleError } = await supabase
      .from('user_roles')
      .select('project_id, role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (roleError || !currentUserRole) {
      return { success: false, error: 'No project access found' };
    }

    if (currentUserRole.role !== 'admin') {
      return { success: false, error: 'Only administrators can remove users' };
    }

    // Check if user exists in the project using service role client (bypasses RLS)
    const { data: existingUserRole, error: existingError } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .eq('user_id', data.userId)
      .eq('project_id', currentUserRole.project_id)
      .eq('is_active', true)
      .single();

    if (existingError || !existingUserRole) {
      return { success: false, error: 'User not found in this project' };
    }

    // Prevent removing own account
    if (data.userId === user.id) {
      return { success: false, error: 'You cannot remove yourself from the project' };
    }

    // Soft delete user role using service role client
    const { error: removeError } = await supabaseAdmin
      .from('user_roles')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', data.userId)
      .eq('project_id', currentUserRole.project_id);

    if (removeError) {
      console.error('Error removing user from project:', removeError);
      return { success: false, error: 'Failed to remove user from project' };
    }

    return {
      success: true,
      data: {
        userId: data.userId,
      },
    };
  } catch (error) {
    console.error('Error removing user from project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove user from project',
    };
  }
}

/**
 * Resend invitation to a user
 */
export async function resendUserInvitation(data: ResendInvitationData): Promise<{
  success: boolean;
  error?: string;
  data?: { userId: string; email: string };
}> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Check authentication
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();
    if (getUserError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Get current user's project and verify admin permissions
    const { data: currentUserRole, error: roleError } = await supabase
      .from('user_roles')
      .select('project_id, role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (roleError || !currentUserRole) {
      return { success: false, error: 'No project access found' };
    }

    if (currentUserRole.role !== 'admin') {
      return { success: false, error: 'Only administrators can resend invitations' };
    }

    // Check if user exists in the project and get their role using service role client (bypasses RLS)
    const { data: existingUserRole, error: existingError } = await supabaseAdmin
      .from('user_roles')
      .select('user_id, role')
      .eq('user_id', data.userId)
      .eq('project_id', currentUserRole.project_id)
      .eq('is_active', true)
      .single();

    if (existingError || !existingUserRole) {
      return { success: false, error: 'User not found in this project' };
    }

    // Create the redirect URL for the invitation
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/auth/sign-up`;

    // Resend invitation using Supabase Admin API
    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: {
        invited_to_project: currentUserRole.project_id,
        invited_role: existingUserRole.role,
      },
      redirectTo: redirectUrl,
    });

    if (inviteError) {
      console.error('Error resending invitation:', inviteError);
      return { success: false, error: `Failed to resend invitation: ${inviteError.message}` };
    }

    return {
      success: true,
      data: {
        userId: data.userId,
        email: data.email,
      },
    };
  } catch (error) {
    console.error('Error resending invitation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resend invitation',
    };
  }
}
