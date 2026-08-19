/**
 * idea-loop-types.ts — the IDEA loop's approved gap/candidate shapes + the C2(iii)
 * structural-novelty check (agent-circles C2, 2026-08-08).
 *
 * CONSUMED BY THE `fresh` ROUTE, WHICH IS LIVE IN PRODUCTION (corrected
 * 2026-08-19 — this header previously read "the DARK `fresh` ROUTE … dark
 * behind SUBSTRATE_FRESH_ENABLED, UNSET everywhere", which has been false
 * since 2026-08-10: SUBSTRATE_FRESH_ENABLED was activated and live-verified in
 * production at D-RUNNER-SCOPING-SESSION-COMPLETE-2026-08-10. The code is
 * still flag-gated — unset ⇒ honest 503 — but the flag is SET in production,
 * so edits to this module reach a live surface and are owed PR19 care).
 * `/api/practice/fresh` wraps assessStructuralNovelty per the RULED endpoint
 * scope. No live engine, harness, or MEASURED path imports this module (pinned
 * in the battery — /api/reason and the guard channel stay clean); the
 * generation step remains separately queued and is NOT built here.
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
 *
 * PLACEHOLDER NOTE (added 2026-08-19, curiosity/taxonomy scoping session —
 * a COMMENT ONLY; this function's behaviour is deliberately unchanged):
 * the standard applied here — structural novelty against the existing corpus,
 * i.e. the (circle, virtue-domain-combination) distribution of the window — is
 * a PLACEHOLDER FOR A RICHER STANDARD. Once the puzzle taxonomy
 * (PuzzleTaxonomyEntry, below) is populated, novelty can be assessed against
 * the SHAPES OF INQUIRY already recorded, not only against the structural
 * signature of past actions. That is a different and better question than the
 * one this function asks. Nothing schedules it: the taxonomy is a stub with no
 * population path, and the richer standard is not designed. The note exists so
 * the current standard is read as provisional-by-design rather than settled.
 * The already-documented structural-novelty-only limitation above is the same
 * boundary seen from the other side.
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

// ============================================================================
// Puzzle taxonomy — STUB (curiosity/taxonomy scoping session, 2026-08-19)
// ============================================================================

/**
 * PuzzleTaxonomyEntry — the puzzle taxonomy's stub data structure.
 *
 * A NAMED, ADDRESSABLE TYPE ONLY. No schema, no route, no population, no
 * persistence: nothing in this build constructs, writes, reads, or stores one.
 * The type exists so the taxonomy has a settled shape before anything fills it.
 *
 * BINDING SOURCES (verbatim wins over this paraphrase):
 *   - `operations/handoffs/founder/2026-08-18-curiosity-taxonomy-stubs-NEXT-SESSION-PROMPT.md`
 *     item 1 — the four members below, scoped exactly and deliberately no wider.
 *   - `operations/agent-circles-2026-08/2026-08-18-addendum-reinforcement-learning-assessment-verbatim.md`
 *     — the two design-grounding paragraphs that follow, quoted verbatim.
 *
 * ─── WHY SHAPES OF INQUIRY, NOT CONCLUSIONS ─────────────────────────────────
 * From the RL-passage addendum, verbatim: "storing the chain of reasoning
 * rather than the answer is what makes tuning meaningful is the computational
 * grounding for the puzzle taxonomy's design principle. The taxonomy stores
 * the shapes of inquiry, not conclusions."
 *
 * That is WHY this entry carries `questionsOpened` and `taxonomyConnections`
 * and deliberately carries NO findings, answers, conclusions, or resolution
 * field. A future session adding one is departing from the design principle,
 * not extending it — and should say so out loud rather than let the field
 * arrive quietly.
 *
 * ─── THE NON-DUPLICATION BOUNDARY — what the taxonomy is NOT for ────────────
 * From the same addendum, verbatim: "the taxonomy's value is not duplicated by
 * what frontier labs are building — because the taxonomy stores examination
 * chains about the internal world of reasoning, not the external world of
 * facts."
 *
 * This is the load-bearing half, and the cheapest available guard against the
 * taxonomy drifting into a general knowledge store. An entry that records a
 * fact about the world — rather than the shape of an examination — is outside
 * this type's purpose, however useful the fact.
 *
 * The addendum licenses no build of its own (its own closing sentence:
 * "Nothing in this addendum licenses a build, a route, a flag, a credential,
 * or a schema"). It is recorded here as design grounding for a stub that was
 * already in scope, adding no field, route, behaviour, or schema.
 */
export type PuzzleType = 'pattern' | 'contradiction' | 'discovery' | 'connection'

export interface PuzzleTaxonomyEntry {
  schema: 'idea-loop-puzzle-taxonomy-entry-v1'
  /** Which shape of inquiry this puzzle is. The four scoped values, not widened. */
  puzzleType: PuzzleType
  /** Where the puzzle came from — an examination record, or outside the loop.
   *  A discriminated union (the house shape, mirroring
   *  GeneratedCandidate.initialClassification) so an external-origin puzzle
   *  structurally cannot be given a false examination-record ref. */
  origin: { kind: 'examination_record'; ref: string } | { kind: 'external'; description: string }
  /** The questions this puzzle OPENED — never the answers it closed (the
   *  shapes-of-inquiry principle above). EMPTY AT STUB: nothing populates it.
   *  Free text; no vocabulary is fixed here. */
  questionsOpened: readonly string[]
  /** References to other taxonomy entries this one connects to. EMPTY AT STUB.
   *  NO IDENTIFIER SCHEME IS FIXED HERE — deliberately. Inventing one before
   *  population is designed would settle by default a question that has not
   *  been asked; the ref format is decided when the taxonomy is populated. */
  taxonomyConnections: readonly string[]
}

// ============================================================================
// Curiosity-loop trigger — STUB. Placement RULED 2026-08-18 (Q5).
// ============================================================================

/**
 * The `taxonomy_question` outcome — CODE-ONLY, AND DELIBERATELY NOT WRITABLE.
 *
 * RULED 2026-08-18 (Q1), verbatim: "Defer the schema migration until the
 * standing-runner design opens. At that point the outcome value should be
 * added with the standing-runner's rationale — not the bounded-run rationale —
 * and the spelling should follow the established snake_case convention:
 * `taxonomy_question`, not `taxonomy-question`. The stub in the current build
 * should be code-only, logging the outcome without writing to the constrained
 * column, until the migration is ruled and walked."
 *
 * WHAT THAT MEANS MECHANICALLY, AND WHY IT MATTERS. `idea_loop_cycles
 * .cycle_outcome` carries a live NOT NULL CHECK admitting exactly four values
 * (`winner`, `null_cycle`, `dependency_unavailable`, `terminated_by_timeout`)
 * on a production table holding real bounded-validation-run rows. This
 * constant is therefore NOT a member of the watching route's
 * CYCLE_LEVEL_OUTCOMES and must not become one until the widened CHECK has
 * landed on TEST and production. Adding it code-first would let the route
 * accept a value the database rejects — a 500 on write rather than a clean
 * 400, the exact ordering hazard the `not_selected` precedent migration
 * (2026-08-10) names in its own ORDER note. `idea-loop-types.test.ts` §7 pins
 * this containment in both directions, executably.
 *
 * THE INTENT THE RULING RETAINS: when the puzzle taxonomy yields a question
 * and no current bringer exists, that outcome must be distinguishable from a
 * null cycle. Its home is the standing-runner design, not this build.
 */
export const TAXONOMY_QUESTION_OUTCOME = 'taxonomy_question' as const

/** The exact result shape `assessStructuralNovelty` returns. Derived, never
 *  restated — a hand-copied twin would drift the moment that function changes. */
export type StructuralNoveltyResult = ReturnType<typeof assessStructuralNovelty>

/**
 * Is this a GENUINE structural-novelty confirmation, as opposed to an honest
 * no-basis pass?
 *
 * THIS IS A BUILD-TIME JUDGEMENT, NOT A RULING — disclosed as such. Neither the
 * relay nor the Q5 ruling addresses it, and it is the one real design decision
 * in the trigger stub, so it is stated rather than buried.
 *
 * `assessStructuralNovelty` returns `novel: true` on THREE distinct grounds,
 * only one of which is evidence of novelty:
 *   1. genuinely novel — fewer than EVIDENCE_FLOOR matching rows in a
 *      populated window (confidence > 0);
 *   2. starved window — fewer than EVIDENCE_FLOOR rows IN TOTAL
 *      (confidence 0, basis 'insufficient_history');
 *   3. friction candidate — neither structural axis to assess at all
 *      (confidence 0, no basis).
 *
 * Cases 2 and 3 are the house evidence-floor discipline working exactly as
 * intended: a true verdict carrying zero claimed confidence, because the check
 * has no basis. A curiosity trigger that fired on them would be manufacturing
 * curiosity out of absence of evidence — precisely what
 * `assessStructuralNovelty`'s own docstring refuses ("the zero confidence says
 * the check has no basis, rather than manufacturing one"). At population time
 * that would seed the taxonomy from starved windows and axis-free candidates.
 * So the trigger fires on case 1 only.
 *
 * The `basis === undefined` clause is DEFENCE IN DEPTH, and is redundant today:
 * the confidence curve makes every genuinely-novel result carry confidence > 0
 * (count < floor ⇒ |count − floor| / floor ≥ 1/3). It is kept so that a future
 * change to the confidence curve — which the C2 ruling explicitly leaves open
 * as a build-time detail — cannot silently make a no-basis pass read as
 * genuine.
 */
export function isGenuineNoveltyConfirmation(result: StructuralNoveltyResult): boolean {
  return result.novel === true && result.confidence > 0 && result.basis === undefined
}

/**
 * curiosity-trigger — the stub seam at the point structural novelty is
 * confirmed. LOGS THAT IT WAS REACHED, PASSES THROUGH, NOTHING ELSE.
 *
 * `curiosity-trigger` is an INTERNAL MECHANISM NAME, not a surface name: it
 * appears in no route, no response body, no public contract, and no wire
 * vocabulary. Nothing here is a surface-name-register entry.
 *
 * PLACEMENT — RULED 2026-08-18 (Q5), verbatim: "The trigger belongs
 * server-side, beside the taxonomy stub, for now… Placing the trigger
 * runner-side would defer it behind the standing-runner opening with no gain —
 * the trigger's function at stub stage is to log that it was reached and pass
 * through, which is equally achievable server-side."
 *
 * CARRY FORWARD, DO NOT LOSE — the same ruling: "When the standing-runner
 * design opens, the question of whether the trigger migrates runner-side or
 * remains server-side should be revisited explicitly. The honest answer at
 * that point may be that the trigger belongs in both places — server-side as a
 * seam that confirms novelty, runner-side as the mechanism that acts on the
 * confirmation."
 *
 * ─── WHAT THIS WILL DO, WHEN IT IS BUILT (comment, not behaviour) ───────────
 * Classify the confirmed novelty by puzzle type (PuzzleType above); consult
 * the taxonomy for related puzzle shapes; and GENERATE QUESTIONS RATHER THAN
 * EXPLANATIONS. That last clause is the point of the mechanism, not a stylistic
 * preference — it is the shapes-of-inquiry principle applied at the moment a
 * puzzle is recognised.
 *
 * ─── WHAT IT DOES NOT DO, AND MUST NOT ──────────────────────────────────────
 * - It is a PURE PASS-THROUGH: it returns its argument by identity, unexamined
 *   and unmodified. It cannot change a novelty verdict, a confidence, a basis,
 *   or any response the caller receives.
 * - It writes nothing: no DB, no trust event, no `cycle_outcome` (see
 *   TAXONOMY_QUESTION_OUTCOME above — that column's CHECK would reject it).
 * - It reads no env and takes no flag. Its only effect is one console line.
 * - THE Q1 HARD CONSTRAINT (carried): the loop proposes; it never executes.
 *   Nothing here creates a path from anything to an action-taking tool or
 *   scheduler, and nothing here may grow one.
 *
 * ─── LIVE-SURFACE NOTE (honest, 2026-08-19) ─────────────────────────────────
 * The one live caller is `/api/practice/fresh`, which is LIVE in production
 * (SUBSTRATE_FRESH_ENABLED activated 2026-08-10,
 * D-RUNNER-SCOPING-SESSION-COMPLETE-2026-08-10) — not dark, as several stale
 * headers in this module and its consumer had claimed until this session
 * corrected them. So this log line runs in production. Volume is bounded by
 * MAX_CANDIDATES (32) log lines per request, and only for genuinely-novel
 * candidates. Nothing caller-supplied is logged — deliberately: `gapRef` is
 * runner-authored text and a stub that only needs to say "I was reached" has
 * no reason to put caller input into the platform log.
 */
export function noteCuriosityTrigger(result: StructuralNoveltyResult): StructuralNoveltyResult {
  if (isGenuineNoveltyConfirmation(result)) {
    console.log('[curiosity-trigger] reached: structural novelty confirmed (stub — pass-through)', {
      noveltyConfidence: result.confidence,
      outcomeWhenPopulated: TAXONOMY_QUESTION_OUTCOME,
    })
  }
  return result
}
