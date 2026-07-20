import { NextResponse } from 'next/server'
import { isServerEncryptionConfigured } from '@/lib/server-encryption'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

// =============================================================================
// health — System health check
//
// GET /api/health
//
// Returns the operational status of all subsystems. No auth required.
//
// #6 (P-GL, 2026-07-20): upgraded from config-PRESENCE to real REACHABILITY.
//   The critical subsystems (Supabase, Anthropic) are now genuinely probed —
//   a live DB outage or an invalid/expired Anthropic key (env still set) now
//   reports 'unreachable' + HTTP 503, instead of the old false 'healthy'.
//   Probes are timeout-bounded and cached ~10s per warm instance so an
//   uptime monitor (or an abuser) hammering this unauthenticated endpoint
//   cannot amplify DB / Anthropic load. Stripe + mentor_encryption stay
//   config-presence (billing is deferred; the encryption key check must stay
//   presence-only so `mentor_encryption: active` keeps proving the key is set).
// =============================================================================

const PROBE_TIMEOUT_MS = 2500
const CACHE_TTL_MS = 10_000

type Reachability = 'connected' | 'unreachable' | 'not_configured'

// Accepts a PromiseLike so the Supabase query builder (a thenable, not a full
// Promise) can be raced directly.
function withTimeout<T>(p: PromiseLike<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('probe_timeout')), ms)),
  ])
}

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

function isAnthropicConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY
}

function isStripeConfigured(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_WEBHOOK_SECRET &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  )
}

// Real DB reachability: a cheap HEAD count on a small always-present table.
async function probeDatabase(): Promise<Reachability> {
  if (!isSupabaseConfigured()) return 'not_configured'
  try {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { error } = await withTimeout(
      admin.from('profiles').select('id', { head: true, count: 'estimated' }).limit(1),
      PROBE_TIMEOUT_MS
    )
    return error ? 'unreachable' : 'connected'
  } catch {
    return 'unreachable'
  }
}

// Real Anthropic reachability + key validity: models.list() is a token-free
// GET that 401s on an invalid/expired key and connection-errors on an outage.
async function probeAnthropic(): Promise<Reachability> {
  if (!isAnthropicConfigured()) return 'not_configured'
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
    await withTimeout(client.models.list(), PROBE_TIMEOUT_MS)
    return 'connected'
  } catch {
    return 'unreachable'
  }
}

interface HealthBody {
  status: 'healthy' | 'degraded'
  timestamp: string
  subsystems: {
    supabase: Reachability
    anthropic_api: Reachability
    stripe_billing: 'connected' | 'not_configured'
    mentor_encryption: 'active' | 'not_configured'
  }
  checks: Record<string, 'reachability' | 'config_presence'>
  version: string
  phase: string
}

let _cache: { at: number; body: HealthBody; httpStatus: number } | null = null

export async function GET() {
  const now = Date.now()
  if (_cache && now - _cache.at < CACHE_TTL_MS) {
    return NextResponse.json(_cache.body, { status: _cache.httpStatus })
  }

  const [supabase, anthropic] = await Promise.all([probeDatabase(), probeAnthropic()])
  const mentor_encryption = isServerEncryptionConfigured() ? 'active' : 'not_configured'
  const stripe_billing = isStripeConfigured() ? 'connected' : 'not_configured'

  // Critical subsystems must be genuinely REACHABLE, not merely configured.
  const healthy = supabase === 'connected' && anthropic === 'connected'
  const httpStatus = healthy ? 200 : 503

  const body: HealthBody = {
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    subsystems: {
      supabase,
      anthropic_api: anthropic,
      stripe_billing,
      mentor_encryption,
    },
    checks: {
      supabase: 'reachability',
      anthropic_api: 'reachability',
      stripe_billing: 'config_presence',
      mentor_encryption: 'config_presence',
    },
    version: '0.4.0',
    phase: 'P0',
  }

  _cache = { at: now, body, httpStatus }
  return NextResponse.json(body, { status: httpStatus })
}
