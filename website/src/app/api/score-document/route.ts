import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import {
  V3_DOCUMENT_SCORING_PROMPT,
  V3_POLICY_SCORING_PROMPT,
  PROXIMITY_COLORS,
  PROXIMITY_ENGLISH,
  DOCUMENT_EVALUATIVE_DISCLAIMER,
  type V3DocumentEvaluation,
  type V3PolicyEvaluation,
} from '@/lib/document-scorer'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'
import type { KatorthomaProximityLevel } from '@/lib/stoic-brain'
import { buildEnvelope } from '@/lib/response-envelope'
import { MODEL_DEEP } from '@/lib/model-config'
import { getStoicBrainContext } from '@/lib/context/stoic-brain-loader'
import { getPractitionerContext } from '@/lib/context/practitioner-context'
import { getProjectContext } from '@/lib/context/project-context'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sagereasoning.com'

// POST — Score a document and return the result + badge URLs
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const startTime = Date.now()
    const { text, title, mode } = await request.json()
    const isPolicy = mode === 'policy'
    const scoringPrompt = isPolicy ? V3_POLICY_SCORING_PROMPT : V3_DOCUMENT_SCORING_PROMPT

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const textValidationError = validateTextLength(text, 'text', TEXT_LIMITS.document)
    if (textValidationError) {
      return NextResponse.json({ error: textValidationError }, { status: 400 })
    }

    const trimmed = text.trim()
    const wordCount = trimmed.split(/\s+/).length

    if (wordCount < 20) {
      return NextResponse.json(
        { error: 'Document must be at least 20 words for a meaningful evaluation' },
        { status: 400 }
      )
    }

    // Truncate to ~8000 words to stay within token limits
    const truncated = trimmed.split(/\s+/).slice(0, 8000).join(' ')

    // Context layers injection
    const stoicBrainContext = getStoicBrainContext('deep')
    const practitionerContext = await getPractitionerContext(auth.user.id)
    const projectContext = await getProjectContext('minimal')

    // Policy mode needs more tokens — its JSON schema is significantly larger
    const maxTokens = isPolicy ? 3072 : 2048

    let userContent = `Evaluate this document:\n\n${title ? `Title: ${title}\n\n` : ''}${truncated}`
    if (practitionerContext) userContent += `\n\n${practitionerContext}`
    userContent += `\n\n${projectContext}`

    const message = await client.messages.create({
      model: MODEL_DEEP,
      max_tokens: maxTokens,
      temperature: 0.2,
      system: [
        { type: 'text', text: scoringPrompt, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: stoicBrainContext },
      ],
      messages: [
        {
          role: 'user',
          content: userContent,
        },
      ],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    let evaluationData: any
    try {
      // Step 1: Strip markdown code fences
      let cleaned = responseText
        .replace(/```json?\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      // Step 2: Try direct parse first
      evaluationData = JSON.parse(cleaned)
    } catch {
      // Step 3: Fallback — extract JSON object from response text
      // The AI sometimes wraps JSON in explanatory text
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          evaluationData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON object found in response')
        }
      } catch (fallbackError) {
        console.error('Failed to parse V3 evaluation response:', responseText.slice(0, 500))
        console.error('Fallback parse also failed:', fallbackError)
        return NextResponse.json(
          { error: 'Evaluation engine returned invalid response' },
          { status: 500 }
        )
      }
    }

    // Validate V3 required fields
    const requiredFields = [
      'authorial_control',
      'kathekon_assessment',
      'passions_detected',
      'katorthoma_proximity',
      'virtue_domains_engaged',
      'ruling_faculty_assessment',
      'improvement_path',
    ]
    for (const field of requiredFields) {
      if (evaluationData[field] === undefined) {
        return NextResponse.json(
          { error: `Missing V3 field: ${field}` },
          { status: 500 }
        )
      }
    }

    // Validate proximity level
    const validProximityLevels: KatorthomaProximityLevel[] = [
      'reflexive',
      'habitual',
      'deliberate',
      'principled',
      'sage_like',
    ]
    if (!validProximityLevels.includes(evaluationData.katorthoma_proximity)) {
      return NextResponse.json(
        { error: `Invalid katorthoma_proximity level: ${evaluationData.katorthoma_proximity}` },
        { status: 500 }
      )
    }

    const proximity = evaluationData.katorthoma_proximity as KatorthomaProximityLevel

    // Save to DB and get an ID for the badge URL
    const dbPayload = {
      mode: isPolicy ? 'policy' : 'document',
      content_title: title || null,
      content_text: truncated,
      word_count: wordCount,
      katorthoma_proximity: proximity,
      virtue_domains_engaged: evaluationData.virtue_domains_engaged,
      ruling_faculty_assessment: evaluationData.ruling_faculty_assessment,
      improvement_path: evaluationData.improvement_path,
      authorial_passions: evaluationData.passions_detected?.authorial_passions || [],
      reader_triggered_passions: evaluationData.passions_detected?.reader_triggered_passions || [],
      false_judgements: evaluationData.passions_detected?.false_judgements || [],
      within_control: evaluationData.authorial_control?.within_control || [],
      outside_control: evaluationData.authorial_control?.outside_control || [],
      is_kathekon: evaluationData.kathekon_assessment?.is_kathekon ?? false,
      kathekon_quality: evaluationData.kathekon_assessment?.quality || null,
      ...(isPolicy && {
        deliberation_assessment: evaluationData.deliberation_assessment || null,
        oikeiosis_impact: evaluationData.oikeiosis_impact || null,
        flagged_clauses: evaluationData.flagged_clauses || [],
      }),
      disclaimer: DOCUMENT_EVALUATIVE_DISCLAIMER,
    }

    const { data: record, error: dbError } = await supabaseAdmin
      .from('document_evaluations_v3')
      .insert(dbPayload)
      .select('id')
      .single()

    if (dbError) {
      console.error('DB error saving V3 evaluation:', dbError)
      // Still return the score even if DB fails — just without persistent badge
    }

    const scoreId = record?.id || 'preview'
    const badgeUrl = `${BASE_URL}/api/badge/${scoreId}`
    const proximityLabel = PROXIMITY_ENGLISH[proximity]
    const proximityColor = PROXIMITY_COLORS[proximity]
    const embedHtml = `<a href="${BASE_URL}/score/${scoreId}" target="_blank" rel="noopener"><img src="${badgeUrl}" alt="Stoic Evaluation: ${proximityLabel}" height="40" /></a>`

    // Build response object
    const result = {
      katorthoma_proximity: proximity,
      proximity_label: proximityLabel,
      virtue_domains_engaged: evaluationData.virtue_domains_engaged,
      ruling_faculty_assessment: evaluationData.ruling_faculty_assessment,
      improvement_path: evaluationData.improvement_path,
      authorial_control: evaluationData.authorial_control,
      kathekon_assessment: evaluationData.kathekon_assessment,
      passions_detected: evaluationData.passions_detected,
      document_title: title || undefined,
      word_count: wordCount,
      evaluated_at: new Date().toISOString(),
      badge_url: badgeUrl,
      embed_html: embedHtml,
      mode: isPolicy ? 'policy' : 'document',
      ...(isPolicy && {
        deliberation_assessment: evaluationData.deliberation_assessment,
        oikeiosis_impact: evaluationData.oikeiosis_impact,
        flagged_clauses: evaluationData.flagged_clauses || [],
      }),
    }

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'document_evaluation_v3',
        metadata: {
          evaluation_id: scoreId,
          proximity: proximity,
          mode: isPolicy ? 'policy' : 'document',
          word_count: wordCount,
        },
      })
      .then(() => {})

    // Build response with metadata envelope
    const envelope = buildEnvelope({
      result,
      endpoint: '/api/score-document',
      model: MODEL_DEEP,
      startTime,
      maxTokens: maxTokens,
      composability: {
        next_steps: ['/api/score-iterate'],
        recommended_action: 'Review the evaluation results and consider iterative refinement with /api/score-iterate.',
      },
    })

    return NextResponse.json(envelope, { headers: corsHeaders() })
  } catch (error) {
    console.error('Document evaluation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}
