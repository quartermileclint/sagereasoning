import { NextRequest, NextResponse } from 'next/server'
import {
  checkRateLimit,
  RATE_LIMITS,
  requireAuth,
  corsHeaders,
  corsPreflightResponse,
} from '@/lib/security'
import { isServerEncryptionConfigured } from '@/lib/server-encryption'
import { listAppendixRounds } from '@/lib/mentor-appendix-store'

// =============================================================================
// mentor-appendix/[id] — Fetch a single decrypted round by id
//
// GET /api/mentor-appendix/<uuid>
//
// Auth-gated. Scoped to the authenticated user: even if a caller provides
// another user's round id, the lookup only searches within their own rounds
// (listAppendixRounds filters by user_id), so 404 is returned for anything
// outside the user's scope.
//
// Output: { success, round: DecryptedAppendixRound }
// =============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  if (!isServerEncryptionConfigured()) {
    return NextResponse.json(
      { error: 'Server encryption is not configured.' },
      { status: 503, headers: corsHeaders() }
    )
  }

  const { id } = await params

  // Validate UUID format before any query to prevent info-leak on malformed ids
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!id || !uuidRegex.test(id)) {
    return NextResponse.json(
      { error: 'Invalid round id format' },
      { status: 400, headers: corsHeaders() }
    )
  }

  try {
    // listAppendixRounds is already user-scoped — safer than a direct lookup
    // that could be misused if the caller passed an arbitrary id.
    const rounds = await listAppendixRounds(auth.user.id)
    const round = rounds.find(r => r.id === id)
    if (!round) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404, headers: corsHeaders() }
      )
    }
    return NextResponse.json(
      { success: true, round },
      { headers: corsHeaders() }
    )
  } catch (err) {
    console.error('[mentor-appendix/[id]] Error:', err)
    return NextResponse.json(
      { error: 'Failed to load round' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return corsPreflightResponse()
}
