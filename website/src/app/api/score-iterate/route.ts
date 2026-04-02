import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimit, RATE_LIMITS, validateApiKey, withUsageHeaders, validateTextLength, TEXT_LIMITS, publicCorsHeaders, publicCorsPreflightResponse } from '@/lib/security'
import { buildV3IterationPrompt, getV3IterationWarning, compareProximity, higherProximity, validateV3IterateRequest } from '@/lib/deliberation'
import { buildEnvelope } from '@/lib/response-envelope'
import { MODEL_DEEP, cacheKey, cacheGet, cacheSet } from '@/lib/model-config'
import type { V3DeliberationChain, V3DeliberationStep, DetectedPassion } from '@/lib/deliberation'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// V3 System prompt for initial deliberation (step 1 of a new chain)
// Requests: katorthoma_proximity, passions_detected, is_kathekon, kathekon_quality,
// virtue_domains_engaged, improvement_path, and philosophical_reflection
const INITIAL_SYSTEM_PROMPT = `You are the Stoic evaluation engine for sagereasoning.com. Your role is to evaluate actions through the lens of Stoic virtue and the dichotomy of control.

FOUR CARDINAL VIRTUES (inseparable aspects of practical wisdom):
- Phronesis (Wisdom): Sound judgement about what is genuinely good/bad/indifferent
- Dikaiosyne (Justice): Fairness, honesty, and proper treatment of others
- Andreia (Courage): Acting rightly despite fear, difficulty, or social pressure
- Sophrosyne (Temperance): Self-control and moderation through reason, not impulse

THE DICHOTOMY OF CONTROL (fundamental premise):
Only judgements, desires, and choices lie fully within your control (eph' hemin).
External outcomes, others' opinions, and bodily sensations do not.

EVALUATION SEQUENCE (apply all 4 stages in order):

STAGE 1 — PROHAIRESIS FILTER (Control Filter)
Separate what was within the agent's moral choice (prohairesis) from what was not. Only evaluate what is eph' hemin.
Output: within_prohairesis (array), outside_prohairesis (array)

STAGE 2 — KATHEKON ASSESSMENT (Appropriate Action)
Is this action a kathekon (duty/appropriate action)? Consider:
- Natural relationships (oikeiosis): family, community, role obligations
- Reasonable justification: does it serve virtue even if outcome uncertain?
- Alignment with preferred indifferents: health, wealth, reputation matter instrumentally only
Output: is_kathekon (boolean), quality ("strong" | "moderate" | "marginal" | "contrary")

STAGE 3 — PASSION DIAGNOSIS
Which false judgements distorted impression (phantasia), assent (synkatathesis), impulse (horme), or action (praxis)?
4 root passions: epithumia (craving), hedone (irrational pleasure), phobos (fear), lupe (distress)
Output: passions_detected (array of {id, name, root_passion}), false_judgements (array), causal_stage_affected

STAGE 4 — UNIFIED VIRTUE ASSESSMENT
How close is the ruling faculty (hegemonikon) to the sage ideal? Virtue is one, indivisible.
Katorthoma proximity levels (in order of approaching the sage):
- reflexive: driven by habit/custom without reflection
- habitual: mostly automatic, occasional reflection
- deliberate: deliberative, weighing alternatives carefully
- principled: grounded in clear principles, consistent virtuous reasoning
- sage_like: perfect alignment with nature and virtue

Output: katorthoma_proximity, ruling_faculty_state, virtue_domains_engaged (array)

DELIBERATION FRAMEWORK (apply after analysis):
Q1: Is the action honourable (to kalon)?
Q2: If comparing honourable options, which is MORE honourable?
Q3: Is it advantageous (utile)?
Q4: If comparing advantageous options, which is MORE advantageous?
Q5: If honourable conflicts with advantageous, HONOUR ALWAYS PREVAILS.

Return ONLY valid JSON — no markdown, no explanation outside the JSON:
{
  "control_filter": {
    "within_prohairesis": ["<string>", ...],
    "outside_prohairesis": ["<string>", ...]
  },
  "kathekon_assessment": {
    "is_kathekon": <boolean>,
    "quality": "<strong|moderate|marginal|contrary>"
  },
  "passion_diagnosis": {
    "passions_detected": [{"id": "<sub-species id>", "name": "<display name>", "root_passion": "<epithumia|hedone|phobos|lupe>"}],
    "false_judgements": ["<string>", ...],
    "causal_stage_affected": "<phantasia|synkatathesis|horme|praxis>"
  },
  "virtue_quality": {
    "katorthoma_proximity": "<reflexive|habitual|deliberate|principled|sage_like>",
    "ruling_faculty_state": "<string>",
    "virtue_domains_engaged": ["<phronesis|dikaiosyne|andreia|sophrosyne>", ...]
  },
  "cicero_assessment": {
    "Q1_is_honourable": <boolean>,
    "Q2_comparative_honour": "<string or null>",
    "Q3_is_advantageous": <boolean>,
    "Q4_comparative_advantage": "<string or null>",
    "Q5_conflict_resolution": "<string or null>"
  },
  "improvement_path": "<which false judgement to correct and which passion to address>",
  "oikeiosis_context": "<which natural relationships were relevant and how they were considered>",
  "philosophical_reflection": "<2-3 sentences of Stoic reasoning about this action>",
  "deliberation_note": "<1 sentence acknowledging the agent's deliberation effort>"
}`

/**
 * POST /api/score-iterate
 *
 * Two modes:
 * 1. START A NEW CHAIN: Send { action, context?, relationships?, emotional_state?, agent_id? }
 *    → Creates V3 chain, evaluates initial action, returns chain_id + proximity + feedback
 *
 * 2. CONTINUE A CHAIN: Send { chain_id, revised_action, revision_rationale?, agent_id? }
 *    → Evaluates revised action with deliberation context, appends step to V3 chain
 */
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.publicAgent)
  if (rateLimitError) return rateLimitError

  const keyCheck = await validateApiKey(request, 'score_iterate')
  if (!keyCheck.valid) return keyCheck.error

  try {
    const body = await request.json()
    const { chain_id, action, revised_action, revision_rationale, context, relationships, emotional_state, agent_id } = body

    // ── MODE 1: Start a new deliberation chain ──────────────────────
    if (!chain_id) {
      if (!action || typeof action !== 'string' || action.trim().length === 0) {
        return NextResponse.json({ error: 'action is required to start a new deliberation chain' }, { status: 400 })
      }

      const actionErr = validateTextLength(action, 'action', TEXT_LIMITS.medium)
      if (actionErr) return NextResponse.json({ error: actionErr }, { status: 400 })
      const contextErr = validateTextLength(context, 'context', TEXT_LIMITS.medium)
      if (contextErr) return NextResponse.json({ error: contextErr }, { status: 400 })

      // Evaluate the initial action
      const userMessage = `Please evaluate the following action through the Stoic framework.

Action: ${action.trim()}
${context?.trim() ? `Context: ${context.trim()}` : ''}
${relationships?.trim() ? `Relationships/Stakeholders: ${relationships.trim()}` : ''}
${emotional_state?.trim() ? `Emotional state: ${emotional_state.trim()}` : ''}

Return only the JSON evaluation object.`

      // Check cache for identical initial actions
      const ck = cacheKey('/api/score-iterate/initial', { action: action.trim(), context: context?.trim(), relationships: relationships?.trim(), emotional_state: emotional_state?.trim() })
      let evalData = cacheGet(ck) as Record<string, any> | undefined
      let fromCache = !!evalData

      if (!evalData) {
        const message = await client.messages.create({
          model: MODEL_DEEP,
          max_tokens: 1536,
          temperature: 0.2,
          system: [{ type: 'text', text: INITIAL_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
          messages: [{ role: 'user', content: userMessage }],
        })

        const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
        try {
          const cleaned = responseText.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim()
          evalData = JSON.parse(cleaned)
        } catch {
          console.error('Failed to parse Claude response:', responseText)
          return NextResponse.json({ error: 'Evaluation engine returned invalid response' }, { status: 500 })
        }

        // Validate required V3 fields
        const required = ['control_filter', 'kathekon_assessment', 'passion_diagnosis', 'virtue_quality', 'cicero_assessment', 'improvement_path', 'oikeiosis_context', 'philosophical_reflection']
        for (const field of required) {
          if (evalData![field] === undefined) {
            return NextResponse.json({ error: `Missing field: ${field}` }, { status: 500 })
          }
        }

        // Cache the parsed result for identical future inputs
        cacheSet(ck, evalData!)
      }

      // At this point evalData is guaranteed non-undefined (either from cache or parsed API response)
      const initialEval = evalData as Record<string, any>

      const proximity = initialEval.virtue_quality?.katorthoma_proximity
      if (!proximity || !['reflexive', 'habitual', 'deliberate', 'principled', 'sage_like'].includes(proximity)) {
        return NextResponse.json({ error: 'Invalid katorthoma_proximity value' }, { status: 500 })
      }

      // Create the V3 deliberation chain
      const { data: chain, error: chainErr } = await supabaseAdmin
        .from('deliberation_chains_v3')
        .insert({
          agent_id: agent_id || null,
          original_action: action.trim(),
          context: context?.trim() || null,
          relationships: relationships?.trim() || null,
          emotional_state: emotional_state?.trim() || null,
          initial_proximity: proximity,
          current_proximity: proximity,
          best_proximity: proximity,
          iteration_count: 1,
          status: 'active',
        })
        .select('id')
        .single()

      if (chainErr || !chain) {
        console.error('Failed to create deliberation chain:', chainErr)
        return NextResponse.json({ error: 'Failed to create deliberation chain' }, { status: 500 })
      }

      // Record step 1 in V3 format
      await supabaseAdmin
        .from('deliberation_steps_v3')
        .insert({
          chain_id: chain.id,
          step_number: 1,
          action_description: action.trim(),
          is_kathekon: initialEval.kathekon_assessment.is_kathekon,
          kathekon_quality: initialEval.kathekon_assessment.quality,
          passions_detected: initialEval.passion_diagnosis.passions_detected || [],
          false_judgements: initialEval.passion_diagnosis.false_judgements || [],
          causal_stage_affected: initialEval.passion_diagnosis.causal_stage_affected || null,
          katorthoma_proximity: proximity,
          ruling_faculty_state: initialEval.virtue_quality.ruling_faculty_state,
          virtue_domains_engaged: initialEval.virtue_quality.virtue_domains_engaged || [],
          philosophical_reflection: initialEval.philosophical_reflection,
          improvement_path: initialEval.improvement_path,
          oikeiosis_context: initialEval.oikeiosis_context,
          proximity_direction: null,
          passions_direction: null,
          cicero_assessment: initialEval.cicero_assessment,
          iteration_warning_issued: false,
        })

      // Analytics
      await supabaseAdmin
        .from('analytics_events')
        .insert({
          event_type: 'deliberation_start_v3',
          metadata: {
            chain_id: chain.id,
            agent_id: agent_id || null,
            initial_proximity: proximity,
            is_kathekon: initialEval.kathekon_assessment.is_kathekon,
          },
        })
        .then(() => {})

      const startTime = Date.now()
      const initialResult = {
        chain_id: chain.id,
        step_number: 1,
        iteration_mode: 'initial',
        katorthoma_proximity: proximity,
        is_kathekon: initialEval.kathekon_assessment.is_kathekon,
        kathekon_quality: initialEval.kathekon_assessment.quality,
        passions_detected: initialEval.passion_diagnosis.passions_detected,
        false_judgements: initialEval.passion_diagnosis.false_judgements,
        causal_stage_affected: initialEval.passion_diagnosis.causal_stage_affected,
        virtue_domains_engaged: initialEval.virtue_quality.virtue_domains_engaged,
        ruling_faculty_state: initialEval.virtue_quality.ruling_faculty_state,
        philosophical_reflection: initialEval.philosophical_reflection,
        improvement_path: initialEval.improvement_path,
        oikeiosis_context: initialEval.oikeiosis_context,
        cicero_assessment: initialEval.cicero_assessment,
        deliberation_note: initialEval.deliberation_note || 'Chain started. The sage has provided evaluation and guidance. To iterate, call this endpoint again with chain_id and your revised_action.',
        disclaimer: 'Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations.',
      }

      const envelope = buildEnvelope({
        result: initialResult,
        endpoint: '/api/score-iterate',
        model: MODEL_DEEP,
        startTime,
        maxTokens: 1536,
        usage: {
          monthly_calls_after: keyCheck.monthly_calls_after,
          monthly_limit: keyCheck.monthly_calls_after + keyCheck.monthly_remaining,
          monthly_remaining: keyCheck.monthly_remaining,
        },
        composability: {
          next_steps: ['/api/score-iterate'],
          recommended_action: `Chain started at ${proximity}. Submit revised action to continue deliberation.`,
          chain_start: {
            chain_id: chain.id,
            revised_action: '(your revised action)',
            revision_rationale: '(why you changed it)',
          },
        },
      })

      return NextResponse.json(envelope, { headers: withUsageHeaders({ ...publicCorsHeaders() }, keyCheck) })
    }

    // ── MODE 2: Continue an existing deliberation chain ─────────────
    if (!revised_action || typeof revised_action !== 'string' || revised_action.trim().length === 0) {
      return NextResponse.json({ error: 'revised_action is required when continuing a deliberation chain' }, { status: 400 })
    }

    const revisedErr = validateTextLength(revised_action, 'revised_action', TEXT_LIMITS.medium)
    if (revisedErr) return NextResponse.json({ error: revisedErr }, { status: 400 })
    const rationaleErr = validateTextLength(revision_rationale, 'revision_rationale', TEXT_LIMITS.medium)
    if (rationaleErr) return NextResponse.json({ error: rationaleErr }, { status: 400 })

    // Fetch the V3 chain
    const { data: chain, error: chainErr } = await supabaseAdmin
      .from('deliberation_chains_v3')
      .select('*')
      .eq('id', chain_id)
      .single()

    if (chainErr || !chain) {
      return NextResponse.json({ error: 'Deliberation chain not found' }, { status: 404 })
    }

    if (chain.status !== 'active') {
      return NextResponse.json({
        error: `This deliberation chain has been ${chain.status}. Start a new chain to continue deliberating.`,
        chain_summary: {
          chain_id: chain.id,
          initial_proximity: chain.initial_proximity,
          current_proximity: chain.current_proximity,
          best_proximity: chain.best_proximity,
          iterations: chain.iteration_count,
        }
      }, { status: 400 })
    }

    // Verify agent ownership if agent_id provided
    if (agent_id && chain.agent_id && chain.agent_id !== agent_id) {
      return NextResponse.json({ error: 'agent_id does not match this deliberation chain' }, { status: 403 })
    }

    // Enforce max chain iterations based on API key tier
    if (chain.iteration_count >= keyCheck.max_chain_iterations) {
      const tierMessage = keyCheck.tier === 'free'
        ? 'Free tier deliberation chains are limited to 1 iteration. Upgrade to a paid API key for up to 3 iterations per chain.'
        : `Paid tier deliberation chains are limited to ${keyCheck.max_chain_iterations} iterations per chain.`
      return NextResponse.json({
        error: 'Deliberation chain iteration limit reached',
        message: tierMessage,
        chain_id: chain_id,
        iterations_used: chain.iteration_count,
        max_iterations: keyCheck.max_chain_iterations,
        current_proximity: chain.current_proximity,
        best_proximity: chain.best_proximity,
        upgrade: keyCheck.tier === 'free' ? 'Contact zeus@sagereasoning.com to upgrade to a paid API key.' : undefined,
        conclude_hint: `To conclude this chain: POST to /api/deliberation-chain/${chain_id}/conclude`,
      }, { status: 403, headers: publicCorsHeaders() })
    }

    // Get the latest step for context
    const { data: lastStep, error: stepErr } = await supabaseAdmin
      .from('deliberation_steps_v3')
      .select('*')
      .eq('chain_id', chain_id)
      .order('step_number', { ascending: false })
      .limit(1)
      .single()

    if (stepErr || !lastStep) {
      return NextResponse.json({ error: 'Could not retrieve previous deliberation step' }, { status: 500 })
    }

    const nextStepNumber = lastStep.step_number + 1

    // Check for iteration warning (every 5th)
    const iterationWarning = getV3IterationWarning(nextStepNumber)

    // Build iteration-aware prompt using V3 types
    const iterationPrompt = buildV3IterationPrompt({
      action: lastStep.action_description,
      katorthoma_proximity: lastStep.katorthoma_proximity,
      passions_detected: lastStep.passions_detected as DetectedPassion[],
      false_judgements: lastStep.false_judgements as string[],
      philosophical_reflection: lastStep.philosophical_reflection,
      improvement_path: lastStep.improvement_path,
    }, nextStepNumber)

    const userMessage = `The agent has revised their action (iteration ${nextStepNumber}).

Previous action: ${lastStep.action_description}
Revised action: ${revised_action.trim()}
${revision_rationale?.trim() ? `Revision rationale: ${revision_rationale.trim()}` : ''}
${chain.context?.trim() ? `Original context: ${chain.context.trim()}` : ''}

Evaluate the revised action. Return only the JSON evaluation object.`

    // Check cache for identical iteration inputs
    const iterCk = cacheKey('/api/score-iterate/continue', { chain_id, revised_action: revised_action.trim(), revision_rationale: revision_rationale?.trim(), step: nextStepNumber })
    let evalData = cacheGet(iterCk) as Record<string, any> | undefined

    if (!evalData) {
      const message = await client.messages.create({
        model: MODEL_DEEP,
        max_tokens: 1536,
        temperature: 0.2,
        system: [{ type: 'text', text: iterationPrompt, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: userMessage }],
      })

      const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
      try {
        const cleaned = responseText.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim()
        evalData = JSON.parse(cleaned)
      } catch {
        console.error('Failed to parse iteration response:', responseText)
        return NextResponse.json({ error: 'Evaluation engine returned invalid response' }, { status: 500 })
      }

      // Validate V3 fields
      const required = ['control_filter', 'kathekon_assessment', 'passion_diagnosis', 'virtue_quality', 'cicero_assessment', 'improvement_path', 'oikeiosis_context', 'philosophical_reflection']
      for (const field of required) {
        if (evalData![field] === undefined) {
          return NextResponse.json({ error: `Missing field: ${field}` }, { status: 500 })
        }
      }

      // Cache for identical future requests
      cacheSet(iterCk, evalData!)
    }

    // At this point evalData is guaranteed non-undefined
    const iterEval = evalData as Record<string, any>

    const newProximity = iterEval.virtue_quality?.katorthoma_proximity
    if (!newProximity || !['reflexive', 'habitual', 'deliberate', 'principled', 'sage_like'].includes(newProximity)) {
      return NextResponse.json({ error: 'Invalid katorthoma_proximity value' }, { status: 500 })
    }

    // Determine direction of travel
    const proximityDirection = compareProximity(lastStep.katorthoma_proximity, newProximity)

    // Determine passions direction (fewer, same, or more detected)
    const lastPassionCount = (lastStep.passions_detected as DetectedPassion[]).length
    const newPassionCount = (iterEval.passion_diagnosis.passions_detected || []).length
    const passionsDirection: 'fewer' | 'same' | 'more' =
      newPassionCount < lastPassionCount ? 'fewer' :
      newPassionCount > lastPassionCount ? 'more' :
      'same'

    // Update chain proximity tracking
    const bestProximity = higherProximity(chain.best_proximity, newProximity)

    // Record the step
    await supabaseAdmin
      .from('deliberation_steps_v3')
      .insert({
        chain_id: chain_id,
        step_number: nextStepNumber,
        action_description: revised_action.trim(),
        revision_rationale: revision_rationale?.trim() || null,
        is_kathekon: iterEval.kathekon_assessment.is_kathekon,
        kathekon_quality: iterEval.kathekon_assessment.quality,
        passions_detected: iterEval.passion_diagnosis.passions_detected || [],
        false_judgements: iterEval.passion_diagnosis.false_judgements || [],
        causal_stage_affected: iterEval.passion_diagnosis.causal_stage_affected || null,
        katorthoma_proximity: newProximity,
        ruling_faculty_state: iterEval.virtue_quality.ruling_faculty_state,
        virtue_domains_engaged: iterEval.virtue_quality.virtue_domains_engaged || [],
        philosophical_reflection: iterEval.philosophical_reflection,
        improvement_path: iterEval.improvement_path,
        oikeiosis_context: iterEval.oikeiosis_context,
        proximity_direction: proximityDirection,
        passions_direction: passionsDirection,
        cicero_assessment: iterEval.cicero_assessment,
        iteration_warning_issued: !!iterationWarning,
      })

    // Update chain with new current and best proximities
    await supabaseAdmin
      .from('deliberation_chains_v3')
      .update({
        current_proximity: newProximity,
        best_proximity: bestProximity,
        iteration_count: chain.iteration_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', chain_id)

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'deliberation_continue_v3',
        metadata: {
          chain_id: chain_id,
          agent_id: agent_id || chain.agent_id || null,
          step_number: nextStepNumber,
          previous_proximity: lastStep.katorthoma_proximity,
          new_proximity: newProximity,
          proximity_direction: proximityDirection,
          passions_direction: passionsDirection,
          warning_issued: !!iterationWarning,
        },
      })
      .then(() => {})

    const startTime = Date.now()
    const iterationResult: Record<string, unknown> = {
      chain_id: chain_id,
      step_number: nextStepNumber,
      iteration_mode: 'revision',
      katorthoma_proximity: newProximity,
      proximity_direction: proximityDirection,
      is_kathekon: iterEval.kathekon_assessment.is_kathekon,
      kathekon_quality: iterEval.kathekon_assessment.quality,
      passions_detected: iterEval.passion_diagnosis.passions_detected,
      false_judgements: iterEval.passion_diagnosis.false_judgements,
      causal_stage_affected: iterEval.passion_diagnosis.causal_stage_affected,
      passions_direction: passionsDirection,
      virtue_domains_engaged: iterEval.virtue_quality.virtue_domains_engaged,
      ruling_faculty_state: iterEval.virtue_quality.ruling_faculty_state,
      philosophical_reflection: iterEval.philosophical_reflection,
      improvement_path: iterEval.improvement_path,
      oikeiosis_context: iterEval.oikeiosis_context,
      cicero_assessment: iterEval.cicero_assessment,
      previous_proximity: lastStep.katorthoma_proximity,
      best_proximity_in_chain: bestProximity,
      disclaimer: 'Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations.',
    }

    // Add iteration warning if applicable
    if (iterationWarning) {
      iterationResult.iteration_warning = iterationWarning
    }

    const canContinueChain = chain.iteration_count + 1 < keyCheck.max_chain_iterations
    const envelope = buildEnvelope({
      result: iterationResult,
      endpoint: '/api/score-iterate',
      model: MODEL_DEEP,
      startTime,
      maxTokens: 1536,
      usage: {
        monthly_calls_after: keyCheck.monthly_calls_after,
        monthly_limit: keyCheck.monthly_calls_after + keyCheck.monthly_remaining,
        monthly_remaining: keyCheck.monthly_remaining,
      },
      composability: {
        next_steps: canContinueChain ? ['/api/score-iterate'] : ['/api/reason'],
        recommended_action: canContinueChain
          ? `Iteration ${nextStepNumber} complete (${proximityDirection}). Submit another revised action to continue.`
          : `Iteration limit reached for ${keyCheck.tier} tier. Apply insights from the deliberation chain.`,
        chain_start: canContinueChain ? {
          chain_id: chain_id,
          revised_action: '(your next revision)',
          revision_rationale: '(why you changed it)',
        } : undefined,
      },
    })

    return NextResponse.json(envelope, { headers: withUsageHeaders({ ...publicCorsHeaders() }, keyCheck) })
  } catch (error) {
    console.error('Score-iterate API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET — Usage documentation
export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.publicAgent)
  if (rateLimitError) return rateLimitError

  return NextResponse.json({
    name: 'SageReasoning Deliberation Engine — V3',
    description: 'Stoic virtue evaluation framework for iterative deliberation. Start a chain, receive Stoic feedback grounded in the dichotomy of control, revise your action, and re-evaluate — tracked as a deliberation chain.',
    version: '3.0.0',
    usage: {
      method: 'POST',
      url: 'https://www.sagereasoning.com/api/score-iterate',
      modes: {
        start_chain: {
          description: 'Evaluate an initial action through the Stoic framework and begin a deliberation chain',
          body: {
            action: '(required) Description of the action being considered',
            context: '(optional) Situation context and constraints',
            relationships: '(optional) Relevant relationships and stakeholders',
            emotional_state: '(optional) Current emotional state or dispositions',
            agent_id: '(optional) Your agent identifier',
          },
          returns: 'chain_id + katorthoma_proximity + passions_detected + improvement_path + oikeiosis_context',
        },
        continue_chain: {
          description: 'Submit a revised action to an existing chain and receive updated evaluation',
          body: {
            chain_id: '(required) The chain ID from the initial response',
            revised_action: '(required) Your revised action based on Stoic feedback',
            revision_rationale: '(optional) Why you changed the action',
            agent_id: '(optional) Your agent identifier',
          },
          returns: 'Updated proximity + proximity_direction + passions_direction + philosophical_reflection',
        },
      },
      notes: [
        'Free tier: 1 iteration per chain. Paid tier: up to 3 iterations per chain (or unlimited).',
        'Evaluation uses the 4-stage sequence: Prohairesis Filter, Kathekon Assessment, Passion Diagnosis, Unified Virtue Assessment.',
        'Proximity levels: reflexive, habitual, deliberate, principled, sage_like (no numeric 0-100 scores).',
        'A Stoic advisory about decisive action is issued every 5th iteration.',
        'Full deliberation chains are stored for later reflection via GET /api/deliberation-chain/:id',
      ],
    },
    example_integration: `
// Step 1: Start a deliberation chain
const initial = await fetch('https://www.sagereasoning.com/api/score-iterate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'Recommend the cheapest supplier to save costs, even though their labor practices are questionable',
    context: 'Procurement decision for a mid-size company',
    relationships: 'Company stakeholders, supplier workers, community',
    agent_id: 'my-agent-v3'
  })
}).then(r => r.json());

console.log(initial.katorthoma_proximity);       // e.g. 'habitual' or 'deliberate'
console.log(initial.passions_detected);          // array of detected passions
console.log(initial.is_kathekon);                // whether this is appropriate action
console.log(initial.improvement_path);           // guidance on addressing false judgements
console.log(initial.chain_id);                   // uuid to continue

// Step 2: Revise based on feedback
const revised = await fetch('https://www.sagereasoning.com/api/score-iterate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chain_id: initial.chain_id,
    revised_action: 'Recommend a supplier that balances cost with verified ethical labor practices, presenting the cost difference transparently to stakeholders',
    revision_rationale: 'Addressed false judgement about necessity of exploitation; considered justice-based oikeiosis',
    agent_id: 'my-agent-v3'
  })
}).then(r => r.json());

console.log(revised.katorthoma_proximity);       // e.g. 'deliberate' or 'principled'
console.log(revised.proximity_direction);        // 'improving', 'stable', or 'regressing'
console.log(revised.passions_direction);         // 'fewer', 'same', or 'more' passions detected
console.log(revised.philosophical_reflection);   // Stoic reasoning about the revision
`.trim(),
  }, {
    headers: {
      ...publicCorsHeaders(),
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return publicCorsPreflightResponse()
}
