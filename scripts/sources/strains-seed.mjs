// Strain catalog sources — deterministic, no LLM, fetch-safe public datasets.
//
// Spine:   OpenTHC VDB    — canonical name + type + stable UUID. GPL-3.0, public bulk
//                           download built for integration. No API key.
//          https://vdb.openthc.org/download/strains.json  -> [{id,name,stub,type}]
// Enrich:  grow_data       — THC/CBD + sativa/indica split + blurb. MIT-licensed CSV.
//          raw.githubusercontent.com/Shannon-Goddard/grow_data/main/Resources/csv/ALL_data.csv
//
// seedfinder.eu is intentionally NOT used: its API was discontinued 2024-07 and scraping
// is discouraged. No fetch-safe lineage/terpene source exists, so those fields are left
// to the curated catalog already in strains.json (merge-by-id preserves them).
//
// Override either URL via env (OPENTHC_VDB_URL / GROW_DATA_CSV_URL); set to "off" to skip.

const OPENTHC_DEFAULT = 'https://vdb.openthc.org/download/strains.json';
const GROWDATA_DEFAULT =
  'https://raw.githubusercontent.com/Shannon-Goddard/grow_data/main/Resources/csv/ALL_data.csv';

const slug = (s) => String(s || '')
  .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const stripHtml = (s) => String(s || '').replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
const firstNum = (s) => { const m = String(s).match(/(\d+(\.\d+)?)/); return m ? Number(m[1]) : undefined; };

const normType = (t) => {
  const v = String(t || '').toLowerCase();
  if (v.startsWith('sat')) return 'sativa';
  if (v.startsWith('ind')) return 'indica';
  return 'hybrid';
};

/** Minimal RFC-4180-ish CSV parser (handles quoted fields + embedded commas/quotes). */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      accept: 'text/csv,application/json,*/*',
      'user-agent': 'untapped-market-collector/1.0 (+https://github.com/djbatalona06/untapped-market)',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

export async function fetchStrains() {
  const openthcUrl = process.env.OPENTHC_VDB_URL ?? OPENTHC_DEFAULT;
  const growUrl = process.env.GROW_DATA_CSV_URL ?? GROWDATA_DEFAULT;
  const log = [];

  // Allow an explicit opt-out (and keep prior STRAINS_DATA_URL escape hatch).
  if (process.env.STRAINS_DATA_URL === 'off' || (openthcUrl === 'off' && growUrl === 'off')) {
    return { ok: true, skipped: 'strain sources disabled (curated catalog preserved)', records: [] };
  }

  // --- grow_data enrichment, keyed by slug(name) ---
  const enrich = new Map();
  if (growUrl && growUrl !== 'off') {
    try {
      const rows = parseCsv(await fetchText(growUrl));
      const header = (rows[0] || []).map((h) => h.trim().toLowerCase());
      const col = (n) => header.indexOf(n);
      const ci = { name: col('strain'), thc: col('thc'), cbd: col('cbd'), sativa: col('sativa'), indica: col('indica'), info: col('info') };
      for (const r of rows.slice(1)) {
        const name = r[ci.name];
        if (!name) continue;
        const sat = ci.sativa >= 0 ? firstNum(stripHtml(r[ci.sativa])) : undefined;
        const ind = ci.indica >= 0 ? firstNum(stripHtml(r[ci.indica])) : undefined;
        let type;
        if (sat != null && ind != null) type = sat > ind + 10 ? 'sativa' : ind > sat + 10 ? 'indica' : 'hybrid';
        enrich.set(slug(name), {
          thc: ci.thc >= 0 ? firstNum(stripHtml(r[ci.thc])) : undefined,
          cbd: ci.cbd >= 0 ? firstNum(stripHtml(r[ci.cbd])) : undefined,
          description: ci.info >= 0 ? stripHtml(r[ci.info]).slice(0, 400) || undefined : undefined,
          type,
        });
      }
      log.push(`grow_data:${enrich.size}`);
    } catch (e) { log.push(`grow_data:err:${e.message}`); }
  }

  // --- OpenTHC VDB spine ---
  const records = [];
  if (openthcUrl && openthcUrl !== 'off') {
    try {
      const raw = JSON.parse(await fetchText(openthcUrl));
      const list = Array.isArray(raw) ? raw : raw.data || [];
      for (const v of list) {
        if (!v || !v.name) continue;
        const id = `strain-${slug(v.stub || v.name)}`;
        const e = enrich.get(slug(v.name)) || {};
        records.push({
          id,
          name: v.name,
          type: e.type || normType(v.type),
          thc: e.thc,
          cbd: e.cbd,
          description: e.description,
        });
      }
      log.push(`openthc:${records.length}`);
    } catch (e) { log.push(`openthc:err:${e.message}`); }
  }

  if (!records.length) return { ok: true, skipped: log.join(' ') || 'no records', records: [] };
  return { ok: true, records, note: log.join(' ') };
}
