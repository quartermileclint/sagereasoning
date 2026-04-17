/**
 * stoic-brain-loader.ts — Mechanism-specific Stoic Brain context builder.
 *
 * Loads condensed Stoic Brain data from stoic-brain-compiled.ts and assembles
 * context blocks tailored to the mechanisms being invoked. Each function returns
 * a formatted string ready for LLM system prompt injection.
 *
 * Token budgets:
 *   - Per mechanism: 500-1000 tokens
 *   - Quick depth (3 mechanisms): ~3000 tokens ceiling
 *   - Deep depth (6 mechanisms): ~6000 tokens ceiling
 *
 * Usage:
 *   const context = getStoicBrainContext('quick')
 *   // → Returns combined context for control_filter, passion_diagnosis, oikeiosis
 */

import {
  PSYCHOLOGY_CONTEXT,
  PASSIONS_CONTEXT,
  VIRTUE_CONTEXT,
  VALUE_CONTEXT,
  ACTION_CONTEXT,
  PROGRESS_CONTEXT,
  SCORING_CONTEXT,
  STOIC_BRAIN_FOUNDATIONS,
} from '@/data/stoic-brain-compiled'

// SOURCE OF TRUTH: depth-constants.ts. Do not define ReasonDepth here.
// (Previously duplicated here to avoid circular dependency with sage-reason-engine.ts —
// resolved by extracting to depth-constants.ts per audit finding F5.)
import type { ReasonDepth } from '@/lib/depth-constants'

// =============================================================================
// MECHANISM-SPECIFIC CONTEXT BUILDERS
// =============================================================================

/**
 * Context for Mechanism 1 — Control Filter (Prohairesis / Dichotomy of Control).
 * Draws from: psychology.json (ruling faculty, causal sequence) + stoic-brain.json (dichotomy)
 */
export function getControlFilterContext(): string {
  const doc = STOIC_BRAIN_FOUNDATIONS.dichotomy_of_control
  const rf = PSYCHOLOGY_CONTEXT.ruling_faculty
  const seq = PSYCHOLOGY_CONTEXT.causal_sequence

  return `STOIC BRAIN — CONTROL FILTER DATA
Ruling Faculty (${rf.id}): ${rf.description}
Causal Sequence: ${seq.map(s => `${s.id} (${s.name})`).join(' → ')}
Up to us (eph' hemin): ${doc.up_to_us.join(', ')}
Not up to us (ouk eph' hemin): ${doc.not_up_to_us.join(', ')}
Core principle: ${STOIC_BRAIN_FOUNDATIONS.core_premise}`
}

/**
 * Context for Mechanism 2 — Passion Diagnosis.
 * Draws from: passions.json (full taxonomy, diagnostic sequence)
 */
export function getPassionDiagnosisContext(): string {
  const p = PASSIONS_CONTEXT
  const rootPassions = Object.values(p.four_root_passions)

  const passionLines = rootPassions.map(rp => {
    const subs = rp.sub_species.map(s => `${s.name} (${s.id})`).join(', ')
    return `  ${rp.name} (${rp.id}) [${rp.root_passion}]: ${subs}`
  }).join('\n')

  const goodFeelings = p.three_good_feelings
    .map(gf => `${gf.name} (${gf.id}) — replaces ${gf.replaces}`)
    .join('; ')

  return `STOIC BRAIN — PASSION DIAGNOSIS DATA
Four Root Passions (2x2: temporal × evaluative):
${passionLines}

Diagnostic Sequence:
${p.diagnostic_sequence.join('\n')}

Rational Good Feelings (eupatheiai — what replaces passions): ${goodFeelings}

Failure modes by causal stage:
  phantasia: ${PSYCHOLOGY_CONTEXT.causal_sequence[0].failure_mode}
  synkatathesis: ${PSYCHOLOGY_CONTEXT.causal_sequence[1].failure_mode}
  horme: ${PSYCHOLOGY_CONTEXT.causal_sequence[2].failure_mode}
  praxis: ${PSYCHOLOGY_CONTEXT.causal_sequence[3].failure_mode}`
}

/**
 * Context for Mechanism 3 — Oikeiosis (Social Obligation Mapping).
 * Draws from: action.json (oikeiosis sequence, deliberation framework) + progress.json (oikeiosis extension metric)
 */
export function getOikeioisContext(): string {
  const oik = ACTION_CONTEXT.oikeiosis_sequence
  const delib = ACTION_CONTEXT.deliberation_framework

  const stages = oik.map(s => `  Stage ${s.stage}: ${s.name} — ${s.description}`).join('\n')
  const questions = delib.map(q => `  ${q.id}: ${q.question}`).join('\n')

  return `STOIC BRAIN — OIKEIOSIS DATA
Five Expanding Circles of Concern:
${stages}

Cicero's Deliberation Framework (De Officiis 1.9-10):
${questions}

Priority rule: When obligations at different stages conflict, the higher stage generally takes priority. But self-care that enables future virtue is justified.
Oikeiosis extension metric: ${PROGRESS_CONTEXT.progress_metrics[3].description}`
}

/**
 * Context for Mechanism 4 — Value Assessment (Preferred Indifferents).
 * Draws from: value.json (hierarchy, indifferents, selection principles)
 */
export function getValueAssessmentContext(): string {
  const v = VALUE_CONTEXT

  const preferred = v.preferred_indifferents
    .map(i => `${i.name} (${i.axia})`)
    .join(', ')

  const dispreferred = v.dispreferred_indifferents
    .map(i => `${i.name} (${i.axia})`)
    .join(', ')

  return `STOIC BRAIN — VALUE ASSESSMENT DATA
Value Hierarchy: ${v.hierarchy}

Preferred Indifferents (kata physin — according to nature):
  ${preferred}

Dispreferred Indifferents (para physin — against nature):
  ${dispreferred}

Selection Principles:
${v.selection_principles.map(r => `  - ${r}`).join('\n')}`
}

/**
 * Context for Mechanism 5 — Kathekon Assessment (Appropriate Action).
 * Draws from: action.json (two layers, virtue context for domain mapping)
 */
export function getKathekonContext(): string {
  const a = ACTION_CONTEXT.two_layers
  const virtues = VIRTUE_CONTEXT.four_expressions

  const virtueDomains = virtues
    .map(v => `  ${v.name} (${v.id}): ${v.domain}`)
    .join('\n')

  return `STOIC BRAIN — KATHEKON ASSESSMENT DATA
Two Layers of Action Quality:
  ${a.kathekon.name} (${a.kathekon.id}): ${a.kathekon.definition}
  ${a.katorthoma.name} (${a.katorthoma.id}): ${a.katorthoma.definition}

Virtue Domains Engaged (unity thesis: ${VIRTUE_CONTEXT.unity_thesis}):
${virtueDomains}

Scoring: is_kathekon (yes/no), quality (strong/moderate/marginal/contrary), justification.`
}

/**
 * Context for Mechanism 6 — Iterative Refinement (Progress Tracking).
 * Draws from: progress.json (grades, metrics) + scoring.json (proximity scale)
 */
export function getIterativeRefinementContext(): string {
  const grades = PROGRESS_CONTEXT.progress_gradient
    .map(g => `  ${g.name} (${g.id}): ${g.indicators.join('; ')}`)
    .join('\n')

  const metrics = PROGRESS_CONTEXT.progress_metrics
    .map(m => `  ${m.name}: ${m.description}`)
    .join('\n')

  const scale = SCORING_CONTEXT.katorthoma_proximity_scale
    .map(l => `  ${l.name} (${l.id}): ${l.description}`)
    .join('\n')

  return `STOIC BRAIN — ITERATIVE REFINEMENT DATA
Senecan Progress Grades:
${grades}

Progress Dimensions:
${metrics}

Katorthoma Proximity Scale:
${scale}

Direction of travel: improving | stable | declining. Measure movement, not a static score.`
}

// =============================================================================
// COMPOSITE CONTEXT BUILDER — Returns combined context for a given depth
// =============================================================================

/**
 * Mechanism-to-loader mapping. The order matches DEPTH_MECHANISMS in sage-reason-engine.ts.
 */
const MECHANISM_LOADERS: Record<string, () => string> = {
  control_filter: getControlFilterContext,
  passion_diagnosis: getPassionDiagnosisContext,
  oikeiosis: getOikeioisContext,
  value_assessment: getValueAssessmentContext,
  kathekon_assessment: getKathekonContext,
  iterative_refinement: getIterativeRefinementContext,
}

// SOURCE OF TRUTH: depth-constants.ts. Do not define DEPTH_MECHANISMS here.
import { DEPTH_MECHANISMS } from '@/lib/depth-constants'

/**
 * Token budget ceilings per depth level (chars ≈ tokens × 4).
 * These match the architectural decisions extract:
 *   quick ~995 tokens (~3980 chars), ceiling 3000 tokens (12000 chars)
 *   standard ~1538 tokens (~6152 chars), ceiling 6000 tokens (24000 chars)
 *   deep ~2007 tokens (~8028 chars), ceiling 6000 tokens (24000 chars)
 *
 * F15: We warn at the design budget and hard-log at the ceiling.
 */
const TOKEN_BUDGET_CHARS: Record<ReasonDepth, { design: number; ceiling: number }> = {
  quick:    { design: 3980,  ceiling: 12000 },
  standard: { design: 6152,  ceiling: 24000 },
  deep:     { design: 8028,  ceiling: 24000 },
}

/**
 * Get combined Stoic Brain context for a given depth level.
 *
 * F15: Includes runtime character-count check against token budgets.
 * Warns if context exceeds the design budget. Logs error if it exceeds the ceiling.
 *
 * @param depth - 'quick' | 'standard' | 'deep'
 * @returns Formatted context string ready for system prompt injection
 */
export function getStoicBrainContext(depth: ReasonDepth): string {
  const mechanisms = DEPTH_MECHANISMS[depth]
  const sections = mechanisms
    .map(m => {
      const loader = MECHANISM_LOADERS[m]
      return loader ? loader() : ''
    })
    .filter(Boolean)

  const result = sections.join('\n\n---\n\n')

  // F15: Runtime token budget enforcement
  const budget = TOKEN_BUDGET_CHARS[depth]
  const charCount = result.length
  if (charCount > budget.ceiling) {
    console.error(
      `[stoic-brain-loader] OVER CEILING: ${depth} context is ${charCount} chars ` +
      `(≈${Math.round(charCount / 4)} tokens), ceiling is ${budget.ceiling} chars ` +
      `(≈${Math.round(budget.ceiling / 4)} tokens). This WILL exceed max_tokens.`
    )
  } else if (charCount > budget.design) {
    console.warn(
      `[stoic-brain-loader] Over design budget: ${depth} context is ${charCount} chars ` +
      `(≈${Math.round(charCount / 4)} tokens), design budget is ${budget.design} chars ` +
      `(≈${Math.round(budget.design / 4)} tokens). Consider condensing mechanism loaders.`
    )
  }

  return result
}

/**
 * Get Stoic Brain context for specific mechanisms (used by non-engine endpoints).
 *
 * @param mechanisms - Array of mechanism IDs to include
 * @returns Formatted context string
 */
export function getStoicBrainContextForMechanisms(mechanisms: string[]): string {
  const sections = mechanisms
    .map(m => {
      const loader = MECHANISM_LOADERS[m]
      return loader ? loader() : ''
    })
    .filter(Boolean)

  return sections.join('\n\n---\n\n')
}
