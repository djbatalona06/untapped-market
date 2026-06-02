-- Untapped Market — V2 Postgres schema for Supabase.
-- Mirrors the TypeScript types in src/store/types.ts.
-- Apply with: `supabase db reset` (which runs migrations + seed.sql).

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- profiles: 1-to-1 with auth.users
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text unique not null,
  show_real_name  boolean not null default false,
  real_name       text,
  tier            text not null default 'free' check (tier in ('free', 'premium')),
  created_at      timestamptz not null default now()
);

-- strains: canonical strain catalog
create table if not exists public.strains (
  id           text primary key,
  name         text not null,
  type         text not null check (type in ('indica', 'sativa', 'hybrid')),
  thc          numeric(5, 2) not null,
  cbd          numeric(5, 2) not null,
  terpenes     jsonb not null default '[]'::jsonb,
  effects      text[] not null default '{}',
  flavors      text[] not null default '{}',
  lineage      jsonb not null default '{"mother": null, "father": null}'::jsonb,
  lab_data     jsonb not null default '{}'::jsonb,
  chemotype    text not null default '',
  description  text not null default '',
  color        text not null default '#7cb87a',
  like_count   integer not null default 0,
  created_at   timestamptz not null default now()
);

-- dispensaries: PNW only for V2 launch
create table if not exists public.dispensaries (
  id      text primary key,
  name    text not null,
  address text not null,
  city    text not null,
  state   text not null check (state in ('WA', 'OR')),
  lat     numeric(9, 6) not null,
  lng     numeric(9, 6) not null,
  hours   text not null default '',
  rating  numeric(2, 1) not null default 0,
  phone   text not null default ''
);

-- strain_dispensary: many-to-many inventory edge
create table if not exists public.strain_dispensary (
  strain_id      text not null references public.strains(id) on delete cascade,
  dispensary_id  text not null references public.dispensaries(id) on delete cascade,
  in_stock       boolean not null default true,
  primary key (strain_id, dispensary_id)
);

-- trip_reports: user-submitted experiences
create table if not exists public.trip_reports (
  id          uuid primary key default gen_random_uuid(),
  strain_id   text not null references public.strains(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  rating      integer not null check (rating between 1 and 5),
  effects     text[] not null default '{}',
  method      text not null check (method in ('flower', 'edible', 'concentrate', 'vape', 'other')),
  note        text not null default '',
  upvotes     integer not null default 0,
  downvotes   integer not null default 0,
  hidden      boolean not null default false,
  created_at  timestamptz not null default now()
);

-- bookmarks: user's saved strains
create table if not exists public.bookmarks (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  strain_id   text not null references public.strains(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, strain_id)
);

-- likes: drives strains.like_count via trigger
create table if not exists public.likes (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  strain_id   text not null references public.strains(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, strain_id)
);

-- folders: premium-only feature
create table if not exists public.folders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.folder_strains (
  folder_id   uuid not null references public.folders(id) on delete cascade,
  strain_id   text not null references public.strains(id) on delete cascade,
  primary key (folder_id, strain_id)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_strain_dispensary_dispensary on public.strain_dispensary(dispensary_id);
create index if not exists idx_trip_reports_strain          on public.trip_reports(strain_id);
create index if not exists idx_trip_reports_user            on public.trip_reports(user_id);
create index if not exists idx_bookmarks_user               on public.bookmarks(user_id);
create index if not exists idx_likes_strain                 on public.likes(strain_id);
create index if not exists idx_folders_user                 on public.folders(user_id);

-- ---------------------------------------------------------------------------
-- Trigger: maintain strains.like_count
-- ---------------------------------------------------------------------------
create or replace function public.sync_strain_like_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if (tg_op = 'INSERT') then
    update public.strains
       set like_count = like_count + 1
     where id = new.strain_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.strains
       set like_count = greatest(like_count - 1, 0)
     where id = old.strain_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_likes_sync_count on public.likes;
create trigger trg_likes_sync_count
after insert or delete on public.likes
for each row execute function public.sync_strain_like_count();

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.strains          enable row level security;
alter table public.dispensaries     enable row level security;
alter table public.strain_dispensary enable row level security;
alter table public.trip_reports     enable row level security;
alter table public.bookmarks        enable row level security;
alter table public.likes            enable row level security;
alter table public.folders          enable row level security;
alter table public.folder_strains   enable row level security;

-- profiles: public read, self-update only
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public" on public.profiles
  for select using (true);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- strains, dispensaries, strain_dispensary: public read only
drop policy if exists "strains_select_public" on public.strains;
create policy "strains_select_public" on public.strains
  for select using (true);

drop policy if exists "dispensaries_select_public" on public.dispensaries;
create policy "dispensaries_select_public" on public.dispensaries
  for select using (true);

drop policy if exists "strain_dispensary_select_public" on public.strain_dispensary;
create policy "strain_dispensary_select_public" on public.strain_dispensary
  for select using (true);

-- trip_reports: public read (excluding hidden), self insert/update/delete
drop policy if exists "trip_reports_select_public" on public.trip_reports;
create policy "trip_reports_select_public" on public.trip_reports
  for select using (hidden = false or auth.uid() = user_id);

drop policy if exists "trip_reports_insert_self" on public.trip_reports;
create policy "trip_reports_insert_self" on public.trip_reports
  for insert with check (auth.uid() = user_id);

drop policy if exists "trip_reports_update_self" on public.trip_reports;
create policy "trip_reports_update_self" on public.trip_reports
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "trip_reports_delete_self" on public.trip_reports;
create policy "trip_reports_delete_self" on public.trip_reports
  for delete using (auth.uid() = user_id);

-- bookmarks: own only
drop policy if exists "bookmarks_select_self" on public.bookmarks;
create policy "bookmarks_select_self" on public.bookmarks
  for select using (auth.uid() = user_id);

drop policy if exists "bookmarks_insert_self" on public.bookmarks;
create policy "bookmarks_insert_self" on public.bookmarks
  for insert with check (auth.uid() = user_id);

drop policy if exists "bookmarks_delete_self" on public.bookmarks;
create policy "bookmarks_delete_self" on public.bookmarks
  for delete using (auth.uid() = user_id);

-- likes: own only
drop policy if exists "likes_select_self" on public.likes;
create policy "likes_select_self" on public.likes
  for select using (auth.uid() = user_id);

drop policy if exists "likes_insert_self" on public.likes;
create policy "likes_insert_self" on public.likes
  for insert with check (auth.uid() = user_id);

drop policy if exists "likes_delete_self" on public.likes;
create policy "likes_delete_self" on public.likes
  for delete using (auth.uid() = user_id);

-- folders & folder_strains: own only
drop policy if exists "folders_select_self" on public.folders;
create policy "folders_select_self" on public.folders
  for select using (auth.uid() = user_id);

drop policy if exists "folders_insert_self" on public.folders;
create policy "folders_insert_self" on public.folders
  for insert with check (auth.uid() = user_id);

drop policy if exists "folders_update_self" on public.folders;
create policy "folders_update_self" on public.folders
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "folders_delete_self" on public.folders;
create policy "folders_delete_self" on public.folders
  for delete using (auth.uid() = user_id);

drop policy if exists "folder_strains_select_self" on public.folder_strains;
create policy "folder_strains_select_self" on public.folder_strains
  for select using (
    exists (select 1 from public.folders f
             where f.id = folder_strains.folder_id and f.user_id = auth.uid())
  );

drop policy if exists "folder_strains_insert_self" on public.folder_strains;
create policy "folder_strains_insert_self" on public.folder_strains
  for insert with check (
    exists (select 1 from public.folders f
             where f.id = folder_strains.folder_id and f.user_id = auth.uid())
  );

drop policy if exists "folder_strains_delete_self" on public.folder_strains;
create policy "folder_strains_delete_self" on public.folder_strains
  for delete using (
    exists (select 1 from public.folders f
             where f.id = folder_strains.folder_id and f.user_id = auth.uid())
  );
