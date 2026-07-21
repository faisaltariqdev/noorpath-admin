-- Parent Islamic Knowledge portal access (mirrors qaida_enabled)

alter table public.profiles
  add column if not exists islamic_knowledge_enabled boolean not null default false;

comment on column public.profiles.islamic_knowledge_enabled is
  'When true, parent can open Islamic Knowledge in their portal.';
