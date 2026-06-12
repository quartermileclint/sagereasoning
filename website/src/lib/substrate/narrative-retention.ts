/**
 * narrative-retention.ts — CI-1 + CI-17 (mechanism-correction M1, 2026-06-12).
 *
 * Server-side retention of the Layer-3 audit narrative paired with its signed
 * Layer2Assessment, plus the prose-deferral decision guard. Implements the
 * founder's M1 elections (approved 2026-06-12):
 *
 *   - Election 1: flag SUBSTRATE_L3_DEFER_ENABLED, read at call time, UNSET in
 *     production → every export here is inert and /api/reason is byte-identical.
 *   - Election 3: respond-then-generate via waitUntil with a pending row written
 *     (awaited — KG1 rule 2) BEFORE the response; the narrative-sweep cron is the
 *     guarantee backstop (waitUntil is best-effort: cancelled on timeout, lost on
 *     crash). The Option-D billing ledger is NEVER mutated — a deferred Layer-3
 *     cost lands on the narrative row against the same correlation/loop id.
 *   - Election 4: table substrate_audit_narratives; 90-day retention; genuine
 *     hard deletion (by agent or correlation id + expiry purge); R17b app-level
 *     encryption ON for assessment + narrative (encryption-helpers /
 *     MENTOR_ENCRYPTION_KEY — ADR-ENCRYPTION-WIRING-01 Decisions 1–3; KG7:
 *     encryption meta passed as plain objects).
 *   - Election 5 (Critical guard): shouldDeferProse structurally excludes the
 *     mild-severity distress_signal — when the signal is in play, generation is
 *     inline and synchronous exactly as today. This module does NOT touch the
 *     R20a classifier, the A7 gate, the A5 wrapper, or the route's distress
 *     branches; it reads an already-attached assessment field.
 *
 * CI-17 (Q2, adopted 2026-06-12): "The narrative account is the record that
 * examination occurred. A verdict without a narrative account is a
 * classification, not an examination. The narrative must exist." Deferral moves
 * generation; it never suppresses it. Pure on-demand generation is a blocked
 * configuration.
 *
 * R18e: every retained narrative carries the Article-50 transparency notice,
 * stamped from layer3-service's exported constant (imported READ-ONLY — the A5
 * wrapper itself is untouched).
 *
 * Failure posture (mirrors substrate-audit-writer, NOT billing): retention is
 * never allowed to fail the user's assessment. Every function returns a
 * discriminated result; the ROUTE decides the fallback (a failed pending insert
 * on the deferral path falls back to inline generation so the existence
 * guarantee never depends on a write that didn't land).
 *
 * Rules served: B4/FX-13 correction, R17b/c/h/i, R18e, R18f (audit pairing),
 * KG1 (all writes awaited; lazy client), KG7, PR1 (/api/reason only), PR3, PR6
 * (guard posture), AC8.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  encryptForStorage,
  decryptFromStorage,
  type EncryptedField,
} from '@/lib/encryption-helpers'
import { R18E_ARTICLE_50_TRANSPARENCY_NOTICE } from '@/lib/substrate/layer3-service'
import {
  generateProse,
  generateFallbackProse,
  type Layer3Prose,
} from '@/lib/translation-sandwich/layer3-prose'
import { sonnetCostMicrocents } from '@/lib/translation-sandwich/parallel-run'
import type { Layer2Assessment } from '@/lib/translation-sandwich/layer2-mechanisms'
import type { SignedLayer2Assessment } from '@/lib/translation-sandwich/layer2-signer'

// ---------------------------------------------------------------------------
// Flag + retention constants (founder elections, 2026-06-12)
// ---------------------------------------------------------------------------

/** Election 4a: 90 days — SR-12 precedent. Extension is a future election. */
export const NARRATIVE_RETENTION_DAYS = 90

/** A pending row older than this is presumed orphaned (waitUntil cancelled or
 *  crashed) and is picked up by the sweep. */
export const PENDING_STALE_MINUTES = 10

/** Generation attempts before a row rests at 'failed' (sweep stops retrying). */
export const MAX_GENERATION_ATTEMPTS = 3

/**
 * Election 1 (flag reader) + election 5 (the structural distress guard) are
 * DEFINED in parallel-run.ts — the orchestrator is where they bite, and this
 * module already imports from parallel-run (sonnetCostMicrocents), so defining
 * them here would create an import cycle. Re-exported for the route + tests so
 * there is exactly one decision point.
 */
export {
  isL3DeferEnabled,
  shouldDeferProse,
} from '@/lib/translation-sandwich/parallel-run'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The assessment as retained: signed wrapper when signing is enabled (the
 *  R18f audit-pairing artifact), bare otherwise. */
export type RetainableAssessment = Layer2Assessment | SignedLayer2Assessment

export type GenerationMode = 'inline' | 'deferred' | 'sweep'

export type RetentionWriteResult =
  | { ok: true }
  | { ok: false; error: string }

export interface NarrativeGenerationOutcome {
  prose: Layer3Prose
  source: 'llm' | 'fallback'
  costMicrocents: number | null
  latencyMs: number
}

export interface SweepReport {
  completed: number
  failed: number
  pending_remaining: number
  expired_deleted: number
  errors: string[]
}

// ---------------------------------------------------------------------------
// Lazy admin client (service role; bypasses RLS) — the parallel-run pattern:
// created inside functions, never at module load.
// ---------------------------------------------------------------------------

function getAdminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ---------------------------------------------------------------------------
// Pure helpers (no I/O — unit-testable without a DB)
// ---------------------------------------------------------------------------

/** Unwrap a stored assessment to the bare Layer2Assessment generateProse needs.
 *  A SignedLayer2Assessment is `{ assessment, signature, key_id }`. */
export function unwrapAssessment(stored: RetainableAssessment): Layer2Assessment {
  if (
    typeof stored === 'object' &&
    stored !== null &&
    'assessment' in stored &&
    'signature' in stored
  ) {
    return (stored as SignedLayer2Assessment).assessment
  }
  return stored as Layer2Assessment
}

/** retain_until per election 4a. Exported for tests. */
export function computeRetainUntil(from: Date): Date {
  return new Date(from.getTime() + NARRATIVE_RETENTION_DAYS * 24 * 60 * 60 * 1000)
}

/** Encrypted column pair for a row (R17b). KG7: meta is a plain object. */
export function buildEncryptedColumns(
  value: object
): { ciphertext: string; encryption_meta: EncryptedField['meta'] } {
  const enc = encryptForStorage(value)
  return { ciphertext: enc.ciphertext, encryption_meta: enc.meta }
}

/** Decrypt an encrypted column pair back to its object. */
export function decryptColumns<T>(
  ciphertext: string,
  meta: EncryptedField['meta']
): T {
  return JSON.parse(decryptFromStorage({ ciphertext, meta })) as T
}

// ---------------------------------------------------------------------------
// Narrative generation (LLM with deterministic fallback — never throws)
// ---------------------------------------------------------------------------

/**
 * Generate the narrative for an assessment. LLM first; on throw, the
 * deterministic fallback (ADR-007 §6). Returns null only if BOTH paths threw
 * (catastrophic — caller marks the row 'failed'; the sweep retries).
 */
export async function generateNarrativeForAssessment(
  assessment: Layer2Assessment
): Promise<NarrativeGenerationOutcome | null> {
  const start = Date.now()
  try {
    const result = await generateProse(assessment, { consumer: 'api_reason' })
    return {
      prose: result.prose,
      source: 'llm',
      costMicrocents: sonnetCostMicrocents(
        result.usage.input_tokens,
        result.usage.output_tokens
      ),
      latencyMs: Date.now() - start,
    }
  } catch (err) {
    console.warn(
      '[narrative-retention] generateProse threw; using deterministic fallback:',
      err instanceof Error ? err.message : err
    )
    try {
      const prose = generateFallbackProse(assessment)
      return {
        prose,
        source: 'fallback',
        costMicrocents: null, // no LLM call — same convention as the orchestrator
        latencyMs: Date.now() - start,
      }
    } catch (fallbackErr) {
      console.warn(
        '[narrative-retention] fallback prose ALSO threw:',
        fallbackErr instanceof Error ? fallbackErr.message : fallbackErr
      )
      return null
    }
  }
}

// ---------------------------------------------------------------------------
// Writers (every write awaited — KG1 rule 2; isolated failure posture)
// ---------------------------------------------------------------------------

/**
 * Write the pending row BEFORE the response on the deferral path. If this
 * insert fails the caller MUST fall back to inline generation — the existence
 * guarantee never rides on a write that didn't land (CI-17).
 */
export async function insertPendingNarrative(params: {
  correlationId: string
  agentId: string | null
  assessment: RetainableAssessment
}): Promise<RetentionWriteResult> {
  try {
    const encrypted = buildEncryptedColumns(params.assessment)
    const { error } = await getAdminClient()
      .from('substrate_audit_narratives')
      .insert({
        correlation_id: params.correlationId,
        agent_id: params.agentId,
        surface: 'api_reason',
        consumer: 'api_reason',
        narrative_status: 'pending',
        generation_mode: 'deferred',
        assessment_ciphertext: encrypted.ciphertext,
        assessment_encryption_meta: encrypted.encryption_meta, // plain object — KG7
        retain_until: computeRetainUntil(new Date()).toISOString(),
      })
    if (error) {
      console.warn('[narrative-retention] pending insert failed:', error.message)
      return { ok: false, error: error.message }
    }
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[narrative-retention] pending insert threw:', msg)
    return { ok: false, error: msg }
  }
}

/**
 * One-shot retained row for the INLINE path (election 4d: every examination is
 * retained when the flag is on). The prose was already generated in the hot
 * path and delivered to the consumer; a failure here is logged and surfaced in
 * the result but never fails the response (existence is satisfied client-side;
 * the retention gap stays visible in A12).
 */
export async function insertRetainedNarrative(params: {
  correlationId: string
  agentId: string | null
  assessment: RetainableAssessment
  prose: Layer3Prose
  proseSource: 'llm' | 'fallback'
  layer3CostMicrocents: number | null
  layer3LatencyMs: number | null
}): Promise<RetentionWriteResult> {
  try {
    const assessmentCols = buildEncryptedColumns(params.assessment)
    const narrativeCols = buildEncryptedColumns(params.prose)
    const { error } = await getAdminClient()
      .from('substrate_audit_narratives')
      .insert({
        correlation_id: params.correlationId,
        agent_id: params.agentId,
        surface: 'api_reason',
        consumer: 'api_reason',
        narrative_status: 'retained',
        generation_mode: 'inline',
        attempts: 1,
        assessment_ciphertext: assessmentCols.ciphertext,
        assessment_encryption_meta: assessmentCols.encryption_meta,
        narrative_ciphertext: narrativeCols.ciphertext,
        narrative_encryption_meta: narrativeCols.encryption_meta,
        article50_notice: R18E_ARTICLE_50_TRANSPARENCY_NOTICE,
        prose_source: params.proseSource,
        layer3_cost_usd_microcents: params.layer3CostMicrocents,
        layer3_latency_ms: params.layer3LatencyMs,
        generated_at: new Date().toISOString(),
        retain_until: computeRetainUntil(new Date()).toISOString(),
      })
    if (error) {
      console.warn('[narrative-retention] retained insert failed:', error.message)
      return { ok: false, error: error.message }
    }
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[narrative-retention] retained insert threw:', msg)
    return { ok: false, error: msg }
  }
}

/**
 * Complete a pending narrative: generate the prose and UPDATE the row to
 * 'retained' (or 'failed' when both generation paths threw). Used by the
 * route's waitUntil (mode 'deferred'), the route's synchronous fallback after
 * a failed pending insert is NOT this function (that path generates inline and
 * uses insertRetainedNarrative), and the sweep (mode 'sweep').
 *
 * The deferred Layer-3 cost is recorded HERE, against the same correlation /
 * loop id — the Option-D billing ledger is never touched (election 3).
 */
export async function completeNarrative(params: {
  correlationId: string
  assessment: Layer2Assessment
  mode: Extract<GenerationMode, 'deferred' | 'sweep'>
  currentAttempts?: number
}): Promise<RetentionWriteResult> {
  const attempts = (params.currentAttempts ?? 0) + 1
  const generated = await generateNarrativeForAssessment(params.assessment)

  try {
    if (generated === null) {
      const { error } = await getAdminClient()
        .from('substrate_audit_narratives')
        .update({ narrative_status: 'failed', attempts })
        .eq('correlation_id', params.correlationId)
      if (error) {
        console.warn('[narrative-retention] failed-mark update failed:', error.message)
        return { ok: false, error: error.message }
      }
      return { ok: false, error: 'generation_failed' }
    }

    const narrativeCols = buildEncryptedColumns(generated.prose)
    const { error } = await getAdminClient()
      .from('substrate_audit_narratives')
      .update({
        narrative_status: 'retained',
        generation_mode: params.mode,
        attempts,
        narrative_ciphertext: narrativeCols.ciphertext,
        narrative_encryption_meta: narrativeCols.encryption_meta,
        article50_notice: R18E_ARTICLE_50_TRANSPARENCY_NOTICE,
        prose_source: generated.source,
        layer3_cost_usd_microcents: generated.costMicrocents,
        layer3_latency_ms: generated.latencyMs,
        generated_at: new Date().toISOString(),
      })
      .eq('correlation_id', params.correlationId)
    if (error) {
      console.warn('[narrative-retention] completion update failed:', error.message)
      return { ok: false, error: error.message }
    }
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[narrative-retention] completion threw:', msg)
    return { ok: false, error: msg }
  }
}

// ---------------------------------------------------------------------------
// Sweep (the CI-17 guarantee backstop) + retention-expiry purge
// ---------------------------------------------------------------------------

/**
 * Complete orphaned narratives: 'pending' older than PENDING_STALE_MINUTES
 * (waitUntil cancelled/crashed) and 'failed' with attempts <
 * MAX_GENERATION_ATTEMPTS. Generation is capped per invocation (LLM calls at
 * ~12–20s each inside the cron's maxDuration); the report names what remains —
 * no silent caps.
 */
export async function sweepNarratives(opts: {
  maxGenerations: number
}): Promise<Omit<SweepReport, 'expired_deleted'>> {
  const report: Omit<SweepReport, 'expired_deleted'> = {
    completed: 0,
    failed: 0,
    pending_remaining: 0,
    errors: [],
  }
  try {
    const staleBefore = new Date(
      Date.now() - PENDING_STALE_MINUTES * 60 * 1000
    ).toISOString()

    const { data, error } = await getAdminClient()
      .from('substrate_audit_narratives')
      .select(
        'correlation_id, attempts, narrative_status, created_at, assessment_ciphertext, assessment_encryption_meta'
      )
      .or(
        `and(narrative_status.eq.pending,created_at.lt.${staleBefore}),` +
          `and(narrative_status.eq.failed,attempts.lt.${MAX_GENERATION_ATTEMPTS})`
      )
      .order('created_at', { ascending: true })

    if (error) {
      report.errors.push(`sweep select failed: ${error.message}`)
      return report
    }
    const rows = data ?? []
    const toProcess = rows.slice(0, opts.maxGenerations)
    report.pending_remaining = rows.length - toProcess.length

    for (const row of toProcess) {
      try {
        const stored = decryptColumns<RetainableAssessment>(
          row.assessment_ciphertext as string,
          row.assessment_encryption_meta as EncryptedField['meta']
        )
        const result = await completeNarrative({
          correlationId: row.correlation_id as string,
          assessment: unwrapAssessment(stored),
          mode: 'sweep',
          currentAttempts: (row.attempts as number) ?? 0,
        })
        if (result.ok) {
          report.completed += 1
        } else {
          report.failed += 1
          report.errors.push(`${row.correlation_id}: ${result.error}`)
        }
      } catch (err) {
        report.failed += 1
        report.errors.push(
          `${row.correlation_id}: ${err instanceof Error ? err.message : String(err)}`
        )
      }
    }
    return report
  } catch (err) {
    report.errors.push(err instanceof Error ? err.message : String(err))
    return report
  }
}

/** R17c expiry: genuinely (hard) delete rows past retain_until. */
export async function purgeExpiredNarratives(): Promise<{
  deleted: number
  error: string | null
}> {
  try {
    const { data, error } = await getAdminClient()
      .from('substrate_audit_narratives')
      .delete()
      .lt('retain_until', new Date().toISOString())
      .select('narrative_id')
    if (error) return { deleted: 0, error: error.message }
    return { deleted: data?.length ?? 0, error: null }
  } catch (err) {
    return { deleted: 0, error: err instanceof Error ? err.message : String(err) }
  }
}

// ---------------------------------------------------------------------------
// R17c genuine-deletion paths (admin-performed in M1 — election 4b; a public
// subject-initiated endpoint is Critical and its own later session)
// ---------------------------------------------------------------------------

export async function deleteNarrativesByAgentId(
  agentId: string
): Promise<{ deleted: number; error: string | null }> {
  try {
    const { data, error } = await getAdminClient()
      .from('substrate_audit_narratives')
      .delete()
      .eq('agent_id', agentId)
      .select('narrative_id')
    if (error) return { deleted: 0, error: error.message }
    return { deleted: data?.length ?? 0, error: null }
  } catch (err) {
    return { deleted: 0, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function deleteNarrativeByCorrelationId(
  correlationId: string
): Promise<{ deleted: number; error: string | null }> {
  try {
    const { data, error } = await getAdminClient()
      .from('substrate_audit_narratives')
      .delete()
      .eq('correlation_id', correlationId)
      .select('narrative_id')
    if (error) return { deleted: 0, error: error.message }
    return { deleted: data?.length ?? 0, error: null }
  } catch (err) {
    return { deleted: 0, error: err instanceof Error ? err.message : String(err) }
  }
}
