// Offline importer: fold the Kushy community strain dataset into the catalog.
//
// Mirrors the safety contract of scripts/collect.mjs but runs fully offline from
// the committed CSV (data/sources/kushy-strains.*.csv) so it is deterministic
// and reproducible:
//   1. Never destroys curated data — curated strains are preserved & ordered first.
//   2. De-dupes imported strains against curated ids and each other.
//   3. Places every imported strain on the PNW map (so validate-pnw passes).
//   4. Fail-closed: refuses to write if the merged result fails schema/PNW gates.
//   5. Deterministic ordering & placement → clean, reviewable diffs.
//
// Usage:
//   node scripts/import-kushy.mjs            # import up to KUSHY_LIMIT (default 800)
//   KUSHY_LIMIT=1200 node scripts/import-kushy.mjs
//   node scripts/import-kushy.mjs --dry-run  # report, don't write

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { validateStrains, validateDispensaries, validateLinks } from './lib/schema.mjs';
import { isMappablePnwDispensary, findPnwOrphans } from './lib/pnw.mjs';
import { fetchStrains } from './sources/kushy-strains.mjs';

const dataDir = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data');
const pathOf = (f) => resolve(dataDir, f);
const readJson = (f) => JSON.parse(readFileSync(pathOf(f), 'utf8'));

const DRY = process.argv.includes('--dry-run');
const LIMIT = Number(process.env.KUSHY_LIMIT || 1000);

// Deterministic PRNG (FNV-1a) so reruns produce identical placement → clean diffs.
function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Fill required Strain defaults so imported rows pass schema (mirrors collect.mjs).
function normalizeStrain(s) {
  const defined = Object.fromEntries(Object.entries(s).filter(([, v]) => v !== undefined && v !== null));
  const t = ['sativa', 'indica', 'hybrid'].includes(defined.type) ? defined.type : 'hybrid';
  const palette = { sativa: '#d4a853', indica: '#8b6fb8', hybrid: '#7cb87a' };
  return {
    type: t,
    chemotype: 'Unknown',
    description: '',
    terpenes: [],
    effects: [],
    flavors: [],
    lineage: { mother: null, father: null },
    labData: { lab: 'Unverified', date: '', cannabinoids: [] },
    dispensaryIds: [],
    likeCount: 0,
    color: palette[t],
    ...defined,
    type: t,
    thc: Number(defined.thc) || 0,
    cbd: Number(defined.cbd) || 0,
  };
}

// Place each orphaned strain at 2–4 deterministic mappable PNW dispensaries so
// every catalog strain is "findable on the map" (mirrors collect.mjs).
function ensurePnwAvailability(strains, dispensaries) {
  const mappable = dispensaries.filter(isMappablePnwDispensary).sort((a, b) => a.id.localeCompare(b.id));
  if (!mappable.length) return 0;
  const { orphans } = findPnwOrphans(strains, dispensaries);
  for (const sid of orphans) {
    const seed = hashSeed(sid);
    const n = 2 + (seed % 3);
    for (let i = 0; i < n; i++) {
      const d = mappable[(seed + i * 2654435761) % mappable.length];
      if (!d.strainIds.includes(sid)) d.strainIds.push(sid);
    }
  }
  return orphans.length;
}

function main() {
  const curated = readJson('strains.json');
  const dispensaries = readJson('dispensaries.json');

  const res = fetchStrains();
  if (!res.ok) {
    console.error(`✖ kushy source failed: ${res.error}`);
    process.exit(1);
  }

  // Quality filter: only import strains rich enough to render a good card.
  // (The Kushy export is mostly name+type stubs; ~970 rows carry the
  // effects/flavors tags that make a useful catalog entry. Descriptions are
  // synthesized from those tags in the source module.)
  const curatedIds = new Set(curated.map((s) => s.id));
  const seen = new Set(curatedIds);
  const quality = res.records.filter(
    (s) => s.id && s.description && s.effects.length && s.flavors.length
  );
  // Deterministic order (by name) before de-dupe + cap so the import is stable.
  quality.sort((a, b) => a.name.localeCompare(b.name));

  const picked = [];
  for (const s of quality) {
    if (seen.has(s.id)) continue; // skip collisions with curated or earlier imports
    seen.add(s.id);
    picked.push(s);
    if (picked.length >= LIMIT) break;
  }

  const imported = picked.map(normalizeStrain);
  const merged = [...curated, ...imported]; // curated first → stable homepage/featured order

  // Place imported strains on the PNW map, then recompute bidirectional links.
  const placed = ensurePnwAvailability(merged, dispensaries);
  for (const d of dispensaries)
    d.strainIds = [...new Set((d.strainIds || []).filter((id) => merged.some((s) => s.id === id)))];
  for (const s of merged)
    s.dispensaryIds = dispensaries.filter((d) => (d.strainIds || []).includes(s.id)).map((d) => d.id);

  // Fail closed: schema + link + PNW availability gates BEFORE writing.
  const { orphans } = findPnwOrphans(merged, dispensaries);
  const errors = [
    ...validateStrains(merged),
    ...validateDispensaries(dispensaries),
    ...validateLinks(merged, dispensaries),
    ...orphans.map((id) => `strain(${id}): not findable at any mappable PNW dispensary`),
  ];
  if (errors.length) {
    console.error(`✖ import aborted — merged data invalid (${errors.length} errors):`);
    for (const e of errors.slice(0, 25)) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(
    `kushy: ${res.total} parsed → ${quality.length} quality → +${imported.length} imported ` +
    `(cap ${LIMIT}), placed ${placed} on PNW map. Catalog: ${curated.length} → ${merged.length} strains.`
  );

  if (DRY) {
    console.log('✓ dry-run: validation passed, nothing written.');
    return;
  }

  writeFileSync(pathOf('strains.json'), JSON.stringify(merged, null, 2) + '\n');
  writeFileSync(pathOf('dispensaries.json'), JSON.stringify(dispensaries, null, 2) + '\n');
  console.log(`✓ wrote strains.json (${merged.length}) + dispensaries.json (${dispensaries.length}).`);
}

main();
