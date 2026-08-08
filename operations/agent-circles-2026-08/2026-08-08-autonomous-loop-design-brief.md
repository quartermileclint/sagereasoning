# Autonomous-loop (IDEA loop) design brief — RULED

**Status: RULED by the mentor, 2026-08-09 — every section confirmed, all eleven open questions ruled** (verbatim record, which wins over every annotation below: `2026-08-09-mentor-consultation-autonomous-loop-design-brief-rulings-verbatim.md`; decision-log `D-AUTONOMOUS-LOOP-DESIGN-BRIEF-RULED-2026-08-09`). The rulings are folded in as inline **RULED** annotations at Phase 4, §3 item 1, and each §8 question; the proposal prose is left in place, marked ruled rather than deleted, so the reasoning stays legible alongside each ruling (the config-scope precedent). **The binding post-brief sequence (Q11):** brief ruled → novelty-check endpoint scoped (own small item) → per-cycle record table scoped (own small item) → generation-step scope document → first build gate → bounded validation run (mentor-reviewed) → only then any standing-runner design. **The Q1 hard constraint — the loop proposes, never executes — is binding and carried into every subsequent document.** Nothing below licenses a build; every downstream item keeps its own gates.

**Session:** 2026-08-08. Tier: `governance` / design (explore-scope). **This is a scope document, not a build.** No code, schema, flag, credential, or public-surface change accompanies it. Per the mentor's carried boundary (condition-(b) closing ruling, 2026-08-08, verbatim): *"closing condition (b) opens the path to scoping the design brief. It does not open the path to building it. The design brief is its own session, with its own gates."* Nothing in this brief is pre-approved by its own existence; every proposal below is a proposal until the mentor rules.

**What this brief is:** the consolidation the binding sequence's step twelve requires — the settled pre-brief corpus (five scope/ruling documents, 2026-08-05/06, all mentor-approved) turned into one coherent, reviewable design scope, with every genuinely open question named as a question rather than resolved by default. Per PR15, settled material is cited and carried, not re-derived. Per PR20, every place an existing mechanism is load-bearing, the mechanism-level fact about its current behaviour is stated in one sentence.

**Method note on §1:** every "settled" claim cites its ruling. Where this brief noticed a fact the corpus had not yet confronted (there are three — §8 Q4, Q8, Q9), it is raised as an open question, never silently resolved.

**Adversarial-review record (PR19, run before relay):** a three-dimension independent review (completeness against the corpus; boundary compliance; PR20 mechanism-fact verification against the actual code) with per-finding adversarial verification ran on this brief — 10 agents, 0 errors; 7 findings raised, **2 confirmed, 5 refuted on independent re-read**. Both confirmed findings are folded in and disclosed rather than silently repaired: **(1, the substantive one)** the draft claimed the approved `OikeiosisGap`/`GeneratedCandidate` TypeScript module was "still-unstarted" — false; it is committed at HEAD, dark and unconsumed, including a first-cut novelty check (see §1.2's correction, §3 item 6, §5, §8 Q2); **(2, drafting precision)** an inconsistent dependency-graph item range for the permission-layer connection (§4 vs §7), now reconciled with the connection stated at its ruled precision.

---

## 1. Settled ground — decided, cited, not re-opened here

> **RULED 2026-08-09 — all eight items confirmed as stated, no re-opening.** Three carry-forward notes stand with the confirmation: **(i)** the null-cycle rule must be **architecturally enforced**, not merely stated as policy; **(ii)** the `dependency_unavailable` / null-cycle distinction for the fallback counter is addressed in Q6's territory; **(iii)** non-winning candidates' guardrail results are written to the cycle record (ruled at Q7).

### 1.1 The architecture: externally-driven, ruled 2026-08-05

The loop lives **outside SageReasoning's servers**. A calling process — the founder's Claude Code session, a dedicated harness, or a future purpose-built runner — holds the cycle state and the continue/stop decision between calls; SageReasoning stays stateless and request-scoped on every call, providing only **the examination, the novelty check, and the trust-event write** per cycle. The mentor's stated reasoning: a cron-tick model can only approximate continuity by flattening the developing context into a database row between steps, destroying exactly what makes generation different from scheduled processing — the ability to hold a developing line of reasoning across cycles. (`06-PLAIN-TEXT-MIRROR.md` §Sixth element, the 2026-08-05 ruling; `D-IDEA-LOOP-PREBRIEF-RULINGS-C2-WIDENED-2026-08-05`.)

A direct consequence, settled with it: **the generation step runs in the runner**, not on SageReasoning. SageReasoning's per-cycle contract is examination-side only.

### 1.2 The type shapes: `OikeiosisGap` and `GeneratedCandidate`, approved 2026-08-06

(`2026-08-06-oikeiosis-gap-generated-candidate-type-scope.md`; `D-OIKEIOSIS-GAP-GENERATED-CANDIDATE-TYPES-APPROVED-2026-08-06`.)

- **`OikeiosisGap`** — the loop's direction input: `currentCircle`/`targetCircle` on a local `OikeiosisCircleRank` (1–5) ordinal, **always current + 1, never a jump** (a construction-time invariant on the gap, deliberately not re-derived per candidate), plus `targetCircleMeaning` — free text, **human- or mentor-authored framing**, never computed by the type.
- **`GeneratedCandidate`** — a not-yet-taken action, distinct from `CandidateProfile`: `gapRef` in the settled `{sessionId}:{cycleNumber}:{currentCircle}->{targetCircle}` format; the seven-value `heuristic` enum; `initialClassification` as a discriminated union (virtue-domain for six heuristics, preferred-indifferent for friction detection — a friction candidate structurally cannot be forced into the virtue-domain shape); `generationConfidence` 0.00–1.00, **orthogonal to** the examination result; `guardrailResult` (proximity + virtue domains, populated for all candidates at filtering); `fullExaminationProse` (winner only, later stage); `passedNoveltyCheck`; `cycleOutcome` in six values `pending | rejected_by_guardrail | rejected_by_novelty | winner | null_cycle | dependency_unavailable`, with `unavailableDependency` naming the unreachable dependency.
- The approval covers the type shape. **Correction (found during this brief's own review, not previously disclosed here): the TypeScript module is already committed** — `website/src/lib/substrate/idea-loop-types.ts` (commit `f3eabc7`, landed alongside the C2/C1c orientation-reading build, 2026-08-08), self-described in its own header as "DARK / UNCONSUMED: no route, engine, or harness path imports this module." It transcribes `OikeiosisGap`/`createOikeiosisGap`/`GeneratedCandidate` from the approved scope and additionally implements `assessStructuralNovelty` (§1.6's approved novelty check) reusing `trajectory-delta.ts`'s exact `EVIDENCE_FLOOR`. Nothing consumes it — no route, no wiring, no flag references it — so it changes no live behaviour and this brief did not touch it. But it is not "still-unstarted," and this brief's earlier draft said otherwise in three places; corrected throughout (see §3 item 6, §5 item 2 and its closing note, and §8 Q2, whose premise this fact directly changes; Q5's premise — the per-cycle table — is untouched, the module contains no table shape).

### 1.3 The generation step's fixed design (queued for its own scope document; not opened here)

(`2026-08-05-idea-loop-generation-heuristics.md`; `D-IDEA-LOOP-GENERATION-HEURISTICS-CAPTURED-2026-08-05`; `D-IDEA-LOOP-EXAMINATION-COST-RULED-NULL-CYCLE-2026-08-05`; `D-IDEA-LOOP-FRICTION-DETECTION-SHARED-STATE-2026-08-05`; `D-IDEA-LOOP-NEUROSCIENCE-ADDITIONS-RECORDED-2026-08-06`.)

- **Seven heuristics**, one candidate each per cycle: analogous transfer, combinatorial generation, synthesis over novelty, context transfer, fifth-circle weighting, anomaly detection, friction detection. The six core heuristics all run each cycle (a richer pool, not one-per-cycle selection).
- **Friction detection is structurally different**: preferred-indifferent tag at generation time, not a virtue-domain tag; a candidate that never engages a virtue domain remains valid (kathekon vs. katorthoma, applied to generation).
- **Examination cost, ruled:** all candidates pass **the guardrail shape only** (proximity + virtue-domain assessment, no Layer-3 prose — the same 2026-06-19 reasoning that the safety gate skips Layer 3); novelty detection runs on all guardrail-shaped results; **the highest-proximity candidate that also passes the novelty threshold** receives the one full examination (Layer 3 prose included), and that prose is the cycle's human-legible dashboard result.
- **The null-cycle rule, ruled:** if no candidate passes the novelty threshold, the cycle records a **null cycle** — a named, honest outcome — and never falls back to presenting the best non-novel candidate as a result. The loop does not manufacture novelty by lowering the threshold.
- **The fallback rule:** three consecutive null cycles from heuristics 1–6 → friction-detection-only mode, until a non-null cycle returns from an active mechanism.
- **Two design-rationale mappings** (documentation, not technical requirements): the three-network pipeline correspondence (generation ↔ DMN, guardrail examination ↔ ECN, novelty ↔ salience) and the four-stage creativity model (preparation ↔ between-session knowledge accumulation; incubation ↔ `minimumIncubationInterval`; illumination ↔ a candidate passing both filters; verification ↔ the winner's full examination).

### 1.4 Configuration and coordination state: external, consistently — ruled 2026-08-06

(`2026-08-06-idea-loop-configuration-and-shared-task-list-scope.md`; `D-IDEA-LOOP-CONFIG-AND-SHARED-TASKLIST-RULED-2026-08-06`.)

- **`IdeaLoopConfiguration`** (five fields: `loopId`, `minimumInterval`, `maximumDuration`, `randomOffsetPercent`, `minimumIncubationInterval`) is a **documented external-configuration contract** — the runner owns and enforces it entirely; SageReasoning never sees these values (option 1, ruled). Defaults are TBD at generation-step scoping — no default is settled anywhere yet.
- **The shared task list** (`SharedTask`) lives **outside SageReasoning's database** (option 2, ruled): SageReasoning's role in friction detection is as a consumer — the runner hands the task list to the generation step. A mentor follow-on note holds that `SharedTask` is a **contract specification, not a mandate for bespoke storage** — an existing PM tool satisfying all required properties would make it a thin mapping spec (with `frictionAssessment` the one field with no native PM-tool analogue).
- **`loopId` and `sessionId` are deliberately independent identifiers at different layers** (mentor note, 2026-08-06): `sessionId` names one SageReasoning examination session per consult; `loopId` names one runner instance persisting across many consults. They must not be conflated, and the generation-step scope document must name how they compose in a trust-event write.
- A friction-detection attempt that finds the task list unreachable records `cycleOutcome: 'dependency_unavailable'` — honestly distinct from a null cycle.

### 1.5 The generative-prompt seed: settled format, now live code

(`D-IDEA-LOOP-PREBRIEF-RULINGS-C2-WIDENED-2026-08-05` ruling 5; the approved C2 scope §2; implemented in `website/src/lib/translation-sandwich/orientation-reading.ts` `composeGenerativePrompt`, LIVE with C2 since 2026-08-08.)

- One sentence, maximum, of the settled form: *"this action engaged circle N (…) but left room to extend toward circle N+1 (…) by [gap description]."* **Never a prescribed action** — the constraint is code, not aspiration.
- **Population conditions (code):** only on `away`/`indeterminate` readings on an examination that engaged ≥1 identified circle; never on `toward` (nothing to seed — the null-cycle honesty rule applied one layer upstream); never on a circle-less examination.
- **Consumption, mentor-resolved:** the seed is per-examination **raw material** an external runner (or human/mentor) synthesises into a later `OikeiosisGap.targetCircleMeaning`. It is not itself an `OikeiosisGap` and never substitutes for the human/mentor authorship the approved type documents. It rides the orientation trust event's payload (server-side, owner-exportable, retention-swept), is never served on S10, and never rides the consult response. Feeding a later cycle's generation is downstream consumption of a completed result, not feedback into the examination's own verdict.

### 1.6 The novelty-detection specification, approved with the C2 scope

(`06-PLAIN-TEXT-MIRROR.md` item 2b(iii); `D-C2-C1C-ORIENTATION-READING-SCOPED-2026-08-06` + same-day rulings.)

Structural novelty over the extraction's own fields, reusing `trajectory-delta.ts`'s exact `EVIDENCE_FLOOR = 3` constant and window; a `noveltyConfidence` field distinct from `generationConfidence`; the **structural-novelty-only limitation** (two structurally identical but substantively different actions are indistinguishable) is a confirmed, required PR19 review dimension; content novelty is a named future upgrade, not required now.

### 1.7 What condition (b) established — and its honest limits

(`2026-08-08-mentor-consultation-condition-b-satisfied-verbatim.md`; the two-part condition at `06-PLAIN-TEXT-MIRROR.md` item 9.)

The orientation-reading mechanism is **validated as an instrument** on genuine post-fix production traffic: 5/5 agreement between ledgered class and lived experience, both delivery classes observed, wording byte-exact, the distribution tracking the actual character of the work ("the signal the autonomous-loop condition was designed to require"). Its honest limits stand undiminished: the examined/observed delivery class is an **elapsed-time proxy** (28000ms, tracking the harness's own documented client timeout — never a confirmed-delivery signal); the whole surface is **MEASURE-only** (binds nothing; ENFORCE is S11); **weights-tier use is blocked**; the extraction-trust ceiling (reasoning narrated as examination reads as examination) is disclosed, not solved. **Nothing about the loop itself is pre-approved by the condition closing.**

### 1.8 The validation-runner / standing-runner distinction, ruled 2026-08-06

(`06-PLAIN-TEXT-MIRROR.md` item 9 note; `2026-08-06-idea-loop-runner-automation-capabilities-memo.md`.)

Claude Code's `/schedule` (session-only, 7-day auto-expiry) and `/loop` (requires an attended live session) are appropriate for **bounded validation runs**, not standing operational infrastructure. *"A future purpose-built runner" refers to the standing operational case — a separate design question, and must not be pre-answered by whatever tooling happens to be available during validation.* This brief honours that: §3 proposes phases and gates; it does not choose the standing runner.

---

## 2. Proposed loop shape — one cycle's phases and gates (PROPOSAL)

Everything in this section and below is offered for the mentor's ruling, not decided. The phases compose only already-ruled pieces; the *gates between them* are this brief's proposal.

**Phase 0 — Direction (human/mentor in the loop).** An `OikeiosisGap` exists, its `targetCircleMeaning` human- or mentor-authored (per the approved type — the loop never authors its own direction). Generative-prompt seeds from prior examinations are raw material for this authorship, never a substitute (§1.5). *Gate G0: no gap → no cycle. The loop idles rather than inventing direction.*

**Phase 1 — Generation (runner-side, autonomous).** The runner applies all active heuristics against the gap (and, for heuristic 7, the handed-in task list), producing one `GeneratedCandidate` per heuristic with `generationConfidence` and `initialClassification` set, `cycleOutcome: 'pending'`. *Gate G1: `maximumDuration` is already running; a cycle exceeding it terminates with an honest timeout outcome (§8 Q6). A task list unreachable at a friction attempt → `dependency_unavailable`, recorded, cycle continues on the other heuristics.*

**Phase 2 — Guardrail-shaped filtering (SageReasoning-side).** Each candidate's `proposedAction` goes through the guardrail shape — proximity + virtue-domain assessment, no Layer-3 prose — populating `guardrailResult`. *Gate G2: a candidate the gate would refuse (`proceed:false`) is `rejected_by_guardrail` — it never reaches novelty or the dashboard as a live proposal (it may still appear in the cycle record as a rejected candidate; §8 Q7).*

**Phase 3 — Novelty check (SageReasoning-side).** The approved structural-novelty specification (§1.6) runs on all surviving guardrail-shaped results, setting `passedNoveltyCheck` and `noveltyConfidence`. *Gate G3: no candidate passes → **null cycle**, recorded honestly, loop proceeds to incubation. Three consecutive null cycles → friction-detection-only mode (§1.3).*

**Phase 4 — Winner's full examination (SageReasoning-side).** The highest-proximity candidate that passed novelty receives the one full examination (Layer 1→2→3); its Layer-3 prose is the cycle's human-legible result; `cycleOutcome: 'winner'`. *Gate G4: the full examination is still an examination — a winner whose full examination surfaces something the guardrail shape missed is recorded as what the examination found, not massaged into a success.* **RULED 2026-08-09 — approved WITH AMENDMENT: G4 is a HARD CONSTRAINT, not a design principle.** The mentor's words: *"The full examination is not a confirmation step for the guardrail's verdict. It is an independent examination. If the full examination produces a result that contradicts or complicates the guardrail-shaped filtering, that result stands. The cycle record carries what the examination found."*

**Phase 5 — Records (SageReasoning-side).** The per-cycle record row is written (the dashboard table — still unscoped, §8 Q5); the trust-event write carries `loopId`; orientation readings and seeds accrue as ordinary consequences of the consults themselves (no new write path).

**Phase 6 — Disposition (human in the loop).** The winner is a **proposal surfaced for human election — the loop proposes; it does not execute** (proposed as a design principle, §8 Q1 asks the mentor to confirm and state its strength). Friction-detection winners populate the shared task list as candidate tasks. *Gate G6: the three stop conditions from the pre-brief corpus — a human decision recorded, a resource limit hit, a safety gate fired — are checked; any of them stops the loop rather than the next cycle starting.*

**Phase 7 — Incubation (runner-side).** `minimumIncubationInterval` (plus jitter) before the next generation step. The runner computes its own cadence from its own configuration and the timestamps of its own prior writes — no server read needed (per the option-1 ruling).

---

## 3. Where each existing mechanism plugs in (PR20 — mechanism-level facts)

One sentence of current, verified behaviour per mechanism, so the mentor rules with the downstream consequences visible:

1. **`/api/guardrail`** — live, serves the signed deterministic sandwich (one Sonnet Layer-1 extraction → pure deterministic Layer-2 → Ed25519 signature → rank-arithmetic verdict, no Layer-3 prose) and writes one `loop_billing_events` row + `X-Loop-*` cost headers per call (CI-10); `GeneratedCandidate.guardrailResult`'s shape (`proximity` + `virtueDomainsEngaged`) already mirrors this endpoint's response fields by design. **Fact to weigh:** the gate fails closed (500) on a billing-write failure — a cycle's filtering pass inherits that failure mode times six. **RULED 2026-08-09 — a named requirement for the generation-step scope document:** it *"must name how the runner handles a filtering pass where one or more guardrail calls fail closed — whether the affected candidate is treated as rejected_by_guardrail, dependency_unavailable, or something else. Do not leave this implicit."*
2. **`/api/reason`** — live, the full Layer 1→2→3 sandwich; a credential-bearing consult writes one `agent_assessment_history` trajectory row, accrues orientation readings/trust events flag-on, and supports `assessment_first` deferral (prose async); the winner's `fullExaminationProse` comes from here.
3. **The orientation reading + generative-prompt seed** (`orientation-reading.ts`) — live (MEASURE); readings derive only from server-side extractions (a caller-supplied `layer1_schema` can never mint one), are never on the consult response, and the seed rides the orientation trust event's payload — so the loop consumes seeds by reading **its own owner-exportable trust-event history**, not a consult echo.
4. **The C1c orientation trust events** — live; three `orientation-reading-*` event types, `'flag'`-effect (genuine no-op on trust state), `virtue_domain: NULL`, insert-only with `orient:` correlation-id dedup; `loopId` carried on trust-event writes is the ruled multi-loop disambiguator.
5. **The trust record (S10)** — live, public, unauthenticated; serves orientation entries capped at the 50 most recent with an honest total count and the not-attestable clause inline; a long-running loop's readings will accrue here under whatever credential/agent identity the runner presents (§8 Q3).
6. **The novelty specification's substrate** — live constants: `trajectory-delta.ts`'s `EVIDENCE_FLOOR = 3` and windowed read are what the approved spec reuses; **a first-cut pure implementation already exists** — `assessStructuralNovelty` in the committed-but-dark `idea-loop-types.ts` (§1.2's correction) — but it is unconsumed and has **no API home**: no route or seam calls it (§8 Q2 is about the seam, not about whether a pure function exists).
7. **The UPC credential system** — live; consult and guardrail traffic authenticate via UPC capabilities with per-credential daily/monthly limits; a cycle costs at minimum six guardrail calls + up to one full consult, so a runner credential's limits must be sized to `minimumInterval` (the founder's existing s9-loop quota incident — limits masking as 401s — is the known failure shape).
8. **The channel law + the Gate-1 harness guard** — standing; out-of-band enforcement (guard-deny on irreversible actions) survives a resistant agent, injected instructions-to-act do not; any runner realised as a Claude Code loop inherits the guard on its own tool use, and the loop's proposals reaching a human before execution (Phase 6) keeps the loop itself on the right side of that law.
9. **The per-cycle dashboard delivery pattern** — the repo's only live dashboard pattern is a GET route polled by the page (no push/websocket anywhere); the unscoped per-cycle table + GET route (§8 Q5) would follow it exactly.

---

## 4. What runs autonomously vs. who is in the loop (PROPOSAL)

| Actor | Owns |
|---|---|
| **Autonomous (runner + SageReasoning, per cycle)** | Generation; guardrail-shaped filtering; novelty check; winner's full examination; per-cycle record + trust-event writes; null-cycle/dependency-unavailable recording; cadence (throttle, jitter, incubation); the fallback-mode shift. |
| **The founder (human in the loop)** | Authoring/approving each `OikeiosisGap` (Phase 0); electing whether any winner is ever acted on (Phase 6); starting and stopping the loop; the runner's configuration and credential; all resource limits. |
| **The mentor** | This brief's gates; the generation-step scope document (already queued as its own mentor-reviewed item); review of validation-run results before any standing operation; any change to a ruled item. |

**The load-bearing line, proposed plainly: the loop generates and examines proposals; it never executes them.** Execution of any winning candidate is a separate human act, outside the loop, subject to whatever governance applies to that act on its own merits (including, prospectively, the permission scrutiny layer — dependency-graph items 14–16, with item 17 its companion trust-event class — where C2's orientation reading is already a ruled upstream input (one of three inputs to item 15's tier-C suggested-adjustment computation, `D-C2-PERMISSION-LAYER-CONNECTION-NAMED-2026-08-07`; able only to raise the suggested restriction, never lower it)). §8 Q1 puts this line to the mentor for explicit confirmation, because everything else in the safety posture rests on it.

---

## 5. Safety posture — inherited boundaries and new surface (PROPOSAL + facts)

**Inherited, unchanged by the loop:**
- **MEASURE-only** — orientation readings, trust events, and every examination output bind nothing; ENFORCE remains S11; nothing in the loop turns a reading into an enforcement signal.
- **Weights-tier use blocked** — loop outputs (readings, seeds, proximity scores) are not training signals; the standing gaming-robustness bar and its A2 structural residual stand.
- **The honest-claims discipline** — null cycles, `dependency_unavailable`, and timeout outcomes are named honest states, never massaged; the not-attestable clauses stand on every public entry.
- **The channel law** — the guard's out-of-band deny on irreversible actions binds any Claude-Code-shaped runner's own tool use.
- **The extraction-trust ceiling** — disclosed, inherited by every guardrail-shaped filtering call and every full examination the loop makes.
- **R20a** — untouched; the loop is an agent-facing surface outside the human-distress perimeter by the standing precedent (no new human free-text surface is created).

**New surface the loop would create (each its own later gated step, none built by this brief):**
1. The per-cycle record table + GET route + dashboard page (server-side; unscoped — §8 Q5).
2. The novelty check's **API home** (server-side; spec approved, and a first-cut pure `assessStructuralNovelty` already sits committed-but-dark in `idea-loop-types.ts` — §1.2's correction; the *seam* is what remains undecided — §8 Q2).
3. A runner credential (its capabilities, limits, and agent identity — §8 Q3).
4. The runner itself — validation-shape first (bounded, 7-day-class), standing shape deliberately later (§1.8).

(The earlier draft listed "the committed TypeScript module for the approved types" as a fifth still-unstarted surface — wrong; the module exists, dark and unconsumed, per §1.2's correction.)

**One risk named for the mentor rather than resolved:** the loop is a *volume* mechanism — many examinations per day under one identity. The S10 curation-via-volume residual (disclosed at C2's build: an agent — or here, a runner — could shape which 50 readings are visible by generating traffic) becomes structurally easier for a loop than for a hand-driven session. The honest total count and the capped-window disclosure already mitigate; whether the loop needs an additional bound (e.g., its readings distinguishable on S10, or a per-loop rate note) is Q3/Q9's territory.

---

## 6. Observables and review points (PROPOSAL)

- **Per cycle:** one record row (winner / null_cycle / dependency_unavailable / timeout), the winner's Layer-3 prose, per-candidate guardrail results with heuristic attribution, cost (the existing `X-Loop-*` metering), and elapsed time against `maximumDuration`.
- **Per validation run:** the bounded-run report — cycles run, outcome distribution, null-cycle rate, heuristic productivity (which heuristics' candidates ever win), cost per cycle, anomalies — brought to the mentor before any standing-runner design opens (mirroring the condition-(b) review's own shape: what was checked, what was found, what the distribution shows, whether anything anomalous appeared).
- **Standing (if ever reached):** the dashboard as the founder's ordinary window; the mentor's review cadence a question for the mentor (§8 Q10), not defaulted.

---

## 7. Non-goals — what this brief deliberately does not do

- Does not build, wire, or scaffold anything; no TypeScript, migration, flag, or credential accompanies it.
- Does not scope the generation step's own content (prompt structure, friction-detection threshold, the `randomOffsetPercent` phantasia-variation mechanism, heuristic implementation) — that is the already-queued generation-step scope document, downstream of this brief (§8 Q11 confirms the relationship).
- Does not choose the standing runner (§1.8's ruled boundary), the PM-tool-vs-bespoke task-list realisation (open per the mentor's own follow-on note), or any configuration default (TBD at generation-step scoping, as ruled).
- Does not touch C1c-original (the first-circle failure/demonstration events — separate, outstanding, not to be folded in), D4, the Stoa activation, logos-on W1–W3, the loop-fold/practice-suggestion B6 block, or the permission-layer items 14–17 (their connection is *named* in §4/§5; nothing is resolved for them here).
- Does not fix the two registered defects (the `/api/reason` status-masking branch; the reflect-metering UUID `loop_id`).
- Does not treat mentor silence as approval — the brief has no effect until ruled on.

---

## 8. Open questions for the mentor — ALL ELEVEN RULED 2026-08-09

Named as questions, not resolved by default. Q4, Q8, and Q9 are facts this consolidation surfaced that the corpus had not yet confronted; the rest are inherited open items gathered in one place. **Every question below now carries its ruling inline (verbatim record wins); the question prose is kept so the reasoning stays legible.**

- **Q1 — The proposes-never-executes line.** §4 proposes that the loop generates and examines but never executes a winning candidate; execution is a separate human act. Is this confirmed as a binding design principle for the loop (on the strength of, e.g., the C2 placement ruling's own reasoning), or a default the standing-runner design may later revisit under its own gates?
  **RULED: confirmed as a BINDING design principle — not revisitable by the standing-runner design.** *"The Stoic framework does not permit delegating praxis to a mechanism, because action from virtue requires the agent's own assent. A loop that could execute its own proposals would be substituting mechanical output for the founder's prohairesis... It is ruled out now."* The standing-runner design may revisit shape, cadence, credential, dashboard — never this line. **Carried as a named hard constraint in every subsequent document.**
- **Q2 — The novelty check's home.** The specification is approved (§1.6), and a first-cut pure implementation (`assessStructuralNovelty`, in the committed-but-dark `idea-loop-types.ts` — §1.2's correction) already exists, unconsumed. What has no ruling is the **API seam**: a new dedicated endpoint wrapping it; a flag-gated extension of the guardrail response; or a runner-side computation against exported history. The ruled per-cycle contract ("the examination, the novelty check, and the trust-event write") reads as server-side — is a new endpoint the intended shape? (The existing dark function does not pre-answer this; it can back any of the three.)
  **RULED: a new dedicated endpoint wrapping the committed-but-dark `assessStructuralNovelty` is the intended shape.** Runner-side computation is ruled out (it would move a server-side responsibility to the runner); a guardrail-response extension is possible but adds complexity to an already load-bearing endpoint. **Scoped as its own small item — a server-side seam question, not generation content — next in the Q11 sequence.**
- **Q3 — The runner's identity.** Does the loop run under its own dedicated credential and K1 agent identity (making its S10 record, trajectory, and billing separable from every other surface — and the curation-via-volume question inspectable), or under an existing identity? A dedicated identity is the natural reading of `loopId`'s purpose but has not been ruled.
  **RULED: a dedicated credential AND K1 agent identity** — architectural, not organisational: S10/trajectory/billing separability, and the curation-via-volume question inspectable per identity. The identity itself is the marker (this substantially answers Q9). **The credential + identity are scoped in the runner's own scoping session, not here.**
- **Q4 — The examined/observed proxy under a runner (new fact).** The delivery-class proxy classifies any consult whose server elapsed time exceeds 28000ms as `observed` — the constant deliberately tracks the *harness's* client timeout. An IDEA-loop runner is a different caller that may genuinely wait longer; its patient consults would still be ledgered `observed` ("the framing was not delivered within the agent's own consult window") even when the runner received and used the result. Options include: accept the conservative misclassification (disclosed), or revisit the ruled-disproportionate caller-declared-timeout channel for this caller class. Flagged because the mentor's ruling fixed the constant against the harness specifically, before a second caller class existed.
  **RULED: accept the conservative misclassification for now, disclosed.** The right sequence: scope the runner → determine its actual timeout behaviour → revisit the proxy constant only if the misclassification rate on runner traffic is material. The proxy architecture is not revisited before the runner's behaviour is known. **Named carry-forward: "revisit `ORIENTATION_DELIVERY_TIMEOUT_MS` when runner timeout behaviour is established."**
- **Q5 — The per-cycle record table.** Still unscoped (named in three corpus documents). Its scope must represent: winner, null cycle, `dependency_unavailable`, and a `maximumDuration` timeout termination (the config scope's named consequence). Does its scoping ride the generation-step scope document, or stand as its own small item?
  **RULED: its own small item** — a server-side schema/route question, not generation content; scoped after this brief and before the first build gate. **Required fields, fixed by the ruling:** the four outcomes (winner / null_cycle / dependency_unavailable / timeout), per-candidate guardrail results with heuristic attribution, cost, elapsed time against `maximumDuration`, `loopId` — plus rejected-candidate visibility per Q7.
- **Q6 — The timeout outcome's type home (small, inherited).** The timeout outcome is named for the *table*; `GeneratedCandidate.cycleOutcome` has no timeout value. Should a seventh value (e.g. `'terminated_by_timeout'`) be added to the approved type, or is the timeout purely a cycle-level (table-level) fact, with candidates left `'pending'`?
  **RULED: a seventh `cycleOutcome` value, `'terminated_by_timeout'`, at the candidate level** — alongside the cycle-level timeout record. *"Leaving them 'pending' indefinitely is a false impression the record would present."* Carried as a **dated amendment on the type-scope document** (applied 2026-08-09 — see that document §2); the committed-but-dark `idea-loop-types.ts` now lags the ruled shape by this one value, a named small code follow-up for the next code session that touches it (no code is edited under this brief's scoping boundary).
- **Q7 — Guardrail-refused candidates' visibility.** Are `rejected_by_guardrail` candidates part of the per-cycle record (full transparency about what generation produced), or suppressed (avoiding a public record of refused proposals)? The honest-claims default leans toward recording; the S10-adjacent visibility question makes it worth ruling rather than defaulting.
  **RULED: recorded — `rejected_by_guardrail` candidates are part of the per-cycle record, with heuristic attribution.** The per-cycle record is the founder's operational dashboard, not the public trust record; *"a founder who cannot see what the guardrail refused cannot evaluate whether the guardrail is calibrated correctly. Suppressing refused candidates would be a false impression presented to the loop's own operator."*
- **Q8 — Seed consumption across identities (new fact).** Generative-prompt seeds ride the orientation trust event's payload, owner-exportable. If the runner's identity (Q3) differs from the identity whose examinations produced the seeds (e.g. the founder's s9-loop), the runner cannot read those seeds under its own credential — seed flow crosses an ownership boundary. Is seed hand-off a founder act (export and hand to the runner, consistent with everything else external), or should the loop only consume seeds its own examinations produced?
  **RULED: seed hand-off is a founder act.** The runner reads seeds its own examinations produced, or seeds the founder explicitly exports and hands to it — the loop never crosses ownership boundaries to read another identity's seeds. Seed hand-off is part of the Phase-0 gap-authorship process; *"the generative-prompt seed is raw material for human synthesis, not an automated pipeline input. The ownership boundary is the right place to keep the human in the loop on direction."*
- **Q9 — Orientation-reading volume on S10 (new emphasis of a disclosed residual).** §5's volume note: does the loop's traffic need to be distinguishable on the public trust record (a per-entry marker, or the Q3 identity separation sufficing), given the capped-window curation residual?
  **RULED: Q3's identity separation is sufficient — no per-entry marker.** The dedicated identity is itself the marker; a reader assesses the loop's record by querying its own identity; the existing total-count and curation-via-volume disclosures apply to each identity's record independently.
- **Q10 — Review cadence.** For any standing operation (if ever reached): what cadence and form of mentor review does the loop's output require? Proposed floor: the bounded validation run's report shape (§6), repeated; not defaulted further.
  **RULED: the report shape is the floor, as proposed; the cadence itself is explicitly deferred** to the standing-operation proposal session (the mentor sets it there, against what the loop is actually producing). **Settled now: no standing operation begins without a mentor-reviewed validation run, and no change to the loop's configuration or scope proceeds without a mentor ruling.**
- **Q11 — The brief/generation-step relationship (sequencing confirmation).** This brief treats the generation-step scope document as its own downstream, mentor-gated session (per step thirteen's note that it "follows," carrying the heuristics + rulings). Confirm the intended order after this brief: brief ruled → generation-step scope → (with Q2/Q5 homes settled) any first build gate — with the bounded validation run's placement in that order the mentor's to fix.
  **RULED — the binding sequence, confirmed and extended:** this brief ruled → **novelty-check endpoint scoped** (own small item, per Q2) → **per-cycle record table scoped** (own small item, per Q5) → **generation-step scope document** → **first build gate** → **bounded validation run** (sits between the first build gate and any standing-runner design; **the mentor reviews the validation run before the standing-runner design opens**). Carried as the named sequence in the next session's opening prompt, per the ruling's own instruction.

---

## 9. What follows

**RULED 2026-08-09 (supersedes this section's original "awaiting response" text, kept below for the record):** the mentor has responded and ruled every section and question; the Q11 sequence in the status header governs what opens next — the **novelty-check endpoint scoping session** is the next item. Nothing in this document or its rulings licenses a build, a credential, a flag, or a schema; each downstream item keeps its own gates, and the first build gate sits after both small scoping items and the generation-step scope document.

*Original text (as offered):* This brief goes to the mentor via the founder. The session that produced it ends there — no downstream scheduling until the mentor responds. Whatever gates the mentor's response specifies govern; nothing in this document licenses a build, a credential, a flag, or a schema.

*End of brief. Authored 2026-08-08 under the scoping-only boundary carried verbatim from the condition-(b) closing ruling; RULED 2026-08-09 with every fold cited to the verbatim record.*
