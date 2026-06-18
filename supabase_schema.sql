-- ============================================================
-- IELTS AllInOne — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. PROFILES (extends auth.users)
create table if not exists public.profiles (
  id           uuid references auth.users(id) on delete cascade primary key,
  username     text unique not null,
  nickname     text not null,
  xp           integer default 0,
  streak       integer default 0,
  weeks_to_exam integer,
  last_active  timestamptz default now(),
  created_at   timestamptz default now()
);

-- 2. SCORES (one row per test attempt)
create table if not exists public.scores (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.profiles(id) on delete cascade,
  module     text not null check (module in ('listening','reading','writing','speaking')),
  band       numeric(3,1),
  correct    integer,
  total      integer,
  pauses     integer default 0,
  word_count integer default 0,
  created_at timestamptz default now()
);

-- 3. LEADERBOARD VIEW
create or replace view public.leaderboard as
select
  p.id,
  p.nickname,
  p.username,
  p.xp,
  p.streak,
  round(avg(s.band) filter (where s.module = 'listening'), 1) as listening,
  round(avg(s.band) filter (where s.module = 'reading'),   1) as reading,
  round(avg(s.band) filter (where s.module = 'writing'),   1) as writing,
  round(avg(s.band) filter (where s.module = 'speaking'),  1) as speaking,
  round(avg(s.band), 1) as overall_band
from public.profiles p
left join public.scores s on s.user_id = p.id
group by p.id, p.nickname, p.username, p.xp, p.streak
order by p.xp desc;

-- 4. ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.scores   enable row level security;

-- Profiles: users can read all, but only update their own
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Scores: users can read all, insert/update own
create policy "scores_select_all" on public.scores for select using (true);
create policy "scores_insert_own" on public.scores for insert with check (auth.uid() = user_id);

-- 5. AUTO-CREATE PROFILE ON SIGNUP
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, nickname)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'nickname'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
