/**
 * trust-transition.ts — mentor spec 3 trust dynamics: the deterministic
 * event → earned-state transition.
 *
 * Each typed event has a fixed effect on the per-domain earned trust level. The
 * transition is HYSTERESIS-bounded (a single positive event raises the level by
 * at most one proximity rank — "stability of disposition outranks episodic
 * credential quality") and CATEGORICAL (R6c — ordinal proximity steps, never a
 * numeric score). The proportional MAGNITUDE the mentor describes ("∝ domain
 * match × coverage continuity", "∝ gap duration × domain relevance") is refined
 * by S2's evidence weighting / confidence tiers / domain distance; S1 realises
 * the DIRECTION + the floor/cap/latch semantics that are spec-3's own remit, and
 * records the raw signal in the event payload for S2 to weight. The S2 seam is
 * marked below.
 *
 * DECAY REALISATION INVARIANT: any event that CHANGES the earned level first
 * realises accrued A3 decay up to the event's occurred_at, then applies its
 * effect, and sets last_domain_activity_at = occurred_at. So the stored
 * earned_level is always "as of last_domain_activity_at", and the read path's
 * lazy decay never double-counts. Events that do NOT change the level
 * (reflect-completed-honest = modulate; delegation-reflection-case-3 = flag) do
 * NOT realise decay or reset the activity clock — they touch only the reflect
 * timestamp / nothing.
 *
 * Pure — no I/O, no env. `now` (= event.occurredAt) is used only for the
 * realise-decay step.
 */

import type { KatorthomaProximity } from '@/lib/translation-sandwich/layer2-mechanisms'
import type {
  EarnedDomainState,
  TrustEvent,
  TrustEventEffect,
  TrustEventType,
} from './types'
import { PROXIMITY_RANK, rankToProximity } from './constants'
import { decayEarnedRank } from './trust-decay'

/** event_type → coarse effect class (the single source of truth for direction). */
export const EVENT_EFFECT: Record<TrustEventType, TrustEventEffect> = {
  'credential-completed': 'increase',
  'reflect-completed-honest': 'modulate',
  'justice-surface-transparently-handled': 'clear-cap-and-increase',
  'justice-surface-unevaluated': 'cap',
  'justice-surface-indeterminate': 'cap',
  'justice-surface-violated': 'decrease',
  'credential-suspended-revoked': 'decrease',
  'passion-unflagged-by-self-screen': 'decrease',
  'orchestrator-proceeds-under-habitual-flag': 'decrease',
  'delegation-reflection-case-1': 'decrease',
  'delegation-reflection-case-2': 'decrease',
  'delegation-reflection-case-3': 'flag',
  // S9b (ADR-013 §11). None of these can raise the oversight domain (PA-6 guard):
  // 'calling' raises only dikaiosyne (and only on the agent-stated mismatch arm);
  // the other two never raise anything.
  'calling-completed': 'calling',
  'reflect-screened-honest': 'modulate-screened',
  'self-screen-absent': 'flag',
  // Stoa Q5c/Q13a (2026-08-04). The two contradiction events are ordinary
  // 'decrease' — domain chosen by CONTENT, never severity (mentor, verbatim:
  // "oversight here is not a severity escalation over dikaiosyne"); both may
  // fire together, no dedup. The divergence event is 'flag' — a genuine
  // no-op here (see the effect implementation below); it MUST be emitted
  // with virtue_domain 'oversight' (never null) so the store's fold routes
  // through foldDomainEvent, not the reflect-specific null-domain path.
  'stoa-claim-contradicted-oversight': 'decrease',
  'stoa-claim-contradicted-dikaiosyne': 'decrease',
  'stoa-declaration-diverges-from-calling': 'flag',
  // Agent-circles C1c (2026-08-08). All three orientation readings are 'flag' —
  // a genuine no-op on trust state (the stoa divergence precedent, reused per
  // the storage-home ruling). The reading binds nothing: it is MEASURE-only,
  // never an S4 input, and structurally excluded from per-domain aggregation
  // (virtue_domain NULL). NOTE these events never reach applyTrustEvent in
  // practice — they are emitted via the INSERT-ONLY store path (a NULL-domain
  // event through the generic fold would mis-route to the reflect machinery);
  // the entries here keep EVENT_EFFECT total over TrustEventType and pin the
  // no-op reading if a future caller ever folds one.
  'orientation-reading-toward': 'flag',
  'orientation-reading-away': 'flag',
  'orientation-reading-indeterminate': 'flag',
}

/**
 * Fold ONE trust event into a domain's earned state. Deterministic + pure.
 * Returns a NEW EarnedDomainState (does not mutate `prior`).
 */
export function applyTrustEvent(
  prior: EarnedDomainState,
  event: TrustEvent,
): EarnedDomainState {
  const effect = EVENT_EFFECT[event.eventType]

  // --- modulate (reflect-completed-honest): set the reflect timestamp only. No
  //     earned-level change, no activity-clock reset (reflect is not domain
  //     activity — it slows decay across all domains via the read path). ---
  if (effect === 'modulate') {
    return { ...prior, reflectLastHonestAt: event.occurredAt }
  }

  // --- modulate-screened (reflect-screened-honest, S9b G2): set the SCREENED
  //     timestamp only — the quarter-rate decay modulator. Same non-activity
  //     semantics as full modulate: no level change, no clock reset. ---
  if (effect === 'modulate-screened') {
    return { ...prior, reflectLastScreenedAt: event.occurredAt }
  }

  // --- flag (delegation-reflection-case-3, A9 case-3; self-screen-absent, S9b
  //     G4): record only. No state change. ---
  if (effect === 'flag') {
    return { ...prior }
  }

  // --- calling (calling-completed, S9b G1d — the mentor's ASYMMETRIC update):
  //     ARM 1 (increase): an AGENT-STATED mismatch-flag is dikaiosyne-positive
  //       evidence ("the agent identified an obligation boundary and flagged it
  //       rather than proceeding") — handled below via the shared increase
  //       machinery (realise decay → +1-capped rise toward demonstratedProximity,
  //       which the deriver caps at 'deliberate': a declaration-tier act can
  //       never demonstrate principled/sage-like justice). Genuine domain
  //       activity ⇒ the activity clock resets.
  //     ARM 2 (record-only): a no-mismatch-where-possible event, or a
  //       harness-COMPUTED mismatch (the agent is never credited for the
  //       harness's work), is S2 declaration-tier evidence in the LEDGER only —
  //       NO level change and NO activity-clock reset (a declaration must not
  //       be able to freeze decay — the PA-10 replay lesson applied forward).
  //     ARM 3 (null): no-mismatch-where-impossible never reaches the engine —
  //       the deriver emits nothing (battery-pinned there).
  if (effect === 'calling') {
    const agentStatedMismatch =
      event.payload.acknowledgementSource === 'agent_stated' &&
      Array.isArray(event.payload.mismatchFlagsRaised) &&
      event.payload.mismatchFlagsRaised.length > 0
    if (!agentStatedMismatch) {
      return { ...prior } // ARM 2 — record-only; the ledger row is the evidence.
    }
    // ARM 1 falls through to the shared decay-realise + increase path below.
  }

  // All remaining effects change the earned level → realise accrued decay up to
  // the event, then apply the effect from the decayed position.
  const decayed = decayEarnedRank({
    earnedLevel: prior.earnedLevel,
    profilePrior: prior.profilePrior,
    lastDomainActivityAt: prior.lastDomainActivityAt,
    volatility: prior.volatility,
    reflectLastHonestAt: prior.reflectLastHonestAt,
    reflectLastScreenedAt: prior.reflectLastScreenedAt ?? null,
    now: new Date(event.occurredAt),
  })
  const fromRank = decayed.rank

  let newRank = fromRank
  let justiceFloorActive = prior.justiceFloorActive
  let coverageStatus = prior.coverageStatus

  switch (effect) {
    case 'calling': {
      // ARM 1 only (the guard above returned for every other arm): an
      // agent-stated mismatch-flag rises like a credential — +1-capped toward
      // the demonstrated proximity, which the DERIVER fixes at 'deliberate'
      // (flagging an obligation boundary is deliberate-grade justice behaviour;
      // it can lift dikaiosyne AT MOST to deliberate, never above — the
      // declaration tier stays structurally below the examination tiers).
      const demonstratedRank =
        event.payload.demonstratedProximity !== undefined
          ? PROXIMITY_RANK[event.payload.demonstratedProximity]
          : null
      if (demonstratedRank !== null && demonstratedRank > fromRank) {
        newRank = Math.min(demonstratedRank, fromRank + 1)
      }
      break
    }
    case 'increase': {
      // credential-completed: rise toward the demonstrated proximity, at most one
      // rank per event (hysteresis), and ONLY on continuous coverage (a gapped
      // credential is recorded but does not raise the level — S2 refines the
      // proportional magnitude by domain distance + coverage continuity).
      const demonstratedRank =
        event.payload.demonstratedProximity !== undefined
          ? PROXIMITY_RANK[event.payload.demonstratedProximity]
          : null
      const continuous = event.payload.coverageContinuous === true
      if (continuous && demonstratedRank !== null && demonstratedRank > fromRank) {
        newRank = Math.min(demonstratedRank, fromRank + 1)
      }
      if (event.payload.coverageStatus !== undefined) {
        coverageStatus = event.payload.coverageStatus
      }
      break
    }
    case 'clear-cap-and-increase': {
      // justice-surface-transparently-handled — the highest single positive event
      // (mentor spec 3): CLEARS the justice latch (a demonstrated evaluation) AND
      // rises toward the demonstrated proximity, at most one rank (hysteresis),
      // RISE-ONLY. "Highest single positive event" is realised as ORDERING — this
      // event does everything credential-completed's rise does PLUS clears the
      // latch — never as an uncapped rise.
      //
      // PA-1/PA-9 fold (2026-07-11 pre-activation audit): demonstratedProximity
      // is REQUIRED for a rise — absent ⇒ the latch clears but the level HOLDS
      // (conservative; the pre-fold default of sage_like made every met-obligation
      // write an unconditional +1 ratchet to the top). And a demonstrated
      // proximity at/below the current rank never lowers it (a positive event
      // must not decrease — PA-9's latent 3-rank drop). Coverage continuity is
      // deliberately NOT gated here: spec-3 attaches "∝ coverage continuity" to
      // credential-completed; S2 owns the proportional weighting.
      justiceFloorActive = false
      const demonstratedRank =
        event.payload.demonstratedProximity !== undefined
          ? PROXIMITY_RANK[event.payload.demonstratedProximity]
          : null
      if (demonstratedRank !== null && demonstratedRank > fromRank) {
        newRank = Math.min(demonstratedRank, fromRank + 1)
      }
      break
    }
    case 'cap': {
      // justice-surface-unevaluated / -indeterminate: latch the deliberate cap
      // (applied on read) until a demonstrated evaluation clears it. The stored
      // earned level is unchanged; the cap bites at read time.
      justiceFloorActive = true
      newRank = fromRank
      break
    }
    case 'decrease': {
      // justice-surface-violated → hard floor to reflexive (rank 0); the other
      // decrease events step down one rank (S2 refines magnitude by gap duration
      // × domain relevance). A trust-reducing EVENT may push BELOW the prior
      // (positive evidence of deterioration, distinct from decay).
      if (event.eventType === 'justice-surface-violated') {
        newRank = PROXIMITY_RANK.reflexive
      } else {
        newRank = Math.max(PROXIMITY_RANK.reflexive, fromRank - 1)
      }
      break
    }
  }

  // The floor rank is never enforced UP here — a decrease below the prior stands
  // (it is evidence, not decay). Bound to the valid rank range.
  newRank = Math.max(PROXIMITY_RANK.reflexive, Math.min(PROXIMITY_RANK.sage_like, newRank))

  return {
    ...prior,
    earnedLevel: rankToProximity(newRank) as KatorthomaProximity,
    lastDomainActivityAt: event.occurredAt,
    justiceFloorActive,
    coverageStatus,
  }
}

/**
 * Fold an ordered sequence of events into per-domain earned states — the pure
 * replay used by the battery. (C-3, 2026-07-11: NO store rebuild function exists
 * yet — after a fold divergence the materialised agent_trust_state is repaired by
 * hand-running this replay over the agent_trust_events ledger; the ledger is
 * authoritative.) Reflect events (NULL
 * virtue_domain) modulate ALL of the agent's domain states (agent-wide);
 * delegation-reflection-case-2 (oversight + dikaiosyne) is fanned by the caller
 * into two per-domain events, so here it targets whatever virtue_domain the event
 * carries.
 *
 * `seed` supplies initial states (e.g. profile prior / volatility) per domain;
 * a domain absent from `seed` is initialised at the default prior on first touch.
 */
export function foldTrustEvents(
  events: TrustEvent[],
  seed: (domain: string) => EarnedDomainState,
): Map<string, EarnedDomainState> {
  const states = new Map<string, EarnedDomainState>()
  const ordered = [...events].sort(
    (a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt),
  )

  for (const event of events.length ? ordered : []) {
    if (event.virtueDomain === null) {
      // Agent-wide (reflect): fold into every existing domain state.
      for (const [domain, state] of states) {
        states.set(domain, applyTrustEvent(state, event))
      }
      // Also stash the reflect signal so a domain FIRST touched later inherits it.
      const pseudo = states.get('__reflect_seed__') ?? seed('__reflect_seed__')
      states.set('__reflect_seed__', applyTrustEvent(pseudo, event))
      continue
    }
    const domain = event.virtueDomain
    let state = states.get(domain)
    if (!state) {
      state = seed(domain)
      // Inherit the agent-wide reflect timestamps seen so far, if any (full +
      // screened — S9b G2 adds the screened signal, same agent-wide semantics).
      const reflectSeed = states.get('__reflect_seed__')
      if (reflectSeed?.reflectLastHonestAt) {
        state = { ...state, reflectLastHonestAt: reflectSeed.reflectLastHonestAt }
      }
      if (reflectSeed?.reflectLastScreenedAt) {
        state = { ...state, reflectLastScreenedAt: reflectSeed.reflectLastScreenedAt }
      }
    }
    states.set(domain, applyTrustEvent(state, event))
  }

  states.delete('__reflect_seed__')
  return states
}
