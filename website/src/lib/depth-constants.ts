/**
 * depth-constants.ts — Single source of truth for depth-related types and constants.
 *
 * SOURCE OF TRUTH for ReasonDepth and DEPTH_MECHANISMS.
 *
 * Both sage-reason-engine.ts and stoic-brain-loader.ts import from here.
 * This file exists to break the circular dependency between engine and loader
 * while keeping a single definition of which mechanisms apply at each depth.
 *
 * If you need to add a new mechanism or depth level:
 *   1. Edit THIS FILE only
 *   2. Run: npx tsc --noEmit (compile check catches any downstream breakage)
 *   3. Update the system prompts in sage-reason-engine.ts to include the new mechanism
 *   4. Add the loader function to MECHANISM_LOADERS in stoic-brain-loader.ts
 *
 * History: ReasonDepth and DEPTH_MECHANISMS were duplicated between
 * sage-reason-engine.ts (lines 42, 129-133) and stoic-brain-loader.ts (lines 30, 209-213)
 * as a circular dependency fix in session 7b. This file replaces both copies.
 * See audit finding F5 (17 April 2026).
 */

export type ReasonDepth = 'quick' | 'standard' | 'deep'

/**
 * Which Stoic Brain mechanisms are included at each depth level.
 *
 * quick:    3 mechanisms — core triad (control, passion, social)
 * standard: 5 mechanisms — adds value assessment and kathekon
 * deep:     6 mechanisms — adds iterative refinement (progress tracking)
 */
export const DEPTH_MECHANISMS: Record<ReasonDepth, string[]> = {
  quick: ['control_filter', 'passion_diagnosis', 'oikeiosis'],
  standard: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment'],
  deep: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment', 'iterative_refinement'],
}
