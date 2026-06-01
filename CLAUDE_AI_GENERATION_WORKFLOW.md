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
