# Practice Reminders — Agent Practitioner Build Plan

**Stream:** founder (substrate / agent experience).
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Authored:** 2026-07-26, from the mentor consultation `inbox/mentor discussion about reminders for humans and agents.rtf` (verbatim source) analysed against the verified current state.
**Status:** Authored; scope elected by the founder 2026-07-26 (election E4: full three-trigger plan authored now, **built after the human plan ships**). **Step M (the shared mentor consultation — human plan §10) gates the mapping-table content of Phases A1–A2 going live.** Nothing here is pre-approved for activation; every flag activation is its own founder-walked Critical 0c-ii.
**Companion:** `2026-07-26-practice-reminders-HUMAN-build-plan.md` (sequenced first).

---

## §1 The source counsel — what it sanctions for agents

Mentor, verbatim: *"On extending this to agent users — the instinct is right and the precedent is sound. An agent that receives a kathekon assessment showing consistent weakness in a particular virtue domain is in an analogous position to a human practitioner who has just had a passion diagnosed. The appropriate response is not only the score but the suggestion of what to examine next. The school model applies to any rational agent capable of genuine examination, which is the Sage Assent argument made practical. When the human-facing website is complete and you return to this, the architecture will already be there — the trigger logic is the same, the content of the suggested practices will differ by the agent's context and capability."*

The same five constraints as the human plan §1 bind here, with the agent-side reading:
1. **Doorbell, not door** — a suggestion names the examination practice and stops; it never supplies the conclusion the examination would reach, and it never becomes an instruction (the channel law: injected text is advisory by design; a capable agent reasons *from* it).
2. **Precedent** — the per-session practice cadence (Gate 1 at task adoption, Gate 2 at stakes, reflect at close) is the agent's "daily rhythm"; the suggestion layer is the teacher naming the next practice at the moment of readiness.
3. **Three triggers** — in-session (from this consult's own record), stage-crossing (from a shift in the accumulated record), sequence (the no-signal default).
4. **Sequence** — for agents this is the already-documented adoption path (cadence → consult → guardrail → reflect-at-close).
5. **Mirror, not grade** — record-descriptive past tense; "something has shifted in the record" language, never attainment language.

## §2 Verified ground findings (2026-07-26) — the architecture is indeed "already there"

1. **The sequence trigger is already live.** The CI-13 `practice` hint (`practice-cycle-hint.ts:60-65`: `{reflect_due:'TR-02', endpoint:'/api/practice/reflect', default:'auto', opt_out:'reflect_at_close'}`) rides `/api/reason`'s happy path (`reason/route.ts:1876-1880`) and the accreditation write 200 (`response-builders.ts:257`), flag live in production. llms.txt carries the two-gate cadence (§ line 642) and reflect-at-close (§ line 661); the agent-card carries `consultation-cadence-two-gate/v1` + `practice-cycle-reflect-default/v1`.
2. **The diagnosis substrate is live (MEASURE).** `meta.trajectory.delta` (AE-1) serves per-mechanism record deltas — `sub_species_frequency_deltas` (`fading|recurring|new|stable`), `dimension_trends`, `kathekon_quality_trend`, `first_circle_obligation_trend`, `domain_engagement_deltas`, `passions_persisted_in_window` — all evidence-floored (`EVIDENCE_FLOOR = 3` per compared half) with `insufficient_extraction` honesty (`trajectory-delta.ts:232-277`). `loop_fold` (AE-2) serves the signed-chain fold on the accreditation write — `character.loops.{open,closed,indeterminate}`, per-domain levels, the three-way v2 split (`loop-fold.ts:252-321`).
3. **The exact school-model moment exists and is UNWIRED.** `evaluateDevelopmentalFlags` (`intervention-engine.ts:724-753`) emits *"consistent 'deliberate' across N recent session(s) in ⟨domain⟩ — a developmental priority for the next Sage Reflect (tracked, not intervened; spec-7 constraint 3)"* — called only by its own tests. The reflect completion (`reflect/response-builders.ts:164-207`) carries the profile read-back incl. `grade_changed` but no developmental field.
4. **Hard constraints already written into the modules:**
   - The delta and fold carry **"MEASURE-only: no recommendation field"** contracts (`trajectory-delta.ts:79-81`; `loop-fold.ts:413-419`, with a test asserting the fold never imports the intervention engine). ⇒ **a suggestion can never live inside those blocks** — it must be a sibling field.
   - **S10 deliberately withholds the S4 recommendation** from the public trust record (`trust-record-payload.ts:17-22`) — "publishing it would read as SageReasoning advising third parties." ⇒ **suggestions ride only the subject-credential's own responses, never the public record.**
   - Byte-identity discipline: every additive block is *absent* (not null) flag-off.
   - Language discipline precedent: `VOCABULARY_NOTE` / `LOOP_FOLD_VOCABULARY_NOTE` battery-pinned past-tense wording; llms.txt "evaluative, never predictive… weights-tier use remains blocked."
5. **`loop_fold` R18 docs remain deliberately deferred** (its own named step; `loop-fold.ts:258-261`) — adjacent to, not folded into, this plan's docs phase.

## §3 The three triggers, mapped

| Mentor trigger | Agent realization | Phase |
|---|---|---|
| Sequence (default path) | The live CI-13 hint + llms.txt adoption guidance — **already discharged; no build** | — |
| In-session (diagnosis → suggestion) | Additive `practice.suggestion` on `/api/reason` + the accreditation write, composed deterministically from already-served measured signals | **A1** |
| Stage-crossing (readiness → introduction) | Reflect completion gains the developmental-priority read-back (wiring `evaluateDevelopmentalFlags`) keyed alongside the existing `grade_changed` moment | **A2** |
| (contract) | R18 docs + founder-walked activation | **A3** |

## §4 Phase A1 — the suggestion composer + `practice.suggestion`

**New pure lib `website/src/lib/substrate/practice-suggestion.ts`:**
- **Input:** a typed snapshot of blocks **already computed for the response at the attach point** — the current assessment's signals (`examination_open`, kathekon quality, per-circle `obligation_assessment`, engaged domains), the trajectory `delta` if present, the `loop_fold` if present. **No new DB reads, no LLM call** — the composer is a pure function of what the response already carries.
- **Output:** an optional `suggestion` object `{schema:'agent-practice-suggestion/v1', practice, basis, line, endpoint_hint?}` where `practice` is one of a small locked vocabulary of **agent examination practices** and `line` comes from a **fixed pre-authored string set** (never composed, never predictive): *"The record showed ⟨basis⟩. ⟨Practice⟩ is the examination suited to it."* — then stops.
- **One suggestion max** per response (the teacher names *the* next practice, not a menu), selected by a fixed precedence order; **honest null** (field absent) when no basis clears its evidence floor.

**DRAFT signal → practice mapping (Step M vets; precedence top-down):**

| Measured signal (already served today) | Suggested practice | Confidence |
|---|---|---|
| `examination_open` on this assessment / `loop_fold.character.loops.open > 0` | `reexamine_same_depth` — close the loop via `prior_feedback` at the original depth (the CI-4 affordance, already binding on depth) | Mentor-adjacent (the correction loop is the practice) |
| Engaged-circle `obligation_assessment` violated/indeterminate, or `first_circle_obligation_trend` declining, or dikaiosyne the weak domain | `examine_obligations` — name the affected circles explicitly in the next examination | **Mentor-given analog** (weak obligations-reasoning → oikeiosis) |
| `sub_species_frequency_deltas` `recurring`/`new` in the **phobos** family, or phobos-class in `passions_persisted_in_window` | `premeditatio_examination` — a pre-action deep examination of the feared outcome class before the next such act | **Mentor-given analog** (agonia → premeditatio, "the direct rational response to future-facing fear") |
| Persisting **epithumia**-family sub-species | `reserve_clause_examination` — examine where the intended outcome has become the condition of equanimity | Proposed |
| Any `dimension_trends` entry declining (floor cleared) | `deepen_examination` — take the next same-class decision at standard/deep depth (the documented depth-follows-scrutiny ladder) | Proposed |
| Self-only circle pattern / absent purpose context | `calling_purpose` — `/api/calling` (the agent's morning-preparation analog: orientation before impressions) | Proposed |
| *(none of the above)* | *(no suggestion field; the live `reflect_due` default already covers the close)* | — |

**Attach points (both additive, flag-gated, absent-when-off):** `/api/reason` happy path and the accreditation write 200 — as an optional `suggestion` member **inside the existing `practice` block** (the CI-13 carrier; the hint's current four fields are byte-identical when the new flag is off). **Deliberately NOT attached:** the delta/fold blocks (their no-recommendation contracts stand untouched), `GET /api/trust-record` (S10 withholding stands), `/api/guardrail` (the gate stays lean; a future election), `/api/practice/discernment` (already carries the S4 measure recommendation — different animal, unchanged).

**Flag:** new `SUBSTRATE_PRACTICE_SUGGESTION_ENABLED`, dark build; unit battery asserts flag-off byte-identity of both responses, the one-suggestion invariant, every mapping row incl. honest-null, floor behaviour, and the locked strings as exported values.

**Framing (restated on the block itself, `VOCABULARY_NOTE`-style):** advisory only (channel law) · binds nothing · not an S4 input · never a trust-event source · evaluative-never-predictive, record-descriptive past tense · **weights-tier use remains blocked**.

**Tier:** `code-elevated` (dark, flag-gated, additive). **Review:** PR19 independent adversarial review REQUIRED (live agent-facing response shapes + composition over trust signals — squarely in scope) before treated as verified.

## §5 Phase A2 — reflect developmental read-back (the stage-crossing trigger)

1. **Wire `evaluateDevelopmentalFlags`:** the reflect completion path assembles `SessionDomainObservation[]` from a **bounded** existing-store read for the subject credential (window + cap fixed; fail-honest omit on any read error — never a fabricated flag) and the completion response gains an additive, flag-gated **`developmental_priorities: [{domain, note}]`** — the engine's own "tracked, not intervened" note served at last to the one party it was designed for: the reflecting agent.
2. **The `grade_changed` moment:** when the completion's profile read-back reports a grade change, the same composer (§4) may attach its one suggestion suited to the *new* record — the agent's "a practice that meets you where you now are." Same locked strings, same one-max rule.
3. **R4 respected:** results-level only (domain + note); engine internals stay closed; the existing completion fields are byte-identical when the flag is off.

**Flag:** `SUBSTRATE_REFLECT_DEVELOPMENTAL_ENABLED` (separate from A1's, so the two surfaces can activate independently; the walks may be combined). **Tier:** `code-elevated` dark build; PR19 review as A1. **Named check at build time:** the observation-feed read must not perturb reflect latency/metering — measure before/after; the read is skipped entirely flag-off.

## §6 Phase A3 — R18 docs + founder-walked activation

1. **Docs (applied only at activation, founder-signed-off wording first):** llms.txt — a "Practice suggestions (advisory)" subsection under the Practice Cycle section stating the full frame (derived from the agent's own record; advisory; prompt-not-perform; binds nothing; never on the public trust record; weights blocked); agent-card — new `practice-suggestion/v1` extension (19th); api-docs — one `/api/reason` + one reflect bullet. **Adjacent named item, NOT folded in:** the deferred `loop_fold` R18 docs remain their own step (a natural neighbouring session).
2. **Activation (founder-walked Critical 0c-ii per 0d-ii "env flags activating new surfaces"; AC7 + PR17):** set flag(s) + redeploy + live smokes — a consult constructed with an open-loop basis shows `practice.suggestion` (flag-took-effect proof: the field is unreachable flag-off); a benign no-basis consult shows the field absent; a reflect completion with a qualifying run shows `developmental_priorities`; flag-off re-verify on rollback drill. Docs applied on the same walk. Rollback = unset flag(s) + redeploy (byte-identical, battery-asserted) + `git revert` the docs commit.

## §7 Boundaries (restated as acceptance criteria)

- The delta/fold **no-recommendation contracts are untouched** — the suggestion is a sibling field; the existing fold test (never imports the intervention engine) stays green, and a mirror test pins the composer as import-free of the S4 engine's decision tables (it reads records, not recommendations).
- **S10/public record unchanged.** **S11/ENFORCE untouched** — nothing here binds, gates, or denies; the suggestion is exactly the class the channel law names advisory. **The honest-claims envelope (ADR-013 §8) is unchanged** — a suggestion attests nothing.
- **Weights-tier claims remain BLOCKED** — restated on-block, in docs, and in the decision-log entry at activation.
- **The 0h hold is unaffected**; MEASURE throughout.

## §8 Sequencing, sizing, risk

**Gated on:** the human plan shipped (election E4) **and** Step M (the shared mentor consultation vets the §4 mapping + precedence + strings; human plan §10). Order: **A1 → A2 → A3** (A1/A2 are independent dark builds and may swap; A3 activates whatever is built). Estimates: A1 ~1 session · A2 ~1 · A3 ~0.5–1 + the founder-walked activation. Risk: A1/A2 `code-elevated` (dark, byte-identical flag-off); A3 **`code-critical`** (env-flag activation of new response surface content; full Critical Change Protocol; nothing in this plan pre-approves it). PR19 independent review before either build is treated as verified.

## §9 Out of scope (recorded)

- Suggestions on `/api/guardrail` or `/api/practice/discernment` (future elections; the gate stays lean, discernment already carries the S4 measure recommendation).
- Any scheduled/push channel (agents are request-driven; the cadence *is* the rhythm).
- Harness (H1–H5) rendering of the suggestion inside frames — a natural later step for the reference harness, advisory by the channel law; not part of this plan.
- Any personalisation beyond the credential's own record; any cross-agent comparison; any predictive framing.

*End of plan. Companion to the human plan; built after it ships, vetted through the same Step M consultation.*
