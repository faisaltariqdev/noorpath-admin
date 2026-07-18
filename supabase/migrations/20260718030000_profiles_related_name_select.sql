-- Allow parents/tutors to read related profile full_name via embeds.
-- Without this, parent Live Classes shows "Not assigned" even when tutor_id is set,
-- and tutor student views show Parent "Unlinked" even when parent_id is set.

-- Parents: read tutor profiles assigned to their children (student or session)
drop policy if exists "profiles_select_related_tutor_for_parent" on public.profiles;
create policy "profiles_select_related_tutor_for_parent"
on public.profiles
for select
to authenticated
using (
  public.current_profile_role() = 'parent'
  and role = 'tutor'
  and (
    exists (
      select 1
      from public.students s
      where s.parent_id = auth.uid()
        and s.tutor_id = profiles.id
    )
    or exists (
      select 1
      from public.class_sessions cs
      join public.students s on s.id = cs.student_id
      where s.parent_id = auth.uid()
        and cs.tutor_id = profiles.id
    )
  )
);

-- Tutors: read parent profiles linked to their students
drop policy if exists "profiles_select_related_parent_for_tutor" on public.profiles;
create policy "profiles_select_related_parent_for_tutor"
on public.profiles
for select
to authenticated
using (
  public.current_profile_role() = 'tutor'
  and role = 'parent'
  and exists (
    select 1
    from public.students s
    where s.tutor_id = auth.uid()
      and s.parent_id = profiles.id
  )
);
