# Daily Dispensary Menu Sync — Agent Workflow

## Purpose
Hybrid menu sync: pull once daily from every active PNW dispensary in the Untapped Market database,
flag high-velocity strains for manual override, write results to `dispensary-client-list.json`.

## Schedule
`0 11 * * *` UTC  →  3:00 AM America/Los_Angeles

## Data Sources (public, no auth required)
| Source | URL | Use |
|--------|-----|-----|
| WA WSLCB Licensee DB | https://lcb.wa.gov/licensing/find-a-licensee | Active WA retailer list |
| OR OLCC Licensee Search | https://apps.oregon.gov/OLCC/Licensing/Retail_Marijuana_Outlet/ | Active OR retailer list |
| Weedmaps (public menus) | https://weedmaps.com/dispensaries/in/ | Menu data per dispensary |
| Leafly (public menus) | https://www.leafly.com/dispensaries | Menu + strain ratings |
| I-502 Public Data (WA) | https://lcb.wa.gov/sites/default/files/publications/Marijuana/sales_activity/ | WA sales data |

## Agent Steps

### Step 1 — Fetch active licensee lists
1. Fetch WA WSLCB active retailer CSV/HTML → extract: name, license #, city, county, zip, address
2. Fetch OR OLCC active retailer list → extract: name, license #, city, county, zip, address
3. Filter to WA counties: King, Pierce, Snohomish, Clark, Whatcom, Spokane
4. Filter to OR counties: Multnomah, Washington, Clackamas, Lane, Jackson

### Step 2 — Pull menu data (Weedmaps + Leafly)
For each dispensary (batch in groups of 10 to avoid rate limits):
1. Search Weedmaps by dispensary name + city
2. Extract: current menu items, strain names, THC%, CBD%, price per gram, category (flower/edible/concentrate/vape)
3. Search Leafly for the same dispensary → extract: strain ratings, review count
4. Mark any strain appearing in >3 dispensary menus as "high-traffic" → flag for manual override

### Step 3 — Enrich with geo + company data
For each dispensary:
- Geocode address to lat/lng (use Nominatim: https://nominatim.openstreetmap.org/search)
- Pull Google Maps listing if public (business hours, phone, website)
- Extract parent company / MSO affiliation if identifiable from website

### Step 4 — Write output
Update `Untapped-market/src/data/dispensary-client-list.json` with full enriched records.
Write summary report to `Untapped-market/src/data/sync-logs/YYYY-MM-DD-sync.json`.

### Step 5 — Manual override flags
Output a `high-traffic-strains.json` listing strains flagged for manual update,
so the Untapped Market admin UI can surface them for priority refresh.

## Failure handling
- If a dispensary URL 404s, mark `menu_status: "unavailable"` and retain last known menu
- If WSLCB/OLCC fetch fails, abort and log — do not write partial data
- Retry failed dispensaries up to 3 times with 5s backoff

## Output schema
See `dispensary-client-list.json` for full field spec.
