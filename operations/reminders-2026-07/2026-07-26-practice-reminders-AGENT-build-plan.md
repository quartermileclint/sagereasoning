# Practice Reminders — Agent Practitioner Build Plan

**Stream:** founder (substrate / agent experience).
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Authored:** 2026-07-26, from the mentor consultation `inbox/mentor discussion about reminders for humans and agents.rtf` (verbatim source) analysed against the verified current state.
**Status:** Authored; scope elected by the founder 2026-07-26 (election E4: full three-trigger plan authored now, **built after the human plan ships**). **Step M (the shared mentor consultation — human plan §10) gates the mapping-table content of Phases A1–A2 going live.** Nothing here is pre-approved for activation; every flag activation is its own founder-walked Critical 0c-ii. **UPDATED 2026-07-28: both gates are DISCHARGED and the founder gave the go — the human plan is fully shipped (all five phases, commit `f3c1df4`, Vercel green) and Step M was adopted 2026-07-27. The A1 session prompt is authored: `operations/handoffs/founder/2026-07-28-practice-reminders-AGENT-A1-suggestion-composer-NEXT-SESSION-PROMPT.md`.**
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
- **Output:** an optional `suggestion` object `{schema:'agent-practice-suggestion/v1', practice, basis, line, endpoint_hint?}` where `practice` is one of a small locked vocabulary of **agent examination practices** and `line` comes from a **fixed pre-authored string set** (never composed, never predictive) in the **QUESTION form the Step M verdict directs for agents** (superseding this plan's original destination form): *"This record shows ⟨basis⟩. Before proceeding: is this the reasoning this action warrants?"* — naming the gap and asking, never naming the practice as a destination; the `practice`/`endpoint_hint` fields still carry the machine-readable target, but the rendered `line` prompts the agent's own examination rather than compliance. Then stops.
- **One suggestion max** per response (the teacher names *the* next practice, not a menu), selected by a fixed precedence order; **honest null** (field absent) when no basis clears its evidence floor.

**VETTED signal → practice mapping (Step M, 2026-07-27 — binding; precedence top-down as REORDERED by the verdict; verbatim record `2026-07-27-step-M-mentor-verdicts-verbatim.md` wins):**

> **The Step M verdicts that reshape this table:**
> 1. **Precedence REVERSED: B2 (obligations) now outranks B1 (unclosed loop).** "Dikaiosyne — giving
>    each their due — is not subordinate to procedural completeness. An agent that finishes its own
>    internal examination while leaving an obligation to another party unaddressed has prioritised
>    its own reasoning hygiene over its actual duty."
> 2. **The suggestion takes a QUESTION form for agents, not the human destination form** — the most
>    important verdict in the consultation. The agent "is already standing at the door with its hand
>    on the handle", so a named practice risks the suggestion doing the reasoning. Vetted shape:
>    *"This record shows ⟨what was found⟩. Before proceeding: is this the reasoning this action
>    warrants?"* — it "names the gap and asks whether the agent's own reasoning has addressed it",
>    and it works mid-task (no exit into a full exercise). **Two response templates, one shared
>    signal mapping** — the signal→basis rows below are shared with the human table's logic; only
>    the rendered form differs by practitioner type.
> 3. **B1 narrowed**: fire only on a loop *genuinely* not closed — not on one that produced a result
>    and merely lacks formal closure (a record-keeping gap, not a reasoning gap) — if the
>    classification can distinguish them.
> 4. **B5 gains a threshold**: a sustained decline across **2–3 consecutive sessions**, never a
>    single-session dip ("if it fires on any decline… the agent will learn to treat it as noise").
> 5. **B6 placement**: a fair analog only as the *minimal* version of morning preparation. The
>    architecture HAS a session-opening moment — the H1 calling gate at SessionStart — which is the
>    stronger analog and where this should ideally fire; mid-task B6 is the best available
>    approximation and stays as fallback.
> 6. **B7's silence is confirmed and PROTECTED** "against any future pressure to add a default
>    suggestion for completeness."

| # | Measured signal (already served today) | Suggested examination (rendered in the QUESTION form) | Verdict |
|---|---|---|---|
| **B2** | Engaged-circle `obligation_assessment` violated/indeterminate, or `first_circle_obligation_trend` declining, or dikaiosyne the weak domain | `examine_obligations` — name the affected circles explicitly in the next examination | **Mentor-given analog, now FIRST in precedence** |
| **B1** | `examination_open` on this assessment / `loop_fold.character.loops.open > 0` — **genuinely unclosed only** (see note 3) | `reexamine_same_depth` — close the loop via `prior_feedback` at the original depth (the CI-4 affordance) | Confirmed, second in precedence; the closure-class distinction is a build item |
| **B3** | ~~`sub_species_frequency_deltas` `recurring`/`new` in the **phobos** family~~ **CORRECTED 2026-07-28 (BD-6, built): `agonia` or `oknos` ONLY** — `recurring`/`new` in `sub_species_frequency_deltas`, or in `passions_persisted_in_window` | `premeditatio_examination` — examine the feared outcome class before the next such act | **Mentor-given analog** (agonia → premeditatio). **THIS ROW AS WRITTEN WAS AN OVERREACH.** The verbatim record rules in terms: *"do not generalise to the whole phobos family… agonia and oknos are the intended targets and the generalisation to all phobos is an overreach."* Its reasoning is about the passion↔practice fit, not the practitioner (deima/thorybos are acute and present-tense; thambos → *"silence is preferable to a weak suggestion"*; *"premeditatio is not the natural next practice for shame"*), and the agent section licenses only the **form** to differ, not the mapping. Caught by the A1 PR19 independent review; the human half already shipped the differentiated table. The other four are **SILENT** for agents in v1 — their human targets (morning preparation; the log revisited with the mirror principle) have no agent analog, and inventing one would be the unlicensed extension the record warns against. **Named follow-up for the next mentor consultation.** |
| **B4** | Persisting **epithumia**-family sub-species | `reserve_clause_examination` — examine where the intended outcome has become the condition of equanimity | **Confirmed** ("the framing is precise") |
| **B5** | A `dimension_trends` decline **sustained across 2–3 consecutive sessions** (never one dip) | `deepen_examination` — take the next same-class decision at standard/deep depth | Confirmed **with the threshold** (note 4) |
| **B6** | Self-only circle pattern / absent purpose context | `calling_purpose` — `/api/calling`; ideally fired at the session-opening moment (the H1 calling gate), mid-task as fallback | Confirmed as the **minimal** analog (note 5) |
| **B7** | *(none of the above)* | *(no suggestion field; the live `reflect_due` default already covers the close)* | Confirmed — **protected silence** (note 6) |

**Attach points (both additive, flag-gated, absent-when-off):** `/api/reason` happy path and the accreditation write 200 — as an optional `suggestion` member **inside the existing `practice` block** (the CI-13 carrier; the hint's current four fields are byte-identical when the new flag is off). **Deliberately NOT attached:** the delta/fold blocks (their no-recommendation contracts stand untouched), `GET /api/trust-record` (S10 withholding stands), `/api/guardrail` (the gate stays lean; a future election), `/api/practice/discernment` (already carries the S4 measure recommendation — different animal, unchanged).

**Flag:** new `SUBSTRATE_PRACTICE_SUGGESTION_ENABLED`, dark build; unit battery asserts flag-off byte-identity of both responses, the one-suggestion invariant, every mapping row incl. honest-null, floor behaviour, and the locked strings as exported values.

**Framing (restated on the block itself, `VOCABULARY_NOTE`-style):** advisory only (channel law) · binds nothing · not an S4 input · never a trust-event source · evaluative-never-predictive, record-descriptive past tense · **weights-tier use remains blocked**.

**Tier:** `code-elevated` (dark, flag-gated, additive). **Review:** PR19 independent adversarial review REQUIRED (live agent-facing response shapes + composition over trust signals — squarely in scope) before treated as verified.

**SECOND CONSULTATION FOLDED 2026-07-28 (`operations/reminders-2026-07/2026-07-28-mentor-verdicts-agent-suggestions-verbatim.md` — binding; where it speaks it is the later, more specific ruling):** the B3 differentiation is now COMPLETE, not merely narrowed — agonia/oknos → premeditatio-class per sub-species (plain-language lines, mentor-verbatim); **deima/thorybos → the control-filter question** (`control_filter_examination`, the second vetted question form — NOT calling_purpose); **aischyne → `reexamine_same_depth`** with the mirror-principle clause; **thambos → silence** (confirmed twice). **A lupe row was added:** phthonos/zelotypia persisting → `examine_obligations` ("both failures of oikeiosis"); penthos/achos/eleos and the whole hedone family confirmed SILENT. **The craving row split:** philodoxia carries its specific vetted line; every other epithumia sub-species the general-contingency line (plain-language names for the rest await vetted copy — known limitation). The machine-readable `practice`/`endpoint_hint` fields CONFIRMED staying ("the doorbell boundary is maintained by the question form of the rendered line, not by withholding the lookup result"); BD-1b's kathekon gate CONFIRMED in the letter ("not a refinement but a structural necessity"); the Item 8 closure principle settled for the fold-open follow-up (formal closure = the SAME decision re-examined; adjacent competence never closes); Items 6/7 settle A2's session unit (the accreditation write; plateau threshold ≥3-of-4 recent with no reflexive, else 3-consecutive as a documented approximation) and the grade-change read (the FULL signal mapping against the fresh record; no grade-keyed corridor).

**STATUS 2026-07-28: A1 is BUILT DARK + independently reviewed + review-folded, and the second consultation's verdicts are FOLDED** (`D-PRACTICE-REMINDERS-AGENT-A1-SUGGESTION-COMPOSER-BUILT-REVIEW-FOLDED` + `D-PRACTICE-REMINDERS-AGENT-SUGGESTIONS-MENTOR-VERDICTS-ADOPTED-AND-FOLDED`). Flag `SUBSTRATE_PRACTICE_SUGGESTION_ENABLED` unset everywhere ⇒ both surfaces byte-identical; nothing activated. Nine build decisions recorded (BD-1a fold-open silence · BD-1b kathekon-gated B1, mentor-confirmed · BD-2 B5 silent · BD-3 carrier gating · BD-4 beyond-self circle · BD-5 weak-means-weak · BD-6 sub-species differentiation, review-forced then mentor-completed · BD-7 the acute-fear question-form fork, decided by the truthfulness discipline · BD-8 the philodoxia/general craving split · BD-9 the oknos mechanical tails + passion-tier micro-ordering). The locked vocabulary is now 18 basis codes / 7 practices / 2 vetted question forms. Batteries after the fold: practice-suggestion **759/0** · loop-fold **181/0** · trajectory-delta 73/0 · trajectory-overlay 36/0 · aah-store 120/0 · kathekon 105/0 · practice-cycle-hint 13/0 · practice-sequence 645/0 · S4 417/0 · S10 106/0 · trust-core 98/0 · emission-hooks 15/0 · accreditation route 90/90 · `tsc` 0 · `npm run build` 0. **Mutations: 32/32 (A1) + 13/13 (the verdicts fold) killed.**

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

**A1 COMPLETE 2026-07-28** (dark; see §4's status block). Next: **A2** (the reflect developmental read-back) → **A3** (R18 docs + the founder-walked Critical activation, which is where A1 and A2 both go live).

**Gated on:** the human plan shipped (election E4) **and** Step M — **the Step M gate is DISCHARGED 2026-07-27** (`D-PRACTICE-REMINDERS-STEP-M-MENTOR-VERDICTS-ADOPTED-2026-07-27`; the §4 mapping, precedence and string form are now the VETTED versions above — B2 before B1; the question form; the B5 threshold). The human-plan-shipped condition: Phases 0/1/4 are live, Phases 2–3 now unblocked; the founder sequences whether A1 waits for them (E4's "after this plan ships" reading is the founder's call at commencement). Order: **A1 → A2 → A3** (A1/A2 are independent dark builds and may swap; A3 activates whatever is built). Estimates: A1 ~1 session · A2 ~1 · A3 ~0.5–1 + the founder-walked activation. Risk: A1/A2 `code-elevated` (dark, byte-identical flag-off); A3 **`code-critical`** (env-flag activation of new response surface content; full Critical Change Protocol; nothing in this plan pre-approves it). PR19 independent review before either build is treated as verified.

## §9 Out of scope (recorded)

- Suggestions on `/api/guardrail` or `/api/practice/discernment` (future elections; the gate stays lean, discernment already carries the S4 measure recommendation).
- Any scheduled/push channel (agents are request-driven; the cadence *is* the rhythm).
- Harness (H1–H5) rendering of the suggestion inside frames — a natural later step for the reference harness, advisory by the channel law; not part of this plan.
- Any personalisation beyond the credential's own record; any cross-agent comparison; any predictive framing.

*End of plan. Companion to the human plan; built after it ships, vetted through the same Step M consultation.*
