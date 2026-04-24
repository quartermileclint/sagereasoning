/**
 * sage-mentor-ring-bridge.ts — Function bridge for the Ring Wrapper
 *
 * PURPOSE: Give the website a stable internal import path for the Ring
 * Wrapper's runtime functions. The route handler imports from here rather
 * than reaching across the repo boundary into ../../../sage-mentor.
 *
 * Pattern matches the existing sage-mentor-bridge.ts: types are static
 * imports (resolve at compile time), runtime functions are dynamically
 * imported (avoids build-time resolution failures when sage-mentor
 * dependencies aren't available in the website build context).
 *
 * Scope: Used by /api/mentor/ring/proof for the PR1 single-endpoint proof.
 * If/when the ring is rolled out across more flows, this bridge is the
 * permanent entry point.
 */

// Static type-only imports — these resolve at compile time.
import type {
  MentorProfile,
  RingTask,
  InnerAgent,
  BeforeResult,
  AfterResult,
  RingResult,
  RingSession,
  ModelTier,
  TokenUsage,
  TokenUsageSummary,
} from '../../../sage-mentor'

// Re-export the types so route code can import them from this single file.
export type {
  MentorProfile,
  RingTask,
  InnerAgent,
  BeforeResult,
  AfterResult,
  RingResult,
  RingSession,
  ModelTier,
  TokenUsage,
  TokenUsageSummary,
}

/**
 * The runtime functions exposed by this bridge.
 * Loaded dynamically to avoid build-time failures.
 */
export interface RingFunctions {
  registerInnerAgent: (id: string, name: string, type: InnerAgent['type']) => InnerAgent
  getInnerAgent: (id: string) => InnerAgent | undefined
  executeBefore: (
    profile: MentorProfile,
    task: RingTask,
    innerAgent: InnerAgent,
  ) => {
    result: BeforeResult
    needsLlmCheck: boolean
    llmPrompt: string | null
    modelTier: ModelTier
    personaTier: 'full' | 'core'
  }
  executeAfter: (
    profile: MentorProfile,
    task: RingTask,
    innerAgentOutput: string,
    innerAgent: InnerAgent,
    beforeHadConcerns?: boolean,
  ) => {
    needsLlmCheck: boolean
    llmPrompt: string | null
    modelTier: ModelTier
    personaTier: 'full' | 'core'
    sideEffects: string[]
    criticalCategory: boolean
  }
  startRingSession: (task: RingTask, innerAgent: InnerAgent) => RingSession
  addSessionTokenUsage: (
    session: RingSession,
    inputTokens: number,
    outputTokens: number,
    tier: ModelTier,
    phase: TokenUsage['phase'],
  ) => void
  completeRingSession: (
    session: RingSession,
    beforeResult: BeforeResult,
    innerOutput: string,
    afterResult: AfterResult,
  ) => RingResult & { token_summary: TokenUsageSummary }
  MODEL_IDS: Record<ModelTier, string>
}

/**
 * Dynamically load the Ring Wrapper's runtime functions from sage-mentor.
 * Returns null if the module can't be loaded.
 *
 * Uses dynamic import so that build-time resolution of sage-mentor doesn't
 * fail if its dependencies aren't available in the website build context.
 */
export async function loadRingFunctions(): Promise<RingFunctions | null> {
  try {
    const mod = await import('../../../sage-mentor')
    return {
      registerInnerAgent: mod.registerInnerAgent,
      getInnerAgent: mod.getInnerAgent,
      executeBefore: mod.executeBefore,
      executeAfter: mod.executeAfter,
      startRingSession: mod.startRingSession,
      addSessionTokenUsage: mod.addSessionTokenUsage,
      completeRingSession: mod.completeRingSession,
      MODEL_IDS: mod.MODEL_IDS,
    }
  } catch (err) {
    console.error('[sage-mentor-ring-bridge] Failed to load ring functions:', err)
    return null
  }
}
