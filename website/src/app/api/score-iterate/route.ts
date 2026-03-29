import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimit, RATE_LIMITS, validateApiKey, withUsageHeaders, validateTextLength, TEXT_LIMITS, publicCorsHeaders, publicCorsPreflightResponse } from '@/lib/security'
import { buildIterationPrompt, getIterationWarning } from '@/lib/deliberation'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// The standard system prompt for initial scoring (step 1 of a new chain)
const INITIAL_SYSTEM_PROMPT = `You are the Stoic Sage scoring engine for sagereasoning.com. Your role is to evaluate actions against the four cardinal Stoic virtues and return a structured JSON score.

The four virtues and their weights:
- Wisdom (Phronesis) — weight 30%: Sound judgement, knowledge of what is truly good/bad/indifferent, deliberate reasoning before acting.
- Justice (Dikaiosyne) — weight 25%: Fairness, honesty, proper treatment of others, serving the common good.
- Courage (Andreia) — weight 25%: Acting rightly despite fear, difficulty, or social pressure; endurance; not shrinking from what is right.
- Temperance (Sophrosyne) — weight 20%: Self-control, moderation, ordering desires by reason not impulse, consistency.

Scoring scale (0–100 per virtue):
- 90–100: Near-perfect expression of this virtue
- 70–89: Strong, consistent expression
- 40–69: Partial expression — some virtue present, some conflict
- 15–39: Mostly driven by impulse, passion or external concern over virtue
- 0–14: Acting contrary to this virtue

Alignment tiers (based on weighted total):
- sage (95–100): Perfect alignment
- progressing (70–94): Consistently virtuous with minor gaps
- aware (40–69): Some virtue, some conflict
- misaligned (15–39): Actions driven more by impulse than reason
- contrary (0–14): Acting against virtue

You must return ONLY valid JSON — no markdown, no explanation outside the JSON. Use this exact structure:
{
  "wisdom_score": <0-100 integer>,
  "justice_score": <0-100 integer>,
  "courage_score": <0-100 integer>,
  "temperance_score": <0-100 integer>,
  "total_score": <weighted total, 0-100 integer>,
  "sage_alignment": "<sage|progressing|aware|misaligned|contrary>",
  "reasoning": "<2-3 sentences: what stoic virtues are expressed, which are absent, and why>",
  "improvement_path": "<1-2 sentences: concrete stoic guidance on how to bring the weakest virtue more fully into this type of action>",
  "strength": "<single virtue name e.g. Wisdom>",
  "growth_area": "<single virtue name e.g. Temperance>",
  "growth_action": "<1-3 sentences: a specific alternative action a sage might consider in the same situation>",
  "growth_action_projected_score": <integer 0-100>
}`

/**
 * POST /api/score-iterate
 *
 * Two modes:
 * 1. START A NEW CHAIN: Send { action, context?, intended_outcome?, agent_id? }
 *    → Creates chain, scores initial action, returns chain_id + score + feedback
 *
 * 2. CONTINUE A CHAIN: Send { chain_id, revised_action, revision_rationale?, agent_id? }
 *    → Scores revised action with deliberation context, appends step to chain
 */
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.publicAgent)
  if (rateLimitError) return rateLimitError

  const keyCheck = await validateApiKey(request, 'score_iterate')
  if (!keyCheck.valid) return keyCheck.error

  try {
    const body = await request.json()
    const { chain_id, action, revised_action, revision_rationale, context, intended_outcome, agent_id } = body

    // ── MODE 1: Start a new deliberation chain ──────────────────────
    if (!chain_id) {
      if (!action || typeof action !== 'string' || action.trim().length === 0) {
        return NextResponse.json({ error: 'action is required to start a new deliberation chain' }, { status: 400 })
      }

      const actionErr = validateTextLength(action, 'action', TEXT_LIMITS.medium)
      if (actionErr) return NextResponse.json({ error: actionErr }, { status: 400 })
      const contextErr = validateTextLength(context, 'context', TEXT_LIMITS.medium)
      if (contextErr) return NextResponse.json({ error: contextErr }, { status: 400 })

      // Score the initial action
      const userMessage = `Please score the following action against the four Stoic virtues.

Action: ${action.trim()}
${context?.trim() ? `Context: ${context.trim()}` : ''}
${intended_outcome?.trim() ? `Intended outcome: ${intended_outcome.trim()}` : ''}

Return only the JSON score object.`

      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        temperature: 0.2,
        system: [{ type: 'text', text: INITIAL_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: userMessage }],
      })

      const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
      let scoreData
      try {
        const cleaned = responseText.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim()
        scoreData = JSON.parse(cleaned)
      } catch {
        console.error('Failed to parse Claude response:', responseText)
        return NextResponse.json({ error: 'Scoring engine returned invalid response' }, { status: 500 })
      }

      // Validate required fields
      const required = ['wisdom_score', 'justice_score', 'courage_score', 'temperance_score', 'total_score', 'sage_alignment', 'reasoning', 'improvement_path', 'strength', 'growth_area', 'growth_action', 'growth_action_projected_score']
      for (const field of required) {
        if (scoreData[field] === undefined) {
          return NextResponse.json({ error: `Missing field: ${field}` }, { status: 500 })
        }
      }

      // Create the deliberation chain
      const { data: chain, error: chainErr } = await supabaseAdmin
        .from('deliberation_chains')
        .insert({
          agent_id: agent_id || null,
          original_action: action.trim(),
          context: context?.trim() || null,
          intended_outcome: intended_outcome?.trim() || null,
          initial_score: scoreData.total_score,
          current_score: scoreData.total_score,
          best_score: scoreData.total_score,
          iteration_count: 1,
          status: 'active',
          sage_growth_action: scoreData.growth_action,
          sage_projected_score: scoreData.growth_action_projected_score,
        })
        .select('id')
        .single()

      if (chainErr || !chain) {
        console.error('Failed to create deliberation chain:', chainErr)
        return NextResponse.json({ error: 'Failed to create deliberation chain' }, { status: 500 })
      }

      // Record step 1
      await supabaseAdmin
        .from('deliberation_steps')
        .insert({
          chain_id: chain.id,
          step_number: 1,
          action_description: action.trim(),
          wisdom_score: scoreData.wisdom_score,
          justice_score: scoreData.justice_score,
          courage_score: scoreData.courage_score,
          temperance_score: scoreData.temperance_score,
          total_score: scoreData.total_score,
          sage_alignment: scoreData.sage_alignment,
          reasoning: scoreData.reasoning,
          improvement_path: scoreData.improvement_path,
          strength: scoreData.strength,
          growth_area: scoreData.growth_area,
          growth_action: scoreData.growth_action,
          growth_action_projected_score: scoreData.growth_action_projected_score,
          score_delta: null,
          iteration_warning_issued: false,
        })

      // Analytics
      await supabaseAdmin
        .from('analytics_events')
        .insert({
          event_type: 'deliberation_chain_started',
          metadata: {
            chain_id: chain.id,
            agent_id: agent_id || null,
            initial_score: scoreData.total_score,
            sage_alignment: scoreData.sage_alignment,
          },
        })
        .then(() => {})

      return NextResponse.json({
        chain_id: chain.id,
        step_number: 1,
        iteration_mode: 'initial',
        ...scoreData,
        deliberation_note: 'Chain started. The sage has provided feedback and a growth action. To iterate, call this endpoint again with chain_id and your revised_action.',
        next_step_hint: `POST /api/score-iterate with { "chain_id": "${chain.id}", "revised_action": "your revised action", "revision_rationale": "why you changed it" }`,
        ai_generated: true,
        ai_model: 'claude-sonnet-4-6',
        disclaimer: 'This score is AI-generated using Stoic virtue criteria. It is for personal reflection only and does not constitute professional advice.',
      }, { headers: withUsageHeaders({ ...publicCorsHeaders() }, keyCheck) })
    }

    // ── MODE 2: Continue an existing deliberation chain ─────────────
    if (!revised_action || typeof revised_action !== 'string' || revised_action.trim().length === 0) {
      return NextResponse.json({ error: 'revised_action is required when continuing a deliberation chain' }, { status: 400 })
    }

    const revisedErr = validateTextLength(revised_action, 'revised_action', TEXT_LIMITS.medium)
    if (revisedErr) return NextResponse.json({ error: revisedErr }, { status: 400 })
    const rationaleErr = validateTextLength(revision_rationale, 'revision_rationale', TEXT_LIMITS.medium)
    if (rationaleErr) return NextResponse.json({ error: rationaleErr }, { status: 400 })

    // Fetch the chain
    const { data: chain, error: chainErr } = await supabaseAdmin
      .from('deliberation_chains')
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
          initial_score: chain.initial_score,
          final_score: chain.current_score,
          best_score: chain.best_score,
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
        current_score: chain.current_score,
        best_score: chain.best_score,
        upgrade: keyCheck.tier === 'free' ? 'Contact zeus@sagereasoning.com to upgrade to a paid API key.' : undefined,
        conclude_hint: `To conclude this chain: POST to /api/deliberation-chain/${chain_id}/conclude`,
      }, { status: 403, headers: publicCorsHeaders() })
    }

    // Get the latest step for context
    const { data: lastStep, error: stepErr } = await supabaseAdmin
      .from('deliberation_steps')
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
    const iterationWarning = getIterationWarning(nextStepNumber)

    // Build iteration-aware prompt
    const iterationPrompt = buildIterationPrompt({
      action: lastStep.action_description,
      total_score: lastStep.total_score,
      reasoning: lastStep.reasoning,
      growth_action: lastStep.growth_action,
      growth_action_projected_score: lastStep.growth_action_projected_score,
      wisdom_score: lastStep.wisdom_score,
      justice_score: lastStep.justice_score,
      courage_score: lastStep.courage_score,
      temperance_score: lastStep.temperance_score,
    }, nextStepNumber)

    const userMessage = `The agent has revised their action (iteration ${nextStepNumber}).

Previous action: ${lastStep.action_description}
Revised action: ${revised_action.trim()}
${revision_rationale?.trim() ? `Revision rationale: ${revision_rationale.trim()}` : ''}
${chain.context?.trim() ? `Original context: ${chain.context.trim()}` : ''}

Score the revised action. Return only the JSON score object.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      temperature: 0.2,
      system: [{ type: 'text', text: iterationPrompt, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userMessage }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    let scoreData
    try {
      const cleaned = responseText.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim()
      scoreData = JSON.parse(cleaned)
    } catch {
      console.error('Failed to parse iteration response:', responseText)
      return NextResponse.json({ error: 'Scoring engine returned invalid response' }, { status: 500 })
    }

    // Validate
    const required = ['wisdom_score', 'justice_score', 'courage_score', 'temperance_score', 'total_score', 'sage_alignment', 'reasoning', 'improvement_path', 'strength', 'growth_area', 'growth_action', 'growth_action_projected_score']
    for (const field of required) {
      if (scoreData[field] === undefined) {
        return NextResponse.json({ error: `Missing field: ${field}` }, { status: 500 })
      }
    }

    const scoreDelta = Number((scoreData.total_score - lastStep.total_score).toFixed(2))

    // Record the step
    await supabaseAdmin
      .from('deliberation_steps')
      .insert({
        chain_id: chain_id,
        step_number: nextStepNumber,
        action_description: revised_action.trim(),
        revision_rationale: revision_rationale?.trim() || null,
        wisdom_score: scoreData.wisdom_score,
        justice_score: scoreData.justice_score,
        courage_score: scoreData.courage_score,
        temperance_score: scoreData.temperance_score,
        total_score: scoreData.total_score,
        sage_alignment: scoreData.sage_alignment,
        reasoning: scoreData.reasoning,
        improvement_path: scoreData.improvement_path,
        strength: scoreData.strength,
        growth_area: scoreData.growth_area,
        growth_action: scoreData.growth_action,
        growth_action_projected_score: scoreData.growth_action_projected_score,
        score_delta: scoreDelta,
        iteration_warning_issued: !!iterationWarning,
      })

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'deliberation_iteration',
        metadata: {
          chain_id: chain_id,
          agent_id: agent_id || chain.agent_id || null,
          step_number: nextStepNumber,
          previous_score: lastStep.total_score,
          new_score: scoreData.total_score,
          score_delta: scoreDelta,
          warning_issued: !!iterationWarning,
        },
      })
      .then(() => {})

    const response: Record<string, unknown> = {
      chain_id: chain_id,
      step_number: nextStepNumber,
      iteration_mode: 'revision',
      ...scoreData,
      score_delta: scoreDelta,
      previous_score: lastStep.total_score,
      best_score_in_chain: Math.max(chain.best_score || 0, scoreData.total_score),
      ai_generated: true,
      ai_model: 'claude-sonnet-4-6',
      disclaimer: 'This score is AI-generated using Stoic virtue criteria. It is for personal reflection only and does not constitute professional advice.',
    }

    // Add iteration warning if applicable
    if (iterationWarning) {
      response.iteration_warning = iterationWarning
    }

    // Add conclude hint
    response.next_step_hint = `To iterate further: POST with { "chain_id": "${chain_id}", "revised_action": "..." }. To conclude: POST to /api/deliberation-chain/${chain_id}/conclude`

    return NextResponse.json(response, { headers: withUsageHeaders({ ...publicCorsHeaders() }, keyCheck) })
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
    name: 'SageReasoning Deliberation Engine',
    description: 'Iterative virtue-scoring for AI agents. Start a chain, receive sage feedback, revise your action, and re-score — tracked as a deliberation chain.',
    usage: {
      method: 'POST',
      url: 'https://www.sagereasoning.com/api/score-iterate',
      modes: {
        start_chain: {
          description: 'Score an initial action and begin a deliberation chain',
          body: {
            action: '(required) Description of the action',
            context: '(optional) Situation context',
            intended_outcome: '(optional) What you hope to achieve',
            agent_id: '(optional) Your agent identifier',
          },
          returns: 'chain_id + full score + sage feedback + growth_action',
        },
        continue_chain: {
          description: 'Submit a revised action to an existing chain',
          body: {
            chain_id: '(required) The chain ID from the initial response',
            revised_action: '(required) Your revised action based on sage feedback',
            revision_rationale: '(optional) Why you changed the action',
            agent_id: '(optional) Your agent identifier',
          },
          returns: 'Updated score + score_delta + deliberation_note + further sage feedback',
        },
      },
      notes: [
        'Free tier: 1 iteration per chain (see your score and sage feedback). Paid tier: up to 3 iterations per chain.',
        'The sage scores each revision honestly — scores can go down if the revision drifts from virtue.',
        'A Stoic advisory is issued every 5th iteration (paid tier) encouraging decisive action.',
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
    agent_id: 'my-agent-v1'
  })
}).then(r => r.json());

console.log(initial.total_score);       // e.g. 35
console.log(initial.growth_action);     // sage's suggested alternative
console.log(initial.chain_id);          // uuid to continue

// Step 2: Revise based on feedback
const revised = await fetch('https://www.sagereasoning.com/api/score-iterate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chain_id: initial.chain_id,
    revised_action: 'Recommend a supplier that balances cost with verified ethical labor practices, presenting the cost difference transparently to stakeholders',
    revision_rationale: 'Addressed justice concerns while maintaining fiscal responsibility',
    agent_id: 'my-agent-v1'
  })
}).then(r => r.json());

console.log(revised.total_score);       // e.g. 78
console.log(revised.score_delta);       // e.g. +43
console.log(revised.deliberation_note); // sage acknowledges the improvement
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
