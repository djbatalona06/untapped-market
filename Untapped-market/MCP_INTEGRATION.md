# MCP Integration Guide — Untapped Market

This document explains **which MCP servers to wire up**, **why each one matters for this project**, and **how to install them** in either Claude Code (`.mcp.json`) or your IDE's MCP picker (Antigravity / Claude Desktop / Cursor).

---

## TL;DR — Priority Order

The MCPs are ranked by leverage for *this specific project* (cannabis discovery platform with Supabase backend, Stripe billing, dispensary maps, social trip reports).

| Tier | MCP | Why it matters here | Setup effort |
|---|---|---|---|
| **P0 — install first** | **Supabase** | Direct backend — auth, Postgres, storage, edge functions | 5 min |
| P0 | **GitHub** | Source-of-truth repo, PRs, issues, branch automation | 2 min |
| P0 | **Stripe** | Premium $7/mo subs, webhooks, customer portal | 5 min |
| P0 | **Chrome DevTools MCP** | Debug the running Vite app with full DOM/network access | 2 min |
| **P1 — soon** | **Sequential Thinking** | Better multi-step reasoning during complex refactors | 1 min |
| P1 | **Netlify** *or* **Heroku** | Deploy the frontend (pick one) | 5 min |
| P1 | **Notion** *or* **Linear** | Roadmap + issue tracking | 3 min |
| P1 | **Pinecone** | Vector search for "find strains similar to X" (genetic embeddings) | 5 min |
| **P2 — when it's relevant** | **BigQuery** | Open Cannabis Project dataset (~850 strain genomes) — competitive moat | 10 min |
| P2 | **Postman** | Test Kannapedia/Giphy/Stripe APIs before coding them | 3 min |
| P2 | **Google Cloud Logging** | Centralize logs if you deploy on GCP | 5 min |
| P2 | **Pub/Sub (Managed Kafka)** | Event bus for trip-report moderation queue, lab-cert ingestion | 15 min |
| P2 | **Cloud SQL** *or* **AlloyDB** | Only if you outgrow Supabase Postgres (you won't, for years) | 10 min |
| **P3 — nice to have** | **Figma Dev Mode** | If you produce designs in Figma | 3 min |
| P3 | **Sentry/Arize** | Error monitoring + LLM tracing once AI recs ship in V2 | 5 min |
| P3 | **Perplexity Ask** | Quick research without leaving Claude Code | 1 min |

**Skip for now** (not relevant to a cannabis app): Atlassian (unless you adopt Jira), Harness, SonarQube, Sonatype, Oracle DB, Bigtable, Spanner, Cloud SQL for SQL Server, Android Management API, Vertex AI Search, Cloud Run/GKE (unless you containerize), Dart/Genkit/Firebase (you're not using them).

---

## How MCP Installation Works (One-Time Mental Model)

An MCP server is a small process that exposes a set of *tools* (functions) to the LLM. It runs locally or remotely. To connect it you need three things:

1. **A way to launch the server** — usually an `npx`, `uvx`, or `docker` command, or a hosted URL.
2. **Credentials** — typically an env var (`GITHUB_TOKEN`, `STRIPE_SECRET_KEY`, etc.). Some use OAuth flows.
3. **A config file** that tells your client (Claude Code / Antigravity / etc.) about the above.

Config file locations:

| Client | File |
|---|---|
| Claude Code (project-scoped) | `<project>/.mcp.json` ← committed to git |
| Claude Code (user-scoped) | `~/.claude/settings.json` |
| Claude Desktop | `%APPDATA%\Claude\claude_desktop_config.json` (Windows) |
| Antigravity IDE | Use the in-app MCP picker (matches your screenshots) |
| Cursor | `~/.cursor/mcp.json` |

This repo includes a starter `.mcp.json` (next section). Update credentials in `.env.local`, then restart Claude Code.

---

## Drop-In `.mcp.json` Template

A template file is provided at the root: [`.mcp.json.example`](./.mcp.json.example). Copy it to `.mcp.json` and edit the env vars.

```bash
# from project root
cp .mcp.json.example .mcp.json
# then edit .mcp.json and fill in real tokens
```

> **Security:** `.mcp.json` is git-ignored by default in this repo because it contains secrets. Use a `.mcp.json.example` (placeholders only) as the team template.

---

## Per-MCP Setup (P0 — do these first)

### 1. Supabase MCP

**What it gives you:** read schema, run SQL, generate types, manage RLS policies, view logs, all from inside Claude.

**Install:**
```bash
npx -y @supabase/mcp-server-supabase@latest --help
```

**Env vars you need:**
- `SUPABASE_ACCESS_TOKEN` — get from https://supabase.com/dashboard/account/tokens
- `SUPABASE_PROJECT_REF` — found in your project URL (the `abcd1234` chunk in `https://abcd1234.supabase.co`)

**Why this matters most:** the entire backend lives here. Schema in [`supabase/schema.sql`](./supabase/schema.sql). Once the MCP is wired, you can ask Claude "add a `flagged` column to trip_reports with RLS" and it'll write the migration.

---

### 2. GitHub MCP

**What it gives you:** read/write issues, PRs, gh actions, file contents, branches.

**Env vars:**
- `GITHUB_PERSONAL_ACCESS_TOKEN` — create at https://github.com/settings/tokens (classic, scopes: `repo`, `read:org`, `workflow`)

**Setup tip:** scope the token to a single repo if you want to limit blast radius.

---

### 3. Stripe MCP

**What it gives you:** create/list products, prices, customers, subscriptions, webhooks — all in test mode.

**Env vars:**
- `STRIPE_SECRET_KEY` — from https://dashboard.stripe.com/test/apikeys (start with `sk_test_...`)

**Project use:** the `$7/mo` premium tier. Use Claude to create the Product + Price, set up a webhook endpoint on a Supabase edge function, and seed test customers.

---

### 4. Chrome DevTools MCP

**What it gives you:** inspect the running app — DOM, network, console, performance.

**Use case here:** when the Leaflet map doesn't render on the Finder page, Claude can read the console error and patch the SSR-icon bug without you copy-pasting screenshots.

---

## Per-MCP Setup (P1 — soon)

### Sequential Thinking
Zero credentials. Just installs. Improves Claude's chain-of-thought on complex refactors (good for when we expand from 6 → 200 strains).

### Netlify
**Env var:** `NETLIFY_AUTH_TOKEN` from https://app.netlify.com/user/applications. Connect once; Claude can deploy, roll back, and read logs. Vite output dir is `dist`.

### Notion / Linear
Pick one. Both have OAuth flows in their MCPs — easier setup than tokens.

### Pinecone
**Env vars:** `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT`. Create an index of strain genetic embeddings (we'll generate embeddings from the lineage + terpene profile + lab data) so "find similar strains to Cascadia Haze" runs in 30ms instead of scanning Postgres.

---

## Per-MCP Setup (P2 — when relevant)

### BigQuery — the moat
Google Cloud hosts the **Open Cannabis Project dataset** (~850 strain genomes) for free. Wire the BigQuery MCP, query it directly, and import select strains into your `strains` table. This is genuine data Leafly/Weedmaps don't have.

**Env vars:** `GOOGLE_APPLICATION_CREDENTIALS` (path to a service-account JSON), `GCP_PROJECT_ID`.

### Pub/Sub (Managed Kafka)
For V2 when you have an inbound stream of lab certificates from partners (Confidence Analytics, Trace Analytics). Don't bother until you have a partner.

### Cloud SQL / AlloyDB
Only if Supabase Postgres runs out of headroom (unlikely under 100k users). The Supabase MCP covers everything here.

---

## Two Paths Forward

### Path A: I configure for you (recommended)

The repo already includes `.mcp.json.example` with all P0+P1 entries pre-wired. You just need to:

1. Install **Node 20+** from https://nodejs.org/ (also unlocks `npm run dev`)
2. Create accounts + grab tokens for the P0 services (Supabase, GitHub, Stripe — ~15 min total)
3. Copy `.mcp.json.example` → `.mcp.json`, paste tokens
4. Restart Claude Code (or the IDE) — the MCP tools light up automatically
5. Verify with: ask me *"list my Supabase projects"* — if I can answer with live data, it's working

### Path B: You add them through the IDE picker

If you're using Antigravity (your screenshots show its MCP browser):

1. Click the MCP you want to add
2. Antigravity walks you through OAuth or env-var entry
3. The MCP becomes available to all sessions in that IDE

This route is cleaner if you prefer a UI — but it doesn't ship config with the project, so teammates need to repeat the process. For a real team, Path A is better.

---

## Verification Checklist

After install, run these one-liners in Claude:

- "List my Supabase tables in this project" → Supabase MCP working
- "Show me the last 3 commits on the main branch" → GitHub MCP working
- "List my Stripe products in test mode" → Stripe MCP working
- "Open localhost:5173 in Chrome and tell me what loads" → Chrome DevTools MCP working

If any returns a tool error, the env var is wrong or the MCP server failed to start. The error message in Claude's tool result is enough to debug 95% of issues.

---

## Cost Awareness

Most MCPs are free (open source servers + your own API keys). The paid-API ones to watch:

| Service | Free tier | When you pay |
|---|---|---|
| Supabase | 500MB DB, 50k MAU | $25/mo Pro at ~10k MAU |
| Stripe | Free until first $1M transactions/yr | 2.9% + $0.30 per charge |
| Pinecone | 1 free pod, 100k vectors | $70/mo for serverless prod |
| BigQuery | 1TB queries/mo free | $5 per TB after |
| Mapbox | 50k loads/mo free | $0.50 per 1k after |

For V1 → first 100 paying users, you should pay **zero** infrastructure costs except maybe Pinecone ($0–70/mo) and Mapbox ($0).

---

## Next Steps After MCPs Are Wired

Once the P0 set is live, here are the highest-leverage things to ask Claude:

1. *"Run `supabase/schema.sql` against my project"* — bootstraps the database
2. *"Run `supabase/seed.sql`"* — loads the 6 strains + 4 dispensaries
3. *"Generate TypeScript types from the live Supabase schema and write them to `src/lib/database.types.ts`"* — strongly types every query
4. *"Create the $7/mo Stripe Product + Price and a webhook endpoint on a Supabase edge function"* — premium goes live
5. *"Open localhost:5173, click Strain Detail → Cascadia Haze, and verify the Terpene chart renders"* — visual smoke test

That's the V1 ship list.
