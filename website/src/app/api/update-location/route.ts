import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { city, country, latitude, longitude, show_on_map } = body

  // Basic validation of coordinates
  if (latitude !== undefined && (latitude < -90 || latitude > 90)) {
    return NextResponse.json({ error: 'Invalid latitude' }, { status: 400 })
  }
  if (longitude !== undefined && (longitude < -180 || longitude > 180)) {
    return NextResponse.json({ error: 'Invalid longitude' }, { status: 400 })
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      city: city ?? null,
      country: country ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      show_on_map: show_on_map ?? false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
