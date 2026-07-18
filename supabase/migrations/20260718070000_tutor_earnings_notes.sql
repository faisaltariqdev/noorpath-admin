-- Admin note visible on tutor payment confirmation
alter table public.tutor_earnings
  add column if not exists notes text;
