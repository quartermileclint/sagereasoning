# Next-Session Prompt — Write-Path Into `agent_accreditation`: Design Pass (post-6b arc, step 7 of 8)

**Stream:** founder.
**Tier:** `governance` — **Standard** risk under 0d-ii. **Lean** template. AC5 / AC7 / PR6 / Critical Change Protocol NOT engaged.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `governance` row → Lean template) + `/adopted/build-sessions-protocol-cache.md` (build-arc context — "no current users" governing note applies but Critical Change Protocol NOT engaged this session).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-16-kathekon-aligned-alternative-build-close.md` (the kathekon-aligned alternative build session that closed step 6 of the post-6b arc).
**Predecessor decision-log entries:** `D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-BUILD-WIRED-VERIFIED-2026-05-16`; `D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-DESIGN-LOCKED-2026-05-16`; `D-HAND-BACK-REPORT-WIRED-VERIFIED-2026-05-16`; `D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16`; `D-ATL-PUBLIC-ACCREDITATION-ENDPOINT-WIRED-VERIFIED-2026-05-16`.
**Sequencing source:** `/operations/handoffs/founder/2026-05-15-post-build-brainstorm-close.md` — step 7 of 8 in the post-6b arc (6b → items 1–3 design → items 1–3 build → trajectory-enriched hand-back report → kathekon-aligned alternative design → kathekon-aligned alternative build → **write-path** → A10).

---

## Why this session matters

After step 6, the substrate's R18a-honest credential surface carries three observable reasoning-pattern signals — `typical_proximity`, `typical_deliberation_breadth`, `typical_kathekon_quality` — all defined in the type system and persisted-capable in Supabase (`agent_accreditation` table; both new columns present and defaulted). But the persistence layer's write functions (`upsertAccreditationRecord`, `appendGradeHistory`, `appendInitialGradeHistory`) are not invoked from anywhere. The table is empty in production. No agent has a row.

This session designs the **write-path** — the surface that actually populates rows. The persistence layer (Component 3) is already Verified; the public read endpoint (`/api/accreditation/[agent_id]`) is Live. What's missing is the writing half.

The write-path is more open-ended than the kathekon-aligned alternative was. The kathekon design started from a locked four-decision precedent (items 1–3 Decision A). The write-path doesn't have an analogous precedent — there are real shape questions: who calls the write functions, when, under what auth, with what idempotency guarantees, and with what observability. These shape choices cascade into the build session's risk class (Elevated or Critical depending on Q1's election).

This session is **design-pass only**. Like the kathekon and items 1–3 design passes, the deliverable is one document: `/adopted/atl-write-path-design.md`, modelled on `/adopted/atl-kathekon-aligned-alternative-design.md`. No code, no schema, no env, no production exposure. The build session follows after.

Plan ~1.5–2.5 hr. The session's load-bearing step is the design-decision gate at Step 2 (seven questions; founder elects each); the rest is reading + drafting + decision-log entry + close.

---

## Pre-conditions

1. **The kathekon-aligned alternative build's commits are pushed; Vercel green.** (Confirmed at session close + founder confirmation post-deploy.)
2. **The Supabase migration `agent_accreditation.typical_kathekon_quality` has been applied** via the SQL Editor; the column is present with default `'contrary'`.
3. **Runtime tests passed on the founder's local environment** for `atl-accreditation-store.test.ts`, `agent-hand-back-report.test.ts`, and `route.test.ts` (the latter run with `--env-file=.env.local` per the supabase-server eager-load chain noted in the kathekon close).
4. **Founder has reviewed `/operations/decision-log.md` entry `D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-BUILD-WIRED-VERIFIED-2026-05-16`** and the build's close.
5. **Production state unchanged from the kathekon build's close:** substrate at A7 Verified; flags UNSET; `/api/reason` byte-identical; `/api/substrate/layer3` returns 503; `/api/accreditation/[agent_id]` Live; `agent_accreditation.typical_deliberation_breadth` and `agent_accreditation.typical_kathekon_quality` columns present and defaulted; the hand-back report module exists, imported by no route.
6. **Founder commits to a ~1.5–2.5 hr bounded session.** Mid-session input is concentrated at Step 2's seven-question design gate; the rest is reading + drafting.

---

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min) — confirm tier (`governance`), risk class (Standard), Lean template, signals, status vocabulary.
2. `/adopted/build-sessions-protocol-cache.md` (~3 min) — build-arc context; the "no current users" governing note applies and is relevant to several design questions (auth, write authorization, multi-tenancy concerns are simplified because only founder + test logins exist).
3. `/operations/handoffs/founder/2026-05-16-kathekon-aligned-alternative-build-close.md` (~5 min) — the immediate predecessor session close.
4. `/adopted/atl-kathekon-aligned-alternative-design.md` (~10 min) — the **structural template** for this design pass. The write-path design document mirrors its shape (seven decisions, each with Why / Elected position / Why this and not the alternatives / Structural constraint / etc.).
5. Targeted code files (~15 min total):
   - `/website/src/lib/substrate/atl-accreditation-store.ts` (in full) — the persistence layer the write-path will invoke. Note the four async functions: `lookupAccreditationRecord`, `upsertAccreditationRecord`, `appendGradeHistory`, `appendInitialGradeHistory`. Also note KG1 + KG7 postures already in place.
   - `/website/src/lib/substrate/atl-wrapper.ts` (the public API + `computeTrajectory` section) — the wrapper produces an updated `AccreditationRecord` on each `computeTrajectory` call; the write-path question is whether `computeTrajectory` itself triggers a persist or whether the wrapper consumer does.
   - `/website/src/app/api/accreditation/[agent_id]/route.ts` (in full) — the existing READ endpoint. The write-path may or may not add a sibling WRITE endpoint at this same route group.
   - `/website/src/lib/substrate/trust-layer/accreditation/public-endpoint.ts` (in full) — `handleAccreditationLookup`'s design pattern is the precedent for any new `handleAccreditationWrite` style handler.
   - `/website/supabase-agent-accreditation-migration.sql` (skim) — the DDL with the trigger that stamps `updated_at` on every UPDATE. Relevant for atomicity Q4.
6. `/operations/decision-log.md` — the last three entries (`D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-BUILD-WIRED-VERIFIED-2026-05-16`, `D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-DESIGN-LOCKED-2026-05-16`, `D-HAND-BACK-REPORT-WIRED-VERIFIED-2026-05-16`).
7. **PR11 inbox scan** — list `/inbox/` files dated since 2026-05-16. Confirm F1–F4 in `/operations/agentic-commerce-findings-downstream-order.md` for write-path relevance: F3 is potentially relevant (A5 retrospective re A5 Layer3Response as substrate-consultation-mandate producer; some echo into the write-path's AC10 provenance question Q7); F1, F2, F4 do not target this session.
8. **PR15 consult** — `.claude/skills/anthropic/` review. For a design-pass governance session, the candidate primitives are `skill-creator` / `doc-coauthoring` / `frontend-design`; the kathekon design pass found none substitutes for founder-led design elections captured by AI in a governance document. Bespoke election expected to mirror that finding.

**Confirm at open:** tier (`governance`); hold-point status (P0 0h active); model selection N/A (no LLM calls); status vocabulary; signals + risk classification.

---

## Part B — Procedure

### Step 0 — Scope confirm (~5 min)

State scope: produce `/adopted/atl-write-path-design.md` modelled on `/adopted/atl-kathekon-aligned-alternative-design.md` — seven decisions locked. **NOT in scope this session:** code; schema; env; route wiring; the build session itself (the natural next session); A10 (step 8 of the post-6b arc). Founder confirms via AskUserQuestion at session open.

### Step 1 — Surface the seven design questions (~10–15 min)

Present the seven candidate design questions for founder review with the cascading note (Q1's election narrows Q2–Q7's option spaces):

- **Q1 — Write-path surface.** Where does the call to the persistence layer originate? Three candidate shapes: (a) **library-only** — a new function (e.g., `persistCarriedProfile(profile)`) in the wrapper or sibling module, invoked by any wrapper consumer; no HTTP surface; (b) **route + library** — both a library function AND a new POST route (e.g., `POST /api/accreditation/[agent_id]`) that takes a serialised record and persists; (c) **route-only** — a new POST endpoint that owns the entire write surface.
- **Q2 — Write trigger.** When does the write happen? (a) **on every `computeTrajectory` call** — every accumulated action eventually persists; (b) **on grade transition only** — writes only when `evaluateGradeTransition` yields a non-no-op; (c) **on explicit `persistAccreditation` call** — the wrapper consumer decides when; (d) **hybrid** — explicit-call-driven but with grade-transition events emitting `appendGradeHistory` automatically.
- **Q3 — Auth model.** Who can write to which `agent_id`? (a) **internal-only** — write surface is not exposed externally; wrapper-internal calls only; auth is "whoever can call the wrapper"; (b) **agent_id-ownership check** — the route checks an `agent_id`-signed token (paralleling A10's per-agent credential model, though A10 is downstream); (c) **shared-secret header** — a simple `X-Atl-Write-Key` env var for the founder's tooling; (d) **founder-only / no public write** — the route is internal to the SageReasoning team or doesn't exist.
- **Q4 — Initial-seed vs trajectory-update separation.** One entry point or two? (a) **one** — a single `persist(profile)` handles both first-write and updates; the function decides internally whether to call `appendInitialGradeHistory` or `appendGradeHistory`; (b) **two** — distinct `seedAccreditation(profile)` and `updateAccreditation(profile)` functions; the consumer chooses; (c) **lookup-first** — the function looks up the existing row and decides; idempotent on either call.
- **Q5 — Atomicity (the `agent_accreditation` upsert + `grade_history` append).** What's the consistency guarantee? (a) **two awaited writes; not transactional** — first the upsert succeeds, then the history append; failure between leaves history one step behind (acceptable for an append-only audit trail); (b) **single Supabase RPC** — wrap both in a Postgres function called via `supabaseAdmin.rpc(...)`; transactional but requires a new SQL function; (c) **history-first then upsert** — invert the order so a failure leaves history ahead of state (forensic-friendly but never-persisted).
- **Q6 — Idempotency.** What if the same record is written twice? (a) **idempotent upsert** — `agent_accreditation`'s `onConflict: 'agent_id'` already handles this; `grade_history` may receive duplicate rows (acceptable; audit trail is append-only and duplicates are visible); (b) **client-provided idempotency key** — the wrapper passes a UUID with each write call; server-side `grade_history` constraint rejects duplicates; (c) **content-hashed idempotency** — server computes a hash of the record content; same-content writes are no-ops.
- **Q7 — Observability.** What's logged / surfaced when the write-path runs? (a) **minimal** — Supabase already logs writes; no app-level telemetry beyond errors; (b) **structured app-level logging** — emit a JSON event per write (`agent_id`, `event_type`, `actions_evaluated`) to console (Vercel logs); (c) **AC10 provenance fields on the row** — write_source, write_timestamp, wrapper_version columns added to `agent_accreditation` (requires a separate schema migration; defer); (d) **emit GradeChangeEvent webhook payload** — when a transition fires, also emit the existing `buildGradeChangeEvent` shape to a configured webhook URL (open question — webhook URL config; defer to follow-on).

If the founder elects to defer any of Q5/Q6/Q7 (atomicity, idempotency, observability) under PR7 with revisit conditions, that's fine — those are the questions least likely to be load-bearing for the first write-path implementation.

Surface a folding suggestion: if Q1 elects (c) route-only, Q4 likely folds into the route's request-shape design. If Q1 elects (a) library-only, Q3 likely collapses to "internal-only" automatically.

### Step 2 — Design-decision gate (~30–45 min)

AskUserQuestion in three or four rounds (group Q1+Q2; Q3+Q4; Q5+Q6+Q7 — or one batch per question if the founder prefers). For each, present the candidate options with the reasoning the design document will record. Founder elects each in turn. The AI does not prescribe; it surfaces options, constraints, and risks.

### Step 3 — Draft design document (~20–30 min)

Single Write call lands `/adopted/atl-write-path-design.md` — modelled on `/adopted/atl-kathekon-aligned-alternative-design.md`. Structure:

- Status / Stream / Governs / Does-not-govern / Sequencing block;
- Scope (what's in, what's deferred under PR7);
- The underlying motivation (one paragraph naming why the write-path matters now);
- Seven per-decision sections (A–G), each with:
  - Why
  - Elected position
  - Why this and not the alternatives
  - Structural constraint (where applicable)
  - Field shape / Function signatures (where applicable)
  - R-rule engagement
  - Layer 1 implication
- Build-session implementation summary table — the file changes the build session will land (paralleling the kathekon design's table at the bottom);
- Cross-references.

### Step 4 — Verify (founder read) (~5–10 min)

Founder reads `/adopted/atl-write-path-design.md` and confirms the seven decisions match the Step 2 elections. If anything reads wrong, edit before proceeding to the decision-log entry.

### Step 5 — Append decision-log entry (lean form) (~10–15 min)

`D-ATL-WRITE-PATH-DESIGN-LOCKED-YYYY-MM-DD`. Lean form per `/adopted/standing-protocol-cache.md`. Rules served expected: 0a, 0c, 0d-ii, 0f, R0, R3, R4, R6c (if any qualitative-only constraint surfaces), R17 (where data-handling questions touch — write authorization and idempotency border on R17a profile-protection territory), R18a (if any badge-language change is implied; unlikely), R18c (additive vs versioning), AC8 (translation-sandwich substrate), AC10 (if Q7 elects provenance), PR1 (build session is the single-build proof), PR7 (deferred items named), PR10 (Plan), PR11 (inbox scan recorded), PR15 (Anthropic-primitive consult outcome).

### Step 6 — Session close (lean form) (~15–20 min)

`/operations/handoffs/founder/YYYY-MM-DD-write-path-design-pass-close.md` per the Lean template. "Next Session Should" names the **write-path build** as the natural next session, with the design document as the spec. Risk class for the build session: **Elevated** if Q1 elects (a) library-only; **Critical** if Q1 elects (b) or (c) route + auth.

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Part A — caches + predecessor close + design template + code files + decision-log + PR11 + PR15 | 25–35 min |
| Step 0 — scope confirm | 5 min |
| Step 1 — surface the seven design questions | 10–15 min |
| Step 2 — design-decision gate | 30–45 min |
| Step 3 — draft design document | 20–30 min |
| Step 4 — Verify (founder read) | 5–10 min |
| Step 5 — decision-log entry | 10–15 min |
| Step 6 — session close | 15–20 min |
| **Total** | **~2–3 hr** |

The natural pause point if the session runs long is after Step 2 (the elections are locked but the design document is not yet drafted; the next session could draft from the elections + decision-log entry). The founder elects whether to take that pause if it arises.

---

## Rollback path

Governance-only. If any of A–G is reconsidered before the write-path build session lands, append a superseding decision-log entry (`D-ATL-WRITE-PATH-DESIGN-REVISED-YYYY-MM-DD`) marking the original entry `Superseded by D-…`. Edit the design document in a follow-on Elevated session (edits to an adopted governance document are Elevated under 0d-ii). No production-state recovery required — nothing is built this session.

---

## Forecast

A successful design pass produces:

- `/adopted/atl-write-path-design.md` (NEW; Adopted) — seven locked design decisions defining the write-path's surface, trigger, auth model, separation, atomicity, idempotency, and observability.
- A decision-log entry (`D-ATL-WRITE-PATH-DESIGN-LOCKED-YYYY-MM-DD`) recording the elections.
- A session close pointing at the build session as the next step.

After this session, the build session's scope is well-bounded by the design (paralleling how the kathekon-aligned alternative build opened against `D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-DESIGN-LOCKED-2026-05-16` + the design document). The write-path build session's risk class is determined by Q1's election (Elevated for library-only; Critical for any route + auth surface).

The post-6b arc then has one step remaining: **step 8 — A10 per-agent credentials** (the per-agent credential + revocation surface that consumes the write-path's row + the kathekon credential).

*End of prompt.*
