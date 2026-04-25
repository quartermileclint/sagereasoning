# Session Close — 25 April 2026 (Pattern-Engine Proof on Mentor-Ring)

**Stream:** tech
**Governing frame:** `/adopted/session-opening-protocol.md`
**Tier read this session:** 1, 2, 3, 6, 8, 9 (every-session + KG governance scan + code)
**Risk classification across the session:** Elevated × 1, no incidents. Pre-deploy `tsc` clean; post-deploy live-probe verified all six pass criteria.

## Decisions Made

- **Assessment-first conducted before any code.** Pattern-engine source was characterised (deterministic pure functions, no DB access, no LLM in main analysis), the dependency chain was mapped, the R17 isolation surface was located, the BEFORE-pass injection point was confirmed, and the change was risk-classified. Founder reviewed the assessment and signalled "proceed as per recommendations" — limiting this session to Recommendation 1 only (mentor-ring fixture-driven proof). Recommendations 2–5 are queued for separate sessions.
- **Three open decisions named explicitly as deferred (PR7).** Each is required before live-data integration of pattern-engine and is logged here for the next sessions to pick up:
  1. **Shape adapter (D-Ring-2 carried)** — pattern-engine consumes `MentorProfile` (sage-mentor shape); the website only loads `MentorProfileData`. Same blocker as the ring-wrapper itself. Resolves once for both.
  2. **Pattern-storage location** — there is no slot in `MentorProfile` or `MentorProfileData` or the `mentor_profiles` table for `PatternAnalysis`. Three options: new column on `mentor_profiles` (Elevated), new field inside the encrypted blob (Critical, PR6), sidecar table with own RLS (Elevated). Needs an ADR before code.
  3. **Live `mentor_interactions` loader for pattern-engine** — does not exist. The closest analogue (`getMentorObservations` in `mentor-context-private.ts`) does NOT fetch `passions_detected` or `mechanisms_applied`, both of which pattern-engine requires. New loader will be Critical risk under R17 (per-user isolation must be explicit in SQL when using `supabaseAdmin`, not RLS-dependent).
- **PR1 single-endpoint proof built, type-checked, and ready for deploy.** Three additive edits: `PROOF_INTERACTIONS` fixture (15 hand-crafted interactions), pattern-engine bridge re-exports, and `analysePatterns` integration into `/api/mentor/ring/proof`.

## Status Changes

- `sage-mentor/pattern-engine.ts` — was **Live-as-module / isolated** (zero imports from `website/src`); now **Wired-as-module → Verified** via the bridge into the mentor-ring proof endpoint (post-deploy live-probe confirmed deterministic analysis runs end-to-end on production).
- `website/src/lib/sage-mentor-ring-bridge.ts` — extended (additive) with pattern-engine type re-exports and three function refs (`shouldRunPatternAnalysis`, `analysePatterns`, `buildPatternNarrativePrompt`). Status: **Live → Verified** (tsc clean + live-probe).
- `website/src/lib/mentor-ring-fixtures.ts` — extended (additive) with `PROOF_INTERACTIONS: InteractionRecord[]`. Status: **Live → Verified** (tsc clean + live-probe). TEMPORARY — retires when the live loader lands alongside the shape adapter.
- `website/src/app/api/mentor/ring/proof/route.ts` — extended (additive) with the pattern-engine pass and BEFORE-prompt augmentation. Status: **Live → Verified** (live-probe returned 200; all six pass criteria met).

## What Was Changed

| File | Action |
|---|---|
| `website/src/lib/mentor-ring-fixtures.ts` | Edited — added `InteractionRecord` import, `PROOF_INTERACTIONS` const (~190 lines, 15 fixture interactions) |
| `website/src/lib/sage-mentor-ring-bridge.ts` | Edited — added 5 pattern-engine type re-exports, 3 function refs in `RingFunctions`, 3 entries in `loadRingFunctions` return |
| `website/src/app/api/mentor/ring/proof/route.ts` | Edited — added `PROOF_INTERACTIONS` + `PatternAnalysis` imports, deterministic pattern-engine pass with try/catch, BEFORE prompt augmentation when LLM check fires, two new fields in JSON response (`pattern_analysis`, `pattern_engine_error`, plus `before.augmented_prompt_includes_patterns`) |

### Files NOT changed
- All distress classifier code (`r20a-classifier.ts`, `constraints.ts` SafetyGate) — untouched, invoked only via the existing `enforceDistressCheck` call.
- `mentor-profile-store.ts`, `mentor-context-private.ts`, `practitioner-context.ts` — unchanged.
- All sage-mentor source files — unchanged.
- The other two proof endpoints (`/api/support/agent/proof`, `/api/founder/hub/ring-proof`) — code unchanged; they consume the bridge but only the surfaces they already used.
- The live `/api/founder/hub` and `/api/mentor/private/reflect` — untouched.

**No DB changes. No SQL. No DDL. No env vars added. No safety-critical files modified.**

## Verification Method Used (0c Framework)

- **Pre-deploy: TypeScript clean.** `npx tsc --noEmit` in `/website` exit 0. Confirms bridge signatures match pattern-engine exports and the route's new field types are sound.
- **Post-deploy: API endpoint method per verification framework (PR2).** AI provided a DevTools Console snippet (terminal-free per founder preference); founder pasted into Console at sagereasoning.com (signed in as the gmail founder account), pasted JSON response back. First snippet failed with 401 — AI snippet had relied on cookies; the website's auth gate is Bearer-only via `auth-fetch.ts` pattern. Corrected snippet pulls the access_token from `localStorage` (`sb-<projectref>-auth-token`) and sets `Authorization: Bearer <token>`. Re-run returned 200.
- **All six pass criteria met (verified live):**
  - (1) `pattern_analysis` present with all five fields — `computed_at`, `interactions_analysed: 15`, `temporal_patterns: [1]`, `passion_clusters: [1]`, `regression_warnings: []`, `has_novel_patterns: true`, `ring_summary: "..."`.
  - (2) `ring_summary === "Strong patterns: evening_reasoning_drop. Passion clusters: deadline anxiety + financial loss aversion."`
  - (3) `interactions_analysed === 15`.
  - (4) `before.augmented_prompt_includes_patterns === true`.
  - (5) `pattern_engine_error === null`.
  - (6) Regression sanity: existing fields all present (`token_summary` total $0.0183, `inner_output` non-empty, `after.result.reasoning_quality: "deliberate"`, `before.raw_llm_json` well-formed).
- **Detector behaviour observed (no false positives):**
  - Time-of-day detector fired with `strong` strength (9 evidence points) — designed-for behaviour.
  - Passion cluster detector fired (deadline anxiety + financial loss aversion, co-occurrence 2, career context) — designed-for behaviour.
  - Day-of-week, context-type, regression detectors silently did not fire — all correctly below their thresholds with the fixture data (day-of-week needs ≥10 with passions; fixture has 6. Context-type needs ≥0.6 rate in a context; career is 0.5, financial 0.33. Regression needs historical entries; PROOF_PROFILE's only passion is recent).
- **Augmented prompt downstream signal:** BEFORE-LLM output references "phantasia katalēptikē gone unchecked"; AFTER-LLM `pattern_note` says "the pattern suggests this is not an isolated episode." The pattern summary reached the model and was reasoned over.

## Risk Classification Record (0d-ii)

- **Pattern-engine proof wiring — Elevated.** Three additive file edits. No PR6 surface (no encryption, session, deletion, classifier, or deployment-config changes). No DB writes. No live data. Existing two ring proofs unaffected (additive bridge only). `tsc` clean. Rollback is single revert. **Cost prediction was off:** AI predicted +$0.001 per call; actual was +$0.0045 ($0.0138 → $0.0183). Reason: the augmentation increased input tokens AND the LLM produced more output tokens responding to the added context. Still inside the proof's cost envelope. Logged here for future estimation accuracy.
- **Storage decision (deferred) — risk varies (Elevated / Critical / Elevated by option).** Logged for the next session to ADR before code.
- **Live `mentor_interactions` loader (deferred) — Critical.** R17 boundary; `.eq('profile_id', profileId)` must be explicit in SQL when using `supabaseAdmin`, not RLS-dependent.

## PR5 — Knowledge-Gap Carry-Forward

No re-explanations this session. Existing entries scanned and respected:

- **KG1 (Vercel rules):** respected — pattern-engine call is synchronous in the request path; no fire-and-forget; no self-fetch.
- **KG2 (Haiku boundary):** respected — pattern-engine main analysis is deterministic (no LLM); the optional novel-pattern narrative path uses Sonnet per its docstring.
- **KG3 (hub-label consistency):** preserved — proof does not write to `mentor_interactions`. Hub-scoping decision deferred to the loader work.
- **KG6 (composition order):** respected — `ring_summary` is appended to the BEFORE prompt in the user-message zone, after the existing structured prompt, same authority level as profile context.
- **KG7 (JSONB shape):** not exercised this session (no JSONB read/write).

**One candidate observation logged (1st observation, no promotion):**

1. **Shape mismatch between pattern-engine `InteractionRecord` and `mentor_interactions` row.** `InteractionRecord.passions_detected[]` is `{passion: string; false_judgement: string}` whereas the table column stores `{root_passion, sub_species, false_judgement}`. The future loader must map between these. Same family of issue as the existing `MentorProfile` vs `MentorProfileData` mismatch — both stem from sage-mentor evolving its own type taxonomy in parallel with the website. Logged as a candidate; if it costs the next session real time, that is the second observation.

**One candidate observation carried forward from the prior session in this stream (2nd of 3 needed for PR8 promotion):**

- **Session-opening prompts may misframe scope vs the prior handoff.** Today's opening prompt said pattern-engine is "currently isolated… zero imports from `website/src`." That part was accurate (verified with `grep`). The prompt also instructed me to assess before coding, which matches the protocol. **No misframing this session — the prompt and the on-disk reality matched.** The prior 1st observation (yesterday's opening) is therefore not promoted today. If a future session's opening prompt diverges from the handoff again, that is the second.

## Founder Verification (Between Sessions)

Verification completed in-session. Live probe of the deployed endpoint returned 200 with all six pass criteria met (see Verification Method Used above for the values). No further verification action required for the work landed.

For next session: review the **Next Session Should** block before pasting into a new session.

## Next Session Should

1. **Open with the session-opening protocol.** Read this handoff, scan KG (KG3 likely most relevant when the loader is built), confirm hold-point posture (still active).
2. **Confirm the live-probe result.** If the founder ran the snippet, paste the JSON back; AI confirms pass criteria.
3. **If proof is Verified — pick one of the three deferred items (founder choice):**
   - **Option A:** Resolve the shape adapter (D-Ring-2). Three approaches: one-way `MentorProfileData → MentorProfile` adapter, refactor ring to accept `MentorProfileData`, or unify the two shapes. ADR before code.
   - **Option B:** Produce the storage ADR for `PatternAnalysis`. Three options: column on `mentor_profiles`, field inside encrypted blob, sidecar table. Each with R17 footprint.
   - **Option C:** Build the live `mentor_interactions` loader scoped to one user/hub, returning the `InteractionRecord` shape. Critical-risk under R17 — full Critical Change Protocol (0c-ii) applies. Includes the shape mapping noted in PR5 above.
   - The live integration into `/api/mentor/private/reflect` requires ALL THREE of A, B, C resolved first. Founder may want to do A and B in one session, then C in a second, then live integration in a third.
4. **Keep pattern-engine wired in the proof endpoint** — it has no cost when the BEFORE LLM check does not fire (deterministic pass only) and adds ~$0.001 when it does. Useful as a regression check while the deferred items get built.

## Blocked On

- **Founder direction on which deferred item to take next** (A / B / C in "Next Session Should" above).

## Open Questions

- **Q1 — Should regression detection be exercised in the proof?** Currently no — `PROOF_PROFILE.passion_map[].last_seen` is `2026-04-20`, well within the 30-day cutoff. To exercise, either age the fixture's `last_seen` to >30d or add a passion with `frequency: 'rare'`. Both would change the existing PROOF_PROFILE used by the ring-wrapper proof, which is currently Verified — risk of regression. Filed; not blocking.
- **Q2 — Should the proof also exercise `buildPatternNarrativePrompt`?** It would mean a second LLM call (Sonnet) when `has_novel_patterns === true`. Cost adds ~$0.005 per request. Excluded this session to keep PR1 minimal; can be added once the proof is Verified if there's diagnostic value.
- **Q3 — Hub-scoping of patterns.** Pattern-engine treats interactions as one stream. When the loader is built, the design call is one analysis per user (cross-hub) vs one per (user, hub). The latter respects KG3 boundaries; the former gives broader cross-session signal. Decision belongs in the loader's ADR.

## Process-Rule Citations

- **PR1** — respected. Single endpoint (mentor-ring proof), single architectural pattern (pattern-engine output → BEFORE prompt augmentation). No live-code rollout.
- **PR2** — respected. Pre-deploy verification (`tsc --noEmit` clean) done in-session. Post-deploy live-probe also completed in-session — all six pass criteria met. First probe failed with 401 due to a Bearer-vs-cookie auth misframe in AI's snippet; corrected and re-run successfully.
- **PR3** — preserved. Pattern-engine call is synchronous; no async behaviour introduced; the BEFORE LLM check still completes before the response is constructed.
- **PR4** — respected. Model selection unchanged (`ring.MODEL_IDS[before.modelTier]` already governed by `constraints.ts`).
- **PR5** — respected. One new candidate observation (1st), one carry-forward (2nd) — neither promotes today.
- **PR6** — respected. No safety-critical surface modified. The deferred loader will require full Critical Change Protocol when built.
- **PR7** — respected. Three deferred decisions named explicitly with revisit conditions in the proposed decision-log entries below.

## Decision Log Entries — Proposed (Founder Approval Required)

```
## 2026-04-25 — D-PE-1: Pattern-engine PR1 proof on mentor-ring endpoint

**Decision:** Build an additive pattern-engine pass on /api/mentor/ring/proof,
fixture-driven (PROOF_PROFILE + new PROOF_INTERACTIONS), deterministic, with
BEFORE-prompt augmentation when the BEFORE LLM check fires. PR1 single-endpoint
proof of pattern-engine wiring before any rollout.

**Reasoning:** Pattern-engine had zero imports from website/src. Wiring directly
into a live flow (e.g., /api/mentor/private/reflect) would have required
resolving the shape adapter, the storage location, and the loader pattern in
one session — exactly the multi-session-recovery pattern PR1 was written to
prevent. The proof exercises the architectural pattern (analysePatterns →
ring_summary → BEFORE prompt augmentation) on a fixture surface, isolating
the wiring from the data and storage decisions.

**Alternatives considered:** Wire directly into private-mentor — rejected;
mixes pattern-engine wiring with shape, storage, and loader decisions.
Skip the proof and ADR everything first — rejected; the proof reveals
which design questions actually need answering and de-risks the deferred
work. Add a fixture loader for mentor_interactions and wire to the live
loader pattern — rejected; same scope creep, defeats PR1.

**Revisit condition:** None. PR1 satisfied. Future sessions wire each
dependent item (shape adapter, storage decision, loader) separately.

**Rules served:** PR1, PR2, PR4, PR6 (no safety-critical surface),
PR7 (three deferred decisions logged below).

**Impact:** sage-mentor/pattern-engine.ts moves from Live-as-module/isolated
to Wired-as-module. mentor-ring proof endpoint gains pattern_analysis field
in JSON response and conditional BEFORE-prompt augmentation. Two temporary
fixture artefacts (PROOF_INTERACTIONS plus retained PROOF_PROFILE) documented
as retiring when the loader and shape adapter land.

**Status:** Adopted. Live-probe verified post-deploy.
```

```
## 2026-04-25 — D-PE-2: Three-decision deferral for live pattern-engine integration

**Decision:** Defer three decisions to separate sessions, each prerequisite
for live-data wiring of pattern-engine into /api/mentor/private/reflect:
  (a) Shape adapter (MentorProfile vs MentorProfileData) — same blocker as
      D-Ring-2; resolves once for both ring-wrapper and pattern-engine.
  (b) Pattern-storage location for PatternAnalysis — column on mentor_profiles,
      field inside encrypted blob, or sidecar table. ADR before code.
  (c) Live mentor_interactions loader returning InteractionRecord[] for one
      user/hub — does not exist; explicit per-user SQL scoping required;
      KG3 hub-scoping decision must be made.

**Reasoning:** Each item carries its own design decision with its own R17
footprint. Combining any two into one session reproduces the multi-session-
recovery pattern PR1 was written to prevent.

**Alternatives considered:** Bundle (a) + (b) + (c) into one session — rejected;
PR1 violation. Skip (b) by computing PatternAnalysis on every request — rejected;
defeats the deterministic-batch-with-cache architecture pattern-engine was
designed for. Skip (c) by using fixtures permanently — rejected; pattern-engine
delivers no diagnostic value without live cross-session data.

**Revisit condition:** Each decision opens at the next session targeting that
item. Founder selects sequence. Live integration into /api/mentor/private/reflect
opens only after all three are resolved.

**Rules served:** PR1, PR7. Each downstream item will respect PR6 (loader is
Critical) and KG3 (hub-label consistency in the loader).

**Impact:** Pattern-engine remains wired only on the proof endpoint until
the three items are resolved. The proof acts as a regression check during
the intervening sessions.

**Status:** Adopted (deferral itself is the decision; each item has its own
revisit condition above).
```

## Orchestration Reminder (Protocol element 21)

This session was governed end-to-end by `/adopted/session-opening-protocol.md`. All elements applied. Element 5 (hold-point status) was confirmed at open — P0 0h still active; pattern-engine wiring is permissible because it's clearly inside the hold-point assessment set. Element 7 (status-vocabulary separation) was applied throughout — implementation status (Wired-as-module, Live, Verified) and decision status (Adopted) kept distinct. Element 9 (change classification) was named pre-execution as Elevated. Element 13 (PR1 single-endpoint proof) was the framing for the entire session. Element 14 (PR2 verification immediate) was satisfied for the pre-deploy step (`tsc` clean) and the post-deploy verification path is documented for the founder. Element 18 (scope caps) was respected — Recommendations 2–5 were explicitly excluded from this session. No element was skipped.

---

*End of session close.*
