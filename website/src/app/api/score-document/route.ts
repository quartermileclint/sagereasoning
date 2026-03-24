import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import {
  getAlignmentTier,
  DOCUMENT_SCORING_PROMPT,
  POLICY_SCORING_PROMPT,
  type DocumentScore,
} from '@/lib/document-scorer'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sagereasoning.com'

// POST — Score a document and return the result + badge URLs
export async function POST(request: NextRequest) {
  try {
    const { text, title, mode } = await request.json()
    const isPolicy = mode === 'policy'
    const scoringPrompt = isPolicy ? POLICY_SCORING_PROMPT : DOCUMENT_SCORING_PROMPT

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const trimmed = text.trim()
    const wordCount = trimmed.split(/\s+/).length

    if (wordCount < 20) {
      return NextResponse.json(
        { error: 'Document must be at least 20 words for a meaningful score' },
        { status: 400 }
      )
    }

    // Truncate to ~8000 words to stay within token limits
    const truncated = trimmed.split(/\s+/).slice(0, 8000).join(' ')

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      temperature: 0.2,
      system: scoringPrompt,
      messages: [
        {
          role: 'user',
          content: `Score this document:\n\n${title ? `Title: ${title}\n\n` : ''}${truncated}`,
        },
      ],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    let scoreData
    try {
      const cleaned = responseText
        .replace(/```json?\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      scoreData = JSON.parse(cleaned)
    } catch {
      console.error('Failed to parse scoring response:', responseText)
      return NextResponse.json(
        { error: 'Scoring engine returned invalid response' },
        { status: 500 }
      )
    }

    // Validate
    for (const field of [
      'wisdom_score',
      'justice_score',
      'courage_score',
      'temperance_score',
      'total_score',
      'reasoning',
    ]) {
      if (scoreData[field] === undefined) {
        return NextResponse.json(
          { error: `Missing field: ${field}` },
          { status: 500 }
        )
      }
    }

    const tier = getAlignmentTier(scoreData.total_score)

    // Save to DB and get an ID for the badge URL
    const { data: record, error: dbError } = await supabaseAdmin
      .from('document_scores')
      .insert({
        title: title || null,
        word_count: wordCount,
        total_score: scoreData.total_score,
        wisdom_score: scoreData.wisdom_score,
        justice_score: scoreData.justice_score,
        courage_score: scoreData.courage_score,
        temperance_score: scoreData.temperance_score,
        alignment_tier: tier,
        reasoning: scoreData.reasoning,
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('DB error saving document score:', dbError)
      // Still return the score even if DB fails — just without persistent badge
    }

    const scoreId = record?.id || 'preview'
    const badgeUrl = `${BASE_URL}/api/badge/${scoreId}`
    const embedHtml = `<a href="${BASE_URL}/score/${scoreId}" target="_blank" rel="noopener"><img src="${badgeUrl}" alt="Stoic Score: ${scoreData.total_score} — ${tier}" height="40" /></a>`

    const result: DocumentScore & { mode?: string; flagged_clauses?: unknown[] } = {
      total_score: scoreData.total_score,
      wisdom_score: scoreData.wisdom_score,
      justice_score: scoreData.justice_score,
      courage_score: scoreData.courage_score,
      temperance_score: scoreData.temperance_score,
      alignment_tier: tier,
      reasoning: scoreData.reasoning,
      document_title: title || undefined,
      word_count: wordCount,
      scored_at: new Date().toISOString(),
      badge_url: badgeUrl,
      embed_html: embedHtml,
      ...(isPolicy && { mode: 'policy', flagged_clauses: scoreData.flagged_clauses || [] }),
    }

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'document_score',
        metadata: {
          score_id: scoreId,
          total_score: scoreData.total_score,
          tier,
          word_count: wordCount,
        },
      })
      .then(() => {})

    return NextResponse.json(result, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Document score API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
