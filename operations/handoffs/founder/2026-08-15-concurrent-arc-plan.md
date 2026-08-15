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
- **D/L-5 — the reflect Q1–Q6 agent recalibration.** Concept ruled YES; **candidate wording
  produced 2026-08-15 FOR MENTOR REVIEW**
  (`operations/agent-circles-2026-08/2026-08-15-CANDIDATE-WORDING-reflect-q1-q6-agent-recalibration-FOR-MENTOR-REVIEW.md`)
  — the founder takes it to the mentor; **mentor-vetted verbatim required before any edit to
  `question-bank.ts`**; the edit lands post-run at a clean boundary, recorded so before/after
  reads of reflect-derived event rates are segmentable. Untouchables bind: the
  never-abbreviated sequence, FD-R3/FD-R4/C2e mandatory sub-questions, the G4 mechanism + its
  3-part standard, the `SUB_SPECIES` vocabulary; the Q4 passion-naming shift risk is a named
  constraint. Natural home: **R2** (with the vetted wording in hand) or its own small
  post-run step.
- **D/F-b — the four relational-context fields as additive-optional request fields** on
  `/api/reason`'s request shape and the reflect open (absent ⇒ byte-identical). Post-run **by
  fence** independently of M2. **R17 co-requisite:** any persisting form engages encryption-
  where-intimate + data-rights wiring (access/export/delete), and the R17 obligation must be
  **stated in the implementation record BEFORE the edit** (the B/M-B flag-discipline
  pattern). The `relationship_type` distinctness constraint is binding (it must never be read
  as a practitioner-type signal — the discriminator-reuse constraint would be violated).
  Natural home: **R3** (the `/api/reason` route batch).
- **D/O-C — the per-consumer rendering DESIGN question: opened, NOT licensed.** The path is
  ruled: a separate scoping session (itself requiring a ruling before execution) → a design
  document for its own ruling → only then any build → activation of the dormant route remains
  a separately-walked founder step regardless. Design constraints already ruled for it: all
  five distinction dimensions in scope; dimension (c) — honesty — load-bearing and FIRST; the
  crisis precedent's relay pattern is "the precedent to follow, not to replace"; F-d (fields
  as design target) is the correct state until this design session rules. **No session in
  this plan is allocated to it; do not self-start.**
- **Not adopted / out of reach, recorded so no session self-starts them:** F-c (human mentor
  tools — out of this arc's agent-first ordering, not ruled); `SUBSTRATE_LAYER3_ENABLED`
  activation (not licensed by Ruling Set D or any session executing it).

**Layer 3 per-consumer rendering** scoping with the WIDENED Stage 2 relational-context scope
(2026-08-14 amendment: relational context; role-not-relationship-type; examined-vs-assumed; the
R20d self-side boundary; the four Stage 2 placeholder fields as design target). Inherits the
`r20a-audience-renderer.ts:45` auth-signal discriminator as must-reuse precedent.
**`SUBSTRATE_LAYER3_ENABLED` activation is NOT licensed by this session.**

### ☐ C4 — Human-side: the RLS-vs-route-enforcement gap (+ journal)
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

### ☐ R1 — Mode 3: the §6 report (the gate for everything after it)
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

### ☐ R2 — Agent build batch 1: trust-core + harness (dark; the guard bundle)
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
*Tier: set at open. Prerequisite: the mentor has ruled on the §6 report (Q10/Q11's gate). Not
pre-scoped — deliberately.*

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
| Mentor vets the L-5 candidate Q1–Q6 wording | mentor (founder relays the candidate document) | The vetted verbatim becomes executable at D/L-5's natural home (R2 or its own post-run step); until then no edit to `question-bank.ts` |
| Run reaches ≥20 + runner hand-back | live query + founder | Phase 2 opens (R1 first, always) |
| Mentor rules on §6 report | mentor | R5/R6/R8 open. **M5 (2026-08-15) already released the ATRF session's doctrinal blocker** (S3 §5-Q3-e — sufficiency = epistemic threshold, boulesis = motivational state, separate fields); the report gate is the only remaining gate on R5 |
| A `*-CHANGE-SPEC.md`/`*-BLOCKED.md` appears | runner | Mode 1 preempts everything |

*End of plan. Tick session checkboxes at each close; supersede this file by name if the founder
re-sequences.*
