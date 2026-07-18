-- Fix announcement delivery for parents/tutors + add kind / duration helpers

alter table public.announcements
  add column if not exists kind text not null default 'general'
    check (kind in ('general', 'fee_reminder', 'alert')),
  add column if not exists show_days integer;

-- Always show on dashboard going forward
update public.announcements
set send_dashboard = true
where send_dashboard is distinct from true;

-- Publish any drafts that were saved without published_at
update public.announcements
set published_at = coalesce(published_at, created_at)
where published_at is null;

-- Simpler, reliable role check via profiles (not JWT metadata alone)
create or replace function public.profile_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select role::text from public.profiles where id = auth.uid()), '')
$$;

grant execute on function public.profile_role() to authenticated;

drop policy if exists "announcements_select_targeted" on public.announcements;
create policy "announcements_select_targeted"
on public.announcements for select to authenticated
using (
  public.is_admin()
  or (
    published_at is not null
    and published_at <= now()
    and (expires_at is null or expires_at > now())
    and (
      target_type = 'all'
      or (target_type = 'parents' and public.profile_role() = 'parent')
      or (target_type = 'tutors' and public.profile_role() = 'tutor')
      or (target_type = 'individual' and target_user_id = auth.uid())
      or (
        target_type = 'course'
        and public.profile_role() = 'parent'
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
            and lower(coalesce(p.country, '')) = lower(coalesce(announcements.target_country, ''))
        )
      )
    )
  )
);

-- Ensure upserts on reads work (needed for mark-as-read)
drop policy if exists "announcement_reads_upsert_own" on public.announcement_reads;
create policy "announcement_reads_upsert_own"
on public.announcement_reads for all to authenticated
using (public.is_admin() or user_id = auth.uid())
with check (user_id = auth.uid() or public.is_admin());
