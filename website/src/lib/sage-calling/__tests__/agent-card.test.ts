/**
 * agent-card.test.ts — tests for the optional Agent Card verifier (D-13),
 * build Stage 2 — the Critical public-surface half.
 *
 * Run (from website/; no Supabase, no network — the verifier is pure):
 *   npx tsx src/lib/sage-calling/__tests__/agent-card.test.ts
 *
 * Coverage:
 *   HTTPS — isHttpsUrl accepts https, rejects http / unparsable.
 *   OK    — a well-formed https card (object) verifies → chosen_role hint.
 *   ORIG  — a self-declared url matching the fetch origin verifies.
 *   SPOOF — a self-declared url on a DIFFERENT origin is rejected (no hint).
 *   FETCH — fetch failure / non-2xx / non-object body all fail closed.
 *   POISON— available_tools / skills claims are NEVER read as capacity; a
 *           poisoned card verifies at most to chosen_role, never more.
 */

import { verifyAgentCard, isHttpsUrl, type FetchedCard } from '../agent-card'

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

const ok = (status: number, body: unknown): FetchedCard => ({ ok: true, status, body })

// HTTPS ----------------------------------------------------------------------
assert('HTTPS-1 https accepted', isHttpsUrl('https://example.com/.well-known/agent.json'))
assert('HTTPS-2 http rejected', !isHttpsUrl('http://example.com/agent.json'))
assert('HTTPS-3 garbage rejected', !isHttpsUrl('not a url'))

// OK -------------------------------------------------------------------------
{
  const v = verifyAgentCard('https://example.com/agent.json', ok(200, { name: 'Helper', capabilities: ['x'] }))
  assert('OK-1   well-formed card verifies', v.verified === true)
  assert('OK-2   verified card yields chosen_role hint', v.role_hint === 'chosen_role')
}

// ORIG (matching declared url) ----------------------------------------------
{
  const v = verifyAgentCard('https://example.com/agent.json', ok(200, { url: 'https://example.com/agent', name: 'Helper' }))
  assert('ORIG-1 matching declared origin verifies', v.verified === true && v.role_hint === 'chosen_role')
}

// SPOOF ----------------------------------------------------------------------
{
  const v = verifyAgentCard('https://example.com/agent.json', ok(200, { url: 'https://evil.example.net/agent', name: 'Impostor' }))
  assert('SPOOF-1 mismatched declared origin rejected', v.verified === false)
  assert('SPOOF-2 spoofed card yields NO role hint', v.role_hint === null)
}

// FETCH failure modes --------------------------------------------------------
{
  assert('FETCH-1 fetch error fails closed', verifyAgentCard('https://example.com/a.json', { ok: false, error: 'timeout' }).verified === false)
  assert('FETCH-2 non-2xx fails closed', verifyAgentCard('https://example.com/a.json', ok(404, {})).verified === false)
  assert('FETCH-3 non-object body fails closed (array)', verifyAgentCard('https://example.com/a.json', ok(200, [1, 2, 3])).verified === false)
  assert('FETCH-4 non-object body fails closed (string)', verifyAgentCard('https://example.com/a.json', ok(200, 'hi')).verified === false)
  assert('FETCH-5 non-https supplied url fails closed', verifyAgentCard('http://example.com/a.json', ok(200, { name: 'x' })).verified === false)
}

// POISON (R18d) — tool/skill claims never become capacity evidence -----------
{
  const poisoned = ok(200, {
    name: 'Overclaimer',
    url: 'https://example.com/agent',
    available_tools: ['root_shell', 'wire_transfer', 'delete_all'],
    skills: ['omniscience', 'infallibility'],
    capabilities: 'I can do absolutely anything you ask',
  })
  const v = verifyAgentCard('https://example.com/agent.json', poisoned)
  // The card is well-formed + origin-matched, so it verifies — but the verdict
  // contributes ONLY the chosen-role hint. It NEVER surfaces the tool/skill
  // claims, and the verification shape carries no capacity field at all.
  assert('POISON-1 poisoned card verifies only to chosen_role', v.verified === true && v.role_hint === 'chosen_role')
  assert('POISON-2 verdict carries no capacity/tool data (only role_hint + reason)', Object.keys(v).sort().join(',') === 'reason,role_hint,verified')
  // Identical verdict whether or not the poison fields are present → the tools
  // changed nothing (they are ignored, per D-13/R18d).
  const clean = verifyAgentCard('https://example.com/agent.json', ok(200, { name: 'Overclaimer', url: 'https://example.com/agent' }))
  assert('POISON-3 tool/skill claims do not change the verdict', clean.verified === v.verified && clean.role_hint === v.role_hint)
}

console.log(`\n${passCount} pass / ${failCount} fail`)
if (failCount > 0) {
  console.log('\nFailures:')
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
