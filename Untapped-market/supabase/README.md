# Supabase — Untapped Market

Local Postgres + Auth + RLS stack for the V2 migration.

## Prerequisites
- Docker Desktop running
- Supabase CLI: `npm i -g supabase` (or `brew install supabase/tap/supabase`)

## First-time setup
```bash
# from repo root
cd supabase
supabase init       # only if /supabase/config.toml does not yet exist
supabase start      # boots Postgres, Auth, Studio, etc. on local ports
```

## Apply schema + seed
The CLI runs every `.sql` file in `supabase/migrations/` plus `seed.sql` on
`db reset`. Easiest path:

```bash
mkdir -p migrations
cp schema.sql migrations/0001_init.sql
supabase db reset   # drops local DB, replays migrations, then runs seed.sql
```

For an already-running cluster, push schema changes only:
```bash
supabase db push
```

## Useful endpoints
- Studio UI:  http://localhost:54323
- Postgres:   `postgresql://postgres:postgres@localhost:54322/postgres`
