import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimit, RATE_LIMITS } from '@/lib/security'
import { createHash } from 'crypto'

/**
 * Hash an IP address for privacy — stores a one-way hash instead of the raw IP.
 */
function hashIp(ip: string): string {
  return createHash('sha256').update(ip + (process.env.SUPABASE_SERVICE_ROLE_KEY || '')).digest('hex').slice(0, 16)
}

// ---------------------------------------------------------------------------
// Schema validation
// ---------------------------------------------------------------------------
//
// The analytics_events table has these columns:
//   id (auto), event_type, user_id, metadata (jsonb), created_at (auto), api_key_id
//
// Columns that do NOT exist (and must never appear as top-level insert fields):
//   ip_address, user_agent, user_email
//
// Tracking data (hashed IP, user-agent) is folded into the metadata jsonb field.
// ---------------------------------------------------------------------------

/** Columns the table will never accept — reject these at the API boundary. */
const FORBIDDEN_TOP_LEVEL_FIELDS = ['ip_address', 'user_agent', 'user_email'] as const

/** Validated row shape — exactly the columns the table accepts. */
type AnalyticsInsertRow = {
  event_type: string
  user_id: string | null
  metadata: Record<string, unknown>
  api_key_id?: string | null
}

/**
 * Validate the incoming body and return either a clean payload or an error string.
 * This replaces Zod (which isn't in our dependency tree) with a plain TS guard.
 */
function validateAnalyticsPayload(
  body: Record<string, unknown>
): { ok: true; data: { event_type: string; user_id?: string | null; metadata?: Record<string, unknown>; api_key_id?: string | null } }
   | { ok: false; error: string } {

  // Reject forbidden top-level fields — the whole point of this guard
  const forbidden = FORBIDDEN_TOP_LEVEL_FIELDS.filter(f => f in body)
  if (forbidden.length > 0) {
    return { ok: false, error: `Disallowed top-level field(s): ${forbidden.join(', ')}. These columns do not exist on analytics_events. Move tracking data into the metadata object.` }
  }

  // event_type — required, non-empty string, max 100 chars
  if (typeof body.event_type !== 'string' || body.event_type.length === 0) {
    return { ok: false, error: 'event_type is required and must be a non-empty string' }
  }
  if (body.event_type.length > 100) {
    return { ok: false, error: 'event_type must be 100 characters or fewer' }
  }

  // user_id — optional, must be a string if present
  if (body.user_id !== undefined && body.user_id !== null && typeof body.user_id !== 'string') {
    return { ok: false, error: 'user_id must be a string (UUID) or null' }
  }

  // metadata — optional, must be an object if present
  if (body.metadata !== undefined && (typeof body.metadata !== 'object' || body.metadata === null || Array.isArray(body.metadata))) {
    return { ok: false, error: 'metadata must be a JSON object' }
  }

  // api_key_id — optional, must be a string if present
  if (body.api_key_id !== undefined && body.api_key_id !== null && typeof body.api_key_id !== 'string') {
    return { ok: false, error: 'api_key_id must be a string (UUID) or null' }
  }

  return {
    ok: true,
    data: {
      event_type: body.event_type,
      user_id: (body.user_id as string | null | undefined) ?? null,
      metadata: (body.metadata as Record<string, unknown> | undefined) ?? {},
      api_key_id: (body.api_key_id as string | null | undefined) ?? null,
    },
  }
}

export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.analytics)
  if (rateLimitError) return rateLimitError

  try {
    const body = await request.json()

    // Validate payload — surface column mismatches as 400 errors with clear messages
    const parsed = validateAnalyticsPayload(body)
    if (!parsed.ok) {
      return NextResponse.json({ error: `Invalid analytics payload: ${parsed.error}` }, { status: 400 })
    }

    // Fold tracking data into metadata (not top-level columns — those don't exist)
    const rawIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const ipHash = hashIp(rawIp)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const row: AnalyticsInsertRow = {
      event_type: parsed.data.event_type,
      user_id: parsed.data.user_id || null,
      metadata: {
        ...parsed.data.metadata,
        _ip_hash: ipHash,
        _user_agent: userAgent,
      },
    }

    if (parsed.data.api_key_id) {
      row.api_key_id = parsed.data.api_key_id
    }

    const { error } = await supabaseAdmin.from('analytics_events').insert(row)

    if (error) {
      console.error('Analytics insert error:', error)
      // Return the actual error so callers can diagnose — this is an internal API
      return NextResponse.json({ error: `Insert failed: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ ok: true }) // Always return OK — don't break the client
  }
}
