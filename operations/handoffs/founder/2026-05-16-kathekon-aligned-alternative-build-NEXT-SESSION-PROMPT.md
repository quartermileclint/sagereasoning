# Next-Session Prompt — Kathekon-Aligned Alternative: Build (post-6b arc, step 6 of 8)

**Stream:** founder.
**Tier:** `code-elevated` — **Elevated** risk under 0d-ii. **Lean + Elevated additions** template. AC5 / AC7 / PR6 NOT engaged. Critical Change Protocol NOT engaged.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `code-elevated` row → Lean + Elevated additions template) + `/adopted/build-sessions-protocol-cache.md` (build-arc context — "no current users" governing note applies but Critical Change Protocol is NOT engaged this session).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-16-kathekon-aligned-alternative-design-pass-close.md` (the design pass that locked the seven decisions).
**Predecessor decision-log entries:** `D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-DESIGN-LOCKED-2026-05-16`; `D-HAND-BACK-REPORT-WIRED-VERIFIED-2026-05-16`; `D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16`.
**Sequencing source:** `/operations/handoffs/founder/2026-05-15-post-build-brainstorm-close.md` — step 6 of 8 in the post-6b arc (6b → items 1–3 design → items 1–3 build → trajectory-enriched hand-back report → kathekon-aligned alternative design → **kathekon-aligned alternative build** → write-path → A10).
**Spec:** `/adopted/atl-kathekon-aligned-alternative-design.md` — Adopted 2026-05-16; seven decisions A–G; the build-session implementation summary table at the bottom of the design is the file-change checklist for this session.

---

## Why this session matters

The kathekon-aligned alternative design pass adopted seven decisions specifying an additive parallel credential beside proximity. This build session implements all seven as a single Elevated-risk build per PR1 single-build proof — paralleling the items 1–3 build's shape exactly.

The structural pattern is Decision A's `typical_deliberation_breadth` (built 2026-05-16 under `D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16`) mirrored for kathekon quality: one new aggregator computation, one new field on `WindowSnapshot`, one new field on `AccreditationRecord` + `AccreditationPayload`, one new Supabase column, threading through the grade-transition engine's three transition paths (no logic change — just field carriage), and two small additions to the hand-back report renderer (Section 2 + Section 3).

After this session, the kathekon-aligned alternative is Wired + Verified at type-check, and the post-6b arc moves to step 7 (the write-path into `agent_accreditation`).

The session is bounded. Plan ~3–4 hr. Expect minimal mid-session founder input — the design has already done the load-bearing decision work; the build session's Step 1 is a small surface survey + implementation-decision gate (file naming for new helpers, whether to re-export `KathekonQuality` vs duplicate it, ordering of new fields in types — items the design explicitly leaves as build-session discretion).

---

## Pre-conditions

1. **The kathekon-aligned alternative design pass's commits are pushed; Vercel green.** (Confirmed at design-pass session close + founder confirmation post-deploy.)
2. **Founder has reviewed `/operations/decision-log.md` entry `D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-DESIGN-LOCKED-2026-05-16`** and `/adopted/atl-kathekon-aligned-alternative-design.md` — the seven decisions A–G match the founder's intent.
3. **Production state unchanged from the design-pass close:** substrate at A7 Verified; flags UNSET; `/api/reason` byte-identical; `/api/substrate/layer3` returns 503; `/api/accreditation/[agent_id]` Live; `agent_accreditation.typical_deliberation_breadth` column present and defaulted; the hand-back report module exists, imported by no route.
4. **No env-var changes; no auth-surface changes; no R20a-perimeter changes anticipated this session.** Elevated risk — additive types + module changes + Supabase column addition. Critical Change Protocol NOT engaged.
5. **Founder commits to a ~3–4 hr bounded session.** Mid-session input minimal — design has done the heavy lifting.

---

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min) — confirm tier (`code-elevated`), risk class (Elevated), Lean + Elevated additions template, signals, status vocabulary.
2. `/adopted/build-sessions-protocol-cache.md` (~3 min) — build-arc context; the "no current users" governing note applies.
3. `/operations/handoffs/founder/2026-05-16-kathekon-aligned-alternative-design-pass-close.md` (~5 min) — the immediate predecessor session close.
4. `/adopted/atl-kathekon-aligned-alternative-design.md` (in full, ~10 min) — **the spec.** The seven decisions A–G and the build-session implementation summary table are the build's instructions.
5. `/adopted/atl-items-1-3-design.md` Decision A section (~3 min) — the structural pattern. The kathekon build mirrors this section's shape exactly, substituting `KathekonQuality` for `DeliberationBreadth`, `typical_kathekon_quality` for `typical_deliberation_breadth`, and `'contrary'` for `'intuited'` as the empty-window baseline.
6. Targeted code files — read the parts that the build will touch:
   - `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` lines ~205–215 (`KathekonAssessment` + the `KathekonQuality` type — confirm shape).
   - `/website/src/lib/substrate/trust-layer/types/evaluation.ts` (full file — Decision B target; the `DeliberationBreadth` pattern at lines ~100–145 is the precedent).
   - `/website/src/lib/substrate/trust-layer/types/accreditation.ts` (full file — Decision C target; `typical_deliberation_breadth` placement is the precedent).
   - `/website/src/lib/substrate/trust-layer/evaluation-window/window-aggregator.ts` — `computeDeliberationBreadthDistribution` + `computeTypicalDeliberationBreadth` are the helpers to copy-and-rename for the kathekon equivalents.
   - `/website/src/lib/substrate/trust-layer/grade-engine/grade-transition-engine.ts` — three transition paths thread `typical_deliberation_breadth` into the returned record; the kathekon equivalent goes alongside on the same three paths.
   - `/website/src/lib/substrate/trust-layer/accreditation/accreditation-record.ts` — `createAccreditationRecord` seeds `typical_deliberation_breadth`; `buildAccreditationPayload` projects it; the kathekon equivalents go alongside.
   - `/website/src/lib/substrate/atl-accreditation-store.ts` — the row mapper for `typical_deliberation_breadth` is the precedent.
   - `/website/src/lib/substrate/agent-hand-back-report.ts` — `renderTrajectorySection` + `renderGradeSection` are the helpers gaining one or two lines each.
   - Existing test files that supply `typical_deliberation_breadth` in fixtures — find them and add the kathekon equivalent (search `typical_deliberation_breadth` for the precedent locations).
7. `/operations/decision-log.md` — `D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-DESIGN-LOCKED-2026-05-16` (the spec); `D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16` (the structural-pattern build precedent).
8. **PR11 inbox scan** — list `/inbox/` files dated since 2026-05-16. Confirm F1–F4 in `/operations/agentic-commerce-findings-downstream-order.md` — none target this session (F1: FPE-5; F2: Stage 4 G3; F3: A6/A7 past; F4: A12 — none kathekon-build-relevant).
9. **PR15 consult** — `.claude/skills/anthropic/` review. The kathekon build's PR15 outcome mirrors Decision A's: `frontend-design` / `internal-comms` / `doc-coauthoring` all wrong domain for additive credential aggregation + rendering; bespoke election correct because the existing precedent is bespoke and the kathekon work is a parallel of that precedent.

**Confirm at open:** tier (`code-elevated`); hold-point status (P0 0h active); model selection N/A (no LLM calls); status vocabulary; signals + risk classification.

---

## Part B — Procedure

### Step 0 — Scope confirm (~5 min)

State scope: implement the seven decisions A–G from the design as a single Elevated-risk build, paralleling the items 1–3 build's shape. **NOT in scope:** writing the write-path that populates the new column (step 7 of the post-6b arc); A10 (step 8); changing any proximity-driven logic; touching authority mapping logic; touching Layer 1 schema (Decision E: no Layer 1 change). Founder confirms via AskUserQuestion at session open.

### Step 1 — Surface survey + implementation-decision gate (~20–30 min)

Read the targeted code files. Surface the small build-session-discretion choices the design left open:

1. **`KathekonQuality` location.** Re-export from `layer2-mechanisms.ts`, or duplicate the enum literal type in `trust-layer/types/evaluation.ts` (mirroring how `trust-layer/` is self-contained — its banner notes re-declaration is the established pattern). The design suggests duplication as the lower-friction default; the build session confirms.
2. **`computeKathekonQualityDistribution` + `computeTypicalKathekonQuality` placement.** Same file as the deliberation-breadth helpers (`window-aggregator.ts`); the design names this; the build session confirms.
3. **Migration filename.** `/website/supabase-agent-accreditation-typical-kathekon-quality-migration.sql` (mirroring the existing `…-typical-deliberation-breadth-migration.sql` from the items 1–3 build).
4. **Test fixture extensions.** The same fixtures that supply `typical_deliberation_breadth` (`makeAssessment`, `makeFixedSnapshot`, `withFixedRecordTimestamps`, route test's `SAMPLE_PAYLOAD` + `SAMPLE_RECORD`) extend to supply `typical_kathekon_quality` + `kathekon_quality_distribution`. New tests parallel the deliberation-breadth tests added in items 1–3.

If anything surfaces that the design didn't anticipate, escalate to the founder via AskUserQuestion. Otherwise, the founder confirms the four implementation-discretion picks in one batch and the build proceeds.

### Steps 2–7 — Module + test edits (~90–120 min)

Implement per the design's "Build-session implementation summary" table (the file-by-file checklist). The structural pattern is identical to the items 1–3 build's Decision A implementation, substituting:

- `DeliberationBreadth` → `KathekonQuality`
- `typical_deliberation_breadth` → `typical_kathekon_quality`
- `deliberation_breadth_distribution` → `kathekon_quality_distribution`
- `computeDeliberationBreadthDistribution` → `computeKathekonQualityDistribution`
- `computeTypicalDeliberationBreadth` → `computeTypicalKathekonQuality`
- `'intuited'` (default) → `'contrary'` (default)
- `starting_deliberation_breadth` → `starting_kathekon_quality`
- `…-typical-deliberation-breadth-migration.sql` → `…-typical-kathekon-quality-migration.sql`

The kathekon aggregation iterates `EvaluatedAction.kathekon_quality` per-action (already on the type — no field addition to `EvaluatedAction` needed). The threshold reuses `WindowConfig.typical_proximity_threshold` (the same 60% convention — no new config field).

The grade-transition engine's three paths (no-transition, upgrade, downgrade) each spread `typical_kathekon_quality: snapshot.typical_kathekon_quality` into the returned record on the same line where they spread `typical_deliberation_breadth`. The engine LOGIC does not consume kathekon — it just threads the field.

The hand-back report's Section 2 trajectory rendering adds:
- A `typical_kathekon_quality` headline line (matches the existing `typical_deliberation_breadth` line).
- A `kathekon_quality_distribution` line (matches the existing `deliberation_breadth_distribution` line).

The hand-back report's Section 3 grade-section rendering adds one line for `typical_kathekon_quality` projected from the payload — alongside the existing `typical_deliberation_breadth` line.

### Step 8 — Tests (~30–45 min)

Extend the existing test files. The test additions parallel the Decision A test additions in the items 1–3 build:

- `atl-accreditation-store.test.ts` — fixture extension; round-trip tests.
- `accreditation-record.test.ts` (if exists) — seeding tests.
- `__tests__/agent-hand-back-report.test.ts` — RENDER-* tests for the new Section 2 + Section 3 lines.
- The route test `/website/src/app/api/accreditation/[agent_id]/__tests__/route.test.ts` — payload-shape fixture extension.
- New aggregator tests for `computeKathekonQualityDistribution` + `computeTypicalKathekonQuality` (mirroring the Decision A precedent in the existing aggregator test file).

PR2 build-to-wire immediate: every test addition runs against the just-written code in the same session.

### Step 9 — Verify (~15 min)

**In-session:** `npx tsc --noEmit -p tsconfig.json` runs CLEAN. The runtime `npx tsx` test commands likely cannot run in the sandbox (esbuild platform mismatch — the documented sandbox limitation per the items 1–3 build close and the hand-back report close); founder runs runtime tests locally per the Founder Verification block.

Verification methodology: Diagnostic-certain — root cause identified per PR10 PEV-loop Verify step (the structural pattern is the items 1–3 build's Decision A precedent; the kathekon equivalents are direct substitutions; tsc passing confirms the type-shape integrity).

### Step 10 — Append decision-log entry (lean + Elevated additions form)

`D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-BUILD-WIRED-VERIFIED-YYYY-MM-DD`. Lean + Elevated additions per `/adopted/standing-protocol-cache.md`. Rules served expected: 0a, 0c, 0d-ii, 0f, R0, R3, R4, R6c, R18a, R18b, R18c, R18e (NOT engaged at credential level), AC8, KG1 (Vercel rules — no fire-and-forget, no self-calls, no redirects), PR1 (single-build proof), PR2 (build-to-wire immediate), PR7 (deferred items named), PR10 (PEV), PR11 (inbox scan clean), PR15 (Anthropic-primitive consult mirrors Decision A's — bespoke election correct).

Elevated additions: rollback path; what could break; founder-performable verification commands.

### Step 11 — Session close (lean + Elevated additions form)

`/operations/handoffs/founder/YYYY-MM-DD-kathekon-aligned-alternative-build-close.md` per the Lean + Elevated additions template. "Next Session Should" names the **write-path into `agent_accreditation`** (step 7 of the post-6b arc).

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Part A — caches + design + items 1–3 design Decision A + code-file shapes + decision-log + PR11 + PR15 | 25–35 min |
| Step 0 — scope confirm | 5 min |
| Step 1 — surface survey + implementation-decision gate | 20–30 min |
| Steps 2–7 — module + test edits | 90–120 min |
| Step 8 — tests | 30–45 min |
| Step 9 — Verify | 15 min |
| Step 10 — decision-log entry | 20–30 min |
| Step 11 — session close | 20–30 min |
| **Total** | **~3.5–4.5 hr** |

The natural pause point if the session runs long is after Step 7 (the code is written; tests + verification + decision-log + close are the next bounded chunks). The founder elects whether to take that pause if it arises.

---

## Rollback path

**Code rollback:** `git revert HEAD --no-edit` + push via GitHub Desktop. After Vercel rebuild (~2 min), all additive types revert to their pre-session shape; the new aggregator helpers and the migration SQL file are removed; the hand-back report's Section 2 + Section 3 additions are removed; `/api/reason`, `/api/substrate/layer3`, `/api/accreditation/[agent_id]`, and `/api/public-key` are byte-identical.

**Supabase rollback:** `ALTER TABLE public.agent_accreditation DROP COLUMN IF EXISTS typical_kathekon_quality;` via the SQL Editor — empty-table-safe (no write-path exists yet for this column).

---

## What could break (Elevated additions)

1. **Existing tests fail** because the additive `WindowSnapshot` / `AccreditationRecord` / `AccreditationPayload` fields are required somewhere a fixture didn't supply them. Mitigation: tsc --noEmit must run clean after every fixture extension; the items 1–3 build's precedent identified the four canonical fixture locations.
2. **Supabase migration fails** — default mismatch. Mitigation: `ADD COLUMN IF NOT EXISTS … NOT NULL DEFAULT 'contrary'` — idempotent, defaulted, runs against an empty table.
3. **Grade-engine field-threading miss** — one of the three transition paths returns a record without `typical_kathekon_quality`. Mitigation: tsc catches this at type-check (the field is non-optional on `AccreditationRecord`); the items 1–3 build's pattern names the three locations explicitly.
4. **Hand-back report rendering breaks determinism** — the new lines accidentally read the clock or use randomness. Mitigation: the additions are pure Markdown line additions reading existing fields; no new I/O, no new randomness. The hand-back report's existing DET-1 test asserts byte-identical output for identical input.
5. **`KathekonQuality` enum drift between layer2-mechanisms.ts and the trust-layer port** if duplicated rather than re-exported. Mitigation: the design recommends duplication (matching the trust-layer's self-contained pattern); the enum is small and stable; a comment cross-referencing the canonical definition is required.

---

## Forecast

A successful build session produces:

- All seven design decisions (A–G) implemented as additive code changes (paralleling the items 1–3 build's Decision A precedent exactly).
- A new Supabase column (`agent_accreditation.typical_kathekon_quality`) — additive, empty-table-safe.
- The hand-back report's Section 2 + Section 3 gain the kathekon credential rendering, mirroring how Decision A's `typical_deliberation_breadth` is currently rendered.
- `npx tsc --noEmit` runs clean in-session; runtime tests pass on the founder's local run.
- A decision-log entry recording the build (`D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-BUILD-WIRED-VERIFIED-YYYY-MM-DD`).
- A session close pointing at the next step (step 7 of the post-6b arc — the write-path into `agent_accreditation`).

After this session, the substrate's R18a-honest credential surface carries three observable reasoning-pattern signals: `typical_proximity` (HOW the agent reasoned, load-bearing for grade + authority); `typical_deliberation_breadth` (whether the agent intuited / deliberated / multi-branch deliberated); `typical_kathekon_quality` (whether the agent's actions were typically fitting). Three signals, one Character Kernel umbrella, R4-clean and R18c-additive.

The post-6b arc moves to step 7 (write-path) next; then step 8 (A10 per-agent credentials) closes the arc.

*End of prompt.*
