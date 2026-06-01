/**
 * scripts/sources/product-images.mjs
 *
 * Cannabis/hemp product image sourcing workflow.
 *
 * PURPOSE
 * -------
 * Fetches openly-licensed (CC0, CC-BY, CC-BY-SA, public-domain) images from
 * trusted, API-accessible sources and writes a CANDIDATES MANIFEST for a
 * human reviewer to approve before any image is published.
 *
 * LEGAL MODEL — READ THIS BEFORE MODIFYING
 * -----------------------------------------
 * Every photograph on the internet is copyrighted by its creator the moment
 * it is created (Berne Convention, 17 U.S.C. § 102). "Safe to reuse" means
 * one of:
 *   1. Public Domain / CC0 — rights explicitly waived, no attribution needed
 *      (though crediting is still good practice).
 *   2. CC-BY — free to use with attribution to the creator.
 *   3. CC-BY-SA — free to use with attribution; derivative works must carry
 *      the same license (share-alike).
 *   4. PDM (Public Domain Mark) — work is old enough / documented as PD.
 *   5. A custom written permission or license from the rights-holder.
 *
 * ALLOWED SOURCES (query their official APIs only)
 * ------------------------------------------------
 *   • Openverse  — https://api.openverse.org/v1/images/
 *     Aggregates CC-licensed and public-domain media; returns structured
 *     license metadata. No key required; optional bearer token for higher
 *     rate limits (OPENVERSE_API_TOKEN env var).
 *   • Wikimedia Commons — https://commons.wikimedia.org/w/api.php
 *     Hosts public-domain and CC media with machine-readable license tags.
 *   • Pexels (PEXELS_API_KEY required) — royalty-free, commercial use OK
 *     per the Pexels License (https://www.pexels.com/license/).
 *   • Pixabay (PIXABAY_API_KEY required) — Content License allows commercial
 *     use (https://pixabay.com/service/license-summary/).
 *   • Unsplash (UNSPLASH_ACCESS_KEY required) — Unsplash License allows
 *     commercial use (https://unsplash.com/license).
 *
 * FORBIDDEN SOURCES — NEVER IMPLEMENT, NEVER SCRAPE
 * --------------------------------------------------
 *   ✗ Weedmaps, Leafly, Dutchie, Jane / iHeartJane — competitor menus whose
 *     ToS explicitly prohibit scraping or copying product images.
 *   ✗ Brand / dispensary websites — images are copyrighted by the brand or
 *     photographer; no license to reuse without written permission.
 *   ✗ Google Images — index of third-party copyrighted content; fetching
 *     thumbnails does NOT grant a license.
 *   ✗ Instagram / Facebook / TikTok — ToS prohibit automated scraping;
 *     images are owned by uploaders and/or the platform.
 *   ✗ Any source that blocks bots via robots.txt or ToS — do not bypass.
 *
 * This script intentionally cannot and will not query those sources.
 *
 * OUTPUT
 * ------
 * Writes data/image-candidates.json — a reviewable manifest. It does NOT
 * publish images automatically. Downloading binaries requires --download flag
 * and is conservative (clearly-licensed images only).
 *
 * USAGE
 * -----
 *   node scripts/sources/product-images.mjs "<query>" [options]
 *
 * Options:
 *   --limit N          Max candidates to collect (default: 20)
 *   --licenses LIST    Comma-separated: cc0,by,by-sa,pdm (default: all four)
 *   --download         Also download image binaries into public/img/sourced/
 *                      and write a per-image attribution sidecar (.attribution.json)
 *   --dry-run          Print what would happen; skip all network calls; exit 0
 *
 * Node 18+ required (global fetch, fs/promises). Zero external dependencies.
 */

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync, createWriteStream } from 'node:fs';
import { resolve, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createHash } from 'node:crypto';

// ─── Constants ───────────────────────────────────────────────────────────────

const SCRIPT_DIR = new URL('.', import.meta.url).pathname;
const REPO_ROOT  = resolve(SCRIPT_DIR, '..', '..');
const DATA_DIR   = join(REPO_ROOT, 'data');
const MANIFEST_PATH = join(DATA_DIR, 'image-candidates.json');
const DOWNLOAD_DIR  = join(REPO_ROOT, 'public', 'img', 'sourced');

/**
 * Recognized open licenses this tool will accept.
 * Any result from an API that does NOT carry one of these license slugs is
 * silently discarded — we never include ambiguously-licensed material.
 */
const OPEN_LICENSES = new Set(['cc0', 'by', 'by-sa', 'pdm', 'cc-by', 'cc-by-sa',
  'publicdomain', 'public-domain', 'cc0-1.0', 'cc-by-4.0', 'cc-by-sa-4.0',
  'cc-by-2.0', 'cc-by-sa-2.0', 'cc-by-3.0', 'cc-by-sa-3.0']);

// normalizelicense is an alias kept for readability at Openverse call sites.
// The canonical implementation lives in normalizeWikimediaLicense() below,
// which handles the full range of strings both sources can return.

// ─── CLI Parsing ─────────────────────────────────────────────────────────────

function parseCli(argv) {
  const args = argv.slice(2); // strip 'node' and script path
  let query    = null;
  let limit    = 20;
  let licenses = ['cc0', 'by', 'by-sa', 'pdm'];
  let download = false;
  let dryRun   = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--limit'    && args[i + 1]) { limit    = parseInt(args[++i], 10); }
    else if (a === '--licenses' && args[i + 1]) { licenses = args[++i].split(',').map(s => s.trim().toLowerCase()); }
    else if (a === '--download') { download = true; }
    else if (a === '--dry-run')  { dryRun   = true; }
    else if (!a.startsWith('--')) { query = a; }
  }

  // Default cannabis-product search queries cycling by day-of-week so
  // repeated runs without an explicit query still surface varied results.
  if (!query) {
    const defaults = [
      'cannabis flower',
      'marijuana bud macro',
      'cannabis pre-roll',
      'hemp flower',
      'cannabis jar glass',
      'cannabis concentrate',
      'cannabis leaf closeup',
    ];
    query = defaults[new Date().getDay() % defaults.length];
  }

  return { query, limit, licenses, download, dryRun };
}

// ─── HTTP helper ─────────────────────────────────────────────────────────────

/**
 * Thin fetch wrapper. Returns { ok, data, error }.
 * Never throws — all errors are caught so one source failure cannot crash
 * the whole run; we just skip that source and continue.
 */
async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, { ...options, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status} ${res.statusText}` };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ─── Source: Openverse ───────────────────────────────────────────────────────
//
// Openverse aggregates CC-licensed and public-domain media from hundreds of
// partner institutions. It returns structured license metadata per result.
// Docs: https://api.openverse.org/v1/
// Rate limit: ~60 req/min unauthenticated; higher with OPENVERSE_API_TOKEN.
//
// NOTE: Openverse does NOT host images itself — it links to originals on
// partner sites. The license metadata comes from those partner institutions.

async function fetchOpenverse({ query, limit, licenses }) {
  const BASE = 'https://api.openverse.org/v1/images/';

  // Map our canonical license names to Openverse license parameter values.
  const licenseMap = { cc0: 'cc0', by: 'by', 'by-sa': 'by-sa', pdm: 'pdm' };
  const licenseParam = licenses.map(l => licenseMap[l]).filter(Boolean).join(',');

  const params = new URLSearchParams({
    q:          query,
    page_size:  String(Math.min(limit, 100)),
    license:    licenseParam,
    mature:     'false', // content-safety filter — keep appropriate for a retail site
    extension:  'jpg,jpeg,png,webp',
  });

  const headers = { 'Accept': 'application/json' };
  // Optional higher-rate-limit token — gracefully absent if not set.
  if (process.env.OPENVERSE_API_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.OPENVERSE_API_TOKEN}`;
  }

  const url = `${BASE}?${params}`;
  console.log(`  [openverse] GET ${url}`);
  const { ok, data, error } = await safeFetch(url, { headers });

  if (!ok) {
    console.warn(`  [openverse] SKIPPED — ${error}`);
    return [];
  }

  const results = data.results ?? [];
  console.log(`  [openverse] received ${results.length} results`);

  return results.map(r => {
    const license = normalizelicence(r.license ?? '');
    if (!license) return null; // discard unrecognized licenses

    return {
      source:              'openverse',
      id:                  r.id,
      title:               r.title || '(untitled)',
      originalUrl:         r.url,
      thumbnail:           r.thumbnail,
      foreignLandingUrl:   r.foreign_landing_url,
      creator:             r.creator || null,
      creatorUrl:          r.creator_url || null,
      license,
      licenseVersion:      r.license_version || null,
      licenseUrl:          r.license_url || `https://creativecommons.org/licenses/${r.license}/`,
      attribution:         r.attribution || buildAttribution(r.title, r.creator, r.license, r.license_url),
      width:               r.width  || null,
      height:              r.height || null,
      suggestedFilename:   slugFilename(r.title || r.id, license),
    };
  }).filter(Boolean);
}

// ─── Source: Wikimedia Commons ───────────────────────────────────────────────
//
// Wikimedia Commons hosts a vast collection of public-domain and CC-licensed
// media. We use the MediaSearch API endpoint which provides relevance-ranked
// results for a text query, then fetch structured license info via imageinfo.
// API docs: https://www.mediawiki.org/wiki/API:Main_page
//
// We deliberately avoid the Commons "Special:Search" HTML page and only use
// the documented JSON API.

async function fetchWikimedia({ query, limit, licenses }) {
  const BASE = 'https://commons.wikimedia.org/w/api.php';

  // Step 1: MediaSearch to get a ranked list of file names.
  const searchParams = new URLSearchParams({
    action:     'query',
    list:       'search',
    srsearch:   `${query} filetype:bitmap`,
    srnamespace:'6',         // namespace 6 = File:
    srlimit:    String(Math.min(limit * 2, 50)), // fetch extra to compensate for license filtering
    srprop:     'title|snippet',
    format:     'json',
    origin:     '*',
  });

  console.log(`  [wikimedia] searching Commons: ${query}`);
  const searchRes = await safeFetch(`${BASE}?${searchParams}`);

  if (!searchRes.ok) {
    console.warn(`  [wikimedia] search SKIPPED — ${searchRes.error}`);
    return [];
  }

  const searchItems = searchRes.data?.query?.search ?? [];
  if (searchItems.length === 0) {
    console.log(`  [wikimedia] no search results`);
    return [];
  }

  const titles = searchItems.map(s => s.title).join('|');

  // Step 2: Fetch imageinfo (url, extmetadata including license) for those titles.
  const infoParams = new URLSearchParams({
    action:    'query',
    titles,
    prop:      'imageinfo',
    iiprop:    'url|extmetadata|dimensions',
    iiurlwidth:'800',
    format:    'json',
    origin:    '*',
  });

  const infoRes = await safeFetch(`${BASE}?${infoParams}`);
  if (!infoRes.ok) {
    console.warn(`  [wikimedia] imageinfo SKIPPED — ${infoRes.error}`);
    return [];
  }

  const pages = Object.values(infoRes.data?.query?.pages ?? {});
  console.log(`  [wikimedia] received metadata for ${pages.length} files`);

  const candidates = [];
  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (!info) continue;

    const meta = info.extmetadata ?? {};

    // Extract license from extmetadata — Wikimedia populates this from
    // structured Commons license templates.
    const rawLicense  = meta.License?.value || meta.LicenseShortName?.value || '';
    const license     = normalizeWikimediaLicense(rawLicense);
    if (!license) continue; // not openly licensed — skip

    const creator = stripHtml(meta.Artist?.value || meta.Credit?.value || '');
    const title   = stripHtml(meta.ObjectName?.value || page.title || '(untitled)');
    const licUrl  = meta.LicenseUrl?.value || licenseUrlFor(license);

    candidates.push({
      source:            'wikimedia',
      id:                String(page.pageid),
      title,
      originalUrl:       info.url,
      thumbnail:         info.thumburl || info.url,
      foreignLandingUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
      creator:           creator || null,
      creatorUrl:        null,
      license,
      licenseVersion:    null,
      licenseUrl:        licUrl,
      attribution:       buildAttribution(title, creator, license, licUrl),
      width:             info.width  || null,
      height:            info.height || null,
      suggestedFilename: slugFilename(title, license),
    });
  }

  console.log(`  [wikimedia] ${candidates.length} candidates after license filtering`);
  return candidates;
}

// ─── Source: Pexels (optional — requires PEXELS_API_KEY) ─────────────────────
//
// Pexels provides royalty-free photos under the Pexels License which allows
// commercial use. No attribution required, though crediting the photographer
// is encouraged.  https://www.pexels.com/license/

async function fetchPexels({ query, limit }) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    console.log('  [pexels] SKIPPED — PEXELS_API_KEY not set');
    return [];
  }

  const params = new URLSearchParams({ query, per_page: String(Math.min(limit, 80)) });
  const url = `https://api.pexels.com/v1/search?${params}`;
  console.log(`  [pexels] GET ${url}`);

  const { ok, data, error } = await safeFetch(url, {
    headers: { Authorization: key },
  });

  if (!ok) {
    console.warn(`  [pexels] SKIPPED — ${error}`);
    return [];
  }

  return (data.photos ?? []).map(p => ({
    source:            'pexels',
    id:                String(p.id),
    title:             p.alt || `Pexels photo ${p.id}`,
    originalUrl:       p.src.original,
    thumbnail:         p.src.medium,
    foreignLandingUrl: p.url,
    creator:           p.photographer || null,
    creatorUrl:        p.photographer_url || null,
    license:           'pexels',          // Pexels-specific royalty-free license
    licenseVersion:    null,
    licenseUrl:        'https://www.pexels.com/license/',
    attribution:       `Photo by ${p.photographer} on Pexels (${p.url})`,
    width:             p.width  || null,
    height:            p.height || null,
    suggestedFilename: slugFilename(p.alt || `pexels-${p.id}`, 'pexels'),
  }));
}

// ─── Source: Pixabay (optional — requires PIXABAY_API_KEY) ───────────────────
//
// Pixabay Content License allows free commercial use without attribution
// (though attribution is appreciated). https://pixabay.com/service/license-summary/

async function fetchPixabay({ query, limit }) {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) {
    console.log('  [pixabay] SKIPPED — PIXABAY_API_KEY not set');
    return [];
  }

  const params = new URLSearchParams({
    key,
    q:          query,
    image_type: 'photo',
    per_page:   String(Math.min(limit, 200)),
    safesearch: 'true',
  });

  console.log(`  [pixabay] searching: ${query}`);
  const { ok, data, error } = await safeFetch(`https://pixabay.com/api/?${params}`);

  if (!ok) {
    console.warn(`  [pixabay] SKIPPED — ${error}`);
    return [];
  }

  return (data.hits ?? []).map(h => ({
    source:            'pixabay',
    id:                String(h.id),
    title:             h.tags || `Pixabay photo ${h.id}`,
    originalUrl:       h.largeImageURL,
    thumbnail:         h.previewURL,
    foreignLandingUrl: h.pageURL,
    creator:           h.user || null,
    creatorUrl:        h.userImageURL ? `https://pixabay.com/users/${h.user}-${h.user_id}/` : null,
    license:           'pixabay',         // Pixabay Content License
    licenseVersion:    null,
    licenseUrl:        'https://pixabay.com/service/license-summary/',
    attribution:       `Image by ${h.user} on Pixabay`,
    width:             h.imageWidth  || null,
    height:            h.imageHeight || null,
    suggestedFilename: slugFilename(h.tags || `pixabay-${h.id}`, 'pixabay'),
  }));
}

// ─── Source: Unsplash (optional — requires UNSPLASH_ACCESS_KEY) ──────────────
//
// Unsplash License allows free commercial use without attribution (attribution
// appreciated). https://unsplash.com/license

async function fetchUnsplash({ query, limit }) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    console.log('  [unsplash] SKIPPED — UNSPLASH_ACCESS_KEY not set');
    return [];
  }

  const params = new URLSearchParams({
    query,
    per_page: String(Math.min(limit, 30)),
  });

  console.log(`  [unsplash] searching: ${query}`);
  const { ok, data, error } = await safeFetch(
    `https://api.unsplash.com/search/photos?${params}`,
    { headers: { Authorization: `Client-ID ${key}` } },
  );

  if (!ok) {
    console.warn(`  [unsplash] SKIPPED — ${error}`);
    return [];
  }

  return (data.results ?? []).map(p => ({
    source:            'unsplash',
    id:                p.id,
    title:             p.description || p.alt_description || `Unsplash photo ${p.id}`,
    originalUrl:       p.urls.full,
    thumbnail:         p.urls.small,
    foreignLandingUrl: p.links.html,
    creator:           p.user?.name || null,
    creatorUrl:        p.user?.links?.html || null,
    license:           'unsplash',        // Unsplash License
    licenseVersion:    null,
    licenseUrl:        'https://unsplash.com/license',
    attribution:       `Photo by ${p.user?.name} on Unsplash (${p.links.html})`,
    width:             p.width  || null,
    height:            p.height || null,
    suggestedFilename: slugFilename(p.alt_description || p.id, 'unsplash'),
  }));
}

// ─── Utilities ───────────────────────────────────────────────────────────────

/** Strip basic HTML tags from Wikimedia extmetadata strings. */
function stripHtml(s) {
  return (s || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
}

/**
 * Normalise a Wikimedia extmetadata license string to our canonical slug.
 * Wikimedia uses strings like "cc-by-sa-4.0", "cc0", "Public domain", etc.
 */
function normalizeWikimediaLicense(raw = '') {
  const s = raw.toLowerCase().trim();
  if (!s || s === 'unknown' || s.includes('fair use')) return null;
  if (s.includes('cc0')     || s === 'public domain cc0') return 'cc0';
  if (s.includes('pd')      || s === 'public domain')     return 'pdm';
  if (s.includes('by-nc')   || s.includes('by-nd'))       return null; // too restrictive
  if (s.includes('by-sa'))  return 'by-sa';
  if (s.includes('by'))     return 'by';
  return null;
}

/** Alias for Openverse path (same logic, different call site). */
function normaliselicence(raw = '') {
  return normalizeWikimediaLicense(raw);
}

/** Build a human-readable attribution string from available fields. */
function buildAttribution(title, creator, license, licenseUrl) {
  const parts = [];
  if (title)   parts.push(`"${title}"`);
  if (creator) parts.push(`by ${creator}`);
  parts.push(`is licensed under ${license.toUpperCase()}`);
  if (licenseUrl) parts.push(`(${licenseUrl})`);
  return parts.join(' ');
}

/** Return a canonical license URL for our known slugs. */
function licenseUrlFor(slug) {
  const map = {
    cc0:    'https://creativecommons.org/publicdomain/zero/1.0/',
    pdm:    'https://creativecommons.org/publicdomain/mark/1.0/',
    by:     'https://creativecommons.org/licenses/by/4.0/',
    'by-sa':'https://creativecommons.org/licenses/by-sa/4.0/',
  };
  return map[slug] || null;
}

/**
 * Turn a title string into a safe filesystem slug, prefixed with license.
 * e.g. "Cannabis Flower Macro" + "cc0" → "cc0--cannabis-flower-macro.jpg"
 */
function slugFilename(title = '', license = '') {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${license}--${slug}.jpg`;
}

/** SHA-256 of a URL string — used for de-duplication. */
function urlHash(url = '') {
  return createHash('sha256').update(url).digest('hex').slice(0, 16);
}

// ─── Download helper (--download flag only) ──────────────────────────────────
//
// Conservative: only download images with a recognized open license.
// Saves binary to public/img/sourced/<hash>-<suggestedFilename>.
// Writes a <filename>.attribution.json sidecar with full provenance.

async function downloadCandidate(candidate) {
  // Only allow clearly open licenses — refuse anything ambiguous.
  const allowedForDownload = new Set(['cc0', 'by', 'by-sa', 'pdm']);
  if (!allowedForDownload.has(candidate.license)) {
    console.log(`  [download] SKIPPED (license '${candidate.license}' requires human review): ${candidate.suggestedFilename}`);
    return null;
  }

  await mkdir(DOWNLOAD_DIR, { recursive: true });

  const hash     = urlHash(candidate.originalUrl);
  const filename = `${hash}-${candidate.suggestedFilename}`;
  const imgPath  = join(DOWNLOAD_DIR, filename);
  const attrPath = join(DOWNLOAD_DIR, `${filename}.attribution.json`);

  if (existsSync(imgPath)) {
    console.log(`  [download] already exists: ${filename}`);
    return filename;
  }

  try {
    const res = await fetch(candidate.originalUrl, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    await pipeline(res.body, createWriteStream(imgPath));

    // Write attribution sidecar — REQUIRED for CC-BY / CC-BY-SA compliance.
    // The owner must display this attribution wherever the image appears.
    await writeFile(attrPath, JSON.stringify({
      _note: 'IMPORTANT: Display the attribution string wherever this image appears (required by the license).',
      filename,
      source:           candidate.source,
      license:          candidate.license,
      licenseUrl:       candidate.licenseUrl,
      attribution:      candidate.attribution,
      creator:          candidate.creator,
      originalUrl:      candidate.originalUrl,
      foreignLandingUrl:candidate.foreignLandingUrl,
      downloadedAt:     new Date().toISOString(),
    }, null, 2));

    console.log(`  [download] saved: ${filename}`);
    return filename;
  } catch (err) {
    console.warn(`  [download] FAILED ${candidate.suggestedFilename}: ${err.message}`);
    return null;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

/**
 * Core export — callable from other scripts.
 *
 * @param {Object} opts
 * @param {string}   opts.query     Search query
 * @param {number}   opts.limit     Max candidates
 * @param {string[]} opts.licenses  Accepted license slugs
 * @param {boolean}  opts.download  Whether to download binaries
 * @param {boolean}  opts.dryRun    Skip all network calls
 * @returns {Promise<Object>}       The manifest object
 */
export async function fetchImageCandidates({ query, limit = 20, licenses = ['cc0','by','by-sa','pdm'], download = false, dryRun = false } = {}) {

  if (dryRun) {
    console.log('[dry-run] Would query the following sources for:', JSON.stringify(query));
    console.log('[dry-run]   • Openverse API (https://api.openverse.org/v1/images/)');
    console.log('[dry-run]   • Wikimedia Commons API (https://commons.wikimedia.org/w/api.php)');
    if (process.env.PEXELS_API_KEY)   console.log('[dry-run]   • Pexels API');
    if (process.env.PIXABAY_API_KEY)  console.log('[dry-run]   • Pixabay API');
    if (process.env.UNSPLASH_ACCESS_KEY) console.log('[dry-run]   • Unsplash API');
    console.log(`[dry-run] License filter: ${licenses.join(', ')}`);
    console.log(`[dry-run] Would write manifest to: ${MANIFEST_PATH}`);
    const emptyManifest = buildManifest(query, [], true);
    await persistManifest(emptyManifest);
    return emptyManifest;
  }

  console.log(`\nSearching for openly-licensed cannabis images: "${query}"`);
  console.log(`License filter: ${licenses.join(', ')} | Limit: ${limit}\n`);

  // ── Fetch from all sources concurrently ──────────────────────────────────
  // Each source is wrapped in a try/catch inside its own function, so a
  // failure of one source never prevents other sources from running.
  const opts = { query, limit, licenses };
  const [openverse, wikimedia, pexels, pixabay, unsplash] = await Promise.allSettled([
    fetchOpenverse(opts),
    fetchWikimedia(opts),
    fetchPexels(opts),
    fetchPixabay(opts),
    fetchUnsplash(opts),
  ]);

  const allResults = [
    ...(openverse.status === 'fulfilled' ? openverse.value : []),
    ...(wikimedia.status === 'fulfilled' ? wikimedia.value : []),
    ...(pexels.status    === 'fulfilled' ? pexels.value    : []),
    ...(pixabay.status   === 'fulfilled' ? pixabay.value   : []),
    ...(unsplash.status  === 'fulfilled' ? unsplash.value  : []),
  ];

  // ── De-duplicate by source URL ────────────────────────────────────────────
  const seen = new Set();
  const deduped = [];
  for (const r of allResults) {
    const key = r.originalUrl || r.foreignLandingUrl || JSON.stringify(r);
    if (!seen.has(key)) { seen.add(key); deduped.push(r); }
  }

  // ── Trim to requested limit ───────────────────────────────────────────────
  const candidates = deduped.slice(0, limit);

  console.log(`\nTotal candidates after de-dup: ${candidates.length}`);

  // ── Optionally download binaries ──────────────────────────────────────────
  if (download && candidates.length > 0) {
    console.log('\n[download] Downloading image binaries (CC0/BY/BY-SA/PDM only)…');
    for (const c of candidates) {
      const fn = await downloadCandidate(c);
      if (fn) c.downloadedAs = fn;
    }
  }

  // ── Write manifest ────────────────────────────────────────────────────────
  const manifest = buildManifest(query, candidates, false);
  await persistManifest(manifest);

  return manifest;
}

function buildManifest(query, candidates, isDryRun) {
  // Summarise which sources contributed results.
  const sourceCounts = {};
  for (const c of candidates) {
    sourceCounts[c.source] = (sourceCounts[c.source] || 0) + 1;
  }

  return {
    _warning: [
      'HUMAN REVIEW REQUIRED before publishing any image.',
      'Verify license and attribution for each candidate.',
      'CC-BY and CC-BY-SA images REQUIRE displaying the attribution string.',
      'This file was generated by scripts/sources/product-images.mjs',
    ],
    generatedAt:    new Date().toISOString(),
    query,
    isDryRun:       isDryRun || false,
    sources:        sourceCounts,
    totalCandidates:candidates.length,
    candidates,
  };
}

async function persistManifest(manifest) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`\nManifest written → ${MANIFEST_PATH}`);
  console.log('Next step: open data/image-candidates.json, review each entry,');
  console.log('verify the license, display attribution as required, then approve.');
}

// ─── CLI entry point ──────────────────────────────────────────────────────────

// Detect whether this module is being run directly (not imported).
const isMain = process.argv[1] &&
  (process.argv[1].endsWith('product-images.mjs') ||
   new URL(import.meta.url).pathname === resolve(process.argv[1]));

if (isMain) {
  const opts = parseCli(process.argv);
  fetchImageCandidates(opts)
    .then(manifest => {
      console.log(`\nDone. ${manifest.totalCandidates} candidate(s) written to data/image-candidates.json`);
      process.exit(0);
    })
    .catch(err => {
      // Top-level safety net — the script MUST exit 0 even on unexpected errors
      // so it does not break CI or build pipelines.
      console.error('[fatal] Unexpected error (manifest may be incomplete):', err.message);
      process.exit(0); // intentional: exit 0 per spec (build-safe)
    });
}
