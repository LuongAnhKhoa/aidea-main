alter table public.project_drafts
  add column if not exists product_info jsonb not null default '{}'::jsonb;
