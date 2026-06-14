/**
 * sage-reason-composition-order.test.ts — F9: Verify user message layer order.
 *
 * The six-layer user message composition in runSageReason() must follow a
 * strict order so the LLM receives context in the correct priority sequence.
 * This test captures the assembled message and verifies section ordering.
 *
 * Expected order:
 *   1. Input prompt ("Apply the Stoic reasoning mechanisms...")
 *   2. Context (optional — "Context: ...")
 *   3. domain_context ("DOMAIN CONTEXT...")
 *   4. practitionerContext (Layer 2)
 *   5. projectContext (Layer 3)
 *   6. urgency_context ("URGENCY CONTEXT...")
 *   7. JSON return instruction ("Return only the JSON evaluation object.")
 *
 * Run: npx tsx <this file>
 */

import Anthropic from '@anthropic-ai/sdk'
import { runSageReason } from '../sage-reason-engine'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

// ---------------------------------------------------------------------------
// Stub the Anthropic client to capture the user message without calling the API.
//
// The original jest file did this with jest.mock('@anthropic-ai/sdk', ...).
// Under the plain-tsx harness there is no module mocker, so we patch the real
// SDK's Messages.prototype.create instead. runSageReason() lazily constructs a
// real Anthropic client (getClient()) whose `messages` object uses this same
// prototype, so replacing the method intercepts the call and prevents any
// network request. We capture the user-role message exactly as the original
// mock did, then return the same minimal-but-valid response.
//
// The original file also mocked @/lib/supabase-server, @/lib/context/project-
// context, and @/lib/context/stoic-brain-loader. runSageReason() does not touch
// any of those on this code path (supabase-server is not in its import chain;
// project-context/stoic-brain-loader are never called by the engine), so those
// mocks were defensive no-ops and are not reproduced — behaviour is identical.
// ---------------------------------------------------------------------------
let capturedUserMessage = ''

// Resolve the Messages prototype off a throwaway client instance, then patch it.
const _probeClient = new Anthropic({ apiKey: 'test-key-not-used' })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MessagesProto = Object.getPrototypeOf((_probeClient as any).messages)
MessagesProto.create = async (params: { messages: Array<{ role: string; content: string }> }) => {
  // Capture the user message (the user-role message in the array)
  const userMsg = params.messages.find(m => m.role === 'user')
  capturedUserMessage = userMsg?.content || ''
  // Return a minimal valid response that won't crash the parser
  return {
    content: [{ type: 'text', text: JSON.stringify({
      control_assessment: { within_control: true, reasoning: 'test' },
      passion_diagnosis: { passions_detected: [], is_kathekon: true, kathekon_quality: 'strong', reasoning: 'test', disclaimer: 'test' },
      oikeiosis_assessment: { concern_level: 'self', proximity_level: 'deliberate', reasoning: 'test' },
      overall_assessment: { action_rating: 7, summary: 'test', key_insight: 'test' }
    }) }],
    usage: { input_tokens: 100, output_tokens: 100 },
    model: 'claude-3-5-haiku-20241022'
  }
}

// ---------------------------------------------------------------------------
// Tests (originally: describe 'User message composition order (F9)')
// beforeEach reset: capturedUserMessage = '' — inlined at the start of each block.
//
// Wrapped in an async IIFE because the project's tsx config emits CJS, which
// disallows top-level await; runSageReason() is async.
// ---------------------------------------------------------------------------

async function main(): Promise<void> {

// it('should compose layers in the correct order when all layers present')
{
  capturedUserMessage = '' // beforeEach
  try {
    await runSageReason({
      input: 'TEST_INPUT_MARKER',
      context: 'TEST_CONTEXT_MARKER',
      domain_context: 'TEST_DOMAIN_MARKER',
      practitionerContext: 'TEST_PRACTITIONER_MARKER',
      projectContext: 'TEST_PROJECT_MARKER',
      urgency_context: 'TEST_URGENCY_MARKER',
      depth: 'quick'
    })
  } catch {
    // Parser may throw on mock response — that's fine, we just need capturedUserMessage
  }

  const L = 'all layers present: '

  // Verify all markers are present
  assert(capturedUserMessage.includes('TEST_INPUT_MARKER'), L + 'contains TEST_INPUT_MARKER')
  assert(capturedUserMessage.includes('TEST_CONTEXT_MARKER'), L + 'contains TEST_CONTEXT_MARKER')
  assert(capturedUserMessage.includes('TEST_DOMAIN_MARKER'), L + 'contains TEST_DOMAIN_MARKER')
  assert(capturedUserMessage.includes('TEST_PRACTITIONER_MARKER'), L + 'contains TEST_PRACTITIONER_MARKER')
  assert(capturedUserMessage.includes('TEST_PROJECT_MARKER'), L + 'contains TEST_PROJECT_MARKER')
  assert(capturedUserMessage.includes('TEST_URGENCY_MARKER'), L + 'contains TEST_URGENCY_MARKER')
  assert(capturedUserMessage.includes('Return only the JSON evaluation object.'), L + "contains 'Return only the JSON evaluation object.'")

  // Verify ORDER: each marker must appear before the next
  const inputIdx = capturedUserMessage.indexOf('TEST_INPUT_MARKER')
  const contextIdx = capturedUserMessage.indexOf('TEST_CONTEXT_MARKER')
  const domainIdx = capturedUserMessage.indexOf('TEST_DOMAIN_MARKER')
  const practitionerIdx = capturedUserMessage.indexOf('TEST_PRACTITIONER_MARKER')
  const projectIdx = capturedUserMessage.indexOf('TEST_PROJECT_MARKER')
  const urgencyIdx = capturedUserMessage.indexOf('TEST_URGENCY_MARKER')
  const jsonInstructionIdx = capturedUserMessage.indexOf('Return only the JSON evaluation object.')

  assert(inputIdx < contextIdx, L + 'inputIdx < contextIdx')
  assert(contextIdx < domainIdx, L + 'contextIdx < domainIdx')
  assert(domainIdx < practitionerIdx, L + 'domainIdx < practitionerIdx')
  assert(practitionerIdx < projectIdx, L + 'practitionerIdx < projectIdx')
  assert(projectIdx < urgencyIdx, L + 'projectIdx < urgencyIdx')
  assert(urgencyIdx < jsonInstructionIdx, L + 'urgencyIdx < jsonInstructionIdx')
}

// it('should maintain order when optional layers are omitted')
{
  capturedUserMessage = '' // beforeEach
  try {
    await runSageReason({
      input: 'TEST_INPUT_MARKER',
      domain_context: 'TEST_DOMAIN_MARKER',
      // No context, practitionerContext, projectContext, or urgency_context
      depth: 'quick'
    })
  } catch {
    // Parser may throw — that's fine
  }

  const L = 'optional layers omitted: '

  const inputIdx = capturedUserMessage.indexOf('TEST_INPUT_MARKER')
  const domainIdx = capturedUserMessage.indexOf('TEST_DOMAIN_MARKER')
  const jsonInstructionIdx = capturedUserMessage.indexOf('Return only the JSON evaluation object.')

  assert(inputIdx < domainIdx, L + 'inputIdx < domainIdx')
  assert(domainIdx < jsonInstructionIdx, L + 'domainIdx < jsonInstructionIdx')

  // Omitted layers should not appear
  assert(!capturedUserMessage.includes('PRACTITIONER'), L + 'does not contain PRACTITIONER')
  assert(!capturedUserMessage.includes('URGENCY CONTEXT'), L + 'does not contain URGENCY CONTEXT')
}

}

main().then(() => {
  console.log('\n' + passed + ' passed, ' + failed + ' failed')
  if (failed > 0) {
    console.error('\nFailures:')
    for (const f of failures) console.error('  - ' + f)
    process.exit(1)
  }
}).catch((err) => {
  console.error('Test harness threw:', err)
  process.exit(1)
})
