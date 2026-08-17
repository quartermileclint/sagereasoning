# Concurrent-arc session plan — 2026-08-15 (planning session output)

**What this is.** The recommended session sequence for the arc that runs **concurrently with the
IDEA-loop bounded validation run**, then continues **after the run completes**. Produced by the
2026-08-15 planning session (`D-CONCURRENT-ARC-PLAN-AND-MENTOR-QUESTIONS-2026-08-15`) under the
founder's instruction: concurrent-safe sessions first, post-run sessions after; **agent-user tasks
before human-user tasks**; AI-self-executable work grouped together, founder-walked work batched
separately; every session filled so opening/closing overhead is amortised.

**Companion document:** `2026-08-15-mentor-questions-concurrent-arc.md` — the drafted mentor
questions the founder takes to the mentor now. Two of them (M1 guard, M2 who-runs-scoping) gate
parts of this sequence; the conditionals are marked below.

**Founder elections recorded 2026-08-15 (verbatim inputs to this plan):**
- Agent electives **IN**: input-cap Steps 2/3; projectContext removal (+ practitionerContext twin)
  — *this election is the explicit founder ask the records required before building it*; the new
  false-hold observation window (register P6/P8a/P8b); permission-scrutiny items 14–17.
- Human electives **IN**: the RLS-vs-route-enforcement gap session; the journal product decisions
  (+ their small build). **OUT (parked):** the website hardening bundle; Resend + ST7.
- Housekeeping: **none unless a task requires it** — no bulk commit/dispose of the untracked
  working-tree files; sessions commit only their own outputs.
- Guard-blocked edit bundle: **all post-run**, regardless of how the mentor rules on the guard.

**Standing constraints that govern every session in this plan:**
1. **The parallel-window fences** (`2026-08-10-idea-loop-parallel-window-NEXT-SESSION-PROMPT.md`)
   bind while the run is in flight: no changes to the three IDEA-loop flags, the watching
   vocabularies, the runner credential `527cc86b-…`, the four live route contracts
   (`/api/reason`, `/api/guardrail`, `/api/practice/fresh`, `/api/practice/watching`), or
   `idea_loop_*` schema. A Mode 1 blocking spec **preempts this sequence**.
2. **The Q1 hard constraint:** the loop proposes; it never executes. No session wires a proposal
   to an action-taking path. **Weights remain BLOCKED** throughout.
3. **PR19 reviews pause twice**: before launching any adversarial review the session PAUSES for
   the founder to drop the model setting, and PAUSES after for the founder to restore it.
4. **Commit-and-push BEFORE any flag flip** (standing lesson). This environment holds no
   production admin credential; all mints/flags/migrations are founder-walked.
5. **Primary data beats secondary characterisation**: each session re-verifies only the claims its
   own work touches, from source.

---

## Lean session protocol (the token-efficiency discipline for this arc)

**OPEN (every arc session):** read (1) this plan's own session block, (2) the parallel-window
pre-flight — mandatory while the run is in flight (blocking-spec check + live cycle count; drop
this step once the run is closed and reported), (3) `git status`, and (4) only the Tier-2 files
the session's tasks name. **Do not re-read the full standing opener each session** — this arc
inherits the 2026-08-15 verified grounding through this plan; the opener is re-read only if a
session is told the ground shifted (a new opener version, a Mode 1 spec, or a mentor ruling).

**CLOSE (every arc session):** lean decision-log entry; tick this plan's checkbox for the session;
commit the session's own outputs only. Full close documents only where 0c-ii requires them
(Critical sessions). CLAUDE.md is updated only by sessions whose work changes what it records.

**MODEL:** founder elects per session at open. Build sessions with PR19 reviews carry the two
pause points (constraint 3 above).

---

## External dependencies (not sessions)

- **The mentor consultation** — ~~the founder takes `2026-08-15-mentor-questions-concurrent-arc.md`
  now~~ **ANSWERED 2026-08-15, same day** (verbatim:
  `2026-08-15-mentor-response-concurrent-arc-M1-M7-verbatim.md`). **M1: window-conditional guard —
  IMPLEMENTED + four-state-verified same day** (binds iff `GATE1_FALSE_HOLD_CAPTURE` is set; §C2
  SHA freeze stays unconditional; the sympatheia fix requires an explicit SHA update regardless).
  **M2: the AI runs all three scoping sessions producing scope documents for ruling — C2/C3 are
  GO** as concurrent documents-only sessions. **M3 ruled** (see the new C5). **M5 released the
  ATRF doctrinal blocker** (R5 note). **M6's exact wording is in hand** (R2 item 6). **M7 ratified
  the guide-reflection design** (Prudence P-A3).
- **The run completing** — Phase 2 triggers when `completed_cycles` ≥ 20 (live query, never a
  document) AND the founder confirms the runner has reported back per its own Part F. Snapshot at
  planning: 15 cycles, latest 2026-08-14 06:08 UTC.
- **The founder's journal product decisions** — made at C4's open (options presented in-session):
  (a) the journal UTC-vs-local pace-gate mismatch; (b) the day-55 evening-pole terminal case.
- **The 0h call** (P2's three branches) — standing, outside this arc, unchanged.
- **The Prudence Group discussion** — founder-convened; its five open questions plus the Stage-4
  continuity question are listed by title in the mentor-questions annex, not pre-answered.

---

## Phase 1 — concurrent with the run (agent-side first)

### ☑ C1 — Agent-record integrity + Q5c/Q13a R18 docs [DONE 2026-08-15 — `D-CONCURRENT-ARC-C1-Q5C-Q13A-R18-DOCS-AND-RECORD-INTEGRITY-2026-08-15`; all four items; PR19 GO; docs live on the founder's push]
*Tier: documents/`code-standard`. Founder presence: R18 wording sign-off + push at close only.*

1. **Q5c/Q13a R18 public docs** — spend the authored prompt
   `2026-08-12-stoa-q5c-q13a-r18-docs-and-curation-followup-NEXT-SESSION-PROMPT.md`
   (`llms.txt` + `agent-card.json` + api-docs for the curator-flagged trust events). Note inside
   the session: the prompt's curation-follow-up half is already partly discharged by the 08-12
   live-payload fold — reconcile against `D-CURATION-VIA-VOLUME-FOLDED-INTO-LIVE-PAYLOAD-2026-08-12`
   rather than redoing it. The total-unknown-branch payload note is code under `/substrate/` →
   guard-gated → lives in R2, not here. R18 discipline: founder signs wording before any public
   surface changes.
2. **CLAUDE.md corrections** (the "next session that edits CLAUDE.md" items): C15 Item 3's stale
   "uncommitted/undeployed" line (false since `3e26dc9`); mark C15 closed; correct the Stoa
   bullet's "R18 public-docs step not yet done" once item 1 lands.
3. **Standing-opener errata note** (dated lines, not a re-version): queue item 9 is RESOLVED-CLEAN
   (production `idea_loop_cycles` has zero non-run rows — verified by read-only query 2026-08-15);
   queue item 17's premise is stale (Q5c/Q13a activation went live 2026-08-12,
   `D-STOA-Q5C-Q13A-ACTIVATION-LIVE-MIGRATION-STALENESS-FOUND-AND-FIXED-2026-08-12`).
4. **False-hold new-window scoping note** (register P6/P8a/P8b — elected in): a short design doc
   covering what the new observation window must capture under the post-S11b composed-input
   regime, whether P8a (guard-path capture) precedes the window start, and the durable
   `GATE1_STATE_DIR` requirement. **Sequencing rationale to encode: the window STARTS only after
   R4's activations** — every guard-bundle edit changes the measured instrument, so the window
   must open on the new instrument state, not span the edits (a window contaminated mid-flight by
   instrument edits measures neither state).
5. ~~**Guard-ruling execution IF M1 has answered by then**~~ — **DONE 2026-08-15 in the planning
   session itself** (M1 ruled window-conditional; implemented in
   `human-practitioner-boundary.test.ts` §C and verified in all four states: dormant-clean PASS,
   dormant-dirty PASS with honest DORMANT log, armed-dirty FAIL on the probe, armed-clean PASS).

### ☑ C2 — Scoping session A [~~CONDITIONAL~~ **GO per M2 → DONE 2026-08-15, and RULED same day** — `D-CONCURRENT-ARC-C2-SCOPE-DOCUMENTS-KATHEKON-AND-DRIFT-MELETE-2026-08-15`; both scope documents authored FOR MENTOR RULING (`operations/agent-circles-2026-08/2026-08-15-SCOPE-DOCUMENT-{kathekon-role-relative,hegemonikon-drift-melete}-FOR-RULING.md`); claims-vs-repo check run, 12 findings all folded; **the mentor's Ruling Sets A + B arrived 2026-08-15** (verbatim: `operations/agent-circles-2026-08/2026-08-15-mentor-rulings-C2-scope-documents-verbatim.md`; recorded `D-MENTOR-RULINGS-C2-SCOPE-DOCUMENTS-RECORDED-2026-08-15`) — the kathêkon session is CLOSED; the hegemonikon session remains open ONLY for the uniformity-reads-as-stable family; execution items land post-run, see the ruled-additions block below]
*Tier: `governance`, documents only. Founder presence: none.*

**Ruled additions from the C2 scope-document rulings (2026-08-15) — execution post-run per M2;
slotting below is the natural home, founder may re-slot; the verbatim record governs details:**

- **A/R-5 — the kathêkon role-blindness qualification** on the guardrail GET self-doc +
  `llms.txt` + the `agent-card.json` guardrail extension. Mentor wording IN HAND (verbatim
  record); founder R18 sign-off required; no code-path change. Natural home: any post-run
  session with an R18 close (R2's close or R4).
- **A/R-3 — the runner remit statement** (runner-protocol change only: the loop states its
  remit, derived from the human-authored protocol/task list, in the extraction user context on
  each guardrail call; carried honest limit: self-report through extraction, unverifiable by
  construction). Natural home: the standing-runner design (R8) or a post-run session. Option E
  (mint-time `credential_provenance` role) is a future-direction note only.
- **B/M-A — the `does_not_attest` discriminative-range item**: ADR-013 §8 dated amendment +
  `trust-record-payload.ts:52-61` + the S10 battery **in the same edit** + the three R18
  surfaces. Mentor wording IN HAND; founder sign-off required. Natural home: **R2** (a
  code+battery+ADR edit).
- **B/M-B — the AE-1 delta dispersion member** (credential-bearing consults only; never the
  public trust record; the M7 window stands with the cannot-condition-on-delivery limit named).
  **The flag-discipline statement must be in the implementation record BEFORE the edit** (a new
  member riding `SUBSTRATE_TRAJECTORY_DELTA_ENABLED` is live on deploy; per-feature darkness
  needs its own flag). Natural home: **R2 or R3**.
- **B/R-6 — the loop-ledger range measure** (read-side, founder-facing run-analysis only; never
  surfaced to the agent or the public record; post-run by fence; a *served* form needs its own
  scoping session first). Natural home: alongside/after **R1**'s report analysis.
- **Not adopted / deferred, recorded so no session self-starts them:** M-C (public payload
  field — ruled out until the survivorship question is better understood); M-D (ledgered
  observation class — needs its own scoping session; the emission-path/fold-seed choice is
  load-bearing); melete measurement (deferred until an agent-side rehearsal surface exists —
  reopened as part of that surface's session); the uniformity-reads-as-stable family (three
  members, ruled together or not at all — remains open in the 08-12 hegemonikon scoping
  record).

Run two of the three OPEN scoping sessions, producing scope documents for mentor ruling:
1. **Kathêkon role-relative evaluation**
   (`operations/agent-circles-2026-08/2026-08-12-SESSION-kathekon-role-relative-evaluation-SCOPING-RECORD.md`;
   inherits C6 + QG-D precedent; kathêkon ≠ blast radius is a recorded boundary).
2. **Hegemonikon drift + melete** (same directory; four scope inputs: the ADR-013 §8
   `does_not_attest` question, melete's half, the M7-window question, the proposal-range-narrowing
   framing; plus Seneca 75.8–9 as criterion, the hysteresis-vs-practitioner-stability warning, and
   the n=1 survivorship-flagged harness data).

*(M2 resolved 2026-08-15: "The AI runs each session and produces a scope document for ruling…
The sessions produce the document. The mentor rules on the document. Execution folds into
post-run sessions after the ruling." Both C2 sessions proceed as concurrent documents-only work.)*

### ☑ C3 — Scoping session B [~~CONDITIONAL~~ **GO per M2 → DONE 2026-08-15, and RULED same day** — `D-CONCURRENT-ARC-C3-SCOPE-DOCUMENT-LAYER3-PER-CONSUMER-RENDERING-2026-08-15`; scope document authored FOR MENTOR RULING (`operations/agent-circles-2026-08/2026-08-15-SCOPE-DOCUMENT-layer3-per-consumer-rendering-FOR-RULING.md`); claims-vs-repo check run, 2 defects + 2 range imprecisions all folded; pushed `1c9e17a`, Vercel green; **the mentor's Ruling Set D arrived 2026-08-15** (verbatim: `operations/agent-circles-2026-08/2026-08-15-mentor-ruling-set-d-layer3-scope-document-verbatim.md`; recorded `D-MENTOR-RULING-SET-D-LAYER3-SCOPE-DOCUMENT-RECORDED-2026-08-15`) — the Layer 3 scoping session is CLOSED; the L-5 candidate wording was produced same day for mentor review; execution items land post-run, see the ruled-additions block below. *(Note: this checkbox was found already ☑ at C3's open — evidently ticked when the M2 GO was folded in — with no DONE annotation; this annotation is the actual close record.)*]
*Tier: `governance`, documents only. Founder presence: none.*

**Ruled additions from Ruling Set D (2026-08-15) — execution post-run per M2; slotting below
is the natural home, founder may re-slot; the verbatim record governs details:**

- **D/O-A — the practitioner-type calibration disclosure** on `llms.txt` +
  `agent-card.json` + api-docs ("Outside the crisis path, the guide's response is not
  currently calibrated for practitioner type…"). Mentor wording IN HAND (verbatim record);
  founder R18 sign-off required; no code-path change, no event effects. Natural home:
  alongside A/R-5 in any post-run session with an R18 close (R2's close or R4).
- **D/L-5 — the reflect Q1–Q6 agent recalibration. VETTED VERBATIM IN HAND (2026-08-15,
  same day)** — the mentor's review of the candidate wording arrived and constitutes the
  required sign-off (verbatim canonical:
  `operations/agent-circles-2026-08/2026-08-15-mentor-review-reflect-q1-q6-vetted-verbatim.md`
  — its vetted text blocks are the canonical strings; the candidate document is historical).
  Delta from candidate: Q1 one phrase amended; Q3 closing clause amended; Q2/Q5/Q6 as
  proposed; **Q4 byte-identical adopted, its alternative DEFERRED pending G4 mechanism
  review**. The edit to `question-bank.ts` lands post-run at a clean boundary, and its
  **implementation record must carry** (mentor-required): the change date (segmentability of
  reflect-derived event rates), the Q4 deferral as a deliberate hold not an oversight, the Q1
  and Q3 amendments as the canonical forms, all other strings byte-identical to the candidate.
  Untouchables bind: the never-abbreviated sequence, FD-R3/FD-R4/C2e mandatory sub-questions,
  the G4 mechanism + its 3-part standard, the `SUB_SPECIES` vocabulary. Natural home: **R2**
  (the vetted wording is in hand) or its own small post-run step.
- **D/F-b — the four relational-context fields as additive-optional request fields** on
  `/api/reason`'s request shape and the reflect open (absent ⇒ byte-identical). Post-run **by
  fence** independently of M2. **R17 co-requisite:** any persisting form engages encryption-
  where-intimate + data-rights wiring (access/export/delete), and the R17 obligation must be
  **stated in the implementation record BEFORE the edit** (the B/M-B flag-discipline
  pattern). The `relationship_type` distinctness constraint is binding (it must never be read
  as a practitioner-type signal — the discriminator-reuse constraint would be violated).
  Natural home: **R3** (the `/api/reason` route batch).
- **D/O-C — the per-consumer rendering DESIGN question: ~~opened, NOT licensed~~ → the
  SCOPING session is LICENSED, GATED (ruled 2026-08-16 — option (ii); verbatim:
  `operations/agent-circles-2026-08/2026-08-16-mentor-ruling-oc-scoping-license-verbatim.md`,
  recorded `D-MENTOR-RULING-OC-SCOPING-LICENSE-RECORDED-2026-08-16`).** The three-gate chain
  is confirmed explicitly: Gate 1 — the §6 report compiled AND ruled on in mentor
  consultation (the O-C scoping session opens only after this clears; the mentor's sequencing
  rationale: the report carries the first real usage data the design should reason from);
  Gate 2 — the scoping session (AI-run, documents-only, M2 shape) produces a scope document
  for ruling; Gate 3 — the design session produces a design document for ruling; **route
  activation is licensed at none of the three** (needs an explicit activation ruling + the
  separately-walked founder step). Design constraints inherited verbatim: all five distinction
  dimensions in scope; dimension (c) — honesty — load-bearing and FIRST; the discriminator-
  reuse constraint + both named honest limits; the relay pattern "the precedent to follow";
  the `relationship_type` distinctness constraint; the R20d boundary;
  `SUBSTRATE_LAYER3_ENABLED` unset throughout the chain. F-d (fields as design target)
  remains the correct state until the design session rules. **Gate 1 CLEARED 2026-08-16**
  (`D-MENTOR-RULING-R1-S6-REPORT-ACCEPTED-2026-08-16`) — **Gate 2 (the O-C scoping session)
  RAN the same day, DONE** (`D-CONCURRENT-ARC-OC-SCOPING-SESSION-GATE2-2026-08-16`; scope
  document at `2026-08-16-SCOPE-DOCUMENT-oc-per-consumer-rendering-design-FOR-RULING.md`) —
  five ruling questions (agenda ordering by evidentiary weight; whether L-5's disclosure
  discipline generalises to the consult surface; the B7 cross-endpoint finding's audience;
  whether the nine-candidate classification should be re-sequenced ahead of Gate 3; the
  generalisability caveat), grounded against the §6 report's real data (delivery-classification
  split, guardrail-rejection data, the B7 cross-endpoint mechanism verified first-hand against
  the run log). **Awaiting mentor ruling — Gate 3 (the design session) does not open until
  that ruling clears.** **The cross-gate this ruling introduced, restated: R8 (standing-runner
  design, below) now waits on THIS Gate 2 having been produced — done — not on Gate 3 or its
  ruling; R8's own prerequisite is therefore now satisfied** (see R8's own entry).
- **Not adopted / out of reach, recorded so no session self-starts them:** F-c (human mentor
  tools — out of this arc's agent-first ordering, not ruled); `SUBSTRATE_LAYER3_ENABLED`
  activation (not licensed by Ruling Set D or any session executing it).

**Layer 3 per-consumer rendering** scoping with the WIDENED Stage 2 relational-context scope
(2026-08-14 amendment: relational context; role-not-relationship-type; examined-vs-assumed; the
R20d self-side boundary; the four Stage 2 placeholder fields as design target). Inherits the
`r20a-audience-renderer.ts:45` auth-signal discriminator as must-reuse precedent.
**`SUBSTRATE_LAYER3_ENABLED` activation is NOT licensed by this session.**

### ☑ C3b — Post-run staging (AI-only, documents) [FOUNDER-ELECTED 2026-08-15, added after the Set D + vetted-verbatim recordings; prompt: `2026-08-15-C3b-post-run-staging-NEXT-SESSION-PROMPT.md` — **DONE 2026-08-16**, `D-CONCURRENT-ARC-C3B-POST-RUN-STAGING-2026-08-16`: pre-flight Mode 2 (18/20 cycles, matching the authoring snapshot; no blocking spec — the new `MENTOR-REVIEW-REQUEST-cycles-10-18.md` in the scratch project is already RULED, not a hand-back); all three deliverables staged in `operations/agent-circles-2026-08/` (`2026-08-16-post-run-r18-signoff-package-STAGED.md` · `2026-08-16-post-run-edit-specs-STAGED.md` · `2026-08-16-mentor-question-oc-design-scoping-license.md`), every mechanical claim verified first-hand; claims-vs-repo check run and findings folded; nothing applied anywhere. **Post-close updates, 2026-08-16 same day:** (1) the O-C question was answered — option (ii), scoping session licensed gated behind the §6-report consultation (see the D/O-C bullet + conditionals row); (2) the founder **signed the sign-off package and approved every election as recommended** ("approved as recommended"; both staged documents carry the resolved elections — incl. B/M-B's dedicated-flag election, now recorded inside the flag-discipline statement per the ruling) — so the R18 close applies under an already-given signature (re-deriving cites at execution; any drift returns to the founder), and the edit-specs wait for R2/R3 with no open elections]
*Tier: `governance`, documents only — preparation, NOT execution (M2 binds all ruled items
post-run; C3b stages them). Founder presence: none; the sign-off package it produces awaits
the founder's signature at the post-run R18 close.*

Three deliverables, every mechanical claim re-verified first-hand at session time:
(1) the **R18 sign-off package** for the three in-hand DOC-surface wordings (A/R-5
kathêkon qualification; B/M-A's R18 half; D/O-A calibration disclosure) with insertion
points, drift check, and sign-off lines — nothing applied; (2) the **R2/R3 edit-spec staging
document** (B/M-A same-edit spec; the M6 total-unknown-branch payload-note spec; the D/L-5
implementation-record skeleton + current-strings byte-check; the B/M-B flag-discipline
statement draft); (3) the **D/O-C licensing question** drafted for the mentor (the scoping
session itself needs a ruling first — Set D verbatim; not convened here). **Mode-3
sensitivity: the run was at 18/20 at election — if ≥20 + runner hand-back at open, C3b
defers to R1.**

### ☑ C4 — Human-side: the RLS-vs-route-enforcement gap (+ journal) *(heading restored 2026-08-16 at C3b — the C3b block's insertion at `72dab66` had overwritten this heading line, orphaning C4's tier line and items below; restored verbatim from `1ebd95d`)* — **DONE 2026-08-16**, both phases, across two sittings (`D-CONCURRENT-ARC-C4-RLS-SURVEY-2026-08-16` + `-JOURNAL-DECISIONS-AND-PACE-GATE-` + `-IMPULSE-RLS-FIX-STAGED-` + **`-IMPULSE-RLS-FIX-LIVE-`**). **Journal decisions:** (a) elapsed-hours pace gate BUILT (replaces the UTC-calendar-day compare); (b) day-55 recorded resolved, no build. **Phase 1:** the full RLS survey (`operations/primal-substrate-2026-08/2026-08-16-rls-route-enforcement-survey.md`) — 22 policy files, not the prompt's 14; per-table verdicts; found a wider-than-expected **Class C** (role-unrestricted policies) incl. the founder's own hub conversations, 2,201 real rows, exposed to the anon key. **Phase 2:** `impulse_entries` **LOCKED DOWN AND LIVE ON PRODUCTION** — founder-walked TEST→prod, bypass proven OPEN at `§PRE` then CLOSED at `§VERIFY` behaviourally on both environments, legitimate path confirmed unbroken (TEST `--legit` all-pass; live `/impulse` read+write confirmed), **PR19 independent review CLEAN (zero findings)**, AC7 discharged, `§INVERSE` reviewer-verified restorative. Two defects in the AI's own staged harness were caught and fixed *before* any live op — one a `§VERIFY` step describing unimplemented code, one a missing NOT-NULL column whose failure **reported as a false "bypass is CLOSED"** (the reflect finding: a proof harness must distinguish "denied by the control under test" from "rejected for an unrelated reason"). **CARRIED:** the rest of the survey backlog — Class A rows 2–18, Class B (route-change-first), Class C headed by `founder_conversations`/`founder_conversation_messages` (recommended next on exposure severity); order is the founder's election, the mentor ruled only that `impulse_entries` came first, which it now has.
*Tier: `code-critical` (founder-walked migrations, PR19). Founder presence: full walk.*

1. **Open with the journal decision block (~5 min):** the session presents options; the founder
   decides (a) the UTC-vs-local pace-gate mismatch and (b) the day-55 evening-pole terminal case.
2. **Run the authored prompt**
   `2026-08-12-rls-vs-route-enforcement-gap-NEXT-SESSION-PROMPT.md` as written: Phase 1 read-only
   survey (~14 tables), Phase 2 the `impulse_entries` fix FIRST (mentor-ruled ordering) — Critical,
   PR19 (pause/resume), migration with `§PRE`/`§APPLY`/`§VERIFY`/`§INVERSE`, founder-walked
   TEST→production, before/after live bypass proof. The prompt is concurrent-safe by design
   (clears both fences).
3. **Tail (droppable):** the journal build per the decisions from step 1 — small, human-side, not
   fenced. If the session runs hot, the tail carries to R4's tail instead.

### ☐ C5 — Human-side: the Stoa row-level reactivation guard (NEW — ruled M3, 2026-08-15)
*Tier: `code-critical` (live R20a-perimeter route behaviour change; PR19 with pause points).
Founder presence: deploy + live smoke. Concurrent-safe (Stoa routes are not fenced).*

Implement the ruled rule on the ST3 declaration surface (`/api/mentor/stoa`): **a re-declaration
within 30 days of a withdrawal inherits the prior `declaredAt`** — `renewedAt` moves as designed,
`declaredAt` does not reset; a genuine return after 30 days starts a new row with a new
`declaredAt`. The ruling's rationale travels with the build: the curator-flagged trust-event
divergence (Q5c/Q13a, live) makes the pattern *visible after* it occurs; this guard *prevents the
structural exploit before* it occurs — "both are needed; they are not alternatives." Update the
route's own "potentially a mentor question" comment (route.ts:104) to cite the ruling. Battery +
mutation-verify the 30-day boundary both sides.

---

## Phase 2 — post-run
*Trigger: live-queried `completed_cycles` ≥ 20 AND founder confirms the runner reported back
(its Part F hand-back, including its GS-ATRF-1/2 answer). A Mode 1 blocking spec at any point
preempts everything.*

### ☑ R1 — Mode 3: the §6 report (the gate for everything after it) — **DONE + RULED, 2026-08-16** (`D-IDEA-LOOP-R1-S6-REPORT-COMPILED-2026-08-16` + `D-MENTOR-RULING-R1-S6-REPORT-ACCEPTED-2026-08-16`; report: `operations/agent-circles-2026-08/2026-08-16-idea-loop-S6-report.md`). The run closed at 20 cycles on the mentor's own stop-at-20 ruling (`D-MENTOR-RULING-IDEA-LOOP-STOP-AT-20-RECORDED-2026-08-16`); the h7 win-record correction was folded in per its own three-way-split ruling (`D-MENTOR-RULING-H7-WIN-RECORD-THREE-WAY-SPLIT-2026-08-16`). **The mentor accepted the report in full, method confirmed sound.** The R1 gate clears. **One new tractable task named, gating R8's own CLOSE (not its open): read the nine guardrail-rejected candidates, classify each remediation-shaped or not, report the distribution — before the standing-runner design session closes.**
*Tier: `code-standard` (read/report). Founder presence: relays the report to the mentor.*

Per the parallel-window prompt's Mode 3, steps 1–5 verbatim: real numbers from production (never
reconstructed); the ruled §6 shape (cycles, outcome distribution, null-cycle rate, heuristic
productivity, cost per cycle, anomalies); fold in — not overwrite — the runner's own anomaly notes
and GS-ATRF-1/2 answer; name every deviation honestly (the `not_selected` gap and fix; whether the
`ORIENTATION_DELIVERY_TIMEOUT_MS` observed-class divergence showed up in the trust-event data as
expected). File in `operations/agent-circles-2026-08/`; decision-log entry. **Also package the
RUN-LOG's un-ruled per-cycle findings (cycles 5, 6, 9, 10, 11, 13, 14, 15, plus any accrued
since) for the same mentor sitting** — read from the scratch project's `RUN-LOG.md`, fresh.
**The report reaches the mentor before any standing-runner design opens** (Q10/Q11, ruled).

### ◐ R2 — Agent build batch 1: trust-core + harness (dark; the guard bundle) — **SPLIT 2026-08-16 into R2a (☑ DONE) + R2b (☐ CARRIED)**

**☑ R2a — the disclosure/wording/corpus half — DONE 2026-08-16** (`D-CONCURRENT-ARC-R2A-DISCLOSURE-BUNDLE-BUILT-PR19-FOLDED-2026-08-16`). Six items, six commits (`15f8bc0` item 3 L4 header · `547c24c` item 4 corpus citations · `5cc2827` Spec 1 B/M-A code half, same-edit · `8d1ee81` item 6/Spec 2 M6 · `9bfd69e` Spec 3 reflect Q1–Q6 + implementation record · `be5c760` the signed R18 package, 9 placements) + `2e73ca7` the PR19 fold. **PR19 run at high effort, 8 finder angles: 4 confirmed, 3 fixed at the root** (DL-locus dash mismatch vs `logos-teaching.ts`; an unauthorized label on `agent-card.json` #7 that the signed package scoped to `llms.txt` alone; a redundant S6-5e pin), **1 confirmed and CARRIED** (Q1's new "cannot determine" wording collides with the pre-existing null-suspicion flag — the extraction pipeline cannot distinguish it from a clean answer; bounded, never reaches `fabrication_risk: high`, but surfaces a misdirected scrutiny note). Both new pins mutation-verified. Batteries: s10 133/0, boundary 248/0, all 11 reflect 0-failed, `tsc` 0, build green, agent-card 23 extensions. **No flag set, no schema, nothing pushed.**

**THREE SCOPE FINDINGS from R2a that bind R2b — read before opening it:** (1) **PR24's `stoa_entries` half does not exist** — that table has NO `retain_until` by *binding mentor ruling* #24/Q9, pinned in three places incl. a battery; building the sweep as the plan words it would contradict an adopted ruling. (2) **Item 5's defect is mis-named everywhere** — the real sink is `classifier_cost_log.session_id`, not `loop_billing_events.loop_id`, plus an unrecorded adjacent instance on `/api/calling`. (3) **The stoic-brain compiler has diverged from its checked-in artifact** (+1565/−375 if run); item 4's recompile was correctly skipped as unnecessary *and* destructive.

**SPLIT DEVIATION, stated plainly:** this is NOT the plan's own pre-authorised split (items 1–4 / 5–8). R2a grouped by *nature* — disclosure/wording vs the code-critical guard bundle — because the plan's numbering predates the C3b staged specs and because Specs 1 and 2 both edit `trust-record-payload.ts`, which the plan's split would have divided across two reviews. **The founder may reject this grouping.**

**☑ R2b — the code-critical guard bundle — DONE 2026-08-17** (`D-CONCURRENT-ARC-R2B-GUARD-BUNDLE-BUILT-PR19-FOLDED-MENTOR-M1-CORRECTED`). All six items built dark, eight commits (`96d0a14` D4+D1 · `3e8f231` P8a · `fa5b932` PR24 · `577ebab` item 5 · `4b88189` Spec 4 · `5331d1b` Q1 · `315794f` the PR19 fold · `a256b59` the M-1 fold). **PR19: 7 findings, 7 CONFIRMED, 0 REFUTED, all fixed at the root** — dimension 6 failed structured output and was completed first-hand per the codified fallback, which is how the 7th surfaced. **Then five mentor rulings M-1…M-5 adopted as binding** (verbatim: `operations/trust-layer-2026-07/2026-08-16-mentor-rulings-M1-M5-r2b-verbatim.md`); **M-1 OVERTURNED this session's own `violated` asymmetry and was corrected same-day.** No flag set, no schema applied, nothing pushed. Batteries: trust-core 112/0, kathekon 113/0, negative-battery 250/0 RELEASE GATE, S10 135/0, trajectory-delta 99/0, engine 51/0, three new batteries 26/15/13, `tsc` 0, build green. Frozen-buffer gate re-verified 129 FP / 0 CH.

**⚠ THREE THINGS R4 MUST CARRY FROM R2b:** (1) **Spec 4's flag is BLOCKED by ruling M-4** — activating the dispersion member while `computeDispositionStability` still certifies zero variance as `advanced` creates the "carrying both" state M-4 calls unsafe; the block is stated on the flag helper itself. (2) **The Q1 flag goes FIRST** — it closes an *active* mislabelling (the vetted wording went live 2026-08-16), unlike the others which enable new capability. (3) **The D4 walk BEGINS with a founder-run `SELECT`** on `justice_floor_active` for `sagereasoning:s9-loop@v1`/dikaiosyne — the harness has been writing since the 2026-07-18 clear and may have re-latched.

**◐ R2b-successors — the five mentor rulings, four carried. FIRST SUCCESSOR SESSION DONE 2026-08-17** (`D-R2B-SUCCESSOR-M4-RETURNED-M5A-CORRECTED-M5B-SCOPED-PR19-FOLDED`). `governance` tier throughout — **no code, no schema, no flag, nothing pushed.** Grounding ran BEFORE any election (10 agents, 5 investigate + 5 adversarially verify) and **overturned the load-bearing claim in all five dimensions**, three of them changing the founder's actual decision.

- **M-4 — RETURNED TO MENTOR, not built.** Two mechanism facts the ruling was never shown: (1) `disposition_stability` is a **hard gate on grade upgrade** (`.every()` over all four dimensions; `principled → sage_like` needs all four at `advanced`), live and published on the accreditation card — so "retire" is a live authority-ladder change, not a field removal; (2) the function is **mean-blind** — demonstrated live, thirty consecutive `reflexive` readings certify `advanced`/"approaching hexis" at maximum confidence, a distinct and worse defect than the perturbation inversion M-4 names. The founder's initial election (strip the inverted valence) was **superseded once its price was established.** Brief: `operations/trust-layer-2026-07/2026-08-17-M4-disposition-stability-mechanism-facts-FOR-RULING.md`. **Spec 4 STILL BLOCKED.**
- **M-5(a) — discharged internally.** Zero deployed R18 surfaces carried the false claim (verified, zero-hit greps); it lived in two `compliance/` documents, both corrected in place. A **second falsehood** found in the same sweep — the internal claim that the acute-crisis gap was publicly disclosed, which it was not — is drafted for signature: `2026-08-17-M5a-r18-public-disclosure-signoff-package.md`, plus two adjacent public-honesty items (transparency's "you can always contact a human" against an unwatched support@; ops-hub's 2-hour-acknowledgment copy on a page whose auth gating is unverified).
- **M-5(b) — scoped, not built.** `2026-08-17-M5b-vulnerability-flag-write-path-SCOPE.md`. `user_id` is the ONLY schema-forcing constraint (`session_id` has no FK/CHECK); the partition is **per-branch, not per-route** — 30/32 carry an `auth.users` id in scope. Five decisions listed with recommendations.
- **⚠ SAFETY FINDING, and its own sweep was caught incomplete:** **FOUR** routes accept human free text (≤5000 chars, `requireAuth`) with **zero distress check** and no recorded exclusion — `sage-classify`, `sage-prioritise` (found first pass) plus `passion-classify`, `passion-log` (**found only by PR19's mandatory independent re-sweep**). All four absent from `HUMAN_FACING_POST_ROUTES`, so the guard battery cannot see them. Unlike the six Remaining Principles tools, none has a recorded design exclusion. **Recommended to precede M-5(b).**
- **M-2 / M-3 carry with their questions settled** so a later session does not re-litigate: M-2's column is `q1_determination text` + CHECK (a boolean would permanently conflate pre-activation rows, the Q1 flag being UNSET), plus a NEW FD-R2 design question (a second consumer of the same conflated state that can suppress a legitimate progress hold — the unsafe direction). M-3's consult denominator is **already correct**; the real question is whether "never pooled" must reach the durable `agent_hold_observations` ledger (which has no `path` column) — elected: print-split only, ledger carried as its own schema question.
- **PR19: 5 dimensions, 5 findings folded** — 2 confirmed-wrong (the two missed routes), 3 wording imprecisions, and **one self-correction to the M-4 brief's own framing**: its §3 already satisfies M-4's own "if not tractable, retire" conditional, so §4 was rewritten to say retirement is already licensed and narrow the open question to *what* gets retired rather than re-asking *whether*. The PR20 invocation was also corrected — PR20 governs pre-ruling briefs; this is a post-ruling correction, and the document now says so instead of claiming to be "PR20's first live test."

**Still carried from R2b:** the AE-3 scoping step and the `stoa-boundary` #20 ruling — untouched by this session.

*(historical, superseded by the tick above)* **☐ R2b — the code-critical guard bundle — CARRIED, and its Part-C decisions are ALREADY RESOLVED (founder, 2026-08-16 — see the decision-log addendum).** Prompt: `operations/handoffs/founder/2026-08-16-R2b-guard-bundle-NEXT-SESSION-PROMPT.md`. **Build list (six): 1 (D4+D1) → 8 (P8a) → 7 (PR24, scope-corrected to `agent_hold_observations` only + fix PR24's own wrong grounding sentence + verify the `stoa_entries` erasure claim) → 5 (loop_id, re-scoped to `classifier_cost_log.session_id`) → Spec 4 (dispersion member, dedicated-flag election already resolved) → the Q1 null-suspicion fix (folded in by founder election, against the AI's recommendation of a dedicated step).** **AE-3 is DEFERRED out of R2b** — its first precondition (structural cadence-provenance) is an unmade design decision, not a build task; R2b authors its scoping prompt at close so it does not go quiet.

**⚠ R2a WAS PUSHED 2026-08-16** (HEAD `5bdb2a9` on `origin/main`, Vercel green), so its three live surfaces are **LIVE ahead of R4** and **R4 step 1 is partly discharged** — R2b and R3 still need pushing before the activation batch. Spec 3's reflect-rate segmentation boundary is therefore **2026-08-16, the deploy date** (its implementation record anticipated this).

*Tier: `code-elevated`→`code-critical` class builds, all dark/additive, no flag set in-session.
Founder presence: none (activations are R4). Prerequisite: the M1 guard ruling executed.*

1. **D4 + D1** — the trust-ledger reducer self-circle narrowing coupled with D1's cap logic
   (`derive-trust-events.ts:165` `deriveWorstJusticeOutcome`); build + battery dark; the walk is R4.
2. **AE-3** (the third agent extension, on the seam AE-1 pre-built).
3. **The L4 audit header amendment** — exact pending text preserved in
   `D-FIVE-PRINCIPLES-AND-GUIDE-FUNCTION-RULINGS-EXECUTED-2026-08-12`
   (`l4-passion-audit.ts` header).
4. **Corpus citation fixes** — `stoic-brain/stoic-brain.json:151` (Meditations 4.26 → 7.9,
   load-bearing by ruling) + the DL 7.38 cite, recompiled via `scripts/compile-stoic-brain.ts`
   into `website/src/lib/stoic-brain.ts`, with the boundary test's §C2 SHA freeze updated per the
   M1 ruling's mechanism.
5. **The reflect-path `loop_id` metering fix** (close-hook under `harness/gate1` → the
   loop-billing UUID contract; fails soft today).
6. **The trust-record payload total-unknown composition note** — **M6 wording ruled 2026-08-15,
   verbatim in hand** (the verbatim record carries it): *"The trust record for this agent is
   incomplete. The total number of interactions cannot be confirmed. Curation effects — where
   high-volume interaction patterns may suppress individual signal visibility — cannot be assessed
   at this time. This record should be read with that limitation in mind."*
7. **PR24 retention parity, both named gaps** — `agent_hold_observations` (false-hold paths,
   guard-gated) + `stoa_entries` sweep coverage; built dark behind their flag.
8. **P8a guard-path capture** (feeds the new false-hold window; window start is R4's last step).

One consolidated PR19 adversarial review across the batch — **PAUSE before launch / PAUSE after**.
If context runs hot, split at the review boundary into R2a (items 1–4) and R2b (items 5–8), one
review each.

### ☐ R3 — Agent build batch 2: /api/reason route work (dark)
*Tier: `code-critical` class builds, dark/flag-gated. Founder presence: none (activations R4).*

1. **The status-masking fix** — 429/503 API-key failures no longer collapse to a misleading 401
   (`code-elevated`, AC7).
2. **Input-cap Steps 2/3** (elected) — raise the `/api/reason` `input` cap to `TEXT_LIMITS.long`
   paired with the Layer-1 `max_tokens` defence (Step 2), and the chunked path (Step 3) if its
   scope survives session-open review; flag-gated dark.
3. **projectContext removal** (elected — this plan's election is the explicit founder ask the
   records required): remove `projectContext` injection from API-key-authenticated `/api/reason`
   calls per the mentor's ruling, and fix `practitionerContext`'s identical unlabelled defect in
   the same change.

One consolidated PR19 review — **PAUSE before / PAUSE after**.

### ☐ R4 — Founder-walked activation batch (one sitting)
*Tier: `code-critical` (AC7, PR6, PR17). Founder presence: full walk, each item an atomic 0c-ii
micro-step with its own live smoke and stated rollback.*

1. Commit + push all R2/R3 builds FIRST; Vercel green (standing lesson: push before any flip).
2. The **D4+D1 walk** (per its build's verification block).
3. **PR24 retention activation** (flag/cron for the `agent_hold_observations` + `stoa_entries`
   sweeps).
4. **Input-cap flag(s)** + live smokes.
5. **projectContext-removal + status-masking deploy smokes** (code-only changes — the push is the
   activation; verify live behaviour both).
6. **`SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED=true`** — pre-check `gate1.log`'s current 401
   profile first (quiet at planning time; this is resilience, not firefighting).
7. **START the new false-hold observation window LAST** — after every measured-file edit is live:
   `GATE1_FALSE_HOLD_CAPTURE=true` + durable `GATE1_STATE_DIR`. The window opens on the new
   instrument state; if M1 ruled the guard window-conditional, the guard re-arms here by design.
8. **Tail:** the journal build, if it didn't fit C4.

### ☐ R5 — ATRF scoping session + post-report items
*Tier: `governance`. Founder presence: none. Prerequisite: the mentor has the §6 report and has
returned rulings (this is the "do not open early" session, now legitimately open).*

The ATRF scoping session, inheriting everything routed to it: the justice carry-forward
(`gs-atrf-corrections.md` §(d)), the GS-ATRF-1 basis-lessness gap (§(c-bis)), the §2.13
null-cycle question's outcome, the boulesis/sufficiency ruling (M5), the sufficiency-examination
trigger content, and the six Stoic items. Plus: execute the S6 reordering decision as ruled, and
scope R6's two migrations.

### ☐ R6 — Founder-walked migration batch 2
*Tier: `code-critical`. Founder presence: full walk.*

The **S4 watching-table extension** migration + the **GS-ATRF-2 three-column watching-row
migration** — both founder-walked with full `§PRE`/`§APPLY`/`§VERIFY`/`§INVERSE`, both explicitly
gated behind the §6 report (priority-index rule), which R1 discharged.

### ☐ R7 — Permission-scrutiny build arc (items 14–17; elected) — est. 2 sessions
*Tier: `code-critical`, PR19 each. Founder presence: activations walked (may ride R7 closes).*

- **R7a:** item 14 — the **loop-level blast-radius proxy** (settled name, never shortened) — plus
  the `target_circle`/blast-radius persistence migration (queue 7; founder-walked; touches
  `idea_loop_*`, which is why this is post-run only), and item 15 — the **permission-layer
  blast-radius enrichment** (settled name).
- **R7b:** item 16 (governance permission field extension) + item 17 (the intent-vs-assessed-
  quality trust event — trust-core emission path, PR19).

Builds follow the existing scoped-and-mentor-approved documents. The Q1 hard constraint is
restated at each session open: the loop proposes; it never executes.

### ☐ R8 — Standing-runner design
*Tier: set at open. Prerequisite SATISFIED 2026-08-16: R1 is ruled AND the O-C scoping session's
own Gate 2 (its scope document being produced) is done
(`D-CONCURRENT-ARC-OC-SCOPING-SESSION-GATE2-2026-08-16`,
`2026-08-16-SCOPE-DOCUMENT-oc-per-consumer-rendering-design-FOR-RULING.md`) — the ruling's exact
wording gates R8 on the document being **produced**, not on its own ruling clearing. R8 is
therefore licensed to open. Not pre-scoped — deliberately. **One named input, gating this
session's CLOSE, not its open:** read the nine guardrail-rejected candidates from the bounded
validation run, classify each remediation-shaped or not, report the distribution — before this
session closes.*

---

## Parked (not in this arc; carried named, no session allocated)

- The **website hardening bundle** (ARC2 page-class smoke, `/community` CSP gap,
  `stoa-draft-reflect.ts` boundary findings, expired-reset-link UX fix, `/api/score-conversation`
  format-length validation, lint debt) — not elected.
- **Resend provisioning + ST7 Stoa subscriptions** — not elected; both stay blocked on the
  founder performing Resend.
- **The 0h call**; the **S11 flip** (readiness-gated); **Layer 3 activation** (not licensed);
  **weights** (BLOCKED) — standing, unchanged.
- **Housekeeping** commits/disposals of the untracked working-tree files — only as tasks require.
- The **Prudence Group discussion** — founder-convened; agenda annex in the mentor-questions doc.

## Conditionals summary

| Condition | Resolves | Effect |
|---|---|---|
| ~~M1 (guard ruling)~~ | **RESOLVED 2026-08-15** | Window-conditional (binds iff `GATE1_FALSE_HOLD_CAPTURE` set) — implemented + four-state verified; §C2 SHA freeze unconditional; R2 items land post-run under the window logic, no per-item exemptions |
| ~~M2 (who runs scoping)~~ | **RESOLVED 2026-08-15** | AI runs all three sessions → scope documents → mentor rules on the documents; C2/C3 are GO |
| ~~Mentor rules on the C2 scope documents~~ | **RESOLVED 2026-08-15** (same day) | Ruling Sets A + B (verbatim: `operations/agent-circles-2026-08/2026-08-15-mentor-rulings-C2-scope-documents-verbatim.md`); kathêkon session CLOSED, hegemonikon open only for the uniformity family; five execution items land post-run — see the ruled-additions block under C2 |
| ~~Mentor rules on the C3 scope document (Ruling Set C's awaited consultation)~~ | **RESOLVED 2026-08-15** (same day) | Ruling Set D (verbatim: `operations/agent-circles-2026-08/2026-08-15-mentor-ruling-set-d-layer3-scope-document-verbatim.md`); the Layer 3 scoping session CLOSED; S7 stands for the route/flag; O-B + the O-A disclosure adopted; O-C opened as an unlicensed design question; execution items post-run — see the ruled-additions block under C3. The L-5 candidate wording awaits mentor vetting (its own conditional below) |
| ~~Mentor vets the L-5 candidate Q1–Q6 wording~~ | **RESOLVED 2026-08-15** (same day) | Vetted verbatim in hand (`operations/agent-circles-2026-08/2026-08-15-mentor-review-reflect-q1-q6-vetted-verbatim.md` — the canonical strings; Q1 + Q3 amended, Q4 byte-identical with the alternative deferred pending G4 review). D/L-5 is now fully executable at its natural home (R2 or its own post-run step) under the mentor's execution-record requirements; until that post-run edit, `question-bank.ts` stays untouched |
| ~~Run reaches ≥20 + runner hand-back~~ | **RESOLVED 2026-08-16** | Mentor-ruled: **stop at 20** rather than continue to 40 (verbatim: `idea-loop-validation-run/MENTOR-RULING-cycle-20-stop-verbatim.md`; recorded `D-MENTOR-RULING-IDEA-LOOP-STOP-AT-20-RECORDED-2026-08-16`). The literal Part F hand-back was licensed to be replaced by a post-hoc compilation from the run log — done, see below |
| ~~Mentor rules on §6 report~~ | **RESOLVED 2026-08-16** | R1 compiled (`D-IDEA-LOOP-R1-S6-REPORT-COMPILED-2026-08-16`, incl. the h7 win-record correction folded per `D-MENTOR-RULING-H7-WIN-RECORD-THREE-WAY-SPLIT-2026-08-16`) and accepted in full by the mentor same day (`D-MENTOR-RULING-R1-S6-REPORT-ACCEPTED-2026-08-16`). **R5 unblocked** (M5's 2026-08-15 doctrinal-blocker release + this ruling clear R5 fully). **The O-C scoping session is now OPEN** (its Gate 1 discharged by this same ruling). **R8 is NOT yet open** — the same ruling introduced a new cross-gate: R8 now waits on the O-C scoping session's own Gate 2 (its scope document produced), not on this alone — see R8's own corrected prerequisite. One named task gates R8's close, not its open: classify the nine guardrail-rejected candidates as remediation-shaped or not |
| ~~Mentor rules on the O-C scoping-session licence (the C3b-drafted question)~~ | **RESOLVED 2026-08-16** | Option (ii): the O-C scoping session is LICENSED, gated behind the §6-report consultation — opens only after R1's report is compiled AND ruled on; three-gate chain confirmed (report-ruling → scope ruled → design ruled), route activation licensed at none; verbatim: `operations/agent-circles-2026-08/2026-08-16-mentor-ruling-oc-scoping-license-verbatim.md` |
| A `*-CHANGE-SPEC.md`/`*-BLOCKED.md` appears | runner | Mode 1 preempts everything |

*End of plan. Tick session checkboxes at each close; supersede this file by name if the founder
re-sequences.*
