import { NextResponse } from 'next/server'
import { isServerEncryptionConfigured } from '@/lib/server-encryption'

// =============================================================================
// health — System health check
//
// GET /api/health
//
// Returns the operational status of all subsystems. No auth required.
// Useful for uptime monitoring, deployment verification, and debugging.
// =============================================================================

// Check if Stripe is configured
function isStripeConfigured(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_WEBHOOK_SECRET &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  )
}

// Check if Supabase is configured
function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// Check if Anthropic API is configured
function isAnthropicConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY
}

export async function GET() {
  const subsystems = {
    supabase: isSupabaseConfigured(),
    anthropic: isAnthropicConfigured(),
    stripe: isStripeConfigured(),
    mentor_encryption: isServerEncryptionConfigured(),
  }

  const allCritical = subsystems.supabase && subsystems.anthropic
  const status = allCritical ? 'healthy' : 'degraded'

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    subsystems: {
      supabase: subsystems.supabase ? 'connected' : 'not_configured',
      anthropic_api: subsystems.anthropic ? 'connected' : 'not_configured',
      stripe_billing: subsystems.stripe ? 'connected' : 'not_configured',
      mentor_encryption: subsystems.mentor_encryption ? 'active' : 'not_configured',
    },
    version: '0.3.0',
    phase: 'P0',
  })
}
