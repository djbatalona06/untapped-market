import type { Strain } from '../types';
import { STRAINS } from '../data/strains';

// ──────────────────────────────────────────────────────────────────────────
// Phase B — AI photo prompt library.
//
// Hardcoded, reproducible prompts for generating strain hero imagery on
// Higgsfield / Nano Banana / Runway / Sora / Pika / Midjourney / Flux /
// Ideogram. The Claude generation workflow (CLAUDE_AI_GENERATION_WORKFLOW.md)
// reads these, produces images, and deposits the resulting URLs through the
// admin upload flow (status = pending → reviewed by a human).
//
// Pure data + string builders only — safe to import anywhere in the app.
// ──────────────────────────────────────────────────────────────────────────

export type ImageModel =
  | 'higgsfield'
  | 'nano-banana'
  | 'runway'
  | 'sora'
  | 'pika'
  | 'midjourney'
  | 'flux'
  | 'ideogram';

export interface PhotoStyle {
  /** Short id used in filenames and the `ai_model`/style metadata. */
  id: string;
  label: string;
  /** Appended to every prompt for this style. */
  modifiers: string;
}

/** The house look: editorial, biophilic, Pacific-Northwest cannabis macro. */
export const HOUSE_STYLE = [
  'editorial product photography',
  'extreme macro of a cannabis flower',
  'frosted trichomes catching warm rim light',
  'shallow depth of field, crisp focus on the bud',
  'Pacific Northwest mood — soft evergreen bokeh, misty atmosphere',
  'amber and moss color grade, deep near-black background (#07090a)',
  'no text, no watermark, no packaging, photoreal, 4k',
].join(', ');

export const STYLE_PRESETS: PhotoStyle[] = [
  { id: 'hero-macro', label: 'Hero macro', modifiers: 'centered hero composition, 4:5 portrait' },
  { id: 'trichome', label: 'Trichome close-up', modifiers: 'microscope-level trichome detail, dewy resin glands' },
  { id: 'ambient', label: 'Ambient scene', modifiers: 'bud resting on wet basalt stone, fog, cinematic wide' },
];

const TYPE_CUES: Record<Strain['type'], string> = {
  sativa: 'bright energetic palette, lighter green sugar leaves, airy structure',
  indica: 'dense chunky nugs, deep purple and forest-green hues, resinous',
  hybrid: 'balanced structure, blended green-to-amber tones',
};

/** Build a single prompt string for a strain in a given style. */
export function buildStrainPrompt(strain: Strain, style: PhotoStyle = STYLE_PRESETS[0]): string {
  const terps = strain.terpenes.slice(0, 3).map((t) => t.name).join(', ');
  const flavors = strain.flavors.slice(0, 3).join(', ');
  return [
    `${strain.name} — a ${strain.type} cannabis strain`,
    HOUSE_STYLE,
    TYPE_CUES[strain.type],
    terps ? `terpene mood: ${terps}` : '',
    flavors ? `evokes flavors of ${flavors}` : '',
    style.modifiers,
  ]
    .filter(Boolean)
    .join(', ');
}

export interface StrainPromptSet {
  strainId: string;
  strainName: string;
  /** Suggested object key under the media bucket once generated. */
  suggestedPath: string;
  prompts: Array<{ style: string; prompt: string }>;
}

/** Full prompt set for every strain × every preset — the agent's worklist. */
export function buildAllStrainPrompts(): StrainPromptSet[] {
  return STRAINS.map((strain) => ({
    strainId: strain.id,
    strainName: strain.name,
    suggestedPath: `strains/${strain.id}/hero.png`,
    prompts: STYLE_PRESETS.map((style) => ({ style: style.id, prompt: buildStrainPrompt(strain, style) })),
  }));
}

/** Negative prompt shared across models that support one. */
export const NEGATIVE_PROMPT =
  'text, watermark, logo, packaging, hands, people, blurry, low-res, oversaturated, cartoon, illustration';
