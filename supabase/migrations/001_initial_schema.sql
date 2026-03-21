-- Astroday initial schema — run once in Supabase SQL editor.
-- All tables use UUIDs. Timestamps default to now(). Soft enums via text + check constraints.

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- users
-- Mirrors auth.users but holds app-level subscription state.
-- id matches auth.users.id — populated on first sign-in via trigger or API.
-- ============================================================
create table if not exists public.users (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text unique not null,
  created_at          timestamptz not null default now(),
  subscription_tier   text not null default 'free' check (subscription_tier in ('free', 'pro')),
  subscription_status text not null default 'trialing' check (subscription_status in ('active', 'trialing', 'cancelled', 'expired')),
  stripe_customer_id  text,
  trial_ends_at       timestamptz,
  onboarding_complete boolean not null default false
);

-- ============================================================
-- profiles
-- A user can have multiple natal charts (primary + extras).
-- Extra profiles are a paid expansion (€4/month each).
-- ============================================================
create table if not exists public.profiles (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.users(id) on delete cascade,
  label                  text not null default 'My Chart',
  birth_date             date not null,
  birth_time             time,
  birth_city             text,
  birth_lat              double precision,
  birth_lng              double precision,
  natal_chart            jsonb,
  accuracy_tier          text not null default 'basic' check (accuracy_tier in ('full', 'good', 'basic')),
  is_primary             boolean not null default false,
  onboarding_work_type   text,
  onboarding_focus       text,
  onboarding_preference  text check (onboarding_preference in ('brief', 'detailed')),
  onboarding_goal        text,
  created_at             timestamptz not null default now()
);

-- Only one primary profile per user
create unique index if not exists profiles_user_primary_idx
  on public.profiles(user_id) where is_primary = true;

-- ============================================================
-- daily_scores
-- Cached calculation results per profile per date.
-- One row per profile+date. Recalculated only if missing.
-- ============================================================
create table if not exists public.daily_scores (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  date          date not null,
  overall       text not null check (overall in ('green', 'red', 'grey')),
  contacts      text not null check (contacts in ('green', 'red', 'grey')),
  money         text not null check (money in ('green', 'red', 'grey')),
  risk          text not null check (risk in ('green', 'red', 'grey')),
  new_projects  text not null check (new_projects in ('green', 'red', 'grey')),
  decisions     text not null check (decisions in ('green', 'red', 'grey')),
  calculated_at timestamptz not null default now(),
  unique (profile_id, date)
);

-- ============================================================
-- daily_insights
-- Cached AI-generated insight text per profile+date+category+time_of_day.
-- Prevents re-generating the same insight twice (controls Claude API costs).
-- ============================================================
create table if not exists public.daily_insights (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  date         date not null,
  time_of_day  text not null check (time_of_day in ('morning', 'afternoon', 'evening')),
  category     text not null check (category in ('overall', 'contacts', 'money', 'risk', 'new_projects', 'decisions')),
  insight_text text not null,
  generated_at timestamptz not null default now(),
  unique (profile_id, date, time_of_day, category)
);

-- ============================================================
-- journal_entries
-- User's own daily observations. One entry per profile per date.
-- forecast_match is the user's rating of how the day matched the forecast.
-- ============================================================
create table if not exists public.journal_entries (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  date            date not null,
  entry_text      text,
  forecast_match  text check (forecast_match in ('matched', 'partial', 'did_not_match')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (profile_id, date)
);

-- ============================================================
-- quick_tool_cache
-- Cached quick tool outputs (email opener, what to avoid, action prompt).
-- Pro subscribers only. Cached per profile+date+tool_type+category.
-- ============================================================
create table if not exists public.quick_tool_cache (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  date         date not null,
  tool_type    text not null check (tool_type in ('email_opener', 'what_to_avoid', 'action_prompt')),
  category     text not null check (category in ('contacts', 'money', 'risk', 'new_projects', 'decisions')),
  output_text  text not null,
  generated_at timestamptz not null default now(),
  unique (profile_id, date, tool_type, category)
);

-- ============================================================
-- meetings
-- Pro feature: user logs meetings, app generates a pre-meeting brief.
-- ============================================================
create table if not exists public.meetings (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid not null references public.profiles(id) on delete cascade,
  meeting_datetime timestamptz not null,
  title            text not null,
  brief_text       text,
  generated_at     timestamptz
);

-- ============================================================
-- pattern_insights
-- AI-generated pattern observations surfaced after 30+ days of data.
-- valid_until signals when to regenerate (typically 7 days).
-- ============================================================
create table if not exists public.pattern_insights (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  pattern_text text not null,
  generated_at timestamptz not null default now(),
  valid_until  timestamptz not null
);
