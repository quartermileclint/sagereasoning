/**
 * environmental-context.ts — Layer 4: Environmental awareness context.
 *
 * Non-doctrinal background information about each agent domain's external
 * environment. Updated weekly by a scheduled scan task. Does NOT modify
 * brain expertise, Stoic principles, or project commitments.
 *
 * Design principles:
 *   1. Clearly labelled as background info, not doctrine
 *   2. Per-domain: each agent brain gets its own environmental feed
 *   3. Static defaults until first scan runs; Supabase path ready
 *   4. Returns null when no meaningful content exists (pre-first-scan)
 *
 * Storage strategy:
 *   - Static baseline: environmental-context.json (scan topics + defaults)
 *   - Dynamic updates: Supabase environmental_context table (weekly scan output)
 *   - Falls back to static defaults when Supabase unavailable
 *
 * Token budget: ~300-500 tokens per domain summary.
 */

import envContextData from '@/data/environmental-context.json'

import { supabaseAdmin } from '@/lib/supabase-server'

// =============================================================================
// TYPES
// =============================================================================

export type EnvironmentalDomain = 'ops' | 'tech' | 'growth' | 'support'

interface DomainEnvironment {
  label: string
  scan_topics: string[]
  current_summary: string
  last_scanned: string | null
}

// =============================================================================
// CACHE — 1-hour TTL (aligns with project-context cache)
// =============================================================================

const _cache: Map<EnvironmentalDomain, { summary: string; time: number }> = new Map()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

// =============================================================================
// STATIC BASELINE — imported at build time
// =============================================================================

const preamble: string = envContextData.preamble
const staticDomains: Record<string, DomainEnvironment> = envContextData.domains

// =============================================================================
// DYNAMIC LOADER — Supabase (when available)
// =============================================================================

/**
 * Load environmental context for a domain from Supabase.
 * Falls back to static defaults if table doesn't exist or query fails.
 */
async function loadDomainEnvironment(domain: EnvironmentalDomain): Promise<DomainEnvironment> {
  // Check cache
  const cached = _cache.get(domain)
  if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
    return { ...staticDomains[domain], current_summary: cached.summary }
  }

  // Read from Supabase (falls back to static defaults on failure)
  try {
    const { data, error } = await supabaseAdmin
      .from('environmental_context')
      .select('domain, current_summary, last_scanned')
      .eq('domain', domain)
      .single()

    if (!error && data && data.current_summary) {
      _cache.set(domain, { summary: data.current_summary, time: Date.now() })
      return {
        ...staticDomains[domain],
        current_summary: data.current_summary,
        last_scanned: data.last_scanned,
      }
    }
  } catch {
    // Fall through to defaults
  }

  // Fallback to static defaults
  return staticDomains[domain] || null
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Get environmental context for a specific agent domain.
 *
 * Returns null if no meaningful scan data exists yet (pre-first-scan).
 * This prevents injecting useless "no scan has been run" text into prompts.
 *
 * @param domain - 'ops' | 'tech' | 'growth' | 'support'
 * @returns Formatted context string or null if no scan data available
 */
export async function getEnvironmentalContext(domain: EnvironmentalDomain): Promise<string | null> {
  const env = await loadDomainEnvironment(domain)
  if (!env) return null

  // Don't inject context if no scan has ever run
  if (!env.last_scanned) return null

  const scannedDate = env.last_scanned
    ? `Last updated: ${env.last_scanned}`
    : 'Awaiting first scan'

  return `ENVIRONMENTAL CONTEXT — ${env.label}
${preamble}

${env.current_summary}

${scannedDate}`
}

/**
 * Get environmental context for multiple domains at once.
 * Useful for endpoints that serve cross-domain operational tasks.
 *
 * @param domains - Array of domain IDs
 * @returns Combined formatted context string or null if no scan data
 */
export async function getEnvironmentalContextMulti(
  domains: EnvironmentalDomain[]
): Promise<string | null> {
  const sections = await Promise.all(
    domains.map(d => getEnvironmentalContext(d))
  )

  const validSections = sections.filter(Boolean) as string[]
  if (validSections.length === 0) return null

  return validSections.join('\n\n---\n\n')
}

/**
 * Get the scan topics for a domain (used by the scheduled scan task).
 *
 * @param domain - 'ops' | 'tech' | 'growth' | 'support'
 * @returns Array of scan topic strings
 */
export function getScanTopics(domain: EnvironmentalDomain): string[] {
  const env = staticDomains[domain]
  return env ? env.scan_topics : []
}

/**
 * Get all domain IDs (used by the scheduled scan task to iterate).
 */
export function getAllEnvironmentalDomains(): EnvironmentalDomain[] {
  return ['ops', 'tech', 'growth', 'support']
}
