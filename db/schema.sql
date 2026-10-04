-- Pursuit: Supabase schema
-- Run in the Supabase SQL editor (or `supabase db push`) before switching
-- NEXT_PUBLIC_DATA_MODE=supabase. Written for a fresh project.
--
-- Who writes what:
--   * The web app (anon key + user session) reads its own rows, edits its
--     profile, toggles/adds/removes sources, saves/skips matches, answers
--     clarifying questions, records views, and inserts approvals. Row level
--     security enforces all of this.
--   * n8n (service role key, bypasses RLS) writes opportunities, matches,
--     campaigns, campaign_events and agent_activity, updates source health,
--     and processes approvals and retest requests.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- enums

create type public.source_kind      as enum ('gmail', 'web', 'upload', 'manual');
create type public.source_status    as enum ('healthy', 'repairing', 'broken');
create type public.category         as enum ('scholarship', 'hackathon', 'internship', 'event');
create type public.verdict          as enum ('eligible', 'not_eligible', 'unclear');
create type public.match_status     as enum ('new', 'saved', 'skipped');
create type public.step_kind        as enum ('found', 'verified', 'drafted', 'approved', 'sent', 'follow_up', 'recommendation');
create type public.step_status      as enum ('done', 'pending', 'upcoming', 'skipped');
create type public.approval_action  as enum ('approve', 'edit', 'skip');
create type public.activity_kind    as enum ('scan', 'found', 'repair', 'draft', 'sent');

-- ---------------------------------------------------------------- helpers

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------- profiles

create table public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  name              text not null default '',
  email             text not null default '',
  location          text not null default '',
  citizenship       text not null default '',
  level             text not null default '',      -- level of study
  field             text not null default '',      -- field / branch
  college           text not null default '',
  gpa               text not null default '',      -- optional, free text (e.g. "8.2 / 10")
  skills            text[] not null default '{}',
  interests         text[] not null default '{}',
  documents         text[] not null default '{}',  -- documents on hand
  notify_digest     boolean not null default true, -- email digest
  notify_reminders  boolean not null default true, -- deadline reminders
  onboarded_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'full_name',
      split_part(coalesce(new.email, ''), '@', 1)
    )
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- sources
-- owner_id null = public source (shared, togglable per user);
-- otherwise one of the user's own sources (Gmail, a URL they added).

create table public.sources (
  id                   text primary key default ('src-' || substr(gen_random_uuid()::text, 1, 8)),
  name                 text not null,
  kind                 public.source_kind not null,
  url                  text,
  owner_id             uuid references public.profiles (id) on delete cascade,
  status               public.source_status not null default 'repairing',
  last_checked_at      timestamptz,
  retest_requested_at  timestamptz,  -- set by the user; n8n re-scans and clears it
  created_at           timestamptz not null default now()
);

-- Per-user on/off for public sources. No row = enabled.
create table public.source_subscriptions (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  source_id  text not null references public.sources (id) on delete cascade,
  enabled    boolean not null default true,
  primary key (user_id, source_id)
);

-- ---------------------------------------------------------------- opportunities
-- The shared catalogue. Eligibility is per user and lives in matches.

create table public.opportunities (
  id                  text primary key,
  source_id           text references public.sources (id) on delete set null,
  title               text not null,
  org                 text not null,
  category            public.category not null,
  deadline            date not null,
  url                 text not null default '',
  reward              text not null default '',
  terms               text[] not null default '{}',
  required_documents  text[] not null default '{}',
  effort_hours        integer not null default 0 check (effort_hours >= 0),
  created_at          timestamptz not null default now()
);

create index opportunities_deadline_idx on public.opportunities (deadline);

-- ---------------------------------------------------------------- matches
-- One user x one opportunity: n8n's verdict with the quoted clause,
-- per-criterion flags, confidence, rank, and the user's own status.

create table public.matches (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles (id) on delete cascade,
  opportunity_id        text not null references public.opportunities (id) on delete cascade,
  verdict               public.verdict not null,
  confidence            smallint not null check (confidence between 0 and 100),
  -- [{ "label": "Clause match", "score": 97 }]
  confidence_breakdown  jsonb not null default '[]'::jsonb,
  clause                text not null,
  clause_source         text not null default '',
  -- [{ "text": "...", "status": "met|borderline|unverified|not_met", "clause": "..." }]
  criteria              jsonb not null default '[]'::jsonb,
  reasoning             text not null default '',
  rank                  smallint check (rank between 1 and 3),
  is_new                boolean not null default true,
  status                public.match_status not null default 'new',
  -- [{ "id": "q-cgpa", "question": "...", "answer": null }]
  questions             jsonb not null default '[]'::jsonb,
  found_at              timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (user_id, opportunity_id)
);

create index matches_user_idx on public.matches (user_id);
create trigger matches_updated_at before update on public.matches
  for each row execute function public.set_updated_at();

-- Recently viewed opportunities, one row per user x opportunity.
create table public.opportunity_views (
  user_id         uuid not null references public.profiles (id) on delete cascade,
  opportunity_id  text not null references public.opportunities (id) on delete cascade,
  viewed_at       timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);

-- ---------------------------------------------------------------- campaigns

create table public.campaigns (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  opportunity_id  text not null references public.opportunities (id) on delete cascade,
  state_label     text,  -- e.g. 'Drafted · awaiting your approval'
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, opportunity_id)
);

create index campaigns_user_idx on public.campaigns (user_id);
create trigger campaigns_updated_at before update on public.campaigns
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- campaign_events
-- The timeline steps of a campaign.

create table public.campaign_events (
  id           uuid primary key default gen_random_uuid(),
  campaign_id  uuid not null references public.campaigns (id) on delete cascade,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  position     smallint not null,
  kind         public.step_kind not null,
  status       public.step_status not null default 'upcoming',
  at_label     text not null default '',
  title        text not null,
  detail       text not null default '',
  draft        text,
  occurred_at  timestamptz,
  updated_at   timestamptz not null default now(),
  unique (campaign_id, kind)
);

create index campaign_events_user_status_idx on public.campaign_events (user_id, status);
create trigger campaign_events_updated_at before update on public.campaign_events
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- approvals
-- The human's decision on a pending step. The web app inserts; n8n picks it
-- up, acts (send email, etc.), updates the event and sets processed_at.

create table public.approvals (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles (id) on delete cascade,
  campaign_event_id  uuid not null references public.campaign_events (id) on delete cascade,
  action             public.approval_action not null,
  draft              text,
  created_at         timestamptz not null default now(),
  processed_at       timestamptz
);

create index approvals_unprocessed_idx on public.approvals (created_at) where processed_at is null;

-- ---------------------------------------------------------------- agent_activity
-- "Pursuit is working" feed: what the agent did for this user.

create table public.agent_activity (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  kind        public.activity_kind not null,
  message     text not null,
  href        text,
  created_at  timestamptz not null default now()
);

create index agent_activity_user_idx on public.agent_activity (user_id, created_at desc);

-- ---------------------------------------------------------------- row level security

alter table public.profiles             enable row level security;
alter table public.sources              enable row level security;
alter table public.source_subscriptions enable row level security;
alter table public.opportunities        enable row level security;
alter table public.matches              enable row level security;
alter table public.opportunity_views    enable row level security;
alter table public.campaigns            enable row level security;
alter table public.campaign_events      enable row level security;
alter table public.approvals            enable row level security;
alter table public.agent_activity       enable row level security;

-- profiles: you see and edit only yourself. Rows come from the signup trigger.
create policy "profiles: read own"   on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles: update own" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- sources: public sources plus your own; add, retest and delete only your own.
create policy "sources: read public or own" on public.sources for select to authenticated
  using (owner_id is null or owner_id = auth.uid());
create policy "sources: add own" on public.sources for insert to authenticated
  with check (owner_id = auth.uid());
create policy "sources: update own" on public.sources for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "sources: delete own" on public.sources for delete to authenticated
  using (owner_id = auth.uid());

-- source_subscriptions: manage your own toggles.
create policy "subscriptions: read own"   on public.source_subscriptions for select to authenticated using (user_id = auth.uid());
create policy "subscriptions: insert own" on public.source_subscriptions for insert to authenticated with check (user_id = auth.uid());
create policy "subscriptions: update own" on public.source_subscriptions for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- opportunities: readable by any signed-in user; only n8n (service role) writes.
create policy "opportunities: read" on public.opportunities for select to authenticated using (true);

-- matches: read own; update own, limited to status + questions by column grants below.
create policy "matches: read own"   on public.matches for select to authenticated using (user_id = auth.uid());
create policy "matches: update own" on public.matches for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- opportunity_views: manage your own.
create policy "views: read own"   on public.opportunity_views for select to authenticated using (user_id = auth.uid());
create policy "views: insert own" on public.opportunity_views for insert to authenticated with check (user_id = auth.uid());
create policy "views: update own" on public.opportunity_views for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- campaigns, events, activity: read own; only n8n writes.
create policy "campaigns: read own"       on public.campaigns       for select to authenticated using (user_id = auth.uid());
create policy "campaign_events: read own" on public.campaign_events for select to authenticated using (user_id = auth.uid());
create policy "agent_activity: read own"  on public.agent_activity  for select to authenticated using (user_id = auth.uid());

-- approvals: read own; insert only for your own campaign events.
create policy "approvals: read own" on public.approvals for select to authenticated using (user_id = auth.uid());
create policy "approvals: insert own" on public.approvals for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.campaign_events e
      where e.id = campaign_event_id and e.user_id = auth.uid()
    )
  );

-- Column-level limits on top of RLS.
revoke update on public.profiles from authenticated;
grant  update (name, location, citizenship, level, field, college, gpa, skills, interests,
               documents, notify_digest, notify_reminders, onboarded_at)
  on public.profiles to authenticated;

revoke insert, update on public.sources from authenticated;
grant  insert (name, kind, url, owner_id) on public.sources to authenticated;
grant  update (retest_requested_at)       on public.sources to authenticated;

revoke update on public.matches from authenticated;
grant  update (status, questions) on public.matches to authenticated;

revoke insert on public.approvals from authenticated;
grant  insert (user_id, campaign_event_id, action, draft) on public.approvals to authenticated;
