create table if not exists public.project_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  customer_info jsonb not null default '{}'::jsonb,
  current_step smallint not null default 1 check (current_step between 1 and 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.project_drafts to authenticated;

alter table public.project_drafts enable row level security;

drop policy if exists "Users can read their own project draft" on public.project_drafts;
create policy "Users can read their own project draft"
  on public.project_drafts for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own project draft" on public.project_drafts;
create policy "Users can create their own project draft"
  on public.project_drafts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own project draft" on public.project_drafts;
create policy "Users can update their own project draft"
  on public.project_drafts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.set_project_draft_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists project_drafts_set_updated_at on public.project_drafts;
create trigger project_drafts_set_updated_at
  before update on public.project_drafts
  for each row execute function public.set_project_draft_updated_at();
