import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { buildProfileSummary, MentorProfileData } from '@/lib/mentor-profile-summary'
import { loadMentorProfile, saveMentorProfile } from '@/lib/mentor-profile-store'
import { adaptMentorProfileDataToCanonical } from '@/lib/mentor-profile-adapter'
import { isServerEncryptionConfigured } from '@/lib/server-encryption'
import mentorProfileFallback from '@/data/mentor-profile.json'

// =============================================================================
// mentor-profile — Serve the practitioner's encrypted MentorProfile
//
// GET /api/mentor-profile
//   Returns the full MentorProfile JSON + text summary.
//   Reads from Supabase (encrypted at rest, R17b) with fallback to static JSON
//   if no Supabase profile exists yet.
//
// POST /api/mentor-profile
//   Seeds or updates the profile in Supabase (encrypted).
//   Used by mentor-baseline-response after processing gap answers,
//   or to seed the initial profile from journal extraction.
//
// Auth: Requires signed-in user (Supabase JWT) or API key
// =============================================================================

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    let profile: MentorProfileData
    let source: string
    let version = 0

    // Try Supabase first (encrypted storage)
    if (isServerEncryptionConfigured() && auth.user?.id) {
      const stored = await loadMentorProfile(auth.user?.id)
      if (stored) {
        profile = stored.profile
        version = stored.version
        source = 'supabase_encrypted'
      } else {
        // No profile in Supabase — fall back to static file
        profile = mentorProfileFallback as MentorProfileData
        source = 'static_fallback'
      }
    } else {
      // Encryption not configured — use static fallback
      profile = mentorProfileFallback as MentorProfileData
      source = 'static_fallback'
    }

    // Transitional shim under ADR-Ring-2-01 Session 3 (25 April 2026):
    // `buildProfileSummary` was rewritten to consume the canonical
    // MentorProfile. This route is NOT this session's PR1 single-endpoint
    // proof (private baseline is — see /api/mentor/private/baseline-response),
    // so the legacy loader and the wire contract for `profile` and `meta`
    // (which read MentorProfileData fields directly) are preserved here.
    // The canonical-shape adaptation happens only at the summary line.
    //
    // Retirement condition (PR7): when this GET endpoint migrates as its own
    // follow-up Session-3 session, the adapter call collapses into a direct
    // `buildProfileSummary(profile)` (with `profile` typed `MentorProfile`),
    // the `meta` block translates to canonical field names, and the import
    // above is removed.
    const profileSummary = buildProfileSummary(adaptMentorProfileDataToCanonical(profile))

    return NextResponse.json(
      {
        success: true,
        profile,
        profile_summary: profileSummary,
        meta: {
          journal_name: profile.journal_name,
          journal_period: profile.journal_period,
          sections_processed: profile.sections_processed,
          entries_processed: profile.entries_processed,
          total_word_count: profile.total_word_count,
          passions_detected: profile.passion_map.length,
          proximity_level: profile.proximity_estimate.level,
          senecan_grade: profile.proximity_estimate.senecan_grade,
          source,
          profile_version: version,
        },
        usage_note: 'Pass the profile_summary string to POST /api/mentor-baseline to generate gap detection questions.',
      },
      { headers: corsHeaders() }
    )
  } catch (err) {
    console.error('[mentor-profile] Error:', err)
    return NextResponse.json(
      { error: 'Failed to load profile' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  if (!auth.user?.id) {
    return NextResponse.json(
      { error: 'User ID required to save profile' },
      { status: 400, headers: corsHeaders() }
    )
  }

  if (!isServerEncryptionConfigured()) {
    return NextResponse.json(
      { error: 'Server encryption not configured. Set MENTOR_ENCRYPTION_KEY in environment.' },
      { status: 503, headers: corsHeaders() }
    )
  }

  try {
    const body = await request.json()
    const { profile } = body as { profile: MentorProfileData }

    if (!profile || !profile.display_name) {
      return NextResponse.json(
        { error: 'profile is required (full MentorProfileData JSON)' },
        { status: 400, headers: corsHeaders() }
      )
    }

    const result = await saveMentorProfile(auth.user?.id, profile)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to save profile' },
        { status: 500, headers: corsHeaders() }
      )
    }

    return NextResponse.json(
      {
        success: true,
        profile_version: result.version,
        encrypted: true,
        message: 'Profile saved to Supabase with AES-256-GCM encryption (R17b)',
      },
      { headers: corsHeaders() }
    )
  } catch (err) {
    console.error('[mentor-profile] Save error:', err)
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return corsPreflightResponse()
}
