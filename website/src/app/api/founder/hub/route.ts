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
      'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment', 'control_filter', 'iterative_refinement'
    ])
    const mentorKB = getMentorKnowledgeBase()
    systemBlocks = [
      { type: 'text', text: `You are the Sage Mentor — the founder's personal Stoic advisor. You have deep knowledge of the founder's practitioner profile, development trajectory, and the SageReasoning project. Your role is to help the founder reason well, identify passions and false judgements, and progress toward virtue.\n\nRespond naturally in conversation. Be warm but honest. When the founder's reasoning shows a passion or false judgement, name it specifically. When they reason well, affirm it.\n\n${mentorKB}`, cache_control: { type: 'ephemeral' } },
      ...(stoicContext ? [{ type: 'text' as const, text: stoicContext }] : []),
    ]
  } else {
    // Agent brain gets: its domain expertise + Stoic Brain (standard) + Project Context
    const brainContext = getAgentBrainContext(agent, 'deep')
    const stoicContext = getStoicBrainContextForMechanisms(['passion_diagnosis', 'oikeiosis', 'value_assessment'])
    systemBlocks = [
      { type: 'text', text: `You are ${getAgentDescription(agent)}. You are one of four internal Sage agents serving the SageReasoning founder. Your domain expertise is loaded below.\n\nRespond naturally in conversation. Apply your domain expertise to the founder's questions and tasks. When a task touches ethical, virtue, or principled reasoning concerns, flag them — but your primary value is your domain knowledge.\n\nBe direct, specific, and practical. The founder is a non-technical solo founder building a startup. Explain technical concepts in plain language.\n\n${brainContext}`, cache_control: { type: 'ephemeral' } },
      ...(stoicContext ? [{ type: 'text' as const, text: stoicContext }] : []),
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
    ? getStoicBrainContextForMechanisms(['passion_diagnosis', 'oikeiosis'])
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
// Ops Recommended Action — Final pass after all responses
// =============================================================================

interface RecommendedAction {
  action_summary: string
  session_prompt: string
  risk_classification: 'standard' | 'elevated' | 'critical'
  risk_reasoning: string
}

async function getOpsRecommendedAction(
  founderMessage: string,
  primaryAgent: AgentType,
  primaryResponse: string,
  observerSummaries: string,
): Promise<RecommendedAction> {
  const client = getClient()
  const opsBrain = getAgentBrainContext('ops', 'quick')

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 768,
    temperature: 0.2,
    system: [
      {
        type: 'text',
        text: `You are Sage-Ops, producing a recommended next action for the SageReasoning founder after a hub conversation. You have process, financial, and compliance awareness.

Your job: synthesize the conversation into one actionable next step with a ready-to-use session prompt the founder can paste into a new Claude Cowork session.

The session prompt must:
- Give the new session enough context to start working immediately
- Reference specific files, endpoints, or decisions when relevant
- Include the risk classification so the new session knows what protocols to follow
- Be written as direct instructions to Claude, not as a summary

Risk classification (per 0d-ii):
- Standard: Additive changes, content updates, new features, cosmetic fixes
- Elevated: Changes to existing user-facing functionality, new dependencies, schema changes
- Critical: Auth, session management, access control, encryption, data deletion, deployment config

Return ONLY valid JSON:
{
  "action_summary": "<one sentence: what to do next>",
  "session_prompt": "<the full prompt the founder pastes into a new session — 3-8 sentences, specific and actionable>",
  "risk_classification": "<standard|elevated|critical>",
  "risk_reasoning": "<one sentence: why this risk level>"
}

${opsBrain}`,
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Conversation with ${primaryAgent}:

Founder asked: "${founderMessage}"

${primaryAgent} responded: "${primaryResponse.substring(0, 1200)}"

${observerSummaries ? `Observer contributions:\n${observerSummaries}` : 'No observer contributions.'}

What is the recommended next action?`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    // Robust JSON extraction (same pattern as reflect fix)
    let parsed: Record<string, any>
    try { parsed = JSON.parse(text.trim()) } catch {
      const match = text.match(/\{[\s\S]*\}/)
      if (match) { parsed = JSON.parse(match[0]) } else { throw new Error('No JSON found') }
    }

    return {
      action_summary: String(parsed.action_summary || 'Review the conversation and decide next steps.'),
      session_prompt: String(parsed.session_prompt || 'Continue from the founder hub conversation.'),
      risk_classification: ['standard', 'elevated', 'critical'].includes(parsed.risk_classification)
        ? parsed.risk_classification
        : 'standard',
      risk_reasoning: String(parsed.risk_reasoning || 'Default classification.'),
    }
  } catch {
    // Fallback if Haiku doesn't return valid JSON
    return {
      action_summary: 'Review the conversation and decide next steps.',
      session_prompt: `Continue from a founder hub conversation with ${primaryAgent}. The founder asked: "${founderMessage.substring(0, 200)}". Review the response and determine the next concrete action.`,
      risk_classification: 'standard',
      risk_reasoning: 'Unable to classify — defaulting to standard.',
    }
  }
}

// =============================================================================
// Ask the Org — Parallel domain query with Ops synthesis + Mentor review
// =============================================================================

type DomainAgentType = 'tech' | 'growth' | 'support'
const DOMAIN_AGENTS: DomainAgentType[] = ['tech', 'growth', 'support']

interface DomainResponse {
  agent: DomainAgentType
  content: string
  pipeline_meta: Record<string, unknown>
}

interface OpsSynthesis {
  unified_answer: string
  combined_session_prompt: string
  risk_classification: 'standard' | 'elevated' | 'critical'
  risk_reasoning: string
  domain_summary: Record<string, string>
}

interface MentorReview {
  has_guidance: boolean
  guidance: string
  reasoning_quality: 'sound' | 'needs_examination' | 'passion_detected'
}

/**
 * Get a domain agent's independent answer to the founder's question.
 * Each runs Sonnet with deep brain context — no conversation history (standalone query).
 */
async function getDomainAgentResponse(
  agent: DomainAgentType,
  question: string,
  userId: string,
): Promise<DomainResponse> {
  const client = getClient()
  const startTime = Date.now()

  const brainContext = getAgentBrainContext(agent, 'deep')
  const stoicContext = getStoicBrainContextForMechanisms(['passion_diagnosis', 'oikeiosis', 'value_assessment'])
  const projectContext = await getProjectContext('summary')
  const practitionerContext = await getFullPractitionerContext(userId)

  const systemBlocks: Array<{ type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }> = [
    {
      type: 'text',
      text: `You are ${getAgentDescription(agent)}. The SageReasoning founder is asking all domain agents the same question simultaneously. Give your best domain-specific answer.\n\nBe direct, specific, and thorough. Cover what falls within your expertise. Don't try to cover other agents' domains — they're answering in parallel. The founder is a non-technical solo founder.\n\n${brainContext}`,
      cache_control: { type: 'ephemeral' },
    },
    ...(stoicContext ? [{ type: 'text' as const, text: stoicContext }] : []),
  ]

  let enrichedQuestion = question
  if (practitionerContext) enrichedQuestion += `\n\n${practitionerContext}`
  enrichedQuestion += `\n\n${projectContext}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    temperature: 0.4,
    system: systemBlocks,
    messages: [{ role: 'user', content: enrichedQuestion }],
  })

  const content = response.content[0].type === 'text' ? response.content[0].text : ''
  const durationMs = Date.now() - startTime

  return {
    agent,
    content,
    pipeline_meta: {
      model: 'claude-sonnet-4-6',
      inputTokens: response.usage?.input_tokens || 0,
      outputTokens: response.usage?.output_tokens || 0,
      durationMs,
      brainDepth: 'deep',
    },
  }
}

/**
 * Ops synthesis — Opus 4.6 receives all 3 domain answers and produces:
 * 1. A unified operational answer
 * 2. A combined session prompt the founder can paste into a new session
 * 3. Risk classification
 */
async function getOpsSynthesis(
  question: string,
  domainResponses: DomainResponse[],
): Promise<OpsSynthesis> {
  const client = getClient()
  const opsBrain = getAgentBrainContext('ops', 'deep')

  const domainInputs = domainResponses.map(r =>
    `=== ${r.agent.toUpperCase()} ===\n${r.content}`
  ).join('\n\n')

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2500,
    temperature: 0.3,
    system: [
      {
        type: 'text',
        text: `You are Sage-Ops, the operational synthesis agent for SageReasoning. You have just received independent answers from Tech, Growth, and Support agents to the same founder question.

Your job:
1. Synthesize their answers into one unified operational answer that integrates all relevant perspectives. Don't just concatenate — find the through-line, resolve any tensions, and give the founder a clear picture.
2. Produce a combined session prompt that a new Claude Cowork session can use to execute on this. The prompt must give the new session enough context to start working immediately — reference specific files, endpoints, decisions, and include all three domains' relevant details.
3. Classify the risk level of the recommended action.

Risk classification (per 0d-ii):
- Standard: Additive changes, content updates, new features, cosmetic fixes
- Elevated: Changes to existing user-facing functionality, new dependencies, schema changes
- Critical: Auth, session management, access control, encryption, data deletion, deployment config

Return ONLY valid JSON:
{
  "unified_answer": "<your synthesized answer — thorough but clear, addressed to the founder in plain language>",
  "combined_session_prompt": "<the full prompt the founder pastes into a new session — 5-12 sentences, specific, actionable, integrating all domain perspectives>",
  "risk_classification": "<standard|elevated|critical>",
  "risk_reasoning": "<one sentence: why this risk level>",
  "domain_summary": {
    "tech": "<1 sentence: what tech contributed>",
    "growth": "<1 sentence: what growth contributed>",
    "support": "<1 sentence: what support contributed>"
  }
}

${opsBrain}`,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `FOUNDER'S QUESTION:\n"${question}"\n\nDOMAIN AGENT RESPONSES:\n${domainInputs}\n\nSynthesize these into a unified operational answer and combined session prompt.`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    let parsed: Record<string, unknown>
    try { parsed = JSON.parse(text.trim()) } catch {
      const match = text.match(/\{[\s\S]*\}/)
      if (match) { parsed = JSON.parse(match[0]) } else { throw new Error('No JSON found') }
    }

    return {
      unified_answer: String(parsed.unified_answer || 'Unable to synthesize — see individual domain responses.'),
      combined_session_prompt: String(parsed.combined_session_prompt || 'Continue from an Ask the Org query.'),
      risk_classification: ['standard', 'elevated', 'critical'].includes(String(parsed.risk_classification))
        ? (parsed.risk_classification as 'standard' | 'elevated' | 'critical')
        : 'standard',
      risk_reasoning: String(parsed.risk_reasoning || 'Default classification.'),
      domain_summary: {
        tech: String((parsed.domain_summary as Record<string, string>)?.tech || 'No summary.'),
        growth: String((parsed.domain_summary as Record<string, string>)?.growth || 'No summary.'),
        support: String((parsed.domain_summary as Record<string, string>)?.support || 'No summary.'),
      },
    }
  } catch {
    return {
      unified_answer: 'Unable to parse synthesis — see individual domain responses below.',
      combined_session_prompt: `Continue from an Ask the Org query. The founder asked: "${question.substring(0, 200)}". Tech, Growth, and Support each provided domain-specific answers. Review and determine the unified next action.`,
      risk_classification: 'standard',
      risk_reasoning: 'Unable to classify — defaulting to standard.',
      domain_summary: { tech: 'See raw response.', growth: 'See raw response.', support: 'See raw response.' },
    }
  }
}

/**
 * Mentor review — Sonnet checks the Ops synthesis for principled reasoning.
 * Only adds guidance if warranted (passion detected, reasoning gap, or ethical concern).
 */
async function getMentorReview(
  question: string,
  opsSynthesis: OpsSynthesis,
): Promise<MentorReview> {
  const client = getClient()
  const stoicContext = getStoicBrainContextForMechanisms([
    'passion_diagnosis', 'oikeiosis', 'value_assessment', 'control_filter',
  ])
  const mentorKB = getMentorKnowledgeBase()

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    temperature: 0.3,
    system: [
      {
        type: 'text',
        text: `You are the Sage Mentor reviewing an operational synthesis for the SageReasoning founder. The Ops agent has unified three domain perspectives into an answer and action plan.

Your job: check whether the reasoning and recommended action align with principled reasoning. Specifically look for:
- Passions (appetite, fear, pleasure, distress) driving the recommendation rather than virtue
- False judgements embedded in assumptions
- Oikeiosis violations — is the action appropriately scoped to the founder's current circle of concern?
- Anything the founder should examine before acting

If the reasoning is sound and no guidance is needed, say so briefly.
If you detect something worth flagging, explain it warmly and specifically — not as a lecture, but as a mentor observation.

Return ONLY valid JSON:
{
  "has_guidance": <true if you have something worth saying, false if reasoning is sound>,
  "guidance": "<your mentor note — 2-4 sentences if has_guidance is true, or 1 sentence affirming sound reasoning if false>",
  "reasoning_quality": "<sound|needs_examination|passion_detected>"
}

${mentorKB}
${stoicContext || ''}`,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `FOUNDER'S QUESTION:\n"${question}"\n\nOPS UNIFIED ANSWER:\n${opsSynthesis.unified_answer}\n\nRECOMMENDED ACTION (${opsSynthesis.risk_classification}):\n${opsSynthesis.combined_session_prompt}\n\nReview for principled reasoning.`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    let parsed: Record<string, unknown>
    try { parsed = JSON.parse(text.trim()) } catch {
      const match = text.match(/\{[\s\S]*\}/)
      if (match) { parsed = JSON.parse(match[0]) } else { throw new Error('No JSON found') }
    }

    return {
      has_guidance: Boolean(parsed.has_guidance),
      guidance: String(parsed.guidance || 'Reasoning appears sound.'),
      reasoning_quality: ['sound', 'needs_examination', 'passion_detected'].includes(String(parsed.reasoning_quality))
        ? (parsed.reasoning_quality as 'sound' | 'needs_examination' | 'passion_detected')
        : 'sound',
    }
  } catch {
    return {
      has_guidance: false,
      guidance: 'Unable to review — proceed with awareness.',
      reasoning_quality: 'sound',
    }
  }
}

// =============================================================================
// POST — Send message to agent (standard) or Ask the Org (parallel synthesis)
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

  let debugStep = 'parse_body'
  try {
    const { agent, message, conversation_id, mode } = await request.json()

    // Validate message (required for both modes)
    if (!message || typeof message !== 'string' || message.trim().length < 2) {
      return NextResponse.json(
        { error: 'Message is required (min 2 characters).' },
        { status: 400 }
      )
    }

    // ── Ask the Org mode ──────────────────────────────────────────────
    if (mode === 'ask-org') {
      debugStep = 'ask_org_create_conversation'
      const { data: conv, error: convErr } = await supabaseAdmin
        .from('founder_conversations')
        .insert({
          primary_agent: 'ops',
          title: `[Ask Org] ${message.trim().substring(0, 80)}`,
        })
        .select('id')
        .single()

      if (convErr || !conv) {
        return NextResponse.json(
          { error: `Failed to create conversation: ${convErr?.message || 'unknown'}` },
          { status: 500 }
        )
      }
      const orgConvId = conv.id

      // Save founder's question
      await supabaseAdmin.from('founder_conversation_messages').insert({
        conversation_id: orgConvId,
        role: 'founder',
        agent_type: null,
        content: message.trim(),
      })

      // Step 1: Parallel domain queries (Tech, Growth, Support — Sonnet)
      debugStep = 'ask_org_domain_queries'
      const domainPromises = DOMAIN_AGENTS.map(da =>
        getDomainAgentResponse(da, message.trim(), auth.user.id).catch(err => {
          console.error(`Domain agent ${da} failed:`, err)
          return { agent: da, content: `[${da} unavailable: ${err.message}]`, pipeline_meta: { error: true } } as DomainResponse
        })
      )
      const domainResponses = await Promise.all(domainPromises)

      // Save domain responses
      for (const dr of domainResponses) {
        await supabaseAdmin.from('founder_conversation_messages').insert({
          conversation_id: orgConvId,
          role: 'agent',
          agent_type: dr.agent,
          content: dr.content,
          pipeline_meta: dr.pipeline_meta,
        })
      }

      // Step 2: Ops synthesis (Opus 4.6)
      debugStep = 'ask_org_ops_synthesis'
      const opsSynthesis = await getOpsSynthesis(message.trim(), domainResponses)

      // Save Ops synthesis
      await supabaseAdmin.from('founder_conversation_messages').insert({
        conversation_id: orgConvId,
        role: 'agent',
        agent_type: 'ops',
        content: opsSynthesis.unified_answer,
        pipeline_meta: {
          type: 'ask_org_synthesis',
          model: 'claude-opus-4-6',
          risk_classification: opsSynthesis.risk_classification,
          domain_summary: opsSynthesis.domain_summary,
        },
      })

      // Step 3: Mentor review (Sonnet)
      debugStep = 'ask_org_mentor_review'
      const mentorReview = await getMentorReview(message.trim(), opsSynthesis).catch(err => {
        console.error('Mentor review failed (non-blocking):', err)
        return { has_guidance: false, guidance: 'Mentor unavailable.', reasoning_quality: 'sound' as const }
      })

      // Save Mentor review if it has guidance
      if (mentorReview.has_guidance) {
        await supabaseAdmin.from('founder_conversation_messages').insert({
          conversation_id: orgConvId,
          role: 'observer',
          agent_type: 'mentor',
          content: mentorReview.guidance,
          pipeline_meta: { type: 'ask_org_mentor_review', reasoning_quality: mentorReview.reasoning_quality },
        })
      }

      // Update conversation timestamp
      await supabaseAdmin
        .from('founder_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', orgConvId)

      return NextResponse.json({
        mode: 'ask-org',
        conversation_id: orgConvId,
        domain_responses: domainResponses.map(dr => ({
          agent: dr.agent,
          content: dr.content,
          pipeline_meta: dr.pipeline_meta,
        })),
        ops_synthesis: {
          unified_answer: opsSynthesis.unified_answer,
          combined_session_prompt: opsSynthesis.combined_session_prompt,
          risk_classification: opsSynthesis.risk_classification,
          risk_reasoning: opsSynthesis.risk_reasoning,
          domain_summary: opsSynthesis.domain_summary,
        },
        mentor_review: {
          has_guidance: mentorReview.has_guidance,
          guidance: mentorReview.guidance,
          reasoning_quality: mentorReview.reasoning_quality,
        },
      }, {
        headers: corsHeaders(),
      })
    }

    // ── Standard agent mode ───────────────────────────────────────────
    // Validate agent (only required for standard mode)
    if (!agent || !VALID_AGENTS.includes(agent)) {
      return NextResponse.json(
        { error: `Invalid agent. Must be one of: ${VALID_AGENTS.join(', ')}` },
        { status: 400 }
      )
    }

    // Get or create conversation
    debugStep = 'create_conversation'
    let convId = conversation_id
    if (!convId) {
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
          { error: `Failed to create conversation: ${convErr?.message || 'unknown'}` },
          { status: 500 }
        )
      }
      convId = conv.id
    }

    // Load conversation history
    debugStep = 'load_history'
    const { data: history } = await supabaseAdmin
      .from('founder_conversation_messages')
      .select('role, agent_type, content')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })

    const conversationHistory = history || []

    // Save founder's message
    debugStep = 'save_founder_message'
    await supabaseAdmin.from('founder_conversation_messages').insert({
      conversation_id: convId,
      role: 'founder',
      agent_type: null,
      content: message.trim(),
    })

    // Get primary agent response
    debugStep = `get_primary_response_${agent}`
    const primaryResponse = await getPrimaryAgentResponse(
      agent as AgentType,
      message.trim(),
      conversationHistory,
      auth.user.id,
    )

    // Save primary agent response
    debugStep = 'save_primary_response'
    await supabaseAdmin.from('founder_conversation_messages').insert({
      conversation_id: convId,
      role: 'agent',
      agent_type: agent,
      content: primaryResponse.content,
      pipeline_meta: primaryResponse.pipeline_meta,
      decision_gate: primaryResponse.decision_gate || null,
    })

    // Get observer contributions (all other agents check in parallel)
    debugStep = 'get_observers'
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
    debugStep = 'save_observers'
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

    // Get Ops recommended action (final synthesis pass)
    debugStep = 'get_ops_recommended_action'
    const observerSummary = contributions
      .map(obs => `[${obs.agent}]: ${obs.content}`)
      .join('\n')
    const recommendedAction = await getOpsRecommendedAction(
      message.trim(),
      agent as AgentType,
      primaryResponse.content,
      observerSummary,
    ).catch(err => {
      console.error('Ops recommended action failed (non-blocking):', err)
      return null
    })

    // Save recommended action as an ops observer message
    if (recommendedAction) {
      await supabaseAdmin.from('founder_conversation_messages').insert({
        conversation_id: convId,
        role: 'observer',
        agent_type: 'ops',
        content: `**Recommended Action:** ${recommendedAction.action_summary}\n\n**Risk:** ${recommendedAction.risk_classification} — ${recommendedAction.risk_reasoning}\n\n**Session Prompt:**\n${recommendedAction.session_prompt}`,
        relevance_score: 1.0,
        pipeline_meta: { type: 'recommended_action', risk_classification: recommendedAction.risk_classification },
      })
    }

    // Update conversation timestamp
    debugStep = 'update_timestamp'
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
      recommended_action: recommendedAction || null,
      message_count: conversationHistory.length + 2 + contributions.length,
    }, {
      headers: corsHeaders(),
    })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error(`Founder hub error at step [${debugStep}]:`, error)
    return NextResponse.json(
      { error: `Failed at step: ${debugStep}. Detail: ${errMsg}` },
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
