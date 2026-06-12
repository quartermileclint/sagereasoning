# Next-Session Prompt — Mechanism-Correction Build M1: consult-path levers (CI-1 + CI-17, with CI-2 + CI-3 riding)

**Stream:** founder. **Model:** **Fable 5, maximum reasoning effort** (arc default, founder-directed). **Environment:** Claude Code on the founder's machine (repo + local dev; TEST Supabase for build verification; production deploys only via founder push; **founder-performed steps walked live per PR17**).
**Tier:** `code-elevated` (Elevated default per 0d-ii) **with named Critical guards:** anything touching the R20a distress branch, the A5 wrapper, zone logic, or auth surfaces reclassifies **Critical** (PR6, 0c-ii); **any production env-flag activation is its own 0c-ii step — never bundled into the build**. The schema migration inside M1 is Standard (idempotent additive).
**Governing frame:** `/adopted/standing-protocol-cache.md` (PR1–PR18) + `/adopted/build-sessions-protocol-cache.md` (substrate-build session). PR10 PEV loop governs all code work; PR1 single-endpoint proof; PR2 same-session wire-verification.
**Predecessor close:** `/operations/handoffs/founder/2026-06-12-sage-practice-grounding-close.md` (incl. both addenda).
**Predecessor decision-log entries:** `D-MECHANISM-CORRECTION-BUILD-PLAN-APPROVED-2026-06-12` (all CI-1…CI-17 approved; this session takes M1), `D-SAGE-PRACTICE-METHODOLOGY-AMENDMENTS-ADOPTED-2026-06-12`, `D-SAGE-PRACTICE-METHODOLOGY-MENTOR-CONSULTATION-2026-06-12`, `D-SAGE-PRACTICE-GROUNDING-FRESH-ANALYSIS-BUILD-PLAN-2026-06-12`.

## Why this session matters

M1 is the largest single latency-and-cost lever the P1 test surfaced: today every consult pays ~12–20s of synchronous Sonnet prose in the agent's hot path, and the audit narrative survives nowhere server-side (boolean only). After M1, a consult returns in roughly the engine + auth envelope, the narrative is **guaranteed generated and retained** (the adopted Q2 methodology: a verdict without a narrative is a classification, not an examination), schema-supplying consumers skip server-side L1 on every auth path, and the depth tiers become honest latency tiers. Every later build session verifies faster and cheaper because of this one; a Branch-2 re-run (if the founder ever elects it) presupposes it.

## The approved queue (context — work top-down; this prompt scopes M1 in full; each close writes the next prompt)

| # | Session | Items | Risk envelope |
|---|---|---|---|
| **→ 1** | **M1 — consult-path levers (THIS PROMPT)** | **CI-1 + CI-17, then CI-2, CI-3 riding** | Elevated + Standard schema; Critical guards named |
| 2 | M2 — mint session | CI-6 + CI-7 | Elevated + Standard |
| 3 | M3 — accreditation session | CI-11 + CI-12 (+ CI-4 write-boundary half) | Elevated; Critical-check at the R18f seam |
| 4 | M4 — gate + quick-tier session | CI-8 + CI-9 + CI-10 + CI-16 | Standard ×2 + Elevated ×2; CI-9 diagnostic-only |
| 5 | M5 — practice-completion session | CI-4 (reason-route half) + CI-13 + CI-15 | Elevated |
| 6 | M6/M7 — trajectory persistence | CI-5 (split if needed) | Standard schema + Elevated |
| 7 | M8 — credential consolidation **design** | CI-14 (design only; build = own Critical track) | Standard |

If M1's budget runs out after CI-1 + CI-17 are Verified: close lean, move CI-2 + CI-3 to an M1b prompt. Never carry unverified wiring across a close (PR2).

## Pre-conditions

1. On `main`, tree clean; the approval commit pushed; Vercel green (founder-verified 2026-06-12).
2. `npm install` current in `website/`; `npx tsc --noEmit` passes at open (baseline).
3. TEST environment available per `data-room/04_test_brief/test-env-standup-checklist.md` (test Supabase `iwdtrvuphogkwmovhnvz`; test key pair). **Local `.env.local` is on PRODUCTION** — re-point at TEST before any live-run verification; restore via `cp website/.env.local.prod-backup-2026-05-24 website/.env.local` at close.
4. The AI does no git operations; founder commits by name at close (never `git add .` on build sessions — stage by name; never stage `website/.env.local*` or `tsconfig.tsbuildinfo`).

## Part A — Open under the protocol (read order)

1. `/adopted/standing-protocol-cache.md` (~3 min) + `/adopted/build-sessions-protocol-cache.md`
2. This prompt
3. The build plan items **CI-1, CI-17, CI-2, CI-3 in full** (`/operations/p1-rebuild-2026-06/mechanism-correction-build-plan.md`) + its approval record
4. Grounding dossier rows **B1/B3/B4** + §4.7 (the R17-vs-auditability tension); consultation record **Q2 verdict in full** (`2026-06-12-mentor-consultation-methodology-verdicts.md`)
5. Fresh analysis **FX-3, FX-4, FX-13**
6. **KG1 in full** (`/operations/knowledge-gaps.md`) — engages because CI-1 adds DB writes and post-response work on Vercel; KG7 (JSONB) if the narrative store uses JSONB
7. Manifest targeted: **AC8** (translation-sandwich constraint), **R17** (incl. b/c/h/i), **R18e**, AC2/AC4 (safety awareness — untouched surfaces)
8. Source: `website/src/app/api/reason/route.ts` (the full pipeline; audit write at ~948–972; metering ~593–641; L1-skip ~905), `lib/translation-sandwich/parallel-run.ts`, `layer3-prose.ts`, the A12 audit recorder, `lib/response-envelope.ts`

Confirm at open: tier (`code-elevated`, guards named); hold-point (0h HELD — R&D builds permissible; production-affecting steps classified per 0d-ii); model per AC1 (**L3 stays Sonnet; no model changes this session; no safety-critical call is touched**); status vocabulary; signals + diagnostic-certainty.

## Part B — Procedure

### Step 1 — Design elections presented to the founder BEFORE any code (PEV Plan; Elevated protocol)

Present, with what-could-break + rollback per election:

1. **Flag name** for the deferral behaviour (suggestion: `SUBSTRATE_L3_DEFER_ENABLED`; ships UNSET = today's synchronous shape, byte-identical).
2. **Request affordance** shape (suggestion: `response_format: 'full' | 'assessment_first'`, default `'full'`): `assessment_first` returns extraction + signed assessment + meta immediately; prose generation continues per election 3. **Methodology bind (Q2/CI-17): no request shape may suppress generation — deferral moves it, never removes it.**
3. **The generation-guarantee mechanism** — the load-bearing election. Vercel constraint (KG1): post-response fire-and-forget does not reliably run. Options to present: (a) `waitUntil` (`@vercel/functions`) carrying the L3 call + retention write after the response, **plus a guarantee backstop** (the existing daily cron at `/api/cron/observability` pattern — a sweep that finds loops with `narrative_pending` and completes them); (b) synchronous-but-parallel today / sweep-only tomorrow variants. Whatever is elected must make the narrative **guaranteed**, not best-effort, and every write awaited (KG1 rule 2).
4. **Retention store shape** (suggestion: `substrate_audit_narratives` — keyed by `loop_id`/correlation id; columns: narrative text, the **signed Layer2Assessment** (audit pairing requires it — today nothing persists), R18e Article-50 notice carried with the prose, created_at, retention fields). **R17 elections the founder makes here:** retention period (SR-12 precedent is 90 days; the auditor use-case may argue longer — present the tension, founder decides); **genuine deletion path** (required); whether **R17b app-level encryption** applies to the narrative (it contains input-derived introspective content — SR-12 precedent says yes for intimate fields; founder elects).
5. **Distress guard (Critical boundary, untouched):** the R20a perimeter branch already returns before the engine; for mid-pipeline `distress_signal`, the Layer-C injection path stays **synchronous and non-deferrable** — the deferral flag must be structurally unavailable on that path. If implementing this guard requires touching the distress branch or A5 wrapper itself → STOP, reclassify Critical, 0c-ii visibly.

### Step 2 — Schema migration (Standard; founder-performed, walked live per PR17)

Idempotent additive migration for the retention table — run on **TEST** Supabase SQL editor first, click-by-click with expected results; production migration is a separate walked step at close (or deferred to activation). KG7 applies if JSONB columns are used.

### Step 3 — CI-1 build (flag-gated)

Route + sandwich changes per the elections. PR1: `/api/reason` only. Preserve byte-identical behaviour with the flag unset (assert in tests). A12 audit facts extended (e.g. `narrative_status: inline | deferred | retained`). No metering semantics change (Option D rows unchanged; the L3 cost lands on the loop regardless of when generated — verify).

### Step 4 — CI-17 riding

Existence-guarantee assertions in tests (a deferred consult ends with a retained narrative — sweep path included); docs wording for the blocked configuration (R19e-adjacent, exact Q2 sentence available in the consultation record); **flag the manifest-rule candidate in the close — do not author it**.

### Step 5 — CI-2 build

Extend the existing A2 `layer1_schema` validation to the API-key auth branch (same contract, same 400 semantics); add `meta.layer1_source: 'supplied' | 'server'`; docs note the open-Layer-1 contract on every auth path.

### Step 6 — CI-3 riding

Measure per-depth latency envelopes on TEST (schema supplied + prose deferred vs today's shape); align api-docs/llms.txt/mcp-contract latency claims to **measured, environment-labelled** numbers (R18 honesty — production claims only after production verification; label TEST measurements as such until then).

### Step 7 — Verify (PEV Verify; PR2)

- `npx tsc --noEmit` (full project).
- Test scripts per CLAUDE.md conventions: plain `npx tsx` for engine-only tests; `npx tsx --env-file=.env.local` for any test importing `supabase-server.ts`. New tests: flag-unset byte-identity; deferral path returns assessment-first; narrative retained (TEST DB row); distress path non-deferrable; layer1_schema accepted+validated on API-key path; malformed schema 400s.
- Live-run leg against TEST (`.env.local` re-pointed; dev server restarted; confirm `key_id: substrate-layer2-test` before any call).
- Founder verification per the plan items (walked live): one deferred consult → fast response → narrative retrievable; distress probe → redirect intact; schema-supplied consult on an API key → `layer1_ms: 0`.

### Step 8 — Close (lean) + decision log (lean) + PR18

One lean entry per ride-group (or one for the session) with diagnostic-certainty signalling; status changes (CI-1/CI-17/CI-2/CI-3 → Wired/Verified as earned — **production stays inert: flag unset; production migration + activation are founder-elected 0c-ii steps, possibly at this close, possibly later**); restore `.env.local` to production backup; PR18 production-state rewritten at close only; write the M2 prompt (mint session) per the queue.

## What is NOT in scope

- Any production flag activation inside the build steps (0c-ii at its own step, founder approval specific to named risks).
- The R20a perimeter, distress classifier, zone logic, A5 wrapper internals (Critical guard — touch = stop + reclassify).
- The manifest rule candidate (flag only); M2+ items; the Part-5 benchmark; the 0h call.
- Methodology of any kind — the adopted amendments are fixed input; further methodology questions go back through the mentor gate.

## Rollback

CI-1/CI-2 code: flag-gated (unset = today's behaviour) + `git revert`. Schema: additive table — `DROP TABLE` on revert (TEST first; production only if migrated). CI-3/CI-17 docs: revert. Each election in Step 1 carries its own named rollback before execution (Elevated protocol).

## Anticipated session shape

| Phase | Estimate |
|---|---|
| Open + reads (cache, plan items, KG1, source) | 25–35 min |
| Step 1 design elections (founder live) | 20–30 min |
| Step 2 TEST migration (founder, walked) | 10–15 min |
| Steps 3–4 CI-1 + CI-17 build + tests | 60–90 min |
| Steps 5–6 CI-2 + CI-3 | 30–45 min |
| Step 7 verify (incl. TEST live leg) | 30–40 min |
| Step 8 close + M2 prompt | 25–35 min |
| **Total** | **~3.5–5 h** (split at the CI-1/CI-17 Verified boundary if needed → M1b) |

## Forecast

Success looks like: consults at ~1–2s with the narrative guaranteed and retained server-side under R17 discipline; schema-supplying consumers fast on every auth path; honest measured depth envelopes; production untouched until the founder's own 0c-ii activation step; the M2 prompt ready. The practice's biggest structural overhead is then gone, and every remaining session inherits the speed.

End of prompt. Open on `main`; production inert throughout; the founder performs every environment-touching step live (PR17); nothing activates without 0c-ii.
