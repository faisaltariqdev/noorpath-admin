-- NoorPath Admin - RLS policies for dashboard and core admin data
-- Uses the role stored in auth.users.raw_user_meta_data.role.

create or replace function public.current_user_role()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '')
$$;

create or replace function public.current_profile_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    ''
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.current_user_role() = 'admin'
    or public.current_profile_role() = 'admin'
$$;

-- Profiles
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles
for select
to authenticated
using (public.is_admin() or id = auth.uid());

drop policy if exists "profiles_insert_admin" on public.profiles;
create policy "profiles_insert_admin"
on public.profiles
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
on public.profiles
for update
to authenticated
using (public.is_admin() or id = auth.uid())
with check (public.is_admin() or id = auth.uid());

-- Students
drop policy if exists "students_select_role_scoped" on public.students;
create policy "students_select_role_scoped"
on public.students
for select
to authenticated
using (
  public.is_admin()
  or tutor_id = auth.uid()
  or parent_id = auth.uid()
);

drop policy if exists "students_insert_admin" on public.students;
create policy "students_insert_admin"
on public.students
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "students_update_admin" on public.students;
create policy "students_update_admin"
on public.students
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "students_delete_admin" on public.students;
create policy "students_delete_admin"
on public.students
for delete
to authenticated
using (public.is_admin());

-- Class sessions
drop policy if exists "class_sessions_select_role_scoped" on public.class_sessions;
create policy "class_sessions_select_role_scoped"
on public.class_sessions
for select
to authenticated
using (
  public.is_admin()
  or tutor_id = auth.uid()
  or exists (
    select 1
    from public.students s
    where s.id = class_sessions.student_id
      and s.parent_id = auth.uid()
  )
);

drop policy if exists "class_sessions_insert_admin" on public.class_sessions;
create policy "class_sessions_insert_admin"
on public.class_sessions
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "class_sessions_update_admin_or_tutor" on public.class_sessions;
create policy "class_sessions_update_admin_or_tutor"
on public.class_sessions
for update
to authenticated
using (public.is_admin() or tutor_id = auth.uid())
with check (public.is_admin() or tutor_id = auth.uid());

drop policy if exists "class_sessions_delete_admin" on public.class_sessions;
create policy "class_sessions_delete_admin"
on public.class_sessions
for delete
to authenticated
using (public.is_admin());

-- Fees
drop policy if exists "fees_select_role_scoped" on public.fees;
create policy "fees_select_role_scoped"
on public.fees
for select
to authenticated
using (
  public.is_admin()
  or parent_id = auth.uid()
  or exists (
    select 1
    from public.students s
    where s.id = fees.student_id
      and s.parent_id = auth.uid()
  )
);

drop policy if exists "fees_insert_admin" on public.fees;
create policy "fees_insert_admin"
on public.fees
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "fees_update_admin" on public.fees;
create policy "fees_update_admin"
on public.fees
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "fees_delete_admin" on public.fees;
create policy "fees_delete_admin"
on public.fees
for delete
to authenticated
using (public.is_admin());

-- Progress reports
drop policy if exists "progress_reports_select_role_scoped" on public.progress_reports;
create policy "progress_reports_select_role_scoped"
on public.progress_reports
for select
to authenticated
using (
  public.is_admin()
  or tutor_id = auth.uid()
  or exists (
    select 1
    from public.students s
    where s.id = progress_reports.student_id
      and s.parent_id = auth.uid()
  )
);

drop policy if exists "progress_reports_insert_admin_or_tutor" on public.progress_reports;
create policy "progress_reports_insert_admin_or_tutor"
on public.progress_reports
for insert
to authenticated
with check (public.is_admin() or tutor_id = auth.uid());

drop policy if exists "progress_reports_update_admin_or_tutor" on public.progress_reports;
create policy "progress_reports_update_admin_or_tutor"
on public.progress_reports
for update
to authenticated
using (public.is_admin() or tutor_id = auth.uid())
with check (public.is_admin() or tutor_id = auth.uid());

drop policy if exists "progress_reports_delete_admin" on public.progress_reports;
create policy "progress_reports_delete_admin"
on public.progress_reports
for delete
to authenticated
using (public.is_admin());

-- Attendance
drop policy if exists "attendance_select_role_scoped" on public.attendance;
create policy "attendance_select_role_scoped"
on public.attendance
for select
to authenticated
using (
  public.is_admin()
  or tutor_id = auth.uid()
  or exists (
    select 1
    from public.students s
    where s.id = attendance.student_id
      and s.parent_id = auth.uid()
  )
);

drop policy if exists "attendance_insert_admin_or_tutor" on public.attendance;
create policy "attendance_insert_admin_or_tutor"
on public.attendance
for insert
to authenticated
with check (public.is_admin() or tutor_id = auth.uid());

drop policy if exists "attendance_update_admin_or_tutor" on public.attendance;
create policy "attendance_update_admin_or_tutor"
on public.attendance
for update
to authenticated
using (public.is_admin() or tutor_id = auth.uid())
with check (public.is_admin() or tutor_id = auth.uid());

