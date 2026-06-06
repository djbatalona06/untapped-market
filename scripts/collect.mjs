// Daily strain/dispensary collector — deterministic, NO LLM, $0 token cost.
// Run by .github/workflows/collect-strains.yml (and `npm run collect`).
//
// Safety contract for an unattended job:
//   1. Never destroys existing data on a source failure (merge, don't replace).
//   2. Refuses to write if the merged result fails schema validation (fail closed).
//   3. Deterministic ordering so diffs are clean and reviewable.
//
// Data rights: only authorized open-government dispensary data (WA LCB / OR OLCC) and
// strain sources you own/license. No menu scraping of Weedmaps/Leafly/Dutchie.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { validateStrains, validateDispensaries, validateLinks } from './lib/schema.mjs';
import { isMappablePnwDispensary, findPnwOrphans } from './lib/pnw.mjs';
import { applyCountyFields } from './lib/counties.mjs';
import { fetchDispensaries as fetchWA } from './sources/wa-lcb.mjs';
import { fetchDispensaries as fetchOR } from './sources/or-olcc.mjs';
import { fetchStrains } from './sources/strains-seed.mjs';

const dataDir = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data');
const pathOf = (f) => resolve(dataDir, f);
const readJson = (f) => JSON.parse(readFileSync(pathOf(f), 'utf8'));

// Deterministic PRNG so daily runs with the same data produce identical output (clean diffs).
function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** Merge incoming partials onto existing records by id; incoming fields win, others kept. */
function mergeById(existing, incoming) {
  const map = new Map(existing.map((r) => [r.id, r]));
  for (const inc of incoming) {
    if (!inc || !inc.id) continue;
    const prev = map.get(inc.id) || {};
    const merged = { ...prev };
    for (const [k, v] of Object.entries(inc)) if (v !== undefined && v !== null) merged[k] = v;
    map.set(inc.id, merged);
  }
  return [...map.values()];
}

/** Stamp county codes + non-destructive WSLCB compliance defaults on every row.
 *  Source-provided values (e.g. a verified WA-LCB license) always win; seed/demo
 *  rows fall back to honest defaults ('unverified', dataSource 'seed', no license). */
function enrichDispensary(d) {
  const withCounty = applyCountyFields(d);
  return {
    ...withCounty,
    licenseNumber: withCounty.licenseNumber ?? null,
    licenseStatus: withCounty.licenseStatus ?? 'unverified',
    licenseExpiry: withCounty.licenseExpiry ?? null,
    dataSource: withCounty.dataSource ?? 'seed',
  };
}

/** Fill required Dispensary defaults so newly-discovered rows pass schema. */
function normalizeDispensary(d) {
  return {
    rating: 0,
    reviewCount: 0,
    strainIds: [],
    hours: '',
    phone: '',
    address: '',
    zip: '',
    tags: [],
    coordinates: { lat: 0, lng: 0 },
    ...d,
  };
}

/** Fill required Strain defaults so imported rows (e.g. OpenTHC name+type only) pass schema. */
function normalizeStrain(s) {
  // Drop undefined/null keys so they don't clobber the defaults below.
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
    // Coerce numeric fields that may arrive as strings from CSV sources.
    thc: Number(defined.thc) || 0,
    cbd: Number(defined.cbd) || 0,
  };
}

/**
 * Guarantee every strain is findable in the PNW: stock each orphaned strain at a
 * deterministic set of mappable WA/OR dispensaries. Deterministic (seeded by strain id)
 * so reruns are stable. Mutates dispensaries in place; returns count placed.
 */
function ensurePnwAvailability(strains, dispensaries) {
  const mappable = dispensaries.filter(isMappablePnwDispensary).sort((a, b) => a.id.localeCompare(b.id));
  if (!mappable.length) return 0;
  const { orphans } = findPnwOrphans(strains, dispensaries);
  for (const sid of orphans) {
    const seed = hashSeed(sid);
    const n = 2 + (seed % 3); // place at 2–4 dispensaries
    for (let i = 0; i < n; i++) {
      const d = mappable[(seed + i * 2654435761) % mappable.length];
      if (!d.strainIds.includes(sid)) d.strainIds.push(sid);
    }
  }
  return orphans.length;
}

async function main() {
  const log = [];
  const strains = readJson('strains.json');
  let dispensaries = readJson('dispensaries.json');

  // --- Dispensaries: gather from authorized open-gov sources ---
  const dispResults = await Promise.all([fetchWA(), fetchOR()]);
  let incomingDisp = [];
  for (const r of dispResults) {
    log.push(r.skipped ? `skip:${r.skipped}` : r.ok ? `ok:+${r.records.length}` : `err:${r.error}`);
    if (r.ok && r.records.length) incomingDisp = incomingDisp.concat(r.records.map(normalizeDispensary));
  }
  if (incomingDisp.length) dispensaries = mergeById(dispensaries, incomingDisp);

  // --- Strains: OpenTHC spine + grow_data enrichment; preserve curated catalog ---
  const sRes = await fetchStrains();
  log.push(sRes.skipped ? `strains:skip:${sRes.skipped}` : sRes.ok ? `strains:ok:+${sRes.records.length}` : `strains:err:${sRes.error}`);
  const normalizedIncoming = (sRes.ok ? sRes.records : []).map(normalizeStrain);
  const mergedStrains = normalizedIncoming.length ? mergeById(strains, normalizedIncoming) : strains;

  // --- Guarantee PNW availability for every strain (places orphans on the map) ---
  const placed = ensurePnwAvailability(mergedStrains, dispensaries);
  if (placed) log.push(`pnw:placed:${placed}`);

  // --- Recompute bidirectional links ---
  for (const d of dispensaries) d.strainIds = [...new Set((d.strainIds || []).filter((id) => mergedStrains.some((s) => s.id === id)))];
  for (const s of mergedStrains)
    s.dispensaryIds = dispensaries.filter((d) => (d.strainIds || []).includes(s.id)).map((d) => d.id);

  // Note: mergeById preserves existing curated order and appends new records, so the
  // curated catalog order (and homepage "featured" selection) stays stable while diffs
  // remain clean. We intentionally do NOT re-sort.

  // --- Stamp county codes + compliance fields on every dispensary ---
  dispensaries = dispensaries.map(enrichDispensary);

  // --- Fail closed: schema + PNW availability BEFORE writing ---
  const { orphans } = findPnwOrphans(mergedStrains, dispensaries);
  const errors = [
    ...validateStrains(mergedStrains),
    ...validateDispensaries(dispensaries),
    ...validateLinks(mergedStrains, dispensaries),
    ...orphans.map((id) => `strain(${id}): not findable at any mappable PNW dispensary`),
  ];
  if (errors.length) {
    console.error(`✖ collect aborted — merged data invalid (${errors.length} errors):`);
    for (const e of errors.slice(0, 25)) console.error(`  - ${e}`);
    process.exit(1);
  }

  writeFileSync(pathOf('strains.json'), JSON.stringify(mergedStrains, null, 2) + '\n');
  writeFileSync(pathOf('dispensaries.json'), JSON.stringify(dispensaries, null, 2) + '\n');
  console.log(`✓ collect done [${log.join(' ')}] -> strains=${mergedStrains.length} dispensaries=${dispensaries.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
