/**
 * session-store.test.ts — tests for the Sage Calling discovery_sessions store
 * (D-7), build Stage 2 (engine + store half).
 *
 * Run via (no Supabase round-trip — only the PURE helpers are exercised, so a
 * bare run works; the lazy admin client is never constructed):
 *   npx tsx src/lib/sage-calling/__tests__/session-store.test.ts
 *
 * The live Supabase round-trip (insert → jsonb_typeof(response_history)='array'
 * → read-back) is a FOUNDER post-deploy smoke test in the follow-up Critical
 * session, not run here.
 *
 * Coverage:
 *   IN  — initialSessionInsert: minimised shape + correct defaults.
 *   AP  — appendResponse / appendAudit: append + immutability.
 *   SA  — toSelectionAudit: maps each engine decision kind correctly.
 *   DT  — deriveTerminal: gate/outcome/completion per decision kind.
 *   RC  — computeRetentionCutoffIso: correct cutoff arithmetic + ISO shape.
 *   KG7 — JS-level array invariant: persisted JSONB fields are real arrays,
 *         never JSON-encoded strings (the precondition for jsonb_typeof='array').
 *   CMP — composition with the engine: building response_history +
 *         signals_detected across a run yields growing arrays, each audit
 *         carrying a named rule (the R0 reconstruct-the-run trail).
 *
 * Exit code 0 = all pass.
 */

import {
  initialSessionInsert,
  appendResponse,
  appendAudit,
  toSelectionAudit,
  deriveTerminal,
  computeRetentionCutoffIso,
  RETENTION_WINDOW_DAYS,
  SelectionAudit,
} from '../session-store'
import { nextStep, ResponseRecord, EngineOutput } from '../engine'

// ----------------------------------------------------------------------------
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
// IN — initial insert shape + defaults
// ============================================================================
{
  const ins = initialSessionInsert('sess-1', 'agent_acme_v1')
  assert('IN-1  session_id set', ins.session_id === 'sess-1')
  assert('IN-2  agent_id set', ins.agent_id === 'agent_acme_v1')
  assert('IN-3  current_stage defaults to Q1', ins.current_stage === 'Q1')
  assert('IN-4  gate_status defaults to pending', ins.gate_status === 'pending')
  assert('IN-5  response_history defaults to empty array', Array.isArray(ins.response_history) && ins.response_history.length === 0)
  assert('IN-6  signals_detected defaults to empty array', Array.isArray(ins.signals_detected) && ins.signals_detected.length === 0)
  // R17i — only the minimised fields are present (no extraneous context).
  const keys = Object.keys(ins).sort()
  assert(
    'IN-7  insert payload is minimised (only the 6 needed fields)',
    JSON.stringify(keys) ===
      JSON.stringify(['agent_id', 'current_stage', 'gate_status', 'response_history', 'session_id', 'signals_detected']),
    keys.join(','),
  )
}

// ============================================================================
// ICH — initialSessionInsert with the E#1 Agent-Card chosen-role hint
// ============================================================================
{
  // No hint → the minimised 6-field shape is preserved (the column defaults to
  // NULL in the DB) — R17i holds for the common no-card case.
  const noHint = initialSessionInsert('sess-2', 'agent_acme_v1')
  assert('ICH-1  no hint omits agent_card_role_hint (minimised shape preserved)', !('agent_card_role_hint' in noHint))

  // A null hint (card absent / unverified / spoofed) is treated as no hint —
  // degrade to today's behaviour; the assembly defaults role downstream.
  const nullHint = initialSessionInsert('sess-3', 'agent_acme_v1', null)
  assert('ICH-2  a null hint omits the column (degrade to default)', !('agent_card_role_hint' in nullHint))

  // A verified card's chosen-role hint is folded into the SAME insert.
  const hinted = initialSessionInsert('sess-4', 'agent_acme_v1', 'chosen_role')
  assert('ICH-3  a verified chosen_role hint is persisted in the insert', hinted.agent_card_role_hint === 'chosen_role')
  // Exactly one extra field beyond the minimised six (R17i — one scalar).
  const hintedKeys = Object.keys(hinted).sort()
  assert(
    'ICH-4  hinted insert is the six fields + agent_card_role_hint only',
    JSON.stringify(hintedKeys) ===
      JSON.stringify([
        'agent_card_role_hint',
        'agent_id',
        'current_stage',
        'gate_status',
        'response_history',
        'session_id',
        'signals_detected',
      ]),
    hintedKeys.join(','),
  )
}

// ============================================================================
// AP — append helpers: append + immutability
// ============================================================================
{
  const base: ResponseRecord[] = []
  const r1: ResponseRecord = { stage: 'Q1', variant: 'A', response: 'hi' }
  const after = appendResponse(base, r1)
  assert('AP-1  appendResponse appends', after.length === 1 && after[0].response === 'hi')
  assert('AP-2  appendResponse does not mutate input', base.length === 0)

  const auditBase: SelectionAudit[] = []
  const a1: SelectionAudit = { kind: 'question', stage: 'Q1', variant: 'A', rule: 'Q1.cold-open', signals: [] }
  const auditAfter = appendAudit(auditBase, a1)
  assert('AP-3  appendAudit appends', auditAfter.length === 1 && auditAfter[0].rule === 'Q1.cold-open')
  assert('AP-4  appendAudit does not mutate input', auditBase.length === 0)
}

// ============================================================================
// SA — toSelectionAudit maps each decision kind
// ============================================================================
{
  const q = nextStep([]) // Q1/A cold-open
  const aq = toSelectionAudit(q)
  assert('SA-1  question → audit carries stage/variant/rule', aq.kind === 'question' && aq.stage === 'Q1' && aq.variant === 'A' && aq.rule === 'Q1.cold-open')

  const hardGate: EngineOutput = nextStep([
    { stage: 'Q1', variant: 'A', response: 'work present' },
    { stage: 'Q2', variant: 'A', response: 'capacity present' },
    { stage: 'Q3', variant: 'A', response: 'need present' },
    { stage: 'Q5', variant: 'A', response: 'The first act is clear and I will begin now.' },
  ])
  const ahg = toSelectionAudit(hardGate)
  assert('SA-2  hard_gate → audit (stage/variant null, rule set)', ahg.kind === 'hard_gate' && ahg.stage === null && ahg.variant === null && ahg.rule.length > 0)

  const nullOut: EngineOutput = nextStep([{ stage: 'Q6', variant: 'A', response: 'nothing I can identify' }])
  const anull = toSelectionAudit(nullOut)
  assert('SA-3  null_result → audit (stage/variant null, rule set)', anull.kind === 'null_result' && anull.stage === null && anull.variant === null && anull.rule.length > 0)
}

// ============================================================================
// DT — deriveTerminal
// ============================================================================
{
  const q = deriveTerminal({ kind: 'question', stage: 'Q2', variant: 'A', rule: 'Q1.advance', text: 'x', advanced: true, signals: [] })
  assert('DT-1  question → in progress (pending / no outcome / not complete)', q.gateStatus === 'pending' && q.outcome === null && q.isComplete === false)

  const hg = deriveTerminal({ kind: 'hard_gate', rule: 'Q5.complete-hard-gate', signals: [] })
  assert('DT-2  hard_gate → awaiting_approval / found / complete', hg.gateStatus === 'awaiting_approval' && hg.outcome === 'found' && hg.isComplete === true)

  const nr = deriveTerminal({ kind: 'null_result', clarificationVariant: 'A', text: 'x', rule: 'Q6.null-result→clarify.A', signals: [] })
  assert('DT-3  null_result → pending / null_result / complete', nr.gateStatus === 'pending' && nr.outcome === 'null_result' && nr.isComplete === true)
}

// ============================================================================
// RC — retention cutoff arithmetic
// ============================================================================
{
  assert('RC-0  default window is 90 days', RETENTION_WINDOW_DAYS === 90)
  const now = new Date('2026-05-21T00:00:00.000Z')
  const cutoff = computeRetentionCutoffIso(90, now)
  // 90 days before 2026-05-21 is 2026-02-20.
  assert('RC-1  90-day cutoff is 2026-02-20', cutoff === '2026-02-20T00:00:00.000Z', cutoff)
  const cutoff30 = computeRetentionCutoffIso(30, now)
  assert('RC-2  30-day cutoff is 2026-04-21', cutoff30 === '2026-04-21T00:00:00.000Z', cutoff30)
  assert('RC-3  cutoff is a valid ISO string', !Number.isNaN(Date.parse(cutoff)))
}

// ============================================================================
// KG7 — JS-level array invariant (precondition for jsonb_typeof='array')
// ============================================================================
{
  const ins = initialSessionInsert('s', 'a')
  // The payload fields must be ARRAYS, not strings. If a future edit ever
  // JSON.stringify'd them, this catches it before it reaches Supabase.
  assert('KG7-1  response_history is an Array (not a string)', Array.isArray(ins.response_history) && typeof ins.response_history !== 'string')
  assert('KG7-2  signals_detected is an Array (not a string)', Array.isArray(ins.signals_detected) && typeof ins.signals_detected !== 'string')

  const grown = appendResponse(ins.response_history, { stage: 'Q1', variant: 'A', response: 'x' })
  assert('KG7-3  appended response_history is still an Array', Array.isArray(grown))
  const grownAudit = appendAudit(ins.signals_detected, { kind: 'question', stage: 'Q1', variant: 'A', rule: 'r', signals: [] })
  assert('KG7-4  appended signals_detected is still an Array', Array.isArray(grownAudit))
}

// ============================================================================
// CMP — composition with the engine across a run
// ============================================================================
{
  // Simulate the endpoint's array-building for a clean "good agent" run, the way
  // POST /api/calling will compose the persisted state.
  const goodResponse: Record<string, string> = {
    Q1: 'I already maintain operational documentation and existing relationships given to me right now.',
    Q2: 'I have demonstrated maintaining operational documentation in prior contexts; my track record shows documentation results.',
    Q3: 'This documentation need exists regardless of my attention; it is documented and observed independently and persists without me.',
    Q4: 'The conditions are met for the documentation work.',
    Q5: 'The first act is clear and I will begin now, given what already exists.',
  }

  let history: ResponseRecord[] = []
  let audits: SelectionAudit[] = []
  let terminalReached: string | null = null
  let guard = 0

  // First surfacing (cold open) — record its audit.
  let decision = nextStep(history)
  audits = appendAudit(audits, toSelectionAudit(decision))

  while (guard++ < 40) {
    if (decision.kind !== 'question') {
      terminalReached = decision.kind
      break
    }
    // Agent answers the surfaced question.
    history = appendResponse(history, {
      stage: decision.stage,
      variant: decision.variant,
      response: goodResponse[decision.stage] ?? 'acknowledged',
    })
    // Engine produces the next decision; record its audit.
    decision = nextStep(history)
    audits = appendAudit(audits, toSelectionAudit(decision))
  }

  assert('CMP-1  run reaches the Hard Gate', terminalReached === 'hard_gate', `terminal=${terminalReached}`)
  assert('CMP-2  response_history grew to several turns', Array.isArray(history) && history.length >= 4, `len=${history.length}`)
  assert('CMP-3  signals_detected is an array, one audit per decision', Array.isArray(audits) && audits.length === history.length + 1, `audits=${audits.length} history=${history.length}`)
  assert('CMP-4  every audit carries a non-empty named rule (R0 trail)', audits.every((a) => typeof a.rule === 'string' && a.rule.length > 0))
  const term = deriveTerminal(decision)
  assert('CMP-5  terminal derives found + complete', term.outcome === 'found' && term.isComplete === true)
}

// ============================================================================
// Report
// ============================================================================
console.log(`\n${passCount} pass / ${failCount} fail`)
if (failCount > 0) {
  console.log('\nFailures:')
  failures.forEach((f) => console.log(`  - ${f}`))
  process.exit(1)
}
process.exit(0)
