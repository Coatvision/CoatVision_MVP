-- Seed data for CoatVision (optional)
-- Safe to run multiple times

insert into public.jobs (id, status, params)
values (uuid_generate_v4(), 'completed', '{"note":"seed job"}'::jsonb)
on conflict do nothing;

insert into public.analyses (id, created_at, filename, output_filename, metrics, status)
values (
  uuid_generate_v4(), now(), 'example.png', 'outputs/example_result.json', '{"cvi":1.23,"cqi":2.34}'::jsonb, 'completed'
) on conflict do nothing;

insert into public.reports (id, created_at, analysis_id, url, metadata)
select uuid_generate_v4(), now(), a.id, 'https://example.com/report.pdf', '{"format":"pdf"}'::jsonb
from public.analyses a
order by a.created_at desc
limit 1;
