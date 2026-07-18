-- Enterprise learning access: tutor CRUD + parent visibility
-- Covers progress_reports, homework_logs, attendance, daily_work_notes, homework_templates

-- Ensure role helpers exist (idempotent)
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

-- Parent-of-student helper avoids recursive RLS surprises in EXISTS clauses
create or replace function public.is_parent_of_student(p_student_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.students s
    where s.id = p_student_id
      and s.parent_id = auth.uid()
  )
$$;

create or replace function public.is_tutor_of_student(p_student_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.students s
    where s.id = p_student_id
      and s.tutor_id = auth.uid()
  )
$$;

grant execute on function public.is_parent_of_student(uuid) to authenticated;
grant execute on function public.is_tutor_of_student(uuid) to authenticated;

-- Align homework_logs columns (safe if already present)
alter table public.homework_logs
  add column if not exists tutor_id uuid references public.profiles(id) on delete set null,
  add column if not exists title text,
  add column if not exists subject text,
  add column if not exists due_date date,
  add column if not exists status text default 'pending';

alter table public.attendance
  add column if not exists tutor_id uuid references public.profiles(id) on delete set null,
  add column if not exists session_date date,
  add column if not exists notes text,
  add column if not exists late_minutes integer default 0;

-- ── progress_reports ──────────────────────────────────────────────
alter table public.progress_reports enable row level security;

drop policy if exists "progress_reports_select_role_scoped" on public.progress_reports;
create policy "progress_reports_select_role_scoped"
on public.progress_reports for select to authenticated
using (
  public.is_admin()
  or tutor_id = auth.uid()
  or public.is_parent_of_student(student_id)
);

drop policy if exists "progress_reports_insert_admin_or_tutor" on public.progress_reports;
create policy "progress_reports_insert_admin_or_tutor"
on public.progress_reports for insert to authenticated
with check (public.is_admin() or tutor_id = auth.uid());

drop policy if exists "progress_reports_update_admin_or_tutor" on public.progress_reports;
create policy "progress_reports_update_admin_or_tutor"
on public.progress_reports for update to authenticated
using (public.is_admin() or tutor_id = auth.uid())
with check (public.is_admin() or tutor_id = auth.uid());

drop policy if exists "progress_reports_delete_admin" on public.progress_reports;
drop policy if exists "progress_reports_delete_admin_or_tutor" on public.progress_reports;
create policy "progress_reports_delete_admin_or_tutor"
on public.progress_reports for delete to authenticated
using (public.is_admin() or tutor_id = auth.uid());

-- ── homework_logs ───────────────────────────────────────────────
alter table public.homework_logs enable row level security;

drop policy if exists "admin_homework" on public.homework_logs;
drop policy if exists "tutor_homework" on public.homework_logs;
drop policy if exists "parent_homework" on public.homework_logs;
drop policy if exists "parent_update" on public.homework_logs;
drop policy if exists "homework_logs_select_role_scoped" on public.homework_logs;
drop policy if exists "homework_logs_insert_admin_or_tutor" on public.homework_logs;
drop policy if exists "homework_logs_update_admin_tutor_or_parent" on public.homework_logs;
drop policy if exists "homework_logs_delete_admin_or_tutor" on public.homework_logs;

create policy "homework_logs_select_role_scoped"
on public.homework_logs for select to authenticated
using (
  public.is_admin()
  or tutor_id = auth.uid()
  or public.is_parent_of_student(student_id)
);

create policy "homework_logs_insert_admin_or_tutor"
on public.homework_logs for insert to authenticated
with check (public.is_admin() or tutor_id = auth.uid());

create policy "homework_logs_update_admin_tutor_or_parent"
on public.homework_logs for update to authenticated
using (
  public.is_admin()
  or tutor_id = auth.uid()
  or public.is_parent_of_student(student_id)
)
with check (
  public.is_admin()
  or tutor_id = auth.uid()
  or public.is_parent_of_student(student_id)
);

create policy "homework_logs_delete_admin_or_tutor"
on public.homework_logs for delete to authenticated
using (public.is_admin() or tutor_id = auth.uid());

-- ── homework_templates ────────────────────────────────────────
alter table public.homework_templates enable row level security;

drop policy if exists "admin_all_templates" on public.homework_templates;
drop policy if exists "tutor_manage_templates" on public.homework_templates;
drop policy if exists "homework_templates_all_own" on public.homework_templates;

create policy "homework_templates_all_own"
on public.homework_templates for all to authenticated
using (public.is_admin() or tutor_id = auth.uid())
with check (public.is_admin() or tutor_id = auth.uid());

-- ── attendance ────────────────────────────────────────────────
alter table public.attendance enable row level security;

drop policy if exists "attendance_select_role_scoped" on public.attendance;
drop policy if exists "attendance_insert_admin_or_tutor" on public.attendance;
drop policy if exists "attendance_update_admin_or_tutor" on public.attendance;
drop policy if exists "attendance_delete_admin_or_tutor" on public.attendance;

create policy "attendance_select_role_scoped"
on public.attendance for select to authenticated
using (
  public.is_admin()
  or tutor_id = auth.uid()
  or public.is_parent_of_student(student_id)
);

create policy "attendance_insert_admin_or_tutor"
on public.attendance for insert to authenticated
with check (public.is_admin() or tutor_id = auth.uid());

create policy "attendance_update_admin_or_tutor"
on public.attendance for update to authenticated
using (public.is_admin() or tutor_id = auth.uid())
with check (public.is_admin() or tutor_id = auth.uid());

create policy "attendance_delete_admin_or_tutor"
on public.attendance for delete to authenticated
using (public.is_admin() or tutor_id = auth.uid());

-- ── daily_work_notes ──────────────────────────────────────────
create table if not exists public.daily_work_notes (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references public.students(id) on delete cascade,
  tutor_id       uuid references public.profiles(id) on delete set null,
  work_date      date not null default current_date,
  work_text      text not null,
  status         text not null default 'pending' check (status in ('pending', 'completed')),
  completed_at   timestamptz,
  created_at     timestamptz not null default now()
);

alter table public.daily_work_notes enable row level security;

drop policy if exists "daily_work_notes_select_role_scoped" on public.daily_work_notes;
drop policy if exists "daily_work_notes_insert_admin_or_tutor" on public.daily_work_notes;
drop policy if exists "daily_work_notes_update_admin_or_tutor" on public.daily_work_notes;
drop policy if exists "daily_work_notes_delete_admin_or_tutor" on public.daily_work_notes;
drop policy if exists "daily_work_notes_update_role_scoped" on public.daily_work_notes;

create policy "daily_work_notes_select_role_scoped"
on public.daily_work_notes for select to authenticated
using (
  public.is_admin()
  or tutor_id = auth.uid()
  or public.is_parent_of_student(student_id)
);

create policy "daily_work_notes_insert_admin_or_tutor"
on public.daily_work_notes for insert to authenticated
with check (public.is_admin() or tutor_id = auth.uid());

create policy "daily_work_notes_update_role_scoped"
on public.daily_work_notes for update to authenticated
using (
  public.is_admin()
  or tutor_id = auth.uid()
  or public.is_parent_of_student(student_id)
)
with check (
  public.is_admin()
  or tutor_id = auth.uid()
  or public.is_parent_of_student(student_id)
);

create policy "daily_work_notes_delete_admin_or_tutor"
on public.daily_work_notes for delete to authenticated
using (public.is_admin() or tutor_id = auth.uid());

-- Backfill attendance.session_date for parent month filters
update public.attendance
set session_date = (marked_at at time zone 'utc')::date
where session_date is null and marked_at is not null;
