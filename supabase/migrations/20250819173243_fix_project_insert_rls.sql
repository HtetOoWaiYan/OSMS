drop policy "Admins can create new projects" on "public"."projects";


  create policy "Authenticated users can create projects"
  on "public"."projects"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) IS NOT NULL));



