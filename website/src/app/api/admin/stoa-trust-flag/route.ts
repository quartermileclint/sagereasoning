/**
 * /api/admin/stoa-trust-flag — the Stoa Q5c/Q13a trust-event flag intake.
 *
 * GOVERNING DOCUMENT:
 *   - operations/connective-layer-2026-08/2026-08-04-mentor-consultation-
 *     stoa-followups-verbatim.md — BINDING; verbatim wins over the scoped
 *     plan and this file.
 *   - operations/handoffs/founder/2026-08-03-stoa-Q5c-Q13a-trust-event-
 *     wiring-SCOPED.md — the settled elections (E1–E4).
 *
 * WHAT THIS ROUTE IS
 *
 * The single, founder/admin-only, no-UI surface that turns a curator-paired
 * examined artifact into a Stoa trust event. It is the ONLY trigger for these
 * events — per the mentor's Q3 ruling, there is deliberately NO background
 * comparator anywhere in the system watching fresh assessments against
 * active Stoa entries. "The trigger determines when the examination happens;
 * the standard determines what counts as evidence when it does."
 *
 * A submission may name any combination of:
 *   - contradicts_oversight   (Q5c) — a demonstrated false capability claim,
 *     domain: the claim was simply false regardless of who was affected.
 *   - contradicts_dikaiosyne  (Q5c) — the same evidentiary act, domain: the
 *     contradiction involved treatment of another party.
 *   - diverges_from_calling   (Q13a) — the declaration diverges from the
 *     agent's declared calling record; a coherence observation, not a
 *     caution (flag effect only — never raises or lowers a domain level).
 * Domain choice is an INPUT the admin asserts from the CONTENT of the claim
 * and the nature of the contradiction — NEVER a severity ranking. Both Q5c
 * blocks may be submitted together from one root cause; nothing here dedupes
 * them (mentor, verbatim: "two entries from one root cause is honest, not
 * redundant").
 *
 * THE EVIDENTIARY STANDARD (Q2, enforced here — not just in prose): each
 * block requires a non-empty artifact/record reference AND a non-empty
 * justification. This route cannot verify semantic contradiction (there is
 * no automated comparator by design) — it enforces only that the required
 * PAIRING was actually supplied, never a fabricated event from an empty
 * submission. The admin bears the "concretely contradicts, no interpretation
 * required" judgement itself.
 *
 * SCOPE: trust events key on agent_id. A Stoa entry without an agent_id (a
 * human declaration) has no trust-core home — this route 400s on one.
 *
 * BOUNDARY (#20, Q6c — deliberately opened in ONE direction by this build):
 * this route imports BOTH lib/stoa (to read the referenced entry) AND
 * substrate/trust-core (to derive + emit the events). The Stoa's own store
 * and serving surfaces still import NOTHING from trust-core (unchanged;
 * re-pinned by stoa-boundary.test.ts). Nothing about directory presence or
 * use feeds any OTHER signal — this route reads exactly one entry by the id
 * the admin supplies, on the admin's own flagged act, never a scan.
 *
 * AUTH: founder-only via requireAdmin (the house ADMIN_USER_ID gate — the
 * same pattern /api/admin/api-keys, /api/admin/accreditation-credentials, and
 * /api/admin/plugin-install-credentials all use for admin credential/audit
 * surfaces with no UI).
 *
 * FLAG-GATED (E2): emission requires BOTH SUBSTRATE_TRUST_CORE_ENABLED AND
 * SUBSTRATE_STOA_TRUST_EVENTS_ENABLED. Either unset ⇒ the route still 200s
 * honestly with written:0 per block and flag_enabled:false — never a
 * fabricated success, never a 500 for an intentionally-dark surface.
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RATE_LIMITS, requireAdmin, corsHeaders } from '@/lib/security'
import { getStoaEntryById } from '@/lib/stoa/stoa-store'
import {
  emitStoaContradictionTrustEvents,
  emitStoaCallingDivergenceTrustEvent,
} from '@/lib/substrate/trust-core/emission-hooks'
import {
  isTrustCoreEnabled,
  isStoaTrustEventsEnabled,
} from '@/lib/substrate/trust-core/trust-core-flag'
import { createHash } from 'crypto'

interface ContradictionBlock {
  artifact_ref: string
  justification: string
}

interface DivergenceBlock {
  calling_record_ref: string
  justification: string
}

interface ParsedBody {
  stoaEntryId: string
  claimQuote: string | null
  contradictsOversight: ContradictionBlock | null
  contradictsDikaiosyne: ContradictionBlock | null
  divergesFromCalling: DivergenceBlock | null
}

function nonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim() !== ''
}

function parseContradictionBlock(v: unknown): ContradictionBlock | null | 'invalid' {
  if (v === undefined || v === null) return null
  if (typeof v !== 'object') return 'invalid'
  const b = v as Record<string, unknown>
  if (!nonEmptyString(b.artifact_ref) || !nonEmptyString(b.justification)) return 'invalid'
  return { artifact_ref: b.artifact_ref, justification: b.justification }
}

function parseDivergenceBlock(v: unknown): DivergenceBlock | null | 'invalid' {
  if (v === undefined || v === null) return null
  if (typeof v !== 'object') return 'invalid'
  const b = v as Record<string, unknown>
  if (!nonEmptyString(b.calling_record_ref) || !nonEmptyString(b.justification)) return 'invalid'
  return { calling_record_ref: b.calling_record_ref, justification: b.justification }
}

function parseBody(body: unknown): { ok: true; value: ParsedBody } | { ok: false; error: string } {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Request body must be a JSON object.' }
  }
  const b = body as Record<string, unknown>

  if (!nonEmptyString(b.stoa_entry_id)) {
    return { ok: false, error: 'stoa_entry_id is required.' }
  }

  const contradictsOversight = parseContradictionBlock(b.contradicts_oversight)
  if (contradictsOversight === 'invalid') {
    return {
      ok: false,
      error: 'contradicts_oversight, if present, requires non-empty artifact_ref and justification.',
    }
  }
  const contradictsDikaiosyne = parseContradictionBlock(b.contradicts_dikaiosyne)
  if (contradictsDikaiosyne === 'invalid') {
    return {
      ok: false,
      error: 'contradicts_dikaiosyne, if present, requires non-empty artifact_ref and justification.',
    }
  }
  const divergesFromCalling = parseDivergenceBlock(b.diverges_from_calling)
  if (divergesFromCalling === 'invalid') {
    return {
      ok: false,
      error: 'diverges_from_calling, if present, requires non-empty calling_record_ref and justification.',
    }
  }

  if (!contradictsOversight && !contradictsDikaiosyne && !divergesFromCalling) {
    return {
      ok: false,
      error:
        'At least one of contradicts_oversight, contradicts_dikaiosyne, or diverges_from_calling is required.',
    }
  }

  // claim_quote is required — and required to be the SAME quote — for
  // whichever Q5c block(s) are present (the "reader examining both the
  // artifact and the entry text" standard starts with quoting the specific
  // claim; one submission may assert both domains from the same claim, never
  // two different claims in one call).
  if ((contradictsOversight || contradictsDikaiosyne) && !nonEmptyString(b.claim_quote)) {
    return {
      ok: false,
      error: 'claim_quote is required when contradicts_oversight or contradicts_dikaiosyne is present.',
    }
  }

  return {
    ok: true,
    value: {
      stoaEntryId: b.stoa_entry_id,
      claimQuote: nonEmptyString(b.claim_quote) ? b.claim_quote : null,
      contradictsOversight,
      contradictsDikaiosyne,
      divergesFromCalling,
    },
  }
}

export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const parsed = parseBody(rawBody)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400, headers: corsHeaders() })
  }
  const { stoaEntryId, claimQuote, contradictsOversight, contradictsDikaiosyne, divergesFromCalling } =
    parsed.value

  const entryResult = await getStoaEntryById(stoaEntryId)
  if (!entryResult.ok) {
    console.error('stoa-trust-flag: entry lookup failed:', entryResult.error)
    return NextResponse.json({ error: 'Entry lookup failed.' }, { status: 500, headers: corsHeaders() })
  }
  const entry = entryResult.value.entry
  if (!entry) {
    return NextResponse.json({ error: 'No Stoa entry with that id.' }, { status: 404, headers: corsHeaders() })
  }
  if (!entry.agentId) {
    // Trust events key on agent_id — a human declaration has no trust-core
    // home. Q5c/Q13a are agent-side mechanisms (the mentor's Q13a text names
    // "an agent's directory declaration"); this is a scope boundary, not a
    // removal decision — a dishonest human entry is the existing removal
    // path (removal_ground = 'dishonesty_examined'), untouched by this route.
    return NextResponse.json(
      { error: 'This Stoa entry has no agent_id — trust events apply only to agent entries.' },
      { status: 400, headers: corsHeaders() },
    )
  }

  const flagEnabled = isTrustCoreEnabled() && isStoaTrustEventsEnabled()

  const now = new Date()
  const digestInput = (parts: (string | null)[]) =>
    createHash('sha256').update(parts.map((p) => p ?? '').join('|')).digest('hex').slice(0, 32)

  const responseBody: Record<string, unknown> = {
    ok: true,
    flag_enabled: flagEnabled,
    stoa_entry_id: stoaEntryId,
    agent_id: entry.agentId,
  }

  if (contradictsOversight || contradictsDikaiosyne) {
    // PR19 fold (2026-08-04, HIGH): each block gets its OWN correlation id,
    // derived ONLY from that block's own content (entry + claim + that
    // block's artifact ref) — never from what else is submitted alongside
    // it. A shared submission-level id let a later resubmission that added
    // the second block change the first block's hash, defeating the DB
    // dedup key (correlation_id, event_type, virtue_domain) and
    // double-decreasing a domain from one root cause.
    const result = await emitStoaContradictionTrustEvents({
      agentId: entry.agentId,
      ownerUserId: entry.ownerUserId,
      credentialRef: entry.credentialRef,
      stoaEntryId,
      claimQuote: claimQuote ?? '',
      contradictsOversight: contradictsOversight
        ? {
            artifactRef: contradictsOversight.artifact_ref,
            justification: contradictsOversight.justification,
            correlationId: `stoa-contradiction-oversight:${digestInput([
              stoaEntryId,
              claimQuote,
              contradictsOversight.artifact_ref,
            ])}`,
          }
        : undefined,
      contradictsDikaiosyne: contradictsDikaiosyne
        ? {
            artifactRef: contradictsDikaiosyne.artifact_ref,
            justification: contradictsDikaiosyne.justification,
            correlationId: `stoa-contradiction-dikaiosyne:${digestInput([
              stoaEntryId,
              claimQuote,
              contradictsDikaiosyne.artifact_ref,
            ])}`,
          }
        : undefined,
      now,
    })
    responseBody.contradiction = 'error' in result ? { error: result.error } : { written: result.written, held: result.held }
  }

  if (divergesFromCalling) {
    // LOW-1 fold (2026-08-04): the correlation id keys ONLY on the entry +
    // the calling record it was compared against — NOT the free-text
    // justification, so rewording an observation about the same pairing
    // still dedupes to the same standing record rather than writing a
    // second flag row for one discrepancy.
    const correlationId = `stoa-divergence:${digestInput([stoaEntryId, divergesFromCalling.calling_record_ref])}`
    const result = await emitStoaCallingDivergenceTrustEvent({
      agentId: entry.agentId,
      ownerUserId: entry.ownerUserId,
      credentialRef: entry.credentialRef,
      stoaEntryId,
      callingRecordRef: divergesFromCalling.calling_record_ref,
      divergenceDescription: divergesFromCalling.justification,
      now,
      correlationId,
    })
    responseBody.divergence = 'error' in result ? { error: result.error } : { written: result.written, held: result.held }
  }

  return NextResponse.json(responseBody, { status: 200, headers: corsHeaders() })
}
