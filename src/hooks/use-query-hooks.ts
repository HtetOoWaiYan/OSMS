/**
 * Custom hooks for client-side data fetching using TanStack Query
 * ONLY USE WHEN SERVER-SIDE FETCHING IS NOT POSSIBLE
 *
 * Examples of when to use:
 * - Real-time updates
 * - User-triggered refresh
 * - Interactive features requiring immediate feedback
 * - Optimistic updates
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProjectUsersAction, inviteUserAction } from '@/lib/actions/users';
import type { InviteUserData } from '@/lib/validations/users';

/**
 * Example: Client-side users fetching (USE ONLY WHEN NECESSARY)
 * Prefer server-side fetching in server components instead
 */
export function useProjectUsers(projectId: string) {
  return useQuery({
    queryKey: ['project-users', projectId],
    queryFn: async () => {
      const result = await getProjectUsersAction(projectId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch users');
      }
      return result.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Example: Client-side user invitation with optimistic updates
 */
export function useInviteUser(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InviteUserData) => {
      const result = await inviteUserAction(data, projectId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to invite user');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['project-users', projectId] });
    },
  });
}

/**
 * Generic hook for server actions with TanStack Query
 */
export function useServerAction<TData, TVariables>(
  actionFn: (variables: TVariables) => Promise<{ success: boolean; error?: string; data?: TData }>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: string) => void;
    invalidateQueries?: string[][];
  },
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables): Promise<TData> => {
      const result = await actionFn(variables);
      if (!result.success) {
        throw new Error(result.error || 'Operation failed');
      }
      if (!result.data) {
        throw new Error('No data returned from operation');
      }
      return result.data;
    },
    onSuccess: (data: TData) => {
      options?.onSuccess?.(data);
      // Invalidate specified queries
      options?.invalidateQueries?.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
    },
    onError: (error: Error) => {
      options?.onError?.(error.message);
    },
  });
}
