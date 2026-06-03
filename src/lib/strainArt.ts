import type { Strain } from '../types';

// ── Deterministic per-strain artwork ────────────────────────────────────────
// Every strain card used to fall back to a single shared photo
// (/img/hero-product.jpg) whenever no Supabase media and no bundled imageUrl
// existed. With an empty `strain_media` table and zero imageUrls in the
// catalog that meant *every* strain — most visibly the AI-match results —
// rendered the same image, which reads as a broken / unloaded photo.
//
// This builds a distinct, on-brand SVG for each strain from its own
// type + color + name and returns it as a data URI so it drops straight into a
// CSS background. Pure function, no network, no deps — covers all 991 strains
// and can never 404.

const TYPE_HUE: Record<Strain['type'], number> = {
  sativa: 96, // green
  indica: 286, // violet
  hybrid: 34, // amber
};

/** FNV-1a — small, fast, deterministic string hash. */
function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function xmlEscape(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;'
  );
}

/** First letters of up to two words — the strain's monogram. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const chars = parts.slice(0, 2).map((w) => w[0]);
  return (chars.join('') || name.slice(0, 2) || '·').toUpperCase();
}

function isCbdLeaning(strain: Strain): boolean {
  const c = strain.chemotype ?? '';
  return c.startsWith('Type II') || c.startsWith('Type III') || strain.cbd >= 5;
}

/** Build the raw SVG markup for a strain's generated cover art. */
export function strainArtSvg(strain: Strain): string {
  const seed = fnv1a(strain.id || strain.name || 'strain');
  const baseHue = (isCbdLeaning(strain) ? 188 : TYPE_HUE[strain.type] ?? 120) + ((seed % 36) - 18);
  const h1 = (baseHue + 360) % 360;
  const h2 = (h1 + 22) % 360;
  const h3 = (h1 + 340) % 360;
  const c1 = `hsl(${h1} 48% 30%)`;
  const c2 = `hsl(${h2} 58% 16%)`;
  const c3 = `hsl(${h3} 40% 9%)`;
  const glow = `hsl(${h2} 72% 62%)`;
  const accent = strain.color || `hsl(${h1} 70% 60%)`;
  const mono = xmlEscape(initials(strain.name));

  // Deterministic "trichome frost" bokeh seeded from the strain id.
  let s = seed;
  const rnd = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
  const dots: string[] = [];
  for (let i = 0; i < 7; i++) {
    const cx = Math.round(rnd() * 320);
    const cy = Math.round(rnd() * 200);
    const r = Math.round(6 + rnd() * 26);
    const o = (0.05 + rnd() * 0.14).toFixed(2);
    dots.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${glow}" opacity="${o}"/>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200">\
<defs>\
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">\
<stop offset="0" stop-color="${c1}"/>\
<stop offset="0.55" stop-color="${c2}"/>\
<stop offset="1" stop-color="${c3}"/>\
</linearGradient>\
<radialGradient id="r" cx="0.28" cy="0.2" r="0.9">\
<stop offset="0" stop-color="${glow}" stop-opacity="0.45"/>\
<stop offset="1" stop-color="${glow}" stop-opacity="0"/>\
</radialGradient>\
</defs>\
<rect width="320" height="200" fill="url(#g)"/>\
<rect width="320" height="200" fill="url(#r)"/>\
${dots.join('')}\
<text x="50%" y="55%" text-anchor="middle" font-family="Georgia,'DM Serif Display',serif" font-size="92" font-weight="700" fill="#ffffff" fill-opacity="0.10">${mono}</text>\
<circle cx="286" cy="34" r="9" fill="${accent}" opacity="0.85"/>\
</svg>`;
}

/** A CSS-ready `data:` URI of the strain's generated cover art. */
export function strainArtDataUri(strain: Strain): string {
  return `data:image/svg+xml,${encodeURIComponent(strainArtSvg(strain))}`;
}

/**
 * Resolve the best available cover image for a strain:
 * approved Supabase media → bundled imageUrl → generated art (never empty).
 */
export function resolveStrainImage(strain: Strain, mediaUrl?: string): string {
  return mediaUrl || strain.imageUrl || strainArtDataUri(strain);
}
