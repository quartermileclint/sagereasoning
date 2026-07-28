# Next-Session Prompt — Practice Reminders, Agent Half, Phase A1: The Suggestion Composer + `practice.suggestion`

**Stream:** founder (substrate / agent experience). This is a **substrate-build session** — read `/adopted/build-sessions-protocol-cache.md` at open alongside the standing cache.
**Tier:** `code-elevated` — dark, flag-gated, additive. **The A3 activation is NOT this session** (that is its own founder-walked `code-critical` 0c-ii; nothing here pre-approves it).
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Plan of record:** `operations/reminders-2026-07/2026-07-26-practice-reminders-AGENT-build-plan.md` — **§4 (Phase A1) is this session's spec.** Read it in full; this prompt supplements it with seam-level grounding, it does not replace it.
**Binding verdict record:** `operations/reminders-2026-07/2026-07-27-step-M-mentor-verdicts-verbatim.md` — **the verbatim record wins over every summary, including the plan's §4 table and this prompt.**
**Predecessor closes:** `operations/handoffs/founder/2026-07-27-practice-reminders-human-phase3-stage-crossing-CLOSE.md` (the human half's completion) · the AE-2/kathekon-narrowing closes for the substrate surfaces this build composes over.
**Risk classification:** Elevated under 0d-ii — a new pure lib + two additive, flag-gated response-surface seams; **no schema, no flag set, no auth change, no deploy, no mint; production byte-equivalent until the founder's push, and on push byte-identical because `SUBSTRATE_PRACTICE_SUGGESTION_ENABLED` is unset everywhere (battery-asserted).** AC7/PR6 not engaged.

## Where the arc stands — every gate on A1 is discharged

1. **E4 ("built after the human plan ships") — DISCHARGED.** All five human phases are built, committed (`f3c1df4`), pushed, and Vercel-deployed green (founder-confirmed 2026-07-28). The §8 residual ambiguity (whether A1 waits for human Phases 2–3) is moot — they shipped.
2. **Step M — DISCHARGED** (`D-PRACTICE-REMINDERS-STEP-M-MENTOR-VERDICTS-ADOPTED`, decision log 2026-07-27; note the plan §8 cites it with a `-2026-07-27` suffix the actual entry header does not carry — cite the real ID). The §4 mapping table is the **vetted** version: B2 before B1; the question form; the B5 threshold; B6 minimal; B7's silence protected.
3. **The sequence trigger needs no build** (plan §3 row 1) — the CI-13 hint + llms.txt cadence guidance are live. A1 is the **in-session trigger**; A2 (reflect developmental read-back) and A3 (docs + activation) follow in later sessions.

## The binding Step M verdicts that shape A1 (re-read them verbatim before writing any string)

1. **QUESTION form, not destination form** — the most important verdict. The rendered line names the gap and asks; it never names a practice as a destination and never supplies the conclusion: *"This record shows ⟨what was found⟩. Before proceeding: is this the reasoning this action warrants?"* The machine-readable `practice`/`endpoint_hint` fields still carry the target; only the rendered `line` takes the question form.
2. **Precedence: B2 (obligations) FIRST, then B1** — "dikaiosyne… is not subordinate to procedural completeness."
3. **B1 narrowed** — fire only on a loop *genuinely* not closed, "if the classification can distinguish them" (see the named design decision below).
4. **B5 threshold** — a decline sustained across 2–3 consecutive sessions, **never a single-session dip** ("the agent will learn to treat it as noise").
5. **B7's silence is PROTECTED** — no default suggestion for completeness, ever. A response with no qualifying basis carries **no `suggestion` field at all** (absent, not null).

## Pre-conditions

1. `git log` shows `f3c1df4` (the stage-crossing commit) at or behind HEAD, pushed. If not — STOP and say so.
2. Two known uncommitted stragglers are **NOT this session's to stage**: `operations/handoffs/founder/2026-07-27-practice-reminders-human-phase2-in-session-suggestions-CLOSE.md` (a between-sessions production-state update, carried for the founder) and `website/src/data/environmental-context.json` (another thread's). Leave both alone.
3. Baselines at open (from the standing records — re-run and confirm before building): trajectory-delta **73/0** · trajectory-overlay 36/0 · loop-fold **179/0** · aah-store 120/0 · accreditation route **90/90** · kathekon-engagement 105/0 · practice-cycle-hint (last recorded 13/0) · `tsc` 0 · `npm run build` 0. Any drift from these is a finding to record before proceeding, not to absorb.

## Verified seam grounding (2026-07-28 — re-verify first-hand at open; line numbers may drift)

- **`/api/reason` attach point:** `src/app/api/reason/route.ts:1875-1879` — `output.practice = PRACTICE_CYCLE_HINT` (a **direct frozen-constant assignment**, gated on `isPracticeCycleHintEnabled()`). The trajectory delta is attached earlier (~line 1573), so at the practice seam every composer input is already computed. The new code must keep the flag-off serialized response **byte-identical** — the battery asserts serialized equality, not object identity.
- **Accreditation write attach point:** `src/app/api/accreditation/[agent_id]/response-builders.ts:254-257` — `...practiceCycleHintField()` spread.
- **The carrier module:** `src/lib/practice-cycle-hint.ts` (`PRACTICE_CYCLE_HINT`, `practiceCycleHintField()`; existing test `src/lib/__tests__/practice-cycle-hint.test.ts` must stay green).
- **The family mapping is FREE:** the delta's passion keys are already root-qualified compounds — `trajectory-delta.ts:475`: `` `${p.root_passion}/${p.sub_species}` `` — so B3 (phobos family) and B4 (epithumia family) read the family straight off the served key prefix. **No new sub-species→root map is needed for the delta path.** Verify `passions_persisted_in_window` uses the same keying. If any input surfaces a bare sub-species, reuse the canonical vocabulary (`layer1-extractor.ts` `SUB_SPECIES`/`ROOT_PASSIONS`; the valence-split precedent `passionRootToDomain`, `derive-trust-events.ts:374`) — never author a parallel vocabulary (PR15).
- **B6's self-only-circle reading:** reuse `SELF_PRESERVATION_CIRCLE` + the beyond-self logic from `kathekon-engagement.ts` (PR15) — do not re-encode the circle vocabulary.
- **The unwired school-model function** (A2's target, NOT A1's): `evaluateDevelopmentalFlags`, `intervention-engine.ts:724` — **A1 must not import the intervention engine at all** (mirror the fold's never-imports test).

## Build (plan §4, restated as work items)

1. **New pure lib `website/src/lib/substrate/practice-suggestion.ts`:** the composer — a pure function of a typed snapshot of blocks the response already carries (current assessment signals · `delta` if present · `loop_fold` if present). **No new DB reads, no LLM call, no env read inside the composer** (the flag is read at the attach seam, `practiceCycleHintField`-style). Output: an optional `{schema:'agent-practice-suggestion/v1', practice, basis, line, endpoint_hint?}`. **One suggestion max**, fixed precedence **B2 → B1 → B3 → B4 → B5 → B6**, honest absence otherwise (B7). Every rendered `line` comes from a **fixed pre-authored string set** in the question form — exported values, verbatim-pinned (per the standing memory: content pins assert **exported values**, never source substrings). A signal whose served basis is `insufficient_extraction` (or otherwise floored) **never** forms a basis — skip, don't degrade.
2. **The framing note ON the block** (`VOCABULARY_NOTE`-style exported constant, served with the suggestion): advisory only (channel law) · binds nothing · not an S4 input · never a trust-event source · evaluative-never-predictive, record-descriptive past tense · **weights-tier use remains blocked**.
3. **Two attach seams**, both additive + flag-gated behind the NEW `SUBSTRATE_PRACTICE_SUGGESTION_ENABLED` (unset everywhere): the `suggestion` member rides **inside the existing `practice` block** on the `/api/reason` happy path and the accreditation write 200. Deliberately NOT attached anywhere else (delta/fold blocks, `GET /api/trust-record`, `/api/guardrail`, `/api/practice/discernment` — plan §4/§9; their no-recommendation contracts stand untouched).
4. **Battery** (`practice-suggestion.test.ts` + seam extensions): flag-off **serialized byte-identity of both responses**; the one-suggestion invariant; every mapping row including honest-null and floor behaviour; precedence (construct multi-basis fixtures where B2 outranks B1, etc.); the locked strings as exported values; the composer's import-purity pin (never imports the intervention engine — mirror `loop-fold`'s test); source-grep wiring pins at both seams (the established pattern for interactive/route code no unit render exercises). Extend the accreditation route suite with a flag-on case if it exercises the 200 shape. **Mutation-test every new load-bearing pin** (python3 harness; verify each mutation applied before trusting its verdict; the arc's standing discipline).

## Named design decisions to resolve IN-SESSION and record as BDs (all inside the verdicts' bounds)

- **BD: the B1 closure-class disposition.** The vetted table lists two B1 signals: `examination_open` on the **current** assessment (a loop the engine opened on this very response — genuinely open by construction, unambiguous) and `loop_fold.character.loops.open > 0` (historical; the fold **cannot** distinguish "produced a result, lacks formal closure" from "genuinely dropped" — no served signal carries that). Note 3's conditional ("if the classification can distinguish them") therefore bites on the fold path. **Recommended disposition:** fire B1 on current `examination_open`; stay **silent** on fold-open-alone (the protected-silence direction — the mentor's own noise warning), recording the fold-open class as a named follow-up. Analyze first-hand; if the session finds the distinction IS servable, build it instead; either way record the reasoning. A consequence to state honestly: after this disposition the accreditation surface's live bases may be narrow (B2-from-fold-domain-levels, mostly) — **that is B7 working, not a failure; do not manufacture bases to make the surface "do something."**
- **BD: the B5 realization.** The composer sees only the delta's served `dimension_trends` **labels** (windowed half-comparison, ≥3 rows per half), not per-session series. Read `trajectory-delta.ts`'s actual trend computation first-hand, then apply this decision rule: **fire B5 only if the served label structurally cannot be produced by a single-session dip** (construct the minimal 3-vs-3 counterexample to check); otherwise **B5 is silent in v1** and the evidence-gap (a sustained-decline signal with per-session granularity would be a delta change — out of scope here) is recorded as a named follow-up. Never silently equate the windowed label with the mentor's session-count threshold.
- **BD: the carrier-precondition edge.** The suggestion lives inside the `practice` block; what happens when the new flag is on but `SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED` is off? **Recommended:** the suggestion rides only an emitted practice block (the CI-13 flag stays the carrier's master switch; it is live in production anyway). Record the choice.
- **BD: the B2 realization rows.** B2's three listed signals (current-assessment `obligation_assessment` violated/indeterminate · `first_circle_obligation_trend` declining · dikaiosyne the weak domain) each need a first-hand fidelity mapping onto the exact served fields — record each mapping with its reasoning; skip any leg whose served signal can't honestly carry it, saying so.

If any of these turns out to be a genuine fork the verdicts do not bound (not expected), surface it via AskUserQuestion rather than electing silently.

## Boundaries (plan §7 — acceptance criteria, verify before close)

- The delta/fold **no-recommendation contracts untouched**; the existing fold import-purity test stays green; the composer gains the mirror pin.
- **S10 public record unchanged · S11/ENFORCE untouched · the ADR-013 §8 envelope unchanged · weights-tier claims BLOCKED** (restated on-block and in the decision-log entry) · **0h unaffected; MEASURE throughout.**
- **`stoic-brain.ts` is frozen** (the standing byte-identity guard) — nothing in this build should go near it; if any seam appears to need it, stop and reconsider the seam.
- **No public-docs change while dark** (R18) — llms.txt/agent-card/api-docs are A3's, applied only at activation with founder-signed-off wording.

## Adversarial review (PR19 — REQUIRED before "Verified")

Run the independent adversarial review **as a multi-agent Workflow — this sentence is the explicit opt-in for the Workflow tool this session.** Dimensions (≥5 finders + adversarial verification of every finding): verdict-fidelity against the verbatim Step M record (question form; precedence; B5 threshold; B7 silence); flag-off byte-identity at both seams; composition-correctness over the trust signals (floors honored, one-max, precedence, no basis manufactured from floored/absent signals); boundary/blast-radius (no-recommendation contracts, S10, guardrail/discernment untouched, import purity); test-adequacy (are the pins mutation-proof and non-vacuous — the arc's known failure classes: independent-substring checks, vacuous fixtures, stale bounded-span regexes). If the Workflow dies on account limits, complete first-hand per the §4 precedent and disclose honestly — and queue the independent re-run alongside the arc's existing Phase 0/1 re-run debt.

## Close-out

Decision-log entry (`D-PRACTICE-REMINDERS-AGENT-A1-SUGGESTION-COMPOSER-BUILT` or similar; BDs recorded with reasoning) · agent plan §4/§8 status update · session close doc with the Founder Verification block (**commit-message discipline: the message will quote mentor verdicts — use the temp-file + `git commit -F` form per the standing memory `git-commit-dash-m-nested-quotes-bug`, never a bare `-m` with nested quotes**) · no AI-side commit; the founder commits by name.

## Rollback path

`git revert` the session commit — a pure lib + two flag-gated seams + tests; the flag is unset everywhere so nothing is live at any point. (A3's eventual rollback: unset the flag + redeploy, byte-identical, battery-asserted — recorded there, not here.)

## Open items carried (not this session's work)

- **A2** (reflect developmental read-back — wiring `evaluateDevelopmentalFlags`; its own session, separate flag `SUBSTRATE_REFLECT_DEVELOPMENTAL_ENABLED`) → **A3** (R18 docs + founder-walked Critical activation).
- The deferred **`loop_fold` R18 docs** (adjacent named step; a natural neighbour of A3 — still not folded in).
- **R17 on `milestones`** (the arc's oldest carried item, Critical, founder-walked); independent review re-runs for human Phases 0–1; the journal UTC pace-gate mismatch; the day-55 evening-pole case; `/api/milestones` + `/api/baseline` on the `scoring` bucket; `oikeiosis_context` never written; the s9-loop consult-credential refresh (the harness has been running unframed — the standing named follow-up, its own step).

## Forecast

Success = an agent whose own record shows a qualifying gap receives, on the response it is already reading, one question in the mentor's exact register — naming what the record shows and asking whether its reasoning has addressed it — and an agent whose record shows nothing receives nothing. Dark, byte-identical flag-off, one suggestion max, silence protected. Behind it: A2 gives the reflect completion its developmental read-back, and A3 walks both live.

End of prompt.
