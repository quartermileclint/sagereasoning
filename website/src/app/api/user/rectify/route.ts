/**
 * @compliance
 * compliance_version: CR-2026-Q2-v1
 * last_regulatory_review: 2026-06-07
 * applicable_jurisdictions: [AU, EU, US]
 * regulatory_references: [CR-GDPR-A16-RECTIFICATION]
 * review_cycle: quarterly
 * owner: founder
 * next_review_due: 2026-07-06
 * change_trigger: [GDPR amendment, AU Privacy Act reform]
 * deprecation_flag: false
 */

/**
 * POST /api/user/rectify  (A15c — GDPR Article 16, Right to Rectification)
 *
 * Lets the authenticated user correct a small allow-list of factual profile
 * fields (display_name, city, country — see rectifiable-fields.ts). Every change
 * is recorded with its before/after values in an immutable, server-write-only
 * compliance log (compliance_rectification_log; no raw PII identifier — the
 * subject is a SHA-256 hash). Self-service only: a user can only rectify their
 * own profile (the update is hard-scoped to `id = <caller>`). Rate-limited
 * (RATE_LIMITS.dataRights — 5/hour, shared with the Art 15 access surface).
 *
 * No-op corrections (submitted value already equals the stored value) are not
 * written and not audited, so the audit log reflects genuine changes only.
 *
 * Critical surface (R17f + PR6): any change here follows the Critical Change
 * Protocol.
 *
 * Rules: R17 (data protection), R17h (Article 16 rectification — surface,
 * before/after audit, rate-limiting), R18/R19 (honest positioning).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import {
  requireAuth,
  corsHeaders,
  corsPreflightResponse,
  checkRateLimit,
  RATE_LIMITS,
} from '@/lib/security'
import { supabaseAdmin } from '@/lib/supabase-server'
import {
  RECTIFIABLE_FIELDS,
  validateRectifyCorrections,
  type RectifiableField,
} from '@/lib/rectifiable-fields'

export async function OPTIONS() {
  return corsPreflightResponse()
}

interface RectifiedField {
  field: RectifiableField
  old_value: string | null
  new_value: string
}

export async function POST(request: NextRequest) {
  const headers = { ...corsHeaders(), 'Content-Type': 'application/json' }

  // 1. Rate-limit (sensitive, infrequent self-service op; shared data-rights bucket).
  const rateLimited = checkRateLimit(request, RATE_LIMITS.dataRights)
  if (rateLimited) return rateLimited

  // 2. Authenticate — strictly self-service; a user can only rectify their own profile.
  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  // 3. Parse + validate the requested corrections against the allow-list (pure).
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON: { "corrections": { field: value } }.' },
      { status: 400, headers }
    )
  }
  // Accept either { corrections: {...} } or a bare {...} map.
  const correctionsInput =
    body !== null && typeof body === 'object' && !Array.isArray(body) && 'corrections' in body
      ? (body as { corrections: unknown }).corrections
      : body
  const { corrections, error: validationError } = validateRectifyCorrections(correctionsInput)
  if (validationError) {
    return NextResponse.json(
      { error: validationError, correctable_fields: RECTIFIABLE_FIELDS },
      { status: 400, headers }
    )
  }

  const fields = Object.keys(corrections) as RectifiableField[]

  // 4. Read the current values (before-image for the audit + to skip no-op writes).
  const { data: current, error: readError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (readError) {
    return NextResponse.json(
      { error: 'Could not read your profile to rectify it. No change was made.' },
      { status: 500, headers }
    )
  }
  if (!current) {
    return NextResponse.json(
      { error: 'No profile found for your account. No change was made.' },
      { status: 404, headers }
    )
  }

  const currentRow = current as Record<string, unknown>

  // Determine which fields actually change (skip no-ops so the audit is meaningful).
  const rectified: RectifiedField[] = []
  const updatePayload: Record<string, string> = {}
  for (const field of fields) {
    const oldRaw = currentRow[field]
    const oldValue = oldRaw == null ? null : String(oldRaw)
    const newValue = corrections[field] as string
    if (oldValue === newValue) continue // no-op; nothing to rectify
    updatePayload[field] = newValue
    rectified.push({ field, old_value: oldValue, new_value: newValue })
  }

  if (rectified.length === 0) {
    return NextResponse.json(
      {
        message: 'No changes applied — the submitted values already match your stored data.',
        rectified: [],
      },
      { status: 200, headers }
    )
  }

  // 5. Apply the correction (self-service: hard-scoped to the caller's own row).
  updatePayload.updated_at = new Date().toISOString()
  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update(updatePayload)
    .eq('id', userId)

  if (updateError) {
    return NextResponse.json(
      { error: 'Could not apply the correction. No change was made.' },
      { status: 500, headers }
    )
  }

  // 6. Write the immutable before/after audit (R17h) — one row per changed field.
  //    No raw PII identifier: the subject is a one-way SHA-256 hash of the user id.
  //    Unlike the A15b access log (procedural), this audit IS the legal obligation,
  //    so a write failure is surfaced (HTTP 207) rather than silently swallowed
  //    (KG1: the write is awaited and the error is handled, not allowed-on-error).
  const subjectHash = createHash('sha256').update(userId).digest('hex')
  const rectifiedAt = new Date().toISOString()
  const auditRows = rectified.map((r) => ({
    event: 'rectification',
    subject_hash: subjectHash,
    field: r.field,
    old_value: r.old_value,
    new_value: r.new_value,
    rectified_at: rectifiedAt,
  }))

  const { error: auditError } = await supabaseAdmin
    .from('compliance_rectification_log')
    .insert(auditRows)

  if (auditError) {
    // The correction succeeded but the audit did not — report partial (207) so it
    // can be reconciled. The data change has already taken effect.
    return NextResponse.json(
      {
        warning:
          'Your correction was applied, but the compliance audit log could not be written. ' +
          'Please report this so it can be reconciled.',
        rectified,
        rectified_at: rectifiedAt,
        audit_logged: false,
      },
      { status: 207, headers }
    )
  }

  // 7. Success.
  return NextResponse.json(
    {
      message: 'Your data has been corrected and the change has been logged.',
      rectified,
      rectified_at: rectifiedAt,
      audit_logged: true,
    },
    { status: 200, headers }
  )
}
