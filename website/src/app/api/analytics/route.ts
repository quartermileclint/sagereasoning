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

export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.analytics)
  if (rateLimitError) return rateLimitError

  try {
    const { event_type, user_id, metadata } = await request.json()

    if (!event_type) {
      return NextResponse.json({ error: 'event_type required' }, { status: 400 })
    }

    // Get IP (hashed for privacy) and user-agent for anonymous tracking
    const rawIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const ipHash = hashIp(rawIp)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const { error } = await supabaseAdmin.from('analytics_events').insert({
      event_type,
      user_id: user_id || null,
      user_email: null, // No longer stored — reduces privacy burden
      ip_address: ipHash, // Hashed for privacy
      user_agent: userAgent,
      metadata: metadata || {},
    })

    if (error) {
      console.error('Analytics insert error:', error)
      // Don't fail the request — analytics errors should be silent
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ ok: true }) // Always return OK — don't break the client
  }
}
