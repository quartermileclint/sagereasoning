import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { event_type, user_id, user_email, metadata } = await request.json()

    if (!event_type) {
      return NextResponse.json({ error: 'event_type required' }, { status: 400 })
    }

    // Get IP and user-agent for anonymous tracking
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const { error } = await supabaseAdmin.from('analytics_events').insert({
      event_type,
      user_id: user_id || null,
      user_email: user_email || null,
      ip_address: ip,
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
