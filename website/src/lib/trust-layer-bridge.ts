/**
 * Trust Layer Bridge — Integration entry point
 *
 * Thin integration layer connecting the website to the Agent Trust Layer module.
 * The Trust Layer is architecturally isolated (~3,774 LOC) and this bridge
 * provides the interface the website needs without tight coupling.
 *
 * Status: Scaffolded — types and function signatures available,
 * full integration requires Supabase schema deployment and ANTHROPIC_API_KEY.
 *
 * Note: Uses dynamic import to avoid build-time resolution failures
 * when trust-layer dependencies aren't available in the website build context.
 */

// Re-export core types (type-only imports always resolve safely)
export type {
  AccreditationRecord,
  EvaluatedAction,
  GradeChangeEvent,
} from '../../../trust-layer'

/**
 * Dynamically load Trust Layer functions.
 * Returns null if the module can't be loaded (e.g., missing dependencies).
 */
export async function loadTrustLayerModule() {
  try {
    const mod = await import('../../../trust-layer')
    return {
      createAccreditationRecord: mod.createAccreditationRecord,
      handleAccreditationLookup: mod.handleAccreditationLookup,
      buildAccreditationCard: mod.buildAccreditationCard,
      evaluateGradeTransition: mod.evaluateGradeTransition,
      determineGuardrailBehaviour: mod.determineGuardrailBehaviour,
    }
  } catch {
    return null
  }
}

/**
 * Integration status check.
 * Returns whether the Trust Layer module is available for use.
 */
export async function isTrustLayerAvailable(): Promise<boolean> {
  const mod = await loadTrustLayerModule()
  return mod !== null
}
