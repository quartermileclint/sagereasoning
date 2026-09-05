import Anthropic from '@anthropic-ai/sdk'
// #5 + #10 (P-GL): log prod errors + degrade honestly on an LLM outage.
import { isLlmOutage, llmOutageResponse } from '@/lib/llm-outage'
import { logRouteError } from '@/lib/observability-store'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { KatorthomaProximityLevel } from '@/lib/stoic-brain'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { buildEnvelope } from '@/lib/response-envelope'
import { MODEL_FAST, MODEL_DEEP } from '@/lib/model-config'
import { getPractitionerContext } from '@/lib/context/practitioner-context'
import { getProjectContext } from '@/lib/context/project-context'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import { enforceDistressCheck } from '@/lib/constraints'
import type { RetrieveResult } from '@/lib/rag'
import { loadLayer1BlockWithFallback } from '@/lib/rag/load-layer1-block-with-fallback'

/**
 * sage-scenario (score-scenario) — Ethical-dilemma generator + response scorer.
 *
 * POST /api/score-scenario
 *
 * WHAT THIS FILE DOES:
 *   Two operations, selected by request shape:
 *     (a) Generate: produce an age-appropriate ethical scenario (child/teen/
 *         adult audience) with 3-4 possible response options.
 *     (b) Score: given a scenario and a user's response, evaluate the
 *         response against Stoic virtue using the V3 format (proximity,
 *         passions, false judgements, philosophical reflection).
 *   Used primarily by the sagereasoning.com practice tools and as a teaching
 *   surface for younger users.
 *
 * WHY IT IS STRUCTURED THIS WAY:
 *   Calls client.messages.create directly (two separate calls — one for
 *   generation at 'quick' depth / MODEL_FAST, one for scoring at MODEL_DEEP
 *   with Layer 1 still at 'quick' tier). The two operations share a system
 *   prompt (SCENARIO_PROMPT) that instructs the LLM in both modes; the user
 *   message tells the LLM which mode is active.
 *
 * CONTEXT LAYERS WIRED HERE — Pattern A1 (per ADR-001 amended at E5; both
 * call sites wired at E6):
 *   GENERATION call (GET; ~line 165):
 *     Layer 1 (Stoic Brain)      — loadLayer1BlockWithFallback(selectedTopic,
 *                                   'quick', ragCache, '/api/score-scenario:generation')
 *                                   D6 + D7 RAG retrieval; formatted block
 *                                   string injected as the second system
 *                                   message block (replaces predecessor
 *                                   getStoicBrainContext('quick') call site).
 *                                   On any retrieval error, falls back to
 *                                   getStoicBrainContext('quick') silently.
 *                                   Wired at Sub-session E6 (2026-05-04).
 *                                   NOTE: input is the topic string (e.g.,
 *                                   'honesty'); short topic strings may
 *                                   trigger the wrapper's fallback path more
 *                                   often than the SCORING call site.
 *     Layer 2                    — OMITTED (creative generation, not
 *                                   personalised — adding practitioner
 *                                   context would bias scenario generation
 *                                   toward the user's patterns).
 *     Layer 3                    — OMITTED (same reason — creative output,
 *                                   not evaluative).
 *   SCORING call (POST; ~line 305):
 *     Layer 1 (Stoic Brain)      — loadLayer1BlockWithFallback(response.trim(),
 *                                   'quick', ragCache, '/api/score-scenario:scoring')
 *                                   D6 + D7 RAG retrieval; formatted block
 *                                   string injected as the second system
 *                                   message block. Loaded in parallel with
 *                                   L2 + L3 via Promise.all.
 *                                   Wired at Sub-session E6 (2026-05-04).
 *                                   NOTE: Layer 1 retained at 'quick' depth
 *                                   to preserve pre-E6 behaviour byte-for-
 *                                   byte; the LLM uses MODEL_DEEP. The
 *                                   depth-mismatch (MODEL_DEEP with 'quick'-
 *                                   tier Layer 1 corpus) is the route's
 *                                   pre-existing state; logged as an open
 *                                   question for separate review.
 *     Layer 2 (Practitioner)     — getPractitionerContext(auth.user.id)
 *     Layer 3 (Project Context)  — getProjectContext('condensed')
 *
 * WHAT BREAKS IF THIS CHANGES:
 *   - If Layer 3 is added to the generation call, scenarios start to feel
 *     "about SageReasoning" instead of about the user's general life — a
 *     regression for the teaching-tool use case.
 *   - If Layer 2 is added to generation, the user will see scenarios that
 *     mirror their own patterns, which defeats the point of scenarios (to
 *     expose new situations for practice).
 *   - If the scoring call drops Layer 2, returning users lose the
 *     personalisation that makes the tool feel like a real practice partner.
 *   - If the system block order changes (scoring/scenario prompt → stoic
 *     brain), the first block's cache_control: { type: 'ephemeral' } stops
 *     hitting because the second-block content varies per request now.
 *     Pattern A1 spec keeps the prompt as the first block deliberately.
 *
 * DESIGN DECISIONS DOCUMENTED IN:
 *   - operations/handoffs/session-7d-layer1-layer2.md   (L1/L2 origin)
 *   - operations/session-handoffs/2026-04-15-layer3-wiring.md
 *     (L3 added to scoring call only — Group B endpoint)
 *   - adopted/adr/2026-05-04-d6-d7-consumer-wiring.md (ADR-001 — amended at
 *     E5 to specify Pattern A1; this route is the second Group B consumer
 *     wired at E6)
 *   - operations/decision-log.md D-PATTERN-A1-INTRODUCED-AND-WIRED-2026-05-04
 *   - operations/decision-log.md D-SCENARIO-RAG-WIRED-2026-05-04
 */

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SCENARIO_PROMPT = `You are the Stoic Sage education companion for sagereasoning.com. You create age-appropriate ethical dilemmas and score responses to help young people develop virtue-based reasoning.

AUDIENCE LEVELS:
- "child" (ages 6-11): Simple language, relatable school/family situations, gentle scoring, lots of encouragement
- "teen" (ages 12-17): More complex situations involving peer pressure, social media, fairness, growing independence
- "adult" (ages 18+): Full complexity — workplace, relationships, civic duty, moral ambiguity

WHEN GENERATING SCENARIOS:
Create an ethical dilemma appropriate to the audience level. Make it specific and relatable — not abstract philosophy. Include 3-4 possible responses that the user can choose from or write their own. None of the options should be obviously "right" — each should reflect different virtues and trade-offs.

Return ONLY valid JSON:
{
  "scenario": "<the ethical dilemma — 2-4 sentences>",
  "options": [
    { "label": "A", "text": "<option text>" },
    { "label": "B", "text": "<option text>" },
    { "label": "C", "text": "<option text>" }
  ],
  "topic": "<1-2 words: the core ethical theme — e.g. honesty, loyalty, fairness>",
  "oikeiosis_circles_at_stake": "<which concentric circles of relationship are affected: self, family, community, humanity, nature, or cosmos>"
}

WHEN SCORING A RESPONSE (V3 FORMAT):
Analyze the user's response against Stoic principles. Do NOT assign numeric scores.

Instead, evaluate:
1. katorthoma_proximity: How closely aligned is this response to right action? Use one of: "reflexive" (habitual reaction), "habitual" (trained response), "deliberate" (consciously chosen), "principled" (virtue-grounded), "sage_like" (exemplary Stoic wisdom)

2. passions_detected: Array of detected emotional impulses, formatted as:
[{
  "root_passion": "epithumia" (appetite/desire), "hedone" (pleasure-seeking), "phobos" (fear), or "lupe" (distress),
  "sub_species": "<specific passion, e.g., 'fear of social rejection', 'appetite for status'>",
  "false_judgement": "<the underlying false belief driving this passion>"
}]

3. kathekon_quality: The degree to which the response embodies duty and appropriate action:
- "strong": Response demonstrates clear duty-consciousness and virtue alignment
- "moderate": Response shows some duty-awareness with minor misalignments
- "marginal": Response minimally addresses duty; mostly driven by passions or external pressures
- "contrary": Response actively violates duty or virtue principles

4. feedback: 2-3 sentences age-appropriate commentary. Acknowledge what the person understood, highlight the virtue they touched or missed, invite reflection.

5. sage_says: 1 sentence from a Stoic sage — warm, direct, wise. Focus on what is within the person's control (prohairesis).

Return ONLY valid JSON:
{
  "katorthoma_proximity": "reflexive|habitual|deliberate|principled|sage_like",
  "passions_detected": [{"root_passion": "epithumia|hedone|phobos|lupe", "sub_species": "string", "false_judgement": "string"}],
  "kathekon_quality": "strong|moderate|marginal|contrary",
  "feedback": "<2-3 sentences>",
  "sage_says": "<1 sentence>"
}

MIRROR PRINCIPLE (R19d): This tool is a mirror for the user's own thinking. Scoring how the user reasons about the made-up dilemma is exactly what it is for. But if the user's response is really about judging or labelling a real, named person in their life, gently bring the focus back to the user's own choices and what is within their control — and never use these ideas to tell anyone that a real person's feelings are wrong.

DISCLAIMER: This V3 scoring reflects Stoic principles of duty (kathekon), right action (katorthoma), and the pathology of passions (pathos). It is meant for reflection and education, not judgment.`

type Audience = 'child' | 'teen' | 'adult'

const TOPIC_POOLS: Record<Audience, string[]> = {
  child: ['sharing', 'honesty', 'including others', 'standing up for a friend', 'following rules vs doing right', 'dealing with anger'],
  teen: ['peer pressure', 'social media honesty', 'cheating', 'standing up to bullying', 'loyalty vs truth', 'respecting authority vs questioning it'],
  adult: ['workplace ethics', 'civic duty', 'honest communication', 'balancing self-care and obligation', 'financial integrity', 'moral courage'],
}

// GET — Generate a scenario
export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const startTime = Date.now()
    const { searchParams } = new URL(request.url)
    const audience = (searchParams.get('audience') || 'teen') as Audience
    const topic = searchParams.get('topic') || null

    const validAudience = TOPIC_POOLS[audience] ? audience : 'teen'
    const pool = TOPIC_POOLS[validAudience]
    const selectedTopic = topic || pool[Math.floor(Math.random() * pool.length)]

    // Layer 1 only for scenario generation (creative, not scoring) — Pattern A1
    // (per ADR-001 amended at E5; wired at E6).
    // Per-request RetrieveResult cache — KG1 rule 4 (never module-level).
    // Input = selectedTopic (semantic core; the LLM is asked to generate a
    // scenario about this topic, so the retrieved Layer 1 passages are scoped
    // to that topic's mechanism-tagged corpus content).
    const ragCache = new Map<string, RetrieveResult>()
    const stoicBrainContext = await loadLayer1BlockWithFallback(
      selectedTopic,
      'quick',
      ragCache,
      '/api/score-scenario:generation',
    )
    const userMessage = `Generate an ethical scenario for audience: ${validAudience}
Topic hint: ${selectedTopic}

Return the JSON scenario with options.`

    const message = await client.messages.create({
      model: MODEL_FAST,
      max_tokens: 512,
      temperature: 0.7,
      system: [
        { type: 'text', text: SCENARIO_PROMPT, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: stoicBrainContext },
      ],
      messages: [{ role: 'user', content: userMessage }],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    let scenarioData
    try {
      const cleaned = responseText
        .replace(/```json?\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      scenarioData = JSON.parse(cleaned)
    } catch {
      console.error('Scenario generator parse error:', responseText)
      return NextResponse.json(
        { error: 'Failed to generate scenario' },
        { status: 500 }
      )
    }

    const result = {
      audience: validAudience,
      ...scenarioData,
      oikeiosis_circles_at_stake: scenarioData.oikeiosis_circles_at_stake || 'community',
      instructions: 'Choose one of the options above, or write your own response. Then POST it back to this endpoint for scoring.',
    }

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'scenario_generated',
        metadata: { audience: validAudience, topic: scenarioData.topic || selectedTopic },
      })
      .then(() => {})

    const envelope = buildEnvelope({
      result,
      endpoint: '/api/score-scenario',
      model: MODEL_FAST,
      startTime,
      maxTokens: 512,
      composability: {
        next_steps: ['POST /api/score-scenario'],
        recommended_action: 'User should respond to the scenario, then POST their response back to this endpoint for scoring.',
      },
    })

    return NextResponse.json(envelope, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Scenario generation error:', error)
    const outage = isLlmOutage(error)
    logRouteError({ route: '/api/score-scenario', method: 'POST', error, statusCode: outage ? 503 : 500, isLlmOutage: outage, context: { phase: 'generation' } })
    if (outage) return llmOutageResponse()
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST — Score a response to a scenario
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const startTime = Date.now()
    const { scenario, response, audience, user_id } = await request.json()

    if (!scenario || typeof scenario !== 'string') {
      return NextResponse.json(
        { error: 'scenario is required — the ethical dilemma text' },
        { status: 400 }
      )
    }

    // PRESENCE/TYPE only. The MINIMUM-length half of this check
    // (`.trim().length < 5`, provenance b0cecce 2026-03-24, file creation) was
    // SPLIT OFF and MOVED after the R20a redirect return on 2026-09-05
    // (Session 3, Group 1 of operations/count-discipline-2026-09/2026-09-05-
    // r20a-perimeter-ordering-AUDIT.md §6, item 4) under the binding ruling:
    // "the distress check runs before the length guard on any route where the
    // human crisis form is rendered." This half stays: `response` is the ONLY
    // field the check below screens, so a missing or non-string `response`
    // carries no text to screen, and the check's `detectDistressTwoStage(text:
    // string)` contract needs a string. The message is kept identical on both
    // halves. (The `scenario` presence check above is a P-class check on a
    // DIFFERENT field from the screened one — audit §4.4, a mentor question,
    // deliberately not moved here.)
    if (!response || typeof response !== 'string') {
      return NextResponse.json(
        { error: 'response is required — the user\'s answer (min 5 characters)' },
        { status: 400 }
      )
    }

    // The MAXIMUM-length guards on `scenario` and `response` (provenance
    // aeadbd1 2026-03-26, a general security pass) used to sit HERE, before
    // the distress check. MOVED after the R20a redirect return on 2026-09-05
    // (Session 3B, Group 2 of operations/count-discipline-2026-09/2026-09-05-
    // r20a-perimeter-ordering-AUDIT.md §6, item 8) under the binding ruling:
    // "the distress check runs before the length guard on any route where the
    // human crisis form is rendered." See the guards' new site below.

    // R20a — Vulnerable user detection (before any LLM call)
    // enforceDistressCheck() returns a SafetyGate — compile-time proof that
    // the distress classifier has been awaited before any reasoning proceeds.
    //
    // SCREENING CAP (2026-09-05, Session 3B Group 2, audit §3 constraint 2):
    // now that the maximum-length guard runs AFTER this check, the raw
    // `response` is unbounded here, so it is sliced at the route's own bound
    // (TEXT_LIMITS.medium — the same value the guard below enforces) before
    // the classifier sees it. An in-bound request is screened byte-identically
    // to before. `scenario` is NOT screened on this route (unchanged), so
    // moving its maximum sends nothing new to the classifier. DISCLOSED
    // RESIDUAL (audit §4.3): distress appearing only past character 5,000 of
    // `response` is not screened — before this move it was not read at all
    // (a bare 400).
    const screenedResponse = response.slice(0, TEXT_LIMITS.medium)
    const gate = await enforceDistressCheck(detectDistressTwoStage(screenedResponse))
    if (gate.shouldRedirect) {
      return NextResponse.json(
        { distress_detected: true, severity: gate.result.severity, redirect_message: gate.result.redirect_message },
        { status: 200, headers: corsHeaders() }
      )
    }

    // `scenario` / `response` MAXIMUM length — MOVED here 2026-09-05 (Session
    // 3B, Group 2 of the perimeter-ordering audit, §6 item 8) under the
    // 2026-09-06 ruling
    // (D-MENTOR-RULING-R20A-LENGTH-GUARD-ORDERING-ADOPTED-2026-09-06). A long
    // distressed response now reaches the check above (capped at this same
    // bound) and receives the crisis resources instead of this 400. ORDER,
    // NOT EXISTENCE: values, messages, status and the guards' relative order
    // (scenario, then response, then the minimum — the pre-Group-1 order) are
    // unchanged, and both still precede the RAG/context loads and the LLM
    // call. Pinned by MAX-1..4 in __tests__/r20a-invocation.test.ts on the
    // redirect block's brace-matched END; mutation-verified against both
    // bypasses and the cap's removal.
    const scenarioErr = validateTextLength(scenario, 'scenario', TEXT_LIMITS.medium)
    if (scenarioErr) {
      return NextResponse.json({ error: scenarioErr }, { status: 400 })
    }

    const responseErr = validateTextLength(response, 'response', TEXT_LIMITS.medium)
    if (responseErr) {
      return NextResponse.json({ error: responseErr }, { status: 400 })
    }

    // `response` MINIMUM length — MOVED here 2026-09-05 (Session 3, Group 1 of
    // the perimeter-ordering audit, §6 item 4) under the 2026-09-06 ruling
    // (D-MENTOR-RULING-R20A-LENGTH-GUARD-ORDERING-ADOPTED-2026-09-06). A short
    // genuine cry for help now reaches the check above and receives the crisis
    // resources instead of this 400. ORDER, NOT EXISTENCE: the value is
    // unchanged and the guard still precedes the RAG/context loads and the LLM
    // call. Pinned by ORD-1..4 in __tests__/r20a-invocation.test.ts on the
    // redirect block's brace-matched END; mutation-verified against both
    // bypasses (before the check; between the check and the redirect return).
    if (response.trim().length < 5) {
      return NextResponse.json(
        { error: 'response is required — the user\'s answer (min 5 characters)' },
        { status: 400 }
      )
    }

    const validAudience = audience || 'teen'

    // Context layers for scoring (human-facing) — Pattern A1
    // (per ADR-001 amended at E5; wired at E6).
    // Per-request RetrieveResult cache — KG1 rule 4 (never module-level).
    // Input = response.trim() (the user's actual response — prose-rich
    // evaluative input the corpus is indexed against).
    // Layer 1 retained at 'quick' depth to preserve existing behaviour
    // byte-for-byte; the SCORING call uses MODEL_DEEP for the LLM but the
    // Layer 1 corpus tier ('quick' = 6 mechanisms) is unchanged from the
    // pre-E6 state. Depth-mismatch with MODEL_DEEP is logged as an open
    // question for separate review (D-SCENARIO-RAG-WIRED-2026-05-04).
    const ragCache = new Map<string, RetrieveResult>()
    const [scoringStoicContext, practitionerContext, projectContext] = await Promise.all([
      loadLayer1BlockWithFallback(response.trim(), 'quick', ragCache, '/api/score-scenario:scoring'),
      getPractitionerContext(auth.user.id),
      getProjectContext('condensed'),
    ])
    let userMessage = `Audience level: ${validAudience}

Scenario: ${scenario.trim()}

User's response: ${response.trim()}

Score this response. Return the JSON.`

    if (practitionerContext) userMessage += `\n\n${practitionerContext}`
    if (projectContext) userMessage += `\n\n${projectContext}`

    const message = await client.messages.create({
      model: MODEL_DEEP,
      max_tokens: 1024,
      temperature: 0.2,
      system: [
        { type: 'text', text: SCENARIO_PROMPT, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: scoringStoicContext },
      ],
      messages: [{ role: 'user', content: userMessage }],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    let scoreData
    try {
      const cleaned = responseText
        .replace(/```json?\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      scoreData = JSON.parse(cleaned)
    } catch {
      console.error('Scenario scorer parse error:', responseText)
      return NextResponse.json(
        { error: 'Scoring engine returned invalid response' },
        { status: 500 }
      )
    }

    // Validate V3 structure
    const validProximities: KatorthomaProximityLevel[] = ['reflexive', 'habitual', 'deliberate', 'principled', 'sage_like']
    const validKathekonQualities = ['strong', 'moderate', 'marginal', 'contrary']

    const proximityLevel = validProximities.includes(scoreData.katorthoma_proximity)
      ? scoreData.katorthoma_proximity
      : 'deliberate'

    const kathekonQuality = validKathekonQualities.includes(scoreData.kathekon_quality)
      ? scoreData.kathekon_quality
      : 'moderate'

    const passionsDetected = Array.isArray(scoreData.passions_detected)
      ? scoreData.passions_detected.filter((p: any) =>
          ['epithumia', 'hedone', 'phobos', 'lupe'].includes(p.root_passion)
        )
      : []

    const result = {
      audience: validAudience,
      katorthoma_proximity: proximityLevel,
      passions_detected: passionsDetected,
      kathekon_quality: kathekonQuality,
      feedback: scoreData.feedback || 'Consider how your choice reflects your duty to yourself and others.',
      sage_says: scoreData.sage_says || 'What you control is your effort and intention — focus there.',
      scored_at: new Date().toISOString(),
      disclaimer: 'This V3 scoring reflects Stoic principles of duty (kathekon) and right action (katorthoma). It is meant for reflection and education, not judgment.',
    }

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'scenario_scored_v3',
        user_id: user_id || null,
        metadata: {
          audience: validAudience,
          katorthoma_proximity: proximityLevel,
          kathekon_quality: kathekonQuality,
          passions_count: passionsDetected.length,
        },
      })
      .then(() => {})

    const envelope = buildEnvelope({
      result,
      endpoint: '/api/score-scenario',
      model: MODEL_DEEP,
      startTime,
      maxTokens: 1024,
      composability: {
        next_steps: ['/api/score-iterate'],
        recommended_action: 'Review feedback and sage guidance. Consider deeper reflection with /api/reflect or iterate with /api/score-iterate.',
      },
    })

    return NextResponse.json(envelope, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Scenario score API error:', error)
    const outage = isLlmOutage(error)
    logRouteError({ route: '/api/score-scenario', method: 'POST', error, statusCode: outage ? 503 : 500, isLlmOutage: outage, context: { phase: 'scoring' } })
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
