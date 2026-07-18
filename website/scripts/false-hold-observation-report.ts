/**
 * false-hold-observation-report.ts — Trust Layer S11 observation-period ingest +
 * readiness report.
 *
 * Reads the reference harness's local false-hold-record.jsonl buffer, applies the
 * CANONICAL Q3 kathekon-engagement predicate (kathekon-engagement.ts — the same
 * function the eventual S11 G6(a) flip binds on), idempotently ingests the
 * classified observations into agent_hold_observations, purges expired rows, and
 * prints the WHOLE S11 readiness standard in one view — so the founder can see, at
 * a glance, how close the record is to licensing the enforce assent.
 *
 * MEASURE-ONLY. This reports; it binds nothing. The readiness ASSESSMENT is the
 * founder's + the mentor's (PR7) — this instrument makes the standard visible and
 * computes the part it uniquely can (the false-hold rate over the live distribution).
 *
 * The readiness standard (ADR-013 §7/§11; the 2026-07-12 verbatim S11 verdict):
 *   (1) ≥7 days live MEASURE over a representative distribution.  [computed here]
 *   (2) all four cardinal domains evaluated ≥1×; aggregate confidence above
 *       conservative on ≥2 domains.                              [surfaced from the trust state]
 *   (3) a MEASURED false-hold rate: false holds on kathekon-free actions ≤ correct
 *       holds on problematic ones.                               [THE core output, computed here]
 *   (4) the Q3 kathekon-engagement qualification encoded.        [SATISFIED — this predicate]
 *
 * Run (against production, founder, service role):
 *   npx tsx --env-file=.env.local scripts/false-hold-observation-report.ts \
 *     --records /path/to/false-hold-record.jsonl --agent-id sagereasoning:s9-loop@v1
 * Report from the JSONL only (no DB write, no trust-state read):
 *   npx tsx scripts/false-hold-observation-report.ts --records <path> --dry-run
 *
 * Flags: --records <path> (default <GATE1_STATE_DIR|/tmp/sage-gate1>/false-hold-record.jsonl)
 *        --agent-id <id>  (default sagereasoning:s9-loop@v1)
 *        --owner-user-id <uuid> / --credential-ref <str> (optional; for the data-rights rider)
 *        --dry-run        (no DB — ingest skipped, trust-state read skipped)
 */

import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { createHash } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import {
  classifyObservation,
  type KathekonEngagementSignals,
} from '../src/lib/substrate/trust-core/kathekon-engagement'
// readTrustVerdict is LAZY-imported inside trustState() only — its chain constructs
// a Supabase client at module load, and --dry-run must run fully offline.

const CARDINAL = ['phronesis', 'dikaiosyne', 'andreia', 'sophrosyne'] as const

// ── args ────────────────────────────────────────────────────────────────────
function argVal(name: string, dflt?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : dflt
}
const dryRun = process.argv.includes('--dry-run')
// --reingest clears the agent's stored rows before insert, so a re-run REFRESHES the
// stored classifications after a mid-window predicate refinement (the default is
// idempotent ON CONFLICT DO NOTHING — correct for same-predicate re-runs). The
// printed rate always recomputes in memory regardless, so it is never stale.
const reingest = process.argv.includes('--reingest')
const agentId = argVal('agent-id', 'sagereasoning:s9-loop@v1')!
const ownerUserId = argVal('owner-user-id') ?? null
const credentialRef = argVal('credential-ref') ?? null
const stateDir = process.env.GATE1_STATE_DIR || join(tmpdir(), 'sage-gate1')
const recordsPath = argVal('records', join(stateDir, 'false-hold-record.jsonl'))!

// ── record shape (mirrors harness false-hold-capture.mjs buildFalseHoldRecord) ─
interface FalseHoldRecord {
  schema: string
  capturedAt: string
  session: string
  tool: string
  depth: string
  loopEvent: string
  actionPreview: string
  signals: KathekonEngagementSignals
  kathekon: { isKathekon: boolean | null; quality: string | null }
  carriedPrior: boolean
}

function recordHash(r: FalseHoldRecord): string {
  const stable = [r.session, r.capturedAt, r.tool, r.loopEvent, JSON.stringify(r.signals), r.actionPreview].join('|')
  return createHash('sha256').update(stable).digest('hex')
}

const LOOP_EVENTS = new Set(['opened', 'reopened', 'closed', 'none'])
function isValidRecord(x: unknown): x is FalseHoldRecord {
  const r = x as FalseHoldRecord
  return (
    !!r &&
    typeof r === 'object' &&
    // v1 = the frozen 2026-07-17 buffer; v2 (S11b) adds inputClass /
    // extractionRegime / composedChars — both parse; the regime split below
    // keeps them from being compared as one distribution (ADR-014).
    (r.schema === 'false-hold-record-v1' || r.schema === 'false-hold-record-v2') &&
    typeof r.capturedAt === 'string' &&
    // Guard the DB constraints at the door (review fold, 2026-07-12): loop_event
    // against the table's CHECK enum, and captured_at against the TIMESTAMPTZ cast,
    // so a single schema-shaped-but-DB-invalid line is counted INVALID + skipped —
    // never reaching the bulk upsert where it would abort the whole run's ingest.
    LOOP_EVENTS.has(r.loopEvent) &&
    !Number.isNaN(Date.parse(r.capturedAt)) &&
    !!r.signals &&
    typeof r.signals === 'object' &&
    typeof r.signals.proximity === 'string' &&
    Array.isArray(r.signals.virtueDomainsEngaged) &&
    Array.isArray(r.signals.obligationStatuses) &&
    Array.isArray(r.signals.subSpeciesPassions)
  )
}

// ── read + parse the JSONL (fail-honest; count corrupt/invalid lines) ─────────
function readRecords(path: string): { records: FalseHoldRecord[]; corrupt: number; invalid: number } {
  if (!existsSync(path)) {
    console.error(`\nNo records file at ${path} — nothing to report. (Is GATE1_FALSE_HOLD_CAPTURE on, with a durable GATE1_STATE_DIR?)`)
    return { records: [], corrupt: 0, invalid: 0 }
  }
  const text = readFileSync(path, 'utf8')
  const records: FalseHoldRecord[] = []
  let corrupt = 0
  let invalid = 0
  for (const line of text.split('\n')) {
    const t = line.trim()
    if (!t) continue
    let obj: unknown
    try {
      obj = JSON.parse(t)
    } catch {
      corrupt++
      continue
    }
    if (isValidRecord(obj)) records.push(obj)
    else invalid++
  }
  return { records, corrupt, invalid }
}

// ── the classification + tallies ──────────────────────────────────────────────
interface Classified extends FalseHoldRecord {
  hash: string
  isHold: boolean
  engaged: boolean
  justiceSurfacePresent: boolean
  violatedObligation: boolean
  proximityAtOrBelowHabitual: boolean
  subSpeciesPassion: boolean
  classification: 'false_positive' | 'correct_hold' | 'not_a_hold'
}

function classifyAll(records: FalseHoldRecord[]): Classified[] {
  return records.map((r) => {
    const c = classifyObservation(r.signals, r.loopEvent)
    return {
      ...r,
      hash: recordHash(r),
      isHold: c.isHold,
      engaged: c.engagement.engaged,
      justiceSurfacePresent: c.engagement.justiceSurfacePresent,
      violatedObligation: c.engagement.violatedObligation,
      proximityAtOrBelowHabitual: c.engagement.proximityAtOrBelowHabitual,
      subSpeciesPassion: c.engagement.subSpeciesPassion,
      classification: c.classification,
    }
  })
}

function pct(n: number, d: number): string {
  return d === 0 ? 'n/a' : `${((100 * n) / d).toFixed(1)}%`
}

// ── DB ingest (idempotent) + retention purge ─────────────────────────────────
async function ingest(rows: Classified[]) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('\nNo NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — re-run with --env-file=.env.local, or --dry-run.')
    process.exit(1)
  }
  const client = createClient(url, key, { auth: { persistSession: false } })
  const nowIso = new Date().toISOString()

  // Purge expired rows for this agent (the window's genuine-deletion path).
  const purge = await client
    .from('agent_hold_observations')
    .delete()
    .eq('agent_id', agentId)
    .lt('retain_until', nowIso)
  if (purge.error) console.error(`  retention purge error (non-fatal): ${purge.error.message}`)

  // --reingest: clear the agent's stored rows so the insert below REFRESHES stored
  // classifications after a predicate refinement (the JSONL is the source of truth,
  // so a cleared row is always re-creatable). Default (no flag) is idempotent DO NOTHING.
  if (reingest) {
    const clr = await client.from('agent_hold_observations').delete().eq('agent_id', agentId)
    if (clr.error) console.error(`  --reingest clear error: ${clr.error.message}`)
    else console.log(`  --reingest: cleared existing rows for ${agentId} before re-insert.`)
  }

  // S11b note (2026-07-18): v2 record fields (inputClass / extractionRegime /
  // composedChars) are NOT ingested — agent_hold_observations predates them and
  // a column addition is its own founder-walked schema step. The in-memory
  // report (incl. the per-regime split) reads them regardless.
  const dbRows = rows.map((r) => ({
    agent_id: agentId,
    owner_user_id: ownerUserId,
    credential_ref: credentialRef,
    session_id: r.session,
    captured_at: r.capturedAt,
    tool: r.tool,
    depth: r.depth,
    loop_event: r.loopEvent,
    action_preview: r.actionPreview,
    carried_prior: r.carriedPrior,
    proximity: r.signals.proximity,
    virtue_domains_engaged: r.signals.virtueDomainsEngaged,
    // Store the NON-NULL per-circle statuses (see the migration note — lossless for the predicate).
    obligation_statuses: r.signals.obligationStatuses.filter((s) => s !== null) as string[],
    sub_species_passions: r.signals.subSpeciesPassions,
    is_kathekon: r.kathekon?.isKathekon ?? null,
    kathekon_quality: r.kathekon?.quality ?? null,
    is_hold: r.isHold,
    kathekon_engaged: r.engaged,
    justice_surface_present: r.justiceSurfacePresent,
    violated_obligation: r.violatedObligation,
    proximity_at_or_below_habitual: r.proximityAtOrBelowHabitual,
    sub_species_passion: r.subSpeciesPassion,
    classification: r.classification,
    record_hash: r.hash,
  }))

  // Insert idempotently: ON CONFLICT (record_hash) DO NOTHING.
  const ins = await client
    .from('agent_hold_observations')
    .upsert(dbRows, { onConflict: 'record_hash', ignoreDuplicates: true })
    .select('record_hash')
  if (ins.error) {
    console.error(`\nIngest error: ${ins.error.message}`)
    process.exit(1)
  }
  console.log(`\nINGEST: ${dbRows.length} records processed; ${ins.data?.length ?? 0} newly inserted; the rest were already present and KEPT their first-write classification (idempotent on record_hash — use --reingest to refresh after a predicate change). The printed rate below always recomputes in memory, so it is never stale.`)
  return client
}

// ── part 2 — the trust-state read (four-domain coverage + confidence) ─────────
// client typed `any` at this script boundary: supabase-js's createClient generic
// defaults make ReturnType<typeof createClient> mismatch the app's SupabaseClient
// type; the client is structurally correct (a service-role client).
async function trustState(client: any) {
  try {
    const { readTrustVerdict } = await import('../src/lib/substrate/trust-core/harness-integration')
    const verdict = await readTrustVerdict(agentId, { client })
    if (verdict.dark) {
      console.log('  (trust core dark — SUBSTRATE_TRUST_CORE_ENABLED not set for this read; part 2 unavailable.)')
      return
    }
    if (!verdict.profile) {
      console.log(`  (no trust profile: ${verdict.basis})`)
      return
    }
    const byDomain = new Map(verdict.profile.domains.map((d) => [d.virtueDomain, d]))
    const evaluated = CARDINAL.filter((d) => byDomain.get(d)?.hasEvidence)
    console.log(`  cardinal domains evaluated (trust state, hasEvidence): ${evaluated.length}/4 — ${evaluated.join(', ') || 'none'}`)
    for (const d of CARDINAL) {
      const s = byDomain.get(d)
      if (!s) { console.log(`    ${d}: (no state row)`); continue }
      console.log(`    ${d}: level=${s.effectiveLevel} prior=${s.profilePrior} evidence=${s.hasEvidence}${s.justiceCapped ? ' justice-capped' : ''}`)
    }
    const agg = verdict.aggregate
    if (agg) {
      console.log(`  aggregate: level=${agg.level} (limiting: ${agg.limitingDomain}) confidenceWeight=${agg.aggregateConfidenceWeight?.toFixed?.(3) ?? agg.aggregateConfidenceWeight} coverageGaps=[${agg.coverageGaps.join(', ')}]`)
    } else {
      console.log('  aggregate: null (no evaluated evidence yet)')
    }
    // Operational proxy for part 2, DISCLOSED: ≥2 cardinal domains carrying evidence.
    // The precise "confidence above conservative" tier is the founder's to confirm
    // against the record; this surfaces the data + a conservative computed proxy.
    const twoWithEvidence = evaluated.length >= 2
    console.log(`  part-2 proxy: all-four-evaluated=${evaluated.length === 4}; ≥2-with-evidence=${twoWithEvidence}  (precise confidence-tier reading is the founder's call — data above)`)
  } catch (e) {
    console.log(`  (trust-state read failed: ${(e as Error).message})`)
  }
}

// ── the readiness view ────────────────────────────────────────────────────────
async function main() {
  const { records, corrupt, invalid } = readRecords(recordsPath)
  const rows = classifyAll(records)

  console.log('\n════════════════════════════════════════════════════════════════════')
  console.log('  Trust Layer S11 — false-hold observation readiness report')
  console.log('════════════════════════════════════════════════════════════════════')
  console.log(`  records: ${recordsPath}`)
  console.log(`  agent:   ${agentId}${dryRun ? '   [DRY RUN — no DB]' : ''}`)
  console.log(`  parsed:  ${records.length} valid records` + (corrupt || invalid ? `  (skipped ${corrupt} corrupt, ${invalid} invalid)` : ''))

  if (rows.length === 0) {
    console.log('\n  No observations yet. The 7-day window has not accumulated a record.')
    process.exit(0)
  }

  // Part 1 — duration.
  const times = rows.map((r) => Date.parse(r.capturedAt)).filter((t) => !Number.isNaN(t)).sort((a, b) => a - b)
  const firstT = times[0]
  const lastT = times[times.length - 1]
  const days = (lastT - firstT) / (24 * 3600 * 1000)
  console.log('\n── Part 1 — duration ──────────────────────────────────────────────')
  console.log(`  window: ${new Date(firstT).toISOString()} → ${new Date(lastT).toISOString()}`)
  console.log(`  span:   ${days.toFixed(2)} days   ⇒ ${days >= 7 ? 'MEETS ≥7 days' : `PENDING (need ${(7 - days).toFixed(2)} more days)`}`)

  // Part 3 — the false-hold rate (THE core output).
  const holds = rows.filter((r) => r.isHold)
  const fps = holds.filter((r) => r.classification === 'false_positive')
  const corrects = holds.filter((r) => r.classification === 'correct_hold')
  console.log('\n── Part 3 — the false-hold rate (over the live distribution) ───────')
  console.log(`  at-action examinations: ${rows.length}`)
  console.log(`  holds (loop opened/reopened): ${holds.length}   (${pct(holds.length, rows.length)} of examinations)`)
  console.log(`    false-positive holds (no kathekon factor): ${fps.length}`)
  console.log(`    correct holds (kathekon-engaged):          ${corrects.length}`)
  console.log(`  false-positive rate among holds: ${pct(fps.length, holds.length)}`)
  const target = fps.length <= corrects.length
  console.log(`  mentor's target (false ≤ correct): ${target ? 'MET' : 'NOT MET'}  (${fps.length} ${target ? '≤' : '>'} ${corrects.length})` +
    (holds.length < 5 ? '   [small sample — a rate over few holds is not yet meaningful]' : ''))
  // Which arms carried the correct holds (diagnostic — the non-vacuity of the split live).
  const armCounts: Record<string, number> = {}
  for (const r of corrects) {
    if (r.justiceSurfacePresent) armCounts['justice-surface'] = (armCounts['justice-surface'] || 0) + 1
    if (r.violatedObligation) armCounts['violated'] = (armCounts['violated'] || 0) + 1
    if (r.proximityAtOrBelowHabitual) armCounts['proximity≤habitual'] = (armCounts['proximity≤habitual'] || 0) + 1
    if (r.subSpeciesPassion) armCounts['sub-species-passion'] = (armCounts['sub-species-passion'] || 0) + 1
  }
  console.log(`  correct-hold arms: ${Object.keys(armCounts).length ? Object.entries(armCounts).map(([k, v]) => `${k}=${v}`).join(', ') : '(none — every hold this window was a false positive)'}`)

  // ADR-014 regime discipline: NEVER present mixed extraction regimes as one
  // distribution — an instrument change must not masquerade as agent change.
  // v1 records predate the mark and are attributed to the lean regime.
  const regimeOf = (r: FalseHoldRecord & { extractionRegime?: string }) =>
    typeof r.extractionRegime === 'string' && r.extractionRegime !== 'unknown'
      ? r.extractionRegime
      : 'at-action-v1-lean (pre-mark)'
  const regimes = new Map<string, { n: number; fps: number; corrects: number }>()
  for (const r of rows) {
    const key = regimeOf(r)
    const cur = regimes.get(key) ?? { n: 0, fps: 0, corrects: 0 }
    cur.n++
    if (r.isHold && r.classification === 'false_positive') cur.fps++
    if (r.isHold && r.classification === 'correct_hold') cur.corrects++
    regimes.set(key, cur)
  }
  if (regimes.size > 1) {
    console.log('\n  ⚠ MIXED EXTRACTION REGIMES — the tallies above span an instrument change and must NOT be read as one distribution (ADR-014). Per-regime split:')
  }
  for (const [k, v] of regimes) {
    console.log(`    regime ${k}: n=${v.n} false_positive=${v.fps} correct=${v.corrects}`)
  }

  // R13 — the narrowed arm's disclosed bounds, stated ON the output.
  const { NARROWED_ARM_BOUNDS } = await import('../src/lib/substrate/trust-core/kathekon-engagement')
  console.log('\n── Bounds on the narrowed Arm 1 (R13 — stated on every output) ────')
  console.log(`  • ${NARROWED_ARM_BOUNDS.a2Omission}`)
  console.log(`  • ${NARROWED_ARM_BOUNDS.mentionConversion}`)

  // Part 2 — four-domain coverage (records proxy + trust-state read).
  console.log('\n── Part 2 — four-domain coverage + confidence ─────────────────────')
  const engagedInRecords = new Set<string>()
  for (const r of rows) for (const d of r.signals.virtueDomainsEngaged) engagedInRecords.add(d)
  const cardinalEngaged = CARDINAL.filter((d) => engagedInRecords.has(d))
  console.log(`  cardinal domains ENGAGED by the live examinations (records): ${cardinalEngaged.length}/4 — ${cardinalEngaged.join(', ') || 'none'}`)
  if (dryRun) {
    console.log('  (trust-state confidence read skipped in --dry-run; run against the DB for the per-domain confidence.)')
  } else {
    console.log('  (trust-state per-domain confidence follows below, after ingest.)')
  }

  // Part 4 — Q3 encoded.
  console.log('\n── Part 4 — Q3 kathekon-engagement qualification encoded ──────────')
  console.log('  SATISFIED — assessKathekonEngagement (kathekon-engagement.ts) is the classifier used above,')
  console.log('  and is the exact shared function the eventual S11 G6(a) qualification binds on.')

  // Ingest + trust-state read (non-dry-run).
  if (!dryRun) {
    const client = await ingest(rows)
    console.log('\n── Part 2 (trust state) ───────────────────────────────────────────')
    await trustState(client)
  }

  console.log('\n════════════════════════════════════════════════════════════════════')
  console.log('  READINESS SUMMARY (the enforce assent remains the founder\'s, PR7):')
  console.log(`   (1) duration ≥7 days:            ${days >= 7 ? 'MET' : 'PENDING'}`)
  console.log(`   (2) 4 domains + confidence:      ${dryRun ? 'run against DB' : 'see Part 2 above (founder\'s call)'}`)
  console.log(`   (3) false ≤ correct holds:       ${target ? 'MET' : 'NOT MET'}${holds.length < 5 ? ' (small sample)' : ''}`)
  console.log('   (4) Q3 predicate encoded:        SATISFIED')
  console.log('════════════════════════════════════════════════════════════════════\n')
  process.exit(0)
}

main().catch((e) => {
  console.error(`\nfalse-hold-observation-report failed: ${(e as Error).message}`)
  process.exit(1)
})
