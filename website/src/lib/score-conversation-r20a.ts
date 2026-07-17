/**
 * score-conversation-r20a.ts — R20a perimeter helpers for /api/score-conversation.
 *
 * Foundation Completion Session 2 (2026-07-07). Closes the S8b 0h-exit
 * blocker (c): /api/score-conversation was the last human-facing free-text
 * route with no distress check — the "inside-perimeter exception" named at
 * S8a (`D-S8A-OPEN-DECISIONS-2026-06-10`, decision 2: the route is INSIDE
 * the R20a perimeter; wiring is its own Critical session per the AC5
 * ninth-route pattern).
 *
 * WHAT LIVES HERE (and why not in route.ts):
 *   Next.js rejects non-handler exports from route.ts at `next build`
 *   (memory: nextjs-route-export-validation), so the pure, testable pieces
 *   of the wiring live in this sibling module:
 *
 *   1. isScoreConversationR20aEnabled() — the feature flag check. Mirrors
 *      the posture of isCallingR20aEnabled / isReflectR20aEnabled in
 *      substrate/r20a-gate.ts: defaults OFF; only the literal string 'true'
 *      enables. Flag UNSET ⇒ the route is byte-identical to pre-wiring
 *      behaviour (no classifier call, no added latency, no wire-shape
 *      change). The flag lives with its mechanism (the same convention as
 *      the audience-renderer flag living in r20a-audience-renderer.ts).
 *
 *   2. composeConversationDistressSubject() — decides WHAT text the
 *      two-stage distress check runs over. Recorded election (the
 *      next-session prompt delegated this): the submitted free text —
 *      conversation + context + format, in submission order, each field
 *      capped at DISTRESS_SUBJECT_FIELD_CAP (15,000 chars, the
 *      TEXT_LIMITS.long posture — an adversarial-review fold; see the
 *      constant's doc). Rationale:
 *        - The transcript is an unstructured paste; attributing turns to
 *          the submitting human is unreliable, and the perimeter posture is
 *          conservative ("False positives are safe. False negatives are
 *          dangerous." — r20a-classifier.ts). Distress anywhere in the
 *          submission pauses the evaluation.
 *        - context and format are human-authored free text on the same
 *          submission and both reach the engine via domainContext — every
 *          prose channel the route forwards to the engine is inside the
 *          perimeter.
 *        - NOT the engine's 6000-word truncation: distress past the
 *          engine's word cut must still catch, so the subject is composed
 *          from the raw fields (see the function doc).
 *
 *   2b. escalateMildDistress() — the mild-escalation check (adversarial-
 *      review fold, finding F3): a stage-1 'mild' hit anywhere in the
 *      joined multi-party subject would otherwise mute stage 2 for the
 *      submitter's own regex-missed distress; on the mild path the shared
 *      stage-2 evaluator runs anyway and the MORE SEVERE result wins
 *      (never a downgrade; fail-open keeps mild).
 *
 *   3. buildMildSupportResources() — the mild-severity fold. Per the
 *      established perimeter semantics (r20a-classifier.ts: "mild: include
 *      resources in response but don't block"), mild does NOT halt the
 *      evaluation; the route attaches this additive `support_resources`
 *      field to the result instead. Composed from the shared
 *      getCrisisResources() (guardrails.ts CRISIS_RESOURCES — the single
 *      source of truth for the 7-line resource list, verified 2026-07-07),
 *      never a duplicated list (PR15).
 *
 * WHAT DOES NOT LIVE HERE:
 *   - Detection: detectDistressTwoStage (r20a-classifier.ts) — reused, not
 *     re-implemented (PR15).
 *   - Synchronous enforcement: enforceDistressCheck (constraints.ts).
 *   - Redirect rendering: renderR20aRedirectResponse
 *     (substrate/r20a-audience-renderer.ts) with audience 'human_user' —
 *     this is a human tool route (cookie-session auth via requireAuth; no
 *     API-key path), so the human crisis message renders, never the
 *     developer-form payload.
 *
 * Production state: LIVE since 2026-07-07 — SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED
 * is SET in Vercel Production (`D-R20A-SCORE-CONVERSATION-ELEVENTH-ROUTE-ACTIVATION-LIVE`;
 * founder-walked Critical activation, AC7 engaged + discharged). All three
 * live smokes green: acute → the full 7-line crisis redirect with no score
 * fields; benign → the normal envelope, no distress fields; mild → the
 * evaluation proceeded WITH `result.support_resources {severity:'mild'}`
 * riding additively. This closed the S8b 0h-exit supporting blocker (c) —
 * the S8a "inside-perimeter exception" no longer exists.
 * Rollback = unset the flag + redeploy (byte-identical flag-off, test-asserted).
 *
 * Rules served: R20a (vulnerable user detection and redirection); AC2
 * (~500ms borderline-classifier latency accepted); AC4 (invocation-tested —
 * see __tests__/r20a-invocation.test.ts under the route + the
 * r20a-invocation-guard registry); AC5 (route-level perimeter addition,
 * eleventh route-level entry); PR3 (synchronous safety — the route awaits
 * the check); PR6 (Critical change); PR15 (reuse, don't rebuild).
 *
 * @compliance
 * compliance_version: CR-2026-Q3-v1
 * regulatory_references: [CR-005]
 */

import { getCrisisResources } from '@/lib/guardrails'
import type { DistressDetectionResult } from '@/lib/guardrails'
import { evaluateBorderlineDistress } from '@/lib/r20a-classifier'

// ============================================================================
// FEATURE FLAG — SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED
// ============================================================================

/**
 * Defaults to OFF. Gates the entire R20a block on /api/score-conversation.
 * When OFF (the steady-state production behaviour at build close), the route
 * is byte-identical to pre-wiring behaviour: no classifier call, no added
 * latency, no wire-shape change, no `support_resources` field.
 *
 * Independence: this flag is independent of SUBSTRATE_R20A_GATE_ENABLED (A7),
 * SUBSTRATE_CALLING_R20A_ENABLED, SUBSTRATE_REFLECT_R20A_ENABLED, and
 * SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED — five independent flags, five
 * independent activations (design spec §5.6 posture extended).
 */
export function isScoreConversationR20aEnabled(): boolean {
  return process.env.SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED === 'true'
}

// ============================================================================
// DISTRESS-CHECK SUBJECT COMPOSITION
// ============================================================================

/**
 * DISTRESS_SUBJECT_FIELD_CAP — per-field ceiling on what each submission
 * field contributes to the distress-check subject. Mirrors TEXT_LIMITS.long
 * (security.ts), which the route already enforces on `conversation` and
 * `context` at the 400 boundary — so the cap only truly bites on `format`,
 * the one field the route does not length-validate (a pre-existing gap).
 *
 * Adversarial-review fold (2026-07-07, findings F2/F6/F7): without the cap,
 * an oversized `format` (the route accepts multi-MB bodies) blows the
 * stage-2 Haiku context window and forces the classifier into its designed
 * fail-open — making the outage path INPUT-INDUCIBLE rather than
 * infrastructure-only. With the cap, the composed subject is bounded
 * (≤ ~45KB ≈ 11k tokens), comfortably inside the Haiku window, so both
 * stages always run. Disclosed residual: distress text past the first
 * 15,000 chars of a single field does not reach the classifier — the same
 * TEXT_LIMITS posture every sibling perimeter route already has. (The
 * always-on `format` length validation at the 400 boundary is a named
 * follow-up: it changes flag-off behaviour, so it cannot ride this
 * flag-gated build.)
 */
export const DISTRESS_SUBJECT_FIELD_CAP = 15000

/**
 * DISTRESS_SUBJECT_SEPARATOR — joins the submission fields into the check
 * subject. The `---` token is non-whitespace, so multi-word DISTRESS_PATTERNS
 * (which use `\s+` between words — and `\s+` matches a bare `\n\n`) cannot
 * bridge a field seam and fire a false acute on benign adjacent fields
 * (adversarial-review fold, 2026-07-07, finding F4: "…do we want to" +
 * "Die Hard marathon…" must not join into 'want to die'). Within-field
 * detection is untouched; the token is neutral prose for the stage-2
 * evaluator.
 */
export const DISTRESS_SUBJECT_SEPARATOR = '\n\n---\n\n'

/**
 * Compose the text the two-stage distress check runs over.
 *
 * Includes every human-authored free-text field the route accepts, in
 * submission order, each capped at DISTRESS_SUBJECT_FIELD_CAP chars (see
 * above — the route's own 400 boundary already holds conversation/context
 * under the cap; format is truly capped here). Non-string or empty fields
 * are skipped — the route validates `conversation` as a string before this
 * runs; `context` and `format` are optional and may be absent or malformed
 * on the wire.
 *
 * NOT the engine's 6000-word truncation: a route-valid conversation
 * (≤15,000 chars) with short words can exceed 6000 words, and distress past
 * that word cut must still reach the check — the subject is composed from
 * the raw fields, not the engine-truncated text.
 */
export function composeConversationDistressSubject(fields: {
  conversation?: unknown
  context?: unknown
  format?: unknown
}): string {
  const parts: string[] = []
  for (const value of [fields.conversation, fields.context, fields.format]) {
    if (typeof value === 'string' && value.trim().length > 0) {
      parts.push(value.slice(0, DISTRESS_SUBJECT_FIELD_CAP))
    }
  }
  return parts.join(DISTRESS_SUBJECT_SEPARATOR)
}

// ============================================================================
// MILD-ESCALATION CHECK (adversarial-review fold, 2026-07-07, finding F3)
// ============================================================================

/** Injectable stage-2 evaluator signature — production default is the shared
 *  evaluateBorderlineDistress (r20a-classifier.ts); tests inject fakes. */
export type BorderlineEvaluator = (text: string) => Promise<DistressDetectionResult>

/**
 * Escalate a stage-1 'mild' result through the stage-2 Haiku evaluator.
 *
 * WHY: the shared detectDistressTwoStage returns immediately on ANY stage-1
 * regex hit — including 'mild' — so stage 2 ("catches what regex misses")
 * never runs. On single-field routes that is a narrow window; on THIS route
 * the subject is dominated by other people's speech (up to 15,000 chars of
 * pasted multi-party transcript), so an incidental mild hit in a THIRD
 * PARTY's line would mute the Haiku look at the SUBMITTER's own
 * regex-missed distress (e.g. goodbye-letters phrasing in the context
 * field). The escalation runs stage 2 anyway on the mild path and takes the
 * MORE SEVERE result — never a downgrade (mild stays the floor; a 'none' or
 * 'mild' second opinion keeps the stage-1 mild fold).
 *
 * Fail-open-to-mild: if the evaluator throws (e.g. missing API key at
 * construction — the one throw path evaluateBorderlineDistress does not
 * catch), the stage-1 mild result is kept and the failure logged — the
 * floor never drops below what stage 1 found (ADR-R20a-01 D6-c posture).
 *
 * Cost/latency: one extra Haiku call ONLY when stage-1 found exactly 'mild'
 * (rare); same ~500ms class AC2 already accepts for borderline inputs.
 *
 * This composes the two SHARED stages differently for this route's shape;
 * it does not re-implement detection (PR15). Sibling routes keep the plain
 * two-stage semantics; the divergence is local, conservative-direction, and
 * recorded in the decision log.
 */
export async function escalateMildDistress(
  subject: string,
  mildResult: DistressDetectionResult,
  evaluator: BorderlineEvaluator = evaluateBorderlineDistress,
): Promise<DistressDetectionResult> {
  try {
    const second = await evaluator(subject)
    if (
      second.redirect_message !== null &&
      (second.severity === 'moderate' || second.severity === 'acute')
    ) {
      return second
    }
  } catch (error) {
    console.warn(
      '[R20a score-conversation] mild-escalation stage-2 failed open; keeping the stage-1 mild result.',
      error instanceof Error ? error.message : String(error),
    )
  }
  return mildResult
}

// ============================================================================
// MILD-SEVERITY SUPPORT FOLD (non-blocking)
// ============================================================================

/**
 * The additive `support_resources` field attached to the score result when
 * the check returns severity 'mild' (flag-on only). Mild does not block the
 * evaluation — the human still receives their score — but the crisis
 * resources ride along, per the classifier's documented mild semantics.
 */
export interface MildSupportResources {
  severity: 'mild'
  message: string
}

/**
 * Build the mild-severity support fold from the shared crisis-resource
 * source of truth (guardrails.ts CRISIS_RESOURCES via getCrisisResources()).
 * Wording mirrors the moderate redirect's voice, softened for a
 * non-blocking context: the evaluation proceeds; the resources are offered.
 */
export function buildMildSupportResources(): MildSupportResources {
  const resources = getCrisisResources()
  const resourceList = resources.resources
    .map((r: { name: string; contact: string; available: string }) =>
      `${r.name}: ${r.contact} (${r.available})`
    )
    .join('\n')

  return {
    severity: 'mild',
    message:
      `Some of what you've shared sounds like it might be weighing on you. ` +
      `Your evaluation is below — and if any of this reflects your own situation, support is available.\n\n` +
      `${resources.primary}\n${resourceList}\n\n${resources.closing}`,
  }
}
