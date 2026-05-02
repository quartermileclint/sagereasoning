# Deliverable 16 — Score-in-Reply Design

**Status:** Drafted (under founder review).
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** AC-9 (score in the conversation reply — structured score fields + narrative prose); AC-11 (proximity ring data contract wired in Phase 1; UI render in Phase 2); AC-12 (translation-sandwich — the score fields and the narrative both originate from the deterministic engine; Claude only paraphrases); R8a (structured fields use Greek IDs); R8c (user-facing prose uses English labels); R20d (relationship asymmetry — first-person framing on the conversation surface).

**Cross-references:**
- `/adopted/rag-mentor-alt3/canonical-framework.md` (D2 — the canonical engine output the conversation surface projects from; Tables 1 + 2 for the conversation surface)
- `/adopted/rag-mentor-alt3/passion-taxonomy.md` (D3 — the controlled vocabulary in the structured score fields)
- `/adopted/rag-mentor-alt3/operationalised-rules.md` (D8 — the Mechanism 10 outputs that populate the proximity ring data contract)
- `/drafts/rag-mentor-alt3/layer-3-translation.md` (D11 — the prose paraphrase rules that populate the narrative half of the response)
- `/drafts/rag-mentor-alt3/strict-prompting.md` (D12 — the prompt template that produces the response)
- `/drafts/rag-mentor-alt3/reflect-endpoint-14a-daily-ritual.md` (D14a — different-shape projection that consumes the same canonical engine output)
- `/drafts/rag-mentor-alt3/progression-delta.md` (D17 — the longitudinal signals that surface in the score fields)
- `/drafts/rag-mentor-alt3/residual-seams.md` (D19 — AC-17 flags surface in the structured fields and in the prose)
- `/drafts/rag-mentor-alt3/consumer-workflow-audit.md` (D24 — the existing conversation-surface response shape this design preserves and extends)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture)
- `/manifest.md` AC1, AC4, R8a, R8c, R20d
- `/website/src/app/api/founder/hub/route.ts` (the existing mentor pipeline shape — read-only reference for the conversation-surface response envelope)
- `/website/src/app/private-mentor/page.tsx` (the conversation surface page — read-only reference for the rendering shape)

---

## Plain-language summary

The conversation surface is the practitioner's main back-and-forth dialogue with the mentor at `/private-mentor`. Today the mentor's reply is a single block of prose. Under alt-3, every reply on the conversation surface includes both **structured score fields** (the proximity, the passions, the virtue, the kathekon — explicit data that the proximity ring widget and the practitioner's profile consume) and **narrative prose** (the conversational reply the practitioner reads). Both originate from the deterministic engine's canonical output; Claude paraphrases the prose and the route projects the structured fields directly from the engine output.

This deliverable specifies the **conversation-surface response payload shape**: which structured fields appear, how they map to the canonical engine output, the **proximity ring data contract** per AC-11 (the structured fields the proximity ring widget consumes; UI render in Phase 2), and how the score fields coexist with the narrative prose in the response envelope.

The deliverable preserves the existing mentor-pipeline response shape on `/api/founder/hub` (today's conversation surface for the founder) so that Phase-2 pass 3 (conversation-surface migration per AC-7) is a substitution rather than a redesign — the response envelope's structural fields are populated from the canonical engine output instead of from Claude's compositional reasoning.

## Glossary

- **Conversation surface** — the back-and-forth dialogue at `/private-mentor`. Distinct from the daily-reflection ritual surface (D14a) and the deferral-resolution surface (D14b).
- **Score-in-reply** — the architectural commitment that the conversation reply carries both a score (structured) and narrative (prose). Per AC-9.
- **Structured score fields** — the typed fields in the response envelope (proximity_level, passions_detected[], virtue_engagement[], etc.) that machines / widgets / agents consume directly.
- **Narrative prose** — the human-readable mentor reply (philosophical_reflection, sage_perspective). Layer 3 paraphrases the structured fields into prose.
- **Proximity ring** — the visual widget on the practitioner's surface showing proximity progression over time. Per AC-11, the data contract is wired in Phase 1; the UI renders in Phase 2.
- **Response envelope** — the JSON shape returned to the page/agent caller. Includes the structured score fields, the narrative prose, the AC-17 flags, the open_deferrals_referenced[] (per D15 Principle 3), and the canonical disclaimer (R3).

## The conversation-surface response payload

The full shape returned by the conversation route (`/api/founder/hub` today; future split between founder-hub and a private-mentor-specific route per Phase-2 pass-3 sequencing):

```typescript
interface ConversationReplyResponse {
  // The narrative — what the practitioner reads as the mentor's reply
  narrative: {
    philosophical_reflection: string;       // paragraph composing M1, M2/3, M5, M6/7, M9 outputs
    improvement_path: string;                // paragraph from M5 dominant_false_judgement + correct_judgement
    oikeiosis_context?: string;              // paragraph from M6, M7 outputs (when relevant)
    open_deferral_observation?: string;      // single sentence per D15 Principle 3 (when domain-match fires)
    disclaimer: string;                      // R3 canonical
  };

  // The structured score fields — what the proximity ring + practitioner profile consume
  score: {
    katorthoma_proximity: ProximityLevel;    // M10 — 'reflexive' | 'habitual' | 'deliberate' | 'principled' | 'sage_like'
    proximity_label: string;                 // R8c English label (e.g., "Approaching the principled level")
    weakest_dimension: WeakestDimension;     // M10 — 'control' | 'passion' | 'obligation' | 'virtue'
    direction: Direction;                    // M10 — 'improving' | 'stable' | 'declining'
    senecan_grade: SenecanGrade;             // M10 — 'pre_progress' | 'grade_3' | 'grade_2' | 'grade_1' | 'sage'
    proximity_risk_flag: ProximityRiskFlag | null;  // M10 — see D8 Rule 10
    profile_tension_flag: boolean;           // M10
    passions_detected: PassionEntry[];        // M2 + M3 + M5 — full structure
    virtue_engagement: VirtueEntry[];        // M9 — per-virtue ratings
    kathekon_assessment: KathekonAssessment;  // composite from M7 + M9 (Layer 3 derives)
    indifferents_at_stake: IndifferentEntry[]; // M8
    obligation_status: ObligationStatus[];    // M7
  };

  // The proximity-ring-specific contract — wired in Phase 1, UI renders in Phase 2
  proximity_ring_data: ProximityRingDataContract;

  // AC-17 residual seams — both structured (for agents / widgets) and surfaced in narrative (for prose readers)
  ac_17: {
    self_report_dependent: boolean;          // M10 / D19
    confidence_weighted: 'low' | 'medium' | 'high';  // M10 / D19
  };

  // The deferral domain-match per D15 Principle 3 — surfaced when domain match fires
  open_deferrals_referenced: OpenDeferralReference[];

  // Engine diagnostics — visible to the founder for debugging; not user-facing
  engine_diagnostics: EngineDiagnostics;
}

interface PassionEntry {
  root_passion: string;                       // R8a Greek ID
  sub_species: string;                        // R8a Greek ID
  false_judgement: {
    object_inflated_or_deflated: string;      // narrative phrasing
    judgement_type: 'INFLATION' | 'DEFLATION' | 'INVERSE_DEFLATION';
    correct_judgement: string;                // Pass-2 enriched
    refinement_source: 'PROFILE' | 'DERIVED';
  };
  causal_stage: 'phantasia' | 'synkatathesis' | 'horme' | 'praxis';  // M4
  intensity?: 'mild' | 'moderate' | 'strong'; // when the engine assigns intensity
}

interface VirtueEntry {
  virtue: 'phronesis' | 'andreia' | 'sophrosyne' | 'dikaiosyne';     // R8a Greek IDs
  rating: 'strong' | 'adequate' | 'weak' | 'absent';
  evidence: string;                           // narrative excerpt or Layer 3 prose translation
}

interface KathekonAssessment {
  is_kathekon: boolean;
  quality: 'strong' | 'moderate' | 'marginal' | 'contrary' | null;
  justification: string;                       // Layer 3 paraphrase of M7 + M9 composite
}

interface IndifferentEntry {
  indifferent_id: string;                     // from value.json
  axia_class: string;                         // 'high' | 'moderate' | etc.
  treatment: 'correctly_indifferent' | 'inflation' | 'deflation' | 'inverse_deflation';
  evidence: string;
}

interface ObligationStatus {
  circle_id: 1 | 2 | 3 | 4 | 5;
  is_met: boolean | null;
  cicero_q1_passed: boolean;
  conflict_resolution?: string;
}

type ProximityLevel = 'reflexive' | 'habitual' | 'deliberate' | 'principled' | 'sage_like';
type WeakestDimension = 'control' | 'passion' | 'obligation' | 'virtue';
type Direction = 'improving' | 'stable' | 'declining';
type SenecanGrade = 'pre_progress' | 'grade_3' | 'grade_2' | 'grade_1' | 'sage';
type ProximityRiskFlag = 'PASSION_DOMINANCE' | 'CONVENTION_SUBSTITUTION' | 'TECHNIQUE_SUBSTITUTION' | 'STABILITY_TEST' | 'THEORETICAL_ONLY';
```

### Why both structured and narrative

The conversation surface needs both shapes for two reasons:

1. **The practitioner reads the prose.** The narrative is the meaningful artefact the practitioner engages with — a paragraph naming what was operative in their reasoning, an improvement path, a kathekon assessment. The prose carries the relational meaning of the evaluation.
2. **The proximity ring widget and the practitioner profile consume the structure.** The proximity ring needs `katorthoma_proximity`, `direction`, `senecan_grade` as machine-readable fields. The practitioner profile updates from `passions_detected[]`, `virtue_engagement[]`, `indifferents_at_stake[]`. The structured fields are the canonical data the widgets and profile read.

Returning both in one response envelope means the conversation surface is the one place the engine's full output flows — the practitioner sees the prose; the widgets see the structure; the profile updates from the structure. Today's `/api/founder/hub` already returns a similar shape (mentor reply prose alongside `recommended_action` and `observation` structured fields); alt-3 expands the structured-field set to include the canonical engine output's full M10 + per-mechanism content.

## The mapping — canonical engine output → response envelope

Per D2 Tables 1 + 2, the conversation surface projects through the standard / deep mapping. The fields fill as follows:

| Response envelope field | Source (canonical engine) | Layer 3 projection role |
|---|---|---|
| `narrative.philosophical_reflection` | M1, M2/3, M5, M6/7, M9 outputs composed into prose | Paraphrase per D11 inclusion rules; per D12 prompt template |
| `narrative.improvement_path` | M5 `dominant_false_judgement` Pass-2 enriched | Paraphrase per D11 |
| `narrative.oikeiosis_context` | M6, M7 outputs (when `oikeiosis_contraction` or `circle_conflict` fired) | Paraphrase per D11 |
| `narrative.open_deferral_observation` | Domain-match from D15 Principle 3 | Slot-fill from corpus stem (or alt-3 transitional) |
| `narrative.disclaimer` | R3 canonical | Direct rendering |
| `score.katorthoma_proximity` | M10 `proximity_level` | Direct projection (Greek-ish ID retained — kept short for backward compatibility with the existing field name) |
| `score.proximity_label` | M10 `proximity_level` → English label | R8c projection |
| `score.weakest_dimension` | M10 `weakest_dimension` | Direct projection |
| `score.direction` | M10 `direction` | Direct projection |
| `score.senecan_grade` | M10 `senecan_grade` | Direct projection |
| `score.proximity_risk_flag` | M10 `proximity_risk_flag` | Direct projection |
| `score.profile_tension_flag` | M10 `profile_tension_flag` | Direct projection |
| `score.passions_detected[]` | M2 + M3 + M5 per-passion entries | Direct projection (array structure preserved); R8a Greek IDs in fields |
| `score.virtue_engagement[]` | M9 `virtue_engagement[]` | Direct projection |
| `score.kathekon_assessment` | composite of M7 + M9 | Layer 3 derives `is_kathekon`, `quality`, `justification` per D11 |
| `score.indifferents_at_stake[]` | M8 `treatment_map` | Direct projection |
| `score.obligation_status[]` | M7 `obligation_status[]` | Direct projection |
| `proximity_ring_data` | M10 + practitioner profile longitudinal | See §"Proximity ring data contract" below |
| `ac_17.self_report_dependent` | M10 `self_report_dependent` | Direct projection |
| `ac_17.confidence_weighted` | M10 `confidence_weighted` | Direct projection |
| `open_deferrals_referenced[]` | D15 domain-match output | Direct projection from engine state |
| `engine_diagnostics` | D9 engine sequencing diagnostics | Direct projection (debugging visibility) |

The mapping is deterministic. The route layer extracts the structured fields directly from the engine output; Layer 3 paraphrases the narrative fields per D11/D12; the route layer assembles the envelope.

## Proximity ring data contract (per AC-11)

Per AC-11, the proximity ring data is wired in Phase 1; the UI renders in Phase 2. The data contract:

```typescript
interface ProximityRingDataContract {
  // Current instance
  current: {
    katorthoma_proximity: ProximityLevel;
    proximity_label: string;
    senecan_grade: SenecanGrade;
    weakest_dimension: WeakestDimension;
    timestamp: string;                       // ISO 8601 of the current evaluation
  };

  // Recent trajectory (per AC-11 — for the ring's curve rendering)
  recent_trajectory: {
    instances: ProximityTrajectoryEntry[];   // up to 30 most recent instances; ordered chronologically
    trajectory_window_days: number;           // default 90
    domain?: string;                          // optional filter (e.g., 'work', 'family') — Phase-2 UI populates from filter UI
  };

  // Per-dimension contributions (for the ring's segment rendering)
  dimension_contributions: {
    control: number;                          // 0-1 — how much each dimension contributes to the composite this instance
    passion: number;
    obligation: number;
    virtue: number;
  };

  // Direction signal
  direction: Direction;
  direction_evidence: string;                 // brief prose for tooltip rendering

  // Domain context
  domain_classification: {
    domain_id: string;                        // e.g., 'work', 'family', 'creative', 'public_discourse'
    domain_label: string;                     // R8c English label
    domain_match_to_recent: boolean;          // true if recent_trajectory[]'s most-recent ~5 entries are same-domain
  };
}

interface ProximityTrajectoryEntry {
  instance_id: string;
  timestamp: string;                          // ISO 8601
  katorthoma_proximity: ProximityLevel;
  senecan_grade: SenecanGrade;
  domain_id: string;
  proximity_risk_flag?: ProximityRiskFlag | null;
}
```

### How the contract is wired

Phase 1's data-contract wiring means the response envelope carries the full `proximity_ring_data` block on every conversation reply. The proximity ring widget reads from this block when rendering. Phase-2 build of the proximity ring UI consumes the contract; the widget renders the curve, the segments, the tooltip per the contract's structure.

The contract is structurally complete — every field needed for the widget is named. Phase-2 UI work does not require additional engine changes; the engine populates the contract.

### How the contract handles cross-instance data

The `recent_trajectory[].instances[]` array reads from the practitioner's longitudinal record. The conversation route queries the practitioner's recent reflections (or recent score-family outputs) and assembles the trajectory. The query is bounded:

- Default window: 90 days (`trajectory_window_days: 90`).
- Default count: up to 30 most recent instances.
- Domain filter applied when the UI surfaces a filter (Phase-2 work).

The query runs within the conversation route's request handling. Per KG1 rule 2, the query is awaited before the response is constructed.

### Phase-2 UI render expectations

Phase-2 build of the proximity ring widget renders:

- **The ring itself** — a circular progress visualisation with five segments (one per proximity level), highlighting the current proximity level.
- **The trajectory curve** — a small line chart showing the recent_trajectory[]'s proximity_level over time.
- **Per-dimension segment colouring** — shading the four dimensions (control / passion / obligation / virtue) in proportion to their contributions to the composite.
- **The direction indicator** — a small arrow showing improving / stable / declining with the direction_evidence as tooltip.
- **The domain filter** — a dropdown allowing the practitioner to filter the trajectory by domain (work, family, etc.).

The architecture commits to the data contract; the visual design is Phase-2 work.

## How score-in-reply differs from D14a's ritual surface

D14a (ritual surface) and the conversation surface both consume the same canonical engine output. They differ in:

1. **Visible-output shape.** D14a Table 4a includes `what_you_did_well`, `sage_perspective`, `evening_prompt` — fields tuned for daily reflection. The conversation surface includes `philosophical_reflection`, `improvement_path`, `oikeiosis_context` — fields tuned for back-and-forth dialogue.
2. **Conversation context.** The conversation surface carries history — the prior turns of the dialogue — which Layer 3 may reference in the prose. D14a's ritual is single-shot (each morning / each evening submits independently).
3. **Proximity ring data contract.** D14a includes the structured score fields too (per Table 4a), but the proximity ring contract specifically lives at the conversation surface — the proximity ring widget is on the conversation surface page (`/private-mentor`).
4. **Domain context.** The conversation surface infers domain from the dialogue's content; D14a infers from the morning/evening narrative.

Both surfaces respect AC-12 (no Stoic inference originating from Claude); both surfaces project from the canonical engine output; both surfaces honour AC-17 flag projection per D19. The shape difference is per-consumer projection per D2.

D14a §"How the two surfaces relate" specifies the cross-surface coordination at the canonical-engine level. D16 specifies the conversation surface's specific shape.

## Pre-migration vs post-migration

The conversation surface migration is **Phase-2 pass 3** per AC-19 (D14b first, D14a second, conversation surface third). Today's `/api/founder/hub` returns a partial shape (the mentor reply prose plus a few structured fields like `recommended_action` and `observation`). Phase-2 pass 3 substitutes the deterministic engine for the current Claude-only mentor pipeline; the response envelope expands to the full shape above.

### Pre-migration response (today)

```typescript
// Existing /api/founder/hub response (abridged)
{
  reply: string;                             // mentor's prose reply
  recommended_action?: string;               // from observation/recommendation prompts (existing structure)
  observation?: string;                      // from structured observation extraction (existing structure)
  pattern_source?: string;                   // ADR-PE-01 pattern provenance
  ...
}
```

### Post-migration response (Phase 2 pass 3)

The full `ConversationReplyResponse` shape above, with backward-compatible aliases for the existing fields:

- `reply` → `narrative.philosophical_reflection` (or composite of philosophical_reflection + improvement_path); also surface as the practitioner-facing rendered text.
- `recommended_action` → derived from M5 `dominant_false_judgement` + M9 `weakest_virtue_flag` Layer 3 derivation; the Layer 3 prompt produces both the existing `recommended_action` shape and the new structured fields.
- `observation` → preserved as a Layer 3 derived field from M10 `structured_observation`.
- `pattern_source` → preserved verbatim from ADR-PE-01 wiring.

The migration is **additive** — existing consumers (the current `/private-mentor` page) read existing field names and continue to work; new consumers (the proximity ring widget) read the new fields. The architecture does not break existing functionality.

## Cache discipline

Per KG6 / AC-6:

- **System block** carries Layer 3's prompt template (per D12). Cached.
- **User message** carries the per-request engine output, layer 1 features, retrieved passages, and the practitioner's recent_trajectory data for the proximity ring contract. Per-request.

The proximity ring trajectory data is not cached per request because it changes (new instance just landed; the trajectory must include it). The route fetches the practitioner's recent reflections at the start of the conversation route's request handling and includes them in the user message.

## Worked example — score-in-reply for the philodoxia anchor

**Practitioner narrative on `/private-mentor`:** *"I want this conversation tomorrow with Sarah to land well — that she walks away thinking I handled it competently. I keep rehearsing the opening lines."*

**Engine state (after Position 12):**
- M1: `external_scope: ["their good opinion"], misclassification_flags: ["CONTROL_INFLATION"], misclassification_severity: moderate, filter_passed: false`.
- M2: `dominant_passion: epithumia, axis: future, axis_evaluative: apparent_good`.
- M3: `dominant_sub_species: philodoxia`.
- M5: `dominant_false_judgement: { object: "their good opinion of me", judgement_type: INFLATION, correct_judgement: "Reputation is a preferred indifferent...", refinement_source: PROFILE }`.
- M6: `primary_circle: 1 (operative), oikeiosis_contraction: true (Circle 3 stated, Circle 1 operative)`.
- M9: `weakest_virtue_flag: phronesis, dominant_virtue_failure: phronesis`.
- M10: `proximity_level: deliberate, proximity_risk_flag: PASSION_DOMINANCE, direction: stable, senecan_grade: grade_3, self_report_dependent: true, confidence_weighted: high`.
- D15 domain-match: open deferral from 14 days ago about chara/philodoxia in Circle 3 colleague conversations.

**Response envelope (abridged):**

```json
{
  "narrative": {
    "philosophical_reflection": "What's within your moral choice here is your impression-checking and your assent — your noticing whether being well thought of is genuinely good. What's outside is Sarah's actual opinion of you. The narrative reads philodoxia (love of honour) at the assent stage: you're rehearsing the conversation as if her good opinion of you is a genuine good. The engaged circle is community (Circle 3 stated — your colleague), but the operative circle is self (Circle 1 — your reputation). Phronesis is the operative virtue deficiency. This classification depends on your self-report of why you're rehearsing.",
    "improvement_path": "The false judgement: 'her good opinion of me is a genuine good.' The correct judgement: reputation is a preferred indifferent — selecting it via virtuous action is appropriate; desiring it as a genuine good is the philodoxia pattern.",
    "oikeiosis_context": "The action's stated circle is community; the operative circle is self. Cicero's Q1 (is the action honourable?) reads false because the rehearsal motivation is philodoxia-shaped.",
    "open_deferral_observation": "You've had a question open since April 18 about whether your equanimity in that meeting was chara or polished surface. I'm not asking you to answer it now — but I want you to know it's still open.",
    "disclaimer": "Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations."
  },
  "score": {
    "katorthoma_proximity": "deliberate",
    "proximity_label": "Approaching the principled level",
    "weakest_dimension": "passion",
    "direction": "stable",
    "senecan_grade": "grade_3",
    "proximity_risk_flag": "PASSION_DOMINANCE",
    "profile_tension_flag": false,
    "passions_detected": [
      {
        "root_passion": "epithumia",
        "sub_species": "philodoxia",
        "false_judgement": {
          "object_inflated_or_deflated": "her good opinion of me",
          "judgement_type": "INFLATION",
          "correct_judgement": "Reputation is a preferred indifferent...",
          "refinement_source": "PROFILE"
        },
        "causal_stage": "synkatathesis"
      }
    ],
    "virtue_engagement": [
      { "virtue": "phronesis", "rating": "weak", "evidence": "reputation inflated to genuine good" },
      { "virtue": "dikaiosyne", "rating": "weak", "evidence": "Circle 3 obligation undermined by Circle 1 operative concern" },
      { "virtue": "andreia", "rating": "weak", "evidence": "acting from fear of disesteem" },
      { "virtue": "sophrosyne", "rating": "weak", "evidence": "rehearsal in excess of due measure" }
    ],
    "kathekon_assessment": {
      "is_kathekon": false,
      "quality": "marginal",
      "justification": "The conversation is appropriate; the rehearsal motivation is philodoxia-shaped..."
    },
    "indifferents_at_stake": [
      { "indifferent_id": "reputation", "axia_class": "moderate", "treatment": "inflation", "evidence": "wanting her to think well of me" }
    ],
    "obligation_status": [
      { "circle_id": 3, "is_met": false, "cicero_q1_passed": false, "conflict_resolution": "the higher circle's obligation prevails; the philodoxia must be examined" }
    ]
  },
  "proximity_ring_data": {
    "current": {
      "katorthoma_proximity": "deliberate",
      "proximity_label": "Approaching the principled level",
      "senecan_grade": "grade_3",
      "weakest_dimension": "passion",
      "timestamp": "2026-05-02T..."
    },
    "recent_trajectory": {
      "instances": [
        { "instance_id": "...", "timestamp": "2026-04-29T...", "katorthoma_proximity": "deliberate", "senecan_grade": "grade_3", "domain_id": "work", "proximity_risk_flag": "PASSION_DOMINANCE" },
        { "instance_id": "...", "timestamp": "2026-04-25T...", "katorthoma_proximity": "deliberate", "senecan_grade": "grade_3", "domain_id": "work", "proximity_risk_flag": "PASSION_DOMINANCE" },
        ...
      ],
      "trajectory_window_days": 90
    },
    "dimension_contributions": {
      "control": 0.7,
      "passion": 0.5,
      "obligation": 0.6,
      "virtue": 0.5
    },
    "direction": "stable",
    "direction_evidence": "Recent instances show the philodoxia pattern recurring at the same proximity level.",
    "domain_classification": {
      "domain_id": "work",
      "domain_label": "Work",
      "domain_match_to_recent": true
    }
  },
  "ac_17": {
    "self_report_dependent": true,
    "confidence_weighted": "high"
  },
  "open_deferrals_referenced": [
    {
      "open_deferral_id": "...",
      "trigger_code": "EUPATHEIA_BOUNDARY",
      "domain_match_axes": ["sub_species", "oikeiosis_circle_role"],
      "created_at": "2026-04-18T..."
    }
  ],
  "engine_diagnostics": {
    "tier_1_force_fired": false,
    "tier_2_soft_fired": false,
    "tier_3_open_deferrals": [],
    "back_edge_fired": false,
    "ac_17_self_report_dependent": true,
    "ac_17_confidence_weighted": "high",
    ...
  }
}
```

The conversation surface page renders `narrative.philosophical_reflection` + `narrative.improvement_path` + `narrative.oikeiosis_context` + `narrative.open_deferral_observation` as the mentor's reply. The proximity ring widget reads `proximity_ring_data` and renders the curve. The practitioner profile updates from `score.passions_detected[]`, `score.virtue_engagement[]`, etc.

Every Stoic claim in the prose traces to an upstream rule output. The structured score fields project directly from the canonical engine. AC-12 is honoured.

## Cleanliness rating

The response payload shape is **HIGH cleanliness** — fully specified TypeScript interfaces; direct projections from canonical engine output; no interpretive judgement at the envelope level.

The proximity ring data contract is **HIGH cleanliness** — fully specified; the per-instance trajectory entries map directly from the practitioner's longitudinal record; the dimension contributions are derived from M10's per-dimension scores.

The pre-migration / post-migration distinction is **HIGH cleanliness** — backward-compatible aliases preserve existing functionality during the migration; new fields are additive.

The narrative composition (philosophical_reflection paragraph composing M1, M2/3, M5, M6/7, M9 outputs) is **PARTIAL cleanliness** at the prose-level — Layer 3 must order the prose, smooth between mechanisms, and avoid redundancy. Per D11 and D12, this is the architectural PARTIAL seam.

## R8a / R8c / R20d compliance

- **R8a (strict glossary in API responses):** `score.passions_detected[].root_passion` and `.sub_species` use Greek IDs (`epithumia`, `philodoxia`); `score.virtue_engagement[].virtue` uses Greek IDs.
- **R8c (user-facing prose):** `narrative.philosophical_reflection` and other prose fields use English-only labels; `score.proximity_label` is the English projection of `score.katorthoma_proximity`.
- **R20d (relationship asymmetry):** the prose uses first-person framing on the conversation surface ("your moral choice", "your phronesis"). The conversation surface is exclusively self-evaluation; reader_triggered_passions[] (the invitation-language pattern) does not apply here — that's `/api/score-social`'s shape.

## Open questions

1. **Whether `narrative.open_deferral_observation` belongs in `narrative` or has its own top-level field.** Today's design places it under `narrative` because it's prose. Alternative: a top-level `coda` or `mentor_observation` field separate from the main narrative. Recommendation: keep under `narrative` for cleanliness; the practitioner-facing rendering treats it as a coda paragraph. Founder calls.
2. **Whether `engine_diagnostics` ships in the production response.** Today the engine_diagnostics block is debug visibility — useful for the founder during Phase-2 build verification but not for end users. Recommendation: ship in the response; the founder's surface can render it conditionally (founder-only); other users see a thinner envelope. Phase-2 build implements the conditional rendering.
3. **Whether the proximity ring contract supports per-domain trajectory rendering at Phase-2 launch or post-launch.** The contract supports the domain filter; Phase-2 UI may render the filter UI. Recommendation: ship without filter UI; add filter UI when production observation surfaces the need. Founder calls.
4. **Backward-compat alias preservation period.** The Phase-2 pass-3 response includes `reply`, `recommended_action`, `observation` aliases for existing consumers. How long does the aliasing stay before deprecation? Recommendation: keep aliases until all consumers migrate to the new field names; deprecation is a Phase-3+ housekeeping action.

## Honest disclosure

The score-in-reply design preserves the existing conversation-surface response shape (today's `/api/founder/hub`) and extends it with the canonical engine output's full structured fields. The migration is additive — existing consumers continue to work; new consumers (proximity ring widget) read the new fields.

The proximity ring data contract is wired in Phase 1; the UI renders in Phase 2. The contract is structurally complete; Phase-2 UI work consumes it without engine changes.

The narrative composition is the architectural PARTIAL seam — Layer 3 must compose prose around the upstream outputs while honouring the inclusion + exclusion rules from D11 / D12. The verification work (D18) reads the prose against the structured score fields and confirms the trace.

## Approval gate

This deliverable is consumed by Phase-2 pass 3 (the conversation-surface migration). Approval is part of the same batch as the other Phase-1 session 3 deliverables (Standard risk under 0d-ii). Move from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` is Elevated risk.

Phase-2 pass 3 itself is Critical risk per PR6 (R20a perimeter route). The Critical Change Protocol applies at Phase-2 build time.

---

*End of Deliverable 16.*
