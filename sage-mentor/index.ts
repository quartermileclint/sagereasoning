/**
 * sage-mentor/index.ts — Barrel export for the Sage Mentor module
 *
 * The Sage Mentor is the permanent outer ring of the Sage Agent architecture.
 * It wraps any inner agent/skill/tool with before/after Stoic reasoning checks,
 * carries the user's evolving profile, and surfaces journal insights at the
 * right moment.
 *
 * Module structure:
 *   sanitise.ts            — Prompt injection defence layer (used by all other modules)
 *   persona.ts             — Mentor identity, system prompt builder, proactive prompts
 *   journal-ingestion.ts   — Pipeline for extracting profile data from the 55-Day Journal
 *   ring-wrapper.ts        — The ring: before/after orchestrator, model routing, token instrumentation
 *   profile-store.ts       — Supabase persistence layer, rolling window aggregation, profile caching
 *   proactive-scheduler.ts — Scheduled proactive outputs (morning, evening, weekly)
 *   pattern-engine.ts      — Temporal pattern recognition engine (batch, deterministic)
 *   authority-manager.ts   — Inner agent authority lifecycle (promotion, demotion, suspension)
 *
 * SageReasoning Proprietary Licence
 */
/**
 * @compliance
 * compliance_version: CR-2026-Q2-v1
 * last_regulatory_review: 2026-04-04
 * applicable_jurisdictions: [AU, EU, US]
 * regulatory_references: [CR-001, CR-002, CR-004, CR-005, CR-009]
 * review_cycle: quarterly
 * owner: founder
 * next_review_due: 2026-07-06
 * change_trigger: [EU AI Act classification guidance, AU Privacy Act reform]
 * deprecation_flag: false
 */

// ── Persona ──────────────────────────────────────────────────────────────────
export type {
  MentorProfile,
  PassionMapEntry,
  CausalTendency,
  ValueHierarchyEntry,
  OikeioisMapEntry,
  VirtueDomainAssessment,
  JournalReference,
} from './persona'

export {
  buildMentorPersona,
  buildMentorPersonaCore,
  buildProfileContext,
  buildBeforePrompt,
  buildAfterPrompt,
  buildMorningCheckIn,
  buildEveningReflection,
  buildWeeklyPatternMirror,
} from './persona'

// ── Journal Ingestion ────────────────────────────────────────────────────────
export type {
  JournalEntry,
  JournalChunk,
  ChunkExtraction,
  IngestionResult,
} from './journal-ingestion'

export {
  PHASE_BRAIN_MAPPING,
  chunkJournalByPhase,
  buildExtractionPrompt,
  aggregateExtractions,
} from './journal-ingestion'

// ── Ring Wrapper ─────────────────────────────────────────────────────────────
export type {
  ModelTier,
  TokenUsage,
  TokenUsageSummary,
  InnerAgent,
  RingTask,
  BeforeResult,
  AfterResult,
  RingResult,
  RingSession,
} from './ring-wrapper'

export {
  MODEL_IDS,
  selectModelTier,
  PROACTIVE_MODEL_ROUTING,
  PATTERN_RECOGNITION_CONFIG,
  AUTHORITY_MODEL_ROUTING,
  JOURNAL_INGESTION_ROUTING,
  estimateCost,
  recordTokenUsage,
  summariseTokenUsage,
  registerInnerAgent,
  getInnerAgent,
  listInnerAgents,
  evaluateAuthorityPromotion,
  getSamplingRate,
  shouldCheckAction,
  findRelevantJournalPassage,
  checkPassionPatterns,
  executeBefore,
  executeAfter,
  startRingSession,
  addSessionTokenUsage,
  completeRingSession,
} from './ring-wrapper'

// ── Profile Store ────────────────────────────────────────────────────────────
export type {
  ProfileWithCache,
  InteractionType,
  RollingWindowSummary,
} from './profile-store'

export {
  PROFILE_STORE_SQL,
  HUMAN_ROLLING_WINDOW,
  cacheProfileContext,
  refreshProfileCache,
  seedProfileFromIngestion,
  loadProfile,
  loadProfileWithCache,
  recordInteraction,
  computeRollingWindow,
  updateProfileFromWindow,
  upsertPassionObservation,
} from './profile-store'

// ── Proactive Scheduler ─────────────────────────────────────────────────────
export type {
  ProactiveScheduleType,
  ProactiveSchedule,
  ProactiveResult,
  ProactivePreferences,
} from './proactive-scheduler'

export {
  DEFAULT_PREFERENCES,
  buildSchedules,
  shouldSuppressProactive,
  prepareMorningCheckIn,
  prepareEveningReflection,
  prepareWeeklyPatternMirror,
  dispatchProactive,
  buildProactiveInteractionRecord,
} from './proactive-scheduler'

// ── Pattern Engine ──────────────────────────────────────────────────────────
export type {
  InteractionRecord,
  TemporalPattern,
  PassionCluster,
  PatternAnalysis,
  RegressionWarning,
} from './pattern-engine'

export {
  shouldRunPatternAnalysis,
  analysePatterns,
  buildPatternNarrativePrompt,
} from './pattern-engine'

// ── Authority Manager ───────────────────────────────────────────────────────
export type {
  AgentActionRecord,
  AgentPerformance,
  AuthorityChangeEvent,
  AuthorityEvidence,
  SuspendedAgent,
} from './authority-manager'

export {
  AUTHORITY_THRESHOLDS,
  initAgentPerformance,
  getAgentPerformance,
  recordAgentAction,
  evaluateAuthority,
  isAgentSuspended,
  getSuspensionDetails,
  recordSuspendedAction,
  getAuthorityHistory,
  getFullAuditLog,
  getOversightConfig,
  getAuthorityDashboard,
} from './authority-manager'

// ── Sanitisation ─────────────────────────────────────────────────────────────
export type {
  SanitiseResult,
  ContentType,
} from './sanitise'

export {
  sanitise,
  sanitiseAndDelimit,
  sanitiseArray,
  detectInjection,
  hasInjectionSignatures,
  MAX_LENGTHS,
} from './sanitise'
