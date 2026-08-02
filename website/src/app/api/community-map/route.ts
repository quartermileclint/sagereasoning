import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// The community_map_pins view serves display_name + location only for
// opted-in practitioners (show_on_map gate lives INSIDE the view — do not
// filter on it here; the view exposes no such column, and filtering on it
// was the cause of the long-standing 42703). Per the adopted Q6a ruling
// (The Stoa, 2026-08-02) the view carries NO practice-derived data —
// sage_alignment / avg_total must never be re-added to this select.
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('community_map_pins')
      .select('display_name, city, country, latitude, longitude')
      .limit(2000)

    if (error) {
      // Honest failure — a real DB error is a 500, never a fake-benign
      // empty map (a genuinely empty result is a clean 200 below).
      console.error('Community map error:', error)
      return NextResponse.json(
        { error: 'community_map_unavailable' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      pins: data ?? [],
      total: data?.length ?? 0,
    })
  } catch (err) {
    console.error('Community map error:', err)
    return NextResponse.json(
      { error: 'community_map_unavailable' },
      { status: 500 }
    )
  }
}
