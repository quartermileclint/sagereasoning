/**
 * philosophical-mode-service.ts — Layer 3 philosophical-mode renderer + the
 * Layer 3 mode-dispatch entry point.
 *
 * STATUS: Scaffolded → Wired → Verified (2026-05-14, this session). Builds
 * behind the SUBSTRATE_LAYER3_ENABLED gate (UNSET in Vercel — no route imports
 * this module yet, so there is no production exposure this session).
 *
 * GOVERNING DOCUMENTS:
 *   - /adopted/substrate-modes/philosophical-mode-response-spec.md (the spec —
 *     Adopted 2026-05-14; this module is its v1 implementation)
 *   - /adopted/substrate-plugin-staging-plan.md §A6 (four-mode response-shape
 *     redesign)
 *   - /manifest.md §R3 / §R4 / §R8a / §R17e / §R18a / §R18e / §R19c / §R19d /
 *     §R20a / §AC8
 *   - /operations/decision-log.md — D-PHILOSOPHICAL-MODE-BUILD-WIRED-VERIFIED-
 *     2026-05-14 (this build); the score-architecture deferral is logged there
 *     under PR7.
 *
 * PURPOSE
 *
 * Philosophical mode is the substrate's transparency surface — the rendering
 * most directly useful for a human who wants to SEE how the engine reasoned,
 * not just what it concluded. It is DETERMINISTIC: it projects a
 * Layer2Assessment directly into a canonical JSON payload and a Markdown text
 * rendering, with NO LLM prose composition. Same input → same output.
 *
 * This module is also the PR1 single-endpoint proof of the Layer 3
 * mode-dispatch pattern. `renderLayer3Mode` branches on `mode`; today only
 * 'philosophical' is implemented. Standard / private / ATL-wrapper modes will
 * extend the same switch in subsequent build sessions, reusing this pattern.
 *
 * WHAT THIS MODULE DOES (per the spec's section ordering)
 *
 *   1. Mandatory opening wrap (R3 disclaimer)
 *   2. Title + Input observed (R18a category framing sits here when requested)
 *   3. Verdict (kathekon outcome + quality + justification)
 *   4. Score vector        — DEFERRED this session (see "SCORE DEFERRAL" below)
 *   5. Scalar score        — DEFERRED this session (see "SCORE DEFERRAL" below)
 *   6. Field-by-field rendering of the Layer 2 assessment (R20a distress
 *      passthrough replaces this section's content when a distress signal is
 *      active)
 *   7. Source material — three retrieved Stoic passages (Markdown only; the
 *      JSON does not carry retrieved passages per the spec)
 *   8. Mandatory closing wraps (R19c + R19d when mentor-flavoured + R18e)
 *
 * SCORE DEFERRAL (founder decision, 2026-05-14)
 *
 * The spec's sections 4 (Score vector) + 5 (Scalar score) and the Verdict's
 * "justification source" line render a substrate score architecture that does
 * NOT exist yet: Layer2Assessment carries no score / score vector / scalar /
 * validity flag / precision band / justification_source, and there is no
 * score-computation module in the substrate. The score architecture is
 * specified only in the superseded agent-mode spec, whose content the spec
 * itself locates in the not-yet-built ATL Wrapper. Per the founder's election
 * at this session's Step 1 gate, the score-dependent pieces are DEFERRED. The
 * JSON `score` field carries an explicit `{ deferred: true, deferral_reason }`;
 * the Markdown renders a one-line transparency note where sections 4–5 sit.
 * Revisit condition: the substrate score architecture reaches Scaffolded (its
 * natural home is a dedicated score build or the ATL Wrapper build).
 *
 * PR6 WATCH-POINT (no R20a logic change)
 *
 * Philosophical mode RENDERS the R20a distress passthrough — it consumes the
 * existing `R20A_DISTRESS_PASSTHROUGH` constant via `injectR20aDistressPass-
 * through()` and renders the resulting string. It does NOT modify the R20a
 * classifier, redirection, or wrapper logic. The R20a perimeter is preserved.
 *
 * COMPLIANCE
 *
 *   - R3 / R18a / R18e / R19c / R19d / R20a: the six mandatory wraps are taken
 *     verbatim from layer3-service.ts's inject functions — the existing
 *     injection layer. This module never re-authors a wrap string.
 *   - R4 (IP boundary): this module renders Layer 2's OUTPUT. It does not
 *     expose engine internals, lookup tables, or scoring formulas.
 *   - R8a (controlled-vocabulary glossing): every Greek / Stoic-technical term
 *     the renderer places into a section is glossed on FIRST occurrence WITHIN
 *     THAT SECTION (per-section, not response-wide — founder decision
 *     2026-05-14). Free-text fields authored by Layer 2 (justification,
 *     evidence, ruling_faculty_state, ambiguity notes) render verbatim.
 *   - R17e (intimate-data protection): the iterative_refinement fields
 *     (direction-of-travel, senecan-grade, progress-dimensions,
 *     motivation-classification) and score-confidence are profile-derived /
 *     trajectory data. `applyR17eExclusionFilter` strips them BEFORE any
 *     projection runs — a single dedicated filter step, so the exclusion is
 *     testable in one place. The excluded paths are recorded in the exported
 *     `R17E_EXCLUDED_FIELD_PATHS` module constant; the response payload itself
 *     carries only a `meta.r17e_exclusion_applied` flag — it never carries the
 *     profile-field name strings, so no excluded field name appears in output.
 *   - AC8: this module sits in /website/src/lib/substrate/ and consumes the
 *     translation-sandwich Layer 2 output + the A5 injection layer.
 *   - PR1: single-endpoint proof — `renderLayer3Mode` is the dispatch pattern;
 *     proven on one mode (philosophical) before standard / private / ATL
 *     inherit it.
 *   - PR2: build-to-wire-verification immediate — the test file
 *     (__tests__/philosophical-mode-service.test.ts) invokes `renderLayer3Mode`
 *     in the same session as this module is written.
 *   - PR3: the source-material retrieve-passages call is NOT a safety-critical
 *     function, so it does not have to be synchronous-only; v1 is synchronous
 *     for simplicity. The R20a passthrough decision IS made synchronously,
 *     before the response is constructed (it is a pure read of the already-
 *     completed upstream signal — see injectR20aDistressPassthrough).
 *   - PR4: N/A — no LLM call. Philosophical mode is deterministic; the
 *     retrieve-passages call uses the documented OpenAI embedding model via the
 *     existing rag/retrieve-passages.ts module (not a new model selection).
 */

import type { SafetyGate } from '@/lib/constraints'

import {
  injectR3Disclaimer,
  injectR19Limitations,
  injectR19MirrorPrinciple,
  injectR20aDistressPassthrough,
  injectR18aCategory,
  injectR18eTransparencyNotice,
  type ConsumerContext,
  type Layer3InjectionSet,
} from '@/lib/substrate/layer3-service'

import type {
  Layer2Assessment,
  KathekonQuality,
  KatorthomaProximity,
  VirtueDomain,
  StageScore,
  PassionDiagnosis,
  ControlFilter,
  ControlFilterClassifiedItem,
  Oikeiosis,
  OikeiosisCircleAssessment,
  ValueAssessment,
  IndifferentAtStakeAssessment,
  KathekonAssessment,
  ImprovementPathStructured,
  StageScores,
  HastyAssentRisk,
  IntakeClarifications,
  SoftClarification,
  OpenDeferralEntry,
  PassionDiagnosisEntry,
  RootPassion,
} from '@/lib/translation-sandwich/layer2-mechanisms'

import {
  retrievePassages,
  type RetrieveInput,
  type RetrieveResult,
  type RetrievedPassage,
} from '@/lib/rag/retrieve-passages'

// ============================================================================
// MODE-DISPATCH TYPES (PR1 — the pattern standard / private / ATL extend)
// ============================================================================

/** The Layer 3 render modes. Today only 'philosophical' is implemented; the
 *  other three are reserved so the dispatch switch is exhaustively typed. */
export type Layer3RenderMode =
  | 'philosophical'
  // Reserved — implemented in subsequent build sessions:
  // | 'standard'
  // | 'private'
  // | 'atl_wrapper'

/** Signature of the retrieve-passages function. Exposed as a dependency-
 *  injection seam so tests can run without a database / OpenAI dependency.
 *  Defaults to the real `retrievePassages`. */
export type RetrievePassagesFn = (
  input: RetrieveInput,
  cache?: Map<string, RetrieveResult>
) => Promise<RetrieveResult>

export interface Layer3ModeRenderInput {
  /** Which Layer 3 render mode to produce. */
  mode: Layer3RenderMode
  /** The Layer 2 assessment to project. Required. */
  assessment: Layer2Assessment
  /** Consumer context — drives the R18a / R19d conditional wraps. Required. */
  consumer_context: ConsumerContext
  /** Optional SafetyGate from the route-level distress check. When present and
   *  `shouldRedirect` is true, the R20a passthrough replaces section 6's
   *  content. Defensive plumbing — A7 populates this when wired. */
  distress_gate?: SafetyGate
  /** Optional caller-supplied one-paragraph characterisation of the input.
   *  When absent, a deterministic characterisation is composed from the
   *  assessment alone (philosophical mode's determinism property is preserved
   *  either way). */
  input_observed?: string
  /** Dependency-injection seam for retrieve-passages. Defaults to the real
   *  `retrievePassages`. Tests pass a stub. */
  retrievePassagesFn?: RetrievePassagesFn
}

export interface Layer3ModeRenderResult {
  /** The mode that produced this result. */
  mode: Layer3RenderMode
  /** The canonical JSON payload — the source of truth. */
  json: PhilosophicalModeResponse
  /** The Markdown text rendering — a presentation layer over the JSON, plus
   *  the source-material section (which the JSON does not carry). */
  markdown: string
}

// ============================================================================
// PHILOSOPHICAL-MODE JSON SHAPE (the canonical source of truth)
//
// The JSON keys follow the spec's section ordering. The JSON preserves ALL
// fields explicitly (null / empty values present) for machine consumers; the
// Markdown rendering omits empty sections for cleaner human reading. The JSON
// does NOT carry source material (citations are presentation content for
// humans, not computation content for machines — per the spec).
// ============================================================================

export interface PhilosophicalModeVerdict {
  /** Kathekon outcome — true / false / null. */
  is_kathekon: boolean | null
  /** Kathekon quality grade. */
  quality: KathekonQuality
  /** Layer 2's justification text, verbatim. */
  justification: string
  /** DEFERRED this session — `justification_source` (engine_constructed /
   *  agent_asserted / absent) is part of the substrate score architecture,
   *  which is not yet built. Always null until the score architecture lands. */
  justification_source: null
}

export interface PhilosophicalModeScore {
  /** Sections 4 (Score vector) + 5 (Scalar score) are deferred this session —
   *  the substrate score architecture does not exist yet. */
  deferred: true
  /** Why the score sections are deferred + the revisit condition. */
  deferral_reason: string
}

export interface PhilosophicalModeFields {
  passion_diagnosis: PassionDiagnosis
  control_filter: ControlFilter
  oikeiosis: Oikeiosis
  value_assessment: ValueAssessment
  kathekon_assessment: KathekonAssessment
  katorthoma_proximity: KatorthomaProximity
  ruling_faculty_state: string
  virtue_domains_engaged: VirtueDomain[]
  improvement_path_structured: ImprovementPathStructured | null
  stage_scores: StageScores
  hasty_assent_risk: HastyAssentRisk
  intake_clarifications: IntakeClarifications
  layer1_ambiguity_notes: string[]
  layer2_ambiguity_notes: string[]
}

export interface PhilosophicalModeResponse {
  /** Schema version. Constant. */
  version: 'philosophical-mode-response-v1'
  /** The render mode. Constant for this module. */
  mode: 'philosophical'
  /** Section 1 — mandatory opening wrap. */
  opening_wrap: {
    r3_disclaimer: string
  }
  /** Section 2 — title block. R18a category framing sits here when requested. */
  title_block: {
    title: string
    input_observed: string
    r18a_category_framing: string | null
  }
  /** Section 3 — Verdict. */
  verdict: PhilosophicalModeVerdict
  /** Sections 4 + 5 — Score. Deferred this session. */
  score: PhilosophicalModeScore
  /** Section 6 — field-by-field rendering of the Layer 2 assessment. Null when
   *  the R20a distress passthrough is active (it replaces this section's
   *  content per the R20a perimeter discipline). */
  fields: PhilosophicalModeFields | null
  /** The R20a distress passthrough text. Non-null when a distress signal is
   *  active — and when non-null, `fields` is null (the passthrough replaces
   *  section 6). Null in steady state. */
  distress_passthrough: string | null
  /** Section 8 — mandatory closing wraps. */
  closing_wraps: {
    r19c_limitations: string
    /** Present only when consumer_context.is_mentor_flavoured. */
    r19d_mirror_principle: string | null
    r18e_transparency_notice: string
  }
  /** Response metadata. */
  meta: {
    /** True when the R20a passthrough replaced section 6. */
    distress_passthrough_active: boolean
    /** True — sections 4 + 5 are deferred this session. */
    score_sections_deferred: true
    /** True — the R17e exclusion filter ran before projection. The excluded
     *  field paths are recorded in the `R17E_EXCLUDED_FIELD_PATHS` module
     *  constant, NOT in this payload — so the response carries no
     *  profile-field name strings. */
    r17e_exclusion_applied: true
  }
}

// ============================================================================
// R17e EXCLUSION FILTER (load-bearing — a single dedicated filter step)
//
// The iterative_refinement fields and score_confidence are profile-derived /
// trajectory data. Per R17e, philosophical mode is per-response-only: it must
// not surface cross-submission aggregation. This filter strips the excluded
// paths from the assessment BEFORE any projection runs, so both the JSON and
// the Markdown project from an already-filtered structure — the exclusion is
// enforced and tested in exactly one place.
//
// All four sub-fields of the top-level `iterative_refinement` object are on
// the exclusion list, so the filter removes the whole object. `score_confidence`
// is the agent-mode field — not present on the current Layer2Assessment, but
// listed here so the constant is the complete R17e exclusion record.
// ============================================================================

export const R17E_EXCLUDED_FIELD_PATHS: ReadonlyArray<string> = [
  'iterative_refinement.direction_of_travel',
  'iterative_refinement.senecan_grade',
  'iterative_refinement.progress_dimensions',
  'iterative_refinement.progress_dimensions.passion_reduction',
  'iterative_refinement.progress_dimensions.judgement_quality',
  'iterative_refinement.progress_dimensions.disposition_stability',
  'iterative_refinement.progress_dimensions.oikeiosis_extension',
  'iterative_refinement.motivation_classification',
  'score_confidence',
]

/** The assessment with the R17e-excluded top-level fields removed. The
 *  `iterative_refinement` object is dropped entirely (all four of its
 *  sub-fields are excluded); `score_confidence` is dropped if present. */
export type R17eFilteredAssessment = Omit<Layer2Assessment, 'iterative_refinement'>

/**
 * Strip the R17e-excluded fields from a Layer2Assessment. Returns a shallow
 * structural copy without `iterative_refinement` (and without `score_confidence`
 * if a future Layer2Assessment carries it). Pure; deterministic; never throws
 * on a well-formed assessment.
 */
export function applyR17eExclusionFilter(
  assessment: Layer2Assessment
): R17eFilteredAssessment {
  // Shallow structural copy with the R17e-excluded top-level paths removed.
  // `iterative_refinement` is the only excluded path that exists on the current
  // Layer2Assessment type; `score_confidence` is removed defensively in case a
  // future assessment shape carries it.
  const copy = { ...assessment } as Partial<Layer2Assessment> & {
    score_confidence?: unknown
  }
  delete copy.iterative_refinement
  delete copy.score_confidence
  return copy as R17eFilteredAssessment
}

// ============================================================================
// R8a CONTROLLED-VOCABULARY GLOSSARY
//
// Every Greek / Stoic-technical term in the controlled-vocabulary list, with
// its English gloss. Gloss forms follow the authoritative forms used in
// layer3-prose.ts's required-gloss list and layer2-mechanisms.ts's
// PASSION_DISPLAY_NAMES. This is a presentation-layer table — the analogue of
// MECHANISM_LABELS / VIRTUE_TRANSLATIONS in layer3-prose.ts.
// ============================================================================

const GREEK_GLOSSARY: Record<string, string> = {
  // Causal-chain stages
  phantasia: 'impression',
  synkatathesis: 'assent',
  horme: 'impulse',
  praxis: 'action',
  // Root passions
  epithumia: 'irrational desire',
  hedone: 'irrational pleasure',
  phobos: 'fear',
  lupe: 'distress',
  // Passion sub-species
  orge: 'anger',
  eros: 'erotic desire',
  pothos: 'longing for the absent',
  philedonia: 'love of pleasure',
  philoplousia: 'love of wealth',
  philodoxia: 'love of reputation',
  kelesis: 'charm-induced pleasure',
  epichairekakia: 'malicious joy',
  terpsis: 'sensual delight',
  deima: 'panic',
  oknos: 'hesitation',
  aischyne: 'shame',
  thambos: 'astonishment-fear',
  thorybos: 'confusion',
  agonia: 'anguished anxiety',
  eleos: 'pity',
  phthonos: 'envy',
  zelotypia: 'jealousy',
  penthos: 'mourning',
  achos: 'anguished grief',
  // Eupatheiai
  chara: 'rational joy',
  boulesis: 'rational wishing',
  eulabeia: 'rational caution',
  eupatheia: 'good emotion',
  // Virtues
  phronesis: 'practical wisdom',
  dikaiosyne: 'justice',
  andreia: 'courage',
  sophrosyne: 'temperance',
  // Architecture terms
  prohairesis: 'moral choice / ruling faculty',
  kathekon: 'appropriate action',
  katorthoma: 'right action',
  oikeiosis: 'appropriation / circles of concern',
  eudaimonia: 'flourishing',
  axia: 'worth / value',
  // Affect descriptors
  ataraxia: 'tranquillity',
}

/**
 * Make a per-section glosser. The returned function glosses a controlled-
 * vocabulary term on its FIRST occurrence within this section and renders it
 * bare on subsequent occurrences within the same section. Per the founder
 * decision (2026-05-14), glossing is per-section, not response-wide — a reader
 * who jumps into a single section sees the terms glossed in their context.
 *
 * Output is Markdown-formatted: `*term* (gloss)` on first occurrence, `*term*`
 * after. A term not in the controlled vocabulary is returned bare (no italics,
 * no gloss).
 */
function makeSectionGlosser(): (term: string) => string {
  const seen = new Set<string>()
  return (term: string): string => {
    const key = term.toLowerCase()
    const gloss = GREEK_GLOSSARY[key]
    if (!gloss) return term
    if (seen.has(key)) return `*${term}*`
    seen.add(key)
    return `*${term}* (${gloss})`
  }
}

// ============================================================================
// SOURCE-MATERIAL FRAMING TABLES (keyed framing tables — deterministic)
//
// The contextual heading line above each retrieved passage. Composed
// deterministically from the assessment's principal findings. NOT LLM-composed
// (that would break the determinism property).
// ============================================================================

/** Framing fragment for the principal-passion finding, keyed by root passion. */
const PASSION_SOURCE_FRAMING: Record<RootPassion, string> = {
  epithumia: 'irrational desire and the judgement that an absent external is good',
  hedone: 'irrational pleasure and the judgement that a present external is good',
  phobos: 'fear and the judgement of a future evil',
  lupe: 'distress and the judgement of a present evil',
}

/** Framing fragment for the principal-mechanism finding, keyed by the
 *  improvement_path mechanism. */
const MECHANISM_SOURCE_FRAMING: Record<
  ImprovementPathStructured['mechanism_applies'],
  string
> = {
  passion_diagnosis:
    'the correction of false judgements at the moment of impression',
  control_filter:
    'the discipline of attending to what lies within moral choice',
  oikeiosis: 'the ordering of obligation across the circles of concern',
  value_assessment: 'the indifferents and the criterion of good and evil',
  kathekon_assessment:
    'appropriate action and the source of the reason for acting',
}

/** Framing fragment for the residual case, keyed by katorthoma proximity. */
const PROXIMITY_SOURCE_FRAMING: Record<KatorthomaProximity, string> = {
  reflexive: 'reasoning that moves below the threshold of deliberation',
  habitual: 'reasoning that follows convention without testing the impression',
  deliberate: 'reasoning that weighs impressions consciously',
  principled: 'reasoning that rests on stable commitment to virtue',
  sage_like: 'reasoning that approaches perfected understanding',
}

/** Framing fragment for a virtue domain, keyed by virtue. */
const VIRTUE_SOURCE_FRAMING: Record<VirtueDomain, string> = {
  phronesis: 'practical wisdom',
  dikaiosyne: 'justice',
  andreia: 'courage',
  sophrosyne: 'temperance',
}

// ============================================================================
// DETERMINISTIC HELPERS — input characterisation + principal findings
// ============================================================================

/** Humanise an underscore_separated enum value for display. */
function humanise(value: string): string {
  return value.replace(/_/g, ' ')
}

/**
 * Compose the one-paragraph "Input observed" characterisation deterministically
 * from the assessment alone. Used when the caller does not supply an explicit
 * `input_observed` — preserves philosophical mode's determinism property
 * (Layer2Assessment carries no original input text).
 */
function composeInputObserved(assessment: R17eFilteredAssessment): string {
  const passions = assessment.passion_diagnosis.passions_detected
  const valueErrors = assessment.value_assessment.indifferents_at_stake.filter(
    (i) => i.error !== null
  )
  const rfs = assessment.ruling_faculty_state?.trim()
  const rfsClause = rfs ? ` The ruling faculty is described as: ${rfs}` : ''

  if (passions.length > 0) {
    const p = passions[0]
    const sub = p.sub_species ? ` (sub-species ${p.sub_species})` : ''
    return (
      `The assessment characterises the principal dynamic as ${p.root_passion}${sub}, ` +
      `lodged at the ${p.causal_stage_affected} stage of the causal sequence.${rfsClause}`
    )
  }
  if (valueErrors.length > 0) {
    const v = valueErrors[0]
    return (
      `The assessment's principal finding is a value error: the indifferent ` +
      `${humanise(v.name)} is treated as ${v.treated_as}.${rfsClause}`
    )
  }
  return (
    `The assessment characterises the reasoning as ${assessment.katorthoma_proximity}; ` +
    `no principal passion or value error was identified.${rfsClause}`
  )
}

interface PrincipalFinding {
  kind: 'passion' | 'mechanism' | 'value_error' | 'proximity' | 'virtue'
  /** The framing fragment for the source-material heading line. */
  framing: string
}

/**
 * Select up to three principal findings from the assessment, in the spec's
 * preferred order: principal-passion → principal-mechanism → principal-value-
 * error. When fewer than three are present, the residual cases (proximity,
 * virtue domains) fill the remaining slots. Deterministic.
 */
function selectPrincipalFindings(
  assessment: R17eFilteredAssessment
): PrincipalFinding[] {
  const findings: PrincipalFinding[] = []

  const passions = assessment.passion_diagnosis.passions_detected
  if (passions.length > 0) {
    const p = passions[0]
    const stage = p.causal_stage_affected
    findings.push({
      kind: 'passion',
      framing: `${PASSION_SOURCE_FRAMING[p.root_passion]}, at the ${stage} stage`,
    })
  }

  const ip = assessment.improvement_path_structured
  if (ip !== null) {
    findings.push({
      kind: 'mechanism',
      framing: MECHANISM_SOURCE_FRAMING[ip.mechanism_applies],
    })
  }

  const valueErrors = assessment.value_assessment.indifferents_at_stake.filter(
    (i) => i.error !== null
  )
  if (valueErrors.length > 0) {
    const v = valueErrors[0]
    findings.push({
      kind: 'value_error',
      framing: `treating ${humanise(v.name)} as ${v.treated_as} rather than as an indifferent`,
    })
  }

  // Residual fill — proximity, then virtue domains — only if we have < 3.
  if (findings.length < 3) {
    findings.push({
      kind: 'proximity',
      framing: PROXIMITY_SOURCE_FRAMING[assessment.katorthoma_proximity],
    })
  }
  for (const virtue of assessment.virtue_domains_engaged) {
    if (findings.length >= 3) break
    findings.push({
      kind: 'virtue',
      framing: VIRTUE_SOURCE_FRAMING[virtue],
    })
  }

  return findings.slice(0, 3)
}

/**
 * Build the RetrieveInput for the source-material retrieve-passages call, per
 * the spec's "Retrieve parameters per philosophical-mode call" table.
 */
export function buildSourceMaterialRetrieveInput(
  assessment: R17eFilteredAssessment
): RetrieveInput {
  const passions = assessment.passion_diagnosis.passions_detected
  const principalPassion = passions.length > 0 ? passions[0] : null
  const ip = assessment.improvement_path_structured
  const valueErrors = assessment.value_assessment.indifferents_at_stake.filter(
    (i) => i.error !== null
  )

  // Compose the free-text query from the principal findings.
  const queryParts: string[] = []
  if (principalPassion) {
    queryParts.push(principalPassion.root_passion)
    if (principalPassion.sub_species) queryParts.push(principalPassion.sub_species)
    queryParts.push(principalPassion.causal_stage_affected)
  }
  if (ip) queryParts.push(ip.mechanism_applies.replace(/_/g, ' '))
  if (valueErrors.length > 0) queryParts.push(valueErrors[0].name.replace(/_/g, ' '))
  if (queryParts.length === 0) {
    // Residual — no principal findings; key the query off proximity + virtues.
    queryParts.push(assessment.katorthoma_proximity)
    queryParts.push(...assessment.virtue_domains_engaged)
  }

  const input: RetrieveInput = {
    query: queryParts.join(' '),
    passage_type_filter: ['mechanism', 'canonical_line', 'example'],
    top_k: 3,
    trace_enabled: false,
  }
  if (principalPassion) {
    input.passion_filter = principalPassion.root_passion
    if (principalPassion.sub_species) {
      input.sub_passion_filter = principalPassion.sub_species
    }
  }
  if (ip) {
    input.mechanism_filter = [ip.mechanism_applies]
  }
  return input
}

// ============================================================================
// JSON PROJECTION (pure, synchronous, deterministic)
// ============================================================================

const SCORE_DEFERRAL_REASON =
  'Sections 4 (Score vector) and 5 (Scalar score) are deferred. The substrate ' +
  'score architecture (kathekon gate, component score, quality multiplier, ' +
  'validity flag, precision band, justification_source) is not yet built and ' +
  'is not carried on Layer2Assessment. Revisit when the score architecture ' +
  'reaches Scaffolded (its natural home is a dedicated score build or the ATL ' +
  'Wrapper build). See decision log: D-PHILOSOPHICAL-MODE-BUILD-WIRED-VERIFIED-2026-05-14.'

const PHILOSOPHICAL_MODE_TITLE = 'Stoic Reasoning Assessment'

/**
 * Project a filtered Layer2Assessment + the injection set into the canonical
 * PhilosophicalModeResponse JSON. Pure, synchronous, deterministic — same
 * inputs produce a byte-identical object.
 */
export function projectPhilosophicalModeJSON(
  filtered: R17eFilteredAssessment,
  injections: Layer3InjectionSet,
  inputObserved: string
): PhilosophicalModeResponse {
  const distress = injections.r20a_distress_passthrough
  const distressActive = distress !== null

  // Section 6 — field-by-field. Replaced by the R20a passthrough when active
  // (the R20a perimeter discipline: distress redirection replaces the
  // assessment content).
  const fields: PhilosophicalModeFields | null = distressActive
    ? null
    : {
        passion_diagnosis: filtered.passion_diagnosis,
        control_filter: filtered.control_filter,
        oikeiosis: filtered.oikeiosis,
        value_assessment: filtered.value_assessment,
        kathekon_assessment: filtered.kathekon_assessment,
        katorthoma_proximity: filtered.katorthoma_proximity,
        ruling_faculty_state: filtered.ruling_faculty_state,
        virtue_domains_engaged: filtered.virtue_domains_engaged,
        improvement_path_structured: filtered.improvement_path_structured,
        stage_scores: filtered.stage_scores,
        hasty_assent_risk: filtered.hasty_assent_risk,
        intake_clarifications: filtered.intake_clarifications,
        layer1_ambiguity_notes: filtered.layer1_ambiguity_notes,
        layer2_ambiguity_notes: filtered.layer2_ambiguity_notes,
      }

  return {
    version: 'philosophical-mode-response-v1',
    mode: 'philosophical',
    opening_wrap: {
      r3_disclaimer: injections.r3_disclaimer,
    },
    title_block: {
      title: PHILOSOPHICAL_MODE_TITLE,
      input_observed: inputObserved,
      r18a_category_framing: injections.r18a_category,
    },
    verdict: {
      is_kathekon: filtered.kathekon_assessment.is_kathekon,
      quality: filtered.kathekon_assessment.quality,
      justification: filtered.kathekon_assessment.justification,
      justification_source: null,
    },
    score: {
      deferred: true,
      deferral_reason: SCORE_DEFERRAL_REASON,
    },
    fields,
    distress_passthrough: distress,
    closing_wraps: {
      r19c_limitations: injections.r19_limitations,
      r19d_mirror_principle: injections.r19_mirror_principle,
      r18e_transparency_notice: injections.r18e_transparency_notice,
    },
    meta: {
      distress_passthrough_active: distressActive,
      score_sections_deferred: true,
      r17e_exclusion_applied: true,
    },
  }
}

// ============================================================================
// MARKDOWN PROJECTION (pure, synchronous, deterministic for the structured
// content; the source-material section is passed in already-rendered)
//
// Empty-field omission applies here (NOT in the JSON). Per the spec, the
// always-present sections are: Verdict, Katorthoma proximity, Hasty-assent
// risk, and the principal Layer 2 fields (passion diagnosis, control filter,
// oikeiosis, value assessment, kathekon assessment). Sections omitted when
// empty: improvement path, soft clarifications, open deferrals, ambiguity
// notes, and individual not_applied stages within stage scores.
// ============================================================================

const STAGE_SCORE_ORDER: ReadonlyArray<keyof StageScores> = [
  'control_filter',
  'passion_diagnosis',
  'oikeiosis',
  'value_assessment',
  'kathekon_assessment',
  'iterative_refinement',
]

function renderPassionDiagnosisSection(pd: PassionDiagnosis): string {
  const gloss = makeSectionGlosser()
  const lines: string[] = ['### a. Passion diagnosis', '']
  if (pd.passions_detected.length === 0) {
    lines.push('No passion was detected in this submission.')
  } else {
    pd.passions_detected.forEach((p: PassionDiagnosisEntry, idx: number) => {
      if (idx > 0) lines.push('')
      lines.push(`**Passion ${idx + 1} — ${p.name}**`, '')
      lines.push(`- **Root:** ${gloss(p.root_passion)}`)
      if (p.sub_species) {
        lines.push(`- **Sub-species:** ${gloss(p.sub_species)}`)
      }
      lines.push(`- **Causal stage affected:** ${gloss(p.causal_stage_affected)}`)
      lines.push(`- **False judgement:** ${p.false_judgement}`)
      lines.push(`- **Correct judgement:** ${p.correct_judgement}`)
      lines.push(`- **Evidence:** ${p.evidence}`)
    })
  }
  if (pd.causal_stage_affected) {
    lines.push('')
    lines.push(
      `**Principal causal stage:** ${gloss(pd.causal_stage_affected)}`
    )
  }
  return lines.join('\n')
}

function renderControlFilterSection(cf: ControlFilter): string {
  const gloss = makeSectionGlosser()
  const lines: string[] = ['### b. Control filter', '']
  const renderItems = (
    label: string,
    items: ControlFilterClassifiedItem[]
  ): void => {
    lines.push(`**${label}:**`)
    if (items.length === 0) {
      lines.push('- (none)')
    } else {
      for (const it of items) {
        lines.push(
          `- ${it.item} — agent-named position: ${it.agent_named_position}; ` +
            `classification: ${it.classification}; reasoning: ${it.reasoning}`
        )
      }
    }
    lines.push('')
  }
  // "prohairesis" is glossed on first occurrence in this section.
  renderItems(`Within ${gloss('prohairesis')}`, cf.within_prohairesis)
  renderItems(`Outside ${gloss('prohairesis')}`, cf.outside_prohairesis)
  renderItems('Disambiguation required', cf.disambiguation_required)
  return lines.join('\n').trimEnd()
}

function renderOikeiosisSection(oik: Oikeiosis): string {
  const gloss = makeSectionGlosser()
  const lines: string[] = [`### c. ${gloss('oikeiosis')}`, '']
  if (oik.relevant_circles.length === 0) {
    lines.push('No oikeiosis circles were assessed for this submission.')
  } else {
    oik.relevant_circles.forEach((c: OikeiosisCircleAssessment, idx: number) => {
      if (idx > 0) lines.push('')
      lines.push(`**${humanise(c.circle)} (stage ${c.stage})**`, '')
      lines.push(`- **Description:** ${c.description}`)
      lines.push(`- **Honourability grade:** ${c.honourability_grade}`)
      lines.push(`- **Advantageousness grade:** ${c.advantageousness_grade}`)
      lines.push(`- **Cicero verdict:** ${humanise(c.cicero_verdict)}`)
      lines.push(
        `- **Obligation met:** ${
          c.obligation_met === null ? 'undetermined' : String(c.obligation_met)
        }`
      )
      if (c.tension) lines.push(`- **Tension:** ${c.tension}`)
    })
  }
  if (oik.deliberation_notes && oik.deliberation_notes.trim().length > 0) {
    lines.push('')
    lines.push(`**Deliberation notes:** ${oik.deliberation_notes}`)
  }
  return lines.join('\n')
}

function renderValueAssessmentSection(va: ValueAssessment): string {
  const gloss = makeSectionGlosser()
  const lines: string[] = ['### d. Value assessment', '']
  if (va.indifferents_at_stake.length === 0) {
    lines.push('No indifferents were identified at stake in this submission.')
  } else {
    lines.push(
      `Each indifferent is graded by ${gloss('axia')} and by how it was treated.`,
      ''
    )
    va.indifferents_at_stake.forEach(
      (i: IndifferentAtStakeAssessment, idx: number) => {
        if (idx > 0) lines.push('')
        lines.push(`**${capitalise(humanise(i.name))}**`, '')
        lines.push(`- **Axia grade:** ${i.axia}`)
        lines.push(`- **Treated as:** ${i.treated_as}`)
        lines.push(`- **Evidence:** ${i.evidence}`)
        if (i.error) lines.push(`- **Error:** ${i.error}`)
      }
    )
  }
  if (va.value_error) {
    lines.push('')
    lines.push(`**Value error:** ${va.value_error}`)
  }
  return lines.join('\n')
}

function renderKathekonAssessmentSection(ka: KathekonAssessment): string {
  const gloss = makeSectionGlosser()
  const lines: string[] = [
    `### e. ${gloss('kathekon')} assessment`,
    '',
  ]
  lines.push(
    `- **Is kathekon:** ${
      ka.is_kathekon === null ? 'undetermined' : String(ka.is_kathekon)
    }`
  )
  lines.push(`- **Quality:** ${ka.quality}`)
  lines.push(`- **Justification:** ${ka.justification}`)
  lines.push('')
  lines.push(
    '*Raw kathekon fields, shown separately from the Verdict above for transparency.*'
  )
  return lines.join('\n')
}

function renderImprovementPathSection(
  ip: ImprovementPathStructured | null
): string | null {
  // Omitted when null (empty-field omission rule).
  if (ip === null) return null
  const lines: string[] = ['### h. Improvement path', '']
  lines.push(`- **False judgement to correct:** ${ip.false_judgement_to_correct}`)
  lines.push(`- **Corrected judgement:** ${ip.corrected_judgement}`)
  lines.push(`- **Mechanism applies:** ${humanise(ip.mechanism_applies)}`)
  return lines.join('\n')
}

function renderStageScoresSection(ss: StageScores): string | null {
  // Each stage with a not_applied value is omitted. If every stage is
  // not_applied, the whole section is omitted.
  const rendered: string[] = []
  for (const key of STAGE_SCORE_ORDER) {
    const value: StageScore = ss[key]
    if (value === 'not_applied') continue
    rendered.push(`- **${capitalise(humanise(key))}:** ${value}`)
  }
  if (rendered.length === 0) return null
  return ['### i. Stage scores', '', ...rendered].join('\n')
}

function renderSoftClarificationsSection(
  clarifications: SoftClarification[]
): string | null {
  // Omitted when empty.
  if (clarifications.length === 0) return null
  const lines: string[] = ['### Soft clarifications', '']
  clarifications.forEach((c: SoftClarification, idx: number) => {
    if (idx > 0) lines.push('')
    lines.push(`**${c.trigger_code}** (tier ${c.intake_tier}, stem ${c.stem_id})`, '')
    lines.push(`- **Scope of change:** ${c.scope_of_change}`)
    const slotKeys = Object.keys(c.slot_fills)
    if (slotKeys.length > 0) {
      lines.push(
        `- **Slot fills:** ${slotKeys
          .map((k) => `${k}=${c.slot_fills[k]}`)
          .join('; ')}`
      )
    }
  })
  return lines.join('\n')
}

function renderOpenDeferralsSection(
  deferrals: OpenDeferralEntry[]
): string | null {
  // Omitted when empty. When present, the full withheld_classification
  // structure is shown — philosophical mode's transparency purpose: the reader
  // sees exactly what the engine declined to determine and why.
  if (deferrals.length === 0) return null
  const lines: string[] = ['### Open deferrals (principled withholding)', '']
  deferrals.forEach((d: OpenDeferralEntry, idx: number) => {
    if (idx > 0) lines.push('')
    lines.push(
      `**${d.trigger_code}** (tier ${d.intake_tier}, stem ${d.stem_id}, status ${d.status})`,
      ''
    )
    lines.push(`- **Withheld classification — field path:** ${d.withheld_classification.field_path}`)
    lines.push(
      `- **Withheld at position:** ${d.withheld_classification.withheld_at_position}`
    )
    lines.push(`- **Reason:** ${d.withheld_classification.reason}`)
    const slotKeys = Object.keys(d.slot_fills)
    if (slotKeys.length > 0) {
      lines.push(
        `- **Slot fills:** ${slotKeys
          .map((k) => `${k}=${d.slot_fills[k]}`)
          .join('; ')}`
      )
    }
  })
  return lines.join('\n')
}

function renderAmbiguityNotesSection(
  layer1Notes: string[],
  layer2Notes: string[]
): string | null {
  // Omitted when both note arrays are empty.
  if (layer1Notes.length === 0 && layer2Notes.length === 0) return null
  const lines: string[] = ['### k. Ambiguity notes', '']
  if (layer1Notes.length > 0) {
    lines.push('**Layer 1:**')
    for (const n of layer1Notes) lines.push(`- ${n}`)
  }
  if (layer2Notes.length > 0) {
    if (layer1Notes.length > 0) lines.push('')
    lines.push('**Layer 2:**')
    for (const n of layer2Notes) lines.push(`- ${n}`)
  }
  return lines.join('\n')
}

function capitalise(s: string): string {
  if (s.length === 0) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Render the source-material Markdown section from the retrieved passages and
 * the selected principal findings. Each passage renders as a blockquote with a
 * contextual heading line and a citation line, per the spec's rendering shape.
 * Returns a graceful note when no passages are available.
 */
export function renderSourceMaterialMarkdown(
  passages: RetrievedPassage[],
  findings: PrincipalFinding[]
): string {
  const lines: string[] = ['## Source material', '']
  lines.push(
    '*Passages retrieved from the Stoic corpus, keyed to the principal findings above.*',
    ''
  )
  if (passages.length === 0) {
    lines.push(
      '*Source-material retrieval returned no passages for this assessment.*'
    )
    return lines.join('\n')
  }
  passages.forEach((p: RetrievedPassage, idx: number) => {
    // Framings adapt when there are fewer findings than passages: cycle the
    // available framings; fall back to the passage's own mechanism when none.
    const framing =
      findings.length > 0
        ? findings[idx % findings.length].framing
        : p.canonical_mechanism.length > 0
          ? humanise(p.canonical_mechanism[0])
          : 'the Stoic corpus'
    if (idx > 0) lines.push('')
    lines.push(`**On ${framing}:**`, '')
    lines.push(`> *"${p.text}"*`, '')
    lines.push(`— ${p.source_citation}`)
  })
  return lines.join('\n')
}

/**
 * Render the full Markdown text rendering from the JSON payload + the
 * already-rendered source-material section. Pure, synchronous, deterministic.
 *
 * Section ordering follows the spec: opening wrap → title block → verdict →
 * score (deferred note) → field-by-field (or R20a passthrough) → source
 * material → closing wraps.
 */
export function renderPhilosophicalModeMarkdown(
  json: PhilosophicalModeResponse,
  sourceMaterialMarkdown: string
): string {
  const blocks: string[] = []

  // Section 1 — mandatory opening wrap (R3).
  blocks.push(`**${json.opening_wrap.r3_disclaimer}**`)
  blocks.push('---')

  // Section 2 — title block. R18a category framing sits here when present.
  blocks.push(`# ${json.title_block.title}`)
  if (json.title_block.r18a_category_framing) {
    blocks.push(`*${json.title_block.r18a_category_framing}*`)
  }
  blocks.push(`**Input observed.** ${json.title_block.input_observed}`)
  blocks.push('---')

  // Section 3 — Verdict.
  {
    const v = json.verdict
    const verdictLines: string[] = ['## Verdict', '']
    verdictLines.push(
      `**Appropriate action (kathekon):** ${
        v.is_kathekon === null
          ? 'undetermined'
          : v.is_kathekon
            ? 'yes'
            : 'no'
      }`
    )
    verdictLines.push(`**Quality:** ${v.quality}`)
    verdictLines.push(`**Justification:** ${v.justification}`)
    blocks.push(verdictLines.join('\n'))
    blocks.push('---')
  }

  // Sections 4 + 5 — Score. Deferred this session — a one-line transparency
  // note where the score sections sit (philosophical mode is a transparency
  // surface; silently hiding the deferral would be dishonest).
  blocks.push(
    '*Score breakdown and scalar score: deferred to a future build — the ' +
      'substrate score architecture is not yet built. See the decision log ' +
      '(D-PHILOSOPHICAL-MODE-BUILD-WIRED-VERIFIED-2026-05-14).*'
  )
  blocks.push('---')

  // Section 6 — field-by-field rendering, OR the R20a distress passthrough
  // (which replaces section 6's content when a distress signal is active).
  if (json.distress_passthrough !== null) {
    blocks.push(['## Response', '', json.distress_passthrough].join('\n'))
  } else if (json.fields !== null) {
    const f = json.fields
    blocks.push('## Assessment')

    // Always-present sections.
    blocks.push(renderPassionDiagnosisSection(f.passion_diagnosis))
    blocks.push(renderControlFilterSection(f.control_filter))
    blocks.push(renderOikeiosisSection(f.oikeiosis))
    blocks.push(renderValueAssessmentSection(f.value_assessment))
    blocks.push(renderKathekonAssessmentSection(f.kathekon_assessment))

    // Katorthoma proximity — always present.
    {
      const gloss = makeSectionGlosser()
      blocks.push(
        [
          `### f. ${gloss('katorthoma')} proximity`,
          '',
          `**Proximity:** ${f.katorthoma_proximity}`,
        ].join('\n')
      )
    }

    // Virtue domains engaged — always present (may be an empty list).
    {
      const gloss = makeSectionGlosser()
      const virtueLines: string[] = ['### g. Virtue domains engaged', '']
      if (f.virtue_domains_engaged.length === 0) {
        virtueLines.push('No virtue domains were identified as engaged.')
      } else {
        for (const v of f.virtue_domains_engaged) {
          virtueLines.push(`- ${gloss(v)}`)
        }
      }
      blocks.push(virtueLines.join('\n'))
    }

    // Improvement path — omitted when null.
    const improvementPath = renderImprovementPathSection(
      f.improvement_path_structured
    )
    if (improvementPath !== null) blocks.push(improvementPath)

    // Stage scores — omitted when every stage is not_applied.
    const stageScores = renderStageScoresSection(f.stage_scores)
    if (stageScores !== null) blocks.push(stageScores)

    // Hasty-assent risk — always present.
    blocks.push(
      ['### j. Hasty-assent risk', '', `**Risk:** ${f.hasty_assent_risk}`].join(
        '\n'
      )
    )

    // Soft clarifications — omitted when empty.
    const softClarifications = renderSoftClarificationsSection(
      f.intake_clarifications.soft_clarifications
    )
    if (softClarifications !== null) blocks.push(softClarifications)

    // Open deferrals — omitted when empty.
    const openDeferrals = renderOpenDeferralsSection(
      f.intake_clarifications.open_deferrals
    )
    if (openDeferrals !== null) blocks.push(openDeferrals)

    // Ambiguity notes — omitted when both note arrays are empty.
    const ambiguityNotes = renderAmbiguityNotesSection(
      f.layer1_ambiguity_notes,
      f.layer2_ambiguity_notes
    )
    if (ambiguityNotes !== null) blocks.push(ambiguityNotes)

    blocks.push('---')
  }

  // Section 7 — source material (Markdown only).
  blocks.push(sourceMaterialMarkdown)
  blocks.push('---')

  // Section 8 — mandatory closing wraps.
  {
    const closingLines: string[] = []
    closingLines.push(`**${json.closing_wraps.r19c_limitations}**`)
    if (json.closing_wraps.r19d_mirror_principle) {
      closingLines.push('')
      closingLines.push(`**${json.closing_wraps.r19d_mirror_principle}**`)
    }
    closingLines.push('')
    closingLines.push(`**${json.closing_wraps.r18e_transparency_notice}**`)
    blocks.push(closingLines.join('\n'))
  }

  return blocks.join('\n\n')
}

// ============================================================================
// THE PHILOSOPHICAL-MODE RENDERER
// ============================================================================

/**
 * Render philosophical mode for one assessment. Async because the source-
 * material section makes a retrieve-passages call (database + embedding). The
 * structured content (JSON + Markdown body) is deterministic from Layer 2
 * alone; the source-material section is deterministic given the retrieval
 * inputs.
 *
 * Failure isolation: a retrieve-passages failure degrades the source-material
 * section to a graceful note — it never fails the whole render.
 */
async function renderPhilosophicalMode(
  input: Layer3ModeRenderInput
): Promise<Layer3ModeRenderResult> {
  // Step 1 — apply the R17e exclusion filter BEFORE any projection runs.
  const filtered = applyR17eExclusionFilter(input.assessment)

  // Step 2 — build the six mandatory wraps via the existing injection layer.
  // These are taken verbatim from layer3-service.ts — this module never
  // re-authors a wrap string. The R20a passthrough decision is made here,
  // synchronously, before the response is constructed.
  const isMentorFlavoured = input.consumer_context.is_mentor_flavoured ?? false
  const includeCategoryFraming =
    input.consumer_context.include_category_framing ?? false
  const injections: Layer3InjectionSet = {
    r3_disclaimer: injectR3Disclaimer(),
    r19_limitations: injectR19Limitations(),
    r19_mirror_principle: injectR19MirrorPrinciple(isMentorFlavoured),
    r20a_distress_passthrough: injectR20aDistressPassthrough(
      input.assessment,
      input.distress_gate
    ),
    r18a_category: injectR18aCategory(includeCategoryFraming),
    r18e_transparency_notice: injectR18eTransparencyNotice(),
  }

  // Step 3 — compose the Input observed characterisation (caller override, or
  // a deterministic composition from the assessment).
  const inputObserved =
    input.input_observed && input.input_observed.trim().length > 0
      ? input.input_observed.trim()
      : composeInputObserved(filtered)

  // Step 4 — project the canonical JSON. Pure, synchronous.
  const json = projectPhilosophicalModeJSON(filtered, injections, inputObserved)

  // Step 5 — source material. Skipped entirely when the R20a passthrough is
  // active (the passthrough replaces the assessment content; appending Stoic
  // passages after a distress redirection would be inappropriate).
  let sourceMaterialMarkdown: string
  if (json.distress_passthrough !== null) {
    sourceMaterialMarkdown = ''
  } else {
    const findings = selectPrincipalFindings(filtered)
    const retrieveInput = buildSourceMaterialRetrieveInput(filtered)
    const retrieveFn: RetrievePassagesFn =
      input.retrievePassagesFn ?? retrievePassages
    let passages: RetrievedPassage[] = []
    try {
      const result = await retrieveFn(retrieveInput)
      passages = result.passages
    } catch (err) {
      // Graceful degradation — a retrieval failure must not fail the render.
      // eslint-disable-next-line no-console
      console.warn(
        '[philosophical-mode-service] retrieve-passages failed; ' +
          'source-material section degraded:',
        err
      )
      passages = []
    }
    sourceMaterialMarkdown = renderSourceMaterialMarkdown(passages, findings)
  }

  // Step 6 — render the Markdown text rendering.
  const markdown = renderPhilosophicalModeMarkdown(json, sourceMaterialMarkdown)

  return {
    mode: 'philosophical',
    json,
    markdown,
  }
}

// ============================================================================
// THE LAYER 3 MODE-DISPATCH ENTRY POINT (PR1 — single-endpoint proof)
//
// This is the dispatch pattern the four-mode build arc is proven on. Today the
// switch handles 'philosophical' only; standard / private / atl_wrapper extend
// the same switch in subsequent build sessions. The mandatory-injection layer
// (layer3-service.ts) is shared by every mode regardless.
//
// PR2: the test file (__tests__/philosophical-mode-service.test.ts) invokes
// this entry point in the same session this module is written — build-to-wire-
// verification is immediate.
// ============================================================================

/**
 * Render a Layer 3 response in the requested mode. Branches on `mode`; today
 * only 'philosophical' is implemented. Throws on an unimplemented mode rather
 * than silently producing nothing.
 */
export async function renderLayer3Mode(
  input: Layer3ModeRenderInput
): Promise<Layer3ModeRenderResult> {
  switch (input.mode) {
    case 'philosophical':
      return renderPhilosophicalMode(input)
    default: {
      // Exhaustiveness guard — when a new mode is added to Layer3RenderMode
      // without a case here, this line stops compiling.
      const unimplemented: never = input.mode
      throw new Error(
        `Layer 3 render mode '${String(unimplemented)}' is not implemented yet. ` +
          'Implemented modes: philosophical.'
      )
    }
  }
}
