/**
 * /api/founder/hub — Founder Communication Hub
 *
 * Single endpoint for the founder to communicate with any of the 5 agents
 * (ops, tech, growth, support, mentor). The primary agent responds through
 * the sage-orchestrator pipeline. Observer agents do a lightweight relevance
 * check and contribute if they have domain-specific input.
 *
 * POST: Send a message to an agent
 *   Body: { agent, message, conversation_id? }
 *   Returns: primary response + observer contributions + conversation metadata
 *
 * GET: List conversations or load conversation history
 *   ?list=true — list all conversations
 *   ?conversation_id=<id> — load full conversation
 *
 * Access: Founder only (FOUNDER_USER_ID env var)
 */

import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { runSageReason } from '@/lib/sage-reason-engine'
import { getOpsBrainContext } from '@/lib/context/ops-brain-loader'
import { getTechBrainContext } from '@/lib/context/tech-brain-loader'
import { getGrowthBrainContext } from '@/lib/context/growth-brain-loader'
import { getSupportBrainContext } from '@/lib/context/support-brain-loader'
import { getStoicBrainContextForMechanisms } from '@/lib/context/stoic-brain-loader'
import { getProjectContext } from '@/lib/context/project-context'
import { getMentorKnowledgeBase } from '@/lib/context/mentor-knowledge-base-loader'
import { getFullPractitionerContext } from '@/lib/context/practitioner-context'

// =============================================================================
// Types
// =============================================================================

type AgentType = 'ops' | 'tech' | 'growth' | 'support' | 'mentor'

const VALID_AGENTS: AgentType[] = ['ops', 'tech', 'growth', 'support', 'mentor']

interface AgentResponse {
  agent: AgentType
  role: 'primary' | 'observer'
  content: string
  relevance_score?: number
  pipeline_meta?: Record<string, unknown>
  decision_gate?: Record<string, unknown>
}

// =============================================================================
// Agent Brain Loaders
// =============================================================================

function getAgentBrainContext(agent: AgentType, depth: 'quick' | 'standard' | 'deep' = 'standard'): string {
  switch (agent) {
    case 'ops': return getOpsBrainContext(depth)
    case 'tech': return getTechBrainContext(depth)
    case 'growth': return getGrowthBrainContext(depth)
    case 'support': return getSupportBrainContext(depth)
    case 'mentor': return '' // Mentor uses Stoic Brain + L5, not an agent brain
  }
}

function getAgentDescription(agent: AgentType): string {
  switch (agent) {
    case 'ops': return 'Sage-Ops: Process, financial, compliance, product, people, analytics expertise'
    case 'tech': return 'Sage-Tech: Architecture, security, devops, AI/ML, code quality, tooling expertise'
    case 'growth': return 'Sage-Growth: Positioning, audience, content, developer relations, community, metrics expertise'
    case 'support': return 'Sage-Support: Triage, vulnerable users, philosophical sensitivity, escalation, knowledge base expertise'
    case 'mentor': return 'Sage-Mentor: Stoic philosophical guidance, practitioner development, virtue progression'
  }
}

// =============================================================================
// Anthropic Client
// =============================================================================

let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

// =============================================================================
// Primary Agent Response
// =============================================================================

async function getPrimaryAgentResponse(
  agent: AgentType,
  message: string,
  conversationHistory: Array<{ role: string; agent_type: string | null; content: string }>,
  userId: string,
): Promise<AgentResponse> {
  const client = getClient()
  const startTime = Date.now()

  // Build system context based on agent type
  let systemBlocks: Array<{ type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }> = []

  if (agent === 'mentor') {
    // Mentor gets: Stoic Brain (deep) + Mentor KB + Project Context
    const stoicContext = getStoicBrainContextForMechanisms([
      'passion_diagnosis', 'oikeiosis', 'value_theory', 'virtue_framework', 'action_theory', 'progress_scale'
    ])
    const mentorKB = getMentorKnowledgeBase()
    systemBlocks = [
      { type: 'text', text: `You are the Sage Mentor — the founder's personal Stoic advisor. You have deep knowledge of the founder's practitioner profile, development trajectory, and the SageReasoning project. Your role is to help the founder reason well, identify passions and false judgements, and progress toward virtue.\n\nRespond naturally in conversation. Be warm but honest. When the founder's reasoning shows a passion or false judgement, name it specifically. When they reason well, affirm it.\n\n${mentorKB}`, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: stoicContext },
    ]
  } else {
    // Agent brain gets: its domain expertise + Stoic Brain (standard) + Project Context
    const brainContext = getAgentBrainContext(agent, 'deep')
    const stoicContext = getStoicBrainContextForMechanisms(['value_theory', 'action_theory'])
    systemBlocks = [
      { type: 'text', text: `You are ${getAgentDescription(agent)}. You are one of four internal Sage agents serving the SageReasoning founder. Your domain expertise is loaded below.\n\nRespond naturally in conversation. Apply your domain expertise to the founder's questions and tasks. When a task touches ethical, virtue, or principled reasoning concerns, flag them — but your primary value is your domain knowledge.\n\nBe direct, specific, and practical. The founder is a non-technical solo founder building a startup. Explain technical concepts in plain language.\n\n${brainContext}`, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: stoicContext },
    ]
  }

  // Build conversation messages
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = []

  // Add conversation history (last 20 messages for context window management)
  const recentHistory = conversationHistory.slice(-20)
  for (const msg of recentHistory) {
    if (msg.role === 'founder') {
      messages.push({ role: 'user', content: msg.content })
    } else if (msg.role === 'agent' && msg.agent_type === agent) {
      messages.push({ role: 'assistant', content: msg.content })
    } else if (msg.role === 'observer') {
      // Include observer contributions as user-side context
      messages.push({ role: 'user', content: `[Observer — ${msg.agent_type}]: ${msg.content}` })
    }
  }

  // Add project context and practitioner context to the current message
  const projectContext = await getProjectContext('summary')
  const practitionerContext = await getFullPractitionerContext(userId)

  let enrichedMessage = message
  if (practitionerContext) {
    enrichedMessage += `\n\n${practitionerContext}`
  }
  enrichedMessage += `\n\n${projectContext}`

  messages.push({ role: 'user', content: enrichedMessage })

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    temperature: 0.4,
    system: systemBlocks,
    messages,
  })

  const content = response.content[0].type === 'text' ? response.content[0].text : ''
  const durationMs = Date.now() - startTime

  return {
    agent,
    role: 'primary',
    content,
    pipeline_meta: {
      model: 'claude-sonnet-4-6',
      inputTokens: response.usage?.input_tokens || 0,
      outputTokens: response.usage?.output_tokens || 0,
      durationMs,
      brainDepth: agent === 'mentor' ? 'deep' : 'deep',
    },
  }
}

// =============================================================================
// Observer Agent Check
// =============================================================================

async function getObserverContribution(
  observer: AgentType,
  primaryAgent: AgentType,
  founderMessage: string,
  primaryResponse: string,
): Promise<AgentResponse | null> {
  const client = getClient()

  const brainContext = observer === 'mentor'
    ? getStoicBrainContextForMechanisms(['passion_diagnosis', 'value_theory'])
    : getAgentBrainContext(observer, 'quick')

  const observerDesc = getAgentDescription(observer)

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    temperature: 0.3,
    system: [
      {
        type: 'text',
        text: `You are ${observerDesc}, observing a conversation between the SageReasoning founder and the ${primaryAgent} agent.\n\nYour job: determine if your domain expertise adds something the primary agent missed or got wrong. If you have a relevant observation, share it briefly (2-3 sentences max). If the primary agent covered everything well, respond with exactly: NO_CONTRIBUTION\n\nDo NOT repeat what the primary agent said. Only contribute if you have unique domain insight.\n\n${brainContext}`,
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Founder asked ${primaryAgent}: "${founderMessage}"\n\n${primaryAgent} responded: "${primaryResponse.substring(0, 1500)}"\n\nDo you have a relevant observation from your domain (${observer})?`,
      },
    ],
  })

  const content = response.content[0].type === 'text' ? response.content[0].text : ''

  if (content.trim() === 'NO_CONTRIBUTION' || content.trim().length < 10) {
    return null
  }

  return {
    agent: observer,
    role: 'observer',
    content: content.trim(),
    relevance_score: 0.7, // Haiku doesn't self-score; default moderate relevance
    pipeline_meta: {
      model: 'claude-haiku-4-5-20251001',
      inputTokens: response.usage?.input_tokens || 0,
      outputTokens: response.usage?.output_tokens || 0,
    },
  }
}

// =============================================================================
// POST — Send message to agent
// =============================================================================

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  // Founder-only gate
  const founderId = process.env.FOUNDER_USER_ID
  if (!founderId || auth.user.id !== founderId) {
    return NextResponse.json(
      { error: 'This endpoint is restricted to the founder.' },
      { status: 403 }
    )
  }

  try {
    const { agent, message, conversation_id } = await request.json()

    // Validate agent
    if (!agent || !VALID_AGENTS.includes(agent)) {
      return NextResponse.json(
        { error: `Invalid agent. Must be one of: ${VALID_AGENTS.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length < 2) {
      return NextResponse.json(
        { error: 'Message is required (min 2 characters).' },
        { status: 400 }
      )
    }

    // Get or create conversation
    let convId = conversation_id
    if (!convId) {
      // Create new conversation
      const { data: conv, error: convErr } = await supabaseAdmin
        .from('founder_conversations')
        .insert({
          primary_agent: agent,
          title: message.trim().substring(0, 100),
        })
        .select('id')
        .single()

      if (convErr || !conv) {
        console.error('Failed to create conversation:', convErr)
        return NextResponse.json(
          { error: 'Failed to create conversation.' },
          { status: 500 }
        )
      }
      convId = conv.id
    }

    // Load conversation history
    const { data: history } = await supabaseAdmin
      .from('founder_conversation_messages')
      .select('role, agent_type, content')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })

    const conversationHistory = history || []

    // Save founder's message
    await supabaseAdmin.from('founder_conversation_messages').insert({
      conversation_id: convId,
      role: 'founder',
      agent_type: null,
      content: message.trim(),
    })

    // Get primary agent response
    const primaryResponse = await getPrimaryAgentResponse(
      agent as AgentType,
      message.trim(),
      conversationHistory,
      auth.user.id,
    )

    // Save primary agent response
    await supabaseAdmin.from('founder_conversation_messages').insert({
      conversation_id: convId,
      role: 'agent',
      agent_type: agent,
      content: primaryResponse.content,
      pipeline_meta: primaryResponse.pipeline_meta,
      decision_gate: primaryResponse.decision_gate || null,
    })

    // Get observer contributions (all other agents check in parallel)
    const otherAgents = VALID_AGENTS.filter(a => a !== agent)
    const observerPromises = otherAgents.map(observer =>
      getObserverContribution(
        observer,
        agent as AgentType,
        message.trim(),
        primaryResponse.content,
      ).catch(err => {
        console.error(`Observer ${observer} failed (non-blocking):`, err)
        return null
      })
    )
    const observerResults = await Promise.all(observerPromises)
    const contributions = observerResults.filter((r): r is AgentResponse => r !== null)

    // Save observer contributions
    for (const obs of contributions) {
      await supabaseAdmin.from('founder_conversation_messages').insert({
        conversation_id: convId,
        role: 'observer',
        agent_type: obs.agent,
        content: obs.content,
        relevance_score: obs.relevance_score,
        pipeline_meta: obs.pipeline_meta,
      })
    }

    // Update conversation timestamp
    await supabaseAdmin
      .from('founder_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', convId)

    return NextResponse.json({
      conversation_id: convId,
      primary: {
        agent: primaryResponse.agent,
        content: primaryResponse.content,
        pipeline_meta: primaryResponse.pipeline_meta,
        decision_gate: primaryResponse.decision_gate,
      },
      observers: contributions.map(obs => ({
        agent: obs.agent,
        content: obs.content,
        relevance_score: obs.relevance_score,
      })),
      message_count: conversationHistory.length + 2 + contributions.length,
    }, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Founder hub error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// =============================================================================
// GET — List conversations or load history
// =============================================================================

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  const founderId = process.env.FOUNDER_USER_ID
  if (!founderId || auth.user.id !== founderId) {
    return NextResponse.json(
      { error: 'This endpoint is restricted to the founder.' },
      { status: 403 }
    )
  }

  const { searchParams } = new URL(request.url)
  const list = searchParams.get('list')
  const conversationId = searchParams.get('conversation_id')

  try {
    if (list === 'true') {
      // List all conversations
      const { data, error } = await supabaseAdmin
        .from('founder_conversations')
        .select('id, primary_agent, title, status, created_at, updated_at')
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(50)

      if (error) throw error

      return NextResponse.json({ conversations: data || [] }, { headers: corsHeaders() })
    }

    if (conversationId) {
      // Load full conversation
      const { data: conv, error: convErr } = await supabaseAdmin
        .from('founder_conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

      if (convErr || !conv) {
        return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 })
      }

      const { data: messages, error: msgErr } = await supabaseAdmin
        .from('founder_conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (msgErr) throw msgErr

      return NextResponse.json({
        conversation: conv,
        messages: messages || [],
      }, { headers: corsHeaders() })
    }

    return NextResponse.json({ error: 'Provide ?list=true or ?conversation_id=<id>' }, { status: 400 })
  } catch (error) {
    console.error('Founder hub GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}
