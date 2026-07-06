/**
 * @compliance
 * compliance_version: CR-2026-Q2-v1
 * last_regulatory_review: 2026-04-04
 * applicable_jurisdictions: [AU, EU, US]
 * regulatory_references: [CR-001, CR-004, CR-005, CR-009, CR-012]
 * review_cycle: quarterly
 * owner: founder
 * next_review_due: 2026-07-06
 * change_trigger: [EU AI Act classification guidance, GDPR amendment, AU Privacy Act reform]
 * deprecation_flag: false
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash, randomBytes } from 'node:crypto'
import {
  isUpcCapabilityAuthEnabled,
  validatePracticeCredential,
  UNIFIED_PRACTICE_CREDENTIAL_PREFIX,
  type PracticeCapability,
} from '@/lib/practice-credential'

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
  /** Data-rights endpoints (GDPR Art 15 access / Art 16 rectification) — 5 requests per hour.
   *  Deliberately tight: these are infrequent, sensitive, self-service operations. */
  dataRights: { maxRequests: 5, windowSeconds: 3600, category: 'data-rights' } as RateLimitConfig,
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

/**
 * CORS headers for public agent endpoints.
 *
 * These endpoints are API-key gated, so open CORS is acceptable —
 * but we restrict to specific known origins where possible, and
 * include the API key header in allowed headers.
 *
 * Agents calling from server-side (no browser) are unaffected by CORS.
 * Browser-based integrators must be on an allowed origin.
 */
export function publicCorsHeaders(): Record<string, string> {
  const allowedOrigins = [
    'https://sagereasoning.com',
    'https://www.sagereasoning.com',
    process.env.NEXT_PUBLIC_SITE_URL,
  ].filter(Boolean) as string[]

  return {
    'Access-Control-Allow-Origin': allowedOrigins.join(', ') || 'https://sagereasoning.com',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key',
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
// FREE TIER (evaluation and integration — adopted CI-6 defaults 30/1/1,
// single source of truth: API_KEY_FREE_TIER_DEFAULTS in lib/api-key-defaults.ts;
// 2026-07-07: the self-service /api/keys mint folded onto the same constant):
//   monthly_limit: 30 calls   (enough to evaluate a real integration)
//   daily_limit:   1          (one call per day; rate limiting still guards burst)
//   max_chain_iterations: 1   (see the score + feedback, can't iterate without paying)
//   baseline retakes: 1/month per agent_id (aligned with human baseline policy)
//
// NOTE: Sage skill wrappers consume 2-3 API calls per invocation (guard + score
// + optional iterate). A developer using wrapped skills will consume their
// monthly allowance faster. Pre-limit and at-limit
// recommendation triggers are implemented in API response metadata.
//
// PAID TIER (production access — competitor-anchored per-call pricing):
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
  /**
   * CI-14: the credential's effective capability set, populated ONLY on the UPC
   * flag-on path (validateApiKeyUpc). Undefined on the legacy flag-off path
   * (which has no capability concept) — callers must treat undefined as "capability
   * model not in effect" and fall back to their pre-UPC gating. Lets a surface that
   * needs a finer capability than 'consult' (e.g. the l1_supply layer1_schema-supply
   * path on /api/reason) enforce it without a second DB read.
   */
  capabilities?: PracticeCapability[]
} | {
  valid: false
  error: NextResponse
}

function hashKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex')
}

function extractRawKey(request: NextRequest): string | null {
  // Accept: Authorization: Bearer sr_live_... OR X-Api-Key: sr_live_...
  // When the UPC flag is ON, ALSO accept the unified sr_prac_ prefix on the same
  // two transports (consult/l1_supply are not Authorization-only — constraint 7).
  // The flag-off branches below are byte-identical to the pre-UPC behaviour.
  const upc = isUpcCapabilityAuthEnabled()
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer sr_live_')) {
    return authHeader.slice(7).trim()
  }
  if (upc && authHeader?.startsWith(`Bearer ${UNIFIED_PRACTICE_CREDENTIAL_PREFIX}`)) {
    return authHeader.slice(7).trim()
  }
  const apiKeyHeader = request.headers.get('x-api-key')
  if (apiKeyHeader?.startsWith('sr_live_')) {
    return apiKeyHeader.trim()
  }
  if (upc && apiKeyHeader?.startsWith(UNIFIED_PRACTICE_CREDENTIAL_PREFIX)) {
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

  // UPC capability-aware path (flag ON): delegate the credential AUTH decision to
  // the single chokepoint (asserts 'consult' — the ecosystem umbrella capability
  // every consult/score/baseline/guardrail surface shares), then run the SAME
  // quota/usage metering. Flag OFF falls through to the exact byte-identical
  // legacy body below.
  if (isUpcCapabilityAuthEnabled()) {
    return validateApiKeyUpc(rawKey, endpoint)
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
    console.error('Usage increment error:', usageErr?.code || 'unknown')
    // Fail SECURE — deny access when rate-limit tracking is unavailable.
    // This prevents unlimited API calls during database outages.
    return {
      valid: false,
      error: NextResponse.json(
        {
          error: 'Service temporarily unavailable',
          message: 'Rate limit system offline. Please retry shortly.',
        },
        { status: 503, headers: publicCorsHeaders() }
      ),
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

/**
 * UPC capability-aware variant of validateApiKey (flag ON only — reached from the
 * branch in validateApiKey). Delegates the credential AUTH decision to the
 * validatePracticeCredential chokepoint requiring the 'consult' capability, then
 * performs the IDENTICAL quota/usage metering and returns the IDENTICAL
 * ApiKeyValidationResult shape. Preserves the suspended_reason UX affordance (403)
 * and adds a 403 insufficient_capability for a credential that authenticates but
 * lacks 'consult'. Not exported — the only caller is validateApiKey.
 */
async function validateApiKeyUpc(
  rawKey: string,
  endpoint: GatedEndpoint,
): Promise<ApiKeyValidationResult> {
  const core = await validatePracticeCredential(rawKey, 'consult')
  if (!core.valid) {
    if (core.reason === 'suspended') {
      return {
        valid: false,
        error: NextResponse.json(
          {
            error: 'API key suspended',
            message:
              core.suspendedReason ||
              'This API key has been suspended. Contact zeus@sagereasoning.com.',
          },
          { status: 403, headers: publicCorsHeaders() },
        ),
      }
    }
    if (core.reason === 'insufficient_capability') {
      return {
        valid: false,
        error: NextResponse.json(
          {
            error: 'Insufficient capability',
            message:
              'This credential does not grant the consult capability required by this endpoint.',
          },
          { status: 403, headers: publicCorsHeaders() },
        ),
      }
    }
    // invalid_token (unknown key / query error) → 401. wrong_agent cannot occur
    // here (no agent_id binding is supplied for the consult capability). wrong_scope
    // does not arise on real data either — no consult-capable mint path sets the
    // scope_* columns — but were a row to carry one, evaluatePracticeCredentialRow
    // would return wrong_scope, which falls through to this same 401 (fail-closed).
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Invalid API key', message: 'The provided API key was not recognised.' },
        { status: 401, headers: publicCorsHeaders() },
      ),
    }
  }

  const row = core.row

  // Atomically increment usage and get new totals (identical to the legacy path).
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth() + 1
  const day = now.getUTCDate()

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: usageRows, error: usageErr } = await admin.rpc('increment_api_usage', {
    p_api_key_id: row.id,
    p_year: year,
    p_month: month,
    p_day: day,
    p_endpoint: endpoint,
  })

  if (usageErr || !usageRows || usageRows.length === 0) {
    console.error('Usage increment error:', usageErr?.code || 'unknown')
    // Fail SECURE — deny access when rate-limit tracking is unavailable.
    return {
      valid: false,
      error: NextResponse.json(
        {
          error: 'Service temporarily unavailable',
          message: 'Rate limit system offline. Please retry shortly.',
        },
        { status: 503, headers: publicCorsHeaders() },
      ),
    }
  }

  const { new_monthly_total, new_daily_total, monthly_limit, daily_limit } = usageRows[0]

  if (new_monthly_total > monthly_limit) {
    return {
      valid: false,
      error: NextResponse.json(
        {
          error: 'Monthly quota exceeded',
          message: `This API key has reached its monthly limit of ${monthly_limit} calls. Resets on the 1st of next month.`,
          monthly_calls: new_monthly_total,
          monthly_limit,
          upgrade:
            'Contact zeus@sagereasoning.com to upgrade your API key for unlimited calls.',
        },
        { status: 429, headers: publicCorsHeaders() },
      ),
    }
  }

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
        { status: 429, headers: publicCorsHeaders() },
      ),
    }
  }

  return {
    valid: true,
    api_key_id: row.id,
    label: row.label ?? '',
    tier: row.tier ?? 'free',
    monthly_remaining: monthly_limit - new_monthly_total,
    daily_remaining: daily_limit - new_daily_total,
    max_chain_iterations: row.max_chain_iterations ?? 1,
    monthly_calls_after: new_monthly_total,
    daily_calls_after: new_daily_total,
    // CI-14: surface the effective capability set so finer-grained surfaces (e.g.
    // the l1_supply layer1_schema-supply path) can enforce without a second read.
    capabilities: core.capabilities,
  }
}

// =============================================================================
// STRIPE SUBSCRIPTION CHECK — Verify paid tier status via Stripe
// Used by admin dashboards and billing status endpoints.
// The primary tier enforcement is via api_keys.tier (set by webhook).
// This function is for secondary verification when needed.
// =============================================================================

/**
 * Check if a user has an active paid subscription in Stripe.
 * Returns the subscription status or null if no subscription found.
 *
 * NOTE: For normal API key validation, use validateApiKey() above.
 * This function is for billing UI and admin checks, not request gating.
 */
export async function checkStripeSubscriptionStatus(
  userId: string
): Promise<{ active: boolean; status: string; type: string } | null> {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Look up user's Stripe customer link
  const { data: customerLink } = await admin
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (!customerLink?.stripe_customer_id) return null

  // Check for active subscriptions
  const { data: subscriptions } = await admin
    .from('stripe_subscriptions')
    .select('status, subscription_type')
    .eq('stripe_customer_id', customerLink.stripe_customer_id)
    .in('status', ['active', 'trialing', 'past_due'])
    .limit(1)

  if (!subscriptions || subscriptions.length === 0) {
    return { active: false, status: 'none', type: 'none' }
  }

  const sub = subscriptions[0]
  return {
    active: sub.status === 'active' || sub.status === 'trialing',
    status: sub.status,
    type: sub.subscription_type,
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

// =============================================================================
// A10 — PER-AGENT WRITE CREDENTIALS (Sage Assent write surface)
// Implements Decisions A + B + D + E + F + H + 3a of /adopted/sage-assent-a10-design.md
// (Adopted under D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17; built
// D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21).
//
// A10 credentials gate writes to POST /api/accreditation/[agent_id]. They reuse
// the production-tested opaque-token + SHA-256 + DB-lookup pattern that
// validateApiKey above uses for sr_live_ ecosystem keys, but with a distinct
// sr_assent_ prefix and a separate verification path (filtered by purpose).
//
// Token format (Decision A): opaque random token, server-side lookup. No claims
// carried in the token; the api_keys row carries them. Tokens are sent as
// `Authorization: Bearer sr_assent_<key>` only (NOT X-Api-Key — narrows the attack
// surface and keeps A10 distinct from the sr_live_ ecosystem keys).
//
// Expiry (Decision G): A10 credentials have NO expiry. Renewal is
// revoke-and-reissue via the admin endpoint. Verification does not check expiry.
//
// Kill-switch (Decision I): the SUBSTRATE_WRITE_PATH_ENABLED env flag is checked
// in the route's verifyAgentIdOwnership BEFORE this function — if unset, all
// writes are blocked globally regardless of credential validity.
// =============================================================================

/** The fixed namespace prefix for A10 write tokens (distinct from sr_live_). */
export const SAGE_ASSENT_WRITE_TOKEN_PREFIX = 'sr_assent_'

/**
 * Discriminated result of validateSageAssentWriteToken.
 *
 * On success: the bound credential identifiers + an echo of the credential's
 * scope columns (may be null) so the caller can log them for forensic auditing.
 * On failure: the specific reason. The ROUTE collapses every failure to a single
 * 401 to the caller (no information leak); the audit log (Decision H) captures
 * the specific reason.
 */
export type SageAssentWriteValidationResult =
  | {
      valid: true
      credential_id: string
      owner_user_id: string
      agent_id: string
      scope_downstream_identity_model: string | null
      scope_path_posture: string | null
    }
  | {
      valid: false
      reason:
        | 'no_token' // missing Authorization header or wrong (non-sr_assent_) prefix
        | 'invalid_token' // hash lookup returned no active sage_assent_write row (unknown OR revoked)
        | 'wrong_agent' // credential is active but binds a different agent_id
        | 'wrong_scope' // agent_id matches but the supplied CarriedProfile doesn't match the credential's non-null scope columns
    }

/**
 * Generate a new A10 write credential. Returns the raw token (shown to the
 * caller exactly once) and its SHA-256 hash (stored in api_keys.key_hash).
 *
 * Shape: sr_assent_<32 hex chars>. Mirrors generateApiKey's sr_live_ pattern.
 */
export function generateSageAssentWriteToken(): { raw: string; hash: string } {
  const raw = `${SAGE_ASSENT_WRITE_TOKEN_PREFIX}${randomBytes(16).toString('hex')}`
  const hash = createHash('sha256').update(raw).digest('hex')
  return { raw, hash }
}

/** The minimal api_keys row shape the A10 verification path selects + reasons over. */
export interface SageAssentCredentialRow {
  id: string
  agent_id: string
  owner_user_id: string
  scope_downstream_identity_model: string | null
  scope_path_posture: string | null
}

/**
 * PURE decision: given the looked-up active sage_assent_write row (or null), the target
 * agent_id, and the supplied CarriedProfile subset, decide the validation
 * result. No I/O — the unit-testable core of validateSageAssentWriteToken (factored
 * per PR2; mirrors how this route group factors pure logic into testable units).
 *
 * - null row (unknown token OR revoked — the lookup filters is_active=true, so
 *   the two collapse here, by design) → 'invalid_token'.
 * - agent mismatch → 'wrong_agent' (a distinct attack profile).
 * - scope check (Decision 3a): permissive when the credential's scope column is
 *   NULL; strict + fail-closed ('wrong_scope') when set (the supplied value must
 *   match exactly; a missing supplied value against a scoped credential fails).
 */
export function evaluateSageAssentWriteRow(
  row: SageAssentCredentialRow | null,
  agent_id: string,
  carriedProfile?: { downstream_identity_model?: string; path_posture?: string },
): SageAssentWriteValidationResult {
  if (!row) {
    return { valid: false, reason: 'invalid_token' }
  }
  if (row.agent_id !== agent_id) {
    return { valid: false, reason: 'wrong_agent' }
  }
  if (
    row.scope_downstream_identity_model !== null &&
    carriedProfile?.downstream_identity_model !== row.scope_downstream_identity_model
  ) {
    return { valid: false, reason: 'wrong_scope' }
  }
  if (
    row.scope_path_posture !== null &&
    carriedProfile?.path_posture !== row.scope_path_posture
  ) {
    return { valid: false, reason: 'wrong_scope' }
  }
  return {
    valid: true,
    credential_id: row.id,
    owner_user_id: row.owner_user_id,
    agent_id: row.agent_id,
    scope_downstream_identity_model: row.scope_downstream_identity_model,
    scope_path_posture: row.scope_path_posture,
  }
}

/**
 * Validate an A10 write token against a target agent_id and (optionally) a
 * supplied CarriedProfile for per-credential scope enforcement (Decision E).
 *
 * Prefix-rejects non-sr_assent_ tokens ('no_token'); otherwise hashes, looks up the
 * ACTIVE sage_assent_write row, and delegates the decision to evaluateSageAssentWriteRow.
 *
 * KG1 rule 2: the Supabase read is awaited; a query error is treated as
 * 'invalid_token' (fail closed), not swallowed-and-allowed.
 */
export async function validateSageAssentWriteToken(
  rawToken: string,
  agent_id: string,
  carriedProfile?: {
    downstream_identity_model?: string
    path_posture?: string
  },
  // UPC (flag ON): the capability this surface requires. Defaults to
  // 'accreditation_write' (the accreditation write boundary). Sage Calling passes
  // 'calling'; Sage Reflect passes 'reflect'. IGNORED when the flag is OFF, so an
  // existing caller that omits it is byte-identical.
  requiredCapability: PracticeCapability = 'accreditation_write',
): Promise<SageAssentWriteValidationResult> {
  if (!isUpcCapabilityAuthEnabled()) {
    // ===== FLAG OFF — exact byte-identical legacy body (requiredCapability ignored) =====
    // Prefix check — wrong prefix is treated as no token (no DB hit).
    if (!rawToken.startsWith(SAGE_ASSENT_WRITE_TOKEN_PREFIX)) {
      return { valid: false, reason: 'no_token' }
    }

    // Hash the presented token (same algorithm as the sr_live_ path).
    const keyHash = createHash('sha256').update(rawToken).digest('hex')

    // Look up the active sage_assent_write row by hash (service role, bypasses RLS).
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data: row, error } = await admin
      .from('api_keys')
      .select(
        'id, agent_id, owner_user_id, scope_downstream_identity_model, scope_path_posture',
      )
      .eq('key_hash', keyHash)
      .eq('purpose', 'sage_assent_write')
      .eq('is_active', true)
      .maybeSingle()

    // A query error is fail-closed (treated as no row → invalid_token).
    if (error) {
      return { valid: false, reason: 'invalid_token' }
    }

    return evaluateSageAssentWriteRow((row as SageAssentCredentialRow | null) ?? null, agent_id, carriedProfile)
  }

  // ===== FLAG ON — capability-aware via the validatePracticeCredential chokepoint =====
  // Accept the legacy write prefix OR the unified sr_prac_ prefix. The per-capability
  // Authorization-header-only transport narrowing (constraint 7) is enforced at the
  // call-site (the route's Bearer extraction), not here.
  if (
    !rawToken.startsWith(SAGE_ASSENT_WRITE_TOKEN_PREFIX) &&
    !rawToken.startsWith(UNIFIED_PRACTICE_CREDENTIAL_PREFIX)
  ) {
    return { valid: false, reason: 'no_token' }
  }

  const core = await validatePracticeCredential(rawToken, requiredCapability, {
    agent_id,
    carriedProfile,
  })

  if (core.valid) {
    return {
      valid: true,
      credential_id: core.row.id,
      // accreditation_write credentials always carry owner_user_id (the load-bearing
      // invariant); the ?? '' is defensive only.
      owner_user_id: core.row.owner_user_id ?? '',
      agent_id: core.row.agent_id ?? agent_id,
      scope_downstream_identity_model: core.row.scope_downstream_identity_model,
      scope_path_posture: core.row.scope_path_posture,
    }
  }

  // Map chokepoint reasons → the assent result shape. 'suspended' and
  // 'insufficient_capability' collapse to 'invalid_token' (no information leak; the
  // route 401s every failure regardless), keeping this result type unchanged.
  switch (core.reason) {
    case 'wrong_agent':
      return { valid: false, reason: 'wrong_agent' }
    case 'wrong_scope':
      return { valid: false, reason: 'wrong_scope' }
    case 'no_token':
      return { valid: false, reason: 'no_token' }
    default:
      return { valid: false, reason: 'invalid_token' }
  }
}

/**
 * The Vercel-structured-logs event shape for the verification path (Decision H).
 * One emission per POST attempt (emitted by the route's verifyAgentIdOwnership,
 * which is where all outcomes — including the kill-switch 'not_enabled' and the
 * missing-token 'no_token' — converge and where ip + elapsed_ms are available).
 *
 * grep-friendly: every line matching `"kind":"sage_assent_verify"` is a verification
 * event. When outcome='wrong_scope' all four scope fields are populated; when
 * outcome='ok' the credential's scope columns + the matching supplied values are
 * populated.
 */
export interface SageAssentVerifyEvent {
  readonly kind: 'sage_assent_verify'
  readonly agent_id: string
  readonly outcome:
    | 'ok'
    | 'no_token'
    | 'invalid_token'
    | 'wrong_agent'
    | 'wrong_scope'
    | 'not_enabled'
  readonly credential_id: string | null
  readonly scope_downstream_identity_model: string | null
  readonly scope_path_posture: string | null
  readonly supplied_downstream_identity_model: string | null
  readonly supplied_path_posture: string | null
  readonly ip: string | null
  readonly elapsed_ms: number
  readonly timestamp: string
}

/** Emit one verification event to Vercel structured logs (Decision H). */
export function logSageAssentVerifyEvent(event: SageAssentVerifyEvent): void {
  console.log(JSON.stringify(event))
}

/**
 * Require admin access for the credential-management endpoints (Decision D).
 *
 * Per the founder's Step 1 election, this reuses the existing ADMIN_USER_ID env
 * var (the same var /api/admin/api-keys uses) — checking the authenticated
 * Supabase user's id against it. No new env var is introduced.
 *
 * Returns 401 for any non-admin caller (unauthenticated OR wrong user) — a
 * single status, no information leak about why.
 */
export async function requireAdmin(request: NextRequest): Promise<
  { user: { id: string; email?: string }; error?: never } |
  { user?: never; error: NextResponse }
> {
  const user = await getAuthenticatedUser(request)
  const adminId = process.env.ADMIN_USER_ID
  if (!user || !adminId || user.id !== adminId) {
    return {
      error: NextResponse.json(
        { error: 'Admin authentication required.' },
        { status: 401 },
      ),
    }
  }
  return { user }
}

/**
 * Resolve an auth.users.id to its public.profiles.id (Decision D step 3).
 *
 * profiles.id IS the auth user's id by construction (the handle_new_user trigger
 * inserts profiles.id = auth.users.id), so this is effectively an existence
 * check: it confirms the profile row exists (so the api_keys.owner_user_id FK to
 * profiles(id) will not be violated) and returns that id, or null if absent.
 *
 * KG1 rule 2: the read is awaited; an error returns null (caller fails closed).
 */
export async function resolveProfileId(userId: string): Promise<string | null> {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const { data, error } = await admin
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle()
  if (error || !data) return null
  return data.id
}
