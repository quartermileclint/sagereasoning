import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { buildProfileSummary, MentorProfileData } from '@/lib/mentor-profile-summary'
import mentorProfileRaw from '@/data/mentor-profile.json'

// =============================================================================
// mentor-profile — Serve the practitioner's extracted MentorProfile
//
// GET /api/mentor-profile
//
// Returns:
//   - The full MentorProfile JSON (for display and storage)
//   - A text summary suitable for passing to /api/mentor-baseline
//
// This endpoint bridges journal extraction → baseline gap questions.
// The profile was extracted by sage-interpret from the practitioner's journal.
//
// Auth: Requires signed-in user (Supabase JWT)
// =============================================================================

const mentorProfile = mentorProfileRaw as MentorProfileData

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const profileSummary = buildProfileSummary(mentorProfile)

    return NextResponse.json(
      {
        success: true,
        profile: mentorProfile,
        profile_summary: profileSummary,
        meta: {
          journal_name: mentorProfile.journal_name,
          journal_period: mentorProfile.journal_period,
          sections_processed: mentorProfile.sections_processed,
          entries_processed: mentorProfile.entries_processed,
          total_word_count: mentorProfile.total_word_count,
          passions_detected: mentorProfile.passion_map.length,
          proximity_level: mentorProfile.proximity_estimate.level,
          senecan_grade: mentorProfile.proximity_estimate.senecan_grade,
        },
        usage_note: 'Pass the profile_summary string to POST /api/mentor-baseline to generate gap detection questions.',
      },
      { headers: corsHeaders() }
    )
  } catch (err) {
    console.error('[mentor-profile] Error:', err)
    return NextResponse.json(
      { error: 'Failed to build profile summary' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return corsPreflightResponse()
}
