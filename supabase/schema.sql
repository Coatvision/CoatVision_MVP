-- CoatVision Supabase schema and RPCs
-- Safe to run multiple times; uses IF NOT EXISTS and CREATE OR REPLACE

-- Extensions
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- Tables
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  filename text,
  output_filename text,
  metrics jsonb,
  status text default 'completed',
  user_id uuid,
  job_id uuid
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text default 'pending',
  params jsonb
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  analysis_id uuid references public.analyses(id) on delete cascade,
  url text,
  metadata jsonb
);

create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  notes text,
  data jsonb
);

-- Row Level Security
alter table public.analyses enable row level security;
alter table public.jobs enable row level security;
alter table public.reports enable row level security;
alter table public.training_sessions enable row level security;

-- Read for authenticated users
create policy if not exists analyses_read_authenticated on public.analyses
  for select using (auth.role() = 'authenticated');
create policy if not exists jobs_read_authenticated on public.jobs
  for select using (auth.role() = 'authenticated');
create policy if not exists reports_read_authenticated on public.reports
  for select using (auth.role() = 'authenticated');
create policy if not exists training_read_authenticated on public.training_sessions
  for select using (auth.role() = 'authenticated');

-- Write with service role
create policy if not exists analyses_write_service on public.analyses
  for insert with check (auth.role() = 'service_role');
create policy if not exists analyses_update_service on public.analyses
  for update using (auth.role() = 'service_role');

-- RPCs
create or replace function public.insert_analysis_from_payload(payload jsonb)
returns void language plpgsql security definer as $$
begin
  insert into public.analyses (id, filename, output_filename, metrics, status)
  values (
    coalesce((payload->>'id')::uuid, gen_random_uuid()),
    payload->>'original_filename',
    payload->>'output_filename',
    payload->'metrics',
    coalesce(payload->>'status', 'completed')
  )
  on conflict (id) do update set
    filename = excluded.filename,
    output_filename = excluded.output_filename,
    metrics = excluded.metrics,
    status = excluded.status;
end;$$;

create or replace function public.get_dashboard_summary()
returns jsonb language sql stable security definer as $$
  select jsonb_build_object(
    'analyses', (select count(*) from public.analyses),
    'jobs',      (select count(*) from public.jobs),
    'reports',   (select count(*) from public.reports)
  );
$$;

create or replace function public.get_latest_analyses(p_limit int)
returns setof public.analyses language sql stable security definer as $$
  select * from public.analyses order by created_at desc limit greatest(p_limit, 1);
$$;
