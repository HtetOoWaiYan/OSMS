'server-only';

import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export type UserRole = 'admin' | 'agent';

export interface UserRoleData {
  userId: string;
  projectId: string;
  role: UserRole;
  isActive: boolean;
}

/**
 * Get the current user's role in their project
 */
export async function getUserRole(projectId: string): Promise<UserRoleData | null> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return null;
    }

    const supabaseAdmin = await createServiceRoleClient();

    // Get user's role in their project
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('project_id, role, is_active')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (roleError || !userRole) {
      return null;
    }

    return {
      userId: user.id,
      projectId: userRole.project_id,
      role: userRole.role as UserRole,
      isActive: userRole.is_active ?? false,
    };
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Check if current user has the required role
 */
export async function hasRole(requiredRole: UserRole, projectId: string): Promise<boolean> {
  const userRole = await getUserRole(projectId);
  if (!userRole) return false;

  // Admin has access to everything
  if (userRole.role === 'admin') return true;

  // Otherwise, check if user has exactly the required role
  return userRole.role === requiredRole;
}

/**
 * Check if current user is an admin
 */
export async function isAdmin(projectId: string): Promise<boolean> {
  return await hasRole('admin', projectId);
}

/**
 * Require admin role or redirect to unauthorized page
 */
export async function requireAdmin(projectId: string): Promise<UserRoleData> {
  const userRole = await getUserRole(projectId);

  if (!userRole) {
    redirect('/dashboard/auth/login');
  }

  if (userRole.role !== 'admin') {
    redirect('/dashboard/unauthorized');
  }

  return userRole;
}

/**
 * Require any valid role or redirect to login
 */
export async function requireAuth(projectId: string): Promise<UserRoleData> {
  const userRole = await getUserRole(projectId);

  if (!userRole) {
    redirect('/dashboard/auth/login');
  }

  return userRole;
}
