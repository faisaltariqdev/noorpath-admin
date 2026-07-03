-- Daily Work Notes: quick per-student daily task log for tutors
-- Lets a tutor log "what the student needs to do today" and mark it done,
-- separate from full progress reports (per-session) and the course roadmap (long-term plan).

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

create index if not exists idx_daily_work_notes_student on public.daily_work_notes(student_id, work_date desc);
create index if not exists idx_daily_work_notes_tutor   on public.daily_work_notes(tutor_id, work_date desc);

alter table public.daily_work_notes enable row level security;

-- Reuses public.is_admin() from rls-policies-dashboard-fix.sql

drop policy if exists "daily_work_notes_select_role_scoped" on public.daily_work_notes;
create policy "daily_work_notes_select_role_scoped"
on public.daily_work_notes
for select
to authenticated
using (
  public.is_admin()
  or tutor_id = auth.uid()
  or exists (
    select 1 from public.students s
    where s.id = daily_work_notes.student_id
      and s.parent_id = auth.uid()
  )
);

drop policy if exists "daily_work_notes_insert_admin_or_tutor" on public.daily_work_notes;
create policy "daily_work_notes_insert_admin_or_tutor"
on public.daily_work_notes
for insert
to authenticated
with check (public.is_admin() or tutor_id = auth.uid());

drop policy if exists "daily_work_notes_update_admin_or_tutor" on public.daily_work_notes;
create policy "daily_work_notes_update_admin_or_tutor"
on public.daily_work_notes
for update
to authenticated
using (public.is_admin() or tutor_id = auth.uid())
with check (public.is_admin() or tutor_id = auth.uid());

drop policy if exists "daily_work_notes_delete_admin_or_tutor" on public.daily_work_notes;
create policy "daily_work_notes_delete_admin_or_tutor"
on public.daily_work_notes
for delete
to authenticated
using (public.is_admin() or tutor_id = auth.uid());
