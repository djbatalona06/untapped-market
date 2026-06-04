# Handoff: Untapped Market — v2.2 Cinematic Editorial Redesign

## Overview

This bundle contains a visual redesign of the Untapped Market mobile-first cannabis web app. The brief was to elevate the v2.0 app so it feels like a boutique cannabis editorial publication ("dark luxury / cinematic atelier") instead of a generic AI-generated startup template — and to add scroll-driven motion that holds attention.

The redesign is layered on top of the existing v2 PNW Forest base. **No business logic, routing, or data structures were changed.** All edits are visual, motion, and a few new homepage sections.

---

## About the Design Files

The files in this bundle are **design references created in a single static HTML file using React + Babel-in-browser**. They are a high-fidelity prototype demonstrating the intended look, motion, and interaction model — not production code to copy directly.

The task is to **recreate these designs inside the Untapped Market codebase's existing React environment**, using its existing build system, routing, state management, and component patterns. Replace the inline React-in-Babel approach with proper components, real CSS modules / styled-components / Tailwind (whatever the repo uses), and a build pipeline.

If the repo is currently a single-file HTML prototype with no build system, this handoff is a good moment to migrate to Vite + React + TypeScript and adopt the file/component splits described in `CODEBASE_NOTES.md` (also included in this bundle).

---

## Fidelity

**High-fidelity.** Final colors, typography, spacing, motion timings, and copy are all specified. Recreate pixel-perfectly. The included `Untapped Market.html` is the canonical source of truth — when in doubt, open it in a browser and inspect.

---

## What changed in this session

The session delivered two passes:

### Pass 1 — Editorial cinematic redesign (v2.1)
- New design tokens: deep inky black canvas, "ember" gold accent, restrained moss green for category meaning
- Cinematic hero with full-bleed AI-generated macro bud, ken-burns, vignette, grain
- New homepage sections: editorial marquee, "The Drop" featured strain, smoke interstitial pull-quote, "Field Reports" hands/cabin split, refined PNW Spotlight, monumental footer wordmark
- Quieter strain cards with editorial type hierarchy
- New typography stack: Instrument Serif (display italic), Instrument Sans (body), JetBrains Mono (labels)

### Pass 2 — Scroll motion + per-card art + Tweaks (v2.2)
- Scroll motion engine: IntersectionObserver reveals + rAF parallax
- Strain cards now have a 16:10 photo slot with per-strain color wash
- Live Tweaks panel for hero variant, motion intensity, accent color
- Animated multi-layer smoke section (true CSS motion)
- Top scroll progress bar

---

## Screens / Views

The redesign is focused on the **Home screen**. Other routes (catalog, strain detail, finder, library, explore, premium) inherit the new tokens automatically (mono labels, ember accent, Instrument Serif headings) but their structure was not refactored. Apply the same editorial treatment to those routes once Home is in.

### Home Screen — Composition (top to bottom)

| Order | Section | Selector | Notes |
|-------|---------|----------|-------|
| 01    | Cinematic Hero | `.cine-hero` | Full-bleed image, mask-rise headline, ambient ken-burns |
| 01b   | Marquee | `.cine-marquee` | Infinite horizontal ticker of strain/terpene names |
| 01c   | The Drop | `.cine-drop` | Split panel — product image + strain stats |
| 01d   | Staff Picks | `.cine-section` "Chapter I" | 3-card strain grid |
| 01e   | Smoke Interstitial | `.cine-smoke` | Full-bleed quote over animated smoke layers |
| 01f   | Field Reports | `.cine-stories` | Hands/cabin image + body copy split |
| 01g   | Trending | `.cine-section` "Chapter II" | 3-card strain grid |
| 01h   | PNW Spotlight | `.spotlight` | Region copy + stats grid |
| 01i   | Footer Wordmark | `.cine-footer` | Monumental italic logo + mono colophon |

#### 01 · Cinematic Hero
- **Purpose:** Set the editorial tone, surface search + primary CTAs
- **Layout:**
  - `min-height: 86vh` (mobile: 78vh)
  - Flex column, content anchored to `flex-end`, padding `0 2rem 5rem`
  - Background image absolute-positioned, `z-index: 0`, with `kenburns` keyframes (22s ease-in-out alternate, scale 1.04→1.14, translate -1.5% -2%)
  - Vignette layer: radial + linear gradient combination, `z-index: 1`
  - Grain layer: SVG fractal noise, `mix-blend-mode: overlay`, `opacity: 0.08`, `z-index: 2`
  - Content at `z-index: 3`, max-width 980px
- **Components:**
  - **Top meta strip** (`.cine-hero-meta`): JetBrains Mono 0.66rem, letter-spacing 0.22em uppercase, color `--text2`. Left: "Vol. 02 · Spring '26". Center: gradient divider line. Right: "WA · OR · 47.6062°N"
  - **Eyebrow** (`.cine-hero-eyebrow`): "The PNW Cannabis Almanac" — JetBrains Mono 0.7rem, 0.28em letter-spacing, color `--ember`, preceded by 36×1px ember bar
  - **Headline** (`h1`): Instrument Serif italic 400, `clamp(2.9rem, 8.5vw, 7rem)`, line-height 0.95, letter-spacing -0.025em, max-width 14ch. Two lines wrapped in `.line > span` for mask-rise animation. "actually" wrapped in `<em>` for ember color.
  - **Sub** (`.cine-hero-sub`): Instrument Sans 300, 1.05rem, line-height 1.55, max-width 46ch, color `--text2`
  - **Search** (`.cine-search`): Borderless input on bottom border. Border-color transitions to ember on focus-within. Mono "Search ↗" button on right
  - **Actions** (`.cine-hero-actions`): Two buttons — primary `.btn-cine` (ember bg, dark text, 999px radius) and ghost `.btn-cine-ghost` (transparent, 1px white/.18 border, backdrop-filter blur 8px)
  - **Scroll hint** (`.cine-hero-scroll`): Bottom-right vertical "Scroll" label with animated 36×1px gradient bar (scaleY pulse)
- **Animations on load:** Headline lines mask-rise (110% → 0%, 1100ms cubic-bezier(.2,.7,.2,1), staggered 200ms/380ms). Eyebrow/sub/search/actions fade up with 100/650/780/900ms delays.

#### 01b · Marquee
- **Layout:** Top and bottom 1px `--border` lines, background `--bg2`, padding 1rem 0, `overflow: hidden`
- **Track:** flex with `gap: 3rem`, width `max-content`, animation `marquee` linear infinite, duration controlled by `--marquee-dur` CSS var (default 42s)
- **Items:** Instrument Serif italic 1.5rem `--text2`, separator is ember "✦" 0.8rem
- **Content (duplicated for seamless loop):** Cascadia Haze · Trichome density · Rainier Kush · Terpinolene · Hood River Haze · Pacific Northwest · Olympic Fog · Myrcene · Linalool · Lab-verified COAs · Limonene · Volume 02

#### 01c · The Drop
- **Layout:** CSS grid `1fr 1fr`, gap 0, min-height 640px, top + bottom `--border` lines. Stacks to 1 col below 860px.
- **Left half** (`.cine-drop-img`): Full-cover `img/hero-product.jpg`, gradient overlay `linear-gradient(115deg, transparent 60%, rgba(0,0,0,.5) 100%)`. Inner `.cine-drop-img-inner` does the parallax (transform: scale 1.0 → 1.12 + translateY -2% over 14s once visible). Bottom-left mono label "Drop №01 · Apothecary Series"
- **Right half** (`.cine-drop-body`): Padding 5rem 4rem (mobile: 3rem 1.5rem), flex column, gap 1.25rem
  - Mono eyebrow "The Drop · This Week"
  - h3: Instrument Serif italic 400, `clamp(2.4rem, 5vw, 4.2rem)`, last word in `<em>` ember
  - Description paragraph
  - 3-column meta grid (Type / THC / Dominant terpene). Keys: mono 0.6rem 0.22em. Values: Instrument Serif italic 1.6rem
  - Ember "Read the profile →" CTA

#### 01d / 01g · Strain Card Grids
- See **Strain Card** component below

#### 01e · Smoke Interstitial
- **Layout:** min-height 360px, padding 5rem 2rem, background `#000`, `isolation: isolate`, `overflow: hidden`
- **Two background layers** for atmospheric motion:
  - `.cine-smoke-bg`: `img/hero-smoke.jpg` `inset: -8% -4%`, opacity 0.95, animation `smokeDriftA` 32s ease-in-out alternate (scale 1.08→1.22, translate -1%/-1% → 2%/1%). Also parallax target.
  - `.cine-smoke-bg-2`: same image, scale 1.15 + 6px blur, `mix-blend-mode: screen`, opacity 0.5, animation `smokeDriftB` 48s alternate (scale 1.2→1.35, translate 2%/1% → -2%/-2%)
- **Inner** (`.cine-smoke-inner`): max-width 720px, text-align center, z-index 1
  - Blockquote: Instrument Serif italic, `clamp(1.6rem, 3.5vw, 2.6rem)`, line-height 1.2
  - Cite: JetBrains Mono 0.65rem 0.25em uppercase ember, "— Editor's Note, Vol. 02"

#### 01f · Field Reports
- **Layout:** CSS grid `1.1fr 1fr`, gap 0, bottom `--border` line. Stacks to 1 col below 860px.
- **Left** (`.cine-stories-body`): Padding 5rem 4rem, flex column, justify-content center, gap 1.25rem
  - Mono eyebrow "Field Reports"
  - h3: Instrument Serif italic 400, `clamp(2.2rem, 4.5vw, 3.6rem)`
  - Body paragraph
  - Ghost button "Browse field reports →"
- **Right** (`.cine-stories-img`): `img/hero-hands.jpg`, min-height 520px. Inner `.cine-stories-img-inner` scales 1.0 → 1.08 over 12s when section becomes visible. Bottom-right vertical mono label "Cabin near Mt. Baker · 7:42pm" (writing-mode vertical-rl)

#### 01i · Footer
- **Layout:** Top `--border` line, padding 4rem 2rem 2.5rem, background `--bg`
- **Inner:** max-width 1240px, grid 1fr 1fr, gap 3rem, align-items end (stacks below 720px)
- **Wordmark:** Instrument Serif italic `clamp(3rem, 9vw, 6rem)`, line-height 0.9, "Untapped" on line 1, em "Market." on line 2 (ember color)
- **Meta:** JetBrains Mono 0.62rem 0.22em uppercase line-height 2, right-aligned (left on mobile)

---

## Components

### Strain Card (`.strain-card`)
- **Container:** background `--surface` (#11140F), 1px `--border` (#1E2319), border-radius 4px, `overflow: hidden`, flex column, padding 0
- **Hover:** border-color `rgba(217,165,92,.35)`, translateY(-3px), 30/60px ember-tinted shadow
- **Reveal animation:** `.reveal-card` — fades up + scales from .985 → 1 over 900ms cubic-bezier(.2,.7,.2,1) when entering viewport
- **Art top** (`.strain-card-art`):
  - aspect-ratio 16/10, background `img/hero-product.jpg` center 30% / cover
  - On hover: background-size grows 110% → 122% over 800ms ease (ken-burns)
  - Color wash via `::before` pseudo, `mix-blend-mode: color`, opacity 0.55 (0.7 on hover)
  - Per-strain tint via `data-tint` attribute:
    - `sativa`: `linear-gradient(155deg, rgba(142,214,138,.65) 0%, rgba(40,80,30,.55) 100%)`
    - `indica`: `linear-gradient(155deg, rgba(180,130,220,.55) 0%, rgba(60,30,80,.6) 100%)`
    - `hybrid`: `linear-gradient(155deg, rgba(217,165,92,.55) 0%, rgba(70,40,15,.55) 100%)`
    - `cbd`: `linear-gradient(155deg, rgba(126,192,216,.55) 0%, rgba(30,60,80,.55) 100%)`
  - Bottom-fade via `::after` `linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(7,9,10,.85) 100%)`
  - Top-left: "Nº xx" mono label (0.55rem 0.25em uppercase, glass background, backdrop-blur 6px)
  - Top-right: bookmark heart button (32×32, rounded, glass bg + blur, ember on bookmarked/hover)
  - Bottom-left: strain dot (8px circle, glowing 12px shadow) + type badge (`indica`/`sativa`/`hybrid`/`cbd`)
- **Body** (`.strain-card-body`): padding 1.25rem 1.5rem 1.5rem, flex column gap 0.7rem
  - Name: Instrument Serif italic 400, 1.45rem, letter-spacing -0.015em
  - Description paragraph
  - Stats row: THC / CBD / ♥ likes
  - Terpene pills (first 2)
  - Effect tags (first 3)
  - Card footer: "View Details →" — ember, JetBrains Mono 0.65rem 0.18em uppercase

### Eyebrow Mono (`.eyebrow-mono`)
Reusable editorial signpost. JetBrains Mono 0.66rem 400, 0.22em letter-spacing, uppercase, color `--text3`. Preceded by 24×1px ember-dim line via `::before`.

### Buttons
- **Primary editorial** (`.btn-cine`): ember bg `--ember`, color #14110A, padding 0.85rem 1.5rem, 999px radius, Instrument Sans 500 0.9rem. Hover: lifts 1px, brightens to #E3B377, deeper ember shadow.
- **Ghost editorial** (`.btn-cine-ghost`): transparent, 1px rgba(255,255,255,.18) border, backdrop-filter blur 8px. Hover: white/.5 border, white/.04 bg.
- **Legacy .btn-primary / .btn-secondary / .btn-amber / .btn-ghost** retained for non-Home routes — all updated to 999px radius and Instrument Sans 500.

### Section Head (`.cine-section-head`)
Grid `1fr auto`, align-end, gap 2rem, margin-bottom 3rem, padding-bottom 1.5rem, bottom `--border` line.
- Left: eyebrow-mono "Chapter I/II" + h2 with `<em>` ember for accent words
- Right: mono meta (counter, status) + underlined ember-dim "View all →" link

---

## Interactions & Behavior

### Scroll motion engine
Implemented as **vanilla JS** in a `<script>` block before the React app loads. Exposed at `window.__scrollEngine.scan()`. Hooks into:
- `scroll` and `resize` events (passive, rAF-throttled)
- `IntersectionObserver` (threshold 0.12, rootMargin "0px 0px -8% 0px") for `.reveal*` classes and section visibility

**On every rAF tick during scroll:**
- Updates `--progress` CSS var (0–100%) → drives the top scroll progress bar
- Updates `--scroll-y` CSS var (px) — available for any consumer
- Iterates `[data-parallax]` elements within viewport ±200px, computes offset from viewport center × speed, applies `translate3d(0, Ypx, 0) scale(...)`

**Per-route:** `App` calls `window.__scrollEngine.scan()` after each route change (60ms debounce) to pick up new targets.

### Reveal animations (CSS classes)
- `.reveal` — fade + 28px rise, 1100ms cubic-bezier(.2,.7,.2,1)
- `.reveal-delay-1/2/3/4` — 120/240/360/480ms transition-delay
- `.reveal-left` / `.reveal-right` — slide in 40px from sides
- `.reveal-card` — 40px rise + scale .985 → 1, 900ms
- `.reveal-letters > .lt` — per-letter cascade with `--i` index, 22ms per letter (not used in current home, kept for future)

Trigger: `IntersectionObserver` adds `.is-visible`. One-shot by default (set `data-reveal-once="false"` to re-trigger).

### Parallax
Attributes on element:
- `data-parallax="0.15"` — speed (positive = element moves opposite to scroll)
- `data-parallax-scale="1.12"` — extra static scale applied with the translate so the element never reveals edges

Targets set in current Home:
- `.cine-hero-img` (0.15, scale 1.12)
- `.cine-drop-img-inner` (0.08)
- `.cine-smoke-bg` (0.12, scale 1.18)
- `.cine-stories-img-inner` (0.06)

The Tweaks "Parallax intensity" slider multiplies these via `data-parallax-base` (captured on mount).

### Hero entrance animation
Pure CSS, runs once on mount:
- Headline: two `.line > span` elements transform translateY(110%) → 0 over 1100ms cubic-bezier(.2,.7,.2,1), delays 200ms then 380ms
- Eyebrow / sub / search / actions: `fadeUp` keyframe (translateY 18px → 0, opacity 0 → 1) over 900ms, delays 100/650/780/900ms

### Section-visible-triggered animations
Stories and Drop sections each have an inner image element that scales over 12–14s when the parent `.cine-stories` / `.cine-drop` gets `.is-visible` (via the IntersectionObserver scan).

### Tweaks panel
Floating bottom-right panel, surfaces when user toggles "Tweaks" in the host toolbar. Controls:

| Control | Type | Range | Effect |
|---|---|---|---|
| Hero image | Select | macro / product / hands / smoke | Swaps `.cine-hero-img` background URL live |
| Ken-burns motion | Toggle | on/off | Pauses/runs hero animation via `animationPlayState` |
| Parallax intensity | Slider | 0–2, step 0.05 | Multiplies all `data-parallax` values |
| Marquee duration | Slider | 12–90s, step 2 | Updates `--marquee-dur` |
| Accent ember | Color | 5 swatches: #D9A55C, #C9893D, #E8C277, #B97A4B, #8FB85F | Updates `--ember` |

State is persisted to disk via `window.parent.postMessage({type: '__edit_mode_set_keys', edits}, '*')` and rewritten into the `/*EDITMODE-BEGIN*/{...}/*EDITMODE-END*/` block in the source. In a real codebase, replace this protocol with whatever your settings persistence layer is (localStorage / user prefs / server-side).

### Reduced motion
A `@media (prefers-reduced-motion: reduce)` block disables all reveal transforms, parallax transforms, ken-burns, smoke drift, stories zoom, drop zoom, and hero entrance animations. Required for accessibility compliance.

---

## State Management

Existing state (untouched):
- `route` — current page routing (App component)
- `bookmarks` — Set of strain IDs (App, threaded to cards)
- `toasts` — array of toast notifications

New state (this session):
- `tw` — tweaks object `{ heroImage, heroMotion, parallax, accent, marqueeSpeed }` in App, persisted to EDITMODE block

The scroll engine itself is **outside React** — pure DOM/CSS-var driven. This is intentional: scroll handlers in React state would re-render constantly and tank perf.

---

## Design Tokens

### Colors

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#07090A` | Page canvas — deep inky black |
| `--bg2` | `#0C0F0D` | Secondary background (marquee, spotlight transitions) |
| `--surface` | `#11140F` | Cards, section panels |
| `--surface2` | `#181C16` | Elevated panel |
| `--border` | `#1E2319` | Hairline dividers |
| `--border2` | `#2A3024` | Heavier dividers, ghost button borders |
| `--text` | `#ECE7D7` | Primary body text |
| `--text2` | `#A39884` | Secondary body |
| `--text3` | `#6C6452` | Tertiary / mono labels |
| `--ember` | `#D9A55C` | Primary accent (gold) — currently overridden to `#8FB85F` (moss) per user pref via Tweaks |
| `--ember-dim` | `#8E6826` | Section divider accents |
| `--moss` | `#6CA45A` | Category color (effects, sativa) |
| `--moss-dim` | `#3A5A30` | Category support |
| `--shadow` | `0 20px 60px rgba(0,0,0,.65)` | Lifted card shadow |
| `--glow-warm` | `0 0 80px rgba(217,165,92,.10)` | Subtle warm halo |

**Category color tokens:**
- Indica: `#c08ce8` (violet) / border `rgba(192,140,232,.35)`
- Sativa: `#8ED68A` / border `rgba(142,214,138,.35)`
- Hybrid: ember
- CBD: `#7ec0d8` / border `rgba(126,192,216,.35)`

### Typography
- **Display:** Instrument Serif (italic 400 only used). Loaded with `&ital@0;1`.
- **Body / UI:** Instrument Sans (400, 500, 600 + italic 400).
- **Labels / mono:** JetBrains Mono (300, 400, 500).
- **Legacy (kept for non-Home routes):** Lora, Raleway, DM Mono.

Fallbacks: `Lora`, `Georgia`, `serif` for display; `Raleway`, `sans-serif` for body; `DM Mono`, `monospace` for mono.

### Spacing scale (no explicit token system — used directly)
- Section padding: 6rem 2rem desktop, 4rem 1.25rem mobile (`.cine-section`)
- Card padding: 1.25rem 1.5rem 1.5rem (body), art is aspect-ratio driven
- Inter-element gap: 0.7rem (card body), 1.25rem (section heading), 1.5rem (meta grid), 3rem (footer columns)

### Border radius
- Cards / panels: 4px (sharper editorial feel)
- Pricing card: 6px
- Buttons: 999px (full pill)
- Glass labels / badges: 2px

### Shadows
- Card hover: `0 30px 60px -30px rgba(0,0,0,.6), 0 0 0 1px rgba(217,165,92,.06)`
- Ember button: `0 8px 30px -8px rgba(217,165,92,.5)` (lifted hover: `0 12px 40px -8px rgba(217,165,92,.6)`)
- Premium card: `0 20px 60px rgba(0,0,0,.65), 0 0 80px -20px rgba(217,165,92,.15)`

---

## Assets

All hero/lifestyle imagery in `img/` is **AI-generated via Higgsfield** (Nano Banana Pro model). Stored locally in this bundle.

| File | Dimensions | Purpose | Prompt summary |
|---|---|---|---|
| `img/hero-macro.jpg` | 1376×768 | Hero bg, ken-burns | Macro frosty bud, PNW forest bokeh, golden hour |
| `img/hero-product.jpg` | 928×1152 | The Drop + strain card backgrounds | Amber apothecary jar on serpentine stone, low fog |
| `img/hero-smoke.jpg` | 1376×768 | Smoke interstitial bg | Curling smoke on black with amber spotlight |
| `img/hero-hands.jpg` | 1376×768 | Field Reports split | Hands cradling a jar by a cabin window, Portra 400 |

**Production note:** The repo should regenerate these as **per-strain product shots** so every strain card has its own art. The current implementation tints a single product image with `mix-blend-mode: color` — visually unique per card but not literally per-strain. See `CODEBASE_NOTES.md` § "Imagery — the easy win" for the recommended generation workflow.

**No icon library** — all icons in the existing app are inline SVG. The new sections don't add any new iconography (this is deliberate; the editorial direction relies on type + photography, not icons).

---

## Files in this bundle

| File | Purpose |
|---|---|
| `Untapped Market.html` | The full prototype — every change in this session is in here |
| `tweaks-panel.jsx` | Floating Tweaks panel component (TweaksPanel, useTweaks hook, TweakSection/Slider/Toggle/Radio/Select/Color etc.) |
| `img/hero-macro.jpg` | Hero macro bud generation |
| `img/hero-product.jpg` | Apothecary jar generation |
| `img/hero-smoke.jpg` | Smoke void generation |
| `img/hero-hands.jpg` | Hands & cabin generation |
| `CODEBASE_NOTES.md` | Broader codebase brainstorm — architecture, data layer, premium plumbing, SEO, moderation, performance, accessibility, Higgsfield workflow, naming. Read this before migrating off the monolith. |
| `README.md` | This file |

---

## Recommended implementation order

1. **Migrate off the inline-Babel monolith.** Adopt Vite + React + TS (or whatever the target stack is). Split into routes, layout, components per `CODEBASE_NOTES.md`.
2. **Lift the design tokens** into a CSS file / Tailwind theme / styled-system. Critical: `--bg`, `--ember`, the three text levels, the four category colors.
3. **Load the new fonts** (Instrument Serif, Instrument Sans, JetBrains Mono) with `font-display: swap`. Self-host for production.
4. **Drop in hero imagery** to your asset pipeline. If the repo uses Next.js / Astro, use `<Image>` with `priority` on the hero.
5. **Build the Home composition** section by section, top to bottom. Each section is self-contained.
6. **Port the scroll engine** verbatim into a module mounted once at app start. It's framework-agnostic; in React mount it from a top-level `useEffect`.
7. **Port the Tweaks panel** if and only if the team wants live design controls in dev. Otherwise just bake the chosen values in.
8. **Apply the type/color system to non-Home routes** — they currently inherit only superficially.

---

## Open items (not in this bundle)

- **Per-strain product photography** — generation slots are ready; needs Higgsfield credits and prompts per strain (see CODEBASE_NOTES.md)
- **Smoke section as actual video** — currently CSS-animated; image-to-video via Higgsfield was queued but blocked on credits
- **Alternative hero variants** — silhouette / dispensary interior / second macro were spec'd but not generated
- **Backend plumbing** for premium gating, real dispensary inventory, trip-report moderation — all called out in CODEBASE_NOTES.md
