/**
 * harness-extractors.ts — Trust Layer S8: the REAL extraction seams (the "same
 * deterministic engine" the mentor A7/§4 names), wired against the live Sonnet
 * Layer-1 machinery. The first live implementations of the injectable seams the
 * S6/S7 pure cores left (`DiscernmentExtractor`, `L4TraceExtractor`).
 *
 * BINDING SPECS: mentor A7 (the L4 audit runs OUT-OF-BAND on the orchestrator's
 * reasoning TRACE, "extracted by the same deterministic engine ... the
 * orchestrator does not control the extraction"); ADR-013 §4 L2 Q2.4 (circle
 * alignment — "purpose misalignment is a dikaiosyne risk, not a capability
 * failure"). Where this file and the verbatim record diverge, the record wins.
 *
 * ─── Channel-law classification (ADR-011) ────────────────────────────────────
 * Both extractors are the INSTRUMENT channel: the server runs them on the inputs
 * it is given (the trace text; the candidate's DECLARED purpose text). Neither
 * injects anything; neither asks the agent to act. There is no code path by
 * which anyone supplies SIGNALS directly (the S7 structural discipline: signals
 * only ever come out of the deterministic reading of an extraction) — but note
 * the honest scope of "never self-report": WITHIN THE REFERENCE HARNESS the
 * trace is the transcript tail the hook read out-of-band; AT THE ROUTE BOUNDARY
 * the trace text is caller-supplied under the authed credential, so credential
 * isolation is what keeps the orchestrator from authoring its own trace (the
 * disclosed A7 server-boundary posture — see the route handler header; a
 * hook-authenticated trace channel is the structural closure, a named follow-up).
 *
 * ─── Model selection (AC1) ───────────────────────────────────────────────────
 * `extractFeatures` is the live Layer-1 extraction: one bounded Sonnet call
 * (MODEL_DEEP, max_tokens 4000, temp 0.2) — the AC1 "Layer 1 translation →
 * Sonnet" row. No new prompt, no new model contract (PR15): the extractor
 * REUSES the shared LAYER1_SYSTEM_PROMPT machinery unchanged.
 *
 * ─── Fail posture (KG1 / R18f-parallel) ──────────────────────────────────────
 * The L4 extractor THROWS on: an empty trace (no out-of-band artifact), a
 * Layer-1 failure, a Tier-1 short-circuit (an ambiguous trace cannot be cleanly
 * audited), or a signing failure (no verifiable artifact ⇒ no audit). The S7
 * caller (`runL4PassionAudit`) converts every throw into `audit-unavailable` ⇒
 * the selection HOLDS — never a fabricated clean pass. The discernment
 * extractor's throws are absorbed per-candidate by the S6 seam (structural
 * default; never blocks the discernment) — the disclosed asymmetry: L4 fails
 * toward HOLD (safety), Q2.4 fails toward the structural default (a fit
 * refinement, not a gate).
 *
 * ─── Cost surface (R5, disclosed) ────────────────────────────────────────────
 * Each extractor call is one live Sonnet request. The factories accumulate
 * `usage` so the caller can surface honest token counts. Loop metering for the
 * discernment surface is a NAMED FOLLOW-UP (the loop_billing_events `surface`
 * CHECK needs a founder-walked widening — the CI-10 precedent); until then the
 * surface is DARK (flag-off ⇒ 503 ⇒ zero spend).
 */

import { createHash } from 'node:crypto'

import {
  extractFeatures as realExtractFeatures,
  type ExtractInput,
  type Layer1Schema,
  type LayerTokenUsage,
} from '@/lib/translation-sandwich/layer1-extractor'
import {
  applyMechanisms as realApplyMechanisms,
  type ApplyOptions,
  type Layer2Assessment,
  type Tier1ShortCircuit,
} from '@/lib/translation-sandwich/layer2-mechanisms'
import {
  signLayer2Assessment as realSignLayer2Assessment,
  type SignedLayer2Assessment,
} from '@/lib/translation-sandwich/layer2-signer'

import type { DiscernmentExtractor } from './discernment-engine'
import {
  l4TraceFeaturesFromLayer1,
  mapTraceFeaturesToL4Signals,
  type L4MappingContext,
  type L4TraceExtractor,
  type OrchestratorReasoningTrace,
} from './l4-passion-audit'
import type { L4Signals } from './collaboration-record'
import type { OikeiosisCircle } from './profiles'

// ════════════════════════════════════════════════════════════════════════════
// Injectable dependencies (tests inject fakes; production uses the live machinery)
// ════════════════════════════════════════════════════════════════════════════

/** The minimal extraction result the extractors need (a subset of the live
 *  `ExtractFeaturesResult` — decoupled so a test fake stays small). */
export interface ExtractionLike {
  schema: Layer1Schema
  usage: LayerTokenUsage
}

export interface RealExtractorDeps {
  /** The Layer-1 extraction (default: the live `extractFeatures` — one Sonnet call). */
  extract?: (params: ExtractInput) => Promise<ExtractionLike>
  /** The deterministic Layer-2 engine (default: the live `applyMechanisms`). */
  apply?: (schema: Layer1Schema, options?: ApplyOptions) => Layer2Assessment | Tier1ShortCircuit
  /** The Ed25519 signer (default: the live `signLayer2Assessment`; THROWS when the
   *  signing key is unavailable — the R18f-parallel fail-toward-HOLD direction). */
  sign?: (assessment: Layer2Assessment) => SignedLayer2Assessment
}

const LIVE_DEPS: Required<RealExtractorDeps> = {
  extract: realExtractFeatures,
  apply: realApplyMechanisms,
  sign: realSignLayer2Assessment,
}

/** Accumulated Anthropic usage across an extractor's calls (honest cost surface). */
export interface ExtractorUsage {
  input_tokens: number
  output_tokens: number
  calls: number
}

// ════════════════════════════════════════════════════════════════════════════
// Shared artifact-ref rule (R18f-parallel linkage)
// ════════════════════════════════════════════════════════════════════════════

/**
 * The canonical ref for a signed Layer-2 assessment artifact: a prefix + the
 * signing key id + the first 32 hex chars of sha256(signature). Pure +
 * recomputable from the stored envelope, so a ref in a trust record / an
 * L4AuditResult is verifiably linkable to the durable artifact (the harness's
 * observability JSONL stores the envelope; this ref names it).
 */
export function signedAssessmentRef(signed: SignedLayer2Assessment, prefix = 'sig'): string {
  const digest = createHash('sha256').update(signed.signature).digest('hex').slice(0, 32)
  return `${prefix}:${signed.key_id}:${digest}`
}

/** The L4 trace-artifact ref (the `traceRef` inside an L4AuditResult). */
export function l4TraceRefFor(signed: SignedLayer2Assessment): string {
  return signedAssessmentRef(signed, 'l4')
}

// ════════════════════════════════════════════════════════════════════════════
// The REAL L4 trace extractor (mentor A7 — S7's injected seam)
// ════════════════════════════════════════════════════════════════════════════

/** A durable artifact the caller stores (the harness appends it to its
 *  observability JSONL; the L4AuditResult's traceRef names it). */
export interface L4ExtractionArtifact {
  kind: 'l4-trace-extraction'
  traceRef: string
  signed: SignedLayer2Assessment
}

export interface RealL4TraceExtractor extends L4TraceExtractor {
  /** The signed extraction artifacts captured this instance (typically one). The
   *  caller persists them durably; the traceRef inside the L4AuditResult is
   *  recomputable from the envelope via `l4TraceRefFor`. */
  readonly artifacts: L4ExtractionArtifact[]
  readonly usage: ExtractorUsage
}

/** The fixed extraction context for a trace read. Declarative, not imperative —
 *  it tells the extractor WHAT the text is, never what to conclude. */
const L4_TRACE_CONTEXT =
  'This text is the recorded reasoning trace of an orchestrating AI agent selecting a ' +
  'sub-agent for a task (captured by the harness, not authored as a self-report).'

/**
 * Build the REAL out-of-band L4 trace extractor (mentor A7): the pipeline the S7
 * core documents — `extractFeatures(trace) |> l4TraceFeaturesFromLayer1 |>
 * mapTraceFeaturesToL4Signals` — plus the R18f-parallel signed artifact: the
 * deterministic Layer-2 assessment of the SAME extraction, Ed25519-signed; its
 * ref becomes the L4AuditResult's `traceRef`.
 *
 * The mapping context (the pre-formed-preference corroborators derived from the
 * orchestrator profile + the CHOSEN candidate — never from self-report) is bound
 * at construction: one extractor instance per audit.
 *
 * THROWS (⇒ S7 `audit-unavailable` ⇒ HOLD — never fabricate):
 *   - empty/blank `reasoningTrace` (the harness supplied no out-of-band trace);
 *   - any Layer-1 failure (network / validation / injection-defence);
 *   - a Tier-1 short-circuit (an ambiguous trace halts the engine — it cannot be
 *     cleanly audited; the conservative direction);
 *   - a signing failure (`SubstrateSigningKeyMissingError` — no verifiable
 *     artifact ⇒ no audit result).
 */
export function makeRealL4TraceExtractor(
  mappingContext: L4MappingContext,
  deps?: RealExtractorDeps,
): RealL4TraceExtractor {
  const d = { ...LIVE_DEPS, ...(deps ?? {}) }
  const artifacts: L4ExtractionArtifact[] = []
  const usage: ExtractorUsage = { input_tokens: 0, output_tokens: 0, calls: 0 }

  return {
    artifacts,
    usage,
    async extractL4Signals(args: {
      trace: OrchestratorReasoningTrace
    }): Promise<{ signals: L4Signals; traceRef: string; note?: string }> {
      const traceText = (args.trace.reasoningTrace ?? '').trim()
      if (traceText === '') {
        throw new Error(
          'no out-of-band reasoning trace supplied — the harness Observability layer did not ' +
            'capture the orchestrator trace; the audit cannot run (never self-report the channel)',
        )
      }

      const extraction = await d.extract({ input: traceText, context: L4_TRACE_CONTEXT })
      usage.input_tokens += extraction.usage.input_tokens
      usage.output_tokens += extraction.usage.output_tokens
      usage.calls += 1

      // The deterministic Layer-2 reading of the SAME extraction, signed — the
      // R18f-parallel verifiable artifact behind the traceRef. No options ⇒ the
      // env-resolved live behaviour (§4 dikaiosyne weighting on in production).
      const l2 = d.apply(extraction.schema)
      if ('tier1_trigger' in l2) {
        throw new Error(
          `the deterministic engine short-circuited on the trace (Tier-1 ${l2.tier1_trigger.trigger_code}) — ` +
            'an ambiguous trace cannot be cleanly audited; the audit is unavailable (conservative HOLD)',
        )
      }
      const signed = d.sign(l2) // throws when the signing key is unavailable ⇒ HOLD

      const traceRef = l4TraceRefFor(signed)
      artifacts.push({ kind: 'l4-trace-extraction', traceRef, signed })

      const signals = mapTraceFeaturesToL4Signals(
        l4TraceFeaturesFromLayer1(extraction.schema),
        mappingContext,
      )
      return {
        signals,
        traceRef,
        note:
          'out-of-band Sonnet Layer-1 extraction of the recorded trace; deterministic signal ' +
          'mapping (mapTraceFeaturesToL4Signals); signed Layer-2 artifact retained by the caller',
      }
    },
  }
}

// ════════════════════════════════════════════════════════════════════════════
// The REAL discernment extractor (S6's L2 Q2.4 circle-alignment seam)
// ════════════════════════════════════════════════════════════════════════════

export interface RealDiscernmentExtractor extends DiscernmentExtractor {
  readonly usage: ExtractorUsage
}

/** The canonical Layer-1 oikeiosis circle vocabulary, ordered narrow → wide. */
const CIRCLE_RANK: Record<string, number> = {
  self_preservation: 0,
  household: 1,
  local_community: 2,
  political_community: 3,
  cosmopolis: 4,
}

/** Task-circle names that read as SELF-directed after normalization. */
const SELF_CIRCLE_NAMES = new Set(['self', 'self_preservation'])

function normalizeCircleName(c: string): string {
  return c.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_')
}

const DISCERNMENT_PURPOSE_CONTEXT =
  'This text is the declared purpose of a candidate AI agent being considered for a delegated task.'

/**
 * Build the REAL discernment extractor (L2 Q2.4 — circle alignment). REUSES the
 * same Layer-1 machinery (PR15 — no bespoke LLM contract): the candidate's
 * declared PURPOSE text is extracted, and the circles it engages are compared
 * against the task's circles by a deterministic, DISCLOSED rule:
 *
 *   MISALIGNED requires POSITIVE evidence — the purpose engages ONLY the
 *   self-preservation circle while the task serves other-directed circles (the
 *   canonical dikaiosyne-risk misalignment: a purely self-directed purpose
 *   against an other-directed task). Anything else reads ALIGNED — matching the
 *   S6 structural default's direction (misalignment is a finding, not a
 *   presumption). A purpose whose extraction engages NO circles throws, and the
 *   S6 seam falls back to the structural default (never blocks discernment).
 *
 * The rank mapping + the misalignment rule are DERIVED monotone conveniences
 * (the mentor fixes Q2.4's meaning — purpose misalignment is a dikaiosyne risk —
 * not this primitive mapping); tunable pending S9, exactly as S2–S7 disclosed.
 *
 * `assessConditionMatch` is DELIBERATELY OMITTED (the optional Q2.2 refinement):
 * the S6 structural set-overlap default stands. Layer-1 has no conditions
 * concept, and a bespoke LLM contract for a marginal fit refinement fails PR15.
 */
export function makeRealDiscernmentExtractor(deps?: RealExtractorDeps): RealDiscernmentExtractor {
  const d = { ...LIVE_DEPS, ...(deps ?? {}) }
  const usage: ExtractorUsage = { input_tokens: 0, output_tokens: 0, calls: 0 }

  return {
    usage,
    async assessCircleAlignment(args: {
      candidatePurpose: string
      taskCircles: OikeiosisCircle[]
    }): Promise<{ alignment: 'aligned' | 'misaligned'; note?: string }> {
      const purpose = (args.candidatePurpose ?? '').trim()
      if (purpose === '') {
        throw new Error('empty candidate purpose — nothing to read (structural default applies)')
      }

      const extraction = await d.extract({ input: purpose, context: DISCERNMENT_PURPOSE_CONTEXT })
      usage.input_tokens += extraction.usage.input_tokens
      usage.output_tokens += extraction.usage.output_tokens
      usage.calls += 1

      const engaged = extraction.schema.oikeiosis_circles_engaged
        .map((c) => normalizeCircleName(String(c.circle)))
        .filter((c) => c in CIRCLE_RANK)
      if (engaged.length === 0) {
        throw new Error(
          'the purpose extraction engaged no oikeiosis circles — unreadable (structural default applies)',
        )
      }

      const purposeWidest = Math.max(...engaged.map((c) => CIRCLE_RANK[c]))
      const taskWantsOthers = args.taskCircles.some(
        (c) => !SELF_CIRCLE_NAMES.has(normalizeCircleName(c)),
      )

      const misaligned = purposeWidest === 0 && taskWantsOthers
      return {
        alignment: misaligned ? 'misaligned' : 'aligned',
        note: misaligned
          ? `purpose engages only self_preservation while the task serves other-directed circle(s) ` +
            `[${args.taskCircles.join(', ')}] — a dikaiosyne risk (Q2.4)`
          : `purpose engages [${engaged.join(', ')}] (widest rank ${purposeWidest}); no positive ` +
            `misalignment evidence against task circles [${args.taskCircles.join(', ')}]`,
      }
    },
  }
}
