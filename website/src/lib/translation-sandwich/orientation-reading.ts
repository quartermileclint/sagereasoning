/**
 * orientation-reading.ts — the fifth-circle orientation reading (agent-circles
 * C2a/C2b/C2(ii), 2026-08-08).
 *
 * BINDING SOURCES (verbatim wins over this module and over every summary):
 *   - the mentor's Q4/Q5/Q6/Q7 verdicts + the same-day placement follow-up in
 *     `operations/agent-circles-2026-08/2026-08-01-mentor-consultation-agent-circles-practice-on-verbatim.md`
 *   - the approved scope `operations/agent-circles-2026-08/2026-08-06-c2-orientation-reading-and-c1c-trust-event-scope.md`
 *     (§1.1–§1.3, §2), whose code blocks this module transcribes.
 *
 * WHAT THE READING IS (Q4): a per-examination DIRECTIONAL reading — "does this
 * reasoning move toward or away from the rational order?" — alongside, never
 * replacing, positional proximity. "The orientation reading is harder to game
 * because it asks not what the reasoning produced but what the reasoning was
 * reaching toward." It is computed deterministically from the extraction's
 * observable habit-vs-genuine-examination markers (Q5: "the instrument reads
 * the features of the agent's examination... The agent's reasoning produced
 * those features through its own examination").
 *
 * THE PLACEMENT RULING (C2c, binding): the reading is
 *   - NEVER placed in the signed assessment ("regular receipt of a reading
 *     about one's own orientation creates the optimisation pressure regardless
 *     of how the reading is framed");
 *   - NEVER rendered in any practice-voiced surface (calling frame, at-action
 *     suggestion, reflection prompt);
 *   - NEVER fed back to the agent as a reading to be improved;
 *   - recorded + served ONLY on the public trust record (S10), each entry
 *     carrying the not-attestable clause INLINE ("the entry is the unit that
 *     will be read in isolation").
 * Structurally realised: this module is never imported by layer2-mechanisms.ts
 * (computeOrientationReading takes no Layer2Assessment and returns nothing any
 * verdict consumes — pinned by the batteries), and the /api/reason route strips
 * `orientation_observations` from the wire extraction echo flag-on, so neither
 * the reading nor its trivially-countable antecedents ride the consult
 * response.
 *
 * EXTRACTION-TRUST CEILING (the gaming dimension, named per the build plan
 * §C2a): the reading rests on the honest extraction of the submitted text and
 * inherits the same locus-2 ceiling as every Layer-1 signal (memory
 * `gaming-robustness-extraction-trust-locus-split`). Two defences are
 * structural here rather than aspirational: (1) events derive ONLY from
 * SERVER-side extractions — a caller-supplied `layer1_schema` can never mint an
 * orientation reading (the route refuses the field on the l1_supply path
 * flag-on, and the emission hook additionally requires layer1Source 'server');
 * (2) the reading is absent from every agent-facing response, so an optimising
 * agent gets no per-consult feedback signal to climb. The residual — an agent
 * whose submitted narration itself performs "genuine examination" — is the
 * disclosed A2-class ceiling, and is exactly what the PR19 gaming review
 * attacks.
 *
 * MEASURE-ONLY. The three orientation trust events carry the 'flag' effect
 * (a genuine no-op on trust state — the stoa-declaration-diverges-from-calling
 * precedent) and virtue_domain NULL; they are ledgered via an INSERT-ONLY store
 * path that never folds state (see trust-core-store.emitLedgerOnlyTrustEvents).
 *
 * PURE: no clock, no I/O; the flag reader is the only env touch and is never
 * called by the pure functions.
 */

import type { Layer1Schema, OrientationObservation } from './layer1-extractor'

// ============================================================================
// FLAG
// ============================================================================

/**
 * C2 activation flag. UNSET (or anything but 'true') ⇒ the Layer-1 prompt never
 * solicits `orientation_observations`, no reading is computed, no orientation
 * trust event is emitted, the S10 payload carries no `orientation_readings`
 * field, and the reflect Q6 orientation sub-question is absent — byte-identical
 * to pre-C2 everywhere (battery-asserted).
 *
 * The prompt half additionally requires SUBSTRATE_AGENT_CIRCLES_ENABLED (the
 * orientation category presupposes the re-grounded circle regime — Q9b: "the
 * fifth-circle orientation reading depends on the first-circle extraction
 * being accurate"); see buildLayer1SystemPrompt in layer1-extractor.ts.
 */
export function isOrientationReadingEnabled(): boolean {
  return process.env.SUBSTRATE_ORIENTATION_READING_ENABLED === 'true'
}

// ============================================================================
// THE READING (C2b — the threshold condition, scope §1.2 transcribed)
// ============================================================================

export type OrientationReading = 'toward' | 'away' | 'indeterminate'

export interface OrientationReadingResult {
  reading: OrientationReading
  basis: string
}

/**
 * Pure, deterministic — mirrors computeProximity's own weakest-link discipline
 * (per-signal, conservative default) rather than inventing a new pattern.
 * Never called with a confidence override; never an LLM call (Q5: the
 * instrument computes the reading deterministically FROM extracted features,
 * the agent's reasoning stays free — the same relationship as the existing
 * proximity reading, per the mentor's own Q5 answer).
 *
 * Transcribed from the approved scope §1.2. The 'insufficient_extraction'
 * basis on unequal mixed evidence follows the house floor vocabulary
 * (trajectory-delta's evidence-floor discipline): conflicting markers are
 * insufficient extraction EVIDENCE to certify either direction — never a
 * defaulted 'toward'.
 */
export function computeOrientationReading(
  observations: readonly OrientationObservation[] | null | undefined,
): OrientationReadingResult {
  if (!observations || observations.length === 0) {
    return { reading: 'indeterminate', basis: 'no_orientation_observations_extracted' }
  }
  const genuine = observations.filter((o) => o.observed === 'genuine_examination_markers').length
  const habitual = observations.filter((o) => o.observed === 'habitual_output_markers').length
  if (genuine > 0 && habitual === 0) {
    return { reading: 'toward', basis: 'genuine_examination_markers_only' }
  }
  if (habitual > 0 && genuine === 0) {
    return { reading: 'away', basis: 'habitual_output_markers_only' }
  }
  // Mixed evidence, or a tie: conservative default is indeterminate, never a
  // defaulted 'toward' (the house evidence-floor discipline, EVIDENCE_FLOOR
  // precedent in trajectory-delta.ts — never manufacture a positive read from
  // ambiguous evidence).
  return {
    reading: 'indeterminate',
    basis: genuine === habitual ? 'mixed_or_tied_observations' : 'insufficient_extraction',
  }
}

// ============================================================================
// THE ENTRY TEXT (C2b — scope §1.3; a TEMPLATE SELECTION, never a Layer-3 call)
// ============================================================================

/**
 * The fixed, deterministic entry-text template the S10 orientation entries
 * carry. Scope §1.3 (mentor-confirmed): "No LLM call composes this text; it is
 * selected from computeOrientationReading's deterministic output, the same way
 * the S10 envelope's fixed strings are selected rather than generated." The
 * examination-not-agent phrasing is the placement ruling's own template:
 * "The reading says: this examination moved toward the rational order...
 * It does not say: this agent is oriented toward the rational order."
 * Battery-locked verbatim.
 */
export const ORIENTATION_ENTRY_TEXT: Record<OrientationReading, string> = {
  toward: 'This examination moved toward the rational order.',
  away: 'This examination moved away from the rational order.',
  indeterminate: 'This examination showed insufficient evidence to read a direction.',
}

/**
 * The not-attestable clause (C2d / mentor Q6, EXACT two sentences — verbatim
 * from the binding record; battery-locked). Carried INLINE on EVERY S10
 * orientation entry (the placement ruling's structural addition: "the entry is
 * the unit that will be read in isolation").
 *
 * NOTE (C2d hard gate): this constant feeds ONLY the flag-gated S10 entries,
 * which are dark until activation. The mentor's clause also lands in ADR-013
 * §8's dated amendment, TRUST_RECORD_ENVELOPE, and the three R18 surfaces —
 * those are LIVE public surfaces and are deliberately NOT touched by the build
 * session: they change only at the founder-walked activation, after the
 * founder signs off the exact wording (the ruling's sign-off-before-any-
 * public-file-change gate).
 */
export const ORIENTATION_NOT_ATTESTABLE_CLAUSE =
  'The record can attest that specific examinations were oriented toward the rational ' +
  'order. It cannot attest that the agent is fifth-circle-aligned.'

// ============================================================================
// THE GENERATIVE-PROMPT FIELD (C2(ii) — scope §2; ruling 5's settled format)
// ============================================================================

/**
 * The meaning-based circle-number ↔ canonical-identifier mapping (build plan
 * §C3, recorded so nothing maps by position): the mentor's circle 3
 * (collaborating agents/humans in the project) spans the local_community/
 * political_community band; circle 5 (the rational order) maps to NO
 * extractable identifier, ever — the telos is a criterion, never a party.
 */
const CIRCLE_RANK: Record<string, 1 | 2 | 3 | 4> = {
  self_preservation: 1,
  household: 2,
  local_community: 3,
  political_community: 3,
  cosmopolis: 4,
}

/** Plain descriptions for the generative prompt's circle references. Rank 5 is
 *  the telos — describable, never extractable (build plan §C3). */
const CIRCLE_DESCRIPTION: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "the practitioner's own reasoning integrity",
  2: 'the task and developer',
  3: 'the collaborating agents and humans in the project',
  4: 'all rational agents',
  5: 'the rational order — the telos of the examination, never a party',
}

/**
 * Compose the one-sentence generative-prompt seed (C2(ii)). SETTLED FORMAT
 * (D-IDEA-LOOP-PREBRIEF-RULINGS-C2-WIDENED-2026-08-05 ruling 5, made exact by
 * the mentor): one sentence, maximum, of the form "this action engaged circle
 * N but left room to extend toward circle N+1 by [gap description]." NEVER a
 * prescribed action — a description of the gap only; the instruction/
 * prescription happens in the IDEA loop's own generation step, never here.
 *
 * POPULATION CONDITION (scope §2.1): only on 'away'/'indeterminate' readings
 * on an examination that DID engage at least one identified circle. Never on
 * 'toward' (nothing to seed — forcing one would fabricate a gap or restate the
 * toward fact; the null-cycle honesty rule applied one layer upstream). Never
 * on a circle-less examination (there is no "engaged circle N" to name).
 *
 * CONSUMPTION (scope §2.2, mentor-confirmed): this is a per-examination SEED —
 * raw material an external runner (or a human/mentor) reads and synthesises
 * into a later OikeiosisGap.targetCircleMeaning. It is NOT itself an
 * OikeiosisGap and never substitutes for the human/mentor authorship the
 * approved type documents. It rides the orientation trust event's payload
 * (server-side, owner-exportable, retention-swept) and is never served on S10
 * and never rides the consult response. Feeding a LATER cycle's generation
 * step is downstream consumption of a completed result, not feedback into this
 * examination's own verdict (ruling 5's resolved tension, scope §2.3).
 */
export function composeGenerativePrompt(
  reading: OrientationReading,
  engagedCircles: readonly string[],
): string | undefined {
  if (reading === 'toward') return undefined
  const ranks = engagedCircles
    .map((c) => CIRCLE_RANK[c])
    .filter((r): r is 1 | 2 | 3 | 4 => r !== undefined)
  if (ranks.length === 0) return undefined
  const widest = Math.max(...ranks) as 1 | 2 | 3 | 4
  const next = (widest + 1) as 2 | 3 | 4 | 5
  const gap =
    reading === 'away'
      ? 'examining what is owed at that wider reach — the reading found habitual-output ' +
        'markers where genuine examination would live'
      : "making the examination's reach explicit — the reading could not determine " +
        'whether the reasoning extended beyond the circles it named'
  return (
    `this action engaged circle ${widest} (${CIRCLE_DESCRIPTION[widest]}) but left room ` +
    `to extend toward circle ${next} (${CIRCLE_DESCRIPTION[next]}) by ${gap}.`
  )
}

// ============================================================================
// THE PER-EXAMINATION RESULT (what the C1c deriver consumes)
// ============================================================================

/** The engaged circle names from an extraction, deduplicated, in extraction
 *  order. Tolerant of a null/absent circles array. */
export function engagedCircleNames(schema: Pick<Layer1Schema, 'oikeiosis_circles_engaged'>): string[] {
  const circles = schema.oikeiosis_circles_engaged
  if (!Array.isArray(circles)) return []
  const seen = new Set<string>()
  const names: string[] = []
  for (const c of circles) {
    const name = (c as { circle?: unknown }).circle
    if (typeof name === 'string' && !seen.has(name)) {
      seen.add(name)
      names.push(name)
    }
  }
  return names
}

/** The standing honest bound carried in every orientation event payload.
 *  Battery-locked verbatim (the REASONING_INTEGRITY_BOUNDS precedent — add a
 *  key, never reword one). */
export const ORIENTATION_READING_BOUNDS =
  'MEASURE-ONLY: this reading describes the directional character ONE examination ' +
  'showed — toward or away from the rational order — never the agent\'s standing. ' +
  'It is computed after the assessment is finalised, is never an input to katorthoma ' +
  'proximity, any verdict, any gate, or any suggestion, and is never returned on the ' +
  'consult response. It rests on the server-side extraction of the submitted text and ' +
  'inherits that extraction-trust ceiling: reasoning narrated as examination reads as ' +
  'examination. ' +
  ORIENTATION_NOT_ATTESTABLE_CLAUSE
