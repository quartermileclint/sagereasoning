/**
 * /api/support/agent/proof — Support-agent flow proof (PR1, second flow)
 *
 * PURPOSE: Prove the Ring Wrapper works for a non-Stoic inner agent — the
 * support drafter. This is the second flow proof; the first was
 * /api/mentor/ring/proof on 25 Apr 2026.
 *
 * Same shape as the mentor-ring proof:
 *   - Founder-only (FOUNDER_USER_ID gate)
 *   - Reuses the PROOF_PROFILE fixture (the support drafter is profile-agnostic;
 *     the ring still wraps it the same way)
 *   - Synthesises an InboxItem from a JSON body — does NOT read or write
 *     any inbox files on disk
 *   - Distress safety surface uses the WEBSITE's existing enforceDistressCheck
 *     (AC4 invocation pattern); the sage-mentor SupportSafetyGate (Channel 1
 *     Critical surface with Supabase prior-flag reads) is DEFERRED
 *   - No KB lookup (passes empty array — buildDraftPrompt handles this)
 *   - No history synthesis (Channel 2 — DEFERRED)
 *   - No filesystem writes
 *   - Returns the full ring trace in JSON for verification
 *
 * Risk: Elevated (per project instructions §0d-ii).
 * Approved: Founder, 25 Apr 2026.
 *
 * Rules served:
 *   R20a (distress classifier invoked via SafetyGate, AC4 invocation pattern)
 *   R3 (disclaimer included in support-agent prompt and final assembly)
 *   PR1 (second flow proven on a single endpoint before further rollout)
 *   PR2 (verified in same session)
 *   KG3 (no mentor_interactions write — out of scope for this proof)
 *
 * Rollback: delete this file and the bridge additions. No DB changes.
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
import type {
  BeforeResult,
  AfterResult,
  InboxItem,
} from '@/lib/sage-mentor-ring-bridge'
import { PROOF_PROFILE } from '@/lib/mentor-ring-fixtures'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Allowed values for body validation
const ALLOWED_CHANNELS = ['email', 'chat', 'api', 'social', 'form'] as const
const ALLOWED_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const

type AllowedChannel = typeof ALLOWED_CHANNELS[number]
type AllowedPriority = typeof ALLOWED_PRIORITIES[number]

// =============================================================================
// CORS
// =============================================================================

export async function OPTIONS() {
  return corsPreflightResponse()
}

// =============================================================================
// Helpers
// =============================================================================

function buildInboxItem(input: {
  subject: string
  customer: string
  channel: AllowedChannel
  message: string
  priority: AllowedPriority
}): InboxItem {
  const now = new Date().toISOString()
  return {
    frontmatter: {
      id: `proof-${Date.now()}`,
      status: 'open',
      channel: input.channel,
      customer: input.customer,
      subject: input.subject,
      received: now,
      priority: input.priority,
      governance_flags: [],
      synced_at: null,
    },
    customer_message: input.message,
    draft_response: null,
    ring_review: null,
    founder_decision: null,
    raw_content: '', // Not used by the proof
    file_path: '(synthetic — proof endpoint)',
  } as InboxItem
}

// =============================================================================
// POST — Run a support inquiry through the Ring Wrapper
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

    const subject: unknown = body?.subject
    const customer: unknown = body?.customer
    const message: unknown = body?.message
    const channel: unknown = body?.channel ?? 'email'
    const priority: unknown = body?.priority ?? 'normal'

    if (typeof subject !== 'string' || subject.trim().length < 3) {
      return NextResponse.json(
        { error: 'subject is required (string, min 3 characters)' },
        { status: 400, headers: corsHeaders() },
      )
    }
    if (typeof customer !== 'string' || customer.trim().length < 2) {
      return NextResponse.json(
        { error: 'customer is required (string, min 2 characters)' },
        { status: 400, headers: corsHeaders() },
      )
    }
    if (typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json(
        { error: 'message is required (string, min 5 characters)' },
        { status: 400, headers: corsHeaders() },
      )
    }
    if (typeof channel !== 'string' || !ALLOWED_CHANNELS.includes(channel as AllowedChannel)) {
      return NextResponse.json(
        { error: `channel must be one of: ${ALLOWED_CHANNELS.join(', ')}` },
        { status: 400, headers: corsHeaders() },
      )
    }
    if (typeof priority !== 'string' || !ALLOWED_PRIORITIES.includes(priority as AllowedPriority)) {
      return NextResponse.json(
        { error: `priority must be one of: ${ALLOWED_PRIORITIES.join(', ')}` },
        { status: 400, headers: corsHeaders() },
      )
    }

    const subjectErr = validateTextLength(subject, 'subject', TEXT_LIMITS.short)
    if (subjectErr) return NextResponse.json({ error: subjectErr }, { status: 400, headers: corsHeaders() })
    const messageErr = validateTextLength(message, 'message', TEXT_LIMITS.medium)
    if (messageErr) return NextResponse.json({ error: messageErr }, { status: 400, headers: corsHeaders() })

    // R20a — distress check on the combined inquiry text (AC4 invocation pattern)
    const combinedInput = `${subject}\n\n${message}`
    const gate = await enforceDistressCheck(detectDistressTwoStage(combinedInput))
    if (gate.shouldRedirect) {
      await supabaseAdmin
        .from('analytics_events')
        .insert({
          event_type: 'distress_detected',
          user_id: auth.user.id,
          metadata: {
            severity: gate.result.severity,
            indicators: gate.result.indicators_found,
            mentor_mode: 'support-proof',
            endpoint: '/api/support/agent/proof',
          },
        })

      return NextResponse.json(
        {
          distress_detected: true,
          severity: gate.result.severity,
          redirect_message: gate.result.redirect_message,
          notes: [
            'Support proof short-circuited — distress detected.',
            'In production, sage-mentor buildCrisisRedirectDraft would compose the inbox file. That path is deferred for this proof.',
          ],
        },
        { status: 200, headers: corsHeaders() },
      )
    }

    // Load ring functions through the bridge
    const ring = await loadRingFunctions()
    if (!ring) {
      return NextResponse.json(
        { error: 'Ring Wrapper module unavailable in build context.' },
        { status: 500, headers: corsHeaders() },
      )
    }

    // Build the synthetic InboxItem
    const inboxItem = buildInboxItem({
      subject,
      customer,
      channel: channel as AllowedChannel,
      message,
      priority: priority as AllowedPriority,
    })

    // Get-or-register the support agent (uses sage-mentor's canonical id/name/type)
    let supportAgent = ring.getInnerAgent(ring.SUPPORT_AGENT_ID)
    if (!supportAgent) {
      supportAgent = ring.registerInnerAgent(
        ring.SUPPORT_AGENT_ID,
        ring.SUPPORT_AGENT_NAME,
        ring.SUPPORT_AGENT_TYPE,
      )
    }

    const task = {
      task_id: `support-proof-${Date.now()}`,
      inner_agent_id: ring.SUPPORT_AGENT_ID,
      task_description: `Draft a customer response. Subject: ${subject}. Channel: ${channel}. Message: ${message}`,
      timestamp: new Date().toISOString(),
    }

    const session = ring.startRingSession(task, supportAgent)

    // ─── BEFORE PHASE ─────────────────────────────────────────────────────
    const before = ring.executeBefore(PROOF_PROFILE, task, supportAgent)
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
        console.error('[support/agent/proof] BEFORE LLM JSON parse error:', parseErr)
      }
    }

    // ─── INNER AGENT — Support drafter ─────────────────────────────────────
    // Uses sage-mentor's buildDraftPrompt to produce a customer-ready draft.
    // No KB articles, no history (proof scope).
    const draftPrompt = ring.buildDraftPrompt(inboxItem, [], undefined)

    const draftMessage = await client.messages.create({
      model: ring.MODEL_IDS.deep, // Sonnet for drafting (KG2: complex output)
      max_tokens: 600,
      temperature: 0.4,
      messages: [{ role: 'user', content: draftPrompt }],
    })

    ring.addSessionTokenUsage(
      session,
      draftMessage.usage.input_tokens,
      draftMessage.usage.output_tokens,
      'deep',
      'before', // No 'inner' phase exists in the type — log under 'before' adjacency
    )

    const draftText =
      draftMessage.content[0]?.type === 'text' ? draftMessage.content[0].text : ''

    // ─── AFTER PHASE ─────────────────────────────────────────────────────
    const after = ring.executeAfter(
      PROOF_PROFILE,
      task,
      draftText,
      supportAgent,
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
        console.error('[support/agent/proof] AFTER LLM JSON parse error:', parseErr)
      }
    }

    const result = ring.completeRingSession(session, beforeResult, draftText, afterResult)
    const totalDurationMs = Date.now() - startTime

    return NextResponse.json(
      {
        ok: true,
        proof_endpoint: '/api/support/agent/proof',
        flow: 'support-agent',
        inquiry: {
          subject,
          customer,
          channel,
          priority,
          message,
        },
        inbox_item_synthesised: {
          id: inboxItem.frontmatter.id,
          status: inboxItem.frontmatter.status,
        },
        inner_agent: {
          id: supportAgent.id,
          name: supportAgent.name,
          authority_level: supportAgent.authority_level,
          actions_completed: supportAgent.actions_completed,
        },
        before: {
          result: beforeResult,
          needsLlmCheck: before.needsLlmCheck,
          modelTier: before.modelTier,
          raw_llm_json: beforeRawLlmJson,
        },
        draft: draftText,
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
          'PR1 second-flow proof of the Ring Wrapper (support-agent inner).',
          'Profile source: hand-constructed PROOF_PROFILE fixture.',
          'Distress check via website enforceDistressCheck (AC4 invocation).',
          'Sage-mentor SupportSafetyGate (Channel 1 Critical surface) is DEFERRED.',
          'Channel 2 history synthesis is DEFERRED — passed undefined.',
          'KB article lookup is DEFERRED — passed empty array.',
          'No filesystem writes. No DB writes (other than analytics_events on distress).',
        ],
      },
      { status: 200, headers: corsHeaders() },
    )
  } catch (err) {
    console.error('[support/agent/proof] Unhandled error:', err)
    return NextResponse.json(
      {
        error: 'Support agent proof endpoint failed.',
        message: err instanceof Error ? err.message : 'unknown error',
      },
      { status: 500, headers: corsHeaders() },
    )
  }
}
