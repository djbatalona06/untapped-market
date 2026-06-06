-- ============================================================================
-- Untapped Market — Supabase schema (Phase A: Auth, Phase B: Media)
-- ============================================================================
-- Run this in the Supabase SQL editor (or `supabase db push`). It is idempotent
-- where practical so it can be re-applied safely.
--
-- What it sets up:
--   • public.profiles            — one row per auth user (username, tier, is_admin)
--   • public.is_admin()          — SECURITY DEFINER helper for RLS (no recursion)
--   • public.strain_media        — photos attached to a strain (moderation queue)
--   • public.dispensary_media    — photos attached to a dispensary
--   • storage bucket "media"     — public-read, admin/authenticated-write
--   • Row Level Security on everything, with an admin override.
-- ============================================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────────────────────────────────
-- PROFILES
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text unique,
  email       text,
  tier        text not null default 'free' check (tier in ('free', 'premium', 'pro')),
  is_admin    boolean not null default false,
  avatar_url  text,
  preferences jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Public profile mirror of auth.users; is_admin gates the /admin surface.';

-- SECURITY DEFINER so RLS policies can ask "is the caller an admin?" without
-- recursively triggering profiles' own RLS (which would error out).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false);
$$;

-- Auto-provision a profile row whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles are readable by everyone" on public.profiles;
create policy "profiles are readable by everyone"
  on public.profiles for select using (true);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  -- A user may edit their own row but cannot grant themselves admin or change tier.
  with check (
    auth.uid() = id
    and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid())
    and tier     = (select p.tier     from public.profiles p where p.id = auth.uid())
  );

drop policy if exists "admins manage all profiles" on public.profiles;
create policy "admins manage all profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- ────────────────────────────────────────────────────────────────────────────
-- MEDIA — shared shape for strains and dispensaries
-- ────────────────────────────────────────────────────────────────────────────
-- status flow:  pending → approved | rejected
-- Only approved media is shown to the public; pending lives in the admin queue.

create table if not exists public.strain_media (
  id            uuid primary key default gen_random_uuid(),
  strain_id     text not null,
  storage_path  text not null,             -- object key inside the "media" bucket
  alt_text      text,
  source        text not null default 'upload'
                  check (source in ('upload', 'ai-generated', 'import')),
  ai_model      text,                      -- e.g. 'higgsfield', 'flux', 'sora'
  ai_prompt     text,
  status        text not null default 'pending'
                  check (status in ('pending', 'approved', 'rejected')),
  is_primary    boolean not null default false,
  uploaded_by   uuid references auth.users (id) on delete set null,
  reviewed_by   uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now(),
  reviewed_at   timestamptz
);

create table if not exists public.dispensary_media (
  id             uuid primary key default gen_random_uuid(),
  dispensary_id  text not null,
  storage_path   text not null,
  alt_text       text,
  source         text not null default 'upload'
                   check (source in ('upload', 'ai-generated', 'import')),
  ai_model       text,
  ai_prompt      text,
  status         text not null default 'pending'
                   check (status in ('pending', 'approved', 'rejected')),
  is_primary     boolean not null default false,
  uploaded_by    uuid references auth.users (id) on delete set null,
  reviewed_by    uuid references auth.users (id) on delete set null,
  created_at     timestamptz not null default now(),
  reviewed_at    timestamptz
);

create index if not exists strain_media_strain_idx
  on public.strain_media (strain_id) where status = 'approved';
create index if not exists strain_media_status_idx
  on public.strain_media (status);
create index if not exists dispensary_media_dispensary_idx
  on public.dispensary_media (dispensary_id) where status = 'approved';
create index if not exists dispensary_media_status_idx
  on public.dispensary_media (status);

-- At most one primary per strain / dispensary.
create unique index if not exists strain_media_one_primary
  on public.strain_media (strain_id) where is_primary;
create unique index if not exists dispensary_media_one_primary
  on public.dispensary_media (dispensary_id) where is_primary;

alter table public.strain_media     enable row level security;
alter table public.dispensary_media enable row level security;

-- Public can read only APPROVED media.
drop policy if exists "approved strain media is public" on public.strain_media;
create policy "approved strain media is public"
  on public.strain_media for select
  using (status = 'approved' or public.is_admin() or uploaded_by = auth.uid());

-- Any signed-in user may submit media (lands in the pending queue).
drop policy if exists "authenticated users submit strain media" on public.strain_media;
create policy "authenticated users submit strain media"
  on public.strain_media for insert
  to authenticated
  with check (uploaded_by = auth.uid() and status = 'pending');

-- Admins moderate (approve/reject/delete/feature).
drop policy if exists "admins manage strain media" on public.strain_media;
create policy "admins manage strain media"
  on public.strain_media for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "approved dispensary media is public" on public.dispensary_media;
create policy "approved dispensary media is public"
  on public.dispensary_media for select
  using (status = 'approved' or public.is_admin() or uploaded_by = auth.uid());

drop policy if exists "authenticated users submit dispensary media" on public.dispensary_media;
create policy "authenticated users submit dispensary media"
  on public.dispensary_media for insert
  to authenticated
  with check (uploaded_by = auth.uid() and status = 'pending');

drop policy if exists "admins manage dispensary media" on public.dispensary_media;
create policy "admins manage dispensary media"
  on public.dispensary_media for all
  using (public.is_admin())
  with check (public.is_admin());

-- ────────────────────────────────────────────────────────────────────────────
-- STORAGE — public "media" bucket
-- ────────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media is publicly readable" on storage.objects;
create policy "media is publicly readable"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "authenticated users upload media" on storage.objects;
create policy "authenticated users upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

drop policy if exists "admins manage media objects" on storage.objects;
create policy "admins manage media objects"
  on storage.objects for all
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

-- ────────────────────────────────────────────────────────────────────────────
-- PHASE C: DISPENSARIES (county + WSLCB compliance)
-- ────────────────────────────────────────────────────────────────────────────
-- Mirrors src/data/dispensaries.json (the build-time source of truth) so the same
-- records can be served from Postgres with county filtering and compliance fields.
--
-- Data rights: WA cannabis retailer licensing is PUBLIC open data published by the
-- WSLCB (https://data.lcb.wa.gov + the Weekly Cannabis Report). Only public-record
-- fields are stored. Demo/seed rows carry license_status = 'unverified' and never
-- claim a license number they don't have.

create table if not exists public.dispensaries (
  id             text primary key,
  name           text not null,
  address        text,
  city           text,
  state          text not null default 'WA',
  zip            text,

  -- County / jurisdiction. county_fips (US Census, e.g. '53033' = King) is the
  -- authoritative identity; county_code ('WA-KING') is the friendly filter key.
  county         text,
  county_code    text,
  county_fips    text,

  lat            double precision,
  lng            double precision,
  -- GeoJSON Point [lng, lat], kept in sync automatically for map layers. (Enable
  -- PostGIS and add a geometry(Point,4326) column instead if you need spatial ops.)
  geo            jsonb generated always as (
                   jsonb_build_object('type', 'Point',
                     'coordinates', jsonb_build_array(lng, lat))
                 ) stored,

  -- WSLCB compliance (public record).
  license_number text,
  license_status text not null default 'unverified'
                   check (license_status in ('active','expired','pending','suspended','unverified')),
  license_expiry date,
  data_source    text not null default 'seed'
                   check (data_source in ('wa-lcb','or-olcc','seed')),

  hours          text,
  phone          text,
  rating         numeric(2,1) not null default 0,
  review_count   integer not null default 0,
  tags           text[] not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.dispensaries is
  'Licensed cannabis retailers (WSLCB/OLCC public open data) + demo seed rows. county_fips is authoritative; license_status=unverified for unconfirmed rows.';

-- Data integrity: a real license number can belong to exactly one dispensary, and
-- an ACTIVE license must actually have a number.
create unique index if not exists dispensaries_license_unique
  on public.dispensaries (license_number) where license_number is not null;
alter table public.dispensaries drop constraint if exists dispensaries_active_needs_license;
alter table public.dispensaries add constraint dispensaries_active_needs_license
  check (license_status <> 'active' or license_number is not null);

create index if not exists dispensaries_county_idx on public.dispensaries (county_code);
create index if not exists dispensaries_status_idx on public.dispensaries (license_status);
create index if not exists dispensaries_state_idx  on public.dispensaries (state);

drop trigger if exists dispensaries_touch on public.dispensaries;
create trigger dispensaries_touch before update on public.dispensaries
  for each row execute function public.touch_updated_at();

-- County-scoped read API. Pass NULL (or an empty array) to mean "All counties";
-- otherwise results are restricted to the requested county codes — a query for
-- King County can never leak Pierce/Snohomish/Kitsap/Thurston rows.
create or replace function public.dispensaries_by_county(county_codes text[] default null)
returns setof public.dispensaries
language sql
stable
as $$
  select *
  from public.dispensaries
  where county_codes is null
     or array_length(county_codes, 1) is null
     or county_code = any(county_codes)
  order by rating desc;
$$;

alter table public.dispensaries enable row level security;

-- Public can read verified rows and demo seed rows; suspended/expired hidden from
-- the public surface (admins still see everything).
drop policy if exists "dispensaries are publicly readable" on public.dispensaries;
create policy "dispensaries are publicly readable"
  on public.dispensaries for select
  using (
    public.is_admin()
    or license_status in ('active','unverified','pending')
  );

drop policy if exists "admins manage dispensaries" on public.dispensaries;
create policy "admins manage dispensaries"
  on public.dispensaries for all
  using (public.is_admin())
  with check (public.is_admin());

-- ────────────────────────────────────────────────────────────────────────────
-- BOOTSTRAP: promote your first admin (run once, replace the email)
-- ────────────────────────────────────────────────────────────────────────────
update public.profiles set is_admin = true
  where email = 'batalona06@gmail.com';
