/**
 * mcp-contracts.ts — MCP tool schema generator for SageReasoning skills.
 *
 * Generates Model Context Protocol (MCP) compatible tool definitions from
 * the existing SKILL_REGISTRY. This is the primary discovery surface for
 * OpenBrain and other MCP-enabled agent frameworks.
 *
 * Design principle: The SKILL_REGISTRY remains the single source of truth.
 * This file DERIVES MCP schemas from it — no duplication.
 *
 * MCP tool schemas follow the standard:
 *   { name, description, inputSchema: { type: "object", properties, required } }
 *
 * Rules:
 *   R4:  MCP contracts expose tool interfaces, not evaluation logic
 *   R8d: Plain English descriptions, outcome-focused (no Greek in descriptions)
 *   R11: Wrapper invocation patterns only — no embedded keys or prompts
 *   R13: Embedding platforms must comply with R1, R2, R3, R9
 */

import { SKILL_REGISTRY, type SkillContract } from './skill-registry'

// =============================================================================
// TYPES
// =============================================================================

/** MCP-compatible tool schema. */
export type McpToolSchema = {
  /** Tool name — uses the skill ID directly (sage-reason, sage-guard, etc.) */
  name: string

  /** Human-readable description — plain English, outcome-focused (R8d) */
  description: string

  /** JSON Schema for the tool's input parameters */
  inputSchema: {
    type: 'object'
    properties: Record<string, McpPropertySchema>
    required: string[]
  }
}

/** JSON Schema property definition for MCP inputs. */
export type McpPropertySchema = {
  type: string
  description?: string
  enum?: string[]
  default?: unknown
  items?: McpPropertySchema
  properties?: Record<string, McpPropertySchema>
  required?: string[]
  minimum?: number
  maximum?: number
  maxItems?: number
  minItems?: number
}

/** MCP server capabilities declaration. */
export type McpServerCapabilities = {
  name: string
  version: string
  description: string
  tools: McpToolSchema[]
  authentication: {
    type: string
    description: string
  }
  rate_limits: {
    free_tier: string
    paid_tier: string
  }
  compliance: string[]
}

// =============================================================================
// INPUT SCHEMA DEFINITIONS
// =============================================================================

/**
 * Input schemas for each skill type.
 *
 * These define what MCP clients need to send when invoking a sage skill.
 * Derived from existing API endpoint request types.
 */
const INPUT_SCHEMAS: Record<string, McpToolSchema['inputSchema']> = {
  // ── sage-reason (all depths) ──
  'sage-reason': {
    type: 'object',
    properties: {
      input: {
        type: 'string',
        description: 'The action, decision, or situation to evaluate.',
      },
      context: {
        type: 'string',
        description: 'Optional situational context to inform the evaluation.',
      },
      depth: {
        type: 'string',
        enum: ['quick', 'standard', 'deep'],
        default: 'quick',
        description:
          'Analysis depth. quick: 3 mechanisms (~$0.025, ~2s). standard: 5 mechanisms (~$0.041, ~3s). deep: 6 mechanisms with progress tracking (~$0.055, ~4s).',
      },
    },
    required: ['input'],
  },

  // ── sage-guard ──
  'sage-guard': {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        description: 'The action the agent is about to take.',
      },
      context: {
        type: 'string',
        description: 'Optional context about the situation.',
      },
      threshold: {
        type: 'string',
        enum: ['reflexive', 'habitual', 'deliberate', 'principled', 'sage_like'],
        default: 'deliberate',
        description:
          'Minimum reasoning quality level to proceed. The agent will be told to stop if the action falls below this.',
      },
    },
    required: ['action'],
  },

  // ── sage-score ──
  'sage-score': {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        description: 'The action that was taken (past tense).',
      },
      context: {
        type: 'string',
        description: 'The situation in which the action occurred.',
      },
    },
    required: ['action'],
  },

  // ── sage-decide ──
  'sage-decide': {
    type: 'object',
    properties: {
      decision: {
        type: 'string',
        description: 'The decision to be made.',
      },
      options: {
        type: 'array',
        items: { type: 'string', description: 'One possible course of action.' },
        description: 'The available options (2-5 choices).',
        minItems: 2,
        maxItems: 5,
      },
      context: {
        type: 'string',
        description: 'Optional context about the situation.',
      },
    },
    required: ['decision', 'options'],
  },

  // ── sage-iterate ──
  'sage-iterate': {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        description: 'The action or revised action to evaluate.',
      },
      context: {
        type: 'string',
        description: 'The situation context.',
      },
      chain_id: {
        type: 'string',
        description:
          'Existing deliberation chain ID to continue. Omit to start a new chain.',
      },
      agent_id: {
        type: 'string',
        description: 'Agent identifier for tracking deliberation history.',
      },
    },
    required: ['action'],
  },

  // ── sage-classify (NEW — OpenBrain AI Sorter) ──
  'sage-classify': {
    type: 'object',
    properties: {
      input: {
        type: 'string',
        description: 'The raw input to classify.',
      },
      categories: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Category identifier (e.g., table name).' },
            label: { type: 'string', description: 'Human-readable category name.' },
            description: { type: 'string', description: 'What belongs in this category.' },
          },
          required: ['id', 'label', 'description'],
        },
        description:
          'Available categories to route the input to. If omitted, uses default OpenBrain categories (thought, task, person, project, idea, decision).',
      },
      context: {
        type: 'string',
        description: 'Optional context about the user or system state.',
      },
      confidence_threshold: {
        type: 'number',
        minimum: 0,
        maximum: 1,
        default: 0.7,
        description:
          'Confidence threshold (0.0-1.0). Below this, input stays in inbox for human review.',
      },
    },
    required: ['input'],
  },

  // ── sage-prioritise (Enhanced — OpenBrain proactive loops) ──
  'sage-prioritise': {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique item identifier.' },
            description: { type: 'string', description: 'What the item is.' },
            source: { type: 'string', description: 'Source project or category.' },
            urgency_signal: {
              type: 'string',
              description: 'Urgency signal from the source system (e.g., "overdue", "due today").',
            },
          },
          required: ['id', 'description'],
        },
        description: 'Items to prioritise (2-20).',
        minItems: 2,
        maxItems: 20,
      },
      objective: {
        type: 'string',
        description: 'What the prioritisation serves — the overarching goal.',
      },
      stakeholders: {
        type: 'string',
        description: 'Who is affected by these priorities.',
      },
      horizon: {
        type: 'string',
        enum: ['immediate', 'today', 'this_week', 'this_month', 'this_quarter'],
        description: 'Time horizon for the prioritisation.',
      },
      agent_id: {
        type: 'string',
        description: 'Agent or user identifier for tracking.',
      },
    },
    required: ['items'],
  },

  // ── sage-reflect ──
  'sage-reflect': {
    type: 'object',
    properties: {
      actions: {
        type: 'array',
        items: { type: 'string', description: 'An action taken today.' },
        description: 'List of actions taken during the day for reflection.',
      },
      context: {
        type: 'string',
        description: 'Optional context about the day.',
      },
    },
    required: ['actions'],
  },

  // ── sage-audit ──
  'sage-audit': {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: 'The document text to evaluate.',
      },
      title: {
        type: 'string',
        description: 'Document title for the badge.',
      },
      mode: {
        type: 'string',
        enum: ['general', 'policy'],
        default: 'general',
        description:
          'Evaluation mode. "policy" adjusts weights for contracts/TOS and flags specific clauses.',
      },
    },
    required: ['text'],
  },

  // ── sage-converse ──
  'sage-converse': {
    type: 'object',
    properties: {
      messages: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            speaker: { type: 'string', description: 'Participant name or identifier.' },
            text: { type: 'string', description: 'What they said.' },
          },
          required: ['speaker', 'text'],
        },
        description: 'The conversation messages to evaluate.',
      },
    },
    required: ['messages'],
  },

  // ── Fallback for marketplace/context skills ──
  _default: {
    type: 'object',
    properties: {
      input: {
        type: 'string',
        description: 'The input to evaluate.',
      },
      context: {
        type: 'string',
        description: 'Optional context.',
      },
    },
    required: ['input'],
  },
}

// =============================================================================
// SCHEMA GENERATION
// =============================================================================

/**
 * Build the MCP compliance notice appended to every tool description.
 * Covers R1, R2, R3, R9 obligations for embedding platforms (R13).
 */
const MCP_COMPLIANCE_NOTICE =
  'Evaluates reasoning quality only — not therapeutic, clinical, or employment assessment (R1, R2). All output includes disclaimer (R3). Does not predict outcomes (R9).'

/**
 * Generate an MCP tool schema from a skill registry entry.
 *
 * Maps skill IDs to their corresponding input schemas.
 * For skills without a specific input schema, uses the default.
 */
export function skillToMcpTool(skill: SkillContract): McpToolSchema {
  // Normalise skill ID for schema lookup
  // sage-reason-quick, sage-reason-standard, sage-reason-deep all use 'sage-reason'
  const schemaKey = skill.id.startsWith('sage-reason-')
    ? 'sage-reason'
    : skill.id in INPUT_SCHEMAS
      ? skill.id
      : '_default'

  const inputSchema = INPUT_SCHEMAS[schemaKey] || INPUT_SCHEMAS._default

  // For sage-reason variants, fix the depth default
  let finalSchema = inputSchema
  if (skill.id.startsWith('sage-reason-') && skill.depth) {
    finalSchema = {
      ...inputSchema,
      properties: {
        ...inputSchema.properties,
        depth: {
          ...inputSchema.properties.depth,
          default: skill.depth,
        },
      },
    }
  }

  return {
    name: skill.id,
    description: `${skill.outcome} ${MCP_COMPLIANCE_NOTICE}`,
    inputSchema: finalSchema,
  }
}

/**
 * Generate MCP tool schemas for all skills in the registry.
 * This is what GET /api/mcp/tools would return.
 */
export function getAllMcpTools(): McpToolSchema[] {
  return SKILL_REGISTRY.map(skillToMcpTool)
}

/**
 * Generate MCP tool schemas for a specific tier.
 * Useful for exposing only infrastructure or evaluation skills.
 */
export function getMcpToolsByTier(
  tier: 'tier1_infrastructure' | 'tier2_evaluation' | 'tier3_wrapper'
): McpToolSchema[] {
  return SKILL_REGISTRY.filter(s => s.tier === tier).map(skillToMcpTool)
}

/**
 * Get a single MCP tool schema by skill ID.
 */
export function getMcpToolById(skillId: string): McpToolSchema | undefined {
  const skill = SKILL_REGISTRY.find(s => s.id === skillId)
  if (!skill) return undefined
  return skillToMcpTool(skill)
}

/**
 * Generate the OpenBrain-optimised tool set.
 *
 * Returns only the skills most relevant to OpenBrain integration:
 *   - sage-reason (quick, for general evaluation)
 *   - sage-guard (for proactive loop gating)
 *   - sage-classify (for AI Sorter)
 *   - sage-prioritise (for proactive loops)
 *   - sage-decide (for multi-option decisions)
 *   - sage-reflect (for end-of-day review)
 */
export function getOpenBrainToolset(): McpToolSchema[] {
  const openbrainSkillIds = [
    'sage-reason-quick',
    'sage-guard',
    'sage-classify',
    'sage-prioritise',
    'sage-decide',
    'sage-reflect',
  ]

  // sage-classify isn't in the SKILL_REGISTRY yet — build it manually
  const tools = openbrainSkillIds
    .map(id => {
      if (id === 'sage-classify') {
        return {
          name: 'sage-classify',
          description: `Reasoned classification — routes input to a category with reasoning quality assessment and passion flags. Designed for OpenBrain AI Sorter (step 4). ${MCP_COMPLIANCE_NOTICE}`,
          inputSchema: INPUT_SCHEMAS['sage-classify'],
        }
      }
      const skill = SKILL_REGISTRY.find(s => s.id === id)
      if (!skill) return null
      return skillToMcpTool(skill)
    })
    .filter((t): t is McpToolSchema => t !== null)

  return tools
}

// =============================================================================
// MCP SERVER CAPABILITIES
// =============================================================================

/**
 * Generate the full MCP server capabilities declaration.
 * This is what an MCP client reads to discover SageReasoning tools.
 */
export function getMcpServerCapabilities(): McpServerCapabilities {
  return {
    name: 'sage-reasoning',
    version: '3.0.0',
    description:
      'Stoic reasoning evaluation infrastructure. Provides structured philosophical frameworks for assessing reasoning quality of actions, decisions, documents, and conversations. Designed as a composable reasoning layer for AI agents and human users.',
    tools: getAllMcpTools(),
    authentication: {
      type: 'bearer',
      description:
        'Include "Authorization: Bearer sr_live_<key>" header. Get a free key (100 calls/month) at sagereasoning.com.',
    },
    rate_limits: {
      free_tier: '100 calls/month, rate-limited',
      paid_tier: 'Volume-based pricing, no rate limit',
    },
    compliance: [
      'R1: No therapeutic or clinical implications',
      'R2: No employment or HR evaluation',
      'R3: Disclaimer on all evaluative output',
      'R9: Evaluates reasoning quality only — no outcome promises',
      'R13: Embedding platforms must comply with R1, R2, R3, R9',
    ],
  }
}
