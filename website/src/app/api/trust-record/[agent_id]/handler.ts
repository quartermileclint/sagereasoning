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
 *   no examined domain evidence AND     → 404 (honest miss; "no trust rows"
 *   no servable provenance-gap entry        described the BARE-ROW gate
 *                                           ENV-1 rejected, and slice 3
 *                                           widened it further)
 *   no evidence AND the gaps read failed → 503 (a 404 is a positive absence
 *                                          claim; slice 3, SCOPE §6.5)
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
  isProvenanceLedgerEnabled,
  readProvenanceGaps,
} from '@/lib/substrate/trust-core/provenance-ledger-store'
import { isServableProvenanceGapReason } from '@/lib/substrate/trust-core/provenance-classification'
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
  /** SLICE 3 (SCOPE §6/§6.5, OPTIONAL so pre-slice-3 dep objects stay valid —
   *  the C2c precedent). Absent or flag-off ⇒ no read, no payload field, and
   *  the ENV-1 gate keeps its pre-slice-3 condition exactly. */
  isProvenanceLedgerEnabled?: () => boolean
  readProvenanceGaps?: (
    agentId: string,
  ) => Promise<
    | {
        ok: true
        value: {
          entries: { reason: string; occurredAt: string }[]
          capped: boolean
          totalCount: number | null
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
  isProvenanceLedgerEnabled,
  readProvenanceGaps: (agentId) => readProvenanceGaps(agentId),
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

  // 4b. SLICE 3 — the capped provenance-gap slice, read BEFORE the ENV-1 gate
  //     because its result now participates in the 404/200 decision (§6.5).
  //     Flag-off (the pre-slice-3 state) NOTHING is read: `provenanceGaps` stays
  //     `undefined`, the composer receives no key, and the gate below is exactly
  //     its pre-slice-3 self.
  let provenanceGaps:
    | { entries: { reason: string; occurredAt: string }[]; capped: boolean; totalCount: number | null }
    | null
    | undefined
  if (deps.isProvenanceLedgerEnabled?.() && deps.readProvenanceGaps) {
    const gapsRes = await deps.readProvenanceGaps(agentId)
    provenanceGaps = gapsRes.ok ? gapsRes.value : null
    if (!gapsRes.ok) {
      console.error('[trust-record] provenance gaps read failed (fail-honest):', gapsRes.error)
    }
  }

  // 5. Honest miss — no domain carries EXAMINED evidence (S10-ENV-1 fold,
  //    2026-07-12): a declaration-class record-only event (e.g. the v1
  //    harness_computed calling acknowledgement) SEEDS a state row at the
  //    profile prior with hasEvidence=false; gating the 404 on bare row
  //    existence would have served such an agent a 200, falsifying the
  //    published "a record implies examined evidence" contract. A 200 now
  //    genuinely implies at least one domain carries evidence.
  //
  //    SLICE 3 RELAXATION (SCOPE §6.5, RULED 2026-08-26). The gate now reads
  //    `domains.some(hasEvidence) || provenance_gaps.length > 0`, TIED TO THE
  //    LEDGER'S OWN FLAG so it is byte-identical flag-off (the read below does
  //    not run, `provenanceGaps` stays undefined, and this condition is exactly
  //    its pre-slice-3 self).
  //
  //    WHY this is a faithful extension of ENV-1 and not a violation of it: the
  //    thing ENV-1 rejects is a BARE ROW — evidence of nothing dressed as
  //    evidence of something. A provenance-gap entry is not that. It is proof
  //    the ledger genuinely examined an artifact's origin and reached a
  //    determinate verdict (refuse, and why) — a different KIND of examination
  //    than virtue-domain evaluation, not a lesser one. Without this, the agent
  //    the fix exists to make visible would 404 — "the silent carve-out I
  //    rejected, arriving through a different path" (mentor, Q4).
  //
  //    DISCLOSED COST (§6.5.5): today every 200 implies at least one domain has
  //    evidence. Flag-on, a 200 can now carry `aggregate.level: null` and
  //    `sparse: true`. The payload states both honestly; an integration that
  //    treats a 200 as "evaluative" must additionally check aggregate.level.
  //
  //    THE 404 IS A POSITIVE CLAIM ABOUT ABSENCE, so it may only be made from a
  //    read that succeeded. If the gaps read FAILED and no domain carries
  //    evidence, this handler cannot honestly say the agent has no record — it
  //    503s instead of serving a cacheable, false 404. That is the S10-ABUSE-1
  //    lesson (a missing-table-shaped error must never read as a benign empty)
  //    applied to the read this slice adds. When some domain DOES carry
  //    evidence the outcome is unaffected, so the record still serves with the
  //    field omitted and an honest note — a supplementary read's outage never
  //    blocks the primary record.
  const hasDomainEvidence = verdict.profile.domains.some((d) => d.hasEvidence)
  const gapsReadFailed = provenanceGaps === null
  // PR19 fold: count what the payload will RENDER, not raw store rows. The ruled
  // condition is stated on the SERVED field; counting raw rows let a widened DB
  // CHECK serve a cacheable 200 whose provenance_gaps was [] — justified by a gap
  // the reader cannot see. One shared predicate now governs both sides.
  //
  // NAMED LIMIT (PR19 independent review, 2026-08-31 -- F2). This gate reads
  // ONLY `.entries`, and the store read is CAPPED at PROVENANCE_GAPS_ROW_CAP
  // (50, newest-first). It ignores `capped` and `totalCount`. So the 404's
  // absence claim is scoped to the read WINDOW, not to the agent: an agent with
  // more than 50 gap rows whose newest 50 all carry reasons absent from the
  // wording map, and a servable row beyond the cap, would 404 while a servable
  // entry exists. Note the asymmetry the product already shows -- a 200
  // discloses "showing N of M" via total_provenance_gaps_count; the 404
  // discloses nothing about truncation.
  //
  // CHECK (PR25): not reachable in production today. `agent_provenance_gaps`
  // holds ZERO rows and the classification step has never executed in
  // production -- published as such on agent-card.json's provenance-gaps/v1
  // extension, and recorded at D-PROVENANCE-LEDGER-SLICE3-LIVE-VERIFIED-C4-
  // DISCHARGED (2026-08-30). Reaching it additionally requires the
  // widened-CHECK-ahead-of-code drift the classification module's own fold
  // comment documents. Carried as a named follow-up rather than fixed here:
  // the two candidate fixes (503 on `capped`, or disclose truncation in the
  // message) are a design choice with a public-contract consequence, not a
  // one-line correction, and slice 5 is the point at which it becomes live.
  const hasProvenanceGaps = (provenanceGaps?.entries ?? []).some((e) =>
    isServableProvenanceGapReason(e.reason),
  )
  if (!hasDomainEvidence && gapsReadFailed) {
    // THE 503 IS DELIBERATELY VAGUER THAN THE 404 BELOW, and the asymmetry is
    // intentional rather than an oversight (recorded here after PR19 asked,
    // 2026-08-31 -- F4). The rule this session applied to the 404 is "name
    // exactly the conditions this request evaluated"; the 503 names none of
    // them. Two reasons it should stay that way: the accreditation 503 posture
    // this surface mirrors is deliberately vague (see the store-failure 503
    // above), and enumerating internal read failures to unauthenticated callers
    // is a reconnaissance surface. The distinguishing basis IS published --
    // llms.txt names the failed-provenance-gap read as a distinct 503 cause --
    // and is logged operator-side on the line below. Vague to the caller,
    // specific in the log and in the contract.
    console.error(
      '[trust-record] provenance-gaps read failed and no domain carries evidence; ' +
        'refusing to serve an unverified 404',
    )
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
  if (!hasDomainEvidence && !hasProvenanceGaps) {
    // THE SERVED MESSAGE MUST NAME EXACTLY THE CONDITIONS THIS REQUEST
    // EVALUATED — no more, and no fewer. Slice 3 widened the gate above to
    // `no examined evidence AND no servable gap entry`, and all three R18
    // surfaces publish both halves; until 2026-08-31 this body still named
    // only the first. Not false and not user-harmful, but a served-message /
    // published-contract mismatch — precisely the class this arc exists to
    // close. Found by the slice-3 LIVE verification, not by a local sweep
    // (D-PROVENANCE-LEDGER-SLICE3-LIVE-VERIFIED-C4-DISCHARGED, 2026-08-30).
    //
    // WHY THE MESSAGE IS CONDITIONAL RATHER THAN ONE WIDENED STRING. Flag-off
    // (and with a pre-slice-3 deps object) the gaps read never runs, so
    // `provenanceGaps` stays undefined and this handler has looked at exactly
    // ONE thing. Appending the gaps half unconditionally would assert an
    // absence the request never checked — the same unverified-absence sin the
    // 503 branch above exists to prevent (S10-ABUSE-1, applied to the read
    // slice 3 added). So the second clause is emitted iff the read happened.
    // Flag-off the string is byte-identical to its pre-slice-3 self.
    //
    // `provenanceGaps === null` (read failed) cannot reach here: that case is
    // caught by the 503 branch above, which requires the same
    // `!hasDomainEvidence`. `undefined` therefore means "never attempted".
    //
    // "available to surface" is deliberate, not loose: the gate counts the
    // RENDERABLE set (S2-92 / the PR19 fold), so an agent whose only gap rows
    // carry unservable reasons still 404s. Claiming "no gap entry exists"
    // would overstate what the gate actually established.
    const gapsWereRead = provenanceGaps !== undefined && provenanceGaps !== null
    return json(
      {
        status: 'not_found',
        message:
          `No trust record is available for agent: ${agentId}. ` +
          'No examined trust evidence has been folded for it ' +
          '(declaration-class records alone do not surface a public record)' +
          (gapsWereRead
            ? ', and no provenance-gap entry is available to surface for it.'
            : '.'),
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
    ...(provenanceGaps !== undefined ? { provenanceGaps } : {}),
    generatedAt: deps.now(),
  })

  return json(
    { status: 'ok', data: payload, documentation_url: TRUST_RECORD_DOCUMENTATION_URL },
    200,
    TRUST_RECORD_RESPONSE_HEADERS,
  )
}
