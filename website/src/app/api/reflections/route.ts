import { NextRequest, NextResponse } from 'next/server'
import {
  checkRateLimit,
  RATE_LIMITS,
  requireAuth,
  corsHeaders,
  corsPreflightResponse,
} from '@/lib/security'
import { supabaseAdmin } from '@/lib/supabase-server'

// =============================================================================
// /api/reflections — List the authenticated user's reflections, newest first
//
// GET /api/reflections
//
// Read-only. Auth-gated. User-scoped by auth.user.id so users can only see
// their own reflections. Reads from public.reflections (V3 schema:
// katorthoma_proximity, passions_detected, sage_perspective, evening_prompt).
//
// Output: { success, count, reflections: ReflectionRow[] }
//
// Classification (0d-ii): Standard — read-only new endpoint, no mutations.
// =============================================================================

interface ReflectionRow {
  id: string
  user_id: string
  what_happened: string
  how_responded: string | null
  katorthoma_proximity: string | null
  passions_detected: unknown // jsonb — typically an array of { root_passion, sub_species, false_judgement }
  sage_perspective: string | null
  evening_prompt: string | null
  created_at: string
}

export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  if (!auth.user?.id) {
    return NextResponse.json(
      { error: 'Authenticated user missing id' },
      { status: 401, headers: corsHeaders() }
    )
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('reflections')
      .select(
        'id, user_id, what_happened, how_responded, katorthoma_proximity, passions_detected, sage_perspective, evening_prompt, created_at'
      )
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[api/reflections] List error:', error)
      return NextResponse.json(
        { error: 'Failed to list reflections' },
        { status: 500, headers: corsHeaders() }
      )
    }

    const rows = (data || []) as ReflectionRow[]

    return NextResponse.json(
      { success: true, count: rows.length, reflections: rows },
      { headers: corsHeaders() }
    )
  } catch (err) {
    console.error('[api/reflections] Error:', err)
    return NextResponse.json(
      { error: 'Failed to list reflections' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return corsPreflightResponse()
}
