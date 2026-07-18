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
 */

import { readFileSync } from 'fs'
import { join } from 'path'

import { analyseLoopClosure } from '@/app/api/accreditation/[agent_id]/loop-closure-gate'
import {
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
 *  when it says 'throw'. */
const testVerify = (signed: unknown, _now: Date) => {
  const sig = (signed as { signature?: string })?.signature
  if (sig === 'throw') throw new Error('verifier exploded')
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

/** Build one signed-assessment element. Defaults: a benign non-redirection
 *  deliberate verdict engaging phronesis with no circles/passions — the
 *  false-positive-class SHAPE (no kathekon factor). */
function el(spec: ElementSpec = {}): unknown {
  return {
    key_id: 'test-key',
    signature: spec.signature ?? 'ok',
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

  // The false-positive class can never set a character per-domain open_loop:
  // three phronesis verdicts (floor met), one an OPEN non-engaged redirection.
  const noBleed = fold([
    el({ redirection: true, ref: 'F', depth: 'standard' }), // fp-class, open
    el({ ref: 'X1', depth: 'standard' }),
    el({ ref: 'X2', depth: 'standard' }),
  ])
  const ph = noBleed.character.domains['phronesis']
  assert(typeof ph === 'object', '§3 phronesis fold published at floor')
  if (typeof ph === 'object') {
    eq(ph.open_loop, false, '§3 fp-class open loop NEVER sets character open_loop')
  }
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
  // Review fold F2: the character note states BOTH halves of the posture —
  // levels fold every verified verdict; closure signals are engaged-gated.
  assert(
    b.character.note.includes('regardless of') && b.character.note.includes('engaged'),
    '§9 (F2) character note disclosing levels-vs-closure posture',
  )
  assert(
    b.chain_scope.includes('not') && b.chain_scope.includes('persisted'),
    '§9 chain scope discloses no stored-history fold exists',
  )
  assert(b.identity.kind === 'owner_agent_pair', '§9 identity carried on the block')
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
  // Review fold F1: a transient resolver error must not mislabel an
  // agent-bound credential as undeclared — the auth-verified path agent_id is
  // the fallback (owner deliberately has none).
  assert(
    /agentId:\s*foldCredentialContext\.agent_id\s*\?\?\s*agent_id/.test(routeSrc),
    '§11 INV (F1): identity agentId falls back to the auth-verified path agent_id',
  )
  // Review fold F3: the fold annotation has EXACTLY one declaration + one
  // attachment site (the success builder) — it can never silently gain a
  // second surface while the positive pins pass.
  eq(
    routeSrc.split('loopFoldAnnotation').length - 1,
    2,
    '§11 INV (F3): loopFoldAnnotation appears exactly twice (declaration + success builder)',
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
  eq(b.envelope.n_truncated, 6, '§12 truncation DISCLOSED, never silent')
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
console.log(`\nloop-fold battery: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error('FAILURES:\n  ' + failures.join('\n  '))
  process.exit(1)
}
