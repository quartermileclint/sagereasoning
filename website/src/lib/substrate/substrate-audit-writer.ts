/**
 * substrate-audit-writer.ts — A12 call-grain audit event writer.
 *
 * Writes one append-only row to substrate_audit_events per substrate run on an
 * instrumented surface (proof endpoint: /api/reason). The row is the DPIA
 * evidence surface (A16), the behavioural-baseline source (A19), and the AP2
 * provenance producer (F4 / AC10).
 *
 * SAFETY / PRIVACY CONTRACT (the load-bearing element):
 *   - masked_context contains STRUCTURAL fields ONLY: counts, booleans, enum-like
 *     codes. It NEVER contains raw input text, free-text findings, or intimate
 *     data (R3 + R17). maskContext() below is the single enforcement point and is
 *     unit-tested against free-text leakage.
 *   - The writer reads only structural fields of SandwichRunResult (error,
 *     tier1 trigger code, latencies, costs, gate severity, whether a Layer 3
 *     response exists). It does NOT read the prose/output free text, and it does
 *     NOT read the R20a classifier or its wrappers (PR6 boundary preserved — it
 *     records the *decision* from already-produced output, read-only).
 *
 * OPERATIONAL POSTURE:
 *   - Flag-gated behind SUBSTRATE_OTEL_ENABLED. When unset (production default),
 *     recordSubstrateAuditEvent() returns immediately without touching Supabase.
 *   - Isolated failure: unlike billing (fail-closed), the audit write is
 *     observability. If the insert fails, we log and return { ok: false } — we
 *     NEVER throw into the request path. A failed audit write must not fail the
 *     user's assessment.
 *   - The insert is awaited (KG1 — no fire-and-forget) and wrapped in a db span.
 *
 * Rules served: AC10, R0, R3, R4, R17, R19c/R19d, KG1, KG7, PR1, PR2, PR3, PR6.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { isSubstrateOtelEnabled, withDbSpan } from './substrate-telemetry'

// ---------------------------------------------------------------------------
// Types — the minimal structural view the writer needs. The route passes these
// explicitly; the writer never receives raw input text (only its length).
// ---------------------------------------------------------------------------

export type DecisionEvent =
  | 'assessment'
  | 'tier1_clarification'
  | 'r20a_redirect'
  | 'layer_throw'
  | 'signing_unavailable'
  | 'fallback'

export type SeverityBand = 'none' | 'mild' | 'moderate' | 'acute'

/**
 * Structural-only view of a completed substrate run. Deliberately NOT the full
 * SandwichRunResult — the caller projects only these safe fields so no free text
 * can reach the writer by construction.
 */
export interface SubstrateRunFacts {
  error: string | null
  tier1TriggerCode: string | null
  layer1LatencyMs: number | null
  layer2LatencyMs: number | null
  layer3LatencyMs: number | null
  layer1CostMicrocents: number | null
  layer3CostMicrocents: number | null
  gateSeverity: SeverityBand | null
  hasLayer3Response: boolean
  outputPresent: boolean
  /**
   * M1 CI-1 (2026-06-12): where the Layer-3 narrative was generated for this
   * run — 'inline' (hot path, today's shape) or 'deferred' (assessment-first;
   * generation completes post-response, retained in substrate_audit_narratives).
   * A structural enum, never free text (maskContext contract). OMITTED (not
   * null-emitted) when SUBSTRATE_L3_DEFER_ENABLED is unset so production audit
   * rows are unchanged until the founder's own activation step.
   */
  narrativeStatus?: 'inline' | 'deferred'
}

export interface RecordAuditEventParams {
  correlationId: string
  agentId: string | null
  surface: string
  /** Character count of the input — a COUNT, never the text itself (R3 + R17). */
  inputCharCount: number
  facts: SubstrateRunFacts
  modelsUsed: string[]
}

export type RecordAuditEventResult =
  | { ok: true; eventId: string | null }
  | { ok: false; skipped?: boolean; error?: string }

// ---------------------------------------------------------------------------
// Pure derivations (unit-tested)
// ---------------------------------------------------------------------------

/**
 * Map a completed run to its terminal decision_event (matches the SQL CHECK
 * constraint set). Read-only over structural fields.
 */
export function deriveDecisionEvent(f: SubstrateRunFacts): DecisionEvent {
  if (f.error === 'r20a_gate_redirect') return 'r20a_redirect'
  if (f.tier1TriggerCode !== null) return 'tier1_clarification'
  if (f.error === 'signing_throw') return 'signing_unavailable'
  if (
    f.error === 'layer1_throw' ||
    f.error === 'validation_throw' ||
    f.error === 'layer3_throw'
  ) {
    return 'layer_throw'
  }
  // error === null and output present → assessment, unless Layer 3 ran but
  // produced no cost (deterministic fallback prose path: LLM threw, fallback
  // succeeded → layer3 latency set, layer3 cost null).
  if (
    f.layer3LatencyMs !== null &&
    f.layer3CostMicrocents === null &&
    f.outputPresent
  ) {
    return 'fallback'
  }
  return 'assessment'
}

/**
 * AC10 / F4: provenance of the produced judgement, in a shape compatible with
 * downstream AP2-mandate-consuming agents. Operational fields only.
 */
export function buildProvenance(modelsUsed: string[]): Record<string, unknown> {
  return {
    substrate_version: 'translation-sandwich-v1',
    producer: 'sagereasoning.substrate',
    produced_at: new Date().toISOString(),
    models: modelsUsed,
    // Operational indicator only — whether signing is enabled on this deployment.
    // Does NOT read or expose the signature itself.
    layer2_signature_present:
      process.env.SUBSTRATE_LAYER2_SIGNING_ENABLED === 'true',
  }
}

/**
 * AC10 / F4: the AP2 "use_policies" analogue — how the produced output may be
 * used. Records standing limitations (R19c page + R19d mirror principle), the
 * not-advice posture, and whether a distress redirect governs this output.
 */
export function buildUsePolicies(decision: DecisionEvent): Record<string, unknown> {
  return {
    not_medical_or_legal_advice: true,
    mirror_principle: true, // R19d
    limitations_ref: '/limitations', // R19c
    distress_redirect_applies: decision === 'r20a_redirect',
  }
}

/**
 * The privacy-critical function. Produces STRUCTURAL context only. By
 * construction it can only emit counts, booleans, and enum-like codes — it has
 * no access to raw input text (only inputCharCount) and reads no prose.
 */
export function maskContext(
  params: RecordAuditEventParams,
  decision: DecisionEvent
): Record<string, unknown> {
  const f = params.facts
  return {
    input_char_count: params.inputCharCount,
    tier1_trigger_code: f.tier1TriggerCode, // enum-like code (e.g. 'ELEMENT_FUSION'), not free text
    layer3_fallback_used: decision === 'fallback',
    has_substrate_layer3_response: f.hasLayer3Response,
    engine_attribution: 'translation-sandwich',
    // M1 CI-1: structural enum; key absent entirely when the flag is unset
    // (production rows unchanged until activation).
    ...(f.narrativeStatus !== undefined
      ? { narrative_status: f.narrativeStatus }
      : {}),
  }
}

// ---------------------------------------------------------------------------
// Admin client (service role; bypasses RLS) — same lazy pattern as
// loop-cost-tracker.ts.
// ---------------------------------------------------------------------------

let _adminClient: SupabaseClient | null = null

function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error(
        '[substrate-audit-writer] Missing NEXT_PUBLIC_SUPABASE_URL or ' +
          'SUPABASE_SERVICE_ROLE_KEY; cannot create admin client.'
      )
    }
    _adminClient = createClient(url, key)
  }
  return _adminClient
}

// ---------------------------------------------------------------------------
// Writer
// ---------------------------------------------------------------------------

/**
 * Persist one append-only audit event for a completed substrate run.
 *
 * No-op (returns { ok: false, skipped: true }) when SUBSTRATE_OTEL_ENABLED is
 * unset — production default; Supabase is never touched. Isolated failure: any
 * error is logged and returned, NEVER thrown into the caller's request path.
 */
export async function recordSubstrateAuditEvent(
  params: RecordAuditEventParams
): Promise<RecordAuditEventResult> {
  if (!isSubstrateOtelEnabled()) {
    return { ok: false, skipped: true }
  }

  try {
    const decision = deriveDecisionEvent(params.facts)
    const row = {
      correlation_id: params.correlationId,
      agent_id: params.agentId,
      surface: params.surface,
      decision_event: decision,
      severity_band: params.facts.gateSeverity,
      layer1_latency_ms: params.facts.layer1LatencyMs,
      layer2_latency_ms: params.facts.layer2LatencyMs,
      layer3_latency_ms: params.facts.layer3LatencyMs,
      models_used: params.modelsUsed,
      provenance: buildProvenance(params.modelsUsed),
      use_policies: buildUsePolicies(decision),
      masked_context: maskContext(params, decision),
    }

    return await withDbSpan(
      'substrate.audit.insert',
      params.correlationId,
      async () => {
        const admin = getAdminClient()
        const { data, error } = await admin
          .from('substrate_audit_events')
          .insert(row)
          .select('event_id')
          .maybeSingle()

        if (error) {
          console.warn(
            '[substrate-audit-writer] audit insert failed (non-fatal): ' +
              error.message
          )
          return { ok: false, error: error.message }
        }
        return { ok: true, eventId: (data?.event_id as string) ?? null }
      }
    )
  } catch (err) {
    // Isolated — audit is observability, never fail-closed. Swallow + log.
    console.warn(
      '[substrate-audit-writer] audit write threw (non-fatal): ' +
        (err instanceof Error ? err.message : String(err))
    )
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
