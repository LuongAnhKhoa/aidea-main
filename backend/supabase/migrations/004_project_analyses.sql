create table if not exists public.project_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  draft_id uuid references public.project_drafts (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'failed')),
  request_data jsonb not null default '{}'::jsonb,
  result jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_analyses_user_created_at_idx
  on public.project_analyses (user_id, created_at desc);

grant select, insert, update on public.project_analyses to authenticated;

alter table public.project_analyses enable row level security;

drop policy if exists "Users can read their own project analyses" on public.project_analyses;
create policy "Users can read their own project analyses"
  on public.project_analyses for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own project analyses" on public.project_analyses;
create policy "Users can create their own project analyses"
  on public.project_analyses for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and (
      draft_id is null
      or exists (
        select 1
        from public.project_drafts
        where project_drafts.id = draft_id
          and project_drafts.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists "Users can update their own project analyses" on public.project_analyses;
create policy "Users can update their own project analyses"
  on public.project_analyses for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (
      draft_id is null
      or exists (
        select 1
        from public.project_drafts
        where project_drafts.id = draft_id
          and project_drafts.user_id = (select auth.uid())
      )
    )
  );

create or replace function public.set_project_analysis_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists project_analyses_set_updated_at on public.project_analyses;
create trigger project_analyses_set_updated_at
  before update on public.project_analyses
  for each row execute function public.set_project_analysis_updated_at();
