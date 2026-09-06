/**
 * /api/mentor/stoa/draft-reflect — the Q12 draft mirror reading (ST6).
 *
 * POST only. Takes a DRAFT declaration (never a saved one — this route
 * never reads or writes stoa_entries) and returns a mirror-register
 * reflection: a description of what the draft conveys, never a verdict,
 * never a grade, never a score. See stoa-draft-reflect.ts's header for the
 * full Q12 design record (persistence: none; scope: human-only; model:
 * Sonnet standard/MODEL_DEEP; trigger: request-only, this route's own
 * distinct action).
 *
 * DARK behind SUBSTRATE_STOA_ENABLED AND SUBSTRATE_STOA_DRAFT_REFLECT_ENABLED
 * (both required — the draft reflection makes no sense if the Stoa itself is
 * dark; the dedicated sub-flag lets this specific LLM-cost surface roll out
 * on its own schedule, independent of the base Stoa activation). Either
 * flag unset → 503 before any work, so flag-off production is byte-identical.
 *
 * ============================================================================
 * R20a — A THIRTEENTH ROUTE-LEVEL PERIMETER MEMBER (AC5 recorded decision,
 * ST6 2026-08-03; Critical element within an otherwise Elevated build,
 * 0c-ii):
 *
 *   The draft fields (what_i_bring, what_i_seek, contact_channel) are the
 *   SAME free-text class the twelfth route (/api/mentor/stoa) already
 *   perimeters — a person's own words, this time not-yet-published. The
 *   route runs the identical AC5-mandated
 *   `await enforceDistressCheck(detectDistressTwoStage(...))` over the
 *   composed draft (via the REUSED `composeStoaDistressSubject`, PR15) BEFORE
 *   the mirror-reading LLM call ever fires — never send acute-distress text
 *   into a reflection prompt. Moderate/acute → the HUMAN-audience crisis
 *   rendering (never the developer form) and NO reflection call. A final
 *   stage-1 mild runs the shared mild-escalation pass (more severe wins,
 *   never a downgrade) and, if it stays mild, proceeds to the reflection
 *   with the additive `support_resources` fold (declaration-register
 *   wording, unchanged from the twelfth route).
 *
 *   Flag posture: the check is UNCONDITIONAL on the flag-on path (the route
 *   never exists live without it) — same posture as the twelfth route. The
 *   guard registry carries this route in HUMAN_FACING_POST_ROUTES +
 *   FLAG_GATED_ROUTE_LEVEL_ROUTES with BOTH isStoaEnabled and
 *   isStoaDraftReflectEnabled as its flags.
 *
 *   Fail posture: the stage-1 regex floor always runs; a stage-2 (Haiku)
 *   outage fails open WITH alert inside detectDistressTwoStage
 *   (ADR-R20a-01 D6-c) — never below the regex floor by construction. The
 *   MIRROR READING ITSELF fails HONEST on outage (stoa-draft-reflect.ts) —
 *   a 502 with a plain message, never a fabricated reflection.
 *
 *   Rules served: R20a; AC2 (~500ms borderline latency accepted); AC4
 *   (invocation-tested — __tests__/r20a-invocation.test.ts + the guard
 *   registry); AC5 (thirteenth route-level entry); PR3 (awaited); PR6
 *   (Critical element); PR15 (shared classifier + renderer + composer,
 *   nothing re-implemented).
 * ============================================================================
 *
 * NO PERSISTENCE (ST6 founder election): this route imports no store/DB
 * client for the draft or the reflection — not stoa-store's write
 * functions, not supabase-js directly. The reflection exists only in this
 * response. (The disclosed error-audit exception on outage lives in
 * stoa-draft-reflect.ts's header — a generic `route_errors` row, never the
 * draft text.)
 *
 * Rate limit: a dedicated bucket (never `scoring` — memory:
 * rate-limit-bucket-couples-to-measured-surface), tighter than the twelfth
 * route's declare limit since each call spends an LLM token budget with no
 * durable record to show for it.
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, requireAuth, validateTextLength, TEXT_LIMITS } from '@/lib/security'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import { enforceDistressCheck } from '@/lib/constraints'
import { renderR20aRedirectResponse } from '@/lib/substrate/r20a-audience-renderer'
import { isStoaEnabled } from '@/lib/stoa/stoa-store'
import {
  isStoaDraftReflectEnabled,
  requestDraftMirrorReading,
} from '@/lib/stoa/stoa-draft-reflect'
import {
  composeStoaDistressSubject,
  buildStoaMildSupportResources,
  type StoaMildSupportResources,
} from '@/lib/stoa/stoa-r20a'
import { escalateMildDistress } from '@/lib/score-conversation-r20a'

const STOA_DRAFT_REFLECT_LIMIT = { maxRequests: 10, windowSeconds: 3600, category: 'stoa-draft-reflect' }

function stoaClosed(): NextResponse {
  return NextResponse.json({ error: 'The Stoa is not yet open.' }, { status: 503 })
}

interface ParsedDraft {
  whatIBring: string | null
  whatISeek: string | null
  contactChannel: string | null
}

function parseDraft(body: Record<string, unknown>): { ok: true; draft: ParsedDraft } | { ok: false; error: string } {
  const raw: Record<'whatIBring' | 'whatISeek' | 'contactChannel', unknown> = {
    whatIBring: body.what_i_bring,
    whatISeek: body.what_i_seek,
    contactChannel: body.contact_channel,
  }
  const labels: Record<keyof typeof raw, string> = {
    whatIBring: 'What you bring',
    whatISeek: 'What you seek',
    contactChannel: 'Contact channel',
  }
  const draft: ParsedDraft = { whatIBring: null, whatISeek: null, contactChannel: null }
  for (const key of Object.keys(raw) as Array<keyof typeof raw>) {
    const v = raw[key]
    if (v === undefined || v === null || v === '') continue
    if (typeof v !== 'string') return { ok: false, error: `${labels[key]} must be text` }
    const err = validateTextLength(v, labels[key], TEXT_LIMITS.short)
    if (err) return { ok: false, error: err }
    draft[key] = v
  }
  if (!draft.whatIBring?.trim() && !draft.whatISeek?.trim()) {
    return { ok: false, error: 'Nothing to reflect on — fill in what you bring or what you seek first.' }
  }
  return { ok: true, draft }
}

export async function POST(request: NextRequest) {
  // Both flags, checked before any other work (flag-off production does no
  // work of any kind — the twelfth route's precedent).
  if (!isStoaEnabled() || !isStoaDraftReflectEnabled()) return stoaClosed()
  const rateLimitError = checkRateLimit(request, STOA_DRAFT_REFLECT_LIMIT)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  let body: Record<string, unknown>
  try {
    const parsedBody = await request.json()
    if (!parsedBody || typeof parsedBody !== 'object' || Array.isArray(parsedBody)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    body = parsedBody as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    // R20a — before the mirror-reading LLM call ever fires (AC5; PR3), over
    // the SUBMITTED draft (there is no saved row to merge over — this is
    // pre-publish text, possibly never declared at all).
    //
    // ORDERING (Session 3D, 2026-09-06; audit §2.1 row 13, §3 constraint 6;
    // the 2026-09-06 ruling + the 2026-09-05 Part 5 extension): the subject
    // is composed from the RAW body BEFORE `parseDraft`, so the parse's 400s
    // (type, the TEXT_LIMITS.short maximum, "Nothing to reflect on") run
    // after the redirect return. Each field is `String(x ?? '').slice(0,
    // TEXT_LIMITS.short)` — the guard's own bound, equal to the composer's
    // STOA_DISTRESS_FIELD_CAP (2,000). A valid in-bound draft is screened
    // byte-identically to before (a string at or under the bound slices to
    // itself; an absent/null/'' field becomes '' which the composer skips).
    // An all-empty draft composes to '' and skips the classifier, then meets
    // the "Nothing to reflect on" 400 — so the move costs nothing there.
    // DISCLOSED RESIDUAL (audit §4.3): text past 2,000 chars is not screened
    // — before this move it was not read at all (a bare 400). Pinned by
    // ORD-1..2 + RAW-1 + NEG-1..2 in __tests__/r20a-invocation.test.ts.
    const subject = composeStoaDistressSubject({
      whatIBring: String(body.what_i_bring ?? '').slice(0, TEXT_LIMITS.short),
      whatISeek: String(body.what_i_seek ?? '').slice(0, TEXT_LIMITS.short),
      contactChannel: String(body.contact_channel ?? '').slice(0, TEXT_LIMITS.short),
    })
    let supportResources: StoaMildSupportResources | undefined
    if (subject.length > 0) {
      const gate = await enforceDistressCheck(detectDistressTwoStage(subject))
      let effective = gate.result
      if (!gate.shouldRedirect && gate.result.severity === 'mild') {
        effective = await escalateMildDistress(subject, gate.result)
      }
      if (effective.redirect_message !== null) {
        return NextResponse.json(
          renderR20aRedirectResponse({
            audience: 'human_user',
            severity: effective.severity,
            redirect_message: effective.redirect_message,
          }),
          { status: 200 },
        )
      }
      if (effective.severity === 'mild') supportResources = buildStoaMildSupportResources()
    }

    // The parse's 400s — MOVED after the redirect return (Session 3D,
    // 2026-09-06; order, not existence: every message, value and status
    // unchanged). The mirror reading takes `parsed.draft` only.
    const parsed = parseDraft(body)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const result = await requestDraftMirrorReading(parsed.draft)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 })
    }

    return NextResponse.json({
      success: true,
      reflection: result.reading.reflection,
      disclaimer: result.reading.disclaimer,
      ...(supportResources ? { support_resources: supportResources } : {}),
    })
  } catch (err) {
    console.error('Stoa draft-reflect API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
