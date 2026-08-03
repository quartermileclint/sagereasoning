/**
 * stoa-draft-reflect.ts — the Q12 exception: an optional, request-only draft
 * mirror reading for the Stoa declaration (ST6).
 *
 * Q12 (verbatim, `operations/connective-layer-2026-08/
 * 2026-08-02-mentor-consultation-connective-layer-verbatim.md`): the
 * connective layer stays entirely plain — no engine reading of a PUBLISHED
 * declaration, no examination triggered by browsing or contact. The one
 * deliberate exception: at the declarer's OWN REQUEST, before publishing,
 * the platform's examination instrument may read a DRAFT and reflect it
 * back — "does this declaration honestly represent what I am offering and
 * seeking?" — on the MIRROR REGISTER ONLY (the same register the reasoning
 * receipt and Sage Reflect already use): a description, never a verdict,
 * never a grade, never a score, never a proximity rank, never a virtue-
 * domain classification. The declarer decides whether to publish, revise,
 * or withdraw; the platform does not insert its judgement into the
 * practitioner's presence — it offers a tool for self-examination the
 * declarer may use or not use.
 *
 * PERSISTENCE (founder election, ST6 session open): NONE. The reading
 * exists only in the HTTP response to the declarer's own request — never
 * written to any table, never folded into any trust/practice record, never
 * served on any other surface. This module imports NO store/DB client for
 * the draft OR the reflection — it is a pure request → LLM call → response
 * shape, mirroring the shape of `stoa-r20a.ts` (also pure, also never
 * touches `stoa_entries`). ONE narrow, disclosed exception (PR19 fold, ST6
 * independent review): on an LLM outage the catch block calls the site-wide
 * `logRouteError` (observability-store.ts), which DOES write a generic
 * error-audit row to `route_errors` via a Supabase admin client — route,
 * method, error type/message/stack, status code. That row never carries the
 * draft text or the reflection (the only value passed as `error` is the
 * caught SDK/network exception, never `fields`) — the same site-wide
 * error-observability convention every other route uses, not a
 * Stoa-specific persistence path.
 *
 * SCOPE (founder election, ST6 session open): human-only. Q12's own framing
 * ("the declarer asks... the declarer decides") never extends to the agent
 * declare surface (/api/stoa/declare); no agent equivalent is built here.
 *
 * MODEL TIER (founder election, ST6 session open): Sonnet standard
 * assessment class (MODEL_DEEP, model-config.ts) — a self-examination
 * mirror on short user text, not a consequential decision, so NOT the
 * translation-sandwich engine's deep/critical tier and NOT a full
 * `/api/reason` consult (which would also violate the "no engine reading"
 * boundary — the route imports nothing from sage-reason-engine's
 * evaluative path, only a bare Anthropic call at a bounded token budget).
 *
 * TRIGGER (founder election, ST6 session open): request-only, fired by an
 * explicit, distinct user action (a separate button on the draft form) —
 * never on every keystroke, never bundled into the declare/edit submission.
 * The route itself enforces this by being its OWN endpoint (POST only, no
 * GET/PATCH/DELETE) rather than a mode flag on the declare route.
 *
 * WHAT DOES NOT LIVE HERE (PR15 — reused, never re-implemented): the R20a
 * distress-subject composition (`composeStoaDistressSubject`,
 * `buildStoaMildSupportResources`, both from `./stoa-r20a`) — the draft text
 * a declarer submits here is the SAME input class the perimeter exists for,
 * so the route runs the identical AC5-mandated check before this module's
 * LLM call ever fires (see route.ts's header for the Critical-element
 * detail).
 *
 * Rules served: R18f-adjacent honesty (no fabricated reflection on outage —
 * fail HONEST, not open, since there is nothing to silently substitute for
 * a mirror reading); PR3 (awaited); PR15.
 */

import { MODEL_DEEP } from '@/lib/model-config'
import { getClient } from '@/lib/sage-reason-engine'
import { EVALUATIVE_DISCLAIMER } from '@/lib/stoic-brain'
import { isLlmOutage } from '@/lib/llm-outage'
import { logRouteError } from '@/lib/observability-store'

/** The dedicated sub-flag (AND'd with SUBSTRATE_STOA_ENABLED at the route —
 *  the draft reflection makes no sense if the Stoa itself is dark). A
 *  separate flag from the base Stoa flag so this specific LLM-cost surface
 *  can be rolled out independently (ST6 session election). */
export function isStoaDraftReflectEnabled(): boolean {
  return process.env.SUBSTRATE_STOA_DRAFT_REFLECT_ENABLED === 'true'
}

export interface DraftReflectFields {
  whatIBring?: string | null
  whatISeek?: string | null
  contactChannel?: string | null
}

export interface DraftMirrorReading {
  /** The mirror-register reflection prose. A description of what the draft
   *  conveys and any tension the declarer may want to look at — NEVER a
   *  verdict, grade, score, proximity rank, or virtue-domain label. */
  reflection: string
  disclaimer: typeof EVALUATIVE_DISCLAIMER
}

const MAX_REFLECTION_TOKENS = 400

const SYSTEM_PROMPT = `You are a mirror, not a judge. A practitioner is drafting a declaration for a directory (the Stoa) before publishing it — a short statement of what they bring and what they seek from other practitioners.

They have asked YOU to read the draft and reflect it back to them, so they can decide for themselves whether it honestly represents what they mean to say. This is self-examination they requested, not an evaluation you are performing.

Write a short, plain reflection (2-4 sentences) that:
- Describes what the draft actually conveys, in your own words, as a mirror
- Notices, if present, any place where "what I bring" and "what I seek" seem to pull in different directions, or where the language is vaguer than the practitioner may intend
- Never scores, grades, ranks, or classifies the draft
- Never uses words like "score", "level", "proximity", "virtue", "excellent", "good", "poor", "pass", "fail"
- Never tells the practitioner what to write instead — only reflects what is there
- Speaks directly to the practitioner ("you"), plainly, without Stoic jargon

Respond with ONLY the reflection text. No preamble, no headers, no JSON.`

/**
 * The mirror reading itself — one bounded Sonnet call, mirror-register only.
 * Fails HONEST (returns { ok: false }) on any outage or malformed response —
 * there is nothing safe to substitute for a self-examination the declarer
 * asked for, so this never fabricates a reflection (contrast the R20a
 * classifier's fail-OPEN posture, which is a safety floor with a defined
 * safe default; this has none).
 */
export async function requestDraftMirrorReading(
  fields: DraftReflectFields,
): Promise<{ ok: true; reading: DraftMirrorReading } | { ok: false; error: string }> {
  const whatIBring = fields.whatIBring?.trim() || '(left blank)'
  const whatISeek = fields.whatISeek?.trim() || '(left blank)'
  const contactChannel = fields.contactChannel?.trim() || '(left blank)'

  try {
    const client = getClient()
    const response = await client.messages.create({
      model: MODEL_DEEP,
      max_tokens: MAX_REFLECTION_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Draft declaration:\n\nWhat you bring: ${whatIBring}\nWhat you seek: ${whatISeek}\nContact channel: ${contactChannel}\n\nReflect this draft back.`,
        },
      ],
    })

    const text = response.content[0]?.type === 'text' ? response.content[0].text.trim() : ''
    if (text.length === 0) {
      return { ok: false, error: 'The reflection came back empty.' }
    }

    return {
      ok: true,
      reading: { reflection: text, disclaimer: EVALUATIVE_DISCLAIMER },
    }
  } catch (err) {
    console.error('Stoa draft mirror reading failed:', err)
    logRouteError({
      route: '/api/mentor/stoa/draft-reflect',
      method: 'POST',
      error: err,
      statusCode: 502,
      isLlmOutage: isLlmOutage(err),
      context: { fail_honest: true },
    })
    return { ok: false, error: 'The mirror reading is unavailable right now — try again shortly.' }
  }
}
