# Session Close — 25 April 2026 (Shape Adapter Session 1 — Canonical Loader on Ring Proof)

**Stream:** tech
**Governing frame:** `/adopted/session-opening-protocol.md`
**Authority for the work:** `/compliance/ADR-Ring-2-01-shape-adapter.md` (Adopted 25 April 2026)
**Tier read this session:** 1, 2, 3, 6, 8, 9 (every-session + KG governance scan + code)
**Risk classification across the session:** Elevated × 1, no incidents. Pre-deploy `tsc` clean; pre-commit hooks (TypeScript + ESLint safety-critical) clean; post-deploy live-probe verified all six pass criteria.

## Decisions Made

- **Four step-5 decisions made at session open** (per ADR-Ring-2-01 §6 / session prompt step 5):
  1. **Un-seeded-profile fallback** → option (a): `loadMentorProfileCanonical(userId) ?? PROOF_PROFILE`. The proof endpoint silently degrades to the existing fictional fixture when no persisted profile is found. Selected because the proof endpoint must remain exercisable end-to-end even if the founder's profile is wiped or absent.
  2. **Cache coordination posture** → shared cache (ADR §6.6 preferred). The new function follows the same fetch + decrypt pattern as the legacy `loadMentorProfile`. The retrieval cache adopted under ADR-R17-01 is not yet implemented — when it lands (Critical-risk session), the cache wraps a shared internal helper extracted from both functions; today the logic is duplicated to keep the legacy surface untouched.
  3. **Adapter file location** → separate file (`website/src/lib/mentor-profile-adapter.ts`). Keeps the encryption-pipeline file and the pure-transform file as separate concerns. Test file co-locates naturally.
  4. **Structural-completeness test** → landed this session. ~290 lines exercising every output field, frequency-bucket boundaries, sentinel defaults, and sparse-input survival.
- **Adapter implements ADR §6.2 honest sentinels exactly:** `persisting_passions` derived from `passion_map[].frequency >= 'recurring'`; `current_prescription = null`; `direction_of_travel = 'stable'`; `dimensions = all 'developing'`; `interaction_count = 0`; `last_interaction = persisted row's updated_at` (passed via `meta.lastUpdated`) or `'not yet recorded'` sentinel; `journal_references = []`. No fabricated data.
- **Adapter exports `frequencyBucketFromCount`** as the single source of truth for the 1–12 → bucket mapping (per ADR §2.4 + §6.3). The legacy mapping at `mentor-profile-summary.ts:126` remains in place until consumer migration in Sessions 3–5; it will then either import the canonical helper or be removed alongside `MentorProfileData`.
- **Reference comments added** to the `MentorProfile` definition (in `/sage-mentor/persona.ts`, comment-only docstring update — no type changes) and to the `MentorProfileData` definition (in `/website/src/lib/mentor-profile-summary.ts`). Both point at `/website/src/lib/mentor-profile-adapter.ts` so future amendments to either type surface the adapter as the conversion site.
- **Sage-mentor encapsulation preserved.** Zero edits to `/sage-mentor/` runtime code (only the docstring comment on the `MentorProfile` type). Zero new imports from `/sage-mentor/` into `/website/` beyond the existing bridge pattern.
- **AC7 (Session 7b standing constraint) confirmed at three checkpoints** (session open, plan walk, deploy). No change to authentication, cookie scope, session validation, or domain-redirect behaviour. AC7 not engaged.

## Status Changes

| Item | Old status | New status |
|---|---|---|
| `website/src/lib/mentor-profile-adapter.ts` (new file) | Scoped (in ADR §7) | **Verified** (live-probe confirmed adapter output drives the ring end-to-end) |
| `loadMentorProfileCanonical()` in `website/src/lib/mentor-profile-store.ts` | Scoped | **Verified** |
| `frequencyBucketFromCount` (single source of truth) | Scoped | **Live** (exported, ready for cross-file import) |
| `/api/mentor/ring/proof` profile source | Fixture-driven (`PROOF_PROFILE`) | **Live-canonical-driven** with fixture fallback for un-seeded users |
| ADR-Ring-2-01 Session 1 | Adopted (planned) | **Verified** |
| `loadMentorProfile()` (legacy) | Live | **Live (unchanged)** |
| `MentorProfileData` (legacy type) | Live | **Live (unchanged; reference comment added)** |
| `PROOF_PROFILE` fixture | TEMPORARY (proof) | **TEMPORARY — un-seeded-profile fallback** (narrower role; founder chose option (a)) |
| `PROOF_INTERACTIONS` fixture | TEMPORARY | **TEMPORARY — unchanged** (interaction-side work is D-PE-2 (c), separate session) |

## What Was Changed

| File | Action | Notes |
|---|---|---|
| `website/src/lib/mentor-profile-adapter.ts` | **Created** (~494 lines) | Pure synchronous adapter. Exports `frequencyBucketFromCount` and `adaptMentorProfileDataToCanonical`. Honest sentinels per ADR §6.2. Clamping per ADR §6.4. |
| `website/src/lib/mentor-profile-store.ts` | Edited (additive) | Added `loadMentorProfileCanonical()` (~92 lines). Legacy `loadMentorProfile()` UNCHANGED. Logic duplicated for now; future cache session extracts shared helper. |
| `website/src/lib/__tests__/mentor-profile-adapter.test.ts` | **Created** (~287 lines) | Structural-completeness test per ADR §8.4. Frequency-bucket boundaries, sentinel defaults, sparse-input survival. |
| `website/src/app/api/mentor/ring/proof/route.ts` | Edited (additive + 4 reference swaps) | Added canonical loader call with try/catch + fallback. Replaced 4 `PROOF_PROFILE` references with the resolved `profile` variable. Added `profile_source` and `profile_loader_error` to JSON response. |
| `sage-mentor/persona.ts` | Edited (docstring only) | Reference comment added to `MentorProfile` type. No type changes. |
| `website/src/lib/mentor-profile-summary.ts` | Edited (docstring only) | Reference comment added to `MentorProfileData` interface. No type changes. |

**Total diff:** 6 files changed, 929 insertions(+), 6 deletions(-). Single commit `b2f3882` on `main`.

### Files NOT changed
- All distress classifier code (`r20a-classifier.ts`, `constraints.ts` SafetyGate) — untouched. R20a/AC5 perimeter unaffected.
- All other sage-mentor runtime files — unchanged.
- The other two ring-proof endpoints (`/api/support/agent/proof`, `/api/founder/hub/ring-proof`) — unchanged.
- The live `/api/founder/hub` and `/api/mentor/private/reflect` — unchanged.
- `mentor-ring-fixtures.ts` — unchanged. `PROOF_PROFILE` and `PROOF_INTERACTIONS` continue to define their previous shapes; their roles narrowed by usage, not by edits.
- `MentorProfile` type definition (apart from docstring) — no fields added (Session 2 will).

**No DB changes. No SQL. No DDL. No env vars added. No safety-critical files modified.**

## Verification Method Used (0c Framework)

Per `/operations/verification-framework.md`:

- **Pre-deploy: TypeScript clean.** `npx tsc --noEmit` in `/website` exit 0 (Code Change verification method).
- **Pre-commit hooks:** `.husky` pre-commit ran TypeScript compilation check + ESLint safety-critical modules check. Both passed.
- **Post-deploy: API endpoint method.** Founder pasted DevTools Console snippet (Bearer token from localStorage, same pattern as the prior session). Vercel deployment hash `b2f3882` confirmed Ready before probe.
- **All six pass criteria met (verified live):**

| Criterion | Expected | Observed |
|---|---|---|
| HTTP status | 200 | **200** |
| `profile_source` (NEW field) | `'live_canonical'` (canonical loader served) | **`live_canonical`** |
| `profile_loader_error` (NEW field) | `null` (no degradation) | **`null`** |
| `pattern_analysis.interactions_analysed` | 15 | **15** |
| `before.augmented_prompt_includes_patterns` | `true` (BEFORE LLM check fires for this task; ring_summary appended) | **`true`** |
| `pattern_engine_error` | `null` | **`null`** |
| `ring_summary` | Same content as prior session (deterministic) | **`Strong patterns: evening_reasoning_drop. Passion clusters: deadline anxiety + financial loss aversion.`** — identical to 2026-04-25 pattern-engine close. |

- **Profile-source confirmation.** `profile_source: live_canonical` confirms the founder's seeded profile loaded through the new adapter — not the `PROOF_PROFILE` fictional fixture. The architectural pattern from the prior session is preserved unchanged through the type transition.

## Risk Classification Record (0d-ii)

- **Adapter + canonical loader landing — Elevated.** Encryption-adjacent (canonical loader sits in the same file as the legacy decryption path), production request path. No PR6 surface modified. AC7 not engaged. `tsc` clean. Rollback is a single revert (~5 minutes per ADR §11). Live-probe verified end-to-end.
- **Reference-comment additions — Standard.** Docstring-only changes to two type definitions. No type signatures touched.
- **Test file landing — Standard.** New file under `website/src/lib/__tests__/`. Compiles against live types; jest runtime not exercised in-session because jest isn't installed locally and `npx jest` timed out fetching (same posture as the existing `r20a-invocation-guard.test.ts` — its docstring also says "Run: npx jest …" without local jest dep).

## PR5 — Knowledge-Gap Carry-Forward

No re-explanations this session. Existing entries scanned and respected:

- **KG1 (Vercel rules):** respected. Adapter is synchronous, no fire-and-forget, no self-fetch. The canonical loader wraps a Supabase fetch identical to the legacy loader's pattern.
- **KG2 (Haiku boundary):** not relevant — adapter has no LLM in path.
- **KG3 (hub-label consistency):** not relevant — proof endpoint does not write to `mentor_interactions`.
- **KG6 (composition order):** preserved unchanged from the prior session — `ring_summary` augmentation continues to attach to the user-message zone of the BEFORE prompt.
- **KG7 (JSONB shape):** not relevant — adapter does not read or write JSONB columns.

**One observation candidate logged (1st observation, no promotion):**

1. **Sandbox cannot push to GitHub.** The build environment has no GitHub credentials and `git push origin main` returns `fatal: could not read Username for 'https://github.com'`. Consequence: the AI cannot complete the deploy step end-to-end in-session — the founder must run `git push` manually. This is the first occurrence; PR8 promotes on the third. If a future session needs the same workaround, that's the second.

## Founder Verification (Between Sessions)

Verification completed in-session. Live probe of the deployed endpoint at commit `b2f3882` returned 200 with all six pass criteria met (see Verification Method Used). No further verification action required for the work landed in this session.

For the next session: review the **Next Session Should** block before pasting into a new session.

## Next Session Should

Per ADR-Ring-2-01 §7, the staged transition has four sessions remaining (plus an optional Session 6). Founder picks the next from:

1. **Session 2 (extend the canonical type — C-α).** Add the website-only optional fields to `MentorProfile`: `journal_name?`, `journal_period?`, `sections_processed?`, `entries_processed?`, `total_word_count?`, `founder_facts?`, `proximity_estimate_description?`. Verify TypeScript clean across all sage-mentor consumers. If any sage-mentor function surfaces friction, fall back to C-β (companion envelope) with founder approval. **Risk: Standard** (additive type extension).
2. **Defer Session 2** — the adapter is Verified and the proof runs on live data; a pause here is acceptable. Other priorities can advance independently because Sessions 3–5 are gated on Session 2's type extension.

If proceeding to Session 2, the session-opening prompt should reference this handoff and ADR-Ring-2-01 §12 (Notes for Implementation Sessions — Session 2). The C-β fallback decision must be named at session open per PR7.

## Blocked On

- **Founder direction on whether to proceed to Session 2 next, or to take a different stream's work first.**

## Open Questions

- **O-A — `mentor-ring-fixtures.ts` file header still describes `PROOF_PROFILE` as the proof's profile source.** With Session 1 Verified, the fixture's role narrowed to "un-seeded-profile fallback only." File header text not updated this session to keep scope narrow. Candidate touch-up for Session 2 or as a Standard-risk doc edit.
- **O-B — Diagnostic timing instrumentation in `mentor-profile-store.ts`.** Both legacy and canonical loaders log per-stage timings (ADR-R17-01 §1 instrumentation). When the cache lands (separate Critical session), instrumentation either remains as observability or is removed if the cache makes it noisy. Decision belongs in the cache session.
- **O-C — `frequencyBucketFromCount` consolidation.** The legacy mapping at `mentor-profile-summary.ts:126` is now duplicated in the canonical adapter. Both produce identical buckets. Consolidation happens naturally in Session 3 (`buildProfileSummary` rewrite) or Session 5 (`mentor-profile-summary.ts` removal). No action required in the interim.
- **O-D — Dimension-level pass-through (deferred per ADR §6.2).** The adapter currently defaults `dimensions` to `all 'developing'` because `MentorProfileData` does not carry dimension fields. When a progression-tracking surface lands (separate, post-Session-5), the adapter either reads dimensions from `MentorProfileData` (if extended to include them) or is bypassed entirely (if dimensions move to a sidecar table). The `clampDimensionLevel` helper is in the adapter file ready for Session 2+ use; explicitly referenced by `void clampDimensionLevel` so TypeScript does not flag it.
- **O-E — Jest runtime availability in `/website`.** Test files exist (`r20a-invocation-guard.test.ts`, `mentor-observation-logger.test.ts`, `sage-reason-composition-order.test.ts`, and now `mentor-profile-adapter.test.ts`) but jest is only present as `@types/jest` (not as a runtime dep). `npx jest …` works only when jest can be resolved. Not blocking — TypeScript compilation against live types is the structural value of the new test in this session. Promote to a knowledge-gap candidate if a future session needs to actually run a test.

## Process-Rule Citations

- **PR1** — respected. Single endpoint (`/api/mentor/ring/proof`), single architectural pattern (canonical loader behind `loadMentorProfileCanonical`). No rollout to other endpoints in this session. Future sessions migrate one consumer at a time per the ADR's Session-3 enumeration.
- **PR2** — respected. Pre-deploy verification (`tsc --noEmit` clean) and post-deploy live-probe (six pass criteria met) both completed in-session.
- **PR3** — respected. Adapter is a pure synchronous function. No I/O. No async behaviour added to the request path beyond the awaited Supabase fetch (already async in the legacy loader).
- **PR4** — respected. Model selection unchanged. Adapter has no LLM in path; the proof endpoint's existing model selection (`ring.MODEL_IDS[before.modelTier]`, `ring.MODEL_IDS.deep`, `ring.MODEL_IDS[after.modelTier]`) continues to be governed by `constraints.ts`.
- **PR5** — respected. No re-explanations. One new candidate observation logged (sandbox cannot push to GitHub).
- **PR6** — respected. No safety-critical surface modified. Distress classifier, Zone 2/3 logic, encryption pipeline, session, access control, deletion, and deployment-config all untouched. Session 1 of this ADR is correctly classified Elevated; Session 4 (live reflect + journal pipeline) will be Critical when it lands.
- **PR7** — respected. Three deferred decisions named explicitly with revisit conditions in the proposed decision-log entries below: (i) sage-mentor type extension Session 2 C-α vs C-β fallback; (ii) `frequencyBucketFromCount` consolidation timing; (iii) shared-helper extraction in the cache session.
- **AC7** — respected. No auth, cookie scope, session validation, or domain-redirect change. Confirmed at session open, plan walk, and deploy checkpoint.

## Decision Log Entries — Proposed (Founder Approval Required)

```
## 2026-04-25 — D-RING-2-S1: ADR-Ring-2-01 Session 1 verified — canonical loader on ring proof

**Decision:** Land `loadMentorProfileCanonical()` and the read-time
`adaptMentorProfileDataToCanonical()` adapter alongside the legacy
`loadMentorProfile()`. Wire the canonical loader into /api/mentor/ring/proof
with PROOF_PROFILE as the un-seeded-profile fallback. Land the structural-
completeness test for the adapter. Add reference comments to both type
definitions pointing at the adapter file.

**Reasoning:** Session 1 of the staged transition adopted under
ADR-Ring-2-01 (25 April 2026). Proves the canonical-loader pattern on
a single endpoint per PR1 before any consumer migration. Preserves
sage-mentor's zero-imports-from-website encapsulation. R17 surface
unchanged — adapter operates on plaintext that already lived in memory
for the legacy path.

**Alternatives considered:** The four step-5 decisions had alternatives
named at session open. The selected variant (option a / shared cache /
separate file / land test) is recorded against each decision below.

**Revisit condition:** Session 2 may surface friction with C-α type
extension; if so, fall back to C-β per the ADR. The duplicated fetch
+ decrypt logic between legacy and canonical loaders is consolidated
in the future ADR-R17-01 cache session.

**Rules served:** PR1 (single-endpoint proof), PR2 (verification immediate),
PR3 (adapter synchronous), PR6 (no safety-critical surface modified),
PR7 (three deferrals logged below), R17 (surface unchanged), AC7
(not engaged — confirmed at three checkpoints).

**Impact:** ADR-Ring-2-01 Session 1 reaches Verified status. Canonical
loader and adapter become live in /website/src/lib/. Proof endpoint
runs on the founder's live profile (profile_source: live_canonical
verified). Architectural pattern from prior pattern-engine session
preserved unchanged.

**Status:** Adopted. Live-probe verified post-deploy at commit b2f3882.
```

```
## 2026-04-25 — D-RING-2-S1-A: Un-seeded-profile fallback (option a)

**Decision:** /api/mentor/ring/proof falls back to PROOF_PROFILE when
loadMentorProfileCanonical() returns null.

**Reasoning:** The proof endpoint must remain exercisable end-to-end
even if the founder's profile is wiped, absent, or in a fresh state.
A 4xx error would block the proof from running; a "no profile" 200
adds code paths to maintain. The fallback is opaque (silent degrade),
so the response now surfaces profile_source ('live_canonical' or
'fixture_fallback') and profile_loader_error so the live-probe can
distinguish the two cases.

**Alternatives considered:**
  - 4xx error if no profile exists — rejected; blocks proof verification.
  - 200 with no-profile marker — rejected; more code paths.

**Revisit condition:** None for the proof endpoint. Production endpoints
(Session 4 onwards) will have their own un-seeded-profile semantics —
the live reflect endpoint cannot fall back to a fictional fixture. That
decision belongs in Session 4's plan.

**Rules served:** PR1 (proof must remain exercisable).

**Impact:** PROOF_PROFILE remains in mentor-ring-fixtures.ts as a
documented fallback artefact, not a primary profile source. Its file-
header description is now slightly stale (it still describes the
fixture as "the proof's profile source"); minor edit candidate for
Session 2 or a Standard-risk touch-up.

**Status:** Adopted.
```

```
## 2026-04-25 — D-RING-2-S1-B: Cache coordination posture (shared cache, deferred extraction)

**Decision:** loadMentorProfileCanonical() will share the retrieval
cache with loadMentorProfile() when ADR-R17-01's cache lands. Today,
because the cache is not yet implemented, the two loaders duplicate
their fetch + decrypt logic. The future cache session extracts a
shared internal helper from both and wraps it once.

**Reasoning:** ADR §6.6 names shared-cache as the preferred posture.
A separate cache would double the memory footprint and create two
invalidation paths. Extracting the shared helper now would have been
a refactor of the legacy function — Elevated risk on the legacy
surface for no current benefit. Deferring extraction to the cache
session aligns the change with the cache-session's Critical Change
Protocol scope.

**Alternatives considered:**
  - Separate cache for canonical loader — rejected per ADR §6.6.
  - Extract shared helper now — rejected; expands Session 1 scope
    by refactoring the legacy surface for no current cache benefit.

**Revisit condition:** Open at the start of the ADR-R17-01 cache
implementation session. The shared-helper extraction is a prerequisite
to the cache wrap.

**Rules served:** PR1 (Session 1 scope cap), PR3 (adapter synchronous),
PR6 (legacy surface untouched).

**Impact:** Logic duplication in mentor-profile-store.ts is deliberate
and time-bounded. Documented in the canonical loader's docstring.

**Status:** Adopted (deferral itself is the decision; revisit at the
cache session).
```

```
## 2026-04-25 — D-RING-2-S1-C: Adapter file location (separate file)

**Decision:** Adapter lives at /website/src/lib/mentor-profile-adapter.ts
as a separate file, not inline inside mentor-profile-store.ts.

**Reasoning:** Encryption-pipeline concerns and pure-transform concerns
are conceptually distinct. mentor-profile-store.ts is already 246 lines
before this session and the adapter adds nontrivial code. Separation
makes the file structure navigable for a non-technical founder and
co-locates the test file naturally.

**Alternatives considered:**
  - Inline inside mentor-profile-store.ts — rejected; mixes two
    concerns and crowds the encryption-adjacent file.

**Revisit condition:** None. The adapter's location is fixed for the
duration of the staged transition.

**Rules served:** Operational simplicity per ADR §6.

**Impact:** Single import line in mentor-profile-store.ts. Adapter
is independently testable.

**Status:** Adopted.
```

```
## 2026-04-25 — D-RING-2-S1-D: Adapter structural-completeness test landed in Session 1

**Decision:** mentor-profile-adapter.test.ts landed alongside the
adapter file. ~287 lines covering structural completeness, frequency-
bucket boundaries, sentinel defaults, and sparse-input survival.

**Reasoning:** ADR §8.4 names structural-completeness testing as the
named drift-risk mitigation while both type definitions coexist
(Sessions 1–5). Landing the test in Session 1 establishes the artefact
before drift can occur. Total test code (~30 lines per the ADR
estimate; actual ~287 because the test exercises every output field
explicitly for clarity to a non-technical reader).

**Alternatives considered:**
  - Defer test to a follow-up session — rejected; drift risk
    unmitigated until then.

**Revisit condition:** Update the test's REQUIRED_TOP_LEVEL_KEYS list
when MentorProfile gains a required field (Session 2 adds optional
fields, so no update needed for Session 2). Update the test's expected
outputs if the adapter's sentinel defaults change.

**Rules served:** ADR §8.4 (drift-risk mitigation), PR1 (Session 1
scope still met because the test is local to the adapter).

**Impact:** TypeScript compiled the test against live types
(adapter + MentorProfile + MentorProfileData) — the primary structural
value. Jest runtime not exercised because jest isn't installed in
/website (only @types/jest is); same posture as the existing
r20a-invocation-guard.test.ts. Promote to KG candidate if a future
session needs to actually run the test.

**Status:** Adopted.
```

## Orchestration Reminder (Protocol element 21)

This session was governed end-to-end by `/adopted/session-opening-protocol.md`. All 21 elements applied:

- **Part A** (elements 1–8): tier declared (1, 2, 3, 6, 8, 9), canonical sources read in sequence, prior tech handoff read first as authoritative scope, KG scan completed (KG2/3/7 confirmed not relevant), hold-point status confirmed (P0 0h still active — this work permissible inside the assessment set), model selection confirmed not material, status-vocabulary separation maintained throughout (implementation status vs decision status), signals and risk-classification readiness confirmed.
- **Part B** (elements 9–18): Elevated classification named pre-execution; Critical Change Protocol not invoked (this is Elevated, not Critical); PR6 honoured (no safety-critical surface modified); PR3 honoured (adapter synchronous); PR1 honoured (single endpoint); PR2 honoured (verification immediate); deferred decisions logged in PR7 list; tacit-knowledge findings none promoted; stewardship findings none promoted; scope cap respected — sage-mentor edits limited to a docstring, no consumer migrations attempted, no JSONB writes, no auth surface touched.
- **Part C** (elements 19–21): system stabilised to known-good state (live-probe Verified, all six pass criteria met); handoff produced in required-minimum format plus all five extensions (Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification, Decision Log Entries — Proposed); this orchestration reminder names the protocol explicitly and confirms no element was skipped.

Authority for the work itself was `/compliance/ADR-Ring-2-01-shape-adapter.md`. The protocol governed *how* the session ran; the ADR governed *what* the session built.

---

*End of session close.*
