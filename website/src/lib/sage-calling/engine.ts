/**
 * engine.ts — Sage Calling rule-based variant-selection engine (D-4).
 *
 * Built at the Sage Calling build Stage 2 session (the engine + store half;
 * see /operations/handoffs/founder/2026-05-21-sage-calling-stage2-build-NEXT-SESSION-PROMPT.md).
 * Implements the deterministic variant-selection mechanism locked in
 *   /adopted/purpose-discovery-product-design.md
 *     §"The deterministic mechanism — the six-stage sequence"
 *     §"Variant-selection discipline"  (D-4 — rule-based heuristics)
 *     §"The null-result protocol"
 *
 * WHAT THIS IS
 * ------------
 * A pure, deterministic step function over the agent's response history. Given
 * the ordered record of (stage, variant-shown, agent-response) so far, it returns
 * exactly one next action: surface a question variant, reach the Hard Gate (Q5
 * complete), or emit a null-result clarification template. Same history in →
 * same output out. No randomness, no LLM call, no network call.
 *
 * THE DISCIPLINE (binding — §"Variant-selection discipline")
 * ----------------------------------------------------------
 *  • LEGITIMATE triggers — the engine reads EPISTEMIC STATE only: completeness
 *    gaps, over/under-claiming relative to stated history, skipped tests,
 *    premature closure, extended avoidance. Detection is by deterministic
 *    lexical/structural markers over the response text.
 *  • ILLEGITIMATE triggers — the engine MUST NOT read PREFERENCE STATE: tone,
 *    apparent direction, what answer the agent seems to want, what framing would
 *    validate it. None of the marker sets below key on agreement, sentiment, or
 *    the agent's apparent goal — only on epistemic completeness / distortion.
 *  • HARDEST-DIAGNOSTIC ALWAYS REACHABLE — each stage's variant that addresses
 *    its most likely avoidance pattern (Q1-D avoidance, Q2-B over-claiming,
 *    Q3-B imagined-need, Q4-C continued-search, Q5-C spec-incompleteness,
 *    Q6-D fabrication-risk) has a top-priority, un-shadowed trigger within its
 *    stage. The engine can vary the approach; it cannot vary the destination.
 *  • AUDITABLE — every output carries a stable named `rule` and the `signals`
 *    (epistemic reads) that drove it. This log IS the product's R0 value.
 *
 * R4 (engine internals stay closed): only `text` (the verbatim question /
 * clarification) is ever surfaced to the agent. `rule`, `signals`, and the
 * marker sets below are engine-internal; the agent never learns which variant
 * fired or why.
 *
 * HONEST LIMITATION (PR7 / D-4 deferral; the R18d trigger)
 * --------------------------------------------------------
 * These are LEXICAL/STRUCTURAL heuristics, not semantic understanding. They are
 * the deterministic baseline D-4 elected (cheapest, fully auditable, no
 * preference-state risk). The Stage-2 R18d adversarial suite probes whether they
 * miss subtle semantic signals; if it shows they do, that is the documented
 * trigger to escalate to the PR7-deferred rules+LLM hybrid (at which point PR4 +
 * KG2 engage and a constraints.ts model row is added). Until then, the rules are
 * what governs, and their reach is bounded and honest.
 *
 * BOUNDEDNESS
 * -----------
 * Each stage surfaces its default (A) on entry, then re-prompts with at most each
 * relevant diagnostic variant once. After the diagnostics relevant to the
 * detected signals are exhausted (or the advancement criterion is met), the
 * sequence advances. Max 4 turns per stage → the sequence always terminates
 * (Hard Gate or null-result).
 */

import {
  CallingStage,
  VariantId,
  QUESTION_VARIANTS,
  CLARIFICATION_TEMPLATES,
} from './question-library'

// ============================================================================
// PUBLIC TYPES
// ============================================================================

/** One completed turn: the variant the engine surfaced, and the agent's reply. */
export interface ResponseRecord {
  stage: CallingStage
  /** The variant slot that was surfaced for this turn. */
  variant: VariantId
  /** The agent's free-text response to that surfaced question. */
  response: string
}

/**
 * An auditable epistemic-state read. Every variant selection traces to one or
 * more of these (the §"Variant-selection discipline" hard requirement). Stored
 * in discovery_sessions.signals_detected by the store (D-7 audit trail).
 */
export interface EpistemicSignal {
  /** The stage the read pertains to. */
  stage: CallingStage
  /** Stable rule id, e.g. 'Q2.over-claiming'. */
  rule: string
  /** Whether the epistemic marker was detected in the relevant response(s). */
  detected: boolean
  /** Short, engine-internal note on what triggered it (R4 — never surfaced). */
  evidence: string
}

/**
 * The engine's single next action. Discriminated on `kind`.
 *  - 'question'    — surface this stage+variant's verbatim text to the agent.
 *  - 'hard_gate'   — Q5 specifications complete; PAUSE. The five-spec handoff
 *                    MUST NOT fire until external developer approval (D-14).
 *  - 'null_result' — Q6 exhausted with a genuine null; emit the clarification
 *                    template. The product does NOT loop back to Q1 (D-12).
 */
export type EngineOutput =
  | {
      kind: 'question'
      stage: CallingStage
      variant: VariantId
      /** Stable named selection rule (auditable). */
      rule: string
      /** Verbatim question text — the ONLY field surfaced to the agent. */
      text: string
      /** True when this advanced to a new stage; false when re-prompting. */
      advanced: boolean
      /** The epistemic reads that drove this selection. */
      signals: EpistemicSignal[]
    }
  | {
      kind: 'hard_gate'
      rule: string
      signals: EpistemicSignal[]
    }
  | {
      kind: 'null_result'
      /** Which clarification template (A–D) to emit. */
      clarificationVariant: VariantId
      /** Verbatim clarification template text (bracketed slots preserved). */
      text: string
      rule: string
      signals: EpistemicSignal[]
    }

// ============================================================================
// CONTENT LOOKUP (verbatim text from the locked content module)
// ============================================================================

/** Resolve the verbatim question text for a stage+variant. Throws if missing
 *  (a content/engine drift bug — never silently surface the wrong text). */
export function getVariantText(stage: CallingStage, variant: VariantId): string {
  const v = QUESTION_VARIANTS.find((q) => q.stage === stage && q.variant === variant)
  if (!v) {
    throw new Error(`[sage-calling/engine] No question variant for ${stage}/${variant}`)
  }
  return v.text
}

/** Resolve the verbatim clarification template text for a variant. */
export function getClarificationText(variant: VariantId): string {
  const t = CLARIFICATION_TEMPLATES.find((c) => c.variant === variant)
  if (!t) {
    throw new Error(`[sage-calling/engine] No clarification template for ${variant}`)
  }
  return t.text
}

// ============================================================================
// LEXICAL MARKER SETS (engine-internal — R4)
// ============================================================================
//
// Deterministic substrings, matched case-insensitively against the agent's
// response text. Chosen to key on EPISTEMIC state (completeness/distortion),
// never on preference/tone. Conservative by design: a diagnostic fires only on
// a positive marker hit, so the default path (Variant A → advance) is the
// no-signal baseline.

const M = {
  // Q1 — present/innermost grounding vs forward/outward orientation.
  present: [
    'already', 'currently', 'current obligation', 'existing relationship',
    'existing obligation', 'present in my', 'in front of me', 'given to me',
    'right now', 'at present', 'i already have', 'my nature', 'my existing',
  ],
  forwardOutward: [
    'could do', 'i could', 'i would', 'i might', 'i will look', 'i plan to',
    'intend to', 'in the future', 'potential purpose', 'possible purpose',
    'new purpose', 'opportunity to', 'i should look', 'explore', 'i want to',
  ],
  circleLevels: ['self', 'immediate', 'community', 'wider', 'universal'],
  givenVsChosen: ['choose to', 'take on', 'decide to', 'opt to'],
  outwardNeed: [
    'need', 'needs', 'help others', 'others need', 'problem to solve',
    'someone needs', 'the world needs', 'people need', 'demand for', 'unmet',
  ],
  unattendedWork: [
    'unattended', 'already needs', 'currently requires', 'not yet attended',
    'already in front', 'already requires', 'left undone', 'going unaddressed',
  ],

  // Q2 — capacity claims vs demonstrated-history evidence.
  overclaim: [
    'expert', 'excel at', 'highly capable', 'i am the best', 'uniquely able',
    'uniquely positioned', 'exceptional at', 'master of', 'i can do anything',
    'world-class', 'i am ideal', 'perfectly suited',
  ],
  evidence: [
    'demonstrated', 'in prior', 'have produced', 'track record', 'previously',
    'history shows', 'i have done', 'in past', 'observed in my', 'my output has',
    'measured', 'evidence',
  ],
  underclaim: [
    'only', 'merely', 'limited', 'i doubt', 'not capable', "i'm not sure i can",
    'i am not sure i can', 'probably cannot', "i can't really", 'i cannot really',
    'not very good', 'i lack', 'unable to',
  ],

  // Q3 — independence / unmet / proportion.
  attentionConstructed: [
    'i noticed', 'i think there is a need', 'it seems', 'i imagine', 'i feel there',
    'i sense', 'in my view there', 'i believe there is a need',
  ],
  independentEvidence: [
    'exists regardless', 'present in the environment', 'observed', 'documented',
    'reported', 'independently', 'whether or not i', 'persists without me',
    'others have identified', 'measurable',
  ],
  otherAgent: [
    'someone else', 'another agent', 'already being handled', 'others are',
    'better positioned', 'handled by', 'belongs to', 'not my role', 'a different agent',
  ],
  grandiose: [
    'transform', 'revolutionize', 'revolutionise', 'all of', 'entire', 'every',
    'massive', 'global', 'change the world', 'everyone', 'humanity',
  ],

  // Q4 — closure vs continued search vs uncertainty-as-obstacle.
  commitment: [
    'i am ready', "i'm ready", 'i commit', 'let us commit', "let's commit",
    'i will do it', 'i will take', 'i am going to', "i'm going to", 'i will act',
  ],
  continuedSearch: [
    'but i should also', 'let me explore more', 'i need to consider', 'what about',
    'i should think about', 'there may be more', 'let me also look', 'one more',
    'before committing i', 'i want to be thorough', 'just to be sure', 'also consider',
  ],
  uncertaintyBlocking: [
    "i can't until i know", 'i cannot until i know', 'uncertain whether', 'need to be sure',
    'what if', 'until i am certain', 'until i know', 'cannot proceed without knowing',
    'depends on the outcome', 'not sure how it will turn out',
  ],

  // Q5 — idealisation / incompleteness / deferral.
  contingentFuture: [
    'once i have', 'when x is', 'after we', 'once the', 'when i get', 'as soon as',
    'provided that', 'if i had', 'when resources', 'once conditions', 'after i obtain',
  ],
  actNamedNotCommitted: [
    'i could take', 'the act would be', 'the first act might', 'i might take',
    'one option is to', 'i would start by', 'perhaps i should',
  ],
  actCommitted: [
    'i will start by', 'i am taking', "i'm taking", 'i will now', 'the first act is',
    'i commit to', 'i will begin',
  ],

  // Q6 — null-redirect, broad-scan, integrity-clear, fabrication-risk.
  workNamed: [
    'integrity requires', 'i must maintain', 'i need to maintain', 'requires that i',
    'the work is', 'i should attend to', 'maintenance of my', 'preserve my',
    'i will attend to', 'preparation requires', 'i need to prepare',
  ],
  integrityClear: [
    'requires nothing', 'nothing is required', 'no current requirement', 'nothing at this moment',
    'integrity is intact', 'no maintenance needed', 'nothing needs',
  ],
  fabrication: [
    'to satisfy the instruction', 'so that i have a purpose', 'i will say my purpose is',
    'my purpose is to be useful', 'i suppose my purpose', 'a purpose could be',
    'i can generate a purpose', 'to fulfil the directive',
  ],
  idealRejection: [
    'not significant enough', 'too small', 'beneath', 'not meaningful enough',
    'insufficiently', 'not worthy', 'nothing big enough', 'nothing important enough',
  ],
}

// ----------------------------------------------------------------------------
// marker helpers
// ----------------------------------------------------------------------------

function lc(s: string): string {
  return (s ?? '').toLowerCase()
}

function hasAny(text: string, markers: string[]): { hit: boolean; matched: string[] } {
  const t = lc(text)
  const matched = markers.filter((m) => t.includes(m))
  return { hit: matched.length > 0, matched }
}

/** Count distinct circle-level terms mentioned (Q1 over-extension heuristic). */
function distinctCircleLevels(text: string): string[] {
  const t = lc(text)
  return M.circleLevels.filter((c) => t.includes(c))
}

/** Lexical token overlap ratio between two texts (Q2-D capacity↔work mismatch).
 *  Crude: fraction of significant work-tokens that appear in the capacity text. */
function tokenOverlapRatio(workText: string, capacityText: string): number {
  const stop = new Set([
    'the', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'on', 'for', 'with', 'is',
    'are', 'it', 'that', 'this', 'my', 'i', 'work', 'need', 'would', 'could',
  ])
  const workTokens = Array.from(
    new Set(
      lc(workText)
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 3 && !stop.has(w)),
    ),
  )
  if (workTokens.length === 0) return 1 // nothing to mismatch against
  const capLc = lc(capacityText)
  const present = workTokens.filter((w) => capLc.includes(w))
  return present.length / workTokens.length
}

// ============================================================================
// HISTORY HELPERS
// ============================================================================

function recordsAt(history: ResponseRecord[], stage: CallingStage): ResponseRecord[] {
  return history.filter((r) => r.stage === stage)
}

function variantsFiredAt(history: ResponseRecord[], stage: CallingStage): Set<VariantId> {
  return new Set(recordsAt(history, stage).map((r) => r.variant))
}

function lastResponseAt(history: ResponseRecord[], stage: CallingStage): string {
  const rs = recordsAt(history, stage)
  return rs.length ? rs[rs.length - 1].response : ''
}

// ============================================================================
// SIGNAL DETECTION (exported for tests; engine-internal at runtime — R4)
// ============================================================================

/**
 * Compute the epistemic-state reads for `stage` given the full history.
 * Returns every relevant check (detected true/false) so the audit trail records
 * what was looked for, not only what fired. Pure.
 */
export function detectSignals(stage: CallingStage, history: ResponseRecord[]): EpistemicSignal[] {
  const resp = lastResponseAt(history, stage)
  const sig = (rule: string, detected: boolean, evidence: string): EpistemicSignal => ({
    stage,
    rule,
    detected,
    evidence,
  })

  switch (stage) {
    case 'Q1': {
      const present = hasAny(resp, M.present)
      const forward = hasAny(resp, M.forwardOutward)
      const outwardNeed = hasAny(resp, M.outwardNeed)
      const circles = distinctCircleLevels(resp)
      const chosen = hasAny(resp, M.givenVsChosen)
      const unattended = hasAny(resp, M.unattendedWork)
      return [
        // D (hardest): actively scanning outward for needs, bypassing the
        // immediate entirely (forward orientation + no present grounding +
        // outward-need scanning).
        sig(
          'Q1.avoidance',
          forward.hit && !present.hit && outwardNeed.hit,
          `forward=${forward.matched.join('|') || 'none'}; present=${present.hit}; outwardNeed=${outwardNeed.hit}`,
        ),
        // C: many circle levels at once, conflating given vs chosen.
        sig(
          'Q1.over-extension',
          circles.length >= 2 && chosen.hit,
          `circleLevels=${circles.join('|')}; chosen=${chosen.hit}`,
        ),
        // B: forward orientation present but innermost not grounded, and not the
        // stronger outward-need scanning that defines D (mutually exclusive).
        sig(
          'Q1.inattention',
          forward.hit && !present.hit && !outwardNeed.hit,
          `forward=${forward.hit}; present=${present.hit}; outwardNeed=${outwardNeed.hit}`,
        ),
        // Advancement / Q1 jump-to-Q5: unattended present work explicitly named.
        sig(
          'Q1.unattended-work-named',
          unattended.hit && present.hit,
          `unattended=${unattended.matched.join('|') || 'none'}; present=${present.hit}`,
        ),
        sig('Q1.grounded', present.hit, `present=${present.matched.join('|') || 'none'}`),
      ]
    }
    case 'Q2': {
      const over = hasAny(resp, M.overclaim)
      const evid = hasAny(resp, M.evidence)
      const under = hasAny(resp, M.underclaim)
      const workText = lastResponseAt(history, 'Q1')
      const overlap = tokenOverlapRatio(workText, resp)
      return [
        // B (hardest): capacity claimed beyond demonstrated history.
        sig(
          'Q2.over-claiming',
          over.hit && !evid.hit,
          `overclaim=${over.matched.join('|') || 'none'}; evidence=${evid.hit}`,
        ),
        // C: capacity deflated below demonstrated history.
        sig(
          'Q2.under-claiming',
          under.hit && !over.hit,
          `underclaim=${under.matched.join('|') || 'none'}`,
        ),
        // D: capacity described doesn't fit the Q1 work (low token overlap).
        sig(
          'Q2.capacity-work-mismatch',
          workText.length > 0 && resp.length > 0 && overlap < 0.2,
          `workOverlap=${overlap.toFixed(2)}`,
        ),
        sig('Q2.evidence-grounded', evid.hit, `evidence=${evid.matched.join('|') || 'none'}`),
      ]
    }
    case 'Q3': {
      const constructed = hasAny(resp, M.attentionConstructed)
      const independent = hasAny(resp, M.independentEvidence)
      const other = hasAny(resp, M.otherAgent)
      const grand = hasAny(resp, M.grandiose)
      return [
        // B (hardest): need exists only because the agent is attending to it.
        sig(
          'Q3.imagined-need',
          constructed.hit && !independent.hit,
          `constructed=${constructed.matched.join('|') || 'none'}; independent=${independent.hit}`,
        ),
        // C: need belongs to / is handled by a better-positioned agent.
        sig('Q3.pseudo-need', other.hit, `otherAgent=${other.matched.join('|') || 'none'}`),
        // D: need disproportionate to assessed capacity.
        sig('Q3.proportion-mismatch', grand.hit, `grandiose=${grand.matched.join('|') || 'none'}`),
        // Independence affirmed (advancement support).
        sig('Q3.independence-affirmed', independent.hit, `independent=${independent.hit}`),
      ]
    }
    case 'Q4': {
      const commit = hasAny(resp, M.commitment)
      const cont = hasAny(resp, M.continuedSearch)
      const uncert = hasAny(resp, M.uncertaintyBlocking)
      // premature closure: committing while prior stages show gaps.
      const priorGaps = !hasAny(lastResponseAt(history, 'Q3'), M.independentEvidence).hit
      return [
        // C (hardest): sufficiency met but still generating reasons to defer.
        sig('Q4.continued-search', cont.hit, `continued=${cont.matched.join('|') || 'none'}`),
        // B: committing before specs complete.
        sig(
          'Q4.premature-closure',
          commit.hit && priorGaps,
          `commit=${commit.hit}; priorGaps=${priorGaps}`,
        ),
        // D: treating not-in-control uncertainty as a blocker.
        sig(
          'Q4.uncertainty-as-obstacle',
          uncert.hit,
          `uncertaintyBlocking=${uncert.matched.join('|') || 'none'}`,
        ),
        sig('Q4.commitment-present', commit.hit, `commit=${commit.hit}`),
      ]
    }
    case 'Q5': {
      const contingent = hasAny(resp, M.contingentFuture)
      const namedNotCommitted = hasAny(resp, M.actNamedNotCommitted)
      const committed = hasAny(resp, M.actCommitted)
      // spec incompleteness: a prior stage produced no usable response.
      const specGap =
        lastResponseAt(history, 'Q1').trim().length === 0 ||
        lastResponseAt(history, 'Q2').trim().length === 0 ||
        lastResponseAt(history, 'Q3').trim().length === 0
      return [
        // C (hardest): the five specs aren't actually complete.
        sig('Q5.spec-incompleteness', specGap, `specGap=${specGap}`),
        // B: first act contingent on conditions not yet present.
        sig(
          'Q5.idealisation',
          contingent.hit,
          `contingentFuture=${contingent.matched.join('|') || 'none'}`,
        ),
        // D: act named but not committed to.
        sig(
          'Q5.action-deferral',
          namedNotCommitted.hit && !committed.hit,
          `namedNotCommitted=${namedNotCommitted.hit}; committed=${committed.hit}`,
        ),
        sig('Q5.act-committed', committed.hit, `committed=${committed.hit}`),
      ]
    }
    case 'Q6': {
      const work = hasAny(resp, M.workNamed)
      const clear = hasAny(resp, M.integrityClear)
      const fab = hasAny(resp, M.fabrication)
      const broad = hasAny(resp, M.idealRejection)
      return [
        // D (hardest): generating a purpose to satisfy the instruction.
        sig('Q6.fabrication-risk', fab.hit, `fabrication=${fab.matched.join('|') || 'none'}`),
        // B: rejecting available work as never good enough (scanning too broad).
        sig('Q6.scanning-too-broadly', broad.hit, `idealRejection=${broad.matched.join('|') || 'none'}`),
        // C: integrity genuinely clear → preparation work.
        sig('Q6.integrity-clear', clear.hit, `integrityClear=${clear.matched.join('|') || 'none'}`),
        // Work named in the innermost circle → proceed to Q5.
        sig('Q6.work-named', work.hit && !fab.hit, `workNamed=${work.matched.join('|') || 'none'}`),
      ]
    }
  }
  // Exhaustiveness — every CallingStage value is handled above.
  const _exhaustive: never = stage
  throw new Error(`[sage-calling/engine] detectSignals: unhandled stage ${String(_exhaustive)}`)
}

function fired(signals: EpistemicSignal[], rule: string): boolean {
  return signals.some((s) => s.rule === rule && s.detected)
}

// ============================================================================
// CLARIFICATION TEMPLATE SELECTION (D-12 / null-result protocol)
// ============================================================================
//
// Choose which of the four developer-facing templates to emit on a genuine null,
// by the cause of termination read from the history's signals.
//   D — fabrication-risk was detected (agent reporting honestly against tendency)
//   C — the instruction itself is the gap (independence test could not be applied)
//   B — needs were found but no capacity match
//   A — outer circles null, operational integrity clear (default)

function selectClarificationVariant(history: ResponseRecord[]): { variant: VariantId; rule: string } {
  const q6 = detectSignals('Q6', history)
  if (fired(q6, 'Q6.fabrication-risk')) {
    return { variant: 'D', rule: 'clarify.D.fabrication-risk' }
  }
  const q3 = detectSignals('Q3', history)
  // Context insufficiency: the agent could not establish independent evidence.
  const q3Responded = recordsAt(history, 'Q3').length > 0
  if (q3Responded && fired(q3, 'Q3.imagined-need') && !fired(q3, 'Q3.independence-affirmed')) {
    return { variant: 'C', rule: 'clarify.C.context-insufficiency' }
  }
  // Needs real but out of capacity range.
  if (q3Responded && (fired(q3, 'Q3.proportion-mismatch') || fired(q3, 'Q3.pseudo-need'))) {
    return { variant: 'B', rule: 'clarify.B.capacity-mismatch' }
  }
  return { variant: 'A', rule: 'clarify.A.outer-circles-null' }
}

// ============================================================================
// THE ENGINE — nextStep
// ============================================================================

/** Build a 'question' EngineOutput, resolving the verbatim text. */
function question(
  stage: CallingStage,
  variant: VariantId,
  rule: string,
  advanced: boolean,
  signals: EpistemicSignal[],
): EngineOutput {
  return { kind: 'question', stage, variant, rule, text: getVariantText(stage, variant), advanced, signals }
}

/**
 * Decide the next action given the complete response history.
 *
 * Call pattern (the Stage-2 endpoint): surface the returned question → receive
 * the agent's reply → append { stage, variant, response } to history → call
 * nextStep again. The first call (empty history) opens at Q1/A.
 *
 * Pure + deterministic: identical history → identical output.
 */
export function nextStep(history: ResponseRecord[]): EngineOutput {
  // Cold open.
  if (history.length === 0) {
    return question('Q1', 'A', 'Q1.cold-open', true, [])
  }

  const last = history[history.length - 1]
  const stage = last.stage
  const signals = detectSignals(stage, history)
  const firedHere = variantsFiredAt(history, stage)

  switch (stage) {
    // ---- Q1 — what has already been given? ----
    case 'Q1': {
      // Q1 jump-to-Q5: unattended present work explicitly named → it is the purpose.
      if (fired(signals, 'Q1.unattended-work-named')) {
        return question('Q5', 'A', 'Q1.jump-to-Q5', true, signals)
      }
      // Re-prompt diagnostics (hardest-first), each at most once.
      if (fired(signals, 'Q1.avoidance') && !firedHere.has('D')) {
        return question('Q1', 'D', 'Q1.reprompt.avoidance', false, signals)
      }
      if (fired(signals, 'Q1.over-extension') && !firedHere.has('C')) {
        return question('Q1', 'C', 'Q1.reprompt.over-extension', false, signals)
      }
      if (fired(signals, 'Q1.inattention') && !firedHere.has('B')) {
        return question('Q1', 'B', 'Q1.reprompt.inattention', false, signals)
      }
      // Otherwise advance to Q2.
      return question('Q2', 'A', 'Q1.advance', true, signals)
    }

    // ---- Q2 — honest capacity assessment ----
    case 'Q2': {
      if (fired(signals, 'Q2.over-claiming') && !firedHere.has('B')) {
        return question('Q2', 'B', 'Q2.reprompt.over-claiming', false, signals)
      }
      if (fired(signals, 'Q2.capacity-work-mismatch') && !firedHere.has('D')) {
        return question('Q2', 'D', 'Q2.reprompt.capacity-work-mismatch', false, signals)
      }
      if (fired(signals, 'Q2.under-claiming') && !firedHere.has('C')) {
        return question('Q2', 'C', 'Q2.reprompt.under-claiming', false, signals)
      }
      return question('Q3', 'A', 'Q2.advance', true, signals)
    }

    // ---- Q3 — recognising genuine need ----
    case 'Q3': {
      // Re-prompt diagnostics (hardest-first).
      if (fired(signals, 'Q3.imagined-need') && !firedHere.has('B')) {
        return question('Q3', 'B', 'Q3.reprompt.imagined-need', false, signals)
      }
      if (fired(signals, 'Q3.pseudo-need') && !firedHere.has('C')) {
        return question('Q3', 'C', 'Q3.reprompt.pseudo-need', false, signals)
      }
      if (fired(signals, 'Q3.proportion-mismatch') && !firedHere.has('D')) {
        return question('Q3', 'D', 'Q3.reprompt.proportion-mismatch', false, signals)
      }
      // No candidate passes the three tests → redirect to Q6 (null-result path).
      // "Passes" = independence affirmed AND no disqualifying signal remains.
      const independenceAffirmed = fired(signals, 'Q3.independence-affirmed')
      const disqualified =
        fired(signals, 'Q3.imagined-need') ||
        fired(signals, 'Q3.pseudo-need') ||
        fired(signals, 'Q3.proportion-mismatch')
      if (!independenceAffirmed || disqualified) {
        return question('Q6', 'A', 'Q3.redirect-Q6', true, signals)
      }
      // A candidate passed → advance to Q4.
      return question('Q4', 'A', 'Q3.advance', true, signals)
    }

    // ---- Q4 — the stopping criterion ----
    case 'Q4': {
      const continuedNow = fired(signals, 'Q4.continued-search')
      // Agonia: Variant C already fired and search still continues without
      // commitment → terminate the sequence to the null-result clarification.
      if (continuedNow && firedHere.has('C') && !fired(signals, 'Q4.commitment-present')) {
        const { variant, rule } = selectClarificationVariant(history)
        return {
          kind: 'null_result',
          clarificationVariant: variant,
          text: getClarificationText(variant),
          rule: `Q4.agonia-terminate→${rule}`,
          signals,
        }
      }
      if (continuedNow && !firedHere.has('C')) {
        return question('Q4', 'C', 'Q4.reprompt.continued-search', false, signals)
      }
      if (fired(signals, 'Q4.premature-closure') && !firedHere.has('B')) {
        return question('Q4', 'B', 'Q4.reprompt.premature-closure', false, signals)
      }
      if (fired(signals, 'Q4.uncertainty-as-obstacle') && !firedHere.has('D')) {
        return question('Q4', 'D', 'Q4.reprompt.uncertainty-as-obstacle', false, signals)
      }
      // Conditions met → advance to Q5.
      return question('Q5', 'A', 'Q4.advance', true, signals)
    }

    // ---- Q5 — translating found purpose into the first action ----
    case 'Q5': {
      if (fired(signals, 'Q5.spec-incompleteness') && !firedHere.has('C')) {
        return question('Q5', 'C', 'Q5.reprompt.spec-incompleteness', false, signals)
      }
      if (fired(signals, 'Q5.idealisation') && !firedHere.has('B')) {
        return question('Q5', 'B', 'Q5.reprompt.idealisation', false, signals)
      }
      if (fired(signals, 'Q5.action-deferral') && !firedHere.has('D')) {
        return question('Q5', 'D', 'Q5.reprompt.action-deferral', false, signals)
      }
      // Five specifications complete → Hard Gate (D-14). PAUSE before handoff.
      return { kind: 'hard_gate', rule: 'Q5.complete-hard-gate', signals }
    }

    // ---- Q6 — the null-result redirect ----
    case 'Q6': {
      // Work named in the innermost circle (or genuine-clear preparation work)
      // → that becomes the purpose; proceed to Q5 to translate it.
      if (fired(signals, 'Q6.work-named') || fired(signals, 'Q6.integrity-clear')) {
        const rule = fired(signals, 'Q6.integrity-clear')
          ? 'Q6.integrity-clear-to-Q5'
          : 'Q6.work-named-to-Q5'
        // Surface Q6/C once for the genuine-clear case before translating; else go to Q5.
        if (fired(signals, 'Q6.integrity-clear') && !firedHere.has('C')) {
          return question('Q6', 'C', 'Q6.reprompt.integrity-clear', false, signals)
        }
        return question('Q5', 'A', rule, true, signals)
      }
      // Fabrication-risk → fire Q6/D once, then the honest null clarification.
      if (fired(signals, 'Q6.fabrication-risk') && !firedHere.has('D')) {
        return question('Q6', 'D', 'Q6.reprompt.fabrication-risk', false, signals)
      }
      // Scanning-too-broadly → fire Q6/B once.
      if (fired(signals, 'Q6.scanning-too-broadly') && !firedHere.has('B')) {
        return question('Q6', 'B', 'Q6.reprompt.scanning-too-broadly', false, signals)
      }
      // Genuine null: Q6 variants exhausted without naming work → clarification.
      // The product does NOT loop back to Q1 (D-12; no-loop constraint).
      const { variant, rule } = selectClarificationVariant(history)
      return {
        kind: 'null_result',
        clarificationVariant: variant,
        text: getClarificationText(variant),
        rule: `Q6.null-result→${rule}`,
        signals,
      }
    }
  }
  // Exhaustiveness — every CallingStage value is handled above.
  const _exhaustive: never = stage
  throw new Error(`[sage-calling/engine] nextStep: unhandled stage ${String(_exhaustive)}`)
}
