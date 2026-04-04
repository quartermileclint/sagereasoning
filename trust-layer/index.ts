/**
 * trust-layer/index.ts — Agent Trust Layer Framework
 *
 * Barrel export for all Trust Layer modules.
 *
 * Architecture:
 *   types/             — Core type definitions
 *   accreditation/     — Priority 1: Record management + public endpoint
 *   evaluation-window/ — Priority 2: Rolling window aggregation
 *   grade-engine/      — Priority 3: Grade transition rules
 *   authority/         — Priority 4: Authority level mapping + sage-guard integration
 *   card/              — Priority 5a: Accreditation Card
 *   progression-toolkit/ — Priority 5b: 9 progression tools + prescription model
 *   schema/            — Supabase schema (draft for review)
 */

// Types
export * from './types/accreditation'
export * from './types/evaluation'
export * from './types/progression'

// Priority 1: Accreditation Records + Public Endpoint
export {
  createAccreditationRecord,
  buildAccreditationPayload,
  buildGradeChangeEvent,
  proximityToAuthority,
  isValidAgentId,
  isExpired,
  compareProximityRank,
  PROXIMITY_TO_GRADE,
  GRADE_TO_PROXIMITY,
  PROXIMITY_RANK,
  ACCREDITATION_DISCLAIMER,
} from './accreditation/accreditation-record'

export {
  handleAccreditationLookup,
  handleBatchLookup,
  ACCREDITATION_RESPONSE_HEADERS,
} from './accreditation/public-endpoint'

// Priority 2: Rolling Evaluation Window
export {
  computeWindowSnapshot,
} from './evaluation-window/window-aggregator'

export { DEFAULT_WINDOW_CONFIG } from './types/evaluation'

// Priority 3: Grade Transition Engine
export {
  evaluateGradeTransition,
} from './grade-engine/grade-transition-engine'

// Priority 4: Authority Level Mapper
export {
  getAuthorityDefinition,
  getAuthorityFromRecord,
  determineGuardrailBehaviour,
  getReactiveEnforcement,
  isNovelAction,
  AUTHORITY_DEFINITIONS,
} from './authority/authority-mapper'

// Priority 5a: Accreditation Card
export {
  buildAccreditationCard,
  serializeCard,
} from './card/accreditation-card'

// Priority 5b: Progression Toolkit
export {
  PATHWAYS,
  generatePrescription,
  getPathway,
  getPathwaysForTransition,
  validateR12Compliance,
} from './progression-toolkit/pathways'

export {
  TOOL_REGISTRY,
  getToolMetadata,
  isValidToolId,
  buildExaminePrompt,
  buildDistinguishPrompt,
  buildDiagnosePrompt,
  buildCounterPrompt,
  buildClassifyValuePrompt,
  buildUnifyPrompt,
  buildStressPrompt,
  buildRefinePrompt,
  buildExtendPrompt,
} from './progression-toolkit/sage-tools'
