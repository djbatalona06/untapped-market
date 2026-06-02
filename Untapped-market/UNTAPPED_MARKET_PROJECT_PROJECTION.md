# Untapped Market — Project Documentation
**Last Updated:** 2026-05-04  
**Status:** V1 In Progress — Frontend Shell Built  
**Platform:** Web App (React SPA) → React Native V2  
**Market:** Pacific Northwest first (WA, OR)

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [What Has Been Built (This Session)](#3-what-has-been-built-this-session)
4. [File Tree](#4-file-tree)
5. [File-by-File Breakdown](#5-file-by-file-breakdown)
6. [Data Models](#6-data-models)
7. [Routes & Navigation](#7-routes--navigation)
8. [Design System](#8-design-system)
9. [What Still Needs to Be Done — V1](#9-what-still-needs-to-be-done--v1)
10. [V2 Roadmap](#10-v2-roadmap)
11. [Out of Scope (V1)](#11-out-of-scope-v1)
12. [Side Hustle / Monetization Notes](#12-side-hustle--monetization-notes)

---

## 1. Project Overview

**Untapped Market** is a PNW-first cannabis discovery platform. The core differentiator is **DNA/genetic-level strain data** combined with dispensary discovery, a personal strain library, and a social layer — all unified in one place.

### Competitive Positioning
| Competitor | What they do | What we have that they don't |
|---|---|---|
| Leafly | Strain catalog only | Genetic lineage + lab certs + dispensary tie-in |
| Weedmaps | Listings/delivery focused | Science-first strain data, social layer |
| Kannapedia | Science only, no consumer UX | Full consumer UX + social + discovery |

**Untapped Market = research + find + save + share, in one tab.**

### The Four Pillars
1. 🔬 **Strain Catalog** — DNA/genetic-level strain data, terpene profiles, lab certs
2. 📍 **Dispensary Finder** — PNW-only (WA & OR), real inventory links
3. 👤 **Personal Library** — Bookmarks + folder system (premium)
4. 🎬 **Media / Explore Feed** — Visual content layer for engagement

---

## 2. Tech Stack

### Frontend (Current — V1)
```
React 18 + TypeScript
Vite (build tool)
Tailwind CSS 3.4.1
shadcn/ui (40+ Radix UI components pre-installed)
Custom CSS (dark PNW theme — DM Serif Display + DM Mono + Outfit fonts)
Client-side routing (custom useState-based router — no React Router needed for V1)
Static JSON data (store.ts) — no backend yet
Mock auth state (hardcoded user object)
```

### Package Manager
```
pnpm
```

### Key Dependencies
```
react, react-dom ^19
typescript ~6.0
vite ^8
tailwindcss 3.4.1
lucide-react
sonner (toast notifications)
react-hook-form + zod (forms, ready to use)
All @radix-ui/* primitives
```

### V2 Additions Planned
```
React Router v6 (proper URL routing)
Zustand (global state — maps cleanly to React Native)
Supabase (auth + database + storage)
Stripe (premium subscriptions)
Kannapedia API (live genetic data)
Giphy/Tenor API (dynamic GIF sourcing)
React Native (shared logic)
```

---

## 3. What Has Been Built (This Session)

### ✅ Completed

| Component / File | Status | Notes |
|---|---|---|
| Project scaffold | ✅ Done | Via `init-artifact.sh`, full shadcn/ui setup |
| `App.tsx` | ✅ Done | Client-side router, global state, bookmark state |
| `store.ts` | ✅ Done | All TypeScript interfaces + full mock data |
| `Nav.tsx` | ✅ Done | Fixed top nav, active states, all 5 routes |
| `StrainCard.tsx` | ✅ Done | Reusable card w/ bookmark toggle |
| `HomePage.tsx` | ✅ Done | Hero, search, pillars, staff picks, trending, PNW spotlight |
| `CatalogPage.tsx` | ✅ Done | Filters sidebar, search, type/effect/THC filters, sort |
| `StrainDetailPage.tsx` | ✅ Done | Hero, terpene chart, lineage tree, lab cert, dispensary stock, trip reports |
| `FinderPage.tsx` | ✅ Done | State filter, map placeholder, dispensary cards w/ strain chips |
| `LibraryPage.tsx` | ✅ Done | Bookmarks, premium nudge, smart folder preview |
| `ExplorePage.tsx` | ✅ Done | Media grid cards, strain spotlight scroll |
| `PremiumPage.tsx` | ✅ Done | Features list, pricing card, free vs premium comparison table |
| `index.css` | ✅ Done | Full dark PNW design system, all component styles |
| Mock strain data | ✅ Done | 6 PNW strains with full terpene/lab/lineage/dispensary data |
| Mock dispensary data | ✅ Done | 4 dispensaries (2 WA, 2 OR) with linked strain inventory |
| Mock trip reports | ✅ Done | 3 sample reports with upvotes/method/rating |

### ⚠️ Built But Not Yet Bundled/Tested
The app code is written and in `/home/claude/untapped-market/src/` but has **not yet been bundled** into a final artifact. The bundling step (`bundle-artifact.sh`) still needs to be run and any TypeScript/lint errors resolved.

---

## 4. File Tree

```
untapped-market/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
├── components.json            ← shadcn/ui config
├── eslint.config.js
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── main.tsx               ← React entry point
    ├── App.tsx                ← Router + global state
    ├── App.css                ← (minimal, mostly overridden by index.css)
    ├── index.css              ← Full design system (1,200+ lines)
    ├── store.ts               ← All TS interfaces + mock data
    ├── assets/
    │   ├── hero.png
    │   ├── react.svg
    │   └── vite.svg
    ├── lib/
    │   └── utils.ts           ← shadcn/ui cn() utility
    ├── hooks/
    │   └── use-toast.ts       ← Toast hook
    ├── components/
    │   ├── Nav.tsx            ← Top navigation bar
    │   ├── StrainCard.tsx     ← Reusable strain card
    │   └── ui/                ← 40+ shadcn/ui components (auto-generated)
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── dialog.tsx
    │       ├── input.tsx
    │       ├── badge.tsx
    │       ├── tabs.tsx
    │       ├── select.tsx
    │       ├── slider.tsx
    │       ├── sheet.tsx
    │       ├── toast.tsx
    │       └── ... (30+ more)
    └── pages/
        ├── HomePage.tsx       ← Hero, search, featured/trending sections
        ├── CatalogPage.tsx    ← Strain library with filters
        ├── StrainDetailPage.tsx ← The crown jewel — full strain data view
        ├── FinderPage.tsx     ← PNW dispensary map + list
        ├── LibraryPage.tsx    ← Personal bookmarks + folders
        ├── ExplorePage.tsx    ← Media/content explore tab
        └── PremiumPage.tsx    ← Upgrade page with pricing
```

---

## 5. File-by-File Breakdown

### `src/App.tsx`
- Defines the `Route` union type (7 routes)
- Holds `bookmarks` state as a `Set<string>` (persists across page navigations within session)
- Builds the `AppStore` object passed down to all pages
- Renders `<Nav>` and conditionally renders the active page
- `navigate()` scrolls to top on every route change

### `src/store.ts`
- **Interfaces:** `UserProfile`, `AppStore`, `Terpene`, `LabCertificate`, `MediaItem`, `Strain`, `Dispensary`, `TripReport`
- **Mock Data:**
  - `STRAINS[]` — 6 strains: Cascadia Haze (sativa), Rainier Kush (indica), Hood River Haze (hybrid), Olympic Fog (hybrid), Puget Sound CBD (CBD-rich hybrid), Willamette Valley OG (indica)
  - `DISPENSARIES[]` — 4 locations: Green Needle (Seattle WA), Cascadia Collective (Portland OR), Rainforest Remedies (Olympia WA), Gorge Greens (Hood River OR)
  - `TRIP_REPORTS[]` — 3 sample reports tied to strain IDs

### `src/components/Nav.tsx`
- Fixed position, blur backdrop
- Logo with ⟠ mark + serif type
- 5 nav items: Explore, Strains, Finder, Library, Premium
- Active route highlighting
- Premium link styled in amber
- User avatar with initial

### `src/components/StrainCard.tsx`
- Displays: colored dot, type badge, bookmark toggle, strain name, truncated description
- Stats row: THC %, CBD %, Like count
- Terpene pills (top 2)
- Effect tags (top 3)
- "View Details →" footer link
- Hover: lift + shadow animation

### `src/pages/HomePage.tsx`
- **Hero section:** italic serif headline, search bar, 4-pillar grid (DNA data / PNW / terpenes / region)
- **Staff Picks:** First 3 strains from catalog
- **PNW Spotlight:** Stats block (200+ strains, 47 dispensaries, 12k+ trip reports) + CTA
- **Trending This Week:** Sorted by `likeCount` descending

### `src/pages/CatalogPage.tsx`
- **Filters sidebar** (sticky): text search, type (all/indica/sativa/hybrid), effect dropdown, THC minimum slider, sort (likes/THC/alpha)
- **Results:** Count header + strain grid
- **Clear Filters** button resets all state
- Real-time filtering via `useMemo`

### `src/pages/StrainDetailPage.tsx`
The most complex page. Sections:
1. **Hero panel** — type badge, chemotype tag, name, description, like button, save button; sidebar with THC/CBD bars + effects + flavors
2. **Terpene Profile** — horizontal bar chart for each terpene, with effect label and %
3. **Genetic Lineage Tree** — visual mother/father → offspring diagram with connector lines
4. **Lab Certificate** — lab name, test date, full cannabinoid breakdown grid
5. **In Stock Near You** — linked dispensary rows with directions button
6. **Trip Reports** — submit form (rating stars, method selector, textarea) + display existing reports with upvote/downvote

### `src/pages/FinderPage.tsx`
- WA / OR / All state toggle filter
- Map placeholder (real map in V2)
- Dispensary cards: name, city/state, address, hours, phone, rating, linked strain chips

### `src/pages/LibraryPage.tsx`
- Premium upgrade nudge banner (shown for free tier)
- Smart folders preview (shown for premium tier — currently no users are premium in mock data)
- Full bookmarks grid using `StrainCard`

### `src/pages/ExplorePage.tsx`
- Media content cards grid (8 cards with emoji thumbnails, category tags)
- Horizontal scrollable PNW strain spotlight strip

### `src/pages/PremiumPage.tsx`
- Hero with amber accent headline
- Feature list (6 features with icons)
- Sticky pricing card ($7/mo, amber border, trial CTA)
- Free vs Premium comparison table

### `src/index.css`
- CSS custom properties: full color token system (bg, surface, border, text, accent, amber, purple, red, teal)
- Google Fonts: DM Serif Display (headings, italic), DM Mono (data/numbers), Outfit (body)
- ~1,200 lines of handcrafted component styles
- Dark, earthy Pacific Northwest aesthetic
- No Tailwind utility classes used — pure custom CSS for all components

---

## 6. Data Models

```typescript
interface Strain {
  id: string
  name: string
  type: 'indica' | 'sativa' | 'hybrid'
  thc: number
  cbd: number
  terpenes: Terpene[]           // { name, pct, effect }
  effects: string[]
  flavors: string[]
  lineage: { mother: string | null; father: string | null }
  labData: LabCertificate
  dispensaryIds: string[]
  likeCount: number
  chemotype: string             // e.g. "Type I (THC-dominant)"
  description: string
  color: string                 // hex, used for visual accents
}

interface Dispensary {
  id: string
  name: string
  address: string
  city: string
  state: 'WA' | 'OR'
  coordinates: { lat: number; lng: number }
  hours: string
  strainIds: string[]
  rating: number
  phone: string
}

interface TripReport {
  id: string
  strainId: string
  userId: string
  username: string
  rating: 1 | 2 | 3 | 4 | 5
  effects: string[]
  method: 'flower' | 'edible' | 'concentrate' | 'vape' | 'other'
  note: string
  upvotes: number
  downvotes: number
  createdAt: string
  hidden?: boolean
}

interface UserProfile {
  id: string
  username: string
  showRealName: boolean
  realName?: string
  tier: 'free' | 'premium'
}

interface AppStore {
  bookmarks: Set<string>
  setBookmarks: (b: Set<string>) => void
  user: UserProfile
}
```

---

## 7. Routes & Navigation

```
Route Type         Page Component       URL (V2 with React Router)
─────────────────────────────────────────────────────────────────
{ page: 'home' }   HomePage             /
{ page: 'catalog'} CatalogPage          /catalog
{ page: 'strain',  StrainDetailPage     /strain/:id
  id: string }
{ page: 'finder' } FinderPage           /finder
{ page: 'library'} LibraryPage          /library
{ page: 'explore'} ExplorePage          /explore
{ page: 'premium'} PremiumPage          /premium
```

Admin route (`/admin`) is spec'd but not yet built.

---

## 8. Design System

### Color Tokens
```css
--bg: #0e0f0d          /* Page background — near-black with green tint */
--bg2: #141510         /* Slightly lighter bg for panels */
--surface: #1f211a     /* Card surfaces */
--surface2: #252720    /* Elevated surfaces */
--border: #2e3028      /* Subtle borders */
--border2: #3a3d32     /* Stronger borders */
--text: #e8e6df        /* Primary text — warm white */
--text2: #a8a69e       /* Secondary text */
--text3: #6b6960       /* Muted / labels */
--accent: #7cb87a      /* Primary green — cannabis / nature */
--accent2: #5a9e58     /* Darker green on hover */
--amber: #d4a853       /* Premium / gold accent */
--amber2: #b8913e      /* Darker amber on hover */
--red: #d4564e         /* Likes / danger */
--teal: #4a9b9e        /* CBD / calm color */
--purple: #8b6fb8      /* Indica type color */
```

### Typography
| Use | Font | Style |
|---|---|---|
| Headlines / names | DM Serif Display | Italic, 19–76px |
| Body text | Outfit | 300–700 weight |
| Numbers / data | DM Mono | 400–500 weight |

### Type Badge Colors
- **Indica** → purple bg (`#2d1a4a`), purple text (`#c084fc`)
- **Sativa** → green bg (`#1a3d1a`), green text (`#86efac`)
- **Hybrid** → amber bg (`#3d2d1a`), amber text (`#fcd34d`)

---

## 9. What Still Needs to Be Done — V1

### 🔴 Critical — Must Complete Before Shipping

#### 9.1 Bundle the App
```bash
cd /home/claude/untapped-market
bash /mnt/skills/examples/web-artifacts-builder/scripts/bundle-artifact.sh
```
This produces `bundle.html` — the self-contained artifact. Fix any TypeScript errors that surface.

#### 9.2 Fix `App.css` Conflicts
The default Vite `App.css` may conflict with `index.css`. Either clear it or import it after `index.css` in `main.tsx`. Verify `main.tsx` imports look like:
```typescript
import './index.css'
import App from './App'
```

#### 9.3 Expand Strain Data
Currently only 6 strains. For a convincing V1 demo, expand to **20–30 strains** with varied:
- Types (balance of indica/sativa/hybrid)
- THC ranges (15%–32%)
- CBD options (include 3–4 CBD-forward strains)
- Terpene profiles (all 8 major terpenes represented)
- Lineage variety (some with null parents = landrace strains)

#### 9.4 Expand Dispensary Data
Currently only 4 dispensaries. Add **10–15 more** across WA and OR with realistic addresses and inventory.

#### 9.5 Admin Page (`/admin`)
Per spec, needs:
- Strain management (add, edit, delete)
- Media approval queue
- Trip report moderation
- Dispensary management
- "Staff Pick" / featured strain toggle
- Route: `{ page: 'admin' }` in the router, role-gated

---

### 🟡 Important — Polish & UX

#### 9.6 Mobile Responsiveness
Current CSS is desktop-first. Need responsive breakpoints for:
- Nav → bottom tab bar on mobile
- `catalog-layout` grid → stacked (filters collapse to drawer on mobile)
- `detail-hero` grid → stacked
- `spotlight-inner` → stacked
- `premium-layout` → stacked
- `hero-pillars` → 2x2 grid on mobile

Suggested breakpoints:
```css
@media (max-width: 768px) { ... }
@media (max-width: 480px) { ... }
```

#### 9.7 Search Functionality on Homepage
The hero search form currently just navigates to `/catalog`. Wire it to pass the search query as state so the catalog pre-fills the search input with what the user typed.

Implementation:
```typescript
// App.tsx — add query to catalog route
| { page: 'catalog'; query?: string }

// HomePage.tsx — pass query
navigate({ page: 'catalog', query: search })

// CatalogPage.tsx — init state from route
const [search, setSearch] = useState(route.query ?? '')
```

#### 9.8 Strain Color Polish
Each strain has a `color` hex used for accents. Currently used in:
- Strain dot indicator
- THC/CBD bar fills
- Terpene bar fills
- Lineage offspring border
- Detail hero gradient

Should also be used in: card hover border tint, lineage connector dot.

#### 9.9 Explore Page Real Content
Currently uses placeholder emoji cards. Replace with:
- Real dispensary/strain image URLs (use Unsplash URLs for mock)
- Link media cards to actual strain detail pages
- Add category filter tabs (All / Science / PNW / How-To / Terpenes)

#### 9.10 Library Page — Folder Creation (Free Tier)
Currently shows a premium nudge. Add a "Create Folder" modal for premium users (shadcn `Dialog` component is already installed). Stub the folder CRUD with local state for V1.

#### 9.11 Trip Report — Effects Multi-Select
The trip report submission form has method + rating but the `effects[]` field on `TripReport` isn't yet collected in the UI. Add a multi-select checkbox group for effects (Euphoric, Creative, Relaxed, etc.).

#### 9.12 Like Button Persistence
Currently `liked` state is local to `StrainDetailPage`. If user navigates away and comes back, like resets. Move like state to `AppStore` (a `Set<string>` of liked strain IDs) similar to how bookmarks work.

---

### 🟢 Nice to Have — V1 Enhancement

#### 9.13 Strain Card Skeleton Loaders
When filtering/sorting, add a brief skeleton state for a more polished feel. Use `animate-pulse` (Tailwind) on placeholder card shapes.

#### 9.14 Toast Notifications
`sonner` is already installed. Add toasts for:
- "Strain saved to library" on bookmark
- "Trip report submitted!"
- "Copied to clipboard" (for lab cert data)

#### 9.15 Keyboard Navigation / Accessibility
- Add `aria-label` to icon-only buttons (bookmark, like)
- Ensure filter inputs have associated `<label>` elements
- Nav items should have `aria-current="page"` when active

#### 9.16 Empty Library State with Animation
When no strains are bookmarked, the empty state should be more inviting. Add a subtle CSS animation (float or pulse) to the 📚 emoji.

#### 9.17 Strain Comparison Mode
Allow users to select 2–3 strains from the catalog and see a side-by-side comparison of THC/CBD/terpenes. Could be a separate modal or route: `{ page: 'compare'; ids: string[] }`.

---

## 10. V2 Roadmap

These are explicitly **out of scope for V1** but planned:

| Feature | Description | Tech |
|---|---|---|
| Real backend | Replace static JSON with API | Supabase (Postgres + RLS) |
| Auth | Email + OAuth (Google) login | Supabase Auth |
| React Router v6 | URL-based routing, shareable links | `react-router-dom` |
| Zustand state | Global state that maps to React Native | `zustand` |
| Payment / Premium | Stripe subscription checkout | Stripe + Supabase webhooks |
| Kannapedia API | Live genetic data integration | REST API |
| Real map | Interactive dispensary map | Mapbox or Google Maps API |
| Giphy/Tenor API | Dynamic GIF sourcing for media feed | Giphy API |
| Media uploads | User/dispensary image/GIF uploads | Supabase Storage |
| React Native V2 | Mobile app sharing Zustand store | React Native + Expo |
| Multi-state rollout | Expand beyond WA/OR | State-by-state legal compliance |
| AI Recommendations | Claude API strain recommendations | `claude-sonnet-4-20250514` |
| Admin dashboard | Real content moderation UI | Supabase RLS roles |
| Real COA PDFs | Downloadable lab certificate PDFs | Supabase Storage |

---

## 11. Out of Scope (V1)

Per original spec, these will NOT be built for V1:
- Shipping or delivery logistics
- In-app purchasing / transactions
- Native mobile app
- Real payment processing
- Multi-state dispensary network
- Live Kannapedia API integration
- Real authentication (Supabase)
- Real database

---

## 12. Side Hustle / Monetization Notes

### Revenue Streams to Consider
1. **Premium subscriptions** — $7/month or $63/year (as spec'd). Target: ~500 subscribers = $3,500 MRR
2. **Dispensary featured listings** — Charge dispensaries for prominent placement, "Verified" badges, or first-position in "In Stock Near You" results
3. **Affiliate / referral** — When users click "Get Directions" to a dispensary, that's a trackable referral. Could charge dispensaries per referral click
4. **Sponsored strain spotlights** — Brands pay to be featured in the Explore feed or on the homepage Staff Picks
5. **White-label data** — License the genetic/terpene database to other apps or B2B buyers (cannabis brands, research orgs)
6. **Lab partnerships** — Partner with Confidence Analytics, Trace Analytics (already referenced in mock data) for co-branded content

### Market Size (PNW)
- Washington state cannabis market: ~$1.2B annual sales
- Oregon cannabis market: ~$1B annual sales
- Combined licensed dispensaries: ~1,200+ in WA + OR
- Target paying users: cannabis consumers who research before buying — a real, growing segment

### Go-to-Market (V1 → Revenue)
1. Launch free tier with full catalog access
2. Build SEO on strain/terpene content (long-tail search)
3. Approach 10–20 PNW dispensaries for free listings → convert to paid featured placements
4. Launch premium at $7/mo once 1,000+ free users
5. Partner with a PNW cannabis publication for content distribution

---

*Built with Claude — Untapped Market project documentation v1.0*
