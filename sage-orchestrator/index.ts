/**
 * sage-orchestrator — Unified agent orchestration pattern for SageReasoning.
 *
 * This module implements the 7-step workflow that all Sage agents follow.
 * The same orchestration pattern serves:
 *   - SageReasoning's 4 internal agents (Ops, Tech, Growth, Support)
 *   - Customer agents via the startup package (with their own brains)
 *
 * Architecture decisions (Session 9):
 *   - One orchestration pattern, "which brain" as a parameter
 *   - ATL authority levels apply to external agents only (not internal)
 *   - The decision authority gate exists for founder decisions, not trust
 *   - Internal agents call clean product endpoints for Stoic evaluation
 *   - Non-saged external tool output gets 5B Stoic review automatically
 *
 * Usage (internal):
 *   import { runAgentPipeline, createOpsPreset, createBrainLoader } from 'sage-orchestrator'
 *   import { getOpsBrainContext, getOpsBrainContextForDomains } from '@/lib/context/ops-brain-loader'
 *
 *   const brain = createBrainLoader(getOpsBrainContext, getOpsBrainContextForDomains, ['process', ...])
 *   const config = createOpsPreset(brain)
 *   const result = await runAgentPipeline(config, { task: '...' }, reasonFn)
 *
 * Usage (customer startup package):
 *   import { runAgentPipeline } from 'sage-orchestrator'
 *
 *   const brain = createBrainLoader(myBrainGetter, myDomainGetter, myDomains)
 *   const config = { agentType: 'legal', brain, ... }
 *   const result = await runAgentPipeline(config, { task: '...' }, myReasonFn)
 */

// Types
export type {
  SageAgentType,
  BrainLoader,
  BrainDepth,
  AgentPipelineConfig,
  StoicEndpoint,
  ActionCategory,
  DecisionGateConfig,
  PipelineInput,
  PipelineOutput,
  PipelineStep,
  PipelineMeta,
  DecisionGateResult,
  StoicReviewResult,
} from './types'

// Pipeline runner
export { runAgentPipeline } from './pipeline'
export type { ReasonFunction, ReasonFunctionInput, ReasonFunctionOutput } from './pipeline'

// Preset configurations
export {
  createBrainLoader,
  createOpsPreset,
  createTechPreset,
  createGrowthPreset,
  createSupportPreset,
  getPresetFactory,
} from './presets'
