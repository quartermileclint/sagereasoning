/**
 * r20a.ts — the R20a perimeter flag for POST /api/score/save.
 *
 * Colocated with the route (the /api/mentor/impulse precedent, whose registry
 * entry reads `flagSource: './r20a'`) rather than exported from route.ts,
 * because Next.js rejects non-handler exports from a route module at
 * `next build` — and neither `tsc --noEmit` nor `tsx` catches it. That is a
 * standing lesson in this codebase (memory `nextjs-route-export-validation`),
 * learned by shipping a red deploy.
 *
 * ===========================================================================
 * WHY A DEDICATED FLAG AND NOT THE SHARED GAP-CLOSURE FLAG
 * ===========================================================================
 *
 * The obvious choice was `SUBSTRATE_R20A_GAP_CLOSURE_ENABLED`, which the other
 * 25 consumer routes share and which is already `true` in production. It was
 * rejected on two independent grounds, both from the 2026-08-31 PR19 review of
 * the reverted first attempt:
 *
 * 1. NO DARK-DEPLOY WINDOW (register M6). The shared flag being already live
 *    means deploy == activation: the live distress smoke could not precede
 *    activation. That discipline is what a dedicated flag restores, and the
 *    first attempt — which used the shared flag — shipped straight to
 *    production and had to be reverted.
 *    (CORRECTED 2026-08-31, PR19 NIT: the earlier draft of this comment said
 *    "every prior perimeter member took its own flag". That overstates it —
 *    the decision log records the shared flag as a DELIBERATE choice for its
 *    25 consumer routes, not an exception. The genuine ground here is M6/M2,
 *    stated on their own terms, not a claimed universal precedent.)
 *
 * 2. THE DOCUMENTED ROLLBACK LEVER WAS SAFETY-INVERTING (register M2). The
 *    shared flag covers 25 OTHER routes (checked 2026-08-31: grep for callers
 *    of isR20aGapClosureEnabled outside this route and its tests — 25).
 *    Unsetting it to mitigate an incident HERE
 *    would also strip distress screening from /api/mentor/passion-log,
 *    /api/mentor/passion-classify and /api/mentor/view-from-above — the grief
 *    and passion tools that are the MOST distress-likely surfaces in the
 *    product. A rollback lever that removes protection from the people most
 *    likely to need it is not a rollback lever.
 *
 * ROLLBACK FOR THIS ROUTE IS THEREFORE: unset SUBSTRATE_SCORE_SAVE_R20A_ENABLED
 * and redeploy (flag-off is a differentially-tested match to the pre-rebuild
 * route across 13 previously-accepted body shapes — perimeter-functional.test.ts
 * §17, which supersedes an earlier §6 that PR19 found tested only one short
 * valid body and did not compare against pre-rebuild behaviour at all), or
 * `git revert` the fold commits. It is
 * NOT the shared gap-closure flag, and must never be documented as such.
 *
 * The cost of a dedicated flag is that it is invisible to the gap-closure
 * wiring battery's ROUTE_WIRING machinery, whose block-extractor hardcoded the
 * shared flag name. Rather than forfeit that pin — the single highest-value
 * structural assertion available to this route, per the register's own "kills
 * C1–C5, H5, H6, H7 largely in one row" — the battery gained an optional
 * per-route `flagFn`, defaulting to the shared name so all 25 existing rows
 * stay byte-identical. The route keeps importing composeDistressSubject /
 * hasScreenableSubject / buildMildSupportResources from '@/lib/r20a-gap-closure',
 * so it remains a registry consumer and keeps the full row.
 *
 * Rules served: R20a (vulnerable user detection + redirection), AC5 (a
 * human-facing POST surface accepting practitioner free text), PR6 (Critical).
 */

/**
 * Defaults to OFF. Gates the entire R20a block on POST /api/score/save.
 *
 * When OFF (the state at build close), the route's SCREENING BEHAVIOUR is
 * byte-identical to pre-rebuild: no classifier call, no billed Haiku request,
 * no wire-shape change, no `support_resources` field, no 422, and — since
 * 2026-08-31's second fold — none of the new bounds either (they are gated
 * with the flag; see `r20aActive` in route.ts).
 * (CORRECTED 2026-08-31, PR19 LOW: "no added latency" is not quite true and
 * the earlier draft overstated it. Flag-off still imports the classifier chain
 * unconditionally, and module-load cost is measurably higher — roughly
 * +100-155ms per cold start in one isolated measurement. That is NOT
 * request-path latency and NOT a behavioural difference in what the route
 * accepts or rejects, but it is real, and "no added latency" claimed more than
 * that.)
 * Activation is a founder-walked Critical step (flag + redeploy + live smoke);
 * rollback = unset the flag.
 *
 * Independence: this flag is independent of SUBSTRATE_R20A_GATE_ENABLED (A7),
 * SUBSTRATE_CALLING_R20A_ENABLED, SUBSTRATE_REFLECT_R20A_ENABLED,
 * SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED, SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED,
 * SUBSTRATE_IMPULSE_R20A_ENABLED, SUBSTRATE_STOA_ENABLED and
 * SUBSTRATE_R20A_GAP_CLOSURE_ENABLED — one flag per perimeter surface, one
 * activation per surface.
 */
export function isScoreSaveR20aEnabled(): boolean {
  return process.env.SUBSTRATE_SCORE_SAVE_R20A_ENABLED === 'true'
}

/** The env var name, exported so tests and the activation walk agree on it. */
export const SCORE_SAVE_R20A_ENV_VAR = 'SUBSTRATE_SCORE_SAVE_R20A_ENABLED'

// ============================================================================
// PERSISTED-WINDOW BOUNDS — the register's H3, closed by LOWERING the window
// ============================================================================

/**
 * The screening window is DISTRESS_SUBJECT_FIELD_CAP (5000) per field, applied
 * by composeDistressSubject. Register H3 (CONFIRMED): the columns are unbounded
 * TEXT, so a 6,339-character `action` screened as its first 5,000 characters
 * while the FULL text persisted — stage 1 firing `acute` on the whole and
 * `none` on the screened portion. Unscreened distress persisted.
 *
 * The fix is NOT to raise the screening cap (that would re-open the
 * input-inducible fail-open the per-field cap closes on multi-field routes, and
 * the module's own docstring forbids it). The fix is to establish
 * SCREENED WINDOW >= PERSISTED WINDOW by bounding what may persist.
 *
 * The bound is asymmetric BY PROVENANCE, because a 400 is only a fair failure
 * mode where the person on the other end can act on it:
 *
 *   - PRACTITIONER-TYPED (action, context, relationships, emotional_state) →
 *     validated, 400 on breach. The practitioner wrote it and can shorten it.
 *     `action` is bounded at TEXT_LIMITS.short (2000) to MATCH /api/score's own
 *     inbound bound, so this route can never reject something its upstream
 *     evaluator accepted.
 *
 *   - ENGINE-AUTHORED (philosophical_reflection, improvement_path,
 *     oikeiosis_context, ruling_faculty_state) → TRUNCATED to the screening cap,
 *     never 400. The practitioner did not write these and cannot shorten them;
 *     a 400 here would be an unfixable-by-the-user save failure on text they
 *     never authored. Every truncation is LOGGED (never silent) — this table
 *     already survived four months of silent write failure (2026-03-21 →
 *     2026-07-26) and must never silently alter what it stores again.
 *
 *   - JSONB (false_judgements, passions_detected) → rejected when the
 *     serialized value exceeds the cap, because validateTextLength does not
 *     apply to a structure.
 *
 * VERIFIED (2026-08-31, first-hand): there is NO length bound on the four
 * engine fields at ANY layer — not the prompt (only philosophical_reflection
 * carries "2-3 sentences"; oikeiosis_context is not in the prompt at all, it is
 * synthesised post-hoc from `result.oikeiosis`), not /api/score, not this
 * route, not the database. Any number chosen here is their first bound ever.
 * The largest comparable recorded value in-repo is 1,376 characters, so 5,000
 * sits ~3.6x above observed maxima — but that corpus is a DIFFERENT generator
 * (the /api/reason translation sandwich), so truncate-not-400 is chosen
 * precisely so the design is correct whichever way the real distribution falls.
 */
export const SCORE_SAVE_PERSISTED_FIELD_CAP = 5000
