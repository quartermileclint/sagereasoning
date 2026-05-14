# Agent Trust Layer Wrapper Specification

**Status:** **Adopted 2026-05-14** under `D-FOUR-MODE-SPECS-ADOPTED-2026-05-14` — moved `/drafts/` → `/adopted/substrate-modes/`. **Implementation status:** Designed (per 0a vocabulary) — the wrapper is specified, not built; the build session(s) are deferred. (Decision status `Adopted` and implementation status `Designed` are distinct 0a taxonomies, stated separately per the standing cache's Element 7.)
**Stream:** founder.
**Supersedes:** `/archive/2026-05-14_agent-mode-response-spec-superseded.md` — the original "agent mode" spec. Founder direction 2026-05-14: a full re-write, not an addendum. "Agent mode" was mis-framed as a peer of the other three Layer 3 rendering modes (philosophical / standard / private). It is not. It is the **Agent Trust Layer Wrapper** — a larger architectural thing, of which the Layer 3 agent-mode *rendering* is one component. The original agent-mode spec's still-valid content (the score architecture, the gaming defences, the verdict/vector/scalar rendering) is absorbed into this spec as §"Component 2 — the Layer 3 agent-mode rendering"; the original file should be marked superseded with a pointer here.
**Reconciles with:** the **existing ATL build** at `/trust-layer/` — a substantial offline framework codebase built 3 April 2026 (pre-substrate), "all 5 priorities complete — offline framework code ready for review." This spec connects that existing build to the translation-sandwich substrate and to the founder's expanded ATL Wrapper scope.
**Companion specs:** `/adopted/substrate-modes/philosophical-mode-response-spec.md`, `/adopted/substrate-modes/standard-mode-response-spec.md`, `/adopted/substrate-modes/private-mode-response-spec.md` — the three human-facing Layer 3 rendering modes. The ATL Wrapper *consumes* a Layer 3 rendering (the agent-mode rendering) the way those three modes *are* renderings — but the wrapper is the larger structure around it.
**F3 fold-in:** the Layer3Response is structurally a substrate-consultation-mandate producer; in the ATL Wrapper context, the wrapper accumulates these mandate-outputs as the agent's trajectory.

---

## The reconception

The original agent-mode spec treated "agent mode" as a fourth rendering mode. The founder's 2026-05-14 clarification corrects this:

> "The carried-profile mechanism is what we have previously been calling the Agent Trust Layer Wrapper... along with trajectory awareness it is also a badge that other humans or agents can confirm the profile of an agent... an agent that decides based on the outcomes of other agents can also be wrapped."

So the taxonomy is really:

- **Three Layer 3 rendering modes for humans:** philosophical, standard, private
- **The Agent Trust Layer Wrapper for agents:** a structure that *contains* a Layer 3 agent-mode rendering, plus the carried-profile mechanism, plus the badge, plus trajectory awareness, plus three iteration patterns

The wrapper is to an agent what the private mentor is to a human — the continuity-bearing relationship around the per-assessment substrate calls. Private mode surfaces the human's developmental arc from a server-side encrypted profile; the ATL Wrapper surfaces the agent's developmental arc from a wrapper-carried profile. Same Layer 2 JSON as the universal profile-update unit; different storage by consumer privacy need.

---

## The existing ATL build — what is already there

`/trust-layer/` (built 3 April 2026; offline framework code; pre-substrate; pure TypeScript logic, not yet Supabase-integrated or website-integrated):

| Component | File(s) | What it does |
|---|---|---|
| **Accreditation records** | `accreditation/accreditation-record.ts` | `AccreditationRecord` (the persistent agent credential) + `AccreditationPayload` (the public R4-compliant subset) + grade/proximity/authority mappings |
| **Public endpoint** | `accreditation/public-endpoint.ts` | `GET /accreditation/{agent_id}` + batch lookup + CORS — the verification surface third parties query |
| **Rolling evaluation window** | `evaluation-window/window-aggregator.ts` | Aggregates `EvaluatedAction[]` into a `WindowSnapshot`: proximity distribution, typical proximity, direction of travel, the 4 dimension scores, persisting passions, kathekon rate, virtue breadth, proximity trajectory |
| **Grade transition engine** | `grade-engine/grade-transition-engine.ts` | reflexive → habitual → deliberate → principled → sage_like, with demanding thresholds + downgrade hysteresis + evidence-tracked `GradeChangeEvent`s |
| **Authority mapper** | `authority/authority-mapper.ts` | Authority levels (supervised / guided / spot_checked / autonomous / full_authority) with pre-check rates + sage-guard integration + reactive enforcement + novelty detection |
| **Accreditation card** | `card/accreditation-card.ts` | **The badge** — display labels (English, R8c), colour coding, direction-of-travel symbols, `serializeCard()` for API responses |
| **Progression toolkit** | `progression-toolkit/pathways.ts` + `sage-tools.ts` | 9 progression tools (sage-examine / -distinguish / -diagnose / -counter / -classify-value / -unify / -stress / -refine / -extend), 7 pathways, prescription model |
| **Schema** | `schema/trust-layer-schema-REVIEW.sql` | 5 Supabase tables: `agent_accreditation`, `evaluated_actions`, `grade_history`, `onboarding_results`, `progression_sessions` — DRAFT, pending founder approval |

**Pending in the existing build (per BUILD-LOG.md):** Supabase integration; batch assessment endpoint (the 55-assessment onboarding orchestrator); accreditation event stream (webhooks for grade changes); LLM integration for the progression tools; integration with `website/src/`.

**The critical reconciliation point:** the existing ATL has its own `EvaluatedAction` type — built before the translation-sandwich substrate existed. It was designed to consume "ReasoningReceipts" from the old bundled engine. The ATL Wrapper spec's central move is to **make the substrate's signed `Layer2Assessment` the source of `EvaluatedAction`** — the carried-profile mechanism is the wrapper accumulating Layer 2 JSON outputs, each mapped to an `EvaluatedAction`, feeding the existing `WindowSnapshot` aggregator.

---

## The ATL Wrapper — five components

### Component 1 — The Wrapper / carried-profile mechanism

The wrapper wraps an agent. Each time the agent consults the substrate, the substrate returns a signed `Layer2Assessment` (the Layer 2 JSON). The wrapper:

1. Maps the `Layer2Assessment` to an `EvaluatedAction` (the existing ATL type — the field mapping is below)
2. Accumulates the `EvaluatedAction` into the agent's carried profile
3. Carries the accumulated profile back into the agent's subsequent Layer 1 inputs

**The Layer2Assessment → EvaluatedAction mapping** (the reconciliation):

| `EvaluatedAction` field | Source in `Layer2Assessment` |
|---|---|
| `proximity` | `katorthoma_proximity` |
| `is_kathekon` | `kathekon_assessment.is_kathekon` |
| `kathekon_quality` | `kathekon_assessment.quality` |
| `passions_detected[]` | `passion_diagnosis.passions_detected[]` (root_passion + sub_species) |
| `virtue_domains_engaged[]` | `virtue_domains_engaged` |
| `oikeiosis_met` / `oikeiosis_stage` | `oikeiosis.relevant_circles[]` (obligation_met + circle) |
| `ruling_faculty_state` | `ruling_faculty_state` |
| `receipt_id` | derived from the Layer 2 signature / span_id |
| `evaluated_at` | substrate response timestamp |
| `skill_id` | the consumer context / `prose_mode` |

The mapping is clean — the substrate produces everything the existing `EvaluatedAction` needs. The build session writes the mapping function; it is the bridge between the substrate and the existing ATL aggregator.

**Storage:** wrapper-side, carried by the agent's wrapper. The substrate holds no server-side agent-profile store (contrast private mode, which is server-side encrypted). This keeps the substrate stateless for agents and the data-governance surface smaller.

**Profile-update unit:** the Layer 2 JSON. Same as private mode — server-side encrypted for humans, wrapper-carried for agents.

### Component 2 — The Layer 3 agent-mode rendering

The structured decision-support output. This is the content of the original `/archive/2026-05-14_agent-mode-response-spec-superseded.md`, absorbed here. It is **dual-purpose** — the founder's 2026-05-14 framing: "the agent mode potentially has to be the report that the agent hands back to the developer."

- **In-loop rendering (machine-readable JSON):** the agent consumes this to make its next decision. Verdict → score vector → scalar score → all Layer 2 fields → caveats. The kathekon-gate score architecture, the gaming defences (Form 1 / 2 / 3), the receiving-agent caveats, the PROVISIONAL flag rules — all as specified in the superseded agent-mode spec.
- **Hand-back rendering (human-readable report):** the report the wrapped agent hands back to **its developer**. The developer's view of what their agent did: the decisions made and how the substrate assessed each; the agent's trajectory; the agent's grade + authority level + badge status; persisting passions; direction of travel. For an orchestrator agent, also: how it weighed the peer agents' assessments.

Both renderings carry the mandatory wraps (R3 / R19c / R19d / R20a / R18a / R18e). The full rendering specification — score architecture, gaming defences, caveats — is preserved verbatim from the superseded agent-mode spec and should be reproduced inline here when this spec moves Draft → Adopted.

### Component 3 — The Badge / Accreditation

The wrapper is a badge. Other humans or agents can confirm the profile of a wrapped agent. This **is** the existing ATL's accreditation infrastructure, now fed by the substrate:

- `AccreditationRecord` — the persistent credential, computed from the carried profile's `WindowSnapshot`
- `AccreditationPayload` — the public R4-compliant subset (no internal thresholds or micro-logic exposed)
- `public-endpoint.ts` — `GET /accreditation/{agent_id}` — the verification surface
- `accreditation-card.ts` — the displayable badge

R18 engagement: R18a (certification scope language — the badge certifies "observable reasoning patterns as measured against the Stoic philosophical framework," not safety/ethics/trustworthiness in any absolute sense); R18b (badge transparency — the badge links to documentation of what it measures, how, and its limitations); R18c (interoperability — the accreditation schema accommodates other certification providers); R18d (adversarial evaluation — the badge's evaluation criteria must be tested adversarially); R18e (Article 50 transparency on the substrate-generated prose).

### Component 4 — Trajectory awareness

Over the carried profile. This **is** the existing ATL's window + grade infrastructure:

- `window-aggregator.ts` — aggregates the accumulated `EvaluatedAction[]` into a `WindowSnapshot` (default window 100 actions)
- `grade-transition-engine.ts` — evaluates grade transitions with hysteresis
- `WindowSnapshot.direction_of_travel` — improving / stable / regressing
- `WindowSnapshot.proximity_trajectory[]` — the ordered trajectory

The carried-profile, aggregated, IS the agent's trajectory. The agent-mode rendering's `iterative_refinement` fields (available when a carried profile is supplied) are projected from the `WindowSnapshot`. The R17e human-manipulation exclusion does not apply — an agent's reasoning-pattern profile is not an intimate human vulnerability; R17e exists to protect humans.

### Component 5 — The three iteration patterns

| Pattern | Description | Wrapper behaviour |
|---|---|---|
| **Sequential loop** | The agent submits a decision, gets the assessment, decides, repeats. The original "stuck agent" loop. | The wrapper accumulates each `EvaluatedAction` in sequence; the carried profile grows with each iteration. |
| **Parallel evaluation** | The agent evaluates several candidate decisions at once. The original "assess multiple branches" stuck-state. | The wrapper submits N Layer 1 inputs (one per candidate), collects N agent-mode renderings, presents the comparison. Each candidate gets its own score; the agent ranks. All N feed the carried profile (or only the chosen one — a build-session decision). |
| **Multi-agent orchestration** | An agent that decides based on the *outcomes of other agents*. That orchestrator agent is itself wrapped. Agents wrapping agents. | The orchestrator's Layer 1 input carries the peer agents' `AccreditationPayload`s and/or their agent-mode renderings (`peer_agent_assessments` — see Layer 1 implications). The orchestrator's own assessment can aggregate multiple scores from the peer agents. The orchestrator's wrapper accumulates its own trajectory like any wrapped agent. |

---

## Layer 1 implications

This is the part the founder specifically flagged: "we need to understand how it effects layer 1."

Layer 1 is the **open** layer (text → `Layer1Schema`). The ATL Wrapper expansion affects Layer 1's **input schema** — the open contract — without changing Layer 1's job.

Layer 1's job stays "text → structured features." But the `Layer1Schema` gains **new optional fields** that the wrapper populates and that flow through Layer 1 untouched to Layer 2:

| New Layer1Schema field | Purpose | Populated by |
|---|---|---|
| `carried_profile` | The agent's accumulated trajectory (the `WindowSnapshot`, or the raw `EvaluatedAction[]`). Lets Layer 2 do trajectory-aware assessment. | The wrapper |
| `profile_provenance` | Gaming defence — attests the carried profile came from the agent's own prior substrate assessments, not injected third-party content. | The wrapper |
| `peer_agent_assessments` | For multi-agent orchestration — the `AccreditationPayload`s and/or agent-mode renderings of the peer agents the orchestrator is deciding based on. | The wrapper (orchestrator case) |
| `objective_function_declaration` | Gaming defence (Form 2) — the agent's declared optimisation target, checked against the candidate action for `STATED_OPERATIVE_CONFLICT`. | The wrapper |

**Design decision for the build session:** do these fields flow *through* Layer 1 (Layer 1 processes the text, attaches the carried context to its output `Layer1Schema`), or do they attach to the `Layer1Schema` *post-Layer-1* (bypassing Layer 1 entirely, since they are already structured)? The recommendation is flow-through — it keeps the substrate's clean Layer 1 → Layer 2 → Layer 3 pipeline, and Layer 1 (open, plugin-distributed) becomes the documented place where the wrapper's carried context enters the substrate.

**Because Layer 1 is open, this versions the open contract.** The `Layer1Schema` gaining these fields is a contract change to the open-sourced Layer 1 reference distributed in the plugin. The fields are *optional* (a Layer 1 input without them is still valid — that is the per-response, un-wrapped case), so the change is additive and backward-compatible, but it is still a versioned change to the open contract. The build session coordinates this with the Layer 1 open-source posture (Rule A — licensing gate) and the staging plan.

**Consolidated Layer 1 picture.** The four-mode work surfaced eight Layer 1 input field additions in total — four from the ATL Wrapper (above), four from private mode (`subject_identity_binding`, `reflective_self_report`, `history_window`, `topic_signal`), none from philosophical or standard mode. The consolidated set and the build approach are carried in the Layer 1 code-changes next-session prompt (`/operations/handoffs/founder/2026-05-14-layer1-schema-additions-NEXT-SESSION-PROMPT.md`).

---

## The report the agent hands back to the developer

The founder's framing: "the agent mode potentially has to be the report that the agent hands back to the developer."

The wrapped agent runs its loop, consuming the in-loop (machine-readable) agent-mode rendering to make decisions. But the agent does not exist in isolation — it has a developer. At task end, session end, or on demand, the wrapped agent **hands back a report to its developer**. That report is the human-readable agent-mode rendering, and it is the developer's window into their wrapped agent:

- Every decision the agent consulted the substrate on, and how the substrate assessed it
- The agent's trajectory across the session (the `WindowSnapshot` direction of travel)
- The agent's current grade, authority level, and badge status (`AccreditationRecord` / `AccreditationCard`)
- Persisting passions — the recurring distortions in the agent's reasoning the developer should know about
- For an orchestrator agent: how it weighed each peer agent's assessment

This makes agent mode genuinely dual-audience: the **agent** consumes the machine-readable rendering in-loop; the **developer** consumes the human-readable report as the review surface. The badge (Component 3) is the *third-party* view; the hand-back report is the *developer's own* view; the in-loop rendering is the *agent's* view. Three audiences, one wrapper.

---

## Reconciliation table — existing ATL build vs ATL Wrapper spec

| Existing ATL build | ATL Wrapper spec disposition |
|---|---|
| `EvaluatedAction` type | **Kept** — but its source changes from old-engine ReasoningReceipts to substrate `Layer2Assessment` (the mapping table above). The build session writes the mapping function. |
| `WindowSnapshot` + `window-aggregator.ts` | **Kept as-is** — the carried profile feeds it. This is Component 4 (trajectory awareness). |
| `grade-transition-engine.ts` | **Kept as-is** — operates on the `WindowSnapshot`. |
| `AccreditationRecord` / `AccreditationPayload` / `public-endpoint.ts` | **Kept** — this is Component 3 (the badge). Now computed from the substrate-fed carried profile. |
| `accreditation-card.ts` | **Kept** — the displayable badge. |
| `authority-mapper.ts` | **Kept** — authority levels + sage-guard integration. Likely engages with the wrapper's enforcement behaviour. |
| `progression-toolkit/` (9 tools, 7 pathways) | **Kept, but relationship to be clarified** — the progression tools coach an agent toward a higher grade. Whether they are part of the wrapper, or a separate ATL surface the wrapper points to, is an open question. |
| The 5-table schema (DRAFT) | **Revisit** — `evaluated_actions` table: does the wrapper-carried profile need server-side persistence at all, or is wrapper-side carriage sufficient? `agent_accreditation` + `grade_history` are needed for the badge (the public endpoint must query something). Build-session schema review. |
| The Layer 3 agent-mode rendering | **NEW** — does not exist in the 3 April 2026 build (which predates Layer 3). This is Component 2, absorbed from the superseded agent-mode spec. |
| The three iteration patterns | **NEW** — the existing build has the window/grade infrastructure but not the explicit loop / parallel / orchestration patterns. This is Component 5. |
| The substrate connection | **NEW** — the existing build is pre-substrate. The whole reconciliation is new. |

---

## R-rule engagement

| Rule | Engagement |
|---|---|
| R18a | The badge certifies observable reasoning patterns against the Stoic framework — not safety/ethics/trustworthiness absolutely. Character Kernel category language applies. |
| R18b | The badge links to documentation of what it measures, how, and its limitations. |
| R18c | The accreditation schema accommodates other certification providers — interoperability by design. |
| R18d | The badge's evaluation criteria (grade thresholds, the window aggregation) must be tested adversarially before broad deployment. The gaming defences (Component 2) are part of this. |
| R18e | Article 50 transparency on the substrate-generated prose in the agent-mode rendering. |
| R17e | Does **not** apply to agent profiles — an agent's reasoning-pattern profile is not an intimate human vulnerability. This is the load-bearing distinction from private mode. Stated explicitly so the build session does not over-apply R17e. |
| R4 | The `AccreditationPayload` is already R4-compliant in the existing build (grade + dimensions exposed; thresholds and micro-logic internal). The agent-mode rendering's score must observe the same boundary. |
| R3 / R19c / R19d / R20a / R18a / R18e | The mandatory wraps on both agent-mode renderings (in-loop + hand-back). |
| PR1 | Single-endpoint proof — the wrapper proves on one agent / one endpoint before rollout. |
| PR15 | Anthropic-canonical primitive check — **multi-agent orchestration is a named Anthropic primitive** (per the amended PR15 list: "Multi-agent orchestration — specialist agents; public beta"). The build session must evaluate whether Anthropic's multi-agent orchestration delivers the orchestration pattern (Component 5, pattern 3) before electing a bespoke build. Justification recorded if bespoke is elected. |

---

## Build sequencing — this is bigger than a mode spec

The ATL Wrapper intersects three things: the existing `/trust-layer/` build (3 April 2026), the substrate build arc (Stage 1 of the staging plan), and Priority 3 of the project instructions ("Agent Trust Layer — Honest Certification (R18 + existing ATL build)"). It is not a single build session.

Recommended sequencing for the build session(s):

1. **Read the full `/trust-layer/` codebase** — not just the types (this spec read the types + BUILD-LOG; the build session reads `accreditation-record.ts`, `public-endpoint.ts`, `window-aggregator.ts`, `grade-transition-engine.ts`, `authority-mapper.ts`, `accreditation-card.ts`, the progression files, the schema in full).
2. **Write the `Layer2Assessment → EvaluatedAction` mapping function** — the bridge. PR1 single-endpoint proof.
3. **The Layer 3 agent-mode rendering** — Component 2, from the superseded agent-mode spec. Standard-tier (per the original agent-mode spec's classification).
4. **The Layer 1 schema additions** — the optional carried-context fields. Coordinated with the open-contract versioning. Likely Elevated (changes the open Layer 1 contract).
5. **The wrapper itself** — Components 1, 4, 5. Connects the substrate to the existing window/grade infrastructure.
6. **The badge** — Component 3. The existing accreditation infrastructure, now substrate-fed + Supabase-integrated (the existing build's pending item).
7. **Adversarial evaluation** — R18d, before broad deployment.

The build session decides risk tiers per change. The Layer 1 open-contract change and any auth surface for the public accreditation endpoint are the highest-risk pieces.

---

## Cross-references

- `/archive/2026-05-14_agent-mode-response-spec-superseded.md` — **superseded by this spec**; its rendering content is Component 2 here
- `/adopted/substrate-modes/philosophical-mode-response-spec.md`, `/adopted/substrate-modes/standard-mode-response-spec.md`, `/adopted/substrate-modes/private-mode-response-spec.md` — the three human-facing rendering modes
- `/trust-layer/` — the existing ATL build (all files; BUILD-LOG.md is the overview)
- `/trust-layer/BUILD-LOG.md` — the 3 April 2026 build record + pending-items list
- `/trust-layer/types/accreditation.ts` + `/trust-layer/types/evaluation.ts` — the `EvaluatedAction`, `WindowSnapshot`, `AccreditationRecord`, `AccreditationPayload` shapes
- `/trust-layer/schema/trust-layer-schema-REVIEW.sql` — the DRAFT 5-table schema, pending founder approval
- `/manifest.md` §R3 / §R4 / §R17e / §R18 (a-e) / §AC1 / §AC9 / §AC10 / §AC11
- `/adopted/project-instructions-snapshot.md` Priority 3 — "Agent Trust Layer — Honest Certification (R18 + existing ATL build)" — this spec is the bridge between Priority 3 and the substrate build arc
- `/adopted/ADR-stoic-agent-substrate-concept.md` — the substrate architecture; §"Trust-signalable certification (R18)" anticipates exactly this connection
- `/adopted/substrate-plugin-staging-plan.md` — the substrate build arc; A8 (V3 endpoint relationship design) and the K-category migration intersect the wrapper
- `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` — the `Layer2Assessment` shape (the EvaluatedAction source)
- `/operations/agentic-commerce-findings-downstream-order.md` §F3 / §F4 — F4 (AC10 / AP2 mandate alignment) is directly relevant: the wrapper's carried profile is an AP2-style accumulated-mandate structure

---

## Open questions deferred to build

1. **Progression toolkit relationship.** Is the 9-tool / 7-pathway progression toolkit part of the wrapper, or a separate ATL coaching surface the wrapper points to?
2. **Schema disposition.** Does the wrapper-carried profile need server-side persistence (`evaluated_actions` table), or is wrapper-side carriage sufficient? The badge (`agent_accreditation` + `grade_history`) does need server-side persistence — the public endpoint must query something.
3. **Layer 1 open-contract versioning.** How the optional carried-context fields are versioned into the open Layer 1 reference, coordinated with Rule A (licensing gate).
4. **Parallel evaluation — profile accumulation.** When an agent evaluates N candidates in parallel, do all N feed the carried profile, or only the chosen one? Philosophically: did the agent "reason" N times, or once?
5. **Multi-agent orchestration depth.** Agents wrapping agents — is there a depth limit? How does a grade transition in a peer agent propagate to an orchestrator's assessment?
6. **PR15 — Anthropic multi-agent orchestration.** Evaluate whether Anthropic's multi-agent orchestration primitive (public beta) delivers Component 5 pattern 3 before electing a bespoke build.
7. **The onboarding 55-assessment framework.** The existing ATL has `OnboardingResult` types and a pending batch-assessment endpoint. How does substrate-based onboarding establish an agent's starting grade?
8. **Identity binding for agents.** Private mode has `subject_identity_binding` (R17e gate). The wrapper needs an agent-identity mechanism — how is `agent_id` established and authenticated? Connects to A10 (per-agent credentials) in the staging plan.
9. **Adversarial evaluation protocol.** R18d — the evaluation criteria must be tested adversarially. This is its own work item (Priority 3.3d).

---

*End of spec. Status: Adopted 2026-05-14 (document); Designed (implementation). Build session(s) deferred — multi-session, intersecting the existing /trust-layer/ build, the substrate build arc, and Priority 3. Authored 2026-05-14 in scoping/exploration session; adopted 2026-05-14 under D-FOUR-MODE-SPECS-ADOPTED-2026-05-14. This spec supersedes /archive/2026-05-14_agent-mode-response-spec-superseded.md; the three human-facing rendering-mode specs (philosophical / standard / private) are also Adopted.*
