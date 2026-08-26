/**
 * provenance-classification.test.ts — the pure classifier's coverage
 * (round-6 mentor ruling, 2026-08-26): all five outcomes, the precedence
 * order among a "found" entry's several possibly-true properties, the
 * identity-match branch (incl. the s9-loop harness's own deferred shape),
 * the window-boundary edge, and the eligibility-predicate boundary this
 * file's header documents.
 *
 * PURE — no I/O, no env, no DB. Plain-assertion script: npx tsx <this file>.
 */
import { classifyProvenanceArtifact } from '../provenance-classification'
import type { ProvenanceLedgerLookupOutcome } from '../provenance-ledger-store'
import type { LongitudinalIdentity } from '../../longitudinal-identity'

let passed = 0
let failed = 0
const failures: string[] = []
function assert(cond: boolean, label: string): void {
  if (cond) passed++
  else {
    failed++
    failures.push(label)
    console.error('FAIL: ' + label)
  }
}

const NOW = new Date('2026-08-26T00:00:00Z')

const PAIR_IDENTITY: LongitudinalIdentity = {
  kind: 'owner_agent_pair',
  owner_user_id: 'owner-1',
  agent_id: 'sagereasoning:test@v1',
  credential_ref: 'api_key:accred-1',
}

const CREDENTIAL_IDENTITY: LongitudinalIdentity = {
  kind: 'credential',
  credential_ref: 'api_key:accred-owner-less',
  agent_declared: true,
}

function hit(overrides: Partial<{
  identity_kind: 'owner_agent_pair' | 'credential'
  owner_user_id: string | null
  agent_id: string | null
  layer1_source: 'server' | 'supplied'
  recorded_at: string
}> = {}): ProvenanceLedgerLookupOutcome {
  return {
    found: true,
    entry: {
      identity_kind: 'owner_agent_pair',
      owner_user_id: 'owner-1',
      agent_id: 'sagereasoning:test@v1',
      layer1_source: 'server',
      recorded_at: '2026-08-20T00:00:00Z', // 6 days before NOW — within a 90-day window
      ...overrides,
    },
  }
}

async function main(): Promise<void> {
  // ==========================================================================
  // 1. Outcome: no_ledger_entry — the lookup genuinely found nothing.
  // ==========================================================================
  {
    const outcome = classifyProvenanceArtifact({
      writeSideIdentity: PAIR_IDENTITY,
      lookup: { found: false },
      now: NOW,
    })
    assert(outcome === 'no_ledger_entry', 'not-found lookup ⇒ no_ledger_entry')
  }

  // The eligibility-predicate boundary, from this file's header: an artifact
  // that predates the ledger's consult-side write beginning to record for its
  // identity is STILL ledger-eligible and produces the SAME genuine
  // `found:false` outcome as any other lookup miss — classified identically,
  // never distinguished. There is no separate "not eligible" code path inside
  // this function; the boundary is enforced entirely by the CALLER only ever
  // invoking this function with a genuine, attempted lookup outcome (never an
  // I/O error). This assertion documents that the SAME input (found:false)
  // classifies identically regardless of WHY the entry is missing — the
  // function has no way to distinguish the two causes and must not pretend to.
  {
    const outcomeGenuineMiss = classifyProvenanceArtifact({
      writeSideIdentity: PAIR_IDENTITY,
      lookup: { found: false },
      now: NOW,
    })
    const outcomePredatesLedger = classifyProvenanceArtifact({
      writeSideIdentity: PAIR_IDENTITY,
      lookup: { found: false }, // indistinguishable from a genuine miss — by design
      now: new Date('2099-01-01T00:00:00Z'), // arbitrarily far in the future
    })
    assert(
      outcomeGenuineMiss === outcomePredatesLedger && outcomePredatesLedger === 'no_ledger_entry',
      'eligibility boundary: a pre-ledger artifact and a genuine miss are the SAME classification (no_ledger_entry), permanently',
    )
  }

  // ==========================================================================
  // 2. Outcome: caller_supplied_extraction — found, but layer1_source
  //    'supplied' (a POSITIVE finding, distinct from "no data").
  // ==========================================================================
  {
    const outcome = classifyProvenanceArtifact({
      writeSideIdentity: PAIR_IDENTITY,
      lookup: hit({ layer1_source: 'supplied' }),
      now: NOW,
    })
    assert(outcome === 'caller_supplied_extraction', 'supplied entry ⇒ caller_supplied_extraction')
  }

  // ==========================================================================
  // 3. Outcome: identity_mismatch — found, server-extracted, but the
  //    recorded identity does not match the write-side identity. This is
  //    EXACTLY the s9-loop harness's own deferred shape (SCOPE §3): the
  //    consult credential is owner-less ('credential' kind), the
  //    accreditation-write credential is owner+agent bound ('owner_agent_pair').
  // ==========================================================================
  {
    const outcome = classifyProvenanceArtifact({
      writeSideIdentity: PAIR_IDENTITY,
      // The ledger entry was recorded under a CREDENTIAL-kind identity (the
      // harness's owner-less consult credential) — never matches a pair.
      lookup: hit({ identity_kind: 'credential', owner_user_id: null }),
      now: NOW,
    })
    assert(outcome === 'identity_mismatch', 'harness-shaped mismatch (credential-kind entry vs. pair-kind write) ⇒ identity_mismatch')
  }
  {
    // Same owner+agent pair kind but a DIFFERENT owner_user_id (a genuine
    // cross-tenant divergence, not the harness's specific shape).
    const outcome = classifyProvenanceArtifact({
      writeSideIdentity: PAIR_IDENTITY,
      lookup: hit({ owner_user_id: 'owner-DIFFERENT' }),
      now: NOW,
    })
    assert(outcome === 'identity_mismatch', 'different owner_user_id on an otherwise-pair entry ⇒ identity_mismatch')
  }
  {
    // Same owner, different agent_id.
    const outcome = classifyProvenanceArtifact({
      writeSideIdentity: PAIR_IDENTITY,
      lookup: hit({ agent_id: 'sagereasoning:different@v1' }),
      now: NOW,
    })
    assert(outcome === 'identity_mismatch', 'different agent_id on an otherwise-pair entry ⇒ identity_mismatch')
  }
  {
    // The write-side identity itself is credential-kind (not expected under
    // the 6e §A invariant, but handled conservatively) — never matches,
    // regardless of what the ledger entry says.
    const outcome = classifyProvenanceArtifact({
      writeSideIdentity: CREDENTIAL_IDENTITY,
      lookup: hit(), // a perfectly good pair-kind entry
      now: NOW,
    })
    assert(outcome === 'identity_mismatch', 'credential-kind write-side identity never matches (conservative, SCOPE §3 never licenses this comparison)')
  }

  // ==========================================================================
  // 4. Outcome: out_of_window — found, server-extracted, identity matches,
  //    but the entry has aged out of the retention window.
  // ==========================================================================
  {
    const outcome = classifyProvenanceArtifact({
      writeSideIdentity: PAIR_IDENTITY,
      lookup: hit({ recorded_at: '2026-01-01T00:00:00Z' }), // ~237 days before NOW
      now: NOW,
      windowDays: 90,
    })
    assert(outcome === 'out_of_window', 'an entry older than the window ⇒ out_of_window')
  }
  // Window boundary: exactly at the edge permits; one ms over refuses.
  {
    const windowMs = 90 * 24 * 60 * 60 * 1000
    const exactlyAtEdge = new Date(NOW.getTime() - windowMs).toISOString()
    const outcomeAtEdge = classifyProvenanceArtifact({
      writeSideIdentity: PAIR_IDENTITY,
      lookup: hit({ recorded_at: exactlyAtEdge }),
      now: NOW,
      windowDays: 90,
    })
    assert(outcomeAtEdge === 'permit', 'exactly at the 90-day boundary ⇒ still in window (permit)')

    const oneMsOver = new Date(NOW.getTime() - windowMs - 1).toISOString()
    const outcomeOver = classifyProvenanceArtifact({
      writeSideIdentity: PAIR_IDENTITY,
      lookup: hit({ recorded_at: oneMsOver }),
      now: NOW,
      windowDays: 90,
    })
    assert(outcomeOver === 'out_of_window', 'one ms past the boundary ⇒ out_of_window')
  }
  // A malformed recorded_at (unparseable) must conservatively refuse, never
  // silently permit (NaN-safe comparison — this file's own inline comment).
  {
    const outcome = classifyProvenanceArtifact({
      writeSideIdentity: PAIR_IDENTITY,
      lookup: hit({ recorded_at: 'not-a-date' }),
      now: NOW,
    })
    assert(outcome === 'out_of_window', 'an unparseable recorded_at conservatively refuses (out_of_window), never silently permits')
  }

  // ==========================================================================
  // 5. Outcome: permit — found, server-extracted, identity matches, in window.
  // ==========================================================================
  {
    const outcome = classifyProvenanceArtifact({
      writeSideIdentity: PAIR_IDENTITY,
      lookup: hit(),
      now: NOW,
    })
    assert(outcome === 'permit', 'a genuinely clean server-extracted, identity-matched, in-window entry ⇒ permit')
  }

  // ==========================================================================
  // 6. Precedence: when an entry is BOTH supplied AND identity-mismatched AND
  //    out-of-window simultaneously, caller_supplied_extraction wins (the
  //    GAP-2 precedence order, most to least severe, per the sibling
  //    agent_provenance_gaps migration's header).
  // ==========================================================================
  {
    const outcome = classifyProvenanceArtifact({
      writeSideIdentity: PAIR_IDENTITY,
      lookup: hit({
        layer1_source: 'supplied',
        owner_user_id: 'owner-DIFFERENT',
        recorded_at: '2020-01-01T00:00:00Z',
      }),
      now: NOW,
    })
    assert(outcome === 'caller_supplied_extraction', 'precedence: supplied wins over a simultaneous mismatch AND a simultaneous window expiry')
  }
  {
    // identity_mismatch beats out_of_window when supplied is not in play.
    const outcome = classifyProvenanceArtifact({
      writeSideIdentity: PAIR_IDENTITY,
      lookup: hit({
        owner_user_id: 'owner-DIFFERENT',
        recorded_at: '2020-01-01T00:00:00Z',
      }),
      now: NOW,
    })
    assert(outcome === 'identity_mismatch', 'precedence: identity_mismatch wins over a simultaneous window expiry')
  }

  console.log(`\n${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('\nFailures:')
    for (const f of failures) console.error('  - ' + f)
    process.exit(1)
  }
}

main()
