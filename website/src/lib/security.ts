import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
