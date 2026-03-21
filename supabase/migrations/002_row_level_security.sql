-- Astroday RLS policies — run after 001_initial_schema.sql.
-- Users can only read and write their own data.
-- Service role (used by API routes) bypasses RLS entirely.

-- ============================================================
-- users
-- ============================================================
alter table public.users enable row level security;

create policy "users: select own row"
  on public.users for select
  using (auth.uid() = id);

create policy "users: insert own row"
  on public.users for insert
  with check (auth.uid() = id);

create policy "users: update own row"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No delete policy — users table rows are soft-managed via Stripe.

-- ============================================================
-- profiles
-- ============================================================
alter table public.profiles enable row level security;

create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "profiles: delete own"
  on public.profiles for delete
  using (auth.uid() = user_id);

-- ============================================================
-- daily_scores
-- ============================================================
alter table public.daily_scores enable row level security;

create policy "daily_scores: select own"
  on public.daily_scores for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = daily_scores.profile_id
        and profiles.user_id = auth.uid()
    )
  );

create policy "daily_scores: insert own"
  on public.daily_scores for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = daily_scores.profile_id
        and profiles.user_id = auth.uid()
    )
  );

create policy "daily_scores: update own"
  on public.daily_scores for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = daily_scores.profile_id
        and profiles.user_id = auth.uid()
    )
  );

-- ============================================================
-- daily_insights
-- ============================================================
alter table public.daily_insights enable row level security;

create policy "daily_insights: select own"
  on public.daily_insights for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = daily_insights.profile_id
        and profiles.user_id = auth.uid()
    )
  );

create policy "daily_insights: insert own"
  on public.daily_insights for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = daily_insights.profile_id
        and profiles.user_id = auth.uid()
    )
  );

-- ============================================================
-- journal_entries
-- ============================================================
alter table public.journal_entries enable row level security;

create policy "journal_entries: select own"
  on public.journal_entries for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = journal_entries.profile_id
        and profiles.user_id = auth.uid()
    )
  );

create policy "journal_entries: insert own"
  on public.journal_entries for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = journal_entries.profile_id
        and profiles.user_id = auth.uid()
    )
  );

create policy "journal_entries: update own"
  on public.journal_entries for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = journal_entries.profile_id
        and profiles.user_id = auth.uid()
    )
  );

create policy "journal_entries: delete own"
  on public.journal_entries for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = journal_entries.profile_id
        and profiles.user_id = auth.uid()
    )
  );

-- ============================================================
-- quick_tool_cache
-- ============================================================
alter table public.quick_tool_cache enable row level security;

create policy "quick_tool_cache: select own"
  on public.quick_tool_cache for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = quick_tool_cache.profile_id
        and profiles.user_id = auth.uid()
    )
  );

create policy "quick_tool_cache: insert own"
  on public.quick_tool_cache for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = quick_tool_cache.profile_id
        and profiles.user_id = auth.uid()
    )
  );

-- ============================================================
-- meetings
-- ============================================================
alter table public.meetings enable row level security;

create policy "meetings: select own"
  on public.meetings for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = meetings.profile_id
        and profiles.user_id = auth.uid()
    )
  );

create policy "meetings: insert own"
  on public.meetings for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = meetings.profile_id
        and profiles.user_id = auth.uid()
    )
  );

create policy "meetings: update own"
  on public.meetings for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = meetings.profile_id
        and profiles.user_id = auth.uid()
    )
  );

create policy "meetings: delete own"
  on public.meetings for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = meetings.profile_id
        and profiles.user_id = auth.uid()
    )
  );

-- ============================================================
-- pattern_insights
-- ============================================================
alter table public.pattern_insights enable row level security;

create policy "pattern_insights: select own"
  on public.pattern_insights for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = pattern_insights.profile_id
        and profiles.user_id = auth.uid()
    )
  );

create policy "pattern_insights: insert own"
  on public.pattern_insights for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = pattern_insights.profile_id
        and profiles.user_id = auth.uid()
    )
  );
