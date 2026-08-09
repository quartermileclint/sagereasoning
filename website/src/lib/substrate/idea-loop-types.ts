/**
 * idea-loop-types.ts — the IDEA loop's approved gap/candidate shapes + the C2(iii)
 * structural-novelty check (agent-circles C2, 2026-08-08).
 *
 * CONSUMED ONLY BY THE DARK `fresh` ROUTE (updated 2026-08-09 — the earlier
 * "DARK / UNCONSUMED" claim is superseded): `/api/practice/fresh` (dark behind
 * SUBSTRATE_FRESH_ENABLED, UNSET everywhere) wraps assessStructuralNovelty per
 * the RULED endpoint scope. No live engine, harness, or measured path imports
 * this module (pinned in the battery); the generation step remains separately
 * queued and is NOT built here.
 *
 * BINDING SOURCES (verbatim wins):
 *   - `operations/agent-circles-2026-08/2026-08-06-oikeiosis-gap-generated-candidate-type-scope.md`
 *     (APPROVED 2026-08-06 with one ruling + two clarifications + the same-day
 *     cycleOutcome amendment) — the two type shapes below are transcribed from
 *     it, not re-designed.
 *   - `operations/agent-circles-2026-08/2026-08-06-c2-orientation-reading-and-c1c-trust-event-scope.md`
 *     §3 (C2(iii): structural novelty, reusing trajectory-delta's exact
 *     EVIDENCE_FLOOR; the new `noveltyConfidence` field distinct from both
 *     `generationConfidence` and `passedNoveltyCheck`).
 */

import type { KatorthomaProximity, VirtueDomain } from '@/lib/translation-sandwich/layer2-mechanisms'
import type { AssessmentHistoryInput } from './agent-assessment-history-store'
import { EVIDENCE_FLOOR } from './trajectory-delta'

// ============================================================================
// OikeiosisGap — the loop's direction input (approved scope §1)
// ============================================================================

/** The five-circle oikeiosis ordering, LOCAL to the IDEA loop's gap/candidate
 *  types. Deliberately NOT a widening of the existing OikeiosisCircle
 *  (profiles.ts) — that type is free-form and used across the live trust core;
 *  this is a closed, ordered enumeration scoped to the generation step's own
 *  "current+1" rule. */
export type OikeiosisCircleRank = 1 | 2 | 3 | 4 | 5

export interface OikeiosisGap {
  schema: 'idea-loop-oikeiosis-gap-v1'
  /** The oikeiosis circle the agent is currently operating within. */
  currentCircle: OikeiosisCircleRank
  /** The circle the loop is oriented toward for this cycle. ALWAYS
   *  currentCircle + 1 — never a jump. Enforced at construction (use
   *  createOikeiosisGap below), not just documented (approved scope §3). */
  targetCircle: OikeiosisCircleRank
  /** Plain-language description of what serving targetCircle would mean in the
   *  context of the current project goal. Free text, not a computed field —
   *  this is the human-authored (or mentor-authored) framing the generation
   *  step reads, not something the type itself derives. The C2(ii)
   *  generativePrompt (orientation-reading.ts) is per-examination RAW MATERIAL
   *  a runner/human synthesises INTO this field — never a substitute for that
   *  authorship (the mentor-confirmed §2.2 resolution). */
  targetCircleMeaning: string
}

/** The "current + 1, never a jump" rule, enforced at construction — the rule
 *  lives ONCE, here, and a GeneratedCandidate.targetCircle inherits its gap's
 *  value by construction (approved scope §3: never re-implemented on the
 *  candidate). Throws on a jump. */
export function createOikeiosisGap(
  currentCircle: OikeiosisCircleRank,
  targetCircleMeaning: string,
): OikeiosisGap {
  if (currentCircle >= 5) {
    throw new Error(
      'createOikeiosisGap: currentCircle 5 has no next circle — the fifth circle is the telos, never a target parties can be extracted for.',
    )
  }
  return {
    schema: 'idea-loop-oikeiosis-gap-v1',
    currentCircle,
    targetCircle: (currentCircle + 1) as OikeiosisCircleRank,
    targetCircleMeaning,
  }
}

// ============================================================================
// GeneratedCandidate — a not-yet-taken action (approved scope §2)
// ============================================================================

export type GenerationHeuristic =
  | 'analogous_transfer'
  | 'combinatorial_generation'
  | 'synthesis_over_novelty'
  | 'context_transfer'
  | 'fifth_circle_weighting'
  | 'anomaly_detection'
  | 'friction_detection'

export interface GeneratedCandidate {
  schema: 'idea-loop-generated-candidate-v1'
  /** Links back to the gap this candidate was generated to address. SETTLED
   *  format (mentor ruling 2026-08-06):
   *  `{sessionId}:{cycleNumber}:{currentCircle}->{targetCircle}`
   *  e.g. `sess_9f2a:14:3->4`. Cycle-local, self-describing, no gap registry. */
  gapRef: string
  /** Which of the seven generation heuristics produced this candidate. */
  heuristic: GenerationHeuristic
  /** The proposed action, in plain language. Not yet taken, not yet examined. */
  proposedAction: string
  /** The circle this candidate is oriented toward (mirrors
   *  OikeiosisGap.targetCircle for the six virtue-domain-tagged heuristics).
   *  ABSENT for a friction_detection candidate. */
  targetCircle?: OikeiosisCircleRank
  /** Six of seven heuristics tag by virtue domain; friction_detection tags by
   *  preferred-indifferent status instead (a discriminated union so a friction
   *  candidate cannot be forced into the virtue-domain shape). */
  initialClassification:
    | { kind: 'virtue_domain'; domains: VirtueDomain[] }
    | { kind: 'preferred_indifferent' }
  /** 0.0–1.0, two decimal places (mentor-settled): a generation-time relevance
   *  signal only — NOT a probability, NOT a prediction of the examination
   *  outcome; ORTHOGONAL to guardrailResult/passedNoveltyCheck. */
  generationConfidence: number
  /** Guardrail-shaped examination result — populated for ALL candidates during
   *  the filtering pass (proximity + virtue-domain assessment, no Layer-3
   *  prose). Absent before filtering runs. */
  guardrailResult?: {
    proximity: KatorthomaProximity
    virtueDomainsEngaged: VirtueDomain[]
  }
  /** Full-examination prose — ONLY for the eventual cycle winner. */
  fullExaminationProse?: string
  /** Whether this candidate passed the novelty-detection check (populated after
   *  guardrailResult, before fullExaminationProse). Absent = not yet checked. */
  passedNoveltyCheck?: boolean
  /** ADDED per the C2 scope's C2(iii). Distinct from generationConfidence (a
   *  generation-time relevance signal) and distinct from passedNoveltyCheck
   *  (the boolean verdict) — the novelty check's OWN confidence in that
   *  boolean, per the structural-novelty method's inherent imprecision (the
   *  honest limitation: two structurally identical but substantively different
   *  actions won't be distinguished). */
  noveltyConfidence?: number
  /** The cycle's disposition of this candidate — a first-class, named outcome
   *  (mentor clarification two + the config/shared-task-list amendment).
   *  'terminated_by_timeout' ADDED 2026-08-09 (the Q6 seventh value, ruled in
   *  the autonomous-loop brief §8 Q6 and carried as the named follow-up for the
   *  first code session touching this module — elected at the `fresh` build's
   *  open, per the build prompt's explicit-decision pre-condition). */
  cycleOutcome:
    | 'pending'
    | 'rejected_by_guardrail'
    | 'rejected_by_novelty'
    | 'winner'
    | 'null_cycle'
    | 'dependency_unavailable'
    | 'terminated_by_timeout'
  /** Present only when cycleOutcome === 'dependency_unavailable' — names which
   *  dependency was unreachable. */
  unavailableDependency?: string
}

// ============================================================================
// C2(iii) — structural novelty detection (C2 scope §3)
// ============================================================================

/** The canonical circle-identifier → IDEA-loop rank mapping (meaning-based,
 *  per the build plan §C3's rule — never positional): the mentor's circle 3
 *  spans the local_community/political_community band; circle 5 (the rational
 *  order) has NO extractable identifier, ever. Mirrors
 *  orientation-reading.ts's own mapping (kept local to each dark module —
 *  neither imports the other). */
const HISTORY_CIRCLE_RANK: Record<string, OikeiosisCircleRank> = {
  self_preservation: 1,
  household: 2,
  local_community: 3,
  political_community: 3,
  cosmopolis: 4,
}

/** The windowed history row shape the novelty check reads — the same
 *  agent_assessment_history projection trajectory-delta windows over. Only the
 *  two structural axes are consumed: the row's primary circle
 *  (oikeiosis_stage — the FIRST relevant circle's canonical name, per the
 *  sage-assent-bridge projection) and its engaged virtue domains. */
export type NoveltyHistoryRow = Pick<
  AssessmentHistoryInput['action'],
  'oikeiosis_stage' | 'virtue_domains_engaged'
>

/**
 * C2(iii) — assess a GeneratedCandidate's STRUCTURAL novelty against the
 * session window's (circle, virtue-domain-combination) distribution.
 *
 * Reuses (per the ruling, exactly — never re-derived):
 *   - `EVIDENCE_FLOOR` (= 3) from trajectory-delta.ts — the same 3-occurrence
 *     evidence floor;
 *   - the `agent_assessment_history` window trajectory-delta already reads (the
 *     caller supplies the windowed rows; the session-window bound is a
 *     build-time parameter of the CALLER, named-not-fixed by the scope §3).
 *
 * novel = fewer than EVIDENCE_FLOOR matching rows. `confidence` is the check's
 * own confidence in that boolean — a monotone distance-from-the-floor curve
 * (|count − floor| / floor, clamped to [0,1], two decimals; the exact curve is
 * a build-time detail the ruling leaves open — the QUERY shape and the floor
 * value are what it fixes).
 *
 * HONEST LIMITATION (documented at build time per the ruling, not discovered
 * later): structural novelty cannot distinguish two structurally identical but
 * substantively different actions (same circle, same domains, genuinely
 * different content). Content novelty (embeddings / LLM-as-judge) is a named
 * future upgrade, not required here. A candidate with NEITHER structural axis
 * (a friction_detection candidate: no targetCircle, preferred_indifferent
 * classification) cannot be structurally assessed at all — the check returns
 * { novel: true, confidence: 0 }: nothing in the window can match it, and the
 * zero confidence says the check has no basis, rather than manufacturing one.
 *
 * DATED AMENDMENT 2026-08-09 (the `fresh` endpoint scope's Q-C ruling — inside
 * the confidence-curve latitude the C2-widening ruling left open; the query
 * shape and EVIDENCE_FLOOR are untouched): a STARVED WINDOW no longer reads as
 * a confident result. When the window itself carries fewer than EVIDENCE_FLOOR
 * rows IN TOTAL, the check returns { novel: true, confidence: 0, basis:
 * 'insufficient_history' } — mirroring the friction-candidate treatment (a
 * true verdict, zero claimed confidence, the no-basis condition named). Per
 * the ruling's own wiring detail, THIS CHECK READS TOTAL WINDOW SIZE
 * (historyWindow.length), NOT the matching-row count computed below — a
 * populated window with no matching rows is the genuinely-novel case (novel at
 * curve confidence), not the starved-window case. `basis` is present ONLY on
 * the starved-window outcome; the friction-candidate outcome is surfaced
 * unchanged (ruled: "the existing behaviour ... surfaced unchanged").
 */
export function assessStructuralNovelty(
  candidate: Pick<GeneratedCandidate, 'targetCircle' | 'initialClassification'>,
  historyWindow: readonly NoveltyHistoryRow[],
): { novel: boolean; confidence: number; basis?: 'insufficient_history' } {
  const wantCircle = candidate.targetCircle
  const wantDomains =
    candidate.initialClassification.kind === 'virtue_domain'
      ? [...candidate.initialClassification.domains].sort().join('|')
      : null

  if (wantCircle === undefined && wantDomains === null) {
    return { novel: true, confidence: 0 }
  }

  // Q-C (ruled 2026-08-09): the starved-window honest outcome — TOTAL window
  // size below the floor ⇒ the check has no evidential basis; never a
  // confident verdict derived from absence of evidence.
  if (historyWindow.length < EVIDENCE_FLOOR) {
    return { novel: true, confidence: 0, basis: 'insufficient_history' }
  }

  let count = 0
  for (const row of historyWindow) {
    if (wantCircle !== undefined) {
      const rowRank =
        row.oikeiosis_stage != null ? HISTORY_CIRCLE_RANK[row.oikeiosis_stage] : undefined
      if (rowRank !== wantCircle) continue
    }
    if (wantDomains !== null) {
      const rowDomains = [...row.virtue_domains_engaged].sort().join('|')
      if (rowDomains !== wantDomains) continue
    }
    count++
  }

  const novel = count < EVIDENCE_FLOOR
  const confidence =
    Math.round(Math.min(1, Math.abs(count - EVIDENCE_FLOOR) / EVIDENCE_FLOOR) * 100) / 100
  return { novel, confidence }
}
