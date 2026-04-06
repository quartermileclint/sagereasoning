#!/usr/bin/env node
/**
 * live-api-test.mjs — Live API Test Suite for SageReasoning
 *
 * Tests the Anthropic API connection and core reasoning pipeline
 * by calling the same SDK your website uses.
 *
 * Run: node tests/live-api-test.mjs
 * (from the /website folder)
 *
 * What it tests:
 *   1. API key is present and valid
 *   2. Anthropic SDK can connect
 *   3. Quick reasoning (Haiku model) works
 *   4. Standard reasoning (Haiku model) works
 *   5. Deep reasoning (Sonnet model) works
 *   6. Stoic evaluation produces expected structure
 *   7. Response contains key Stoic concepts
 */

import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ---------------------------------------------------------------------------
// Load .env.local (since we're running outside Next.js)
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env.local')

try {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed.slice(eqIndex + 1).trim()
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
} catch (e) {
  console.error('❌ Could not read .env.local — make sure you run this from the /website folder')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const MODEL_FAST = 'claude-haiku-4-5-20251001'
const MODEL_DEEP = 'claude-sonnet-4-6'

const PASS = '✅ PASS'
const FAIL = '❌ FAIL'
const SKIP = '⏭️  SKIP'

let passed = 0
let failed = 0
let skipped = 0

function report(label, success, detail) {
  if (success === null) {
    console.log(`  ${SKIP}  ${label}${detail ? ' — ' + detail : ''}`)
    skipped++
  } else if (success) {
    console.log(`  ${PASS}  ${label}${detail ? ' — ' + detail : ''}`)
    passed++
  } else {
    console.log(`  ${FAIL}  ${label}${detail ? ' — ' + detail : ''}`)
    failed++
  }
}

// ---------------------------------------------------------------------------
// Test 1: API Key Present
// ---------------------------------------------------------------------------
console.log('\n══════════════════════════════════════════════')
console.log('  SageReasoning — Live API Test Suite')
console.log('══════════════════════════════════════════════\n')

console.log('── Test Group 1: Configuration ──')

const apiKey = process.env.ANTHROPIC_API_KEY
if (!apiKey) {
  report('API key exists in .env.local', false, 'ANTHROPIC_API_KEY is missing or empty')
  console.log('\n  Cannot proceed without an API key. Exiting.\n')
  process.exit(1)
}

report('API key exists in .env.local', true, `starts with ${apiKey.slice(0, 12)}...`)
report('API key format valid', apiKey.startsWith('sk-ant-'), `expected sk-ant-* prefix`)

// ---------------------------------------------------------------------------
// Test 2: SDK Connection
// ---------------------------------------------------------------------------
console.log('\n── Test Group 2: SDK Connection ──')

let client
try {
  client = new Anthropic({ apiKey })
  report('Anthropic SDK client created', true)
} catch (e) {
  report('Anthropic SDK client created', false, e.message)
  process.exit(1)
}

// Simple ping — smallest possible API call
try {
  const pingStart = Date.now()
  const ping = await client.messages.create({
    model: MODEL_FAST,
    max_tokens: 10,
    messages: [{ role: 'user', content: 'Reply with just the word: connected' }],
  })
  const pingMs = Date.now() - pingStart
  const reply = ping.content[0]?.text?.toLowerCase() || ''
  report('API connection successful', reply.includes('connected'), `${pingMs}ms, got: "${ping.content[0]?.text}"`)
  report('Usage tracking works', ping.usage?.input_tokens > 0, `${ping.usage?.input_tokens} input / ${ping.usage?.output_tokens} output tokens`)
} catch (e) {
  report('API connection successful', false, e.message)
  console.log('\n  Cannot reach the Anthropic API. Check your key and internet connection.\n')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Test 3: Quick Reasoning (Haiku)
// ---------------------------------------------------------------------------
console.log('\n── Test Group 3: Quick Reasoning (Haiku) ──')

const STOIC_SYSTEM_PROMPT = `You are a Stoic reasoning engine. Evaluate the given action using these mechanisms:

1. CONTROL FILTER: Is this within the agent's control? (fully/partially/not)
2. PASSION DIAGNOSIS: What passions (irrational impulses) are present? List any from: appetite, fear, pleasure, distress
3. OIKEIOSIS CHECK: Who is affected? Rate concern for self, close relations, community, humanity.

Return a JSON object with:
{
  "control_classification": "fully|partially|not",
  "passions_detected": [{"type": "string", "evidence": "string", "false_judgement": "string"}],
  "oikeiosis": {"self": 0-10, "close": 0-10, "community": 0-10, "humanity": 0-10},
  "katorthoma_proximity": "reflexive|habitual|deliberate|principled|sage_like",
  "reasoning_summary": "string"
}`

try {
  const quickStart = Date.now()
  const quickResult = await client.messages.create({
    model: MODEL_FAST,
    max_tokens: 1000,
    system: STOIC_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: 'Evaluate this action: "I want to buy an expensive car to impress my neighbours, even though I cannot afford it."'
    }],
  })
  const quickMs = Date.now() - quickStart
  const quickText = quickResult.content[0]?.text || ''

  report('Haiku responds to Stoic prompt', quickText.length > 50, `${quickMs}ms, ${quickText.length} chars`)

  // Try to parse as JSON
  let quickJson
  try {
    // Extract JSON from response (it might be wrapped in markdown code blocks)
    const jsonMatch = quickText.match(/\{[\s\S]*\}/)
    quickJson = JSON.parse(jsonMatch?.[0] || quickText)
  } catch {
    quickJson = null
  }

  report('Response is valid JSON', quickJson !== null, quickJson ? 'parsed successfully' : 'could not parse')

  if (quickJson) {
    report('Has control_classification', !!quickJson.control_classification, quickJson.control_classification)
    report('Has passions_detected', Array.isArray(quickJson.passions_detected), `${quickJson.passions_detected?.length || 0} passions found`)
    report('Has oikeiosis scores', !!quickJson.oikeiosis, quickJson.oikeiosis ? `self=${quickJson.oikeiosis.self}` : 'missing')
    report('Has katorthoma_proximity', !!quickJson.katorthoma_proximity, quickJson.katorthoma_proximity)
    report('Has reasoning_summary', !!quickJson.reasoning_summary, quickJson.reasoning_summary ? `${quickJson.reasoning_summary.slice(0, 60)}...` : 'missing')

    // Sanity check: buying expensive car to impress should detect passions
    const hasAppetite = quickJson.passions_detected?.some(p =>
      p.type?.toLowerCase().includes('appetite') ||
      p.type?.toLowerCase().includes('desire') ||
      p.evidence?.toLowerCase().includes('impress')
    )
    report('Correctly identifies appetite/desire passion', hasAppetite, 'sanity check on known-bad action')
  }

  report('Token usage recorded', quickResult.usage?.input_tokens > 0,
    `${quickResult.usage?.input_tokens} in / ${quickResult.usage?.output_tokens} out`)
} catch (e) {
  report('Quick reasoning test', false, e.message)
}

// ---------------------------------------------------------------------------
// Test 4: Standard Reasoning (Haiku with more mechanisms)
// ---------------------------------------------------------------------------
console.log('\n── Test Group 4: Standard Reasoning ──')

const STANDARD_SYSTEM_PROMPT = `You are a Stoic reasoning engine performing a STANDARD depth evaluation. Apply these 5 mechanisms:

1. CONTROL FILTER
2. PASSION DIAGNOSIS
3. OIKEIOSIS CHECK
4. VALUE ASSESSMENT: Which cardinal virtues are engaged? (wisdom, courage, justice, temperance)
5. APPROPRIATE ACTION: What would the sage do differently?

Return a JSON object with all fields from quick evaluation PLUS:
{
  "control_classification": "fully|partially|not",
  "passions_detected": [...],
  "oikeiosis": {...},
  "katorthoma_proximity": "reflexive|habitual|deliberate|principled|sage_like",
  "virtues_engaged": [{"virtue": "string", "expression": "string", "quality": "strong|moderate|weak"}],
  "sage_alternative": "string",
  "reasoning_summary": "string"
}`

try {
  const stdStart = Date.now()
  const stdResult = await client.messages.create({
    model: MODEL_FAST,
    max_tokens: 1500,
    system: STANDARD_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: 'Evaluate this action: "A colleague takes credit for my work in a meeting. I want to publicly call them out in front of everyone to embarrass them."'
    }],
  })
  const stdMs = Date.now() - stdStart
  const stdText = stdResult.content[0]?.text || ''

  report('Standard reasoning responds', stdText.length > 100, `${stdMs}ms, ${stdText.length} chars`)

  let stdJson
  try {
    const jsonMatch = stdText.match(/\{[\s\S]*\}/)
    stdJson = JSON.parse(jsonMatch?.[0] || stdText)
  } catch {
    stdJson = null
  }

  if (stdJson) {
    report('Has virtues_engaged', Array.isArray(stdJson.virtues_engaged), `${stdJson.virtues_engaged?.length || 0} virtues`)
    report('Has sage_alternative', !!stdJson.sage_alternative, stdJson.sage_alternative ? `${stdJson.sage_alternative.slice(0, 60)}...` : 'missing')

    // Sanity: embarrassing a colleague should not be sage-like or principled
    const proximity = stdJson.katorthoma_proximity?.toLowerCase()
    const notSageLike = proximity !== 'sage_like' && proximity !== 'principled'
    report('Correctly assesses vengeful action as non-virtuous', notSageLike, `proximity: ${proximity}`)
  } else {
    report('Response is valid JSON', false, 'could not parse standard response')
  }
} catch (e) {
  report('Standard reasoning test', false, e.message)
}

// ---------------------------------------------------------------------------
// Test 5: Deep Reasoning (Sonnet)
// ---------------------------------------------------------------------------
console.log('\n── Test Group 5: Deep Reasoning (Sonnet) ──')

try {
  const deepStart = Date.now()
  const deepResult = await client.messages.create({
    model: MODEL_DEEP,
    max_tokens: 500,
    system: 'You are a Stoic philosopher. Provide a brief evaluation of the given situation in JSON format with fields: katorthoma_proximity (reflexive|habitual|deliberate|principled|sage_like), key_insight (string), virtue_path (string).',
    messages: [{
      role: 'user',
      content: 'Evaluate: "I choose to forgive someone who wronged me, not because they deserve it, but because holding onto anger harms my own character."'
    }],
  })
  const deepMs = Date.now() - deepStart
  const deepText = deepResult.content[0]?.text || ''

  report('Sonnet model responds', deepText.length > 50, `${deepMs}ms, ${deepText.length} chars`)

  let deepJson
  try {
    const jsonMatch = deepText.match(/\{[\s\S]*\}/)
    deepJson = JSON.parse(jsonMatch?.[0] || deepText)
  } catch {
    deepJson = null
  }

  if (deepJson) {
    // Sanity: forgiving for character reasons should be principled or sage-like
    const proximity = deepJson.katorthoma_proximity?.toLowerCase()
    const isVirtuous = proximity === 'sage_like' || proximity === 'principled'
    report('Correctly assesses virtuous action highly', isVirtuous, `proximity: ${proximity}`)
    report('Provides key insight', !!deepJson.key_insight, deepJson.key_insight ? `${deepJson.key_insight.slice(0, 60)}...` : 'missing')
  } else {
    report('Response is valid JSON', false, 'could not parse deep response')
  }

  report('Sonnet token usage', deepResult.usage?.input_tokens > 0,
    `${deepResult.usage?.input_tokens} in / ${deepResult.usage?.output_tokens} out`)
} catch (e) {
  report('Deep reasoning test', false, e.message)
}

// ---------------------------------------------------------------------------
// Test 6: Guardrail Binary Gate (speed check)
// ---------------------------------------------------------------------------
console.log('\n── Test Group 6: Guardrail Speed Check ──')

try {
  const guardStart = Date.now()
  const guardResult = await client.messages.create({
    model: MODEL_FAST,
    max_tokens: 300,
    system: 'You are a fast Stoic guardrail. Return ONLY a JSON object: {"proceed": true/false, "katorthoma_proximity": "reflexive|habitual|deliberate|principled|sage_like", "reason": "one sentence"}',
    messages: [{
      role: 'user',
      content: 'Should I proceed with: "Donate to a food bank this weekend"'
    }],
  })
  const guardMs = Date.now() - guardStart
  const guardText = guardResult.content[0]?.text || ''

  let guardJson
  try {
    const jsonMatch = guardText.match(/\{[\s\S]*\}/)
    guardJson = JSON.parse(jsonMatch?.[0] || guardText)
  } catch {
    guardJson = null
  }

  report('Guardrail responds fast', guardMs < 5000, `${guardMs}ms (target: <5000ms)`)
  report('Returns proceed decision', guardJson?.proceed !== undefined, `proceed: ${guardJson?.proceed}`)
  report('Correctly approves virtuous action', guardJson?.proceed === true, 'donating should be approved')
} catch (e) {
  report('Guardrail speed test', false, e.message)
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log('\n══════════════════════════════════════════════')
console.log(`  Results: ${passed} passed, ${failed} failed, ${skipped} skipped`)
console.log('══════════════════════════════════════════════')

if (failed === 0) {
  console.log('\n  🎉 All tests passed! Your Anthropic API pipeline is working.')
  console.log('  The sage-reason-engine will function correctly on your live site.\n')
} else {
  console.log(`\n  ⚠️  ${failed} test(s) failed. Review the output above for details.\n`)
}

process.exit(failed > 0 ? 1 : 0)
