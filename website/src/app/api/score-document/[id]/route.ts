import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimit, RATE_LIMITS, publicCorsHeaders } from '@/lib/security'

// GET — Retrieve a saved document score by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const { id } = await params

  // Validate UUID format to prevent information leakage from malformed queries
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: 'Invalid score ID format' }, { status: 400 })
  }

  try {
    // R4: Only return public-safe fields — exclude internal evaluation mechanisms
    const { data, error } = await supabaseAdmin
      .from('document_scores')
      .select('id, document_type, katorthoma_proximity, virtue_domains_engaged, philosophical_reflection, improvement_path, created_at')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Score not found' }, { status: 404 })
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'private, max-age=300',
        ...publicCorsHeaders(),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
