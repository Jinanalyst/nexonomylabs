-- ============================================================================
-- Nexonomy Labs — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query), then run
-- seed.sql to populate demo content. Safe to re-run (idempotent-ish).
-- ============================================================================

-- Extensions ---------------------------------------------------------------
create extension if not exists "pgcrypto";

-- Enums --------------------------------------------------------------------
do $$ begin
  create type market_category as enum
    ('us-stocks','korea-stocks','macro','bonds','fx','commodities','crypto','general');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sentiment as enum ('bullish','bearish','neutral');
exception when duplicate_object then null; end $$;

do $$ begin
  create type comment_parent as enum ('news','analysis','community');
exception when duplicate_object then null; end $$;

do $$ begin
  create type like_target as enum ('analysis','community','comment');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- Tables
-- ============================================================================

-- profiles: one row per auth user
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique not null,
  display_name text not null,
  avatar_url   text,
  bio          text,
  role         text not null default 'user' check (role in ('user','admin')),
  created_at   timestamptz not null default now()
);

-- markets: static reference table (also drives the ticker)
create table if not exists markets (
  slug         text primary key,
  name         text not null,
  short        text not null,
  description  text not null default '',
  index_symbol text not null default '',
  index_value  numeric not null default 0,
  index_change numeric not null default 0
);

-- news
create table if not exists news (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  summary        text not null,
  content        text,
  image_url      text,
  source         text not null default '',
  source_url     text not null default '',
  market         market_category not null default 'general',
  published_at   timestamptz not null default now(),
  views          integer not null default 0,
  comments_count integer not null default 0
);

-- analysis (user-written market theses)
create table if not exists analysis (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  body            text not null,
  author_id       uuid not null references profiles(id) on delete cascade,
  market          market_category not null default 'general',
  sentiment       sentiment not null default 'neutral',
  related_news_id uuid references news(id) on delete set null,
  created_at      timestamptz not null default now(),
  likes_count     integer not null default 0,
  comments_count  integer not null default 0
);

-- community_posts
create table if not exists community_posts (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  body           text not null,
  author_id      uuid not null references profiles(id) on delete cascade,
  market         market_category not null default 'general',
  created_at     timestamptz not null default now(),
  likes_count    integer not null default 0,
  comments_count integer not null default 0
);

-- comments: unified table for news / analysis / community discussion
create table if not exists comments (
  id          uuid primary key default gen_random_uuid(),
  parent_type comment_parent not null,
  parent_id   uuid not null,
  author_id   uuid not null references profiles(id) on delete cascade,
  body        text not null,
  reply_to    uuid references comments(id) on delete cascade,
  created_at  timestamptz not null default now(),
  likes_count integer not null default 0
);
create index if not exists comments_parent_idx on comments(parent_type, parent_id);

-- likes: unified table (analysis / community / comment)
create table if not exists likes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  target_type like_target not null,
  target_id   uuid not null,
  created_at  timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

-- follows
create table if not exists follows (
  follower_id  uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- notifications (basic scaffold for future use)
create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  actor_id   uuid references profiles(id) on delete set null,
  type       text not null,
  entity_id  uuid,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Triggers: keep denormalized counts in sync
-- ============================================================================

-- New auth user -> profile row (uses metadata from signUp)
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'display_name',
             new.raw_user_meta_data->>'username',
             split_part(new.email,'@',1))
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- comment count maintenance
create or replace function bump_comment_count()
returns trigger language plpgsql as $$
declare delta int; pt comment_parent; pid uuid;
begin
  if tg_op = 'INSERT' then delta := 1; pt := new.parent_type; pid := new.parent_id;
  else delta := -1; pt := old.parent_type; pid := old.parent_id; end if;

  if pt = 'news' then
    update news set comments_count = greatest(0, comments_count + delta) where id = pid;
  elsif pt = 'analysis' then
    update analysis set comments_count = greatest(0, comments_count + delta) where id = pid;
  elsif pt = 'community' then
    update community_posts set comments_count = greatest(0, comments_count + delta) where id = pid;
  end if;
  return null;
end $$;

drop trigger if exists trg_comment_count on comments;
create trigger trg_comment_count
  after insert or delete on comments
  for each row execute function bump_comment_count();

-- like count maintenance
create or replace function bump_like_count()
returns trigger language plpgsql as $$
declare delta int; tt like_target; tid uuid;
begin
  if tg_op = 'INSERT' then delta := 1; tt := new.target_type; tid := new.target_id;
  else delta := -1; tt := old.target_type; tid := old.target_id; end if;

  if tt = 'analysis' then
    update analysis set likes_count = greatest(0, likes_count + delta) where id = tid;
  elsif tt = 'community' then
    update community_posts set likes_count = greatest(0, likes_count + delta) where id = tid;
  elsif tt = 'comment' then
    update comments set likes_count = greatest(0, likes_count + delta) where id = tid;
  end if;
  return null;
end $$;

drop trigger if exists trg_like_count on likes;
create trigger trg_like_count
  after insert or delete on likes
  for each row execute function bump_like_count();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table profiles        enable row level security;
alter table markets         enable row level security;
alter table news            enable row level security;
alter table analysis        enable row level security;
alter table community_posts enable row level security;
alter table comments        enable row level security;
alter table likes           enable row level security;
alter table follows         enable row level security;
alter table notifications   enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- Public read tables ---------------------------------------------------------
drop policy if exists "read profiles" on profiles;
create policy "read profiles" on profiles for select using (true);
drop policy if exists "update own profile" on profiles;
create policy "update own profile" on profiles for update using (auth.uid() = id);

drop policy if exists "read markets" on markets;
create policy "read markets" on markets for select using (true);

drop policy if exists "read news" on news;
create policy "read news" on news for select using (true);
drop policy if exists "admin write news" on news;
create policy "admin write news" on news for all using (is_admin()) with check (is_admin());

-- Analysis: public read, owner write, admin delete --------------------------
drop policy if exists "read analysis" on analysis;
create policy "read analysis" on analysis for select using (true);
drop policy if exists "insert own analysis" on analysis;
create policy "insert own analysis" on analysis for insert with check (auth.uid() = author_id);
drop policy if exists "update own analysis" on analysis;
create policy "update own analysis" on analysis for update using (auth.uid() = author_id);
drop policy if exists "delete own or admin analysis" on analysis;
create policy "delete own or admin analysis" on analysis for delete using (auth.uid() = author_id or is_admin());

-- Community posts -----------------------------------------------------------
drop policy if exists "read posts" on community_posts;
create policy "read posts" on community_posts for select using (true);
drop policy if exists "insert own post" on community_posts;
create policy "insert own post" on community_posts for insert with check (auth.uid() = author_id);
drop policy if exists "update own post" on community_posts;
create policy "update own post" on community_posts for update using (auth.uid() = author_id);
drop policy if exists "delete own or admin post" on community_posts;
create policy "delete own or admin post" on community_posts for delete using (auth.uid() = author_id or is_admin());

-- Comments ------------------------------------------------------------------
drop policy if exists "read comments" on comments;
create policy "read comments" on comments for select using (true);
drop policy if exists "insert own comment" on comments;
create policy "insert own comment" on comments for insert with check (auth.uid() = author_id);
drop policy if exists "delete own or admin comment" on comments;
create policy "delete own or admin comment" on comments for delete using (auth.uid() = author_id or is_admin());

-- Likes ---------------------------------------------------------------------
drop policy if exists "read likes" on likes;
create policy "read likes" on likes for select using (true);
drop policy if exists "like as self" on likes;
create policy "like as self" on likes for insert with check (auth.uid() = user_id);
drop policy if exists "unlike as self" on likes;
create policy "unlike as self" on likes for delete using (auth.uid() = user_id);

-- Follows -------------------------------------------------------------------
drop policy if exists "read follows" on follows;
create policy "read follows" on follows for select using (true);
drop policy if exists "follow as self" on follows;
create policy "follow as self" on follows for insert with check (auth.uid() = follower_id);
drop policy if exists "unfollow as self" on follows;
create policy "unfollow as self" on follows for delete using (auth.uid() = follower_id);

-- Notifications -------------------------------------------------------------
drop policy if exists "read own notifications" on notifications;
create policy "read own notifications" on notifications for select using (auth.uid() = user_id);
drop policy if exists "update own notifications" on notifications;
create policy "update own notifications" on notifications for update using (auth.uid() = user_id);

-- Done. Now run seed.sql for demo content.
