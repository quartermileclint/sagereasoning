/**
 * score-save-response.ts — how a caller must read POST /api/score/save.
 *
 * ===========================================================================
 * WHY THIS EXISTS AS A PURE, SEPARATELY-TESTED FUNCTION
 * ===========================================================================
 *
 * The 2026-08-31 revert of the first /api/score/save perimeter build was NOT
 * caused by the detection layer. Detection worked. The route correctly refused
 * to persist a record carrying acute distress. The defect was entirely in the
 * RESPONSE-HANDLING layer:
 *
 *   - the route returned the distress redirect as HTTP 200
 *   - score/page.tsx read `saveRes.ok` as success
 *   - so it called setSaved(true) on a record that was never written
 *   - and `distressRedirect` was bound only to the /api/score response, so the
 *     crisis resources were never rendered
 *
 * Net outcome for a practitioner who wrote acute distress into
 * `emotional_state`: a silently unsaved record, the word "saved", and no crisis
 * resources — worse than the unscreened state it replaced, for exactly the
 * population the perimeter exists to protect.
 *
 * The mentor's ruling puts this layer explicitly in scope: "the calling page's
 * handling of that response is in scope for the PR19 review — the prior
 * implementation's failure was at the response-handling layer, and the review
 * must verify that layer explicitly, not only the detection layer."
 *
 * So the discrimination lives here, as a pure function with its own unit tests,
 * rather than inline in a 900-line React component where it is reviewable only
 * by reading the whole handler.
 *
 * ===========================================================================
 * IT KEYS ON THE BODY, NOT THE STATUS — deliberately
 * ===========================================================================
 *
 * The route returns 422 on detection, and 422 is load-bearing (the page must
 * not read it as success). But the DISCRIMINATOR keys on the body flag, because:
 *
 *   - the route has several other 400s (validation) and a 500 (insert failure),
 *     and the page must tell "we have paused this evaluation" apart from
 *     "you forgot a field" — a status-only rule cannot
 *   - if a future change altered the status, keying on status would silently
 *     resume showing a scoring card to someone in crisis; keying on the body
 *     degrades to `error` instead, which is wrong but SAFE
 *
 * The status is still pinned, in the gap-closure wiring battery's ROUTE_WIRING
 * row (`redirectStatus: 422`), bound to the same NextResponse.json call as the
 * payload. Body-keying here and status-pinning there are complementary, not
 * redundant.
 */

export type SaveResponseKind = 'distress' | 'ok' | 'error'

/** The distress payload shape the route returns on detection. */
export interface SaveDistressPayload {
  severity: string
  redirect_message: string
}

/**
 * Classify a /api/score/save response.
 *
 * `body` is whatever `await res.json()` produced, or null if the body was
 * absent or unparseable — a Response body is single-use, so the caller must
 * read it ONCE and pass the result in.
 *
 * Returns 'distress' ONLY when the body genuinely carries a rendered crisis
 * message: `distress_detected === true` AND a non-empty string
 * `redirect_message`. A truthy flag with no message would otherwise route the
 * practitioner to a crisis card with nothing in it — silence where support
 * should be, which is the failure mode this whole change exists to prevent.
 */
export function classifySaveResponse(status: number, body: unknown): SaveResponseKind {
  if (body && typeof body === 'object') {
    const b = body as Record<string, unknown>
    if (
      b.distress_detected === true &&
      typeof b.redirect_message === 'string' &&
      b.redirect_message.trim().length > 0
    ) {
      return 'distress'
    }
  }
  return status >= 200 && status < 300 ? 'ok' : 'error'
}

/** Extract the distress payload once classifySaveResponse has returned
 *  'distress'. Severity falls back to 'acute' rather than to a blank or a
 *  lower severity: if the server flagged distress but the severity is
 *  unreadable, treating it as the most serious case is the safe direction. */
export function readSaveDistressPayload(body: unknown): SaveDistressPayload {
  const b = (body ?? {}) as Record<string, unknown>
  return {
    severity: typeof b.severity === 'string' && b.severity ? b.severity : 'acute',
    redirect_message: typeof b.redirect_message === 'string' ? b.redirect_message : '',
  }
}

/** The additive mild fold the route attaches to a SUCCESSFUL save. Absent on
 *  every other path — silence is an absent field, never `support_resources: null`. */
export function readSaveSupportMessage(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null
  const support = (body as Record<string, unknown>).support_resources
  if (!support || typeof support !== 'object') return null
  const message = (support as Record<string, unknown>).message
  return typeof message === 'string' && message.trim().length > 0 ? message : null
}
