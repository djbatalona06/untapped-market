#!/usr/bin/env node
/**
 * scripts/generate-strain-images.mjs
 *
 * Orchestration / worklist tool for the multi-agent AI image-generation
 * pipeline (Phase C).  This script does NOT itself call any paid image API.
 * It produces a structured worklist that human operators or a fleet of Claude
 * agents consume to drive FLUX / Higgsfield / Ideogram MCP tools.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * MULTI-AGENT SHARDING MODEL
 * ─────────────────────────────────────────────────────────────────────────────
 * N agents can run in parallel.  Each agent:
 *   1. Calls `node scripts/generate-strain-images.mjs --shard K/N [--model X]`
 *      to receive its exclusive slice of the worklist (no overlap).
 *   2. For every strain in its slice, follows the "Agent instruction block"
 *      printed by --list or embedded in the --json output.
 *   3. Saves the generated image to  public/img/strains/<id>.png
 *   4. Appends one JSON object to  data/strain-image-manifest.json
 *      (create the file if absent; append an entry if present).
 *   5. When all shards complete, the human operator runs:
 *         node scripts/apply-image-manifest.mjs
 *      which wires imageUrl into src/data/strains.json, then commits everything.
 *
 * Shard assignment is deterministic (index % N == K-1) so the same command
 * always produces the same slice — safe to re-run after partial failure.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * MODEL ROUTING
 * ─────────────────────────────────────────────────────────────────────────────
 *   flux        — photoreal macro; best for trichome / botanical detail
 *   higgsfield  — cinematic/ambient; great for moody PNW atmospheric shots
 *   ideogram    — label/packaging concepts; typography-aware if ever needed
 *
 * Default behaviour (no --model flag): the script rotates models across
 * strains (index % 3) so the catalogue has visual variety across providers.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE
 * ─────────────────────────────────────────────────────────────────────────────
 *   node scripts/generate-strain-images.mjs --list
 *   node scripts/generate-strain-images.mjs --list --model flux
 *   node scripts/generate-strain-images.mjs --shard 1/4
 *   node scripts/generate-strain-images.mjs --shard 2/4 --model higgsfield
 *   node scripts/generate-strain-images.mjs --missing
 *   node scripts/generate-strain-images.mjs --missing --json
 *   node scripts/generate-strain-images.mjs --list --json
 *
 * Node 18+ ESM, zero external dependencies.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// Resolve repo root regardless of cwd
// ─────────────────────────────────────────────────────────────────────────────
const __dirname = new URL('.', import.meta.url).pathname;
const REPO_ROOT = resolve(__dirname, '..');

// ─────────────────────────────────────────────────────────────────────────────
// HOUSE STYLE — mirrored from src/scripts/ai-photo-prompts.ts
// IMPORTANT: Keep these strings in sync with ai-photo-prompts.ts.
// If you update the source-of-truth TS file, update them here too.
// ─────────────────────────────────────────────────────────────────────────────

const HOUSE_STYLE = [
  'editorial product photography',
  'extreme macro of a cannabis flower',
  'frosted trichomes catching warm rim light',
  'shallow depth of field, crisp focus on the bud',
  'Pacific Northwest mood — soft evergreen bokeh, misty atmosphere',
  'amber and moss color grade, deep near-black background (#07090a)',
  'no text, no watermark, no packaging, photoreal, 4k',
].join(', ');

/** Negative prompt: pass to every model that accepts one. */
const NEGATIVE_PROMPT =
  'text, watermark, logo, packaging, hands, people, blurry, low-res, oversaturated, cartoon, illustration';

/** Type-specific visual cues (mirrored from TYPE_CUES in ai-photo-prompts.ts). */
const TYPE_CUES = {
  sativa: 'bright energetic palette, lighter green sugar leaves, airy structure',
  indica: 'dense chunky nugs, deep purple and forest-green hues, resinous',
  hybrid: 'balanced structure, blended green-to-amber tones',
};

/**
 * Style presets (mirrored from STYLE_PRESETS in ai-photo-prompts.ts).
 * Each agent uses 'hero-macro' (index 0) as the primary style for hero images.
 */
const STYLE_PRESETS = [
  { id: 'hero-macro', label: 'Hero macro', modifiers: 'centered hero composition, 4:5 portrait' },
  { id: 'trichome', label: 'Trichome close-up', modifiers: 'microscope-level trichome detail, dewy resin glands' },
  { id: 'ambient', label: 'Ambient scene', modifiers: 'bud resting on wet basalt stone, fog, cinematic wide' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Model-specific guidance
// ─────────────────────────────────────────────────────────────────────────────

const MODEL_GUIDANCE = {
  flux: {
    aspectRatio: '4:5 portrait',
    supportsNegativePrompt: true,
    mcpTool: 'generate_image (BFL FLUX MCP)',
    notes: [
      'Photoreal macro — ideal for trichome botanical detail.',
      'Pass NEGATIVE_PROMPT via the negative_prompt parameter.',
      'Recommended: flux-pro or flux-1.1-pro for maximum detail.',
      'Set aspect_ratio: "4:5" or width/height to 1024×1280.',
    ],
  },
  higgsfield: {
    aspectRatio: '4:5 portrait',
    supportsNegativePrompt: false,
    mcpTool: 'generate_video or generate_image (Higgsfield MCP)',
    notes: [
      'Cinematic/ambient — great for moody PNW atmospheric shots.',
      'Negative prompts not natively supported; weave avoidances into the positive prompt.',
      'For video: generate a short clip and export a representative still frame.',
      'Target 1080×1350 (4:5) resolution.',
    ],
  },
  ideogram: {
    aspectRatio: '4:5 portrait',
    supportsNegativePrompt: true,
    mcpTool: 'generate_image (Ideogram MCP)',
    notes: [
      'Best for label/packaging concepts or when typography accuracy matters.',
      'Supports negative_prompt parameter — pass NEGATIVE_PROMPT.',
      'Use "REALISTIC" style for photoreal botanical shots.',
      'Set aspect_ratio: "ASPECT_4_5".',
    ],
  },
};

const MODEL_ROTATION = ['flux', 'higgsfield', 'ideogram'];

// ─────────────────────────────────────────────────────────────────────────────
// Build a prompt string for a single strain (mirrors buildStrainPrompt())
// ─────────────────────────────────────────────────────────────────────────────

function buildStrainPrompt(strain, style = STYLE_PRESETS[0]) {
  const terps = (strain.terpenes || []).slice(0, 3).map((t) => t.name).join(', ');
  const flavors = (strain.flavors || []).slice(0, 3).join(', ');
  return [
    `${strain.name} — a ${strain.type} cannabis strain`,
    HOUSE_STYLE,
    TYPE_CUES[strain.type] || '',
    terps ? `terpene mood: ${terps}` : '',
    flavors ? `evokes flavors of ${flavors}` : '',
    style.modifiers,
  ]
    .filter(Boolean)
    .join(', ');
}

// ─────────────────────────────────────────────────────────────────────────────
// Check whether a committed image already exists for a strain id
// ─────────────────────────────────────────────────────────────────────────────

const IMAGE_EXTS = ['png', 'jpg', 'webp'];

function findExistingImage(strainId) {
  for (const ext of IMAGE_EXTS) {
    const p = join(REPO_ROOT, 'public', 'img', 'strains', `${strainId}.${ext}`);
    if (existsSync(p)) return { path: p, ext };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Load strains.json
// ─────────────────────────────────────────────────────────────────────────────

function loadStrains() {
  const p = join(REPO_ROOT, 'src', 'data', 'strains.json');
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch (err) {
    console.error(`ERROR: Could not read ${p}: ${err.message}`);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Build full worklist
// ─────────────────────────────────────────────────────────────────────────────

function buildWorklist(strains, { modelOverride, missingOnly } = {}) {
  return strains
    .map((strain, idx) => {
      const model = modelOverride || MODEL_ROTATION[idx % MODEL_ROTATION.length];
      const guidance = MODEL_GUIDANCE[model];
      const heroStyle = STYLE_PRESETS[0]; // hero-macro
      const prompt = buildStrainPrompt(strain, heroStyle);
      const outputFile = `public/img/strains/${strain.id}.png`;
      const outputPath = join(REPO_ROOT, outputFile);
      const existingImage = findExistingImage(strain.id);
      const hasImageUrl = Boolean(strain.imageUrl);

      return {
        index: idx,
        strainId: strain.id,
        strainName: strain.name,
        type: strain.type,
        model,
        guidance,
        prompt,
        negativePrompt: NEGATIVE_PROMPT,
        suggestedOutputFile: outputFile,
        suggestedOutputPath: outputPath,
        manifestFile: 'data/strain-image-manifest.json',
        alreadyDone: Boolean(existingImage || hasImageUrl),
        existingImageExt: existingImage ? existingImage.ext : null,
      };
    })
    .filter((entry) => (missingOnly ? !entry.alreadyDone : true));
}

// ─────────────────────────────────────────────────────────────────────────────
// Shard a list into K/N slices (1-indexed K)
// ─────────────────────────────────────────────────────────────────────────────

function shard(list, k, n) {
  if (k < 1 || k > n) {
    console.error(`ERROR: Shard index K must be between 1 and N (got ${k}/${n})`);
    process.exit(1);
  }
  return list.filter((_, i) => i % n === k - 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Human-readable output for a single worklist entry
// ─────────────────────────────────────────────────────────────────────────────

function printEntry(entry) {
  const statusBadge = entry.alreadyDone ? '[DONE]' : '[TODO]';
  console.log(`\n${'─'.repeat(72)}`);
  console.log(`${statusBadge}  ${entry.strainName}  (${entry.strainId})  [${entry.type}]`);
  console.log(`Model:          ${entry.model}  — ${entry.guidance.mcpTool}`);
  console.log(`Output file:    ${entry.suggestedOutputFile}`);
  console.log(`Aspect ratio:   ${entry.guidance.aspectRatio}`);
  console.log(`\nPROMPT:\n  ${entry.prompt}`);
  console.log(`\nNEGATIVE PROMPT (pass where supported):\n  ${entry.negativePrompt}`);
  console.log(`\nModel notes:`);
  for (const note of entry.guidance.notes) {
    console.log(`  • ${note}`);
  }
  console.log(`\nAgent instructions:`);
  console.log(`  1. Call ${entry.guidance.mcpTool} with the PROMPT above.`);
  if (entry.guidance.supportsNegativePrompt) {
    console.log(`  2. Pass NEGATIVE PROMPT to the negative_prompt parameter.`);
  } else {
    console.log(`  2. Weave negative concepts into the positive prompt (model doesn't support negative_prompt).`);
  }
  console.log(`  3. Save the resulting image to:  ${entry.suggestedOutputFile}`);
  console.log(`     (Create the directory public/img/strains/ if it does not exist.)`);
  console.log(`  4. Append this entry to  ${entry.manifestFile}  (create file if absent):`);
  const manifestEntry = {
    strainId: entry.strainId,
    model: entry.model,
    prompt: entry.prompt,
    file: entry.suggestedOutputFile,
    generatedAt: '<ISO-8601 timestamp>',
    license: 'ai-generated',
  };
  console.log(`     ${JSON.stringify(manifestEntry, null, 2).split('\n').join('\n     ')}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Parse CLI args
// ─────────────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    list: false,
    missing: false,
    json: false,
    shardK: null,
    shardN: null,
    model: null,
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--list') opts.list = true;
    else if (a === '--missing') opts.missing = true;
    else if (a === '--json') opts.json = true;
    else if (a === '--model') {
      const m = args[++i];
      if (!MODEL_GUIDANCE[m]) {
        console.error(`ERROR: Unknown model "${m}". Valid: flux, higgsfield, ideogram`);
        process.exit(1);
      }
      opts.model = m;
    } else if (a === '--shard') {
      const spec = args[++i];
      const match = spec && spec.match(/^(\d+)\/(\d+)$/);
      if (!match) {
        console.error(`ERROR: --shard expects K/N format (e.g. --shard 1/4), got "${spec}"`);
        process.exit(1);
      }
      opts.shardK = parseInt(match[1], 10);
      opts.shardN = parseInt(match[2], 10);
      if (opts.shardN < 1) {
        console.error('ERROR: N in K/N must be >= 1');
        process.exit(1);
      }
    } else if (a === '--help' || a === '-h') {
      printUsage();
      process.exit(0);
    } else {
      console.error(`ERROR: Unknown argument "${a}"`);
      printUsage();
      process.exit(1);
    }
  }

  // Default to --list if nothing specified
  if (!opts.list && !opts.missing && opts.shardK === null) {
    opts.list = true;
  }

  return opts;
}

function printUsage() {
  console.log(`
Usage: node scripts/generate-strain-images.mjs [options]

Options:
  --list              Print full worklist (all strains)
  --missing           Print only strains with no committed image and no imageUrl
  --shard K/N         Print only the K-th shard of N equal-sized slices (1-indexed)
  --model <name>      Annotate worklist with model-specific guidance
                      Valid: flux | higgsfield | ideogram
                      Default: rotate across strains for variety
  --json              Emit worklist as JSON instead of human-readable text
  --help              Show this help

Examples:
  node scripts/generate-strain-images.mjs --list
  node scripts/generate-strain-images.mjs --list --model flux
  node scripts/generate-strain-images.mjs --shard 1/4
  node scripts/generate-strain-images.mjs --shard 2/4 --model higgsfield --json
  node scripts/generate-strain-images.mjs --missing --json
`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  const opts = parseArgs(process.argv);

  const strains = loadStrains();
  let worklist = buildWorklist(strains, {
    modelOverride: opts.model,
    missingOnly: opts.missing,
  });

  // Apply shard filter if requested
  if (opts.shardK !== null) {
    worklist = shard(worklist, opts.shardK, opts.shardN);
  }

  if (worklist.length === 0) {
    console.log('No strains match the current filters. All images may already be generated.');
    process.exit(0);
  }

  if (opts.json) {
    // Machine-readable output for agent consumption
    const output = worklist.map((entry) => ({
      strainId: entry.strainId,
      strainName: entry.strainName,
      type: entry.type,
      model: entry.model,
      mcpTool: entry.guidance.mcpTool,
      aspectRatio: entry.guidance.aspectRatio,
      supportsNegativePrompt: entry.guidance.supportsNegativePrompt,
      prompt: entry.prompt,
      negativePrompt: entry.negativePrompt,
      suggestedOutputFile: entry.suggestedOutputFile,
      manifestFile: entry.manifestFile,
      alreadyDone: entry.alreadyDone,
      modelNotes: entry.guidance.notes,
    }));
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  // Human-readable output
  const modeLabel = opts.missing
    ? 'MISSING ONLY'
    : opts.shardK !== null
    ? `SHARD ${opts.shardK}/${opts.shardN}`
    : 'FULL WORKLIST';

  console.log(`\n${'═'.repeat(72)}`);
  console.log(`UNTAPPED MARKET — Strain Image Generation Worklist`);
  console.log(`Mode: ${modeLabel}${opts.model ? `  |  Model: ${opts.model}` : '  |  Model: rotating'}`);
  console.log(`Strains in this list: ${worklist.length} of ${strains.length} total`);
  console.log(`${'═'.repeat(72)}`);
  console.log(`\nCANNABIS CONTENT GUARDRAILS (must be followed for every image):`);
  console.log(`  • No consumption imagery (no smoke, pipes, joints, lighters).`);
  console.log(`  • No people, hands, or body parts.`);
  console.log(`  • No medical claims in alt text or surrounding copy.`);
  console.log(`  • No real brand logos or trademarked packaging.`);
  console.log(`  • Botanical macro only — the flower is the subject.`);

  for (const entry of worklist) {
    printEntry(entry);
  }

  console.log(`\n${'═'.repeat(72)}`);
  console.log(`AFTER GENERATING ALL IMAGES IN THIS LIST:`);
  console.log(`  1. Ensure each image is saved to  public/img/strains/<id>.png`);
  console.log(`  2. Ensure data/strain-image-manifest.json has one entry per image.`);
  console.log(`  3. Run:  node scripts/apply-image-manifest.mjs`);
  console.log(`     This wires imageUrl into src/data/strains.json (idempotent).`);
  console.log(`  4. Run:  git add public/img/strains/ data/strain-image-manifest.json src/data/strains.json`);
  console.log(`  5. Commit: git commit -m "feat(images): add AI-generated strain hero images"`);
  console.log(`${'═'.repeat(72)}\n`);
}

main();
