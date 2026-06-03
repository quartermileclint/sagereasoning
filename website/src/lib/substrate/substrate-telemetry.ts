/**
 * substrate-telemetry.ts — A12 OpenTelemetry GenAI instrumentation for the
 * translation-sandwich substrate.
 *
 * Thin span layer over the existing /api/reason call path. Uses the OpenTelemetry
 * GenAI semantic conventions (https://opentelemetry.io/docs/specs/semconv/gen-ai/).
 *
 * DESIGN POSTURE — additive + flag-gated + no-op-safe:
 *   - The ENTIRE layer is gated behind SUBSTRATE_OTEL_ENABLED. When unset (the
 *     production default), every helper short-circuits before touching the OTel
 *     API — zero overhead, byte-identical behaviour.
 *   - When set, spans are created via @opentelemetry/api. If no SDK/provider is
 *     registered (see instrumentation.ts), the OTel API returns a no-op tracer
 *     and spans are created-but-not-exported — still harmless. A provider is
 *     registered only when the same flag is on (console exporter for the proof).
 *   - No helper ever throws into the caller: failures are swallowed (observability
 *     must never break the user's assessment). The substrate's response shape is
 *     never affected by anything in this file.
 *
 * PR6 BOUNDARY: this module instruments Layer 1 (extractFeatures), Layer 2
 * (applyMechanisms), and Layer 3 (generateProse) ONLY. It does NOT wrap the R20a
 * distress classifier, the A7 Zone-2 gate, or their wrappers. Instrumenting a
 * safety wrapper would reclassify A12 to Critical under PR6; this module stays
 * deliberately outside that perimeter. The audit writer records the distress
 * *decision* by reading already-produced output — it does not read the classifier.
 *
 * Rules served: AC10 (provenance/telemetry surface), R4 (operational fields only
 * on spans — no engine internals), PR1 (proof on /api/reason first), PR2 (the
 * helpers are called on the live path; grep confirms invocation), PR3 (synchronous
 * — no fire-and-forget; spans wrap awaited calls).
 */

import {
  trace,
  context,
  SpanStatusCode,
  SpanKind,
  type Span,
  type Attributes,
} from '@opentelemetry/api'

export const SUBSTRATE_TRACER_NAME = 'sagereasoning.substrate'

/**
 * Master flag for the A12 instrumentation. Mirrors the one-liner pattern of
 * isSubstrateR20aGateEnabled() / isSubstrateLayer3Enabled(). UNSET in production.
 */
export function isSubstrateOtelEnabled(): boolean {
  return process.env.SUBSTRATE_OTEL_ENABLED === 'true'
}

function tracer() {
  return trace.getTracer(SUBSTRATE_TRACER_NAME)
}

/**
 * Wrap the substrate run in an active root span so the layer spans emitted
 * inside runSandwichInner nest underneath it (OTel context propagates through
 * await within the same async context once a NodeSDK is registered).
 *
 * When the flag is off, returns fn() directly — no span, no overhead, no
 * behaviour change. Never alters fn()'s result or its thrown errors.
 */
export async function withSubstrateRootSpan<T>(
  correlationId: string,
  surface: string,
  fn: () => Promise<T>
): Promise<T> {
  if (!isSubstrateOtelEnabled()) return fn()

  let span: Span
  try {
    span = tracer().startSpan('substrate.reason', {
      kind: SpanKind.SERVER,
      attributes: {
        'gen_ai.operation.name': 'reason',
        'sage.correlation_id': correlationId,
        'sage.surface': surface,
      },
    })
  } catch {
    // Span creation failed (no provider, mis-config). Run uninstrumented.
    return fn()
  }

  // Make the root span active so child layer spans parent to it.
  const ctx = trace.setSpan(context.active(), span)
  try {
    const out = await context.with(ctx, fn)
    safe(() => span.setStatus({ code: SpanStatusCode.OK }))
    return out
  } catch (err) {
    safe(() => {
      span.recordException(err as Error)
      span.setStatus({ code: SpanStatusCode.ERROR })
    })
    throw err
  } finally {
    safe(() => span.end())
  }
}

export interface LayerSpanInput {
  /** e.g. 'substrate.layer1.extract_features' */
  name: string
  /** Date.now() captured immediately before the layer ran. */
  startMs: number
  /** Layer latency in ms (null → layer not run; span skipped). */
  latencyMs: number | null
  /** True for LLM layers (Layer 1, Layer 3) → GenAI conventions applied. */
  genAI: boolean
  /** Model string for GenAI layers, e.g. 'claude-sonnet-4-6'. */
  model?: string
  /** Per-layer marginal cost in microcents, when known (operational field). */
  costMicrocents?: number | null
  /** False when the layer threw / fell back. */
  ok: boolean
  /** Shared join key (loop_id / reason_id). */
  correlationId?: string
}

/**
 * Emit a retroactive span for a layer that has already completed. We already
 * have startMs + latencyMs in runSandwichInner, so we create the span with an
 * explicit start time and end it at start+latency. This is fully additive — a
 * single call after each layer's latency is recorded; it does NOT restructure
 * the existing try/catch control flow.
 *
 * No-op (and never throws) when the flag is off, latency is null, or span
 * creation fails.
 */
export function emitLayerSpan(input: LayerSpanInput): void {
  if (!isSubstrateOtelEnabled()) return
  if (input.latencyMs === null) return

  safe(() => {
    const startTime = input.startMs
    const endTime = input.startMs + (input.latencyMs as number)

    const attributes: Attributes = {
      'sage.layer': input.name,
      'sage.ok': input.ok,
    }
    if (input.correlationId) attributes['sage.correlation_id'] = input.correlationId
    if (typeof input.costMicrocents === 'number') {
      attributes['sage.cost_microcents'] = input.costMicrocents
    }
    if (input.genAI) {
      // OTel GenAI semantic conventions (experimental as of 2026).
      attributes['gen_ai.operation.name'] =
        input.name.includes('layer1') ? 'extract_features' : 'generate_prose'
      attributes['gen_ai.provider.name'] = 'anthropic'
      attributes['gen_ai.system'] = 'anthropic' // back-compat with older collectors
      if (input.model) attributes['gen_ai.request.model'] = input.model
      // NOTE: token counts are not exposed by SandwichRunResult on /api/reason
      // (only per-layer microcents). gen_ai.usage.{input,output}_tokens are
      // intentionally omitted here rather than reported as 0. Threading token
      // counts through SandwichRunResult is a deferred follow-on (PR7).
    }

    const span = tracer().startSpan(
      input.name,
      {
        kind: input.genAI ? SpanKind.CLIENT : SpanKind.INTERNAL,
        startTime,
        attributes,
      }
    )
    if (!input.ok) span.setStatus({ code: SpanStatusCode.ERROR })
    span.end(endTime)
  })
}

/**
 * Wrap a database write (the audit insert) in a child span. No-op + non-throwing
 * when the flag is off. Always returns fn()'s result unchanged.
 */
export async function withDbSpan<T>(
  name: string,
  correlationId: string,
  fn: () => Promise<T>
): Promise<T> {
  if (!isSubstrateOtelEnabled()) return fn()

  let span: Span | null = null
  try {
    span = tracer().startSpan(name, {
      kind: SpanKind.CLIENT,
      attributes: {
        'db.system': 'postgresql',
        'sage.correlation_id': correlationId,
      },
    })
  } catch {
    return fn()
  }

  try {
    const out = await fn()
    safe(() => span?.setStatus({ code: SpanStatusCode.OK }))
    return out
  } catch (err) {
    safe(() => {
      span?.recordException(err as Error)
      span?.setStatus({ code: SpanStatusCode.ERROR })
    })
    throw err
  } finally {
    safe(() => span?.end())
  }
}

/** Run a side-effecting OTel call; swallow any error so telemetry never throws. */
function safe(fn: () => void): void {
  try {
    fn()
  } catch {
    /* telemetry must never break the request path */
  }
}
