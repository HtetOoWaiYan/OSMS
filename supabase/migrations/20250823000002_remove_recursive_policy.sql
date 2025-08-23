-- Remove the recursive policy that was causing infinite recursion
-- File: 20250823000002_remove_recursive_policy.sql

-- Drop the problematic policy that causes infinite recursion
drop policy if exists "Admins can view user roles in their projects" on user_roles;
