-- Teacher attendance (admin marks tutors) + harden student attendance uniqueness

alter table public.attendance
  add column if not exists tutor_id uuid references public.profiles(id) on delete set null;

alter table public.attendance
  add column if not exists notes text;

alter table public.attendance
  add column if not exists session_date date;

create index if not exists idx_attendance_session_date
  on public.attendance(session_date desc);

create index if not exists idx_attendance_tutor_date
  on public.attendance(tutor_id, session_date);

-- Keep one student attendance row per calendar day before enforcing uniqueness
delete from public.attendance a
using public.attendance b
where a.session_date is not null
  and b.session_date is not null
  and a.student_id = b.student_id
  and a.session_date = b.session_date
  and a.ctid < b.ctid;

create unique index if not exists uq_attendance_student_session_date
  on public.attendance(student_id, session_date)
  where session_date is not null;

create table if not exists public.teacher_attendance (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  session_date date not null,
  status text not null check (status in ('present', 'absent', 'late', 'leave')),
  late_minutes int not null default 0,
  notes text,
  marked_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tutor_id, session_date)
);

create index if not exists idx_teacher_attendance_date
  on public.teacher_attendance(session_date desc);

create index if not exists idx_teacher_attendance_tutor
  on public.teacher_attendance(tutor_id, session_date desc);

alter table public.teacher_attendance enable row level security;

drop policy if exists "teacher_attendance_select_admin_or_own" on public.teacher_attendance;
create policy "teacher_attendance_select_admin_or_own"
on public.teacher_attendance
for select
to authenticated
using (
  public.is_admin()
  or tutor_id = auth.uid()
);

drop policy if exists "teacher_attendance_insert_admin" on public.teacher_attendance;
create policy "teacher_attendance_insert_admin"
on public.teacher_attendance
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "teacher_attendance_update_admin" on public.teacher_attendance;
create policy "teacher_attendance_update_admin"
on public.teacher_attendance
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "teacher_attendance_delete_admin" on public.teacher_attendance;
create policy "teacher_attendance_delete_admin"
on public.teacher_attendance
for delete
to authenticated
using (public.is_admin());
