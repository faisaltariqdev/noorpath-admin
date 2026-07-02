-- NoorPath Admin - Tutor weekly availability slots

create table if not exists public.tutor_availability (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  timezone text not null default 'Asia/Karachi',
  created_at timestamptz not null default now()
);

create index if not exists idx_tutor_availability_tutor_id on public.tutor_availability(tutor_id);
create index if not exists idx_tutor_availability_day on public.tutor_availability(day_of_week);

alter table public.tutor_availability enable row level security;

drop policy if exists "tutor_availability_select_role_scoped" on public.tutor_availability;
create policy "tutor_availability_select_role_scoped"
on public.tutor_availability
for select
to authenticated
using (public.is_admin() or tutor_id = auth.uid());

drop policy if exists "tutor_availability_insert_admin" on public.tutor_availability;
create policy "tutor_availability_insert_admin"
on public.tutor_availability
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "tutor_availability_update_admin" on public.tutor_availability;
create policy "tutor_availability_update_admin"
on public.tutor_availability
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "tutor_availability_delete_admin" on public.tutor_availability;
create policy "tutor_availability_delete_admin"
on public.tutor_availability
for delete
to authenticated
using (public.is_admin());

insert into public.tutor_availability (tutor_id, day_of_week, start_time, end_time, timezone)
values
  ('565948d7-1a15-4e69-8ca6-acd71cd9a142', 1, '16:00', '21:00', 'Asia/Karachi'),
  ('565948d7-1a15-4e69-8ca6-acd71cd9a142', 2, '16:00', '21:00', 'Asia/Karachi'),
  ('565948d7-1a15-4e69-8ca6-acd71cd9a142', 3, '16:00', '21:00', 'Asia/Karachi'),
  ('565948d7-1a15-4e69-8ca6-acd71cd9a142', 4, '16:00', '21:00', 'Asia/Karachi'),
  ('565948d7-1a15-4e69-8ca6-acd71cd9a142', 5, '15:00', '19:00', 'Asia/Karachi'),
  ('0c1af19f-66de-4350-8288-6aea36292811', 1, '20:00', '23:30', 'Asia/Karachi'),
  ('0c1af19f-66de-4350-8288-6aea36292811', 3, '20:00', '23:30', 'Asia/Karachi'),
  ('0c1af19f-66de-4350-8288-6aea36292811', 6, '10:00', '14:00', 'Asia/Karachi')
on conflict do nothing;
