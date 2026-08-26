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
