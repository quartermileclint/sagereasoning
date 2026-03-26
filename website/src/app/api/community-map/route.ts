import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('community_map_pins')
      .select('id, display_name, city, country, latitude, longitude, sage_alignment, avg_total')
      .limit(2000)

    if (error) {
      console.error('Community map error:', error)
      return NextResponse.json({ pins: [] })
    }

    return NextResponse.json({
      pins: data ?? [],
      total: data?.length ?? 0,
    })
  } catch {
    return NextResponse.json({ pins: [], total: 0 })
  }
}
