import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'

// =============================================================================
// PRIVATE mentor history — Founder-only reflection history
//
// GET /api/mentor/private/history
//
// Returns the founder's past mentor interactions from the private-mentor hub.
// This provides session continuity and personal reflection capability.
//
// Query params:
//   ?limit=20          — max records (default 20, max 100)
//   ?offset=0          — pagination offset
//   ?type=evening_reflection  — filter by interaction_type (optional)
//
// Access: Founder only (FOUNDER_USER_ID env var)
// =============================================================================

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  // Founder-only gate
  const founderId = process.env.FOUNDER_USER_ID
  if (!founderId || auth.user.id !== founderId) {
    return NextResponse.json(
      { error: 'This endpoint is restricted to the private mentor.' },
      { status: 403 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const typeFilter = searchParams.get('type')

    // Find the founder's profile
    const { data: profileRow, error: profileError } = await supabaseAdmin
      .from('mentor_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single()

    if (profileError || !profileRow) {
      return NextResponse.json(
        { interactions: [], total: 0, message: 'No mentor profile found.' },
        { headers: corsHeaders() }
      )
    }

    // Build query — hub-scoped to private-mentor only
    let query = supabaseAdmin
      .from('mentor_interactions')
      .select('id, interaction_type, description, proximity_assessed, passions_detected, mechanisms_applied, mentor_observation, created_at', { count: 'exact' })
      .eq('profile_id', profileRow.id)
      .eq('hub_id', 'private-mentor')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (typeFilter) {
      query = query.eq('interaction_type', typeFilter)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('[mentor/private/history] Query error:', error)
      return NextResponse.json(
        { error: 'Failed to load interaction history.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        interactions: data || [],
        total: count || 0,
        hub: 'private-mentor',
        limit,
        offset,
      },
      { headers: corsHeaders() }
    )
  } catch (err) {
    console.error('[mentor/private/history] Error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return corsPreflightResponse()
}
