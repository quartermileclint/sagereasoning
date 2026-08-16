/**
 * l4-passion-audit.ts — Trust Layer S7: the out-of-band L4 passion audit (the
 * prosoche check on the ORCHESTRATOR's own selection reasoning). MEASURE mode.
 *
 * BINDING SPEC (verbatim in
 * operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md — A7;
 * ADR-013 §4 L4 + §5 A7). Where this file and the ADR diverge, the VERBATIM RECORD
 * WINS. Closes Phase 2 (the four-layer discernment protocol): S6 left the L4 seam
 * (`DiscernmentResult.l4 = { pending: true }`, `openDiscernmentSelection` writes
 * `l4_audit_result: null`); S7 fills it.
 *
 * ─── The channel (A7, verbatim) ──────────────────────────────────────────────
 * "Self-report is gameable by omission ... The passion is present in the reasoning
 * but absent from the account of the reasoning." So the audit "must run as an
 * out-of-band examination whose extraction the orchestrator does not control. The
 * orchestrating agent's reasoning TRACE — not its self-report — is the input." The
 * audit reads the trace for the THREE signals (Q4.1 a preference formed before the
 * assessment ran · Q4.2 a stake present in the selection outcome — epithumia dressed
 * as efficiency · Q4.3 a resolution reached before the assessment completed), which
 * are "detectable in the trace even when they are absent from the self-report,
 * because the trace records the SEQUENCE of the reasoning, not just the conclusion."
 *
 * "NEVER SELF-REPORT" IS STRUCTURAL HERE. The production entrypoints require an
 * injected `L4TraceExtractor` reading the trace; there is NO code path by which the
 * orchestrator supplies a "clean bill of health" signal set. Self-report is admitted
 * only as a SUPPLEMENTARY corroborating signal at HIGHER tiers (A7), and — by
 * construction — it can NEVER change the signals / anyFlag / disposition and is never
 * consulted at the lower tier (the safe, holding tier). It only enriches the record
 * that feeds the next Reflect (S8).
 *
 * ─── The disposition (A7, verbatim) ──────────────────────────────────────────
 * "At LOWER trust tiers, a Layer 4 flag HOLDS the selection pending review. At HIGHER
 * trust tiers ... a Layer 4 flag is logged and surfaced ... it does not automatically
 * hold the selection, but it is visible in the collaboration record and feeds the
 * next Sage Reflect session." The disposition itself is S5's pure
 * `resolveL4AuditResult`; S7 supplies the signals (from the out-of-band extraction),
 * the trace ref, and the trust tier (derived from the orchestrator's oversight-domain
 * reflect record).
 *
 * ─── Reuse, not re-implement (KG-EX1 / PR15) ─────────────────────────────────
 * The disposition resolver + write-once guard: collaboration-record.ts
 * (resolveL4AuditResult, canSetL4AuditResult). The write-once persistence:
 * collaboration-store.ts (readCollaborationRecord, recordL4AuditResult,
 * updateCollaborationRecord — the DB trg_cr_protect_immutable + service-role-only RLS
 * are the readable-not-modifiable backstop). The trust-tier read:
 * trust-core-store.ts (readTrustProfile + readHonestReflectSummary). The
 * "same deterministic engine" reading of the trace: the Sonnet Layer-1 machinery
 * (extractFeatures / the l1-supply path) via the abstract L4TraceExtractor seam — S8
 * wraps the real extractor; the battery injects a deterministic fake and exercises
 * `mapTraceFeaturesToL4Signals` directly. No new arithmetic is mentor-fixed: the
 * trace→signal mapping thresholds + the trust-tier reflect-pattern count are DERIVED
 * monotone conveniences (the mentor fixes the three signals + the tier disposition,
 * not the exact primitive mapping) — marked tunable pending S9, exactly as S2–S6
 * disclosed.
 *
 * ─── MEASURE, NOT ENFORCE ────────────────────────────────────────────────────
 * S7 COMPUTES the audit + a finalization DISPOSITION and (flag-gated) records it; it
 * BINDS nothing. The finalization gate writes the collaboration status as a RECORD,
 * never a force-block. ENFORCE (a hold that BINDS the orchestrator) is S11 — its own
 * founder-walked Critical logos-gate activation. Every outcome carries
 * `mode: 'measure'`.
 *
 * The pure functions (the trace→signal mapping, the tier derivation, the audit
 * assembly, the finalization gate) do no I/O, read no env, read no clock — `now` is
 * passed in. The live seams (`readOrchestratorL4TrustTier`, `commitL4Audit`,
 * `runL4AuditAndCommit`) read the clock (`new Date()`) + the DB, are flag-gated by
 * SUBSTRATE_TRUST_CORE_ENABLED, and are fail-honest (never throw to a route — MEASURE).
 *
 * ─── Q1/Q4.3 (applied 2026-08-16 at R2; exact text preserved in
 * D-FIVE-PRINCIPLES-AND-GUIDE-FUNCTION-RULINGS-EXECUTED-2026-08-12) ──────────────
 * Q1/Q4.3 — ONE PRINCIPLE AT TWO SCALES (named 2026-08-12, mentor ruling on
 * principle 1 of the five-principles examination). The IDEA loop's Q1 hard
 * constraint — the loop proposes, it never executes — is this same check at the
 * architectural scale. A generated proposal is a *phantasia* (an impression
 * presented), and the election by the human or agent who will act is the
 * *synkatathesis* (Epictetus, *Discourses* 1.1.7–12, 1.28.1–2). A loop that
 * executed its own proposal would reach a commitment stage with no preceding
 * assent stage — exactly the causal structure Q4.3 detects inside a single
 * trace. Q1 forbids architecturally what Q4.3 detects per-trace.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  CausalStage,
  Layer1Schema,
  PassionSubSpecies,
  RootPassion,
  UrgencySignalType,
} from '@/lib/translation-sandwich/layer1-extractor'

import { PROXIMITY_RANK, REFLECT_ACTIVE_WINDOW_MS } from './constants'
import {
  canSetL4AuditResult,
  resolveL4AuditResult,
  type L4AuditResult,
  type L4Disposition,
  type L4Signals,
  type L4TrustTier,
  type CollaborationStatus,
} from './collaboration-record'
import {
  readCollaborationRecord,
  recordL4AuditResult,
  updateCollaborationRecord,
} from './collaboration-store'
import { readHonestReflectSummary, readTrustProfile } from './trust-core-store'
import type { EffectiveDomainTrust } from './types'
import { isTrustCoreEnabled } from './trust-core-flag'

// ════════════════════════════════════════════════════════════════════════════
// DERIVED CONSTANTS (documented, tunable — the mentor fixes the three signals + the
// tier disposition + "a demonstrated pattern"; the exact primitive mapping + the
// pattern count are DERIVED, consistent with S2–S6).
// ════════════════════════════════════════════════════════════════════════════

/**
 * The A7 higher-tier reflect-pattern floor: how many honest Sage Reflect completions
 * constitute "a demonstrated pattern of honest self-diagnosis" (mentor A7). More than
 * one — a single honest reflect is not a pattern. DERIVED (the mentor fixes "a
 * demonstrated pattern", not the count); tunable pending S9. Conservative: a higher
 * floor only holds more selections (the safe direction).
 */
const HONEST_REFLECT_PATTERN_FLOOR = 3

/** The live deterministic-assent floor — the oversight domain must be at least
 *  `deliberate` (the standing "deliberate is the live threshold" lesson) to count as
 *  un-degraded (A8: an orchestrator proceeding under flags degrades its oversight
 *  record, which drops it below this and back to the holding tier). */
const OVERSIGHT_SOUND_FLOOR = PROXIMITY_RANK.deliberate

// ════════════════════════════════════════════════════════════════════════════
// SECTION A — the out-of-band trace + the deterministic "same-engine" reading
// ════════════════════════════════════════════════════════════════════════════

/**
 * The orchestrator's recorded reasoning TRACE — the out-of-band input to the L4
 * audit (mentor A7). This is the recorded SEQUENCE of the orchestrator's selection
 * reasoning, supplied by the harness's Observability layer, NOT a self-authored
 * account/summary the orchestrator controls. S8 feeds `reasoningTrace` to
 * `extractFeatures` (the Sonnet Layer-1 machinery / the l1-supply path) as the
 * `input`; the orchestrator does not control the extraction.
 */
export interface OrchestratorReasoningTrace {
  schema: 'trust-orchestrator-reasoning-trace-v1'
  /** The recorded reasoning sequence (verbatim; the out-of-band artifact). */
  reasoningTrace: string
  /** The selection this trace produced — used by the caller to derive the mapping
   *  context (a pattern/prior-interaction match against the CHOSEN candidate). */
  chosenCandidateRef?: string | null
}

/**
 * The narrow structured features the deterministic L4 reading needs — a light subset
 * of the Layer-1 schema (decoupled from the full `Layer1Schema` so the mapping is
 * forward-compatible + testable without constructing a whole schema). S8 adapts a
 * real `Layer1Schema` via `l4TraceFeaturesFromLayer1`.
 */
export interface L4TraceFeatures {
  passions: { rootPassion: RootPassion; subSpecies: PassionSubSpecies | null }[]
  urgency: { signalType: UrgencySignalType; stage?: CausalStage | null; examinedBeforeActing?: boolean | null }[]
  causalStages: CausalStage[]
  motivationStated: boolean
}

/**
 * Adapt a real `Layer1Schema` (extracted from the trace by the Sonnet Layer-1
 * machinery) to the light `L4TraceFeatures` the deterministic reading consumes. The
 * "same deterministic engine" reuse point (A7) — S8's extractor runs
 * `extractFeatures(trace)` then this adapter then `mapTraceFeaturesToL4Signals`. Pure.
 */
export function l4TraceFeaturesFromLayer1(schema: Layer1Schema): L4TraceFeatures {
  return {
    passions: schema.passions_present.map((p) => ({
      rootPassion: p.root_passion,
      subSpecies: p.sub_species,
    })),
    urgency: schema.urgency_indicators.map((u) => ({
      signalType: u.signal_type,
      stage: u.stage ?? null,
      examinedBeforeActing: u.examined_before_acting ?? null,
    })),
    causalStages: schema.causal_stage_evidence.map((c) => c.stage),
    motivationStated: schema.motivation_stated === true,
  }
}

/**
 * The mapping context — the pre-formed-preference corroborators the caller derives
 * from the orchestrator profile + the CHOSEN candidate (NOT from the orchestrator's
 * self-report). A9/L4: "a prior positive interaction is DATA, not a credential"; it
 * only becomes an L4 signal when it appears to have driven the selection.
 */
export interface L4MappingContext {
  /** A recorded selection pattern the orchestrator holds matched the chosen candidate
   *  (a pre-formed preference corroborator — Q4.1). */
  selectionPatternMatchedChosen: boolean
  /** A prior-interaction record exists for the chosen candidate (A9/L4 data — a WEAK
   *  corroborator: only a STAKE when paired with a desire passion, never on its own). */
  priorInteractionWithChosen: boolean
}

const EMPTY_MAPPING_CONTEXT: L4MappingContext = {
  selectionPatternMatchedChosen: false,
  priorInteractionWithChosen: false,
}

/**
 * The deterministic "same-engine" reading of the orchestrator's trace features →
 * the three L4 signals (mentor A7 / ADR §4 L4). Pure. This is the STRUCTURED-PRIMITIVE
 * reading; the AUTHORITATIVE semantic reading is the injected `L4TraceExtractor` (the
 * LLM at the S8 boundary). Conservative + DERIVED (the mentor fixes the three signals,
 * not this primitive mapping); tunable pending S9. The signals CAN co-fire.
 *
 *   Q4.1 priorPreferenceFormed — a DESIRE passion is present (epithumia: the structured
 *     marker of "a preference formed / wanting") OR a recorded selection pattern matched
 *     the chosen candidate (a preference the orchestrator already held).
 *   Q4.2 stakeInOutcome — a stake in the selection outcome, VALENCE-NEUTRAL (mentor A7
 *     names "a stake present in the selection outcome", not only an appetitive one):
 *     an APPETITIVE stake — a PLEASURE/GAIN passion (hedone) OR a desire rationalized as
 *     a stated reason (epithumia + motivation_stated = "epithumia dressed as
 *     efficiency") OR a desire tied to a preferred prior partner (epithumia +
 *     priorInteraction) — OR an AVERSIVE stake — a fear/distress/envy passion (phobos /
 *     lupe: e.g. phthonos-envy toward a candidate, fear of a bad outcome), which biases
 *     the selection just as an appetitive stake does (the S7-review false-negative fold).
 *   Q4.3 resolutionBeforeComplete — the trace's causal chain reached a COMMITMENT /
 *     ACTION stage (horme / praxis) WITHOUT a preceding ASSENT/DELIBERATION stage
 *     (synkatathesis) in the chain — resolution BEFORE the assessment completed,
 *     read as causal ORDER, never output content (S9b F-Q43 calibration: the
 *     pre-S9b predicate fired on ANY horme/praxis stage, which every faithful
 *     mid-work trace narrating intended action carries — zero discrimination on
 *     the operative input class, S9 findings register item 1; the mentor's G3
 *     frame: "impression received without examination, assent granted without
 *     deliberation" is the signature, and a trace that shows weighing before
 *     committing is the examination HAPPENING, not being skipped). The grave arm
 *     is UNCHANGED: a finality/irreversibility urgency signal NOT examined before
 *     acting (examined_before_acting !== true — absent/null/false all read as
 *     un-examined, the sibling andreia domain's conservative safe default) still
 *     fires regardless of stage structure.
 */
export function mapTraceFeaturesToL4Signals(
  features: L4TraceFeatures,
  ctx: L4MappingContext = EMPTY_MAPPING_CONTEXT,
): L4Signals {
  const hasDesire = features.passions.some((p) => p.rootPassion === 'epithumia')
  const hasHedone = features.passions.some((p) => p.rootPassion === 'hedone')
  // Aversive passions (fear / distress / envy) are ALSO a stake in the outcome (Q4.2 is
  // valence-neutral) — a bias against a candidate biases the selection just as a desire
  // for one does. Bare epithumia is Q4.1 (a preference formed), so nothing appetitive
  // slips through either.
  const hasAversive = features.passions.some(
    (p) => p.rootPassion === 'phobos' || p.rootPassion === 'lupe',
  )

  const priorPreferenceFormed = hasDesire || ctx.selectionPatternMatchedChosen

  const stakeInOutcome =
    hasHedone ||
    hasAversive ||
    (hasDesire && features.motivationStated) ||
    (hasDesire && ctx.priorInteractionWithChosen)

  // S9b F-Q43 calibration: commitment fires ONLY without a PRECEDING assent /
  // deliberation stage — the causal signature is the ORDER, not mere presence
  // (review fold, 2026-07-12: a presence check would read [praxis,
  // synkatathesis] — commit first, rationalize after, the genuine "assent
  // granted without deliberation" signature — as clean). causalStages follows
  // the extraction's evidence order; assent negates only when it appears
  // BEFORE the first commitment stage.
  const firstCommitmentIdx = features.causalStages.findIndex((s) => s === 'horme' || s === 'praxis')
  const assentBeforeCommitment =
    firstCommitmentIdx >= 0 &&
    features.causalStages.slice(0, firstCommitmentIdx).includes('synkatathesis')
  const reachedCommitment = firstCommitmentIdx >= 0 && !assentBeforeCommitment
  const graveUnexamined = features.urgency.some(
    (u) =>
      (u.signalType === 'finality_language' || u.signalType === 'irreversibility_language') &&
      u.examinedBeforeActing !== true,
  )
  const resolutionBeforeComplete = reachedCommitment || graveUnexamined

  return { priorPreferenceFormed, stakeInOutcome, resolutionBeforeComplete }
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION B — the A7 trust-tier derivation (from the oversight reflect record)
// ════════════════════════════════════════════════════════════════════════════

/** The pure inputs to the tier derivation (read live by the seam below). */
export interface L4TrustTierInputs {
  /** The orchestrator's oversight-domain trust (A8/A9), or null when no row exists. */
  oversight: EffectiveDomainTrust | null
  /** The orchestrator's honest Sage Reflect record (agent-wide honest completions). */
  honestReflect: { count: number; latestAt: string | null }
  /** ISO 'now' for the recency window (passed in — the pure fn reads no clock). */
  nowIso: string
}

export interface L4TrustTierAssessment {
  tier: L4TrustTier
  /** True ⇔ a demonstrated pattern of honest self-diagnosis within the active window. */
  reflectStrong: boolean
  /** True ⇔ the oversight domain is un-degraded (evidence + ≥ deliberate + not capped). */
  oversightSound: boolean
  basis: string
}

/**
 * Derive the A7 trust tier (lower / higher). PURE. Conservative TOWARD `lower` (the
 * safe, holding tier): `higher` requires POSITIVE evidence of BOTH a strong honest
 * reflect pattern AND un-degraded oversight; absence of either ⇒ `lower`.
 *
 *   PRIMARY (mentor A7, literal): "a strong Sage Reflect history and a demonstrated
 *     pattern of honest self-diagnosis" — at least HONEST_REFLECT_PATTERN_FLOOR honest
 *     reflect completions, the most recent within the active reflect window (the same
 *     REFLECT_ACTIVE_WINDOW_MS S1 uses for decay modulation).
 *   CONSERVATIVE AND-GUARD (derived, safe-direction-only): the orchestrator's
 *     OVERSIGHT domain must be un-degraded — it has earned evidence, its effective
 *     level is ≥ deliberate, and no justice latch is capping it. This encodes A8's
 *     tail ("an orchestrating agent that consistently proceeds under habitual-stable
 *     flags without developmental follow-through ... should reduce its own trust record
 *     in the oversight domain") — a degraded orchestrator drops back to the holding
 *     tier. The guard can ONLY demote to `lower` (never promote), so it never widens
 *     the higher tier beyond what the mentor fixes.
 *
 * A7 also names self-report as admissible at higher tiers ONLY as a supplementary
 * corroborating signal — never as this derivation's input (never self-report).
 */
export function deriveL4TrustTier(inputs: L4TrustTierInputs): L4TrustTierAssessment {
  const { oversight, honestReflect, nowIso } = inputs

  const now = Date.parse(nowIso)
  const latest = honestReflect.latestAt ? Date.parse(honestReflect.latestAt) : NaN
  const reflectRecent =
    Number.isFinite(now) && Number.isFinite(latest) && now - latest <= REFLECT_ACTIVE_WINDOW_MS
  const reflectStrong = honestReflect.count >= HONEST_REFLECT_PATTERN_FLOOR && reflectRecent

  const oversightSound =
    oversight !== null &&
    oversight.hasEvidence &&
    PROXIMITY_RANK[oversight.effectiveLevel] >= OVERSIGHT_SOUND_FLOOR &&
    !oversight.justiceCapped

  const tier: L4TrustTier = reflectStrong && oversightSound ? 'higher' : 'lower'

  return {
    tier,
    reflectStrong,
    oversightSound,
    basis:
      tier === 'higher'
        ? `A7 HIGHER tier: strong honest reflect pattern (${honestReflect.count} ≥ ${HONEST_REFLECT_PATTERN_FLOOR}, recent) ` +
          `AND un-degraded oversight (${oversight?.effectiveLevel}) — a flag surfaces, does not auto-hold`
        : `A7 LOWER tier (conservative default): ${
            !reflectStrong
              ? `no demonstrated honest reflect pattern (count ${honestReflect.count}${reflectRecent ? '' : ', or not recent'})`
              : `oversight degraded / absent (${oversight ? `${oversight.effectiveLevel}${oversight.justiceCapped ? ', justice-capped' : ''}${oversight.hasEvidence ? '' : ', no evidence'}` : 'no oversight row'})`
          } — a flag HOLDS the selection pending review`,
  }
}

/**
 * Read the orchestrator's A7 trust tier live (fail-honest, flag-gated). Reads the
 * oversight-domain trust + the honest-reflect record; on ANY failure — or flag-off —
 * returns the conservative `lower`. Flag-off ⇒ NO DB touch (MEASURE dark;
 * production byte-equivalent). The pure `deriveL4TrustTier` does the derivation.
 */
export async function readOrchestratorL4TrustTier(
  orchestratorAgentId: string,
  opts?: { now?: Date; client?: SupabaseClient },
): Promise<L4TrustTierAssessment & { sourced: boolean }> {
  const now = opts?.now ?? new Date()
  if (!isTrustCoreEnabled()) {
    return {
      tier: 'lower',
      reflectStrong: false,
      oversightSound: false,
      sourced: false,
      basis: 'SUBSTRATE_TRUST_CORE_ENABLED unset — MEASURE dark; conservative lower tier (no DB read)',
    }
  }
  try {
    const profileRes = await readTrustProfile(orchestratorAgentId, now, opts?.client)
    const reflectRes = await readHonestReflectSummary(orchestratorAgentId, opts?.client)
    if (!profileRes.ok || !reflectRes.ok) {
      return {
        tier: 'lower',
        reflectStrong: false,
        oversightSound: false,
        sourced: false,
        basis: 'trust-state read failed (fail-honest) — conservative lower tier',
      }
    }
    const oversight =
      profileRes.value.domains.find((d) => d.virtueDomain === 'oversight') ?? null
    const assessment = deriveL4TrustTier({
      oversight,
      honestReflect: {
        count: reflectRes.value.honestReflectCount,
        latestAt: reflectRes.value.latestHonestReflectAt,
      },
      nowIso: now.toISOString(),
    })
    return { ...assessment, sourced: true }
  } catch {
    return {
      tier: 'lower',
      reflectStrong: false,
      oversightSound: false,
      sourced: false,
      basis: 'readOrchestratorL4TrustTier threw (fail-honest) — conservative lower tier',
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION C — the audit assembly + the finalization gate (pure)
// ════════════════════════════════════════════════════════════════════════════

/**
 * The A7 supplementary self-report corroboration — admissible ONLY at the higher tier,
 * ONLY as a corroborating signal, NEVER as the channel (verbatim A7). By construction
 * it can never change the signals / anyFlag / disposition; it only annotates whether
 * the orchestrator's honest self-diagnosis agreed with the out-of-band trace reading
 * (a datum that feeds the next Reflect at S8).
 */
export interface L4SelfReportCorroboration {
  /** The orchestrator's OWN account acknowledged a pre-formed preference / stake. */
  acknowledgedPreference: boolean
  note?: string
}

export type L4Finalization = 'may-finalize' | 'hold'

export interface L4AuditOutcome {
  schema: 'trust-l4-audit-outcome-v1'
  /** 'audited' when the out-of-band extraction produced signals + a non-empty trace
   *  ref; 'audit-unavailable' when the extraction could not run (never fabricate a
   *  clean pass — the audit HOLDS). */
  status: 'audited' | 'audit-unavailable'
  /** The S5 L4AuditResult (from resolveL4AuditResult); null iff audit-unavailable. The
   *  write-once idempotency check (canSetL4AuditResult) is order-INDEPENDENT, so a value
   *  re-read from jsonb (key order not preserved) still matches for a clean re-write. */
  result: L4AuditResult | null
  /** The finalization gate (A7): a selection may finalize ONLY after a clean or
   *  higher-tier-surfaced audit; a lower-tier flag or an unavailable audit HOLDS. */
  finalization: L4Finalization
  /** Higher-tier-only supplementary self-report corroboration (A7). null ⇔ not
   *  consulted (lower tier / not supplied). NEVER changes the disposition. */
  selfReportCorroborates: boolean | null
  /** MEASURE invariant — advisory; nothing binds (ENFORCE is S11). */
  mode: 'measure'
  basis: string
}

/**
 * Resolve the finalization disposition from a (possibly null) L4 audit result (mentor
 * A7). PURE. A selection MAY finalize only after a CLEAN audit (no-flag) or a
 * higher-tier SURFACED flag (logs-and-surfaces — "does not automatically hold"). A
 * lower-tier flag (holds-selection) HOLDS; a null result (audit not written /
 * unavailable) HOLDS — never finalize on an audit that did not confirm.
 */
export function resolveFinalizationDisposition(result: L4AuditResult | null): L4Finalization {
  if (result === null) return 'hold'
  return dispositionAllowsFinalize(result.disposition) ? 'may-finalize' : 'hold'
}

function dispositionAllowsFinalize(d: L4Disposition): boolean {
  return d === 'no-flag' || d === 'logs-and-surfaces'
}

/**
 * Assemble the L4 audit outcome from the out-of-band signals + the trust tier + the
 * signed trace ref (mentor A7). PURE. Reuses S5's `resolveL4AuditResult` (so the
 * stored result is canonical — clean idempotent re-writes). R18f-parallel: an empty
 * traceRef ⇒ audit-unavailable (no L4 result without a verifiable trace artifact;
 * never fabricate). The self-report corroboration is consulted ONLY at the higher
 * tier and NEVER changes the disposition.
 */
export function assembleL4Audit(args: {
  signals: L4Signals
  trustTier: L4TrustTier
  traceRef: string
  selfReportCorroboration?: L4SelfReportCorroboration | null
}): L4AuditOutcome {
  const { signals, trustTier, traceRef, selfReportCorroboration } = args

  // R18f-parallel: no verifiable trace artifact ⇒ the audit did not run. HOLD; never
  // fabricate a clean result.
  if (typeof traceRef !== 'string' || traceRef.trim() === '') {
    return {
      schema: 'trust-l4-audit-outcome-v1',
      status: 'audit-unavailable',
      result: null,
      finalization: 'hold',
      selfReportCorroborates: null,
      mode: 'measure',
      basis:
        'A7 audit unavailable: no signed trace ref (the out-of-band extraction did not run) — ' +
        'the selection HOLDS; no L4 result written (never fabricate a clean pass)',
    }
  }

  const result = resolveL4AuditResult({ signals, trustTier, traceRef })
  const finalization = resolveFinalizationDisposition(result)

  // Supplementary self-report corroboration (A7): higher tier ONLY; never the channel.
  // Structurally cannot change `result` (already computed) — informational only.
  let selfReportCorroborates: boolean | null = null
  if (trustTier === 'higher' && selfReportCorroboration) {
    selfReportCorroborates = result.anyFlag && selfReportCorroboration.acknowledgedPreference
  }

  return {
    schema: 'trust-l4-audit-outcome-v1',
    status: 'audited',
    result,
    finalization,
    selfReportCorroborates,
    mode: 'measure',
    basis:
      `${result.basis}; finalization=${finalization}` +
      (selfReportCorroborates === true
        ? ' — higher-tier self-report CORROBORATES the trace flag (supplementary; feeds the next Reflect)'
        : trustTier === 'higher' && selfReportCorroboration
          ? ' — higher-tier self-report did not corroborate (supplementary; the trace reading stands)'
          : ''),
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION D — the out-of-band extraction seam (injectable; the battery runs pure)
// ════════════════════════════════════════════════════════════════════════════

/**
 * The out-of-band extractor (mentor A7 — "extracted by the same deterministic engine
 * ... the orchestrator does not control the extraction"). Reads the orchestrator's
 * reasoning TRACE (never its self-report) and returns the three L4 signals + a signed
 * trace ref (R18f-parallel; non-empty). Implemented at the S8 boundary by wrapping
 * `extractFeatures` (the Sonnet Layer-1 machinery / the l1-supply path):
 * `extractFeatures(trace).schema |> l4TraceFeaturesFromLayer1 |> mapTraceFeaturesToL4Signals`.
 * The battery injects a deterministic fake. Async only because extraction is async.
 */
export interface L4TraceExtractor {
  extractL4Signals(args: {
    trace: OrchestratorReasoningTrace
  }): Promise<{ signals: L4Signals; traceRef: string; note?: string }>
}

/**
 * Run the out-of-band L4 passion audit (mentor A7). The extractor is REQUIRED — there
 * is NO code path by which the orchestrator supplies "clean" signals directly (never
 * self-report the channel). Fail-honest: an extractor throw, or an empty trace ref,
 * ⇒ audit-unavailable (HOLD; never fabricate a clean pass). The trust tier is supplied
 * (read via `readOrchestratorL4TrustTier`); the self-report corroboration is optional
 * and higher-tier-only. PURE of DB I/O (only the injected extractor is async). MEASURE.
 */
export async function runL4PassionAudit(
  args: {
    trace: OrchestratorReasoningTrace
    trustTier: L4TrustTier
    selfReportCorroboration?: L4SelfReportCorroboration | null
  },
  extractor: L4TraceExtractor,
): Promise<L4AuditOutcome> {
  let extracted: { signals: L4Signals; traceRef: string; note?: string }
  try {
    extracted = await extractor.extractL4Signals({ trace: args.trace })
  } catch (e) {
    return {
      schema: 'trust-l4-audit-outcome-v1',
      status: 'audit-unavailable',
      result: null,
      finalization: 'hold',
      selfReportCorroborates: null,
      mode: 'measure',
      basis: `A7 audit unavailable: the out-of-band extractor threw (fail-honest) — the selection HOLDS: ${(e as Error).message}`,
    }
  }
  return assembleL4Audit({
    signals: extracted.signals,
    trustTier: args.trustTier,
    traceRef: extracted.traceRef,
    selfReportCorroboration: args.selfReportCorroboration ?? null,
  })
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION E — the commit seam (flag-gated, fail-honest; the finalization gate)
// ════════════════════════════════════════════════════════════════════════════

export interface L4CommitResult {
  /** True ⇔ the commit path ran to completion without a store error (flag-on). */
  committed: boolean
  /** True ⇔ the write-once l4_audit_result was written this call. */
  written: boolean
  /** The status the finalization gate set (null ⇔ no status write). */
  statusSet: CollaborationStatus | null
  /** MEASURE invariant — the status write is a RECORD, not a force-block (ENFORCE = S11). */
  mode: 'measure'
  note: string
  error?: string
}

/**
 * The status the finalization gate writes (A7). PURE. A may-finalize audit → the
 * collaboration finalizes; a HOLD (a lower-tier flag or an unavailable audit) →
 * 'escalated' (A7 "holds the selection pending review"). MEASURE — advisory record,
 * never a force-block; ENFORCE (a hold that BINDS) is S11.
 */
export function finalizationStatusFor(finalization: L4Finalization): CollaborationStatus {
  return finalization === 'may-finalize' ? 'finalized' : 'escalated'
}

/**
 * Write the L4 audit result (write-once) into the collaboration record + apply the
 * finalization gate. Flag-gated by SUBSTRATE_TRUST_CORE_ENABLED (flag-off ⇒ a pure
 * no-op, no store touch — MEASURE dark, byte-equivalent) and FAIL-HONEST (never
 * throws — a store failure / a write-once trigger RAISE surfaces as committed:false).
 *
 *   - reads the collaboration record (opened by S6 at selection). Absent ⇒ nothing to
 *     write into (S6 did not open it) — fail-honest, does NOT fabricate a record.
 *   - pre-checks the pure `canSetL4AuditResult` (A7 readable-not-modifiable) to avoid a
 *     wasted round-trip + surface a clean error; the DB trigger is the backstop.
 *   - writes l4_audit_result ONLY when the audit ran (status 'audited'); on
 *     'audit-unavailable' it NEVER writes a result (never fabricate) and only records
 *     the HOLD via the status.
 *   - applies the finalization gate: may-finalize → 'finalized'; hold → 'escalated'.
 */
export async function commitL4Audit(
  args: {
    orchestratorAgentId: string
    taskRef: string
    outcome: L4AuditOutcome
    client?: SupabaseClient
  },
): Promise<L4CommitResult> {
  const base: L4CommitResult = { committed: false, written: false, statusSet: null, mode: 'measure', note: '' }

  // Flag-gate (caller-gate, matching collaboration-store's contract). Flag-off ⇒ a pure
  // no-op (no store touch) — production byte-equivalent, MEASURE dark.
  if (!isTrustCoreEnabled()) {
    return { ...base, note: 'SUBSTRATE_TRUST_CORE_ENABLED unset — MEASURE dark; no collaboration-record write (byte-equivalent)' }
  }

  // Belt-and-braces fail-honest (MEASURE — "never throws"): the store fns wrap their own
  // bodies, but their DEFAULT-parameter getAdminClient() is evaluated OUTSIDE that try
  // when no client is injected and can throw on missing env. Catch here so a
  // mis-configured flag-on call returns committed:false rather than throwing to a route.
  try {
    const targetStatus = finalizationStatusFor(args.outcome.finalization)

    // Read the collaboration record FIRST (both the audited + audit-unavailable paths):
    // the record must have been opened by S6 at selection. Absent ⇒ nothing to write
    // into or hold — fail-honest, never fabricate a record (and never report a hold on a
    // record that does not exist).
    const read = await readCollaborationRecord(args.orchestratorAgentId, args.taskRef, args.client)
    if (!read.ok) {
      return { ...base, note: 'collaboration-record read failed (fail-honest)', error: read.error }
    }
    if (read.value === null) {
      return {
        ...base,
        note: 'no collaboration record for (orchestrator, task) — S6 did not open it; nothing to write into (fail-honest, never fabricate)',
      }
    }

    let written = false
    // Write the L4 result ONLY when the audit ran (status 'audited'); on
    // 'audit-unavailable' NEVER write a result (never fabricate a clean pass) — only
    // record the HOLD via the status below.
    if (args.outcome.status === 'audited' && args.outcome.result !== null) {
      const guard = canSetL4AuditResult(read.value, args.outcome.result)
      if (!guard.allowed) {
        // A7 readable-not-modifiable: a DIFFERENT result is already written. Do NOT
        // overwrite; surface the clean error (the DB trigger is the backstop anyway).
        return { ...base, note: `L4 write-once refused: ${guard.reason}` }
      }
      const write = await recordL4AuditResult(
        args.orchestratorAgentId,
        args.taskRef,
        args.outcome.result,
        args.client,
      )
      if (!write.ok) {
        // Includes the write-once trigger RAISE (surfaces fail-honest).
        return { ...base, note: 'l4_audit_result write failed (fail-honest)', error: write.error }
      }
      written = true
    }

    // Apply the finalization gate: may-finalize → 'finalized'; hold → 'escalated'.
    const upd = await updateCollaborationRecord(
      args.orchestratorAgentId,
      args.taskRef,
      { status: targetStatus },
      args.client,
    )
    if (!upd.ok) {
      return { ...base, committed: false, written, note: 'finalization status write failed (fail-honest)', error: upd.error }
    }

    return {
      ...base,
      committed: true,
      written,
      statusSet: targetStatus,
      note: written
        ? `L4 audit committed (readable-not-modifiable); finalization gate applied ` +
          `(disposition=${args.outcome.result?.disposition} → status=${targetStatus})`
        : `audit unavailable — no L4 result written (never fabricate); collaboration held (status=${targetStatus})`,
    }
  } catch (e) {
    return { ...base, note: 'commitL4Audit threw (fail-honest)', error: (e as Error).message }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION F — the composed live entrypoint (read tier → audit → commit; S8 turnkey)
// ════════════════════════════════════════════════════════════════════════════

export interface L4AuditAndCommit {
  trustTier: L4TrustTier
  outcome: L4AuditOutcome
  commit: L4CommitResult
}

/**
 * The turnkey S8 entrypoint: read the orchestrator's A7 trust tier (fail-honest,
 * flag-gated) → run the out-of-band audit on the trace (extractor injected) → commit
 * the write-once result + apply the finalization gate (flag-gated). MEASURE — the
 * whole path is advisory; flag-off ⇒ a PURE no-op: NO extractor call (no live LLM
 * request), NO DB touch (byte-equivalent, MEASURE dark). Nothing in a live route calls
 * this session — S8 wires it with the real extractor.
 */
export async function runL4AuditAndCommit(
  args: {
    orchestratorAgentId: string
    taskRef: string
    trace: OrchestratorReasoningTrace
    selfReportCorroboration?: L4SelfReportCorroboration | null
    now?: Date
    client?: SupabaseClient
  },
  extractor: L4TraceExtractor,
): Promise<L4AuditAndCommit> {
  // Flag-gate the WHOLE turnkey (not just the writes): flag-off ⇒ the extractor is never
  // invoked (no live LLM call) and no DB is touched — the composed live entrypoint is
  // fully inert dark. The individual pieces (runL4PassionAudit) remain callable for
  // S8-controlled / test use; this convenience respects the flag end-to-end.
  if (!isTrustCoreEnabled()) {
    return {
      trustTier: 'lower',
      outcome: {
        schema: 'trust-l4-audit-outcome-v1',
        status: 'audit-unavailable',
        result: null,
        finalization: 'hold',
        selfReportCorroborates: null,
        mode: 'measure',
        basis: 'SUBSTRATE_TRUST_CORE_ENABLED unset — MEASURE dark; the L4 audit did not run (no extraction, no write)',
      },
      commit: { committed: false, written: false, statusSet: null, mode: 'measure', note: 'trust core dark — no commit' },
    }
  }
  const tier = await readOrchestratorL4TrustTier(args.orchestratorAgentId, {
    now: args.now,
    client: args.client,
  })
  const outcome = await runL4PassionAudit(
    { trace: args.trace, trustTier: tier.tier, selfReportCorroboration: args.selfReportCorroboration ?? null },
    extractor,
  )
  const commit = await commitL4Audit({
    orchestratorAgentId: args.orchestratorAgentId,
    taskRef: args.taskRef,
    outcome,
    client: args.client,
  })
  return { trustTier: tier.tier, outcome, commit }
}
