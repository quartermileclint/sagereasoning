/**
 * session-store.test.ts — tests for the Sage Reflect persistence layer (A-2/A-4).
 *
 * Run (PURE helpers + the encryption round-trip; the lazy admin client is never
 * constructed, so no Supabase env is needed — the test sets a throwaway
 * MENTOR_ENCRYPTION_KEY for the R17b round-trip):
 *   npx tsx src/lib/sage-reflect/__tests__/session-store.test.ts
 *
 * Coverage:
 *   IN   — initialSessionInsert minimised shape + KG7 empty arrays + R17i (no extras).
 *   LOG  — buildLogs derives the five logs from a completed history (KG7 arrays).
 *   CF   — deriveCompletionFields maps a ReflectOutcome to the scalar columns.
 *   ENC  — R17b encrypt/decrypt round-trip; meta is a PLAIN OBJECT (KG7 'object').
 *   RC   — computeRetentionCutoffIso cutoff arithmetic + ISO shape.
 *   PRX  — proximityDomainsToRow maps SR-15 PerDomainProximity → the upsert row.
 *
 * The live Supabase round-trip (insert → jsonb_typeof='array'/'object' → read-back)
 * is a FOUNDER post-deploy smoke test in the Stage-B Critical session.
 */

// R17b — set a throwaway 32-byte (64 hex) key before any encrypt call. server-
// encryption reads the key LAZILY, so setting it here is sufficient.
process.env.MENTOR_ENCRYPTION_KEY = 'a'.repeat(64)

import {
  initialSessionInsert,
  buildLogs,
  deriveCompletionFields,
  encryptResponseHistory,
  decryptResponseHistory,
  computeRetentionCutoffIso,
  proximityDomainsToRow,
  RETENTION_WINDOW_DAYS,
} from '../session-store'
import type { ReflectTurn, ReflectOutcome } from '../engine'
import type { PerDomainProximity } from '../proximity-domains'

let passCount = 0
let failCount = 0
const failures: string[] = []
function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    passCount++
    console.log(`PASS  ${label}`)
  } else {
    failCount++
    const msg = detail ? `${label} — ${detail}` : label
    failures.push(msg)
    console.log(`FAIL  ${msg}`)
  }
}

// ============================================================================
// IN — initial insert shape
// ============================================================================
{
  const ins = initialSessionInsert('sess-r1', 'agent_acme_v1')
  assert('IN-1  session_id set', ins.session_id === 'sess-r1')
  assert('IN-2  agent_id set', ins.agent_id === 'agent_acme_v1')
  assert('IN-3  current_step defaults to Q1', ins.current_step === 'Q1')
  assert('IN-4  five logs are empty arrays (KG7)',
    Array.isArray(ins.phantasia_distortion_log) && ins.phantasia_distortion_log.length === 0 &&
    Array.isArray(ins.synkatathesis_failure_log) &&
    Array.isArray(ins.horme_pattern_log) &&
    Array.isArray(ins.kathekon_quality_log) &&
    Array.isArray(ins.circle_need_log))
  // R17i — only the minimised fields (session_id, agent_id, current_step, 5 logs).
  const keys = Object.keys(ins).sort()
  assert('IN-5  R17i minimised key set (8 keys, no extras)', keys.length === 8, `keys=${keys.join(',')}`)
}

// ============================================================================
// LOG — buildLogs from a completed history
// ============================================================================
{
  const history: ReflectTurn[] = [
    { step: 'Q1', assessment: { distortions: [{ impression: 'deadline=evil', root_passion: 'phobos', examined: false }] }, response: 'r1' },
    { step: 'Q2', assessment: { failures: [{ impression: 'comply', false_judgement: 'good', selective_value_level: 'preferred' }], pressure_assent: { admitted: true, account_given: true, moments: ['t4'] } }, response: 'r2' },
    { step: 'Q3', assessment: { patterns: [{ direction: 'excess', virtue_domain: 'sophrosyne', passion: 'epithumia' }] }, response: 'r3' },
    { step: 'Q4', assessment: { actions: [{ action: 'sent', quality: 'moderate', is_kathekon: true, proximity: 'deliberate', passions_detected: [], virtue_domains_engaged: ['phronesis'], oikeiosis_met: true, oikeiosis_stage: 'community' }], calibration: { verdicts_reviewed: 2, discrepancies_found: 0 } }, response: 'r4' },
    { step: 'Q5', assessment: { capacity_delta: { domains_added: ['triage'], domains_removed: [], domains_updated: [] }, circle_need_delta: { circle: 'community', need_description: 'faster triage', independence_confirmed: true, proportion_assessment: 'fits' }, reasoning_pattern_change: true }, response: 'r5' },
  ]
  const logs = buildLogs(history)
  assert('LOG-1  phantasia log has the distortion', logs.phantasia_distortion_log.length === 1 && logs.phantasia_distortion_log[0].root_passion === 'phobos')
  assert('LOG-2  synkatathesis log has the failure', logs.synkatathesis_failure_log.length === 1 && logs.synkatathesis_failure_log[0].false_judgement === 'good')
  assert('LOG-3  horme log has the pattern', logs.horme_pattern_log.length === 1 && logs.horme_pattern_log[0].direction === 'excess')
  assert('LOG-4  kathekon log has the action', logs.kathekon_quality_log.length === 1 && logs.kathekon_quality_log[0].proximity === 'deliberate')
  assert('LOG-5  circle-need log derived from Q5', logs.circle_need_log.length === 1 && logs.circle_need_log[0].circle === 'community')
  assert('LOG-6  all five logs are real arrays (KG7 precondition)',
    [logs.phantasia_distortion_log, logs.synkatathesis_failure_log, logs.horme_pattern_log, logs.kathekon_quality_log, logs.circle_need_log].every(Array.isArray))
  // Empty history → all empty.
  const empty = buildLogs([])
  assert('LOG-7  empty history → all logs empty', empty.phantasia_distortion_log.length === 0 && empty.circle_need_log.length === 0)
}

// ============================================================================
// CF — deriveCompletionFields
// ============================================================================
{
  const outcome: ReflectOutcome = {
    exit_path: 'sage_calling',
    rs_class: 'RS-2',
    profile_update_confidence: 'low',
    progress_dimensions_held: true,
    scrutiny_flags: [{ type: 'pressure_assent', detail: 'd', cross_product_target: 'sage_assent' }],
    developer_note: 'note',
    sage_calling_trigger: {
      trigger_type: 'fresh',
      trigger_reason: 'complete',
      capacity_revision: { domains_added: [], domains_removed: [], domains_updated: [] },
      need_revision: { circle: null, need_description: '', independence_confirmed: false, proportion_assessment: '' },
      purpose_at_close: 'p',
      session_learnings: ['Q1: x'],
      active_passion_profile: [],
      fabrication_risk_level: 'moderate',
    },
    fabrication_risk_level: 'moderate',
  }
  const cf = deriveCompletionFields(outcome)
  assert('CF-1  exit_path mapped', cf.exit_path === 'sage_calling')
  assert('CF-2  rs_class mapped', cf.rs_class === 'RS-2')
  assert('CF-3  confidence + progress-hold mapped', cf.profile_update_confidence === 'low' && cf.progress_dimensions_held === true)
  assert('CF-4  scrutiny_flags is an array (KG7)', Array.isArray(cf.scrutiny_flags) && cf.scrutiny_flags.length === 1)
  assert('CF-5  sage_calling_trigger carried as object', cf.sage_calling_trigger?.trigger_type === 'fresh')
  assert('CF-6  developer_note carried', cf.developer_note === 'note')
}

// ============================================================================
// ENC — R17b encrypt/decrypt round-trip
// ============================================================================
{
  const history: ReflectTurn[] = [
    { step: 'Q1', assessment: { distortions: [] }, response: 'the deadline felt like a genuine evil' },
    { step: 'Q2', assessment: { failures: [], pressure_assent: { admitted: false, account_given: true, moments: [] } }, response: 'I withheld assent' },
  ]
  const enc = encryptResponseHistory(history)
  assert('ENC-1  ciphertext is a non-empty base64 string', typeof enc.ciphertext === 'string' && enc.ciphertext.length > 0)
  assert('ENC-2  meta is a PLAIN OBJECT (KG7 jsonb_typeof=object precondition)', typeof enc.meta === 'object' && enc.meta !== null && !Array.isArray(enc.meta))
  assert('ENC-3  meta carries iv/authTag/algorithm/version', !!enc.meta.iv && !!enc.meta.authTag && enc.meta.algorithm === 'AES-256-GCM' && enc.meta.version === 1)
  const round = decryptResponseHistory(enc)
  assert('ENC-4  round-trip recovers the verbatim responses', round.length === 2 && round[0].response === 'the deadline felt like a genuine evil' && round[1].step === 'Q2')
  // Ciphertext does not leak plaintext.
  assert('ENC-5  ciphertext does not contain the plaintext', !enc.ciphertext.includes('genuine evil'))
}

// ============================================================================
// RC — retention cutoff
// ============================================================================
{
  const now = new Date('2026-05-22T00:00:00.000Z')
  const cutoff = computeRetentionCutoffIso(RETENTION_WINDOW_DAYS, now)
  assert('RC-1  default window is 90 days', RETENTION_WINDOW_DAYS === 90)
  assert('RC-2  cutoff is 90 days before now', cutoff === new Date('2026-02-21T00:00:00.000Z').toISOString(), `got ${cutoff}`)
  assert('RC-3  cutoff is ISO', /^\d{4}-\d{2}-\d{2}T/.test(cutoff))
}

// ============================================================================
// PRX — SR-15 row mapping
// ============================================================================
{
  const p: PerDomainProximity = { phronesis: 'deliberate', dikaiosyne: 'habitual', andreia: null, sophrosyne: 'principled', aggregate: 'habitual' }
  const row = proximityDomainsToRow('agent_acme_v1', p)
  assert('PRX-1  agent_id set', row.agent_id === 'agent_acme_v1')
  assert('PRX-2  per-domain levels mapped + nulls preserved', row.phronesis === 'deliberate' && row.andreia === null && row.aggregate === 'habitual')
  assert('PRX-3  no updated_at in the pure mapper (set at write time)', !('updated_at' in row))
}

// ============================================================================
console.log(`\n${passCount} pass / ${failCount} fail`)
if (failCount > 0) {
  console.log('\nFailures:')
  failures.forEach((f) => console.log(`  - ${f}`))
  process.exit(1)
}
process.exit(0)
