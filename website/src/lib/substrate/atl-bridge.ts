/**
 * atl-bridge.ts — the substrate ↔ Agent Trust Layer bridge.
 *
 * STATUS: Scaffolded → Wired → Verified (2026-05-15, this session). New code,
 * imported by no route — no production exposure this session.
 *
 * GOVERNING DOCUMENTS:
 *   - /adopted/substrate-modes/agent-trust-layer-wrapper-spec.md (the spec —
 *     Adopted 2026-05-14; this module builds its §"Component 1"
 *     Layer2Assessment → EvaluatedAction mapping table — "the bridge")
 *   - /operations/decision-log.md — D-ATL-BRIDGE-WIRED-VERIFIED-2026-05-15
 *     (this build; the Step 2 design-decision gate is recorded there)
 *   - /manifest.md §R4 (IP boundary) / §AC8 (translation-sandwich substrate)
 *
 * WHAT THIS MODULE IS
 *
 * The existing /trust-layer/ build (3 April 2026, pre-substrate) was designed
 * to consume "ReasoningReceipts" from the old bundled engine. The ATL Wrapper
 * spec's central reconciliation move is to make the translation-sandwich
 * substrate's signed Layer2Assessment the source of the trust layer's
 * EvaluatedAction instead — so the existing window-aggregator / grade-engine /
 * badge infrastructure runs on substrate output.
 *
 * This module is THAT bridge: a pure, synchronous, deterministic projection
 * from a Layer2Assessment (+ a BridgeContext carrying the four fields the
 * substrate does not itself hold) to a single EvaluatedAction. It is the PR1
 * single-endpoint proof of the substrate↔ATL bridge pattern — everything else
 * in the ATL arc (the wrapper, the badge, trajectory awareness) depends on
 * this mapping existing.
 *
 * THE tsconfig BOUNDARY (Step 2 design-decision gate — founder-confirmed)
 *
 * /trust-layer/ sits OUTSIDE website/'s tsconfig root: website/tsconfig.json's
 * "include" globs are rooted at website/, and there is no root-level or
 * trust-layer/ tsconfig. A module here therefore CANNOT import EvaluatedAction
 * from /trust-layer/types/evaluation.ts without pulling ~4,200 lines of
 * never-strict-compiled code into tsc. Per the founder's election at this
 * session's Step 2 gate, the EvaluatedAction target type — and its two
 * dependency enums — are MIRRORED into this file as local declarations (see
 * "MIRRORED TARGET TYPES" below). This is consistent with /trust-layer/'s own
 * established self-containment pattern: its BUILD-LOG records that it
 * re-declared KatorthomaProximityLevel etc. rather than coupling to
 * website/src. The mirror is a known manual-sync point — if /trust-layer/'s
 * EvaluatedAction changes, this mirror must be updated in the same change. A
 * later ATL session (the wrapper build, spec step 5) can consolidate the
 * boundary once more of it is crossed.
 *
 * THE BridgeContext (Step 1 survey finding)
 *
 * Four EvaluatedAction fields are NOT carried on Layer2Assessment and cannot
 * be: Layer2Assessment is idempotent by design (no clock read, no identity, no
 * signature inside it — same Layer1Schema in → byte-identical assessment out).
 * Those four fields — agent_id, evaluated_at, skill_id, and the material
 * receipt_id derives from — are supplied by the caller via BridgeContext. The
 * spec's mapping table omits agent_id entirely; the Step 1 survey surfaced it
 * (the substrate holds no server-side agent identity — the wrapper does). The
 * bridge signature is therefore (Layer2Assessment, BridgeContext) →
 * EvaluatedAction, not (Layer2Assessment) → EvaluatedAction.
 *
 * COMPLIANCE
 *
 *   - R4 (IP boundary): this module maps Layer 2's OUTPUT to the trust layer's
 *     EvaluatedAction. It exposes no engine internals, lookup tables, or
 *     thresholds — EvaluatedAction is itself an R4-respecting shape.
 *   - AC8: this module sits in /website/src/lib/substrate/ and consumes the
 *     translation-sandwich Layer 2 output.
 *   - PR1: single-endpoint proof — this one mapping function proves the
 *     substrate↔ATL bridge pattern before the wrapper rolls it out.
 *   - PR2: build-to-wire-verification immediate — the test file
 *     (__tests__/atl-bridge.test.ts) invokes this function in the same session
 *     this module is written.
 *   - PR4: N/A — no LLM call. The bridge is a deterministic projection.
 *   - PR10: the build follows the Plan → Execute → Verify loop; the Step 2
 *     design-decision gate was the Plan step.
 */

import { createHash } from 'node:crypto'

import type { Layer2Assessment } from '@/lib/translation-sandwich/layer2-mechanisms'

// ============================================================================
// MIRRORED TARGET TYPES
//
// Re-declared verbatim from /trust-layer/types/evaluation.ts +
// /trust-layer/types/accreditation.ts. /trust-layer/ sits outside website/'s
// tsconfig root and cannot be imported here (see the module header). KEEP IN
// SYNC: if the /trust-layer/ originals change, update these mirrors in the
// same change. The source-of-truth path is named on each declaration.
// ============================================================================

/** MIRRORED from /trust-layer/types/accreditation.ts — the 5-level katorthoma
 *  proximity scale. Structurally identical to the substrate's own
 *  `KatorthomaProximity` (layer2-mechanisms.ts); mirrored here so the target
 *  EvaluatedAction shape is self-contained on this side of the boundary. */
export type KatorthomaProximityLevel =
  | 'reflexive'
  | 'habitual'
  | 'deliberate'
  | 'principled'
  | 'sage_like'

/** MIRRORED from /trust-layer/types/accreditation.ts — the 4 root passion
 *  identifiers. Structurally identical to the substrate's own `RootPassion`
 *  (layer1-extractor.ts). */
export type RootPassionId = 'epithumia' | 'hedone' | 'phobos' | 'lupe'

/** MIRRORED from /trust-layer/types/evaluation.ts — `EvaluatedAction`, the
 *  single-action unit the trust layer's window-aggregator consumes. This is
 *  the MAPPING TARGET. The mirror is verbatim including `readonly` modifiers;
 *  keep it byte-faithful to the /trust-layer/ original. */
export type EvaluatedAction = {
  /** Receipt ID linking back to the full reasoning trace. */
  readonly receipt_id: string
  /** Agent that performed this action. */
  readonly agent_id: string
  /** When this action was evaluated (ISO 8601). */
  readonly evaluated_at: string
  /** Proximity level from the 4-stage evaluation. */
  readonly proximity: KatorthomaProximityLevel
  /** Whether the action was deemed appropriate. */
  readonly is_kathekon: boolean
  /** Quality of the kathekon assessment. */
  readonly kathekon_quality: 'strong' | 'moderate' | 'marginal' | 'contrary'
  /** Passions detected during evaluation. */
  readonly passions_detected: {
    readonly root_passion: RootPassionId
    readonly sub_species: string
  }[]
  /** Virtue domains engaged in this action. */
  readonly virtue_domains_engaged: string[]
  /** Whether oikeiosis obligations were met (null when not assessed). */
  readonly oikeiosis_met: boolean | null
  /** Which oikeiosis stage was relevant, if any. */
  readonly oikeiosis_stage: string | null
  /** Ruling faculty state description. */
  readonly ruling_faculty_state: string
  /** Which skill produced this evaluation. */
  readonly skill_id: string
}

// ============================================================================
// BRIDGE CONTEXT — the four fields Layer2Assessment does not carry
// ============================================================================

/**
 * The caller-supplied context the bridge needs to complete an EvaluatedAction.
 *
 * Layer2Assessment is idempotent by design — it carries no identity, no clock,
 * and no signature. These four fields therefore come from the consumer that
 * made the substrate call (in the full ATL Wrapper, that is the wrapper itself
 * — spec step 5):
 *
 *   - agent_id     — the wrapped agent's identifier. The spec's mapping table
 *                    omits this; the Step 1 survey surfaced it. The substrate
 *                    holds no server-side agent identity.
 *   - evaluated_at — the substrate response timestamp (ISO 8601), captured by
 *                    the consumer when the assessment was received.
 *   - skill_id     — the consumer context / prose_mode that produced the
 *                    assessment.
 *   - signature    — the base64 Ed25519 signature from the
 *                    SignedLayer2Assessment wrapper (layer2-signer.ts).
 *                    receipt_id is derived from it (see deriveReceiptId) — the
 *                    founder-confirmed convention at this session's Step 2
 *                    gate: anchoring the receipt to the signature
 *                    cryptographically ties each EvaluatedAction to its signed
 *                    source.
 */
export interface BridgeContext {
  agent_id: string
  evaluated_at: string
  skill_id: string
  signature: string
}

// ============================================================================
// receipt_id DERIVATION (Step 2 design-decision gate — founder-confirmed)
// ============================================================================

/** Prefix for derived receipt IDs — distinguishes a substrate-derived receipt
 *  from any legacy ReasoningReceipt ID format. */
export const RECEIPT_ID_PREFIX = 'rcpt_'

/**
 * Derive a receipt_id from a SignedLayer2Assessment's Ed25519 signature.
 *
 * Pure + deterministic: the same signature always yields the same receipt_id.
 * The signature is unique per signed assessment (Ed25519 over the canonical
 * JSON), so the SHA-256 of it is a collision-resistant, fixed-length,
 * ID-shaped value that cryptographically anchors the receipt to its signed
 * source.
 *
 * `createHash` is synchronous and deterministic — it does not break the
 * bridge's purity (no I/O, no clock, no randomness).
 */
export function deriveReceiptId(signature: string): string {
  const digest = createHash('sha256').update(signature, 'utf8').digest('hex')
  return `${RECEIPT_ID_PREFIX}${digest}`
}

// ============================================================================
// THE BRIDGE — Layer2Assessment → EvaluatedAction
// ============================================================================

/**
 * Map a Layer2Assessment (+ its BridgeContext) to a single EvaluatedAction —
 * the unit the trust layer's window-aggregator consumes.
 *
 * Pure, synchronous, deterministic: the same (assessment, context) pair always
 * produces a byte-identical EvaluatedAction. No clock read, no randomness, no
 * I/O.
 *
 * Field mapping (per the ATL Wrapper spec's Component 1 mapping table + the
 * Step 2 design-decision gate):
 *
 *   receipt_id             ← deriveReceiptId(context.signature)
 *   agent_id               ← context.agent_id       (not on Layer2Assessment)
 *   evaluated_at           ← context.evaluated_at   (not on Layer2Assessment)
 *   proximity              ← assessment.katorthoma_proximity
 *   is_kathekon            ← assessment.kathekon_assessment.is_kathekon ?? false
 *                            (Layer 2 emits null when undecidable; the trust
 *                            layer's EvaluatedAction is non-null — null narrows
 *                            to false, "not demonstrably appropriate")
 *   kathekon_quality       ← assessment.kathekon_assessment.quality
 *   passions_detected      ← assessment.passion_diagnosis.passions_detected,
 *                            projected to {root_passion, sub_species}; a null
 *                            sub_species narrows to '' (still groups cleanly in
 *                            the aggregator's persisting-passion key)
 *   virtue_domains_engaged ← assessment.virtue_domains_engaged (copied)
 *   oikeiosis_met          ← the FIRST relevant circle's obligation_met, or null
 *                            when no circles were assessed
 *   oikeiosis_stage        ← the FIRST relevant circle's circle, or null
 *                            (relevant_circles[0] — the Layer 2 engine's own
 *                            "primary circle" convention)
 *   ruling_faculty_state   ← assessment.ruling_faculty_state
 *   skill_id               ← context.skill_id       (not on Layer2Assessment)
 */
export function mapLayer2AssessmentToEvaluatedAction(
  assessment: Layer2Assessment,
  context: BridgeContext
): EvaluatedAction {
  // oikeiosis: the trust layer's EvaluatedAction wants a single met/stage pair;
  // Layer 2 carries an array of circle assessments. Per the Step 2 gate, the
  // bridge selects the FIRST relevant circle — the Layer 2 engine's own
  // "primary circle" convention. No circles assessed → both fields null.
  const circles = assessment.oikeiosis.relevant_circles
  const primaryCircle = circles.length > 0 ? circles[0] : null

  return {
    receipt_id: deriveReceiptId(context.signature),
    agent_id: context.agent_id,
    evaluated_at: context.evaluated_at,
    proximity: assessment.katorthoma_proximity,
    is_kathekon: assessment.kathekon_assessment.is_kathekon ?? false,
    kathekon_quality: assessment.kathekon_assessment.quality,
    passions_detected: assessment.passion_diagnosis.passions_detected.map(
      (p) => ({
        root_passion: p.root_passion,
        sub_species: p.sub_species ?? '',
      })
    ),
    virtue_domains_engaged: [...assessment.virtue_domains_engaged],
    oikeiosis_met: primaryCircle ? primaryCircle.obligation_met : null,
    oikeiosis_stage: primaryCircle ? primaryCircle.circle : null,
    ruling_faculty_state: assessment.ruling_faculty_state,
    skill_id: context.skill_id,
  }
}
