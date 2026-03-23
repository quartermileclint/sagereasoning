import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getTierColor, getTierLabel, getAlignmentTier } from '@/lib/document-scorer'

// Generate an SVG badge for a scored document
// Format: shields.io-style badge with SageReasoning branding
function generateBadgeSvg(
  score: number,
  tier: 'sage' | 'progressing' | 'aware' | 'misaligned' | 'contrary'
): string {
  const tierColor = getTierColor(tier)
  const tierLabel = getTierLabel(tier)
  const leftText = '⚖ Stoic Score'
  const rightText = `${score} · ${tierLabel}`

  // Calculate widths (approximate: 6.5px per char + padding)
  const leftWidth = leftText.length * 6.5 + 20
  const rightWidth = rightText.length * 6.8 + 20
  const totalWidth = leftWidth + rightWidth

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="28" role="img" aria-label="${leftText}: ${rightText}">
  <title>${leftText}: ${rightText}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".15"/>
    <stop offset="1" stop-opacity=".15"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="28" rx="5" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${leftWidth}" height="28" fill="#3d3d3d"/>
    <rect x="${leftWidth}" width="${rightWidth}" height="28" fill="${tierColor}"/>
    <rect width="${totalWidth}" height="28" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${leftWidth / 2}" y="19.5" fill="#010101" fill-opacity=".3">${leftText}</text>
    <text x="${leftWidth / 2}" y="18.5">${leftText}</text>
    <text x="${leftWidth + rightWidth / 2}" y="19.5" fill="#010101" fill-opacity=".3" font-weight="bold">${rightText}</text>
    <text x="${leftWidth + rightWidth / 2}" y="18.5" font-weight="bold">${rightText}</text>
  </g>
</svg>`
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Preview badge (not from DB)
  if (id === 'preview') {
    const svg = generateBadgeSvg(72, 'progressing')
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('document_scores')
      .select('total_score, alignment_tier')
      .eq('id', id)
      .single()

    if (error || !data) {
      // Return a "not found" badge
      const svg = generateBadgeSvg(0, 'contrary')
      return new NextResponse(svg, {
        status: 404,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    const tier = getAlignmentTier(data.total_score)
    const svg = generateBadgeSvg(data.total_score, tier)

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Badge generation error:', error)
    return new NextResponse('Error', { status: 500 })
  }
}
