/**
 * combiner.ts — Trust Layer S3: the multi-source combiner (mentor A1 + spec 6),
 * as pure deterministic functions.
 *
 * BINDING SPECS (verbatim in
 * operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md;
 * ADR-013 §3 row 6 + the spec-6 aggregation rule + §5 A1). Where this file and
 * the ADR diverge, the VERBATIM RECORD WINS.
 *
 * ─── A1 — source-confidence routing, post-§4 (the live state since 2026-07-08) ─
 * "Default tasks (no justice surface): Deterministic engine carries primary
 *  weight … The holistic LLM is not required … Running both in parallel on
 *  default tasks adds latency without adding fidelity."
 * "Justice surface tasks, pre-corroboration check: Deterministic engine carries
 *  primary weight on the proximity verdict. The holistic LLM carries a
 *  supplementary role specifically on the obligation evaluation field — met,
 *  violated, or indeterminate-argued … If the two sources agree on the obligation
 *  evaluation, the deterministic verdict stands. If they conflict, the conflict
 *  triggers pause-and-escalate per the intervention table."
 * "Justice surface tasks, post-corroboration check: … deterministic engine primary
 *  on proximity verdict and on corroborated obligation fields; holistic LLM
 *  supplementary on uncorroborated obligation fields with explicit low-confidence
 *  marking; conflict between sources triggers pause regardless of which source is
 *  primary."
 * The live corroboration vocabulary (`corroborated | uncorroborated | contradicted`,
 * riding inside the signed assessment) IS the routing key (§5 A1). `contradicted`
 * is not-corroborated for routing purposes (the LLM's supplementary reader applies).
 *
 * THE LLM SECOND-READER IS INJECTED (dark). This session builds the routing +
 * agree/conflict logic PURE — the LLM's obligation verdict is a parameter. The
 * real bounded Sonnet call (Element 6 — multi-mechanism) + any live wiring is the
 * founder-walked 0c-ii successor (a real Anthropic call = cost + a live surface),
 * gated behind SUBSTRATE_TRUST_CORE_ENABLED (or a new S3 flag) at wiring time.
 * Nothing here reads env, does I/O, or calls a model — it is pure exactly as S2 is.
 *
 * ─── Spec 6 — combining verification results ────────────────────────────────
 * "Within-session: most recent supersedes (the live CI-4 marker semantics);
 *  cross-session: weighted recency, per-domain only (domain evidence updates only
 *  its domain); across sources: per mentor A1 post-§4; conflicts always pause,
 *  never average."
 * Within-session supersession REUSES the live CI-4 marker semantics — this file
 * imports and CALLS `analyseLoopClosure` (the M3 write-boundary gate) for the
 * closure verdict, and identifies the un-superseded terminal of a chain with the
 * SAME `examination.{ref,depth_tier,prior_feedback_ref}` markers + same-depth rule.
 * It does NOT re-implement the closure logic (the DEPTH_RANK mirror is behaviourally
 * locked to `analyseLoopClosure` by a battery consistency test). Both supersession
 * AND the open-loop verdict are scoped PER (session, domain) — so a re-examination
 * that re-covers only some of an examination's domains cannot erase an
 * un-re-examined domain's verdict, and an open loop in one domain cannot flag
 * another (the spec-6 per-domain isolation principle applied throughout).
 *
 * ─── Spec 6 — the cross-domain AGGREGATION rule ─────────────────────────────
 * "Aggregate trust = minimum domain trust level, modified by justice surface
 *  evaluation, weighted by coverage continuity and source confidence, with
 *  conflicts escalating to pause rather than averaging to proceed." This is the
 *  minimum across the subject's per-(agent_id, domain) trust LEVELS — DISTINCT
 *  from the S1 within-examination four-virtue minimum-domain rule (row 4). S3
 *  layers the weighting + conflict-pause + the S2→S3 A2 handoff ON TOP of S1's
 *  `computeAggregate` (the marked seam) — S1 stays BYTE-IDENTICAL (its own docstring
 *  names this an "S2/S3 extension", not a modification).
 *
 * ─── The S2→S3 handoff (honored here) ───────────────────────────────────────
 * A source with `contributes === false` (the A2 zero-floor fired — a zeroed
 * credential) counts as NO coverage for that domain: it can never lift the
 * aggregate LEVEL (the domain falls back to min(effective, profile-prior) — never
 * the credential's uplift) and it drives the aggregate confidence weight to 0 (a
 * required-domain coverage gap ⇒ no confident proceed). "A zero-confidence
 * credential can never contribute to a proceed verdict on a task requiring that
 * domain" (mentor A2), at the aggregate.
 *
 * Pure — no I/O, no env, no clock (recency is computed RELATIVE to the most-recent
 * verdict in the set, from the verdicts' own timestamps — never now()).
 */

import type { KatorthomaProximity } from '@/lib/translation-sandwich/layer2-mechanisms'
import type { CorroborationFindingStatus } from '@/lib/translation-sandwich/corroboration-check'
import type { LoopDepthTier } from '@/lib/translation-sandwich/reason-loop-closure'
import {
  analyseLoopClosure,
  type LoopClosureMarkers,
  type LoopClosureAnalysis,
} from '@/app/api/accreditation/[agent_id]/loop-closure-gate'
import type {
  AggregateTrust,
  CoverageStatus,
  EffectiveDomainTrust,
  VirtueTrustDomain,
} from './types'
import { PROXIMITY_RANK, rankToProximity, MONTH_MS } from './constants'
import type { ConfidenceAssessment } from './confidence-tiers'
import type { WeightedEvidence } from './evidence-weighting'
import { computeAggregate } from './trust-aggregate'

// ════════════════════════════════════════════════════════════════════════════
// DERIVED CONSTANTS (documented, tunable — the mentor fixes ORDERINGS, not
// magnitudes; consistent with the S1/S2 posture). Grouped so a tuning pass (S9)
// touches one place.
// ════════════════════════════════════════════════════════════════════════════

/**
 * DEPTH_RANK — MIRRORS the CI-4 gate's (non-exported) DEPTH_RANK
 * (loop-closure-gate.ts): quick:1, standard:2, deep:3. Kept in sync by a battery
 * CONSISTENCY test that feeds shared chains — at each tier (quick / standard /
 * deep) AND a depth-less redirection — to BOTH `analyseLoopClosure` and
 * `combineVerificationResults`, asserting they agree on what is superseded/closed,
 * so a rank drift is caught, not silent.
 */
const DEPTH_RANK: Record<LoopDepthTier, number> = { quick: 1, standard: 2, deep: 3 }

/**
 * Cross-session recency: an older verdict's weight relative to the most-recent
 * decays with the month-gap. DERIVED monotone factor (the most-recent = 1.0);
 * exp decay with a documented half-life so "weighted recency" means recency
 * DOMINATES without averaging. Tunable pending S9.
 */
const RECENCY_HALF_LIFE_MONTHS = 6

/**
 * Cross-session CONFLICT floor: an older terminal counts as a still-material
 * disagreement only when its recency-weight (confidence × relative recency) is at
 * or above this. Below it, the older verdict has decayed out of contention and
 * does not trigger a conflict. DERIVED, tunable.
 */
const CONFLICT_MATERIAL_WEIGHT_FLOOR = 0.25

/**
 * Cross-session CONFLICT rank gap: two still-material terminals whose trust levels
 * differ by at least this many proximity ranks are a genuine disagreement (a trust
 * reversal) → pause, not a silent take-the-recent. DERIVED (2 ranks avoids
 * triggering on ordinary ±1 drift), tunable.
 */
const CONFLICT_RANK_GAP = 2

// ════════════════════════════════════════════════════════════════════════════
// SECTION A — mentor A1: source-confidence routing on the obligation field
// ════════════════════════════════════════════════════════════════════════════

/** The obligation-evaluation verdict vocabulary (A1's second-reader field). */
export type ObligationVerdict = 'met' | 'violated' | 'indeterminate'

/** The deterministic engine's obligation read — plus 'unevaluated' (the field was
 *  not evaluated at all; the intervention table escalates it regardless). */
export type DeterministicObligation = ObligationVerdict | 'unevaluated'

/** The corroboration finding for the obligation field (the A1 routing key). */
export type FieldCorroboration = CorroborationFindingStatus

export interface ObligationRoutingInput {
  /** The task affects a non-consenting party (a justice surface is present). */
  taskHasJusticeSurface: boolean
  /**
   * Whether the corroboration check ran for this assessment. Post-corroboration
   * (the LIVE state since 2026-07-08) ⇔ true; false models the pre-corroboration
   * regime + any path where corroboration did not run.
   */
  corroborationAvailable: boolean
  /** The corroboration finding for THIS obligation field — the routing key. Only
   *  read when corroborationAvailable. */
  fieldCorroboration?: FieldCorroboration
  /** The deterministic engine's obligation read (primary source). */
  deterministic: DeterministicObligation
  /**
   * The LLM second-reader's obligation read — INJECTED (dark). null ⇔ not
   * provided (not yet wired / call not made / it failed). The pure routing treats
   * an owed-but-absent LLM honestly (deterministic stands, flagged), never
   * fabricating a verdict.
   */
  llm?: ObligationVerdict | null
}

/** How the combined obligation verdict resolves for the intervention table (S4). */
export type ObligationResolution = 'deterministic-authoritative' | 'pause-escalate'

/** The A1 routing regime that produced the result (for transparency / claims-vs-code). */
export type ObligationRegime =
  | 'default-no-justice'
  | 'justice-pre-corroboration'
  | 'justice-post-corroboration-corroborated'
  | 'justice-post-corroboration-uncorroborated'

export interface CombinedObligationVerdict {
  /**
   * The single authoritative obligation verdict when the sources agree or there is
   * one source; `null` on CONFLICT (pause — there is no single authoritative value;
   * the conflict IS the signal, never an average of the two).
   */
  verdict: DeterministicObligation | null
  resolution: ObligationResolution
  /** True ⇔ the two sources conflict (⇒ pause-escalate, never average). */
  conflict: boolean
  /** True ⇔ the LLM was routed as a source on this field per A1. */
  llmConsulted: boolean
  /** True ⇔ the LLM was owed on this field but not provided (dark / not wired). */
  llmOwedButAbsent: boolean
  /**
   * The LLM's confidence marking when it was a source: 'low' on an uncorroborated
   * field post-corroboration (structurally weak — detecting what the text does not
   * say); 'normal' pre-corroboration; null when the LLM is not a source.
   */
  llmConfidence: 'normal' | 'low' | null
  regime: ObligationRegime
  routingBasis: string
  sources: { deterministic: DeterministicObligation; llm: ObligationVerdict | null }
}

/**
 * Route one obligation field per mentor A1. Pure. The LLM verdict is injected.
 *
 * Load-bearing invariant: on a justice surface, whenever the LLM is routed as a
 * source AND both sources are present, a DISAGREEMENT yields resolution
 * 'pause-escalate' with verdict null — the combiner NEVER averages a conflict to a
 * proceed.
 */
export function routeObligationField(
  input: ObligationRoutingInput,
): CombinedObligationVerdict {
  const det = input.deterministic
  const llm = input.llm ?? null
  const sources = { deterministic: det, llm }

  // 1. Default task (no justice surface): the deterministic engine is
  //    authoritative; no parallel LLM (A1 — running both adds latency, not
  //    fidelity). Any injected LLM verdict is NOT a source and cannot conflict.
  if (!input.taskHasJusticeSurface) {
    return {
      verdict: det,
      resolution: 'deterministic-authoritative',
      conflict: false,
      llmConsulted: false,
      llmOwedButAbsent: false,
      llmConfidence: null,
      regime: 'default-no-justice',
      routingBasis:
        'default task (no justice surface) — deterministic engine authoritative; no parallel LLM (A1)',
      sources,
    }
  }

  // 2. Justice surface. Decide whether the LLM is a source ON THIS FIELD, and its
  //    confidence marking, from the corroboration key (A1).
  let regime: ObligationRegime
  let consultLlm: boolean
  let llmConfidence: 'normal' | 'low' | null

  if (!input.corroborationAvailable) {
    // Pre-corroboration: the LLM second-reads the obligation field (normal weight).
    regime = 'justice-pre-corroboration'
    consultLlm = true
    llmConfidence = 'normal'
  } else if (input.fieldCorroboration === 'corroborated') {
    // Post-corroboration, corroborated field: the corroboration check closed the
    // catchable half; deterministic is primary and authoritative. The LLM's
    // supplementary role has narrowed AWAY from corroborated fields (A1).
    regime = 'justice-post-corroboration-corroborated'
    consultLlm = false
    llmConfidence = null
  } else {
    // Post-corroboration, uncorroborated OR contradicted field: the LLM is
    // supplementary, with EXPLICIT low-confidence marking (it detects what the
    // text does not say — structurally weak evidence). `contradicted` routes here
    // too (not-corroborated for routing; its proximity is separately floored live).
    regime = 'justice-post-corroboration-uncorroborated'
    consultLlm = true
    llmConfidence = 'low'
  }

  // 3a. The LLM is NOT a source on this field (default-justice-corroborated):
  //     deterministic stands. An injected LLM verdict is recorded in `sources` for
  //     transparency but is NOT routed (faithful to A1's narrowing).
  if (!consultLlm) {
    return {
      verdict: det,
      resolution: 'deterministic-authoritative',
      conflict: false,
      llmConsulted: false,
      llmOwedButAbsent: false,
      llmConfidence: null,
      regime,
      routingBasis: `${regime} — deterministic engine authoritative on this field; LLM not a source (A1)`,
      sources,
    }
  }

  // 3b. The LLM IS owed on this field but is absent (dark / not wired / failed).
  //     Measure mode: deterministic stands, honestly flagged owed-but-absent — no
  //     fabricated verdict, no false confidence.
  if (llm === null) {
    // llmConfidence is null: the LLM is not a source here (owed-but-absent), so
    // the field carries no confidence marking — matching its contract ("null when
    // the LLM is not a source"). `regime` + `llmOwedButAbsent` carry the context
    // (which regime owed it, and that it was absent).
    return {
      verdict: det,
      resolution: 'deterministic-authoritative',
      conflict: false,
      llmConsulted: false,
      llmOwedButAbsent: true,
      llmConfidence: null,
      regime,
      routingBasis: `${regime} — LLM second-reader owed but not provided (dark/measure); deterministic stands, flagged`,
      sources,
    }
  }

  // 3c. Both sources present. Agree (same value) → deterministic stands. Anything
  //     else (incl. deterministic 'unevaluated' vs any LLM value) → CONFLICT →
  //     pause-escalate, NEVER average.
  const agree = det === llm
  if (agree) {
    return {
      verdict: det,
      resolution: 'deterministic-authoritative',
      conflict: false,
      llmConsulted: true,
      llmOwedButAbsent: false,
      llmConfidence,
      regime,
      routingBasis: `${regime} — sources agree (${det}); deterministic verdict stands (A1)`,
      sources,
    }
  }
  return {
    verdict: null,
    resolution: 'pause-escalate',
    conflict: true,
    llmConsulted: true,
    llmOwedButAbsent: false,
    llmConfidence,
    regime,
    routingBasis: `${regime} — sources conflict (deterministic=${det}, llm=${llm}); pause + escalate, never average (A1 + spec-7)`,
    sources,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION B — mentor spec 6: combining verification results
//   within-session supersession (CI-4 reuse) + cross-session per-domain
//   weighted recency + conflict → pause
// ════════════════════════════════════════════════════════════════════════════

/** One examination verdict bearing on one virtue trust domain. */
export interface VerificationVerdict {
  /** The session / chain scope for within-session supersession. */
  sessionId: string
  /** The virtue trust domain this verdict bears on — the per-domain isolation key. */
  domain: VirtueTrustDomain
  /** The CI-4 markers (inside the signed assessment): ref / depth_tier /
   *  prior_feedback_ref. Reused verbatim. */
  markers: LoopClosureMarkers
  /** The trust level this verdict demonstrated in the domain. */
  level: KatorthomaProximity
  /** The A5 confidence of this verdict (S2). */
  confidence: ConfidenceAssessment
  /** ISO occurrence timestamp — the cross-session recency key. */
  occurredAt: string
  /** True ⇔ this examination issued a redirection (Rule-5 correction) — feeds the
   *  open-loop surface (mirrors analyseLoopClosure's redirection notion). */
  issuedRedirection?: boolean
}

/** The per-domain combined verdict across sessions (measure-mode read). */
export interface CombinedDomainVerdict {
  domain: VirtueTrustDomain
  /**
   * The authoritative trust level. Weighted recency ⇒ the most-recent surviving
   * terminal's level (never an arithmetic mean); on CONFLICT it is the CONSERVATIVE
   * minimum of the conflicting terminals. ALWAYS exactly one input terminal's level
   * — never an average.
   */
  level: KatorthomaProximity
  resolution: 'combined' | 'pause-escalate'
  /** True ⇔ a still-material older terminal disagrees with the most-recent (a trust
   *  reversal) ⇒ pause. */
  conflict: boolean
  /** True ⇔ a within-session chain left a redirection un-closed (open loop). */
  openLoop: boolean
  /** The terminals that survived within-session supersession, most-recent first. */
  terminals: VerificationVerdict[]
  basis: string
}

/** The proximity rank gap between two levels. */
function rankGap(a: KatorthomaProximity, b: KatorthomaProximity): number {
  return Math.abs(PROXIMITY_RANK[a] - PROXIMITY_RANK[b])
}

/** Depth rank of a marker's depth_tier — undefined for a missing OR unknown tier
 *  (defensive, mirroring analyseLoopClosure's `DEPTH_RANK[depth_tier]` lookup). */
function depthRankOf(m: LoopClosureMarkers): number | undefined {
  if (m.depth_tier === undefined) return undefined
  return DEPTH_RANK[m.depth_tier as LoopDepthTier] // undefined at runtime for an unknown tier
}

/**
 * Within one (session, domain) CELL, identify the set of `ref`s that are
 * SUPERSEDED. Scoping per-domain (not per-session-across-all-domains) is the
 * load-bearing isolation property: a verdict in domain D is superseded ONLY by a
 * later verdict IN THE SAME DOMAIN re-examining its ref — so a re-examination that
 * re-covers only some of an examination's domains can never erase an
 * un-re-examined domain's verdict (e.g. a phronesis re-exam cannot drop a
 * dikaiosyne justice-violation the correction never revisited). For a well-formed
 * FULL re-examination (all four domains), per-domain scoping gives the identical
 * result to examination-level supersession; it differs only on partial
 * re-examinations, where it is strictly safer.
 *
 * The same-depth rule mirrors the CI-4 gate's closed-rule EXACTLY (a battery
 * consistency test locks it to `analyseLoopClosure`): a ref R is superseded iff R
 * carries BOTH a ref and a valid depth, AND a later verdict (by occurredAt) carries
 * prior_feedback_ref === R at a DEFINED depth rank ≥ R's. A redirection with no id
 * or no verifiable depth is INDETERMINATE — NOT superseded (closure that cannot be
 * verified is not closure; the conservative direction — evidence is kept). Reuses
 * the marker semantics; does not re-implement the closure verdict (that is
 * `analyseLoopClosure`, called per cell for the open-loop surface). Pure.
 */
function supersededRefs(cellVerdicts: VerificationVerdict[]): Set<string> {
  const ordered = [...cellVerdicts].sort(
    (a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt),
  )
  const superseded = new Set<string>()
  for (let i = 0; i < ordered.length; i++) {
    const ref = ordered[i].markers.ref
    const ownDepthRank = depthRankOf(ordered[i].markers)
    if (ref === undefined || ownDepthRank === undefined) continue // indeterminate — not superseded
    for (let j = i + 1; j < ordered.length; j++) {
      const later = ordered[j].markers
      if (later.prior_feedback_ref !== ref) continue
      const laterRank = depthRankOf(later)
      if (laterRank !== undefined && laterRank >= ownDepthRank) {
        superseded.add(ref)
        break
      }
    }
  }
  return superseded
}

/** Shape one (session, domain) cell's verdicts into the element array
 *  `analyseLoopClosure` reads (dedup by ref; within a single-domain cell each ref
 *  is one examination ⇒ one closure element, so the redirection/no-redirection
 *  classification is unambiguous). */
function cellClosureElements(cellVerdicts: VerificationVerdict[]): unknown[] {
  const byRef = new Map<string, VerificationVerdict>()
  const anon: VerificationVerdict[] = []
  for (const v of cellVerdicts) {
    const ref = v.markers.ref
    if (ref === undefined) anon.push(v)
    else if (!byRef.has(ref)) byRef.set(ref, v)
  }
  const uniq = [...byRef.values(), ...anon].sort(
    (a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt),
  )
  return uniq.map((v) => ({
    assessment: {
      improvement_path_structured: v.issuedRedirection ? { redirection: true } : null,
      examination: {
        ...(v.markers.ref !== undefined && { ref: v.markers.ref }),
        ...(v.markers.depth_tier !== undefined && { depth_tier: v.markers.depth_tier }),
        ...(v.markers.prior_feedback_ref !== undefined && {
          prior_feedback_ref: v.markers.prior_feedback_ref,
        }),
      },
    },
  }))
}

/** The per-(session, domain) isolation key. NUL-joined (NUL cannot appear in an
 *  agent-supplied sessionId/domain literal), so no session/domain pair collides. */
function cellKey(sessionId: string, domain: VirtueTrustDomain): string {
  return `${sessionId}\u0000${domain}`
}

/**
 * Combine verification verdicts into one result per domain (mentor spec 6). Pure.
 *   1. Within-session supersession + closure, scoped per (session, DOMAIN): collapse
 *      each cell's chain to its un-superseded terminal(s) and record whether the
 *      cell's loop is open — per-domain, so NOTHING bleeds across domains (neither a
 *      supersession nor an open-loop flag). CI-4 semantics reused per cell.
 *   2. Per-domain grouping of the survivors (the isolation key — a verdict never
 *      leaves its domain).
 *   3. Cross-session weighted recency: the most-recent terminal is authoritative;
 *      a still-material older terminal that DISAGREES by ≥ CONFLICT_RANK_GAP ranks
 *      is a conflict ⇒ pause, conservative-min level. NEVER an average.
 */
export function combineVerificationResults(
  verdicts: VerificationVerdict[],
): CombinedDomainVerdict[] {
  if (verdicts.length === 0) return []

  // --- 1. within-session supersession + open-loop, scoped per (session, DOMAIN).
  const byCell = new Map<string, VerificationVerdict[]>()
  for (const v of verdicts) {
    const k = cellKey(v.sessionId, v.domain)
    const arr = byCell.get(k)
    if (arr) arr.push(v)
    else byCell.set(k, [v])
  }
  const survivors: VerificationVerdict[] = []
  /** cellKey(sessionId, domain) → was THIS domain's chain in THIS session left
   *  unclosed (a redirection with no qualifying same-depth re-examination — genuine
   *  analyseLoopClosure reuse, per domain so it cannot bleed across domains). */
  const cellUnclosed = new Map<string, boolean>()
  for (const [k, cellVerdicts] of byCell) {
    const dropped = supersededRefs(cellVerdicts)
    for (const v of cellVerdicts) {
      if (v.markers.ref !== undefined && dropped.has(v.markers.ref)) continue
      survivors.push(v)
    }
    const closure: LoopClosureAnalysis = analyseLoopClosure(cellClosureElements(cellVerdicts))
    cellUnclosed.set(k, closure.verdict === 'unclosed')
  }

  // --- 2. per-domain grouping (the isolation boundary — structural).
  const byDomain = new Map<VirtueTrustDomain, VerificationVerdict[]>()
  for (const v of survivors) {
    const arr = byDomain.get(v.domain)
    if (arr) arr.push(v)
    else byDomain.set(v.domain, [v])
  }

  // --- 3. cross-session weighted recency + conflict per domain.
  const out: CombinedDomainVerdict[] = []
  for (const [domain, terminals] of byDomain) {
    const ordered = [...terminals].sort(
      (a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt), // most-recent first
    )
    const mostRecent = ordered[0]
    const mostRecentMs = Date.parse(mostRecent.occurredAt)

    // Relative recency weight of each terminal (most-recent = confidence × 1).
    const recencyWeight = (v: VerificationVerdict): number => {
      const gapMonths = Math.max(0, (mostRecentMs - Date.parse(v.occurredAt)) / MONTH_MS)
      const recencyFactor = Math.pow(0.5, gapMonths / RECENCY_HALF_LIFE_MONTHS)
      return v.confidence.weight * recencyFactor
    }

    // Conflict: a still-material older terminal disagreeing by ≥ CONFLICT_RANK_GAP.
    let conflict = false
    let conservativeLevel = mostRecent.level
    for (let i = 1; i < ordered.length; i++) {
      const t = ordered[i]
      if (
        recencyWeight(t) >= CONFLICT_MATERIAL_WEIGHT_FLOOR &&
        rankGap(t.level, mostRecent.level) >= CONFLICT_RANK_GAP
      ) {
        conflict = true
        if (PROXIMITY_RANK[t.level] < PROXIMITY_RANK[conservativeLevel]) {
          conservativeLevel = t.level
        }
      }
    }

    // openLoop reflects ONLY this domain's own chains (per-cell) — no cross-domain
    // bleed: a redirection left open in another domain of the same session cannot
    // set this domain's openLoop.
    const openLoop = terminals.some((t) => cellUnclosed.get(cellKey(t.sessionId, t.domain)) === true)
    const level = conflict ? conservativeLevel : mostRecent.level
    out.push({
      domain,
      level,
      resolution: conflict ? 'pause-escalate' : 'combined',
      conflict,
      openLoop,
      terminals: ordered,
      basis: conflict
        ? `cross-session conflict on ${domain}: a still-material older terminal disagrees by ≥${CONFLICT_RANK_GAP} ranks with the most-recent — pause + escalate, never average (spec 6)`
        : `weighted recency on ${domain}: most-recent of ${ordered.length} terminal(s) authoritative (${mostRecent.level})`,
    })
  }

  // Stable, deterministic domain order.
  out.sort((a, b) => a.domain.localeCompare(b.domain))
  return out
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION C — mentor spec 6: the cross-domain AGGREGATION rule
//   an EXTENSION layered on S1's computeAggregate (S1 stays byte-identical)
// ════════════════════════════════════════════════════════════════════════════

/** One domain's trust source for the weighted aggregate (a task's required domain). */
export interface DomainTrustSource {
  domain: VirtueTrustDomain
  /** True ⇔ the task requires this domain (task weight > 0). When ANY source is
   *  flagged required, the aggregate is taken over the required domains only. */
  required: boolean
  /** The domain's effective trust level from contributing evidence (S1 / combiner). */
  effectiveLevel: KatorthomaProximity
  /** The domain's profile prior — the A2 fallback level when the evidence is zeroed. */
  profilePrior: KatorthomaProximity
  /** The S2 weighted-evidence for the domain's best source (weight 0 ⇔ A2 zero-floor). */
  evidence: WeightedEvidence
  /** Coverage status (continuous / suspended …) — surfaced for transparency. */
  coverageStatus?: CoverageStatus | null
  /** True ⇔ the domain's effective level is justice-capped (S1). */
  justiceCapped?: boolean
  /** True ⇔ a cross-session conflict on this domain (from combineVerificationResults). */
  conflict?: boolean
}

/** The weighted aggregate trust verdict (spec-6 aggregation rule). */
export interface WeightedAggregateTrust {
  /** The categorical minimum trust LEVEL across the (required) domains, each at its
   *  contributing-or-A2-fallback level; null when there are no domains. Never a
   *  continuous score, never an average (R6c). */
  level: KatorthomaProximity | null
  limitingDomain: VirtueTrustDomain | null
  /** 'pause-escalate' ⇔ any contributing domain conflicts; else 'combined'. */
  resolution: 'combined' | 'pause-escalate'
  anyConflict: boolean
  anyJusticeCapped: boolean
  /**
   * Required domains whose ONLY evidence was zeroed by the A2 floor — fell back to
   * the profile prior, surfaced as coverage gaps. A gap forces the aggregate
   * confidence to 0 (no confident proceed on a domain the task needs but the
   * credential does not cover — mentor A2 at the aggregate).
   */
  coverageGaps: VirtueTrustDomain[]
  /**
   * The aggregate confidence weight = the MINIMUM S2 evidence weight across the
   * (required) domains (the weakest link; a zeroed/gap domain contributes 0). A
   * DERIVED scalar; the LEVEL is the canonical categorical output.
   */
  aggregateConfidenceWeight: number
  basis: string
}

/**
 * The spec-6 cross-domain aggregate. Pure. Layered ON TOP of S1's
 * `computeAggregate` (reused for the categorical minimum-domain core) — S1 is
 * byte-identical.
 *
 * The S2→S3 A2 handoff (load-bearing): a source whose evidence is zeroed
 * (contributes === false) is a coverage gap on a required domain — its LEVEL falls
 * back to min(effectiveLevel, profilePrior) (NEVER the credential's uplift), and it
 * drives aggregateConfidenceWeight to 0. So a zeroed credential can never lift the
 * aggregate to a confident proceed on a task requiring that domain.
 *
 * Monotone: lowering any domain's effective level lowers-or-holds the aggregate
 * level; lowering any domain's evidence weight lowers-or-holds the aggregate
 * confidence; zeroing a required credential lowers-or-holds the level AND zeroes
 * the confidence.
 */
export function computeWeightedAggregate(
  sources: DomainTrustSource[],
): WeightedAggregateTrust {
  if (sources.length === 0) {
    return {
      level: null,
      limitingDomain: null,
      resolution: 'combined',
      anyConflict: false,
      anyJusticeCapped: false,
      coverageGaps: [],
      aggregateConfidenceWeight: 0,
      basis: 'no domain sources',
    }
  }

  // If any source is flagged required, the aggregate is taken over the required
  // domains only (a task's trust is limited by the weakest domain IT needs). Else
  // over all sources (the S1 fallback: min over evaluated domains).
  const anyRequired = sources.some((s) => s.required)
  const scoped = anyRequired ? sources.filter((s) => s.required) : sources

  if (scoped.length === 0) {
    return {
      level: null,
      limitingDomain: null,
      resolution: 'combined',
      anyConflict: false,
      anyJusticeCapped: false,
      coverageGaps: [],
      aggregateConfidenceWeight: 0,
      basis: 'no required domain sources',
    }
  }

  const coverageGaps: VirtueTrustDomain[] = []
  // Build synthetic EffectiveDomainTrust for the S1 minimum-domain core, using the
  // contributing-or-fallback level per the A2 handoff.
  const synthetic: EffectiveDomainTrust[] = scoped.map((s) => {
    const contributes = s.evidence.contributes
    if (!contributes) coverageGaps.push(s.domain)
    // A2 fallback: a zeroed credential contributes AT MOST min(effective, prior) —
    // the credential's uplift is removed; any negative evidence (violation) stands.
    const contributingLevel: KatorthomaProximity = contributes
      ? s.effectiveLevel
      : rankToProximity(Math.min(PROXIMITY_RANK[s.effectiveLevel], PROXIMITY_RANK[s.profilePrior]))
    return {
      virtueDomain: s.domain,
      effectiveLevel: contributingLevel,
      earnedLevel: contributingLevel,
      profilePrior: s.profilePrior,
      decayStepsApplied: 0,
      justiceCapped: s.justiceCapped === true,
      reflectModulated: false,
      coverageStatus: s.coverageStatus ?? null,
      hasEvidence: true,
    }
  })

  const core: AggregateTrust = computeAggregate(synthetic)

  // Aggregate confidence = the weakest link's S2 weight (a gap contributes 0).
  let aggregateConfidenceWeight = Infinity
  for (const s of scoped) {
    const w = s.evidence.contributes ? s.evidence.weight : 0
    if (w < aggregateConfidenceWeight) aggregateConfidenceWeight = w
  }
  if (!Number.isFinite(aggregateConfidenceWeight)) aggregateConfidenceWeight = 0

  const anyConflict = scoped.some((s) => s.conflict === true)

  return {
    level: core.level,
    limitingDomain: core.limitingDomain,
    resolution: anyConflict ? 'pause-escalate' : 'combined',
    anyConflict,
    anyJusticeCapped: core.anyJusticeCapped,
    coverageGaps,
    aggregateConfidenceWeight,
    basis:
      `${core.basis}; weighted by source confidence (min weight ${aggregateConfidenceWeight.toFixed(3)})` +
      (coverageGaps.length ? `; coverage gap(s): ${coverageGaps.join(', ')} (A2 zeroed → profile-prior fallback)` : '') +
      (anyConflict ? '; conflict ⇒ pause-escalate, never average (spec 6)' : ''),
  }
}
