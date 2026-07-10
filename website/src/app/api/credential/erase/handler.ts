/**
 * handler.ts — the testable implementation behind POST /api/credential/erase.
 *
 * CI-14 Step 7: on-demand consumer-erasure-by-token (R17c genuine deletion for
 * owner_kind='external_consumer' credentials). See
 * `operations/p1-rebuild-2026-06/ci14-step7-consumer-erasure-design.md`.
 *
 * WHY A SEPARATE MODULE: a Next.js `route.ts` may export ONLY the HTTP method
 * handlers + route-segment config; exporting the injectable handler or its deps type
 * fails Next route-export validation at `next build` (NOT caught by `tsc --noEmit`;
 * see memory `nextjs-route-export-validation` + the trajectory-B1 incident). So the
 * handler + its dependency seam live here; route.ts is a thin POST wrapper.
 *
 * The deps seam lets the unit test exercise every branch (503 flag-off / 400 confirm /
 * 401 token / 403 admin / 404 not-found / 409 operator / 200 erased / 200 idempotent /
 * 500 erase-failure) with injected fakes — no Supabase client, no network.
 *
 * AUTH (two modes — the prompt's "token-or-id-authenticated"):
 *   • TOKEN mode (primary): body has NO credential_id; the consumer presents their own
 *     `Authorization: Bearer sr_<token>` + { confirm: "ERASE" }. The token is hashed
 *     and resolved; only THAT credential is erasable.
 *   • ADMIN mode (secondary): body has { credential_id } + { confirm: "ERASE" }; the
 *     caller must be the founder admin (Authorization carries the admin Supabase JWT).
 *
 * The scope guard (owner_user_id IS NULL) is enforced via classifyErasureTarget for
 * BOTH modes — an operator credential is refused (409) and routed to /api/user/delete.
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  corsHeaders,
  corsPreflightResponse,
  getAuthenticatedUser,
} from '@/lib/security'
import {
  classifyErasureTarget,
  eraseExternalConsumerCredential,
  isConsumerErasureEnabled,
  lookupCredentialById,
  lookupCredentialByTokenHash,
  type ErasureCredentialRow,
  type ErasureLookup,
  type ErasureResult,
} from '@/lib/consumer-erasure'
import type { StoreResult } from '@/lib/substrate/agent-assessment-history-store'

const ADMIN_USER_ID = process.env.ADMIN_USER_ID

/** The retained-by-law children NOT erased (de-personalised where they carry an
 *  identifier) — surfaced in the honest response so the consumer knows what remains.
 *  credential_audit is retained INTACT (R0 audit immutability) and, under current
 *  issuance, carries no consumer identifier for an erasable row (only operator-owned
 *  mints write it). */
const RETAINED_BY_LAW = [
  'loop_billing_events (financial ledger; agent_id de-personalised)',
  'credential_audit (issuance/revocation audit — retained intact per R0; none for consumer credentials under current issuance)',
  'api_key_usage (aggregate call counts)',
]

/** The injectable I/O seam. Production binds the real lib/security/supabase calls;
 *  tests inject fakes so every branch is exercised with no DB and no network. */
export type EraseDeps = {
  isEnabled: () => boolean
  authenticateAdmin: (request: NextRequest) => Promise<boolean>
  lookupByToken: (rawToken: string) => Promise<ErasureLookup>
  lookupById: (id: string) => Promise<ErasureLookup>
  erase: (
    row: Pick<ErasureCredentialRow, 'id' | 'credential_provenance'>,
  ) => Promise<StoreResult<ErasureResult>>
  logCompliance: (record: Record<string, unknown>) => Promise<void>
}

export const DEFAULT_DEPS: EraseDeps = {
  isEnabled: isConsumerErasureEnabled,
  authenticateAdmin: async (request) => {
    const user = await getAuthenticatedUser(request)
    return !!user && !!ADMIN_USER_ID && user.id === ADMIN_USER_ID
  },
  lookupByToken: (rawToken) => lookupCredentialByTokenHash(rawToken),
  lookupById: (id) => lookupCredentialById(id),
  erase: (row) => eraseExternalConsumerCredential(row),
  // Best-effort compliance audit (no PII) — mirrors /api/user/delete's try/catch
  // posture so a log-schema mismatch never blocks the erasure.
  logCompliance: async (record) => {
    try {
      const { supabaseAdmin } = await import('@/lib/supabase-server')
      await supabaseAdmin.from('compliance_deletion_log').insert(record)
    } catch {
      /* logging failure is non-blocking — the erasure still succeeds */
    }
  },
}

function json(body: unknown, status: number): NextResponse {
  return NextResponse.json(body, { status, headers: corsHeaders() })
}

/**
 * The testable erasure handler. route.ts's POST binds DEFAULT_DEPS; tests call this
 * directly with a fake request + injected deps.
 */
export async function runConsumerErasure(
  request: NextRequest,
  deps: EraseDeps = DEFAULT_DEPS,
): Promise<NextResponse> {
  // ── Flag posture ────────────────────────────────────────────────────────────
  // UNSET ⇒ the route is dark; report honestly and do NO work. Rollback = unset.
  if (!deps.isEnabled()) {
    return json(
      {
        error: 'consumer erasure not enabled',
        note: 'SUBSTRATE_CONSUMER_ERASURE_ENABLED unset — this endpoint is inactive.',
      },
      503,
    )
  }

  // ── Body + confirmation ─────────────────────────────────────────────────────
  let body: { confirm?: string; credential_id?: string } = {}
  try {
    body = await request.json()
  } catch {
    return json(
      { error: 'Request body must be JSON with { "confirm": "ERASE" }.' },
      400,
    )
  }
  if (body.confirm !== 'ERASE') {
    return json(
      {
        error: 'Confirmation required.',
        message:
          'To permanently erase this consumer credential and its trajectory data, ' +
          'send { "confirm": "ERASE" }. This action is irreversible.',
      },
      400,
    )
  }

  // ── Mode selection + auth ───────────────────────────────────────────────────
  // credential_id in the body ⇒ ADMIN mode; otherwise TOKEN mode.
  let lookup: ErasureLookup
  if (typeof body.credential_id === 'string' && body.credential_id.length > 0) {
    const isAdmin = await deps.authenticateAdmin(request)
    if (!isAdmin) {
      return json(
        { error: 'Unauthorized. credential_id mode requires the admin session.' },
        403,
      )
    }
    lookup = await deps.lookupById(body.credential_id)
  } else {
    const authHeader = request.headers.get('authorization') || ''
    const rawToken = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : ''
    if (!rawToken.startsWith('sr_')) {
      return json(
        {
          error:
            'Present your credential as Authorization: Bearer sr_<token> ' +
            '(or, as admin, send { "credential_id": "<uuid>" }).',
        },
        401,
      )
    }
    lookup = await deps.lookupByToken(rawToken)
  }

  // ── Lookup-error honesty (R17/R18f) ─────────────────────────────────────────
  // A real DB error is NOT a "not found" — emit a retryable 5xx so the consumer
  // retries rather than concluding their data is already gone. (A genuine miss —
  // error null, row null — falls through to the honest 404 below.)
  if (lookup.error) {
    return json(
      {
        status: 'lookup_error',
        message:
          'Could not look up the credential (a transient error). Please retry. ' +
          'No erasure was performed.',
        detail: lookup.error,
      },
      503,
    )
  }
  const row = lookup.row

  // ── Scope guard (owner_user_id IS NULL) + idempotency ───────────────────────
  const classification = classifyErasureTarget(row)
  const credentialRef = row ? `api_key:${row.id}` : null

  if (classification === 'not_found') {
    return json(
      {
        status: 'not_found',
        message: 'No erasable consumer credential matches the presented token/id.',
      },
      404,
    )
  }
  if (classification === 'refuse_operator') {
    return json(
      {
        status: 'refused',
        reason: 'operator_credential',
        message:
          'This credential belongs to an operator account; erase it via ' +
          '/api/user/delete (the authenticated user-account deletion path).',
      },
      409,
    )
  }
  if (classification === 'already_erased') {
    return json({ status: 'already_erased', credential_ref: credentialRef }, 200)
  }

  // ── Erase (classification === 'erasable'; row is non-null here) ─────────────
  const target = row as ErasureCredentialRow
  const result = await deps.erase({
    id: target.id,
    credential_provenance: target.credential_provenance,
  })

  if (!result.ok) {
    // R17c: surface the failure honestly — do NOT claim "erased". The trajectory
    // delete or the credential anonymisation did not complete.
    return json(
      {
        status: 'error',
        message:
          'Erasure did not complete. No false "deleted" is reported. Please retry ' +
          'or contact support@sagereasoning.com.',
        detail: result.error,
      },
      500,
    )
  }

  // Compliance audit (no PII — credential_ref is api_key:<uuid>, not personal data).
  // credential_ref is encoded INTO the tables_cleared entry (a known-present field —
  // /api/user/delete uses it) so the ledger can identify WHICH credential was erased
  // without depending on a column whose presence we cannot verify.
  await deps.logCompliance({
    event: 'consumer_credential_erased',
    timestamp: new Date().toISOString(),
    tables_cleared: [
      `agent_assessment_history (credential-scoped: ${credentialRef}; ${result.value.trajectory_deleted} rows)`,
      `agent_trust_events + agent_trust_state (credential-scoped: ${credentialRef}; ${result.value.trust_deleted} rows)`,
      // PA-8 fold (2026-07-11 pre-activation audit): the deletion always happened
      // (consumer-erasure step 1c) but the compliance record under-reported it.
      `collaboration_records (credential-scoped: ${credentialRef}; ${result.value.collaboration_deleted} rows)`,
    ],
    errors: result.value.warnings.length > 0 ? result.value.warnings : null,
  })

  return json(
    {
      status: 'erased',
      credential_ref: credentialRef,
      owner_kind: target.owner_kind,
      trajectory_rows_deleted: result.value.trajectory_deleted,
      trust_rows_deleted: result.value.trust_deleted,
      collaboration_rows_deleted: result.value.collaboration_deleted,
      billing_rows_depersonalised: result.value.billing_depersonalised,
      credential: 'anonymised_and_revoked',
      retained_by_law: RETAINED_BY_LAW,
      ...(result.value.warnings.length > 0 ? { warnings: result.value.warnings } : {}),
    },
    200,
  )
}

export function consumerErasurePreflight(): NextResponse {
  return corsPreflightResponse()
}
