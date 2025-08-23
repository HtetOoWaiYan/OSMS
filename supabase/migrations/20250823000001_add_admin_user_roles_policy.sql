-- Add RLS policy to allow admins to view all user roles in their projects
-- This is needed for the user management feature to work properly

-- Allow admins to view all user roles in their projects (for user management)
create policy "Admins can view user roles in their projects" on user_roles
for select
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) 
        and role = 'admin' 
        and is_active = true
    )
);
