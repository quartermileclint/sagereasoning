# 04 — Test-Environment Standup Checklist (founder-performed)

**Status:** Designed (0a). This is the **prerequisite** for any orchestrator run (Reading A). It is **founder-performed work** — it needs Supabase, Vercel/local env, and key access that the AI cannot reach from a session. The AI produced this checklist; you run it between sessions.
**Reads alongside:** `test-flag-config.md` (the flags + the genuine→200 trio + the DB boundary), `orchestrator-harness-design.md` (what the harness needs), `scenario-matrix.md` (what gets run once the env stands).
**Tier:** `governance` — Standard risk (this document). Standing up the env touches **no production system** — by design it is a *separate* test project.
**Date:** 2026-05-24.

---

## The one rule that overrides everything

**The test environment must point at a TEST Supabase project and a local/preview deployment — never production Supabase, never the live Vercel deployment.** This difference *is* the safety control (`test-flag-config.md`). If at any point a step would touch the production project or the live deployment, **stop** — you've crossed the boundary.

"No current users" holds (founder + test logins only), so there are no third-party sessions at stake — but the production *data* and the live *gate* are still real, and the test run must not touch either.

---

## Step 1 — Create a separate test Supabase project

- [ ] In the Supabase dashboard, create a **new project** (e.g. name it `sagereasoning-test`). This is **separate** from your production project — a different URL and different keys.
- [ ] From the new project's **Settings → API**, copy two values for later: the **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`) and the **service_role key** (`SUPABASE_SERVICE_ROLE_KEY`). These are the test project's — *not* production's.

## Step 2 — Get the schema into the test project

The test project starts empty. It needs the same **table structure** as production (no data — just the empty tables and columns). There are two ways; **Method A is recommended** because of a gap Method B has.

> **⚠ Material finding (verified by repo scan, 2026-05-24):** three tables the loop depends on — **`api_keys`, `loop_billing_events`, `api_key_usage`** — are **NOT created by any migration file in the repo**. They are only ever `ALTER`ed/referenced. `api_keys` is the backbone of authentication for **all four** write endpoints (the `sage_assent_write` scope is a column on it; the API key for `/api/reason` is a row in it). **If you only replay the repo migration files, the test project will be missing `api_keys` and every request will fail to authenticate.** Method A avoids this entirely; Method B must add these tables by hand.

### Method A (recommended) — clone the production schema, **structure only, zero rows**

- [ ] Produce a **schema-only** dump of the production database (table definitions, indexes, constraints — **no data**). With the Supabase CLI: `supabase db dump --schema-only` against the production project (read-only; this exports structure, not rows). A database GUI's "export schema (no data)" does the same.
- [ ] Apply that schema dump to the **test** project (Supabase SQL Editor, or `psql` against the test connection string).
- [ ] **Why this is preferred:** it recreates *everything* production has — including `api_keys`, `loop_billing_events`, and `api_key_usage` — exactly, with **no production rows crossing over**. The result is structural parity with zero data.

### Method B (alternative) — replay the repo migrations, then add the three missing tables

If you replay the repo SQL files instead, apply them in dependency order (base creates before the `ALTER`-only files). Loop-relevant repo migrations, grouped by stage:

**Auth / metering base (NOT in repo — must be added separately; see the finding above):**
- `api_keys`, `loop_billing_events`, `api_key_usage` — obtain these table definitions from the production schema and apply them **first** (they have no repo `CREATE`).

**Sage Calling (Stage 1):**
- `supabase-discovery-sessions-migration.sql` → `discovery_sessions`
- `supabase-discovery-sessions-agent-card-role-hint-migration.sql` (alters `discovery_sessions`)

**Substrate / Sage Reasoning (Stage 2):**
- `migrations/2026-05-04-translation-sandwich-comparisons.sql` → `translation_sandwich_comparisons`
- `migrations/2026-05-04-translation-sandwich-cost-tracker.sql` → `translation_sandwich_cost_tracker`

**Sage Assent (Stage 3):**
- `supabase-agent-accreditation-migration.sql` → `agent_accreditation`, `grade_history`
- `supabase-evaluated-actions-migration.sql` → `evaluated_actions`
- `supabase-credential-audit-migration.sql` → `credential_audit`
- `supabase-agent-accreditation-a10-migration.sql` (alters `agent_accreditation`; references `loop_billing_events`)
- `supabase-agent-accreditation-typical-deliberation-breadth-migration.sql` (alter)
- `supabase-agent-accreditation-typical-kathekon-quality-migration.sql` (alter)
- `supabase-api-keys-a10-migration.sql` (alters `api_keys`)
- `supabase-api-keys-phase3-scope-rename-migration.sql` (alters `api_keys` — adds the `sage_assent_write` scope)

**Sage Reflect (Stage 4):**
- `supabase-sage-reflect-migration.sql` → `sage_reflect_sessions`, `sage_reflect_proximity_domains`
- `supabase-sage-reflect-a1-cross-session-migration.sql` (alter)
- `supabase-sage-reflect-cost-tracker-migration.sql` → `sage_reflect_cost_tracker` (references `loop_billing_events`)

- [ ] The repo files use `IF NOT EXISTS`, so re-running is safe (idempotent). But Method B is **not** complete without the three out-of-repo tables above. If a build session later hits "table `api_keys` does not exist" or repeated `401`s, this is the cause.

## Step 3 — Generate the test Ed25519 signing key-pair (the genuine→200 prerequisite)

The genuine→200 path needs `/api/reason` to **sign** assessments and the gate to **verify** them against the matching public key. Generate the pair **together** so they always match (this is how you avoid the "false 403" trap in `test-flag-config.md`):

```
openssl genpkey -algorithm ed25519 -out test-layer2-private.pem
openssl pkey -in test-layer2-private.pem -pubout -out test-layer2-public.pem
```

- [ ] `test-layer2-private.pem` → the value of **`SUBSTRATE_LAYER2_SIGNING_KEY`** (PEM, private half).
- [ ] `test-layer2-public.pem` → the value of **`SUBSTRATE_LAYER2_PUBLIC_KEY`** (PEM, public half).
- [ ] Format these in the test env **exactly as your production keys are formatted** in Vercel (same PEM, same newline/`\n` convention) — mirror the known-good. The signer reads a PEM Ed25519 private key; the verifier reads the PEM public key.
- [ ] Set **`SUBSTRATE_LAYER2_KEY_ID`** to a single test value (e.g. `substrate-layer2-test`). The signer stamps it on the assessment; the verifier recognises it. (In a single local deployment, signer and verifier read the *same* `process.env`, so one value serves both.)
- [ ] These are **test-only keys** — never reuse the production signing key.

## Step 4 — Set the test environment variables

Set these in `website/.env.local` (for local `npm run dev`) **or** in a Vercel **Preview** environment wired to the test project. **Never** set them on the production deployment.

| Env var | Test value | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **the test project's URL** (Step 1) | DB boundary — the non-negotiable control |
| `SUPABASE_SERVICE_ROLE_KEY` | **the test project's service_role key** (Step 1) | DB boundary |
| `SAGE_CALLING_ENABLED` | `true` | Stage 1 on |
| `SAGE_REFLECT_ENABLED` | `true` | Stage 4 on (else 503) |
| `SUBSTRATE_WRITE_PATH_ENABLED` | `true` | Stage 3 credential write path on (A10 kill-switch) |
| `SUBSTRATE_LAYER2_SIGNING_ENABLED` | `true` | so `/api/reason` returns a **signed** assessment (genuine→200 condition 1) |
| `SUBSTRATE_LAYER2_SIGNING_KEY` | **test private PEM** (Step 3) | the signer's key |
| `SUBSTRATE_LAYER2_PUBLIC_KEY` | **test public PEM** (Step 3) | the gate's verifier key (genuine→200 condition 2) |
| `SUBSTRATE_LAYER2_KEY_ID` | `substrate-layer2-test` (Step 3) | key identifier; signer stamps, verifier recognises |
| `SUBSTRATE_PROVENANCE_GATE_ENABLED` | `true` | the R18f gate on — enforces Combination 1 **and** gates genuine→200 (condition 3) |
| `SUBSTRATE_LAYER3_ENABLED` | `true` | whole-loop test needs Layer 3 prose (test-only difference vs prod) |
| `SUBSTRATE_R20A_GATE_ENABLED` | `true` *only when testing the perimeter* | substrate-side R20a gate (C2 is Critical-tier — defer) |
| `TRANSLATION_SANDWICH_PARALLEL_RUN` | `false` | reproducible runs unless a test is specifically about parallel-run |
| `ANTHROPIC_API_KEY` | **a test/dev key** | LLM calls for Layer 1 + Layer 3; keep test spend isolated |
| `PLUGIN_AUTH_ENABLED` / `PLUGIN_AUTH_SECRET` | **test values** | only if you use the plugin-auth path for `/api/reason` (alternative to an API key) |
| `MENTOR_ENCRYPTION_KEY` | **a test key** | never decrypt real intimate data in a test env (R17b) |

- [ ] Confirm `NEXT_PUBLIC_SUPABASE_URL` is the **test** URL before doing anything else. This is the line to re-check if anything feels wrong.

## Step 5 — Mint the test credentials

The harness plays an agent, so it needs the credentials an agent would hold. **Two** are needed (per `orchestrator-harness-design.md` §3):

- [ ] **A `sr_assent_` write token** bound to a **test `agent_id`**, scope `sage_assent_write`. This single token authenticates **Calling, Accreditation, and Reflect**. Mint it via the project's admin/minting path against the **test** project (the same mechanism used to create the production `sr_assent_` tokens; it inserts a row into the test `api_keys`). Record the token (it is shown once).
- [ ] **An API key for `/api/reason`** (the recommended path) — an `api_keys` row in the test project, supplied as the `X-Api-Key` header. *(Alternative: skip this and use the `PLUGIN_AUTH_SECRET` plugin-auth path instead — set `PLUGIN_AUTH_ENABLED='true'` in Step 4.)*
- [ ] Both are **test credentials only** — bound to a test `agent_id`, in the test project.

## Step 6 — Run against the test env (never production)

- [ ] **Local (recommended):** `cd website && npm run dev`. The app reads `website/.env.local` (the test values from Step 4). The harness calls `http://localhost:3000/api/...`.
- [ ] **Or a Preview deployment** wired to the test project's env. **Never** run the harness against the production deployment.
- [ ] Confirm `GET http://localhost:3000/api/public-key` returns your **test** public key (`key_id: substrate-layer2-test`). If it returns the production key, the env is mis-set — stop and fix Step 4.

## Step 7 — Smoke check before trusting any result (the positive control)

Before running the negatives, prove a **genuine** write succeeds on this env — otherwise a `403` could be a key mismatch, not a real forgery rejection (the "false 403"):

- [ ] **Positive control (L7 in miniature):** `POST /api/reason` with the API key → take the returned `{ assessment, signature, key_id }` → `POST /api/accreditation/[test_agent_id]` with `provenance: { signed_assessments: [ <that object> ] }` and the `sr_assent_` token → expect **`200`**. If this is **`403 no_examination`** on genuine input, the public key doesn't match the signing key (regenerate the pair in Step 3 together).
- [ ] **Negative (Combination 1):** `POST /api/accreditation/[test_agent_id]` with the `sr_assent_` token and **no** `provenance` → expect **`422 bad_provenance`**; with a **forged** `provenance` → expect **`403 no_examination`**. (This is the headline assertion — already verified in production 2026-05-24.)
- [ ] Only once the positive control returns `200` are the negatives trustworthy.

## Step 8 — The stop signal

If a run is ever found pointing at the **production** `SUPABASE_URL`, or running against the **production deployment**, **stop immediately** — the test has crossed the boundary this checklist draws. The `00_baseline/` record is what "untouched production" must look like before and after any run.

---

## What the AI cannot do (limitation)

Steps 1–6 require Supabase dashboard access, Vercel/local env configuration, key generation handling, and credential minting — none reachable from an AI session. The AI's role is this checklist, the harness design, and (once the env is standing) the harness code and the verification commands. **Standing up the environment is yours.**

*End of checklist. When every box is ticked and the Step 7 positive control returns 200, the test environment is standing and the build session can run the L7 single-loop proof (PR1).*
