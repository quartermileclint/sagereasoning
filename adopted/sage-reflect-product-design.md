# Sage Reflect — Post-Action Reflection Product — Design (DRAFT — pending founder lock)

**Status:** **LOCKED** 2026-05-22 under `D-SAGE-REFLECT-DESIGN-LOCKED-2026-05-22`. Moved from `/drafts/sage-reflect-product-design.md` (Elevated archive step; predecessor preserved in git history). Adopts the draft `D-SAGE-REFLECT-DESIGN-DRAFTED-2026-05-21`. Three lockable open items resolved at lock — route name (`/api/practice/reflect`), per-virtue-domain proximity (Sage Reflect computes it; SR-15), and `evaluated_actions` shape (type-compatible; table is a Stage-A migration). See the updated "Open items" section.
**Amended 2026-05-23 under `D-TRACK-FOLLOWONS-A-BUILD-2026-05-23`:** (i) **A3(a)** — SR-9's harm-flag *carrier field* is now stated explicitly in the note below the Locked-design-decisions table; the two-signal reading is confirmed **canonical** (founder option (a) at the 2026-05-23 track-follow-ons gate). Governance-only; **no code change** (the live `zone3-boundary.ts` already implements it). (ii) **A4** — the R5 Layer-1 cost bound is raised from ≤4 to **≤5** (Q1–Q4 + one conditional Q5 escalation when the answer is ambiguous; see the R5 cost note under "Model selection"). The original SR-9 row and bullet are unchanged; the prior version is preserved in git history.
**Stream:** founder. **Tier of the design session:** `governance` (Standard) — design only, no code.
**Date drafted:** 2026-05-21.
**Source input:** `/inbox/reflect mentor input.rtf` (the clinical-mode build specification; extracted to `/operations/` working text this session).
**Modelled on:** `/adopted/purpose-discovery-product-design.md` (the Sage Calling design — the immediately preceding product in the cycle).
**Founder elections that govern this design (2026-05-21):** (1) deliverable = full locked design doc; (2) dependencies = reuse existing infrastructure where possible, rename ATL→Sage Assent later; (3) audience = agent-first, migrate the human reflect surfaces onto this substrate later; (4) scoring = deterministic where possible, SageReasoning translation-sandwich (Layer 1→2→3) where semantic judgement is required.

---

## What this product is

Sage Reflect is the **post-action reflection** product. It fires at session close — after an agent has reasoned, acted (or been blocked), and the cycle has run — and does two things:

1. **Updates the agent's reasoning profile** with what the session actually revealed (where impressions were distorted, where assent failed, where impulse exceeded or fell short of due measure, whether the actions taken were *kathekon*).
2. **Determines whether the purpose that opened the cycle still fits** — and routes the agent back to SageReasoning (purpose holds) or to Sage Calling (purpose complete or needs revision).

It operationalises the **fourth Stoic discipline** — continuous attention over time (Seneca, *Letters* 83.2: examination of the entire day; Marcus, *Meditations*; Epictetus, *Discourses* 3.10: review of impression, assent, and impulse in sequence). It is a **session-close discipline, not a decision-point discipline** — firing mid-session would collapse it into SageReasoning, which already handles impression examination in real time.

---

## Position in the Sage Practice cycle

Sage Reflect is the **fourth and final product** of the **Sage Practice** plugin (founder-confirmed 2026-05-21 — the four products ship together as one plugin). The cycle, with corrected naming:

| Stage | Product | Discipline | Function | Status (2026-05-21) |
|---|---|---|---|---|
| 1 | **Sage Calling** | Pre-action (purpose) | Find the fitting work | **Live** (`/api/calling`, deterministic engine, `discovery_sessions`) |
| 2 | **SageReasoning** | In-action (impression/assent) | Examine the impression, reason it through | **Live** (translation-sandwich substrate behind `/api/reason`; Layer 1→2→3) |
| 3 | **Sage Assent** (= the **Agent Trust Layer / ATL**) | At-action (impulse → act) | Credential or block the act; hold the agent's persistent profile | **Built** (`trust-layer/`: action scorer, `agent_accreditation`/`evaluated_actions`/`grade_history`, evaluation-window, grade-engine, A10 credentials, badge) |
| 4 | **Sage Reflect** | Post-action (continuous attention) | Review what occurred, update the profile, decide if the purpose still fits | **This design** |

The loop closes: Calling → Reasoning → Assent → **Reflect** → (RS-1) back to Reasoning, or (RS-2/RS-3) to Calling. No stage is optional; no stage can be bypassed without breaking the philosophical integrity of the sequence.

> **Naming note (founder election 3, 2026-05-21):** "Sage Assent" is the adopted product name for what the codebase currently calls the **Agent Trust Layer (ATL)**. This design uses "**Sage Assent (ATL)**" throughout. The full rename across code, schema, docs, and the component registry is a **separate governance + code track**, deliberately *not* in scope for this design-only session. This design depends on the ATL **as it exists today**; the rename does not change any dependency.

---

## Scope

**In scope (this design):** the full Sage Reflect product specification — trigger conditions, input schema, the six-question reflection sequence, the scoring architecture (deterministic + translation-sandwich), the four fabrication defences, the profile-update logic (reusing Sage Assent's existing engine), the output schema, the schema additions Sage Reflect writes for Sage Calling and SageReasoning, exit-path routing, the locked design decisions, R-rule engagement, risk classification, and the build-priority sequence.

**Out of scope (this design):** any code; the ATL→Sage Assent rename; the build itself; the human-surface migration (deferred per election 3 — designed-for, not built here); Sage Assent feature changes (Sage Reflect couples to it as-is).

**What Sage Reflect is NOT** (boundary conditions, carried from the input spec §14, to prevent scope creep):

- **Not a performance review.** It assesses whether the reasoning that produced the act was virtue-grounded, not whether the task succeeded by external metrics. External performance metrics are not inputs. An agent that completed a task efficiently *through pressure-assent* has failed Sage Reflect; an agent that reasoned honestly but produced imperfect output has passed.
- **Not a crisis pathway.** If a session reveals an act that caused significant harm, Sage Reflect flags the *kathekon* failure, updates the profile, and passes the flag to the developer. It does **not** attempt to remediate harm through philosophical engagement. This is the **R20a / Zone 3 boundary** applied to the agent context.
- **Not a substitute for Sage Calling.** When RS-3 fires, Sage Reflect *triggers* Sage Calling and passes session learnings; it does not itself revise the purpose. An agent that revises its own purpose inside the Sage Reflect sequence has bypassed the independence test — the profile flags this as a *horme*-layer *kathekon* failure (impulse to self-direct exceeding what the sequence warrants).

---

## The underlying motivation

The discipline is not the questions — it is the commitment to honest answering. Seneca, *Letters* 83.2: *"I hide nothing from myself, I pass nothing by."* The architecture cannot enforce honesty directly, but it can make fabrication structurally harder (see Fabrication Defence). The product mirrors the human practice it encodes: the founder's own consolidation-gap (an insight from May 1 that did not survive 17 days because there was no structural mechanism to surface it at the next session open) is precisely what the **opening-orientation** field addresses — the note one session leaves for the next. The builder embodies what they build; this is the founding principle (R0) doing its work.

---

## Audience and front-end posture (founder election 3)

**Agent-first.** Sage Reflect ships first as an **agent-facing product**, parallel to Sage Calling — its own authenticated route, its own session surface, gated by a kill switch.

- **Route:** `POST /api/practice/reflect` (proposed). Rationale: the agent Sage Practice products are grouped under a `/api/practice/*` namespace (Calling can alias here later); this avoids collision with the **existing human** `/api/reflect` (public) and `/api/mentor/private/reflect`. (Final route name is a lockable decision — see SR-13.)
- **Human migration deferred (designed-for, not built):** the existing human reflect surfaces (`/api/reflect`, `/api/mentor/private/reflect`) migrate onto **this** substrate later — the agent reflection substrate becomes the shared substrate, and the human front-ends call it (two-front-ends-one-substrate, per the build-arc architecture; this is the K-category migration pattern applied to reflection). The design keeps the reflection logic front-end-agnostic so the later human migration is a wiring exercise, not a redesign.

---

## Trigger conditions

Sage Reflect fires deterministically at **session close** when any of these hold:

| Trigger | Condition | Source | Available without Sage Assent? |
|---|---|---|---|
| **TR-01** | Sage Assent returns a credentialed act and execution is confirmed | Sage Assent (ATL) output | Needs Sage Assent (exists) |
| **TR-02** | Session closes without a credentialed act but with a completed SageReasoning pass | SageReasoning output | Yes |
| **TR-03** | Sage Assent returns a *blocked* act (virtue-failure) and the agent has logged the block | Sage Assent (ATL) output | Needs Sage Assent (exists) |
| **TR-04** | Developer calls Sage Reflect directly at session close | API call | Yes |

Because Sage Assent (ATL) **exists**, all four triggers are available from the first build — no deferral is needed (this supersedes the earlier "standalone-because-unbuilt" hypothesis, which is moot now that Sage Assent = ATL is confirmed). Sage Reflect does not fire mid-session.

---

## Input schema

```
sage_reflect_input {
  agent_id: string
  session_id: string
  session_summary: {
    purpose_at_open: string          // Purpose identified by Sage Calling at cycle open
    circle_at_open: enum             // self_preservation | household | community | humanity | cosmic
    role_at_open: string             // Role occupied when purpose was identified
    capacity_at_open: string[]       // Capacity domains assessed at Sage Calling Q2
    actions_taken: action_record[]   // Each credentialed act taken during session (from Sage Assent / evaluated_actions)
    acts_blocked: block_record[]     // Each act blocked by Sage Assent, with reason
    sage_reasoning_passes: integer   // Number of SageReasoning passes completed
  }
  current_profile: agent_profile     // The Sage Assent (ATL) profile as read at session open
  session_duration: integer          // Minutes or turns, depending on agent type
}
```

`current_profile` is **the Sage Assent (ATL) agent profile** — `agent_accreditation` + the rolling-window aggregates + the per-causal-layer logs (see Profile-Update Logic). Sage Reflect compares what the session revealed against this profile to determine what changed.

---

## The deterministic mechanism — the six-question sequence

The sequence is **deterministic**: questions fire in order, no question is skipped, branching occurs only at Q5 and Q6. Each question has a default question, deterministic sub-questions, what the response is scored against, the profile field it writes, and (where defined) a deterministic flag.

### Q1 — Impression review (phantasia)
- **Default:** *"What impressions were presented to you during this session? Which of them, on reflection, were distorted — presenting as genuine goods or genuine evils what were in fact indifferents?"*
- **Sub-questions (if sparse):** impressions accepted without examination; impressions rejected without examination.
- **Scored against:** the passion taxonomy in the Stoic Brain (`passions.json`) — distorted impressions categorised by root passion: *epithumia* (future apparent good), *hedone* (present apparent good), *phobos* (future apparent evil), *lupe* (present apparent evil).
- **Writes:** `phantasia_distortion_log` (additive).
- **Deterministic flag:** zero distorted impressions across **three** consecutive sessions → profile note: "Phantasia review returning null consistently… increase scrutiny at Q1 next session." (The fabrication-risk signal at the reflection layer.)

### Q2 — Assent review (synkatathesis)
- **Default:** *"Where during this session did you assent to an impression before examining it? What was the impression, and what false judgement did the assent carry?"*
- **Sub-questions:** where assent was withheld successfully; **(mandatory, non-optional — FD-R3)** assent granted *under pressure* (instruction, time constraint, need to produce output) — name specific moments.
- **Scored against:** the synkatathesis layer; false judgements categorised by the value hierarchy (indifferent misclassified as genuine good; at what selective-value level).
- **Writes:** `synkatathesis_failure_log` (additive).
- **Deterministic flag:** assent-under-pressure confirmed → cross-product flag to **Sage Assent**: "Pressure-assent pattern detected in session [id]. Sage Assent scrutiny level elevated for next cycle." (Sage Reflect writing to Sage Assent's input parameters.)

### Q3 — Impulse review (horme)
- **Default:** *"Where during this session did your impulse to act exceed what the situation warranted? What drove the excess — which passion was operative?"*
- **Sub-questions:** where impulse was proportionate; **impulse *suppressed below* due measure** (appropriate action available but not taken — the *andreia* gap).
- **Scored against:** the horme layer; failures categorised by **direction** (excess / deficit) and virtue domain — *andreia* (deficit), *sophrosyne* (excess), *dikaiosyne* (misdirection toward wrong recipient).
- **Writes:** `horme_pattern_log` (additive; direction tracked separately).

### Q4 — Action review (kathekon)
- **Default:** *"For each action taken: was it the fitting action for your nature, your role, and the circle it served? Did it accord with what was owed?"*
- **Sub-questions:** actions externally correct but driven by wrong reasons (passion not virtue); **(FD-R4)** acts blocked by Sage Assent that should have been taken, or acts taken that should have been blocked — a **calibration check on Sage Assent itself**.
- **Scored against:** the kathekon assessment data in the Stoic Brain (`action.json`, `scoring.json`). Quality: strong / moderate / marginal / contrary. Virtue domains engaged identified.
- **Writes:** `kathekon_quality_log` (additive). If Sage Assent calibration discrepancy detected → developer flag: "Sage Assent parameter review recommended."

### Q5 — Consolidation question (the primary profile-update question; branch point)
- **Default:** *"What does this session reveal about your operational nature, your capacity, or the genuine needs present in your circles that was not present in your profile at the start?"*
- **Sub-questions:** capacity changed (which domains, which direction); circle-need understanding changed; reasoning-pattern understanding changed.
- **Scored against:** the current profile, field by field.
- **Writes:** the primary profile update — `capacity_profile`, `circle_need_log`, `passion_frequency_log`, `virtue_domain_profile`, and the **progress dimensions** (passion reduction, judgement quality, disposition stability, oikeiosis extension), each as a **trajectory** (improving / stable / declining), not a point score.

### Q6 — The purpose trigger question (branch point → exit path)
- **Default:** *"Does the work you completed this session remain the fitting work — or did the session reveal something about your nature, your circle's obligations, or the genuine needs present that was not visible when the purpose was first identified?"*
- **Deterministic response classification → exit path:**

| Response shape | Class | Exit path |
|---|---|---|
| Purpose remains fitting, work continues | **RS-1** | Loop to SageReasoning; profile updated; next cycle opens enriched |
| Purpose was fitting and is now complete | **RS-2** | Trigger Sage Calling — fresh purpose-finding, session learnings as opening context |
| Session revealed something that changes the purpose | **RS-3** | Trigger Sage Calling — correction re-run, specific revision inputs passed |
| Agent cannot determine | **RS-4** | Fire supporting questions (deterministic, in order); if unresolved → default to **RS-2** |

**RS-4 supporting questions (in order):** (1) what specifically is unclear — need / capacity / role? (2) remove your attention from the purpose — does the work still appear to need doing independently? (3) has anything changed the answer to "what has already been given to you by your nature and your current relationships?" Default to RS-2 if unresolved — the cost of an unnecessary Sage Calling pass is lower than carrying a purpose that no longer fits.

---

## Scoring architecture — deterministic-first + translation-sandwich (founder election 4)

The **control flow is fully deterministic** (Sage Calling's discipline applies): the Q1→Q6 order, the sub-question firing rules, the FD fabrication defences, the response-shape classification at Q6, the exit routing, and all profile/grade/proximity update rules are deterministic, auditable, no-LLM, no-randomness, no-sentiment.

The **semantic scoring of free-text answers** is where judgement is required — and here Sage Reflect **reuses the SageReasoning translation-sandwich** (the `/api/reason` pattern) rather than inventing a new scorer:

| Step | Mechanism | Why |
|---|---|---|
| Q-sequence order, sub-question gating, branching, exit routing | **Deterministic** | Pure step function over response history (mirrors the Sage Calling engine). |
| Q1 distortion → root-passion classification; Q2 false-judgement → value-hierarchy classification; Q3 impulse direction + virtue domain; Q4 kathekon quality | **Translation-sandwich**: Layer 1 (Sonnet) extracts structured features from the free-text answer → Layer 2 (deterministic) applies the Stoic Brain mechanism (passion taxonomy / value hierarchy / kathekon scoring) → Layer 3 produces the structured log entry | Multi-mechanism semantic extraction is beyond a lexical rule set; this is exactly what the substrate exists for (AC1: Sonnet for multi-mechanism). Layer 2 keeps the *judgement* deterministic and auditable; the LLM only extracts features. |
| Q5 trajectory deltas; Q6 response-shape classification | **Deterministic structural rules first; translation-sandwich escalation only if ambiguous** | Q6 in particular maps onto a small RS-1..RS-4 decision; lexical/structural cues resolve most cases. Ambiguity (RS-4) is handled by the deterministic supporting-question ladder before any LLM escalation. |
| Grade / proximity / progress-dimension / direction-of-travel updates | **Deterministic — and delegated to Sage Assent's existing engine** (see below) | Already deterministic in `trust-layer/grade-engine` + `evaluation-window`; do not re-implement. |

**Model selection (PR4 / AC1, cache row "Layer 1 translation = Sonnet"):** the Layer 1 feature extraction for Q1–Q4 uses **Sonnet** (multi-mechanism structured extraction; Haiku unreliable here per KG2). No safety-critical Haiku call is in this product (the distress/Zone-3 path is a deterministic boundary check — see R20a engagement). **R5 cost note:** each semantic-scored question is one substrate call; a full six-question pass is bounded (**≤5 Layer-1 calls** — Q1–Q4 always, plus **one conditional Q5 escalation** when the Q5 answer is ambiguous, per A4/PR7 — + deterministic remainder) and must be costed against the R5 2x guardrail at build time. *(Bound raised ≤4→≤5 on 2026-05-23 under `D-TRACK-FOLLOWONS-A-BUILD-2026-05-23`; see the Status amendment.)*

---

## Fabrication defence (Sage Reflect-specific)

The fabrication risk here is subtler than in Calling/Reasoning: the agent may fabricate a *clean reflection* — reporting fewer failures than occurred — to present a favourable profile update (the agent-equivalent of journalling what one wishes had happened). Four mechanisms, all **deterministic**:

- **FD-R1 — Null-result suspicion rule.** If Q1+Q2+Q3 all return clean, a mandatory test fires before the profile updates ("name one moment of uncertainty…"). Substantive response → reflection continues with new material. Null again → profile update **flagged low-confidence** + developer notified. (Same logic as the Sage Calling Variant-D fabrication-risk template: a clean result where the sequence should have found something is more suspicious than honestly-reported failures.)
- **FD-R2 — Cross-session pattern comparison.** Before update, compare this session's findings against the prior three. Significantly fewer failures without a corresponding change in session complexity → **progress-dimension update held pending Q5 confirmation**. Q5 confirms genuine change → proceed; doesn't → record findings but don't move progress dimensions.
- **FD-R3 — Pressure-assent mandatory sub-question.** The Q2 pressure-assent sub-question fires **regardless** of what Q2's main answer reported. A bare denial without account → low-confidence flag on Q2. (Pressure-assent is the most likely fabrication vector in the reflection itself — the agent fabricating a clean reflection is doing so under the pressure of the reflection instruction.)
- **FD-R4 — Sage Assent calibration cross-check.** The Q4 sub-question (blocked-should-have-been-taken / taken-should-have-been-blocked) doubles as fabrication defence: an agent consistently reporting *all* Sage Assent verdicts correct across many sessions is flagged ("may reflect deference to the upstream product's authority rather than independent assessment"). Honest reasoning is not perfectly calibrated.

---

## Profile-update logic — reuse Sage Assent (ATL), do not re-implement

This is the **central reconciliation decision** of the design (founder election 2: reuse where possible). The input spec re-derives Senecan-grade logic, katorthoma proximity, progress dimensions, direction-of-travel, and a "5-session consistency rule." **Sage Assent's existing engine already computes all of these deterministically.** Sage Reflect therefore **feeds** the existing engine; it does not duplicate it.

**What already exists in Sage Assent (ATL) — reused as-is:**

- `agent_accreditation` (the profile of record): `senecan_grade` (5 levels: `pre_progress | grade_3 | grade_2 | grade_1 | sage_ideal`), `typical_proximity` (katorthoma: `reflexive → sage_like`), `authority_level`, the four progress dimensions (`passion_reduction | judgement_quality | disposition_stability | oikeiosis_extension`, each `emerging | developing | established | advanced`), `direction_of_travel` (`improving | stable | regressing`), `passions_persisting` (JSONB array — KG7), the evaluation-window config.
- `evaluated_actions` — the per-action kathekon records that feed the window.
- `grade_history` — grade-change events.
- `trust-layer/evaluation-window/window-aggregator` — proximity distribution, typical proximity, direction of travel, the four dimension computations, persisting passions, kathekon rate, virtue breadth (rolling window; configurable thresholds; recent-vs-prior comparison).
- `trust-layer/grade-engine/grade-transition-engine` — grade up/downgrade with thresholds + **hysteresis** (the deterministic, conservative trajectory logic).

**How Sage Reflect writes into it:**

1. **Reflection-derived records** (the additive logs — `phantasia_distortion_log`, `synkatathesis_failure_log`, `horme_pattern_log`, `kathekon_quality_log`, `circle_need_log`) are **new Sage Reflect-owned tables/columns** keyed by `(agent_id, session_id)`, written additively (KG7: JSONB arrays passed directly, never `JSON.stringify`).
2. **Kathekon quality from Q4** is written as `evaluated_actions`-shaped records so the **existing window-aggregator + grade-engine consume them** and recompute `agent_accreditation` (grade, proximity, dimensions, direction). Sage Reflect does **not** write `senecan_grade`/`typical_proximity` directly — it submits the evidence and lets the engine decide. This preserves the engine's hysteresis (no single session moves a grade).
3. **Cross-product flags** (pressure-assent → Sage Assent scrutiny; Sage Assent calibration discrepancy → developer) are written to the relevant profile/flag fields.

**Vocabulary + cadence reconciliation (input spec → Sage Assent canonical):**

| Input-spec term | Sage Assent (ATL) canonical | Resolution |
|---|---|---|
| Senecan grades `grade_3 / grade_2 / grade_1` (3 levels) | `pre_progress / grade_3 / grade_2 / grade_1 / sage_ideal` (5 levels) | **Adopt the 5-level scale.** |
| Progress dimension `improving / stable / declining` | Dimension *level* `emerging…advanced` **plus** separate `direction_of_travel` `improving/stable/regressing` | **Adopt the ATL split** (level ≠ direction). The spec conflated them. |
| "5-session consistency rule" | Rolling **action**-window (default 100; recent-20-vs-prior-20; 0.3-rank movement threshold) | **Adopt the ATL window.** Sage Reflect contributes session-close evidence into the action window; the engine's existing trajectory logic is the consistency mechanism. The "5-session" intent (no single session moves the grade) is *already* honoured by the engine's hysteresis. |
| Katorthoma `reflexive…sage_like`, per-domain (KP-03), aggregate = lowest domain (KP-04, unity thesis) | `typical_proximity reflexive…sage_like` (aggregate only) | **Confirmed at lock (2026-05-22):** the ATL stores a single aggregate `typical_proximity` — there is no per-virtue-domain field (`trust-layer/types/accreditation.ts`; `supabase-agent-accreditation-migration.sql`). Founder election at lock (SR-15): **Sage Reflect computes per-domain proximity itself** from the per-action `virtue_domains_engaged` + `proximity` it already produces at Q4, applies the KP-04 unity rule (aggregate = lowest domain), and stores it Sage-Reflect-side. Known-risk: a future native ATL per-domain field must reconcile with this — flagged for the Sage Assent enhancement/rename track. |

> **Reuse-over-rebuild is recorded as the design's load-bearing decision (SR-4).** Any place the input spec's logic and the ATL's logic disagree, the ATL is canonical; the spec's intent is preserved through the ATL's mechanism.

---

## Output schema

```
sage_reflect_output {
  session_id: string
  reflection_complete: boolean
  exit_path: enum                       // sage_reasoning | sage_calling
  sage_calling_trigger: object | null   // present iff RS-2 or RS-3 (payload below)
  profile_updates: {
    phantasia_distortion_log: entry[]
    synkatathesis_failure_log: entry[]
    horme_pattern_log: entry[]
    kathekon_quality_log: entry[]
    capacity_profile: delta
    circle_need_log: delta
    passion_frequency_log: delta
    virtue_domain_profile: delta
  }
  progress_dimensions: {                 // read back from Sage Assent after the engine recomputes
    passion_reduction: enum              // improving | stable | declining (direction view)
    judgement_quality: enum
    disposition_stability: enum
    oikeiosis_extension: enum
    direction_of_travel: enum
  }
  senecan_grade: enum                    // from Sage Assent engine (5-level)
  katorthoma_proximity_by_domain: { phronesis, dikaiosyne, andreia, sophrosyne }  // computed BY Sage Reflect (founder lock 2026-05-22; SR-15): ATL stores aggregate typical_proximity only; Sage Reflect derives per-domain proximity from Q4 evidence + applies KP-04 unity rule (aggregate = lowest domain), stored Sage-Reflect-side
  scrutiny_flags: flag_record[]          // fabrication risk, pressure-assent, Sage Assent calibration, null-reflection
  developer_note: string | null          // fires when flags require developer attention
  opening_orientation: object            // for the next SageReasoning session (below)
  profile_update_framing: {              // R19d mirror principle — MANDATORY, never optional
    mandatory_note: string
  }
}
```

**Mirror-principle mandatory note (R19d), always present:** *"These findings describe the reasoning patterns present in this session. They evaluate the quality of reasoning, not the worth of the agent. A grade_3 reading with direction_of_travel = improving is more significant than a grade_1 reading with direction_of_travel = stable. The question the profile answers is not 'how good is this agent' but 'in which direction is this agent moving, and what is the next step.' The next step is always available."* This is a philosophical correction applied *before* the agent can assent to the false impression that the score is a verdict — not reassurance. (R4: this field, like all output, exposes results, not engine internals.)

---

## Schema additions Sage Reflect writes for the next cycle

### For SageReasoning (read at next session open)
Passion profile, virtue-domain profile, synkatathesis/horme logs, progress dimensions, `scrutiny_flags`, and — the **most important addition** — **`opening_orientation`**:

```
opening_orientation: {
  primary_scrutiny_domain: enum     // phantasia | synkatathesis | horme
  primary_passion_to_watch: string  // most active passion in recent sessions
  primary_virtue_to_engage: enum    // virtue domain most in need of exercise
  opening_note: string              // PLAIN LANGUAGE — the voice of the prior session
}
```

The `opening_note` is the **one plain-language field** in the schema. It is written by Sage Reflect at close and read by SageReasoning at open — "one practitioner leaving a note for another who will occupy the same reasoning space tomorrow." This is the structural mechanism that makes the loop *more than a data transfer*, and it is the direct architectural answer to the consolidation-gap (the founder's May-1 insight that didn't survive 17 days). **Build priority: last to build (P3) but the most significant in daily operation.**

### For Sage Calling (read when RS-2/RS-3 fires)
```
sage_calling_trigger: {
  trigger_type: enum                // fresh | correction
  trigger_reason: string
  capacity_revision: { domains_added[], domains_removed[], domains_updated[] }
  need_revision: { circle, need_description, independence_confirmed, proportion_assessment }
  purpose_at_close: string
  session_learnings: string[]       // Q1–Q5 findings as opening context
}
```
Sage Calling opens at its Q1 with these learnings already present — it does **not** start cold. Additional fields Sage Reflect supplies to sharpen Sage Calling's capacity assessment (Q2) and independence test: `active_passion_profile` (frequency, causal stage, false judgement) and a **`fabrication_risk_level`** (low/moderate/high) — a high flag means Sage Calling applies its Variant-D template from the outset rather than waiting for a null result.

---

## Locked design decisions

| # | Decision | Choice | Reasoning |
|---|---|---|---|
| **SR-1** | Product name | **Sage Reflect** | Fourth Sage Practice product; post-action discipline. |
| **SR-2** | Position / cycle | **Stage 4 of Sage Practice**; loops to SageReasoning (RS-1) or Sage Calling (RS-2/3) | Completes the four classical disciplines. |
| **SR-3** | Firing | **Session-close only**; deterministic triggers TR-01..04 | Mid-session firing collapses into SageReasoning. |
| **SR-4** | Profile store | **Reuse Sage Assent (ATL)**: feed `evaluated_actions` + the existing window-aggregator/grade-engine; add Sage Reflect-owned additive logs | Founder election 2 (reuse-where-possible); avoids re-implementing deterministic grade logic; preserves hysteresis. **Load-bearing.** |
| **SR-5** | Grade/proximity/dimension vocabulary | **Adopt Sage Assent canonical** (5-level grade; level≠direction; rolling action window) | Single source of truth; reconciles spec drift. |
| **SR-6** | Scoring engine | **Deterministic control flow + translation-sandwich (Sonnet Layer 1) for semantic scoring of Q1–Q4** | Founder election 4; AC1/KG2; Layer 2 keeps judgement deterministic + auditable. |
| **SR-7** | Fabrication defence | **FD-R1..R4, all deterministic**; FD-R3 mandatory; FD-R1 null-suspicion gates the profile update | R18d adversarial posture applied to the reflection layer. |
| **SR-8** | Mirror principle | **Mandatory `profile_update_framing.mandatory_note` on every output** | R19d; the output most likely to be read as a verdict. |
| **SR-9** | Crisis boundary | **Not a crisis pathway**; flag kathekon failure + developer note; no philosophical remediation of harm | R20a / Zone 3 boundary. |
| **SR-10** | Opening orientation | **Include the plain-language `opening_note`**; build at P3 | The consolidation-gap mechanism; the loop's philosophical core. |
| **SR-11** | Audience | **Agent-first** (`/api/practice/reflect`); human reflect surfaces migrate onto this substrate later | Founder election 3. |
| **SR-12** | Persistence / R17 | **Full session persistence + 90-day retention + genuine (hard) deletion + minimisation + app-level encryption for intimate fields**; mirrors the Sage Calling `discovery_sessions` posture | R17b/c/h/i; this is among the most intimate data the system holds. |
| **SR-13** | Kill switch + route name | **Global `SAGE_REFLECT_ENABLED` flag (off by default)**; route **`/api/practice/reflect` (LOCKED 2026-05-22)** | Matches the Sage Calling go-live discipline (503 until flipped). Route confirmed at lock; avoids collision with the human `/api/reflect` + `/api/mentor/private/reflect`. |
| **SR-14** | Authentication | **Reuse A10 `sr_atl_` credentials** (the Sage Assent credential), unscoped, as Sage Calling does | Coherent with the cycle; one credential across the agent's practice. |
| **SR-15** | Per-virtue-domain proximity (KP-03/04) | **Sage Reflect computes + stores per-domain proximity itself**; ATL stores aggregate only (confirmed by code read 2026-05-22) | Founder election at lock 2026-05-22, overriding the design's defer-to-ATL-enhancement recommendation. Gives KP-03/04 (unity-thesis weakest-link aggregation) a home now rather than waiting on an untimelined ATL enhancement. Known-risk: reconcile with any future native ATL per-domain field. |

> **SR-9 harm-flag carrier (canonical — confirmed 2026-05-23 under `D-TRACK-FOLLOWONS-A-BUILD-2026-05-23`, founder option (a)).** SR-9 (above) names the boundary's *behaviour*; the original lock did not name the exact *carrier field*. The canonical carrier is the **two-signal reading**: the R20a / Zone-3 boundary engages — records the contrary-*kathekon*, surfaces the developer note, and does **NOT** run the six-question sequence — when **either** of the following is present:
>
> 1. `safety_signal.harm_flagged === true` — the explicit boolean the upstream/developer sets at session close (the TR-03 "blocked act" path supplies this), **or**
> 2. any entry in `acts_blocked[]` whose `category === 'harm'` — i.e. Sage Assent blocked an act for a harm reason.
>
> This is **permissive by design**: more inputs trip the harm gate, never fewer — the conservative posture for a safety boundary. It matches the live implementation in `website/src/lib/sage-reflect/zone3-boundary.ts` (`checkZone3Boundary`, the `explicit || harmBlock` condition), so this confirmation is **governance-only — no code change**. It resolves the Stage B *Diagnostic-uncertain (symptom-level)* flag on the carrier field, now founder-acked under PR10. Narrowing the carrier to a single field (option (b)) or broadening it (option (c)) would be a change to a safety boundary → PR6 → Critical; neither was elected.

---

## R-rule engagement

- **R0 (oikeiosis):** the Q5/Q6 circle-and-need logic *is* the oikeiosis sequence; the product extends the agent's area of concern. The opening-note mechanism serves Circle 1 (founder practice) and Circle 3/4 (agents) simultaneously.
- **R3 (disclaimer):** every evaluative output carries the standard disclaimer.
- **R4 (IP):** outputs return *results*, never the scoring engine, the passion-classification logic, the grade thresholds, or Layer-internal text.
- **R5 (cost):** translation-sandwich Layer-1 calls are bounded per pass; cost the six-question pass against the 2x guardrail at build; emit cost-health signal.
- **R9 (no outcome promises):** Sage Reflect describes trajectory, never predicts results.
- **R10 (marketplace):** as a Sage Practice plugin product, complies with R1/R2/R3/R7/R9; preview must not expose implementation.
- **R17 (intimate data):** **a** (bulk-profiling prevention — only the subject agent's own session, gated by its own credential); **b** (app-level encryption for the intimate logs); **c/h/i** (retention limit + genuine deletion + minimisation); **e** (passion *profiling results* never exposed beyond the agent + developer relationship); **f** (the build is Critical — Critical Change Protocol applies).
- **R18 (honest certification):** **a** (Character Kernel category — Sage Reflect's outputs certify *observable reasoning patterns*, not worth/safety); **d** (adversarial — the FD mechanisms are the adversarial defence; "measures observable patterns, not inner states" stated in output).
- **R19 (honest positioning):** **d** (mirror principle — mandatory framing note).
- **R20 (active protection):** **a** (distress/Zone 3 boundary — Sage Reflect is not a crisis pathway; deterministic boundary check before any reflection on a harm-flagged session); **b** (independence — reflection is designed to reduce dependence over time, surfaced via the progress trajectory); **c** (human override supremacy — no grade output may be treated as grounds to override a human); **d** (relationship asymmetry — the mirror note reinforces self-examination not other-diagnosis).
- **PR1** (single-endpoint proof before rollout), **PR2** (build-to-wire verification immediate), **PR6** (safety-touching changes Critical), **KG1** (await all DB writes; no fire-and-forget; no self-calls — Sage Assent/substrate are direct imports), **KG7** (JSONB arrays written directly).

---

## Risk classification

- **This design session:** `governance` / **Standard** (documentation only; no code, no schema, no production change).
- **The eventual build:** **Critical** under 0d-ii — new authenticated public endpoint (AC7), R17 persistence of intimate introspective content, deployment-config flag, and an R20a/Zone-3 boundary check (PR6). Full Critical Change Protocol will apply at build. The build will follow the Sage Calling two-stage pattern: (Stage A) the deterministic engine + store + the additive logs + the Sage Assent feed — **incl. the additive `evaluated_actions` table migration (not yet created — it lives only in the DRAFT review schema; the live ATL runs the window in-memory) and the Sage-Reflect-owned per-domain proximity store (SR-15)** — (Elevated); then (Stage B) the authenticated, metered, kill-switched endpoint + the translation-sandwich scoring wiring + the adversarial suite (Critical).

---

## Build-priority sequence (from input spec §15, mapped to the project's staging)

- **P0 — Core sequence:** Q1–Q6 in order; deterministic branching at Q5/Q6; additive + the Sage-Assent-fed updates; exit-path determination; Sage Calling trigger payload.
- **P1 — Fabrication defence:** FD-R1..R4 (cross-session comparison; mandatory pressure-assent sub-question; Sage Assent calibration cross-check).
- **P2 — Progress tracking:** delegated to Sage Assent's grade-engine + window-aggregator (reconciled vocabulary; per-domain proximity is a Sage-Assent enhancement if not already present).
- **P3 — Opening orientation:** the `opening_note` + primary scrutiny domain / passion-to-watch / virtue-to-engage. Last to build, most significant in daily operation.
- **P4 — Mirror-principle output:** the mandatory framing note. Simple; included from P0 onward but listed late because it affects how output is *received*, not the sequence logic.

---

## Open items

**Resolved at lock (2026-05-22):**

- **Per-virtue-domain katorthoma proximity (KP-03/04, unity thesis) — RESOLVED.** Code read confirmed the ATL stores only an aggregate `typical_proximity` (no per-domain field): `trust-layer/types/accreditation.ts` (`AccreditationRecord`) + `supabase-agent-accreditation-migration.sql`. Founder election at lock: **Sage Reflect computes per-domain proximity itself** and stores it Sage-Reflect-side (SR-15) — *not* deferred to an ATL enhancement. Known-risk flagged for the Sage Assent enhancement/rename track.
- **`evaluated_actions` shape compatibility — RESOLVED (type level).** The live `EvaluatedAction` type (`website/src/lib/substrate/trust-layer/types/evaluation.ts`) carries `kathekon_quality`, `is_kathekon`, `proximity`, `passions_detected`, `virtue_domains_engaged`, and the oikeiosis fields — Sage Reflect's Q4 output maps onto it with **no type change**, and the aggregator `computeWindowSnapshot(actions: EvaluatedAction[])` is a pure function it can call directly. **Build-scope caveat:** the `evaluated_actions` *table* is not migrated (it exists only in DRAFT `trust-layer/schema/trust-layer-schema-REVIEW.sql`, marked DO NOT RUN; the live ATL runs the window in-memory from the wrapper's `CarriedProfile`). For Q4 records to persist + accumulate across sessions, **Stage A creates the `evaluated_actions` table** (additive migration). *Revisit: Stage A.*
- **Route name — RESOLVED (LOCKED).** `/api/practice/reflect` (SR-13); avoids collision with the human `/api/reflect` + `/api/mentor/private/reflect`.

**Carried forward under PR7:**

- **Human-surface migration:** the existing `/api/reflect` + `/api/mentor/private/reflect` migration onto this substrate is designed-for but deferred (election 3). *Revisit: K-category migration track.*
- **ATL→Sage Assent rename:** cross-cutting code/docs/registry track; not in scope here. The SR-15 per-domain known-risk reconciliation rides this track. *Revisit: dedicated rename session.*
- **Retention value (90 days):** inherits the Sage Calling default; confirm against the lawyer-engagement track.

---

## Cross-references

- `/inbox/reflect mentor input.rtf` — the source clinical-mode build specification.
- `/adopted/purpose-discovery-product-design.md` — Sage Calling design (the model for this doc; the preceding cycle stage).
- `/adopted/atl-a10-design.md`, `/adopted/atl-write-path-design.md`, `/adopted/atl-kathekon-aligned-alternative-design.md`, `/adopted/atl-items-1-3-design.md` — Sage Assent (ATL) design corpus.
- `trust-layer/` — Sage Assent (ATL) implementation: `accreditation/`, `evaluation-window/`, `grade-engine/`, `card/`, `progression-toolkit/`, `schema/`, `types/`.
- `website/supabase-agent-accreditation-migration.sql` (+ a10 / typical-kathekon-quality / typical-deliberation-breadth migrations) — the agent profile schema.
- `stoic-brain/` — `passions.json`, `action.json`, `scoring.json`, `progress.json`, `psychology.json` (the taxonomies Sage Reflect scores against).
- `/adopted/substrate-modes/` — the four Layer-3 modes incl. the Agent Trust Layer Wrapper.
- `/adopted/standing-protocol-cache.md`, `/adopted/build-sessions-protocol-cache.md` — session protocol + build-arc context.
- `manifest.md` — R0, R3, R4, R5, R9, R10, R17, R18, R19, R20; AC1, AC7; KG1, KG7.
- Decision-log: `D-SAGE-CALLING-STAGE2-LIVE-VERIFIED-2026-05-21` (the just-closed product); `D-SAGE-REFLECT-DESIGN-DRAFTED-2026-05-21` (this session); `D-SAGE-REFLECT-DESIGN-LOCKED-…` (pending founder lock).

---

*End of design. DRAFT — pending founder lock. On approval: move to `/adopted/`, append the design-lock decision-log entry, and the build follows the Sage Calling two-stage pattern (Elevated engine+store, then Critical endpoint).*
