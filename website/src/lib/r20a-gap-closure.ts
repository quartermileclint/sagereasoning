/**
 * r20a-gap-closure.ts — R20a perimeter helpers for the SIX routes found
 * outside the perimeter on 2026-08-17.
 *
 * ===========================================================================
 * WHY THIS MODULE EXISTS
 * ===========================================================================
 *
 * Six routes accept human practitioner free text behind `requireAuth` and ran
 * NO distress check at all. None appeared in HUMAN_FACING_POST_ROUTES, so the
 * r20a-invocation-guard battery could not see any of them:
 *
 *   1. /api/mentor/passion-classify   — the practitioner's own account of a
 *                                       passion event + their own diagnosis
 *   2. /api/mentor/passion-log        — the event description + the false
 *                                       judgement that drove the passion
 *   3. /api/skill/sage-classify       — free-text `input` + `context`
 *   4. /api/skill/sage-prioritise     — per-item descriptions + objective /
 *                                       stakeholders / criteria
 *   5. /api/mentor-baseline-response  — an array of practitioner `answer`
 *                                       fields, UNBOUNDED (no length
 *                                       validation), fed straight to the LLM
 *   6. /api/mentor/private/baseline-  — the founder-only twin of (5), same
 *      response                         shape, same missing check
 *
 * ⚠ THE COUNT MOVED THREE TIMES, NOT TWO. A first pass found 2; a second
 * independent pass found 4; a third pass (PR19, reviewing the six-route build
 * itself) found 6. A FOURTH pass — PR19 again, this time reviewing the
 * six-route ACTIVATION — found TWO MORE, confirming the module's own
 * standing warning that six was never proven final:
 *
 *   7. /api/mentor/gap4                — founder-only, up to 5000 chars of
 *                                        candid `content` + `divergence_
 *                                        description` about the founder's own
 *                                        reasoning divergence from the model
 *   8. /api/mentor/private/founder-facts — founder-only; POST appends an
 *                                        unbounded `note`; PUT bulk-replaces
 *                                        the whole FounderFacts block, which
 *                                        itself carries FOUR free-text fields
 *                                        (work_schedule, family_situation,
 *                                        financial_situation,
 *                                        retirement_horizon) plus
 *                                        additional_context: string[] — a
 *                                        LARGER unscreened surface than the
 *                                        POST note alone, found by the
 *                                        builder while wiring PR19's finding,
 *                                        not by PR19 itself
 *
 * Both 7 and 8 are founder-only — the exact class the module's own header
 * already named as NOT exempt (the passion/baseline routes precedent: "the
 * founder is a practitioner too").
 *
 * Routes 5 and 6 were caught because /api/score-scenario accepts the SAME
 * field shape and DOES screen it — the asymmetry between siblings was the
 * tell. **Eight is not proven final either**: there is still no
 * filesystem-level exhaustiveness check in the guard battery, so it is purely
 * additive and a ninth route of this shape would go unnoticed. Closing that
 * structurally remains the highest-value named follow-up.
 *
 * A practitioner could write acute distress into any of them and receive no
 * redirect and no crisis resources. This is the same defect class as the
 * /api/score-conversation gap closed 2026-07-07 (S8b blocker (c)) — except all
 * six were absent from the registry, so nothing was watching.
 *
 * HOW THE GAP AROSE, recorded so the shape is not mistaken for a design
 * choice: the 13 sibling skill routes are built on
 * `createContextTemplateHandler`, which screens at context-template.ts:112.
 * sage-classify and sage-prioritise have their OWN route.ts and therefore
 * inherited nothing. The passion routes never had a shared handler to inherit
 * from.
 *
 * ===========================================================================
 * THE AC5 CLASSIFICATION — two different reasons, one perimeter
 * ===========================================================================
 *
 * ⚠ PROVENANCE — SUPERSEDED 2026-08-17 (LATER SAME DAY): THIS IS NOW RULED.
 *
 *   The mentor RATIFIED these routes' membership, verbatim: the builder's
 *   extension "was correctly argued and is now a ruling rather than an
 *   analogy." Recorded at
 *   operations/trust-layer-2026-07/
 *     2026-08-17-mentor-ruling-limitations-perimeter-practice-family-verbatim.md
 *   (adopted: D-MENTOR-RULINGS-LIMITATIONS-PERIMETER-PRACTICE-FAMILY-AND-M4-
 *   BLAST-RADIUS-ADOPTED).
 *
 *   The SAME ruling also brings the six Remaining-Principles practice routes
 *   INSIDE the perimeter (premeditatio, hupexairesis, oikeiosis + extension,
 *   view-from-above, morning, sage-compass) — so the "NOT AFFECTED" note
 *   further down this header is ALSO superseded and is marked there.
 *
 *   The original, now-historical framing is retained below so the arc is
 *   legible — it was correct when written, and PR19 was right to force it:
 *
 *   > **The B3 ruling is scoped to /impulse (S7) ALONE.** It says nothing about
 *   > passion-classify, passion-log, or either baseline-response route. The
 *   > reasoning below EXTENDS B3 by analogy to routes the mentor has not ruled
 *   > on. That extension is the BUILDER'S judgement, not a mentor ruling, and it
 *   > is recorded as such so no future reader cites this block as though the
 *   > mentor had decided it.
 *
 *   The extension is a defensible reading — the asymmetry argument B3 makes is
 *   general, and these routes' content class is the one B3 describes — but the
 *   founder has directed that this gap closure land now (a live perimeter hole
 *   protecting nobody is the more urgent problem), and the code ships DARK
 *   behind an unset flag, so nothing is asserted publicly ahead of a ruling.
 *   **If the founder wants the membership itself ratified rather than argued,
 *   that is a mentor question and it is NOT foreclosed by this build.**
 *
 * These routes are NOT a single class, and the record should not flatten them.
 *
 * PASSION ROUTES (passion-classify, passion-log) — argued inside on the same
 * reasoning the mentor's B3 ruling (2026-08-11) applied to /impulse, against
 * the Remaining-Principles family precedent. B3, verbatim, on /impulse:
 *
 *   "It deliberately elicits shame and agonia in the practitioner's own words,
 *    beside grief, envy, and jealousy. The design premise is that the
 *    practitioner should not suppress this material — which means the tool is
 *    doing exactly what the perimeter exists to catch when it fires genuinely.
 *    A false positive costs a redirect to a non-distressed practitioner. A
 *    false negative is a practitioner writing about their shame into a tool
 *    that does not notice. The asymmetry favours inclusion."
 *
 * These two routes are arguably a PURER instance of that reasoning than
 * /impulse: their entire subject matter is the practitioner's own fear, anger,
 * grief, and craving, and `passion-log.false_judgement` asks specifically for
 * the belief that drove it. The B3 asymmetry argument applies unchanged.
 *
 * SKILL ROUTES (sage-classify, sage-prioritise) — inside on the ORDINARY
 * ground that every other human-facing free-text evaluation route is inside
 * (the five score routes, /reflect, the journal routes). They are not passion
 * tools; they are decision-support surfaces that happen to accept whatever a
 * practitioner types, and a practitioner in crisis does not confine their
 * words to the routes designed to receive them.
 *
 * ⚠ SUPERSEDED 2026-08-17 (LATER SAME DAY) — THE PRACTICE FAMILY IS NOW RULED
 * INSIDE THE PERIMETER, AND IS NOT YET BUILT. The standing AC5 question this
 * paragraph left open has been answered: /premeditatio, /hupexairesis,
 * /oikeiosis (+ /oikeiosis/extension), /view-from-above, /morning and
 * /sage-compass SHOULD JOIN. The mentor, verbatim: the family precedent
 * "reflects the original scoping of B3 to /impulse alone, not a considered
 * judgement that the practice family is lower-risk. It is not lower-risk. It is
 * the family where the material is most likely to surface acute distress."
 * /view-from-above was named the clearest case — a route for reframing
 * catastrophic loss carrying only a static footer: "That is the wrong
 * configuration."
 *
 * ⚠ THOSE SIX ROUTES ARE STILL UNPROTECTED AS OF THIS COMMENT. The build is a
 * Critical AC5 change and is the successor session's Item 1b. /logos is the one
 * genuine non-member — a static page with no route and no free-text input, so
 * out of scope rather than exempted.
 *
 * The original, now-historical framing is retained so the arc is legible:
 *
 *   > NOT AFFECTED — the recorded exclusion stands: /premeditatio, /hupexairesis,
 *   > /oikeiosis (+ /oikeiosis/extension), /view-from-above, /morning,
 *   > /sage-compass, /logos remain OUTSIDE the perimeter by the recorded family
 *   > precedent, carrying SupportFooter as their crisis exit. This module does not
 *   > touch them. Whether that family should join is a standing, separate AC5
 *   > question and is NOT resolved here.
 *
 * ===========================================================================
 * WHY ONE FLAG AND NOT SIX
 * ===========================================================================
 *
 * Every prior perimeter addition took its own flag
 * (SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED, SUBSTRATE_IMPULSE_R20A_ENABLED).
 * These six share ONE — `SUBSTRATE_R20A_GAP_CLOSURE_ENABLED` — deliberately:
 * they are one remediation of one gap, and a half-closed safety perimeter is a
 * worse state than a fully-open one, because it invites the belief that the
 * gap was handled. Atomic activation removes the failure mode where three
 * flags get set and the sixth is forgotten.
 *
 * The standing memory `shared-flag-dark-is-per-flag-not-per-feature` warns
 * that a shared flag makes "dark" a per-flag claim rather than a per-feature
 * one. That lesson is respected and is the reason this is stated explicitly:
 * this flag governs EXACTLY these six routes and nothing else. It does not
 * ride on any existing base flag, and no other feature gates on it.
 *
 * If the founder prefers staged activation (e.g. the passion pair first, on
 * the stronger B3 ground), that is a one-line split per route and the
 * composers below are already independent.
 *
 * Rules served: R20a (vulnerable user detection + redirection), AC5
 * (perimeter membership + the route-level invocation pattern), KG2 (Haiku
 * reliability boundary — the classifier model is unchanged), PR15 (reuses the
 * existing two-stage classifier and shared crisis-resource source rather than
 * re-implementing either).
 */

import { getCrisisResources } from '@/lib/guardrails'

// ============================================================================
// FEATURE FLAG
// ============================================================================

export const R20A_GAP_CLOSURE_ENV_VAR = 'SUBSTRATE_R20A_GAP_CLOSURE_ENABLED'

/**
 * Defaults OFF. Only the literal string 'true' enables — mirroring
 * isImpulseR20aEnabled / isScoreConversationR20aEnabled exactly.
 *
 * Flag UNSET => all six routes are byte-identical to their pre-2026-08-17
 * behaviour: no classifier call, no added latency, no wire-shape change, no
 * `support_resources` field. Activation is its own founder-walked Critical
 * step (AC5 + AC7).
 */
export function isR20aGapClosureEnabled(): boolean {
  return process.env[R20A_GAP_CLOSURE_ENV_VAR] === 'true'
}

// ============================================================================
// SUBJECT COMPOSITION
// ============================================================================

/**
 * Per-field cap. Matches the impulse/score-conversation precedent: each field
 * is independently capped so one oversized field cannot push a later field out
 * of the classifier's window and create an input-inducible fail-open. The
 * routes' own validators cap at TEXT_LIMITS.medium (5000) anyway, but the
 * perimeter check runs BEFORE those validators, so it cannot rely on them.
 */
export const DISTRESS_SUBJECT_FIELD_CAP = 5000

/**
 * Bounds the total composed subject regardless of how many fields arrive.
 * sage-prioritise accepts an ITEMS ARRAY of unbounded length at the point this
 * runs (its own item-count validation is later), so without a total cap a
 * caller could compose an arbitrarily large subject and push the stage-2 call
 * past its window — the same input-inducible fail-open the per-field cap
 * closes for single fields. 20 fields x 5000 is ~100KB worst case before this
 * bound; after it, the subject is always inside the Haiku window.
 */
export const DISTRESS_SUBJECT_MAX_FIELDS = 20

/**
 * The `---` token is NON-WHITESPACE on purpose.
 *
 * Multi-word DISTRESS_PATTERNS use `\s+` between words, and `\s+` matches a
 * bare `\n\n` — so a whitespace-only separator lets two benign adjacent fields
 * bridge into a false acute across the seam (the /api/score-conversation
 * review's F4 finding). The token breaks the bridge; within-field detection is
 * untouched, and it reads as neutral prose to the stage-2 evaluator.
 */
export const DISTRESS_SUBJECT_SEPARATOR = '\n\n---\n\n'

/**
 * Compose the text the two-stage distress check runs over, from an ordered
 * list of candidate values.
 *
 * NEVER THROWS. This runs BEFORE each route's own 400s in the flag-on ordering
 * (the perimeter check precedes every other rejection, so distress in an
 * otherwise-invalid body still catches), which means it receives raw,
 * unvalidated wire values and must tolerate anything — non-strings, nulls,
 * nested junk. Non-string and empty/whitespace-only values are skipped.
 *
 * Composed from the RAW values, deliberately not the trimmed/normalised ones:
 * the check runs over what the practitioner actually sent.
 */
export function composeDistressSubject(values: readonly unknown[]): string {
  const parts: string[] = []
  for (const value of values) {
    if (parts.length >= DISTRESS_SUBJECT_MAX_FIELDS) break
    if (typeof value === 'string' && value.trim().length > 0) {
      parts.push(value.slice(0, DISTRESS_SUBJECT_FIELD_CAP))
    }
  }
  return parts.join(DISTRESS_SUBJECT_SEPARATOR)
}

/**
 * Pull the free-text descriptions out of sage-prioritise's `items`, which
 * accepts BOTH shapes its route supports:
 *   - legacy: `items` is an array of plain strings, or a single newline-
 *     delimited string
 *   - structured: `items` is an array of `{ id, description }`
 *
 * Returns raw candidate values for composeDistressSubject to filter. Never
 * throws on a malformed body — see composeDistressSubject's contract.
 *
 * IMPORTANT: this must track the route's own item-parsing shapes. If a future
 * shape is added there and not here, distress in the new shape goes unseen —
 * which is precisely how this gap arose in the first place.
 */
export function collectPrioritiseItemText(items: unknown): unknown[] {
  if (typeof items === 'string') {
    // Legacy single-string form: the route splits on newlines; for detection
    // purposes the whole blob is one field, which is strictly safer (no seam).
    return [items]
  }
  if (!Array.isArray(items)) return []
  const out: unknown[] = []
  for (const item of items) {
    if (typeof item === 'string') {
      out.push(item)
    } else if (item && typeof item === 'object') {
      out.push((item as { description?: unknown }).description)
    }
  }
  return out
}

/**
 * Pull the practitioner-authored answers out of the `responses` array that
 * /api/mentor-baseline-response and /api/mentor/private/baseline-response both
 * accept: `{ responses: [{ question_id, question_text, answer }] }`.
 *
 * Collects `answer` ONLY. `question_text` is system-generated (the baseline gap
 * question the platform asked) and `question_id` is an identifier — neither is
 * practitioner prose, and including them would dilute the subject with our own
 * wording.
 *
 * Never throws on a malformed body — see composeDistressSubject's contract.
 * This runs before the routes' own `responses`-shape validation.
 */
export function collectBaselineAnswerText(responses: unknown): unknown[] {
  if (!Array.isArray(responses)) return []
  const out: unknown[] = []
  for (const r of responses) {
    if (r && typeof r === 'object') {
      out.push((r as { answer?: unknown }).answer)
    }
  }
  return out
}

/**
 * Pull the free-text fields out of a PUT /api/mentor/private/founder-facts
 * body — a full FounderFacts replacement, `{ facts: { work_schedule,
 * family_situation, financial_situation, retirement_horizon,
 * additional_context: string[], ... } }`. `age`, `years_married`, and
 * `children_ages` are numeric, never prose, and are deliberately excluded.
 *
 * Never throws on a malformed body — see composeDistressSubject's contract.
 * This runs before the route's own `facts.age` shape check.
 */
export function collectFounderFactsPutText(facts: unknown): unknown[] {
  if (!facts || typeof facts !== 'object') return []
  const f = facts as {
    work_schedule?: unknown
    family_situation?: unknown
    financial_situation?: unknown
    retirement_horizon?: unknown
    additional_context?: unknown
  }
  const out: unknown[] = [
    f.work_schedule,
    f.family_situation,
    f.financial_situation,
    f.retirement_horizon,
  ]
  if (Array.isArray(f.additional_context)) {
    out.push(...f.additional_context)
  }
  return out
}

// ============================================================================
// MILD-SEVERITY SUPPORT FOLD (non-blocking)
// ============================================================================

/**
 * The additive `support_resources` field attached to the response when the
 * check returns severity 'mild' (flag-on only). Mild does NOT block: the
 * request is served as normal and the crisis resources ride along, per the
 * classifier's documented mild semantics ("include resources in response but
 * don't block").
 */
export interface MildSupportResources {
  severity: 'mild'
  message: string
}

/**
 * THREE variants, because one wording cannot serve these families honestly.
 *
 * 'passion' — for passion-classify / passion-log. Must reassure the
 * practitioner that the examination itself was not the problem. These tools
 * ask someone to name their own fear, anger, grief or shame; a support message
 * that reads as a reprimand for having answered honestly would undo the thing
 * the tool exists to do. Mirrors /impulse's reasoning for the same reason.
 *
 * 'practice' — ADDED 2026-08-18 with the Remaining-Principles perimeter
 * closure, under founder sign-off on the exact wording. Serves the practice
 * family (premeditatio, hupexairesis, oikeiosis + extension, view-from-above,
 * morning, sage-compass) and the mentor-examination surfaces (mentor-appendix,
 * both journal-week routes, both baseline routes, mentor-profile).
 *
 *   WHY IT IS NOT 'passion': these are examinations, so the reassurance is
 *   owed — but the practitioner has usually examined no passion at all. Telling
 *   someone who just wrote a morning preparation or a sage-compass bearing that
 *   "examining a passion is not the same as being ruled by one" describes
 *   something they did not do. The reassurance has to be true of the exercise
 *   actually performed.
 *
 *   WHY IT IS NOT 'skill': /view-from-above exists to help someone reframe
 *   catastrophic loss. The mentor named it the clearest case in the family —
 *   "that is the wrong configuration" — and answering a grief disclosure in
 *   decision-support register would be its own small failure.
 *
 * 'skill' — for sage-classify / sage-prioritise, /api/compose and
 * /api/founder/hub. These are decision-support and orchestration surfaces;
 * there is no examination to reassure anyone about, and pretending otherwise
 * would be a non-sequitur to someone who came to prioritise a backlog or chain
 * two skill steps. Neutral, brief, non-presumptuous.
 *
 * The RESOURCE DATA in all three comes from the shared getCrisisResources()
 * source of truth, so a founder edit to the resource list propagates with no
 * code change here.
 */
export function buildMildSupportResources(
  variant: 'passion' | 'practice' | 'skill'
): MildSupportResources {
  const resources = getCrisisResources()
  const resourceList = resources.resources
    .map((r: { name: string; contact: string; available: string }) =>
      `${r.name}: ${r.contact} (${r.available})`
    )
    .join('\n')

  // FOUNDER-SIGNED WORDING. Each string below was approved verbatim before it
  // shipped ('passion' + 'skill' 2026-08-17; 'practice' 2026-08-18). Do not
  // reword any of them without founder sign-off on the exact replacement text —
  // this is crisis-adjacent copy shown to a practitioner the classifier has
  // just flagged.
  const opening =
    variant === 'passion'
      ? `Your entry is saved, and naming this plainly was the right thing to do — ` +
        `examining a passion is not the same as being ruled by one. ` +
        `Some of what you wrote sounds like it may be weighing on you beyond this exercise, ` +
        `so the support below is here if any of it reflects your situation right now.`
      : variant === 'practice'
      ? `Your entry is saved, and working through this deliberately was the right thing to do — ` +
        `examining something difficult is not the same as being overcome by it. ` +
        `Some of what you wrote sounds like it may be weighing on you beyond this exercise, ` +
        `so the support below is here if any of it reflects your situation right now.`
      : `Some of what you wrote sounds like it may be weighing on you beyond this task. ` +
        `The support below is here if any of it reflects your situation right now.`

  return {
    severity: 'mild',
    message: `${opening}\n\n${resources.primary}\n${resourceList}\n\n${resources.closing}`,
  }
}
