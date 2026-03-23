import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// GET — Retrieve a saved document score by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const { data, error } = await supabaseAdmin
      .from('document_scores')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Score not found' }, { status: 404 })
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Score detail error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
