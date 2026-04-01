import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'

// =============================================================================
// RATE LIMITING — In-memory IP-based rate limiter
// =============================================================================

interface RateLimitEntry {
  count: number
  resetAt: number
}

// Separate rate limit stores for different endpoint categories
const rateLimitStores = new Map<string, Map<string, RateLimitEntry>>()

function getStore(category: string): Map<string, RateLimitEntry> {
  if (!rateLimitStores.has(category)) {
    rateLimitStores.set(category, new Map())
  }
  return rateLimitStores.get(category)!
}

// Clean up expired entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now()
  for (const store of rateLimitStores.values()) {
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key)
      }
    }
  }
}, 5 * 60 * 1000)

interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number
  /** Time window in seconds */
  windowSeconds: number
  /** Category name (e.g., 'scoring', 'public-agent') */
  category: string
}

/**
 * Check rate limit for a request. Returns null if within limits,
 * or a NextResponse with 429 status if exceeded.
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'

  const store = getStore(config.category)
  const now = Date.now()
  const key = ip

  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + config.windowSeconds * 1000 })
    return null
  }

  entry.count++

  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  return null
}

// Pre-configured rate limit configs
export const RATE_LIMITS = {
  /** Human scoring endpoints — 15 requests per minute */
  scoring: { maxRequests: 15, windowSeconds: 60, category: 'scoring' } as RateLimitConfig,
  /** Public agent endpoints — 30 requests per minute */
  publicAgent: { maxRequests: 30, windowSeconds: 60, category: 'public-agent' } as RateLimitConfig,
  /** Analytics/tracking — 60 requests per minute */
  analytics: { maxRequests: 60, windowSeconds: 60, category: 'analytics' } as RateLimitConfig,
  /** Admin — 30 requests per minute */
  admin: { maxRequests: 30, windowSeconds: 60, category: 'admin' } as RateLimitConfig,
}

// =============================================================================
// AUTHENTICATION — Verify Supabase JWT and extract user
// =============================================================================

/**
 * Verify the user's Supabase session from the Authorization header.
 * Returns the authenticated user or null.
 */
export async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)

  // Create a Supabase client with the user's JWT
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    return null
  }

  return user
}

/**
 * Require authentication. Returns the user if authenticated,
 * or a 401 NextResponse if not.
 */
export async function requireAuth(request: NextRequest): Promise<
  { user: { id: string; email?: string }; error?: never } |
  { user?: never; error: NextResponse }
> {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return {
      error: NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      ),
    }
  }
  return { user }
}

// =============================================================================
// INPUT VALIDATION — Text length limits
// =============================================================================

/**
 * Validate that a text field doesn't exceed the maximum character length.
 * Returns an error message string if invalid, or null if OK.
 */
export function validateTextLength(
  text: string | undefined | null,
  fieldName: string,
  maxChars: number
): string | null {
  if (!text) return null
  if (text.length > maxChars) {
    return `${fieldName} exceeds maximum length of ${maxChars.toLocaleString()} characters (received ${text.length.toLocaleString()})`
  }
  return null
}

// Pre-configured text limits
export const TEXT_LIMITS = {
  /** Short text fields (action descriptions, etc.) */
  short: 2000,
  /** Medium text fields (context, reflections) */
  medium: 5000,
  /** Long text fields (documents, conversations) */
  long: 15000,
  /** Very long (full document scoring) */
  document: 30000,
}

// =============================================================================
// CORS — Configured CORS headers
// =============================================================================

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://sagereasoning.com'

/** CORS headers for authenticated/human-facing endpoints (own domain only) */
export function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

/** CORS headers for public agent endpoints (open to all) */
export function publicCorsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

/** Standard CORS preflight response for authenticated endpoints */
export function corsPreflightResponse(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  })
}

/** Standard CORS preflight response for public agent endpoints */
export function publicCorsPreflightResponse(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: publicCorsHeaders(),
  })
}

// =============================================================================
// API KEY VALIDATION — Cost protection and tier enforcement
// Bridges to Stripe; no payment processing here, just usage gating.
//
// FREE TIER (evaluation and integration):
//   monthly_limit: 100 calls  (enough to build and test a real integration)
//   daily_limit:   none       (no daily cap — rate limiting handles burst protection)
//   max_chain_iterations: 1   (see the score + feedback, can't iterate without paying)
//   baseline retakes: 1/month per agent_id (aligned with human baseline policy)
//
// NOTE: Sage skill wrappers consume 2-3 API calls per invocation (guard + score
// + optional iterate). A developer using wrapped skills will consume their
// monthly allowance faster. Pre-limit (80/100) and at-limit (100/100)
// recommendation triggers are implemented in API response metadata.
//
// PAID TIER (production access — 200% of Anthropic API cost per call):
//   monthly_limit: configurable per key (default 10,000)
//   daily_limit:   configurable per key (default 500)
//   max_chain_iterations: 3   (covers most real-world improvement curves)
//
// Key format:  sr_live_<32 hex chars>
// Stored as:   SHA-256(key) in api_keys.key_hash
// Sent as:     Authorization: Bearer sr_live_... OR X-Api-Key: sr_live_...
// =============================================================================

/** Valid endpoints that require API key gating */
export type GatedEndpoint = 'guardrail' | 'score_iterate' | 'agent_baseline' | 'other'

export type ApiKeyValidationResult = {
  valid: true
  api_key_id: string
  label: string
  tier: 'free' | 'paid'
  monthly_remaining: number
  daily_remaining: number
  max_chain_iterations: number
  monthly_calls_after: number
  daily_calls_after: number
} | {
  valid: false
  error: NextResponse
}

function hashKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex')
}

function extractRawKey(request: NextRequest): string | null {
  // Accept: Authorization: Bearer sr_live_... OR X-Api-Key: sr_live_...
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer sr_live_')) {
    return authHeader.slice(7).trim()
  }
  const apiKeyHeader = request.headers.get('x-api-key')
  if (apiKeyHeader?.startsWith('sr_live_')) {
    return apiKeyHeader.trim()
  }
  return null
}

/**
 * Validate an API key and atomically increment its usage counter.
 * Returns valid=false with a ready-to-send NextResponse on any failure.
 * Returns valid=true with usage info on success.
 *
 * IMPORTANT: Call this BEFORE making any Claude API call.
 * The counter is incremented on every call to this function —
 * don't call it speculatively.
 */
export async function validateApiKey(
  request: NextRequest,
  endpoint: GatedEndpoint
): Promise<ApiKeyValidationResult> {
  const rawKey = extractRawKey(request)

  if (!rawKey) {
    return {
      valid: false,
      error: NextResponse.json(
        {
          error: 'API key required',
          message: 'Public agent endpoints require an API key. Pass it as: Authorization: Bearer sr_live_<key> or X-Api-Key: sr_live_<key>',
          docs: 'https://www.sagereasoning.com/api-docs',
          get_key: 'Contact zeus@sagereasoning.com to request a free API key during beta.',
        },
        { status: 401, headers: publicCorsHeaders() }
      ),
    }
  }

  const keyHash = hashKey(rawKey)

  // Use service role to bypass RLS
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch the key record
  const { data: keyRecord, error: keyErr } = await admin
    .from('api_keys')
    .select('id, label, tier, is_active, suspended_reason, monthly_limit, daily_limit, max_chain_iterations')
    .eq('key_hash', keyHash)
    .single()

  if (keyErr || !keyRecord) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Invalid API key', message: 'The provided API key was not recognised.' },
        { status: 401, headers: publicCorsHeaders() }
      ),
    }
  }

  if (!keyRecord.is_active) {
    return {
      valid: false,
      error: NextResponse.json(
        {
          error: 'API key suspended',
          message: keyRecord.suspended_reason || 'This API key has been suspended. Contact zeus@sagereasoning.com.',
        },
        { status: 403, headers: publicCorsHeaders() }
      ),
    }
  }

  // Atomically increment usage and get new totals
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth() + 1
  const day = now.getUTCDate()

  const { data: usageRows, error: usageErr } = await admin.rpc('increment_api_usage', {
    p_api_key_id: keyRecord.id,
    p_year: year,
    p_month: month,
    p_day: day,
    p_endpoint: endpoint,
  })

  if (usageErr || !usageRows || usageRows.length === 0) {
    console.error('Usage increment error:', usageErr)
    // Fail open with a warning rather than blocking valid keys due to DB issues
    // Log it — this should be investigated
    return {
      valid: true,
      api_key_id: keyRecord.id,
      label: keyRecord.label,
      tier: keyRecord.tier,
      monthly_remaining: keyRecord.monthly_limit,
      daily_remaining: keyRecord.daily_limit,
      max_chain_iterations: keyRecord.max_chain_iterations,
      monthly_calls_after: 0,
      daily_calls_after: 0,
    }
  }

  const { new_monthly_total, new_daily_total, monthly_limit, daily_limit } = usageRows[0]

  // Check monthly cap (enforcement cap already includes 50% contingency)
  if (new_monthly_total > monthly_limit) {
    return {
      valid: false,
      error: NextResponse.json(
        {
          error: 'Monthly quota exceeded',
          message: `This API key has reached its monthly limit of ${monthly_limit} calls. Resets on the 1st of next month.`,
          monthly_calls: new_monthly_total,
          monthly_limit,
          upgrade: 'Contact zeus@sagereasoning.com to upgrade your API key for unlimited calls.',
        },
        { status: 429, headers: publicCorsHeaders() }
      ),
    }
  }

  // Check daily burst cap
  if (new_daily_total > daily_limit) {
    return {
      valid: false,
      error: NextResponse.json(
        {
          error: 'Daily limit exceeded',
          message: `This API key has reached its daily limit of ${daily_limit} calls. Resets at midnight UTC.`,
          daily_calls: new_daily_total,
          daily_limit,
        },
        { status: 429, headers: publicCorsHeaders() }
      ),
    }
  }

  return {
    valid: true,
    api_key_id: keyRecord.id,
    label: keyRecord.label,
    tier: keyRecord.tier,
    monthly_remaining: monthly_limit - new_monthly_total,
    daily_remaining: daily_limit - new_daily_total,
    max_chain_iterations: keyRecord.max_chain_iterations,
    monthly_calls_after: new_monthly_total,
    daily_calls_after: new_daily_total,
  }
}

/** Add usage headers to a response for agent transparency */
export function withUsageHeaders(
  headers: Record<string, string>,
  usage: Extract<ApiKeyValidationResult, { valid: true }>
): Record<string, string> {
  return {
    ...headers,
    'X-RateLimit-Monthly-Remaining': String(usage.monthly_remaining),
    'X-RateLimit-Daily-Remaining': String(usage.daily_remaining),
    'X-RateLimit-Monthly-Used': String(usage.monthly_calls_after),
  }
}
