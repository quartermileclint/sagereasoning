/**
 * /api/founder/hub/ring-proof — Founder-hub flow proof (PR1, third flow)
 *
 * PURPOSE: Prove the Ring Wrapper works for a persona-routed founder-hub
 * style flow. This is the third (and final) PR1 proof; the first two were
 * /api/mentor/ring/proof and /api/support/agent/proof on 25 Apr 2026.
 *
 * What this proves NEW (beyond the first two proofs):
 *   - The ring is persona-agnostic at the orchestration layer. The same
 *     ring functions wrap five different persona inner-agents (mentor,
 *     ops, tech, growth, support) without any per-persona ring code.
 *
 * What this DOES NOT do (deliberate scope cap — these are live-integration
 * scope, not proof scope):
 *   - It does NOT replace the inline BEFORE/AFTER in the live
 *     /api/founder/hub route. That refactor is a separate session.
 *   - It does NOT load the persona context channels (Ops C1/C2, Tech C1/C2,
 *     Growth C1/C2, Support C1/C2, Mentor context). The proof uses a small
 *     in-route prompt frame per persona instead.
 *   - It does NOT write to mentor_interactions. KG3 hub-label surface stays
 *     deferred.
 *
 * Same shape as the previous two proofs:
 *   - Founder-only (FOUNDER_USER_ID gate)
 *   - Reuses PROOF_PROFILE fixture
 *   - Distress check via website enforceDistressCheck (AC4 invocation)
 *   - Returns the full ring trace + persona response in JSON
 *
 * Risk: Elevated. Approved: Founder, 25 Apr 2026.
 *
 * Rules served:
 *   R20a (distress classifier invoked via SafetyGate, AC4 invocation)
 *   PR1 (third flow proven on a single endpoint before further rollout)
 *   PR2 (verified in same session)
 *   KG3 (no mentor_interactions write — live integration is separate)
 *
 * Rollback: delete this file. Purely additive. No DB changes.
 */

import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import {
  checkRateLimit,
  RATE_LIMITS,
  requireAuth,
  validateTextLength,
  TEXT_LIMITS,
  corsHeaders,
  corsPreflightResponse,
} from '@/lib/security'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import { enforceDistressCheck } from '@/lib/constraints'
import { extractJSON } from '@/lib/json-utils'
import { loadRingFunctions } from '@/lib/sage-mentor-ring-bridge'
import type { BeforeResult, AfterResult, InnerAgent } from '@/lib/sage-mentor-ring-bridge'
import { PROOF_PROFILE } from '@/lib/mentor-ring-fixtures'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// =============================================================================
// PERSONA REGISTRY — per-persona inner-agent identities and prompt frames
// =============================================================================

const ALLOWED_PERSONAS = ['mentor', 'ops', 'tech', 'growth', 'support'] as const
type AllowedPersona = typeof ALLOWED_PERSONAS[number]

interface PersonaConfig {
  inner_agent_id: string
  inner_agent_name: string
  inner_agent_type: InnerAgent['type']
  /** Lightweight system prompt — NOT the full live persona. Live persona
   * context loaders are deferred for live integration. */
  system_prompt: string
}

const PERSONAS: Record<AllowedPersona, PersonaConfig> = {
  mentor: {
    inner_agent_id: 'ring-proof-mentor',
    inner_agent_name: 'Founder Hub Mentor (proof)',
    inner_agent_type: 'assistant',
    system_prompt: `You are the founder's Stoic mentor inside the founder-hub. Respond to the founder's message in 3-5 sentences. Apply the prohairesis filter (what is in their control), then a brief virtue assessment. Do not preach. Do not promise outcomes. Reasoning, not advice.`,
  },
  ops: {
    inner_agent_id: 'ring-proof-ops',
    inner_agent_name: 'Founder Hub Ops (proof)',
    inner_agent_type: 'assistant',
    system_prompt: `You are the founder's Operations brain inside the founder-hub. Respond in 3-5 sentences with a practical operational read of the founder's message — what's running, what's blocked, what's the next concrete step. No platitudes.`,
  },
  tech: {
    inner_agent_id: 'ring-proof-tech',
    inner_agent_name: 'Founder Hub Tech (proof)',
    inner_agent_type: 'code',
    system_prompt: `You are the founder's Tech brain inside the founder-hub. Respond in 3-5 sentences with a technical read of the founder's message — what's in the system, what's the constraint, what's the next concrete step. Plain language, no jargon-as-drama.`,
  },
  growth: {
    inner_agent_id: 'ring-proof-growth',
    inner_agent_name: 'Founder Hub Growth (proof)',
    inner_agent_type: 'assistant',
    system_prompt: `You are the founder's Growth brain inside the founder-hub. Respond in 3-5 sentences with a growth/positioning read of the founder's message. Honest about what you don't know — do not invent market signals.`,
  },
  support: {
    inner_agent_id: 'ring-proof-support',
    inner_agent_name: 'Founder Hub Support (proof)',
    inner_agent_type: 'assistant',
    system_prompt: `You are the founder's Support brain inside the founder-hub. Respond in 3-5 sentences with a customer-support read of the founder's message — what would a customer think, what would they ask, what would help.`,
  },
}

// =============================================================================
// CORS
// =============================================================================

export async function OPTIONS() {
  return corsPreflightResponse()
}

// =============================================================================
// POST — Run a founder-hub message through the Ring Wrapper
// =============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  const rateLimitError = checkRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  // FOUNDER-ONLY GATE
  const founderId = process.env.FOUNDER_USER_ID
  if (!founderId || auth.user.id !== founderId) {
    return NextResponse.json(
      { error: 'This endpoint is restricted to the founder (proof endpoint).' },
      { status: 403, headers: corsHeaders() },
    )
  }

  try {
    const body = await request.json().catch(() => ({}))
    const personaInput: unknown = body?.persona
    const messageInput: unknown = body?.message

    if (typeof personaInput !== 'string' || !ALLOWED_PERSONAS.includes(personaInput as AllowedPersona)) {
      return NextResponse.json(
        { error: `persona must be one of: ${ALLOWED_PERSONAS.join(', ')}` },
        { status: 400, headers: corsHeaders() },
      )
    }
    if (typeof messageInput !== 'string' || messageInput.trim().length < 5) {
      return NextResponse.json(
        { error: 'message is required (string, min 5 characters)' },
        { status: 400, headers: corsHeaders() },
      )
    }

    const lengthErr = validateTextLength(messageInput, 'message', TEXT_LIMITS.medium)
    if (lengthErr) return NextResponse.json({ error: lengthErr }, { status: 400, headers: corsHeaders() })

    const persona: AllowedPersona = personaInput as AllowedPersona
    const message: string = messageInput
    const config = PERSONAS[persona]

    // R20a — distress check (AC4 invocation pattern)
    const gate = await enforceDistressCheck(detectDistressTwoStage(message))
    if (gate.shouldRedirect) {
      await supabaseAdmin
        .from('analytics_events')
        .insert({
          event_type: 'distress_detected',
          user_id: auth.user.id,
          metadata: {
            severity: gate.result.severity,
            indicators: gate.result.indicators_found,
            mentor_mode: 'founder-hub-ring-proof',
            endpoint: '/api/founder/hub/ring-proof',
            persona,
          },
        })

      return NextResponse.json(
        {
          distress_detected: true,
          severity: gate.result.severity,
          redirect_message: gate.result.redirect_message,
        },
        { status: 200, headers: corsHeaders() },
      )
    }

    const ring = await loadRingFunctions()
    if (!ring) {
      return NextResponse.json(
        { error: 'Ring Wrapper module unavailable in build context.' },
        { status: 500, headers: corsHeaders() },
      )
    }

    // Get-or-register the persona's inner agent
    let innerAgent = ring.getInnerAgent(config.inner_agent_id)
    if (!innerAgent) {
      innerAgent = ring.registerInnerAgent(
        config.inner_agent_id,
        config.inner_agent_name,
        config.inner_agent_type,
      )
    }

    const task = {
      task_id: `founder-hub-proof-${Date.now()}`,
      inner_agent_id: config.inner_agent_id,
      task_description: `Persona: ${persona}. Founder message: ${message}`,
      timestamp: new Date().toISOString(),
    }

    const session = ring.startRingSession(task, innerAgent)

    // ─── BEFORE PHASE ─────────────────────────────────────────────────────
    const before = ring.executeBefore(PROOF_PROFILE, task, innerAgent)
    let beforeResult: BeforeResult = before.result
    let beforeRawLlmJson: unknown = null

    if (before.needsLlmCheck && before.llmPrompt) {
      const beforeMessage = await client.messages.create({
        model: ring.MODEL_IDS[before.modelTier],
        max_tokens: 800,
        temperature: 0.2,
        messages: [{ role: 'user', content: before.llmPrompt }],
      })

      ring.addSessionTokenUsage(
        session,
        beforeMessage.usage.input_tokens,
        beforeMessage.usage.output_tokens,
        before.modelTier,
        'before',
      )

      const beforeText =
        beforeMessage.content[0]?.type === 'text' ? beforeMessage.content[0].text : ''
      try {
        const parsed = extractJSON(beforeText) as Record<string, unknown>
        beforeRawLlmJson = parsed
        beforeResult = {
          ...beforeResult,
          concerns:
            Array.isArray(parsed.concerns) && parsed.concerns.length > 0
              ? [...beforeResult.concerns, ...(parsed.concerns as string[])]
              : beforeResult.concerns,
          enrichment_suggestion:
            typeof parsed.enrichment_suggestion === 'string'
              ? parsed.enrichment_suggestion
              : beforeResult.enrichment_suggestion,
          mentor_note:
            typeof parsed.mentor_note === 'string'
              ? parsed.mentor_note
              : beforeResult.mentor_note,
          proceed:
            typeof parsed.proceed === 'boolean' ? parsed.proceed : beforeResult.proceed,
        }
      } catch (parseErr) {
        console.error('[founder/hub/ring-proof] BEFORE LLM JSON parse error:', parseErr)
      }
    }

    // ─── INNER AGENT — persona-flavoured response ─────────────────────────
    const personaMessage = await client.messages.create({
      model: ring.MODEL_IDS.deep, // Sonnet — KG2 conversational+depth
      max_tokens: 500,
      temperature: 0.4,
      system: config.system_prompt,
      messages: [{ role: 'user', content: message }],
    })

    ring.addSessionTokenUsage(
      session,
      personaMessage.usage.input_tokens,
      personaMessage.usage.output_tokens,
      'deep',
      'before',
    )

    const personaResponse =
      personaMessage.content[0]?.type === 'text' ? personaMessage.content[0].text : ''

    // ─── AFTER PHASE ─────────────────────────────────────────────────────
    const after = ring.executeAfter(
      PROOF_PROFILE,
      task,
      personaResponse,
      innerAgent,
      beforeResult.concerns.length > 0,
    )

    let afterRawLlmJson: unknown = null
    let afterResult: AfterResult = {
      reasoning_quality: PROOF_PROFILE.proximity_level,
      passions_detected: [],
      pattern_note: null,
      journal_reference: null,
      mentor_observation: null,
      record_to_profile: false,
      mechanisms_applied: ['control_filter', 'value_assessment'],
    }

    if (after.needsLlmCheck && after.llmPrompt) {
      const afterMessage = await client.messages.create({
        model: ring.MODEL_IDS[after.modelTier],
        max_tokens: 1000,
        temperature: 0.2,
        messages: [{ role: 'user', content: after.llmPrompt }],
      })

      ring.addSessionTokenUsage(
        session,
        afterMessage.usage.input_tokens,
        afterMessage.usage.output_tokens,
        after.modelTier,
        'after',
      )

      const afterText =
        afterMessage.content[0]?.type === 'text' ? afterMessage.content[0].text : ''
      try {
        const parsed = extractJSON(afterText) as Record<string, unknown>
        afterRawLlmJson = parsed
        afterResult = {
          reasoning_quality:
            (typeof parsed.reasoning_quality === 'string'
              ? parsed.reasoning_quality
              : afterResult.reasoning_quality) as AfterResult['reasoning_quality'],
          passions_detected: Array.isArray(parsed.passions_detected)
            ? (parsed.passions_detected as AfterResult['passions_detected'])
            : afterResult.passions_detected,
          pattern_note:
            typeof parsed.pattern_note === 'string' ? parsed.pattern_note : null,
          journal_reference: null,
          mentor_observation:
            typeof parsed.pattern_note === 'string' ? parsed.pattern_note : null,
          record_to_profile:
            typeof parsed.record_to_profile === 'boolean'
              ? parsed.record_to_profile
              : false,
          mechanisms_applied: ['control_filter', 'value_assessment'],
        }
      } catch (parseErr) {
        console.error('[founder/hub/ring-proof] AFTER LLM JSON parse error:', parseErr)
      }
    }

    const result = ring.completeRingSession(session, beforeResult, personaResponse, afterResult)
    const totalDurationMs = Date.now() - startTime

    return NextResponse.json(
      {
        ok: true,
        proof_endpoint: '/api/founder/hub/ring-proof',
        flow: 'founder-hub',
        persona,
        founder_message: message,
        inner_agent: {
          id: innerAgent.id,
          name: innerAgent.name,
          authority_level: innerAgent.authority_level,
          actions_completed: innerAgent.actions_completed,
        },
        before: {
          result: beforeResult,
          needsLlmCheck: before.needsLlmCheck,
          modelTier: before.modelTier,
          raw_llm_json: beforeRawLlmJson,
        },
        persona_response: personaResponse,
        after: {
          result: afterResult,
          needsLlmCheck: after.needsLlmCheck,
          modelTier: after.modelTier,
          side_effects: after.sideEffects,
          critical_category: after.criticalCategory,
          raw_llm_json: afterRawLlmJson,
        },
        token_summary: result.token_summary,
        total_duration_ms: totalDurationMs,
        notes: [
          'PR1 third-flow proof — founder-hub style, persona-agnostic.',
          'Persona context loaders (Ops C1/C2, Tech C1/C2, Growth C1/C2, Support C1/C2) are NOT loaded — live-integration scope.',
          'Lightweight in-route persona prompts used instead.',
          'No mentor_interactions write. KG3 hub-label surface deferred.',
          'Distress check via website enforceDistressCheck (AC4 invocation).',
          'Live /api/founder/hub route is UNCHANGED. The actual refactor of that route to use the ring is a separate-session piece of work.',
        ],
      },
      { status: 200, headers: corsHeaders() },
    )
  } catch (err) {
    console.error('[founder/hub/ring-proof] Unhandled error:', err)
    return NextResponse.json(
      {
        error: 'Founder-hub ring proof endpoint failed.',
        message: err instanceof Error ? err.message : 'unknown error',
      },
      { status: 500, headers: corsHeaders() },
    )
  }
}
