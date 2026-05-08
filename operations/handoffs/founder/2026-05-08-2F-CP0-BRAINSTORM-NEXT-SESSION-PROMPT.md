# Next-Session Prompt — Sub-session 2F-CP0: Layer 3b Opus Contextualization Brainstorm Continuation

**Stream:** founder.
**Tier:** governance — **Standard** risk under 0d-ii. Brainstorm + scoping work; no production touch.
**Governing frame:** /adopted/standing-protocol-cache.md (operative reference).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-08-M1-CP6-close.md`.
**Predecessor decision-log entry:** `D-M1-CP6-CUTOVER-2026-05-08` (M1 arc complete; Layer 3 module Live; 2F architectural arc deferred per PR7 with intent + four clarifying questions + governance work + sequencing recommendation captured).
**Date of creation:** 2026-05-08 (session date TBD per founder election from `/operations/handoffs/founder/2026-05-08-NEXT-SESSION-PROMPT.md` open agenda Item A).
**Risk classification:** Standard under 0d-ii. Critical Change Protocol NOT engaged. Brainstorm session — no code, no governance documents adopted, no production change.

## Why this session matters

At M1-CP6 session-open (2026-05-08), the founder proposed an architectural alternative — labelled 2F — that addressed a concern the AI had raised about a predecessor proposal (2C). The 2F proposal is thoughtful: it preserves the bundled engine's input-specific responsiveness via a more capable LLM (Opus) layered on top of the deterministic sandwich Layer 2, while keeping Layer 2 stable and auditable. After working through implications, the founder accepted the AI's recommendation to defer 2F as a separate architectural arc rather than absorb it into the M1-CP6 cutover. The brainstorm reached a coherent direction but not a complete design — four clarifying questions remain open, governance reconciliations remain unaddressed, and the architectural arc's checkpoint structure is not yet drafted.

This session continues that brainstorm. The output is not an adopted design — that lands at 2F-CP1 (ADR drafting). The output of this session is: founder's answers to the four clarifying questions, any additional considerations surfaced through follow-up discussion, and a coherent design brief that 2F-CP1 can draft ADRs from.

## Pre-conditions

1. **M1 arc closure in place.** Cutover commit live; verifications passed; production stable. Confirm via the predecessor session close.
2. **Founder has had time to consider the four clarifying questions** captured in `D-M1-CP6-CUTOVER-2026-05-08` deferred-decision section. Pre-thinking is not mandatory — the questions can be worked through in this session — but the founder may want to bring some answers ready to accelerate the discussion.
3. **No urgent production issue is pending.** This is brainstorm work; if production needs intervention, defer 2F-CP0.
4. **Founder has decision authority on direction.** AI surfaces options + concerns; founder elects.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, status vocabulary, signals, risk classification).
2. `/operations/handoffs/founder/2026-05-08-M1-CP6-close.md` (~5 min — predecessor close; M1 arc closure; status changes).
3. `/operations/decision-log.md` `D-M1-CP6-CUTOVER-2026-05-08` deferred-decision section (~5 min — captures the 2F brainstorm summary, four clarifying questions, governance work, sequencing recommendation).
4. **This prompt's Part B in full** (~10 min — the substantive background of the 2F brainstorm; the load-bearing section for picking up where the discussion left off).
5. `/manifest.md` AC1 + R5 + R6c + AC8 (~5 min — the rules 2F engages and reconciles; load-bearing for the architectural decisions ahead).
6. `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` ADR-004 §1 + §2.1 + §6 + §10 (~5 min — for context on what the M1 arc shipped, since 2F builds on top).
7. `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` ADR-007 §3 + Amendment 4 (~5 min — for context on what the current Layer 3 produces, since 2F either augments or replaces it).

Confirm at open: tier (Standard); hold-point status (P0 0h active); model selection (cite cache row at item-time); status vocabulary; signals/risk class.

## Part B — The 2F brainstorm to date (full transcript-grounded summary)

This section captures the full 2F discussion from the M1-CP6 session (2026-05-08). It's intentionally detailed — a new session reading this prompt should be able to pick up the discussion exactly where it left off without needing to retrieve the original chat log.

### B.1 — The predecessor proposal (2C) and the input-specificity concern that prompted 2F's design

**Founder's initial 2C proposal at M1-CP6 session-open:**

The founder proposed an alternative to the parallel-run posture options the AI had originally surfaced (2.A retire parallel-run, 2.B continue full parallel-run). The 2C proposal: rename the bundled engine path to become the "LLM version used for testing or curiosity purposes only." Pre-generate, store in a database, a representative bundled prose output for each "possible sandwich Layer 2 endpoint" — by reverse-engineering inputs that drive each target Layer 2 assessment, capturing both the assessment and the bundled engine's response, and storing them keyed by assessment shape. After cutover, when sandwich produces a Layer 2 assessment, look up the matching pre-generated bundled prose and surface it (alongside or instead of sandwich Layer 3 prose). The founder framed this as preserving "the bundled version's unique things to offer" without doing live bundled calls.

The founder also asked: can AI generate the database without founder intervention? "I just hope you can generate these without needing my intervention. Is this possible?"

**AI's response — mechanically possible, conceptually flawed:**

Mechanically: yes, AI can write a generation script that enumerates synthetic input scenarios, runs Layer 1 + Layer 2 + bundled engine on each, captures both outputs, writes to Supabase. Cost ~$0.05 per scenario (one Sonnet call for Layer 1 + one Sonnet call for bundled). For 500 entries: ~$25; for 5,000 entries: ~$250. Bounded; doable without founder babysitting.

Conceptually: the proposal has a structural issue that means the artefact won't deliver the intended runtime value.

(i) **Layer 2 has no finite set of "possible endpoints."** The Layer 2 assessment is a structured object with ~12 fields, each carrying multiple sub-fields with multiple values: `katorthoma_proximity` (5 levels) × `iterative_refinement.direction_of_travel` (4 values) × `kathekon_assessment.quality` (4 levels) × `virtue_domains_engaged` (16 combinations) × `passion_diagnosis` (combinations of 25 species across 4 causal stages) × ... The combinatorial space runs into the millions. You'd be enumerating a discrete sub-grid; user assessments wouldn't exactly match pre-generated entries; lookup becomes approximate match.

(ii) **Bundled prose is input-specific, not assessment-specific.** When the bundled engine produces a response, it weaves details from the user's actual input — the email they sent, the colleague's name, the timeframe, the specific decision being deliberated. The prose references those details concretely. A pre-generated bundled output for "deliberate proximity with phobos at synkatathesis" was generated against a specific synthetic input. The prose says things like "your phobos about the team's response to your draft email this morning..." A user whose actual situation is "phobos about my mother's diagnosis" lands the same Layer 2 assessment shape but the pre-generated prose references the wrong situation. Surfacing it would feel jarring or wrong.

(iii) **This is the structural reason the translation-sandwich architecture exists.** It separates input-specific work (Layer 1 extraction + Layer 3 prose) from input-independent work (Layer 2 deterministic mechanism application). The bundled engine's "unique" responsiveness to the specific input can only be reproduced by running the bundled engine on that specific input — which is parallel-run (2.B), not lookup.

(iv) **The rubric data didn't show bundled was richer.** Across M1-CP5 → CP5-prime-prime, the rubric finding was: bundled mode-collapses to `katorthoma_proximity = deliberate` while sandwich differentiates three ways (deliberate + reflexive + habitual). So the proximity field is a sandwich strength, not bundled's. What bundled may offer that's "unique" — the AI inferred — is probably the integrative single-voice prose response weaving multiple mechanisms together (vs sandwich's three discrete fields), tone/cadence/rhetorical structure, or specific phrasings.

**AI's three concrete alternatives surfaced at this point:**

- **Alt 1 (= 2.B): Full parallel-run continuation.** Both engines fire on every production request. User sees only sandwich; comparison rows write to Supabase. Doubled cost. Most expensive but most informative — preserves bundled's input-specific responsiveness organically over real traffic.
- **Alt 2 (= 2.E): Bundled-voice Layer 3 prompt variant.** Don't run bundled at all. Add a second Layer 3 prompt template that produces an integrative single-voice response in bundled's style, drawing from the same Layer 2 assessment. Cost stays at sandwich-only. Preserves bundled's voice without the call.
- **Alt 3 (= 2.D): Selective parallel-run sampling.** Fire bundled on a sample (~10%) of production requests. Cost ~1.1× sandwich-only. Half-measure between 2.A and 2.B.
- **Alt 4: 2C reframed as research corpus.** Build the database as proposed, but use it offline for analysis only — not for runtime lookup. The corpus becomes a reference for studying bundled vs sandwich, informing how Layer 3's prompt should evolve. Generation is one-time; bounded cost; no runtime serving complications.

**AI's clarifying questions at this point** (asked of the founder before they evolved to 2F):

1. What specifically about bundled output do you want to preserve? (Voice/tone? Integrative structure? Specific phrasings?)
2. Is the goal to surface bundled prose to the user (alongside sandwich), or for ongoing analysis/research?
3. Are you OK with approximate-match prose that references different inputs than the user's?

**AI's honest summary** offered at this point: the proposal as stated (runtime lookup of pre-generated bundled prose) won't deliver the intended user value because bundled prose is input-specific. 2.B preserves it at full cost. 2.E preserves voice without the cost. 2C reframed as a research corpus captures bundled outputs without committing to a runtime lookup that won't serve the user.

### B.2 — The 2F proposal (founder's evolved design)

**Founder's response — proposing 2F:**

"Let's brainstorm this then as 2F. We rename bundled to become the LLM version that is used for testing or curiosity purposes only. With the sandwich layer 2 output we get it to report three things.

A — A numerical score of where each of the layer two steps landed and the final layer 2 outcome (this will help to serve agents, serve to graphically represent passions etc for human UI output, and to update the human and agent current proximity rating.

B — The refined sentence output that we have worked on to date.

C — Initiate an opus 4.7 LLM query of the raw input text fields (and other raw text data stored from the user) based specifically on the sandwich layer path and output results. This will keep the deterministic data stable and provide the best LLM contextualising of the result against the raw info provided."

The founder framed this as: "Take your time and ask questions as I am open to your suggestions on this."

**The implicit move 2F makes:** the AI's input-specificity concern with 2C (pre-generated prose can't reference the user's actual situation) is resolved by replacing pre-generated bundled prose with a LIVE Opus call that takes the raw input AND the deterministic Layer 2 assessment. The deterministic Layer 2 stays stable (which is what sandwich preserves — auditable, reviewable, deterministic mechanism application). Opus produces the input-specific responsive prose on top, with explicit access to both the structured assessment and the user's actual input.

**Three components of 2F as proposed:**

- **Component A — Numerical scoring.** Per-mechanism scores at each Layer 2 step + final outcome score. Three named purposes: (1) serve agents (machine-readable, for ranking/comparison/programmatic consumption); (2) human UI graphics (passion intensity bars, gauges, visual representations); (3) longitudinal proximity tracking (update the practitioner's "current proximity rating" over time across sessions).
- **Component B — Refined sentence output.** Existing Sonnet Layer 3 prose template (philosophical_reflection / improvement_guidance / summary) — UNCHANGED. The work invested in ADR-007's seven Revisions + Amendments 1–4 is preserved; this component continues to produce the structured prose that Layer 3 already produces.
- **Component C — Opus 4.7 LLM contextualization.** New layer. Takes (a) raw input text from the user; (b) "other raw text data stored from the user"; (c) the sandwich Layer 2 path (which mechanisms fired, in what order) + output (the structured assessment). Produces input-specific contextualizing prose in an integrative voice — the role bundled used to play for the input-specific responsiveness, but now grounded in the deterministic Layer 2 rather than re-reasoning from scratch.

**Founder's framing of the trade-off:** "the bundled version has some unique things to offer and will apply if it is what is created by the LLM when the same path has been followed as the sandwich path to the same endpoint as the sandwich endpoint" — but updated for 2F: instead of looking up pre-generated bundled prose, the live Opus call produces equivalent-quality contextualization grounded in the deterministic Layer 2.

### B.3 — AI's analysis of 2F: thoughtful + architectural change + governance work + sequencing concern

**Why 2F is a thoughtful proposal:**

It solves the conceptual problem the AI raised about 2C (input-specificity). Component C addresses it directly: Opus sees the raw input AND the deterministic assessment. The deterministic Layer 2 stays stable (preserving what sandwich gives — auditable, reviewable, deterministic mechanism application), and a more capable LLM produces the input-specific responsive prose on top. The founder is not trying to preserve bundled-the-engine; they are preserving what bundled does well (input-specific integrative voice) by replacing it with a better-equipped layer that has explicit access to both the raw input and the structured assessment.

This is cleaner than 2.B (parallel-run continuation) because it doesn't run two engines on every request — Opus replaces bundled rather than running alongside. It's cleaner than 2.E (Sonnet Layer 3 prompt variant) because Opus is genuinely a more capable model for this kind of integrative work than Sonnet.

**What 2F actually is — and why this matters for sequencing:**

2F is NOT a parallel-run posture decision. It's a new architectural layer added to the engine. Specifically: what was a 3-layer architecture becomes a 4-layer architecture, OR equivalently, Layer 3 splits into 3a-structured (Sonnet) + 3b-contextualized (Opus). This is a substantial architectural change — bigger than the M1-CP6 cutover commit was scoped for.

Concrete delta vs M1-CP6 scope:

(i) New module — `layer4-opus-contextualization.ts` or `layer3b-opus.ts`.
(ii) New ADR specifying the Opus call's prompt template, max tokens, temperature, system prompt structure, what raw user data it pulls in.
(iii) Layer 2 module changes to emit numerical scores (per Component A).
(iv) Response shape redesign — M1-CP6 already changed the response shape under A-2; 2F changes it again (more substantially).
(v) Verification harness extension — Opus output validation, R7 source fidelity in Opus output, R8a/R8c discipline preservation, fallback semantics for the Opus layer.
(vi) AC1 amendment to add an Opus row.
(vii) Possibly ADR-004 §6 amendment (engine architecture).
(viii) Possibly R6c reconciliation (numerical scoring vs "Qualitative proximity levels, not numeric 0–100").
(ix) R5 cost-as-health-metric threshold revisited.

**Governance reconciliations 2F requires before it ships:**

**(R1) AC1 (Model Reliability Boundaries).** AC1's table covers Haiku and Sonnet. Opus isn't there. Adding Opus is an AC1 amendment — Standard-tier governance change but governance work that needs to happen. The reasoning for Opus over Sonnet for this layer needs to be captured (likely: integrative reasoning across raw input + structured assessment is at the boundary where Sonnet's reliability becomes a question and Opus's broader context handling is justified).

**(R2) R6c (No numeric virtue scoring).** R6c says: "V3 uses qualitative proximity levels (reflexive → sage-like), not numeric 0–100. Numeric scoring must be justified by V3 data, not inherited from V1." Component A's numerical scoring needs to be reconciled with R6c. Three readings:

- (i) The numerical scores are PER-MECHANISM quality scores (not virtue scores) and are SECONDARY metadata for agent/UI consumption — qualitative levels remain primary on user-facing prose. R6c is preserved (the rule is about virtue scoring specifically); numerical mechanism scores are additive metadata. **Cleanest path; no R6c amendment.**
- (ii) The numerical scores include a numeric proximity rating (0-100). This conflicts with R6c. **R6c amendment needed (Critical-tier governance change — R-rule modification).**
- (iii) The numerical scores are categorical-as-numeric — the existing 5 proximity levels mapped to 1-5, the existing 4 stage_scores levels mapped to 1-4. **Data-model redundancy** (the qualitative is already there) but doesn't conflict with R6c.

**(R3) R5 (Cost guardrail).** Current sandwich per-request cost is ~$0.034 (Layer 1 ~$0.015 + Layer 3 ~$0.018 + Layer 2 deterministic ~$0). Opus is roughly 5x Sonnet pricing. Adding an Opus layer takes the per-request cost to roughly $0.10–0.13 — about 3x current. R5 says "Paid-tier revenue must cover at least 2x the LLM API costs incurred by that tier." Tripling per-request cost compresses that ratio meaningfully. This needs a deliberate-choice exercise per R0 + R5 alongside the architectural decision, not as a side-effect.

**Latency consideration:**

Opus calls run roughly 25–40 seconds for prompts of this complexity. Current sandwich Layer 3 Sonnet runs ~17 seconds. Adding Opus in series after Layer 3 takes total user-facing latency to 50–70 seconds. Vercel's serverless function timeout is 60 seconds on Pro. This is a real constraint — 2F may push some requests over the timeout boundary. Two design responses:

- (i) Run Opus in PARALLEL with Layer 3 (both kick off after Layer 2 completes, both await before response). Total latency = max(Sonnet L3, Opus) ≈ 25–40s. Within timeout most of the time.
- (ii) Stream Opus output separately (the structured response returns first; Opus contextualization streams in as a follow-up). Bigger refactor — affects API contract for agent consumers.

(i) is simpler. (ii) is more user-friendly. (ii) is also a substantially bigger build.

**AI's sequencing recommendation (accepted by founder):**

Separate today's M1-CP6 cutover from the 2F architectural arc. Specifically:

- **M1-CP6 today** — proceed with cutover under 2A (retire parallel-run; sandwich is sole user-facing path; bundled engine retained in `/website/src/lib/sage-reason-engine.ts` for M2/M3/M4 consumer migrations per ADR-004 §10). This honors what M1-CP6 was scoped for, ships the architecture parallel-run-tested, completes the M1 arc, and doesn't absorb a multi-ADR architectural change at the same checkpoint.
- **A new architectural arc — 2F arc, "Layer 3b Opus contextualization"** — designs 2F properly: ADR-009 (or ADR-004 amendment) for the new layer, AC1 amendment, R6c reconciliation, R5 cost projection update, the new module, parallel-run observation of the Opus layer before it ships to users. Multiple sessions. The result lands the contextualizing Opus voice cleanly with the same observe-before-ship discipline this project has used throughout.

The AI's reasoning for pushing back on doing 2F today: it would have been the first time this project commits an LLM-layer architecture to user-facing without parallel-run observation. The PR1 single-endpoint discipline + the M1-CP arc structure + ADR-004's parallel-run-before-cutover pattern all point the same way: 2F is good architecture, and it deserves the same observation discipline as the original sandwich pilot.

**Founder's response:** "I agree, we will brainstorm 2F as a separate arc afterwards so please take note of where we got to so we can pick that up later." 2F deferred per PR7. This file is the "pick up later" entry point.

### B.4 — What was NOT discussed (gaps to address in this session)

The following considerations were surfaced briefly or deferred during the M1-CP6 session and need fuller discussion in 2F-CP0:

(i) **What "raw text data stored from the user" actually means.** Founder named this in passing under Component C but did not specify scope. Candidate sources: practitioner_context (existing four-layer L2b); project_context (existing four-layer L3); mentor profile (R17 intimate data territory — has implications); journal entries (also intimate); recent interaction history; agent-of-the-user's pulled context. Each has different access patterns, encryption requirements, and R17 implications.

(ii) **Component A's numerical scoring relationship to existing fields.** The current Layer 2 already produces `stage_scores` (qualitative buckets — strong/adequate/weak/not_applied) and `katorthoma_proximity` (qualitative levels — reflexive → sage-like). Component A "numerical score where each of the layer two steps landed" overlaps with these — but is it (a) a numeric-mapped version of the same data; (b) genuinely new finer-grained per-mechanism scoring; (c) something else? Affects R6c reconciliation reading.

(iii) **Output composition — single response or multi-response.** Components A + B + C all in one response payload? Or streaming? Or staged (immediate response with A + B; C arrives separately)? Affects the API contract and agent consumer expectations.

(iv) **Audience differentiation.** Component A serves agents primarily (machine-readable). Component B serves humans (refined prose). Component C serves humans (integrative contextualization). Should the API differentiate per consumer (agent-card.json descriptors named differently for agents vs humans)? Or is the response shape uniform with downstream consumers picking what they need?

(v) **Component C's failure semantics.** Opus call fails — what's the user-facing behaviour? Three options: (a) sandwich Components A + B only (no C); (b) deterministic minimal fallback (similar to 1C from M1-CP6); (c) full request error. Plus: what's the verification harness contract for Component C?

(vi) **The "bundled is renamed for testing/curiosity" statement.** M1-CP6's 2A election effectively retired bundled from `/api/reason`. Bundled remains live for M2/M3/M4 consumers. If those consumers also migrate to translation-sandwich at M2/M3/M4, bundled fully retires per ADR-003 M5. Does 2F want bundled retained for testing/curiosity beyond M5? Or is bundled retirement at M5 unaffected by 2F?

(vii) **Cost ceiling.** Founder didn't name a cost ceiling at M1-CP6 session. AI surfaced ~3x current cost (~$0.10–0.13/req). Founder's tolerance for this is unstated. Affects whether sampling, gating, or tier-based access is needed.

(viii) **Latency design preference.** Parallel Opus + Sonnet (max 25–40s) vs sequential (50–70s near timeout) vs streaming. Founder didn't elect.

## Part C — The four core clarifying questions (founder answers at session-open)

Captured in `D-M1-CP6-CUTOVER-2026-05-08`. Restated here for self-contained reference:

**(C1) Model — "Opus 4.7."** AI's system prompt model list as of May 2026 names Claude Opus 4.6 as the latest Opus. Founder to confirm: is 4.7 actually shipped, or is "4.7" shorthand for "the latest Opus available"? AI will verify availability before committing AC1 to a specific model name.

**(C2) Replace or augment Layer 3?** Three sub-options for Component C's relationship to existing Layer 3:

- (i) **Opus REPLACES Sonnet Layer 3 entirely.** Single prose output, Opus-generated. Cost: roughly cost of Opus alone (~$0.075/req); latency: roughly Opus alone (~25–40s).
- (ii) **Opus runs ALONGSIDE Sonnet Layer 3.** User sees both. Sonnet does structured fields (philosophical_reflection / improvement_guidance / summary); Opus does integrative voice. Cost: Sonnet + Opus (~$0.10/req); latency: max(Sonnet, Opus) if parallel ~25–40s, or sum if sequential.
- (iii) **Layer 3 is retired in favor of Opus** producing both structured fields AND integrative voice. Cost: Opus alone with larger token budget (~$0.09/req); latency: roughly Opus alone (~25–40s).

**(C3) Component A — numerical scoring scope.** Three readings against R6c:

- (i) Per-mechanism quality scores (not virtue scores) as SECONDARY metadata; qualitative remains primary; **no R6c conflict; no R6c amendment**.
- (ii) Numeric proximity rating (0-100); **R6c amendment needed (Critical-tier governance change)**.
- (iii) Categorical-as-numeric (existing 5 levels mapped to 1-5); **data-model redundancy but no R6c conflict**.

Plus: clarify granularity. Per-mechanism scores only (six mechanisms — control filter, passion diagnosis, oikeiosis, value assessment, kathekon assessment, iterative refinement)? Per-sub-step (each Layer 2 step has multiple sub-steps)? Final outcome score?

**(C4) Component C — "other raw text data stored from the user."** What's in scope?

- (a) Practitioner_context (Layer 2 of the four-layer context architecture — already passes to Layer 3).
- (b) Project_context (Layer 3 of the four-layer context architecture — already passes to Layer 3).
- (c) Mentor profile (R17 intimate data territory — application-level encryption per R17b; not currently in any LLM context payload).
- (d) Journal entries (R17 intimate data territory — same R17 implications).
- (e) Recent interaction history.
- (f) All of the above.
- (g) Something else (founder names).

If (c) or (d): triggers R17 reconciliation work in addition to AC1 + R6c + R5.

## Part D — Procedure

### Step 1 — Founder elects to run 2F-CP0

Founder confirms scope: continue 2F brainstorm. Optionally narrows scope (e.g., "answer the four clarifying questions only, defer additional considerations to a subsequent session" vs "full brainstorm including the eight gaps in Part B.4").

### Step 2 — Founder answers the four core clarifying questions (C1–C4)

Done in chat. AI captures each answer + any reasoning the founder provides. AI asks follow-up if any answer is ambiguous or surfaces a downstream implication the founder may not have considered.

### Step 3 — AI surfaces follow-ups from B.4 considerations

For each of the eight Part B.4 gaps, AI asks the founder for a position OR proposes a default subject to founder approval. The eight gaps are: (i) raw-data scope; (ii) Component A scoring relationship to existing fields; (iii) output composition; (iv) audience differentiation; (v) Component C failure semantics; (vi) bundled retirement at M5 + 2F interaction; (vii) cost ceiling; (viii) latency design.

This step may be run in batch (founder answers all eight in sequence) or one-at-a-time (founder elects pace). AI honors founder's working pace preference.

### Step 4 — Coherent design brief

AI composes a design brief summarising founder's answers + AI's surfaced follow-up positions. Brief captures: (a) Component A scoring scope + R6c reconciliation reading; (b) Component B disposition (unchanged or modified); (c) Component C model (Opus 4.x), prompt template direction, raw-data scope, output composition, failure semantics, latency design; (d) cost projection (with R5 reconciliation); (e) governance work the 2F arc will trigger (ADR list); (f) checkpoint structure proposed for the 2F arc (analogous to ADR-004 §10's M1-CP1 → M1-CP6 structure).

The brief is NOT an adopted ADR — it's the design input that 2F-CP1 (next sub-session) drafts ADRs from.

### Step 5 — Founder approves brief + elects 2F-CP1 scope

Founder reviews the brief. Either: (a) approves as drafted → 2F-CP1 follows with ADR drafting; or (b) requests revision in this session; or (c) defers approval to a follow-on session. Founder elects.

### Step 6 — Append decision-log entry (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Captures: decisions made (founder's answers to C1–C4 + B.4 follow-ups); design brief composed; 2F arc checkpoint structure proposed; rules served (R0 R5 R6c R17 if engaged AC1 AC8 KG2 PR1; PR3 PR4 PR6 NOT engaged this session); risk classification (Standard); cross-references.

### Step 7 — Session close (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". Includes a Next Session Should block naming 2F-CP1 (ADR drafting) with the design brief as input.

## Part E — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + Part B read | 25–35 min |
| Part C four core clarifying questions (C1–C4) | 30–45 min |
| Part B.4 follow-ups (8 gaps) | 45–75 min |
| Step 4 design brief composition | 30–45 min |
| Step 5 founder review + approval | 15–30 min |
| Step 6 + 7 decision-log + close (lean) | 20–30 min |
| **Total** | **~3–4.5 hours** |

If the founder elects narrower scope at Step 1 (e.g., C1–C4 only, defer B.4 follow-ups): ~1.5–2 hours.

## Rollback path

Brainstorm session — no production touch, no governance documents adopted. `git revert` of the decision-log + close + brief commits reverses cleanly. No user-facing impact.

## Forecast

**Most-likely outcome:** founder lands clean answers to C1–C4 and works through 4–6 of the eight B.4 follow-ups in the session; a coherent 2F design brief is composed; 2F-CP1 (ADR drafting) is scoped for the next session. Some B.4 considerations may be deferred to surface during ADR drafting itself (where the constraint-shape becomes more concrete).

**Cleanest possible outcome:** founder has pre-thought the four core questions and most B.4 follow-ups; brainstorm flows efficiently; design brief composed cleanly; 2F-CP1 ADR drafting follows in the same session or next.

**Possibility of revision:** the brainstorm may surface a constraint or implication that materially changes the founder's view of 2F's value vs cost. If so, the brief captures that and 2F may be revised, deferred further, or revisited from a different angle. PR7 supports this — decisions not made are documented; revisiting at any later session is permissible.

**What success looks like (per the project's R0 oikeiosis principle):** 2F-CP0 produces a design that serves Circles 3 + 4 — practitioners and agent developers receive richer, input-specific contextualization grounded in the deterministic Stoic mechanism application. The deterministic Layer 2 is preserved (auditable, reviewable, revisable). The Opus layer adds responsiveness without re-introducing the bundled engine's structural limitations. Cost + latency are within deliberate-choice bounds. The brief is principled, not improvised.

End of prompt.
