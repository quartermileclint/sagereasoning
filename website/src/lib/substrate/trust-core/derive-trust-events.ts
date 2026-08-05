/**
 * derive-trust-events.ts — turn verifiable examination artifacts into typed trust
 * events (the R18f-parallel emission core). Pure — no I/O, no env.
 *
 * THE R18f-PARALLEL GUARANTEE. deriveCredentialAndJusticeEvents RE-VERIFIES every
 * signed assessment (verifyLayer2Signature) and derives events ONLY from the ones
 * that verify against the published key. A tampered / unsigned / forged assessment
 * yields NO events. So the guarantee is STRUCTURAL + self-contained here — it does
 * not rely on the caller having run the provenance gate (though the accreditation
 * write already has). deriveReflectEvent gates on the honest-completion signals
 * (context_source = agent_stated + fabrication_risk != high). No trust event
 * without a verifiable examination artifact.
 *
 * SCOPE (E1 "also wire justice"): this session wires credential-completed +
 * reflect-completed-honest + the justice-surface events. The demonstrated per-
 * domain proximity is taken CONSERVATIVELY (the weakest across the verified
 * assessments engaging a domain — resisting gaming by one strong assessment);
 * S2 refines the proportional weighting (domain distance, coverage continuity,
 * confidence tiers).
 */

import {
  verifyLayer2Signature,
} from '@/lib/translation-sandwich/layer2-verifier'
import { SUB_SPECIES } from '@/lib/translation-sandwich/layer1-extractor'
import type { SignedLayer2Assessment } from '@/lib/translation-sandwich/layer2-signer'
import type {
  KatorthomaProximity,
  VirtueDomain,
} from '@/lib/translation-sandwich/layer2-mechanisms'
import { PROXIMITY_RANK } from './constants'
import type { CoverageStatus, TrustEvent } from './types'

/** verifyLayer2Signature's result (structural — avoids importing its private type). */
type VerifyResult = { valid: true; key_id: string } | { valid: false; reason: string }
type VerifyFn = (signed: SignedLayer2Assessment, now: Date) => VerifyResult

export interface CredentialJusticeInput {
  agentId: string
  ownerUserId: string | null
  credentialRef: string | null
  signedAssessments: SignedLayer2Assessment[]
  /** From the accreditation profile, when known (spec-4 coverage). Undefined ⇒
   *  presumed continuous (a completed R18f-verified write is a completed
   *  credential; only suspended/resumed-unverified downgrades the rise). */
  coverageStatus?: CoverageStatus
  now: Date
  /** Shared idempotency key for the fanned rows (the write's correlation). */
  correlationId: string
  /** Injectable for tests; defaults to the real Ed25519 verifier. */
  verify?: VerifyFn
}

/** Derive credential-completed (per engaged domain) + one justice-surface event
 *  from the VERIFIED signed assessments. Returns [] when none verify. */
export function deriveCredentialAndJusticeEvents(
  input: CredentialJusticeInput,
): TrustEvent[] {
  const verify = input.verify ?? (verifyLayer2Signature as unknown as VerifyFn)

  const verified: { assessment: SignedLayer2Assessment['assessment']; keyId: string }[] = []
  for (const signed of input.signedAssessments) {
    const res = verify(signed, input.now)
    if (res.valid) verified.push({ assessment: signed.assessment, keyId: res.key_id })
  }
  // R18f-parallel: no verified artifact ⇒ no trust event.
  if (verified.length === 0) return []

  const artifactRef = `signed:${verified[0].keyId}`
  const coverageContinuous =
    input.coverageStatus === undefined ? true : input.coverageStatus === 'continuous'

  const events: TrustEvent[] = []

  // --- credential-completed, one per engaged cardinal virtue domain. The
  //     demonstrated proximity for a domain is the WEAKEST across the verified
  //     assessments that engaged it (conservative). ---
  const demonstratedByDomain = new Map<VirtueDomain, KatorthomaProximity>()
  for (const v of verified) {
    const proximity = v.assessment.katorthoma_proximity
    for (const domain of v.assessment.virtue_domains_engaged) {
      const prev = demonstratedByDomain.get(domain)
      if (prev === undefined || PROXIMITY_RANK[proximity] < PROXIMITY_RANK[prev]) {
        demonstratedByDomain.set(domain, proximity)
      }
    }
  }
  for (const [domain, demonstratedProximity] of demonstratedByDomain) {
    events.push({
      agentId: input.agentId,
      virtueDomain: domain,
      eventType: 'credential-completed',
      artifactKind: 'signed_layer2_assessment',
      artifactRef,
      payload: {
        demonstratedProximity,
        coverageContinuous,
        ...(input.coverageStatus !== undefined ? { coverageStatus: input.coverageStatus } : {}),
        keyId: verified[0].keyId,
      },
      occurredAt: input.now.toISOString(),
      correlationId: input.correlationId,
      ownerUserId: input.ownerUserId,
      credentialRef: input.credentialRef,
    })
  }

  // --- one justice-surface event (dikaiosyne) = the WORST justice outcome across
  //     the verified assessments. PA-1 fold (2026-07-11 pre-activation audit): a
  //     met outcome carries the CONSERVATIVE demonstratedProximity so the engine's
  //     clear-cap-and-increase rise is capped by demonstrated evidence — without
  //     it the engine treated every met write as an unconditional +1 ratchet. ---
  const justice = deriveWorstJusticeOutcome(verified.map((v) => v.assessment))
  if (justice !== null) {
    events.push({
      agentId: input.agentId,
      virtueDomain: 'dikaiosyne',
      eventType: justice.eventType,
      artifactKind: 'signed_layer2_assessment',
      artifactRef,
      payload: {
        obligationStatus: justice.obligationStatus,
        ...(justice.demonstratedProximity !== undefined
          ? { demonstratedProximity: justice.demonstratedProximity }
          : {}),
        keyId: verified[0].keyId,
      },
      occurredAt: input.now.toISOString(),
      correlationId: input.correlationId,
      ownerUserId: input.ownerUserId,
      credentialRef: input.credentialRef,
    })
  }

  return events
}

type JusticeOutcome = {
  eventType:
    | 'justice-surface-violated'
    | 'justice-surface-unevaluated'
    | 'justice-surface-indeterminate'
    | 'justice-surface-transparently-handled'
  obligationStatus: 'violated' | 'unevaluated' | 'indeterminate' | 'met'
  /** met only (PA-1): the WEAKEST katorthoma_proximity across the verified
   *  assessments that demonstrated the met obligation — conservative, resisting
   *  gaming by one strong assessment (the deriver-header doctrine, now applied
   *  to the justice path exactly as the credential path applies it). */
  demonstratedProximity?: KatorthomaProximity
}

/**
 * The worst justice outcome across assessments: violated > unevaluated >
 * indeterminate > met > none. "unevaluated" is the marketing-email failure —
 * dikaiosyne engaged but no circle carried an obligation_assessment. Reads only
 * well-defined fields (obligation_assessment.status + virtue_domains_engaged).
 */
export function deriveWorstJusticeOutcome(
  assessments: SignedLayer2Assessment['assessment'][],
): JusticeOutcome | null {
  let sawViolated = false
  let sawUnevaluated = false
  let sawIndeterminate = false
  let sawMet = false
  let metDemonstrated: KatorthomaProximity | null = null

  for (const a of assessments) {
    const circles = a.oikeiosis?.relevant_circles ?? []
    const statuses = circles
      .map((c) => c.obligation_assessment?.status)
      .filter((s): s is 'met' | 'violated' | 'indeterminate' => s != null)

    const dikaiosyneEngaged = a.virtue_domains_engaged.includes('dikaiosyne')

    if (statuses.includes('violated')) sawViolated = true
    if (statuses.includes('indeterminate')) sawIndeterminate = true

    // PA-4 fold (2026-07-11): met CREDITS dikaiosyne (the transparently-handled
    // rise), so it requires dikaiosyne to have been ENGAGED by the assessment —
    // the same gate 'unevaluated' already had. Without it a phronesis-only
    // assessment with a met circle minted dikaiosyne-positive evidence the agent
    // never demonstrated. violated/indeterminate stay UNGATED — the conservative
    // direction (a violated obligation is dikaiosyne evidence whichever domains
    // the extraction tagged). DISCLOSED ASYMMETRY (fold review, 2026-07-11): an
    // ungated indeterminate can SET the read-cap latch on an oddly-tagged
    // extraction, while a met under the SAME odd tagging cannot clear it — the
    // agent stays capped (the safe direction: trust reads lower, never higher)
    // until a genuinely dikaiosyne-engaged met evaluation lands. An S2/S9
    // refinement candidate; watch in the S9 instrument-fidelity batteries.
    if (dikaiosyneEngaged && statuses.includes('met')) {
      sawMet = true
      const p = a.katorthoma_proximity
      if (metDemonstrated === null || PROXIMITY_RANK[p] < PROXIMITY_RANK[metDemonstrated]) {
        metDemonstrated = p
      }
    }

    // Unevaluated (NARROWED S11b 2026-07-18, per R11 + the register D1/D3): a
    // justice surface requires AT LEAST ONE IDENTIFIED CIRCLE. The zero-circle
    // case — a dikaiosyne tag resting solely on is_kathekon===false (the
    // computeVirtueDomains `is_kathekon !== null` tag, which fires on
    // essentially every examined action) — is NOT a justice surface (the F2
    // exclusion-clause ruling) and no longer emits justice-surface-unevaluated;
    // pre-narrowing it latched a public deliberate cap off ordinary file writes
    // (the s9-loop cap, corrected in the same S11b walk). The branch STILL
    // fires when circles EXIST but none carries an obligation_assessment — the
    // U2/J2 marketing-email class the whole ADR-010 arc exists for.
    if (dikaiosyneEngaged && circles.length >= 1 && statuses.length === 0) sawUnevaluated = true
  }

  if (sawViolated) return { eventType: 'justice-surface-violated', obligationStatus: 'violated' }
  if (sawUnevaluated)
    return { eventType: 'justice-surface-unevaluated', obligationStatus: 'unevaluated' }
  if (sawIndeterminate)
    return { eventType: 'justice-surface-indeterminate', obligationStatus: 'indeterminate' }
  if (sawMet && metDemonstrated !== null)
    return {
      eventType: 'justice-surface-transparently-handled',
      obligationStatus: 'met',
      demonstratedProximity: metDemonstrated,
    }
  return null
}

// ============================================================================
// S9b derivers (ADR-013 §11 — the 2026-07-11 mentor verdicts; verbatim wins).
// All three event types are DARK until the S9b CHECK-widening migration lands:
// pre-migration the insert is rejected by the event-type CHECK and emitTrustEvents
// surfaces it as a loud store failure — no silent fabrication either way.
// ============================================================================

export interface CallingEventInput {
  agentId: string
  ownerUserId: string | null
  credentialRef: string | null
  /** WHERE the calling debt was discharged: a scoped spawn acknowledgement
   *  (collaboration record) or a full calling session (discovery_sessions). */
  source: 'spawn_acknowledgement' | 'calling_session'
  /** The SERVER-persisted record backing the event (R18f-parallel): a
   *  `collab:<record_id>` or `calling:<session_id>` handle. The deriver refuses
   *  to emit without one — a declaration with no server record is not evidence. */
  artifactRef: string
  declaredPurpose: string
  functionTypeScope: string[]
  circleOfConcernLevel: string | null
  mismatchFlagsRaised: string[]
  /** Whether a mismatch was STRUCTURALLY possible (a profiled candidate + a
   *  declared function type existed to compare). The mentor's third arm:
   *  no-mismatch-where-IMPOSSIBLE is a null event — nothing is emitted. */
  mismatchPossible: boolean
  /** Who produced the acknowledgement. Only 'agent_stated' mismatch flags can
   *  drive the dikaiosyne increase arm (the engine enforces this too — belt and
   *  braces); 'harness_computed' is always record-only. */
  acknowledgementSource: 'harness_computed' | 'agent_stated'
  now: Date
  correlationId: string
}

/**
 * Derive a calling-completed event (G1d). Returns null on the mentor's null arm
 * (no mismatch where none was possible) and on a missing server artifact.
 *
 * The increase arm's demonstrated ceiling is FIXED at 'deliberate': flagging an
 * obligation boundary rather than proceeding is deliberate-grade justice
 * behaviour — a declaration-tier act can lift dikaiosyne at most to deliberate,
 * never into the examination-demonstrated bands (principled/sage-like).
 */
export function deriveCallingEvent(input: CallingEventInput): TrustEvent | null {
  if (input.artifactRef.trim() === '') return null // R18f-parallel: no record ⇒ no event.
  const flagged = input.mismatchFlagsRaised.length > 0
  if (!flagged && !input.mismatchPossible) return null // ARM 3 — the null event.

  const agentStatedMismatch = flagged && input.acknowledgementSource === 'agent_stated'
  return {
    agentId: input.agentId,
    virtueDomain: 'dikaiosyne',
    eventType: 'calling-completed',
    artifactKind: 'calling_record',
    artifactRef: input.artifactRef,
    payload: {
      declaredPurpose: input.declaredPurpose,
      functionTypeScope: input.functionTypeScope,
      circleOfConcernLevel: input.circleOfConcernLevel,
      mismatchFlagsRaised: input.mismatchFlagsRaised,
      mismatchPossible: input.mismatchPossible,
      acknowledgementSource: input.acknowledgementSource,
      callingSource: input.source,
      // Only the agent-stated mismatch arm carries demonstrated evidence (the
      // engine's 'calling' branch reads it; ceiling deliberate by construction).
      ...(agentStatedMismatch ? { demonstratedProximity: 'deliberate' as const } : {}),
    },
    occurredAt: input.now.toISOString(),
    correlationId: input.correlationId,
    ownerUserId: input.ownerUserId,
    credentialRef: input.credentialRef,
  }
}

export interface ScreenedReflectInput {
  agentId: string
  ownerUserId: string | null
  credentialRef: string | null
  sessionId: string
  contextSource: 'agent_stated' | 'harness_inferred' | null
  /** The persisted verbatim's length — 0/absent ⇒ no event (an empty persist is
   *  not a screened reflection). */
  verbatimLength: number
  now: Date
  correlationId: string
}

/**
 * Derive a reflect-screened-honest event (G2): the harness's forced single
 * review turn, verbatim-persisted out-of-band, credentialed at depth 'screened'.
 * Honest ⇔ the persisted words are the AGENT's own (context_source =
 * agent_stated) and non-empty. Agent-wide (null domain) — quarter-rate decay
 * modulation via the 'modulate-screened' effect; NEVER the full credential's
 * weight (the full credential is earned by the out-of-band Q1–Q6 pass, which
 * emits reflect-completed-honest through the existing completion deriver).
 */
export function deriveScreenedReflectEvent(input: ScreenedReflectInput): TrustEvent | null {
  if (input.contextSource !== 'agent_stated') return null
  if (!Number.isFinite(input.verbatimLength) || input.verbatimLength <= 0) return null

  return {
    agentId: input.agentId,
    virtueDomain: null,
    eventType: 'reflect-screened-honest',
    artifactKind: 'reflect_screened_persist',
    artifactRef: `reflect:${input.sessionId}`,
    payload: {
      reflectDepth: 'screened',
      contextSource: input.contextSource,
      verbatimLength: input.verbatimLength,
    },
    occurredAt: input.now.toISOString(),
    correlationId: input.correlationId,
    ownerUserId: input.ownerUserId,
    credentialRef: input.credentialRef,
  }
}

/** One passion the agent surfaced in reflect Q4 (root + sub-species; the 3-part
 *  standard requires SUB-species — bare roots never meet it). */
export interface SurfacedPassion {
  rootPassion: string
  subSpecies: string
}

export interface SuppressionWatchInput {
  agentId: string
  ownerUserId: string | null
  credentialRef: string | null
  sessionId: string
  /** Passions surfaced by the agent across the reflect Q4 kathekon entries. */
  q4Passions: SurfacedPassion[]
  /** The session's signed assessments (what the examination engine found DURING
   *  the session). Re-verified here (R18f-parallel) — unverified artifacts count
   *  as absent evidence, never as a screen. */
  sessionAssessments: SignedLayer2Assessment[]
  /** Whether the caller declares a self-screen ran during the session. A claimed
   *  screen with ZERO verified assessments is treated as ABSENT (conservative —
   *  claimed-but-unevidenced). */
  screenRanDeclared: boolean
  now: Date
  correlationId: string
  verify?: VerifyFn
}

/** The deterministic root→domain mapping for the passion-unflagged decrease —
 *  the L4 valence split (appetitive → sophrosyne; aversive → andreia), the
 *  codebase's own precedent (l4-passion-audit Q4.2). v1 fixed; S10-tunable. */
export function passionRootToDomain(root: string): 'sophrosyne' | 'andreia' {
  return root === 'phobos' || root === 'lupe' ? 'andreia' : 'sophrosyne'
}

/**
 * G4 — the suppression watch, emitted by the reflect service at completion.
 * Implements the mentor's 3-part standard exactly:
 *   1. ABOVE-NOISE PATTERN: the same sub-species surfaced on ≥2 distinct Q4
 *      entries (never a single phrase/instance).
 *   2. SCREEN RAN AND MISSED: verified signed assessments exist for the session
 *      and NONE carries the sub-species. No verified assessments (or the screen
 *      declared absent) ⇒ self-screen-absent instead — "different events with
 *      different trust implications".
 *   3. SUB-SPECIES IDENTIFIED: root-only surfacings never emit.
 * Returns [] when nothing meets the standard.
 */
export function deriveSuppressionWatchEvents(input: SuppressionWatchInput): TrustEvent[] {
  const verify = input.verify ?? (verifyLayer2Signature as unknown as VerifyFn)

  // Sub-species surfaced in Q4, counted for the above-noise pattern (condition 1
  // + 3). Root-only entries (empty sub-species) are dropped. VOCABULARY GATE
  // (review fold, 2026-07-12): the Q4 extractor emits FREE-FORM sub-species
  // strings while the signed assessments carry the CONTROLLED PassionSubSpecies
  // vocabulary — comparing across vocabularies would read a screen-CAUGHT
  // passion ("impatience" vs the assessment's "orge") as MISSED and over-fire
  // the decrease. Part 3 of the standard therefore requires the surfaced
  // sub-species to be IN the controlled vocabulary; a non-vocabulary surfacing
  // cannot be cross-checked honestly and never emits (under-fire — the safe
  // direction; disclosed).
  const controlled = new Set<string>(SUB_SPECIES.map((s) => s.toLowerCase()))
  const counts = new Map<string, { root: string; subSpecies: string; count: number }>()
  for (const p of input.q4Passions) {
    const sub = p.subSpecies.trim().toLowerCase()
    if (sub === '') continue
    if (!controlled.has(sub)) continue // outside the controlled vocabulary — un-cross-checkable.
    const key = sub
    const cur = counts.get(key)
    if (cur) cur.count++
    else counts.set(key, { root: p.rootPassion.trim().toLowerCase(), subSpecies: sub, count: 1 })
  }
  const aboveNoise = [...counts.values()].filter((c) => c.count >= 2)
  if (aboveNoise.length === 0) return []

  // Verify the session's assessments (R18f-parallel).
  const verified: SignedLayer2Assessment['assessment'][] = []
  for (const signed of input.sessionAssessments) {
    const res = verify(signed, input.now)
    if (res.valid) verified.push(signed.assessment)
  }

  const screenRan = input.screenRanDeclared && verified.length > 0
  if (!screenRan) {
    // Condition-2 alternate branch: passions surfaced but NO screen evidence —
    // self-screen-absent (record-only 'flag' on oversight; can never raise it).
    return [
      {
        agentId: input.agentId,
        virtueDomain: 'oversight',
        eventType: 'self-screen-absent',
        artifactKind: 'reflect_completion',
        artifactRef: `reflect:${input.sessionId}`,
        payload: {
          passionsSurfacedCount: aboveNoise.length,
          screenRanDeclared: input.screenRanDeclared,
          verifiedAssessments: verified.length,
        },
        occurredAt: input.now.toISOString(),
        correlationId: input.correlationId,
        ownerUserId: input.ownerUserId,
        credentialRef: input.credentialRef,
      },
    ]
  }

  // The sub-species the engine DID flag during the session (screen-caught).
  const flaggedSubSpecies = new Set<string>()
  for (const a of verified) {
    const entries =
      (a as { passion_diagnosis?: { passions_detected?: { sub_species?: string | null }[] } })
        .passion_diagnosis?.passions_detected ?? []
    for (const e of entries) {
      if (typeof e.sub_species === 'string' && e.sub_species.trim() !== '') {
        flaggedSubSpecies.add(e.sub_species.trim().toLowerCase())
      }
    }
  }

  // DISCLOSED (review, 2026-07-12; safe direction): distinct unflagged passions
  // mapping to the SAME domain collapse to one decrease per session at the store
  // (the idempotency index keys on (correlation_id, event_type, virtue_domain))
  // — under-penalizing, never over. S2 reads the per-passion payloads regardless.
  const events: TrustEvent[] = []
  for (const p of aboveNoise) {
    if (flaggedSubSpecies.has(p.subSpecies)) continue // the screen caught it — no event.
    events.push({
      agentId: input.agentId,
      virtueDomain: passionRootToDomain(p.root),
      eventType: 'passion-unflagged-by-self-screen',
      artifactKind: 'reflect_completion',
      artifactRef: `reflect:${input.sessionId}`,
      payload: {
        passionRoot: p.root,
        passionSubSpecies: p.subSpecies,
        occurrenceCount: p.count,
        verifiedAssessments: verified.length,
      },
      occurredAt: input.now.toISOString(),
      correlationId: input.correlationId,
      ownerUserId: input.ownerUserId,
      credentialRef: input.credentialRef,
    })
  }
  return events
}

export interface ReflectInput {
  agentId: string
  ownerUserId: string | null
  credentialRef: string | null
  sessionId: string
  fabricationRiskLevel: 'low' | 'moderate' | 'high'
  contextSource: 'agent_stated' | 'harness_inferred' | null
  now: Date
  correlationId: string
}

/**
 * Derive a reflect-completed-honest event — but ONLY when the completion is
 * honest: context_source === 'agent_stated' (the agent's own verbatim words drove
 * it, not a harness inference) AND fabrication_risk_level !== 'high'. Otherwise
 * returns null (a harness-inferred or high-fabrication-risk completion is not a
 * trust-positive artifact). Agent-wide (virtue_domain = null) — it modulates
 * decay across the agent's domains, not one.
 */
export function deriveReflectEvent(input: ReflectInput): TrustEvent | null {
  const honest =
    input.contextSource === 'agent_stated' && input.fabricationRiskLevel !== 'high'
  if (!honest) return null

  return {
    agentId: input.agentId,
    virtueDomain: null,
    eventType: 'reflect-completed-honest',
    artifactKind: 'reflect_completion',
    artifactRef: `reflect:${input.sessionId}`,
    payload: {
      fabricationRiskLevel: input.fabricationRiskLevel,
      contextSource: input.contextSource,
    },
    occurredAt: input.now.toISOString(),
    correlationId: input.correlationId,
    ownerUserId: input.ownerUserId,
    credentialRef: input.credentialRef,
  }
}

// ============================================================================
// Stoa Q5c/Q13a (2026-08-04) — admin-flag-triggered only. See types.ts's
// TrustEventType Stoa block + the scoped plan
// (operations/handoffs/founder/2026-08-03-stoa-Q5c-Q13a-trust-event-wiring-
// SCOPED.md) for the binding design. NEVER call these from a background
// comparator — the mentor ruled that out on principle (Q3), not cost: a
// continuously-compared agent has an incentive to manage its Stoa entry to
// match its assessments rather than declare honestly.
// ============================================================================

/** One asserted contradiction: the curator-supplied evidentiary artifact +
 *  the curator's stated pairing (the "curator supplies only the pairing"
 *  standard — the artifact itself must independently demonstrate the
 *  contradiction; the justification records WHY the pairing was drawn, it is
 *  never itself the evidence). */
export interface StoaContradictionAssertion {
  artifactRef: string
  justification: string
  /**
   * PER-ASSERTION idempotency key (PR19 fold, 2026-08-04, HIGH — a shared
   * submission-level correlation id let a later resubmission that added the
   * SECOND block change the first block's hash input, defeating the DB
   * dedup key (correlation_id, event_type, virtue_domain) and double-
   * decreasing a domain from what is evidentially one root cause). Derive
   * this from ONLY this assertion's own content (e.g. entryId + claimQuote +
   * this artifactRef) so its identity never depends on what else is
   * submitted alongside it — an identical resubmission of THIS block alone
   * always dedupes, regardless of any other block present.
   */
  correlationId: string
}

export interface StoaContradictionInput {
  agentId: string
  ownerUserId: string | null
  credentialRef: string | null
  /** The Stoa entry carrying the false claim. */
  stoaEntryId: string
  /** The specific claim within the entry the artifact contradicts (the
   *  "reader examining both... without requiring inference" bar starts with
   *  quoting the claim itself). */
  claimQuote: string
  /** Domain is an INPUT — asserted by the submitter from the CONTENT of the
   *  claim and the nature of the contradiction, never inferred from severity
   *  here or anywhere downstream. Either, neither, or both may be present;
   *  both present ⇒ both events emitted (no dedup — "two entries from one
   *  root cause is honest, not redundant"). Each carries its OWN
   *  correlationId (see StoaContradictionAssertion) — there is deliberately
   *  no submission-level correlation id here. */
  contradictsOversight?: StoaContradictionAssertion
  contradictsDikaiosyne?: StoaContradictionAssertion
  now: Date
}

function stoaAssertionValid(a: StoaContradictionAssertion | undefined): a is StoaContradictionAssertion {
  return (
    a !== undefined &&
    typeof a.artifactRef === 'string' &&
    a.artifactRef.trim() !== '' &&
    typeof a.justification === 'string' &&
    a.justification.trim() !== ''
  )
}

/**
 * Derive Q5(c) claim-contradicted events (oversight and/or dikaiosyne, per
 * the asserted content — never a severity choice). Each requires a non-empty
 * claim quote AND a non-empty artifact reference AND a non-empty
 * justification for the domain(s) asserted — the evidentiary standard is
 * enforced structurally here (empty ⇒ no event, never a fabricated one); the
 * "concretely contradicts, no interpretation required" judgement itself is
 * the admin gate's responsibility (this function cannot verify semantic
 * contradiction — only that the required pairing was actually supplied).
 */
export function deriveStoaContradictionEvents(
  input: StoaContradictionInput,
): TrustEvent[] {
  if (input.claimQuote.trim() === '') return []
  if (input.stoaEntryId.trim() === '') return []

  const events: TrustEvent[] = []
  const base = {
    agentId: input.agentId,
    ownerUserId: input.ownerUserId,
    credentialRef: input.credentialRef,
    artifactKind: 'stoa_examined_artifact' as const,
    occurredAt: input.now.toISOString(),
  }

  if (stoaAssertionValid(input.contradictsOversight)) {
    events.push({
      ...base,
      virtueDomain: 'oversight',
      eventType: 'stoa-claim-contradicted-oversight',
      artifactRef: input.contradictsOversight.artifactRef,
      correlationId: input.contradictsOversight.correlationId,
      payload: {
        stoaEntryId: input.stoaEntryId,
        stoaClaimQuote: input.claimQuote,
        stoaJustification: input.contradictsOversight.justification,
      },
    })
  }
  if (stoaAssertionValid(input.contradictsDikaiosyne)) {
    events.push({
      ...base,
      virtueDomain: 'dikaiosyne',
      eventType: 'stoa-claim-contradicted-dikaiosyne',
      artifactRef: input.contradictsDikaiosyne.artifactRef,
      correlationId: input.contradictsDikaiosyne.correlationId,
      payload: {
        stoaEntryId: input.stoaEntryId,
        stoaClaimQuote: input.claimQuote,
        stoaJustification: input.contradictsDikaiosyne.justification,
      },
    })
  }
  return events
}

export interface StoaCallingDivergenceInput {
  agentId: string
  ownerUserId: string | null
  credentialRef: string | null
  stoaEntryId: string
  /** The server-persisted calling artifact the entry is compared against —
   *  the mentor's "shares the calling record as a data source only". */
  callingRecordRef: string
  /** The admin's stated pairing — what diverges and why (never accusation
   *  alone; the standing "concretely contradicts" bar applies here too, even
   *  though the ruling frames this as a discrepancy rather than a
   *  violation). */
  divergenceDescription: string
  now: Date
  correlationId: string
}

/**
 * Derive Q13(a): a coherence observation, never a caution. 'flag' effect —
 * present in the record for a reader who consults it, changes no domain
 * level. virtue_domain is HARD-CODED to 'oversight' — this is NOT a
 * caller-supplied choice, closing the null-domain trap (a null-domain event
 * would route to reflect-specific decay-modulation machinery one layer up in
 * the store, silently benefiting the agent from a divergence finding).
 */
export function deriveStoaCallingDivergenceEvent(
  input: StoaCallingDivergenceInput,
): TrustEvent | null {
  if (input.stoaEntryId.trim() === '') return null
  if (input.callingRecordRef.trim() === '') return null
  if (input.divergenceDescription.trim() === '') return null

  return {
    agentId: input.agentId,
    virtueDomain: 'oversight',
    eventType: 'stoa-declaration-diverges-from-calling',
    artifactKind: 'calling_record',
    artifactRef: input.callingRecordRef,
    payload: {
      stoaEntryId: input.stoaEntryId,
      stoaDivergenceDescription: input.divergenceDescription,
    },
    occurredAt: input.now.toISOString(),
    correlationId: input.correlationId,
    ownerUserId: input.ownerUserId,
    credentialRef: input.credentialRef,
  }
}
