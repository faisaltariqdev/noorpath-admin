-- Enterprise LMS schema: announcements, assignment lifecycle, report kinds, session attendance

-- ── Announcements ──────────────────────────────────────────────
create table if not exists public.announcements (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  message         text not null,
  image_url       text,
  pdf_url         text,
  priority        text not null default 'normal'
                  check (priority in ('low', 'normal', 'high', 'urgent')),
  target_type     text not null default 'all'
                  check (target_type in ('all', 'parents', 'tutors', 'individual', 'course', 'class', 'batch', 'country')),
  target_role     text,
  target_user_id  uuid references public.profiles(id) on delete set null,
  target_course   text,
  target_country  text,
  scheduled_at    timestamptz,
  expires_at      timestamptz,
  published_at    timestamptz,
  send_push       boolean not null default false,
  send_email      boolean not null default false,
  send_dashboard  boolean not null default true,
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.announcement_reads (
  id               uuid primary key default gen_random_uuid(),
  announcement_id  uuid not null references public.announcements(id) on delete cascade,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  read_at          timestamptz not null default now(),
  unique (announcement_id, user_id)
);

create index if not exists idx_announcements_published on public.announcements(published_at desc nulls last);
create index if not exists idx_announcement_reads_user on public.announcement_reads(user_id);

alter table public.announcements enable row level security;
alter table public.announcement_reads enable row level security;

drop policy if exists "announcements_admin_all" on public.announcements;
drop policy if exists "announcements_select_targeted" on public.announcements;
drop policy if exists "announcement_reads_own" on public.announcement_reads;
drop policy if exists "announcement_reads_insert_own" on public.announcement_reads;

create policy "announcements_admin_all"
on public.announcements for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "announcements_select_targeted"
on public.announcements for select to authenticated
using (
  public.is_admin()
  or (
    send_dashboard = true
    and (scheduled_at is null or scheduled_at <= now())
    and (expires_at is null or expires_at > now())
    and published_at is not null
    and (
      target_type = 'all'
      or (target_type = 'parents' and public.current_profile_role() = 'parent')
      or (target_type = 'tutors' and public.current_profile_role() = 'tutor')
      or (target_type = 'individual' and target_user_id = auth.uid())
      or (
        target_type = 'course'
        and exists (
          select 1 from public.students s
          where s.parent_id = auth.uid()
            and s.course = announcements.target_course
        )
      )
      or (
        target_type = 'country'
        and exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and p.country = announcements.target_country
        )
      )
    )
  )
);

create policy "announcement_reads_own"
on public.announcement_reads for select to authenticated
using (public.is_admin() or user_id = auth.uid());

create policy "announcement_reads_insert_own"
on public.announcement_reads for insert to authenticated
with check (user_id = auth.uid());

create policy "announcement_reads_update_own"
on public.announcement_reads for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ── Homework / assignments ─────────────────────────────────────
alter table public.homework_logs
  add column if not exists assignment_type text default 'homework',
  add column if not exists marks numeric(6,2),
  add column if not exists max_marks numeric(6,2),
  add column if not exists teacher_feedback text,
  add column if not exists submitted_at timestamptz,
  add column if not exists published_at timestamptz,
  add column if not exists archived_at timestamptz,
  add column if not exists attachments jsonb default '[]'::jsonb,
  add column if not exists private_notes text,
  add column if not exists is_published boolean default true,
  add column if not exists external_url text;

-- ── Progress reports kinds ─────────────────────────────────────
alter table public.progress_reports
  add column if not exists report_kind text default 'daily'
    check (report_kind in ('daily', 'weekly', 'monthly', 'custom')),
  add column if not exists topics_covered text,
  add column if not exists reading_quality text,
  add column if not exists behaviour text,
  add column if not exists participation text,
  add column if not exists next_lesson_plan text,
  add column if not exists period_start date,
  add column if not exists period_end date;

create unique index if not exists idx_progress_reports_daily_session
  on public.progress_reports (session_id)
  where session_id is not null and report_kind = 'daily';

-- ── Attendance enrichment ──────────────────────────────────────
alter table public.attendance
  add column if not exists scheduled_at timestamptz,
  add column if not exists actual_join_at timestamptz,
  add column if not exists actual_duration_minutes integer,
  add column if not exists class_label text;

create index if not exists idx_attendance_session on public.attendance(session_id);
