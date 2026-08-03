/**
 * stoa-r20a.ts — R20a perimeter helpers for the Stoa declaration route (ST3).
 *
 * The declaration route (/api/mentor/stoa POST + PATCH) is the TWELFTH
 * route-level member of the R20a human-distress perimeter (AC5 recorded
 * decision, ST3 2026-08-03): free text a person writes about what they bring,
 * what they seek, and how to reach them is exactly the input class the
 * perimeter exists for. The browse route takes no free text and stays
 * outside (the r20a-invocation-guard precedent).
 *
 * Follows the eleventh-route layout (score-conversation-r20a.ts): the pure,
 * testable pieces live in this sibling module because route.ts rejects
 * non-handler exports at build (memory: nextjs-route-export-validation).
 *
 * FLAG POSTURE (a deliberate divergence from the eleventh route, recorded):
 * no dedicated R20a flag. The whole route is dark behind SUBSTRATE_STOA_ENABLED
 * (503 before any work), so flag-off byte-identity is structural, and the
 * perimeter check is UNCONDITIONAL on the flag-on path — the route never
 * exists live without its distress check. The guard registry pairs the route
 * with isStoaEnabled (stoa-store) as its flag.
 *
 * WHAT DOES NOT LIVE HERE (PR15 — reused, never re-implemented):
 *   - Detection: detectDistressTwoStage (r20a-classifier.ts)
 *   - Enforcement: enforceDistressCheck (constraints.ts)
 *   - Rendering: renderR20aRedirectResponse (substrate/r20a-audience-renderer)
 *     at audience 'human_user' — a cookie/JWT human route, never the
 *     developer form.
 *
 * MILD SEMANTICS: mild does not block (the classifier's documented mild
 * semantics); the declaration saves and the crisis resources ride the
 * response as the additive `support_resources` field. The route ALSO runs
 * the eleventh route's mild-escalation pass (escalateMildDistress, reused —
 * PR15): this is a COMPOSED MULTI-FIELD subject, so a stage-1 mild hit in
 * one field (past-tense peer-support framing in what_i_bring, or third-party
 * language natural to a directory entry) would otherwise mute the Haiku look
 * at another field's regex-missed distress (PR19 fold, 2026-08-03 — the
 * first draft omitted the pass on a first-person-text rationale that
 * defended only the third-party variant).
 *
 * TAGS ARE IN THE SUBJECT (PR19 fold, 2026-08-03, MEDIUM): tags are
 * human-authored free text (≤12 × ≤40 chars) served publicly — the first
 * draft's composer read only the three prose fields, so a tags-only PATCH
 * composed to '' and skipped the classifier entirely while still writing.
 * Tags now join the subject as a fourth part, comma-joined (', ' is
 * non-whitespace, so multi-word DISTRESS_PATTERNS cannot bridge ACROSS two
 * tags, while a phrase INSIDE one tag is caught).
 *
 * Rules served: R20a; AC5 (twelfth route-level entry); PR3 (awaited); PR6
 * (Critical element); PR15.
 */

import { getCrisisResources } from '@/lib/guardrails'

// ============================================================================
// DISTRESS-CHECK SUBJECT COMPOSITION
// ============================================================================

/**
 * Per-field cap on the composed subject. The store's own field cap is 2,000
 * chars (FIELD_MAX) and the route 400s above it, so this cap matches — the
 * composed subject is bounded at ~6KB, comfortably inside the stage-2 Haiku
 * window (both stages always run; the outage path is never input-inducible —
 * the eleventh route's F2/F6/F7 lesson applied at design time).
 */
export const STOA_DISTRESS_FIELD_CAP = 2000

/**
 * The field-seam separator — the eleventh route's F4 lesson: multi-word
 * DISTRESS_PATTERNS use `\s+` between words, and `\s+` matches a bare
 * `\n\n`, so benign adjacent fields must not join into a false acute. The
 * `---` token is non-whitespace and cannot be bridged; within-field
 * detection is untouched.
 */
export const STOA_DISTRESS_SEPARATOR = '\n\n---\n\n'

/**
 * Compose the text the two-stage distress check runs over: EVERY
 * human-authored free-text surface of the declaration, in form order, each
 * part capped — the three prose fields plus the tags (comma-joined into one
 * part; see the header's tags note). Non-string / empty parts are skipped
 * (all fields are voluntary). A declaration with no text anywhere composes
 * to '' — the stage-1 regex floor runs and finds nothing, honestly.
 */
export function composeStoaDistressSubject(fields: {
  whatIBring?: unknown
  whatISeek?: unknown
  contactChannel?: unknown
  tags?: unknown
}): string {
  const parts: string[] = []
  for (const value of [fields.whatIBring, fields.whatISeek, fields.contactChannel]) {
    if (typeof value === 'string' && value.trim().length > 0) {
      parts.push(value.slice(0, STOA_DISTRESS_FIELD_CAP))
    }
  }
  if (Array.isArray(fields.tags)) {
    const tagText = fields.tags
      .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
      .map((t) => t.trim())
      .join(', ')
    if (tagText.length > 0) parts.push(tagText.slice(0, STOA_DISTRESS_FIELD_CAP))
  }
  return parts.join(STOA_DISTRESS_SEPARATOR)
}

// ============================================================================
// MILD-SEVERITY SUPPORT FOLD (non-blocking)
// ============================================================================

export interface StoaMildSupportResources {
  severity: 'mild'
  message: string
}

/**
 * The additive `support_resources` field attached to a declare/edit response
 * when the check returns severity 'mild'. The declaration still saves — the
 * resources are offered, in the declaration's own register (not the scoring
 * routes' "your evaluation is below"). Composed from the shared
 * getCrisisResources() single source of truth (PR15).
 */
export function buildStoaMildSupportResources(): StoaMildSupportResources {
  const resources = getCrisisResources()
  const resourceList = resources.resources
    .map((r: { name: string; contact: string; available: string }) =>
      `${r.name}: ${r.contact} (${r.available})`
    )
    .join('\n')

  return {
    severity: 'mild',
    message:
      `Some of what you've written sounds like it might be weighing on you. ` +
      `Your declaration has been saved — and if any of this reflects your own situation, support is available.\n\n` +
      `${resources.primary}\n${resourceList}\n\n${resources.closing}`,
  }
}
