/**
 * @compliance
 * compliance_version: CR-2026-Q2-v1
 * last_regulatory_review: 2026-06-07
 * applicable_jurisdictions: [AU, EU, US]
 * regulatory_references: [CR-GDPR-A15-ACCESS]
 * review_cycle: quarterly
 * owner: founder
 * next_review_due: 2026-07-06
 * change_trigger: [GDPR amendment, AU Privacy Act reform]
 * deprecation_flag: false
 */

/**
 * GET /api/user/access  (A15b — GDPR Article 15, Right of Access / Subject Access Request)
 *
 * Returns, for the authenticated user:
 *   1. A complete copy of their personal data (Art 15(3)) — the encrypted
 *      intimate store decrypted for the subject. Reuses the shared
 *      gatherUserPersonalData() helper (PR1: proven here first; /api/user/export
 *      is left byte-identical).
 *   2. The Article 15(1)(a)–(h) supplementary information about the processing —
 *      purposes, recipients/sub-processors, retention, rights, complaint path,
 *      source, and the profiling disclosure (Art 15(1)(h)).
 *
 * Every request is logged (no raw PII — the subject is recorded as a SHA-256
 * hash) and rate-limited (RATE_LIMITS.dataRights — 5/hour). Self-service only:
 * a user can only access their own data.
 *
 * Critical surface (R17f + PR6): any change here follows the Critical Change
 * Protocol.
 *
 * Rules: R17 (data protection), R17b (decrypt-on-access for the subject),
 * R17g (Article 15 access — surface, logging, rate-limiting), R18/R19 (honest
 * positioning).
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
import { gatherUserPersonalData } from '@/lib/user-data-gathering'
import { buildArticle15SupplementaryInfo } from '@/lib/article15-supplementary-info'

export async function OPTIONS() {
  return corsPreflightResponse()
}

export async function GET(request: NextRequest) {
  // 1. Rate-limit (sensitive, infrequent self-service operation)
  const rateLimited = checkRateLimit(request, RATE_LIMITS.dataRights)
  if (rateLimited) return rateLimited

  // 2. Authenticate — strictly self-service; a user can only access their own data
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  const userId = auth.user.id
  const email = auth.user.email

  // 3. Gather the data copy (Art 15(3)) + supplementary information (Art 15(1)(a)–(h))
  const personalData = await gatherUserPersonalData(userId)
  const supplementary = buildArticle15SupplementaryInfo()

  // 4. Log the access request (R17g) — non-blocking, no raw PII.
  //    The subject is recorded as a one-way SHA-256 hash so the request is
  //    auditable without storing an identifier in the compliance log.
  try {
    const subjectHash = createHash('sha256').update(userId).digest('hex')
    await supabaseAdmin.from('compliance_access_log').insert({
      event: 'access_request',
      subject_hash: subjectHash,
      requested_at: new Date().toISOString(),
    })
  } catch {
    // Logging failure is non-blocking — the user still receives their data.
  }

  // 5. Assemble the response
  const responseBody = {
    access_metadata: {
      generated_at: new Date().toISOString(),
      user_id: userId,
      email,
      request_type:
        'GDPR Article 15 — Right of Access (Subject Access Request). Also satisfies the ' +
        'Australian Privacy Act right to access personal information.',
      format_version: '1.0',
      description:
        'This response contains (a) a complete copy of the personal data SageReasoning holds about you, ' +
        'and (b) information about how that data is processed (purposes, recipients, retention, your rights, ' +
        'how to complain, the source of the data, and the automated profiling we perform).',
    },
    your_rights_and_our_processing: supplementary,
    personal_data: personalData,
  }

  // 6. Return as a JSON file download (consistent with /api/user/export)
  const jsonString = JSON.stringify(responseBody, null, 2)
  const headers = {
    ...corsHeaders(),
    'Content-Type': 'application/json',
    'Content-Disposition': `attachment; filename="sagereasoning-access-request-${new Date()
      .toISOString()
      .slice(0, 10)}.json"`,
  }

  return new NextResponse(jsonString, { status: 200, headers })
}
