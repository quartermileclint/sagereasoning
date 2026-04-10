/**
 * project-context.ts — Project state context builder (Layer 3).
 *
 * Hybrid approach (Option C):
 *   - Static baseline from project-context.json: identity, mission, ethical commitments
 *   - Dynamic state from Supabase project_context table: current phase, recent decisions, active tensions
 *   - Falls back to static defaults when Supabase table doesn't exist yet
 *
 * Three context levels for different endpoint groups:
 *   - 'full':      Identity + mission + phase + all decisions + tensions + ethics (for Sage Ops — P7)
 *   - 'summary':   Identity + phase + recent decisions + founder role (for Mentor endpoints)
 *   - 'condensed': Phase + recent decisions only (for Operational endpoints)
 *   - 'minimal':   Identity + ethical commitments only (for Human-facing tools)
 *
 * Token budget: 400-600 tokens depending on level.
 *
 * Cache: 1-hour TTL on Supabase reads. Static baseline is imported at build time (zero runtime cost).
 */

import projectContextData from '@/data/project-context.json'

import { supabaseAdmin } from '@/lib/supabase-server'

// =============================================================================
// TYPES
// =============================================================================

export type ProjectContextLevel = 'full' | 'summary' | 'condensed' | 'minimal'

interface ProjectBaseline {
  identity: string
  mission: string
  founder: string
  ethical_commitments: Record<string, string>
}

interface ProjectDynamic {
  current_phase: string
  active_tensions: string[]
  recent_decisions: string[]
}

// =============================================================================
// CACHE — 1-hour TTL for Supabase reads
// =============================================================================

let _dynamicCache: ProjectDynamic | null = null
let _dynamicCacheTime = 0
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

// =============================================================================
// STATIC BASELINE — imported at build time
// =============================================================================

const baseline: ProjectBaseline = projectContextData.baseline
const dynamicDefaults: ProjectDynamic = projectContextData.dynamic_defaults

// =============================================================================
// DYNAMIC STATE LOADER — Supabase (when available)
// =============================================================================

/**
 * Load dynamic project state from Supabase.
 * Falls back to static defaults if table doesn't exist or query fails.
 */
async function loadDynamicState(): Promise<ProjectDynamic> {
  // Check cache
  if (_dynamicCache && Date.now() - _dynamicCacheTime < CACHE_TTL_MS) {
    return _dynamicCache
  }

  // Read dynamic state from Supabase (falls back to static defaults on failure)
  try {
    const { data, error } = await supabaseAdmin
      .from('project_context')
      .select('current_phase, active_tensions, recent_decisions')
      .single()

    if (!error && data) {
      _dynamicCache = {
        current_phase: data.current_phase,
        active_tensions: data.active_tensions || [],
        recent_decisions: data.recent_decisions || [],
      }
      _dynamicCacheTime = Date.now()
      return _dynamicCache
    }
  } catch {
    // Fall through to defaults
  }

  // Fallback to static defaults
  _dynamicCache = dynamicDefaults
  _dynamicCacheTime = Date.now()
  return _dynamicCache
}

// =============================================================================
// CONTEXT BUILDERS — One per level
// =============================================================================

/**
 * Full project context — for Sage Ops (P7).
 * Includes everything: identity, mission, phase, all decisions, tensions, ethics.
 */
function buildFullContext(dynamic: ProjectDynamic): string {
  const ethics = Object.entries(baseline.ethical_commitments)
    .map(([key, val]) => `  ${key}: ${val}`)
    .join('\n')

  return `PROJECT CONTEXT — SAGEREASONING (full):
Identity: ${baseline.identity}
Mission: ${baseline.mission}
Founder: ${baseline.founder}

Current Phase: ${dynamic.current_phase}

Active Tensions:
${dynamic.active_tensions.map(t => `  - ${t}`).join('\n')}

Recent Decisions:
${dynamic.recent_decisions.map(d => `  - ${d}`).join('\n')}

Ethical Commitments:
${ethics}`
}

/**
 * Summary project context — for Mentor endpoints.
 * Identity + phase + recent decisions + founder role.
 */
function buildSummaryContext(dynamic: ProjectDynamic): string {
  const recentDecisions = dynamic.recent_decisions.slice(0, 3)

  return `PROJECT CONTEXT (summary):
${baseline.identity}
Founder: ${baseline.founder}
Phase: ${dynamic.current_phase}
Recent: ${recentDecisions.join('; ')}`
}

/**
 * Condensed project context — for Operational endpoints.
 * Phase + recent decisions only.
 */
function buildCondensedContext(dynamic: ProjectDynamic): string {
  const recentDecisions = dynamic.recent_decisions.slice(0, 2)

  return `PROJECT CONTEXT: ${dynamic.current_phase}
Recent decisions: ${recentDecisions.join('; ')}`
}

/**
 * Minimal project context — for Human-facing tools.
 * Identity + ethical commitments only.
 */
function buildMinimalContext(): string {
  return `PROJECT CONTEXT (minimal):
${baseline.identity}
Ethical commitments: ${Object.values(baseline.ethical_commitments).join(' ')}`
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Get project context at the specified level.
 *
 * @param level - 'full' | 'summary' | 'condensed' | 'minimal'
 * @returns Formatted context string ready for LLM injection
 */
export async function getProjectContext(level: ProjectContextLevel): Promise<string> {
  if (level === 'minimal') {
    // Minimal uses only static data — no Supabase read needed
    return buildMinimalContext()
  }

  const dynamic = await loadDynamicState()

  switch (level) {
    case 'full':
      return buildFullContext(dynamic)
    case 'summary':
      return buildSummaryContext(dynamic)
    case 'condensed':
      return buildCondensedContext(dynamic)
    default:
      return buildMinimalContext()
  }
}

/**
 * Synchronous minimal context — for endpoints that can't await.
 * Returns only static baseline data.
 */
export function getProjectContextSync(level: 'minimal'): string {
  return buildMinimalContext()
}
