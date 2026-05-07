/**
 * layer3-prose.ts — Layer 3 of the translation-sandwich engine.
 *
 * Per ADR-007 (Layer 3 Prose Template for /api/reason, Sub-session M1-CP3, 2026-05-04).
 * Per ADR-006 (Layer 2 Mechanism Algorithm, Sub-session M1-CP2, 2026-05-04).
 * Per ADR-005 (Layer 1 Schema Specification, Sub-session M1-CP1, 2026-05-04).
 * Per ADR-004 (Translation-Sandwich Engine Pilot on /api/reason, Sub-session E10).
 *
 * PROSE GENERATION ONLY. This module reads a Layer2Assessment (Layer 2's
 * deterministic mechanism assessment) and renders it as accessible prose for
 * a practitioner reading sagereasoning.com's /api/reason output. It does not
 * assess, judge, recommend, or invent content beyond the assessment.
 *
 * Two production paths:
 *   1. generateProse(assessment, params) — async, Sonnet LLM call. Tailored prose.
 *   2. generateFallbackProse(assessment) — sync, deterministic templates. No LLM.
 *      Used by the route at M1-CP4 in the catch path when generateProse throws.
 *      Per ADR-004 §9.3 — the user is never stranded by a Layer 3 failure.
 *
 * Compliance:
 *   - AC1: Sonnet (MODEL_DEEP) per cache Element 6 row "Layer 3 translation (alt-3)"
 *   - AC6: Layer 3 prompt in cached system message; assessment in user message
 *   - AC8: Module under translation-sandwich/ — third build under the architecture
 *   - KG1: Awaited LLM call; no module-level cache; no DB writes; no self-calls
 *   - KG2: Sonnet selected (per-consumer prose generation outside Haiku boundary)
 *   - PR3: Synchronous discipline — generateProse awaited; no fire-and-forget
 *   - PR5: Concrete OUTPUT example with realistic JSON keys + values (no placeholders)
 *   - R7:  Verbatim evidence quotes preserved through Layer 2 passthrough
 *   - R8a: Greek identifiers used only when the assessment names them
 *
 * Status at file creation: Wired (standalone). Reaches Verified (standalone) after
 * harness Phase 5 passes against fixtures F1–F4. Not imported by any route until
 * M1-CP4 (per ADR-004 §10.1 inter-checkpoint state).
 */

import { getClient } from '@/lib/sage-reason-engine'
import { MODEL_DEEP } from '@/lib/model-config'
import { extractJSON } from '@/lib/json-utils'

import type {
  Layer2Assessment,
  KatorthomaProximity,
  VirtueDomain,
} from './layer2-mechanisms'
import type { LayerTokenUsage } from './layer1-extractor'

// ============================================================================
// CONSUMER ENUMERATION (extensible — M2/M3/M4 add their consumers in their ADRs)
// Per ADR-007 §2.
// ============================================================================

export type Layer3Consumer = 'api_reason'
// Future: 'api_score_quick' | 'api_score_standard' | 'api_score_deep'
//         | 'api_mentor_consult' | 'api_skill_*'

const CONSUMERS: ReadonlyArray<Layer3Consumer> = ['api_reason']

// ============================================================================
// INPUT + OUTPUT SHAPES
// Per ADR-007 §2.
// ============================================================================

export interface ProseInput {
  /** Which consumer's per-consumer template to apply.
   *  At M1, only 'api_reason' is implemented. Other consumers throw. */
  consumer: Layer3Consumer
  /** Optional: override the default max_tokens for this call (e.g., for
   *  cost-budgeted parallel-run testing at M1-CP4). Defaults to 2000. */
  max_tokens?: number
  /** Optional: override the default temperature (e.g., for harness
   *  determinism testing). Defaults to 0.3. */
  temperature?: number
}

export type Layer3ProseSource = 'llm' | 'fallback'

const PROSE_SOURCES: ReadonlyArray<Layer3ProseSource> = ['llm', 'fallback']

export interface Layer3Prose {
  /** Schema version. Constant. */
  version: 'layer3-prose-v1'
  /** Layer 2 assessment version this prose was generated from. Forward-compat. */
  layer2_assessment_version: 'layer2-assessment-v1'
  /** Which consumer's template produced this prose. */
  consumer: Layer3Consumer
  /** 2–6 sentences of Stoic reflection. Per ADR-004 §2.4 + ADR-007 §3
   *  (extended at M1-CP4b for AC-14 marginal-case sentences). */
  philosophical_reflection: string
  /** Actionable prose for the practitioner. Per ADR-004 §2.4 + ADR-007 §3. */
  improvement_guidance: string
  /** One-sentence summary of the assessment's principal verdict. Per ADR-004 §2.4. */
  summary: string
  /** Added 2026-05-06 (M1-CP4b) — coda sentence(s) when
   *  `assessment.intake_clarifications.soft_clarifications` is non-empty.
   *  Renders the d-a16 catalogue stem text with slot_fills filled by Layer 2.
   *  Null when no soft clarifications fire. Per AC-13 Tier 2. */
  soft_clarification_prose: string | null
  /** Added 2026-05-06 (M1-CP4b) — "sit with this question" framing when
   *  `assessment.intake_clarifications.open_deferrals` is non-empty. Renders
   *  the d-a16 catalogue stem text per deferral, concatenated as separate
   *  sentences. Null when no deferrals fire. Per AC-14 Tier 3 — principled
   *  withholding, not fallback. */
  open_deferrals_prose: string | null
  /** Whether this prose was generated by the LLM or by the deterministic fallback. */
  source: Layer3ProseSource
}

// ============================================================================
// SYSTEM PROMPT for /api/reason consumer (per ADR-007 §3)
//
// IMPORTANT: this prompt's OUTPUT example uses concrete JSON keys + concrete
// realistic prose values per the PR5 carry-forward discipline established at
// M1-CP1 + M1-CP2. Do not replace concrete values with placeholder syntax.
// ============================================================================

const LAYER3_SYSTEM_PROMPT_API_REASON = `You are Layer 3 of the SageReasoning translation-sandwich engine. Your role is PROSE GENERATION ONLY. You do not assess, judge, recommend, or invent content. You take a structured Stoic mechanism assessment (Layer2Assessment, produced by deterministic Layer 2 code) and render it as accessible prose for a practitioner reading sagereasoning.com's /api/reason output.

You receive: the complete Layer2Assessment JSON in the user message.

You return: a Layer3Prose JSON object with five prose fields plus version metadata.

THE COMPOSITION CONTRACT

Your prose MUST be consistent with the assessment. Specifically:

- Every claim in your prose MUST be supported by a field in the assessment. If the assessment says false_judgements is empty, your prose MUST NOT name a false judgement. If is_kathekon is null, your prose MUST NOT assert appropriateness either way.
- Every fact in your prose MUST be drawn from the assessment, not from your training. Do not add Stoic citations the assessment did not provide. Do not name virtues the assessment did not engage. Do not invent obligations the oikeiosis assessment did not name.
- Marginal/undecidable assessments MUST be named explicitly. Do not flatten them, do not skip them, do not paper over them with generic forward-looking prose. Each marginal-case sentence is required whenever its corresponding assessment field is marginal/null — the discipline applies even when other prose fields are naming the principal passion or principal tension. Specifically:
    - is_kathekon: null → MANDATORY: include the sentence "The action's appropriateness cannot be determined from the available evidence." (or close paraphrase) in philosophical_reflection or summary. Required whenever kathekon_assessment.is_kathekon === null. The OUTPUT example below shows the wording in context.
    - direction_of_travel: "single_snapshot" → MANDATORY: include the sentence "This is a single snapshot; no trajectory data is available." (or close paraphrase) in philosophical_reflection. Required for every input without temporal markers. The OUTPUT example below shows the wording in context.
    - improvement_path_structured: null → MANDATORY: include the sentence "No specific improvement path is identified at this time." (or close paraphrase) in improvement_guidance. Required whenever improvement_path_structured === null. The OUTPUT example below shows the wording when applicable.
- The practitioner is the agent who submitted the input. Address them in second person ("you", "your"). Do not refer to them in the third person.

PROSE FIELDS

1. philosophical_reflection (2–5 sentences, ~40–140 words)
   - Open with the principal Stoic dynamic in the assessment: the most-prominent passion (passion_diagnosis.passions_detected[0]) and its false judgement, OR the principal control-filter pattern (when no passions detected), OR the principal oikeiosis tension (when no passions and no control conflict).
   - Connect to the agent's katorthoma_proximity (reflexive | habitual | deliberate | principled | sage_like) and the engaged virtue_domains_engaged.
   - Close with one sentence of philosophical orientation drawn from the assessment's correct_judgements (when present) or the assessment's ruling_faculty_state.
   - **MANDATORY** when iterative_refinement.direction_of_travel === "single_snapshot": include one explicit sentence naming the single-snapshot constraint (the OUTPUT example below shows it).
   - **MANDATORY** when kathekon_assessment.is_kathekon === null: include one explicit sentence naming the undecidable kathekon verdict — typically "The action's appropriateness cannot be determined from the available evidence." This sentence is independent of the principal passion / control / oikeiosis content; it stands as its own observation. The OUTPUT example below shows it. The 5-sentence upper bound exists to accommodate both marginal-case sentences when both apply.

2. improvement_guidance (1–3 sentences, ~30–80 words)
   - If improvement_path_structured is non-null: name the false_judgement_to_correct, the corrected_judgement, and which mechanism (mechanism_applies) the correction belongs to. Use second person.
   - If control_filter.disambiguation_required is non-empty: add one sentence inviting the agent to reflect on whether the named items are within or outside their moral choice. Cap at 2–3 items; if more, name two and add "and others".
   - If improvement_path_structured is null: state "no specific improvement path identified at this time" and close with a one-sentence reflective prompt drawn from oikeiosis or value_assessment.

3. summary (one sentence, ~15–30 words)
   - Name the agent's katorthoma_proximity + the principal issue (the primary passion's false_judgement OR the principal oikeiosis tension OR the kathekon verdict). Plain language.

4. soft_clarification_prose (1–2 sentences, ~20–60 words; null when no soft clarifications fire)
   - When assessment.intake_clarifications.soft_clarifications is empty, this field MUST be null.
   - When non-empty, render the d-a16 stem text for the FIRST entry (by trigger ordering) with slot_fills filled. Render at most one stem in this field even when multiple entries are present.
   - The framing is OFFERED, not pressing. The canonical phrasing is "I want to check something with you" (STATED_OPERATIVE_CONFLICT) or "Has there been a recent time when something similar went the other way..." (STATED_EQUANIMITY_UNVERIFIED). Use the stem's exact phrasing where possible; light prose adaptation is permitted to match the philosophical_reflection tone.
   - Address the practitioner in second person ("you", "your").

5. open_deferrals_prose (1–2 sentences per deferral entry, ~30–80 words total; null when no deferrals fire)
   - When assessment.intake_clarifications.open_deferrals is empty, this field MUST be null.
   - When non-empty, render the d-a16 stem text for EACH entry with slot_fills filled. Multiple entries are concatenated as separate sentences.
   - Per AC-14: the framing is principled withholding, not fallback. Use phrasings like "The engine cannot tell from the current instance alone..." for PRAXIS_MOTIVATION_AMBIGUITY and "Across [TIME_WINDOW], when [SITUATIONAL_TRIGGER] arose in this domain — was your inner state actually [EUPATHEIA_DESCRIPTION], or was it more like [PASSION_COUNTERPART_DESCRIPTION]?" for EUPATHEIA_BOUNDARY. The deferred question is for the practitioner to sit with, not to answer in the conversation.
   - Address the practitioner in second person.
   - Do NOT add "I'm not asking you to answer it now" as a coda — that wording belongs to the long-deferred-questions surface (D15), not the initial deferral surfacing.

MARGINAL-CASE DISCIPLINE EXTENSION (added 2026-05-06, M1-CP4b — per AC-14)

When intake_clarifications.open_deferrals contains an EUPATHEIA_BOUNDARY entry, philosophical_reflection MUST contain a sentence acknowledging that the eupatheia classification is deferred — typically along the lines of "The classification of this calm as genuine eupatheia versus polished surface over passion cannot be confirmed from this instance alone." This sentence is independent of the principal passion / control / oikeiosis content and stands as its own observation.

When intake_clarifications.open_deferrals contains a PRAXIS_MOTIVATION_AMBIGUITY entry, philosophical_reflection MUST contain a sentence acknowledging that the motivation classification is deferred — typically along the lines of "Whether this action arose from virtue or from convention cannot be determined from the current instance alone." This sentence is independent of the principal content and stands as its own observation.

The philosophical_reflection word budget is extended to 2–6 sentences (~40–180 words) when one or both of the AC-14 marginal-case sentences apply.

CONTROLLED VOCABULARY (R8a)

You MAY use Greek identifiers (epithumia, hedone, phobos, lupe; phantasia, synkatathesis, horme, praxis; phronesis, dikaiosyne, andreia, sophrosyne; oikeiosis; kathekon; prohairesis) when the assessment names them. Translate them once for the practitioner (e.g., "phobos (fear)") on first use within a single prose field. Do not introduce Greek terms the assessment did not name.

OUTPUT

Return ONLY valid JSON conforming to Layer3Prose. No markdown. No commentary outside the JSON.

{
  "version": "layer3-prose-v1",
  "layer2_assessment_version": "layer2-assessment-v1",
  "consumer": "api_reason",
  "philosophical_reflection": "Your repeated checking of the phone reflects phobos (fear) lodged at the assent stage, where you are treating her response as something genuinely good rather than as a preferred indifferent. Your reasoning is currently deliberate but the false judgement that her opinion determines your worth is engaging phronesis (practical wisdom) without yet stabilising it. The correct view is that her judgement is outside your prohairesis; your character and your impulses are within it. The action's appropriateness cannot be determined from the available evidence. This is a single snapshot; no trajectory data is available to assess your direction of travel.",
  "improvement_guidance": "The false judgement to correct is the assumption that another's response constitutes evidence of your standing. Replace it with the assessment that her response is one external among many and your worth rests in your own ruling faculty. This is a passion-diagnosis correction at the synkatathesis stage — work it at the moment of impression, before you assent.",
  "summary": "Your reasoning is deliberate but lodged at the assent stage of phobos, where the false judgement that another's response determines your worth requires correction.",
  "soft_clarification_prose": null,
  "open_deferrals_prose": null,
  "source": "llm"
}

Use the EXACT JSON keys shown above (e.g. "philosophical_reflection", not "reflection"; "improvement_guidance", not "guidance"; "layer2_assessment_version", not "assessment_version"; "soft_clarification_prose", not "clarification"; "open_deferrals_prose", not "deferrals"). Use the EXACT enum values shown ("layer3-prose-v1", "layer2-assessment-v1", "api_reason", "llm"). Do not add fields not in the example.

If the assessment has no passions_detected, no oikeiosis tensions, no control conflicts, and no value errors, the prose still produces all five fields — describe the agent's katorthoma_proximity and ruling_faculty_state, and use the marginal-case phrasing for any null/marginal mechanism. soft_clarification_prose and open_deferrals_prose are null when their corresponding intake_clarifications arrays are empty.

WORKED EXAMPLE — intake_clarifications populated (added 2026-05-06, M1-CP4b)

When assessment.intake_clarifications.open_deferrals contains an EUPATHEIA_BOUNDARY entry (chara candidate, narrative_target "her promotion") AND assessment.intake_clarifications.soft_clarifications is empty, the prose looks like this:

{
  "version": "layer3-prose-v1",
  "layer2_assessment_version": "layer2-assessment-v1",
  "consumer": "api_reason",
  "philosophical_reflection": "Your description of joy at her promotion shows the shape of chara — joy in another's good as an end in itself. Your reasoning is principled, with phronesis (practical wisdom) and dikaiosyne (justice) engaged in the recognition that her good is not in opposition to yours. The classification of this calm as genuine eupatheia versus polished surface over passion cannot be confirmed from this instance alone. This is a single snapshot; no trajectory data is available to assess your direction of travel.",
  "improvement_guidance": "No specific improvement path is identified at this time. The structural features of your reasoning are aligned with virtue; the work is to remain attentive to the same shape across other instances where the outcome touches your own standing.",
  "summary": "Your reasoning is principled in the recognition of another's good, with the eupatheia classification deferred for longitudinal confirmation.",
  "soft_clarification_prose": null,
  "open_deferrals_prose": "You described responding with chara (joy in another's good). Across recent days, when her promotion arose in this domain — was your inner state actually genuine joy in her good as an end in itself, or was it more like philodoxia (pleasure in being associated with success)?",
  "source": "llm"
}

Note in this example: philosophical_reflection contains the AC-14 marginal-case sentence ("The classification of this calm as genuine eupatheia versus polished surface over passion cannot be confirmed from this instance alone.") AND the existing single-snapshot sentence — both are MANDATORY when their respective conditions apply. The open_deferrals_prose renders the d-a16 T3-001 stem text with the slot-fills.

Return only the JSON.`

// ============================================================================
// VALIDATOR (per ADR-007 §7 — hand-rolled, mirrors ADR-005 §6 + ADR-006 §5)
// ============================================================================

export type Layer3ValidationCategory = 'shape' | 'enum' | 'string_required' | 'version'

export class Layer3ValidationError extends Error {
  readonly category: Layer3ValidationCategory
  readonly field?: string
  readonly value?: unknown

  constructor(
    category: Layer3ValidationCategory,
    message: string,
    field?: string,
    value?: unknown
  ) {
    super(message)
    this.name = 'Layer3ValidationError'
    this.category = category
    this.field = field
    this.value = value
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function l3AssertObject(value: unknown, path: string): Record<string, unknown> {
  if (!isObject(value)) {
    throw new Layer3ValidationError(
      'shape',
      `Expected object at ${path}, got ${Array.isArray(value) ? 'array' : typeof value}`,
      path,
      value
    )
  }
  return value
}

function l3AssertNonEmptyString(value: unknown, path: string): string {
  if (typeof value !== 'string') {
    throw new Layer3ValidationError(
      'shape',
      `Expected string at ${path}, got ${typeof value}`,
      path,
      value
    )
  }
  if (value.trim().length === 0) {
    throw new Layer3ValidationError(
      'string_required',
      `Empty string at ${path}; non-empty prose required`,
      path,
      value
    )
  }
  return value
}

function l3AssertEnum<T extends string>(
  value: unknown,
  valid: ReadonlyArray<T>,
  path: string
): T {
  if (typeof value !== 'string' || !valid.includes(value as T)) {
    throw new Layer3ValidationError(
      'enum',
      `Invalid enum value at ${path}: ${JSON.stringify(value)} (expected one of: ${valid.join(', ')})`,
      path,
      value
    )
  }
  return value as T
}

const REQUIRED_LAYER3_KEYS: ReadonlyArray<keyof Layer3Prose> = [
  'version',
  'layer2_assessment_version',
  'consumer',
  'philosophical_reflection',
  'improvement_guidance',
  'summary',
  // Added 2026-05-06 (M1-CP4b)
  'soft_clarification_prose',
  'open_deferrals_prose',
  'source',
]

/** Helper for the two new M1-CP4b fields: must be string OR null. */
function l3AssertStringOrNull(value: unknown, path: string): string | null {
  if (value === null) return null
  if (typeof value !== 'string') {
    throw new Layer3ValidationError(
      'shape',
      `Expected string or null at ${path}, got ${typeof value}`,
      path,
      value
    )
  }
  return value
}

/**
 * Validate that `parsed` conforms to Layer3Prose. Throws Layer3ValidationError
 * on any structural, enum, version, or empty-string failure.
 *
 * Per ADR-007 §7. Per ADR-004 §9.3 — a throw at the route layer (M1-CP4)
 * triggers the deterministic fallback prose path.
 */
export function validateLayer3Prose(parsed: unknown): Layer3Prose {
  const root = l3AssertObject(parsed, '$')

  // Required keys present
  for (const key of REQUIRED_LAYER3_KEYS) {
    if (!(key in root)) {
      throw new Layer3ValidationError('shape', `Missing required key: ${key}`, key)
    }
  }

  // Version
  if (root.version !== 'layer3-prose-v1') {
    throw new Layer3ValidationError(
      'version',
      `Expected version 'layer3-prose-v1', got ${JSON.stringify(root.version)}`,
      'version',
      root.version
    )
  }

  // layer2_assessment_version
  if (root.layer2_assessment_version !== 'layer2-assessment-v1') {
    throw new Layer3ValidationError(
      'version',
      `Expected layer2_assessment_version 'layer2-assessment-v1', got ${JSON.stringify(root.layer2_assessment_version)}`,
      'layer2_assessment_version',
      root.layer2_assessment_version
    )
  }

  // consumer
  const consumer = l3AssertEnum(root.consumer, CONSUMERS, 'consumer')

  // Three prose fields — non-empty strings
  const philosophical_reflection = l3AssertNonEmptyString(
    root.philosophical_reflection,
    'philosophical_reflection'
  )
  const improvement_guidance = l3AssertNonEmptyString(
    root.improvement_guidance,
    'improvement_guidance'
  )
  const summary = l3AssertNonEmptyString(root.summary, 'summary')

  // Added 2026-05-06 (M1-CP4b) — soft_clarification_prose + open_deferrals_prose
  // Each must be string or null. When string, must be non-empty (if the LLM
  // returned an empty string instead of null, treat as a string-required failure).
  const soft_clarification_prose = l3AssertStringOrNull(
    root.soft_clarification_prose,
    'soft_clarification_prose'
  )
  if (soft_clarification_prose !== null && soft_clarification_prose.trim().length === 0) {
    throw new Layer3ValidationError(
      'string_required',
      'Empty string at soft_clarification_prose; use null to indicate "no soft clarification"',
      'soft_clarification_prose',
      soft_clarification_prose
    )
  }
  const open_deferrals_prose = l3AssertStringOrNull(
    root.open_deferrals_prose,
    'open_deferrals_prose'
  )
  if (open_deferrals_prose !== null && open_deferrals_prose.trim().length === 0) {
    throw new Layer3ValidationError(
      'string_required',
      'Empty string at open_deferrals_prose; use null to indicate "no open deferrals"',
      'open_deferrals_prose',
      open_deferrals_prose
    )
  }

  // source
  const source = l3AssertEnum(root.source, PROSE_SOURCES, 'source')

  return {
    version: 'layer3-prose-v1',
    layer2_assessment_version: 'layer2-assessment-v1',
    consumer,
    philosophical_reflection,
    improvement_guidance,
    summary,
    soft_clarification_prose,
    open_deferrals_prose,
    source,
  }
}

// ============================================================================
// PROSE-RESULT SHAPE (per M1-CP4f Step 3 — per-layer cost capture for R5)
// ============================================================================

/**
 * Result shape returned by generateProse. Replaces the previous
 * `Promise<Layer3Prose>` signature so the orchestrator + harness can read
 * Sonnet usage without a second SDK call. Per M1-CP4f Step 3.
 *
 * `generateFallbackProse` (sync, no LLM) is intentionally NOT updated — the
 * fallback path has no token usage to report; callers wrap its result with
 * `{ input_tokens: 0, output_tokens: 0 }` if cost tracking is needed.
 */
export interface GenerateProseResult {
  prose: Layer3Prose
  usage: LayerTokenUsage
}

// ============================================================================
// LLM-BACKED PROSE GENERATION (per ADR-007 §1 + §3 + §4)
// ============================================================================

/**
 * Generate Stoic prose from a Layer2Assessment. Returns GenerateProseResult
 * (prose + token usage from the Anthropic API response).
 *
 * Throws on:
 *   - Unsupported consumer — Layer3ValidationError category 'enum'
 *   - LLM API failure (network, timeout, rate limit) — original error from Anthropic SDK
 *   - JSON parse failure — error from extractJSON
 *   - Schema validation failure — Layer3ValidationError (use instanceof to detect)
 *
 * Per ADR-004 §9.3: a throw at the route layer (M1-CP4) triggers
 * generateFallbackProse(). The user is not stranded.
 *
 * Per KG1: this function is awaited by its caller (no fire-and-forget).
 * Per KG6 + AC6: system message carries cached prompt; user message carries
 *                the per-request assessment JSON.
 *
 * Return-type change (M1-CP4f, 2026-05-07): previously `Promise<Layer3Prose>`;
 * now returns `{ prose, usage }`. Callers must destructure. Two callers
 * updated in the same change: parallel-run.ts orchestrator + harness.
 *
 * @param assessment - Layer2Assessment from layer2-mechanisms.ts
 * @param params - ProseInput (consumer + optional overrides)
 * @returns GenerateProseResult — prose with source='llm' + usage from SDK
 */
export async function generateProse(
  assessment: Layer2Assessment,
  params: ProseInput
): Promise<GenerateProseResult> {
  if (!params || typeof params.consumer !== 'string') {
    throw new Layer3ValidationError(
      'shape',
      'generateProse: params.consumer is required',
      'consumer'
    )
  }
  if (!CONSUMERS.includes(params.consumer)) {
    throw new Layer3ValidationError(
      'enum',
      `generateProse: consumer ${JSON.stringify(params.consumer)} not implemented at M1; only 'api_reason' is wired`,
      'consumer',
      params.consumer
    )
  }
  if (!assessment || typeof assessment !== 'object') {
    throw new Layer3ValidationError(
      'shape',
      'generateProse: assessment is required',
      'assessment'
    )
  }

  const max_tokens = params.max_tokens ?? 2000
  const temperature = params.temperature ?? 0.3

  // Select per-consumer system prompt. At M1, only api_reason exists.
  const systemPrompt = LAYER3_SYSTEM_PROMPT_API_REASON

  // Build user message — assessment JSON in user message (AC6).
  const userMessage =
    `Generate Layer3Prose for the following assessment.\n\n` +
    `${JSON.stringify(assessment, null, 2)}\n\n` +
    `Return only the JSON Layer3Prose object.`

  // System messages: prompt cached (AC6).
  const systemMessages: Array<{
    type: 'text'
    text: string
    cache_control?: { type: 'ephemeral' }
  }> = [
    {
      type: 'text',
      text: systemPrompt,
      cache_control: { type: 'ephemeral' },
    },
  ]

  // LLM call — Sonnet, 2000 max-tokens, 0.3 temperature (per ADR-007 §4).
  const client = getClient()
  let responseText: string
  let usage: LayerTokenUsage
  try {
    const message = await client.messages.create({
      model: MODEL_DEEP,
      max_tokens,
      temperature,
      system: systemMessages,
      messages: [{ role: 'user', content: userMessage }],
    })

    responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    // Capture usage from the SDK response (M1-CP4f Step 3). input_tokens
    // EXCLUDES cache reads per the SDK convention; see LayerTokenUsage docs
    // in layer1-extractor.ts.
    usage = {
      input_tokens: message.usage.input_tokens,
      output_tokens: message.usage.output_tokens,
    }
  } catch (err) {
    console.warn(
      `layer3-prose: LLM call failed (consumer=${params.consumer}, target route /api/reason at M1-CP4).`,
      err instanceof Error ? err.message : err
    )
    throw err
  }

  // Parse JSON.
  let parsed: unknown
  try {
    parsed = extractJSON(responseText)
  } catch (err) {
    console.warn(
      `layer3-prose: JSON parse failed (consumer=${params.consumer}, target route /api/reason at M1-CP4). ` +
        `Response length: ${responseText.length}.`,
      err instanceof Error ? err.message : err
    )
    throw err
  }

  // Validate. The LLM produces source='llm' per the OUTPUT example contract,
  // but the validator does not depend on that — we explicitly normalise here
  // to defend against a model that omits the source field.
  if (isObject(parsed) && parsed.source === undefined) {
    parsed.source = 'llm'
  }

  let prose: Layer3Prose
  try {
    prose = validateLayer3Prose(parsed)
  } catch (err) {
    if (err instanceof Layer3ValidationError) {
      console.warn(
        `layer3-prose: schema validation failed (consumer=${params.consumer}, target route /api/reason at M1-CP4). ` +
          `Category: ${err.category}, field: ${err.field ?? 'n/a'}.`,
        err.message
      )
    } else {
      console.warn(
        `layer3-prose: unexpected validation error (consumer=${params.consumer}, target route /api/reason at M1-CP4).`,
        err instanceof Error ? err.message : err
      )
    }
    throw err
  }

  return { prose, usage }
}

// ============================================================================
// DETERMINISTIC FALLBACK PROSE (per ADR-007 §6 + ADR-004 §9.3)
// ============================================================================

const PROXIMITY_REFLECTION: Record<KatorthomaProximity, string> = {
  reflexive:
    'Your reasoning here moves below the threshold of deliberation; impressions become impulses without examination.',
  habitual:
    'Your reasoning here follows convention; what custom prescribes you accept without testing the impression.',
  deliberate:
    'Your reasoning here is deliberate; you are weighing impressions consciously, with some understanding.',
  principled:
    'Your reasoning here rests on stable commitment to virtue; the principle behind the choice is examined and held.',
  sage_like:
    'Your reasoning here approaches perfected understanding; impression, assent, impulse, and action align.',
}

const PROXIMITY_SUMMARY: Record<KatorthomaProximity, string> = {
  reflexive: 'Your reasoning is reflexive',
  habitual: 'Your reasoning is habitual',
  deliberate: 'Your reasoning is deliberate',
  principled: 'Your reasoning is principled',
  sage_like: 'Your reasoning is sage-like',
}

const VIRTUE_TRANSLATIONS: Record<VirtueDomain, string> = {
  phronesis: 'phronesis (practical wisdom)',
  dikaiosyne: 'dikaiosyne (justice)',
  andreia: 'andreia (courage)',
  sophrosyne: 'sophrosyne (temperance)',
}

const MECHANISM_LABELS: Record<string, string> = {
  passion_diagnosis: 'passion-diagnosis correction',
  control_filter: 'control-filter correction',
  oikeiosis: 'oikeiosis correction',
  value_assessment: 'value-assessment correction',
  kathekon_assessment: 'kathekon-assessment correction',
}

function joinVirtues(virtues: VirtueDomain[]): string {
  if (virtues.length === 0) return ''
  if (virtues.length === 1) return VIRTUE_TRANSLATIONS[virtues[0]]
  if (virtues.length === 2) {
    return `${VIRTUE_TRANSLATIONS[virtues[0]]} and ${VIRTUE_TRANSLATIONS[virtues[1]]}`
  }
  const all = virtues.map((v) => VIRTUE_TRANSLATIONS[v])
  return `${all.slice(0, -1).join(', ')}, and ${all[all.length - 1]}`
}

/**
 * Build philosophical_reflection from assessment alone (no LLM).
 * Composed of: proximity-keyed opener + passion/virtue context + ruling-faculty close.
 */
function fallbackPhilosophicalReflection(assessment: Layer2Assessment): string {
  const proximityOpener = PROXIMITY_REFLECTION[assessment.katorthoma_proximity]

  const passions = assessment.passion_diagnosis.passions_detected
  let passionSentence = ''
  if (passions.length > 0) {
    const p = passions[0]
    passionSentence =
      ` The principal dynamic is ${p.root_passion}` +
      (p.sub_species ? ` (specifically ${p.sub_species})` : '') +
      `, lodged at the ${p.causal_stage_affected} stage.`
  }

  let virtueSentence = ''
  if (assessment.virtue_domains_engaged.length > 0) {
    virtueSentence = ` ${joinVirtues(assessment.virtue_domains_engaged)} ${
      assessment.virtue_domains_engaged.length === 1 ? 'is' : 'are'
    } engaged here.`
  }

  // Closing sentence — prefer correct_judgement, fall back to ruling_faculty_state
  let closingSentence = ''
  if (assessment.passion_diagnosis.correct_judgements.length > 0) {
    closingSentence = ` The correct view: ${assessment.passion_diagnosis.correct_judgements[0]}`
    if (!closingSentence.endsWith('.')) closingSentence += '.'
  } else if (assessment.ruling_faculty_state && assessment.ruling_faculty_state.trim().length > 0) {
    closingSentence = ` ${assessment.ruling_faculty_state}`
    if (!closingSentence.endsWith('.')) closingSentence += '.'
  }

  // Marginal-case appends (per ADR-007 §6 in-session amendments 2026-05-04 + harness
  // Phase 5 findings that the original fallback omitted these disciplines).
  // Each append is independent and may both fire on the same assessment.

  // Single-snapshot append — required for every input without temporal markers.
  let singleSnapshotSentence = ''
  if (assessment.iterative_refinement.direction_of_travel === 'single_snapshot') {
    singleSnapshotSentence = ' This is a single snapshot; no trajectory data is available.'
  }

  // Kathekon-null append — required whenever the kathekon verdict is undecidable.
  // Per second amendment (post-harness re-run): the LLM was producing rich passion-
  // focused prose but silently skipping the kathekon-null discipline; the fallback
  // had the same gap. Append independently so the discipline fires whenever applicable,
  // regardless of whether passions or other primary issues are also being named.
  let kathekonNullSentence = ''
  if (assessment.kathekon_assessment.is_kathekon === null) {
    kathekonNullSentence = " The action's appropriateness cannot be determined from the available evidence."
  }

  // Added 2026-05-06 (M1-CP4b) — AC-14 marginal-case appends per ADR-007 §6 amendment.
  // Independent appends; both may fire on the same assessment when both deferrals are present.
  let eupatheiaBoundarySentence = ''
  let praxisMotivationSentence = ''
  const openDeferrals = assessment.intake_clarifications.open_deferrals
  if (openDeferrals.some((d) => d.trigger_code === 'EUPATHEIA_BOUNDARY')) {
    eupatheiaBoundarySentence =
      ' The classification of this calm as genuine eupatheia versus polished surface over passion cannot be confirmed from this instance alone.'
  }
  if (openDeferrals.some((d) => d.trigger_code === 'PRAXIS_MOTIVATION_AMBIGUITY')) {
    praxisMotivationSentence =
      ' Whether this action arose from virtue or from convention cannot be determined from the current instance alone.'
  }

  return `${proximityOpener}${passionSentence}${virtueSentence}${closingSentence}${eupatheiaBoundarySentence}${praxisMotivationSentence}${kathekonNullSentence}${singleSnapshotSentence}`.trim()
}

/**
 * Build improvement_guidance from assessment alone.
 * Cases:
 *   - improvement_path_structured non-null: name the false_judgement + corrected_judgement + mechanism
 *   - improvement_path_structured null: marginal-case phrasing + reflective prompt
 *   - disambiguation_required non-empty: append a sentence (cap 2 items, "and others" if more)
 */
function fallbackImprovementGuidance(assessment: Layer2Assessment): string {
  let guidance: string

  if (assessment.improvement_path_structured !== null) {
    const ip = assessment.improvement_path_structured
    const mechLabel = MECHANISM_LABELS[ip.mechanism_applies] ?? `${ip.mechanism_applies} correction`
    guidance =
      `The false judgement to correct: "${ip.false_judgement_to_correct}". ` +
      `Replace it with: "${ip.corrected_judgement}". ` +
      `This is a ${mechLabel}.`
  } else {
    // Marginal case — explicit phrasing per ADR-007 §3
    const reflectivePrompt =
      assessment.oikeiosis.deliberation_notes && assessment.oikeiosis.deliberation_notes.trim().length > 0
        ? ` Reflect on the oikeiosis context: ${assessment.oikeiosis.deliberation_notes}`
        : assessment.value_assessment.value_error
          ? ` Reflect on the value pattern: ${assessment.value_assessment.value_error}`
          : ' Reflect on which judgements are within your prohairesis and which are outside it.'
    guidance =
      `No specific improvement path identified at this time.${reflectivePrompt}`.trim()
  }

  // Append disambiguation prompt when present
  const disambig = assessment.control_filter.disambiguation_required
  if (disambig.length > 0) {
    const items = disambig.slice(0, 2).map((d) => `"${d.item}"`)
    const tail = disambig.length > 2 ? ` (and others)` : ''
    const itemStr = items.length === 1 ? items[0] : `${items[0]} and ${items[1]}`
    guidance +=
      ` You did not specify a position on ${itemStr}${tail}; ` +
      `reflect on whether ${disambig.length === 1 ? 'it lies' : 'they lie'} within or outside your moral choice.`
  }

  return guidance
}

/**
 * Build summary from assessment alone.
 * Pattern: "{proximity_opener}, {primary_issue_phrase}."
 */
function fallbackSummary(assessment: Layer2Assessment): string {
  const proximityOpener = PROXIMITY_SUMMARY[assessment.katorthoma_proximity]

  // Primary issue selection: passion → oikeiosis → kathekon → control filter → generic
  const passions = assessment.passion_diagnosis.passions_detected
  if (passions.length > 0) {
    const p = passions[0]
    return `${proximityOpener}, with the principal dynamic ${p.root_passion} lodged at the ${p.causal_stage_affected} stage.`
  }

  // Find a circle with tension or unmet obligation
  const tenseCircle = assessment.oikeiosis.relevant_circles.find(
    (c) => c.tension !== null || c.obligation_met === false
  )
  if (tenseCircle) {
    return `${proximityOpener}, with the principal tension at the ${tenseCircle.circle} circle of oikeiosis.`
  }

  // Kathekon verdict
  if (assessment.kathekon_assessment.is_kathekon === true) {
    return `${proximityOpener}; the action's appropriateness is judged ${assessment.kathekon_assessment.quality}.`
  }
  if (assessment.kathekon_assessment.is_kathekon === false) {
    return `${proximityOpener}; the action is not appropriate by the kathekon assessment.`
  }
  if (assessment.kathekon_assessment.is_kathekon === null) {
    return `${proximityOpener}; the action's appropriateness cannot be determined from the available evidence.`
  }

  // Control filter fallthrough
  if (assessment.control_filter.disambiguation_required.length > 0) {
    return `${proximityOpener}, with several items requiring disambiguation between within and outside your moral choice.`
  }

  return `${proximityOpener}; no principal issue identified in the assessment.`
}

// Added 2026-05-06 (M1-CP4b) — d-a16 stem rendering for fallback prose
// per ADR-007 §6 amendment.
//
// The fallback's rendering is the canonical d-a16 stem text verbatim
// (the stem text is locked; only slot variables fill).

/** Render the soft_clarification_prose for the FIRST entry only. */
function fallbackSoftClarificationProse(assessment: Layer2Assessment): string | null {
  const entries = assessment.intake_clarifications.soft_clarifications
  if (entries.length === 0) return null
  const first = entries[0]
  if (first.trigger_code === 'STATED_OPERATIVE_CONFLICT') {
    const target = first.slot_fills.STATED_CIRCLE_TARGET ?? 'the situation'
    const situation = first.slot_fills.SITUATION ?? 'this situation'
    return (
      `You mentioned being concerned about ${target}. ` +
      `I want to check something with you — when you imagine ${situation} going badly, ` +
      `what's the thing you're most worried about for yourself?`
    )
  }
  // STATED_EQUANIMITY_UNVERIFIED — canonical stem (no slot-fills)
  return (
    'Has there been a recent time when something similar went the other way — ' +
    "when the outcome you hoped for didn't arrive — and you noticed how you actually felt, " +
    'not how you thought you should feel?'
  )
}

/** Render open_deferrals_prose for ALL entries, joined by single space. */
function fallbackOpenDeferralsProse(assessment: Layer2Assessment): string | null {
  const entries = assessment.intake_clarifications.open_deferrals
  if (entries.length === 0) return null
  const sentences: string[] = []
  for (const entry of entries) {
    if (entry.trigger_code === 'EUPATHEIA_BOUNDARY') {
      const shape = entry.slot_fills.EUPATHEIA_SHAPE ?? 'this eupatheia'
      const window = entry.slot_fills.TIME_WINDOW ?? 'recent days'
      const trigger = entry.slot_fills.SITUATIONAL_TRIGGER ?? 'this situation'
      const descr = entry.slot_fills.EUPATHEIA_DESCRIPTION ?? 'genuine eupatheia'
      const counterpart =
        entry.slot_fills.PASSION_COUNTERPART_DESCRIPTION ?? 'a passion-shaped counterpart'
      sentences.push(
        `You described responding with ${shape}. ` +
          `Across ${window}, when ${trigger} arose in this domain — was your inner state actually ${descr}, ` +
          `or was it more like ${counterpart}?`
      )
    } else if (entry.trigger_code === 'PRAXIS_MOTIVATION_AMBIGUITY') {
      const surface = entry.slot_fills.SURFACE_PATTERN ?? 'this action'
      const virtue = entry.slot_fills.VIRTUE_DESCRIPTION ?? 'virtue'
      const convention = entry.slot_fills.CONVENTION_DESCRIPTION ?? 'convention'
      sentences.push(
        `The engine cannot tell from the current instance alone whether ${surface} arose from ${virtue} ` +
          `or from ${convention}.`
      )
    }
  }
  return sentences.join(' ')
}

/**
 * Generate Layer3Prose from a Layer2Assessment using deterministic templates.
 * No LLM, no I/O, no module state. Idempotent: same assessment → byte-equal prose.
 *
 * Used by the route at M1-CP4 in the catch path when generateProse throws.
 * Per ADR-004 §9.3 — the user is never stranded by a Layer 3 failure.
 *
 * Per KG1: pure synchronous function; no fire-and-forget; no DB writes.
 */
export function generateFallbackProse(assessment: Layer2Assessment): Layer3Prose {
  if (!assessment || typeof assessment !== 'object') {
    throw new Layer3ValidationError(
      'shape',
      'generateFallbackProse: assessment is required',
      'assessment'
    )
  }

  return {
    version: 'layer3-prose-v1',
    layer2_assessment_version: 'layer2-assessment-v1',
    consumer: 'api_reason',
    philosophical_reflection: fallbackPhilosophicalReflection(assessment),
    improvement_guidance: fallbackImprovementGuidance(assessment),
    summary: fallbackSummary(assessment),
    // Added 2026-05-06 (M1-CP4b) — AC-13 / AC-14 fallback paths
    soft_clarification_prose: fallbackSoftClarificationProse(assessment),
    open_deferrals_prose: fallbackOpenDeferralsProse(assessment),
    source: 'fallback',
  }
}

// ============================================================================
// EXPORTS — for harness consumption
// ============================================================================

export { LAYER3_SYSTEM_PROMPT_API_REASON }
