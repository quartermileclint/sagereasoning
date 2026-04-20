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
 *   session-bridge.ts      — Bridge between Claude Cowork sessions and the ring
 *   mentor-ledger.ts       — Cross-cutting accountability extraction (aims, commitments, realisations, questions, tensions, intentions),
 *                            resurfacing engine (scheduled + contextual), sage-path weighting,
 *                            and one-off import enrichments (maxims, emotional anchors, growth evidence, unfinished threads)
 *
 * SageReasoning Proprietary Licence
 */
/**
 * @compliance
 * compliance_version: CR-2026-Q2-v3
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

// ── Journal Interpreter (External Journals) ────────────────────────────────
export type {
  TranscribedEntry,
  InterpreterChunk,
  TranscribedJournal,
  InterpretationResult,
  FullInterpretationResult,
  CognitiveStyleProfile,
  EngagementGradient,
  EngagementEntry,
  ContradictionMap,
  ValueContradiction,
  RelationalTextureMap,
  RelationalContext,
  DevelopmentalTimeline,
  PlateauWindow,
  BreakthroughPoint,
  LanguageFingerprint,
  SituationalTriggerMap,
  PassionTrigger,
  ProductDevelopmentSignal,
  PromptSignal,
  AccessibilityGap,
  TransitionAssessment,
  ScaffoldingNeed,
  ProofOfConceptSynthesis,
} from './journal-interpreter'

export {
  EXTERNAL_SECTION_MAPPING,
  matchSection,
  chunkBySection,
  buildInterpreterPrompt,
  buildLayer2Prompt,
  buildLayer3Prompt,
  buildLayer4Prompt,
  buildLayer5Prompt,
  buildLayer6Prompt,
  buildLayer7Prompt,
  buildLayer8Prompt,
  buildTranscriptionPrompt,
  buildProfileFromExternalJournal,
  buildInterpretationResult,
  prepareInterpretation,
  buildJournalFromSections,
} from './journal-interpreter'

// ── Support Agent ───────────────────────────────────────────────────────────
export type {
  SupportChannel,
  SupportStatus,
  SupportPriority,
  InboxFrontmatter,
  InboxItem,
  ProcessingResult,
  KBArticle,
  RunLoopConfig,
  ProcessInboxItemDeps,
  ProcessInboxItemResult,
} from './support-agent'

export {
  SUPPORT_AGENT_ID,
  SUPPORT_AGENT_NAME,
  SUPPORT_AGENT_TYPE,
  RUN_LOOP_INTERVAL_MS,
  SUPPORT_DISCLAIMER,
  TOOL_REGISTRY,
  DEFAULT_RUN_LOOP_CONFIG,
  parseFrontmatter,
  serialiseFrontmatter,
  parseInboxFile,
  searchKnowledgeBase,
  detectGovernanceFlags,
  buildDraftPrompt,
  buildCrisisRedirectDraft,
  assembleInboxFile,
  formatRingReview,
  initialiseSupportAgent,
  processInboxItem,
  processInboxItemWithGuard,
  completeProcessing,
  generateDailySummary,
  buildNotification,
  buildLeadFile,
} from './support-agent'

// ── Support Distress Pre-Processor (Channel 1 — R20a, PR6 Critical) ─────────
export type {
  DistressDetectionResult,
  VulnerabilitySeverityInt,
  DistressSeverity,
  PriorDistressFlag,
  SupportDistressSignal,
  SupportSafetyGate,
  SupabaseReadClient,
  SupportDistressDeps,
} from './support-distress-preprocessor'

export {
  readPriorDistressFlags,
  deriveBaselineSeverity,
  isSuddenChange,
  preprocessSupportDistress,
  enforceSupportDistressCheck,
  createSupportSafetyGate,
} from './support-distress-preprocessor'

// ── Support History Synthesis (Channel 2 — Elevated) ───────────────────────
export type {
  OpenIssueRef,
  SupportTrend,
  SupportInteractionHistory,
} from './support-history-synthesis'

export {
  categoriseSubject,
  classifyTrend,
  synthesiseSupportHistory,
  formatHistoryContextBlock,
} from './support-history-synthesis'

// ── Sync to Supabase ────────────────────────────────────────────────────────
export type {
  SupabaseClient,
  SupportInteractionRecord,
  SupportTokenUsageRecord,
  PatternSummaryRecord,
  SyncResult,
  BatchSyncResult,
} from './sync-to-supabase'

export {
  syncInteraction,
  batchSync,
  markAsSynced,
} from './sync-to-supabase'

// ── Embedding Pipeline ──────────────────────────────────────────────────────
export type {
  EmbeddingProvider,
  EmbeddingConfig,
  MemorySource,
  EmbeddingResult,
  BatchEmbeddingResult,
} from './embedding-pipeline'

export {
  DEFAULT_EMBEDDING_CONFIG,
  generateEmbedding,
  storeMemory,
  embedAndStore,
  embedSupportInteraction,
  batchEmbed,
  searchMemory,
} from './embedding-pipeline'

// ── Send Notification ───────────────────────────────────────────────────────
export type {
  ResendConfig,
  NotificationFile,
  SendResult,
} from './send-notification'

export {
  DEFAULT_RESEND_CONFIG,
  parseNotificationFile,
  sendViaResend,
  sendNotification,
} from './send-notification'

// ── LLM Bridge (Anthropic API) ──────────────────────────────────────────────
export type {
  LLMBridgeConfig,
  LLMCallResult,
  LiveRingResult,
} from './llm-bridge'

export {
  DEFAULT_LLM_CONFIG,
  callAnthropic,
  liveBeforeCheck,
  liveAfterCheck,
  generateDraft,
  executeProactiveWithLLM,
  runLiveRingCycle,
} from './llm-bridge'

// ── Support Proactive (Scheduler + Support Context) ─────────────────────────
export type {
  SupportContext,
  SupportProactiveResult,
} from './support-proactive'

export {
  buildSupportContext,
  buildSupportAddendum,
  executeSupportProactive,
} from './support-proactive'

// ── Support Patterns (Pattern Engine + Support Data) ────────────────────────
export type {
  SupportPattern,
  SupportPatternAnalysis,
} from './support-patterns'

export {
  analyseSupportPatterns,
  syncPatternAnalysis,
  formatPatternReport,
} from './support-patterns'

// ── Session Bridge (Cowork ↔ Sage Mentor) ──────────────────────────────
export type {
  SessionMode,
  ExchangeClassification,
  DecisionDomain,
  SessionExchange,
  SessionDecisionRecord,
  LiveCompanionEvent,
  ConsultResult,
  ConsultOutcomeResult,
  BatchEvaluationResult,
  SessionBridgeConfig,
} from './session-bridge'

export {
  DEFAULT_SESSION_BRIDGE_CONFIG,
  classifyExchange,
  buildSessionExchange,
  shouldAutoActivateCompanion,
  initialiseCoworkAgent,
  captureSessionSummary,
  buildBatchEvaluationPrompt,
  parseBatchEvaluationResponse,
  prepareConsultation,
  prepareConsultOutcome,
  buildCompanionEvaluationPrompt,
  parseCompanionResponse,
  persistSessionDecisions,
  persistContextSnapshot,
  buildKnowledgeContextUpdate,
  buildOutcomeLookupQuery,
} from './session-bridge'

// ── Mentor Ledger (Cross-Cutting Accountability) ───────────────────────────
export type {
  LedgerEntryKind,
  LedgerEntryStatus,
  LedgerEntry,
  LedgerStatusChange,
  MentorLedger,
  LedgerSummary,
  RawLedgerExtraction,
  LedgerPatternData,
  ResurfacingConfig,
  ResurfacingSelection,
  PractitionerMaxim,
  EmotionalAnchor,
  GrowthEvidence,
  UnfinishedThread,
  ImportEnrichment,
} from './mentor-ledger'

export {
  LEDGER_EXTRACTION_ADDENDUM,
  IMPORT_ENRICHMENT_ADDENDUM,
  DEFAULT_RESURFACING_CONFIG,
  aggregateLedgerExtractions,
  transitionLedgerEntry,
  recordLedgerSurfacing,
  selectForMorningCheckIn,
  selectForEveningReflection,
  selectForWeeklyMirror,
  selectForScheduledReflection,
  selectForContextualResurfacing,
  computeLedgerPatterns,
} from './mentor-ledger'

// ── Reflection Generator (Scheduled + Contextual Reflections) ───────────────
export type {
  GeneratedReflection,
  ContextualReflectionRequest,
} from './reflection-generator'

export {
  buildMorningReflectionPrompt,
  buildContextualReflectionPrompt,
  buildWeeklyReflectionPrompt,
  prepareMorningReflection,
  prepareContextualReflection,
} from './reflection-generator'

// ── Private Mentor Hub Types (Frontend Data Structures) ────────────────────
export type {
  PrivateHubState,
  ProfileView,
  ConversationMessage,
  MessageBase,
  MentorMessage,
  HumanMessage,
  InsightMessage,
  JournalRefMessage,
  ConversationThread,
  ConversationContext,
  RitualPrompt,
  PatternMirrorReport,
  LayerRefinement,
  RefinementBatch,
  HubPreferences,
  HubInitConfig,
  HubSyncResult,
} from './private-hub-types'
