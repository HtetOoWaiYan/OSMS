create extension if not exists "pg_net" with schema "extensions";

drop policy "Admins can add users to their projects" on "public"."user_roles";

drop policy "Admins can remove users from their projects" on "public"."user_roles";

drop policy "Admins can update user roles in their projects" on "public"."user_roles";

drop policy "Users can view roles in their projects" on "public"."user_roles";


  create policy "Any authenticated user can insert initial admin role"
  on "public"."user_roles"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Users can delete roles where they are admin"
  on "public"."user_roles"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.project_id = user_roles.project_id) AND (ur.role = 'admin'::user_role_enum) AND (ur.is_active = true)))));



  create policy "Users can update roles where they are admin"
  on "public"."user_roles"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.project_id = user_roles.project_id) AND (ur.role = 'admin'::user_role_enum) AND (ur.is_active = true)))))
with check ((EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.project_id = user_roles.project_id) AND (ur.role = 'admin'::user_role_enum) AND (ur.is_active = true)))));



  create policy "Users can view their own roles"
  on "public"."user_roles"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



