/**
 * r20a-classifier.ts — Phase D: LLM-assisted distress evaluator.
 *
 * Two-stage classifier per ADR-R20a-01:
 *   Stage 1 (regex): detectDistress() in guardrails.ts — fast, zero-cost
 *   Stage 2 (Haiku): evaluateBorderlineDistress() here — catches what regex misses
 *
 * Flow:
 *   1. detectDistress(input) runs regex patterns
 *   2. If regex detects acute/moderate → return immediately (no LLM needed)
 *   3. If regex detects nothing → call evaluateBorderlineDistress(input)
 *   4. Haiku evaluates whether the input contains distress signals the regex missed
 *   5. If Haiku says yes → return distress result with appropriate severity
 *   6. If Haiku fails (network, parse, timeout) → fail open, log alert, write marker row
 *
 * Inline mode: runs synchronously before the main reasoning LLM call.
 * Adds ~500ms latency on borderline inputs. Accepted tradeoff for safety.
 *
 * Cost: Haiku at ~200-400 input tokens + ~50 output tokens ≈ $0.00001/call
 *
 * Rules served: R20a (vulnerable user detection and redirection)
 *
 * @compliance
 * compliance_version: CR-2026-Q2-v4
 * regulatory_references: [CR-005]
 */

import Anthropic from '@anthropic-ai/sdk'
import { MODEL_FAST } from '@/lib/model-config'
import { logClassifierRun } from '@/lib/r20a-cost-tracker'
import type { DistressDetectionResult } from '@/lib/guardrails'

// ---------------------------------------------------------------------------
// Haiku evaluator prompt — minimal, focused
// ---------------------------------------------------------------------------

const CLASSIFIER_SYSTEM_PROMPT = `You are a safety classifier. Your ONLY job is to determine whether user text contains indicators of psychological distress, suicidal ideation, self-harm intent, or crisis states.

You are NOT diagnosing. You are flagging for human review.

Evaluate the text and return ONLY this JSON:
{
  "distress_detected": true/false,
  "severity": "none" | "mild" | "moderate" | "acute",
  "reasoning": "one sentence explaining your assessment"
}

Severity guide:
- "acute": explicit mention of suicide, self-harm plans, wanting to die, or saying goodbye
- "moderate": expressions of hopelessness, perceived burdensomeness, extreme isolation, neglect of basic needs
- "mild": severe emotional distress language, life feels meaningless/pointless
- "none": no distress indicators, or normal emotional language in context

Be conservative: if uncertain, flag as "mild" rather than "none". False positives are safe. False negatives are dangerous.

Return ONLY the JSON object. No explanation outside the JSON.`

// ---------------------------------------------------------------------------
// Output schema
// ---------------------------------------------------------------------------

interface ClassifierOutput {
  distress_detected: boolean
  severity: 'none' | 'mild' | 'moderate' | 'acute'
  reasoning: string
}

// ---------------------------------------------------------------------------
// Singleton client
// ---------------------------------------------------------------------------

let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

// ---------------------------------------------------------------------------
// Core evaluator
// ---------------------------------------------------------------------------

/**
 * Evaluate borderline input for distress signals using Haiku.
 * Called only when regex stage finds nothing — this catches nuanced phrasing.
 *
 * Fails open: if Haiku call fails, returns { distress_detected: false } and
 * logs an alert. The alert mechanism writes to console.warn (visible in Vercel logs)
 * and attempts to write a marker row to Supabase vulnerability_flag table.
 *
 * @param text - The user input text to evaluate
 * @param sessionId - Optional session ID for cost tracking
 * @returns DistressDetectionResult compatible with guardrails.ts
 */
export async function evaluateBorderlineDistress(
  text: string,
  sessionId?: string
): Promise<DistressDetectionResult> {
  const client = getClient()

  try {
    const message = await client.messages.create({
      model: MODEL_FAST,
      max_tokens: 150,
      temperature: 0,
      system: [{ type: 'text', text: CLASSIFIER_SYSTEM_PROMPT }],
      messages: [{ role: 'user', content: `Evaluate this text for distress indicators:\n\n${text}` }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse Haiku response
    let parsed: ClassifierOutput
    try {
      // Try bare parse first, then extract from braces
      try {
        parsed = JSON.parse(responseText.trim())
      } catch {
        const match = responseText.match(/\{[\s\S]*\}/)
        if (!match) throw new Error('No JSON object in response')
        parsed = JSON.parse(match[0])
      }
    } catch (parseError) {
      // LLM returned non-JSON — this is the session 13 failure mode.
      // Per audit F1: if the LLM's content safety layer returns non-JSON,
      // treat that as a distress signal, not a parse error.
      console.warn(
        '[R20a classifier] Haiku returned non-JSON — treating as potential distress signal.',
        `Response preview: ${responseText.slice(0, 200)}`
      )

      // Log the classifier run as an LLM failure
      logClassifierRunSafe({
        session_id: sessionId,
        rule_stage_hit: false,
        llm_stage_ran: true,
        llm_input_tokens: message.usage?.input_tokens,
        llm_output_tokens: message.usage?.output_tokens,
        severity_result: 2, // moderate — conservative assumption
        flag_written: true,
      })

      return {
        distress_detected: true,
        severity: 'moderate',
        indicators_found: ['llm_content_safety_triggered'],
        redirect_message: buildRedirectMessage('moderate'),
      }
    }

    // Validate severity value
    const validSeverities = ['none', 'mild', 'moderate', 'acute'] as const
    const severity = validSeverities.includes(parsed.severity as typeof validSeverities[number])
      ? (parsed.severity as typeof validSeverities[number])
      : 'mild' // Default to mild if unknown severity

    // Log the classifier run for cost tracking
    logClassifierRunSafe({
      session_id: sessionId,
      rule_stage_hit: false,
      llm_stage_ran: true,
      llm_input_tokens: message.usage?.input_tokens,
      llm_output_tokens: message.usage?.output_tokens,
      severity_result: severityToNumber(severity),
      flag_written: severity !== 'none',
    })

    if (!parsed.distress_detected || severity === 'none') {
      return { distress_detected: false, severity: 'none', indicators_found: [], redirect_message: null }
    }

    return {
      distress_detected: true,
      severity,
      indicators_found: [`haiku_evaluator: ${parsed.reasoning || 'flagged'}`],
      redirect_message: severity === 'acute' || severity === 'moderate'
        ? buildRedirectMessage(severity)
        : null, // mild: include resources in response but don't block
    }
  } catch (error) {
    // FAIL OPEN with alerting — per ADR-R20a-01 D6-c
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.warn(
      `[R20a ALERT] Classifier failed open. Input will proceed without LLM distress check. ` +
      `Error: ${errorMessage}. Input length: ${text.length} chars.`
    )

    // Write marker row for post-hoc rescoring
    writeClassifierDownMarker(text, errorMessage, sessionId)

    // Log the failed run
    logClassifierRunSafe({
      session_id: sessionId,
      rule_stage_hit: false,
      llm_stage_ran: false, // attempted but failed
      severity_result: 0,
      flag_written: false,
    })

    return { distress_detected: false, severity: 'none', indicators_found: [], redirect_message: null }
  }
}

// ---------------------------------------------------------------------------
// Combined detection — wraps both stages
// ---------------------------------------------------------------------------

import { detectDistress, getCrisisResources } from '@/lib/guardrails'

/**
 * Full two-stage distress detection.
 * Stage 1: regex (fast, zero cost)
 * Stage 2: Haiku evaluator (if regex finds nothing)
 *
 * Drop-in replacement for direct detectDistress() calls in routes.
 */
export async function detectDistressTwoStage(
  text: string,
  sessionId?: string
): Promise<DistressDetectionResult> {
  // Stage 1: regex
  const regexResult = detectDistress(text)

  if (regexResult.distress_detected) {
    // Regex caught it — log and return immediately, no LLM needed
    logClassifierRunSafe({
      session_id: sessionId,
      rule_stage_hit: true,
      llm_stage_ran: false,
      severity_result: severityToNumber(regexResult.severity),
      flag_written: regexResult.severity === 'acute' || regexResult.severity === 'moderate',
    })
    return regexResult
  }

  // Stage 2: Haiku evaluator for borderline inputs
  return evaluateBorderlineDistress(text, sessionId)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function severityToNumber(severity: string): number {
  switch (severity) {
    case 'acute': return 3
    case 'moderate': return 2
    case 'mild': return 1
    default: return 0
  }
}

function buildRedirectMessage(severity: 'acute' | 'moderate'): string {
  const resources = getCrisisResources()
  const resourceList = resources.resources
    .map((r: { name: string; contact: string; available: string }) =>
      `${r.name}: ${r.contact} (${r.available})`
    )
    .join('\n')

  if (severity === 'acute') {
    return `We've paused this evaluation because your words suggest you may be going through something very difficult right now.\n\n${resources.primary}\n${resourceList}\n\n${resources.closing}`
  }
  return `Before we continue, we want to make sure you're okay. Some of what you've described sounds like it might be weighing heavily on you.\n\n${resources.primary}\n${resourceList}\n\n${resources.closing}`
}

/**
 * Write a marker row to Supabase when the classifier fails.
 * Per ADR-R20a-01 D6-c: "classifier-down marker rows for post-hoc rescoring"
 * Fire-and-forget — failure here must never block the response.
 */
async function writeClassifierDownMarker(
  inputText: string,
  errorMessage: string,
  sessionId?: string
): Promise<void> {
  try {
    // Dynamic import to avoid circular dependency with supabase-server
    const { supabaseAdmin } = await import('@/lib/supabase-server')

    await supabaseAdmin
      .from('vulnerability_flag')
      .insert({
        session_id: sessionId || null,
        flag_type: 'classifier_down',
        // Hash the input — don't store raw user text in the flag table
        metadata: {
          error: errorMessage,
          input_length: inputText.length,
          timestamp: new Date().toISOString(),
          needs_rescoring: true,
        },
      })
  } catch (e) {
    // Absolutely cannot throw here — log and move on
    console.error('[R20a] Failed to write classifier-down marker:', e instanceof Error ? e.message : e)
  }
}

/**
 * Safe wrapper for logClassifierRun — never throws.
 */
function logClassifierRunSafe(run: Parameters<typeof logClassifierRun>[0]): void {
  try {
    // Fire and forget — don't await
    logClassifierRun(run).catch(e =>
      console.error('[R20a cost tracker] Background log failed:', e instanceof Error ? e.message : e)
    )
  } catch {
    // Swallow synchronous errors too
  }
}
