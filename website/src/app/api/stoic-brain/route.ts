import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import fs from 'fs'
import path from 'path'

// Serve the stoic-brain.json file and log the request for AI agent tracking
export async function GET(request: NextRequest) {
  try {
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    // Determine if this is likely an AI agent vs a browser
    const isLikelyAgent = !userAgent.includes('Mozilla') && !userAgent.includes('Chrome') && !userAgent.includes('Safari')

    // Log the fetch event
    await supabaseAdmin.from('analytics_events').insert({
      event_type: 'stoic_brain_fetch',
      user_id: null,
      user_email: null,
      ip_address: ip,
      user_agent: userAgent,
      metadata: {
        is_likely_agent: isLikelyAgent,
        accept: request.headers.get('accept') || '',
      },
    }).then(() => {}) // Fire and forget

    // Read and serve the stoic-brain.json from the repo
    // In production, this file is bundled at build time
    const stoicBrainPath = path.join(process.cwd(), '..', 'stoic-brain', 'stoic-brain.json')

    let stoicBrain
    try {
      const fileContent = fs.readFileSync(stoicBrainPath, 'utf-8')
      stoicBrain = JSON.parse(fileContent)
    } catch {
      // Fallback: serve a minimal response if file not found in deployment
      stoicBrain = {
        meta: {
          name: 'SageReasoning Stoic Brain',
          version: '1.0.0',
          website: 'https://sagereasoning.com',
          description: 'Full stoic-brain.json available at https://github.com/quartermileclint/sagereasoning/tree/main/stoic-brain',
        },
        message: 'For the complete Stoic Brain data, fetch from the GitHub repository or contact sagereasoning.com',
      }
    }

    return NextResponse.json(stoicBrain, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'Access-Control-Allow-Origin': '*', // Allow AI agents from any origin
      },
    })
  } catch (error) {
    console.error('Stoic brain API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
