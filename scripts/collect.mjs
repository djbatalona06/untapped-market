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
import { fetchDispensaries as fetchWA } from './sources/wa-lcb.mjs';
import { fetchDispensaries as fetchOR } from './sources/or-olcc.mjs';
import { fetchStrains } from './sources/strains-seed.mjs';

const dataDir = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data');
const pathOf = (f) => resolve(dataDir, f);
const readJson = (f) => JSON.parse(readFileSync(pathOf(f), 'utf8'));

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

  // --- Strains: authorized source only; otherwise preserve curated catalog ---
  const sRes = await fetchStrains();
  log.push(sRes.skipped ? `strains:skip:${sRes.skipped}` : sRes.ok ? `strains:ok:+${sRes.records.length}` : `strains:err:${sRes.error}`);
  const mergedStrains = sRes.ok && sRes.records.length ? mergeById(strains, sRes.records) : strains;

  // --- Recompute bidirectional links ---
  const dIds = new Set(dispensaries.map((d) => d.id));
  for (const d of dispensaries) d.strainIds = [...new Set((d.strainIds || []).filter((id) => mergedStrains.some((s) => s.id === id)))];
  for (const s of mergedStrains)
    s.dispensaryIds = dispensaries.filter((d) => (d.strainIds || []).includes(s.id)).map((d) => d.id);

  // Note: mergeById preserves existing curated order and appends new records, so the
  // curated catalog order (and homepage "featured" selection) stays stable while diffs
  // remain clean. We intentionally do NOT re-sort.
  void dIds;

  // --- Fail closed: validate BEFORE writing ---
  const errors = [
    ...validateStrains(mergedStrains),
    ...validateDispensaries(dispensaries),
    ...validateLinks(mergedStrains, dispensaries),
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
