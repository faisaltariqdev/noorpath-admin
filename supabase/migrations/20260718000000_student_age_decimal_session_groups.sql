-- Allow half-year ages (e.g. 4.5) and group multi-student live classes
alter table public.students
  alter column age type numeric(4,1)
  using age::numeric(4,1);

alter table public.class_sessions
  add column if not exists session_group_id uuid;

create index if not exists idx_class_sessions_group
  on public.class_sessions(session_group_id);
