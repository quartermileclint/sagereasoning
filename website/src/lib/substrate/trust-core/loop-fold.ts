/**
 * loop-fold.ts — the AE-2 CI-4 signed-loop fold (ADR-014 §3.2; build slice
 * AE-2). Wires the previously dark, zero-caller `combineVerificationResults`
 * (S3, combiner.ts) into a read path: the accreditation write boundary's
 * verified provenance chain — the ONLY place the CI-4 examination markers
 * (`examination.{ref, depth_tier, prior_feedback_ref}`, signed inside each
 * assessment) are readable server-side. No durable store persists them
 * (verified 2026-07-18: `agent_assessment_history`, `evaluated_actions`, and
 * `agent_accreditation` all carry the flat EvaluatedAction projection only), so
 * per ADR-014 §3.1 — "no signal without a feeding column … NOT a read-side
 * improvisation" — the fold covers the SUBMITTED chain and DISCLOSES that a
 * stored-history fold would need a row-widening decision (a schema change, its
 * own founder-walked step; named as an A8-review input, not improvised here).
 *
 * WHAT IT COMPUTES (a projection of the ONE record, ADR-014 §4):
 *   1. Per-element Ed25519 RE-VERIFICATION (the derive-trust-events pattern —
 *      injectable verifier, default the real one). Unverified elements are
 *      EXCLUDED and counted. This makes the ADR-013 §8 envelope scope
 *      STRUCTURAL: signed CI-4 loops only — an unsigned V3 chain element can
 *      never enter the fold, so the S10-narrowed envelope (exactly one
 *      disclosed exception: reflect) does not silently gain a second.
 *   2. The KATHEKON-ENGAGEMENT CLASSIFICATION of every loop (ADR-014 §3.2's
 *      binding guard): each redirection-bearing element's OPENING VERDICT is
 *      classified through the canonical shared Q3 predicate
 *      (`assessKathekonEngagement` via `kathekonSignalsFromAssessment` —
 *      kathekon-engagement.ts, the exact function the eventual S11 G6(a) flip
 *      binds on; reused, never re-implemented). Only kathekon-ENGAGED loops
 *      feed a closure signal (`character`); non-engaged redirection loops —
 *      the measured false-positive hold class ("contrary; no kathekon factors
 *      detected") — surface separately as `instrument_calibration`, NEVER as
 *      agent character data. The false-hold class cannot launder into
 *      character by construction.
 *   3. The per-domain fold via `combineVerificationResults` (wiring the
 *      existing dark lib, never re-implementing): within-chain supersession by
 *      explicit ref links + the Q4 same-depth closure rule (both via the live
 *      `analyseLoopClosure` semantics the combiner reuses), per-domain
 *      isolation, conflict ⇒ pause with the conservative MIN — never an
 *      average. Per-domain publication is EVIDENCE-FLOORED (the R13
 *      generalisation): a domain fed by fewer than EVIDENCE_FLOOR verdicts
 *      emits the DISTINCT `insufficient_extraction` with a `*_basis` — never a
 *      defaulted level.
 *   4. Chain-level closure counts for BOTH classes via the SAME live
 *      `analyseLoopClosure` (engaged-only projection for character;
 *      non-engaged-only projection for calibration).
 *
 * HONESTY BOUNDS (each disclosed ON the block, none tunable away):
 *   • NO PER-ELEMENT TIMESTAMP EXISTS (the signed envelope is
 *     {assessment, signature, key_id} — no signed time). `occurredAt` is
 *     therefore SYNTHESIZED FROM SUBMISSION ORDER (the same ordering authority
 *     the live CI-4 gate itself uses), disclosed as `occurred_at_basis:
 *     'submission_order'`. Consequence: the combiner's cross-session recency
 *     weighting DEGENERATES to confidence weighting — the conservative
 *     direction (an older conflicting terminal never decays out of contention,
 *     so conflicts are MORE detectable, never less; no wall-clock claim is
 *     made).
 *   • REGIME ATTRIBUTION REFUSED (ADR-014 §6 inherited): with no per-element
 *     signed timestamp, the extraction regime of each element is NOT
 *     recoverable — a submitted chain may mix pre- and post-S11b-recomposition
 *     extractions undetectably. The fold computes NO between-time trend (so
 *     the instrument-change-certified-as-character-change failure cannot occur
 *     inside the block), labels the WRITE date's era via the SHARED
 *     `assignRegimeEra` (trajectory-delta.ts — AE-1's settled boundaries,
 *     never duplicated), and REFUSES temporal attribution explicitly. Readers
 *     comparing fold blocks across writes are warned the comparison may cross
 *     the regime boundary.
 *   • THE PA-10 REPLAY CLASS rides the same absence: an old genuinely-signed
 *     assessment re-submitted in a later chain is not age-detectable here
 *     (the standing disclosed class; closure candidates tracked at S2-wiring).
 *   • THE NARROWED-ARM BOUNDS (R13) ride every classification: the engagement
 *     read inherits kathekon-engagement.ts's narrowed Arm 1, so
 *     NARROWED_ARM_BOUNDS (A2 omission — structural; mention-conversion —
 *     measured) are carried verbatim on the block.
 *
 * MEASURE-ONLY BY CONSTRUCTION (ADR-014 §3.2 + §5): the block has NO
 * recommendation field, is NOT an input to the S4 intervention engine, is
 * NEVER a trust-event or decrease source, and NEVER affects the write outcome
 * (annotation on the success response only; the route computes it AFTER the
 * writer succeeds, fail-soft). It must not re-introduce the refused G6
 * open-loop bound: open-loop counts are descriptive counts of the record,
 * bound to nothing. ENFORCE remains S11, refused on readiness. Weights-tier
 * use BLOCKED (a closure gradient is the shape of a training reward; no such
 * use is offered or supported — restated in the R18 docs at activation).
 *
 * PURE-WITH-INJECTED-CLOCK (the derive-trust-events posture): no I/O, no env
 * reads in the computation; `now` is injected (signature-rotation windows +
 * the write-era label only — never per-element ordering). The env flag is read
 * by the route seam via `isLoopFoldEnabled()` below; the computation itself is
 * flag-free so it stays unit-testable.
 */

import type { SignedLayer2Assessment } from '@/lib/translation-sandwich/layer2-signer'
import { verifyLayer2Signature } from '@/lib/translation-sandwich/layer2-verifier'
import type {
  KatorthomaProximity,
  Layer2Assessment,
} from '@/lib/translation-sandwich/layer2-mechanisms'
import type { CorroborationReport } from '@/lib/translation-sandwich/corroboration-check'
import type { ReasonDepth } from '@/lib/depth-constants'
import {
  analyseLoopClosure,
  type LoopClosureAnalysis,
  type LoopClosureMarkers,
} from '@/app/api/accreditation/[agent_id]/loop-closure-gate'
import {
  combineVerificationResults,
  type CombinedDomainVerdict,
  type VerificationVerdict,
} from './combiner'
import {
  assessKathekonEngagement,
  kathekonSignalsFromAssessment,
  NARROWED_ARM_BOUNDS,
  type KathekonEngagement,
} from './kathekon-engagement'
import { assessConfidence, type CorroborationState } from './confidence-tiers'
import { PROXIMITY_RANK } from './constants'
import type { VirtueTrustDomain } from './types'
import {
  resolveLongitudinalIdentity,
  type LongitudinalIdentity,
} from '../longitudinal-identity'
import {
  assignRegimeEra,
  EVIDENCE_FLOOR,
  SETTLED_REGIME_BOUNDARIES,
  type RegimeBoundary,
} from '../trajectory-delta'

// ============================================================================
// FLAG (SUBSTRATE_LOOP_FOLD_ENABLED) — UNSET = byte-identical, no fold
// ============================================================================
//
// AE-2 (ADR-014 §3.2, 2026-07-18). Gates the ONE seam: the accreditation write
// boundary's flag-gated identity resolve + fold computation + the `loop_fold`
// block on the write SUCCESS response. UNSET ⇒ no extra DB read, no
// computation, no response field — byte-identical to pre-AE-2. Independent of
// SUBSTRATE_LOOP_CLOSURE_GATE_ENABLED (the CI-4 detect/reject gate — a
// DIFFERENT feature whose behaviour this module never alters) and of the
// trajectory flags (this fold does not read the trajectory store).

export const LOOP_FOLD_ENV_VAR = 'SUBSTRATE_LOOP_FOLD_ENABLED'

/** True only when the flag is the exact string 'true'. Read at call time (the
 *  sibling-flag convention); the computation below stays flag-free. */
export function isLoopFoldEnabled(): boolean {
  return process.env[LOOP_FOLD_ENV_VAR] === 'true'
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Defensive cap on fold input (cost bound — Ed25519 re-verification is
 *  per-element CPU). Elements beyond the cap are NOT silently dropped: the
 *  block reports `n_truncated` (the no-silent-caps rule). */
export const MAX_FOLD_ELEMENTS = 64

/** The single chain-scope key: the submitted provenance chain is ONE chain
 *  (no session marker exists inside the signed payload), so supersession +
 *  closure run record-wide by EXPLICIT ref links — exactly the live CI-4
 *  gate's own treatment of the same array. */
const CHAIN_SESSION_ID = 'submitted-chain'

/** Deterministic submission-order timestamps (see header — no per-element
 *  signed time exists). Base is epoch; 1s per index keeps Date.parse exact. */
function submissionOrderIso(index: number): string {
  return new Date(index * 1000).toISOString()
}

// ============================================================================
// BLOCK SHAPE
// ============================================================================

/** Per-domain evidence basis (the R13 `*_basis` discipline, fold-shaped:
 *  the fold has no halves — its floor gates on verdicts feeding the domain). */
export interface LoopDomainBasis {
  /** Verified verdicts that fed this domain (pre-supersession). */
  verdicts_in: number
  /** Kathekon-engaged redirection verdicts among them. */
  engaged_redirections: number
  /** The publication floor (EVIDENCE_FLOOR — shared with AE-1). */
  floor: number
}

/** The published per-domain fold — the combiner's verdict, minus the raw
 *  terminal objects (levels/markers stay; full assessments never echo). */
export interface LoopDomainFold {
  level: KatorthomaProximity
  resolution: 'combined' | 'pause-escalate'
  conflict: boolean
  open_loop: boolean
  terminals: number
  basis: string
}

/** Chain-level closure counts (the live analyseLoopClosure's own shape). */
export type LoopClosureCounts = Pick<
  LoopClosureAnalysis,
  'verdict' | 'redirections' | 'closed' | 'open' | 'indeterminate'
>

export interface LoopFoldEnvelopeReport {
  scope: 'signed_ci4_loops_only'
  n_elements: number
  n_verified: number
  n_unverified_excluded: number
  /** Independent-review fold: the subset of n_unverified_excluded whose
   *  verifier reason was an OPERATIONAL misconfiguration
   *  (verifier_key_unavailable / verifier_key_malformed — layer2-verifier.ts's
   *  own vocabulary), distinct from a genuinely absent/fake signature. A
   *  non-zero count here means the verifier itself may be misconfigured, not
   *  that the submitter presented nothing real. */
  n_verifier_unavailable: number
  n_malformed_excluded: number
  /** Independent-review fold: elements past MAX_FOLD_ELEMENTS were NEVER
   *  presented to the verifier — distinct from n_unverified_excluded (which
   *  WAS inspected and failed). Cap-before-verify is the cost bound (Ed25519
   *  verification is per-element CPU; capping AFTER verifying would let an
   *  unbounded-length submission force unbounded CPU); this field makes that
   *  bound's cost honest rather than silent. */
  n_truncated_uninspected: number
  /** Independent-review fold: exact-duplicate signed envelopes (identical
   *  signature — Ed25519 unforgeability means an identical signature implies
   *  identical signed content) are excluded from the verdict-building input so
   *  a replayed envelope cannot inflate a domain's evidence count past
   *  EVIDENCE_FLOOR with non-independent evidence. Counted, never silent. */
  n_duplicate_excluded: number
  note: string
}

export interface LoopFoldBlock {
  schema: 'agent-loop-fold-v1'
  vocabulary_note: string
  /** The canonical identity the fold is scoped to (resolved at the route via
   *  resolveLongitudinalIdentity — ADR-014 §4; at this write boundary the
   *  credential is owner+agent-bound by the 6e §A invariant, so the pair
   *  resolves whenever the store row carries both). */
  identity: LongitudinalIdentity
  /** Independent-review fold: UNCONDITIONAL disclosure of the write
   *  boundary's own structural invariant, so a reader can tell "the owner
   *  lookup failed" apart from "this credential is genuinely owner-less"
   *  without the fold having to (it cannot) distinguish the two internally. */
  identity_context: string
  /** The fold covers the SUBMITTED chain only — no server store persists the
   *  markers (disclosed; the row-widening is a named schema decision). */
  chain_scope: string
  envelope: LoopFoldEnvelopeReport
  ordering: {
    occurred_at_basis: 'submission_order'
    note: string
  }
  regime: {
    write_era: string
    boundaries: readonly RegimeBoundary[]
    attribution: string
  }
  replay_bound: string
  /** Kathekon-ENGAGED loops + their per-domain folds — the character side. */
  character: {
    loops: LoopClosureCounts
    domains: Record<string, LoopDomainFold | 'insufficient_extraction'>
    domains_basis: Record<string, LoopDomainBasis>
    note: string
  }
  /** Non-engaged redirection loops — the measured false-positive hold class.
   *  Instrument data, never character data. */
  instrument_calibration: {
    loops: LoopClosureCounts
    note: string
  }
  /** Verified elements that engaged no virtue domain — countable, not
   *  domain-foldable (disclosed; the combiner's per-domain isolation is
   *  inherited as-is, so a domain-less closer closes nothing). */
  n_no_domain: number
  measure_note: string
  bounds: typeof NARROWED_ARM_BOUNDS
}

/** Locked wording (battery-pinned). Record-descriptive; never predictive. */
export const LOOP_FOLD_VOCABULARY_NOTE =
  'This block describes the submitted signed examination chain (past tense); ' +
  'it evaluates the record and predicts nothing. insufficient_extraction ' +
  'means a domain’s feeding verdicts did not meet the evidence floor in this ' +
  'chain; the domain’s basis counts distinguish thin history from absence. ' +
  'It is never a defaulted level.'

export const LOOP_FOLD_IDENTITY_CONTEXT_NOTE =
  'At the accreditation write boundary a write-class credential structurally ' +
  'always carries both an owner and an agent identity (the 6e §A DB ' +
  'invariant on api_keys_sage_assent_write_requires_owner_and_agent). If ' +
  '`identity.kind` reads "credential" on THIS block, the owner lookup ' +
  'FAILED at fold time (an operational anomaly, never a fail-closed refusal ' +
  'of a write) — it is NOT the genuinely owner-less case that ' +
  'longitudinal-identity.ts documents for consult-class credentials, which ' +
  'cannot occur at this boundary.'

export const LOOP_FOLD_CHAIN_SCOPE_NOTE =
  'Scope: the provenance chain submitted with THIS write. The CI-4 ' +
  'examination markers are signed inside each assessment and are not ' +
  'persisted by any server store, so no stored-history fold exists; ' +
  'persisting them is a row-widening schema decision (its own founder-walked ' +
  'step, named as an A8-review input), not improvised here.'

export const LOOP_FOLD_ORDERING_NOTE =
  'Elements carry no signed timestamp; ordering is the submitted array order ' +
  '(the same authority the live CI-4 gate uses). No wall-clock claim is made; ' +
  'recency weighting degenerates to confidence weighting — conservative: an ' +
  'older conflicting terminal never decays out of contention.'

export const LOOP_FOLD_ATTRIBUTION_NOTE =
  'Temporal attribution REFUSED: per-element extraction regime is not ' +
  'recoverable (no signed timestamp), so a submitted chain may mix ' +
  'extraction regimes undetectably and this block computes no between-time ' +
  'trend. write_era labels the WRITE date only. Comparing fold blocks across ' +
  'writes may cross the extraction-regime boundary; a shift across that ' +
  'boundary is attributable to instrument calibration, not the agent’s ' +
  'disposition, and this block does not make that attribution.'

export const LOOP_FOLD_REPLAY_BOUND =
  'PA-10 (standing, disclosed): an old genuinely-signed assessment ' +
  're-submitted in a later chain is not age-detectable here (no signed ' +
  'timestamp); the fold cannot distinguish fresh from replayed evidence.'

export const LOOP_FOLD_CHARACTER_NOTE =
  'Every verified element that is NOT a kathekon-non-engaged redirection ' +
  '(neither closure counts nor domain levels) feeds this side: an ordinary ' +
  '(non-redirection) verdict always feeds domain levels; a redirection feeds ' +
  'domain levels AND closure signals only when its opening verdict engaged a ' +
  'kathekon factor (the canonical Q3 predicate — justice surface with ≥1 ' +
  'circle / violated obligation / proximity ≤ habitual / sub-species ' +
  'passion). A kathekon-non-engaged redirection — the measured false-positive ' +
  'hold class — is excluded from BOTH closure and domain-level input (see ' +
  'instrument_calibration): it cannot set an open loop and cannot set a ' +
  'domain’s level. Domain folds otherwise inherit the combiner’s semantics: ' +
  'supersession by explicit ref links, the Q4 same-depth closure rule, ' +
  'per-domain isolation, and conflict ⇒ pause with the conservative minimum ' +
  '— never an average.'

export const LOOP_FOLD_CALIBRATION_NOTE =
  'Loops whose opening verdict engaged NO kathekon factor — the measured ' +
  'false-positive hold class ("contrary; no kathekon factors detected"). ' +
  'These are EXCLUDED from character (both the closure signal and the ' +
  'domain-level fold — independent-review fold, ADR-014 §3.2\'s plain-text ' +
  'guard made structural): they are data about the instrument’s ' +
  'calibration, never about the agent’s character, and feed no character ' +
  'signal and no closure rate.'

export const LOOP_FOLD_MEASURE_NOTE =
  'MEASURE-only: this block binds nothing — it is not an intervention input, ' +
  'not a trust-event source, and never affects the write outcome. Open-loop ' +
  'counts are descriptive; the refused S11 G6 open-loop bound is not ' +
  're-introduced by this surface. Evaluative, never predictive; weights-tier ' +
  'use is blocked.'

export const LOOP_FOLD_ENVELOPE_NOTE =
  'Signed CI-4 loops only — unsigned V3 deliberation chains never enter ' +
  'this record. Every element WITHIN THE CAP (n_verified + ' +
  'n_unverified_excluded + n_malformed_excluded + n_duplicate_excluded) was ' +
  'Ed25519 re-verified at fold time; elements past the cap ' +
  '(n_truncated_uninspected) were NEVER presented to the verifier — cap-' +
  'before-verify bounds cost (independent-review fold: this claim was ' +
  'previously stated unconditionally, which was false on truncation). A ' +
  'non-zero n_verifier_unavailable means the verifier itself may be ' +
  'misconfigured, not that the submitter presented nothing real.'

// ============================================================================
// EXTRACTION HELPERS (defensive — the chain is caller-supplied)
// ============================================================================

/** One verified, narrowed chain element. */
interface FoldElement {
  index: number
  assessment: Layer2Assessment
  markers: LoopClosureMarkers
  /** The engine's Rule-5 correction carrier — this element OPENED a loop. */
  redirection: boolean
  /** The Q3 reading of this element's verdict (computed for every element —
   *  the classification input for redirection-bearing ones). */
  engagement: KathekonEngagement
  proximity: KatorthomaProximity
  domains: VirtueTrustDomain[]
}

function extractMarkers(a: Layer2Assessment): LoopClosureMarkers {
  const exam = (a as { examination?: unknown }).examination
  if (typeof exam !== 'object' || exam === null) return {}
  const e = exam as Record<string, unknown>
  return {
    ref: typeof e.ref === 'string' ? e.ref : undefined,
    depth_tier: typeof e.depth_tier === 'string' ? e.depth_tier : undefined,
    prior_feedback_ref:
      typeof e.prior_feedback_ref === 'string' ? e.prior_feedback_ref : undefined,
  }
}

/** The A5 corroboration state of one assessment: contradicted when the live
 *  check flagged any contradiction; corroborated only when a report exists
 *  with ≥1 finding and every finding corroborated; else uncorroborated (the
 *  conservative floor — covers absent reports and mixed findings). Exported
 *  for the battery (it feeds the combiner's conflict-materiality weighting,
 *  which the published block does not echo per element). */
export function corroborationStateOf(report: CorroborationReport | undefined): CorroborationState {
  if (report === undefined || report === null) return 'uncorroborated'
  if (report.any_contradiction === true) return 'contradicted'
  const findings = Array.isArray(report.findings) ? report.findings : []
  if (findings.length > 0 && findings.every((f) => f?.finding === 'corroborated')) {
    return 'corroborated'
  }
  return 'uncorroborated'
}

/** The A5 depth of one element: the SIGNED examination marker's depth_tier
 *  when valid; a missing/invalid marker reads as 'quick' — the CONSERVATIVE
 *  floor (A5 tier 5), never an assumed deeper examination. Exported for the
 *  battery (same reason as corroborationStateOf). */
export function depthOf(markers: LoopClosureMarkers): ReasonDepth {
  return markers.depth_tier === 'standard' || markers.depth_tier === 'deep'
    ? markers.depth_tier
    : 'quick'
}

/** Shape one element list for the live analyseLoopClosure, with the
 *  redirection flag PROJECTED per class (engaged-only / calibration-only) so
 *  each class's closure counts come from the SAME live rule, never a
 *  re-implementation. Non-class redirections read as plain verdicts (their
 *  markers stay, so they can still CLOSE other loops via ref links). */
function closureProjection(
  elements: FoldElement[],
  redirectionOn: (el: FoldElement) => boolean,
): unknown[] {
  return elements.map((el) => ({
    assessment: {
      improvement_path_structured: redirectionOn(el) ? { redirection: true } : null,
      examination: {
        ...(el.markers.ref !== undefined && { ref: el.markers.ref }),
        ...(el.markers.depth_tier !== undefined && { depth_tier: el.markers.depth_tier }),
        ...(el.markers.prior_feedback_ref !== undefined && {
          prior_feedback_ref: el.markers.prior_feedback_ref,
        }),
      },
    },
  }))
}

const closureCounts = (a: LoopClosureAnalysis): LoopClosureCounts => ({
  verdict: a.verdict,
  redirections: a.redirections,
  closed: a.closed,
  open: a.open,
  indeterminate: a.indeterminate,
})

// ============================================================================
// THE FOLD (pure-with-injected-clock)
// ============================================================================

/** verifyLayer2Signature's structural result (the derive-trust-events cast). */
type VerifyResult = { valid: true; key_id: string } | { valid: false; reason: string }
type VerifyFn = (signed: unknown, now: Date) => VerifyResult

export interface LoopFoldOptions {
  /** Resolved at the route via resolveLongitudinalIdentity (ADR-014 §4). */
  identity: LongitudinalIdentity
  /** Injected clock — signature-rotation windows + the write-era label ONLY
   *  (never per-element ordering). */
  now: Date
  /** Injectable for tests; defaults to the real Ed25519 verifier. */
  verify?: VerifyFn
  /** Override for tests; defaults to the settled boundaries. */
  boundaries?: readonly RegimeBoundary[]
}

/**
 * Compute the loop-fold block from a submitted provenance chain. Never
 * consults env; never does I/O; deterministic given (chain, opts).
 *
 * @param signedAssessments - body.provenance.signed_assessments
 *                            (unknown-shaped; treated as untrusted input).
 */
export function computeLoopFold(
  signedAssessments: unknown,
  opts: LoopFoldOptions,
): LoopFoldBlock {
  const verify: VerifyFn =
    opts.verify ?? (verifyLayer2Signature as unknown as VerifyFn)
  const boundaries = opts.boundaries ?? SETTLED_REGIME_BOUNDARIES

  const raw: unknown[] = Array.isArray(signedAssessments) ? signedAssessments : []
  // Cap-before-verify bounds the per-element Ed25519 CPU cost (verify-then-cap
  // would let an unbounded submission force unbounded verification work).
  // Independent-review fold: this class is now named distinctly from
  // n_unverified_excluded (which WAS inspected and failed) — see
  // n_truncated_uninspected.
  const nTruncatedUninspected = Math.max(0, raw.length - MAX_FOLD_ELEMENTS)
  const capped = raw.slice(0, MAX_FOLD_ELEMENTS)

  // --- 1. Per-element re-verification (envelope scope, structural). ---
  let nUnverified = 0
  let nVerifierUnavailable = 0
  let nMalformed = 0
  let nDuplicate = 0
  // Independent-review fold: exact-duplicate signed envelopes (identical
  // signature) are excluded so a replayed envelope cannot inflate a domain's
  // evidence count past EVIDENCE_FLOOR with non-independent evidence.
  const seenSignatures = new Set<string>()
  const elements: FoldElement[] = []
  for (let i = 0; i < capped.length; i++) {
    const el = capped[i]
    const res = verify(el, opts.now)
    if (!res.valid) {
      nUnverified++
      // Independent-review fold: an operational verifier misconfiguration
      // (the key is unavailable/malformed) is distinguished from a
      // genuinely fake/absent/expired signature — the two are not the same
      // finding for an operator watching this surface.
      if (res.reason === 'verifier_key_unavailable' || res.reason === 'verifier_key_malformed') {
        nVerifierUnavailable++
      }
      continue
    }
    const signature = (el as SignedLayer2Assessment).signature
    if (typeof signature === 'string') {
      if (seenSignatures.has(signature)) {
        nDuplicate++
        continue
      }
      seenSignatures.add(signature)
    }
    const assessment = (el as SignedLayer2Assessment).assessment
    const proximity = assessment?.katorthoma_proximity
    if (proximity === undefined || PROXIMITY_RANK[proximity] === undefined) {
      // A verified envelope whose payload lacks a readable proximity is not an
      // engine assessment this fold can read — excluded honestly, never
      // guessed.
      nMalformed++
      continue
    }
    const redirection =
      (assessment as { improvement_path_structured?: unknown })
        .improvement_path_structured !== null &&
      (assessment as { improvement_path_structured?: unknown })
        .improvement_path_structured !== undefined
    const engagement = assessKathekonEngagement(
      kathekonSignalsFromAssessment(assessment),
    )
    const domains = Array.isArray(assessment.virtue_domains_engaged)
      ? (assessment.virtue_domains_engaged as VirtueTrustDomain[])
      : []
    elements.push({
      index: i,
      assessment,
      markers: extractMarkers(assessment),
      redirection,
      engagement,
      proximity,
      domains,
    })
  }

  // --- 2. The kathekon split (ADR-014 §3.2's binding guard). A loop is
  //        ENGAGED iff its OPENING verdict engaged a kathekon factor. ---
  const isEngagedLoop = (el: FoldElement): boolean =>
    el.redirection && el.engagement.engaged
  const isCalibrationLoop = (el: FoldElement): boolean =>
    el.redirection && !el.engagement.engaged

  // --- 3. Chain-level closure counts per class, via the live rule. ---
  const characterLoops = closureCounts(
    analyseLoopClosure(closureProjection(elements, isEngagedLoop)),
  )
  const calibrationLoops = closureCounts(
    analyseLoopClosure(closureProjection(elements, isCalibrationLoop)),
  )

  // --- 4. The per-domain fold via combineVerificationResults (the dark S3
  //        lib, wired). Independent-review fold (root fix, not just
  //        disclosure): a kathekon-non-engaged redirection (the calibration
  //        class) is EXCLUDED from the verdict-building input entirely — it
  //        can set neither a domain's level NOR its closure signal, matching
  //        ADR-014 §3.2's plain-text guard ("never agent character data").
  //        An ordinary (non-redirection) verdict, or an engaged redirection,
  //        still feeds its domains. ---
  const verdicts: VerificationVerdict[] = []
  let nNoDomain = 0
  for (const el of elements) {
    if (isCalibrationLoop(el)) continue
    if (el.domains.length === 0) {
      nNoDomain++
      continue
    }
    const confidence = assessConfidence({
      depth: depthOf(el.markers),
      signature: 'signed', // only verified elements reach here
      corroboration: corroborationStateOf(el.assessment.corroboration),
      recency: 'recent', // no per-element time exists; disclosed in `ordering`
    })
    for (const domain of el.domains) {
      verdicts.push({
        sessionId: CHAIN_SESSION_ID,
        domain,
        markers: el.markers,
        level: el.proximity,
        confidence,
        occurredAt: submissionOrderIso(el.index),
        issuedRedirection: isEngagedLoop(el),
      })
    }
  }
  const combined: CombinedDomainVerdict[] = combineVerificationResults(verdicts)

  // --- 5. Evidence-floored per-domain publication (R13). ---
  const verdictsPerDomain = new Map<string, number>()
  const engagedPerDomain = new Map<string, number>()
  for (const v of verdicts) {
    verdictsPerDomain.set(v.domain, (verdictsPerDomain.get(v.domain) ?? 0) + 1)
    if (v.issuedRedirection === true) {
      engagedPerDomain.set(v.domain, (engagedPerDomain.get(v.domain) ?? 0) + 1)
    }
  }
  const domains: Record<string, LoopDomainFold | 'insufficient_extraction'> = {}
  const domainsBasis: Record<string, LoopDomainBasis> = {}
  for (const c of combined) {
    const fed = verdictsPerDomain.get(c.domain) ?? 0
    domainsBasis[c.domain] = {
      verdicts_in: fed,
      engaged_redirections: engagedPerDomain.get(c.domain) ?? 0,
      floor: EVIDENCE_FLOOR,
    }
    domains[c.domain] =
      fed >= EVIDENCE_FLOOR
        ? {
            level: c.level,
            resolution: c.resolution,
            conflict: c.conflict,
            open_loop: c.openLoop,
            terminals: c.terminals.length,
            basis: c.basis,
          }
        : 'insufficient_extraction'
  }

  // --- 6. Assemble. ---
  return {
    schema: 'agent-loop-fold-v1',
    vocabulary_note: LOOP_FOLD_VOCABULARY_NOTE,
    identity: opts.identity,
    identity_context: LOOP_FOLD_IDENTITY_CONTEXT_NOTE,
    chain_scope: LOOP_FOLD_CHAIN_SCOPE_NOTE,
    envelope: {
      scope: 'signed_ci4_loops_only',
      n_elements: raw.length,
      n_verified: elements.length,
      n_unverified_excluded: nUnverified,
      n_verifier_unavailable: nVerifierUnavailable,
      n_malformed_excluded: nMalformed,
      n_duplicate_excluded: nDuplicate,
      n_truncated_uninspected: nTruncatedUninspected,
      note: LOOP_FOLD_ENVELOPE_NOTE,
    },
    ordering: {
      occurred_at_basis: 'submission_order',
      note: LOOP_FOLD_ORDERING_NOTE,
    },
    regime: {
      write_era: assignRegimeEra(opts.now.toISOString(), boundaries).era,
      boundaries,
      attribution: LOOP_FOLD_ATTRIBUTION_NOTE,
    },
    replay_bound: LOOP_FOLD_REPLAY_BOUND,
    character: {
      loops: characterLoops,
      domains,
      domains_basis: domainsBasis,
      note: LOOP_FOLD_CHARACTER_NOTE,
    },
    instrument_calibration: {
      loops: calibrationLoops,
      note: LOOP_FOLD_CALIBRATION_NOTE,
    },
    n_no_domain: nNoDomain,
    measure_note: LOOP_FOLD_MEASURE_NOTE,
    bounds: NARROWED_ARM_BOUNDS,
  }
}

/**
 * The never-throws route seam (the emission-hooks posture): any internal error
 * yields `undefined` (the block is simply absent — the write outcome is never
 * affected) with a fail-honest log line. MEASURE mode: a fold failure must not
 * fail a live write.
 */
export function computeLoopFoldAnnotation(
  signedAssessments: unknown,
  opts: LoopFoldOptions,
): LoopFoldBlock | undefined {
  try {
    return computeLoopFold(signedAssessments, opts)
  } catch (e) {
    console.error('[loop-fold] computeLoopFold error:', (e as Error).message)
    return undefined
  }
}

// ============================================================================
// ROUTE IDENTITY SEAM (independent-review fold — F2/test-coverage)
// ============================================================================

export interface LoopFoldIdentityInput {
  credentialId: string
  /** resolveCredentialContext's result — nullable on any resolver error. */
  ownerUserId: string | null
  agentId: string | null
  /** The auth-verified path agent_id this credential is scoped to. */
  pathAgentId: string
}

/**
 * Build the LongitudinalIdentity for the loop-fold's ONE call site (the
 * accreditation write boundary). PURE — extracted from route.ts so the exact
 * expression the route uses is directly unit-testable (not merely
 * source-grep-pinned; independent-review finding). Applies the F1 fallback:
 * agentId falls back to the auth-verified path agent_id (owner has no such
 * fallback — an unresolved owner honestly refuses the pair join; see
 * identity_context on the block for why the two cases cannot be told apart
 * here).
 */
export function buildLoopFoldIdentity(
  input: LoopFoldIdentityInput,
): LongitudinalIdentity {
  return resolveLongitudinalIdentity({
    credentialRef: `api_key:${input.credentialId}`,
    ownerUserId: input.ownerUserId,
    agentId: input.agentId ?? input.pathAgentId,
  })
}
