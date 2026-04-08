/**
 * Sage Mentor Bridge — Integration entry point
 *
 * Thin integration layer connecting the website to the Sage Mentor module.
 * The Sage Mentor is architecturally isolated (~12,800 LOC) and this bridge
 * provides the interface the website needs without tight coupling.
 *
 * Status: Scaffolded — types and function signatures available,
 * full integration requires ANTHROPIC_API_KEY configuration.
 *
 * Note: Uses dynamic import to avoid build-time resolution failures
 * when sage-mentor dependencies aren't available in the website build context.
 */

// Re-export core types (type-only imports always resolve safely)
export type {
  MentorProfile,
  PassionMapEntry,
  CausalTendency,
  ValueHierarchyEntry,
} from '../../../sage-mentor'

export type {
  ReflectionOutput,
} from '../../../sage-mentor/profile-store'

/**
 * Dynamically load Sage Mentor functions.
 * Returns null if the module can't be loaded (e.g., missing dependencies).
 */
export async function loadMentorModule() {
  try {
    const mod = await import('../../../sage-mentor')
    return {
      buildMentorPersona: mod.buildMentorPersona,
      loadProfile: mod.loadProfile,
    }
  } catch {
    return null
  }
}

/**
 * Dynamically load profile-store functions.
 * Used by the reflect route to feed reflection findings back into the Mentor profile.
 * Returns null if the module can't be loaded.
 */
export async function loadProfileStore() {
  try {
    const mod = await import('../../../sage-mentor/profile-store')
    return {
      updateProfileFromReflection: mod.updateProfileFromReflection,
      upsertPassionObservation: mod.upsertPassionObservation,
      recordInteraction: mod.recordInteraction,
    }
  } catch {
    return null
  }
}

/**
 * Integration status check.
 * Returns whether the Sage Mentor module is available for use.
 */
export async function isMentorAvailable(): Promise<boolean> {
  const mod = await loadMentorModule()
  return mod !== null
}
