-- Ensure parents can read roadmaps and tutors can fully manage their students' plans

alter table if exists public.course_roadmaps enable row level security;

drop policy if exists "admin_all_roadmap" on public.course_roadmaps;
drop policy if exists "tutor_manage_roadmap" on public.course_roadmaps;
drop policy if exists "parent_view_roadmap" on public.course_roadmaps;
drop policy if exists "course_roadmaps_select_role_scoped" on public.course_roadmaps;
drop policy if exists "course_roadmaps_insert_admin_or_tutor" on public.course_roadmaps;
drop policy if exists "course_roadmaps_update_admin_or_tutor" on public.course_roadmaps;
drop policy if exists "course_roadmaps_delete_admin_or_tutor" on public.course_roadmaps;

create policy "course_roadmaps_select_role_scoped"
on public.course_roadmaps for select to authenticated
using (
  public.is_admin()
  or tutor_id = auth.uid()
  or public.is_parent_of_student(student_id)
  or public.is_tutor_of_student(student_id)
);

create policy "course_roadmaps_insert_admin_or_tutor"
on public.course_roadmaps for insert to authenticated
with check (
  public.is_admin()
  or tutor_id = auth.uid()
  or public.is_tutor_of_student(student_id)
);

create policy "course_roadmaps_update_admin_or_tutor"
on public.course_roadmaps for update to authenticated
using (
  public.is_admin()
  or tutor_id = auth.uid()
  or public.is_tutor_of_student(student_id)
)
with check (
  public.is_admin()
  or tutor_id = auth.uid()
  or public.is_tutor_of_student(student_id)
);

create policy "course_roadmaps_delete_admin_or_tutor"
on public.course_roadmaps for delete to authenticated
using (
  public.is_admin()
  or tutor_id = auth.uid()
  or public.is_tutor_of_student(student_id)
);
