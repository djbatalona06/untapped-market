// Kushy strain dataset source — parses the committed open cannabis dataset
// (data/sources/kushy-strains.*.csv) into normalized Strain partials.
//
// Data rights: the Kushy API dataset is an open, community-maintained cannabis
// strain dataset (kushy.net / github.com/kushyapp). It contains descriptive
// strain reference data only — names, types, effects, flavors, terpenes — not
// menus, prices, or copyrighted product photography. We use it as the seed
// "strain data sheet" for the catalog. No competitor menus are scraped.
//
// The raw cannabinoid columns in this export are unreliable (THC values like
// "127", lots of "0"/NULL), so we intentionally DO NOT trust them as lab
// percentages — imported strains carry thc/cbd = 0 ("unknown") and surface a
// graceful "—" in the UI rather than fabricated lab numbers.
//
// Zero dependencies. Deterministic. Safe to run offline.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const DEFAULT_CSV = resolve(here, '../../data/sources/kushy-strains.20171114.csv');

// ── CSV parsing ────────────────────────────────────────────────────────────
// Quote-aware splitter for a single CSV record. Handles "" escapes inside
// quoted fields and the bare literal `NULL` (and empty) → null. This export has
// no embedded newlines inside fields (verified: line count == record count), so
// line-based reading is safe.
function splitCsvLine(line) {
  const out = [];
  let i = 0;
  const n = line.length;
  while (i <= n) {
    if (i === n) {
      // trailing empty field at end of line
      break;
    }
    if (line[i] === '"') {
      // quoted field
      i++;
      let buf = '';
      while (i < n) {
        const c = line[i];
        if (c === '"') {
          if (line[i + 1] === '"') {
            buf += '"';
            i += 2;
            continue;
          }
          i++; // closing quote
          break;
        }
        buf += c;
        i++;
      }
      out.push(buf);
      // skip to next comma
      if (line[i] === ',') i++;
    } else {
      // bareword field (e.g. NULL or empty) until next comma
      let buf = '';
      while (i < n && line[i] !== ',') {
        buf += line[i];
        i++;
      }
      if (line[i] === ',') i++;
      const trimmed = buf.trim();
      out.push(trimmed === 'NULL' || trimmed === '' ? null : trimmed);
    }
  }
  return out;
}

export function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (!lines.length) return [];
  const header = splitCsvLine(lines[0]).map((h) => (h == null ? '' : String(h)));
  const rows = [];
  for (let r = 1; r < lines.length; r++) {
    const cells = splitCsvLine(lines[r]);
    const obj = {};
    for (let c = 0; c < header.length; c++) obj[header[c]] = cells[c] ?? null;
    rows.push(obj);
  }
  return rows;
}

// ── Normalization helpers ──────────────────────────────────────────────────
export function slugify(name) {
  return String(name)
    .toLowerCase()
    .replace(/&amp;/g, 'and')
    .replace(/['’.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stripHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#0?39;|&rsquo;|&apos;/g, '’')
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function mapType(raw) {
  const t = String(raw || '').toLowerCase();
  if (t.includes('sativa')) return 'sativa';
  if (t.includes('indica')) return 'indica';
  return 'hybrid';
}

// Tokens in the Kushy "effects" column that are adverse effects, not desirable
// ones — we keep only positive effects on the card.
const ADVERSE = new Set([
  'dry mouth', 'dry eyes', 'paranoid', 'anxious', 'dizzy', 'headache',
  'couch lock', 'couchlock', 'cottonmouth',
]);

function splitList(raw) {
  if (!raw) return [];
  return [...new Set(
    String(raw)
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
  )];
}

// Light terpene → effect lookup so imported terpene pills carry a sensible mood.
const TERP_EFFECT = {
  Myrcene: 'Relaxing',
  Limonene: 'Uplifting',
  Caryophyllene: 'Anti-inflammatory',
  Pinene: 'Alertness',
  Linalool: 'Calming',
  Humulene: 'Appetite-suppressant',
  Terpinolene: 'Uplifting',
  Ocimene: 'Energizing',
  Terpineol: 'Relaxing',
  Bisabolol: 'Soothing',
  Valencene: 'Uplifting',
  Geraniol: 'Calming',
  Nerolidol: 'Relaxing',
  Camphene: 'Earthy',
  Borneol: 'Calming',
};

const PALETTE = { sativa: '#d4a853', indica: '#8b6fb8', hybrid: '#7cb87a' };

const TYPE_WORD = { sativa: 'sativa-forward', indica: 'indica-dominant', hybrid: 'balanced hybrid' };

// Compose an honest, derived blurb from the strain's OWN tags when the source
// has no editorial description. This invents no facts — it just reads back the
// effects/flavors/terpenes already on the record. No medical or dosage claims.
function synthDescription({ name, type, effects, flavors, terpenes }) {
  const word = TYPE_WORD[type];
  const article = /^[aeiou]/i.test(word) ? 'an' : 'a';
  const parts = [`${name} is ${article} ${word} cultivar`];
  if (effects.length) {
    const top = effects.slice(0, 3).map((e) => e.toLowerCase());
    parts.push(`enthusiasts reach for when chasing ${top.join(', ')} moods`);
  } else {
    parts.push('catalogued from the open community strain dataset');
  }
  let s = parts.join(' ') + '.';
  if (flavors.length) {
    s += ` Expect ${flavors.slice(0, 3).map((f) => f.toLowerCase()).join(', ')} notes on the palate`;
    if (terpenes.length) s += `, led by ${terpenes[0].name} terpenes.`;
    else s += '.';
  } else if (terpenes.length) {
    s += ` Led by ${terpenes[0].name} terpenes.`;
  }
  return s;
}

/**
 * Parse + normalize the Kushy CSV into Strain-shaped partials.
 * Returns { ok, records, total } where records are catalog-ready (minus
 * dispensary placement, which the importer adds via PNW availability rules).
 *
 * @param {{ csvPath?: string }} [opts]
 */
export function fetchStrains(opts = {}) {
  const csvPath = opts.csvPath || DEFAULT_CSV;
  let text;
  try {
    text = readFileSync(csvPath, 'utf8');
  } catch (e) {
    return { ok: false, error: `cannot read ${csvPath}: ${e.message}`, records: [] };
  }

  const rows = parseCsv(text);

  // Build an id → name map so the `crosses` column (numeric parent ids) can be
  // resolved into a human-readable lineage.
  const idToName = new Map();
  for (const row of rows) if (row.id && row.name) idToName.set(String(row.id), stripHtml(row.name));

  const records = [];
  for (const row of rows) {
    const name = stripHtml(row.name);
    if (!name) continue;
    const type = mapType(row.type);

    const effects = splitList(row.effects).filter((e) => !ADVERSE.has(e.toLowerCase()));
    const flavors = splitList(row.flavor);
    const terpenes = splitList(row.terpenes).map((tname) => ({
      name: tname,
      pct: 0, // unreliable in source; UI shows the name pill only
      effect: TERP_EFFECT[tname] || '',
    }));

    // Resolve lineage from `crosses` (comma-separated parent ids).
    const crossIds = splitList(row.crosses).filter((x) => x !== '0');
    const parents = crossIds.map((cid) => idToName.get(cid)).filter(Boolean);
    const lineage = {
      mother: parents[0] || (row.breeder && row.breeder !== 'Unknown Breeder' ? null : null) || null,
      father: parents[1] || null,
    };

    const sourceDesc = stripHtml(row.description);
    const description =
      sourceDesc && sourceDesc.length > 20
        ? sourceDesc
        : synthDescription({ name, type, effects, flavors, terpenes });

    records.push({
      id: slugify(name),
      name,
      type,
      // Cannabinoid numbers in this export are not trustworthy → treat as unknown.
      thc: 0,
      cbd: 0,
      chemotype: 'Unknown',
      description,
      terpenes,
      effects,
      flavors,
      lineage,
      labData: { lab: 'Kushy (community dataset)', date: '', cannabinoids: [] },
      dispensaryIds: [],
      likeCount: 0,
      color: PALETTE[type],
    });
  }

  return { ok: true, records, total: records.length };
}
