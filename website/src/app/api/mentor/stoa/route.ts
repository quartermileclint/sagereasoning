/**
 * /api/mentor/stoa — the practitioner's own Stoa entry (ST3).
 *
 * GET    — read one's own entry (+ the passive shelf #5 + the staleness
 *          question #24, both own-view-only)
 * POST   — declare (one entry per practitioner, #11; visibility default
 *          community for humans, #1)
 * PATCH  — tend the entry: edit content, or renew with an empty patch (the
 *          Q9 "is this still yours?" answered yes). Sets renewed_at, never
 *          declared_at (#8 — editing is never a float-to-top lever)
 * DELETE — withdraw (the practitioner's own act; status flip, reversible by
 *          re-declaring; hard-delete stays with the data-rights routes)
 *
 * DARK behind SUBSTRATE_STOA_ENABLED — every method 503s flag-off before any
 * work, so flag-off production is byte-identical (the whole-route dark
 * posture; ST5 activates).
 *
 * ============================================================================
 * R20a — THE TWELFTH ROUTE-LEVEL PERIMETER MEMBER (AC5 recorded decision,
 * ST3 2026-08-03; Critical element, 0c-ii):
 *
 *   Half 1 — POST + PATCH accept human free text (what_i_bring, what_i_seek,
 *   contact_channel AND the free-text tags — a person's own words about what
 *   they carry and what they need: exactly the input class the perimeter
 *   exists for) and run the AC5-mandated
 *   `await enforceDistressCheck(detectDistressTwoStage(...))` over the
 *   composed MERGED entry (the submitted fields merged over the existing
 *   row, so the gate sees the entry as it will be served — the PR19
 *   cross-request-assembly fold) BEFORE any store write. Moderate/acute →
 *   the HUMAN-audience crisis rendering (cookie/JWT human route — never the
 *   developer form) and NO write. A final stage-1 mild → the shared
 *   mild-escalation pass (more severe wins, never a downgrade); a standing
 *   mild → the declaration saves with the additive `support_resources` fold
 *   (the classifier's documented mild semantics).
 *
 *   Half 2 — the browse route (/api/stoa/entries) takes NO free text (query
 *   params only) and stays OUTSIDE the perimeter by the
 *   r20a-invocation-guard precedent.
 *
 *   Flag posture: no dedicated R20a flag — the route is dark behind
 *   SUBSTRATE_STOA_ENABLED and the check is UNCONDITIONAL on the flag-on
 *   path (the route never exists live without its distress check). The
 *   guard registry (r20a-invocation-guard.test.ts) carries this route in
 *   HUMAN_FACING_POST_ROUTES + FLAG_GATED_ROUTE_LEVEL_ROUTES with
 *   isStoaEnabled as its flag.
 *
 *   Fail posture: the stage-1 regex floor always runs; a stage-2 (Haiku)
 *   outage fails open WITH alert inside detectDistressTwoStage (ADR-R20a-01
 *   D6-c) — never below the regex floor by construction.
 *
 *   Rules served: R20a; AC2 (~500ms borderline latency accepted); AC4
 *   (invocation-tested — __tests__/r20a-invocation.test.ts + the guard
 *   registry); AC5 (twelfth route-level entry); PR3 (awaited); PR6
 *   (Critical); PR15 (shared classifier + renderer, nothing re-implemented).
 * ============================================================================
 *
 * Rate limits (dedicated buckets — never `scoring`, memory:
 * rate-limit-bucket-couples-to-measured-surface): declare 6/hour (also
 * closes the ST2-carried withdraw→re-declare recency-cycling lever), other
 * mutations 20/hour, reads 60/min.
 *
 * Q12: NO engine reading of declarations happens here or anywhere — the
 * distress check is the safety perimeter, not an examination; the optional
 * draft mirror reading is ST6, request-only.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, requireAuth } from '@/lib/security'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import { enforceDistressCheck } from '@/lib/constraints'
import { renderR20aRedirectResponse } from '@/lib/substrate/r20a-audience-renderer'
import {
  isStoaEnabled,
  declareStoaEntry,
  readStoaEntryForIdentity,
  updateStoaEntry,
  withdrawStoaEntry,
  listStoaEntries,
  type StoaIdentity,
  type StoaDeclarationInput,
} from '@/lib/stoa/stoa-store'
import {
  composeStoaDistressSubject,
  buildStoaMildSupportResources,
  type StoaMildSupportResources,
} from '@/lib/stoa/stoa-r20a'
// The mild-escalation pass, REUSED from the eleventh route (PR15; PR19 fold
// 2026-08-03 — see stoa-r20a.ts's header for why it applies here too).
import { escalateMildDistress } from '@/lib/score-conversation-r20a'
import { computeStoaShelf } from '@/lib/stoa/stoa-shelf'
import {
  presentStoaEntries,
  presentOwnStoaEntry,
  assessStoaStaleness,
} from '@/lib/stoa/stoa-presentation'
import { STOA_STALENESS_QUESTION } from '@/lib/stoa/stoa-copy'
import { STOA_READ_RATE_LIMIT } from '@/lib/stoa/stoa-store'

// Dedicated rate-limit buckets (local configs; distinct categories). The
// declare cap BLUNTS the ST2-carried withdraw→re-declare recency-cycling
// lever (checkRateLimit is per-instance in-memory + IP-keyed, so this is
// friction, not closure — PR19 adjudication 2026-08-03; a durable row-level
// reactivation guard is a named follow-up, potentially a mentor question,
// since ST2's PR19 adjudicated "a re-declaration IS a new declaration").
const STOA_DECLARE_LIMIT = { maxRequests: 6, windowSeconds: 3600, category: 'stoa-declare' }
const STOA_MUTATE_LIMIT = { maxRequests: 20, windowSeconds: 3600, category: 'stoa-mutate' }

const FIELD_MAX = 2000
const TAGS_MAX_COUNT = 12
const TAG_MAX = 40

function stoaClosed(): NextResponse {
  return NextResponse.json({ error: 'The Stoa is not yet open.' }, { status: 503 })
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
 * Friendly 400s ahead of the store's generic validation (the ST2 close's
 * named expectation). Returns an error string or the normalised declaration
 * input. Content is NEVER judged here (#15 — their own words).
 */
function parseDeclaration(
  body: Record<string, unknown>,
): { ok: true; input: StoaDeclarationInput } | { ok: false; error: string } {
  const input: StoaDeclarationInput = {}
  const textFields: Array<[string, 'whatIBring' | 'whatISeek' | 'contactChannel', keyof Record<string, unknown>]> = [
    ['What you bring', 'whatIBring', 'what_i_bring'],
    ['What you seek', 'whatISeek', 'what_i_seek'],
    ['Contact channel', 'contactChannel', 'contact_channel'],
  ]
  for (const [label, key, wireKey] of textFields) {
    if (wireKey in body) {
      const v = body[wireKey as string]
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

/**
 * The four fields the distress gate screens, composed from the RAW body
 * BEFORE `parseDeclaration` runs — the R20a ordering restructure (Session 3D,
 * 2026-09-06; operations/count-discipline-2026-09/2026-09-05-r20a-perimeter-
 * ordering-AUDIT.md §2.1 row 12, §3 constraint 6) under the binding
 * 2026-09-06 ruling ("the distress check runs before the length guard on any
 * route where the human crisis form is rendered") and the mentor's 2026-09-05
 * Part 5 extension (a distressed person is "owed the crisis form before being
 * told their `visibility` value is invalid"). Until this session every parse
 * 400 (type, FIELD_MAX, the visibility enum, the tags list/count/TAG_MAX)
 * fired before the gate ever read the text, because the gate consumed
 * `parsed.input`. Now the gate reads THIS shape, merged over the prior row
 * exactly as before, and the parse 400s run after the redirect return.
 *
 * Equivalence for a VALID body (the claim the PR19 reviewers test): a string
 * at or under FIELD_MAX slices to itself; an explicit clear (`null` / `''`)
 * becomes '' which the composer skips — the same absence the parsed `null`
 * produced; an absent key is `undefined` and the merge falls back to the
 * prior row, as before; a valid tags array is identical. So an in-bound
 * request is screened byte-identically to before. A NON-STRING text value is
 * screened as `String(v)` and then refused by the type 400 (order, not
 * existence); a non-array `tags` falls back to the prior tags (more
 * screening, never less) and is then refused. SCREENING CAPS: each text part
 * at FIELD_MAX (the guard's own bound; the composer's STOA_DISTRESS_FIELD_CAP
 * is the same 2,000), each tag at TAG_MAX, at most TAGS_MAX_COUNT tags.
 * DISCLOSED RESIDUAL (audit §4.3): text past a field's bound, or a 13th tag,
 * is not screened — before this move it was not read at all (a bare 400).
 * DISCLOSED COST (PR19, 2026-09-06): a non-string field value is now
 * stringified and screened (a two-stage pass, possibly a paid stage 2) before
 * the type 400 that previously fired for free. Bounded by `requireAuth` and
 * the per-route rate limits, both of which run before the body is parsed.
 * The store still writes `parsed.input` only — never this shape.
 */
type StoaGateFields = {
  whatIBring?: string | null
  whatISeek?: string | null
  contactChannel?: string | null
  tags?: string[]
}

function rawDeclarationForGate(body: Record<string, unknown>): StoaGateFields {
  const raw: StoaGateFields = {}
  const textKeys: Array<['whatIBring' | 'whatISeek' | 'contactChannel', string]> = [
    ['whatIBring', 'what_i_bring'],
    ['whatISeek', 'what_i_seek'],
    ['contactChannel', 'contact_channel'],
  ]
  for (const [key, wireKey] of textKeys) {
    if (wireKey in body) raw[key] = String(body[wireKey] ?? '').slice(0, FIELD_MAX)
  }
  if ('tags' in body && Array.isArray(body.tags)) {
    // PR19 fold (2026-09-06): TRIM BEFORE SLICING. The first cut sliced each
    // tag by RAW length while `parseDeclaration`'s guard checks TRIMMED length
    // (`t.trim().length > TAG_MAX`) — two different metrics. A tag of 39
    // spaces followed by "kill myself" has trimmed length 11, so it passes
    // validation and is STORED VERBATIM (`input.tags = body.tags`) and
    // displayed — but a raw slice at 40 kept only the spaces plus one
    // character, and the composer's own `.map(t => t.trim())` then reduced it
    // to "k". A validly-saved tag could therefore carry distress text the
    // classifier never saw, purely by front-padding it. That is a screening
    // BYPASS, not the disclosed past-the-bound residual (which runs the safe
    // direction: text that is rejected anyway). Trimming first makes the
    // screening metric identical to the guard's, so any tag the guard ACCEPTS
    // is screened in full — byte-identical to the pre-restructure path, where
    // the validated array went to the composer untouched.
    raw.tags = body.tags.slice(0, TAGS_MAX_COUNT).map((t) => String(t ?? '').trim().slice(0, TAG_MAX))
  }
  return raw
}

/**
 * Merge the submitted fields over the practitioner's existing (non-removed)
 * entry so the distress gate sees the entry AS IT WILL BE SERVED, not just
 * this request's delta (PR19 fold, 2026-08-03: a per-submission-only gate
 * let distress content be assembled across successive PATCHes — or across a
 * partial reactivation POST, since the store's reactivation keeps old values
 * for unsupplied fields — with each individual submission below threshold).
 * On a read error the submitted fields alone are gated (never less than the
 * old behaviour) and the failure is logged.
 */
async function mergedDeclarationForGate(
  identity: StoaIdentity,
  input: StoaGateFields,
): Promise<{
  whatIBring: string | null | undefined
  whatISeek: string | null | undefined
  contactChannel: string | null | undefined
  tags: string[] | undefined
}> {
  let existing: Awaited<ReturnType<typeof readStoaEntryForIdentity>> | null = null
  try {
    existing = await readStoaEntryForIdentity(identity)
  } catch {
    existing = null
  }
  const prior = existing && existing.ok && existing.value && existing.value.status !== 'removed'
    ? existing.value
    : null
  if (existing && !existing.ok) {
    console.warn('Stoa gate merge read failed; gating submitted fields only:', existing.error)
  }
  return {
    whatIBring: 'whatIBring' in input ? input.whatIBring : prior?.whatIBring,
    whatISeek: 'whatISeek' in input ? input.whatISeek : prior?.whatISeek,
    contactChannel: 'contactChannel' in input ? input.contactChannel : prior?.contactChannel,
    tags: 'tags' in input ? input.tags : prior?.tags,
  }
}

/**
 * The perimeter check for a declaration's free text (POST + PATCH share it so
 * the two can never drift). Returns the crisis redirect response when the
 * check pauses the save, or the mild fold (or undefined) when it proceeds.
 *
 * The AC5-mandated pattern, awaited, BEFORE any store write (PR3). A final
 * stage-1 'mild' additionally runs the shared mild-escalation pass
 * (escalateMildDistress — more severe wins, never a downgrade, fail-open
 * keeps mild): on this composed multi-field subject a mild hit in one field
 * must not mute stage 2 for another field's regex-missed distress.
 */
async function runStoaDistressGate(fields: {
  whatIBring?: unknown
  whatISeek?: unknown
  contactChannel?: unknown
  tags?: unknown
}): Promise<
  | { redirect: NextResponse }
  | { redirect?: never; supportResources: StoaMildSupportResources | undefined }
> {
  const subject = composeStoaDistressSubject(fields)
  if (subject.length === 0) return { supportResources: undefined }

  const gate = await enforceDistressCheck(detectDistressTwoStage(subject))
  let effective = gate.result
  if (!gate.shouldRedirect && gate.result.severity === 'mild') {
    effective = await escalateMildDistress(subject, gate.result)
  }
  if (effective.redirect_message !== null) {
    return {
      redirect: NextResponse.json(
        renderR20aRedirectResponse({
          audience: 'human_user',
          severity: effective.severity,
          redirect_message: effective.redirect_message,
        }),
        { status: 200 },
      ),
    }
  }
  return {
    supportResources: effective.severity === 'mild' ? buildStoaMildSupportResources() : undefined,
  }
}

// ============================================================================
// GET — own entry + shelf + staleness (own view only)
// ============================================================================

export async function GET(request: NextRequest) {
  // Flag first (PR19 fold: 503 before even the rate-bucket increment —
  // flag-off production does no work of any kind).
  if (!isStoaEnabled()) return stoaClosed()
  const rateLimitError = checkRateLimit(request, STOA_READ_RATE_LIMIT)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const identity: StoaIdentity = { kind: 'human', ownerUserId: auth.user.id }

  try {
    const read = await readStoaEntryForIdentity(identity)
    if (!read.ok) {
      console.error('Stoa own-entry read error:', read.error)
      return NextResponse.json({ error: 'Failed to read your entry' }, { status: 500 })
    }
    const entry = read.value
    if (!entry || entry.status !== 'active') {
      // Withdrawn/removed rows ARE the practitioner's own record — return
      // them (own-view projection) so the page can say so honestly; no
      // shelf, no staleness.
      return NextResponse.json({
        entry: entry ? presentOwnStoaEntry(entry) : null,
        shelf: [],
        staleness: null,
      })
    }

    // Staleness (#24): the gentle question, own view only, after long ageing.
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

    // The passive shelf (#5): declared-content matches only, own view only,
    // recency order preserved, no notification to anyone (nothing here
    // writes or signals — computeStoaShelf is pure).
    const community = await listStoaEntries({ scope: 'community', limit: 200 })
    const shelfEntries = community.ok ? computeStoaShelf(entry, community.value.entries) : []
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const shelf = await presentStoaEntries(admin, shelfEntries)

    return NextResponse.json({ entry: presentOwnStoaEntry(entry), shelf, staleness })
  } catch (err) {
    console.error('Stoa own-entry API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// POST — declare
// ============================================================================

export async function POST(request: NextRequest) {
  if (!isStoaEnabled()) return stoaClosed()
  const rateLimitError = checkRateLimit(request, STOA_DECLARE_LIMIT)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const identity: StoaIdentity = { kind: 'human', ownerUserId: auth.user.id }

  const parsedBody = await readJsonBody(request)
  if (!parsedBody.ok) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

  try {
    // R20a — before any store write (AC5; PR3), over the MERGED entry (a
    // partial reactivation keeps old field values, so the gate must see the
    // entry as it will be served) — and, since Session 3D (2026-09-06),
    // BEFORE `parseDeclaration`: the subject is composed from the RAW body
    // (see rawDeclarationForGate) so every parse 400 runs after the redirect
    // return. The merge's row READ therefore precedes the parse; a malformed
    // but distressed body now costs one read + the classifier before its
    // 400 — the bounded cost the ruling accepted. Pinned by ORD-1..3 + RAW-1..2
    // + NEG-1..2 in __tests__/r20a-invocation.test.ts on the call-site order
    // inside this handler; mutation-verified.
    const merged = await mergedDeclarationForGate(identity, rawDeclarationForGate(parsedBody.body))
    const gateOutcome = await runStoaDistressGate(merged)
    if (gateOutcome.redirect) return gateOutcome.redirect

    // The parse's 400s — MOVED after the redirect return (Session 3D, 2026-09-06;
    // order, not existence: every message, value and status unchanged). The
    // store writes `parsed.input` only.
    const parsed = parseDeclaration(parsedBody.body)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const declared = await declareStoaEntry(identity, parsed.input)
    if (!declared.ok) {
      if (declared.error === 'already_declared') {
        return NextResponse.json(
          { error: 'You already have an entry in the Stoa — edit it instead of declaring again.' },
          { status: 409 },
        )
      }
      console.error('Stoa declare error:', declared.error)
      return NextResponse.json({ error: 'Failed to save your declaration' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      entry: presentOwnStoaEntry(declared.value.entry),
      reactivated: declared.value.reactivated,
      ...(gateOutcome.supportResources ? { support_resources: gateOutcome.supportResources } : {}),
    })
  } catch (err) {
    console.error('Stoa declare API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// PATCH — edit (with content) or renew (empty patch)
// ============================================================================

export async function PATCH(request: NextRequest) {
  if (!isStoaEnabled()) return stoaClosed()
  const rateLimitError = checkRateLimit(request, STOA_MUTATE_LIMIT)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const identity: StoaIdentity = { kind: 'human', ownerUserId: auth.user.id }

  const parsedBody = await readJsonBody(request)
  if (!parsedBody.ok) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

  try {
    // R20a — over the MERGED entry (patch over the existing row), so
    // distress content cannot be assembled across successive small edits
    // each below threshold. A pure renewal (empty patch on an unchanged
    // text-free entry) composes to '' and skips the classifier honestly.
    // Since Session 3D (2026-09-06) the subject is composed from the RAW body
    // BEFORE `parseDeclaration` (see rawDeclarationForGate and the POST note).
    const merged = await mergedDeclarationForGate(identity, rawDeclarationForGate(parsedBody.body))
    const gateOutcome = await runStoaDistressGate(merged)
    if (gateOutcome.redirect) return gateOutcome.redirect

    // The parse's 400s — MOVED after the redirect return (Session 3D, 2026-09-06;
    // order, not existence). The store writes `parsed.input` only.
    const parsed = parseDeclaration(parsedBody.body)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const updated = await updateStoaEntry(identity, parsed.input)
    if (!updated.ok) {
      if (updated.error === 'no_active_entry') {
        return NextResponse.json(
          { error: 'You have no active entry to tend — declare one first.' },
          { status: 404 },
        )
      }
      console.error('Stoa update error:', updated.error)
      return NextResponse.json({ error: 'Failed to update your entry' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      entry: presentOwnStoaEntry(updated.value),
      ...(gateOutcome.supportResources ? { support_resources: gateOutcome.supportResources } : {}),
    })
  } catch (err) {
    console.error('Stoa update API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// DELETE — withdraw (status flip; reversible; hard-delete is data rights)
// ============================================================================

export async function DELETE(request: NextRequest) {
  if (!isStoaEnabled()) return stoaClosed()
  const rateLimitError = checkRateLimit(request, STOA_MUTATE_LIMIT)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const identity: StoaIdentity = { kind: 'human', ownerUserId: auth.user.id }

  try {
    const withdrawn = await withdrawStoaEntry(identity)
    if (!withdrawn.ok) {
      console.error('Stoa withdraw error:', withdrawn.error)
      return NextResponse.json({ error: 'Failed to withdraw your entry' }, { status: 500 })
    }
    return NextResponse.json({ success: true, withdrawn: withdrawn.value.withdrawn })
  } catch (err) {
    console.error('Stoa withdraw API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
