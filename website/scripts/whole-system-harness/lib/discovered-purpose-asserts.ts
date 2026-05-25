/**
 * discovered-purpose-asserts.ts — shared assertions for the five-slot
 * DiscoveredPurpose (L2-complete) and its survival into the Layer 1 schema
 * (L4 / L6 Seam S1). One place to get the seam-S1 assertion logic right;
 * reused by run-l2-complete.ts, run-l4.ts, run-l6.ts (founder Option A,
 * 2026-05-25).
 *
 * Both functions are PURE — buildDiscoveredPurpose and validateLayer1Schema are
 * pure (no I/O), so these run under a bare `npx tsx` with no env. KG1 NOT engaged.
 */

import {
  validateLayer1Schema,
  type DiscoveredPurpose,
} from '../../../src/lib/translation-sandwich/layer1-extractor'
import type { AssertionLedger } from './assertions'

/** What each slot SHOULD carry — the agent's own verbatim stage answers + the
 *  deterministic circle/role. Built by the caller from the dialogue answers. */
export interface ExpectedSlots {
  /** Spec 1 — work === the Q3 answer (buildDiscoveredPurpose: work = q6 || q3 || …; q6 empty here). */
  work: string
  /** Spec 4 — capacity[0] === the Q2 answer. */
  capacity: string
  /** Spec 2 — obligation === the Q3 answer (obligation = q3 || q1 || work). */
  obligation: string
  /** Spec 2 — the circle the D-5 scan resolves to (deterministically 'community'). */
  circle: string
  /** Spec 3 — the role (roleHint ?? 'individual_nature'). */
  role: string
  /** Spec 5 — first_appropriate_act.description === the Q5 answer. */
  firstAct: string
}

/**
 * L2-complete / seam-S1 (a): the assembled DiscoveredPurpose carries the agent's
 * OWN WORDS in all five slots, with no dropped or mis-slotted slot. Asserts each
 * slot is present, non-empty, and equals the expected verbatim answer (or the
 * deterministic enum value for circle/role).
 */
export function assertFiveSlots(
  ledger: AssertionLedger,
  dp: DiscoveredPurpose,
  expected: ExpectedSlots,
  prefix: string,
): void {
  // Spec 1 — work (the agent's Q3 words)
  ledger.assertEqual(`${prefix} slot 1 (work) carries the agent's own words`, dp.work, expected.work)

  // Spec 2 — circle_and_obligation { circle, obligation }
  const cao = dp.circle_and_obligation ?? null
  ledger.assert(
    `${prefix} slot 2 (circle_and_obligation) present`,
    cao !== null && typeof cao === 'object',
    `circle_and_obligation=${JSON.stringify(cao)}`,
  )
  ledger.assertEqual(`${prefix} slot 2 circle resolved deterministically`, cao?.circle, expected.circle)
  ledger.assertEqual(
    `${prefix} slot 2 obligation carries the agent's own words`,
    cao?.obligation,
    expected.obligation,
  )

  // Spec 3 — role
  ledger.assertEqual(`${prefix} slot 3 (role) present`, dp.role, expected.role)

  // Spec 4 — capacity (the agent's Q2 words, as a single-item list)
  const cap = dp.capacity ?? null
  ledger.assert(
    `${prefix} slot 4 (capacity) is a non-empty list`,
    Array.isArray(cap) && cap.length > 0,
    `capacity=${JSON.stringify(cap)}`,
  )
  ledger.assertEqual(`${prefix} slot 4 capacity[0] carries the agent's own words`, cap?.[0], expected.capacity)

  // Spec 5 — first_appropriate_act.description (the agent's Q5 words)
  const faa = dp.first_appropriate_act ?? null
  ledger.assert(
    `${prefix} slot 5 (first_appropriate_act) present`,
    faa !== null && typeof faa === 'object',
    `first_appropriate_act=${JSON.stringify(faa)}`,
  )
  ledger.assertEqual(
    `${prefix} slot 5 description carries the agent's own words`,
    faa?.description,
    expected.firstAct,
  )

  // No dropped slot: all five present + non-empty (defends against a silent drop).
  const noDropped =
    typeof dp.work === 'string' && dp.work.length > 0 &&
    !!cao && typeof cao.circle === 'string' && typeof cao.obligation === 'string' && cao.obligation.length > 0 &&
    typeof dp.role === 'string' && dp.role.length > 0 &&
    Array.isArray(cap) && cap.length > 0 && typeof cap[0] === 'string' && cap[0].length > 0 &&
    !!faa && typeof faa.description === 'string' && faa.description.length > 0
  ledger.assert(`${prefix} all five slots present, non-empty, none dropped`, noDropped)
}

/** Minimal valid Layer1Schema raw object (15 required fields; empty arrays) —
 *  the per-response un-wrapped shape, version v3 (the discovered_purpose-populated
 *  version per D-SAGE-CALLING-STAGE2). Mirrors the proven buildMinimalRaw() in
 *  layer1-schema-additions.test.ts. */
export function buildMinimalLayer1Raw(): Record<string, unknown> {
  return {
    version: 'layer1-schema-v3',
    passions_present: [],
    control_filter_elements: [],
    oikeiosis_circles_engaged: [],
    value_categories_at_stake: [],
    kathekon_factors: [],
    urgency_indicators: [],
    causal_stage_evidence: [],
    eupatheia_candidates: [],
    stated_concern_targets: [],
    stated_equanimity_signals: [],
    motivation_stated: false,
    motivation_evidence: [],
    element_fusion_detected: { fused: false, fused_concerns: null },
    ambiguity_notes: [],
  }
}

export interface SurvivalResult {
  /** The discovered_purpose AS RECEIVED by the Layer 1 schema (post-validate). */
  received: DiscoveredPurpose
}

/**
 * Seam-S1 (b): thread the DiscoveredPurpose into a Layer1Schema via the same
 * pre-extracted layer1_schema path Sage Calling uses (the plugin-auth path), run
 * the real validateLayer1Schema, and assert ALL FIVE SLOTS SURVIVE — the received
 * discovered_purpose deep-equals the input (round-tripped), with no dropped or
 * mis-slotted field. Returns the received slots for the founder side-by-side print.
 *
 * The input is JSON round-tripped first (JSON.parse(JSON.stringify(...))) to model
 * the wire / pre-extracted handoff exactly — dropping any `undefined` slot, so a
 * genuinely dropped slot would surface as a mismatch.
 */
export function assertLayer1Survival(
  ledger: AssertionLedger,
  dp: DiscoveredPurpose,
  prefix: string,
): SurvivalResult {
  const onTheWire = JSON.parse(JSON.stringify(dp)) as DiscoveredPurpose
  const raw = { ...buildMinimalLayer1Raw(), discovered_purpose: onTheWire }

  let received: DiscoveredPurpose = {}
  let threw = false
  try {
    const validated = validateLayer1Schema(raw)
    received = (validated.discovered_purpose ?? {}) as DiscoveredPurpose
  } catch (err) {
    threw = true
    ledger.assert(
      `${prefix} Layer 1 ACCEPTS the five-spec handoff (validateLayer1Schema does not throw)`,
      false,
      `threw: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
  if (!threw) {
    ledger.assert(
      `${prefix} Layer 1 ACCEPTS the five-spec handoff (validateLayer1Schema does not throw)`,
      true,
    )
  }

  // All five slots survive verbatim (deep-equal to the round-tripped input).
  ledger.assertEqual(
    `${prefix} all five slots survive into the Layer 1 schema (no dropped/mis-slotted slot)`,
    JSON.stringify(received),
    JSON.stringify(onTheWire),
  )

  // Per-slot presence on the RECEIVED side (defends against a single silent drop).
  const cao = received.circle_and_obligation ?? null
  const cap = received.capacity ?? null
  const faa = received.first_appropriate_act ?? null
  ledger.assert(`${prefix} received slot 1 (work) present`, typeof received.work === 'string' && received.work.length > 0)
  ledger.assert(`${prefix} received slot 2 (circle_and_obligation) present`, !!cao && typeof cao.circle === 'string' && typeof cao.obligation === 'string')
  ledger.assert(`${prefix} received slot 3 (role) present`, typeof received.role === 'string' && received.role.length > 0)
  ledger.assert(`${prefix} received slot 4 (capacity) present`, Array.isArray(cap) && cap.length > 0)
  ledger.assert(`${prefix} received slot 5 (first_appropriate_act) present`, !!faa && typeof faa.description === 'string' && faa.description.length > 0)

  return { received }
}

/** Pretty side-by-side of the five input slots vs what Layer 1 received, for the
 *  founder comparison the matrix calls for (L4 / S1). Returns a printable string. */
export function renderSlotComparison(input: DiscoveredPurpose, received: DiscoveredPurpose): string {
  const rows: [string, unknown, unknown][] = [
    ['work', input.work, received.work],
    ['circle', input.circle_and_obligation?.circle, received.circle_and_obligation?.circle],
    ['obligation', input.circle_and_obligation?.obligation, received.circle_and_obligation?.obligation],
    ['role', input.role, received.role],
    ['capacity', input.capacity, received.capacity],
    ['first_act.description', input.first_appropriate_act?.description, received.first_appropriate_act?.description],
  ]
  const lines = ['  slot                  | input → Layer-1 received']
  lines.push('  ---------------------- | -----------------------')
  for (const [slot, a, b] of rows) {
    const same = JSON.stringify(a) === JSON.stringify(b) ? 'same' : 'DIFFERENT'
    lines.push(`  ${slot.padEnd(22)} | ${same}`)
  }
  return lines.join('\n')
}
