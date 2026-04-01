import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { PROXIMITY_COLORS, PROXIMITY_ENGLISH } from '@/lib/document-scorer'
// V1 shims — kept for backward compatibility with existing badges
import { getTierColor, getTierLabel, getAlignmentTier } from '@/lib/document-scorer'
import { checkRateLimit, RATE_LIMITS, publicCorsHeaders } from '@/lib/security'
import type { KatorthomaProximityLevel } from '@/lib/stoic-brain'

/**
 * V3 Badge: Displays proximity level instead of numeric score.
 * R4: Badge shows proximity level only, not evaluation logic.
 * R6c: Qualitative proximity, not 0-100.
 * R8c: English-only labels.
 */
function generateV3BadgeSvg(proximity: KatorthomaProximityLevel): string {
  const color = PROXIMITY_COLORS[proximity]
  const label = PROXIMITY_ENGLISH[proximity]
  const leftText = 'Stoic Evaluation'
  const rightText = label

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
    <rect x="${leftWidth}" width="${rightWidth}" height="28" fill="${color}"/>
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

/**
 * @deprecated V1 badge generator — kept for backward compatibility with existing document_scores records.
 */
function generateV1BadgeSvg(
  score: number,
  tier: 'sage' | 'progressing' | 'aware' | 'misaligned' | 'contrary'
): string {
  const tierColor = getTierColor(tier)
  const tierLabel = getTierLabel(tier)
  const leftText = 'Stoic Score'
  const rightText = `${score} · ${tierLabel}`

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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.publicAgent)
  if (rateLimitError) return rateLimitError

  const { id } = await params

  // Preview badge (V3 style)
  if (id === 'preview') {
    const svg = generateV3BadgeSvg('deliberate')
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60',
        ...publicCorsHeaders(),
      },
    })
  }

  try {
    // Try V3 table first (has proximity), fall back to V1 table (has numeric score)
    const { data: v3Data } = await supabaseAdmin
      .from('document_evaluations_v3')
      .select('katorthoma_proximity')
      .eq('id', id)
      .single()

    if (v3Data?.katorthoma_proximity) {
      const svg = generateV3BadgeSvg(v3Data.katorthoma_proximity as KatorthomaProximityLevel)
      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400',
          ...publicCorsHeaders(),
        },
      })
    }

    // V1 fallback
    const { data, error } = await supabaseAdmin
      .from('document_scores')
      .select('total_score, alignment_tier')
      .eq('id', id)
      .single()

    if (error || !data) {
      const svg = generateV3BadgeSvg('reflexive')
      return new NextResponse(svg, {
        status: 404,
        headers: {
          'Content-Type': 'image/svg+xml',
          ...publicCorsHeaders(),
        },
      })
    }

    const tier = getAlignmentTier(data.total_score)
    const svg = generateV1BadgeSvg(data.total_score, tier)

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        ...publicCorsHeaders(),
      },
    })
  } catch (error) {
    console.error('Badge generation error:', error)
    return new NextResponse('Error', { status: 500 })
  }
}
