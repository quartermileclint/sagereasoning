/**
 * bridge-step.ts — Seam 2 BRIDGE coverage (the tsx step).
 *
 * sage-assent-bridge.ts (mapLayer2AssessmentToEvaluatedAction) is a PURE,
 * synchronous function imported by NO /api route, so it cannot be exercised
 * over HTTP (harness design §5 / seam-map Seam 2). This step imports it
 * directly and asserts:
 *   (1) receipt_id === deriveReceiptId(signature) === 'rcpt_' + SHA-256(signature)
 *   (2) the resulting EvaluatedAction is well-formed (all canonical keys present)
 *   (3) the four context-sourced fields + proximity thread correctly
 *
 * IMPORTS ONLY THE PURE BRIDGE — no DB module, no supabase, no env required.
 * Runs clean under a bare `npx tsx`. KG1 NOT engaged (writes no DB rows).
 *
 * REFINEMENT vs the design docs (code-read 2026-05-24, diagnostic-certain):
 * deriveReceiptId returns RECEIPT_ID_PREFIX ('rcpt_') + the 64-hex SHA-256 of
 * the signature — NOT a bare SHA-256. The design docs phrased the assertion as
 * "receipt_id === SHA-256(signature)"; the real code prefixes it. The
 * assertions below match the REAL code.
 */

import { createHash } from 'node:crypto'

import {
  mapLayer2AssessmentToEvaluatedAction,
  deriveReceiptId,
  RECEIPT_ID_PREFIX,
  type EvaluatedAction,
} from '../../../src/lib/substrate/sage-assent-bridge'
import type { SignedLayer2Assessment } from '../../../src/lib/translation-sandwich/layer2-signer'

import type { AssertionLedger } from './assertions'

/** The four EvaluatedAction fields Layer2Assessment does not carry, supplied
 *  by the harness (the wrapper's role in production). `signature` is taken from
 *  the SignedLayer2Assessment; the other three are harness-set. */
export interface BridgeStepExtras {
  agent_id: string
  evaluated_at: string
  skill_id: string
  candidates_considered: number
}

/** The 13 canonical EvaluatedAction keys the bridge always emits. The optional
 *  pass-through fields (operation_class, target_system_vendor, …) are NOT set
 *  by the bridge, so they are absent — asserted-present is the canonical set. */
const CANONICAL_KEYS: readonly (keyof EvaluatedAction)[] = [
  'receipt_id',
  'agent_id',
  'evaluated_at',
  'proximity',
  'is_kathekon',
  'kathekon_quality',
  'passions_detected',
  'virtue_domains_engaged',
  'oikeiosis_met',
  'oikeiosis_stage',
  'ruling_faculty_state',
  'skill_id',
  'candidates_considered',
]

export interface BridgeStepResult {
  evaluatedAction: EvaluatedAction
  expectedReceiptId: string
}

/**
 * Run the Seam 2 bridge tsx step on a SignedLayer2Assessment and record
 * assertions to the ledger. Used by BOTH modes: build-only feeds a synthetic
 * fixture; live feeds the real signed assessment returned by /api/reason.
 */
export function runBridgeStep(
  signed: SignedLayer2Assessment,
  extras: BridgeStepExtras,
  ledger: AssertionLedger
): BridgeStepResult {
  const evaluatedAction = mapLayer2AssessmentToEvaluatedAction(signed.assessment, {
    agent_id: extras.agent_id,
    evaluated_at: extras.evaluated_at,
    skill_id: extras.skill_id,
    signature: signed.signature,
    candidates_considered: extras.candidates_considered,
  })

  // (1) receipt_id: two independent derivations must agree AND match real code.
  const viaBridge = deriveReceiptId(signed.signature)
  const handComputed =
    RECEIPT_ID_PREFIX + createHash('sha256').update(signed.signature, 'utf8').digest('hex')

  ledger.assertEqual(
    'S2-bridge (c): EvaluatedAction.receipt_id === deriveReceiptId(signature)',
    evaluatedAction.receipt_id,
    viaBridge
  )
  ledger.assertEqual(
    "S2-bridge (c): deriveReceiptId === 'rcpt_' + SHA-256(signature) [hand-computed]",
    viaBridge,
    handComputed
  )
  ledger.assert(
    "S2-bridge (c): receipt_id matches /^rcpt_[0-9a-f]{64}$/",
    /^rcpt_[0-9a-f]{64}$/.test(evaluatedAction.receipt_id),
    `receipt_id=${evaluatedAction.receipt_id}`
  )

  // (2) well-formed EvaluatedAction: every canonical key present
  for (const k of CANONICAL_KEYS) {
    ledger.assert(
      `S2-bridge: EvaluatedAction has canonical key '${String(k)}'`,
      Object.prototype.hasOwnProperty.call(evaluatedAction, k)
    )
  }

  // (3) field threading: context-sourced + one assessment-sourced field
  ledger.assertEqual(
    'S2-bridge: agent_id threaded from context',
    evaluatedAction.agent_id,
    extras.agent_id
  )
  ledger.assertEqual(
    'S2-bridge: skill_id threaded from context',
    evaluatedAction.skill_id,
    extras.skill_id
  )
  ledger.assertEqual(
    'S2-bridge: evaluated_at threaded from context',
    evaluatedAction.evaluated_at,
    extras.evaluated_at
  )
  ledger.assertEqual(
    'S2-bridge: proximity copied from assessment.katorthoma_proximity',
    evaluatedAction.proximity,
    signed.assessment.katorthoma_proximity
  )

  return { evaluatedAction, expectedReceiptId: viaBridge }
}
