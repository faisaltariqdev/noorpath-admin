-- Parent Holy Quran portal access (mirrors islamic_knowledge_enabled)

alter table public.profiles
  add column if not exists holy_quran_enabled boolean not null default true;

comment on column public.profiles.holy_quran_enabled is
  'When true, parent can open the Holy Quran teaching reader in their portal.';
