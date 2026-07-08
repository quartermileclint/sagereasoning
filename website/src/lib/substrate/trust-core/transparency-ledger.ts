/**
 * transparency-ledger.ts — Trust Layer S4: the mentor A4 transparency ratio, as
 * pure deterministic functions. MEASURE mode (tracked + surfaced; never binds).
 *
 * BINDING SPEC (mentor A4, verbatim in
 * operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md;
 * ADR-013 §5 A4). Where this file and the ADR diverge, the VERBATIM RECORD WINS.
 *
 * ─── What makes an output examinable — three descending grades ───────────────
 * "A signed reasoning trace — the structured output of the deterministic engine
 *  showing the causal sequence … reproducible and tamper-evident. [strongest]
 *  Stated uncertainty — explicit confidence levels and flagged unknowns in the
 *  output itself … weaker than a signed trace but stronger than a bare conclusion.
 *  A structured verdict without a full trace — the proximity level and domain
 *  breakdown without the underlying reasoning. This is the MINIMUM examinability
 *  threshold. A bare conclusion with no verdict structure is NOT examinable."
 *
 * ─── The functional threshold (the independence-principle flag) ──────────────
 * "Can the orchestrating agent, given the outputs it has received, run a
 *  re-examination of the sub-agent's reasoning WITHOUT requiring the sub-agent to
 *  re-run the task? Operationally: if the output contains a signed trace, the
 *  threshold is MET. If the output contains stated uncertainty and a structured
 *  verdict, the threshold is met at REDUCED confidence. If the output contains only
 *  a bare conclusion, the threshold is NOT met regardless of output quality. The
 *  flag fires on the third case and is logged in the collaboration record as an
 *  independence-principle deficit for that domain."
 *
 * ─── Tracked per-domain ──────────────────────────────────────────────────────
 * "An agent may produce highly examinable outputs in one function type and opaque
 *  outputs in another … The independence-principle flag should fire on the DOMAIN
 *  where transparency is low, not on the agent globally."
 *
 * DISCLOSED DESIGN DECISION. A5's grades are per-output; the flag is per-domain. We
 * compute each output's grade + threshold (`assessOutputExaminability`), then set a
 * domain's independence result from its WEAKEST (minimum-grade) output — the
 * conservative reading, mirroring the "weakest sets the ceiling" logic used
 * throughout the trust core: if any of a domain's outputs is a bare conclusion, the
 * orchestrator cannot re-examine THAT output without re-running the task, so the
 * domain carries an independence-principle deficit. An `examinableRatio` (fraction
 * of the domain's outputs meeting the minimum threshold) is surfaced alongside for
 * nuance. The deficit is a COLLABORATION-RECORD field (S5) — there is no S1
 * trust-event type for it; `TransparencyDeficit` is the descriptor a wiring layer
 * logs. (If a future S1 event type is added, the descriptor maps to it.)
 *
 * MEASURE. This is tracking, not enforcement — a deficit is surfaced, never blocks.
 *
 * Pure — no I/O, no env, no clock.
 */

import type { VirtueTrustDomain } from './types'

// ════════════════════════════════════════════════════════════════════════════
// A4 — the three descending examinability grades
// ════════════════════════════════════════════════════════════════════════════

/** The examinability grade of a single output (descending). */
export type TransparencyGrade =
  | 'signed-trace' // strongest — reproducible, tamper-evident
  | 'stated-uncertainty' // explicit confidence + flagged unknowns (on a structured verdict)
  | 'structured-verdict' // proximity + domain breakdown, no full trace — the MINIMUM
  | 'bare-conclusion' // no verdict structure — NOT examinable

/** Ascending rank (bare-conclusion 0 … signed-trace 3). */
const GRADE_RANK: Record<TransparencyGrade, number> = {
  'bare-conclusion': 0,
  'structured-verdict': 1,
  'stated-uncertainty': 2,
  'signed-trace': 3,
}

/** The independence-principle functional threshold result. */
export type IndependenceThreshold =
  | 'met-full' // a signed trace — re-examinable at full confidence
  | 'met-reduced' // stated uncertainty and/or a structured verdict — met at reduced confidence
  | 'not-met' // a bare conclusion — not examinable regardless of output quality

/** The structural features of one output (what it CONTAINS). The minimum
 *  examinability threshold is a `structured-verdict` (proximity + domain breakdown);
 *  a bare conclusion falls below it and is not examinable (mentor A4). */
export interface OutputFeatures {
  /** A signed Layer-2 assessment (the causal sequence; Ed25519 — reproducible). */
  hasSignedTrace: boolean
  /** Explicit confidence levels + flagged unknowns stated in the output. */
  hasStatedUncertainty: boolean
  /** A proximity level + domain breakdown (a structured verdict). */
  hasStructuredVerdict: boolean
}

export interface OutputExaminability {
  grade: TransparencyGrade
  independence: IndependenceThreshold
  /** True ⇔ the output meets the minimum examinability threshold (>= structured-verdict). */
  examinable: boolean
  basis: string
}

/**
 * Grade a single output's examinability + resolve the independence-principle
 * functional threshold (mentor A4). Pure.
 *   - signed trace                       → signed-trace,     met-full
 *   - stated uncertainty + a structured verdict → stated-uncertainty, met-reduced
 *   - a structured verdict (no trace)    → structured-verdict, met-reduced (minimum)
 *   - only a bare conclusion             → bare-conclusion,  not-met (deficit)
 * Stated uncertainty WITHOUT a structured verdict does NOT meet the threshold — "a
 * bare conclusion with no verdict structure is not examinable" (the structured
 * verdict is the minimum; stated uncertainty rides on top of it).
 */
export function assessOutputExaminability(features: OutputFeatures): OutputExaminability {
  if (features.hasSignedTrace) {
    return {
      grade: 'signed-trace',
      independence: 'met-full',
      examinable: true,
      basis: 'signed reasoning trace — reproducible + tamper-evident; re-examinable at full confidence (A4)',
    }
  }
  if (features.hasStructuredVerdict) {
    if (features.hasStatedUncertainty) {
      return {
        grade: 'stated-uncertainty',
        independence: 'met-reduced',
        examinable: true,
        basis: 'stated uncertainty + a structured verdict — threshold met at reduced confidence (A4)',
      }
    }
    return {
      grade: 'structured-verdict',
      independence: 'met-reduced',
      examinable: true,
      basis: 'structured verdict without a full trace — the minimum examinability threshold, met at reduced confidence (A4)',
    }
  }
  return {
    grade: 'bare-conclusion',
    independence: 'not-met',
    examinable: false,
    basis: 'bare conclusion — no verdict structure; NOT examinable regardless of output quality (A4)',
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Per-domain transparency ledger
// ════════════════════════════════════════════════════════════════════════════

export interface DomainTransparencyEntry {
  domain: VirtueTrustDomain
  /** The domain's WEAKEST output grade (the conservative ceiling). */
  grade: TransparencyGrade
  /** The independence result for the weakest output (the domain's result). */
  independence: IndependenceThreshold
  /** True ⇔ the independence-principle deficit fires for THIS domain (any not-met
   *  output — the orchestrator cannot re-examine it without re-running the task). */
  independenceDeficit: boolean
  /** Fraction of the domain's outputs meeting the minimum examinability threshold. */
  examinableRatio: number
  /** The number of outputs assessed for this domain. */
  outputCount: number
  basis: string
}

/**
 * Assess one domain's transparency across its outputs (mentor A4, per-domain). The
 * domain's grade + independence are set by its WEAKEST output; the deficit fires
 * iff any output is not examinable. `examinableRatio` surfaces the fraction meeting
 * the minimum threshold. Pure. An empty `outputs` set is an evidence gap → a deficit
 * (no examinable output ⇒ the orchestrator cannot re-examine — the conservative
 * direction), with ratio 0.
 */
export function assessDomainTransparency(
  domain: VirtueTrustDomain,
  outputs: OutputFeatures[],
): DomainTransparencyEntry {
  if (outputs.length === 0) {
    return {
      domain,
      grade: 'bare-conclusion',
      independence: 'not-met',
      independenceDeficit: true,
      examinableRatio: 0,
      outputCount: 0,
      basis: `no outputs for ${domain} — an evidence gap; independence-principle deficit (A4, conservative)`,
    }
  }
  const assessed = outputs.map(assessOutputExaminability)
  // Weakest (minimum-grade) output sets the domain's ceiling.
  let weakest = assessed[0]
  for (const a of assessed) {
    if (GRADE_RANK[a.grade] < GRADE_RANK[weakest.grade]) weakest = a
  }
  const examinableCount = assessed.filter((a) => a.examinable).length
  const independenceDeficit = assessed.some((a) => !a.examinable)
  return {
    domain,
    grade: weakest.grade,
    independence: weakest.independence,
    independenceDeficit,
    examinableRatio: examinableCount / assessed.length,
    outputCount: assessed.length,
    basis: independenceDeficit
      ? `independence-principle deficit on ${domain}: at least one bare conclusion — the orchestrator cannot re-examine it without re-running the task (A4)`
      : `${domain} transparency: weakest grade ${weakest.grade}; every output meets the minimum examinability threshold (A4)`,
  }
}

/** The collaboration-record descriptor a wiring layer logs for a per-domain deficit
 *  (there is no S1 trust-event type for it — this is an S5 collaboration-record
 *  field). */
export interface TransparencyDeficit {
  domain: VirtueTrustDomain
  grade: 'bare-conclusion'
  note: string
}

export interface TransparencyLedger {
  schema: 'trust-transparency-ledger-v1'
  entries: DomainTransparencyEntry[]
  deficits: TransparencyDeficit[]
  anyDeficit: boolean
}

/**
 * Build the full per-domain transparency ledger from each domain's outputs. Pure.
 * The `deficits` list is the collaboration-record descriptor set (independence-
 * principle deficits, per domain). MEASURE — surfaced, never binding.
 */
export function buildTransparencyLedger(
  perDomain: { domain: VirtueTrustDomain; outputs: OutputFeatures[] }[],
): TransparencyLedger {
  const entries = perDomain.map((d) => assessDomainTransparency(d.domain, d.outputs))
  entries.sort((a, b) => a.domain.localeCompare(b.domain))
  const deficits: TransparencyDeficit[] = entries
    .filter((e) => e.independenceDeficit)
    .map((e) => ({
      domain: e.domain,
      grade: 'bare-conclusion',
      note:
        `independence-principle deficit in ${e.domain}: the orchestrator cannot re-examine the ` +
        `output without re-running the task (mentor A4). Logged in the collaboration record.`,
    }))
  return {
    schema: 'trust-transparency-ledger-v1',
    entries,
    deficits,
    anyDeficit: deficits.length > 0,
  }
}
