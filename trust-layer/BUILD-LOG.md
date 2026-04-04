# Agent Trust Layer — Build Log

**Built:** 3 April 2026
**Source Document:** SageReasoning_Agent_Trust_Layer_Framework.docx (Version 2.0)
**Builder:** Claude (Cowork session)
**Status:** All 5 priorities complete — offline framework code ready for review

---

## What Was Built

### Priority 1: Accreditation Record + Public Endpoint
**Files:**
- `types/accreditation.ts` — Core types: AccreditationRecord, AccreditationPayload, GradeChangeEvent, OnboardingResult, DimensionScores, AuthorityLevel
- `accreditation/accreditation-record.ts` — Record creation, payload building, grade/proximity/authority mappings, validation helpers
- `accreditation/public-endpoint.ts` — GET /accreditation/{agent_id} handler, batch lookup, CORS headers

**Decisions:**
- Kept trust-layer types self-contained (re-declared KatorthomaProximityLevel etc.) rather than importing from website/src/lib to avoid coupling during development. When integrating, these can be replaced with imports from stoic-brain.ts.
- AccreditationPayload is a strict subset of AccreditationRecord — R4 compliant (no internal logic exposed).
- Default expiry: 90 days. Configurable per agent.

---

### Priority 2: Rolling Evaluation Window
**Files:**
- `types/evaluation.ts` — EvaluatedAction, WindowConfig, WindowSnapshot, DimensionDetail types
- `evaluation-window/window-aggregator.ts` — Full aggregation logic: proximity distribution, typical proximity, direction of travel, all 4 dimension computations, persisting passions, kathekon rate, virtue breadth

**Decisions:**
- Typical proximity uses "60% at or above" threshold (configurable). This means 60% of actions in the window must be at or above a level for the agent to be "typically" at that level.
- Direction of travel compares recent 20 actions vs prior 20 using average rank. Threshold of 0.3 rank difference to count as movement.
- Dimension-level thresholds are calibrated per the doc's qualitative descriptions:
  - Passion reduction: <15% = advanced, 15-40% = established, 40-70% = developing, >70% = emerging
  - Judgement quality: Based on kathekon compliance quality rate
  - Disposition stability: Standard deviation of proximity ranks
  - Oikeiosis extension: Based on oikeiosis_met rate + breadth of stages engaged
- Persisting passion threshold: appears in >20% of window actions.

---

### Priority 3: Grade Transition Engine
**Files:**
- `grade-engine/grade-transition-engine.ts` — Complete upgrade/downgrade logic with thresholds, hysteresis, evidence tracking

**Decisions:**
- Upgrade thresholds are demanding but achievable. Key thresholds (R4 — these are internal IP):
  - Reflexive→Habitual: 55% at habitual+, min 20 actions, max 8 persisting passions
  - Habitual→Deliberate: 60% at deliberate+, min 40 actions, max 5 passions, 2+ established dimensions
  - Deliberate→Principled: 65% at principled+, min 60 actions, max 2 passions, direction must be improving
  - Principled→Sage-like: 75% at sage_like, min 80 actions, 0 passions, all dimensions advanced
- Downgrade requires 2 of 3 conditions: below proximity floor, above passion ceiling, N consecutive regressing checks. This provides hysteresis to prevent oscillation.
- Grade changes produce a TransitionTrigger with full evidence summary for the event stream.

---

### Priority 4: Authority Level Integration
**Files:**
- `authority/authority-mapper.ts` — Authority definitions, sage-guard integration, reactive enforcement, novelty detection

**Decisions:**
- Pre-check rates: supervised=100%, guided=50%, spot_checked=15%, autonomous=0%, full_authority=0%
- Guided level flags all novel actions for review regardless of sampling rate.
- Supervised level overrides sage-guard threshold to 'deliberate' (strict).
- Reactive enforcement after downgrade: enhanced monitoring for 50 actions at 1.5x normal rate (min 25%).
- Basic novelty detection via keyword overlap. In production, this would use semantic similarity.

---

### Priority 5a: Accreditation Card
**Files:**
- `card/accreditation-card.ts` — Card builder, display mappings, dimension indicators, serialization

**Decisions:**
- Card uses English-only labels (R8c). Colour coding:
  - Proximity: red(reflexive) → amber(habitual) → blue(deliberate) → emerald(principled) → violet(sage-like)
  - Dimensions: same red → amber → blue → emerald for emerging → advanced
- Direction of travel uses symbols: ↑ improving, → stable, ↓ regressing
- serializeCard() produces a clean JSON object suitable for API responses.
- formatAgentName() turns agent_acme_v3 into "Acme V3" for display.

---

### Priority 5b: Progression Toolkit
**Files:**
- `types/progression.ts` — All 9 tool types: ExamineResponse, DistinguishResponse, DiagnoseResponse, CounterResponse, ClassifyValueResponse, UnifyResponse, StressResponse, RefineResponse, ExtendResponse + ProgressionPrescription
- `progression-toolkit/pathways.ts` — 7 pathway definitions, prescription model, R12 validation
- `progression-toolkit/sage-tools.ts` — Tool registry (9 tools), all 9 prompt builders, metadata

**Decisions:**
- All 9 tools have complete prompt builders ready for LLM integration.
- Each prompt follows the same pattern as existing sage skills (return ONLY valid JSON).
- R12 validated: every pathway uses at least 2 Stoic Brain mechanisms. validateR12Compliance() function confirms this.
- Prescription model personalizes based on weakest dimension. Example: habitual agent with weak passion_reduction gets sage-diagnose + sage-counter emphasis.
- sage-counter handles the lupe asymmetry explicitly (no eupatheia counterpart — philosophically deliberate).
- Pathway 7 (sage-extend / oikeiosis expansion) is prescribed across all levels per the doc.

---

### Schema (For Review)
**Files:**
- `schema/trust-layer-schema-REVIEW.sql` — 5 new Supabase tables with indexes, RLS policies, and review notes

**Tables:**
1. `agent_accreditation` — Primary credential record (TEXT PK on agent_id)
2. `evaluated_actions` — Individual evaluated actions for window aggregation
3. `grade_history` — Audit trail of all grade changes
4. `onboarding_results` — 55-assessment framework outcomes
5. `progression_sessions` — Progression toolkit interactions (coaching revenue tracking)

---

## File Structure

```
trust-layer/
├── index.ts                              # Barrel export
├── BUILD-LOG.md                          # This file
├── types/
│   ├── index.ts                          # Type barrel export
│   ├── accreditation.ts                  # Core accreditation types
│   ├── evaluation.ts                     # Evaluation window types
│   └── progression.ts                    # Progression toolkit types
├── accreditation/
│   ├── accreditation-record.ts           # Priority 1: Record management
│   └── public-endpoint.ts               # Priority 1: Public API endpoint
├── evaluation-window/
│   └── window-aggregator.ts             # Priority 2: Rolling window logic
├── grade-engine/
│   └── grade-transition-engine.ts       # Priority 3: Grade transitions
├── authority/
│   └── authority-mapper.ts              # Priority 4: Authority + sage-guard
├── card/
│   └── accreditation-card.ts            # Priority 5a: Credential card
├── progression-toolkit/
│   ├── pathways.ts                      # Priority 5b: 7 pathways + prescriptions
│   └── sage-tools.ts                    # Priority 5b: 9 tool prompts + registry
└── schema/
    └── trust-layer-schema-REVIEW.sql    # Supabase schema (DRAFT)
```

---

## What's Pending (Not Built Yet)

1. **Supabase integration** — The code is pure TypeScript logic. No actual Supabase client calls yet. The schema needs your approval before running.
2. **Batch Assessment Endpoint** — The orchestrator that runs the 55-assessment sequence as a single API interaction. The types are defined (OnboardingResult) but the orchestration logic needs the existing agent-assessment-framework-v3.json wired in.
3. **Accreditation Event Stream** — Webhook delivery system for grade change events. The event types (GradeChangeEvent) are defined, but the webhook infrastructure needs building.
4. **LLM integration for progression tools** — The prompt builders are complete, but they need to be wired to the actual LLM call + response parsing (same pattern as existing sage skills).
5. **Integration with website/src/** — The trust-layer is self-contained. When ready, the types can be consolidated with stoic-brain.ts and the endpoints added to the Next.js API routes.

---

## Manifest Rule Compliance

| Rule | Status | Notes |
|------|--------|-------|
| R1 | Compliant | Evaluates reasoning quality, not therapeutic fitness |
| R2 | Compliant | Agent accreditation, not employment evaluation |
| R3 | Compliant | ACCREDITATION_DISCLAIMER on all evaluative output |
| R4 | Compliant | Grade + dimensions exposed; thresholds and micro-logic internal |
| R5 | Compliant | Free tier (14 assessments) vs Paid (55) types defined |
| R6c | Compliant | Zero numeric scores anywhere — all qualitative levels |
| R7 | Compliant | Source files tracked in all tool metadata and responses |
| R8a | Compliant | Greek identifiers in data layer (passion IDs, stage names) |
| R8b | Compliant | English in developer-facing docs and code comments |
| R8c | Compliant | English-only in card display labels |
| R8d | Compliant | Plain English in progression tool coaching output |
| R9 | Compliant | Disclaimer states: does not guarantee specific outcomes |
| R12 | Compliant | validateR12Compliance() confirms all pathways use 2+ mechanisms |
| R13 | Noted | Compliance obligations referenced in framework; enforcement TBD |
