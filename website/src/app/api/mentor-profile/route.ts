import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { buildProfileSummary, MentorProfileData } from '@/lib/mentor-profile-summary'
import { loadMentorProfileCanonical, saveMentorProfile } from '@/lib/mentor-profile-store'
import { adaptMentorProfileDataToCanonical } from '@/lib/mentor-profile-adapter'
import { isServerEncryptionConfigured } from '@/lib/server-encryption'
import mentorProfileFallback from '@/data/mentor-profile.json'
import type { MentorProfile } from '../../../../../sage-mentor'

// =============================================================================
// mentor-profile — Serve the practitioner's encrypted MentorProfile
//
// GET /api/mentor-profile
//   Returns the full canonical MentorProfile JSON + text summary.
//   Reads from Supabase (encrypted at rest, R17b) with fallback to static JSON
//   if no Supabase profile exists yet.
//
// POST /api/mentor-profile
//   Seeds or updates the profile in Supabase (encrypted).
//   Used by mentor-baseline-response after processing gap answers,
//   or to seed the initial profile from journal extraction. POST body now
//   accepts canonical MentorProfile shape (ADR-Ring-2-01 Session 4 (4b),
//   26 April 2026). saveMentorProfile() consumes canonical and persists
//   it at rest. Legacy MentorProfileData rows already in the table remain
//   readable via the loader's shape-detection dispatch.
//
// Auth: Requires signed-in user (Supabase JWT) or API key
//
// Wire-contract notes (ADR-Ring-2-01 Session 3c, 26 April 2026):
//   - The GET response's `profile` field now carries the canonical MentorProfile
//     shape (Decision 1b = a). Audit at session open across /website/src found
//     zero detectable consumers of the field; a fetch-call audit returned no
//     matches anywhere in the repo. Returning canonical aligns with the
//     route's documented purpose ("Returns the full canonical MentorProfile
//     JSON") and is the migration's end-state shape.
//   - The `meta` block is preserved (Decision 1a = a). Output keys are
//     unchanged from the prior version (proximity_level, senecan_grade, etc.
//     were already canonical-named); only the source-field paths on the right
//     side translate (proximity_estimate.level → proximity_level;
//     proximity_estimate.senecan_grade → senecan_grade). External wire
//     contract at the meta-block key level is unchanged.
// =============================================================================

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    let profile: MentorProfile
    let source: string
    let version = 0

    // Load current profile — Supabase (encrypted) first, then static fallback.
    //
    // Migrated under ADR-Ring-2-01 Session 3c (26 April 2026) — last
    // transitional shim retired. Loader switched from loadMentorProfile()
    // (legacy MentorProfileData envelope) to loadMentorProfileCanonical()
    // (canonical MentorProfile envelope). After this session every consumer
    // of buildProfileSummary across /website/src is on the canonical loader;
    // /api/founder/hub remains on legacy loadMentorProfile() directly (Session
    // 3e), and the two context loaders practitioner-context.ts +
    // mentor-context-private.ts retain their internal legacy calls (Session
    // 3d).
    //
    // The static fallback JSON file remains in legacy MentorProfileData shape
    // and is adapted at the use site (Decision 3 = a — file unchanged this
    // session, retires alongside MentorProfileData in Session 5).
    if (isServerEncryptionConfigured() && auth.user?.id) {
      const stored = await loadMentorProfileCanonical(auth.user?.id)
      if (stored) {
        profile = stored.profile
        version = stored.version
        source = 'supabase_encrypted'
      } else {
        // No profile in Supabase — fall back to static file (adapted)
        profile = adaptMentorProfileDataToCanonical(mentorProfileFallback as MentorProfileData)
        source = 'static_fallback'
      }
    } else {
      // Encryption not configured — use static fallback (adapted)
      profile = adaptMentorProfileDataToCanonical(mentorProfileFallback as MentorProfileData)
      source = 'static_fallback'
    }

    // Build the text summary for downstream consumers (e.g., POST
    // /api/mentor-baseline). Shim retired under ADR-Ring-2-01 Session 3c
    // (26 April 2026): currentProfile is already canonical MentorProfile,
    // no adaptation needed at this call site.
    const profileSummary = buildProfileSummary(profile)

    return NextResponse.json(
      {
        success: true,
        // `profile` now carries canonical MentorProfile shape under
        // ADR-Ring-2-01 Session 3c (Decision 1b = a). See header docstring.
        profile,
        profile_summary: profileSummary,
        // `meta` preserved with the same output keys as the prior shape
        // (Decision 1a = a). Source-field paths translated to canonical:
        // `proximity_estimate.level` → `proximity_level`;
        // `proximity_estimate.senecan_grade` → `senecan_grade`. Other source
        // fields share names with the canonical optional fields under C-α
        // (journal_name, journal_period, sections_processed,
        // entries_processed, total_word_count, founder_facts) — see
        // /sage-mentor/persona.ts.
        meta: {
          journal_name: profile.journal_name,
          journal_period: profile.journal_period,
          sections_processed: profile.sections_processed,
          entries_processed: profile.entries_processed,
          total_word_count: profile.total_word_count,
          passions_detected: profile.passion_map.length,
          proximity_level: profile.proximity_level,
          senecan_grade: profile.senecan_grade,
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
    // ADR-Ring-2-01 Session 4 (4b): body is canonical MentorProfile shape.
    const { profile } = body as { profile: MentorProfile }

    if (!profile || !profile.display_name) {
      return NextResponse.json(
        { error: 'profile is required (full canonical MentorProfile JSON)' },
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
