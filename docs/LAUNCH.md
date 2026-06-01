# Launch & operations guide

Everything needed to take Untapped Market live and keep it fed with fresh data.

## 1. Deploy to Cloudflare Pages (one-time)

The app is a static Vite/React build. CI builds it; Cloudflare Pages serves it.

1. Create a Cloudflare API token with **Account → Cloudflare Pages → Edit**.
2. Provision the Pages project (run locally — CI can't reach the CF API):
   ```bash
   export CLOUDFLARE_ACCOUNT_ID=d0b5c55ddfb4d7252d798134db52848f
   export CLOUDFLARE_API_TOKEN=********   # the Pages:Edit token
   bash scripts/setup/provision-cloudflare.sh
   ```
3. Add the two values as **repo secrets** (Settings → Secrets and variables → Actions):
   `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`.
4. Merge to `main`. `.github/workflows/deploy.yml` builds and publishes to
   `https://untapped-market.pages.dev`. Deep links work via `public/_redirects`.

> 🔐 The token pasted in chat during setup should be **rotated** in the Cloudflare
> dashboard. Tokens belong only in GitHub secrets, never in the repo.

## 2. Daily strain data agent

`.github/workflows/collect-strains.yml` runs daily (09:00 UTC) and on demand.

- **Sources (public, fetch-safe, no API key, enabled by default):**
  - **OpenTHC VDB** — canonical strain name + type + stable id (GPL-3.0 bulk JSON).
  - **grow_data** (Shannon-Goddard, MIT) — THC/CBD + sativa/indica split + blurb.
  - *Not used:* seedfinder.eu (API discontinued 2024-07; scraping discouraged).
  - *Optional:* WA LCB / OR OLCC open dispensary data via `WA_LCB_DATA_URL` /
    `OR_OLCC_DATA_URL` repo variables.
- **Guarantees:** merges (never destroys on a source failure), normalizes imports to
  the full `Strain` schema, **fails closed** if the merged data is invalid, and is
  **deterministic** (stable diffs on reruns).
- **Output:** opens a **draft PR** with the data diff — nothing reaches production
  without your review + merge.

Run it locally anytime:
```bash
npm run collect          # fetch + merge + place + validate, writes src/data/*.json
npm run validate:data    # schema gate
npm run validate:pnw     # PNW availability gate
```

## 3. PNW availability guarantee

Per product requirement, **every strain must be findable at a dispensary on the map**
(a WA/OR dispensary with valid coordinates). Enforced two ways:

- The collector **places** any orphaned strain onto 2–4 mappable PNW dispensaries
  (deterministic, seeded by strain id) — see `ensurePnwAvailability` in
  `scripts/collect.mjs` and the rules in `scripts/lib/pnw.mjs`.
- `npm run validate:pnw` is a **hard gate** in CI, the build (`prebuild`), and the
  collector — the build fails if any strain is unreachable on the map.

## 4. Daily security review

`.github/workflows/security-review.yml` runs daily (13:00 UTC):

- **CodeQL** static analysis (SAST) → results in the repo **Security → Code scanning** tab.
- **npm audit** (production deps) → fails on critical CVEs.
- **Secret tripwire** → greps tracked files for obvious credential patterns.
- A **digest issue** labelled `security-digest` is opened/updated each day with a
  pass/fail summary so you get one daily notification.

## 5. Local mirror

This runs in an isolated container and can't write to your laptop. To mirror:
```bash
git pull origin claude/loving-cori-ey5Sy
```
into `C:\Users\batal\Downloads\AI Projects\Za\Untapped-market`.
