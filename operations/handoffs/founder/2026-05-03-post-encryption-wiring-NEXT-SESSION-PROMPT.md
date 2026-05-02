# Next-Session Prompt — Phase-2 Pass-1 Commencement (D14b Deferral-Resolution Surface) — CRITICAL risk

**Stream:** founder.
**Tier:** founder/governance + code scope.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-03-encryption-wiring-implementation-close.md`.
**Predecessor decision-log entries (most recent on top):**
- `D-ENCRYPTION-WIRING-IMPLEMENTED-2026-05-03` (encryption helpers + schema deployed; ADR-ENCRYPTION-WIRING-01 executed end-to-end; Pattern B + Path A adaptations recorded; ALL Phase-2 pass-1 preconditions now complete)
- `D-ENCRYPTION-WIRING-ADR-ADOPTED-2026-05-02` (the ADR the predecessor session executed)
- `D-REGISTRY-UPDATE-v1.5.0-2026-05-02` (registry baseline)
- `D-D2-AMENDMENT-2026-05-02` (D2 v1.1.0 — D24 coverage gaps integrated)
- `D-VALIDATION-ADDENDUM-PROMOTED-2026-05-02` (architectural-conventions catalogue)

**Governing deliverables for this session (read in full at session open):**
- `/adopted/rag-mentor-alt3/reflect-endpoint-14b-deferral-resolution.md` (D14b — **the surface specification this session builds**)
- `/adopted/rag-mentor-alt3/migration-plan.md` (D21 — § Phase-2 Pass 1 build steps, the canonical step ordering)

**Risk classification: Critical** under PR6 + AC5 (ninth-route discipline) + R17 (intimate-data perimeter expansion). The Critical Change Protocol (project instructions 0c-ii) is the operative discipline. Pass-1 is a **larger** Critical session than the encryption-wiring session — it adds a new route + new page + R20a perimeter expansion + engine integration + 8 founder-performable verifications. Time-box accordingly; expect to use a natural pause point (see § Anticipated session shape below).

---

## Why this session matters

D14b is **the load-bearing Phase-1 deliverable** per the alt-3 architecture's commitment that *"the examination matters more than the scoring engine."* Phase 2 builds the **deferral-resolution surface first** per AC-19 (non-negotiable). The deferral-resolution surface is the architectural commitment that *"virtue requires no external witness"* — it produces no score, no perspective prose, no celebratory artefact (AC-18 non-negotiable). Building it first signals that the unglamorous part is the load-bearing part.

This session lands the implementation: a new API route + a new page + engine integration + R20a perimeter expansion. The encryption infrastructure (helpers + schema) is already in place per the predecessor session. The new route consumes those helpers. With `MENTOR_RAG_V1=true` flag flipped at the end of the session, the deferral-resolution surface goes live.

**This is a Critical session because:**
- R17 perimeter expands (intimate data flows to two new tables for the first time).
- R20a perimeter expands from 8 to 9 routes per AC5 ninth-route discipline (registry entry + import + call pattern + passing AC4 invocation test).
- The encryption wiring's first real use happens during this session (the dry-run we deferred at the predecessor session lands here as the route's first real write).
- The new tables exit dormancy (`MENTOR_RAG_V1` flips from `false` to `true`).

The Critical Change Protocol's five steps (what's changing / what could break / existing sessions / rollback plan / verification step) appear verbatim before deploy with founder explicit approval specific to named risks.

---

## Pre-conditions for this session opening

1. **Founder push of the predecessor session-close commit + this session's input prompt** via GitHub Desktop. Working tree clean at session open.
2. **Vercel green confirmation.** Founder confirms Vercel deployed the predecessor session-close commit cleanly.
3. **Schema verified live in Supabase.** Founder confirms `open_deferrals` + `deferral_resolutions` tables present (run any V1-V4 query from the predecessor session as a spot check).
4. **Founder readiness for a larger Critical-risk session.** This session involves: (a) reading multiple Phase-1 deliverables in full at session open (D14b + D9-D18 as needed); (b) writing a 15-step server-side workflow + a new page; (c) AC5 ninth-route discipline addition; (d) Critical Change Protocol with explicit approval at each gate; (e) 8 founder-performable verifications post-deploy. Realistic time budget: 3–5 hours; natural pause point identified in § Anticipated session shape.
5. **Founder access to:** Supabase SQL Editor (verification queries); GitHub Desktop (commits + push); Vercel dashboard (deployment status); browser (testing the new page-side flow at /private-mentor/deferred-questions); Anthropic API key set in production Vercel (for Layer 1 + engine LLM calls — already configured).

If pre-condition 1 or 2 not met: agent's first action is to confirm the founder's path forward. If pre-condition 3 reveals schema drift: rollback the encryption-wiring landing first; this session pauses. If pre-condition 4 not met (founder doesn't have 3+ hours today): agent pauses at the natural pause point (see below) and resumes in a follow-up session. If pre-condition 5 incomplete (founder can't access a required surface): agent surfaces this as a blocker before any work begins.

---

## Part A — Open the session under the protocol

Per `/adopted/session-opening-protocol.md` Part A elements 1–8. Tier: founder/governance + code. Read:

1. **`/manifest.md`** — particularly **R17a–R17f** (R17b operative now; R17f obligation discharged at encryption wiring; R17e load-bearing for the route's response shape per AC-18); **R20a + AC5** (ninth-route discipline — load-bearing for this session); **AC4** (invocation testing — adapted to the new route's import + call patterns); **AC1** (model selection — Sonnet for Layer 1 + engine; not Haiku); **AC6** (four-layer context architecture — Layer 1 + L1 brain + L3 prompt for Table 4b NULL projection); **AC7** (Session-7b standing constraint — auth pattern preserved verbatim from `/api/mentor/private/reflect`; explicitly NOT engaged at any auth/cookie/session/redirect surface change); **KG1** (Vercel five rules — rule 2 await DB writes load-bearing); **KG3** (hub-label end-to-end contract — D14b surface uses `'private-mentor'` hardcoded; verify); **KG7** (JSONB shape — load-bearing at the encryption_meta + withheld_classification + deferred_question + retrospective_update writes).

2. (Project instructions — already in system prompt.)

3. **`/operations/handoffs/founder/2026-05-03-encryption-wiring-implementation-close.md`** — predecessor session close. **Read in full.** Required context for what's already in place.

4. **`/adopted/rag-mentor-alt3/reflect-endpoint-14b-deferral-resolution.md`** (D14b) — **read in full**. This is the architecture this session builds. Particularly:
   - § "Plain-language summary"
   - § "Surface design — own route vs same-route-different-mode" (resolved: own route)
   - § "Practitioner-facing surface" (page-side state model + flows)
   - § "Server-side workflow" (the 15-step sequence)
   - § "Schema additions" (already implemented per encryption-wiring session)
   - § "R20a perimeter conformance (AC5 ninth-route discipline)"
   - § "R17 intimate data protection conformance"
   - § "Phase-2 pass 1 build readiness" — § "Critical Change Protocol (0c-ii) for Phase-2 pass 1 deployment" — **the protocol responses to surface verbatim before deploy.**
   - § "Founder-performable verification protocol" — the 8 verifications.

5. **`/adopted/rag-mentor-alt3/migration-plan.md`** (D21) — § Phase-2 Pass 1 build steps. The 11-step build sequence; this session executes against it.

6. **`/operations/decision-log.md`** — read at minimum the last 5 entries (D-ENCRYPTION-WIRING-IMPLEMENTED + D-ENCRYPTION-WIRING-ADR-ADOPTED + D-REGISTRY-UPDATE-v1.5.0 + D-D2-AMENDMENT + D-VALIDATION-ADDENDUM-PROMOTED).

7. **`/adopted/rag-mentor-alt3/canonical-framework.md`** (D2 v1.1.0) — particularly Table 4b (NULL projection — AC-18 non-negotiable on this surface).

8. **`/adopted/rag-mentor-alt3/three-tier-intake.md`** (D13) — OPEN_DEFERRAL data structure; EUPATHEIA_BOUNDARY + PRAXIS_MOTIVATION_AMBIGUITY trigger codes; slot fields.

9. **`/adopted/rag-mentor-alt3/operationalised-rules.md`** (D8 v1.0.0) — engine rules 1–10; mechanism 5 (correct judgement / eupatheia confirmation) + mechanism 10 (motivation direction / praxis ambiguity).

10. **`/adopted/rag-mentor-alt3/rule-dependency-map.md`** (D9) — engine sequencing positions 1–12.

11. **`/adopted/rag-mentor-alt3/layer-1-translation.md`** (D10) — Layer 1 prompt + structured features schema.

12. **`/adopted/rag-mentor-alt3/layer-3-translation.md`** (D11) — Layer 3 Table 4b NULL projection. AC-18 holds.

13. **`/adopted/rag-mentor-alt3/strict-prompting.md`** (D12) — Layer 3 prompting discipline.

14. **`/adopted/rag-mentor-alt3/long-deferred-questions.md`** (D15) — three principles for long-deferred questions; coda integration.

15. **`/adopted/rag-mentor-alt3/verification.md`** (D18) — narrative-trace + score-consistency verification (D22 test inputs).

16. **`/website/src/lib/encryption-helpers.ts`** — the helpers this session's route consumes. Newly landed at predecessor session.

17. **`/website/src/app/api/mentor/private/reflect/route.ts`** — the existing precedent route. **Read in full** for the auth pattern, R20a integration, body parse pattern, persistence pattern. The new `/api/mentor/private/deferral-resolve/route.ts` mirrors this route's structural shape (15-step workflow vs. existing route's flow) — preserving auth + R20a + persistence patterns verbatim per AC7.

18. **`/website/src/lib/__tests__/r20a-invocation-guard.test.ts`** — the AC4 invocation test registry. The new route will be added to `HUMAN_FACING_POST_ROUTES` as the ninth route per AC5 discipline.

19. **`/website/src/lib/r20a-classifier.ts`** — `detectDistressTwoStage` source. Reference for the route's R20a check pattern.

20. **`/website/src/lib/constraints.ts`** — `enforceDistressCheck` source + AC1 model selection criteria.

21. **`/operations/knowledge-gaps.md`** — KG1 + KG3 + KG7 (all engaged this session).

Confirm at session open: tier; hold-point status (P0 0h still active per project instructions); model selection (Sonnet for Layer 1 + engine; document this against `constraints.ts`); status-vocabulary readiness (0a + 0f); signals/risk-classification readiness (Critical Change Protocol responses ready to surface verbatim from D14b § "Critical Change Protocol (0c-ii) for Phase-2 pass 1 deployment").

---

## Part B — Pre-build prerequisite check

Before any code work, confirm the following pre-conditions per D21 § "Pre-build prerequisites":

### 1. Schema migrations Standard-risk approved separately

✅ Done at predecessor session (D-ENCRYPTION-WIRING-IMPLEMENTED-2026-05-03). Schema verified live via 4 SQL queries.

### 2. Encryption wiring (P2 task 2c)

✅ Done at predecessor session. Helpers at `/website/src/lib/encryption-helpers.ts`. The route consuming them is THIS session's deliverable.

### 3. Snapshot of the existing `/api/mentor/private/reflect` route

✅ Done — `D-MENTOR-PRIVATE-REFLECT-PRE-ALT3-SNAPSHOT-2026-05-02` at `/archive/2026-05-02_api-mentor-private-reflect_pre-alt-3-snapshot.md`. The new route's auth + R20a patterns preserve the snapshot's behaviour verbatim.

### 4. D-A16 corpus catalogue minimum population

⚠️ **Pre-build TODO this session.** The deferred question text is composed at scoring time using the catalogue. Minimum coverage for Phase-2 pass-1: stems for `EUPATHEIA_BOUNDARY` + `PRAXIS_MOTIVATION_AMBIGUITY` trigger codes per D14b § "Pre-build prerequisites" + D5 § "Step 2 — D-A16 catalogue promotion".

**Path A (build catalogue inline this session):** the agent reads `mentor-knowledge-base.ts` patterns, decomposes into stems with `[VARIABLE]` placeholders + `slot_fields[]`, inserts into `corpus_passages` (the schema for which is per D5 § "The `corpus_passages` table — schema"). **Note:** the `corpus_passages` table itself does not yet exist as a Supabase table — it is referenced in D5 as a Phase-2 build deliverable. Either (a) create it as part of this session's schema migration (Critical-risk, expanding session scope further), or (b) defer the catalogue population to a separate Phase-2 build session and have the new route's first iteration use a hardcoded fallback for the two trigger codes' deferred question texts.

**Path B (defer catalogue to follow-up session):** this session implements the route + page + engine integration; the deferred question text comes from a hardcoded inline map for the two trigger codes; the catalogue + `corpus_passages` table land in a separate Standard-risk session before Phase-3+ (when other trigger codes need stems too). This bounds this session's scope.

**Recommendation: Path B.** The route + page + engine integration is already substantial; deferring the catalogue keeps this session bounded and lets the founder verify the surface end-to-end with hardcoded stems before investing in catalogue infrastructure. Founder calls.

If Path B selected: surface a 2-question batch via AskUserQuestion at session open — (a) Path A or B? (b) hardcoded stem text for EUPATHEIA_BOUNDARY + PRAXIS_MOTIVATION_AMBIGUITY (proposing draft text from D13 § "Trigger code stems" or equivalent for founder approval).

---

## Part C — Execute D21 § Phase-2 Pass 1 Build Steps 5–10

Per D21 § "Pass 1 Build Steps" — Steps 1–2 already complete (encryption + schema). Steps 3–4 land per Path B above (catalogue deferred + index population deferred). This session executes Steps 5–10:

### Step 5 — Implement the new route source

**File:** `/website/src/app/api/mentor/private/deferral-resolve/route.ts` (new).

Per D14b § "Server-side workflow" — 15 steps:

1. Rate limit gate (`checkRateLimit(request, RATE_LIMITS.scoring)`).
2. Authentication gate (`requireAuth(request)` + founder-only check). **AC7 preservation: copy auth pattern verbatim from `/api/mentor/private/reflect`.**
3. Body parse (`open_deferral_id` UUID + `reflection_content` 10–medium chars + optional `bypass_pattern_cache`).
4. OPEN_DEFERRAL lookup (`open_deferrals` row by id + user_id; status='open'). **D24 audit finding 6 preserved: enforce `user_id = auth.user.id`, not the row's `user_id` from request body.**
5. R20a vulnerable-user detection — `await enforceDistressCheck(detectDistressTwoStage(reflection_content))`. **The distress check input is `reflection_content`, NOT the deferred question text** (the question is canonical and not user-controlled).
6. Layer 1 translation (Sonnet; per D10 prompt; deferred question provided as auxiliary context). KG1 rule 2: await the LLM call.
7. Engine sequencing (per D9 — positions 1–12). May produce another OPEN_DEFERRAL (Tier 3 re-cascade — Flow 5).
8. Tier 1 / Tier 2 / Tier 3 dispatch (Tier 1 halt = clarification request; Tier 2 soft non-blocking; Tier 3 re-cascade = new flag, original stays open).
9. Retrospective score update (only if Tier 1/3 not engaged — update original instance's score per resolved classification). KG3 hub-label preservation: the original instance was on `'private-mentor'`; the update writes to the same hub.
10. OPEN_DEFERRAL closure (status='closed'; resolved_at; resolution_reflection_id; retrospective_update.confidence_weighted='medium').
11. Response build (AC-18 holds — no proximity, no sage_perspective, no celebratory artefact; minimal shape per D14b § "Step 11").
12. Persistence — INSERT into `deferral_resolutions` with `reflection_content` (encrypted via `encryptForStorage`); `engine_diagnostics_ciphertext` (encrypted via `encryptForStorage`); `tier_3_recascade_fired` boolean. **KG1 rule 2: await the INSERT.**
13. Self-improving feedback loop — `updateProfileFromDeferralResolution` (new function analogous to `updateProfileFromReflection`). Awaited.
14. Pattern-engine pass (cache hit/miss per ADR-PE-01 Session 6 pattern — same as ritual route).
15. Response return (CORS headers per the standard pattern).

**Imports the new route requires:**
- `encryptForStorage` from `@/lib/encryption-helpers`
- `detectDistressTwoStage` from `@/lib/r20a-classifier`
- `enforceDistressCheck` from `@/lib/constraints`
- `requireAuth` (existing pattern)
- `supabaseAdmin` from `@/lib/supabase-server`
- `checkRateLimit, RATE_LIMITS` (existing pattern)
- Layer 1 + engine + Layer 3 modules (per D10/D11/D12 wiring)

### Step 6 — Implement the new page route

**File:** `/website/src/app/private-mentor/deferred-questions/page.tsx` (new).

Per D14b § "Practitioner-facing surface" + § "Page structure". Minimal — list view + resolution view.

**AC-18 explicit — what the page MUST NOT show:**
- No proximity score on resolution submission.
- No sage_perspective prose.
- No what_you_did_well prose.
- No mentor_observation.
- No completion artefact (no streak counter; no monthly count badge).
- No congratulatory text.

The page-side flow per D14b § "Practitioner-visible flows on the page" — Flows 1, 2, 3, 4, 5 implemented (one practitioner-visible affordance per flow).

### Step 7 — Implement engine integration

Layer 1 (Sonnet — per D10) → Engine (Rules 1–10 per D9) → Layer 3 Table 4b NULL projection (per D11/D12).

The deferred question's auxiliary context shapes Layer 1's feature extraction (per D14b § "Step 6"). Layer 3's projection produces NULL visible output per Table 4b (AC-18).

### Step 8 — Add R20a perimeter ninth route (AC5 ninth-route discipline)

Per AC5:
1. **Registry entry:** add `'src/app/api/mentor/private/deferral-resolve/route.ts'` to `HUMAN_FACING_POST_ROUTES` in `/website/src/lib/__tests__/r20a-invocation-guard.test.ts`.
2. **Imports verified:** the route source imports `detectDistressTwoStage` from `@/lib/r20a-classifier` and `enforceDistressCheck` from `@/lib/constraints`.
3. **Call pattern:** `await enforceDistressCheck(detectDistressTwoStage(reflection_content))` appears in the route source.
4. **Passing AC4 invocation test:** `npx jest r20a-invocation-guard --no-coverage` passes against the expanded registry.

### Step 9 — Wire verifier into CI (optional this session)

Per D18 — narrative-trace verification + score-consistency verification on D22 canonical test inputs. This step may defer to a separate Standard-risk session if Phase-2 pass-1 build is large; the env flag `MENTOR_RAG_V1=true` deploys without CI verifier wiring (verification can run manually until CI lands).

**Recommendation: defer to follow-up.** Founder calls.

### Step 10 — Add env flag `MENTOR_RAG_V1=true`

Vercel env var. With the flag flipped, the new route engages the engine path; the page is added to navigation; the route processes resolution submissions. **This is the Critical-risk activation step.**

### Step 11 — Critical Change Protocol responses (per D14b § "Critical Change Protocol")

Surface verbatim before flipping the env flag. Founder explicit approval specific to named risks (the 8 verifications below; the rollback plan).

### Step 12 — Founder verification (per D14b § "Founder-performable verification protocol")

8 verifications (D14b § "Verification 1" through § "Verification 8"):
1. Schema migrations applied ✅ (already done at predecessor session — confirm spot-check).
2. Engine produces an OPEN_DEFERRAL on a test scenario (canonical EUPATHEIA_BOUNDARY narrative).
3. Deferral-resolve route accepts a resolution and closes the flag (full round-trip).
4. AC-18 holds end-to-end (page renders only acknowledgement; response carries NULL visible_*).
5. R20a distress redirection works on the new route (Zone 3 input fires redirect; no resolution data persists; flag remains open).
6. Tier 1 force trigger surfaces correctly (REFLECTION_NARRATIVE_THIN test).
7. Tier 3 re-cascade works (engine produces new OPEN_DEFERRAL on reflection itself).
8. RLS enforcement (cross-user read attempt blocked).

**All 8 must pass before pass-1 reaches Verified status per PR1.** If any fail: env flag flips back to `false`; investigation; re-attempt.

---

## Part D — Founder reads needed for in-session decisions

Beyond the protocol read sequence (Part A), at certain decision points the founder may need to:

- **Part B Path A vs Path B (catalogue):** read the proposed hardcoded stem text for the two trigger codes (agent provides via AskUserQuestion).
- **Step 5 route source:** code review of the route source before deploy (agent provides the file diff via Read tool).
- **Step 11 Critical Change Protocol:** the verbatim responses (agent surfaces in-chat at the gate).
- **Step 12 verifications:** founder runs each of the 8 verifications and confirms pass/fail (agent provides each test command + expected result).

---

## Part E — Session close + next-next-session preparation

After Steps 5-12 complete (or after a clean pause if founder signals "done for now" mid-session), produce a session close at `/operations/handoffs/founder/[date]-phase-2-pass-1-commencement-close.md` per protocol Part C. Include 0b minimum + extensions per the predecessor pattern.

**Next-next-session candidates:**

- **Candidate H1 — Phase-2 pass 2 (D14a daily-reflection ritual surface).** Engine substitution against the existing `/api/mentor/private/reflect` ritual flow per D14a + the snapshot at `D-MENTOR-PRIVATE-REFLECT-PRE-ALT3-SNAPSHOT-2026-05-02`. Critical risk per PR6 (R20a perimeter Route 8). Pre-condition: pass-1 reaches Verified status (per PR1).
- **Candidate H2 — D-A16 catalogue + corpus_passages table + index population.** If Path B selected at this session for the catalogue, the catalogue work lands in a separate Standard-risk session.
- **Candidate H3 — D18 verifier CI wiring.** If deferred at Step 9 of this session.

**Recommendation for next-next-session:** Candidate H1 (Phase-2 pass 2) — IF pass-1 reaches Verified status and founder is ready for the next Critical session. Founder calls.

If this session pauses mid-execution: session close documents the paused state; next session resumes from the named build step.

---

## Important context

- **Founder is a non-coder.** Plain-language explanations of every architectural decision. Provide exact copy/paste for SQL, env-var values, verification commands. Specify exact menu paths for Vercel + Supabase + GitHub Desktop.
- **Founder decides direction.** Where any step surfaces ambiguity, agent surfaces options with reasoning; founder calls. Agent does not silently proceed past any approval gate.
- **Critical Change Protocol is the operative discipline for Step 10's env flag flip.** The protocol's five steps must appear verbatim in conversation before the flag flips. Founder approval must be specific to the named risks.
- **Risk classifications:** Step 5 (route source code) Standard pre-deploy. Step 6 (page source code) Standard pre-deploy. Step 7 (engine integration) Standard pre-deploy. Step 8 (R20a registry update + AC4 test) Standard pre-deploy. Step 9 (CI verifier — if undertaken) Standard. **Step 10 (env flag flip activates the new route at production) Critical.** Step 11 (CCP) communication only. Step 12 (verifications) test execution only.
- **AC7 standing constraint NOT engaged at any code change.** The new route's auth pattern is a verbatim copy of `/api/mentor/private/reflect`'s auth. No middleware change. No cookie scope change. No domain redirect change. Verify via grep before commit.
- **The encryption helpers are pre-tested.** No need to re-validate the encryption pipeline this session — the predecessor session's 25/25 standalone-validator assertions + post-deploy schema verification + Vercel green confirmation are the validation. The new route's first INSERT is the integration round-trip (which lands as part of Step 12 Verification 3).
- **Component-registry follow-up logged from predecessor session:** the new helpers were not added to the registry at predecessor close. The new route + page + helpers can all be bundled into a single registry update at next-next session (or at this session if scope permits).

---

## Standing reminders

- Single source of truth for governance metadata: `/website/public/component-registry.json` (currently v1.5.0).
- Decision-log entry per stream per PR7 — including for explicitly deferred decisions (Path A/B catalogue choice; Step 9 CI verifier defer if applicable).
- Provide founder with verification methods (URLs, expected results, copy-paste commands) for any work that touches a live surface.
- Do not propose changes to any /adopted/ governance document beyond what D14b + D21 specify. Material changes to the surface design require a D14b amendment + new ADR.
- Phase-2 pass-2 (D14a) does NOT commence this session. That's the next-next session per Candidate H1.
- If any step's work surfaces a need that exceeds the scope of D14b + D21, surface it as a scope question for the founder before proceeding.
- Per-stream commit pattern (predecessor session's pattern): the founder may commit + push each step's output as it lands, rather than batching to session close. Either pattern is acceptable.

---

## Forecast

**If the session executes Steps 5–12 in full:**
- New route at `/website/src/app/api/mentor/private/deferral-resolve/route.ts` (15-step server-side workflow).
- New page at `/website/src/app/private-mentor/deferred-questions/page.tsx` (list + resolution view).
- Layer 1 + engine + Layer 3 wiring per D10/D9/D11/D12.
- R20a perimeter expanded from 8 to 9 routes (AC5 ninth-route discipline; passing AC4 invocation test).
- Env flag `MENTOR_RAG_V1=true` set in Vercel; new route engages engine path; page added to navigation.
- All 8 founder verifications pass (per PR1 single-endpoint proof).
- Decision-log entry: `D-PHASE-2-PASS-1-COMMENCED-IMPLEMENTED-YYYY-MM-DD` (pending naming convention).
- Phase-2 pass-1 reaches Verified status per 0a vocabulary.
- Phase-2 pass-2 readiness: pass-1 Verified is the only blocker to Candidate H1 commencement.

**If the session pauses mid-execution** (founder signals "done for now" before Step 10's env flag flip):
- Whatever steps completed are committed and verified.
- Session close documents the paused state.
- Next session resumes from the named build step.
- The new route + page exist in code at their canonical locations but the env flag remains `false` — the surface is dormant in production until pass-1's deploy completes.

**If verification fails on a specific test (Verification 2-8):**
- Env flag flips back to `false`. New route stops engaging engine path.
- Founder receives debrief explaining the failure mode.
- Build investigates and re-attempts at follow-up session.
- Per D14b § "Pass 1 Rollback Path".

---

## Anticipated session shape

This session is **larger** than the encryption-wiring session. Realistic time budget:

| Phase | Time estimate |
|---|---|
| Part A (canonical reads + D14b/D21 in full + others as needed) | 30–45 min |
| Part B (pre-build prerequisite check + Path A/B catalogue decision) | 15 min |
| Step 5 (route source — 15-step workflow) | 60–90 min |
| Step 6 (page source — list + resolution view) | 30–45 min |
| Step 7 (engine integration — Layer 1 + engine + Layer 3 NULL projection) | 30 min (mostly stitching pre-existing modules) |
| Step 8 (R20a ninth-route addition + AC4 test) | 15 min |
| Step 9 (CI verifier — likely deferred) | 0 min if deferred |
| Step 10 (Critical Change Protocol + env flag flip) | 15 min |
| Step 11 (founder approval gate) | 5 min |
| Step 12 (8 verifications) | 30–60 min depending on verification results |
| Decision log + session close | 30 min |
| **Total** | **4–5.5 hours** |

**Natural pause point:** between Step 8 (R20a perimeter expansion + passing AC4 test) and Step 10 (env flag flip). Steps 5–8 + 9 are pre-deploy preparation — the route + page + R20a registry are in code and ready, but the env flag is still `false` so the surface is dormant in production. Founder can pause here, review the code at leisure, and resume with Step 10 in a follow-up session.

If the founder doesn't have 4–5 hours today, the natural pause point above is recommended. Up to Step 8 is design + code-only — no live surface activated. Step 10 onward starts production-affecting work.

---

End of prompt. Confirm receipt + Part A read complete (including D14b in full) before proceeding to Part B (pre-build prerequisite check + Path A/B catalogue decision via AskUserQuestion).
