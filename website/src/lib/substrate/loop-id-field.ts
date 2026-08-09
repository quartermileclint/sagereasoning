/**
 * loop-id-field.ts — the IDEA loop's `loop_id` passthrough label (QG-C, ruled
 * 2026-08-09).
 *
 * WHAT THIS IS
 *
 * The generation-step scope's QG-C ruling (verbatim record:
 * `operations/agent-circles-2026-08/2026-08-09-mentor-consultation-generation-step-scope-rulings-verbatim.md`,
 * which wins over every annotation): *"Option (a) confirmed — additive optional
 * `loop_id` request field on `/api/reason`, stamped by the server into the
 * orientation event payload as `loopId?`, following the B5 `session_marker`
 * precedent exactly. Composition confirmed: two identifiers on the same event
 * as separate fields, never concatenated, both independently visible.
 * Passthrough-label reading confirmed — `loopId` is the deliberate exception
 * the ruling created; the never-sees line governs the four timing parameters
 * whose enforcement is the runner's alone."*
 *
 * `loopId` names ONE RUNNER INSTANCE persisting across many consults. It is NOT
 * the examination `sessionId`, which names one SageReasoning examination
 * session per consult and is server-known (the 2026-08-06 mentor note: the two
 * are "deliberately independent identifiers at different layers"; generation-
 * step scope §1 item 10). They ride the SAME orientation event as SEPARATE
 * fields — the payload's `loopId` (runner-declared) alongside the event's own
 * session-derived correlation identity (server-computed,
 * `computeOrientationCorrelationId`) — never concatenated into one token, never
 * a composite key, both independently visible.
 *
 * PASSTHROUGH, NOT CONFIGURATION. The server stamps this label and NEVER
 * interprets it: nothing branches on its value, it feeds no computation, it
 * enters no signed artifact. Contrast the four TIMING parameters of
 * `IdeaLoopConfiguration` (`minimumInterval`, `maximumDuration`,
 * `randomOffsetPercent`, `minimumIncubationInterval`) — SageReasoning
 * structurally never sees those at all, and the "never sees these values" line
 * governs THEM. `loopId` is the deliberate, ruled exception.
 *
 * FLAG-OFF ⇒ THE FIELD IS NEVER INSPECTED OR VALIDATED (PR19 re-run wording
 * fold, 2026-08-09, CONFIRMED low: a bare JS destructuring assignment DOES
 * read the `loop_id` property off the request body regardless of the flag —
 * "never read" overstated that; what the code actually guarantees, and the
 * only thing byte-identity requires, is that the value is never inspected,
 * validated, or acted upon. The route's gate is
 * `if (loopIdFieldEnabled && loop_id !== undefined && loop_id !== null)`, so
 * with SUBSTRATE_LOOP_ID_FIELD_ENABLED unset an unrecognized `loop_id` key
 * behaves exactly as any other untouched destructured binding — inert,
 * indistinguishable from absent — the byte-identity the ruled §2.11
 * dimension 6 requires be *verified*, not asserted. Zero-consequence: this is
 * the same destructuring shape every sibling flag-gated field in this route
 * uses (`session_marker`, `clarification_response`, `prior_feedback`).
 *
 * NO LLM CALL, NO DB READ, NO SCHEMA CHANGE. The orientation event's `payload`
 * column is JSONB (`supabase-agent-trust-core-migration.sql:149`) and
 * `trust-core-store.ts:117` passes the payload object directly with no
 * per-field extraction (KG7) — an additive optional payload field needs no
 * ALTER TABLE. Verified first-hand at this build, not inherited as an
 * assumption.
 *
 * MEASURE-only; weights blocked (inherited unchanged from the trust-core arc).
 * The Q1 hard constraint is untouched here: this module labels a record. It
 * neither executes, schedules, nor recommends any action.
 */

export const LOOP_ID_FIELD_ENV_VAR = 'SUBSTRATE_LOOP_ID_FIELD_ENABLED'

/** True only when the flag is the exact string 'true'. Read at CALL TIME, never
 *  cached at module load — the house discipline every sibling flag-checker
 *  follows (`isSessionDeclineSignalEnabled`, `isOrientationReadingEnabled`, …),
 *  so a test can flip the env var between assertions and a deploy needs no
 *  cold start to pick the flag up. */
export function isLoopIdFieldEnabled(): boolean {
  return process.env[LOOP_ID_FIELD_ENV_VAR] === 'true'
}

/**
 * The length bound. 200 chars, matching the `fresh` handler's `MAX_GAPREF_CHARS`
 * and the `watching` scope's ref-shaped fields — the same house bound for the
 * same reason (a ref/label, not prose).
 *
 * RATIONALE (documented either way, per the build discipline): the ruled
 * `loopId` convention is `{k1AgentId}#{instance}` — e.g.
 * `sagereasoning:idea-loop@v1#001` (generation-step scope §2.5) — roughly 30
 * characters. 200 leaves ample room for a longer namespace or instance suffix
 * while keeping an unbounded caller-supplied string out of a JSONB column that
 * is owner-exportable and retention-swept. The bound is a build-time input cap
 * in the house pattern, not a ruled value.
 */
export const MAX_LOOP_ID_CHARS = 200

export type LoopIdValidation =
  | { ok: true; value: string }
  | { ok: false; error: string }

/**
 * Validate a caller-supplied `loop_id`. PURE — no env read, no I/O: the FLAG
 * gate is the caller's (the route reads `isLoopIdFieldEnabled()` before ever
 * touching the field, so flag-off this function is never invoked at all).
 *
 * A malformed value is a plain 400 at the route, never silently dropped or
 * coerced — the B5 `session_marker` posture exactly: a caller opting into a
 * declared label must get it right.
 *
 * Accepted: a non-empty string (after trimming surrounding whitespace) of at
 * most MAX_LOOP_ID_CHARS characters. The TRIMMED value is what gets stamped —
 * the `fresh` handler's `gapRef` treatment exactly, so ' loop#1 ' and 'loop#1'
 * cannot become two distinct labels for one runner instance.
 *
 * NOT validated: the `{k1AgentId}#{instance}` convention itself. That is a
 * runner-owned convention (generation-step scope §2.5: "uniqueness is the
 * runner's responsibility"), and a server that enforced its shape would be
 * interpreting the label — the exact thing the passthrough ruling forbids.
 */
export function validateLoopId(value: unknown): LoopIdValidation {
  if (typeof value !== 'string') {
    return { ok: false, error: 'loop_id must be a string.' }
  }
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return { ok: false, error: 'loop_id must be a non-empty string.' }
  }
  if (trimmed.length > MAX_LOOP_ID_CHARS) {
    return {
      ok: false,
      error: `loop_id exceeds ${MAX_LOOP_ID_CHARS} chars.`,
    }
  }
  return { ok: true, value: trimmed }
}
