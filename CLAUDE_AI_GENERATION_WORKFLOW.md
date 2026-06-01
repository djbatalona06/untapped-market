## Phase C — Multi-agent repo-committed generation (FLUX / Higgsfield / Ideogram)

This is the **simpler, Supabase-free** path for getting hero images onto strain
cards.  Images are committed directly into the repo under
`public/img/strains/<id>.<ext>` and `imageUrl` is written into
`src/data/strains.json` by a script.  No moderation queue, no storage bucket,
no admin dashboard required.

### Prerequisites

- Node 18+ (zero npm dependencies needed).
- At least one image-generation MCP tool available:
  - **FLUX** (BFL FLUX MCP) — `generate_image`
  - **Higgsfield** — `generate_image` or `generate_video`
  - **Ideogram** — `generate_image`
- Git access to commit into the repo.

### The two helper scripts

| Script | Purpose |
|---|---|
| `scripts/generate-strain-images.mjs` | Prints the prompt worklist; shards it across N agents |
| `scripts/apply-image-manifest.mjs` | Wires `imageUrl` into `strains.json` from committed files |

### Fleet model: sharding across N parallel agents

Each agent handles an exclusive, non-overlapping slice of the 29-strain worklist
so the whole catalogue can be generated in one coordinated run.

```
# Agent 1 of 4  (gets strains 0, 4, 8, 12, 16, 20, 24, 28 — 8 strains)
node scripts/generate-strain-images.mjs --shard 1/4 --json

# Agent 2 of 4  (gets strains 1, 5, 9, 13, 17, 21, 25 — 7 strains)
node scripts/generate-strain-images.mjs --shard 2/4 --json

# Agent 3 of 4  (gets strains 2, 6, 10, 14, 18, 22, 26 — 7 strains)
node scripts/generate-strain-images.mjs --shard 3/4 --json

# Agent 4 of 4  (gets strains 3, 7, 11, 15, 19, 23, 27 — 7 strains)
node scripts/generate-strain-images.mjs --shard 4/4 --json
```

Shard assignment is deterministic (`index % N === K-1`) so re-running after a
partial failure always produces the same slice — safe to retry.

To check remaining work after a partial run:

```
node scripts/generate-strain-images.mjs --missing
```

### Model routing

| Model | Best for | Aspect ratio | Negative prompt |
|---|---|---|---|
| **FLUX** (`flux`) | Photoreal botanical macro, trichome detail | 4:5 portrait (1024×1280) | Supported — pass `NEGATIVE_PROMPT` |
| **Higgsfield** (`higgsfield`) | Cinematic/ambient, moody PNW atmosphere | 4:5 portrait (1080×1350) | Not supported — weave avoidances into the positive prompt |
| **Ideogram** (`ideogram`) | Label/packaging concepts, typography-aware | `ASPECT_4_5` | Supported — pass `NEGATIVE_PROMPT` |

The default behaviour (no `--model` flag) rotates across all three models in
order so the final catalogue has visual variety across providers.  To pin a
single model for an entire shard:

```
node scripts/generate-strain-images.mjs --shard 1/4 --model flux --json
```

### Step-by-step for each agent

For every strain in its shard, an agent:

1. Takes the `prompt` and `negativePrompt` from the JSON output.
2. Calls the appropriate image-generation MCP tool (see table above).
3. Saves the resulting image to `public/img/strains/<strainId>.png`
   (create the directory if it does not exist).
4. Appends one entry to `data/strain-image-manifest.json`:

```json
{
  "strainId": "cascadia-haze",
  "model": "flux",
  "prompt": "…full prompt string…",
  "file": "public/img/strains/cascadia-haze.png",
  "generatedAt": "2026-06-01T12:00:00Z",
  "license": "ai-generated"
}
```

See `data/strain-image-manifest.example.json` for a 2-entry reference.

### After all shards complete — wire images and commit

```bash
# 1. Wire imageUrl into strains.json (idempotent, safe to re-run)
node scripts/apply-image-manifest.mjs

# 2. Preview what changed (optional)
node scripts/apply-image-manifest.mjs --dry-run

# 3. Stage and commit
git add public/img/strains/ data/strain-image-manifest.json src/data/strains.json
git commit -m "feat(images): add AI-generated strain hero images (Phase C)"
```

`apply-image-manifest.mjs` discovers images two ways: scanning
`public/img/strains/` for `<id>.(png|jpg|webp)` files, and reading
`data/strain-image-manifest.json` for entries whose file also exists on disk.
It only touches strains whose ID matches a real file — it never fabricates
`imageUrl` values.

### Data flow recap

```
generate-strain-images.mjs ──▶ agent reads prompt
        │                               │
        │                   image-gen MCP tool (FLUX / Higgsfield / Ideogram)
        │                               │
        │                   public/img/strains/<id>.png   +   strain-image-manifest.json
        │                               │
        ▼                               ▼
  strains.json                apply-image-manifest.mjs
  (imageUrl written)                    │
        │                               │
        └──────────── git commit ───────┘
                           │
                   StrainCard.tsx reads imageUrl
                   (CSS background-image fallback)
```

### Cannabis content guardrails (apply to every image)

- No consumption imagery (no smoke, pipes, joints, lighters, hands holding).
- No people or body parts of any kind.
- No medical claims in alt text or surrounding copy.
- No real brand logos or trademarked packaging.
- Botanical macro only — the flower is always the subject.
- Review every output against `NEGATIVE_PROMPT` before saving.

### Credit cost and opt-in nature

This flow is entirely **opt-in and manual** — no automated pipelines run it.
Each image call costs real API credits; verify your balance before kicking off a
full 29-strain run.  A typical budget estimate:

- FLUX pro: ~$0.05–$0.08 per image → ~$1.50–$2.30 for all 29 strains.
- Higgsfield / Ideogram: pricing varies by plan — check your dashboard.

Run `--missing` first to target only strains that still lack images and avoid
paying for re-generations.

---

# Claude AI Photo Generation Workflow (Phase B)

A step-by-step guide for an agent (Claude) to generate strain hero imagery and
deposit it into Untapped Market's moderation queue. **Generated images are never
auto-published** — they always land as `pending` and a human admin approves them
in the `/admin` dashboard.

## Prerequisites

- Supabase configured (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) and
  `schema.sql` applied.
- The agent's account promoted to admin:
  `update public.profiles set is_admin = true where email = '…';`
- One image-generation connector available. Any of:
  **Higgsfield, Nano Banana, Runway, Sora, Pika, Midjourney, Flux, Ideogram.**

## Where the prompts come from

`src/scripts/ai-photo-prompts.ts` is the single source of truth.

- `buildAllStrainPrompts()` returns, for every strain, a `suggestedPath` and a
  prompt per style preset (`hero-macro`, `trichome`, `ambient`).
- `HOUSE_STYLE` + `NEGATIVE_PROMPT` enforce the editorial PNW look so every
  image is visually consistent.

Print the worklist (example):

```ts
import { buildAllStrainPrompts, NEGATIVE_PROMPT } from './src/scripts/ai-photo-prompts';
for (const set of buildAllStrainPrompts()) {
  console.log(set.strainName, '→', set.suggestedPath);
  for (const p of set.prompts) console.log(`  [${p.style}] ${p.prompt}`);
}
console.log('NEGATIVE:', NEGATIVE_PROMPT);
```

## Step-by-step

1. **Pick the strain(s)** that have no approved media yet. (In the admin
   dashboard, anything missing a photo still shows the generated card art.)
2. **Get the prompt** for the strain + the `hero-macro` preset from
   `buildStrainPrompt(strain, preset)`.
3. **Generate** with your connector:
   - Image models (Flux / Midjourney / Ideogram / Nano Banana): use the prompt
     directly, pass `NEGATIVE_PROMPT` where supported, target a 4:5 portrait.
   - Video models (Runway / Sora / Pika / Higgsfield): generate a short clip and
     export a representative still frame for the card.
4. **Review** the result against the house style. Regenerate if there's text,
   packaging, hands, or an off-brand color grade.
5. **Deposit** the image into the queue. Two options:
   - **UI (recommended):** open `/admin`, pick the strain, drag the file in, add
     alt text, *Submit for review*.
   - **Programmatic:** call `uploadStrainMedia(file, { strainId, source: 'ai-generated', aiModel, aiPrompt, altText })`
     from `src/lib/media.ts`. It uploads to the `media` bucket and inserts a
     `pending` row.
6. **Approve** as the human admin: in `/admin` → *Moderation queue* → **Approve**,
   then optionally **Make primary**. Approval flips `status` to `approved`, and
   `useMediaSync()` surfaces it on the strain cards on next load.

## Quality bar

- Always write descriptive **alt text** (accessibility + SEO).
- Prefer one strong **primary** image per strain; keep the rest as alternates.
- Record `aiModel` and `aiPrompt` so generations are reproducible/auditable.
- Cannabis imagery only — no consumption, no people, no medical claims.

## Data flow recap

```
ai-photo-prompts.ts ──▶ image model ──▶ file
        │                                  │
        ▼                                  ▼
  (prompt + alt)                   uploadStrainMedia()
                                          │
                                   strain_media (pending)  +  storage/media
                                          │
                              admin approves in /admin
                                          │
                                   status = approved
                                          │
                              loadApprovedStrainMedia() ──▶ StrainCard
```
