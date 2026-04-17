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
 * Run: npx jest sage-reason-composition-order --no-coverage
 */

import { runSageReason } from '../sage-reason-engine'

// ---------------------------------------------------------------------------
// Mock the Anthropic client to capture the user message without calling the API
// ---------------------------------------------------------------------------
let capturedUserMessage = ''

jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn().mockImplementation(async (params: { messages: Array<{ role: string; content: string }> }) => {
          // Capture the user message (last message in the array)
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
        })
      }
    }))
  }
})

// Mock Supabase to avoid DB calls
jest.mock('@/lib/supabase-server', () => ({
  supabaseAdmin: {
    from: () => ({ insert: () => ({ select: () => Promise.resolve({ data: null, error: null }) }) })
  }
}))

// Mock project context
jest.mock('@/lib/context/project-context', () => ({
  getProjectContext: jest.fn().mockResolvedValue(''),
  getProjectContextSync: jest.fn().mockReturnValue('')
}))

// Mock stoic brain loader
jest.mock('@/lib/context/stoic-brain-loader', () => ({
  getStoicBrainContext: jest.fn().mockReturnValue('STOIC BRAIN MOCK CONTEXT')
}))

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('User message composition order (F9)', () => {
  beforeEach(() => {
    capturedUserMessage = ''
  })

  it('should compose layers in the correct order when all layers present', async () => {
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

    // Verify all markers are present
    expect(capturedUserMessage).toContain('TEST_INPUT_MARKER')
    expect(capturedUserMessage).toContain('TEST_CONTEXT_MARKER')
    expect(capturedUserMessage).toContain('TEST_DOMAIN_MARKER')
    expect(capturedUserMessage).toContain('TEST_PRACTITIONER_MARKER')
    expect(capturedUserMessage).toContain('TEST_PROJECT_MARKER')
    expect(capturedUserMessage).toContain('TEST_URGENCY_MARKER')
    expect(capturedUserMessage).toContain('Return only the JSON evaluation object.')

    // Verify ORDER: each marker must appear before the next
    const inputIdx = capturedUserMessage.indexOf('TEST_INPUT_MARKER')
    const contextIdx = capturedUserMessage.indexOf('TEST_CONTEXT_MARKER')
    const domainIdx = capturedUserMessage.indexOf('TEST_DOMAIN_MARKER')
    const practitionerIdx = capturedUserMessage.indexOf('TEST_PRACTITIONER_MARKER')
    const projectIdx = capturedUserMessage.indexOf('TEST_PROJECT_MARKER')
    const urgencyIdx = capturedUserMessage.indexOf('TEST_URGENCY_MARKER')
    const jsonInstructionIdx = capturedUserMessage.indexOf('Return only the JSON evaluation object.')

    expect(inputIdx).toBeLessThan(contextIdx)
    expect(contextIdx).toBeLessThan(domainIdx)
    expect(domainIdx).toBeLessThan(practitionerIdx)
    expect(practitionerIdx).toBeLessThan(projectIdx)
    expect(projectIdx).toBeLessThan(urgencyIdx)
    expect(urgencyIdx).toBeLessThan(jsonInstructionIdx)
  })

  it('should maintain order when optional layers are omitted', async () => {
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

    const inputIdx = capturedUserMessage.indexOf('TEST_INPUT_MARKER')
    const domainIdx = capturedUserMessage.indexOf('TEST_DOMAIN_MARKER')
    const jsonInstructionIdx = capturedUserMessage.indexOf('Return only the JSON evaluation object.')

    expect(inputIdx).toBeLessThan(domainIdx)
    expect(domainIdx).toBeLessThan(jsonInstructionIdx)

    // Omitted layers should not appear
    expect(capturedUserMessage).not.toContain('PRACTITIONER')
    expect(capturedUserMessage).not.toContain('URGENCY CONTEXT')
  })
})
