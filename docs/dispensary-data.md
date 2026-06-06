# Dispensary data — counties, compliance & the WSLCB import

This documents the dispensary data model added to support **county filtering** and
**WSLCB compliance fields** across the five Puget Sound counties.

## Status of the current data (read this first)

The 112 records in `src/data/dispensaries.json` are **demo / seed data**, not a
verified registry. They use reserved `555` phone numbers and carry
`licenseStatus: "unverified"`, `licenseNumber: null`, `dataSource: "seed"`.

We deliberately **do not fabricate license numbers**. Verified, license-backed
records flow in from the state open-data feed (below); when they do, they replace
the seed rows with `dataSource: "wa-lcb"` and a real `licenseStatus`/`licenseNumber`.

## Counties

The app features five counties. The authoritative identity is the US Census
**FIPS** code; `countyCode` is a friendly, stable alias used in the UI/API filter.

| County    | `countyCode`   | `countyFips` |
|-----------|----------------|--------------|
| King      | `WA-KING`      | `53033`      |
| Pierce    | `WA-PIERCE`    | `53053`      |
| Snohomish | `WA-SNOHOMISH` | `53061`      |
| Kitsap    | `WA-KITSAP`    | `53035`      |
| Thurston  | `WA-THURSTON`  | `53067`      |

- Registry (Node pipeline): `scripts/lib/counties.mjs` (all 39 WA counties).
- Registry (client/API): `src/lib/counties.ts` (the five featured counties).
- County is resolved per row by: explicit source `county` → city map → nearest
  county centroid (coordinate fallback). The collector stamps every row.

> Note on the `WA-0001`-style scheme: we use FIPS as the real code because it is
> the dedupe-safe, government-standard identifier. `WA-KING` is the human alias.
> If you specifically want a sequential `WA-0001` code too, it's a one-line add to
> the registry — say the word.

## Geo-coding

Each row stores `coordinates: { lat, lng }`. The Postgres table also exposes a
generated **GeoJSON** `geo` column:

```json
{ "type": "Point", "coordinates": [-122.6329, 47.5673] }
```

(For WKT/PostGIS spatial queries, enable the `postgis` extension and add a
`geometry(Point,4326)` column — noted inline in `schema.sql`.) Coordinates are
validated against the PNW bounding box in `scripts/lib/pnw.mjs`.

## Filtering by county

A query for one county **never** leaks the other four — only `"All"` returns
everything. Single chokepoint, two parallel implementations:

**Client / API (`src/lib/counties.ts`):**

```ts
import { queryByCounty } from './lib/counties';

queryByCounty(list, 'All');                       // every dispensary
queryByCounty(list, 'WA-KING');                   // King County only
queryByCounty(list, ['WA-KING', 'WA-PIERCE']);    // King + Pierce only
```

**Postgres (`schema.sql`):**

```sql
-- King County only:
select * from public.dispensaries_by_county(array['WA-KING']);
-- All counties (NULL = no filter):
select * from public.dispensaries_by_county(null);
```

```sql
-- Or inline, via the Supabase client:
-- supabase.from('dispensaries').select('*').eq('county_code', 'WA-KING')
```

The finder UI (`src/pages/FinderPage.tsx`) drives this with county chips
(All · King · Pierce · Snohomish · Kitsap · Thurston); the map layer renders
whatever the filter returns.

## Compliance fields (WSLCB)

| Field           | Meaning |
|-----------------|---------|
| `licenseNumber` | WSLCB marijuana retailer license; `null` until verified. |
| `licenseStatus` | `active` \| `expired` \| `pending` \| `suspended` \| `unverified`. |
| `licenseExpiry` | ISO `YYYY-MM-DD`, when published by the state. |
| `dataSource`    | `wa-lcb` \| `or-olcc` \| `seed`. |

Integrity rules enforced in `scripts/lib/schema.mjs` **and** as Postgres
constraints:
- `licenseNumber` is unique across rows (no two shops share a license).
- `licenseStatus: 'active'` **requires** a `licenseNumber`.
- The public RLS read policy hides `expired`/`suspended` rows from non-admins.

## Importing the real WSLCB data

Source: **WA Liquor and Cannabis Board** open data —
[data.lcb.wa.gov](https://data.lcb.wa.gov) (Socrata) and the Weekly Cannabis Report
under [Frequently Requested Lists](https://lcb.wa.gov/records/frequently-requested-lists).
This is public open data, not a ToS-restricted menu scrape.

1. Find the licensed-retailers resource on the portal and copy its JSON endpoint
   (Socrata resources expose `…/resource/<id>.json`).
2. Set the repo **variable** `WA_LCB_DATA_URL` to that endpoint
   (Settings → Secrets and variables → Actions → Variables).
3. The daily collector (`.github/workflows/collect-strains.yml`) runs
   `scripts/sources/wa-lcb.mjs`, which maps the columns and opens a **draft PR**
   with the diff. Nothing reaches production without a human merge.

The adapter maps defensively (column names vary by dataset):

| Our field        | WSLCB columns it reads (first non-empty) |
|------------------|------------------------------------------|
| `licenseNumber`  | `license_number`, `license`, `ubi` |
| `name`           | `name`, `business_name`, `tradename` |
| `address`        | `street_address`, `address`, `premises_address` |
| `county`         | `county`, `county_name` |
| `licenseStatus`  | `license_status`, `status`, `status_desc` (normalized) |
| `licenseExpiry`  | `expiration_date`, `license_expiry`, `expdate`, `exp_date` |
| `coordinates`    | `latitude` + `longitude` |

If the live dataset uses different column names, adjust the `first(...)` calls in
`scripts/sources/wa-lcb.mjs` — that's the only place that needs to change.

## Scheduling the refresh

There is **no `/scraper-builder` skill** in this project, so it can't be invoked.
The equivalent — and safer — mechanism already exists:

- `.github/workflows/collect-strains.yml` runs **daily (09:00 UTC)** and on demand
  (`workflow_dispatch`). It's deterministic, uses **no LLM tokens**, fails closed
  on bad data, and opens a draft PR for review.
- For in-session recurring runs you can also use the `/loop` skill, e.g.
  `/loop 24h npm run collect`.
