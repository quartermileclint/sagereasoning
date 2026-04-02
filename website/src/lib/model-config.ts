/**
 * model-config.ts — Centralized AI model selection and response caching.
 *
 * Tiered model strategy:
 *   Haiku (fast):  evaluate, score, reason (quick/standard), score-social,
 *                  score-decision, score-scenario
 *   Sonnet (deep): reason (deep), score-iterate, score-document
 *
 * Cache strategy:
 *   LRU in-memory cache keyed by SHA-256 hash of (endpoint + input).
 *   Identical inputs return cached results instantly (0ms latency).
 *   TTL: 1 hour. Max entries: 500.
 */

import { createHash } from 'crypto'

// =============================================================================
// MODEL CONSTANTS
// =============================================================================

/** Fast model for lighter-weight evaluations */
export const MODEL_FAST = 'claude-haiku-4-5-20251001'

/** Deep model for nuanced philosophical analysis */
export const MODEL_DEEP = 'claude-sonnet-4-6'

// =============================================================================
// LRU CACHE
// =============================================================================

interface CacheEntry {
  result: unknown
  timestamp: number
}

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour
const CACHE_MAX_ENTRIES = 500

const cache = new Map<string, CacheEntry>()

/**
 * Generate a cache key from endpoint + input data.
 * Uses SHA-256 to avoid key-length issues with large inputs.
 */
export function cacheKey(endpoint: string, input: Record<string, unknown>): string {
  const raw = JSON.stringify({ endpoint, ...input })
  return createHash('sha256').update(raw).digest('hex')
}

/**
 * Look up a cached result. Returns undefined on miss or expired entry.
 */
export function cacheGet(key: string): unknown | undefined {
  const entry = cache.get(key)
  if (!entry) return undefined

  // Expired?
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key)
    return undefined
  }

  return entry.result
}

/**
 * Store a result in the cache. Evicts oldest entry if at capacity.
 */
export function cacheSet(key: string, result: unknown): void {
  // Evict oldest if at capacity
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value
    if (oldestKey) cache.delete(oldestKey)
  }

  cache.set(key, { result, timestamp: Date.now() })
}

/**
 * Get current cache stats (for debugging / health checks).
 */
export function cacheStats(): { size: number; maxSize: number; ttlMs: number } {
  return { size: cache.size, maxSize: CACHE_MAX_ENTRIES, ttlMs: CACHE_TTL_MS }
}
