# Image Sourcing Workflow — Cannabis Product Images

**For the site owner / content team. Read this before using or publishing any image.**

---

## 1. The Legal Model — Why This Matters

Every photograph is automatically copyrighted the moment it is created (Berne Convention, implemented in the US under 17 U.S.C. § 102). You do **not** need a copyright notice, registration, or watermark to own the rights. The default for any image you find on the internet is: **all rights reserved, you may not use it.**

"Safe to reuse commercially" means the image carries one of these licenses — and you must respect every term of that license:

| License | What it means | Attribution required? |
|---|---|---|
| **CC0 / Public Domain Zero** | Creator has waived all rights worldwide. | No (but crediting is good practice) |
| **PDM (Public Domain Mark)** | Work is documented as having entered the public domain (typically pre-1928 or government works). | No |
| **CC-BY** | Free to use commercially with attribution to the creator. | **Yes — must credit creator, title, license** |
| **CC-BY-SA** | Same as CC-BY plus any derivative work must carry the same CC-BY-SA license. | **Yes — must credit; derivatives share-alike** |
| **Pexels / Pixabay / Unsplash licenses** | Platform-specific royalty-free commercial licenses. Attribution encouraged but not strictly required. | No (encouraged) |

> **Non-commercial (CC-BY-NC) and No-Derivatives (CC-BY-ND) licenses are intentionally rejected by this workflow.** They cannot be used on a commercial cannabis retail site.

### Attribution compliance (CC-BY and CC-BY-SA)

Wherever a CC-BY or CC-BY-SA image appears on the site you **must** display:
- The title of the work (if known)
- The creator's name
- The license name and a link to the license text
- A link to the original work or source page

The `scripts/sources/product-images.mjs` script pre-builds an `attribution` string for every candidate. When you download with `--download`, a `.attribution.json` sidecar file is written alongside the image — use its contents to populate the on-page credit.

---

## 2. Allowed Sources

The script queries these sources only — all via their official, documented APIs:

| Source | Why it is allowed |
|---|---|
| **Openverse** (`api.openverse.org`) | WordPress Foundation project aggregating CC + public-domain media from 300+ institutions. Returns machine-readable license metadata. No API key required. |
| **Wikimedia Commons** (`commons.wikimedia.org/w/api.php`) | Hosts public-domain and CC media with structured license templates. Authoritative provenance. |
| **Pexels** (`api.pexels.com`) | Royalty-free license explicitly permits commercial use. Requires `PEXELS_API_KEY`. |
| **Pixabay** (`pixabay.com/api/`) | Pixabay Content License permits commercial use. Requires `PIXABAY_API_KEY`. |
| **Unsplash** (`api.unsplash.com`) | Unsplash License permits commercial use. Requires `UNSPLASH_ACCESS_KEY`. |

---

## 3. Forbidden Sources — Never Use These

The following are **explicitly refused** by the script and must never be manually scraped or copied from either:

| Source | Why it is forbidden |
|---|---|
| **Weedmaps** | Competitor menu platform. ToS explicitly prohibits scraping. All product images are copyrighted by brands or Weedmaps. |
| **Leafly** | Same — competitor menu; ToS prohibits scraping; images are brand-owned or licensed exclusively to Leafly. |
| **Dutchie / Jane / iHeartJane** | Same category — menu platforms with restrictive ToS; using their images would also constitute unfair competition. |
| **Brand / dispensary websites** | Photos are owned by the brand's photographer or marketing agency. No reuse right exists without written permission from the rights-holder. |
| **Google Images** | Google indexes and thumbnails copyrighted content. Fetching a thumbnail does not grant any license to the underlying image. |
| **Instagram / Facebook / TikTok** | User-uploaded content is owned by the uploader. Platform ToS prohibit automated scraping. |
| **Any site with robots.txt disallow** | Bypassing robots.txt violates the site's ToS and, in some jurisdictions, anti-circumvention laws. |

**Violating these rules exposes the business to copyright infringement claims, DMCA takedowns, and potential statutory damages of $750–$150,000 per image (17 U.S.C. § 504).**

---

## 4. Step-by-Step Workflow

### Step 1 — Run the script

```bash
# Basic run (default query rotates by day, up to 20 results):
node scripts/sources/product-images.mjs

# Specific product query, limit to 10 results:
node scripts/sources/product-images.mjs "cannabis pre-roll" --limit 10

# Filter to only CC0 and public domain:
node scripts/sources/product-images.mjs "hemp flower" --limit 20 --licenses cc0,pdm

# See what would happen without hitting the network:
node scripts/sources/product-images.mjs "cannabis jar" --dry-run

# Enable optional sources (set env vars first):
PEXELS_API_KEY=your_key node scripts/sources/product-images.mjs "cannabis bud" --limit 30
```

### Step 2 — Review `data/image-candidates.json`

Open the manifest. For each candidate check:

- [ ] **license** — is it one of cc0 / pdm / by / by-sa / pexels / pixabay / unsplash?
- [ ] **attribution** — copy this string; you must display it if the license requires it.
- [ ] **foreignLandingUrl** — visit the original page and confirm the license listed there matches.
- [ ] **Image suitability** — does it actually look right for a cannabis retail context? Is it product-appropriate?
- [ ] **Remove any candidates you're unsure about.** When in doubt, don't use it.

### Step 3 — (Optional) Download approved binaries

Only download images you have already reviewed and approved in Step 2. Downloads are saved to `public/img/sourced/`.

```bash
node scripts/sources/product-images.mjs "cannabis flower" --limit 5 --download
```

The `--download` flag:
- Only downloads CC0 / PDM / CC-BY / CC-BY-SA images (platform-licensed images require per-license review).
- Writes a `<filename>.attribution.json` sidecar — **do not delete this file.**
- Is idempotent — already-downloaded files are skipped.

### Step 4 — Human approval gate

Before any image is committed to the repository or published:

1. A second person (or the owner) reviews the image and its attribution sidecar.
2. Confirm the image is contextually appropriate for a licensed cannabis retailer.
3. Mark the candidate as approved in your content tracker (Notion, spreadsheet, etc.).

**This workflow intentionally has no auto-publish step.**

### Step 5 — Store attribution alongside the image

- Keep the `.attribution.json` sidecar in `public/img/sourced/` alongside the image file.
- When displaying the image on the site, render the `attribution` string — even for CC0 (good practice) and required for CC-BY / CC-BY-SA.
- Link the attribution text to `foreignLandingUrl` and link the license name to `licenseUrl`.

### Step 6 — Publish

Commit both the image and its `.attribution.json` sidecar. The attribution data becomes a permanent part of the repository.

---

## 5. Environment Variables (optional sources)

Add to `.env.local` (do not commit this file):

```
OPENVERSE_API_TOKEN=...     # Optional — raises Openverse rate limits
PEXELS_API_KEY=...          # Required to enable Pexels source
PIXABAY_API_KEY=...         # Required to enable Pixabay source
UNSPLASH_ACCESS_KEY=...     # Required to enable Unsplash source
```

---

## 6. Recommended Alternatives (the Cleanest Rights Path)

The workflow above gives you legally reusable images, but the **cleanest possible rights situation** for a commercial cannabis brand is:

1. **Original photography** — commission a photographer (with a clear work-for-hire agreement) or shoot product photos yourself. You own the copyright outright; no attribution, no license compliance, no third-party risk.

2. **AI-generated imagery** — use the AI generation pipeline already set up in this project (see `CLAUDE_AI_GENERATION_WORKFLOW.md`). FLUX, Higgsfield, and Ideogram outputs are owned by the account holder under those platforms' terms. No third-party copyright to worry about. Ideal for stylized product backgrounds, lifestyle scenes, and brand imagery.

3. **Official press / brand assets** — contact the cannabis brand or manufacturer directly and ask for their press kit or written permission to use their product photos. Get it in writing (email is fine). This is required for any brand-specific product shots.

> The Openverse / Wikimedia / Pexels workflow in this repo is best suited for **generic cannabis lifestyle imagery** (macro flower shots, green backgrounds, hemp fields) — not for specific branded product photography, which must come from the brand.

---

## 7. Notes on Network / Build Environments

The script is build-safe:

- All source fetches are wrapped in error handling. A network failure (including sandbox egress restrictions) causes that source to be skipped, not the whole run to crash.
- The script always exits with code `0` so it does not break CI pipelines.
- An empty or partial manifest is always written, making the output deterministic.
- Use `--dry-run` in environments where you want to confirm the script is wired correctly without making any network calls.

---

*This document covers the image-sourcing workflow only. For the full content contribution and publishing policy, see the main README.*
