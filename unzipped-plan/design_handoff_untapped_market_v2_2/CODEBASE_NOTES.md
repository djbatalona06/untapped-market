# Untapped Market — Codebase Brainstorm

> _Per the brief, this is observation-only. Nothing in the app code is changed without your sign-off — these are recommendations you can prioritize._

## What changed (visual only)

A new "Editorial Cannabis Atelier" overlay was applied on top of the existing v2 PNW Forest base. No data structures, routing, or business logic were touched.

- **New fonts:** Instrument Serif (display italic), Instrument Sans (body), JetBrains Mono (labels). Lora + Raleway + DM Mono remain loaded so nothing breaks elsewhere.
- **New color tokens:** deeper inky black canvas (`#07090A`), an "ember" gold (`#D9A55C`) as the single accent of agency, restrained moss green for category meaning.
- **Cinematic hero:** full-bleed Higgsfield macro bud with slow ken-burns motion, vignette, grain overlay, editorial meta strip (Vol. 02 · Spring '26 · WA · OR).
- **New sections on Home:** running marquee, "The Drop" featured-strain panel (uses the product jar shot), pull-quote over moving smoke, hands/stories split panel.
- **Card system:** quieter strain cards, sharper 4px corners, mono badges, editorial section heads with chapter numbers.
- **Footer:** monumental italic wordmark with mono colophon.

All four hero images are **AI-generated via Higgsfield** (Nano Banana Pro), saved locally in `img/` so they survive offline:

| File | Use | Prompt summary |
|---|---|---|
| `img/hero-macro.jpg` | Hero background, ken-burns | Macro frosty bud, PNW forest bokeh, golden hour |
| `img/hero-product.jpg` | "The Drop" feature | Amber apothecary jar on serpentine stone, low fog |
| `img/hero-smoke.jpg` | Smoke interstitial | Curling smoke on black with amber spotlight |
| `img/hero-hands.jpg` | Field Reports split | Hands cradling a jar by a cabin window, Portra 400 |

---

## Codebase observations & recommendations

### 1 · Architectural — the file is one monolith

`Untapped Market.html` is now ~3,400 lines. Babel-in-browser is fine for prototyping but is the single biggest source of "feels AI-generated" — slow first paint, that yellow Babel warning in console, and you can't tree-shake.

**Recommended path:**
- Vite + React + TypeScript (or Astro if you want SSR for SEO on strain pages — would help with dispensary discoverability).
- Split into `app/` (routing), `components/`, `data/` (the STRAINS / DISPENSARIES / MEDIA_ITEMS arrays), `styles/tokens.css`.
- Move strain data to JSON/SQLite/Postgres. Today every strain ships in the HTML payload.

### 2 · Data layer — fake data is going to bite

The STRAINS and DISPENSARIES arrays are inline mock objects. Once you list real WA/OR licensed dispensaries you'll need:
- A `strains` table (slug, name, type, chemotype, terpenes JSONB, lineage refs, lab cert URL).
- A `dispensaries` table with state license numbers (WSLCB for WA, OLCC for OR — both publish CSVs you can scrape weekly).
- An `inventory` table joining strains to dispensaries with `last_seen_at`, `price`, `pack_size`. This is what makes "Live Inventory Map" (your Premium teaser) actually work.

### 3 · Premium / paywall plumbing

The Premium page exists but there's no actual gating. Before you ship V2:
- Stripe (or Lemon Squeezy) checkout for `$7/mo` and `$63/yr` tiers.
- A `user.premium_until` timestamp. Wrap features in `<Gated tier="premium">…</Gated>`.
- `Strain Alerts` and `Inventory Map` are listed as premium — both need real backend cron jobs against inventory data.

### 4 · Trip Reports — moderation & abuse

The trip report form currently just appends to local state. Real version needs:
- Auth (Supabase Auth or Clerk — Supabase pairs well with the PNW/dispensary geo queries you'll want).
- Server-side rate limiting per user.
- Content moderation queue (manual review or OpenAI moderation API) — cannabis content gets weird user-submitted material.
- Soft delete and edit windows.

### 5 · SEO & strain pages

Strain detail pages are client-rendered, so they're invisible to Google and SeedFinder backlinks won't compound. Two options:
- **Astro** with hybrid rendering — strain pages SSG'd, app shell SPA.
- **Next.js App Router** — strain pages SSR'd with ISR, rest CSR.
- Either way: per-strain OG images. The Higgsfield workflow you're using now is perfect for auto-generating these.

### 6 · Imagery — the easy win

Right now strain cards have no imagery. The cinematic hero only works because of the photos. Recommend:
- Generate a Higgsfield "drop shot" for each strain in the catalog (the apothecary-jar template you've seen works — vary the bud color/density per strain).
- Store in `public/strains/<slug>.jpg` (or S3/Cloudflare R2).
- Card layout already has space for a 16:10 photo slot at the top — easy to add later without restyling.

### 7 · Map performance

The Leaflet map mounts every time someone visits Finder. For 47 dispensaries it's fine; at 500+ you'll want marker clustering (`leaflet.markercluster`) and lazy mount.

### 8 · Accessibility low-hanging fruit

- `prefers-reduced-motion` is already respected for the old hero. The new ken-burns animation should be too — add `@media (prefers-reduced-motion: reduce) { .cine-hero-img { animation: none; } }` if you want to be tidy.
- The mono-uppercase labels are great visually but should have higher contrast on some grey-on-grey states for WCAG AA.
- Add `lang="en"` on `<html>` (it's already there — confirm).
- Bookmark button needs an `aria-label`.

### 9 · Higgsfield workflow

You're using it for hero art — great. Three more places it can shine without ballooning credit spend:
- **One product shot per strain** (~80 strains × 1 credit = manageable).
- **A 5-second smoke loop video** (image-to-video from `img/hero-smoke.jpg`) — replaces the static smoke section with motion. ~15 credits.
- **Three editorial videos for the homepage** — bud rotating, jar spotlight, hand pouring — used as 8-second autoplay loops between sections.

Say the word and I can kick those off.

### 10 · "Untapped Market" the name

A separate brief: the name reads as a startup pitch deck more than a magazine. If you ever rebrand, the editorial direction would support something more like _Cascadia Almanac_, _Volume_, _The Trichome_, or just a sigil + Vol. number. Not a recommendation to change — just flagging that the type system can carry a more confident name.

---

## What did NOT change (intentional)

- All routing in `App` and `navigate(...)` calls.
- The `STRAINS`, `DISPENSARIES`, `MEDIA_ITEMS`, `MOCK_USER` data.
- Catalog filters, terpene chart, lab certificate grid, trip-report form logic.
- Leaflet map setup.
- Toast container.
- Bookmark/like state management.

Visual styling on those screens inherits the new tokens (mono labels, ember accent, Instrument Serif headings) but their structure is identical.
