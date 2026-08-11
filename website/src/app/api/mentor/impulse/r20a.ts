/**
 * r20a.ts — R20a perimeter helpers for /api/mentor/impulse (the primal-impulse
 * examination tool, S7).
 *
 * *** THE AC5 DEPARTURE, RECORDED (mentor ruling B3, 2026-08-11). ***
 *
 * Every other Remaining-Principles human-practitioner tool (/premeditatio,
 * /hupexairesis, /oikeiosis, /view-from-above, /morning, /sage-compass,
 * /logos) sits OUTSIDE the R20a human-distress perimeter by precedent,
 * carrying SupportFooter as its crisis exit. THIS TOOL IS INSIDE IT. That is a
 * deliberate, ruled DEPARTURE from family precedent, and AC5 requires the
 * departure and its reason to be recorded here in the code as well as in the
 * decision log — because every sibling records the opposite decision, so a
 * future reader would otherwise read this one as an error.
 *
 * The mentor's reason, verbatim (2026-08-11 ruling, B3):
 *
 *   "The family precedent is outside. This tool is different in kind. It
 *    deliberately elicits shame and agonia in the practitioner's own words,
 *    beside grief, envy, and jealousy. The design premise is that the
 *    practitioner should not suppress this material — which means the tool is
 *    doing exactly what the perimeter exists to catch when it fires genuinely.
 *    A false positive costs a redirect to a non-distressed practitioner. A
 *    false negative is a practitioner writing about their shame into a tool
 *    that does not notice. The asymmetry favours inclusion. Ruling: inside the
 *    perimeter."
 *
 * Concretely: `aischyne` (shame — "fear of ill-repute") and `agonia` (agony —
 * "fear of an uncertain outcome") are NAMED, SELECTABLE sub-species of this
 * exercise, and the vocabulary sits beside `lupe`'s — `penthos` (grief),
 * `phthonos` (envy), `zelotypia` (jealousy), `achos` (anxiety "that weighs on
 * the mind without clear object"). A tool that asks a practitioner to write,
 * specifically and at length, about their own shame or dread is materially
 * closer to the perimeter than one asking which virtue a decision engages.
 *
 * ---------------------------------------------------------------------------
 * WHAT LIVES HERE (and why not in route.ts):
 *   Next.js rejects non-handler exports from route.ts at `next build` (memory:
 *   nextjs-route-export-validation), so the pure, testable pieces live in this
 *   colocated sibling module — the same split /api/score-conversation uses
 *   (src/lib/score-conversation-r20a.ts), kept inside this tool's own directory
 *   so the whole tool reverts as one unit.
 *
 *   1. isImpulseR20aEnabled() — the feature flag. Mirrors the posture of
 *      isScoreConversationR20aEnabled / isCallingR20aEnabled: defaults OFF;
 *      only the literal string 'true' enables. Flag UNSET => the route is
 *      byte-identical to flag-off behaviour (no classifier call, no added
 *      latency, no wire-shape change, no `support_resources` field).
 *      Activation is its own founder-walked Critical step.
 *
 *   2. composeImpulseDistressSubject() — decides WHAT text the two-stage check
 *      runs over: every practitioner-authored free-text field on the
 *      submission, in question order, each capped at
 *      DISTRESS_SUBJECT_FIELD_CAP. Both modes' fields are accepted; absent
 *      fields are skipped, so one composer serves both the
 *      DIAGNOSTIC_SEQUENCE mode and the reciprocity mode without branching.
 *
 *   3. buildMildSupportResources() — the mild-severity fold. Per the
 *      established perimeter semantics (r20a-classifier.ts: "mild: include
 *      resources in response but don't block"), mild does NOT halt the entry;
 *      the route attaches this additive `support_resources` field instead.
 *      The RESOURCE DATA comes from the shared getCrisisResources()
 *      (guardrails.ts CRISIS_RESOURCES — the single source of truth, PR15);
 *      only the WORDING is authored here, because this tool's non-blocking
 *      context differs from /api/score-conversation's ("your entry is saved",
 *      not "your evaluation is below").
 *
 * WHAT IS REUSED, NOT REBUILT (PR15):
 *   - Detection: detectDistressTwoStage (r20a-classifier.ts).
 *   - Synchronous enforcement: enforceDistressCheck (constraints.ts).
 *   - Redirect rendering: renderR20aRedirectResponse
 *     (substrate/r20a-audience-renderer.ts) at audience 'human_user' — this is
 *     a cookie-session human route with no API-key path, so the human crisis
 *     message renders and the developer-form payload is unreachable.
 *   - Mild escalation: escalateMildDistress (score-conversation-r20a.ts),
 *     re-exported below. See its doc for THIS route's distinct rationale.
 *   - The crisis resource list: getCrisisResources (guardrails.ts).
 *
 * Rules served: R20a (vulnerable user detection and redirection); AC2 (~500ms
 * borderline-classifier latency accepted); AC4 (invocation-tested — see
 * __tests__/r20a-invocation.test.ts + the r20a-invocation-guard registry);
 * AC5 (route-level perimeter addition — the FOURTEENTH route-level entry, a
 * recorded departure from family precedent); PR3 (synchronous safety — the
 * route awaits the check); PR6 (Critical change); PR15 (reuse, don't rebuild).
 *
 * @compliance
 * compliance_version: CR-2026-Q3-v1
 * regulatory_references: [CR-005]
 */

import { getCrisisResources } from '@/lib/guardrails'
import { escalateMildDistress } from '@/lib/score-conversation-r20a'

/**
 * Re-exported so the route imports its whole R20a surface from one module.
 *
 * WHY THIS ROUTE NEEDS THE ESCALATION — a DIFFERENT reason from the route it
 * is borrowed from, and worth stating so a future reader does not assume the
 * rationale transfers unexamined:
 *
 *   On /api/score-conversation the escalation exists because the subject is
 *   dominated by OTHER PEOPLE's pasted speech, so a third party's incidental
 *   mild language could mute stage 2 for the submitter's own regex-missed
 *   distress (its review finding F3).
 *
 *   Here every field is the practitioner's own words about their own impulse —
 *   single-party — so that specific failure does not apply. The reason the
 *   escalation is still needed is stronger and structural to THIS tool: its
 *   inputs are distress-adjacent BY DESIGN. A practitioner examining
 *   `aischyne` or `agonia` is being asked, deliberately, to write about shame
 *   and dread in specific first-person terms. A stage-1 regex hit at 'mild' is
 *   therefore both COMMON here and nearly uninformative about true severity —
 *   and the shared detectDistressTwoStage returns immediately on ANY stage-1
 *   hit, including 'mild', so stage 2 ("catches what regex misses") would
 *   never run on precisely the population this tool exists to serve.
 *
 * The escalation runs stage 2 anyway on the mild path and takes the MORE
 * SEVERE result — never a downgrade; a throw fails open keeping the stage-1
 * mild floor (ADR-R20a-01 D6-c posture).
 */
export { escalateMildDistress }

// ============================================================================
// FEATURE FLAG — SUBSTRATE_IMPULSE_R20A_ENABLED
// ============================================================================

/**
 * Defaults to OFF. Gates the entire R20a block on /api/mentor/impulse.
 *
 * When OFF (the state at build close), the route is byte-identical to
 * flag-off behaviour: no classifier call, no added latency, no wire-shape
 * change, no `support_resources` field. Activation is a founder-walked
 * Critical step (flag + redeploy + live smoke); rollback = unset the flag.
 *
 * Independence: this flag is independent of SUBSTRATE_R20A_GATE_ENABLED (A7),
 * SUBSTRATE_CALLING_R20A_ENABLED, SUBSTRATE_REFLECT_R20A_ENABLED,
 * SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED, SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED,
 * and SUBSTRATE_STOA_ENABLED — one flag per perimeter surface, one activation
 * per surface.
 */
export function isImpulseR20aEnabled(): boolean {
  return process.env.SUBSTRATE_IMPULSE_R20A_ENABLED === 'true'
}

// ============================================================================
// DISTRESS-CHECK SUBJECT COMPOSITION
// ============================================================================

/**
 * DISTRESS_SUBJECT_FIELD_CAP — per-field ceiling on what each submission field
 * contributes to the check subject. Set to 5000 to mirror TEXT_LIMITS.medium,
 * which the route already enforces on every free-text field at its own 400
 * boundary — so in normal operation the cap never bites, and it exists as the
 * structural guarantee that a malformed or oversized body can never blow the
 * stage-2 Haiku context window and force the classifier into its designed
 * fail-open. (The /api/score-conversation review's F2/F6/F7 finding: without a
 * cap, the outage path becomes INPUT-INDUCIBLE rather than
 * infrastructure-only.)
 *
 * With the cap, the whole subject is bounded at 6 x 5000 + separators
 * (~30KB ~ 8k tokens), comfortably inside the Haiku window, so both stages
 * always run.
 */
export const DISTRESS_SUBJECT_FIELD_CAP = 5000

/**
 * DISTRESS_SUBJECT_SEPARATOR — joins the fields into the check subject.
 *
 * The `---` token is NON-WHITESPACE on purpose. Multi-word DISTRESS_PATTERNS
 * use `\s+` between words, and `\s+` matches a bare `\n\n` — so a whitespace-
 * only separator lets two benign adjacent fields bridge into a false acute
 * across the seam (the /api/score-conversation review's F4 finding). The token
 * breaks the bridge; within-field detection is untouched, and the token reads
 * as neutral prose to the stage-2 evaluator.
 *
 * Defined locally rather than imported: the separator is a per-route
 * formatting choice, and duplicating a six-character constant is not the kind
 * of duplication PR15 forbids (logic is reused — see escalateMildDistress
 * above — formatting is not).
 */
export const DISTRESS_SUBJECT_SEPARATOR = '\n\n---\n\n'

/**
 * Every practitioner-authored free-text field this route accepts, in question
 * order. Both modes' fields appear here; the composer skips whatever is absent,
 * so ONE composer serves the DIAGNOSTIC_SEQUENCE mode and the reciprocity mode
 * without branching — and, importantly, a future mode that adds a field only
 * has to add it to this list to be inside the perimeter.
 *
 * Order matters only for readability of the composed subject; detection is
 * order-independent.
 */
export interface ImpulseDistressFields {
  /** Step 1 — the specific impression (required in BOTH modes). */
  impression?: unknown
  /** Step 2 — the false belief that drove the assent (DIAGNOSTIC_SEQUENCE mode). */
  false_belief?: unknown
  /** Step 3 — optional elaboration on whether the impulse exceeded reason. */
  impulse_note?: unknown
  /** Step 5 — the correct judgement that would replace the false one. */
  correct_judgement?: unknown
  /** Reciprocity mode, question 1 — the practitioner's answer in their own words. */
  cooperation_ground_note?: unknown
  /** Reciprocity mode, question 2 — the counterfactual. */
  counterfactual?: unknown
}

/**
 * Compose the text the two-stage distress check runs over.
 *
 * Includes every human-authored free-text field the route accepts, each capped
 * at DISTRESS_SUBJECT_FIELD_CAP chars. Non-string or empty/whitespace-only
 * fields are skipped — the route validates types before this runs, but the
 * composer must not throw on a malformed wire body, because it runs BEFORE the
 * route's own 400s in the flag-on ordering (the perimeter check precedes every
 * other rejection, so distress in an otherwise-invalid body still catches).
 *
 * Deliberately NOT composed from the trimmed/normalised values: the check runs
 * over what the practitioner actually sent.
 */
export function composeImpulseDistressSubject(fields: ImpulseDistressFields): string {
  const parts: string[] = []
  for (const value of [
    fields.impression,
    fields.false_belief,
    fields.impulse_note,
    fields.correct_judgement,
    fields.cooperation_ground_note,
    fields.counterfactual,
  ]) {
    if (typeof value === 'string' && value.trim().length > 0) {
      parts.push(value.slice(0, DISTRESS_SUBJECT_FIELD_CAP))
    }
  }
  return parts.join(DISTRESS_SUBJECT_SEPARATOR)
}

// ============================================================================
// MILD-SEVERITY SUPPORT FOLD (non-blocking)
// ============================================================================

/**
 * The additive `support_resources` field attached to the response when the
 * check returns severity 'mild' (flag-on only). Mild does not block: the entry
 * is saved and returned as normal, and the crisis resources ride along, per
 * the classifier's documented mild semantics.
 */
export interface MildSupportResources {
  severity: 'mild'
  message: string
}

/**
 * Build the mild-severity support fold from the shared crisis-resource source
 * of truth (guardrails.ts CRISIS_RESOURCES via getCrisisResources()) — so a
 * founder edit to the resource list propagates here with no code change.
 *
 * The WORDING is this tool's own, and deliberately so. It must do something no
 * sibling's wording has to do: reassure the practitioner that the examination
 * itself was not the problem. The whole design premise of this tool (the S1
 * reframe) is that noticing a primal impulse is not failing — it is generating
 * examination material — so a support message that reads as a reprimand for
 * having written honestly would undo the thing the tool exists to do.
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
      `Your entry is saved, and naming this plainly was the right thing to do — ` +
      `examining an impulse is not the same as being ruled by one. ` +
      `Some of what you wrote sounds like it may be weighing on you beyond this exercise, ` +
      `so the support below is here if any of it reflects your situation right now.\n\n` +
      `${resources.primary}\n${resourceList}\n\n${resources.closing}`,
  }
}
