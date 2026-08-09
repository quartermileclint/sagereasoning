/**
 * types.ts — Trust Layer S1 vocabulary + shapes (mentor spec 1/3/4 + A3 + A8 + A9;
 * ADR-013).
 *
 * The canonical proximity + virtue-domain literals are reused from the engine
 * (layer2-mechanisms.ts) so trust state never diverges from the examination
 * verdicts it aggregates. The trust-domain axis EXTENDS the four cardinal virtues
 * with 'oversight' (the orchestrator supervisory domain A8/A9 target — defined,
 * not emitted this session).
 */

import type {
  KatorthomaProximity,
  VirtueDomain,
} from '@/lib/translation-sandwich/layer2-mechanisms'

/** The trust-domain axis: the four cardinal virtues + the orchestrator's
 *  oversight function domain (mentor A8/A9). NOT the A2 function-type taxonomy
 *  (S2). */
export type VirtueTrustDomain = VirtueDomain | 'oversight'

export const VIRTUE_TRUST_DOMAINS: readonly VirtueTrustDomain[] = [
  'phronesis',
  'dikaiosyne',
  'andreia',
  'sophrosyne',
  'oversight',
] as const

/** The four cardinal virtues (the domains an examination verdict engages). */
export const CARDINAL_VIRTUE_DOMAINS: readonly VirtueDomain[] = [
  'phronesis',
  'dikaiosyne',
  'andreia',
  'sophrosyne',
] as const

/** Deployer volatility rating → the A3 decay onset. */
export type Volatility = 'low' | 'moderate' | 'high'

/** Coverage status (mentor spec 4 confidence+coverage). */
export type CoverageStatus = 'continuous' | 'suspended' | 'resumed-unverified'

/**
 * The typed trust-event vocabulary (mentor spec 3 + A8 + A9). event_type is the
 * single source of truth for an event's effect — the transition engine
 * (trust-transition.ts) maps type → effect.
 *
 * WIRED this session (E1 "also wire justice"): credential-completed,
 * reflect-completed-honest, and the four justice-surface events.
 * DEFINED but NOT emitted this session (need a /api/reason touch or the S5–S7
 * collaboration record): credential-suspended-revoked,
 * passion-unflagged-by-self-screen, and the A8/A9 orchestrator/delegation events.
 */
export type TrustEventType =
  // Increase (mentor spec 3).
  | 'credential-completed'
  | 'reflect-completed-honest'
  | 'justice-surface-transparently-handled'
  // Decrease / cap (mentor spec 3).
  | 'justice-surface-unevaluated'
  | 'justice-surface-violated'
  | 'justice-surface-indeterminate'
  | 'credential-suspended-revoked'
  | 'passion-unflagged-by-self-screen'
  // Orchestrator / delegation (mentor A8/A9 — defined, not emitted this session).
  | 'orchestrator-proceeds-under-habitual-flag'
  | 'delegation-reflection-case-1'
  | 'delegation-reflection-case-2'
  | 'delegation-reflection-case-3'
  // S9b (ADR-013 §11, the 2026-07-11 mentor verdicts — verbatim record wins).
  // DARK until the S9b founder-walked CHECK-widening migration lands.
  //   calling-completed — G1d: ASYMMETRIC update (the 'calling' effect class):
  //     an agent-stated mismatch-flag raises dikaiosyne (+1-capped, demonstrated
  //     ceiling 'deliberate'); no-mismatch-where-possible is record-only (S2
  //     declaration-tier evidence; NO level change, NO activity-clock reset);
  //     no-mismatch-where-impossible is a NULL event (the deriver emits nothing).
  //   reflect-screened-honest — G2: the harness's forced single review turn +
  //     verbatim out-of-band persist, credentialed at depth 'screened'; decay
  //     modulation at a QUARTER of the base rate (SCREENED_REFLECT_MODULATION_
  //     FACTOR), never the full credential's weight.
  //   self-screen-absent — G4: the session ran with NO self-screen (distinct from
  //     passion-unflagged-by-self-screen, where the screen ran and missed);
  //     record-only ('flag') on the oversight domain. NOTE (PA-6 standing note):
  //     none of the three can RAISE oversight — the A7 AND-guard's premise
  //     (oversight is increase-unreachable) is preserved by construction.
  | 'calling-completed'
  | 'reflect-screened-honest'
  | 'self-screen-absent'
  // Stoa Q5c/Q13a (the 2026-08-02/08-04 mentor verdicts on the connective
  // layer — verbatim record wins). DARK until the Stoa CHECK-widening
  // migration lands + BOTH SUBSTRATE_TRUST_CORE_ENABLED and
  // SUBSTRATE_STOA_TRUST_EVENTS_ENABLED are set. Admin-flag-triggered only
  // (mentor Q3: NEVER a background comparator — "an agent that knows its
  // assessments are continuously compared against its Stoa entry has an
  // incentive to manage its entry to match its assessments rather than to
  // declare honestly").
  //   stoa-claim-contradicted-oversight / -dikaiosyne — Q5(c): a demonstrated
  //     false capability claim in examined use. Domain is chosen by CONTENT
  //     of the claim and nature of the contradiction, NEVER severity
  //     (mentor, verbatim: "oversight here is not a severity escalation over
  //     dikaiosyne. It is a different domain of concern."). Both may fire
  //     from one root cause — no dedup between them.
  //   stoa-declaration-diverges-from-calling — Q13(a): the Stoa declaration
  //     diverges from the agent's declared calling record. 'flag' effect —
  //     NEVER a caution/severity ladder (a separate mechanism, a separate
  //     disposition, per the mentor's architectural reasoning). MUST carry
  //     virtue_domain: 'oversight', NEVER null — see trust-core-store.ts:155
  //     (a null-domain event routes to reflect-specific decay-modulation
  //     machinery that would silently BENEFIT the agent from a divergence
  //     finding).
  | 'stoa-claim-contradicted-oversight'
  | 'stoa-claim-contradicted-dikaiosyne'
  | 'stoa-declaration-diverges-from-calling'
  // Agent-circles C1c (2026-08-08) — the circle-5 orientation reading's event
  // class (the C2/C1c scope §4, both rulings: Option A storage + NULL domain).
  // DARK until the orientation CHECK-widening migration lands + BOTH
  // SUBSTRATE_TRUST_CORE_ENABLED and SUBSTRATE_ORIENTATION_READING_ENABLED are
  // set. Three types, not one type with a payload field — the
  // justice-surface-{...} precedent ("event_type is the single source of truth
  // for the event's effect on trust state"). All three carry the 'flag' effect
  // (the stoa-declaration-diverges-from-calling precedent — a genuine no-op on
  // trust state) and virtue_domain NULL (the reflect-completed-honest agent-wide
  // precedent: the reading describes the whole examination's directional
  // character, not one virtue domain's engagement).
  //
  // ⚠ EMISSION PATH IS LOAD-BEARING: a NULL-domain event through the generic
  // emitTrustEvents would route to applyReflectAcrossDomains and stamp
  // reflect_last_honest_at — silently granting the agent half-rate decay from
  // an orientation reading. Orientation events are emitted ONLY via
  // emitLedgerOnlyTrustEvents (insert-only, never folds state, never touches a
  // reflect timestamp) — see trust-core-store.ts; the reflect fold additionally
  // refuses non-reflect event types (defence in depth).
  | 'orientation-reading-toward'
  | 'orientation-reading-away'
  | 'orientation-reading-indeterminate'

/** The verifiable examination artifact backing a trust event (the R18f-parallel
 *  proof). S9b adds:
 *    calling_record — a SERVER-persisted calling/acknowledgement row (a
 *      collaboration_records purpose_acknowledgement, or a completed+approved
 *      discovery_sessions calling session). Server-authored — never a
 *      client-claimed declaration.
 *    reflect_screened_persist — the agent_stated verbatim persist on a
 *      sage_reflect_sessions row (the G2 screened reflection; honestly NOT named
 *      'reflect_completion' — a screened persist is not a completed sequence). */
export type ArtifactKind =
  | 'signed_layer2_assessment'
  | 'reflect_completion'
  | 'calling_record'
  | 'reflect_screened_persist'
  // Stoa Q5c: the admin-curated examined-use artifact pairing a Stoa claim
  // with the evidence that contradicts it (the Q13a divergence event reuses
  // 'calling_record' above — it shares the calling record as its data source,
  // per the mentor's ruling; no new kind needed there).
  | 'stoa_examined_artifact'

/** The coarse effect class an event has on the earned level. Derived from
 *  event_type by the engine; not stored (single source of truth = event_type). */
export type TrustEventEffect =
  | 'increase' // raise earned_level (bounded, hysteresis)
  | 'decrease' // lower earned_level (may go below the prior — trust-reducing evidence)
  | 'cap' // latch the justice cap at deliberate
  | 'clear-cap-and-increase' // clear the justice latch + raise (transparently-handled)
  | 'modulate' // reflect: set the reflect timestamp; no level change
  | 'flag' // record only; no level change (A9 case 3; self-screen-absent)
  | 'modulate-screened' // screened reflect: set the SCREENED timestamp only (quarter-rate modulation)
  | 'calling' // calling-completed: the G1d ASYMMETRIC branch (see trust-transition.ts)

/** One trust event (the ledger row shape, camelCase). */
export interface TrustEvent {
  agentId: string
  /** null for agent-wide events (reflect-completed-honest). */
  virtueDomain: VirtueTrustDomain | null
  eventType: TrustEventType
  artifactKind: ArtifactKind
  /** The R18f-parallel handle; NON-EMPTY (no event without a verifiable artifact). */
  artifactRef: string
  /** Signal for S2 weighting (demonstrated proximity, coverage, obligation status …). */
  payload: TrustEventPayload
  /** ISO timestamp of the trust-relevant occurrence. */
  occurredAt: string
  correlationId?: string | null
  ownerUserId?: string | null
  credentialRef?: string | null
}

/** Well-known payload fields (open — S2 adds more). */
export interface TrustEventPayload {
  /** credential-completed: the proximity the credential demonstrated in this domain. */
  demonstratedProximity?: KatorthomaProximity
  /** credential-completed: whether coverage was continuous (spec 3 increase condition). */
  coverageContinuous?: boolean
  coverageStatus?: CoverageStatus
  /** justice-surface-*: the per-circle obligation status that produced the event. */
  obligationStatus?: 'met' | 'violated' | 'indeterminate' | 'unevaluated'
  /** reflect-completed-honest: the honesty signals. */
  fabricationRiskLevel?: 'low' | 'moderate' | 'high'
  contextSource?: 'agent_stated' | 'harness_inferred' | null
  /** reflect-screened-honest (G2): the depth marker — always 'screened'. */
  reflectDepth?: 'screened'
  /** calling-completed (G1d): the four mentor-specified fields + provenance. */
  declaredPurpose?: string
  functionTypeScope?: string[]
  circleOfConcernLevel?: string | null
  mismatchFlagsRaised?: string[]
  /** Whether mismatches were structurally possible (a profiled candidate + a
   *  declared function type existed to compare). where-impossible ⇒ the deriver
   *  emits NOTHING (the mentor's null-event arm) — this field only ever appears
   *  true on an emitted event. */
  mismatchPossible?: boolean
  /** WHO produced the acknowledgement: 'harness_computed' (the deterministic
   *  server/harness fit-check) or 'agent_stated' (the agent's own flagging). The
   *  'calling' effect's dikaiosyne INCREASE arm requires agent_stated — the agent
   *  is never credited for the harness's work (the never-self-report doctrine,
   *  inverted). */
  acknowledgementSource?: 'harness_computed' | 'agent_stated'
  /** passion-unflagged-by-self-screen (G4): the sub-species identified (the
   *  3-part standard requires sub-species, never bare root). */
  passionSubSpecies?: string
  passionRoot?: string
  /** Stoa Q5c/Q13a: the entry + evidentiary pairing (mentor evidentiary
   *  standard — "the artifact does the evidentiary work; the curator supplies
   *  only the pairing"). stoaClaimQuote is the specific claim within the
   *  entry the artifact contradicts; stoaJustification / stoaDivergence-
   *  Description is the admin's stated pairing text, never the sole
   *  evidence. */
  stoaEntryId?: string
  stoaClaimQuote?: string
  stoaJustification?: string
  stoaDivergenceDescription?: string
  /** orientation-reading-* (C1c): the computed reading + its basis, the
   *  observation evidence that produced it (auditable server-side; NEVER served
   *  on S10 — spans quote the submitted text), the C2(ii) generative-prompt
   *  seed when populated, and the standing MEASURE-only bound. */
  orientationReading?: 'toward' | 'away' | 'indeterminate'
  orientationBasis?: string
  orientationObservations?: Array<{ observed: string; evidence: string }>
  generativePrompt?: string
  orientationBounds?: string
  /** orientation-reading-* (2026-08-08 examined/observed fold, mentor ruling):
   *  the elapsed-time-proxy delivery classification — 'examined' when the
   *  framing plausibly reached the agent within the harness's documented
   *  consult timeout, 'observed' when the server completed after that
   *  window (a PROXY, never a confirmed-delivery signal — see
   *  ORIENTATION_DELIVERY_TIMEOUT_MS). Absent on events emitted before this
   *  fold (prospective-only, mentor-ruled — never backfilled); readers must
   *  treat an absent value as 'examined' by default (the pre-fix
   *  architecture's own, now-corrected, single-class posture). */
  orientationDeliveryClass?: 'examined' | 'observed'
  /** IDEA loop `loop_id` (QG-C, ruled 2026-08-09) — the calling runner's OWN
   *  declared instance label, supplied on the consult request and stamped here
   *  VERBATIM. A PASSTHROUGH LABEL the server never interprets: nothing
   *  branches on it, it feeds no computation, and it never enters the signed
   *  assessment (it is stamped onto the event payload, after signing).
   *
   *  Composition, per the ruling: `loopId` (runner-declared, this field) and
   *  the event's own session-derived correlation identity (server-computed,
   *  `computeOrientationCorrelationId`) ride the SAME event as SEPARATE
   *  fields — never concatenated into one token, never a composite key, both
   *  independently visible. The two name different layers: `loopId` names one
   *  runner instance across many consults; the correlation identity names this
   *  one examination.
   *
   *  Present only when the caller supplied a validated value AND
   *  SUBSTRATE_LOOP_ID_FIELD_ENABLED was on for that consult — absent
   *  otherwise, and never backfilled onto earlier events (the prospective-only
   *  posture `orientationDeliveryClass` above already sets). Never served on
   *  S10: the public trust-record read projects `event_type`, `occurred_at`
   *  and a single JSON-path `delivery_class` — never the whole payload. */
  loopId?: string
  /** signing key id, session id, etc. — free additional context. */
  [key: string]: unknown
}

/**
 * The mutable per-domain earned state the transition folds (mirrors the
 * agent_trust_state row, camelCase). Config fields (profilePrior, volatility) are
 * set at row creation; the rest are folded from events.
 */
export interface EarnedDomainState {
  earnedLevel: KatorthomaProximity
  profilePrior: KatorthomaProximity
  volatility: Volatility
  /** ISO or null. */
  lastDomainActivityAt: string | null
  /** ISO or null (agent-wide reflect signal, denormalised onto the domain row). */
  reflectLastHonestAt: string | null
  /** ISO or null (S9b G2 — the agent-wide SCREENED-reflect signal; quarter-rate
   *  decay modulation; the FULL reflect signal above wins when both are active). */
  reflectLastScreenedAt?: string | null
  justiceFloorActive: boolean
  coverageStatus: CoverageStatus | null
}

/** A fresh domain state at the profile prior (no events yet). */
export function initialEarnedDomainState(opts?: {
  profilePrior?: KatorthomaProximity
  volatility?: Volatility
}): EarnedDomainState {
  const profilePrior = opts?.profilePrior ?? 'habitual'
  return {
    earnedLevel: profilePrior,
    profilePrior,
    volatility: opts?.volatility ?? 'high',
    lastDomainActivityAt: null,
    reflectLastHonestAt: null,
    reflectLastScreenedAt: null,
    justiceFloorActive: false,
    coverageStatus: null,
  }
}

/** The read result for one domain (earned + decayed + capped + honesty). */
export interface EffectiveDomainTrust {
  virtueDomain: VirtueTrustDomain
  /** The trust level after A3 decay + the justice cap — the LIVE value. */
  effectiveLevel: KatorthomaProximity
  /** The stored as-of-last-event level, before decay/cap. */
  earnedLevel: KatorthomaProximity
  profilePrior: KatorthomaProximity
  /** How many proximity ranks decay removed on this read (0 if none / inactive). */
  decayStepsApplied: number
  /** True when the justice latch capped the effective level at deliberate. */
  justiceCapped: boolean
  /** True when reflect modulation slowed the decay (an active reflect practice). */
  reflectModulated: boolean
  coverageStatus: CoverageStatus | null
  /** Whether the domain has any earned evidence beyond the prior. */
  hasEvidence: boolean
}

/**
 * The aggregate trust verdict across an agent's domains (mentor spec 4 / spec 6:
 * the MINIMUM domain trust level). The confidence-weighting + cross-source
 * conflict-pause are S2/S3 extensions — this is the deterministic minimum-domain
 * core.
 */
export interface AggregateTrust {
  /** The minimum effective level across evaluated domains, or null if none. */
  level: KatorthomaProximity | null
  /** The limiting (weakest) domain. */
  limitingDomain: VirtueTrustDomain | null
  basis: string
  /** True when a justice latch is active on any domain (surfaced for S4). */
  anyJusticeCapped: boolean
}

/** An agent's full trust profile (the read surface, measure mode). */
export interface TrustProfile {
  schema: 'agent-trust-profile-v1'
  agentId: string
  /** The domains with earned evidence (a persisted state row). */
  domains: EffectiveDomainTrust[]
  aggregate: AggregateTrust
  /**
   * Cardinal virtue domains with NO earned evidence — a coverage/scoping gap the
   * consumer must see (mentor spec 5 oikeiosis: a trust record is scoped to the
   * circles/domains actually evaluated; deploying on a task requiring an
   * un-evaluated domain needs a fresh assessment). Excludes 'oversight' (a
   * role domain, not a cardinal virtue).
   */
  unevaluatedCardinalDomains: VirtueDomain[]
  /** True when NO domain has earned evidence yet (profile-prior only). */
  sparse: boolean
}
