/**
 * provenance-c2-discharge-tally.ts — the SCOPED reading-B retrospective tally
 * for the provenance ledger's C2 discharge.
 *
 * RULED 2026-08-30 (operations/agent-circles-2026-08/2026-08-30-mentor-ruling-
 * provenance-ledger-C2-reachability-verbatim.md). The round-6 ruling rejected
 * reading B for an ONGOING observation; this ruling reinstates it for THIS
 * PURPOSE ONLY, verbatim: "a founder-run retrospective tally against the
 * ledger, scoped to the C2 discharge, not to ongoing monitoring."
 *
 * THE SCOPE IS THE RULING'S, AND THIS SCRIPT MUST NOT EXCEED IT:
 *   - It runs ONCE, at the time of C2 discharge, against the ledger AS IT
 *     STANDS AT THAT MOMENT.
 *   - It DOES NOT run on a schedule. There is no cron entry for it and there
 *     must not be one. Making it recurring reinstates precisely the sync-drift
 *     shape the round-6 ruling rejected.
 *   - It DOES NOT track an ongoing stream and makes NO claim about any
 *     subsequent state. That is why it cannot drift: "a point-in-time
 *     retrospective tally does not drift because it makes no claim about a
 *     subsequent state."
 *
 * ITS TWO REQUIRED OUTPUTS, both named by the ruling:
 *   (1) CONFIRM THE VACUOUS POPULATION FINDING — that C2's denominator
 *       ("every agent with an accreditation write in the trailing 30 days") is
 *       empty, which is what licenses the C1-precedent vacuous discharge.
 *   (2) ESTABLISH THE BASELINE the mandatory re-check at switch-on will
 *       measure against.
 *
 * ON SYNC DRIFT — a note beyond what the ruling required. The round-6
 * objection to reading B was that it "creates a second implementation of the
 * same logic that must be kept in sync with the first." This ruling addresses
 * that by SCOPE (point-in-time ⇒ no drift). This script additionally closes it
 * at the ROOT: it IMPORTS the canonical pure classifier rather than mirroring
 * it. There is no second implementation to keep in sync. Both protections hold
 * independently; neither is relied on alone.
 *
 * READ-ONLY. This script performs NO write of any kind — no insert, no update,
 * no delete, no purge. It is safe to run against production.
 *
 * FAIL-LOUD ON A NON-EMPTY POPULATION. If any agent HAS completed an
 * accreditation write in the trailing 30 days, the vacuous discharge is NOT
 * available and this script says so and exits non-zero. It will NOT report
 * "100% of nothing" as a pass. Reconstructing the submitted artifacts of a
 * past write is outside this script's scope and outside the ruling's — the
 * artifacts live in a request body that is not retained.
 *
 * Run (founder, production, service role):
 *   npx tsx --env-file=.env.local scripts/provenance-c2-discharge-tally.ts
 *   npx tsx --env-file=.env.local scripts/provenance-c2-discharge-tally.ts --json > baseline.json
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { classifyProvenanceArtifact } from '../src/lib/substrate/trust-core/provenance-classification'
import { resolveLongitudinalIdentity } from '../src/lib/substrate/longitudinal-identity'

const WINDOW_DAYS = 30
const asJson = process.argv.includes('--json')

function out(s = '') {
  if (!asJson) console.log(s)
}

function client(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error(
      'FATAL: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set.\n' +
        'Run with --env-file=.env.local (production) — the ledger is service-role-only by RLS.',
    )
    process.exit(2)
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

/** Fail-honest: any read error aborts. A partial read must never be presented
 *  as a complete tally — that is the confidence-exceeds-evidence failure the
 *  disclosure rulings have consistently named. */
async function must<T>(label: string, p: PromiseLike<{ data: T | null; error: unknown }>): Promise<T> {
  const { data, error } = await p
  if (error) {
    console.error(`FATAL: ${label} failed:`, (error as { message?: string }).message ?? error)
    process.exit(2)
  }
  return (data ?? []) as unknown as T
}

async function main() {
  const db = client()
  const now = new Date()
  const windowStart = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000)

  // ── (1) THE C2 POPULATION ────────────────────────────────────────────────
  // C2: "every agent with an accreditation write in the trailing 30 days".
  //
  // Two INDEPENDENT observables are read, deliberately, and any divergence is
  // reported rather than reconciled silently — the standing discipline that a
  // verification method must not share an assumption with what it verifies:
  //
  //   (a) `credential-completed` trust events — the emission signature of a
  //       completed R18f-verified write carrying signed assessments. UNDER-
  //       REPORTS: these rows are DELETABLE, and smoke teardowns have deleted
  //       them (the Q5c teardown deleted its agent's trust events while leaving
  //       its accreditation row standing). An absent event is therefore NOT
  //       evidence of an absent write.
  //   (b) `agent_accreditation.created_at` within the window — a seed write,
  //       which is the write route's own first-write path. Durable: no teardown
  //       in this project's history has deleted an accreditation row.
  //
  //  DELIBERATELY NOT USED: `agent_accreditation.updated_at`. It is polluted —
  //  the Sage Reflect feed calls the same `upsertAccreditationRecord` chokepoint
  //  (`sage-reflect/sage-assent-feed.ts:177`), so the harness's reflect-at-close
  //  bumps `updated_at` on every session close without any accreditation write
  //  occurring. Using it OVER-REPORTS the population. An earlier draft of this
  //  script used it and wrongly placed `sagereasoning:s9-loop@v1` in the
  //  population; the divergence between (a) and (b) is what exposed that.
  //
  //  Both signals are reported separately and any divergence is surfaced, never
  //  reconciled silently.
  const events = await must<{ agent_id: string; occurred_at: string }[]>(
    'credential-completed read',
    db
      .from('agent_trust_events')
      .select('agent_id,occurred_at')
      .eq('event_type', 'credential-completed')
      .gte('occurred_at', windowStart.toISOString())
      .order('occurred_at', { ascending: false }),
  )
  const rows = await must<{ agent_id: string; created_at: string; updated_at: string }[]>(
    'agent_accreditation read',
    db
      .from('agent_accreditation')
      .select('agent_id,created_at,updated_at')
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: false }),
  )
  // Reported for transparency only — NOT a population signal (see above).
  const updatedOnly = await must<{ agent_id: string; updated_at: string }[]>(
    'agent_accreditation updated_at read (diagnostic only)',
    db
      .from('agent_accreditation')
      .select('agent_id,updated_at')
      .gte('updated_at', windowStart.toISOString())
      .order('updated_at', { ascending: false }),
  )

  const byEvent = new Set(events.map((e) => e.agent_id))
  const bySeed = new Set(rows.map((r) => r.agent_id))
  const population = new Set<string>([...byEvent, ...bySeed])
  const seedOnly = [...bySeed].filter((a) => !byEvent.has(a))
  const writeTimeOf = new Map<string, string>(rows.map((r) => [r.agent_id, r.created_at]))
  for (const e of events) if (!writeTimeOf.has(e.agent_id)) writeTimeOf.set(e.agent_id, e.occurred_at)
  const updatedNotWritten = updatedOnly
    .map((r) => r.agent_id)
    .filter((a) => !population.has(a))

  // ── (2) THE LEDGER BASELINE ──────────────────────────────────────────────
  const ledger = await must<
    {
      identity_kind: string
      layer1_source: string
      credential_ref: string | null
      agent_id: string | null
      owner_user_id: string | null
      recorded_at: string
    }[]
  >(
    'ledger read',
    db
      .from('agent_provenance_ledger')
      .select('identity_kind,layer1_source,credential_ref,agent_id,owner_user_id,recorded_at')
      .order('recorded_at', { ascending: true }),
  )
  const gaps = await must<{ id: string }[]>(
    'gaps read',
    db.from('agent_provenance_gaps').select('id'),
  )

  const tally = <T>(xs: T[], f: (x: T) => string) =>
    xs.reduce<Record<string, number>>((a, x) => ((a[f(x)] = (a[f(x)] ?? 0) + 1), a), {})

  // A STRUCTURAL property of the ledger, not a hypothetical classification: how
  // many entries COULD ever resolve. `writeSideIdentityMatches` requires the
  // entry's identity_kind to be 'owner_agent_pair'; a 'credential' entry can
  // never match and never permits, by construction (SCOPE §3.1/§3.3).
  //
  // Note what is deliberately NOT done here: the classifier is NOT run against
  // invented write-side identities to manufacture outcomes. That would produce
  // observations that look like they answer C2 while answering a different
  // question — the exact failure for which option (b) was ruled out.
  const resolvable = ledger.filter((r) => r.identity_kind === 'owner_agent_pair').length

  // The imported classifier IS exercised, on the one input the ledger genuinely
  // supports: a real entry against its OWN recorded identity. For a
  // 'credential'-kind entry this yields identity_mismatch — the by-construction
  // refusal §3.3 intends — and demonstrates on live data that this script and
  // the live path share one implementation.
  const selfClassified = ledger.length
    ? classifyProvenanceArtifact({
        // Built by the CANONICAL resolver from the row's own recorded fields —
        // this script constructs no identity shape of its own, so it cannot
        // drift from the live path's notion of identity either.
        writeSideIdentity: resolveLongitudinalIdentity({
          credentialRef: ledger[0].credential_ref ?? '',
          ownerUserId: ledger[0].owner_user_id,
          agentId: ledger[0].agent_id,
        }),
        lookup: {
          found: true,
          entry: {
            identity_kind: ledger[0].identity_kind as 'owner_agent_pair' | 'credential',
            owner_user_id: ledger[0].owner_user_id,
            agent_id: ledger[0].agent_id,
            layer1_source: ledger[0].layer1_source as 'server' | 'supplied',
            recorded_at: ledger[0].recorded_at,
          },
        },
        now,
      })
    : null

  // ── (3) SCOPE's OWN PRE-LEDGER EXCLUSION, applied per population member ───
  // C2, verbatim: "Artifacts consulted before that point are honestly
  // no_ledger_entry forever, are named as such, and are EXCLUDED from C2's
  // completeness denominator." So a write made BEFORE the ledger began
  // recording has an EMPTY ledger-eligible artifact set, and the universal
  // "100% of that write's ledger-eligible submitted artifacts resolve" is
  // satisfied vacuously FOR THAT AGENT — at the artifact level, which is a
  // different and more specific vacuity than an empty agent population.
  // SCOPE's clause is PER-IDENTITY, not global: ledger-eligible "only if it was
  // consulted at or after the point the ledger's consult-side write began
  // recording FOR ITS IDENTITY". Both readings are computed and BOTH must agree
  // before the exclusion is applied — if they ever diverge, that divergence is
  // surfaced rather than silently resolved in favour of either.
  //
  // NOTE, surfaced deliberately: under the strict per-identity reading, an
  // identity the ledger has NEVER recorded for has no "began recording" point,
  // so every artifact for it is pre-ledger and excluded. That is the literal
  // text and it is conservative in the right direction here — but at switch-on,
  // when the population is real, it could exclude an agent that simply never
  // consulted. Named for the mentor, not relied on: this run's conclusion holds
  // under the GLOBAL reading too, so it does not depend on resolving this.
  const ledgerStart = ledger[0]?.recorded_at ?? null
  const firstByAgent = new Map<string, string>()
  for (const r of ledger) {
    if (r.agent_id && !firstByAgent.has(r.agent_id)) firstByAgent.set(r.agent_id, r.recorded_at)
  }
  const perAgent = [...population].sort().map((agent_id) => {
    const wroteAt = writeTimeOf.get(agent_id) ?? null
    const identityStart = firstByAgent.get(agent_id) ?? null
    const preGlobal =
      ledgerStart !== null && wroteAt !== null && new Date(wroteAt) < new Date(ledgerStart)
    // never recorded for this identity ⇒ no "began recording" point ⇒ pre-ledger
    const perIdentity =
      wroteAt !== null && (identityStart === null || new Date(wroteAt) < new Date(identityStart))
    return {
      agent_id,
      wrote_at: wroteAt,
      ledger_began_recording_for_this_identity: identityStart,
      predates_ledger_global_reading: preGlobal,
      predates_ledger_per_identity_reading: perIdentity,
      readings_agree: preGlobal === perIdentity,
      predates_ledger_recording: preGlobal && perIdentity, // BOTH must hold
      ledger_eligible_artifacts: preGlobal && perIdentity ? 0 : null,
      excluded_from_completeness_denominator: preGlobal && perIdentity,
    }
  })
  const readingDivergence = perAgent.filter((a) => !a.readings_agree).map((a) => a.agent_id)
  // A member is DISCHARGEABLE only if its ledger-eligible set is provably empty.
  // Anything else this script CANNOT tally — a past write's submitted artifacts
  // live in a request body that is not retained.
  const undischargeable = perAgent.filter((a) => !a.excluded_from_completeness_denominator)

  const baseline = {
    schema: 'provenance-c2-discharge-baseline-v1',
    generated_at: now.toISOString(),
    window: { days: WINDOW_DAYS, start: windowStart.toISOString(), end: now.toISOString() },
    c2_population: {
      agents: [...population].sort(),
      count: population.size,
      by_credential_completed_event: [...byEvent].sort(),
      by_accreditation_seed_created_at: [...bySeed].sort(),
      seed_signal_only_divergence: seedOnly.sort(),
      updated_at_but_not_written: updatedNotWritten.sort(),
      updated_at_note:
        'updated_at is NOT a population signal — the Sage Reflect feed upserts the same row ' +
        '(sage-reflect/sage-assent-feed.ts:177), so it bumps on every harness session close.',
      empty_population: population.size === 0,
    },
    c2_completeness: {
      ledger_recording_began: ledgerStart,
      per_agent: perAgent,
      all_members_excluded_as_pre_ledger: undischargeable.length === 0 && population.size > 0,
      reading_divergence: readingDivergence,
      undischargeable_members: undischargeable.map((a) => a.agent_id),
      basis:
        population.size === 0
          ? 'empty agent population (C1 precedent)'
          : undischargeable.length === 0
            ? "SCOPE's pre-ledger exclusion — every member's ledger-eligible artifact set is empty"
            : 'NOT DISCHARGEABLE by this script',
    },
    ledger_baseline: {
      total_rows: ledger.length,
      first_recorded_at: ledger[0]?.recorded_at ?? null,
      last_recorded_at: ledger[ledger.length - 1]?.recorded_at ?? null,
      by_identity_kind: tally(ledger, (r) => r.identity_kind),
      by_layer1_source: tally(ledger, (r) => r.layer1_source),
      by_credential_ref: tally(ledger, (r) => r.credential_ref ?? '(null)'),
      by_agent_id: tally(ledger, (r) => r.agent_id ?? '(null)'),
      structurally_resolvable_rows: resolvable,
      structurally_unresolvable_rows: ledger.length - resolvable,
      gaps_table_rows: gaps.length,
    },
    classifier_provenance: {
      imported_from: 'src/lib/substrate/trust-core/provenance-classification.ts',
      identity_resolved_by: 'src/lib/substrate/longitudinal-identity.ts (resolveLongitudinalIdentity)',
      note:
        'IMPORTED, not re-implemented — the round-6 sync-drift objection is closed at the root, ' +
        'in addition to the point-in-time scope this ruling relies on.',
      sample_outcome_first_row_against_own_identity: selfClassified,
    },
  }

  if (asJson) {
    console.log(JSON.stringify(baseline, null, 2))
  } else {
    out('C2 DISCHARGE TALLY — point-in-time, run once, not scheduled')
    out(`generated_at: ${baseline.generated_at}`)
    out('')
    out(`── C2 population (accreditation writes in trailing ${WINDOW_DAYS}d) ──`)
    out(`  via credential-completed events : ${byEvent.size} ${[...byEvent].join(', ')}`)
    out(`  via accreditation seed created_at: ${bySeed.size} ${[...bySeed].join(', ')}`)
    out(`  divergence (seed signal only)   : ${seedOnly.length ? seedOnly.join(', ') : 'none'}`)
    out(`  updated_at moved but NOT a write: ${updatedNotWritten.length ? updatedNotWritten.join(', ') : 'none'}  (reflect-feed upserts)`)
    out(`  POPULATION                      : ${population.size}`)
    out('')
    out('── C2 completeness, per member ──')
    out(`  ledger recording began: ${ledgerStart}`)
    for (const a of perAgent) {
      out(
        `  ${a.agent_id}  wrote ${a.wrote_at}  ` +
          `${a.predates_ledger_recording ? 'PRE-LEDGER → ledger-eligible set EMPTY → excluded from the completeness denominator' : 'IN-LEDGER-ERA → artifacts NOT determinable by this script'}`,
      )
    }
    out(`  basis: ${baseline.c2_completeness.basis}`)
    out('')
    out('── Ledger baseline (what switch-on re-checks against) ──')
    out(`  rows: ${ledger.length}   span: ${baseline.ledger_baseline.first_recorded_at} → ${baseline.ledger_baseline.last_recorded_at}`)
    out(`  identity_kind: ${JSON.stringify(baseline.ledger_baseline.by_identity_kind)}`)
    out(`  layer1_source: ${JSON.stringify(baseline.ledger_baseline.by_layer1_source)}`)
    out(`  agent_id:      ${JSON.stringify(baseline.ledger_baseline.by_agent_id)}`)
    out(`  structurally resolvable / unresolvable: ${resolvable} / ${ledger.length - resolvable}`)
    out(`  agent_provenance_gaps rows: ${gaps.length}`)
    out(`  classifier (imported) on first row vs own identity: ${selfClassified}`)
    out('')
  }

  if (undischargeable.length > 0) {
    console.error(
      '\nNOT DISCHARGEABLE BY THIS SCRIPT — a population member wrote inside the ledger era.\n' +
        `  members: ${undischargeable.map((a) => a.agent_id).join(', ')}\n` +
        'For such a member C2 requires 100% of that write’s ledger-eligible submitted artifacts to\n' +
        'resolve, and this script cannot tally that: a past write’s submitted artifacts live in a\n' +
        'request body that is not retained. Escalate rather than proceeding.',
    )
    process.exit(1)
  }

  if (!asJson) {
    if (population.size === 0) {
      out('RESULT: C2’s AGENT population is empty — the C1-precedent vacuity applies directly.')
    } else {
      out('RESULT: C2’s agent population is NOT empty, but every member’s ledger-eligible ARTIFACT')
      out('        set is empty because its write predates the ledger’s recording. C2’s completeness')
      out('        claim is therefore satisfied vacuously AT THE ARTIFACT LEVEL — which is SCOPE’s')
      out('        own pre-ledger exclusion clause, NOT the C1 empty-population precedent.')
      out('        These are different bases for the same conclusion. Which one licenses the')
      out('        discharge is the mentor’s call, not this script’s.')
    }
    out('        The mandatory re-check at switch-on is what gives the two-week clause its force')
    out('        when the population becomes non-empty. It is a HARD C2 obligation, not a courtesy.')
    out('        This tally makes NO claim about any state after generated_at.')
  }
}

main().catch((e) => {
  console.error('FATAL:', e)
  process.exit(2)
})
