-- NoorPath Admin - Course catalog table

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default 'quran',
  level text not null default 'beginner',
  duration_weeks integer,
  price_amount numeric(10,2),
  currency text not null default 'GBP',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses enable row level security;

drop policy if exists "courses_select_authenticated" on public.courses;
create policy "courses_select_authenticated"
on public.courses
for select
to authenticated
using (true);

drop policy if exists "courses_insert_admin" on public.courses;
create policy "courses_insert_admin"
on public.courses
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "courses_update_admin" on public.courses;
create policy "courses_update_admin"
on public.courses
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "courses_delete_admin" on public.courses;
create policy "courses_delete_admin"
on public.courses
for delete
to authenticated
using (public.is_admin());

insert into public.courses (title, description, category, level, duration_weeks, price_amount, currency, sort_order)
values
  ('Noorani Qaida', 'Foundational Arabic letters, pronunciation and Quran reading preparation.', 'foundation', 'beginner', 12, 40, 'GBP', 10),
  ('Quran Recitation', 'Fluent Quran reading with correction, Makharij and daily recitation practice.', 'quran', 'intermediate', 24, 50, 'GBP', 20),
  ('Tajweed Mastery', 'Rules of Tajweed including Madd, Noon Sakinah, Meem Sakinah and Waqf.', 'tajweed', 'intermediate', 20, 55, 'GBP', 30),
  ('Hifz Program', 'Structured memorization plan with revision cycles and retention tracking.', 'hifz', 'advanced', 52, 80, 'GBP', 40),
  ('Quran with Translation', 'Understand selected Surahs with translation and practical reflections.', 'tafseer', 'intermediate', 16, 60, 'GBP', 50)
on conflict do nothing;
