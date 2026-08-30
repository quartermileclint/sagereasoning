/**
 * provenance-classification.ts — the pure classifier for the signature-keyed
 * extraction-provenance ledger (round-6 mentor ruling, Q5, 2026-08-26).
 *
 * PURE — identity + ledger-lookup-result in, outcome out. No I/O, no env
 * read, no clock (the caller injects `now`). Slice 2 calls this at
 * `emitAccreditationTrustEvents`, record-only (classify, log, return — never
 * refuses the mint, never writes `agent_provenance_gaps`). Slice 5's
 * ENFORCE-phase wiring calls this SAME function and acts on its output
 * (refuse vs. permit) instead of rewriting or inheriting side effects from a
 * non-pure version — record-only and enforce-only differ only in what they DO
 * with the classification result, never in how the result is produced
 * (verbatim, round-6 ruling).
 *
 * LEDGER-ELIGIBLE ARTIFACT — stated here, in this function's own contract,
 * per the ruling's binding implementation note ("the classification logic
 * cannot run on artifacts the ledger was never designed to cover... The
 * eligibility predicate should be defined in the pure function's contract,
 * not inferred by its callers"):
 *
 *   An artifact is ledger-eligible for THIS function IFF a ledger lookup was
 *   actually attempted and returned a data outcome (`ProvenanceLedgerLookupOutcome`
 *   — `found:true` or `found:false`), as opposed to an I/O failure. Concretely,
 *   the CALLER is responsible for two preconditions before invoking this
 *   function at all:
 *     1. The artifact carries a non-empty `signature` (the "gate on a
 *        signature being present" rule) — without one there is no
 *        signature_hash to look up, and the caller must skip classification
 *        for that artifact entirely (not call this function with a
 *        placeholder).
 *     2. The ledger lookup itself succeeded at the I/O layer (`StoreResult.ok
 *        === true` from `lookupProvenanceLedgerEntry`) — an I/O error is an
 *        INSTRUMENT failure, not a fact about the artifact, and must never be
 *        coerced into this function's `lookup` parameter (SCOPE §5: "a ledger
 *        read that errors is not a missing entry... must not be silently
 *        treated as either resolution or refusal"). The caller logs the I/O
 *        failure distinctly and skips classification for that artifact.
 *
 *   Given those two preconditions, EVERY artifact this function is called on
 *   IS ledger-eligible — including one that predates the ledger's
 *   consult-side write beginning to record for its identity. That artifact
 *   produces a genuine, attempted `found:false` lookup outcome (the ledger
 *   really was consulted; it really has no row), which this function
 *   classifies as `no_ledger_entry` — the correct, honest, and PERMANENT
 *   reading (SCOPE §9's C2 names this exact class: "an artifact that
 *   predates the ledger... is not a supplied artifact — it is an artifact the
 *   ledger cannot speak to"). Callers must never distinguish "genuinely
 *   missing" from "predates the ledger" at this layer — both are the same
 *   fact from the ledger's own point of view, and treating them differently
 *   would require a second, un-ruled notion of artifact age this function
 *   does not have and is not asked to have.
 */

import type { LongitudinalIdentity } from '../longitudinal-identity'
import type { ProvenanceLedgerLookupHit, ProvenanceLedgerLookupOutcome } from './provenance-ledger-store'
import { PROVENANCE_LEDGER_RETENTION_DAYS } from './provenance-ledger-store'

/** The five outcomes (round-6 ruling): one resolution, four refusal reasons.
 *  The four reasons are the CLOSED vocabulary the sibling agent_provenance_gaps
 *  migration's `reason` CHECK admits — this type and that CHECK must never
 *  drift (a build widening one must widen the other in the same session). */
export type ProvenanceClassificationOutcome =
  | 'permit'
  | 'no_ledger_entry'
  | 'out_of_window'
  | 'identity_mismatch'
  | 'caller_supplied_extraction'

export interface ClassifyProvenanceArtifactInput {
  /** The write-side identity — resolved via resolveLongitudinalIdentity from
   *  the ACCREDITATION-WRITE credential's context (SCOPE §5 step 1). The
   *  existing identity module, unchanged; no second identity notion. */
  writeSideIdentity: LongitudinalIdentity
  /** The ledger's lookup outcome for this artifact's sha256(signature) — a
   *  DATA outcome only (see this file's header for the eligibility contract);
   *  never an I/O error. */
  lookup: ProvenanceLedgerLookupOutcome
  /** Injected for determinism — no `new Date()` inside a pure function. */
  now: Date
  /** The retention window, in days, an entry must fall within to still be
   *  "in window". Defaults to the ledger's own declared retention (SCOPE
   *  §7 — 90 days); overridable for tests. */
  windowDays?: number
}

/**
 * Classify one submitted signed artifact against the provenance ledger.
 *
 * Precedence when a lookup succeeds and could in principle satisfy more than
 * one refusal condition at once (mirrors the sibling agent_provenance_gaps
 * migration's stated GAP-2 precedence, most to least severe — the SAME
 * ordering this function reuses per-artifact so slice 5's cross-artifact
 * reduction can apply it identically): caller_supplied_extraction (a
 * POSITIVE finding — the ledger had data, and the data disqualifies the
 * mint) > identity_mismatch (the ledger had data, but for a different
 * identity) > out_of_window (the ledger had data, but it aged out) >
 * no_ledger_entry (no data was ever recorded — the true fallback).
 */
export function classifyProvenanceArtifact(
  input: ClassifyProvenanceArtifactInput,
): ProvenanceClassificationOutcome {
  const { writeSideIdentity, lookup, now } = input
  const windowDays = input.windowDays ?? PROVENANCE_LEDGER_RETENTION_DAYS

  if (!lookup.found) return 'no_ledger_entry'

  const { entry } = lookup

  if (entry.layer1_source === 'supplied') return 'caller_supplied_extraction'

  if (!writeSideIdentityMatches(writeSideIdentity, entry)) return 'identity_mismatch'

  const ageMs = now.getTime() - new Date(entry.recorded_at).getTime()
  const windowMs = windowDays * 24 * 60 * 60 * 1000
  if (!(ageMs <= windowMs)) return 'out_of_window' // NaN-safe: a malformed/unparseable recorded_at fails the <= comparison and conservatively refuses, never silently permits.

  return 'permit'
}

/**
 * SCOPE §3.4's general rule, encoded: "every credential that produces
 * assessments must resolve to the same longitudinal identity as the
 * credential that submits them." The write-side identity is the canonical
 * comparison target because the 6e §A invariant requires every
 * accreditation-write credential to be owner+agent bound going forward — so
 * `writeSideIdentity.kind` is expected to always be `owner_agent_pair` in
 * practice; the `credential`-kind branch below is handled conservatively
 * (never matches) rather than assumed unreachable, since this function must
 * not silently permit on an input shape SCOPE never licenses comparing.
 *
 * This is EXACTLY the check that makes the s9-loop harness's own deferred
 * case (SCOPE §3.1/§3.3) refuse: its consult credential is owner-less
 * (`identity_kind: 'credential'`), so a ledger entry recorded under it can
 * never match an `owner_agent_pair` write-side identity — by construction,
 * not by a special-cased exclusion.
 */
function writeSideIdentityMatches(
  write: LongitudinalIdentity,
  entry: Pick<ProvenanceLedgerLookupHit, 'identity_kind' | 'owner_user_id' | 'agent_id'>,
): boolean {
  if (write.kind !== 'owner_agent_pair') return false
  return (
    entry.identity_kind === 'owner_agent_pair' &&
    entry.owner_user_id === write.owner_user_id &&
    entry.agent_id === write.agent_id
  )
}

// ============================================================================
// SLICE 3 — the SERVED wording for one public provenance-gap entry
// ============================================================================
//
// Placed in THIS file, beside the closed reason vocabulary it renders, so the
// two cannot drift: a build widening ProvenanceClassificationOutcome must
// widen PROVENANCE_GAP_REASON_TEXT in the same edit or `tsc` fails (the
// Record<> below is exhaustive over the four refusal reasons by type, not by
// convention).
//
// PURE TEMPLATES, never composed and never LLM-authored — the discipline
// ORIENTATION_ENTRY_TEXT / selectOrientationEntryWording established for the
// only other per-entry rendered list on this payload (C2c).
//
// THE Q2 RULING IS WHAT THESE FOUR STRINGS ENCODE. It requires the served
// reason to distinguish "the instrument had no data" from "the instrument had
// data and the data disqualified the mint" — so `caller_supplied_extraction`
// carries DISTINCT text naming a positive finding, and the other three each
// name the specific limit that produced them (never recorded / aged out /
// recorded under another identity). A single shared "provenance unverified"
// string would collapse exactly the distinction the ruling exists to preserve.

/** The four served reason templates — one per refusal reason (F-2's "the
 *  reason", made explicit rather than delegated to an unpinned string).
 *
 *  PRECONDITION for every string below (PR19 fold): a gap row — and therefore
 *  any of this text — renders ONLY under enforcement (SCOPE §5 step 4). "The
 *  mint was declined" is true because nothing writes agent_provenance_gaps in
 *  the record-only phase. IF ANY FUTURE SLICE OR DIAGNOSTIC WRITES A GAP ROW
 *  WITHOUT REFUSING A MINT, every string here and the shared clause below become
 *  false the moment they render. That coupling is a precondition of this
 *  wording, not an incidental fact about it. */
export const PROVENANCE_GAP_REASON_TEXT: Record<
  Exclude<ProvenanceClassificationOutcome, 'permit'>,
  string
> = {
  // PR19 fold: the first draft said "most often because the artifact was signed
  // before the ledger began recording" — an empirical FREQUENCY claim with a
  // ZERO-observation denominator (no gap row has ever existed). It also did, one
  // layer up, exactly what this file's header forbids ("callers must never
  // distinguish 'genuinely missing' from 'predates the ledger'"). And it INVERTS
  // in steady state: the ledger row's retain_until is 90 days and
  // purgeExpiredProvenanceLedger is wired into the scheduled sweep, so a row is
  // purged at almost exactly the moment the artifact crosses the classification
  // window — routine aged-out artifacts arrive HERE, not at out_of_window, and
  // would have been served a pre-ledger explanation. Other reachable causes: the
  // consult-side write failed; signing was off; the flag was off at consult time;
  // the owner exercised data rights. The ledger cannot tell these apart, so the
  // text no longer pretends to.
  no_ledger_entry:
    'No provenance record exists for this artifact. The ledger was consulted and has no record ' +
    'of where this examination’s extraction came from — the artifact may predate the ledger, or ' +
    'its record may have passed the ledger’s retention window, or none was ever written. The ' +
    'ledger cannot distinguish these. This is an absence of instrument data, not a finding about ' +
    'the artifact.',
  // PR19 fold, three corrections. (1) The first draft conflated two windows:
  // retention governs DELETION (retain_until); this outcome governs ACCEPTANCE
  // (ageMs <= windowMs). A row truly aged out of RETENTION would be deleted and
  // classify as no_ledger_entry. (2) "The ledger can no longer speak to where the
  // extraction came from" was FALSE: by the precedence order, reaching this
  // outcome means the entry WAS found and read `server`. The ledger does say; the
  // record is older than the policy accepts. (3) A malformed/unparseable
  // recorded_at also lands here (the NaN-safe conservative refusal above), where
  // nothing aged out at all. The window is INTERPOLATED from the constant: three
  // copies of "90" existed (constant, migration interval, served prose) and only
  // two were coupled.
  out_of_window:
    'A provenance record for this artifact exists, but it falls outside the ' +
    `${PROVENANCE_LEDGER_RETENTION_DAYS}-day window within which the ledger will accept a ` +
    'record as current — or it carries a timestamp the ledger could not read. The record is too ' +
    'old, or too uncertain, to verify this artifact’s origin against. This is a limit on what ' +
    'the instrument will accept, not a finding about the artifact.',
  // PR19 fold, the sharpest: this is the string the system would serve FIRST.
  // All 187 live ledger rows are identity_kind 'credential' and the C2 baseline's
  // own recorded sample outcome for the first row against its own identity is
  // `identity_mismatch`. The first draft's opening sentence — "it was recorded
  // under a different identity than the one submitting it" — reads as a
  // near-accusation that some other party presented someone else's artifact. For
  // that population the truth is a credential-configuration difference the
  // harness has BY DESIGN: its consult credential is owner-less
  // (external_consumer) while its write credential is owner+agent bound under the
  // 6e §A invariant — same operator, same agent. Worse,
  // writeSideIdentityMatches ALSO returns false when write.kind !==
  // 'owner_agent_pair', a fact about the SUBMITTING credential decided before the
  // entry is examined at all, where "recorded under a different identity" is
  // simply not what happened. The causal first sentence is dropped; the second
  // was already correctly scoped to what cannot be CONFIRMED.
  identity_mismatch:
    'A provenance record for this artifact exists, but the identity it was recorded under and ' +
    'the identity submitting it do not resolve to the same longitudinal scope — which can mean a ' +
    'different agent, or the same agent using credentials whose identity scopes differ. The ' +
    'ledger cannot confirm that the agent presenting this artifact is the agent whose consult ' +
    'produced it.',
  // Reviewed as accurate as first drafted: the entry exists, layer1_source ===
  // 'supplied', and that value is computed unconditionally at the consult from
  // `preExtractedLayer1Schema !== undefined`, never flag-gated.
  caller_supplied_extraction:
    'A provenance record for this artifact exists, and it records that the extraction was ' +
    'supplied by the caller rather than produced by the server. The instrument had data and ' +
    'the data disqualified the mint: the served attestation that a decision was reasoned as ' +
    'narrated and extracted from the submitted text does not hold where the caller supplied ' +
    'the extraction.',
}

/**
 * The did-not-stop-practising clause, carried INLINE on every entry (SCOPE
 * §6.4; the C2c ruling's structural reason applies unchanged — "the entry is
 * the unit that will be read in isolation", so a clause served once at the top
 * of the payload does not travel with an entry that is quoted alone).
 *
 * ONE shared clause across all four reasons, deliberately: F-2 makes a single
 * commitment ("an absent event will say why it is absent, and that it does not
 * mean the agent did not practise") and that commitment is uniform across the
 * reasons. The per-reason differentiation the Q2 ruling requires lives in
 * `reason_text` above, which is where the ruling put it.
 */
export const PROVENANCE_GAP_NOT_ATTESTABLE_CLAUSE =
  'The record can attest that this mint was declined and why. It cannot attest that the ' +
  'agent did not practise — a declined mint is a fact about what could be established ' +
  'about this artifact’s origin, never a finding about the agent’s reasoning.'

/**
 * The reasons this record can actually RENDER — DERIVED from the wording map
 * above, never hand-written beside it.
 *
 * PR19 fold (2026-08-30), and the derivation is the point. A hand-written
 * `known` list in the composer looked equivalent and was not: TypeScript never
 * requires a plain `T[]` literal to be exhaustive, so a reviewer widened
 * `ProvenanceClassificationOutcome` AND added its template — satisfying the
 * exhaustive Record and `tsc` — and the new reason was still silently dropped
 * from the public record, disclosed with a note saying the record "has no served
 * wording for" it, which was FALSE: the wording existed; only the filter was
 * stale. Entries vanished from an honesty surface under a misleading
 * explanation. Deriving from `Object.keys` makes the wording map the single
 * source of truth for the type, the serve set and the filter at once.
 */
export const SERVABLE_PROVENANCE_GAP_REASONS = Object.keys(
  PROVENANCE_GAP_REASON_TEXT,
) as Exclude<ProvenanceClassificationOutcome, 'permit'>[]

/**
 * Is this reason one the record can render?
 *
 * Shared by the HANDLER's 404/200 gate and the COMPOSER's render filter, so the
 * two cannot diverge. They did: the gate counted RAW store rows while the
 * composer rendered a FILTERED set, and the ruled condition is stated on the
 * SERVED field (`provenance_gaps.length > 0`). A DB CHECK widened ahead of the
 * code therefore served a publicly CACHEABLE 200 whose `provenance_gaps` was `[]`
 * and whose `total_provenance_gaps_count` was 1 — a record contradicting itself
 * in one object, justified by a gap the reader cannot see.
 */
export function isServableProvenanceGapReason(
  reason: string,
): reason is Exclude<ProvenanceClassificationOutcome, 'permit'> {
  return (SERVABLE_PROVENANCE_GAP_REASONS as readonly string[]).includes(reason)
}

/**
 * Select the served wording for ONE gap entry. Pure; mirrors
 * selectOrientationEntryWording's shape. Takes the refusal reason only — the
 * clause is reason-independent (see above), and NOTHING signature-derived is
 * an input, so F-2's hard exclusion cannot be violated through this seam.
 */
export function selectProvenanceGapWording(
  reason: Exclude<ProvenanceClassificationOutcome, 'permit'>,
): { reasonText: string; notAttestableClause: string } {
  return {
    reasonText: PROVENANCE_GAP_REASON_TEXT[reason],
    notAttestableClause: PROVENANCE_GAP_NOT_ATTESTABLE_CLAUSE,
  }
}
