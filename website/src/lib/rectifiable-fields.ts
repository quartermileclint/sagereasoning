/**
 * rectifiable-fields.ts
 *
 * The GDPR Article 16 (rectification) correctable-field allow-list for
 * /api/user/rectify (A15c), and the PURE validation of a submitted set of
 * corrections against it.
 *
 * Allow-list rationale (D-A15C-RECTIFICATION-ENDPOINT-BUILT-2026-06-07): only
 * user-supplied FACTUAL profile fields are rectifiable. Derived/inferred data
 * (passion maps, virtue profile, alignment scores) is not "rectified" — it is
 * regenerated or deleted. Intimate R17b free-text (journal / realtime entries)
 * is revised through normal product flows. The login email is auth-controlled
 * and excluded (it would pull this Critical surface into authentication /
 * re-verification). Keeping the allow-list to non-intimate profile facts also
 * keeps the before/after audit log free of any intimate/encrypted data.
 *
 * Rules: R17 (data protection), R17h (Article 16 rectification), R18/R19 (honest
 * positioning).
 */

import { validateTextLength } from '@/lib/security'

/** The columns on `profiles` a user may rectify via /api/user/rectify. */
export const RECTIFIABLE_FIELDS = ['display_name', 'city', 'country'] as const

export type RectifiableField = (typeof RECTIFIABLE_FIELDS)[number]

/** Human-readable labels (used in validation error messages). */
export const RECTIFIABLE_FIELD_LABELS: Record<RectifiableField, string> = {
  display_name: 'Display name',
  city: 'City',
  country: 'Country',
}

/** Max length accepted for any single rectifiable value. */
export const RECTIFY_MAX_LENGTH = 200

/** Type-guard: is `key` an allow-listed rectifiable field? */
export function isRectifiableField(key: string): key is RectifiableField {
  return (RECTIFIABLE_FIELDS as readonly string[]).includes(key)
}

export interface RectifyValidationResult {
  /** The validated, allow-listed corrections (field → new value). Empty if invalid. */
  corrections: Partial<Record<RectifiableField, string>>
  /** A human-readable error if the submission is invalid; null if OK. */
  error: string | null
}

/**
 * PURE validation of the raw `corrections` payload from the request body.
 *
 * Accepts only allow-listed string fields within RECTIFY_MAX_LENGTH. Rejects: a
 * non-object payload; an empty correction set; any key not in the allow-list;
 * any non-string value; any value exceeding the length limit. Returns the
 * sanitised corrections + a null error on success, or an empty set + an error.
 *
 * No I/O — the unit-testable core of the route (factored per PR2). The route
 * performs auth, the before-image read, the update, and the audit write around
 * this.
 */
export function validateRectifyCorrections(raw: unknown): RectifyValidationResult {
  const fail = (error: string): RectifyValidationResult => ({ corrections: {}, error })

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return fail(
      'Request body must include a "corrections" object mapping field names to new values, ' +
        'e.g. { "corrections": { "city": "Athens" } }.'
    )
  }

  const entries = Object.entries(raw as Record<string, unknown>)
  if (entries.length === 0) {
    return fail('No corrections supplied. Provide at least one of: ' + RECTIFIABLE_FIELDS.join(', ') + '.')
  }

  const corrections: Partial<Record<RectifiableField, string>> = {}
  for (const [key, value] of entries) {
    if (!isRectifiableField(key)) {
      return fail(
        `Field "${key}" is not rectifiable via this endpoint. Correctable fields: ${RECTIFIABLE_FIELDS.join(', ')}.`
      )
    }
    if (typeof value !== 'string') {
      return fail(`Value for "${key}" must be a string.`)
    }
    const lengthError = validateTextLength(value, RECTIFIABLE_FIELD_LABELS[key], RECTIFY_MAX_LENGTH)
    if (lengthError) {
      return fail(lengthError)
    }
    corrections[key] = value
  }

  if (Object.keys(corrections).length === 0) {
    return fail('No valid corrections supplied.')
  }

  return { corrections, error: null }
}
