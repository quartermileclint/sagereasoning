/**
 * handler.ts — Trust Layer S10: the public trust-record read handler.
 *
 * GET /api/trust-record/{agent_id} — public, unauthenticated (founder election
 * E1, 2026-07-12: the accreditation-GET posture — a trust record only its own
 * subject could read is not a public trust rail). Rate-limited at the route
 * (RATE_LIMITS.publicAgent). Serves the S1→S3 state fold ONLY (per-domain
 * levels + aggregate + confidence + coverage + the honest-claims envelope);
 * never the event ledger, never the S4 recommendation (design decisions of
 * record — trust-record-payload.ts header).
 *
 * ─── Dark posture ─────────────────────────────────────────────────────────────
 * SUBSTRATE_TRUST_READ_SURFACE_ENABLED unset ⇒ honest 503 with ZERO DB work
 * (the discernment flagDisabled posture). The trust core itself dark
 * (SUBSTRATE_TRUST_CORE_ENABLED unset) ⇒ 503 too — a record cannot be served
 * from a core that is not running.
 *
 * ─── R20a / AC5 (recorded decision — the S10 re-check) ───────────────────────
 * Agent-facing READ endpoint: the only input is an agent_id path segment — no
 * free-text human submission exists on this surface, so the distress classifier
 * has no subject text; OUTSIDE the human-distress perimeter, per the recorded
 * precedent (r20a-invocation-guard.test.ts header: agent-facing endpoints
 * processing agent output are excluded; the discernment route's S8 recorded
 * decision, which named this S10 re-check, is re-confirmed alongside it in the
 * S10 R18 sign-off memo). AC5 untouched.
 *
 * ─── Status → HTTP mapping (mirrors the accreditation GET) ───────────────────
 *   flag off / core dark / store failure → 503 (Cache-Control: no-store)
 *   malformed agent_id                   → 400
 *   no trust rows for the agent          → 404 (honest miss)
 *   record                               → 200 (public, max-age=300)
 */

import { NextResponse } from 'next/server'
import {
  isTrustCoreEnabled,
  isTrustReadSurfaceEnabled,
} from '@/lib/substrate/trust-core/trust-core-flag'
import {
  readTrustVerdict,
  type TrustVerdict,
} from '@/lib/substrate/trust-core/harness-integration'
import {
  readHonestReflectSummary,
  readOrientationReadings,
} from '@/lib/substrate/trust-core/trust-core-store'
import { isOrientationReadingEnabled } from '@/lib/translation-sandwich/orientation-reading'
import {
  composeTrustRecordPayload,
  type TrustRecordPayload,
} from '@/lib/substrate/trust-core/trust-record-payload'

export const TRUST_RECORD_DOCUMENTATION_URL = 'https://sagereasoning.com/limitations'

/** Public-read headers (the accreditation-GET posture: 5-min public cache —
 *  levels change event-driven + by slow decay; failures override to no-store). */
export const TRUST_RECORD_RESPONSE_HEADERS: Record<string, string> = {
  'Cache-Control': 'public, max-age=300',
  'X-SageReasoning-Version': '2.0',
  // Header values must be ByteString (ASCII) — no typographic dashes here.
  'X-Trust-Record-Disclaimer':
    'Attests examined-reasoning patterns under a disclosed gaming ceiling (MEASURE - binds nothing); ' +
    'not a certification of safety, ethics, or trustworthiness. See /limitations.',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

const NO_STORE_HEADERS: Record<string, string> = {
  ...TRUST_RECORD_RESPONSE_HEADERS,
  // Failures are never cached — operators fix and the next request succeeds.
  'Cache-Control': 'no-store',
}

/** Printable ASCII, no whitespace, bounded — a PERMISSIVE superset of every id
 *  class the write paths accept (K1-canonical, legacy agent_*, harness loop +
 *  sub-spawn ids), so read-accepts ⊇ write-accepts (the FX-11 lesson applied in
 *  the read direction: never 400 an id that could carry a record). */
export function isServableAgentId(agentId: string): boolean {
  return /^[\x21-\x7E]{1,200}$/.test(agentId)
}

type ReflectSummary = {
  honestReflectCount: number
  latestHonestReflectAt: string | null
  /** True when the bounded store read hit its row cap (count under-reports — the
   *  safe direction; surfaced as an honest payload note). */
  capped?: boolean
}

export interface TrustRecordDeps {
  isSurfaceEnabled: () => boolean
  isCoreEnabled: () => boolean
  readVerdict: (agentId: string, opts?: { now?: Date }) => Promise<TrustVerdict>
  readReflectSummary: (
    agentId: string,
  ) => Promise<{ ok: true; value: ReflectSummary } | { ok: false; error: string }>
  /** C2c (2026-08-08, OPTIONAL so pre-C2 dep objects stay valid): the
   *  orientation surface's flag + capped ledger read. Absent or flag-off ⇒ no
   *  read, no payload field — byte-identical to pre-C2. */
  isOrientationEnabled?: () => boolean
  readOrientationReadings?: (
    agentId: string,
  ) => Promise<
    | {
        ok: true
        value: {
          entries: { reading: string; occurredAt: string; deliveryClass: 'examined' | 'observed' }[]
          capped: boolean
          /** Mentor §6(b): the total count for the "showing N of M" disclosure
           *  (null ⇒ count read failed; omitted from the payload honestly). */
          totalCount?: number | null
        }
      }
    | { ok: false; error: string }
  >
  now: () => Date
}

const REAL_DEPS: TrustRecordDeps = {
  isSurfaceEnabled: isTrustReadSurfaceEnabled,
  isCoreEnabled: isTrustCoreEnabled,
  // strictStore (S10-ABUSE-1 fold): on THIS public surface a missing-table-shaped
  // store error must surface as a 503 (no-store), never read as a benign empty
  // profile that a cacheable 404 would misreport as "no record exists".
  readVerdict: (agentId, opts) => readTrustVerdict(agentId, { ...opts, strictStore: true }),
  readReflectSummary: (agentId) => readHonestReflectSummary(agentId),
  isOrientationEnabled: isOrientationReadingEnabled,
  readOrientationReadings: (agentId) => readOrientationReadings(agentId),
  now: () => new Date(),
}

function json(body: unknown, status: number, headers: Record<string, string>): NextResponse {
  return NextResponse.json(body, { status, headers })
}

/** The GET handler (injectable deps for the S10 battery; the route binds REAL_DEPS). */
export async function runTrustRecordGet(
  agentIdRaw: string,
  deps: TrustRecordDeps = REAL_DEPS,
): Promise<NextResponse> {
  // 1. Dark gate FIRST — zero DB work while the surface flag is unset.
  if (!deps.isSurfaceEnabled()) {
    return json(
      {
        status: 'error',
        message: 'The trust-record read surface is not enabled.',
        note:
          'Dark: SUBSTRATE_TRUST_READ_SURFACE_ENABLED is not set. ' +
          'Nothing runs and nothing is read while dark.',
        documentation_url: TRUST_RECORD_DOCUMENTATION_URL,
      },
      503,
      NO_STORE_HEADERS,
    )
  }

  // 2. The trust core itself must be on — a record cannot be served from a core
  //    that is not running (and reads would observe a frozen, un-emitting fold).
  if (!deps.isCoreEnabled()) {
    return json(
      {
        status: 'error',
        message: 'The trust core is not enabled; no trust record can be served.',
        documentation_url: TRUST_RECORD_DOCUMENTATION_URL,
      },
      503,
      NO_STORE_HEADERS,
    )
  }

  // 3. Malformed id — permissive superset check (see isServableAgentId).
  const agentId = agentIdRaw.trim()
  if (!isServableAgentId(agentId)) {
    return json(
      {
        status: 'error',
        message:
          'Invalid agent_id: expected a printable identifier (no whitespace), at most 200 characters.',
        documentation_url: TRUST_RECORD_DOCUMENTATION_URL,
      },
      400,
      NO_STORE_HEADERS,
    )
  }

  // 4. The verdict read (decay realized lazily inside — decayed truth, E3).
  const verdict = await deps.readVerdict(agentId, { now: deps.now() })
  if (verdict.dark) {
    // readTrustVerdict's own flag guard fired (belt-and-braces with step 2).
    return json(
      {
        status: 'error',
        message: 'The trust core is not enabled; no trust record can be served.',
        documentation_url: TRUST_RECORD_DOCUMENTATION_URL,
      },
      503,
      NO_STORE_HEADERS,
    )
  }
  if (!verdict.profile) {
    // Fail-honest store failure — vague message (the accreditation 503 posture),
    // basis logged for the operator, never cached.
    console.error('[trust-record] profile read failed:', verdict.basis)
    return json(
      {
        status: 'error',
        message: 'The trust-record service is temporarily unavailable. Please try again shortly.',
        documentation_url: TRUST_RECORD_DOCUMENTATION_URL,
      },
      503,
      NO_STORE_HEADERS,
    )
  }

  // 5. Honest miss — no domain carries EXAMINED evidence (S10-ENV-1 fold,
  //    2026-07-12): a declaration-class record-only event (e.g. the v1
  //    harness_computed calling acknowledgement) SEEDS a state row at the
  //    profile prior with hasEvidence=false; gating the 404 on bare row
  //    existence would have served such an agent a 200, falsifying the
  //    published "a record implies examined evidence" contract. A 200 now
  //    genuinely implies at least one domain carries evidence.
  if (!verdict.profile.domains.some((d) => d.hasEvidence)) {
    return json(
      {
        status: 'not_found',
        message:
          `No trust record is available for agent: ${agentId}. ` +
          'No examined trust evidence has been folded for it ' +
          '(declaration-class records alone do not surface a public record).',
        documentation_url: TRUST_RECORD_DOCUMENTATION_URL,
      },
      404,
      TRUST_RECORD_RESPONSE_HEADERS,
    )
  }

  // 6. The supplementary reflect summary — its outage never blocks the record
  //    (composed as null + an honest note; never fabricated).
  const reflectRes = await deps.readReflectSummary(agentId)
  const reflectSummary = reflectRes.ok ? reflectRes.value : null
  if (!reflectRes.ok) {
    console.error('[trust-record] reflect summary read failed (fail-honest):', reflectRes.error)
  }

  // 6b. C2c (2026-08-08) — the capped orientation-readings slice. Flag-off (the
  //     production default) NOTHING is read and the composer receives undefined
  //     ⇒ the payload carries no orientation_readings key (byte-identical).
  //     Flag-on, an outage never blocks the record (null ⇒ omitted + honest
  //     note — the reflect-summary posture).
  let orientationReadings:
    | {
        entries: { reading: string; occurredAt: string; deliveryClass: 'examined' | 'observed' }[]
        capped: boolean
        totalCount?: number | null
      }
    | null
    | undefined
  if (deps.isOrientationEnabled?.() && deps.readOrientationReadings) {
    const orientRes = await deps.readOrientationReadings(agentId)
    orientationReadings = orientRes.ok ? orientRes.value : null
    if (!orientRes.ok) {
      console.error(
        '[trust-record] orientation readings read failed (fail-honest):',
        orientRes.error,
      )
    }
  }

  const payload: TrustRecordPayload = composeTrustRecordPayload({
    verdict,
    reflectSummary,
    ...(orientationReadings !== undefined ? { orientationReadings } : {}),
    generatedAt: deps.now(),
  })

  return json(
    { status: 'ok', data: payload, documentation_url: TRUST_RECORD_DOCUMENTATION_URL },
    200,
    TRUST_RECORD_RESPONSE_HEADERS,
  )
}
