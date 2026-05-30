// Source adapter: strain catalog.
//
// Strain data is the part with the trickiest data rights — most strain encyclopedias
// (Leafly, Weedmaps, etc.) forbid scraping in their ToS. So by default this adapter is
// a NO-OP that preserves the curated catalog already in strains.json.
//
// To add an AUTHORIZED source (a dataset you own or have a license/API for), set
// STRAINS_DATA_URL to a JSON endpoint returning records in (or near) the Strain shape.
// Records are merged by `id`; see scripts/collect.mjs for merge semantics.
//
// Returns: { ok, records: Array<Partial<Strain>> }

export async function fetchStrains() {
  const url = process.env.STRAINS_DATA_URL;
  if (!url) return { ok: true, skipped: 'STRAINS_DATA_URL unset (curated catalog preserved)', records: [] };
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, records: [] };
    const rows = await res.json();
    const records = (Array.isArray(rows) ? rows : []).filter((r) => r && r.id && r.name);
    return { ok: true, records };
  } catch (e) {
    return { ok: false, error: e.message, records: [] };
  }
}
