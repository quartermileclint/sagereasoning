/**
 * support-agent.ts — SageReasoning Support Agent
 *
 * The first inner agent to slot into the ring's gap. Handles all
 * operational support tasks for running SageReasoning as a business:
 * customer inquiries, ticketing, knowledge base lookups, workflow
 * execution, notifications, lead qualification, and QA.
 *
 * Architecture:
 *   - Registered in the ring via registerInnerAgent()
 *   - Starts at 'supervised' authority (every action checked)
 *   - Earns promotion through consistent principled reasoning
 *   - Uses 10 markdown-based tools (5 folders + 5 built-in)
 *   - Local markdown files are canonical; Supabase holds persistent memory
 *
 * The support agent knows nothing about Stoicism. It does operational
 * work and reports back. The ring evaluates its reasoning quality.
 *
 * Rules:
 *   R1:  Agent drafts must not imply therapeutic services
 *   R3:  Disclaimer on all evaluative output the agent produces
 *   R9:  No outcome promises in any customer communication
 *
 * SageReasoning Proprietary Licence
 */
/**
 * @compliance
 * compliance_version: CR-2026-Q2-v1
 * last_regulatory_review: 2026-04-04
 * applicable_jurisdictions: [AU, EU, US]
 * regulatory_references: [CR-001, CR-002, CR-004, CR-005]
 * review_cycle: quarterly
 * owner: founder
 * next_review_due: 2026-07-06
 * change_trigger: [EU AI Act classification guidance, AU Privacy Act reform]
 * deprecation_flag: false
 */

import type { InnerAgent, RingTask, AfterResult, TokenUsage } from './ring-wrapper'
import type { MentorProfile } from './persona'
import type { AgentActionRecord } from './authority-manager'

import {
  registerInnerAgent,
  getInnerAgent,
  executeBefore,
} from './ring-wrapper'

import {
  initAgentPerformance,
  recordAgentAction,
} from './authority-manager'

// ── Channel 1 (distress pre-processing) + Channel 2 (history synthesis) ──
// Wired 20 April 2026 per operations/handoffs/support-wiring-fix-handoff.md.
// PR6: Channel 1 touches distress-classifier surface. Classified Critical
// under 0d-ii. PR3: both channels complete before the drafter runs. PR1:
// the proven mentor pattern is the single-endpoint proof; Support is the
// second endpoint — no third rollout in this session.
import type {
  SupportDistressDeps,
  SupportDistressSignal,
  SupportSafetyGate,
  SupabaseReadClient,
} from './support-distress-preprocessor'
import {
  preprocessSupportDistress,
  enforceSupportDistressCheck,
} from './support-distress-preprocessor'
import type { SupportInteractionHistory } from './support-history-synthesis'
import {
  synthesiseSupportHistory,
  formatHistoryContextBlock,
} from './support-history-synthesis'

// ============================================================================
// CONSTANTS
// ============================================================================

/** The support agent's unique identifier in the ring registry */
export const SUPPORT_AGENT_ID = 'sage-support'

/** Human-readable name (sanitised on registration) */
export const SUPPORT_AGENT_NAME = 'SageReasoning Support Agent'

/** Agent type for the ring registry */
export const SUPPORT_AGENT_TYPE = 'assistant' as const

/** Run loop interval in milliseconds (15 minutes) */
export const RUN_LOOP_INTERVAL_MS = 15 * 60 * 1000

/** Standard disclaimer appended to all customer-facing drafts (R3) */
export const SUPPORT_DISCLAIMER =
  'Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations.'

// ============================================================================
// TOOL REGISTRY — Paths to the 10 markdown-based operational tools
// ============================================================================

/**
 * Registry of all markdown tool paths.
 *
 * 5 folder-based tools (each has its own file structure):
 *   inbox, knowledge_base, workflows, notifications, leads
 *
 * 5 built-in tools (functionality embedded in other structures):
 *   ticketing (frontmatter in inbox), drafting (agent's core function),
 *   escalation (status change), omnichannel (channel field), qa (ring AFTER)
 */
export const TOOL_REGISTRY = {
  // Folder-based tools
  inbox: {
    path: 'support/inbox',
    resolved_path: 'support/resolved',
    description: 'Customer inquiry resolution — markdown files with frontmatter tickets',
  },
  knowledge_base: {
    path: 'knowledge-base',
    description: 'Searchable KB articles the agent references when drafting responses',
  },
  workflows: {
    path: 'workflows',
    description: 'Step-by-step playbooks the agent follows for specific scenarios',
  },
  notifications: {
    outbox_path: 'notifications/outbox',
    sent_path: 'notifications/sent',
    description: 'Email notification drafts for founder review and manual send',
  },
  leads: {
    active_path: 'leads/active',
    qualified_path: 'leads/qualified',
    closed_path: 'leads/closed',
    description: 'Lead qualification files with research notes and ring observations',
  },
  // Built-in tools (no separate folder — embedded in other structures)
  ticketing: {
    description: 'Frontmatter status field in inbox files (open/in_progress/resolved/escalated)',
    embedded_in: 'inbox',
  },
  drafting: {
    description: 'Support agent core function — drafts responses in inbox files',
    embedded_in: 'inbox',
  },
  escalation: {
    description: 'Status change to escalated + reason in frontmatter',
    embedded_in: 'inbox',
  },
  omnichannel: {
    description: 'Channel field in frontmatter (email/chat/api/social/form)',
    embedded_in: 'inbox',
  },
  qa_monitoring: {
    description: 'Ring AFTER check evaluates every draft — the QA layer IS the ring',
    embedded_in: 'ring',
  },
} as const

// ============================================================================
// TYPES
// ============================================================================

/** Supported channels for incoming inquiries */
export type SupportChannel = 'email' | 'chat' | 'api' | 'social' | 'form'

/** Status of a support interaction */
export type SupportStatus = 'open' | 'in_progress' | 'resolved' | 'escalated'

/** Priority levels for support tickets */
export type SupportPriority = 'low' | 'normal' | 'high' | 'urgent'

/**
 * Parsed frontmatter from a support inbox markdown file.
 */
export type InboxFrontmatter = {
  readonly id: string
  status: SupportStatus
  readonly channel: SupportChannel
  readonly customer: string
  readonly subject: string
  readonly received: string
  priority: SupportPriority
  governance_flags: string[]
  synced_at: string | null
  escalation_reason?: string
  escalated_at?: string
}

/**
 * A parsed support inbox file (frontmatter + sections).
 */
export type InboxItem = {
  readonly frontmatter: InboxFrontmatter
  readonly customer_message: string
  draft_response: string | null
  ring_review: string | null
  founder_decision: string | null
  readonly raw_content: string
  readonly file_path: string
}

/**
 * Result of processing a single inbox item through the ring.
 */
export type ProcessingResult = {
  readonly interaction_id: string
  readonly file_path: string
  readonly status: SupportStatus
  readonly ring_evaluation: AfterResult | null
  readonly token_usage: TokenUsage[]
  readonly escalated: boolean
  readonly escalation_reason: string | null
}

/**
 * Knowledge base article (parsed frontmatter + content).
 */
export type KBArticle = {
  readonly title: string
  readonly category: string
  readonly content: string
  readonly governance_rules: string[]
  readonly file_path: string
}

/**
 * Configuration for the support agent run loop.
 */
export type RunLoopConfig = {
  /** Base directory for all support operations */
  readonly base_dir: string
  /** How often to scan for new work (ms) */
  readonly interval_ms: number
  /** Maximum items to process per run */
  readonly max_items_per_run: number
  /** Whether to auto-escalate governance-flagged items */
  readonly auto_escalate_governance: boolean
}

/** Default run loop configuration */
export const DEFAULT_RUN_LOOP_CONFIG: RunLoopConfig = {
  base_dir: '.',
  interval_ms: RUN_LOOP_INTERVAL_MS,
  max_items_per_run: 10,
  auto_escalate_governance: true,
}

// ============================================================================
// FRONTMATTER PARSING
// ============================================================================

/**
 * Parse YAML-like frontmatter from a markdown file's content.
 * Handles the --- delimited block at the top of the file.
 *
 * This is a lightweight parser — no external YAML library needed.
 * Supports: strings, arrays (inline [...] or one-per-line), booleans, nulls.
 */
export function parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown>
  body: string
} {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!match) {
    return { frontmatter: {}, body: content }
  }

  const [, yamlBlock, body] = match
  const frontmatter: Record<string, unknown> = {}

  for (const line of yamlBlock.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const colonIdx = trimmed.indexOf(':')
    if (colonIdx === -1) continue

    const key = trimmed.slice(0, colonIdx).trim()
    let value: unknown = trimmed.slice(colonIdx + 1).trim()

    // Handle quoted strings
    if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    }

    // Handle inline arrays [a, b, c]
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1).trim()
      value = inner.length === 0
        ? []
        : inner.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    }

    // Handle booleans
    if (value === 'true') value = true
    if (value === 'false') value = false

    // Handle null / empty
    if (value === '' || value === 'null') value = null

    frontmatter[key] = value
  }

  return { frontmatter, body }
}

/**
 * Serialise frontmatter back to YAML-like string.
 */
export function serialiseFrontmatter(fm: Record<string, unknown>): string {
  const lines: string[] = []
  for (const [key, value] of Object.entries(fm)) {
    if (value === null || value === undefined) {
      lines.push(`${key}:`)
    } else if (Array.isArray(value)) {
      lines.push(`${key}: [${value.map(v => typeof v === 'string' && v.includes(' ') ? `"${v}"` : v).join(', ')}]`)
    } else if (typeof value === 'string' && (value.includes(':') || value.includes('"'))) {
      lines.push(`${key}: "${value}"`)
    } else {
      lines.push(`${key}: ${value}`)
    }
  }
  return lines.join('\n')
}

/**
 * Parse a support inbox markdown file into its structured sections.
 */
export function parseInboxFile(content: string, filePath: string): InboxItem | null {
  const { frontmatter: fm, body } = parseFrontmatter(content)

  if (!fm.id || !fm.status) return null

  // Extract sections from the body
  const sections = extractSections(body)

  return {
    frontmatter: {
      id: String(fm.id),
      status: (fm.status as SupportStatus) || 'open',
      channel: (fm.channel as SupportChannel) || 'email',
      customer: String(fm.customer || ''),
      subject: String(fm.subject || ''),
      received: String(fm.received || new Date().toISOString()),
      priority: (fm.priority as SupportPriority) || 'normal',
      governance_flags: (fm.governance_flags as string[]) || [],
      synced_at: fm.synced_at ? String(fm.synced_at) : null,
      escalation_reason: fm.escalation_reason ? String(fm.escalation_reason) : undefined,
      escalated_at: fm.escalated_at ? String(fm.escalated_at) : undefined,
    },
    customer_message: sections['Customer Message'] || '',
    draft_response: sections['Draft Response'] || null,
    ring_review: sections['Ring Review'] || null,
    founder_decision: sections['Founder Decision'] || null,
    raw_content: content,
    file_path: filePath,
  }
}

/**
 * Extract named sections from the body of a markdown file.
 * Sections are delimited by ## headings.
 */
function extractSections(body: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const parts = body.split(/^## /m)

  for (const part of parts) {
    if (!part.trim()) continue
    const newlineIdx = part.indexOf('\n')
    if (newlineIdx === -1) continue
    const heading = part.slice(0, newlineIdx).trim()
    const content = part.slice(newlineIdx + 1).trim()
    sections[heading] = content
  }

  return sections
}

// ============================================================================
// KNOWLEDGE BASE SEARCH
// ============================================================================

/**
 * Search the knowledge base for articles relevant to a query.
 *
 * Uses keyword matching against article titles and content.
 * Returns the top N most relevant articles.
 *
 * In production, this would use the semantic search function
 * from the OpenBrain memory layer for better accuracy.
 */
export function searchKnowledgeBase(
  articles: KBArticle[],
  query: string,
  maxResults: number = 3
): KBArticle[] {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)

  const scored = articles.map(article => {
    let score = 0
    const titleLower = article.title.toLowerCase()
    const contentLower = article.content.toLowerCase()

    for (const word of queryWords) {
      // Title matches are worth more
      if (titleLower.includes(word)) score += 3
      // Content matches
      if (contentLower.includes(word)) score += 1
    }

    return { article, score }
  })

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.article)
}

// ============================================================================
// GOVERNANCE DETECTION
// ============================================================================

/**
 * Governance rules that trigger automatic escalation.
 * If a customer message touches these areas, the support agent
 * should escalate rather than attempt a response.
 */
const ESCALATION_TRIGGERS: Record<string, { rule: string; keywords: string[] }> = {
  therapeutic: {
    rule: 'R1',
    keywords: [
      'therapy', 'therapist', 'counseling', 'counselling', 'mental health',
      'depression', 'anxiety', 'treatment', 'diagnosis', 'clinical',
      'psychologist', 'psychiatrist', 'medication', 'self-harm', 'suicide',
    ],
  },
  employment: {
    rule: 'R2',
    keywords: [
      'hiring', 'recruitment', 'employee evaluation', 'performance review',
      'hr assessment', 'job screening', 'promotion decision', 'employment',
    ],
  },
  outcome_promises: {
    rule: 'R9',
    keywords: [
      'guarantee', 'promise', 'will it work', 'will it fix',
      'cure', 'solve my', 'make me better',
    ],
  },
}

/**
 * Check a customer message for governance flags that require escalation.
 * Returns the list of triggered rules and the reason string.
 */
export function detectGovernanceFlags(
  message: string
): { flags: string[]; should_escalate: boolean; reason: string | null } {
  const messageLower = message.toLowerCase()
  const triggeredRules: string[] = []
  const reasons: string[] = []

  for (const [category, trigger] of Object.entries(ESCALATION_TRIGGERS)) {
    const matched = trigger.keywords.some(kw => messageLower.includes(kw))
    if (matched) {
      triggeredRules.push(trigger.rule)
      reasons.push(`${category} (${trigger.rule})`)
    }
  }

  return {
    flags: triggeredRules,
    should_escalate: triggeredRules.length > 0,
    reason: reasons.length > 0
      ? `Governance flags detected: ${reasons.join(', ')}`
      : null,
  }
}

// ============================================================================
// DRAFT BUILDER
// ============================================================================

/**
 * Build a draft response prompt for the LLM.
 *
 * The support agent uses this prompt to generate a customer response
 * based on the inquiry, relevant KB articles, and the Channel 2
 * history_context block.
 *
 * The ring will evaluate the resulting draft via its AFTER check.
 *
 * @param history - Synthesised support interaction history (Channel 2).
 *                  When omitted (legacy callers), the prompt is built
 *                  without a history block. All new call sites MUST pass
 *                  this — the processInboxItem signature enforces it.
 */
export function buildDraftPrompt(
  item: InboxItem,
  relevantArticles: KBArticle[],
  history?: SupportInteractionHistory,
): string {
  const kbContext = relevantArticles.length > 0
    ? relevantArticles.map(a =>
        `### ${a.title}\n${a.content.slice(0, 500)}`
      ).join('\n\n')
    : 'No directly relevant knowledge base articles found.'

  const historyContext = history ? formatHistoryContextBlock(history) : ''

  return `You are the SageReasoning support agent. Draft a helpful, accurate response to the following customer inquiry.

RULES YOU MUST FOLLOW:
- R1: Do NOT imply therapeutic, psychological, or clinical services. Frame everything as philosophical practice.
- R3: Include this disclaimer at the end: "${SUPPORT_DISCLAIMER}"
- R9: Do NOT promise outcomes or guarantee results. SageReasoning evaluates reasoning quality, not outcomes.
- Use plain English (R8c for customer-facing content).
- Be warm, professional, and concise.

CUSTOMER INQUIRY:
Subject: ${item.frontmatter.subject}
Channel: ${item.frontmatter.channel}
Message: ${item.customer_message}

RELEVANT KNOWLEDGE BASE ARTICLES:
${kbContext}
${historyContext ? `\n${historyContext}\n` : ''}
Draft a response that:
1. Directly addresses the customer's question
2. References accurate information from the knowledge base
3. Maintains R1/R3/R9 compliance
4. Ends with the standard disclaimer

Write only the response text. No metadata or commentary.`
}

// ============================================================================
// CRISIS REDIRECT DRAFT (R20a path — preprocessor says shouldRedirect=true)
// ============================================================================

/**
 * Build the crisis-resource redirect message used when the Channel 1
 * preprocessor returns a SupportSafetyGate with shouldRedirect=true.
 *
 * The Support agent does NOT call an LLM in this path. The redirect
 * message from the proven classifier (which composes crisis resources
 * from getCrisisResources()) is surfaced verbatim into the inbox file's
 * Draft Response section. The disclaimer is appended so R3 still holds.
 *
 * Mirrors the mentor's behaviour in
 * website/src/app/api/mentor/private/reflect/route.ts — distress short-
 * circuits the LLM path.
 */
export function buildCrisisRedirectDraft(gate: SupportSafetyGate): string {
  const redirect = gate.signal.current.redirect_message
  const body = redirect
    ? redirect
    : 'Before we continue, we want to make sure you are okay. Some of what you described sounds like it might be weighing heavily on you. Please consider reaching out to a qualified professional or a trusted person who can support you directly.'

  return `${body}\n\n---\n${SUPPORT_DISCLAIMER}`
}

// ============================================================================
// FILE ASSEMBLY
// ============================================================================

/**
 * Assemble a complete inbox file with all sections populated.
 * Used after the agent drafts a response and the ring reviews it.
 */
export function assembleInboxFile(
  item: InboxItem,
  draftResponse: string | null,
  ringReview: string | null,
  newStatus?: SupportStatus
): string {
  const fm = { ...item.frontmatter }
  if (newStatus) {
    fm.status = newStatus
  }

  const frontmatterStr = serialiseFrontmatter(fm as unknown as Record<string, unknown>)

  const sections = [
    `---\n${frontmatterStr}\n---`,
    '',
    '## Customer Message',
    '',
    item.customer_message || '[No message content]',
    '',
    '## Draft Response',
    '',
    draftResponse || '[Support agent writes its draft here]',
    '',
    '## Ring Review',
    '',
    ringReview || '[Ring\'s AFTER evaluation appears here automatically]',
    '',
    '## Founder Decision',
    '',
    item.founder_decision || '[You write: approved / edited / escalated + any notes]',
  ]

  return sections.join('\n')
}

/**
 * Format an AfterResult into human-readable ring review text.
 */
export function formatRingReview(after: AfterResult): string {
  const lines: string[] = []

  lines.push(`- Reasoning quality: ${after.reasoning_quality}`)

  // R1 compliance
  const hasR1Issue = after.passions_detected.some(
    p => p.false_judgement.toLowerCase().includes('therapeutic') ||
         p.false_judgement.toLowerCase().includes('clinical')
  )
  lines.push(`- R1 compliance: ${hasR1Issue ? 'FAIL — therapeutic implication detected' : 'pass'}`)

  // R3 disclaimer
  lines.push(`- R3 disclaimer: [verify manually]`)

  // R9 outcome promises
  const hasR9Issue = after.passions_detected.some(
    p => p.false_judgement.toLowerCase().includes('promise') ||
         p.false_judgement.toLowerCase().includes('guarantee')
  )
  lines.push(`- R9 outcome promises: ${hasR9Issue ? 'FLAGGED — outcome promise detected' : 'none detected'}`)

  // Passion detection
  if (after.passions_detected.length > 0) {
    const passionList = after.passions_detected
      .map(p => `${p.passion} (${p.false_judgement})`)
      .join(', ')
    lines.push(`- Passion detection: ${passionList}`)
  } else {
    lines.push('- Passion detection: none')
  }

  // Recommendation
  const isGood = after.reasoning_quality === 'deliberate' ||
                 after.reasoning_quality === 'principled' ||
                 after.reasoning_quality === 'sage_like'
  const hasCriticalIssues = hasR1Issue || hasR9Issue
  lines.push(`- Recommendation: ${hasCriticalIssues ? 'revise' : isGood ? 'send' : 'revise'}`)

  // Mentor observation
  if (after.mentor_observation) {
    lines.push('')
    lines.push(`**Mentor observation:** ${after.mentor_observation}`)
  }

  // Pattern note
  if (after.pattern_note) {
    lines.push(`**Pattern note:** ${after.pattern_note}`)
  }

  return lines.join('\n')
}

// ============================================================================
// INITIALISATION
// ============================================================================

/**
 * Initialise the support agent.
 *
 * 1. Register with the ring via registerInnerAgent()
 * 2. Initialise performance tracking via initAgentPerformance()
 * 3. Return the registered agent
 *
 * Call this once at application startup. Subsequent calls return
 * the existing agent from the registry.
 */
export function initialiseSupportAgent(): InnerAgent {
  // Check if already registered
  const existing = getInnerAgent(SUPPORT_AGENT_ID)
  if (existing) return existing

  // Register in the ring — starts at 'supervised' authority
  const agent = registerInnerAgent(
    SUPPORT_AGENT_ID,
    SUPPORT_AGENT_NAME,
    SUPPORT_AGENT_TYPE
  )

  // Initialise performance tracking for authority promotion
  initAgentPerformance(SUPPORT_AGENT_ID)

  return agent
}

// ============================================================================
// RUN LOOP — The support agent's heartbeat
// ============================================================================

// ============================================================================
// DEPENDENCIES — injected at the call site (Supabase client + classifier)
// ============================================================================

/**
 * Dependencies required by processInboxItem. All external effects live
 * behind this injection boundary so the function remains testable and
 * the two sibling modules (distress preprocessor + history synthesis)
 * stay portable across environments.
 *
 * The `classify` callback is the proven R20a two-stage classifier.
 * Production callers wire `detectDistressTwoStage` from
 * `website/src/lib/r20a-classifier`. The verification harness wires a
 * deterministic test double. sage-mentor cannot import from
 * website/src/lib directly (sibling packages, different tsconfig) — DI
 * is the only safe bridge and also preserves PR6 (no classifier touch).
 */
export interface ProcessInboxItemDeps extends SupportDistressDeps {
  supabase: SupabaseReadClient
  userId: string
  /** Optional classifier session id for R20a cost tracking */
  sessionId?: string
}

/**
 * Result shape of a single processInboxItem call.
 *
 * NEW FIELDS vs the pre-20-April signature:
 *   distress             — Channel 1 output (SupportDistressSignal)
 *   history              — Channel 2 output (SupportInteractionHistory)
 *   shouldEscalate       — unified escalation flag (R20a OR R1/R2/R9)
 *   escalationReason     — human-readable reason, null if no escalation
 *   crisisRedirectDraft  — populated iff the R20a gate short-circuits
 */
export interface ProcessInboxItemResult {
  readonly ringTask: RingTask
  readonly beforeResult: ReturnType<typeof executeBefore>
  readonly draftPrompt: string
  readonly relevantArticles: KBArticle[]
  readonly governanceCheck: ReturnType<typeof detectGovernanceFlags>
  readonly distress: SupportDistressSignal
  readonly history: SupportInteractionHistory
  readonly shouldEscalate: boolean
  readonly escalationReason: string | null
  /**
   * When the R20a gate redirects, the crisis-resource message is
   * populated here. The drafter LLM is NOT called in this case — see
   * PR6. When null, proceed with the normal draftPrompt flow.
   */
  readonly crisisRedirectDraft: string | null
}

/**
 * Process a single inbox item through the full ring cycle.
 *
 * Flow (20 April 2026 — Channel 1 + Channel 2 wired):
 * 1. SYNCHRONOUS R20a distress pre-processing (Channel 1). If the gate
 *    says shouldRedirect, the Support agent does NOT draft — it
 *    populates the Draft Response section with the crisis-resource
 *    message and escalates with R20a in governance_flags. PR3: this
 *    completes before anything else runs.
 * 2. Channel 2 history synthesis runs in parallel with Channel 1 (both
 *    are independent). The 90-day prior flags are shared between them.
 * 3. Regex-based governance flags (R1/R2/R9) — same as before.
 * 4. Build ring task + BEFORE check.
 * 5. KB search + buildDraftPrompt with history_context injected.
 *
 * Breaking change (20 April 2026):
 *   - now async
 *   - requires deps: { supabase, classify, userId, sessionId? }
 *   - requires a SupportSafetyGate parameter (branded type — cannot be
 *     produced without awaiting the preprocessor, so the distress check
 *     cannot be bypassed at a type level; KG3/KG7 invocation guard).
 *
 * PR6: any change to this function's distress-handling path is Critical
 * under 0d-ii — the full Critical Change Protocol applies.
 */
export async function processInboxItem(
  item: InboxItem,
  profile: MentorProfile,
  knowledgeBaseArticles: KBArticle[],
  deps: ProcessInboxItemDeps,
  gate: SupportSafetyGate,
  _config: RunLoopConfig = DEFAULT_RUN_LOOP_CONFIG,
): Promise<ProcessInboxItemResult> {
  const agent = getInnerAgent(SUPPORT_AGENT_ID)
  if (!agent) {
    throw new Error('Support agent not initialised. Call initialiseSupportAgent() first.')
  }

  // Channel 2 history synthesis — runs in parallel with the rest of the
  // prep work. It re-uses the prior distress flags already fetched by
  // Channel 1 (available via gate.signal.prior_flags), so there is no
  // duplicate read on vulnerability_flag.
  const historyPromise = synthesiseSupportHistory(
    deps.supabase,
    deps.userId,
    item.frontmatter.customer || null,
    30,
    gate.signal.prior_flags,
  )

  // Governance flags (R1/R2/R9 keyword matcher — legacy, additive)
  const governanceCheck = detectGovernanceFlags(item.customer_message)

  // Ring task
  const ringTask: RingTask = {
    task_id: `support-${item.frontmatter.id}-${Date.now()}`,
    inner_agent_id: SUPPORT_AGENT_ID,
    task_description: `Draft response to customer inquiry: "${item.frontmatter.subject}" via ${item.frontmatter.channel}. Customer: ${item.frontmatter.customer}. Priority: ${item.frontmatter.priority}.`,
    task_context: item.customer_message.slice(0, 500),
    timestamp: new Date().toISOString(),
  }

  // BEFORE check
  const beforeResult = executeBefore(profile, ringTask, agent)

  // Knowledge base search (kept fast — keyword match, no LLM)
  const relevantArticles = searchKnowledgeBase(
    knowledgeBaseArticles,
    `${item.frontmatter.subject} ${item.customer_message}`,
  )

  const history = await historyPromise

  // ── R20a short-circuit ───────────────────────────────────────────────
  // If the gate tells us to redirect, we do NOT invoke the drafter LLM.
  // We populate the crisis-resource message directly. The caller writes
  // this into the inbox file's Draft Response section and sets status
  // to 'escalated' with R20a on governance_flags.
  if (gate.shouldRedirect) {
    return {
      ringTask,
      beforeResult,
      // draftPrompt is still surfaced for audit/logging parity, but the
      // caller MUST NOT send it to an LLM when crisisRedirectDraft is set.
      draftPrompt: buildDraftPrompt(item, relevantArticles, history),
      relevantArticles,
      governanceCheck,
      distress: gate.signal,
      history,
      shouldEscalate: true,
      escalationReason:
        `R20a distress detected (severity=${gate.signal.current.severity}` +
        (gate.sudden_change ? ', sudden change from baseline' : '') +
        ')',
      crisisRedirectDraft: buildCrisisRedirectDraft(gate),
    }
  }

  // ── Normal draft path ────────────────────────────────────────────────
  const draftPrompt = buildDraftPrompt(item, relevantArticles, history)

  // Legacy governance escalation (additive — still fires after the gate)
  const shouldEscalate = governanceCheck.should_escalate
  const escalationReason = shouldEscalate ? governanceCheck.reason : null

  return {
    ringTask,
    beforeResult,
    draftPrompt,
    relevantArticles,
    governanceCheck,
    distress: gate.signal,
    history,
    shouldEscalate,
    escalationReason,
    crisisRedirectDraft: null,
  }
}

/**
 * Convenience wrapper: run the preprocessor, construct the safety gate,
 * and invoke processInboxItem. Callers that don't already hold a gate
 * should use this entry point to make the PR2/PR3 invocation contract
 * impossible to bypass at the call site.
 */
export async function processInboxItemWithGuard(
  item: InboxItem,
  profile: MentorProfile,
  knowledgeBaseArticles: KBArticle[],
  deps: ProcessInboxItemDeps,
  _config: RunLoopConfig = DEFAULT_RUN_LOOP_CONFIG,
): Promise<ProcessInboxItemResult> {
  // PR3: build the gate synchronously before the drafter path runs.
  const combined = `${item.frontmatter.subject || ''}\n\n${item.customer_message}`.trim()
  const gate = await enforceSupportDistressCheck(
    preprocessSupportDistress(
      deps,
      deps.userId,
      item.frontmatter.customer || null,
      combined,
      deps.sessionId,
    ),
  )
  return processInboxItem(item, profile, knowledgeBaseArticles, deps, gate, _config)
}

/**
 * Complete processing after the LLM has generated a draft.
 *
 * This function:
 * 1. Runs the ring's AFTER check on the draft
 * 2. Formats the ring review
 * 3. Assembles the updated file content
 * 4. Records the action for authority tracking
 *
 * Returns the final file content and processing result.
 */
export function completeProcessing(
  item: InboxItem,
  _profile: MentorProfile,
  ringTask: RingTask,
  draftResponse: string,
  governanceCheck: ReturnType<typeof detectGovernanceFlags>,
  beforeHadConcerns: boolean,
  afterResult?: AfterResult
): {
  fileContent: string
  processingResult: ProcessingResult
} {
  const agent = getInnerAgent(SUPPORT_AGENT_ID)
  if (!agent) {
    throw new Error('Support agent not initialised.')
  }

  // Determine new status
  let newStatus: SupportStatus = 'in_progress'
  let escalated = false
  let escalationReason: string | null = null

  if (governanceCheck.should_escalate) {
    newStatus = 'escalated'
    escalated = true
    escalationReason = governanceCheck.reason
    // Update frontmatter
    item.frontmatter.governance_flags = governanceCheck.flags
  }

  // Format ring review (if AFTER result was provided from LLM evaluation)
  const ringReviewText = afterResult
    ? formatRingReview(afterResult)
    : '[Awaiting ring evaluation — LLM wiring pending (Phase 4)]'

  // Check if AFTER result recommends escalation
  if (afterResult && !escalated) {
    const hasCriticalPassion = afterResult.passions_detected.some(
      p => p.false_judgement.toLowerCase().includes('therapeutic') ||
           p.false_judgement.toLowerCase().includes('outcome promise')
    )
    if (hasCriticalPassion) {
      newStatus = 'escalated'
      escalated = true
      escalationReason = 'Ring AFTER check detected critical governance issue in draft'
    }
  }

  // Assemble the updated file
  const fileContent = assembleInboxFile(item, draftResponse, ringReviewText, newStatus)

  // Record the action for authority tracking
  if (afterResult) {
    const actionRecord: AgentActionRecord = {
      action_id: ringTask.task_id,
      agent_id: SUPPORT_AGENT_ID,
      proximity_assessed: afterResult.reasoning_quality,
      passions_detected: afterResult.passions_detected.map(p => p.passion),
      had_concerns: beforeHadConcerns || afterResult.passions_detected.length > 0,
      mechanisms_applied: afterResult.mechanisms_applied,
      timestamp: new Date().toISOString(),
    }
    recordAgentAction(actionRecord)
  }

  const processingResult: ProcessingResult = {
    interaction_id: item.frontmatter.id,
    file_path: item.file_path,
    status: newStatus,
    ring_evaluation: afterResult || null,
    token_usage: [],
    escalated,
    escalation_reason: escalationReason,
  }

  return { fileContent, processingResult }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Generate a daily summary of support interactions.
 *
 * Scans resolved files from a given date and produces statistics
 * for the pattern engine.
 */
export function generateDailySummary(
  resolvedItems: InboxItem[]
): {
  date: string
  total: number
  resolved: number
  escalated: number
  channels: Record<string, number>
  priorities: Record<string, number>
  governance_flags: string[]
} {
  const today = new Date().toISOString().split('T')[0]
  const channels: Record<string, number> = {}
  const priorities: Record<string, number> = {}
  const allFlags: string[] = []
  let escalated = 0

  for (const item of resolvedItems) {
    // Count channels
    channels[item.frontmatter.channel] = (channels[item.frontmatter.channel] || 0) + 1

    // Count priorities
    priorities[item.frontmatter.priority] = (priorities[item.frontmatter.priority] || 0) + 1

    // Count escalations
    if (item.frontmatter.status === 'escalated') escalated++

    // Collect governance flags
    allFlags.push(...item.frontmatter.governance_flags)
  }

  return {
    date: today,
    total: resolvedItems.length,
    resolved: resolvedItems.filter(i => i.frontmatter.status === 'resolved').length,
    escalated,
    channels,
    priorities,
    governance_flags: [...new Set(allFlags)],
  }
}

// ============================================================================
// NOTIFICATION BUILDER
// ============================================================================

/**
 * Build a notification markdown file for a given event.
 */
export function buildNotification(
  type: string,
  recipient: string,
  subject: string,
  body: string
): string {
  const id = `notif-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
  const created = new Date().toISOString()

  return `---
id: ${id}
type: ${type}
recipient: ${recipient}
subject: "${subject}"
status: draft
created: ${created}
sent_at:
---

## Email Body

${body}

## Ring Review

[Ring evaluates: R3 disclaimer present? R9 no promises? Accurate representation?]

## Send Decision

[Founder: approved / edited. Then send via Resend dashboard or trigger send script]
`
}

// ============================================================================
// LEAD BUILDER
// ============================================================================

/**
 * Build a lead markdown file for a new prospect.
 */
export function buildLeadFile(
  company: string,
  contact: string,
  source: string,
  useCase: string
): string {
  const id = `lead-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
  const today = new Date().toISOString().split('T')[0]

  return `---
id: ${id}
company: "${company}"
contact: ${contact}
source: ${source}
score: medium
status: active
use_case: "${useCase}"
first_contact: ${today}
last_contact: ${today}
---

## Notes

[Support agent writes research notes here]

## Ring Observations

[Ring's evaluation: Is pursuing this lead aligned with SageReasoning's mission?]

## Next Steps

- [ ] Send introductory information
- [ ] Schedule discovery call
- [ ] Prepare tier proposal
`
}
