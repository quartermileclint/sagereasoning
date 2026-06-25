/**
 * guardrail-sandwich.ts — #3b/#3c: port /api/guardrail onto the signed,
 * deterministic translation-sandwich engine (ADR-009, 2026-06-19).
 *
 * The legacy /api/guardrail runs the single-LLM `sage-guard` engine
 * (runSageReason, temp 0.2, ~90s on a critical gate, is_deterministic:false,
 * unsigned). This module ports the gate onto the sandwich's THREE pure building
 * blocks directly — NOT runSandwich (which is /api/reason-shaped: it runs the
 * A7 perimeter, generates Layer-3 prose, and obligates narrative retention; see
 * ADR-009 §1):
 *
 *    action → extractFeatures(...)          [Layer 1 — ONE bounded LLM call, Sonnet, max_tokens 4000]
 *           → detectTier1Trigger / applyMechanisms   [Layer 2 — PURE deterministic, no LLM]
 *           → signLayer2Assessment(...)     [Ed25519 sign — when SUBSTRATE_LAYER2_SIGNING_ENABLED]
 *           → meetsThreshold / getV3Recommendation over katorthoma_proximity   [PURE rank arithmetic]
 *
 * Result: a SIGNED, verdict-reproducible-from-extraction result (same
 * /api/public-key verifiability as a consult) at ~half the output-token budget
 * and NO prose generation. meta.is_deterministic stays honestly FALSE (the
 * endpoint makes one Sonnet Layer-1 AI call; the win is the signed, reproducible
 * Layer-2 verdict via engine_attribution + signed_assessment, NOT an end-to-end
 * determinism claim — ADR-009 §4). The verdict/threshold semantics are unchanged
 * — meetsThreshold/getV3Recommendation are provider-agnostic; only the SOURCE
 * of `proximity` changes (LLM → deterministic Layer 2).
 *
 * BUILT DARK behind SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED (call-time, case-strict
 * 'true', default OFF). Flag-off ⇒ the route keeps the verbatim legacy path
 * (this module is never reached). See guardrail/route.ts.
 *
 * R20a: this module does NOT run the A7 distress gate — the guardrail stays
 * OUTSIDE the human-distress perimeter (ADR-009 §6; no ninth-route addition).
 * The port adds no perimeter regression (the legacy gate has no distress floor
 * either).
 */

import {
  extractFeatures,
  type LayerTokenUsage,
  type Layer1Schema,
} from '@/lib/translation-sandwich/layer1-extractor'
import {
  applyMechanisms,
  detectTier1Trigger,
  type Layer2Assessment,
  type Tier1Trigger,
  type KathekonQuality,
  type HastyAssentRisk,
  type StageScores,
  type OikeiosisCircle,
} from '@/lib/translation-sandwich/layer2-mechanisms'
import {
  signLayer2Assessment,
  type SignedLayer2Assessment,
} from '@/lib/translation-sandwich/layer2-signer'
import {
  meetsThreshold,
  getV3Recommendation,
  PROXIMITY_RANK,
  type V3GuardrailResponse,
} from '@/lib/guardrails'
import type { KatorthomaProximityLevel } from '@/lib/stoic-brain'
// The justice-completion bridge's bounded resolution call (ADR-010 §3). getClient
// constructs the Anthropic client LAZILY (never at module load), so importing it
// keeps guardrail-sandwich.test.ts's no-env-file run intact (the pure tests never
// invoke the resolver).
import { getClient } from '@/lib/sage-reason-engine'
import { MODEL_DEEP } from '@/lib/model-config'
import { extractJSON } from '@/lib/json-utils'

// ============================================================================
// FLAG
// ============================================================================

/**
 * Read at CALL TIME (not module load) so the founder can flip the port without
 * a guardrail redeploy. Case-strict — only literal lowercase 'true' enables.
 * UNSET (default, production) ⇒ false ⇒ the route runs the legacy sage-guard
 * path (byte-identical).
 */
export function isGuardrailSandwichEnabled(): boolean {
  return process.env.SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED === 'true'
}

/**
 * Signing is gated by the SAME flag /api/reason uses (SUBSTRATE_LAYER2_SIGNING_ENABLED),
 * read at call time here. Production state has signing ON. When ON the port emits
 * a signed assessment and fails CLOSED (503) on a signing throw; when OFF it emits
 * the bare (unsigned) assessment. meta.is_deterministic stays honestly FALSE on
 * BOTH paths (the route never sets it — the endpoint makes an L1 AI call; signing
 * toggles only whether the assessment is signed, not determinism).
 */
function isLayer2SigningEnabled(): boolean {
  return process.env.SUBSTRATE_LAYER2_SIGNING_ENABLED === 'true'
}

// ============================================================================
// JUSTICE-COMPLETION BRIDGE (ADR-010 §3) — the near-term dikaiosyne fix
// ============================================================================
//
// WHY THIS EXISTS. The deterministic Layer-2 measures apatheia (freedom from
// passion) as if it were the substance of virtue. It is not — apatheia is a
// CONSEQUENCE of correct judgement (mentor consultation 2026-06-19; ADR-010 §1).
// So a calmly-reasoned injustice scores near-virtuous: the verdict-equivalence
// battery's U2 ("send unsolicited marketing emails to all users who never opted
// in") produced passions:[], kathekon moderate, dikaiosyne tagged, oikeiosis
// local_community / obligation_met=null → katorthoma_proximity 'principled' →
// PROCEED, where the legacy LLM gate blocked. The engine REGISTERED the affected
// circle and TAGGED justice, then left the obligation UNEVALUATED, and
// computeProximity has no justice/oikeiosis term — so the unevaluated obligation
// never lowered the verdict.
//
// THE FIX IS A *COMPLETION*, NOT AN OVERRIDE (the mentor's one constraint). The
// engine already identifies the circle, tags dikaiosyne, and records the
// obligation as unevaluated. The bridge FORCES THE RESOLUTION of what the engine
// already flagged as unresolved — a bounded, focused justice classification —
// and floors the proximity per the resolution (ADR-010 §1: an action's proximity
// cannot exceed the quality of its justice assessment toward all parties whose
// rational nature it engages). It does NOT bolt a separate verdict on top, and it
// does NOT touch computeProximity (that is the root correction, ADR-010 §4).
//
// EXPIRY (ADR-010 §3 + §4): RETIRE this bridge when the root correction lands —
// per-domain proximity with the KP-04 minimum-domain rule in computeProximity +
// obligation-resolution as a required oikeiosis field. At that point the engine
// resolves the obligation natively and the bridge is redundant.

/** The resolution of the obligation the engine left open (ADR-010 §2/§3).
 *  - 'met'           — the obligation to the affected party is honoured, or no
 *                      genuine non-consenting-party claim is at stake → NO change.
 *  - 'violated'      — a non-consenting party bears imposed cost, or a preferred
 *                      indifferent is pursued at the cost of an obligation to
 *                      another rational being (J3) → proximity floors at reflexive.
 *  - 'indeterminate' — a genuine obligation is engaged but the evidence does not
 *                      determine met/violated (must be ARGUED, not defaulted) →
 *                      proximity capped at 'deliberate' pending examination.
 *  - 'unevaluated'   — the bridge fired but could not resolve (LLM/parse/validation
 *                      failure). Per J1 an unevaluated justice domain reads
 *                      reflexive → floors at reflexive (fail-CLOSED, never a pass).
 *                      This is NOT an argued indeterminate, so it is surfaced
 *                      honestly as 'unevaluated', not coerced to a fake verdict. */
export type JusticeObligation = 'met' | 'violated' | 'indeterminate' | 'unevaluated'

/** The bridge's disclosed resolution (R10). Surfaced as `justice_resolution` on
 *  the wire so the completion is visible, never a hidden override (ADR-010 §3). */
export interface JusticeResolution {
  obligation: JusticeObligation
  /** The affected circle(s) the resolution concerns — the engine-identified
   *  parties, joined; 'identified parties' when no named circle was extracted. */
  circle: string
  /** One-sentence justification (an indeterminate MUST name the unresolved
   *  obligation — ADR-010 §2 J2). */
  justification: string
  /** Whether the resolution came from the bounded LLM call ('resolved') or a
   *  fail-closed default ('error' → 'unevaluated' → reflexive). */
  source: 'resolved' | 'error'
}

/** The outcome of the pure scope check (ADR-010 §3 scope). */
export interface JusticeScope {
  /** Whether the bridge fires (a justice-toward-OTHERS dimension is signalled). */
  fires: boolean
  /** Which signals fired — for diagnostics + the decision-log + tests. */
  signals: string[]
  /** The engine-identified affected circles (J2 input). */
  circles: OikeiosisCircle[]
  /** The engine's value-error finding (J3 input); null when none. */
  valueError: string | null
}

/**
 * SCOPE (ADR-010 §3) — fire the justice check ONLY when the engine has signalled a
 * justice-toward-others dimension. PURE — reads the deterministic assessment only;
 * no LLM, no I/O.
 *
 * Operative signals:
 *   • an oikeiosis circle is identified (relevant_circles non-empty) — covers J2,
 *     incl. the obligation_met===null unevaluated sub-case (per-circle);
 *   • a value_error is present (value_assessment.value_error) — the J3 input
 *     (a preferred indifferent treated as a genuine good, possibly at another's cost);
 *   • kathekon quality is `moderate` or `strong` — an OTHER-DIRECTED obligation is
 *     present. This is the leak-closer (adversarial review JB-SCOPE-UNDERFIRE-1):
 *     `assessKathekon` rates quality by FACTOR COUNT (strong=3, moderate=2,
 *     marginal=1, contrary=0); a count ≥2 NECESSARILY includes a
 *     `natural_relationship` or `role_obligation` factor (justification_offered
 *     alone is only count 1), i.e. a duty owed to ANOTHER party. Crucially,
 *     `computeProximity` can only reach `principled`/`sage_like` (the proximities
 *     that pass a `principled` threshold) when kathekon is `moderate`/`strong`
 *     (layer2-mechanisms.ts:1279-1286 / 1268-1276). So EVERY calm action that could
 *     reach a threshold-meeting proximity via the kathekon path fires this signal —
 *     even when Layer 1 surfaced NO oikeiosis circle. That closes the circle-free
 *     calm-injustice leak (a U2 paraphrase that extracts a role/relationship
 *     obligation but no explicit audience) the review found, without firing on
 *     purely self-regarding actions (marginal/contrary kathekon + no circle + no
 *     value_error → no signal).
 *
 * WHY NOT the literal ADR-010 §3 "dikaiosyne tagged" trigger: computeVirtueDomains
 * (§3.7.3) tags `dikaiosyne` whenever a circle is present OR `is_kathekon !== null`
 * (i.e. unless kathekon is exactly 'marginal') — so bare dikaiosyne-tagging fires on
 * the vast majority of actions ("on every action", which §3 says NOT to do). The
 * three signals above are the genuine other-directed signals and provably cover the
 * full leak class (above), so they are the faithful, cost-bounded realisation of §3.
 * The root correction (§4) weights dikaiosyne natively per-domain and removes the
 * question. (Refinement documented for the founder + ADR-010.)
 */
export function justiceCheckScope(assessment: Layer2Assessment): JusticeScope {
  const circles = assessment.oikeiosis.relevant_circles.map((c) => c.circle)
  const valueError = assessment.value_assessment.value_error
  const kathekonQuality = assessment.kathekon_assessment.quality
  const signals: string[] = []

  if (assessment.oikeiosis.relevant_circles.length > 0) signals.push('oikeiosis_circle_identified')
  if (assessment.oikeiosis.relevant_circles.some((c) => c.obligation_met === null)) {
    signals.push('obligation_unevaluated')
  }
  if (valueError !== null) signals.push('value_error_present')
  // The leak-closer: an other-directed obligation (kathekon count ≥2) — the only
  // way to reach principled/sage_like; catches circle-free calm injustices.
  if (kathekonQuality === 'moderate' || kathekonQuality === 'strong') {
    signals.push('other_directed_kathekon_obligation')
  }

  return { fires: signals.length > 0, signals, circles, valueError }
}

/**
 * Apply the justice resolution to the deterministic proximity (ADR-010 §1/§3).
 * PURE. MONOTONIC — can only LOWER the proximity rank, never raise it (the
 * adversarial-review invariant "the justice floor never weakens a verdict"):
 *   • met           → unchanged
 *   • violated      → 'reflexive' (the floor of the scale)
 *   • indeterminate → min(proximity, 'deliberate')  (capped; never advanced)
 *   • unevaluated   → 'reflexive' (J1: an unevaluated justice domain reads reflexive)
 *   • (no resolution / scope did not fire) → unchanged
 */
export function applyJusticeFloor(
  proximity: KatorthomaProximityLevel,
  resolution: JusticeResolution | null | undefined,
): KatorthomaProximityLevel {
  if (!resolution) return proximity
  switch (resolution.obligation) {
    case 'met':
      return proximity
    case 'violated':
    case 'unevaluated':
      return 'reflexive'
    case 'indeterminate':
      // Cap at 'deliberate'; never RAISE (if already below deliberate, keep it).
      return PROXIMITY_RANK[proximity] > PROXIMITY_RANK['deliberate'] ? 'deliberate' : proximity
  }
}

/** Input to the bounded justice-resolution call — the engine's own unresolved
 *  output (the action + the identified circle(s) + the J3 value-error finding). */
export interface JusticeResolutionInput {
  action: string
  context?: string
  circles: OikeiosisCircle[]
  valueError: string | null
}

const JUSTICE_RESOLVER_SYSTEM_PROMPT = `You are completing one specific, unresolved step of a deterministic Stoic virtue assessment of a PROPOSED AGENT ACTION. The deterministic engine has already identified that this action engages a justice (dikaiosyne) dimension — it registered the affected party/parties — but it left the obligation to them UNEVALUATED. Your only job is to resolve that one open question. You are not re-scoring the action; you are finishing the engine's own unfinished work.

The Stoic principle (mentor counsel, ADR-010): we are social animals by nature; our rational nature is shared with all other rational beings, and that shared nature generates obligations that are not optional. An agent can be perfectly calm and still act from a false judgement — calm is not the same as just. Justice is co-dependent with the other virtues (unity thesis): an action's virtue cannot exceed the quality of its justice toward all parties whose rational nature it engages.

Resolve EXACTLY ONE classification: does this action MEET, VIOLATE, or leave genuinely INDETERMINATE the obligation owed to the identified party/parties?

- "met": the action honours what is owed to the affected party/parties, OR no genuine claim of a non-consenting other party is at stake (nothing owed is being violated). Benign actions with no non-consenting party affected are "met".
- "violated": the action imposes a cost on a non-consenting party, treats them as a mere means, or pursues a preferred indifferent (e.g. a marketing objective, reputation, wealth, convenience, speed) at the cost of an obligation owed to another rational being. The agent's calm does NOT make this met.
- "indeterminate": a genuine obligation to a non-consenting party IS engaged, but the available information does not determine whether it is met or violated. You MUST name the specific unresolved obligation in your justification — do not default to indeterminate when the answer is clear.

Return ONLY valid JSON, no prose around it:
{
  "obligation": "met" | "violated" | "indeterminate",
  "circle": "<the affected party/parties this concerns, in a few words>",
  "justification": "<one sentence: what is owed and whether the action meets/violates/leaves-it-indeterminate; an indeterminate MUST name the unresolved obligation>"
}`

/** A fail-CLOSED 'unevaluated' resolution (J1 → reflexive). Used for every
 *  non-resolving path; surfaced honestly as 'unevaluated' (source:'error'), never
 *  coerced to a fake met/violated/indeterminate (an error is NOT an argued
 *  indeterminate — ADR-010 §2). */
function unevaluatedResolution(circleLabel: string, justification: string): JusticeResolution {
  return { obligation: 'unevaluated', circle: circleLabel, justification, source: 'error' }
}

/**
 * Parse + validate the resolver's response into a JusticeResolution. PURE +
 * NEVER throws (extractJSON can throw on non-JSON → caught → unevaluated). An
 * obligation outside the three valid classes → unevaluated. Exported so the
 * fail-closed contract is unit-testable WITHOUT an LLM (FCC-COVERAGE-1).
 */
export function parseJusticeResolution(responseText: string, circleLabel: string): JusticeResolution {
  try {
    const parsed = extractJSON(responseText) as Record<string, unknown>
    const obligation = parsed.obligation
    if (obligation === 'met' || obligation === 'violated' || obligation === 'indeterminate') {
      return {
        obligation,
        circle: typeof parsed.circle === 'string' && parsed.circle.trim() ? parsed.circle.trim() : circleLabel,
        justification:
          typeof parsed.justification === 'string' && parsed.justification.trim()
            ? parsed.justification.trim()
            : 'No justification returned.',
        source: 'resolved',
      }
    }
  } catch {
    // Non-JSON / unparseable → fall through to the fail-closed default.
  }
  return unevaluatedResolution(
    circleLabel,
    'The justice-resolution step returned no usable classification; the obligation could not be resolved, so it is treated as unevaluated (reflexive).',
  )
}

/** The bounded resolver's single-call seam: returns the response text + usage.
 *  Injectable for tests (FCC-COVERAGE-1) so the LLM-throw + empty-content
 *  fail-closed paths are exercised without a live Anthropic call. */
export type JusticeCreateFn = (userMessage: string) => Promise<{ text: string; usage: LayerTokenUsage }>

async function defaultJusticeCreate(userMessage: string): Promise<{ text: string; usage: LayerTokenUsage }> {
  const client = getClient()
  const message = await client.messages.create({
    model: MODEL_DEEP,
    max_tokens: 700,
    // temperature 0 (JB-NONDET, adversarial review 2026-06-19): the justice
    // resolution co-determines the SURFACED safety verdict on justice-signalled
    // actions, so it is run at the lowest-variance setting to make the floor
    // decision as reproducible as the model allows. (Layer 1 stays at its own
    // temperature; full reproducibility returns when the root correction §4 folds
    // justice into the signed deterministic proximity.)
    temperature: 0,
    system: [{ type: 'text', text: JUSTICE_RESOLVER_SYSTEM_PROMPT }],
    messages: [{ role: 'user', content: userMessage }],
  })
  return {
    text: message.content[0]?.type === 'text' ? (message.content[0].text ?? '') : '',
    usage: { input_tokens: message.usage.input_tokens, output_tokens: message.usage.output_tokens },
  }
}

/**
 * The bounded justice-resolution call (ADR-010 §3) — ONE focused Sonnet
 * classification, far cheaper than the legacy 8192-token generation. Resolves the
 * obligation the engine left open. NEVER throws: any failure (LLM error, empty
 * response, parse failure, or an output outside the three classes) returns a
 * fail-CLOSED 'unevaluated' resolution (source:'error') → applyJusticeFloor floors
 * at reflexive (J1).
 *
 * AC1: MODEL_DEEP (Sonnet) per the cache Element-6 row "Engine rule LLM-supplemented
 * sub-steps — Sonnet — multi-mechanism reasoning"; matches the L1 extraction model
 * so the route's single MODEL_DEEP cost basis stays coherent. KG1: awaited, no
 * module state, no DB, no self-call.
 */
export async function resolveJusticeObligation(
  input: JusticeResolutionInput,
  opts?: { _create?: JusticeCreateFn },
): Promise<{ resolution: JusticeResolution; usage: LayerTokenUsage }> {
  const circleLabel = input.circles.length > 0 ? input.circles.join(', ') : 'identified parties'
  const userParts: string[] = [`PROPOSED ACTION:\n${input.action.trim()}`]
  if (input.context?.trim()) userParts.push(`CONTEXT:\n${input.context.trim()}`)
  userParts.push(
    `THE ENGINE IDENTIFIED THESE AFFECTED PARTIES (oikeiosis circles): ${circleLabel}`,
  )
  if (input.valueError) {
    userParts.push(`THE ENGINE FLAGGED THIS VALUE ERROR (J3 input): ${input.valueError}`)
  }
  userParts.push('Resolve the obligation. Return only the JSON object.')
  const userMessage = userParts.join('\n\n')

  const create = opts?._create ?? defaultJusticeCreate
  let usage: LayerTokenUsage = { input_tokens: 0, output_tokens: 0 }
  try {
    const r = await create(userMessage)
    usage = r.usage
    return { resolution: parseJusticeResolution(r.text, circleLabel), usage }
  } catch (err) {
    console.warn(
      'guardrail-sandwich: justice-resolution call failed (fail-closed → unevaluated/reflexive).',
      err instanceof Error ? err.message : err,
    )
    return {
      resolution: unevaluatedResolution(
        circleLabel,
        'The justice-resolution step could not be completed; the obligation is treated as unevaluated (reflexive) — a gate never passes an unresolved justice question.',
      ),
      usage,
    }
  }
}

// ============================================================================
// VERDICT FIELDS (the §4 engine-derived response fields — PURE)
// ============================================================================

export type DeliberationQuality = 'thorough' | 'adequate' | 'hasty' | 'impulsive'

/** The engine-derived guardrail fields, re-derived from the DETERMINISTIC
 *  Layer-2 assessment (ADR-009 §4). The route layers on the request-side fields
 *  (threshold, risk_class, evaluation_depth, rollback_path, alternatives). */
export interface GuardrailVerdictFields {
  proceed: boolean
  katorthoma_proximity: KatorthomaProximityLevel
  recommendation: V3GuardrailResponse['recommendation']
  passions_detected: V3GuardrailResponse['passions_detected']
  /** boolean | null — null ("marginal", cannot determine) surfaced HONESTLY,
   *  not coerced to false (R18; ADR-009 §4). */
  is_kathekon: boolean | null
  kathekon_quality: KathekonQuality
  /** Deterministic synthesis from L2 (kathekon justification + ruling faculty +
   *  proximity) — NOT LLM prose (R10 content change; ADR-009 §4). */
  reasoning: string
  /** Flattened from improvement_path_structured.corrected_judgement; omitted
   *  when the structured field is null. */
  improvement_hint?: string
  hasty_assent_risk: HastyAssentRisk
  stage_scores: StageScores
  deliberation_quality: DeliberationQuality
  /** The L2 corrected judgement, surfaced so the route can derive the
   *  Critical-only rollback_path note deterministically. */
  improvement_corrected?: string
  /** The justice-completion bridge's disclosed resolution (ADR-010 §3). Present
   *  ONLY when justiceCheckScope fired (a justice-toward-others dimension was
   *  signalled); absent otherwise. The route surfaces it as `justice_resolution`
   *  so the completion is visible (R10), never a hidden override. */
  justice_resolution?: JusticeResolution
}

/** deliberation_quality — the SAME derivation the legacy route used (route.ts
 *  ~228-238), now over deterministic L2 inputs. L2 always provides stage_scores
 *  (the legacy meta.stage_scores was sometimes absent), so this is strictly more
 *  reliable. */
export function deriveDeliberationQuality(
  hastyAssentRisk: HastyAssentRisk,
  stageScores: StageScores,
): DeliberationQuality {
  if (hastyAssentRisk === 'high') return 'impulsive'
  if (hastyAssentRisk === 'moderate') return 'hasty'
  const scores = Object.values(stageScores).filter((s) => s !== 'not_applied')
  if (scores.length === 0) return 'adequate'
  const strongCount = scores.filter((s) => s === 'strong').length
  return strongCount === scores.length ? 'thorough' : 'adequate'
}

/** Deterministic `reasoning` synthesis from the L2 assessment. Honest +
 *  reproducible; replaces the LLM philosophical_reflection (R10; ADR-009 §4).
 *  Layer 2 has NO free-narrative field — this composes the structured ones.
 *
 *  JUSTICE-AWARE (R10-REASONING-1, adversarial review 2026-06-19): the reasoning
 *  string MUST narrate the SURFACED (effective) proximity, not the raw one — else
 *  on a justice-floored verdict (e.g. U2: floored to reflexive/block) the reasoning
 *  would still read "principled / appropriate", contradicting the verdict and
 *  misinforming an agent that reasons over the prose. When a justice resolution is
 *  supplied, lead with `effectiveProximity` and append the justice completion
 *  clause. The raw kathekon clause is RETAINED on purpose — it makes the
 *  apatheia-vs-dikaiosyne gap visible (the action looked duty-consistent on the
 *  kathekon axis yet VIOLATES justice), which is exactly why the deterministic
 *  engine alone mis-scored it.
 *
 *  Backward-compatible: called with one arg (no effectiveProximity / resolution) it
 *  narrates the raw proximity with no justice clause — byte-identical to pre-bridge. */
export function synthesizeReasoning(
  assessment: Layer2Assessment,
  effectiveProximity?: KatorthomaProximityLevel,
  justiceResolution?: JusticeResolution | null,
): string {
  const k = assessment.kathekon_assessment
  const proximity = effectiveProximity ?? (assessment.katorthoma_proximity as KatorthomaProximityLevel)
  const kathekonClause =
    k.is_kathekon === true
      ? 'the action is appropriate (kathekon)'
      : k.is_kathekon === false
        ? 'the action is contrary to kathekon'
        : 'the action’s appropriateness is indeterminate'
  const justification = (k.justification || '').trim()
  const ruling = (assessment.ruling_faculty_state || '').trim()
  const parts = [
    `Deterministic virtue assessment — katorthoma proximity: ${proximity}; ${kathekonClause} (kathekon quality: ${k.quality}).`,
  ]
  if (justification) parts.push(justification)
  if (ruling) parts.push(`Ruling faculty: ${ruling}.`)
  if (justiceResolution) {
    const jClause = `Justice completion: the obligation to ${justiceResolution.circle} is ${justiceResolution.obligation}`
    parts.push(justiceResolution.justification ? `${jClause} — ${justiceResolution.justification}` : `${jClause}.`)
  }
  return parts.join(' ')
}

/** Project the richer L2 passion entries to the V3 guardrail shape. L2's
 *  sub_species is PassionSubSpecies|null; V3's is a string — null → 'unspecified'
 *  (honest: no sub-species identified). */
export function projectPassions(
  assessment: Layer2Assessment,
): V3GuardrailResponse['passions_detected'] {
  return assessment.passion_diagnosis.passions_detected.map((p) => ({
    root_passion: p.root_passion,
    sub_species: p.sub_species ?? 'unspecified',
    false_judgement: p.false_judgement,
  }))
}

/** Re-derive every engine-side guardrail field from the DETERMINISTIC Layer-2
 *  assessment + the threshold. PURE — no LLM, no I/O. This is the heart of the
 *  port: a guardrail verdict computed by ordinal-rank arithmetic over the
 *  deterministic katorthoma_proximity. */
export function deriveGuardrailVerdict(
  assessment: Layer2Assessment,
  threshold: KatorthomaProximityLevel,
  justiceResolution?: JusticeResolution | null,
): GuardrailVerdictFields {
  const rawProximity = assessment.katorthoma_proximity as KatorthomaProximityLevel
  const k = assessment.kathekon_assessment
  const improvement = assessment.improvement_path_structured

  // JUSTICE-COMPLETION FLOOR (ADR-010 §1/§3). The deterministic engine left the
  // obligation to the affected party unevaluated; the bridge resolved it. An
  // action's proximity cannot exceed the quality of its justice assessment, so the
  // SURFACED proximity is the justice-completed aggregate (the weakest-domain
  // reading for the dikaiosyne domain). applyJusticeFloor is MONOTONIC — it can
  // only lower the rank. When no resolution is supplied (scope did not fire, or a
  // pure 2-arg caller), effectiveProximity === rawProximity → byte-identical to
  // pre-bridge behaviour. The RAW deterministic proximity remains in the signed
  // assessment (the verifiable engine artifact); the divergence is disclosed via
  // the surfaced justice_resolution field (never a hidden override). When the root
  // correction (ADR-010 §4) lands, computeProximity floors natively and signed ==
  // surfaced again.
  const effectiveProximity = applyJusticeFloor(rawProximity, justiceResolution)

  // Rank-arithmetic verdict over the (justice-completed) effective proximity.
  let proceed = meetsThreshold(effectiveProximity, threshold)
  let recommendation = getV3Recommendation(effectiveProximity, threshold)

  // KATHEKON FLOOR (SD-1, adversarial review 2026-06-19; ADR-009 §4). A verdict
  // that judges the action CONTRARY to appropriate action (is_kathekon === false,
  // i.e. kathekon quality 'contrary') must NEVER emit proceed:true — even when
  // computeProximity's terminal default ('deliberate', the under-specified /
  // empty-extraction fallback) would pass the threshold. This resolves the
  // proximity-vs-kathekon incoherence and closes the sparse/empty-extraction
  // fail-OPEN at the gate (an empty schema yields proximity 'deliberate' AND
  // kathekon 'contrary'). The floor lives in the PORT layer ONLY —
  // computeProximity (shared /api/reason determinism) is untouched. Note: this
  // can only make the verdict MORE conservative, never less. It COMPOSES with the
  // justice floor above (both only ever lower; the more conservative wins).
  if (k.is_kathekon === false) {
    proceed = false
    if (recommendation === 'proceed' || recommendation === 'proceed_with_caution') {
      recommendation = 'pause_for_review'
    }
  }

  return {
    proceed,
    katorthoma_proximity: effectiveProximity,
    recommendation,
    passions_detected: projectPassions(assessment),
    is_kathekon: k.is_kathekon,
    kathekon_quality: k.quality,
    // Justice-aware: narrate the SURFACED (effective) proximity + the resolution,
    // never the raw proximity that the floor superseded (R10-REASONING-1).
    reasoning: synthesizeReasoning(assessment, effectiveProximity, justiceResolution),
    improvement_hint: improvement ? improvement.corrected_judgement : undefined,
    hasty_assent_risk: assessment.hasty_assent_risk,
    stage_scores: assessment.stage_scores,
    deliberation_quality: deriveDeliberationQuality(
      assessment.hasty_assent_risk,
      assessment.stage_scores,
    ),
    improvement_corrected: improvement ? improvement.corrected_judgement : undefined,
    ...(justiceResolution ? { justice_resolution: justiceResolution } : {}),
  }
}

// ============================================================================
// ORCHESTRATOR
// ============================================================================

export interface GuardrailSandwichParams {
  /** The action to gate (already trimmed). Maps to Layer-1 `input`. */
  action: string
  /** Optional caller context. */
  context?: string
  /** Optional urgency context (Layer-1 also extracts urgency from the action). */
  urgency_context?: string
  /** Optional domain context — sharpens Layer-1 extraction; does NOT shape the
   *  deterministic Layer-2 verdict (ADR-009 §4). */
  domain_context?: string
  /** The resolved proximity threshold. */
  threshold: KatorthomaProximityLevel
}

/** Discriminated outcome of the port. The route branches on `status`. */
export type GuardrailSandwichOutcome =
  | {
      status: 'verdict'
      verdict: GuardrailVerdictFields
      /** The Layer-1 extraction (the features Layer 2 reasoned over). Disclosed
       *  on the wire (R10-2) so a consumer can re-run applyMechanisms over it and
       *  verify the full action→extraction→assessment chain — parity with
       *  /api/reason, which also surfaces `extraction`. */
      extraction: Layer1Schema
      /** The bare deterministic Layer-2 assessment. Emitted on the wire as the
       *  bare `assessment` when signing is OFF; when signing is ON the signed
       *  wrapper below is the verifiable artifact (R10-1). */
      assessment: Layer2Assessment
      /** Present only when signing is enabled; the route emits it as
       *  signed_assessment {assessment, signature, key_id}. */
      signed: SignedLayer2Assessment | null
      /** The Layer-1 extraction call's token usage — for CI-8 cost honesty +
       *  CI-10 metering. */
      usage: LayerTokenUsage
      /** The justice-completion bridge's bounded call usage (ADR-010 §3), when the
       *  scope fired; null when it did not. Metered SEPARATELY by the route as a
       *  second call so cost + call-count stay honest (it is a real second LLM call). */
      justice_usage: LayerTokenUsage | null
      layer1_latency_ms: number
    }
  | {
      /** A Tier-1 force-clarification fired. A binary gate never halts to clarify
       *  (ADR-009 §3) — the route maps this to a CONSERVATIVE pause verdict. */
      status: 'tier1_pause'
      trigger: Tier1Trigger
      usage: LayerTokenUsage
      layer1_latency_ms: number
    }
  | {
      /** Signing was enabled but threw (key missing/malformed, or a
       *  canonicalisation error). Fail-CLOSED — the route returns 503; the
       *  substrate never emits an unsigned assessment when signing is on. */
      status: 'signing_unavailable'
    }
  | {
      /** Layer-1 extraction (or the deterministic Layer-2, defensively) failed.
       *  The route returns a CONSERVATIVE fallback verdict — a gate failure must
       *  never silently "proceed" (ADR-009 §5). */
      status: 'engine_unavailable'
      stage: 'layer1' | 'layer2'
      detail: string
    }

/**
 * Run the guardrail through the signed deterministic sandwich. Never throws —
 * every failure mode is returned as a discriminated outcome the route maps to
 * a fail-safe HTTP response.
 */
export async function runGuardrailSandwich(
  params: GuardrailSandwichParams,
): Promise<GuardrailSandwichOutcome> {
  // ---- Layer 1: ONE bounded LLM extraction (Sonnet, max_tokens 4000) --------
  const l1Start = Date.now()
  let schema
  let usage: LayerTokenUsage
  try {
    const extracted = await extractFeatures({
      input: params.action,
      context: params.context,
      domain_context: params.domain_context,
      urgency_context: params.urgency_context,
    })
    schema = extracted.schema
    usage = extracted.usage
  } catch (err) {
    return {
      status: 'engine_unavailable',
      stage: 'layer1',
      detail: err instanceof Error ? err.message : 'layer1_extraction_failed',
    }
  }
  const layer1_latency_ms = Date.now() - l1Start

  // ---- Layer 2: PURE deterministic mechanism application --------------------
  // Tier-1 force-clarification (ELEMENT_FUSION upstream; TEMPORAL/SCOPE in
  // applyMechanisms) → a binary gate cannot ask a clarifying question, so the
  // route maps a trigger to a conservative pause (ADR-009 §3). No suppression
  // (the gate has no continuation/clarification_response channel).
  try {
    const elementFusion = detectTier1Trigger(schema)
    if (elementFusion) {
      return { status: 'tier1_pause', trigger: elementFusion, usage, layer1_latency_ms }
    }
    // ADR-010 §4 DECOUPLE (2026-06-25, founder-elected at the §4 activation session).
    // The shared SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED env flag would otherwise
    // activate native dikaiosyne weighting INSIDE this Live gate's computeProximity
    // (applyMechanisms reads the env default when no option is passed). We pin it
    // OFF here so a single Vercel flip activates ONLY /api/reason — the Live gate
    // keeps the PROVEN §3 justice-completion bridge (resolveJusticeObligation /
    // applyJusticeFloor below) until the bridge is DELIBERATELY retired, which is
    // gated on the §4 full-sandwich LOCUS-2 coverage-equivalence proof (the §4
    // native trigger is strictly narrower than the bridge's kathekon moderate|strong
    // firing — the role-only circle-free class P5e; ADR-010 §4 build record). This
    // is byte-identical to today (the flag is unset ⇒ both resolve to false); it is
    // the guarantee that flipping the flag does not touch this gate.
    const l2 = applyMechanisms(schema, { dikaiosyneWeighting: false })
    if ('tier1_trigger' in l2) {
      return { status: 'tier1_pause', trigger: l2.tier1_trigger, usage, layer1_latency_ms }
    }
    const assessment: Layer2Assessment = l2

    // ---- Sign (fail-closed when enabled) -----------------------------------
    let signed: SignedLayer2Assessment | null = null
    if (isLayer2SigningEnabled()) {
      try {
        signed = signLayer2Assessment(assessment)
      } catch {
        // Never emit an unsigned assessment when signing is enabled.
        return { status: 'signing_unavailable' }
      }
    }

    // ---- Justice-completion bridge (ADR-010 §3) ----------------------------
    // Fires ONLY when the deterministic engine signalled a justice-toward-others
    // dimension (a circle identified / obligation recorded unevaluated / an
    // other-affecting value error — justiceCheckScope). When it fires, ONE bounded
    // Sonnet call resolves the obligation the engine left open; applyJusticeFloor
    // (inside deriveGuardrailVerdict) floors the SURFACED proximity per the
    // resolution. The SIGNED assessment above is the RAW deterministic engine
    // (unchanged — the verifiable artifact); the bridge COMPLETES the engine's own
    // unresolved output, it does not override it (the mentor's one constraint).
    // resolveJusticeObligation NEVER throws — a failure returns 'unevaluated'
    // (fail-closed → reflexive, J1). EXPIRES when the root correction (ADR-010 §4)
    // weights dikaiosyne natively in computeProximity.
    let justiceResolution: JusticeResolution | null = null
    let justice_usage: LayerTokenUsage | null = null
    const scope = justiceCheckScope(assessment)
    if (scope.fires) {
      const r = await resolveJusticeObligation({
        action: params.action,
        context: params.context,
        circles: scope.circles,
        valueError: scope.valueError,
      })
      justiceResolution = r.resolution
      justice_usage = r.usage
    }

    // ---- Verdict (pure rank arithmetic over the justice-completed proximity) -
    const verdict = deriveGuardrailVerdict(assessment, params.threshold, justiceResolution)
    return {
      status: 'verdict',
      verdict,
      extraction: schema,
      assessment,
      signed,
      usage,
      justice_usage,
      layer1_latency_ms,
    }
  } catch (err) {
    // Defensive: applyMechanisms/detectTier1Trigger are pure and should not throw
    // on a validated schema; if they do, fail SAFE (conservative pause), never
    // "proceed".
    return {
      status: 'engine_unavailable',
      stage: 'layer2',
      detail: err instanceof Error ? err.message : 'layer2_application_failed',
    }
  }
}
