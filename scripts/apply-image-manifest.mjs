#!/usr/bin/env node
/**
 * scripts/apply-image-manifest.mjs
 *
 * Wires committed strain hero images into src/data/strains.json by setting
 * `imageUrl: "/img/strains/<id>.<ext>"` on each matching strain entry.
 *
 * TWO discovery strategies (both run, results merged, file-on-disk wins):
 *   1. Scan public/img/strains/ for <id>.(png|jpg|webp) files.
 *   2. Read data/strain-image-manifest.json (if it exists) for manifest entries
 *      whose "file" path also exists on disk.
 *
 * The script is IDEMPOTENT — re-running it never corrupts data and is safe to
 * include in a CI pre-commit hook.  It only sets imageUrl; it never removes or
 * changes any other field.
 *
 * Flags:
 *   --dry-run    Report what WOULD change without writing strains.json.
 *   --verbose    Print every strain checked, not just changed ones.
 *   --help       Show usage.
 *
 * Node 18+ ESM, zero external dependencies.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve, join, extname, basename } from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// Repo root (relative to this script's location)
// ─────────────────────────────────────────────────────────────────────────────

const __dirname = new URL('.', import.meta.url).pathname;
const REPO_ROOT = resolve(__dirname, '..');

const STRAINS_JSON_PATH = join(REPO_ROOT, 'src', 'data', 'strains.json');
const MANIFEST_PATH = join(REPO_ROOT, 'data', 'strain-image-manifest.json');
const IMAGES_DIR = join(REPO_ROOT, 'public', 'img', 'strains');

const SUPPORTED_EXTS = new Set(['.png', '.jpg', '.webp']);

// ─────────────────────────────────────────────────────────────────────────────
// Parse CLI args
// ─────────────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = { dryRun: false, verbose: false };
  for (const a of args) {
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--verbose') opts.verbose = true;
    else if (a === '--help' || a === '-h') {
      printUsage();
      process.exit(0);
    } else {
      console.error(`ERROR: Unknown argument "${a}"`);
      printUsage();
      process.exit(1);
    }
  }
  return opts;
}

function printUsage() {
  console.log(`
Usage: node scripts/apply-image-manifest.mjs [options]

Options:
  --dry-run   Report what WOULD change without writing strains.json
  --verbose   Print every strain checked, not just the changed ones
  --help      Show this help

What it does:
  1. Scans public/img/strains/ for <id>.(png|jpg|webp) files.
  2. Reads data/strain-image-manifest.json (if present) for entries
     whose file also exists on disk.
  3. Sets imageUrl: "/img/strains/<id>.<ext>" on matching strains in
     src/data/strains.json.
  4. Prints a summary: set / updated / unchanged / warnings.
`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Load and validate JSON file
// ─────────────────────────────────────────────────────────────────────────────

function loadJSON(filePath, label) {
  try {
    const raw = readFileSync(filePath, 'utf8');
    try {
      return JSON.parse(raw);
    } catch (parseErr) {
      console.error(`ERROR: ${label} is not valid JSON: ${parseErr.message}`);
      process.exit(1);
    }
  } catch (readErr) {
    if (readErr.code === 'ENOENT') return null; // file absent — caller handles
    console.error(`ERROR: Cannot read ${label}: ${readErr.message}`);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Discover images: map strainId → { ext, src }
// ─────────────────────────────────────────────────────────────────────────────

function discoverImages(verbose) {
  /** @type {Map<string, { ext: string, src: 'filesystem' | 'manifest' }>} */
  const found = new Map();

  // Strategy 1: scan filesystem
  if (existsSync(IMAGES_DIR)) {
    let entries;
    try {
      entries = readdirSync(IMAGES_DIR);
    } catch (err) {
      console.error(`WARN: Cannot read ${IMAGES_DIR}: ${err.message}`);
      entries = [];
    }
    for (const filename of entries) {
      const ext = extname(filename).toLowerCase();
      if (!SUPPORTED_EXTS.has(ext)) continue;
      const strainId = basename(filename, ext);
      if (!strainId) continue;
      // Filesystem entry wins over manifest entry
      found.set(strainId, { ext: ext.slice(1), src: 'filesystem' });
      if (verbose) console.log(`  [filesystem] Found image: ${filename} → strainId="${strainId}"`);
    }
  } else {
    if (verbose) console.log(`  [filesystem] Directory not found: ${IMAGES_DIR} — skipping scan.`);
  }

  // Strategy 2: read manifest (file existence still required)
  const manifest = loadJSON(MANIFEST_PATH, 'data/strain-image-manifest.json');
  if (manifest !== null) {
    const entries = Array.isArray(manifest) ? manifest : (manifest.entries || []);
    if (!Array.isArray(entries)) {
      console.error('WARN: Manifest "entries" field is not an array — skipping manifest strategy.');
    } else {
      for (const entry of entries) {
        if (!entry || typeof entry !== 'object') continue;
        const { strainId, file } = entry;
        if (!strainId || !file) {
          console.warn(`WARN: Manifest entry missing strainId or file — skipping: ${JSON.stringify(entry)}`);
          continue;
        }
        // Resolve file relative to REPO_ROOT
        const absFile = resolve(REPO_ROOT, file);
        if (!existsSync(absFile)) {
          console.warn(`WARN: Manifest entry "${strainId}" references missing file "${file}" — skipping.`);
          continue;
        }
        const ext = extname(file).toLowerCase().slice(1);
        if (!SUPPORTED_EXTS.has('.' + ext)) {
          console.warn(`WARN: Manifest entry "${strainId}" has unsupported extension ".${ext}" — skipping.`);
          continue;
        }
        // Only set from manifest if filesystem didn't already find it
        if (!found.has(strainId)) {
          found.set(strainId, { ext, src: 'manifest' });
          if (verbose) console.log(`  [manifest]   Found image entry: strainId="${strainId}" file="${file}"`);
        }
      }
    }
  } else {
    if (verbose) console.log('  [manifest]   data/strain-image-manifest.json not found — skipping manifest strategy.');
  }

  return found;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  const opts = parseArgs(process.argv);

  console.log('\n' + '═'.repeat(64));
  console.log('apply-image-manifest — Untapped Market');
  console.log(opts.dryRun ? 'Mode: DRY RUN (no files will be written)' : 'Mode: APPLY');
  console.log('═'.repeat(64) + '\n');

  // ── 1. Load strains.json (with pre-parse validation) ──────────────────────
  const strainsRaw = (() => {
    try {
      return readFileSync(STRAINS_JSON_PATH, 'utf8');
    } catch (err) {
      console.error(`ERROR: Cannot read ${STRAINS_JSON_PATH}: ${err.message}`);
      process.exit(1);
    }
  })();

  let strains;
  try {
    strains = JSON.parse(strainsRaw);
  } catch (err) {
    console.error(`ERROR: src/data/strains.json is not valid JSON (pre-write check): ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(strains)) {
    console.error('ERROR: src/data/strains.json must be a JSON array.');
    process.exit(1);
  }

  console.log(`Loaded ${strains.length} strains from src/data/strains.json`);

  // ── 2. Discover available images ─────────────────────────────────────────
  if (opts.verbose) console.log('\nDiscovering images:');
  const imageMap = discoverImages(opts.verbose);
  console.log(`Discovered ${imageMap.size} image file(s) for strain IDs: ${[...imageMap.keys()].join(', ') || '(none)'}\n`);

  // ── 3. Build set of valid strain IDs for fast lookup ─────────────────────
  const strainIdSet = new Set(strains.map((s) => s.id));

  // Warn about image files whose ID doesn't match any strain
  for (const [id] of imageMap) {
    if (!strainIdSet.has(id)) {
      console.warn(`WARN: Image found for "${id}" but no matching strain in strains.json — skipping.`);
    }
  }

  // ── 4. Apply imageUrl updates ─────────────────────────────────────────────
  let countSet = 0;
  let countUpdated = 0;
  let countUnchanged = 0;
  let countNoImage = 0;

  const updated = strains.map((strain) => {
    const imageInfo = imageMap.get(strain.id);

    if (!imageInfo) {
      countNoImage++;
      if (opts.verbose) console.log(`  [skip]      ${strain.id} — no image found`);
      return strain; // no change
    }

    const desiredUrl = `/img/strains/${strain.id}.${imageInfo.ext}`;

    if (!strain.imageUrl) {
      countSet++;
      if (opts.verbose || opts.dryRun) {
        console.log(`  [SET]       ${strain.id} → imageUrl = "${desiredUrl}" (from ${imageInfo.src})`);
      }
      return { ...strain, imageUrl: desiredUrl };
    }

    if (strain.imageUrl !== desiredUrl) {
      countUpdated++;
      if (opts.verbose || opts.dryRun) {
        console.log(`  [UPDATE]    ${strain.id}: "${strain.imageUrl}" → "${desiredUrl}" (from ${imageInfo.src})`);
      }
      return { ...strain, imageUrl: desiredUrl };
    }

    countUnchanged++;
    if (opts.verbose) console.log(`  [unchanged] ${strain.id} — imageUrl already "${strain.imageUrl}"`);
    return strain;
  });

  // ── 5. Print summary ──────────────────────────────────────────────────────
  console.log('\nSummary:');
  console.log(`  imageUrl SET (new)          : ${countSet}`);
  console.log(`  imageUrl UPDATED (changed)  : ${countUpdated}`);
  console.log(`  imageUrl UNCHANGED          : ${countUnchanged}`);
  console.log(`  Strains with no image found : ${countNoImage}`);

  const totalChanges = countSet + countUpdated;

  if (totalChanges === 0) {
    console.log('\nNothing to do — strains.json is already up to date.');
    return;
  }

  if (opts.dryRun) {
    console.log(`\nDRY RUN: Would write ${totalChanges} change(s) to src/data/strains.json`);
    console.log('Re-run without --dry-run to apply changes.');
    return;
  }

  // ── 6. Serialize with 2-space indent + trailing newline (matches repo) ────
  const newJson = JSON.stringify(updated, null, 2) + '\n';

  // Post-write parse validation (sanity check before writing)
  try {
    JSON.parse(newJson);
  } catch (err) {
    console.error(`ERROR: Serialized JSON failed validation (this is a bug): ${err.message}`);
    process.exit(1);
  }

  // ── 7. Write ──────────────────────────────────────────────────────────────
  try {
    writeFileSync(STRAINS_JSON_PATH, newJson, 'utf8');
  } catch (err) {
    console.error(`ERROR: Could not write ${STRAINS_JSON_PATH}: ${err.message}`);
    process.exit(1);
  }

  console.log(`\nWrote ${totalChanges} change(s) to src/data/strains.json`);
  console.log('\nNext steps:');
  console.log('  git add public/img/strains/ data/strain-image-manifest.json src/data/strains.json');
  console.log('  git commit -m "feat(images): add AI-generated strain hero images"\n');
}

main();
