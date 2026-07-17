-- Parent Noorani Qaida access + app settings for role/feature permissions

alter table public.profiles
  add column if not exists qaida_enabled boolean not null default false;

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

drop policy if exists "app_settings_select_authenticated" on public.app_settings;
create policy "app_settings_select_authenticated"
on public.app_settings
for select
to authenticated
using (true);

drop policy if exists "app_settings_write_admin" on public.app_settings;
create policy "app_settings_write_admin"
on public.app_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.app_settings (key, value)
values (
  'role_permissions',
  '{
    "tutor": {
      "attendance": true,
      "reports": true,
      "earnings": true,
      "qaida": true,
      "messages": true
    },
    "parent": {
      "sessions": true,
      "fees": true,
      "attendance": true,
      "homework": true,
      "messages": true,
      "qaida_default": false
    },
    "admin": {
      "all": true
    }
  }'::jsonb
)
on conflict (key) do nothing;
