/**
 * loop-fold.test.ts — AE-2: the CI-4 signed-loop fold battery (ADR-014 §3.2).
 *
 * Plain-assertion script: npx tsx <this file>   (bare — the fold is
 * pure-with-injected-clock; the verifier is injected everywhere except the
 * fail-closed default-path pin, which needs no key material).
 *
 * The load-bearing pins, in order of what they protect:
 *   §1  Flag discipline (exact-string 'true'; the sibling-flag convention).
 *   §2  Envelope scope is STRUCTURAL (ADR-013 §8): unverified / malformed
 *       elements are excluded + counted and contribute NOTHING — an unsigned
 *       V3 chain element can never enter the fold. Default verifier path is
 *       fail-closed bare (no key ⇒ everything excluded, never a throw).
 *   §3  The kathekon split (the ADR-014 §3.2 binding guard): only loops whose
 *       OPENING verdict engaged a kathekon factor feed a character closure
 *       signal; the false-positive hold class ("contrary; no kathekon factors
 *       detected") surfaces ONLY as instrument_calibration — it can never set
 *       a character open_loop. The classifier is the canonical shared
 *       predicate (source-pinned import, never a re-implementation).
 *   §4  The per-domain fold inherits the combiner's semantics end-to-end:
 *       multi-domain fanout; supersession by explicit ref links; conflict ⇒
 *       pause-escalate with the conservative MIN ∈ inputs (never an average);
 *       per-domain isolation (a domain-less closer closes nothing in-cell —
 *       conservative divergence from the chain-level count, asserted).
 *   §5  Evidence floors (R13): a domain fed by < EVIDENCE_FLOOR verdicts
 *       emits the DISTINCT 'insufficient_extraction' + a basis — never a
 *       defaulted level.
 *   §6  Per-element derivations: depth from the SIGNED marker with the
 *       conservative 'quick' floor on absence; corroboration state maps
 *       contradiction/corroboration/absence conservatively.
 *   §7  Determinism + submission-order basis (no wall-clock claims; byte-
 *       stable given fixed inputs; order is authoritative for most-recent).
 *   §8  Regime discipline: write_era via the SHARED assignRegimeEra (AE-1's
 *       settled boundaries — never duplicated); temporal attribution REFUSED
 *       on-block; the PA-10 replay bound disclosed.
 *   §9  Locked wording + bounds (NARROWED_ARM_BOUNDS carried verbatim;
 *       record-descriptive vocabulary note; MEASURE note).
 *   §10 MEASURE purity: no recommendation key anywhere in the block; the
 *       module imports neither the intervention engine nor the trust-event
 *       store (source-grep).
 *   §11 Route wiring INV pins (source-grep — the established pattern): the
 *       fold is flag-gated, computed AFTER the writer, attached ONLY on the
 *       success response, fail-soft, and the identity PK read is deduped into
 *       the trust-event emission (resolvedOwnerUserId).
 *   §12 Truncation cap is DISCLOSED (no silent caps) + the no-domain count.
 *   §13 Consistency lock: the fold's chain-level character counts equal
 *       analyseLoopClosure run directly on the same engaged-only projection
 *       (guards drift between the fold and the live CI-4 rule).
 *   §14 The never-throws route seam (a throwing verifier ⇒ undefined + log,
 *       never a propagated error into the write path).
 *
 * Independent-review fold (2026-07-19 — a second adversarial Workflow run
 * against the committed build found 7 confirmed defects a first-hand review
 * missed; all folded at the root, not merely disclosed):
 *   §15 Verifier-reason distinction: an operational misconfiguration
 *       (verifier_key_unavailable/_malformed) is counted distinctly from a
 *       genuinely fake/absent signature.
 *   §16 Truncation is UNINSPECTED (never presented to the verifier), named
 *       and counted distinctly from unverified (which WAS inspected).
 *   §17 Exact-duplicate signed envelopes (identical signature) are deduped
 *       before evidence-floor counting — a replayed envelope cannot inflate
 *       a domain past EVIDENCE_FLOOR with non-independent evidence.
 *   §18 buildLoopFoldIdentity — the route's exact identity-construction
 *       expression, extracted to a pure, directly-unit-tested function (was
 *       only source-grep-pinned before).
 * §3/§9/§11/§12 amended in place: §3 gained the level-laundering root fix +
 * a non-vacuous differing-proximity control; §9/§11 gained the corrected
 * note pins + the strengthened, live-mutation-resistant F3 pin; §12 renamed
 * n_truncated → n_truncated_uninspected.
 */

import { readFileSync } from 'fs'
import { join } from 'path'

import { analyseLoopClosure } from '@/app/api/accreditation/[agent_id]/loop-closure-gate'
import {
  buildLoopFoldIdentity,
  computeLoopFold,
  computeLoopFoldAnnotation,
  corroborationStateOf,
  depthOf,
  isLoopFoldEnabled,
  LOOP_FOLD_ENV_VAR,
  LOOP_FOLD_VOCABULARY_NOTE,
  MAX_FOLD_ELEMENTS,
  type LoopFoldBlock,
  type LoopFoldOptions,
} from '../loop-fold'
import { NARROWED_ARM_BOUNDS } from '../kathekon-engagement'
import { EVIDENCE_FLOOR, SETTLED_REGIME_BOUNDARIES, assignRegimeEra } from '../../trajectory-delta'
import type { LongitudinalIdentity } from '../../longitudinal-identity'
import type { CorroborationReport } from '@/lib/translation-sandwich/corroboration-check'

let passed = 0
let failed = 0
const failures: string[] = []
function assert(condition: boolean, label: string): void {
  if (condition) passed++
  else {
    failed++
    failures.push(label)
    console.error(`FAIL: ${label}`)
  }
}
function eq<T>(a: T, b: T, label: string): void {
  assert(a === b, `${label} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`)
}

// ============================================================================
// Fixtures
// ============================================================================

const PAIR_IDENTITY: LongitudinalIdentity = {
  kind: 'owner_agent_pair',
  owner_user_id: 'owner-1',
  agent_id: 'sagereasoning:test-agent@v1',
  credential_ref: 'api_key:cred-1',
}

const NOW = new Date('2026-07-20T12:00:00.000Z') // post-S11b era

/** Injected verifier: valid unless the element's signature says 'bad', throws
 *  when it says 'throw'; 'unavailable'/'malformed' simulate the operational-
 *  misconfiguration reasons the real verifier returns (layer2-verifier.ts's
 *  own vocabulary — §16). */
const testVerify = (signed: unknown, _now: Date) => {
  const sig = (signed as { signature?: string })?.signature
  if (sig === 'throw') throw new Error('verifier exploded')
  if (sig === 'unavailable') {
    return { valid: false as const, reason: 'verifier_key_unavailable' }
  }
  if (sig === 'malformed-key') {
    return { valid: false as const, reason: 'verifier_key_malformed' }
  }
  if (sig === 'bad' || typeof sig !== 'string') {
    return { valid: false as const, reason: 'invalid_signature' }
  }
  return { valid: true as const, key_id: 'test-key' }
}

interface ElementSpec {
  proximity?: string
  domains?: string[]
  ref?: string
  depth?: string
  prior?: string
  redirection?: boolean
  circles?: (string | null)[]
  passions?: string[]
  corroboration?: CorroborationReport
  signature?: string
}

// Deterministic unique-signature counter for el()'s default. Real signed
// envelopes always carry a cryptographically unique signature per distinct
// assessment (Ed25519); the fixture builder must mirror that — a shared
// literal default ('ok') would make every un-overridden element in a
// multi-element fixture collide under §17's dedup logic, which is correct
// production behavior but wrong test behavior. Deterministic (not
// Math.random()) so re-running the file twice produces identical output.
let autoSigCounter = 0

/** Build one signed-assessment element. Defaults: a benign non-redirection
 *  deliberate verdict engaging phronesis with no circles/passions — the
 *  false-positive-class SHAPE (no kathekon factor). Signature defaults to a
 *  fresh unique value per call (see autoSigCounter); pass `signature`
 *  explicitly to test dedup (§17) or verifier-failure paths (§2, §15). */
function el(spec: ElementSpec = {}): unknown {
  return {
    key_id: 'test-key',
    signature: spec.signature ?? `auto-sig-${autoSigCounter++}`,
    assessment: {
      katorthoma_proximity: spec.proximity ?? 'deliberate',
      virtue_domains_engaged: spec.domains ?? ['phronesis'],
      improvement_path_structured: spec.redirection ? { redirection: true } : null,
      ...(spec.ref !== undefined || spec.depth !== undefined || spec.prior !== undefined
        ? {
            examination: {
              ...(spec.ref !== undefined ? { ref: spec.ref } : {}),
              ...(spec.depth !== undefined ? { depth_tier: spec.depth } : {}),
              ...(spec.prior !== undefined ? { prior_feedback_ref: spec.prior } : {}),
            },
          }
        : {}),
      oikeiosis: {
        relevant_circles: (spec.circles ?? []).map((status) =>
          status === null ? {} : { obligation_assessment: { status } },
        ),
      },
      passion_diagnosis: {
        passions_detected: (spec.passions ?? []).map((sub) => ({
          root_passion: 'epithumia',
          sub_species: sub,
        })),
      },
      ...(spec.corroboration !== undefined ? { corroboration: spec.corroboration } : {}),
    },
  }
}

function fold(chain: unknown, opts: Partial<LoopFoldOptions> = {}): LoopFoldBlock {
  return computeLoopFold(chain, {
    identity: PAIR_IDENTITY,
    now: NOW,
    verify: testVerify,
    ...opts,
  })
}

/** Deep key scan (for §10's no-recommendation pin). */
function collectKeys(x: unknown, out: Set<string>): Set<string> {
  if (Array.isArray(x)) {
    for (const v of x) collectKeys(v, out)
  } else if (typeof x === 'object' && x !== null) {
    for (const [k, v] of Object.entries(x)) {
      out.add(k)
      collectKeys(v, out)
    }
  }
  return out
}

// ============================================================================
// §1 — Flag discipline
// ============================================================================
{
  eq(LOOP_FOLD_ENV_VAR, 'SUBSTRATE_LOOP_FOLD_ENABLED', '§1 env var name')
  const saved = process.env[LOOP_FOLD_ENV_VAR]
  delete process.env[LOOP_FOLD_ENV_VAR]
  eq(isLoopFoldEnabled(), false, '§1 unset ⇒ off')
  process.env[LOOP_FOLD_ENV_VAR] = 'TRUE'
  eq(isLoopFoldEnabled(), false, '§1 non-exact string ⇒ off')
  process.env[LOOP_FOLD_ENV_VAR] = '1'
  eq(isLoopFoldEnabled(), false, "§1 '1' ⇒ off")
  process.env[LOOP_FOLD_ENV_VAR] = 'true'
  eq(isLoopFoldEnabled(), true, "§1 exact 'true' ⇒ on")
  if (saved === undefined) delete process.env[LOOP_FOLD_ENV_VAR]
  else process.env[LOOP_FOLD_ENV_VAR] = saved
}

// ============================================================================
// §2 — Envelope scope is structural
// ============================================================================
{
  // A verified engaged loop + an UNVERIFIED engaged loop: only the verified one
  // exists anywhere in the block.
  const b = fold([
    el({ redirection: true, circles: ['violated'], domains: ['dikaiosyne'], ref: 'A', depth: 'standard' }),
    el({ redirection: true, circles: ['violated'], domains: ['dikaiosyne'], ref: 'B', depth: 'standard', signature: 'bad' }),
  ])
  eq(b.envelope.n_elements, 2, '§2 n_elements counts the raw chain')
  eq(b.envelope.n_verified, 1, '§2 n_verified counts only verified')
  eq(b.envelope.n_unverified_excluded, 1, '§2 unverified counted')
  eq(b.character.loops.redirections, 1, '§2 the unverified loop never enters character')
  eq(b.envelope.scope, 'signed_ci4_loops_only', '§2 scope named')

  // Verified envelope, unreadable payload ⇒ malformed-excluded, not guessed.
  const m = fold([el({ proximity: 'not-a-proximity' })])
  eq(m.envelope.n_malformed_excluded, 1, '§2 malformed payload excluded + counted')
  eq(m.envelope.n_verified, 0, '§2 malformed does not count verified')

  // Non-array input: zeros, no throw.
  const z = fold(undefined)
  eq(z.envelope.n_elements, 0, '§2 non-array ⇒ zero elements')
  eq(z.character.loops.verdict, 'no_chain', '§2 empty character analysis')

  // Default verifier path, bare env (no key material): everything excluded,
  // never a throw — fail-closed.
  const d = computeLoopFold([el()], { identity: PAIR_IDENTITY, now: NOW })
  eq(d.envelope.n_unverified_excluded, 1, '§2 default verifier bare ⇒ fail-closed exclusion')
}

// ============================================================================
// §3 — The kathekon split
// ============================================================================
{
  // ENGAGED loop (violated obligation w/ circle): character side.
  const engaged = fold([
    el({ redirection: true, circles: ['violated'], domains: ['dikaiosyne'], ref: 'A', depth: 'standard' }),
  ])
  eq(engaged.character.loops.redirections, 1, '§3 engaged loop feeds character')
  eq(engaged.character.loops.open, 1, '§3 engaged unclosed loop reads open (character)')
  eq(engaged.instrument_calibration.loops.redirections, 0, '§3 engaged loop absent from calibration')

  // NON-engaged loop (the false-positive class: deliberate, no circles, no
  // passions): calibration side ONLY.
  const fp = fold([el({ redirection: true, ref: 'F', depth: 'standard' })])
  eq(fp.character.loops.redirections, 0, '§3 false-positive loop feeds NO character signal')
  eq(fp.character.loops.verdict, 'no_redirections', '§3 character verdict clean of the fp class')
  eq(fp.instrument_calibration.loops.redirections, 1, '§3 false-positive loop surfaces as calibration')
  eq(fp.instrument_calibration.loops.open, 1, '§3 calibration closure computed by the same live rule')

  // Engagement via the proximity arm (habitual) also counts as character.
  const hab = fold([el({ redirection: true, proximity: 'habitual', ref: 'H', depth: 'quick' })])
  eq(hab.character.loops.redirections, 1, '§3 proximity≤habitual arm engages')

  // Engagement via the sub-species passion arm.
  const pas = fold([el({ redirection: true, passions: ['epithumia/philarguria'], ref: 'P', depth: 'quick' })])
  eq(pas.character.loops.redirections, 1, '§3 sub-species passion arm engages')

  // Same-depth closure on the engaged side.
  const closed = fold([
    el({ redirection: true, circles: ['violated'], domains: ['dikaiosyne'], ref: 'A', depth: 'standard' }),
    el({ circles: ['met'], domains: ['dikaiosyne'], ref: 'A2', depth: 'standard', prior: 'A' }),
  ])
  eq(closed.character.loops.closed, 1, '§3 same-depth closer closes the engaged loop')
  eq(closed.character.loops.verdict, 'closed', '§3 character verdict closed')

  // The false-positive class can never set a character per-domain open_loop.
  // Three genuine phronesis verdicts (floor met) plus a fp-class redirection,
  // which is now EXCLUDED from the fold entirely (independent-review root
  // fix) — so the floor is met by X1/X2/X3, not by counting the fp-class
  // element.
  const noBleed = fold([
    el({ redirection: true, ref: 'F', depth: 'standard' }), // fp-class, excluded
    el({ ref: 'X1', depth: 'standard' }),
    el({ ref: 'X2', depth: 'standard' }),
    el({ ref: 'X3', depth: 'standard' }),
  ])
  const ph = noBleed.character.domains['phronesis']
  assert(typeof ph === 'object', '§3 phronesis fold published at floor (fp-class excluded from the count)')
  if (typeof ph === 'object') {
    eq(ph.open_loop, false, '§3 fp-class open loop NEVER sets character open_loop')
    eq(ph.terminals, 3, '§3 fp-class element excluded from terminals entirely (not just open_loop)')
  }
  eq(
    noBleed.character.domains_basis['phronesis'].verdicts_in,
    3,
    '§3 verdicts_in excludes the fp-class element (root fix, not just a masked count)',
  )
  // Contrast: the same shape with an ENGAGED opener (habitual) ⇒ open_loop true.
  const bleedCtl = fold([
    el({ redirection: true, proximity: 'habitual', ref: 'E', depth: 'standard' }),
    el({ ref: 'X1', depth: 'standard' }),
    el({ ref: 'X2', depth: 'standard' }),
  ])
  const ph2 = bleedCtl.character.domains['phronesis']
  assert(typeof ph2 === 'object', '§3 control fold published')
  if (typeof ph2 === 'object') {
    eq(ph2.open_loop, true, '§3 engaged open loop DOES set character open_loop (control — non-vacuous)')
  }

  // Independent-review fold (kathekon-split-level-laundering, MEDIUM): a
  // fp-class redirection with a DIFFERING (and later-submitted, so
  // "most-recent") proximity from genuine same-domain evidence must NOT
  // determine the domain's level. Non-vacuous: proximity differs so a
  // same-proximity mask (the original noBleed shape) cannot hide the defect.
  const noLaunder = fold([
    el({ proximity: 'reflexive', ref: 'G1', depth: 'standard' }),
    el({ proximity: 'reflexive', ref: 'G2', depth: 'standard' }),
    el({ proximity: 'reflexive', ref: 'G3', depth: 'standard' }),
    // fp-class, submitted LAST (would be "most recent" if it fed the fold):
    // a flattering high proximity that must never surface as the level.
    el({ redirection: true, proximity: 'sage_like', ref: 'FL', depth: 'standard' }),
  ])
  const phL = noLaunder.character.domains['phronesis']
  assert(typeof phL === 'object', '§3 level-laundering control fold published')
  if (typeof phL === 'object') {
    eq(phL.level, 'reflexive', '§3 the fp-class flattering proximity NEVER launders into the domain level')
    eq(phL.terminals, 3, '§3 the fp-class element is excluded from terminals in the level-laundering case too')
  }
  eq(
    noLaunder.character.domains_basis['phronesis'].verdicts_in,
    3,
    '§3 level-laundering: verdicts_in excludes the fp-class element',
  )
}

// ============================================================================
// §4 — Per-domain fold inherits the combiner end-to-end
// ============================================================================
{
  // Multi-domain fanout: one element in two domains feeds both.
  const fan = fold([
    el({ domains: ['phronesis', 'sophrosyne'], ref: 'M1', depth: 'standard' }),
    el({ domains: ['phronesis', 'sophrosyne'], ref: 'M2', depth: 'standard' }),
    el({ domains: ['phronesis', 'sophrosyne'], ref: 'M3', depth: 'standard' }),
  ])
  assert(typeof fan.character.domains['phronesis'] === 'object', '§4 fanout feeds phronesis')
  assert(typeof fan.character.domains['sophrosyne'] === 'object', '§4 fanout feeds sophrosyne')
  eq(fan.character.domains_basis['phronesis'].verdicts_in, 3, '§4 per-domain verdict count')

  // Supersession: a superseded opener drops from the terminals.
  const sup = fold([
    el({ redirection: true, proximity: 'habitual', ref: 'A', depth: 'standard' }),
    el({ proximity: 'principled', ref: 'B', depth: 'standard', prior: 'A' }),
    el({ proximity: 'principled', ref: 'C', depth: 'standard' }),
  ])
  const supPh = sup.character.domains['phronesis']
  assert(typeof supPh === 'object', '§4 supersession fold published')
  if (typeof supPh === 'object') {
    eq(supPh.terminals, 2, '§4 superseded opener excluded from terminals')
    eq(supPh.open_loop, false, '§4 closed loop not open')
  }

  // Conflict ⇒ pause-escalate + conservative MIN ∈ inputs (never an average).
  // reflexive (rank 0) vs principled (rank 3): gap 3 ≥ 2, both material
  // (recency degenerate ⇒ weight = confidence ≥ 0.4).
  const conf = fold([
    el({ proximity: 'reflexive', ref: 'R1', depth: 'standard' }),
    el({ proximity: 'reflexive', ref: 'R2', depth: 'standard' }),
    el({ proximity: 'principled', ref: 'R3', depth: 'standard' }),
  ])
  const confPh = conf.character.domains['phronesis']
  assert(typeof confPh === 'object', '§4 conflict fold published')
  if (typeof confPh === 'object') {
    eq(confPh.conflict, true, '§4 rank-gap conflict detected')
    eq(confPh.resolution, 'pause-escalate', '§4 conflict ⇒ pause-escalate')
    eq(confPh.level, 'reflexive', '§4 conflict level = conservative MIN ∈ inputs, never an average')
  }

  // Per-domain isolation: a domain-less closer closes the CHAIN-level loop but
  // NOT the cell — the conservative divergence, asserted.
  const iso = fold([
    el({ redirection: true, proximity: 'habitual', domains: ['phronesis'], ref: 'A', depth: 'standard' }),
    el({ domains: [], ref: 'B', depth: 'standard', prior: 'A' }), // domain-less closer
    el({ domains: ['phronesis'], ref: 'C', depth: 'standard' }),
    el({ domains: ['phronesis'], ref: 'D', depth: 'standard' }),
  ])
  eq(iso.character.loops.closed, 1, '§4 chain-level: the domain-less closer closes')
  eq(iso.n_no_domain, 1, '§4 domain-less element counted')
  const isoPh = iso.character.domains['phronesis']
  assert(typeof isoPh === 'object', '§4 isolation fold published')
  if (typeof isoPh === 'object') {
    eq(isoPh.open_loop, true, '§4 cell-level: per-domain isolation keeps the cell open (conservative)')
  }
}

// ============================================================================
// §5 — Evidence floors (R13)
// ============================================================================
{
  const thin = fold([
    el({ ref: 'T1', depth: 'standard' }),
    el({ ref: 'T2', depth: 'standard' }),
  ])
  eq(
    thin.character.domains['phronesis'] as string,
    'insufficient_extraction',
    '§5 under-floor domain emits the DISTINCT insufficient_extraction',
  )
  eq(thin.character.domains_basis['phronesis'].verdicts_in, 2, '§5 basis names the input count')
  eq(thin.character.domains_basis['phronesis'].floor, EVIDENCE_FLOOR, '§5 floor = the shared EVIDENCE_FLOOR')

  const atFloor = fold([
    el({ ref: 'T1', depth: 'standard' }),
    el({ ref: 'T2', depth: 'standard' }),
    el({ ref: 'T3', depth: 'standard' }),
  ])
  assert(
    typeof atFloor.character.domains['phronesis'] === 'object',
    '§5 at-floor domain publishes',
  )
}

// ============================================================================
// §6 — Per-element derivations (conservative floors)
// ============================================================================
{
  eq(depthOf({}), 'quick', '§6 missing depth marker ⇒ conservative quick')
  eq(depthOf({ depth_tier: 'nonsense' }), 'quick', '§6 invalid depth ⇒ quick')
  eq(depthOf({ depth_tier: 'deep' }), 'deep', '§6 valid deep read')
  eq(depthOf({ depth_tier: 'standard' }), 'standard', '§6 valid standard read')

  eq(corroborationStateOf(undefined), 'uncorroborated', '§6 absent report ⇒ uncorroborated')
  const rep = (over: Partial<CorroborationReport>): CorroborationReport =>
    ({
      version: 'corroboration-check-v1',
      findings: [],
      text_harm_markers: [],
      counter_evidence: [],
      dikaiosyne_override: 'none',
      andreia_override: 'none',
      any_contradiction: false,
      ...over,
    }) as CorroborationReport
  eq(
    corroborationStateOf(rep({ any_contradiction: true })),
    'contradicted',
    '§6 any_contradiction ⇒ contradicted',
  )
  eq(
    corroborationStateOf(rep({})),
    'uncorroborated',
    '§6 empty findings ⇒ uncorroborated (never a vacuous corroborated)',
  )
  const finding = (
    f: 'corroborated' | 'uncorroborated',
    index: number,
  ): CorroborationReport['findings'][number] => ({
    claim: 'obligation_met',
    subject: 'local_community',
    index,
    finding: f,
    markers: [],
    rationale: '',
  })
  eq(
    corroborationStateOf(rep({ findings: [finding('corroborated', 0)] })),
    'corroborated',
    '§6 all-corroborated non-empty ⇒ corroborated',
  )
  eq(
    corroborationStateOf(
      rep({ findings: [finding('corroborated', 0), finding('uncorroborated', 1)] }),
    ),
    'uncorroborated',
    '§6 mixed findings ⇒ uncorroborated',
  )
}

// ============================================================================
// §7 — Determinism + submission order
// ============================================================================
{
  const chain = [
    el({ redirection: true, circles: ['violated'], domains: ['dikaiosyne'], ref: 'A', depth: 'standard' }),
    el({ circles: ['met'], domains: ['dikaiosyne'], ref: 'B', depth: 'standard', prior: 'A' }),
    el({ ref: 'C', depth: 'deep' }),
  ]
  const a = fold(chain)
  const b = fold(chain)
  eq(JSON.stringify(a), JSON.stringify(b), '§7 byte-stable given fixed inputs (deterministic)')
  eq(a.ordering.occurred_at_basis, 'submission_order', '§7 ordering basis disclosed')

  // Submission order is authoritative for most-recent: the LATER of two
  // non-conflicting same-domain verdicts wins the fold level.
  const order = fold([
    el({ proximity: 'deliberate', ref: 'O1', depth: 'standard' }),
    el({ proximity: 'deliberate', ref: 'O2', depth: 'standard' }),
    el({ proximity: 'principled', ref: 'O3', depth: 'standard' }),
  ])
  const oPh = order.character.domains['phronesis']
  assert(typeof oPh === 'object', '§7 order fold published')
  if (typeof oPh === 'object') {
    // deliberate vs principled gap = 1 < CONFLICT_RANK_GAP ⇒ no conflict; the
    // most-recent (last-submitted) terminal is authoritative.
    eq(oPh.conflict, false, '§7 ±1 drift is not a conflict')
    eq(oPh.level, 'principled', '§7 most-recent-by-submission-order is authoritative')
  }
}

// ============================================================================
// §8 — Regime discipline (shared machinery; attribution refused)
// ============================================================================
{
  const pre = fold([], { now: new Date('2026-07-10T00:00:00.000Z') })
  eq(pre.regime.write_era, 'pre-s11b-recomposition', '§8 pre-boundary write era')
  const band = fold([], { now: new Date('2026-07-18T12:00:00.000Z') })
  eq(band.regime.write_era, 'boundary_band', '§8 boundary-day write era')
  const post = fold([], { now: new Date('2026-07-20T00:00:00.000Z') })
  eq(post.regime.write_era, 'post-s11b-recomposition', '§8 post-boundary write era')
  eq(
    post.regime.boundaries.length,
    SETTLED_REGIME_BOUNDARIES.length,
    '§8 the SETTLED boundaries surface (shared, not duplicated)',
  )
  // The shared helper itself (exported from trajectory-delta — one machinery).
  eq(
    assignRegimeEra('2026-07-20T00:00:00.000Z').era,
    'post-s11b-recomposition',
    '§8 assignRegimeEra shared export works',
  )
  assert(
    post.regime.attribution.includes('REFUSED'),
    '§8 temporal attribution refused ON the block',
  )
  assert(
    post.regime.attribution.includes('instrument calibration'),
    '§8 attribution note names the instrument-vs-disposition split',
  )
  assert(post.replay_bound.includes('PA-10'), '§8 the PA-10 replay bound disclosed')
}

// ============================================================================
// §9 — Locked wording + bounds
// ============================================================================
{
  const b = fold([])
  eq(b.schema, 'agent-loop-fold-v1', '§9 schema tag')
  eq(b.vocabulary_note, LOOP_FOLD_VOCABULARY_NOTE, '§9 vocabulary note locked')
  assert(
    b.vocabulary_note.includes('past tense') && b.vocabulary_note.includes('predicts nothing'),
    '§9 record-descriptive wording present',
  )
  eq(b.bounds.a2Omission, NARROWED_ARM_BOUNDS.a2Omission, '§9 A2 omission bound carried verbatim')
  eq(
    b.bounds.mentionConversion,
    NARROWED_ARM_BOUNDS.mentionConversion,
    '§9 mention-conversion bound carried verbatim',
  )
  assert(
    b.measure_note.includes('binds nothing') && b.measure_note.includes('weights-tier'),
    '§9 MEASURE note pins the binds-nothing + weights-blocked wording',
  )
  // Independent-review fold: the calibration note's "feed no character
  // signal" claim must be TRUE (the root fix excludes calibration-class
  // elements from character entirely — this is no longer merely disclosed).
  assert(
    b.instrument_calibration.note.includes('EXCLUDED') &&
      b.instrument_calibration.note.includes('feed no character'),
    '§9 calibration note states exclusion, matching the actual (fixed) behavior',
  )
  assert(
    b.chain_scope.includes('not') && b.chain_scope.includes('persisted'),
    '§9 chain scope discloses no stored-history fold exists',
  )
  assert(b.identity.kind === 'owner_agent_pair', '§9 identity carried on the block')
  // Independent-review fold: the write-boundary identity_context note is
  // UNCONDITIONAL (always present, distinguishing owner-lookup-failure from
  // genuinely owner-less at the ONE call site where the latter cannot occur).
  assert(
    b.identity_context.includes('6e §A') && b.identity_context.includes('operational anomaly'),
    '§9 identity_context discloses the write-boundary structural invariant',
  )
  // Independent-review fold: the envelope note no longer unconditionally
  // claims every element was verified (false on truncation).
  assert(
    b.envelope.note.includes('WITHIN THE CAP') && b.envelope.note.includes('NEVER presented'),
    '§9 envelope note is honest about the truncated-uninspected class',
  )
}

// ============================================================================
// §10 — MEASURE purity
// ============================================================================
{
  const b = fold([
    el({ redirection: true, circles: ['violated'], domains: ['dikaiosyne'], ref: 'A', depth: 'standard' }),
  ])
  const keys = collectKeys(b, new Set<string>())
  assert(!keys.has('recommendation'), '§10 no recommendation key anywhere in the block')
  assert(!keys.has('recommendedIntervention'), '§10 no intervention key')
  assert(!keys.has('action'), '§10 no action key')

  const src = readFileSync(join(__dirname, '../loop-fold.ts'), 'utf8')
  assert(!src.includes("from './intervention-engine'"), '§10 module never imports the intervention engine')
  assert(!src.includes('emitTrustEvents'), '§10 module never emits trust events')
  assert(
    src.includes('assessKathekonEngagement') && src.includes('kathekonSignalsFromAssessment'),
    '§10 the classifier is the canonical shared predicate (imported, not re-implemented)',
  )
  assert(
    src.includes('combineVerificationResults'),
    '§10 the fold routes through the S3 combiner (wired, not re-implemented)',
  )
}

// ============================================================================
// §11 — Route wiring INV pins (source-grep)
// ============================================================================
{
  const routeSrc = readFileSync(
    join(__dirname, '../../../../app/api/accreditation/[agent_id]/route.ts'),
    'utf8',
  )
  assert(
    routeSrc.includes('isLoopFoldEnabled()\n      ? await resolveCredentialContext') ||
      /isLoopFoldEnabled\(\)[\s\S]{0,80}resolveCredentialContext/.test(routeSrc),
    '§11 INV: the identity read is gated by the fold flag',
  )
  // The call site (with paren), not the import line at the top of the file.
  const writerIdx = routeSrc.indexOf('await seedAccreditation')
  const foldIdx = routeSrc.indexOf('computeLoopFoldAnnotation(')
  assert(
    writerIdx !== -1 && foldIdx !== -1 && foldIdx > writerIdx,
    '§11 INV: the fold is computed AFTER the writer (never affects the write outcome)',
  )
  assert(
    routeSrc.includes('buildWriteSuccessResponse(loopClosureAnnotation, loopFoldAnnotation)'),
    '§11 INV: the fold is attached ONLY via the success-response builder',
  )
  assert(
    /resolvedOwnerUserId:\s*foldCredentialContext\.owner_user_id/.test(routeSrc),
    '§11 INV: the identity PK read is deduped into the trust-event emission',
  )
  // Independent-review fold: identity construction now routes through the
  // exported, directly-unit-tested buildLoopFoldIdentity helper (§15) rather
  // than an inline object literal — the F1 fallback lives in loop-fold.ts,
  // pinned there by a real unit test, not only by a route.ts regex.
  assert(
    routeSrc.includes('buildLoopFoldIdentity({'),
    '§11 INV: the route constructs identity via the exported, unit-tested helper',
  )
  assert(
    !/resolveLongitudinalIdentity\(\{/.test(routeSrc),
    '§11 INV: the route no longer inlines resolveLongitudinalIdentity (the helper owns it)',
  )
  // Independent-review fold (F3-pin-defeatable, live-mutation-proven): a
  // literal-substring count of the identifier `loopFoldAnnotation` is
  // defeatable by a differently-named decoy call site. Count actual
  // computeLoopFoldAnnotation( CALL-SITE occurrences instead — exactly one.
  // (This is strictly the same check the review's live mutation exploited
  // and failed to detect under the old pin; verified it now WOULD detect
  // that exact mutation via a manual re-run during this fold.)
  eq(
    (routeSrc.match(/computeLoopFoldAnnotation\(/g) ?? []).length,
    1,
    '§11 INV (F3, strengthened): computeLoopFoldAnnotation( has exactly one call site',
  )
  // Independent-review fold: the identity/fold computation is defence-in-
  // depth wrapped so even a future throw in the argument expression cannot
  // reach the outer 503 catch on an already-succeeded write.
  const declIdx = routeSrc.indexOf('let loopFoldAnnotation: ReturnType<typeof computeLoopFoldAnnotation>')
  const nextTryIdx = declIdx === -1 ? -1 : routeSrc.indexOf('try {', declIdx)
  // No unrelated code between the declaration and its try block — bounded
  // gap catches an inserted statement without being brittle to comment/
  // whitespace reflow (measured gap in the shipped file: ~73 chars of
  // comments + one blank line).
  assert(
    declIdx !== -1 &&
      nextTryIdx !== -1 &&
      nextTryIdx - declIdx < 200 &&
      declIdx > writerIdx,
    '§11 INV: the fold computation has its OWN try/catch (immediately after its declaration), defence-in-depth beyond the never-throws wrapper',
  )

  const buildersSrc = readFileSync(
    join(__dirname, '../../../../app/api/accreditation/[agent_id]/response-builders.ts'),
    'utf8',
  )
  assert(
    buildersSrc.includes("...(loopFold !== undefined ? { loop_fold: loopFold } : {})"),
    '§11 INV: loop_fold is conditionally spread — absent ⇒ byte-identical body',
  )

  const emissionSrc = readFileSync(join(__dirname, '../emission-hooks.ts'), 'utf8')
  assert(
    /resolvedOwnerUserId\s*!==\s*undefined/.test(emissionSrc) &&
      emissionSrc.includes('resolveCredentialContext(input.credentialId)'),
    '§11 INV: emission uses the pre-resolved owner when provided, else resolves internally',
  )
}

// ============================================================================
// §12 — Truncation disclosure + no-domain count
// ============================================================================
{
  const big = Array.from({ length: MAX_FOLD_ELEMENTS + 6 }, (_, i) =>
    el({ ref: `R${i}`, depth: 'standard' }),
  )
  const b = fold(big)
  eq(b.envelope.n_elements, MAX_FOLD_ELEMENTS + 6, '§12 raw count reported')
  eq(b.envelope.n_truncated_uninspected, 6, '§12 truncation DISCLOSED, never silent, named distinctly from unverified')
  eq(b.envelope.n_verified, MAX_FOLD_ELEMENTS, '§12 verified capped at MAX_FOLD_ELEMENTS')

  const nd = fold([el({ domains: [] })])
  eq(nd.n_no_domain, 1, '§12 domain-less verified element counted')
}

// ============================================================================
// §13 — Consistency lock against the live CI-4 rule
// ============================================================================
{
  // The same chain, hand-projected with engaged-only redirections, fed to the
  // live analyseLoopClosure directly — the fold's character counts must match.
  const specs: ElementSpec[] = [
    { redirection: true, circles: ['violated'], domains: ['dikaiosyne'], ref: 'A', depth: 'standard' },
    { circles: ['met'], domains: ['dikaiosyne'], ref: 'B', depth: 'standard', prior: 'A' },
    { redirection: true, ref: 'F', depth: 'standard' }, // fp-class (non-engaged)
    { redirection: true, proximity: 'habitual', ref: 'G', depth: 'quick' }, // engaged, open
  ]
  const b = fold(specs.map(el))
  const handProjection = [
    // A: engaged redirection
    { assessment: { improvement_path_structured: { r: true }, examination: { ref: 'A', depth_tier: 'standard' } } },
    // B: closer
    { assessment: { improvement_path_structured: null, examination: { ref: 'B', depth_tier: 'standard', prior_feedback_ref: 'A' } } },
    // F: fp-class ⇒ NOT a redirection in the character projection
    { assessment: { improvement_path_structured: null, examination: { ref: 'F', depth_tier: 'standard' } } },
    // G: engaged redirection, open
    { assessment: { improvement_path_structured: { r: true }, examination: { ref: 'G', depth_tier: 'quick' } } },
  ]
  const direct = analyseLoopClosure(handProjection)
  eq(b.character.loops.redirections, direct.redirections, '§13 character redirections match the live rule')
  eq(b.character.loops.closed, direct.closed, '§13 closed matches')
  eq(b.character.loops.open, direct.open, '§13 open matches')
  eq(b.character.loops.verdict, direct.verdict, '§13 verdict matches')
}

// ============================================================================
// §14 — The never-throws route seam
// ============================================================================
{
  const savedError = console.error
  let logged = 0
  console.error = () => {
    logged++
  }
  const out = computeLoopFoldAnnotation([el({ signature: 'throw' })], {
    identity: PAIR_IDENTITY,
    now: NOW,
    verify: testVerify,
  })
  console.error = savedError
  eq(out, undefined, '§14 a throwing verifier yields undefined (fail-soft)')
  assert(logged >= 1, '§14 the failure is logged (fail-honest, never silent)')
}

// ============================================================================
// §15 — Independent-review fold: verifier-reason distinction (F1, MEDIUM)
// ============================================================================
{
  // An operational verifier misconfiguration (key unavailable/malformed) is
  // distinguished from a genuinely fake/absent signature — both are
  // n_unverified_excluded, but only the operational class also increments
  // n_verifier_unavailable.
  const fake = fold([el({ signature: 'bad' })])
  eq(fake.envelope.n_unverified_excluded, 1, '§15 a fake signature is unverified-excluded')
  eq(fake.envelope.n_verifier_unavailable, 0, '§15 a fake signature is NOT counted as verifier-unavailable')

  const unavailable = fold([el({ signature: 'unavailable' })])
  eq(unavailable.envelope.n_unverified_excluded, 1, '§15 verifier-unavailable is also unverified-excluded')
  eq(unavailable.envelope.n_verifier_unavailable, 1, '§15 verifier-unavailable is counted distinctly')

  const malformedKey = fold([el({ signature: 'malformed-key' })])
  eq(malformedKey.envelope.n_verifier_unavailable, 1, '§15 verifier_key_malformed also counts')

  const mixed = fold([el({ signature: 'unavailable' }), el({ signature: 'bad' })])
  eq(mixed.envelope.n_unverified_excluded, 2, '§15 mixed: both excluded')
  eq(mixed.envelope.n_verifier_unavailable, 1, '§15 mixed: only the operational one is distinguished')
}

// ============================================================================
// §16 — Independent-review fold: truncation is UNINSPECTED, not unverified
// ============================================================================
{
  const big = Array.from({ length: MAX_FOLD_ELEMENTS + 3 }, (_, i) =>
    el({ ref: `T${i}`, depth: 'standard' }),
  )
  const b = fold(big)
  eq(b.envelope.n_truncated_uninspected, 3, '§16 truncated elements counted distinctly')
  eq(b.envelope.n_unverified_excluded, 0, '§16 truncated elements are NOT counted as unverified (they were never checked)')
}

// ============================================================================
// §17 — Independent-review fold: exact-duplicate signed envelopes deduped
// ============================================================================
{
  // Three copies of the SAME signature (Ed25519 unforgeability ⇒ identical
  // signature implies identical signed content) must not inflate a domain's
  // verdicts_in past EVIDENCE_FLOOR with non-independent evidence.
  const dup = el({ signature: 'shared-sig-A', domains: ['dikaiosyne'], circles: ['met'] })
  const chain = [dup, dup, dup]
  const b = fold(chain)
  eq(b.envelope.n_verified, 1, '§17 only the FIRST copy of a duplicate signature verifies into an element')
  eq(b.envelope.n_duplicate_excluded, 2, '§17 the two replays are counted, never silent')
  eq(
    b.character.domains['dikaiosyne'],
    'insufficient_extraction',
    '§17 a single real signal (deduped) does NOT cross the evidence floor',
  )

  // Contrast: three GENUINELY distinct signatures of the same shape DO cross
  // the floor — proves §17 is testing dedup, not merely undercounting.
  const distinct = [
    el({ signature: 'sig-B1', domains: ['dikaiosyne'], circles: ['met'] }),
    el({ signature: 'sig-B2', domains: ['dikaiosyne'], circles: ['met'] }),
    el({ signature: 'sig-B3', domains: ['dikaiosyne'], circles: ['met'] }),
  ]
  const bd = fold(distinct)
  eq(bd.envelope.n_duplicate_excluded, 0, '§17 distinct signatures are never deduped')
  assert(
    typeof bd.character.domains['dikaiosyne'] === 'object',
    '§17 control: three genuinely distinct signals DO cross the floor (non-vacuous)',
  )
}

// ============================================================================
// §18 — Independent-review fold: buildLoopFoldIdentity (F2 test-coverage;
// the exact route call-site pattern, directly unit-tested)
// ============================================================================
{
  const resolved = buildLoopFoldIdentity({
    credentialId: 'cred-1',
    ownerUserId: 'owner-1',
    agentId: 'sagereasoning:agent@v1',
    pathAgentId: 'sagereasoning:agent@v1',
  })
  eq(resolved.kind, 'owner_agent_pair', '§18 resolved owner+agent ⇒ the canonical pair')

  // The F1 fallback: a null resolved agentId falls back to pathAgentId.
  const fallback = buildLoopFoldIdentity({
    credentialId: 'cred-1',
    ownerUserId: 'owner-1',
    agentId: null,
    pathAgentId: 'sagereasoning:path-agent@v1',
  })
  eq(fallback.kind, 'owner_agent_pair', '§18 (F1) a null resolved agentId falls back to pathAgentId')
  if (fallback.kind === 'owner_agent_pair') {
    eq(fallback.agent_id, 'sagereasoning:path-agent@v1', '§18 (F1) the fallback value is the path agent_id')
  }

  // Owner has NO fallback — a null owner refuses the pair join (the
  // identity_context note names this as the boundary's own honesty limit).
  const noOwner = buildLoopFoldIdentity({
    credentialId: 'cred-1',
    ownerUserId: null,
    agentId: 'sagereasoning:agent@v1',
    pathAgentId: 'sagereasoning:agent@v1',
  })
  eq(noOwner.kind, 'credential', '§18 a null owner refuses the pair join (no fallback exists)')
}

// ============================================================================
console.log(`\nloop-fold battery: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error('FAILURES:\n  ' + failures.join('\n  '))
  process.exit(1)
}
