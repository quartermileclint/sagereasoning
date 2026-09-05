import Anthropic from '@anthropic-ai/sdk'
// #5 + #10 (P-GL): log prod errors + degrade honestly on an LLM outage.
import { isLlmOutage, llmOutageResponse } from '@/lib/llm-outage'
import { logRouteError } from '@/lib/observability-store'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { KatorthomaProximityLevel } from '@/lib/stoic-brain'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'
import { extractReceipt } from '@/lib/reasoning-receipt'
import { getStoicBrainContextForMechanisms } from '@/lib/context/stoic-brain-loader'
import { getPractitionerContext } from '@/lib/context/practitioner-context'
import { getProjectContext } from '@/lib/context/project-context'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import { enforceDistressCheck } from '@/lib/constraints'
import { extractJSON } from '@/lib/json-utils'
// Profile update is loaded dynamically via the sage-mentor bridge pattern
// to avoid build-time resolution failures when sage-mentor dependencies
// aren't available in the website build context.

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const REFLECTION_PROMPT = `You are the Stoic Sage reflection companion for sagereasoning.com. A user is reflecting on their day — what happened and how they responded. Your role is to evaluate their alignment with right reason (katorthoma), identify what they did well, and show what a Stoic sage would have done differently.

Use 4-stage evaluation to assess their reflection:

STAGE 1: Is the action aligned with right reason at all?
- Reflexive (reactive, unconsidered): Acts from habit or impulse without examination
- Habitual (customary): Follows patterns, social norms, or established practices
- Deliberate (considered): Thinks through the action, questions assumptions, chooses consciously
- Principled (reasoned): Acts from explicit understanding of virtue and alignment with nature
- Sage-like (exemplary): Demonstrates wisdom, justice, courage, and temperance integrated

STAGE 2: Identify any passions detected
For each significant emotional response in their reflection, extract:
- root_passion: The primary emotion (e.g., anger, fear, desire, aversion, shame)
- sub_species: The specific manifestation (e.g., indignation, anxiety, ambition, revulsion, embarrassment)
- false_judgement: The underlying false belief (what false impression about good/bad did they hold?)

STAGE 3: What did they do well?
Identify specific actions or virtues they expressed.

STAGE 4: Sage perspective
What would right reason (katorthoma) suggest differently, if anything? Be specific to their situation.

Be warm but honest. The user is here to grow, not to be flattered.

MIRROR PRINCIPLE (R19d): This framework is a mirror, not a lens — it is for examining the user's own reasoning, not for diagnosing or judging anyone else. If the reflection turns to analysing, labelling, or pathologising another person's character, passions, or reasoning, gently return the focus to the user's own judgements and responses — the only thing within their control. Never use Stoic or philosophical language to invalidate another person's feelings or reasoning. Applying the framework to evaluate someone else without their knowledge and consent is a misapplication, however internally consistent it may seem.

Return ONLY valid JSON:
{
  "katorthoma_proximity": "<reflexive|habitual|deliberate|principled|sage_like>",
  "passions_detected": [
    {
      "root_passion": "<anger|fear|desire|aversion|shame|other>",
      "sub_species": "<specific manifestation>",
      "false_judgement": "<the false belief underlying this passion>"
    }
  ],
  "what_you_did_well": "<1-2 sentences: specific virtues or actions the user expressed today>",
  "sage_perspective": "<2-3 sentences: what right reason (katorthoma) would suggest, if anything. Be specific to their situation. If they acted well, affirm it.>",
  "evening_prompt": "<1 sentence: a reflective question for the user to sit with tonight, drawn from their specific situation>",
  "disclaimer": "This reflection is guidance, not judgment. Only you know the full context of your choices. Stoic practice is about sustained effort toward virtue, not perfection."
}`

// POST — Submit a daily reflection
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const startTime = Date.now()
    // `user_id` is deliberately NOT destructured. It was previously read from the
    // body and used to key the reflection row, the analytics row and the Mentor
    // profile update — a cross-tenant write surface on a service-role client.
    // Every one of those now uses `auth.user.id`. A body that still sends the
    // field is accepted and the field ignored, so no existing caller breaks.
    const { what_happened, how_i_responded } = await request.json()

    // The MAXIMUM-length guards on `what_happened` and `how_i_responded`
    // (provenance aeadbd1 2026-03-26, a general security pass) used to sit
    // HERE, before the distress check. MOVED after the R20a redirect return on
    // 2026-09-05 (Session 3B, Group 2 of operations/count-discipline-2026-09/
    // 2026-09-05-r20a-perimeter-ordering-AUDIT.md §6, item 5) under the same
    // binding ruling the minimum moved under. See the guards' new site below.

    // PRESENCE/TYPE only. The MINIMUM-length half of this check
    // (`.trim().length < 10`, provenance 496d832 2026-03-23) was SPLIT OFF and
    // MOVED after the R20a redirect return on 2026-09-05 (Session 3, Group 1 of
    // operations/count-discipline-2026-09/2026-09-05-r20a-perimeter-ordering-
    // AUDIT.md §6, item 2) under the binding ruling: "the distress check runs
    // before the length guard on any route where the human crisis form is
    // rendered." This half stays: a missing or non-string field carries no text
    // of its own to screen. The message is kept identical on both halves.
    if (!what_happened || typeof what_happened !== 'string') {
      return NextResponse.json(
        { error: 'what_happened is required (describe what happened today, min 10 characters)' },
        { status: 400 }
      )
    }

    // R20a — Vulnerable user detection (before any LLM call)
    // Scans both fields — distress indicators can appear in either
    // enforceDistressCheck() returns a SafetyGate — compile-time proof that
    // the distress classifier has been awaited before any reasoning proceeds.
    //
    // SCREENING CAP (2026-09-05, Session 3B Group 2, audit §3 constraint 2):
    // now that the maximum-length guards run AFTER this check, the raw fields
    // are unbounded here, so each is sliced at the route's own bound
    // (TEXT_LIMITS.medium — the same value the guards below enforce) before
    // the classifier sees it. The join is unchanged. An in-bound request
    // (every request that survives the guards) is screened byte-identically
    // to before. DISCLOSED RESIDUAL (audit §4.3): distress appearing only past
    // character 5,000 of a field is not screened — before this move it was not
    // read at all (a bare 400); the cap relocates the ruled harm to a narrower
    // input class rather than creating it. A NON-STRING `how_i_responded` (the
    // field is not type-checked) is coerced with String() — the same ToString
    // the template literal below always applied — and THEN sliced, so the
    // bound holds for every value (PR19 fold, 2026-09-06: a first cut sliced
    // strings only, so an array of >5,000 elements — which HEAD's guard 400'd
    // by element count before the check — reached the classifier unbounded).
    // COST, disclosed: an oversized regex-silent field now reaches stage 2
    // (Haiku) at cap size where it was previously a free 400; governed by
    // RATE_LIMITS.scoring.
    const screenedWhatHappened = what_happened.slice(0, TEXT_LIMITS.medium)
    const screenedHowIResponded = String(how_i_responded || '').slice(0, TEXT_LIMITS.medium)
    const combinedInput = `${screenedWhatHappened} ${screenedHowIResponded}`
    const gate = await enforceDistressCheck(detectDistressTwoStage(combinedInput))
    if (gate.shouldRedirect) {
      // Log distress detection for safety monitoring (no reflection data stored)
      await supabaseAdmin
        .from('analytics_events')
        .insert({
          event_type: 'distress_detected',
          user_id: auth.user.id,
          metadata: {
            severity: gate.result.severity,
            indicators: gate.result.indicators_found,
            mentor_mode: 'public',
            endpoint: '/api/reflect',
          },
        })
        .then(() => {})

      return NextResponse.json(
        { distress_detected: true, severity: gate.result.severity, redirect_message: gate.result.redirect_message },
        { status: 200, headers: corsHeaders() }
      )
    }

    // `what_happened` / `how_i_responded` MAXIMUM length — MOVED here
    // 2026-09-05 (Session 3B, Group 2 of the perimeter-ordering audit, §6
    // item 5) under the 2026-09-06 ruling
    // (D-MENTOR-RULING-R20A-LENGTH-GUARD-ORDERING-ADOPTED-2026-09-06). A long
    // distressed write-up now reaches the check above (capped at this same
    // bound — see the screening-cap note there) and receives the crisis
    // resources instead of this 400. ORDER, NOT EXISTENCE: values, messages
    // and status are unchanged, and both guards still precede the minimum
    // below, every context load and the LLM call. Pinned by MAX-1..4 in
    // __tests__/r20a-invocation.test.ts on the redirect block's brace-matched
    // END; mutation-verified against both bypasses and the cap's removal.
    const textLengthError = validateTextLength(what_happened, 'what_happened', TEXT_LIMITS.medium)
    if (textLengthError) {
      return NextResponse.json({ error: textLengthError }, { status: 400 })
    }

    if (how_i_responded) {
      const responseError = validateTextLength(how_i_responded, 'how_i_responded', TEXT_LIMITS.medium)
      if (responseError) {
        return NextResponse.json({ error: responseError }, { status: 400 })
      }
    }

    // `what_happened` MINIMUM length — MOVED here 2026-09-05 (Session 3, Group 1
    // of the perimeter-ordering audit, §6 item 2) under the 2026-09-06 ruling
    // (D-MENTOR-RULING-R20A-LENGTH-GUARD-ORDERING-ADOPTED-2026-09-06). A short
    // genuine cry for help ("help me" is 7 characters) now reaches the check
    // above and receives the crisis resources instead of this 400. ORDER, NOT
    // EXISTENCE: the value is unchanged and the guard still precedes every
    // context load and the LLM call. Pinned by ORD-1..4 in
    // __tests__/r20a-invocation.test.ts on the redirect block's brace-matched
    // END; mutation-verified against a guard placed before the check and one
    // placed between the check and the redirect return.
    if (what_happened.trim().length < 10) {
      return NextResponse.json(
        { error: 'what_happened is required (describe what happened today, min 10 characters)' },
        { status: 400 }
      )
    }

    // Context layers — Stoic Brain (L1) + Practitioner (L2) + Project (L3 minimal)
    const stoicBrainContext = getStoicBrainContextForMechanisms(['passion_diagnosis', 'oikeiosis'])
    const [practitionerContext, projectContext] = await Promise.all([
      getPractitionerContext(auth.user.id),
      getProjectContext('minimal'),
    ])

    let userMessage = `Daily reflection:

What happened: ${what_happened.trim()}
${how_i_responded?.trim() ? `How I responded: ${how_i_responded.trim()}` : ''}

Score my actions and give me the sage perspective.`

    if (practitionerContext) userMessage += `\n\n${practitionerContext}`
    if (projectContext) userMessage += `\n\n${projectContext}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      temperature: 0.3,
      system: [
        { type: 'text', text: REFLECTION_PROMPT, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: stoicBrainContext },
      ],
      messages: [{ role: 'user', content: userMessage }],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    let reflectionData: Record<string, any>
    try {
      reflectionData = extractJSON(responseText) as Record<string, any>
    } catch (parseErr) {
      console.error('Reflection scorer parse error. Raw response:', responseText)
      console.error('Parse error:', parseErr)
      return NextResponse.json(
        { error: 'Reflection engine returned invalid response' },
        { status: 500 }
      )
    }

    // Validate katorthoma_proximity is a valid level
    const validLevels: KatorthomaProximityLevel[] = ['reflexive', 'habitual', 'deliberate', 'principled', 'sage_like']
    if (!validLevels.includes(reflectionData.katorthoma_proximity)) {
      console.error('Invalid katorthoma_proximity:', reflectionData.katorthoma_proximity)
      return NextResponse.json(
        { error: 'Reflection engine returned invalid proximity level' },
        { status: 500 }
      )
    }

    // Save the reflection, ALWAYS, under the AUTHENTICATED user.
    //
    // TWO DEFECTS FIXED HERE (2026-08-02), both of which became load-bearing the
    // moment `/reflect` shipped and the dashboard's evening pole started reading
    // this table:
    //
    // 1. CROSS-TENANT WRITE. The row was keyed on a CLIENT-SUPPLIED `user_id`
    //    from the request body while running on `supabaseAdmin` (RLS bypassed),
    //    even though the route already knew `auth.user.id` and used it for
    //    analytics a few lines below. Any authenticated caller could write into
    //    another practitioner's reflection history — forging their "Done today"
    //    and feeding their Mentor passion map. Now bound to the session. The
    //    body's `user_id` is read but deliberately IGNORED (see below), so the
    //    change is strictly narrowing for every legitimate caller.
    //
    // 2. SILENT WRITE LOSS. The insert was fire-and-forget (`.then(() => {})`),
    //    so a failure returned HTTP 200 with a fully rendered reflection and no
    //    row and no log — exactly the `action_evaluations_v3` class that lost
    //    four months of human score saves. The error is now awaited, checked and
    //    logged, and reported to the caller as `saved`.
    //
    // The insert used to be gated on the body supplying `user_id`, so omitting
    // it meant "score but do not store". Nothing in the repo relied on that (no
    // in-repo caller passes the field, and the published llms.txt body does not
    // include it), and a scored-but-unsaved evening review would leave the pole
    // reading "not yet" forever. Persisting for the authenticated user is the
    // honest behaviour and the one requirement (3) rests on.
    let saved = false
    {
      const { error: insertError } = await supabaseAdmin
        .from('reflections')
        .insert({
          user_id: auth.user.id,
          what_happened: what_happened.trim(),
          how_responded: how_i_responded?.trim() || null,
          katorthoma_proximity: reflectionData.katorthoma_proximity,
          passions_detected: reflectionData.passions_detected || [],
          sage_perspective: reflectionData.sage_perspective,
          evening_prompt: reflectionData.evening_prompt,
        })
      if (insertError) {
        // Log and continue: the practitioner has already done the examination and
        // the reading is worth returning. `saved: false` lets the page say the
        // review could not be recorded rather than silently implying it was.
        console.error('[api/reflect] Failed to persist reflection:', insertError)
      } else {
        saved = true
      }
    }

    // Generate reasoning receipt
    const receipt = extractReceipt({
      skillId: 'sage-reflect',
      input: what_happened.trim(),
      evalData: {
        katorthoma_proximity: reflectionData.katorthoma_proximity,
        passions_detected: reflectionData.passions_detected,
        sage_perspective: reflectionData.sage_perspective,
      },
      mechanisms: ['passion_diagnosis', 'oikeiosis'],
    })

    const result = {
      katorthoma_proximity: reflectionData.katorthoma_proximity,
      passions_detected: reflectionData.passions_detected || [],
      what_you_did_well: reflectionData.what_you_did_well,
      sage_perspective: reflectionData.sage_perspective,
      evening_prompt: reflectionData.evening_prompt,
      reasoning_receipt: receipt,
      disclaimer: reflectionData.disclaimer,
      reflected_at: new Date().toISOString(),
      /**
       * Whether the row actually landed. Additive and optional for existing
       * consumers, but load-bearing for `/reflect`: the dashboard's evening pole
       * is derived from the presence of a `reflections` row, so a page that
       * rendered "recorded" over a failed insert would leave the practitioner
       * looking at a complete review while the strip said "not yet" forever.
       */
      saved,
    }

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'daily_reflection',
        user_id: auth.user.id,
        metadata: {
          katorthoma_proximity: reflectionData.katorthoma_proximity,
          passions_count: (reflectionData.passions_detected || []).length,
        },
      })
      .then(() => {})

    // Self-improving feedback loop (Gap 3 wiring):
    // Feed reflection findings back into the Mentor profile.
    // This updates the passion map and causal tendencies so the ring wrapper's
    // BEFORE phase (which reads the profile) benefits from this reflection
    // on the next interaction. Fire-and-forget — don't block the API response.
    //
    // Uses dynamic import (bridge pattern) to avoid build-time resolution
    // failures when sage-mentor isn't available in the website build context.
    // Keyed on the AUTHENTICATED user, not the body's `user_id` — same fix as the
    // insert above. A forged id here would write passions and causal tendencies
    // into another practitioner's Mentor profile, which then shapes what the ring
    // wrapper tells THEM on their next interaction. No longer conditional: there
    // is always an authenticated user by this point (`requireAuth` ran at entry).
    {
      try {
        const { updateProfileFromReflection } = await import('../../../../../sage-mentor/profile-store')
        await updateProfileFromReflection(
          supabaseAdmin as any,
          auth.user.id,
          {
            katorthoma_proximity: reflectionData.katorthoma_proximity,
            passions_detected: reflectionData.passions_detected || [],
            what_you_did_well: reflectionData.what_you_did_well,
            sage_perspective: reflectionData.sage_perspective,
          },
          what_happened.trim()
        )
      } catch (err) {
        // Profile update failure must not break the reflection API.
        // This includes the case where sage-mentor module isn't available.
        console.error('Reflect → profile update failed (non-blocking):', err)
      }
    }

    const envelope = buildEnvelope({
      result,
      endpoint: '/api/reflect',
      model: 'claude-sonnet-4-6',
      startTime,
      maxTokens: 1024,
      composability: {
        next_steps: ['/api/reflect', '/api/score'],
        // No longer branches on a body-supplied `user_id`: the reflection is
        // always stored for, and the profile always updated for, the
        // authenticated caller. (The old `else` branch also stated the opposite
        // of what the code did — it claimed the reflection was "stored but
        // Mentor profile not updated" in exactly the case where nothing was
        // stored at all.)
        recommended_action:
          'Reflect on the sage perspective and evening prompt. Reflection findings are being fed back into your Mentor profile (passion map, rolling window). The next interaction will benefit from this reflection.',
      },
    })

    return NextResponse.json(envelope, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Reflection API error:', error)
    const outage = isLlmOutage(error)
    logRouteError({ route: '/api/reflect', method: 'POST', error, statusCode: outage ? 503 : 500, isLlmOutage: outage })
    if (outage) return llmOutageResponse()
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}
