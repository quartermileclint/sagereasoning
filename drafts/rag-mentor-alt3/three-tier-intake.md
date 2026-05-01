# Deliverable 13 — Three-Tier Intake Clarification Specification

**Status:** Drafted (under founder review).
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** AC-13 (three-tier intake clarification model — engine-level triggers and surface-level triggers, force / soft / deterministic-withhold tiers); AC-14 (withholding as deterministic kathekon — Tier 3 OPEN_DEFERRAL is a deterministic rule output, not a fallback); AC-15 (1b sub-option with structured intake — Tier 3 deferred questions resolve at the deferral-resolution surface). Incorporates D24 audit refinements (surface-specific trigger codes; engine-level vs surface-level distinction).

**Cross-references:**
- `/drafts/rag-mentor-alt3/canonical-framework.md` (D2 — the canonical mechanisms whose outputs the trigger logic reads)
- `/drafts/rag-mentor-alt3/passion-taxonomy.md` (D3 — the controlled vocabulary the engine consumes)
- `/drafts/rag-mentor-alt3/operationalised-rules.md` (D8 — the rules that produce the structured outputs the trigger logic reads)
- `/drafts/rag-mentor-alt3/rule-dependency-map.md` (D9 — the engine sequencing whose positions the tiers engage at)
- `/drafts/rag-mentor-alt3/layer-1-translation.md` (D10 — Tier 1 ELEMENT_FUSION fires from Layer 1)
- `/drafts/rag-mentor-alt3/layer-3-translation.md` (D11 — the prose surface the tiers' clarification stems engage)
- `/drafts/rag-mentor-alt3/long-deferred-questions.md` (D15 — the three principles for OPEN_DEFERRAL handling, to be drafted)
- `/drafts/rag-mentor-alt3/consumer-workflow-audit.md` (D24 — surface-specific trigger codes per route)
- `/drafts/rag-mentor-alt3/corpus-inventory.md` (D4 — focus-question stems catalogue, D-A16 promotion)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture)
- `/manifest.md` AC1, AC2 (safety latency budget — the distress check runs before any clarification tier engages), AC3 (Zone 2 domains — clarification engagement is calibration, not blockage), R6d, R7, R8, R20a (vulnerable-user redirection runs at the route, before clarification tiers)

---

## Plain-language summary

The deterministic engine sometimes cannot produce a confident output from the practitioner's input alone. The three-tier intake clarification model (AC-13) gives the engine three distinct ways to surface the gap rather than guessing:

- **Tier 1 (force).** The engine cannot proceed at all — usually because Layer 1 cannot extract structured features. The engine halts and asks a clarifying question. The practitioner's answer is required before evaluation continues.
- **Tier 2 (soft).** The engine can proceed but offers a clarifying question alongside the result. The practitioner can answer or decline; non-answer doesn't block scoring.
- **Tier 3 (deterministic withhold — OPEN_DEFERRAL).** The engine deterministically chooses not to assert a classification because asserting would require self-knowledge the practitioner has not yet provided. The withheld classification surfaces as an OPEN_DEFERRAL flag with a specific deferred question; the practitioner addresses it at the reflect endpoint when ready (per AC-15 1b structured intake).

The model is **calibration, not blockage** (per AC3 — Zone 2 enforcement posture). The engine is honest about what it can and cannot determine; the practitioner is given specific affordances to fill the gap when they are ready.

This deliverable specifies the trigger logic, the question text, the conversation flow, the OPEN_DEFERRAL data structure, and the surface-specific trigger refinements per the D24 audit.

## Glossary

- **Tier 1 (force)** — engine halts; clarification required before evaluation continues. Trigger fires from Layer 1 (ELEMENT_FUSION) or from rule positions 1–6 (structural ambiguity in inputs the rules cannot extract).
- **Tier 2 (soft)** — engine produces evaluation result and *also* surfaces a clarifying question. Practitioner can answer or decline.
- **Tier 3 (deterministic withhold)** — engine produces evaluation result with specific fields nulled; the nulled fields surface as OPEN_DEFERRAL flags. The practitioner addresses the flags at the reflect endpoint per AC-15 sub-option 1b.
- **OPEN_DEFERRAL** — a structured flag carrying: timestamp, deferred question text, the specific classification withheld, instance reference (the original instance the deferral attaches to), and status (`open` / `closed`).
- **Engine-level trigger** — a trigger condition that fires on any input regardless of the consumer surface. Engine-level triggers live in the engine and are consumed by all routes.
- **Surface-level trigger** — a trigger condition that fires only on specific consumer surfaces. Surface-level triggers live in per-consumer projection rules per D2 Tables 1–5 and D11.
- **Trigger code** — a stable identifier for a trigger condition. Used for diagnostics, logging, and analytics.
- **Clarification stem** — the question text Layer 3 surfaces to the practitioner. Per AC-10, stems come from the corpus catalogue (D4 Gap 1, D-A16 promotion); pre-promotion the stems are LLM-composed transitional.

## Engine-level vs surface-level triggers

The D24 audit identified that some triggers fire at the engine (regardless of which route called the engine) while others fire only on specific consumer surfaces. The distinction matters because engine-level triggers live in the engine's logic; surface-level triggers live in the per-consumer projection layer (Layer 3 + route-side wiring).

### Engine-level triggers (fire on any consumer)

These fire at canonical sequencing positions in D9 and produce engine-level diagnostic output:

| Trigger code | Tier | Fires at | Description |
|---|---|---|---|
| `ELEMENT_FUSION` | 1 | Layer 1 | Narrative cannot be decomposed into entities. |
| `SCOPE_AMBIGUITY` | 1 | Position 6 (Mechanism 6) | Action's target is unclear; oikeiosis_stage cannot map to a circle. |
| `TEMPORAL_AMBIGUITY` | 1 | Position 2 (Mechanism 2) | Temporal axis of the practitioner's concern is unclear; 2×2 matrix cannot place the entity. |
| `STATED_OPERATIVE_CONFLICT` | 2 | Position 6 (Mechanism 6) | Stated circle and operative circle differ; soft clarification offered. |
| `STATED_EQUANIMITY_UNVERIFIED` | 2 | Position 9 (Mechanism 9) | Practitioner reports calm where the narrative shows agitation; soft clarification offered. |
| `EUPATHEIA_BOUNDARY` | 3 | Position 10/12 (Mechanism 5 Pass-2 / Mechanism 10) | Eupatheia classification cannot be confirmed from the current instance; OPEN_DEFERRAL fires. |
| `PRAXIS_MOTIVATION_AMBIGUITY` | 3 | Position 12 (Mechanism 10) | Praxis-level motivation classification depends on self-report the practitioner has not provided; OPEN_DEFERRAL fires. |

These seven trigger codes form the **canonical engine-level catalogue**. They are consumed by every route via the engine's response shape.

### Surface-level triggers (per consumer)

The D24 audit identified surface-specific trigger codes that are layered on top of the engine-level catalogue. These fire at the consumer's projection layer (after the engine produces its output) or as Layer-1-side input-shape checks specific to the consumer's input fields.

| Trigger code | Tier | Consumer | Description |
|---|---|---|---|
| `OPTION_SCOPE_INCONSISTENCY` | 1 | `/api/score-decision` | Options describe actions at different oikeiosis circles; comparison may not be apples-to-apples. |
| `OPTION_FALSE_ALTERNATIVE` | 1 | `/api/score-decision` | Options are not genuine alternatives (could be combined; one is strict superset). |
| `STATED_PROCESS_INCONSISTENCY` | 2 | `/api/score-decision` | `process` field is provided but the option set itself reveals hasty elimination. |
| `DOCUMENT_OBJECT_AMBIGUITY` | 1 | `/api/score-document` | Document is ambiguous about author / audience (e.g., draft quotes external content extensively). |
| `DOCUMENT_PURPOSE_AMBIGUITY` | 1 | `/api/score-document` | Document purpose is unclear (personal letter / draft for publication / internal memo?). |
| `POLICY_INSTITUTIONAL_DISTANCE` | 2 | `/api/score-document` (policy mode) | Practitioner is evaluating an institutional document they did not author — second-person evaluation prohibition (R20d) becomes relevant. |
| `RESPONSE_AMBIGUITY` | 1 | `/api/score-scenario` | Response too short or vague to evaluate (under 20 chars; single-word). |
| `RESPONSE_SCENARIO_DRIFT` | 2 | `/api/score-scenario` | Response addresses something other than the scenario asked. |
| `POST_ELEMENT_FUSION` | 1 | `/api/score-social` | Post mixes multiple distinct claims or tones in a way that cannot be evaluated as a single artefact. |
| `POST_PURPOSE_AMBIGUITY` | 2 | `/api/score-social` | Platform context is unclear; soft clarification offered. |
| `REFLECTION_NARRATIVE_THIN` | 1 | `/api/reflect`, `/api/mentor/private/reflect` | `what_happened` is under 50 chars or describes only an event without reasoning context. |
| `RESPONSE_FIELD_INCONSISTENCY` | 1 | `/api/reflect`, `/api/mentor/private/reflect` | `how_i_responded` describes a response to a different event than `what_happened`. |

These twelve surface-level trigger codes are layered on top of the engine-level catalogue. The engine's main loop fires the engine-level triggers; the consumer's route or Layer 3 projection fires the surface-level triggers based on the consumer-specific input shape or consumer-specific output requirements.

The clean separation matters: Phase-2 build implements engine-level triggers in the engine itself (one implementation, reused across consumers); surface-level triggers in per-consumer modules (consumer-specific implementations, consumer-specific question text).

## Tier 1 (force) — full specification

Tier 1 fires when the engine cannot produce a useful evaluation without clarification. The engine halts; the practitioner is asked the question; the practitioner's answer augments the input; the engine restarts.

### Conversation flow

1. **Trigger fires.** A Tier 1 trigger condition is met at its sequencing position.
2. **Engine halts execution.** Subsequent positions do not run on this request.
3. **Engine returns a clarification request.** The response shape (per Layer 3 D11):
   ```
   {
     "clarification_required": true,
     "clarification_text": "<the question text>",
     "trigger_code": "<engine-level or surface-level code>",
     "intake_tier": 1,
     "evaluation_partial": null
   }
   ```
4. **Consumer surface presents the question.** The page-side caller (or agent caller) sees `clarification_required: true` and renders the question. The original input remains on the page; the practitioner can answer in a second field or in the same field with augmentation.
5. **Practitioner answers.** The augmented input (original + answer) is re-submitted to the route.
6. **Engine restarts at Position 1** with the augmented input. If `clarification_required: true` fires again (a different Tier 1 trigger), the cycle repeats. Per the loop guard implication in D9, the engine does not loop indefinitely on the same trigger — Layer 1's translation is structurally bounded and a clarified narrative either resolves the original trigger or surfaces a different trigger.
7. **If clarification resolves the trigger,** the engine proceeds normally and produces the full evaluation.

### Engine-level Tier 1 triggers (full text)

#### `ELEMENT_FUSION`

**Fires at:** Layer 1.

**Trigger condition:** Layer 1 cannot decompose the narrative into entities. The practitioner has fused multiple distinct concerns into a single phrase.

**Question stem (corpus catalogue per D-A16 — pre-promotion transitional):**

*"There are several distinct concerns here — [LIST_OF_FUSED_CONCERNS]. Before I work through this with you, can you tell me which one of these is most centrally on your mind right now?"*

**Slot fields:**
- `[LIST_OF_FUSED_CONCERNS]` — comma-separated list of the high-level concerns Layer 1 partially extracted before the fusion was detected.

**Worked example (per D10 Example F):**

Practitioner narrative: *"This whole thing with work and the family and what's been going on with my parents and the way the town meeting went — I'm just done."*

Question: *"There are several distinct concerns here — work, family, your parents, and the town meeting. Before I work through this with you, can you tell me which one of these is most centrally on your mind right now?"*

#### `SCOPE_AMBIGUITY`

**Fires at:** Position 6 (Mechanism 6 — `oikeiosis_stage`).

**Trigger condition:** The action's target cannot be mapped to a canonical circle. The narrative says "I responded to them" without specifying who they are.

**Question stem (corpus catalogue):**

*"Who else was affected by this, if anyone? And what role do they play in your life — colleague, family member, someone you don't know well?"*

**Slot fields:** none. The stem is fully canonical.

**Worked example:**

Practitioner narrative: *"I responded to them in a way that didn't sit right after."*

The narrative names the action and the practitioner's discomfort but does not identify who "them" refers to. SCOPE_AMBIGUITY fires; Mechanism 6 cannot proceed; Tier 1 question surfaces.

#### `TEMPORAL_AMBIGUITY`

**Fires at:** Position 2 (Mechanism 2 — `passion_root_detection`).

**Trigger condition:** The temporal axis of the practitioner's concern cannot be determined. Is the concern about something that already happened, or something they're worried might happen?

**Question stem (corpus catalogue):**

*"When you think about this situation right now, are you more concerned about something that's already happened, or something you're worried might happen?"*

**Slot fields:** none. The stem is fully canonical (the "this situation" reference is to the practitioner's own narrative).

**Worked example:**

Practitioner narrative: *"I keep coming back to that conversation."*

The narrative is past-referent ("that conversation") but the practitioner's continued concern could be present-oriented (regret about what already happened) or future-oriented (worry about how it affects future interactions). Mechanism 2 cannot place the entity on the 2×2 matrix without disambiguation.

### Surface-level Tier 1 triggers

#### `OPTION_SCOPE_INCONSISTENCY` (`/api/score-decision`)

**Trigger condition:** Mechanism 6 produces a different `primary_circle` for different options.

**Question stem (alt-3 derived; D-A16 candidate for promotion):**

*"These two options affect different people in your life — option 1 is mostly about [CIRCLE_OPTION_1], and option 2 is mostly about [CIRCLE_OPTION_2]. Are you choosing between two genuinely different paths, or do you want to focus on one circle?"*

**Slot fields:**
- `[CIRCLE_OPTION_1]` — the circle name from Mechanism 6's output for option 1 (e.g., "self / your reputation," "family," "the team").
- `[CIRCLE_OPTION_2]` — the circle name from Mechanism 6's output for option 2.

#### `OPTION_FALSE_ALTERNATIVE` (`/api/score-decision`)

**Trigger condition:** Layer 1 detects that the options are not genuine alternatives — they could be combined, or one is a strict superset of another.

**Question stem (alt-3 derived):**

*"Option [A] and option [B] don't seem to be genuine alternatives — they could be combined (or one includes the other). Do you want me to evaluate them as written, or would you like to refine the option set first?"*

**Slot fields:**
- `[A]`, `[B]` — option labels (1 / 2 / 3 / 4 / 5).

#### `DOCUMENT_OBJECT_AMBIGUITY` (`/api/score-document`)

**Trigger condition:** Layer 1 detects that the document mixes authorial content with quoted / co-authored content extensively.

**Question stem (alt-3 derived):**

*"Are you the sole author of this document, or is some of the content quoted or co-authored? If quoted, do you want the evaluation to focus on your authorial parts only?"*

#### `DOCUMENT_PURPOSE_AMBIGUITY` (`/api/score-document`)

**Trigger condition:** Layer 1 detects that the document's purpose / audience is not identifiable from the text.

**Question stem (alt-3 derived):**

*"What is this document for, and who is it written to?"*

#### `RESPONSE_AMBIGUITY` (`/api/score-scenario`)

**Trigger condition:** Layer 1 detects that the response is too short or vague to evaluate (under 20 characters; single-word answers).

**Question stem (alt-3 derived):**

*"Can you say a bit more about how you would respond and why?"*

#### `POST_ELEMENT_FUSION` (`/api/score-social`)

**Trigger condition:** Layer 1 detects that the post mixes multiple distinct claims or tones (a thread-of-thoughts pasted as one block).

**Question stem (alt-3 derived):**

*"This post seems to mix several distinct points. Do you want me to evaluate it as a single artefact, or would you like to focus on one of the points first?"*

#### `REFLECTION_NARRATIVE_THIN` (`/api/reflect`, `/api/mentor/private/reflect`)

**Trigger condition:** Layer 1 detects that `what_happened` is under 50 characters or describes only an event without reasoning context.

**Question stem (alt-3 derived):**

*"Can you say a bit more about what happened, and what you noticed in your own response to it?"*

#### `RESPONSE_FIELD_INCONSISTENCY` (`/api/reflect`, `/api/mentor/private/reflect` — evening flow)

**Trigger condition:** Layer 1 detects that `how_i_responded` describes a response to a different event than `what_happened`.

**Question stem (alt-3 derived):**

*"Your response describes [INFERRED_EVENT_FROM_RESPONSE], but the situation you described is [WHAT_HAPPENED_SUMMARY]. Can you tell me which one of these you want me to focus on?"*

**Slot fields:**
- `[INFERRED_EVENT_FROM_RESPONSE]` — Layer 1's identification of the event implicit in `how_i_responded`.
- `[WHAT_HAPPENED_SUMMARY]` — Layer 1's summary of the explicit `what_happened` content.

## Tier 2 (soft) — full specification

Tier 2 fires when the engine can proceed but observes a structural condition that, if clarified, would refine the evaluation. The evaluation runs to completion; the soft question is appended to the response.

### Conversation flow

1. **Engine completes its sequencing** and produces the full evaluation.
2. **Tier 2 trigger fires** at one of the canonical positions or in the surface projection.
3. **Engine appends the soft clarification to its output.** The response shape:
   ```
   {
     "evaluation": { <full Layer 3 output per consumer schema> },
     "soft_clarification": {
       "clarification_text": "<the question text>",
       "trigger_code": "<engine-level or surface-level code>",
       "intake_tier": 2,
       "scope_of_change": "<the field(s) that would change if the practitioner answers>"
     }
   }
   ```
4. **Consumer surface presents both.** The full evaluation is rendered. The soft question is rendered alongside (e.g., as a coda paragraph or a "want to refine?" affordance).
5. **Practitioner answers or declines.** If they answer, the augmented input is re-submitted; the engine produces a refined evaluation. If they decline (or ignore), the original evaluation stands.

### Engine-level Tier 2 triggers (full text)

#### `STATED_OPERATIVE_CONFLICT`

**Fires at:** Position 6 (Mechanism 6 — `oikeiosis_stage`) when `oikeiosis_contraction: true`.

**Trigger condition:** The narrative's stated circle differs from the operative circle. The practitioner says "I'm doing this for the community" but the narrative reveals the operative concern is reputation (Circle 1). Per Validation Addendum Adjustment 3, Rule 7's obligation classification uses the operative circle; the practitioner may want to verify the engine's identification of the operative concern.

**Question stem (corpus catalogue):**

*"You mentioned being concerned about [STATED_CIRCLE_TARGET]. I want to check something with you — when you imagine [SITUATION] going badly, what's the thing you're most worried about for yourself?"*

**Slot fields:**
- `[STATED_CIRCLE_TARGET]` — the practitioner's stated concern (e.g., "the team," "the community," "your daughter").
- `[SITUATION]` — the situation Layer 1 identified as the action's primary referent.

#### `STATED_EQUANIMITY_UNVERIFIED`

**Fires at:** Position 9 (Mechanism 9 — `virtue_domain_engaged`) when the practitioner's narrative claims calm but Mechanisms 2, 3 detected passion-shaped reasoning.

**Trigger condition:** The narrative says "I felt fine about it" but the structural features (Layer 1 axes, Mechanism 2 detection) suggest a passion was operative. The engine cannot determine from the current instance alone whether the practitioner's reported calm is genuine eupatheia (chara / boulesis / eulabeia) or a polished surface over passion.

**Question stem (corpus catalogue):**

*"Has there been a recent time when something similar went the other way — when the outcome you hoped for didn't arrive — and you noticed how you actually felt, not how you thought you should feel?"*

**Slot fields:** none. The stem is fully canonical (it asks the practitioner to recall their own historical pattern).

### Surface-level Tier 2 triggers

#### `STATED_PROCESS_INCONSISTENCY` (`/api/score-decision`)

**Trigger condition:** `process` field is provided but the option set itself reveals hasty elimination.

**Question stem (alt-3 derived):**

*"You described your process for arriving at these options, and the process sounds [PROCESS_QUALITY_ASSESSMENT] — but the option set itself feels [OBSERVATION]. Want to consider whether more options were available?"*

**Slot fields:**
- `[PROCESS_QUALITY_ASSESSMENT]` — Mechanism 7's process_quality output.
- `[OBSERVATION]` — Layer 3 prose translation of the inconsistency observation.

#### `POLICY_INSTITUTIONAL_DISTANCE` (`/api/score-document` policy mode)

**Trigger condition:** The practitioner is evaluating an institutional document they did not author.

**Question stem (alt-3 derived, per D24 audit Refinement 2):**

*"This document was written by [you / your organisation / a third party]. The Stoic evaluation works best when you are evaluating your own authorial reasoning. Do you want to focus on what you would change if you were the author, or on understanding what reasoning is operative in the document as written?"*

**Slot fields:**
- `[you / your organisation / a third party]` — Layer 1 identifies authorial-distance from the input metadata or the document's own framing.

#### `RESPONSE_SCENARIO_DRIFT` (`/api/score-scenario`)

**Trigger condition:** Practitioner's response addresses something other than the scenario asked.

**Question stem (alt-3 derived):**

*"Your response touches on [ADJACENT_TOPIC] more than on [SCENARIO_CORE_QUESTION]. Do you want me to evaluate the response as written, or would you like to focus more directly on [SCENARIO_CORE_QUESTION]?"*

#### `POST_PURPOSE_AMBIGUITY` (`/api/score-social`)

**Trigger condition:** Platform context is unclear (general / Twitter / LinkedIn / email — practitioner picked "general" but the post could fit any).

**Question stem (alt-3 derived):**

*"You picked 'general' as the platform. The post could fit a tweet, an email, or an internal Slack message. Do you want me to evaluate it generically, or for a specific platform?"*

## Tier 3 (deterministic withhold — OPEN_DEFERRAL) — full specification

Tier 3 is the architectural commitment that **withholding is the right action when the practitioner is best served by sitting with the question** (per AC-14). The engine deterministically chooses not to assert a classification because the classification depends on self-knowledge the practitioner has not yet provided. The withheld classification surfaces as an OPEN_DEFERRAL flag with a specific deferred question; the practitioner addresses it at the reflect endpoint per AC-15 1b structured intake.

### Conversation flow

1. **Engine completes its sequencing** with one or more affected fields nulled.
2. **Tier 3 trigger fires** at one of the canonical positions (Mechanism 5 Pass-2 or Mechanism 10).
3. **Engine adds OPEN_DEFERRAL to its output.** The response shape:
   ```
   {
     "evaluation": { <Layer 3 output with affected fields null> },
     "open_deferrals": [
       {
         "open_deferral_id": "<unique identifier>",
         "trigger_code": "EUPATHEIA_BOUNDARY | PRAXIS_MOTIVATION_AMBIGUITY",
         "intake_tier": 3,
         "withheld_classification": "<the field that was nulled>",
         "deferred_question": "<the question the practitioner addresses at the reflect endpoint>",
         "instance_reference": "<the original instance ID>",
         "timestamp": "<creation time>",
         "status": "open"
       },
       ...
     ]
   }
   ```
4. **Consumer surface renders the partial evaluation and the deferral flag.** The evaluation is shown with the affected fields explicitly named as deferred ("classification withheld pending reflection — see your scoring record").
5. **OPEN_DEFERRAL persists in the practitioner's scoring record.** Visible in the record as an open flag with the timestamp and the deferred question.
6. **The deferral resolves at the reflect endpoint** (D14b — deferral-resolution surface). The practitioner sees the specific question; submits reflection; the engine processes the reflection through the same Tier 1/2/3 logic; if Tier 3 fires again on the reflection, deferral re-cascades. On successful resolution, the original instance's score is updated retrospectively and the OPEN_DEFERRAL flag closes.

### Engine-level Tier 3 triggers (full text)

#### `EUPATHEIA_BOUNDARY`

**Fires at:** Position 10 (Mechanism 5 Pass-2) and Position 12 (Mechanism 10).

**Trigger condition:** Mechanism 2's `eupatheia_candidate` flag fired (the narrative shows a chara-shape, boulesis-shape, or eulabeia-shape pattern that *could* be eupatheia or could be polished surface over passion). The engine cannot confirm from the current instance alone — confirmation requires longitudinal evidence (per AC-17 `CONFIDENCE_WEIGHTED`).

**Withheld classification:** Mechanism 5's `correct_judgement` for the candidate eupatheia (Mechanism 5 cannot confirm whether the narrative is enacting the correct judgement or merely describing it).

**Deferred question:**

*"You described responding with [EUPATHEIA_SHAPE — chara / boulesis / eulabeia]. Across [TIME_WINDOW — recent days/weeks/months], when [SITUATIONAL_TRIGGER] arose in this domain — was your inner state actually [EUPATHEIA_DESCRIPTION], or was it more like [PASSION_COUNTERPART_DESCRIPTION]?"*

**Slot fields:**
- `[EUPATHEIA_SHAPE]` — chara / boulesis / eulabeia from Mechanism 2's `eupatheia_candidate`.
- `[TIME_WINDOW]` — derived from the practitioner's longitudinal record (default last 30 days).
- `[SITUATIONAL_TRIGGER]` — the trigger entity from Layer 1's output.
- `[EUPATHEIA_DESCRIPTION]`, `[PASSION_COUNTERPART_DESCRIPTION]` — D3 canonical descriptions of the eupatheia and its passion counterpart.

#### `PRAXIS_MOTIVATION_AMBIGUITY`

**Fires at:** Position 12 (Mechanism 10).

**Trigger condition:** Mechanism 10's directional modifier or proximity_risk_flag depends on the practitioner's motivation classification, but Mechanism 5's `refinement_source` is `DERIVED` (no profile prior) and the narrative does not directly state motivation. The classification depends on self-report the practitioner has not provided.

**Withheld classification:** Mechanism 10's `direction` field (improving / stable / declining) and any `proximity_risk_flag` that requires motivation data (specifically `CONVENTION_SUBSTITUTION` — the engine cannot tell whether the practitioner is acting from convention rather than understanding without motivation data).

**Deferred question:**

*"In this instance, the action looked like [SURFACE_PATTERN — proximity level]. The engine cannot tell from the current instance alone whether you acted from [VIRTUE_DESCRIPTION — phronesis / temperance / etc.] or from [CONVENTION_DESCRIPTION — habit / convention / what's expected]. When you reflect on what was operative for you in that moment, what do you find?"*

**Slot fields:**
- `[SURFACE_PATTERN]` — Mechanism 10's `proximity_level` with English label.
- `[VIRTUE_DESCRIPTION]` — Mechanism 9's strongest virtue rating with description.
- `[CONVENTION_DESCRIPTION]` — D8 Rule 10's `proximity_risk_flag: CONVENTION_SUBSTITUTION` description.

## OPEN_DEFERRAL data structure

OPEN_DEFERRAL flags are first-class entries in the practitioner's scoring record. The full structure:

```
{
  "open_deferral_id": "<UUID — stable across the deferral lifecycle>",
  "user_id": "<the practitioner>",
  "instance_id": "<the original instance the deferral attached to>",
  "trigger_code": "EUPATHEIA_BOUNDARY | PRAXIS_MOTIVATION_AMBIGUITY",
  "intake_tier": 3,
  "withheld_classification": {
    "field_path": "<the path of the nulled field in the original evaluation, e.g., 'mechanism_10.direction'>",
    "withheld_at_position": "<sequencing position the trigger fired at>",
    "reason": "<plain-language explanation of why the engine withheld>"
  },
  "deferred_question": {
    "stem_id": "<from D-A16 catalogue when promoted; null pre-promotion>",
    "stem_text": "<the slot-filled question text>",
    "slot_fills": { "<variable_name>": "<value>", ... }
  },
  "created_at": "<timestamp>",
  "status": "open" | "closed",
  "resolved_at": "<timestamp — null while open>",
  "resolution_reflection_id": "<reference to the reflection that resolved the deferral; null while open>",
  "retrospective_update": {
    "updated_classification": "<the value that replaced the nulled field after resolution>",
    "confidence_weighted": "low | medium | high"
  }
}
```

The flag is visible in the scoring record (per AC-16 — *"OPEN_DEFERRAL flags visible in scoring record"*) but **not as a celebratory artefact**. The practitioner can navigate to their record and see open deferrals; the deferrals do not surface elsewhere on the conversation surface (per AC-16 — *"engine doesn't nag"*).

## Timestamping logic

Each OPEN_DEFERRAL carries a `created_at` timestamp set at the moment the trigger fires. The timestamp serves three purposes:

1. **Long-deferred-questions detection (D15 — Principle 3).** The mentor names the pattern at the next natural opportunity *only if a deferred question has been open for some defined window*. The window definition lives in D15.
2. **Confidence weighting in retrospective update.** When the practitioner resolves a long-open deferral (e.g., 60+ days after creation), the `retrospective_update.confidence_weighted` may be lower because the practitioner's recall of the original instance has degraded. AC-17's CONFIDENCE_WEIGHTED flag projects this.
3. **Audit trail.** R0 (oikeiosis principle) operationalisation in P5 will use the open-deferral history as part of the audit trail.

`resolved_at` is set when the OPEN_DEFERRAL closes. The duration `resolved_at - created_at` is a longitudinal signal that Mechanism 10's progressor-population calibration can read.

## Interaction with the engine sequencing (per D9)

The trigger logic engages the engine's sequencing at specific positions:

- **Position 0 (Layer 1):** ELEMENT_FUSION fires. Engine halts.
- **Position 2 (Mechanism 2):** TEMPORAL_AMBIGUITY may fire; engine halts. `eupatheia_candidate` flag may set, but EUPATHEIA_BOUNDARY does not fire here — the actual EUPATHEIA_BOUNDARY trigger fires later at Position 10/12.
- **Position 6 (Mechanism 6):** SCOPE_AMBIGUITY may fire; engine halts. STATED_OPERATIVE_CONFLICT may fire; engine continues with soft clarification appended at Layer 3.
- **Position 9 (Mechanism 9):** STATED_EQUANIMITY_UNVERIFIED may fire; engine continues with soft clarification appended at Layer 3.
- **Position 10 (Mechanism 5 Pass-2):** EUPATHEIA_BOUNDARY may fire (Mechanism 5 Pass-2 cannot fill `correct_judgement` because Mechanism 2's `eupatheia_candidate` is unconfirmed); OPEN_DEFERRAL is added to engine output.
- **Position 12 (Mechanism 10):** EUPATHEIA_BOUNDARY (continued — affecting Mechanism 10's `senecan_grade` and `direction`) and PRAXIS_MOTIVATION_AMBIGUITY may fire. Each adds an OPEN_DEFERRAL entry.

Surface-level triggers fire either:
- **Pre-engine** (Layer 1 input shape checks for specific consumer fields — e.g., `RESPONSE_AMBIGUITY` for `/api/score-scenario` runs before Layer 1's main translation).
- **Post-engine** (Layer 3 projection-time checks — e.g., `OPTION_SCOPE_INCONSISTENCY` reads Mechanism 6's per-option outputs after the engine completes for each option).

## R6 / R7 / R8 / R20a compliance

- **R6d (passions diagnostic, not punitive):** Tier 3 OPEN_DEFERRAL is the architectural implementation. The engine declines to assert a classification rather than asserting falsely. The deferral is diagnostic — it names the gap; it does not punish.
- **R7 (source fidelity):** the question stems trace to the corpus (post-D-A16 promotion). Pre-promotion stems are alt-3 derived and explicitly flagged as such in the catalogue.
- **R8a (strict glossary):** trigger codes use canonical naming; OPEN_DEFERRAL data structure uses Greek IDs in `withheld_classification.field_path`.
- **R8c (website / user-facing):** clarification stems use English-only on user-facing surfaces (R8c).
- **R8d (skill contracts — agent-facing):** the trigger codes and OPEN_DEFERRAL structure are part of the agent-facing API contract; English outcome-focused descriptions accompany.
- **R20a (vulnerable-user redirection):** AC-13's clarification engagement is *calibration*, not redirection. R20a's redirection runs at the route, before Layer 1, before any clarification tier. AC3 names this clearly: Zone 2 inputs engage Layer 1 / clarification tiers as working material; only Zone 3 (acute distress detected by the two-stage classifier) triggers redirection. The clarification stems above are written to engage the practitioner respectfully — they ask for self-knowledge rather than performing distress detection.

## Cleanliness rating

The trigger logic is **HIGH cleanliness** — each trigger has a deterministic firing condition based on rule outputs.

The question stems are **HIGH cleanliness** post-D-A16 (catalogue is canonical; only slot-fill is LLM-composed within bounded constraint). Pre-D-A16 transitional stems are **PARTIAL** — alt-3 derived, structurally bounded, but not source-derived.

The OPEN_DEFERRAL data structure is **HIGH cleanliness** — fully specified shape with canonical field names.

The interaction with the engine sequencing is **HIGH** — each trigger has a fixed sequencing position.

## Honest disclosure

The pre-D-A16 transitional state means several question stems are alt-3 derived rather than source-derived. The catalogue's promotion (D4 Gap 1) is a Phase-2 build precondition. Pre-promotion, the deliverable preserves the canonical patterns from the alt-3 handoff for engine-level triggers (`ELEMENT_FUSION`, `SCOPE_AMBIGUITY`, `TEMPORAL_AMBIGUITY`, `STATED_OPERATIVE_CONFLICT`, `STATED_EQUANIMITY_UNVERIFIED`) and produces alt-3 derived stems for surface-level triggers identified by D24.

The clarification engagement is calibration per AC3. R20a redirection is a separate, prior gate. This deliverable does not specify R20a behaviour; it specifies how the engine engages the practitioner *after* R20a has confirmed the input is not Zone 3 acute distress.

## Open questions

1. **Should Tier 3 OPEN_DEFERRAL fire on every borderline case, or with a threshold?** Today's specification fires on any narrative that triggers `eupatheia_candidate` or `PRAXIS_MOTIVATION_AMBIGUITY` without profile prior. If Phase-2 production surfaces too many deferrals (the practitioner is overwhelmed by open questions), a threshold may be needed. The current default is "fire on any case" — honest acknowledgement of the gap.
2. **Should Tier 2 soft questions be rate-limited per session?** A practitioner who asks the engine three things in quick succession may be served three Tier 2 questions, which can feel cluttering. Rate-limiting (one Tier 2 per session, or per consumer) may improve experience. Logged for Phase-2 observation.
3. **Should the surface-level trigger catalogue grow as new consumers are added?** New routes (e.g., a future `/api/score-conflict` for relationship-decision evaluations) would surface their own surface-level triggers. The architecture supports this — the engine-level catalogue is closed; the surface-level catalogue grows per consumer. Phase 2 documents the pattern as part of consumer onboarding.

## Approval gate

This deliverable is consumed by Phase-2 build (the engine's trigger logic and the per-consumer projection layers). Approval is part of the same batch as the other Phase-1 session 2 deliverables (Standard risk under 0d-ii). Move from `/drafts/rag-mentor-alt3/` to `/adopted/` is Elevated risk.

---

*End of Deliverable 13.*
