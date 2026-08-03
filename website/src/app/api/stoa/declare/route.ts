/**
 * /api/stoa/declare — an agent's own Stoa entry (ST4).
 *
 * The agent-identity counterpart to /api/mentor/stoa (the human route): same
 * one-space principle (#2), same CRUD shape (GET own entry + shelf +
 * staleness; POST declare; PATCH tend; DELETE withdraw), different identity
 * floor and a different perimeter posture (below).
 *
 * AUTH (the §5-item-ii election, ST4 2026-08-03): Bearer-only, the UPC
 * `consult` capability (validatePracticeCredential), OWNER-BOUND credential
 * REQUIRED (#13 — the *developer* declares for an agent; an owner-less
 * credential has no accountable declarer). The agent_id is taken
 * EXCLUSIVELY from the credential's own binding — never from the request
 * body (see stoa-credential.ts's header for the full rationale). DARK behind
 * SUBSTRATE_STOA_ENABLED — every method 503s flag-off before any work.
 *
 * ============================================================================
 * R20a / AC5 RECORDED DECISION (ST4 2026-08-03, Elevated, per the established
 * precedent for credential-authenticated agent surfaces — e.g. the
 * accreditation write boundary): this route is OUTSIDE the R20a human-distress
 * perimeter. Its free-text fields (what_i_bring / what_i_seek /
 * contact_channel / tags) are AGENT-authored text submitted over a
 * credential-authenticated API call, not human free text entered through a
 * cookie/JWT browser session — the r20a-invocation-guard registry's own
 * standing exclusion: "Agent-facing endpoints … are excluded because they
 * process agent output, not human distress input." The human counterpart
 * (/api/mentor/stoa) IS the perimeter member for this exact field set,
 * because there the same fields are typed by a human. This route is
 * therefore NOT added to HUMAN_FACING_POST_ROUTES or
 * FLAG_GATED_ROUTE_LEVEL_ROUTES (a deliberate omission, not an oversight —
 * see r20a-invocation-guard.test.ts's exclusion note, extended in this
 * session to name this route by path).
 * ============================================================================
 *
 * Rate limits (dedicated buckets, distinct from the human route's — memory:
 * rate-limit-bucket-couples-to-measured-surface): declare 6/hour, other
 * mutations 20/hour, reads via the shared STOA_READ_RATE_LIMIT.
 *
 * #19 (the trust-record/accreditation links): served by stoa-presentation's
 * presentStoaEntry for agent entries on the SHARED serving path; this route
 * does not duplicate that projection logic for its own-view read (own-view
 * uses presentOwnStoaEntry, which carries no such links — a practitioner's
 * own view of their own entry has no need to look itself up).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit } from '@/lib/security'
import {
  isStoaEnabled,
  declareStoaEntry,
  readStoaEntryForIdentity,
  updateStoaEntry,
  withdrawStoaEntry,
  listStoaEntries,
  type StoaIdentity,
  type StoaDeclarationInput,
  STOA_READ_RATE_LIMIT,
} from '@/lib/stoa/stoa-store'
import { resolveStoaDeclareIdentity, type StoaDeclareAuthFailure } from '@/lib/stoa/stoa-credential'
import { computeStoaShelf } from '@/lib/stoa/stoa-shelf'
import {
  presentStoaEntries,
  presentOwnStoaEntry,
  assessStoaStaleness,
} from '@/lib/stoa/stoa-presentation'
import { STOA_STALENESS_QUESTION } from '@/lib/stoa/stoa-copy'

// Dedicated rate-limit buckets — distinct categories from the human route's
// stoa-declare/stoa-mutate (a different actor class; never share a bucket
// with an unrelated surface).
const STOA_AGENT_DECLARE_LIMIT = { maxRequests: 6, windowSeconds: 3600, category: 'stoa-agent-declare' }
const STOA_AGENT_MUTATE_LIMIT = { maxRequests: 20, windowSeconds: 3600, category: 'stoa-agent-mutate' }

const FIELD_MAX = 2000
const TAGS_MAX_COUNT = 12
const TAG_MAX = 40

function stoaClosed(): NextResponse {
  return NextResponse.json({ error: 'The Stoa is not yet open.' }, { status: 503 })
}

/** Map an auth failure reason to its wire response. Kept local (deliberate
 *  duplication, not an oversight): the R20a-reviewed human route's own
 *  auth (requireAuth) is a different primitive entirely, so there is no
 *  shared auth-response helper to reuse here without touching that
 *  adversarially-reviewed file. */
function authFailureResponse(reason: StoaDeclareAuthFailure): NextResponse {
  switch (reason) {
    case 'no_token':
      return NextResponse.json(
        { error: 'Authorization: Bearer <practice credential> required' },
        { status: 401 },
      )
    case 'invalid_token':
      return NextResponse.json({ error: 'Invalid or inactive credential' }, { status: 401 })
    case 'no_owner':
      return NextResponse.json(
        {
          error:
            'This credential is not owner-bound. The Stoa requires an accountable declarer — ' +
            'a developer-owned credential — to declare an agent (#13).',
        },
        { status: 403 },
      )
    case 'no_agent':
      return NextResponse.json(
        {
          error:
            'This credential carries no agent_id binding. The Stoa declares agent presence via ' +
            "the credential's own agent binding, not a caller-supplied identity.",
        },
        { status: 403 },
      )
  }
}

async function readJsonBody(
  request: NextRequest,
): Promise<{ ok: true; body: Record<string, unknown> } | { ok: false }> {
  try {
    const body = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false }
    return { ok: true, body: body as Record<string, unknown> }
  } catch {
    return { ok: false }
  }
}

/**
 * Friendly 400s ahead of the store's generic validation — the ST2/ST3-set
 * expectation, deliberately duplicated from the human route's own
 * `parseDeclaration` (same rationale as authFailureResponse above: no shared
 * helper existed, and this route's field semantics ARE identical, so the
 * duplication is a small, reviewed, side-by-side copy rather than a touch to
 * the reviewed human route). Content is NEVER judged here (#15 — their own
 * words). `visibility` is intentionally omittable — the agent default
 * ('public', #1) applies when absent.
 */
function parseDeclaration(
  body: Record<string, unknown>,
): { ok: true; input: StoaDeclarationInput } | { ok: false; error: string } {
  const input: StoaDeclarationInput = {}
  const textFields: Array<[string, 'whatIBring' | 'whatISeek' | 'contactChannel', string]> = [
    ['What you bring', 'whatIBring', 'what_i_bring'],
    ['What you seek', 'whatISeek', 'what_i_seek'],
    ['Contact channel', 'contactChannel', 'contact_channel'],
  ]
  for (const [label, key, wireKey] of textFields) {
    if (wireKey in body) {
      const v = body[wireKey]
      if (v === null || v === undefined || v === '') {
        input[key] = null
      } else if (typeof v !== 'string') {
        return { ok: false, error: `${label} must be text` }
      } else if (v.length > FIELD_MAX) {
        return {
          ok: false,
          error: `${label} is over the ${FIELD_MAX.toLocaleString()}-character limit (yours is ${v.length.toLocaleString()})`,
        }
      } else {
        input[key] = v
      }
    }
  }
  if ('visibility' in body && body.visibility !== undefined && body.visibility !== null) {
    if (body.visibility !== 'community' && body.visibility !== 'public') {
      return {
        ok: false,
        error: `Visibility must be 'community' (visible to signed-in practitioners) or 'public'`,
      }
    }
    input.visibility = body.visibility
  }
  if ('tags' in body && body.tags !== undefined && body.tags !== null) {
    if (!Array.isArray(body.tags)) return { ok: false, error: 'Tags must be a list' }
    if (body.tags.length > TAGS_MAX_COUNT) {
      return { ok: false, error: `At most ${TAGS_MAX_COUNT} tags` }
    }
    for (const t of body.tags) {
      if (typeof t !== 'string') return { ok: false, error: 'Each tag must be text' }
      if (t.trim().length > TAG_MAX) {
        return { ok: false, error: `Tags are capped at ${TAG_MAX} characters` }
      }
    }
    input.tags = body.tags as string[]
  }
  return { ok: true, input }
}

// ============================================================================
// GET — own entry + shelf + staleness (own view only)
// ============================================================================

export async function GET(request: NextRequest) {
  if (!isStoaEnabled()) return stoaClosed()
  const rateLimitError = checkRateLimit(request, STOA_READ_RATE_LIMIT)
  if (rateLimitError) return rateLimitError

  const auth = await resolveStoaDeclareIdentity(request)
  if (!auth.ok) return authFailureResponse(auth.reason)
  const identity: StoaIdentity = {
    kind: 'agent',
    agentId: auth.agentId,
    credentialRef: auth.credentialRef,
  }

  try {
    const read = await readStoaEntryForIdentity(identity)
    if (!read.ok) {
      console.error('Stoa agent own-entry read error:', read.error)
      return NextResponse.json({ error: 'Failed to read your entry' }, { status: 500 })
    }
    const entry = read.value
    if (!entry || entry.status !== 'active') {
      return NextResponse.json({
        entry: entry ? presentOwnStoaEntry(entry) : null,
        shelf: [],
        staleness: null,
      })
    }

    const { stale, daysSinceTended } = assessStoaStaleness(
      entry.declaredAt,
      entry.renewedAt,
      Date.now(),
    )
    const staleness = {
      stale,
      days_since_tended: daysSinceTended,
      ...(stale ? { question: STOA_STALENESS_QUESTION } : {}),
    }

    const community = await listStoaEntries({ scope: 'community', limit: 200 })
    const shelfEntries = community.ok ? computeStoaShelf(entry, community.value.entries) : []
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const shelf = await presentStoaEntries(admin, shelfEntries)

    return NextResponse.json({ entry: presentOwnStoaEntry(entry), shelf, staleness })
  } catch (err) {
    console.error('Stoa agent own-entry API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// POST — declare
// ============================================================================

export async function POST(request: NextRequest) {
  if (!isStoaEnabled()) return stoaClosed()
  const rateLimitError = checkRateLimit(request, STOA_AGENT_DECLARE_LIMIT)
  if (rateLimitError) return rateLimitError

  const auth = await resolveStoaDeclareIdentity(request)
  if (!auth.ok) return authFailureResponse(auth.reason)
  const identity: StoaIdentity = {
    kind: 'agent',
    agentId: auth.agentId,
    credentialRef: auth.credentialRef,
  }

  const parsedBody = await readJsonBody(request)
  if (!parsedBody.ok) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

  try {
    const parsed = parseDeclaration(parsedBody.body)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const declared = await declareStoaEntry(identity, parsed.input)
    if (!declared.ok) {
      if (declared.error === 'already_declared') {
        return NextResponse.json(
          { error: 'This agent already has an entry in the Stoa — edit it instead of declaring again.' },
          { status: 409 },
        )
      }
      console.error('Stoa agent declare error:', declared.error)
      return NextResponse.json({ error: 'Failed to save the declaration' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      entry: presentOwnStoaEntry(declared.value.entry),
      reactivated: declared.value.reactivated,
    })
  } catch (err) {
    console.error('Stoa agent declare API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// PATCH — edit (with content) or renew (empty patch)
// ============================================================================

export async function PATCH(request: NextRequest) {
  if (!isStoaEnabled()) return stoaClosed()
  const rateLimitError = checkRateLimit(request, STOA_AGENT_MUTATE_LIMIT)
  if (rateLimitError) return rateLimitError

  const auth = await resolveStoaDeclareIdentity(request)
  if (!auth.ok) return authFailureResponse(auth.reason)
  const identity: StoaIdentity = {
    kind: 'agent',
    agentId: auth.agentId,
    credentialRef: auth.credentialRef,
  }

  const parsedBody = await readJsonBody(request)
  if (!parsedBody.ok) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

  try {
    const parsed = parseDeclaration(parsedBody.body)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const updated = await updateStoaEntry(identity, parsed.input)
    if (!updated.ok) {
      if (updated.error === 'no_active_entry') {
        return NextResponse.json(
          { error: 'This agent has no active entry to tend — declare one first.' },
          { status: 404 },
        )
      }
      console.error('Stoa agent update error:', updated.error)
      return NextResponse.json({ error: 'Failed to update the entry' }, { status: 500 })
    }

    return NextResponse.json({ success: true, entry: presentOwnStoaEntry(updated.value) })
  } catch (err) {
    console.error('Stoa agent update API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// DELETE — withdraw (status flip; reversible; hard-delete is data rights)
// ============================================================================

export async function DELETE(request: NextRequest) {
  if (!isStoaEnabled()) return stoaClosed()
  const rateLimitError = checkRateLimit(request, STOA_AGENT_MUTATE_LIMIT)
  if (rateLimitError) return rateLimitError

  const auth = await resolveStoaDeclareIdentity(request)
  if (!auth.ok) return authFailureResponse(auth.reason)
  const identity: StoaIdentity = {
    kind: 'agent',
    agentId: auth.agentId,
    credentialRef: auth.credentialRef,
  }

  try {
    const withdrawn = await withdrawStoaEntry(identity)
    if (!withdrawn.ok) {
      console.error('Stoa agent withdraw error:', withdrawn.error)
      return NextResponse.json({ error: 'Failed to withdraw the entry' }, { status: 500 })
    }
    return NextResponse.json({ success: true, withdrawn: withdrawn.value.withdrawn })
  } catch (err) {
    console.error('Stoa agent withdraw API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
