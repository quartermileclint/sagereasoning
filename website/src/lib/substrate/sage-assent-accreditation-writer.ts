/**
 * sage-assent-accreditation-writer.ts — the write-path into agent_accreditation.
 *
 * STATUS: Scaffolded → Wired → Verified (2026-05-16, this session). New code,
 * imported by the new POST handler at /api/accreditation/[agent_id] and
 * callable by wrapper-internal consumers. The persistence layer's three write
 * functions (upsertAccreditationRecord / appendGradeHistory /
 * appendInitialGradeHistory in sage-assent-accreditation-store.ts) have existed and
 * been Verified since 2026-05-15 but were called by nothing. This module is
 * the seam that finally invokes them.
 *
 * GOVERNING DOCUMENTS:
 *   - /adopted/sage-assent-write-path-design.md — the authoritative spec. Seven design
 *     decisions A–G locked under D-ATL-WRITE-PATH-DESIGN-LOCKED-2026-05-16.
 *     This module implements Decisions A + B + D + E + F + G (the library
 *     half). Decision A's route half + Decision C's auth gate live in
 *     /website/src/app/api/accreditation/[agent_id]/route.ts.
 *   - /operations/decision-log.md — D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-
 *     2026-05-16 (this build; the seven Critical Change Protocol responses
 *     and the five Step 1 elections recorded there).
 *   - /manifest.md §R0 (the audit trail) / §R4 (IP boundary preserved — only
 *     R4-compliant fields cross) / §R17 (auth gate is the route's primary
 *     engagement; the library itself has no auth surface) / §R18 a–c (the
 *     credential's persistence + the additive route) / §AC7 (engaged at the
 *     route — new auth surface; full Critical Change Protocol) / §AC8
 *     (translation-sandwich substrate consumer) / §KG1 (Vercel five-rule
 *     constraint) / §KG7 (JSONB storage format).
 *
 * WHAT THIS MODULE IS
 *
 * Two entry points the wrapper consumer chooses between (Decision D):
 *
 *   - seedAccreditation(profile)
 *       First-write for a new agent. Calls upsertAccreditationRecord (which
 *       inserts on first call; subsequent calls would be a no-op-or-update
 *       per Decision F's idempotent posture) then appendInitialGradeHistory
 *       (which writes the 'initial_grade' audit row).
 *
 *   - updateAccreditation(profile, transitionResult)
 *       Subsequent writes after the wrapper consumer has run computeTrajectory.
 *       Calls upsertAccreditationRecord (with transitionResult.record — the
 *       post-transition credential), then — only if transitionResult.grade_-
 *       changed === true AND transitionResult.trigger !== null — appends a
 *       GradeChangeEvent row to grade_history. The GradeChangeEvent is built
 *       inline from transitionResult.trigger + proximityToAuthority for the
 *       authority levels (per Decision D's discretion clause; matches
 *       buildGradeChangeEvent's output shape without requiring a synthesised
 *       previousRecord with fields the trigger doesn't carry).
 *
 * BOTH FUNCTIONS:
 *   - Two awaited writes; not transactional (Decision E). Upsert first, then
 *     history append. A failure between them leaves state ahead of history;
 *     the state remains correct, the audit trail is one entry behind. The
 *     error propagates to the caller (KG1 rule 2).
 *   - Idempotent (Decision F). The agent_accreditation primary key + the
 *     persistence layer's onConflict: 'agent_id' discipline handle duplicate
 *     state writes correctly. Duplicate grade_history appends produce visible
 *     rows (no uniqueness constraint) — by design.
 *   - Structured-logging discipline (Decision G). One JSON event per call
 *     (success or failure) to console.log; Vercel logs captures it.
 *
 * TESTABILITY SEAM
 *
 * Both functions accept an optional `deps` parameter defaulting to the real
 * persistence-layer functions + a console.log-backed logger. The default
 * preserves the design spec's public signature; tests substitute mocks to
 * exercise SEED / UPDATE branches, atomicity behaviour, idempotency, and log
 * event emission without invoking a real Supabase write. The default-deps
 * pattern keeps the test file Supabase-free at the assertion level (the
 * --env-file=.env.local requirement still applies because the module's
 * top-level imports transitively load supabase-server.ts; the client is
 * constructed but never CALLED by the test).
 *
 * COMPLIANCE
 *   - R0 (audit trail): seedAccreditation's appendInitialGradeHistory + update-
 *     Accreditation's conditional appendGradeHistory together produce the
 *     canonical audit trail. The hybrid trigger (Decision B) keeps the trail
 *     populated automatically based on transitionResult inputs — consumer
 *     discipline does not gate audit fidelity.
 *   - R4 (IP boundary): the writer's inputs (CarriedProfile + TransitionResult)
 *     and outputs (Promise<void>) carry only R4-compliant fields. The grade
 *     engine's thresholds (UPGRADE_THRESHOLDS / DOWNGRADE_THRESHOLDS) stay
 *     module-private inside the ported grade-transition-engine.ts.
 *   - R17 (auth): the library itself has no auth surface — that is the route's
 *     responsibility. Wrapper-internal consumers of this library are trusted
 *     by virtue of being in-process callers.
 *   - R18 a–c: the credential persisted is the Character Kernel credential
 *     (R18a category language preserved); the public read endpoint (GET) is
 *     unaffected by this write surface (R18c additive — coexists with GET).
 *   - AC7: this module has no auth surface; AC7 engages at the route. The
 *     full Critical Change Protocol applies at the build session as a whole.
 *   - AC8: this module sits in /website/src/lib/substrate/ and persists the
 *     output of the Sage Assent Wrapper, which consumes the translation-sandwich
 *     substrate.
 *   - KG1 (Vercel five-rule constraint) — postures:
 *       1. No self-calls — the library makes no endpoint-to-endpoint calls;
 *          it talks only to the persistence layer (which talks to Supabase).
 *       2. Await all DB writes — every persistence-layer call is awaited; an
 *          error throws and propagates per the persistence layer's existing
 *          discipline. No Promise.all; no fire-and-forget; no try/catch
 *          swallowing.
 *       3. Headers strip on redirects — N/A; no redirects.
 *       4. Execution terminates after response — both async functions are
 *          awaited by the route (or by a wrapper consumer); no background
 *          work scheduled after the function returns.
 *       5. process.cwd() — N/A; no file-based loaders.
 *   - KG7 (JSONB storage format): the writer passes the AccreditationRecord
 *     straight through to upsertAccreditationRecord, which contains the
 *     KG7-compliant array passthrough discipline. No JSON.stringify here.
 *   - PR1 — single-build proof: the library + route + tests land in one
 *     session per the design's expected pattern.
 *   - PR2 — build-to-wire verification immediate: the test file (__tests__/
 *     sage-assent-accreditation-writer.test.ts) invokes both public functions with
 *     mock deps, asserting the invocation order, log emission, error
 *     propagation, and grade-changed branch.
 *   - PR4 — model selection: N/A (no LLM call).
 *   - PR6 — safety-critical: NOT engaged. The writer does not touch the R20a
 *     distress classifier, Zone 2 / Zone 3 logic, or their wrappers.
 *   - PR7 — deferred items named in the design doc: A10 per-agent credentials
 *     (auth seam); token-format ADR; AC10 provenance fields; webhook
 *     emission; OpenTelemetry; single Supabase RPC for transactional
 *     atomicity; client-provided idempotency key + grade_history uniqueness.
 *   - PR10 — Plan → Execute → Verify: this session's Critical Change Protocol
 *     responses are the Plan step; this file (+ the route + tests) is the
 *     Execute step; tsc clean + the founder's local + post-deploy URL check
 *     are the Verify step.
 *   - PR15 — Anthropic-native posture: mcp-builder is a forward pointer for
 *     R18c (the write surface could later also be exposed as an MCP tool),
 *     but the spec's named surface is the Next.js route. Bespoke election
 *     justified.
 */

import {
  upsertAccreditationRecord,
  appendGradeHistory,
  appendInitialGradeHistory,
} from './sage-assent-accreditation-store'

import { proximityToAuthority } from './trust-layer/accreditation/accreditation-record'

import type { CarriedProfile } from './sage-assent-wrapper'
import type { TransitionResult } from './trust-layer/grade-engine/grade-transition-engine'
import type { GradeChangeEvent } from './trust-layer/types/accreditation'

// ============================================================================
// STRUCTURED-LOGGING EVENT (Decision G)
// ============================================================================

/**
 * The single structured-logging event shape (Decision G of the write-path
 * design). One emission per write-path call — on success after both awaited
 * writes succeed, or on failure inside the catch site before the error
 * re-throws.
 *
 * Field set per the design's "Structural constraint" block:
 *   - kind, call_type, agent_id, actions_evaluated, senecan_grade,
 *     direction_of_travel, elapsed_ms, outcome are always present.
 *   - error_message is present iff outcome === 'error'.
 *   - grade_changed, previous_grade, new_grade, trigger_reason are present
 *     iff call_type === 'update' (they describe the transition; not
 *     meaningful for seed).
 */
export interface SageAssentWriteEvent {
  readonly kind: 'sage_assent_write'
  readonly call_type: 'seed' | 'update'
  readonly agent_id: string
  readonly actions_evaluated: number
  readonly senecan_grade: string
  readonly direction_of_travel: string
  readonly elapsed_ms: number
  readonly outcome: 'ok' | 'error'
  readonly error_message?: string
  readonly grade_changed?: boolean
  readonly previous_grade?: string | null
  readonly new_grade?: string | null
  readonly trigger_reason?: string | null
}

/**
 * The single logging helper called at success + failure sites inside
 * seedAccreditation + updateAccreditation. Emits one JSON line per call;
 * Vercel logs captures it. The format is grep-friendly: every line that
 * matches `"kind":"sage_assent_write"` is a write-path event.
 *
 * Module-internal default — tests substitute via the deps parameter.
 */
function defaultLogger(event: SageAssentWriteEvent): void {
  console.log(JSON.stringify(event))
}

// ============================================================================
// TESTABILITY SEAM — dependency-injection types
// ============================================================================

/**
 * The persistence-layer functions + logger the writer's executors invoke.
 *
 * Production callers omit `deps` and the default-deps object (DEFAULT_DEPS)
 * binds to the real persistence layer + console.log-backed logger. Tests
 * substitute a mock deps object to capture invocation order, simulate
 * Supabase failures, and assert log-event field sets without invoking a real
 * write.
 */
export interface AccreditationWriterDeps {
  readonly upsertAccreditationRecord: (
    record: Parameters<typeof upsertAccreditationRecord>[0],
    opts?: Parameters<typeof upsertAccreditationRecord>[1],
  ) => Promise<void>
  readonly appendGradeHistory: (
    event: Parameters<typeof appendGradeHistory>[0],
    opts?: Parameters<typeof appendGradeHistory>[1],
  ) => Promise<void>
  readonly appendInitialGradeHistory: (
    record: Parameters<typeof appendInitialGradeHistory>[0],
    opts?: Parameters<typeof appendInitialGradeHistory>[1],
  ) => Promise<void>
  readonly logger: (event: SageAssentWriteEvent) => void
}

const DEFAULT_DEPS: AccreditationWriterDeps = {
  upsertAccreditationRecord,
  appendGradeHistory,
  appendInitialGradeHistory,
  logger: defaultLogger,
}

/**
 * Per-write extras supplied by the route at call time — NOT part of the agent's
 * profile or record. Currently the A10 loop_id forensic trace (Decision 2 of
 * the A10 rewrite): the X-Loop-Id the wrapper supplies on the write-path POST,
 * persisted on agent_accreditation.loop_id for JOIN traceability against
 * loop_billing_events. A10 does NOT write loop_billing_events itself. Optional;
 * defaults to {} (loop_id NULL). Added 2026-05-21 under
 * D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21.
 */
export interface AccreditationWriteExtras {
  readonly loop_id?: string | null
  /** K1 coverage fields (CI-11, 2026-06-13) — server-composed by the caller
   *  via composeK1InitialCoverage (trust-layer/accreditation/coverage-status.ts)
   *  and passed straight through to the store's write-time options. NEVER
   *  taken from the consumer's record. Omitted → NULL columns (legacy shape). */
  readonly coverage_status?: import('./trust-layer/types/accreditation').CoverageStatus | null
  readonly monitored_since?: string | null
  readonly credential_basis?: string | null
  /** Examination mode (Gate-1 surface honesty, Arc 1, 2026-06-20) — server-
   *  composed by the caller via composeK1InitialCoverage's harness_enforced path
   *  and passed straight to the store options. NEVER from the consumer's record.
   *  Omitted → NULL. Whether the column is actually WRITTEN is gated at the store
   *  chokepoint (upsertAccreditationRecord) by SUBSTRATE_EXAMINATION_MODE_ENABLED —
   *  so forwarding it here is byte-identity-safe (flag-off the store drops it). */
  readonly examination_mode?: import('./trust-layer/types/accreditation').ExaminationMode | null
}

// ============================================================================
// PUBLIC API — seedAccreditation + updateAccreditation (Decision D)
// ============================================================================

/**
 * First-write the agent's accreditation row + the 'initial_grade' audit entry.
 *
 * Decision B (hybrid trigger): explicit call by the consumer (seed semantics)
 * with automatic appendInitialGradeHistory inside the same call's flow.
 *
 * Decision D (two-entry-point separation): seedAccreditation is for the
 * first-write case; the row does not yet exist. Subsequent writes go through
 * updateAccreditation.
 *
 * Decision E (two awaited writes; not transactional): upsert first, then
 * history append. A failure between them leaves the state row written but
 * the initial_grade row missing — the state is correct; the audit trail is
 * one entry behind. The error propagates to the caller.
 *
 * Decision F (idempotent upsert): re-calling seedAccreditation with the
 * same profile produces a successful no-op-or-update against agent_accreditation
 * (the persistence layer's onConflict: 'agent_id' handles this) plus a
 * duplicate initial_grade row in grade_history (no uniqueness constraint;
 * visible in logs).
 *
 * Decision G (structured logging): one JSON event emitted per call on
 * success (outcome: 'ok') or failure (outcome: 'error').
 *
 * @param profile  The fresh CarriedProfile from createCarriedProfile.
 * @param deps     Optional dependency-injection seam — production callers
 *                 omit this. Default: real persistence layer + console.log
 *                 logger. Tests pass mocks.
 *
 * @throws if either persistence-layer call throws (KG1 rule 2).
 */
export async function seedAccreditation(
  profile: CarriedProfile,
  deps: AccreditationWriterDeps = DEFAULT_DEPS,
  extras: AccreditationWriteExtras = {},
): Promise<void> {
  const startTime = Date.now()
  const record = profile.accreditation_record

  try {
    await deps.upsertAccreditationRecord(record, {
      regressing_check_count: profile.regressing_check_count,
      loop_id: extras.loop_id ?? null,
      coverage_status: extras.coverage_status ?? null,
      monitored_since: extras.monitored_since ?? null,
      credential_basis: extras.credential_basis ?? null,
      // Gate-1 Arc 1 — forward the server-composed examination_mode so the harness
      // path actually persists (the store chokepoint gates whether the column is
      // written; byte-identity-safe flag-off). Without this the field would be
      // silently dropped between route and store (the adversarial-review HIGH find).
      examination_mode: extras.examination_mode ?? null,
    })
    await deps.appendInitialGradeHistory(record)

    deps.logger({
      kind: 'sage_assent_write',
      call_type: 'seed',
      agent_id: profile.agent_id,
      actions_evaluated: record.actions_evaluated,
      senecan_grade: record.senecan_grade,
      direction_of_travel: record.direction_of_travel,
      elapsed_ms: Date.now() - startTime,
      outcome: 'ok',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    deps.logger({
      kind: 'sage_assent_write',
      call_type: 'seed',
      agent_id: profile.agent_id,
      actions_evaluated: record.actions_evaluated,
      senecan_grade: record.senecan_grade,
      direction_of_travel: record.direction_of_travel,
      elapsed_ms: Date.now() - startTime,
      outcome: 'error',
      error_message: message,
    })
    throw err
  }
}

/**
 * Update the agent's accreditation row + (conditionally) append a
 * grade-change audit entry.
 *
 * Decision B (hybrid trigger): explicit call by the consumer (update
 * semantics) with conditional automatic appendGradeHistory inside the same
 * call's flow — fired iff transitionResult.grade_changed === true AND
 * transitionResult.trigger !== null.
 *
 * Decision D (two-entry-point separation): updateAccreditation is for the
 * row-exists case. Subsequent writes after a wrapper consumer has run
 * computeTrajectory go here.
 *
 * Decision E (two awaited writes; not transactional): upsert first, then
 * (conditionally) history append. A failure between them leaves the state
 * row written but the history append missing. Same atomicity posture as
 * seed.
 *
 * Decision F (idempotent upsert): re-calling updateAccreditation with the
 * same (profile, transitionResult) tuple is a no-op-or-update against
 * agent_accreditation. If grade_changed was true, the re-call would append
 * a duplicate grade_upgrade/grade_downgrade row to grade_history.
 *
 * Decision G (structured logging): one JSON event with grade_changed,
 * previous_grade, new_grade, trigger_reason fields filled iff the transition
 * fired.
 *
 * GradeChangeEvent construction is inline (Decision D's discretion clause).
 * The trigger carries from_grade + to_grade + from_proximity + to_proximity;
 * the authority levels are derived via proximityToAuthority. The event
 * timestamp is stamped now (matches buildGradeChangeEvent's behaviour). The
 * trigger_action_count is transitionResult.record.actions_evaluated — the
 * count at the time of the transition.
 *
 * @param profile           The CarriedProfile (post-transition advanced
 *                          profile from computeTrajectory). profile.agent_id
 *                          is the authority on the wrapped agent's identity.
 * @param transitionResult  The TransitionResult from evaluateGradeTransition.
 *                          transitionResult.record is the post-transition
 *                          credential (the upsert subject).
 * @param deps              Optional dependency-injection seam — production
 *                          callers omit this. Default: real persistence
 *                          layer + console.log logger.
 *
 * @throws if either persistence-layer call throws (KG1 rule 2).
 */
export async function updateAccreditation(
  profile: CarriedProfile,
  transitionResult: TransitionResult,
  deps: AccreditationWriterDeps = DEFAULT_DEPS,
  extras: AccreditationWriteExtras = {},
): Promise<void> {
  const startTime = Date.now()
  const record = transitionResult.record

  try {
    await deps.upsertAccreditationRecord(record, {
      regressing_check_count: profile.regressing_check_count,
      loop_id: extras.loop_id ?? null,
      coverage_status: extras.coverage_status ?? null,
      monitored_since: extras.monitored_since ?? null,
      credential_basis: extras.credential_basis ?? null,
      // Gate-1 Arc 1 — forward examination_mode (see seedAccreditation note). The
      // store chokepoint gates the column write; byte-identity-safe flag-off.
      examination_mode: extras.examination_mode ?? null,
    })

    if (transitionResult.grade_changed && transitionResult.trigger !== null) {
      const event: GradeChangeEvent = {
        event_type:
          transitionResult.trigger.type === 'upgrade'
            ? 'grade_upgrade'
            : 'grade_downgrade',
        agent_id: profile.agent_id,
        previous_grade: transitionResult.trigger.from_grade,
        new_grade: transitionResult.trigger.to_grade,
        previous_proximity: transitionResult.trigger.from_proximity,
        new_proximity: transitionResult.trigger.to_proximity,
        previous_authority: proximityToAuthority(
          transitionResult.trigger.from_proximity,
        ),
        new_authority: proximityToAuthority(
          transitionResult.trigger.to_proximity,
        ),
        trigger_action_count: record.actions_evaluated,
        timestamp: new Date().toISOString(),
      }
      await deps.appendGradeHistory(event)
    }

    deps.logger({
      kind: 'sage_assent_write',
      call_type: 'update',
      agent_id: profile.agent_id,
      actions_evaluated: record.actions_evaluated,
      senecan_grade: record.senecan_grade,
      direction_of_travel: record.direction_of_travel,
      elapsed_ms: Date.now() - startTime,
      outcome: 'ok',
      grade_changed: transitionResult.grade_changed,
      previous_grade: transitionResult.trigger?.from_grade ?? null,
      new_grade: transitionResult.trigger?.to_grade ?? null,
      trigger_reason: transitionResult.trigger?.type ?? null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    deps.logger({
      kind: 'sage_assent_write',
      call_type: 'update',
      agent_id: profile.agent_id,
      actions_evaluated: record.actions_evaluated,
      senecan_grade: record.senecan_grade,
      direction_of_travel: record.direction_of_travel,
      elapsed_ms: Date.now() - startTime,
      outcome: 'error',
      error_message: message,
      grade_changed: transitionResult.grade_changed,
      previous_grade: transitionResult.trigger?.from_grade ?? null,
      new_grade: transitionResult.trigger?.to_grade ?? null,
      trigger_reason: transitionResult.trigger?.type ?? null,
    })
    throw err
  }
}
