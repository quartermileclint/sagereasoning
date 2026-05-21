# Next-Session Prompt — Sage Calling: Build Stage 1 (Content + Schema)

**Stream:** founder.
**Tier:** `code-elevated` (Stage 1 of the staged Sage Calling build per D-9). The session also touches `schema` (new table) and `registry`-adjacent content; the highest sub-part (the additive substrate Layer 1 extension) sets the template form.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general session protocol; `code-elevated` → Lean + Elevated additions) + `/adopted/build-sessions-protocol-cache.md` (build-arc context; "no current users" governing note).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-21-sage-calling-design-lock-close.md`.
**Predecessor decision-log entries:** `D-PURPOSE-DISCOVERY-DESIGN-LOCKED-2026-05-21` (the locked design — this build implements it); `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21` (the auth pre-condition, Verified).
**Operative deliverable (read in full):** `/adopted/purpose-discovery-product-design.md` (the locked design; D-1 … D-14).
**Risk classification:** **Elevated** under 0d-ii. Critical Change Protocol **NOT** engaged (no auth, session, encryption, deletion, R20a, or deployment-config surface this stage — those are Stage 2). PR6 **NOT** engaged. AC7 **NOT** engaged this stage.

## Why this session matters

This is **Stage 1 of 2** of the Sage Calling build (the purpose-discovery product locked 2026-05-21). Stage 1 lands the non-public groundwork so Stage 2 (Critical) can wire the engine and go Live cleanly. Stage 1 does three things and nothing else: (1) author the **content** — the 24-variant question library + the four clarification templates, lifted verbatim from the locked design; (2) author the **`discovery_sessions` schema** (new table per D-3/D-7); (3) author the **additive, backward-compatible substrate Layer 1 extension** — the optional `discovered_purpose` fields per D-5. There is **no public endpoint, no engine, no auth gate, and no behaviour change** in Stage 1. This is the PR1 "prove the deterministic groundwork first" discipline: Stage 1 is reversible and inert; the Critical surface is isolated to Stage 2.

## Pre-conditions

1. The 2026-05-21 design-lock commit is pushed (the locked design exists at `/adopted/purpose-discovery-product-design.md`; the working draft is in `/archive/…-PRE-LOCK.md`). Confirm before starting.
2. A10 is Verified in production (satisfied — `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21`). Not strictly needed until Stage 2's auth gate, but confirm it hasn't regressed.
3. Founder is at a machine where they can run Supabase SQL (SQL Editor) and commit/push via GitHub Desktop between sessions.
4. Production state unchanged from the design-lock close: A10 Live + Verified; substrate at A7 Verified; `SUBSTRATE_LAYER3_ENABLED` UNSET; `SUBSTRATE_R20A_GATE_ENABLED` UNSET; Option D Live.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min) — tier, model selection, risk class, signals, status vocabulary.
2. `/adopted/build-sessions-protocol-cache.md` (~3 min) — build-arc context; the "no current users" note (relaxes CCP step 3 if anything escalates).
3. `/adopted/purpose-discovery-product-design.md` **in full** (~15–20 min) — the locked design. Pay closest attention to: the 24-variant library + four clarification templates (the content to land); D-3 (the `discovery_sessions` shape); D-5 (the substrate Layer 1 extension); D-7 (full persistence + the retention/deletion policy that shapes the table); D-9 (this staging).
4. The substrate's **Layer 1 input** definition — locate it (grep the `website/src/lib/substrate/` and translation-sandwich trees for the Layer 1 input type/schema) so D-5's `discovered_purpose` fields land in the right place. This is the one existing surface Stage 1 touches.
5. `/operations/handoffs/founder/2026-05-21-sage-calling-design-lock-close.md` (~5 min) — the predecessor close.
6. `/operations/decision-log.md` — last 2–3 entries (`D-PURPOSE-DISCOVERY-DESIGN-LOCKED-2026-05-21` + `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21`).

**Confirm at open:** tier (`code-elevated`); hold-point status (P0 0h active); **model selection N/A** (Stage 1 has no LLM calls; the D-4 engine is rule-based and is Stage 2 anyway — cite the cache PR4 row); status vocabulary; signals + risk class; Critical Change Protocol NOT engaged.

**PR5 knowledge-gap scan:** KG1 (Vercel five rules) engages — every DB read/write awaited, no fire-and-forget. KG7 (JSONB) engages — `response_history` + `signals_detected` are JSONB. Read both resolutions before writing the migration.

**PR15 consult:** before any bespoke build, check `.claude/skills/anthropic/` for a relevant primitive. Stage 1 is content + schema authoring; no Anthropic primitive substitutes for it. Record the consult (one line).

## Part B — Procedure

### Step 1 — Locate and confirm the substrate Layer 1 input (no code yet)
Grep for the Layer 1 input type/schema. Confirm exactly where the optional `discovered_purpose` object attaches and that adding optional fields is backward-compatible (no existing caller passes it; nothing breaks if it's absent). Report the file + the insertion point before editing.

### Step 2 — Author the substrate Layer 1 extension (D-5) — the Elevated element
Add an **optional** `discovered_purpose: { work, circle_and_obligation, role, capacity, first_appropriate_act }` to the Layer 1 input (types matching the five-specification template in the locked design). All fields optional; no behaviour change until Sage Calling populates them in Stage 2. Name the rollback (revert the type change) and the verification (tsc clean; existing substrate tests still green) — this is the one Elevated change.

### Step 3 — Author the `discovery_sessions` schema migration (D-3 / D-7)
Idempotent migration (`CREATE TABLE IF NOT EXISTS`) with RLS, for a new `discovery_sessions` table: `id`, `session_id`, `agent_id`, `current_stage`, `response_history` (JSONB), `signals_detected` (JSONB), `gate_status` (the D-14 Hard Gate state), `outcome` (found / null), `started_at`, `completed_at`, `created_at`. Encode the D-7 retention/deletion posture (a deletion path + minimisation — finalise the retention-window value here, recording it). Inline `VERIFY` SELECTs the founder runs in the Supabase SQL Editor. KG1 + KG7 apply.

### Step 4 — Author the content module (the 24 variants + 4 templates)
Lift the **24-variant question library** (4 per stage × Q1–Q6) and the **four clarification templates** **verbatim** from the locked design into a typed content module (constants file or JSON). This is content, not logic — no selection engine (that is Stage 2). Add a content-integrity test: 24 variants present; all six stages covered 4× each; four clarification templates present; text matches the locked design.

### Step 5 — Verify
`tsc --noEmit` clean across the project; the content-integrity test green; existing substrate/translation-sandwich tests still green (the Layer 1 extension must not regress them — run per the CLAUDE.md "Running the substrate test suite" note, using `--env-file=.env.local` for the two Supabase-importing tests). The migration's `VERIFY` SELECTs are the founder's between-sessions step. Confirm explicitly: **no public endpoint, no engine, no auth gate exposed** this stage.

### Step 6 — Append decision-log entry (lean) + session close (lean)
Entry: `D-SAGE-CALLING-STAGE1-BUILD-WIRED-VERIFIED-YYYY-MM-DD`. Status: implementation **Wired** (code + tests Verified in-session) → **Verified** once the founder runs the migration + confirms the VERIFY blocks. Close names **Stage 2 (Critical)** as the next session with its pre-conditions. Founder Verification block: run the migration; commit + push (GitHub Desktop); confirm tsc/tests if desired.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Part A — caches + locked design + Layer 1 locate + close + decision-log | 25–35 min |
| Step 1 — locate Layer 1 input | 10–15 min |
| Step 2 — Layer 1 extension (Elevated) | 20–30 min |
| Step 3 — `discovery_sessions` migration | 30–40 min |
| Step 4 — content module + integrity test | 40–60 min |
| Step 5 — verify | 15–25 min |
| Step 6 — decision-log + close | 20–30 min |
| **Total** | **~2.5–3.5 hr** |

## Rollback path

Pre-push: `git reset --hard`. The migration is idempotent and reversible (`DROP TABLE IF EXISTS discovery_sessions;`); the Layer 1 extension is additive optional fields (revert the type change). Post-push: `git revert` + push via GitHub Desktop; Vercel rebuilds to the pre-Stage-1 shape. **Production behaviour is unchanged throughout** — the optional Layer 1 fields are unused until Stage 2, and there is no public Sage Calling surface in Stage 1.

## Forecast

Stage 1 complete = the content (24 variants + 4 templates), the `discovery_sessions` table, and the additive Layer 1 extension all landed and verified, with **no public surface and no behaviour change**. Stage 2 (Critical, ~4–5 hr, full Critical Change Protocol) then wires the rule-based variant-selection engine, the `POST /api/calling` endpoint, the A10 auth gate (D-6), the Hard Gate + global-flag kill switch (D-14), full-session-persistence wiring (D-7), and the R18d adversarial-evaluation tests (D-13) — and the public surface goes Live, gated by the global flag.

---

*End of prompt. Paste into a fresh session; the session begins under Part A. This is Stage 1 of the staged Sage Calling build (D-9); it is Elevated, reversible, and inert until Stage 2.*
