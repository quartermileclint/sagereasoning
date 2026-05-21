/**
 * calling-service.ts — Sage Calling endpoint orchestration (PURE domain logic).
 *
 * Built at the Sage Calling build Stage 2 — the Critical public-surface half.
 * Implements the endpoint↔engine contract, the D-12 post-clarification holding
 * pattern, and the D-5 five-specification → discovered_purpose assembly, all as
 * PURE functions over the engine + store types. No I/O lives here (the route
 * does the Supabase + metering + HTTPS work); these functions are unit-tested
 * with plain `npx tsx` (no env).
 *
 * THE ENDPOINT↔ENGINE CONTRACT (no current_variant column needed)
 * --------------------------------------------------------------
 * The engine is deterministic, so the variant the agent is CURRENTLY answering
 * is recomputed as nextStep(prevHistory) — the question last surfaced. So per
 * advance turn the route:
 *   1. surfaced = nextStep(prevHistory)      // must be a 'question'
 *   2. append { surfaced.stage, surfaced.variant, response } to history
 *   3. decision = nextStep(newHistory)
 *   4. append toSelectionAudit(decision) to the audit array
 *   5. deriveTerminal(decision) → gate/outcome/completed
 *   6. persistTurn(...) with the full new arrays
 *   7. return decision (question text / hard_gate / clarification text)
 * The first call (no response) is createSession + nextStep([]) (Q1/A).
 *
 * computeAdvance below packages steps 1–5 as one pure function so the route
 * stays thin and the contract is unit-testable. The Supabase calls
 * (getSession / createSession / persistTurn / setGateStatus) stay in the route.
 */

import {
  nextStep,
  getVariantText,
  type EngineOutput,
  type ResponseRecord,
} from './engine'
import {
  appendResponse,
  appendAudit,
  toSelectionAudit,
  deriveTerminal,
  type SelectionAudit,
  type GateStatus,
  type Outcome,
} from './session-store'
import type {
  DiscoveredPurpose,
  DiscoveredPurposeCircle,
  DiscoveredPurposeRole,
} from '@/lib/translation-sandwich/layer1-extractor'

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * D-12 holding-pattern timeout. After a clean null_result the agent re-enters
 * innermost-circle attention (Q6 Variant A) — NOT a loop to Q1, NOT a repeat of
 * the clarification — until the developer responds, OR this wall-clock window
 * since completed_at elapses, OR new context arrives (a NEW session_id; in-session
 * re-injection is deferred per D-11/PR7). Founder-elected 2026-05-21 (24h).
 */
export const HOLDING_PATTERN_TIMEOUT_HOURS = 24

/**
 * Metering surface for Option D (D-8). Sage Calling stage calls are wrapper
 * invocations; they reuse the existing 'wrapper_internal' surface — no new
 * surface value, so no billing-schema migration. Each metered stage call =
 * one Option D loop; the engine makes no LLM call so anthropic cost is 0 and
 * the loop bills at the base rate.
 */
export const SAGE_CALLING_METERING_SURFACE = 'wrapper_internal' as const

// ============================================================================
// SMALL PURE HELPERS
// ============================================================================

function recordsAt(history: ResponseRecord[], stage: ResponseRecord['stage']): ResponseRecord[] {
  return history.filter((r) => r.stage === stage)
}

/** Last free-text response the agent gave at a stage ('' if none). */
function lastResponseAt(history: ResponseRecord[], stage: ResponseRecord['stage']): string {
  const rs = recordsAt(history, stage)
  return rs.length ? rs[rs.length - 1].response : ''
}

// ============================================================================
// ADVANCE — the endpoint↔engine contract (steps 1–5), pure
// ============================================================================

export interface AdvanceResult {
  /** The question the agent was answering (recomputed from prevHistory). */
  surfaced: Extract<EngineOutput, { kind: 'question' }>
  /** prevHistory + the answered turn. */
  newHistory: ResponseRecord[]
  /** prevAudits + the decision's selection audit. */
  newAudits: SelectionAudit[]
  /** The engine's next action after the answer. */
  decision: EngineOutput
  /** The stage to persist as current_stage. */
  currentStage: ResponseRecord['stage']
  gateStatus: GateStatus
  outcome: Outcome | null
  isComplete: boolean
}

export type ComputeAdvance =
  | { ok: true; value: AdvanceResult }
  | { ok: false; reason: 'not_awaiting_response' }

/**
 * Apply one agent response to the prior history and compute the next action +
 * the full persisted state. Pure. Returns `not_awaiting_response` when the
 * session's current step is NOT a question (already at the Hard Gate or a
 * null_result) — the route maps that to a terminal-status response, never an
 * advance (and never re-bills).
 */
export function computeAdvance(
  prevHistory: ResponseRecord[],
  prevAudits: SelectionAudit[],
  response: string,
): ComputeAdvance {
  const surfaced = nextStep(prevHistory)
  if (surfaced.kind !== 'question') {
    return { ok: false, reason: 'not_awaiting_response' }
  }

  const newHistory = appendResponse(prevHistory, {
    stage: surfaced.stage,
    variant: surfaced.variant,
    response,
  })

  const decision = nextStep(newHistory)
  const newAudits = appendAudit(prevAudits, toSelectionAudit(decision))
  const terminal = deriveTerminal(decision)

  const currentStage: ResponseRecord['stage'] =
    decision.kind === 'question'
      ? decision.stage
      : newHistory[newHistory.length - 1].stage

  return {
    ok: true,
    value: {
      surfaced,
      newHistory,
      newAudits,
      decision,
      currentStage,
      gateStatus: terminal.gateStatus,
      outcome: terminal.outcome,
      isComplete: terminal.isComplete,
    },
  }
}

/** The cold-open action for a brand-new session (always Q1/A). */
export function coldOpen(): EngineOutput {
  return nextStep([])
}

/** The current pending action for an in-progress session (re-fetch, no advance). */
export function currentStep(history: ResponseRecord[]): EngineOutput {
  return nextStep(history)
}

// ============================================================================
// D-12 — post-clarification holding pattern
// ============================================================================

export type HoldingPatternState = 'active' | 'timed_out'

/**
 * Whether a completed null_result session is still inside its D-12 holding-
 * pattern window. While 'active', the route re-surfaces Q6 Variant A (innermost-
 * circle attention) and does NOT loop to Q1 / repeat the clarification. Once
 * 'timed_out', the route returns a timed-out status. Pure.
 */
export function holdingPatternState(
  completedAtIso: string | null,
  now: Date = new Date(),
  timeoutHours: number = HOLDING_PATTERN_TIMEOUT_HOURS,
): HoldingPatternState {
  if (!completedAtIso) return 'active' // not yet completed — treat as active
  const completed = new Date(completedAtIso).getTime()
  if (Number.isNaN(completed)) return 'active'
  const elapsedMs = now.getTime() - completed
  return elapsedMs > timeoutHours * 60 * 60 * 1000 ? 'timed_out' : 'active'
}

/** The innermost-circle attention question re-surfaced in the holding pattern
 *  (Q6 Variant A). NOT a loop to Q1; NOT a repeat of the clarification. */
export function holdingPatternQuestion(): string {
  return getVariantText('Q6', 'A')
}

// ============================================================================
// D-5 — five-specification → discovered_purpose assembly (approved path only)
// ============================================================================

/** Oikeiosis circle keywords, in outward order — must match the engine's
 *  M.circleLevels and the DiscoveredPurposeCircle enum exactly. */
const CIRCLE_KEYWORDS: DiscoveredPurposeCircle[] = ['self', 'immediate', 'community', 'wider', 'universal']

/** Deterministic circle scan over the agent's responses. Returns the OUTERMOST
 *  circle the agent mentioned (most-extended concern), or 'immediate' as the
 *  conservative default. */
function scanCircle(history: ResponseRecord[]): DiscoveredPurposeCircle {
  const all = history.map((r) => r.response.toLowerCase()).join(' \n ')
  let found: DiscoveredPurposeCircle | null = null
  for (const c of CIRCLE_KEYWORDS) {
    if (all.includes(c)) found = c // last match wins → outermost mentioned
  }
  return found ?? 'immediate'
}

/**
 * Assemble the five-specification handoff (D-5) from the session's response
 * history. Built ONLY on the approved path (the Hard Gate; D-14) — never on the
 * agent's say-so.
 *
 * HONEST LIMITATION (matches the D-4 engine posture): this is DETERMINISTIC
 * STRUCTURAL assembly, not semantic extraction. It maps the agent's own verbatim
 * stage responses into the five slots and reads the circle by keyword. It does
 * not parse meaning. The role defaults to the agent's individual operational
 * nature unless a VERIFIED Agent Card (D-13) supplies the chosen-role hint. The
 * downstream substrate Layer 1 (Sonnet) refines this when the handoff is fed in;
 * a richer extraction is exactly the PR7/D-4 rules+LLM-hybrid trigger. Every
 * field carries the agent's own words — nothing is fabricated.
 */
export function buildDiscoveredPurpose(
  history: ResponseRecord[],
  roleHint: DiscoveredPurposeRole | null = null,
): DiscoveredPurpose {
  const q1 = lastResponseAt(history, 'Q1')
  const q2 = lastResponseAt(history, 'Q2')
  const q3 = lastResponseAt(history, 'Q3')
  const q5 = lastResponseAt(history, 'Q5')
  const q6 = lastResponseAt(history, 'Q6')

  // Work: the thing identified. Q6 wins when present (the Q6→Q5 innermost-circle
  // / preparation path named the work there); else the genuine need (Q3); else
  // the given work (Q1); else the Q5 translation. The agent's own words.
  const work = (q6 || q3 || q1 || q5 || '').trim()

  // Capacity: the agent's Q2 demonstrated-capacity response, as a single-item
  // list (Layer 1 / a later hybrid may decompose it). Never the Agent Card.
  const capacity = q2.trim() ? [q2.trim()] : []

  // First appropriate act: the Q5 translation; fall back to the work.
  const firstActDescription = (q5 || work || '').trim()

  const obligation = (q3 || q1 || work || '').trim()

  return {
    work: work || undefined,
    circle_and_obligation: {
      circle: scanCircle(history),
      obligation: obligation || undefined,
    },
    role: roleHint ?? 'individual_nature',
    capacity,
    first_appropriate_act: {
      description: firstActDescription || undefined,
      action_metadata: null,
    },
  }
}
