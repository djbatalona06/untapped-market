# Untapped Market

PNW-first cannabis discovery platform. Science-grade strain data (terpene profiles, genetic lineage, lab certs) + dispensary finder + personal library + social trip reports.

**Stack:** Vite · React 18 · TypeScript · Tailwind 3 · Zustand · React Router 6 · Supabase · Leaflet

---

## Quickstart

```bash
# 1. Install Node 20+
#    https://nodejs.org/   (or `winget install OpenJS.NodeJS.LTS` on Windows)

# 2. Install deps
npm install

# 3. Set up env vars
cp .env.example .env.local
# edit .env.local — at minimum, fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
# (without them, the app still runs on the mock data shipped in src/store/mockData.ts)

# 4. Run the dev server
npm run dev
# → http://localhost:5173
```

---

## Project Structure

```
untapped-market/
├── src/
│   ├── components/       Reusable UI: Nav, StrainCard, DispensaryMap, TerpeneBar, LineageTree, LabCertCard, ...
│   ├── pages/            Route components: Home, Catalog, StrainDetail, Finder, Library, Explore, Premium, Admin
│   ├── store/            Zustand store + types + mock data
│   ├── lib/              supabase client, cn() utility
│   ├── index.css         Full design system (CSS vars + handcrafted styles + Tailwind layer)
│   ├── main.tsx          React entry — Router, Toaster
│   └── App.tsx           Route table + Layout
├── supabase/
│   ├── schema.sql        Full Postgres schema + RLS policies
│   ├── seed.sql          Seed strains + dispensaries
│   └── README.md         How to run locally
├── .env.example
├── .mcp.json.example     MCP server config template — see MCP_INTEGRATION.md
├── package.json
├── tailwind.config.js
├── tsconfig.json (+ .app.json + .node.json)
├── vite.config.ts
├── index.html
├── implementation_plan.md
├── UNTAPPED_MARKET_PROJECT_PROJECTION.md
└── MCP_INTEGRATION.md    Which MCP servers to install and why
```

---

## Routes

| URL | Page |
|---|---|
| `/` | HomePage — hero, search, staff picks, trending |
| `/catalog` *(?q=)* | CatalogPage — filters + strain grid |
| `/strain/:id` | StrainDetailPage — terpenes, lineage, lab, dispensary stock, trip reports |
| `/finder` | FinderPage — PNW dispensary map + list |
| `/library` | LibraryPage — bookmarks + premium folders |
| `/explore` | ExplorePage — media feed |
| `/premium` | PremiumPage — $7/mo upsell |
| `/admin` | AdminPage — strain/media/report moderation (role-gated) |

---

## Competitive Positioning

| Competitor | Their problem | Our wedge |
|---|---|---|
| **Leafly** | Removed nearby-strain map, hidden THC %, indica/sativa mislabels | DNA-verified strains, accurate menus, real lineage tree |
| **Weedmaps** | Pay-to-play visibility, inflated pricing, vendor disconnect | Free dispensary listings, direct social layer, no rank-by-pay |
| **Dutchie** | "Garbage" reliability, poor operator UX, iFrame menus = no SEO | First-party menus, SSR-friendly stack, real SEO |
| **Kannapedia** | Scientific-grade data, zero consumer UX | All the science + the UX consumers actually use |
| **Jane Technologies** | E-comm focused, weak discovery surface | Discovery-first, e-comm-light |

Source: live competitor research (see chat history for citations).

---

## Roadmap

V1 shipping order (see `UNTAPPED_MARKET_PROJECT_PROJECTION.md` section 9):

1. ✅ Phase 1 scaffold (Vite + TS + Tailwind + Supabase client)
2. ✅ Phase 2 extraction (store / components / pages — parallel agents)
3. 🟡 Phase 3 integration: wire pages → store → components, fix imports
4. 🔴 Expand to 20–30 strains, 10–15 dispensaries (mock data → seed.sql)
5. 🔴 Mobile responsive (breakpoints already drafted in index.css)
6. 🔴 Run `npm run dev`, fix TS errors, click through all routes

V2 (after V1 ships):
- Supabase real auth + RLS
- Stripe $7/mo
- Kannapedia API integration
- React Native (sharing the Zustand store)
- Pinecone-powered "similar strains" search using genetic embeddings
- AI strain recommendations (Claude API)

---

## License

Private — Untapped Market 2026.
