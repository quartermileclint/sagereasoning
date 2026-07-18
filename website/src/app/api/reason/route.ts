import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateApiKey, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { type ReasonDepth, EVALUATIVE_DISCLAIMER } from '@/lib/sage-reason-engine'
import { getPractitionerContext } from '@/lib/context/practitioner-context'
import { getProjectContext } from '@/lib/context/project-context'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import { enforceDistressCheck } from '@/lib/constraints'
import { type RetrieveResult } from '@/lib/rag'
import { loadLayer1WithFallback } from '@/lib/rag/load-layer1-with-fallback'
// M1-CP6 cutover (2026-05-08): translation-sandwich is the sole user-facing
// path. runSandwich sits AFTER the R20a perimeter (line 173 below). Per
// design choice 2A (parallel-run retired), bundled engine is no longer
// called from this route. Per ADR-004 §6 + §10 CP6 + AC4 + AC5 + AC8 + PR1 + PR6.
import { runSandwich } from '@/lib/translation-sandwich/parallel-run'
// Stage 1 A2 (D-A2-INPUT-VALIDATION-SURFACE-2026-05-10): plugin-authenticated
// callers submit a pre-computed Layer1Schema (the plugin ran Layer 1 locally
// per the substrate ADR §"The three layers"). The route validates the schema
// via validateLayer1Schema before passing through to runSandwich, which
// skips server-side extractFeatures when preExtractedLayer1Schema is present.
import {
  validateLayer1Schema,
  Layer1ValidationError,
  type Layer1Schema,
} from '@/lib/translation-sandwich/layer1-extractor'
// M1-CP4e (2026-05-06) + M1-CP6 (2026-05-08): AC-13 Tier 1 force-clarification
// continuation-token mechanic. validateContinuationToken handles second-turn
// re-submission; issueContinuationToken (M1-CP6 design choice 3A) handles
// first-turn issuance when the sandwich emits a Tier 1 trigger. Token is a
// stateless HMAC signature — AC7 NOT engaged. Per ADR-008 §4 + AC4 + AC5 + PR6.
import {
  validateContinuationToken,
  issueContinuationToken,
  Tier1SecretMissingError,
  // Mechanism-correction Part A (ADR-008 §A, 2026-06-18): the clarification-
  // continuation fix — flag-gated; byte-identical when SUBSTRATE_TIER1_CONTINUATION_ENABLED
  // is unset. isTier1ContinuationEnabled gates the whole contract;
  // composeContinuationDistressText keeps the answer under the R20a perimeter (AC5);
  // composeClarificationContext folds the answer into the Layer-1 extraction context.
  isTier1ContinuationEnabled,
  composeContinuationDistressText,
  composeClarificationContext,
} from '@/lib/translation-sandwich/tier1-token'
// S4 (D-R20A-OPTIONA-S4-AUDIENCE-RENDERING-WIRED-2026-05-28): R20a audience-
// correct rendering for the two redirect branches below. Per
// /drafts/2026-05-28-r20a-single-catch-contract.md §3.4 — closes the Finding 2
// gap where /api/reason emits a human-framed crisis pass-through over the
// agent API path. Gated behind SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED
// (default OFF; UNSET in Vercel at S4 close); when OFF, /api/reason is
// byte-identical to pre-S4 behaviour regardless of caller type.
import {
  renderR20aRedirectResponse,
  isR20aAudienceRenderingEnabled,
  type R20aAudience,
} from '@/lib/substrate/r20a-audience-renderer'
// A10 Critical implementation (2026-06-03, staging-plan session 12): per-install
// plugin-auth credentials (Surface 1 of the Token-Format ADR
// /adopted/adr/2026-06-03-a10-token-format.md). validatePluginInstallToken does
// the hash → api_keys lookup with the is_active=true universal revocation check;
// extractPluginInstallToken pulls the sr_inst_ token from an Authorization:
// Bearer header. Gated by PLUGIN_INSTALL_AUTH_ENABLED (UNSET in production →
// this path is inert and /api/reason is byte-identical to today). AC7 ENGAGED
// at the invocation site; PR6 ENGAGED; PR1 single-endpoint proof (this route).
import {
  validatePluginInstallToken,
  extractPluginInstallToken,
  type PluginInstallValidationResult,
} from '@/lib/plugin-install-auth'
import { isUpcCapabilityAuthEnabled, l1SupplyRefused } from '@/lib/practice-credential'
// Option D billing (per D-BILLING-MODEL-LOCKED-2026-05-17 + build session 2026-05-MM).
// Metering wraps every API-key-authenticated request: a loop_id is extracted
// from X-Loop-Id (or server-generated); per-layer Anthropic cost is read from
// SandwichRunResult's microcents fields; finalizeLoopResponse persists the
// loop_billing_events row and emits the six X-Loop-* response headers.
// User-auth (Supabase JWT) + plugin-auth callers are NOT metered — they aren't
// commercial customers; the api_keys row that Option D bills against doesn't
// exist for them. Step 1(e) hard-error posture: a duplicate (api_key_id,
// loop_id) returns HTTP 400 with loop_id_already_billed.
import {
  createLoopAccumulator,
  extractLoopId,
  generateLoopId,
  finalizeLoopResponse,
  buildLoopHeaders,
  type LoopAccumulator,
} from '@/lib/loop-cost-tracker'

// A12 (2026-06-03): OpenTelemetry instrumentation + call-grain audit. Both are
// flag-gated behind SUBSTRATE_OTEL_ENABLED (unset in production → strict no-op).
import { withSubstrateRootSpan } from '@/lib/substrate/substrate-telemetry'
import {
  recordSubstrateAuditEvent,
  type SeverityBand,
} from '@/lib/substrate/substrate-audit-writer'

// M1 CI-1 + CI-17 (2026-06-12, D-MECHANISM-CORRECTION-BUILD-PLAN-APPROVED-2026-06-12):
// Layer-3 prose deferral (response_format: 'assessment_first') + server-side
// narrative retention with the existence guarantee. Gated by
// SUBSTRATE_L3_DEFER_ENABLED (UNSET in production → response_format is ignored,
// no retention writes, byte-identical behaviour). waitUntil (@vercel/functions —
// the documented post-response mechanism for Next 14 on Vercel's Node runtime)
// carries deferred generation; it is best-effort (cancelled on timeout, lost on
// crash), so the /api/cron/narrative-sweep route is the CI-17 guarantee
// backstop. The pending retention row is written AWAITED before the response
// (KG1 rule 2); if that write fails, deferral is withdrawn and generation runs
// inline — the guarantee never rides on a write that didn't land.
// Election 5 (Critical guard): the structural distress guard lives in the
// orchestrator (shouldDeferProse — a truthy mild-severity distress_signal
// forces today's inline synchronous path). The R20a perimeter at the gate
// below, the A7 gate, the A5 wrapper, and the classifier are all UNTOUCHED.
import { waitUntil } from '@vercel/functions'
import {
  isL3DeferEnabled,
  insertPendingNarrative,
  insertRetainedNarrative,
  completeNarrative,
  generateNarrativeForAssessment,
  type RetainableAssessment,
} from '@/lib/substrate/narrative-retention'
import type { Layer3Prose } from '@/lib/translation-sandwich/layer3-prose'
// Mechanism-correction M5 (CI-4 reason-route half, 2026-06-13): the
// re-examination affordance. Flag-gated by SUBSTRATE_REASON_LOOP_CLOSURE_ENABLED;
// when off, prior_feedback is ignored and no markers / examination_open emit
// (byte-identical). Companion to the M3 write-boundary gate (loop-closure-gate.ts).
import {
  isReasonLoopClosureEnabled,
  parsePriorFeedback,
  buildExaminationMarkers,
  composeReExaminationContext,
  type ExaminationMarkers,
} from '@/lib/translation-sandwich/reason-loop-closure'
// Mechanism-correction M5 (CI-13, 2026-06-13): the reflect-at-close practice
// hint. Flag-gated by SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED; absent when off
// (byte-identical). Points at the existing /api/practice/reflect (full Q1–Q6).
import {
  isPracticeCycleHintEnabled,
  PRACTICE_CYCLE_HINT,
} from '@/lib/practice-cycle-hint'
// Mechanism-correction M6 (CI-5 schema + write half, 2026-06-14): per-consult
// agent trajectory persistence. Flag-gated by SUBSTRATE_TRAJECTORY_WRITE_ENABLED;
// when unset the whole write block (incl. the credential-context lookup) is
// skipped — byte-identical, zero new DB reads. WRITE-ONLY this half: the engine
// does NOT read these rows back (determinism untouched); M7 wires the windowed
// read. The row is projected via the canonical Layer2Assessment→EvaluatedAction
// bridge (PR15 reuse) and keyed to the consulting credential.
import {
  isTrajectoryWriteEnabled,
  persistAssessmentHistory,
  resolveCredentialContext,
  // Mechanism-correction M7 (CI-5 read half, 2026-06-14): the windowed read.
  // Flag-gated by SUBSTRATE_TRAJECTORY_READ_ENABLED (separate from the M6 write
  // flag — read activates only after write has accumulated data). UNSET → no
  // read, no overlay (byte-identical). The engine is NOT modified (read-and-
  // overlay): the deterministic assessment is untouched; the trajectory is
  // surfaced as an honest response overlay only.
  isTrajectoryReadEnabled,
  getTrajectoryWindow,
  // AE-1 (ADR-014 §3.1, 2026-07-18): the practice-delta projection. Flag-gated
  // by SUBSTRATE_TRAJECTORY_DELTA_ENABLED; UNSET → no delta block, no
  // layer1_source write stamp, no extra select column (byte-identical). The
  // delta consumes the SAME M7 window (no second windowed query — KG1).
  isTrajectoryDeltaEnabled,
} from '@/lib/substrate/agent-assessment-history-store'
import {
  computeTrajectoryOverlay,
  type TrajectoryOverlay,
} from '@/lib/substrate/trajectory-overlay'
import { computeTrajectoryDelta } from '@/lib/substrate/trajectory-delta'
import { resolveLongitudinalIdentity } from '@/lib/substrate/longitudinal-identity'
import { mapLayer2AssessmentToEvaluatedAction } from '@/lib/substrate/sage-assent-bridge'
import { isAcceptedAgentId } from '@/lib/substrate/trust-layer/accreditation/agent-id-vocabulary'

// =============================================================================
// sage-reason — The Universal Reasoning Layer
//
// POST /api/reason
//
// Outcome: Run the Stoic core triad (or more) against any decision input.
//          Returns structured reasoning evaluation at the requested depth.
// Cost + Speed: 1 API call. ~2-4s depending on depth.
// Chains To: Any sage skill (as internal engine), any sage wrapper (as checkpoint).
//
// Depth parameter controls which mechanisms are applied:
//   quick    (3 mechanisms): Control Filter + Passion Diagnosis + Oikeiosis
//   standard (5 mechanisms): + Value Assessment + Appropriate Action
//   deep     (6 mechanisms): + Iterative Refinement
//
// The core triad (Control Filter + Passion Diagnosis + Oikeiosis) appears in
// 67% of all compliant original sage skills. sage-reason extracts this shared
// foundation so that skills become thin context templates on top of it.
//
// R3:  Disclaimer included in every response.
// R4:  System prompt is server-side only.
// R6a: Derived from V3 data files, not patched V1 structures.
// R6b: No independent virtue weights — unified assessment only.
// R6c: Qualitative proximity levels, not numeric 0-100.
// R6d: Passions are diagnostic (identifying false judgements), not punitive.
// R7:  All content traces to primary sources.
// R8a: API responses use Greek identifiers.
//
// -----------------------------------------------------------------------------
// CONTEXT LAYERS WIRED HERE (three-layer architecture):
//   Layer 1 (Stoic Brain):        Loaded via D6 + D7 RAG retrieval per Sub-session
//                                 E1 (Pattern A2). Passages are passed to the
//                                 engine as structured `retrievedPassages` (not
//                                 a pre-composed string). The engine builds the
//                                 system block from the passages.
//                                 If retrieval fails, falls back to the
//                                 compiled-string path via getStoicBrainContext(depth).
//   Layer 2 (Practitioner Context): Loaded only if auth.user.id is present
//                                 (authenticated session). Personalises reasoning
//                                 to this user's passions / virtues / proximity.
//                                 Set to null for API-key callers (agents).
//   Layer 3 (Project Context):    Always loaded at 'condensed' level. Adds
//                                 SageReasoning's current phase + recent decisions
//                                 so reasoning is situated, not abstract.
//   All three are loaded in parallel (Promise.all) to avoid sequential latency.
//
// WHY THIS SHAPE:
//   Context is loaded IN the route and passed AS PARAMS to runSageReason.
//   The engine injects into the correct slot of the system/user message — the
//   route never touches the prompt directly. This keeps context injection
//   logic in one place (the engine) while letting each endpoint choose which
//   layers and levels make sense for its audience.
//
// SUB-SESSION E1 (2026-05-04 — D6/D7 wired into Layer 1, Pattern A2):
//   - Per-request `Map<string, RetrieveResult>` cache declared inside POST
//     handler (KG1 rule 4 — never module-level).
//   - Retrieval failure (RetrievalUnavailableError, EmbeddingFailureError,
//     RetrievalTimeoutError, or any thrown error) falls back to the compiled
//     stoic-brain-loader path. Logged via console.warn for Phase-2 observation.
//   - See: /adopted/adr/2026-05-04-d6-d7-consumer-wiring.md (ADR-001)
//   - See: /operations/decision-log.md D-INTERNAL-RETRIEVE-ROUTE-VERIFIED-2026-05-04
//
// SUB-SESSION E3 (2026-05-04 — Pattern S2 + S3 helper-lift):
//   - loadLayer1WithFallback now imported from /lib/rag/load-layer1-with-fallback
//     (was a route-local function; lifted alongside the helpers in E3 because
//     three+ consumers now share the same wrapper).
//   - Mechanism-mapping helpers now imported from /lib/rag/helpers (was
//     ./helpers; the route-local file is removed in E3 since no other route
//     depends on it after the lift).
//   - Behaviour unchanged — pure relocation. No regression risk; harness re-run
//     proves Phases A/B/C still pass.
//   - See: /operations/decision-log.md D-CONSUMER-WIRING-LIFT-2026-05-04
//
// WHAT BREAKS IF CONTEXT LOADING CHANGES:
//   - If getProjectContext fails and returns a thrown error, the endpoint
//     returns a 500 for all users. Acceptable at single-user traffic; at scale
//     this should be wrapped in a try/catch with null fallback.
//   - If practitionerContext returns undefined (not null), the engine's
//     `if (params.practitionerContext)` check still works, but explicit null
//     is the documented contract.
//   - If project-context.json is missing at build time, the loader throws at
//     import — this endpoint (and all L3 endpoints) fail to start. Caught by
//     Vercel build — deploy would fail cleanly, not silently.
//   - If D6/D7 retrieval throws, the route falls back to the compiled string
//     path; the user sees a successful response (with the old Layer 1 content)
//     instead of a 500. Failure is logged.
//
// DESIGN DECISIONS DOCUMENTED IN:
//   - operations/handoffs/session-7d-layer1-layer2.md   (L1/L2 origin)
//   - operations/handoffs/session-7e-layer3-direct-endpoints.md  (L3 design)
//   - operations/session-handoffs/2026-04-15-layer3-wiring.md   (L3 wired here)
//   - operations/handoffs/founder/2026-05-04-sub-session-D-close.md (PR1 substrate)
//   - operations/handoffs/founder/2026-05-XX-sub-session-E1-NEXT-SESSION-PROMPT.md (this wiring)
// =============================================================================

const VALID_DEPTHS: ReasonDepth[] = ['quick', 'standard', 'deep']

// =============================================================================
// A1 — Stage 1 Layer 2 plugin-auth scaffolding (PR1 single-endpoint proof)
// =============================================================================
//
// Status: Verified (2026-05-10). Scaffolded 2026-05-10 behind feature flag
// set to off; invocation site added 2026-05-10 under Option (a) (extend the
// existing 401 branch); flag flipped + three verification scenarios passed
// 2026-05-10.
// Per: /adopted/substrate-plugin-staging-plan.md Stage 1 item A1
//      /adopted/ADR-stoic-agent-substrate-concept.md (Decision §"The three layers")
//      D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10 (scaffold predecessor)
//      D-A1-INVOCATION-SITE-2026-05-10 (this invocation-site change)
//      D-A1-FLAG-FLIP-VERIFIED-2026-05-10 (companion deploy + flag-flip entry)
//
// This is the first execution-session work of the substrate-as-plugin build
// arc. /api/reason is the PR1 single-endpoint proof target — chosen because it
// is already on the translation-sandwich substrate per M1-CP6 (2026-05-08) and
// the existing dual-auth pattern (user-auth + API-key) is canonical here per
// KG4. The dual-auth pattern is now extended with a third path (plugin-auth);
// the third path is gated by PLUGIN_AUTH_ENABLED at runtime, so when the flag
// is off, the route's auth behaviour is byte-identical to pre-invocation.
//
// Critical Change Protocol (project instructions §0c-ii) governs every change
// to this scaffold and its invocation site. PR6 applies (auth surface). AC7
// applies (auth-surface change). AC4 applies (invocation testing for safety
// functions — verified post-deploy via the three Step-5 verification scenarios
// recorded in D-A1-FLAG-FLIP-VERIFIED-2026-05-10).
//
// PR1 single-endpoint proof: /api/reason is the proof endpoint. No other route
// file is touched by this invocation-site change. Roll-out to additional
// endpoints (and any refactor into a unified pre-handler middleware per
// Option (c)) is deferred to dedicated post-A2 sessions per the staging plan.
//
// Build-arc no-current-users governing note: only founder + test logins exist
// during the build arc; the Critical Change Protocol's "What happens to
// existing sessions?" step is moot for this scaffold and any subsequent
// flag-flip during the build arc. See /adopted/build-sessions-protocol-cache.md
// §"Founder governing notes for the duration of the build arc".

/**
 * Plugin-auth feature flag.
 *
 * When set to 'true' in the deployment environment, plugin-originated calls
 * to /api/reason are authenticated via the X-Plugin-Auth header. The
 * invocation site (added 2026-05-MM under D-A1-INVOCATION-SITE-2026-05-10)
 * sits inside the existing user-auth + API-key 401 branch — plugin-auth is
 * tried only when both user-auth and API-key have failed AND this flag is
 * on. With the flag off (or unset), the auth behaviour is byte-identical to
 * the pre-invocation scaffold state.
 *
 * Default: 'false' (or unset, treated as false). The PLUGIN_AUTH_ENABLED
 * variable is documented in /website/.env.example.
 */
const PLUGIN_AUTH_ENABLED = process.env.PLUGIN_AUTH_ENABLED === 'true'

/**
 * A10 per-install plugin-auth feature flag (2026-06-03, staging-plan session 12).
 *
 * When 'true', /api/reason additionally accepts per-install sr_inst_ tokens
 * (Authorization: Bearer sr_inst_<key>) via validatePluginInstallToken — the
 * A10 Surface-1 credential with identity_type / install_id / scope and an
 * instant universal revocation check (is_active=true lookup filter).
 *
 * Default: 'false' (or UNSET, treated as false). When off, this path is skipped
 * entirely and auth behaviour is byte-identical to the pre-A10 state — the
 * existing PLUGIN_AUTH_SECRET / X-Plugin-Auth path (gated separately by
 * PLUGIN_AUTH_ENABLED) is untouched and remains the fallback until the
 * per-install path is Verified-live and the founder elects to retire the
 * shared secret. Documented in /website/.env.example.
 */
const PLUGIN_INSTALL_AUTH_ENABLED = process.env.PLUGIN_INSTALL_AUTH_ENABLED === 'true'

/**
 * Plugin-auth check (Wired 2026-05-MM under D-A1-INVOCATION-SITE-2026-05-10).
 *
 * Reads the X-Plugin-Auth header and performs a constant-time comparison
 * against PLUGIN_AUTH_SECRET. Returns valid=true with a placeholder plugin_id
 * on match; returns valid=false with a ready-to-send 401 NextResponse on any
 * failure (missing header, missing secret, secret mismatch, malformed input).
 *
 * Constant-time comparison is enforced via node:crypto's timingSafeEqual to
 * prevent timing-side-channel attacks against the secret.
 *
 * Fail-closed posture: if PLUGIN_AUTH_SECRET is missing or malformed, the
 * function returns 401 (not 503). This is deliberate — until the secret is
 * provisioned, plugin auth simply does not authenticate, which is the safe
 * default for an authentication function. The existing user-auth and API-key
 * paths are unaffected.
 *
 * AC7 standing constraint: this function does not touch the user session,
 * cookie scope, redirect behaviour, or domain configuration. It only inspects
 * the X-Plugin-Auth header and returns a result. AC7 ENGAGED at the
 * invocation site (the POST handler's authentication branch), not at the
 * function-definition level.
 *
 * The return shape mirrors validateApiKey for consistency with the existing
 * dual-auth pattern in security.ts.
 */
function checkPluginAuth(
  request: NextRequest
): { valid: true; plugin_id: string } | { valid: false; error: NextResponse } {
  const headerValue = request.headers.get('x-plugin-auth')

  if (!headerValue || typeof headerValue !== 'string' || headerValue.length === 0) {
    return {
      valid: false,
      error: NextResponse.json(
        {
          error: 'Plugin authentication required',
          message: 'Plugin-originated calls require an X-Plugin-Auth header.',
        },
        { status: 401, headers: corsHeaders() }
      ),
    }
  }

  const secret = process.env.PLUGIN_AUTH_SECRET

  if (!secret || typeof secret !== 'string' || secret.length === 0) {
    // Fail-closed: secret not provisioned. Return 401 (auth failure) rather
    // than 503 (server misconfigured) so plugin-auth simply does not
    // authenticate when the secret is absent. The existing user-auth and
    // API-key paths remain available.
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Plugin authentication unavailable' },
        { status: 401, headers: corsHeaders() }
      ),
    }
  }

  // Constant-time comparison. Both buffers must be the same length;
  // mismatched lengths fail without leaking the actual secret length.
  const headerBuf = Buffer.from(headerValue)
  const secretBuf = Buffer.from(secret)

  if (headerBuf.length !== secretBuf.length) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Plugin authentication failed' },
        { status: 401, headers: corsHeaders() }
      ),
    }
  }

  const match = timingSafeEqual(headerBuf, secretBuf)
  if (!match) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Plugin authentication failed' },
        { status: 401, headers: corsHeaders() }
      ),
    }
  }

  // Match. Return a placeholder plugin_id; future Stage 1 work will replace
  // this with a real identifier scheme (likely tied to signed plugin
  // metadata or a registered-plugin lookup).
  return { valid: true, plugin_id: 'scaffold-plugin' }
}

// Scaffold-presence assertion for the feature flag (zero runtime effect).
// `checkPluginAuth` no longer needs a `void` reference because it now has
// a real call site below in the POST handler's authentication branch (added
// 2026-05-MM under D-A1-INVOCATION-SITE-2026-05-10). The flag reference is
// retained because the runtime constant is read inside the conditional and
// keeping it referenced at module level guards against any future refactor
// that might inadvertently remove its only usage.
void PLUGIN_AUTH_ENABLED

// =============================================================================
// END A1 scaffold
// =============================================================================

// =============================================================================
// A2 — Stage 1 Layer 2 input validation surface (PR1 single-endpoint proof)
// =============================================================================
//
// Status: Verified (2026-05-10). Wired 2026-05-10 under
// D-A2-INPUT-VALIDATION-SURFACE-2026-05-10.
// Per: /adopted/substrate-plugin-staging-plan.md Stage 1 item A2
//      /adopted/ADR-stoic-agent-substrate-concept.md (Decision §"The three layers")
//      D-A1-FLAG-FLIP-VERIFIED-2026-05-10 (predecessor — A1 Verified)
//      D-A2-INPUT-VALIDATION-SURFACE-2026-05-10 (this validation surface)
//
// Plugin-authenticated callers (per A1) submit a pre-computed Layer1Schema
// alongside the original input text. Layer 1 ran in the plugin per the
// substrate ADR — Layer 2 ingress accepts the validated schema and feeds it
// directly to runSandwich (which skips server-side extractFeatures when the
// schema is supplied). The original input text is REQUIRED for plugin-auth
// because R20a runs on the text per AC5 (Choice 2(a) of A2 design).
//
// User-auth (Supabase JWT) and API-key paths are unchanged. Their bodies do
// NOT carry layer1_schema; Layer 1 runs server-side via extractFeatures as
// today. Zero regression on those paths is verified by Scenario 3.
//
// PR1 single-endpoint proof: /api/reason is the proof endpoint. The route
// file changes plus a small additive change in /lib/translation-sandwich/
// parallel-run.ts (new optional preExtractedLayer1Schema field on
// SandwichInput; runSandwichInner skips extractFeatures when present). No
// other route file is touched. Roll-out to additional endpoints is deferred
// to dedicated post-A3 sessions per the staging plan.
//
// AC7 NOT engaged (input-validation, not auth). PR6 NOT engaged (no
// safety-critical surface; R20a continues to run on input text exactly as
// today per Choice 2(a)). AC4 NOT engaged (no safety function added).

/**
 * A2 — Validate a plugin-authenticated request body.
 *
 * Plugin-auth callers per the substrate ADR submit:
 *   - layer1_schema: a pre-computed Layer1Schema (required)
 *   - input: the original text Layer 1 ran over (required for R20a; checked
 *     downstream via the existing inline text-length validation + R20a
 *     perimeter at line 376)
 *
 * Returns valid=true with the validated schema on success.
 * Returns valid=false with a ready-to-send 400 NextResponse on any
 * validation failure (missing field, schema-shape mismatch, enum mismatch,
 * cross-field invariant violation).
 *
 * Validation logic for layer1_schema is delegated to validateLayer1Schema
 * (the canonical validator already used by the orchestrator per ADR-005 §6).
 * Layer1ValidationError throws are mapped to structured 400 responses
 * preserving the validator's `category` and `field` info.
 *
 * AC7 standing constraint: this function does not touch the user session,
 * cookie scope, redirect behaviour, or domain configuration. It only
 * inspects the request body and returns a result.
 *
 * The return shape mirrors checkPluginAuth + validateApiKey for consistency
 * with the existing validation-helper pattern.
 */
function validatePluginRequest(
  body: unknown
): { valid: true; schema: Layer1Schema } | { valid: false; error: NextResponse } {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return {
      valid: false,
      error: NextResponse.json(
        {
          error: 'Plugin request body must be a JSON object.',
        },
        { status: 400, headers: corsHeaders() }
      ),
    }
  }
  const bodyObj = body as Record<string, unknown>

  // layer1_schema presence check.
  if (
    !('layer1_schema' in bodyObj) ||
    bodyObj.layer1_schema === undefined ||
    bodyObj.layer1_schema === null
  ) {
    return {
      valid: false,
      error: NextResponse.json(
        {
          error: 'layer1_schema is required for plugin-authenticated requests',
          detail:
            'Plugin-authenticated calls must submit a pre-computed Layer1Schema (the plugin ran Layer 1 locally per the substrate ADR). User-auth and API-key paths use raw text input as today and are unaffected.',
        },
        { status: 400, headers: corsHeaders() }
      ),
    }
  }

  // Delegate schema-shape validation to the canonical validator. Convert
  // Layer1ValidationError throws into structured 400 responses with field +
  // category info preserved.
  let validatedSchema: Layer1Schema
  try {
    validatedSchema = validateLayer1Schema(bodyObj.layer1_schema)
  } catch (err) {
    if (err instanceof Layer1ValidationError) {
      const errorBody: Record<string, unknown> = {
        error: 'layer1_schema validation failed',
        category: err.category,
        detail: err.message,
      }
      if (err.field !== undefined) {
        errorBody.field = err.field
      }
      return {
        valid: false,
        error: NextResponse.json(errorBody, { status: 400, headers: corsHeaders() }),
      }
    }
    // Non-Layer1ValidationError throws are unexpected. Treat as 400 (the
    // input was malformed in some way the validator did not anticipate).
    return {
      valid: false,
      error: NextResponse.json(
        {
          error: 'layer1_schema validation failed',
          detail: err instanceof Error ? err.message : 'Unknown validation error',
        },
        { status: 400, headers: corsHeaders() }
      ),
    }
  }

  return { valid: true, schema: validatedSchema }
}

// =============================================================================
// END A2 validation surface
// =============================================================================

// =============================================================================
// M1 CI-2 (2026-06-12) — layer1_schema supply on the API-key auth path
// =============================================================================
//
// Per the open-Layer-1 posture (substrate ADR: "the substrate accepts any
// Layer1Schema that validates against the documented contract"), the A2
// validation contract is extended to the API-key path: an `sr_live_` caller MAY
// supply a pre-computed `layer1_schema` alongside `input` and skip server-side
// Layer-1 extraction (~13–34s + the L1 Sonnet cost — the FX-3 regression class).
// Differences from the plugin path: the schema is OPTIONAL here (raw text
// continues to work exactly as today), and acceptance is gated by
// SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED (UNSET in production → the field is
// ignored and the path is byte-identical). The original `input` text remains
// REQUIRED on every path — R20a runs on the text per AC5 (unchanged).
//
// Validation delegates to the same canonical validateLayer1Schema with the
// same 400 semantics as the plugin path (validatePluginRequest above is left
// untouched — zero regression risk on the plugin contract). AC7 NOT engaged
// (input validation, not auth). PR1: /api/reason only.

function validateSuppliedLayer1Schema(
  value: unknown
): { valid: true; schema: Layer1Schema } | { valid: false; errorBody: Record<string, unknown> } {
  try {
    return { valid: true, schema: validateLayer1Schema(value) }
  } catch (err) {
    if (err instanceof Layer1ValidationError) {
      const errorBody: Record<string, unknown> = {
        error: 'layer1_schema validation failed',
        category: err.category,
        detail: err.message,
      }
      if (err.field !== undefined) {
        errorBody.field = err.field
      }
      return { valid: false, errorBody }
    }
    return {
      valid: false,
      errorBody: {
        error: 'layer1_schema validation failed',
        detail: err instanceof Error ? err.message : 'Unknown validation error',
      },
    }
  }
}

// =============================================================================
// END M1 CI-2 validation helper
// =============================================================================

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  // Authentication: accept user session (JWT) OR API key OR plugin-auth.
  //
  // Precedence (Option (a) — extend the existing 401 branch, elected in
  // D-A1-INVOCATION-SITE-2026-05-10):
  //   1. requireAuth — Supabase JWT (existing user-auth path)
  //   2. validateApiKey — API key fallback (existing agent-auth path)
  //   3. checkPluginAuth — plugin-auth (NEW; gated by PLUGIN_AUTH_ENABLED flag)
  //
  // Plugin-auth is checked LAST, only when both user-auth and API-key have
  // failed AND the PLUGIN_AUTH_ENABLED flag is on. With the flag off (the
  // pre-flag-flip production state), this branch is byte-identical to today's
  // behaviour — the new conditional short-circuits and `auth.error` is
  // returned exactly as before.
  //
  // On plugin-auth success, the request proceeds with no `auth.user`. The
  // downstream Layer 2 context loader treats this exactly like an API-key
  // call: `practitionerContext` resolves to `null` (see the
  // `auth.user?.id ? getPractitionerContext(...) : Promise.resolve(null)`
  // line further down). Plugin callers do not yet receive per-user context;
  // the placeholder `plugin_id: 'scaffold-plugin'` returned by checkPluginAuth
  // becomes a real identifier once Stage 1 A3 (signing) and A4 (key management)
  // ADRs land.
  //
  // AC7 engaged at the invocation site (auth-surface change). AC4 engaged
  // (the function is now actually invoked in production once flag is on).
  // PR1 single-endpoint proof: this is the invocation site on the proof
  // endpoint /api/reason; no other route file is touched.
  // PR6 engaged (safety-critical change to authentication).
  const auth = await requireAuth(request)
  const apiKey = auth.error ? await validateApiKey(request, 'other') : null

  let pluginAuth: ReturnType<typeof checkPluginAuth> | null = null
  if (auth.error && (!apiKey || !apiKey.valid) && PLUGIN_AUTH_ENABLED) {
    pluginAuth = checkPluginAuth(request)
  }

  // A10 per-install plugin-auth (NEW; gated by PLUGIN_INSTALL_AUTH_ENABLED).
  //
  // Tried only after user-auth and API-key have failed AND the existing
  // shared-secret plugin path (if enabled) did not authenticate. When the flag
  // is UNSET (production), this block is skipped: installAuth stays null and the
  // failure check below is byte-identical to the pre-A10 logic (the extra
  // `!installAuth || !installAuth.valid` clause is trivially true for a null
  // installAuth, and the installAuth-specific 401 branch is unreachable).
  //
  // On success the request proceeds with no auth.user — identical to the
  // shared-secret plugin path: practitionerContext resolves to null and no
  // Option D metering runs (isApiKeyAuth is false). The credential's
  // identity_type / install_id / scope live on its api_keys row; the universal
  // revocation check is the is_active=true lookup filter inside
  // validatePluginInstallToken (a revoked credential → invalid_token → 401).
  //
  // AC7 ENGAGED (auth-surface change at the invocation site). PR6 ENGAGED
  // (safety-critical auth change). PR1 single-endpoint proof: /api/reason only.
  let installAuth: PluginInstallValidationResult | null = null
  if (
    auth.error &&
    (!apiKey || !apiKey.valid) &&
    (!pluginAuth || !pluginAuth.valid) &&
    PLUGIN_INSTALL_AUTH_ENABLED
  ) {
    const installToken = extractPluginInstallToken(request.headers.get('authorization'))
    installAuth = installToken
      ? await validatePluginInstallToken(installToken)
      : { valid: false, reason: 'no_token' }
  }

  if (
    auth.error &&
    (!apiKey || !apiKey.valid) &&
    (!pluginAuth || !pluginAuth.valid) &&
    (!installAuth || !installAuth.valid)
  ) {
    // Prefer a plugin path's specific 401 if one was attempted; otherwise fall
    // back to the user-auth 401 (existing behaviour). The per-install path
    // collapses every failure reason to a single opaque 401 (no info leak); the
    // specific reason is for the structured audit log only (per the module's
    // PluginInstallValidationResult contract).
    if (installAuth && !installAuth.valid) {
      return NextResponse.json(
        { error: 'Plugin authentication failed' },
        { status: 401, headers: corsHeaders() },
      )
    }
    if (pluginAuth && !pluginAuth.valid) {
      return pluginAuth.error
    }
    return auth.error
  }

  // =============================================================================
  // Option D per-loop billing metering setup (build session 2026-05-MM).
  //
  // Metering applies ONLY when API-key auth succeeded — user-auth (Supabase
  // JWT) and plugin-auth callers are not commercial customers (no api_keys
  // row to bill against). For those paths, loopAccumulator stays null and
  // every return below falls through to its pre-existing NextResponse shape.
  //
  // For API-key auth:
  //   - loopId is extracted from the X-Loop-Id request header (validated
  //     UUIDv4) or auto-generated server-side if absent/malformed
  //   - loopAccumulator collects per-call Anthropic cost as the request flows
  //   - At each response branch, finalizeLoopResponse computes the bill,
  //     persists loop_billing_events + api_key_usage aggregates via the
  //     extended increment_api_usage RPC, and emits the six X-Loop-* headers
  // =============================================================================
  const isApiKeyAuth = apiKey !== null && apiKey.valid === true

  // S4 (D-R20A-OPTIONA-S4-AUDIENCE-RENDERING-WIRED-2026-05-28): derive the
  // R20a audience for redirect rendering from the auth signal. Per
  // /drafts/2026-05-28-r20a-single-catch-contract.md §3.2 audience-assignment
  // table:
  //   - auth.user?.id truthy  → 'human_user'      (Supabase JWT / cookie-session
  //                                                 / sagereasoning.com web tools)
  //   - auth.user?.id falsy   → 'agent_developer' (API-key OR plugin-auth path)
  //
  // The same auth.user?.id signal is already used at line ~721 to gate
  // getPractitionerContext (web users get personalised context; API callers
  // don't); reusing it here keeps the audience determination on the same
  // determinant. Used at both R20a redirect branches below (route-guard
  // ~line 626; Branch 1.7 ~line 854).
  //
  // The agent_developer branch is gated behind
  // SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED (default OFF). When OFF, the
  // effective audience falls back to 'human_user' regardless — preserves
  // byte-identical pre-S4 wire shape until a future Critical activation
  // session flips the flag.
  const r20aAudience: R20aAudience = auth.user?.id ? 'human_user' : 'agent_developer'

  const loopId: string | null = isApiKeyAuth
    ? (extractLoopId(request) ?? generateLoopId())
    : null
  const loopAccumulator: LoopAccumulator | null = isApiKeyAuth && loopId !== null && apiKey !== null && apiKey.valid
    ? createLoopAccumulator({
        loopId,
        apiKeyId: apiKey.api_key_id,
        surface: 'api_reason',
        agentId: null,  // /api/reason doesn't accept agent_id in body (unlike /api/score-iterate)
      })
    : null

  // A12: correlation id for the OTel trace + the audit row. loop_id when present
  // (API-key path), else a fresh UUID so user-auth runs are still correlatable.
  // Observability-only; does not affect billing, auth, or the response shape.
  const correlationId: string = loopId ?? generateLoopId()

  try {
    // Local helper that wraps every response branch with Option D metering
    // when loopAccumulator is active (API-key auth path). For user-auth +
    // plugin-auth paths, falls through to a plain NextResponse.
    //
    // isBillable=false on validation-error branches that occurred BEFORE the
    // request reached the substrate (malformed body, invalid depth) — those
    // get X-Loop-* headers (cost=0) but no ledger row written.
    // isBillable=true on every other branch (R20a redirect, Tier 1, A7,
    // signing throw, layer throws, happy path, 500).
    const respond = async (opts: {
      body: unknown
      status: number
      headers: Record<string, string>
      isBillable?: boolean
    }): Promise<NextResponse> => {
      if (loopAccumulator && loopId && apiKey && apiKey.valid) {
        return await finalizeLoopResponse({
          loopId,
          accumulator: loopAccumulator,
          apiKeyId: apiKey.api_key_id,
          endpoint: 'other',
          responseBody: opts.body,
          responseStatus: opts.status,
          responseHeaders: opts.headers,
          isBillable: opts.isBillable ?? true,
        })
      }
      return NextResponse.json(opts.body, { status: opts.status, headers: opts.headers })
    }

    const body = await request.json()

    // Stage 1 A2 (D-A2-INPUT-VALIDATION-SURFACE-2026-05-10): plugin-auth
    // input validation. When plugin-auth was the successful auth path, the
    // body must contain a valid Layer1Schema (the plugin ran Layer 1
    // locally). Validation runs here — after auth, before inline text
    // validation + R20a — so a missing/malformed schema returns 400
    // immediately. The validated schema is stored for later pass-through to
    // runSandwich (skipping server-side Layer 1 extraction).
    //
    // User-auth and API-key paths skip this branch entirely; their existing
    // text-input validation continues unchanged. R20a runs on `input` text
    // for ALL paths (Choice 2(a) of A2 design — preserves AC5 perimeter).
    // A10 (2026-06-03): a successful per-install auth is also a plugin-auth path
    // and gets the same A2 body contract (the plugin ran Layer 1 locally and
    // submits a layer1_schema). When PLUGIN_INSTALL_AUTH_ENABLED is off,
    // installAuth is null and this is byte-identical to the pre-A10 value.
    const isPluginAuth =
      (pluginAuth !== null && pluginAuth.valid === true) ||
      (installAuth !== null && installAuth.valid === true)
    let preExtractedLayer1Schema: Layer1Schema | undefined
    if (isPluginAuth) {
      const validation = validatePluginRequest(body)
      if (!validation.valid) {
        return validation.error
      }
      preExtractedLayer1Schema = validation.schema
    }

    // M1 CI-2 (2026-06-12): OPTIONAL layer1_schema on the API-key path, gated
    // by SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED. Flag unset (production) → the
    // field is ignored entirely and this block is byte-identical to today.
    // Flag on + field present → same canonical validation + 400 semantics as
    // the plugin path; on success, server-side Layer-1 extraction is skipped
    // (meta.layer1_source: 'supplied'). Raw-text requests are unchanged.
    const keyPathSchemaEnabled =
      process.env.SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED === 'true'
    if (
      keyPathSchemaEnabled &&
      isApiKeyAuth &&
      preExtractedLayer1Schema === undefined &&
      typeof body === 'object' &&
      body !== null &&
      (body as Record<string, unknown>).layer1_schema !== undefined &&
      (body as Record<string, unknown>).layer1_schema !== null
    ) {
      // CI-14 l1_supply enforcement (flag-gated): when the UPC capability model is
      // ON, a credential may supply a precomputed layer1_schema only if it carries
      // the l1_supply capability — the ADR's "fails closed (403)" promise. Flag-off
      // (or any credential validated by the legacy path, where capabilities is
      // undefined) → skipped, byte-identical. The presets bundle {consult,l1_supply}
      // so every legacy/default-minted credential passes; only a deliberately
      // consult-only UPC is refused here.
      if (
        apiKey !== null &&
        apiKey.valid === true &&
        l1SupplyRefused({
          upcEnabled: isUpcCapabilityAuthEnabled(),
          capabilities: apiKey.capabilities,
        })
      ) {
        return await respond({
          body: {
            error: 'Insufficient capability',
            message:
              'This credential does not grant the l1_supply capability required to supply a precomputed layer1_schema.',
          },
          status: 403,
          headers: corsHeaders(),
          isBillable: false, // Pre-substrate capability rejection — no LLM cost incurred.
        })
      }
      const supplied = validateSuppliedLayer1Schema(
        (body as Record<string, unknown>).layer1_schema
      )
      if (!supplied.valid) {
        return await respond({
          body: supplied.errorBody,
          status: 400,
          headers: corsHeaders(),
          isBillable: false, // Pre-substrate validation error — no LLM cost incurred.
        })
      }
      preExtractedLayer1Schema = supplied.schema
    }

    // M1-CP4e (2026-05-06): continuation_token is optional, present on
    // second-turn re-submission after a Tier 1 force-clarification (per
    // ADR-008 §1 + §4). When present, it is validated AFTER the R20a
    // distress check (preserves perimeter on every turn per ADR-008 §6).
    const {
      input,
      context,
      depth: requestedDepth,
      domain_context,
      urgency_context,
      continuation_token,
      // M1 CI-1 (2026-06-12): 'full' (default — today's synchronous shape) |
      // 'assessment_first' (deferral request). Read ONLY when
      // SUBSTRATE_L3_DEFER_ENABLED is on; ignored entirely otherwise (today's
      // behaviour for unknown body fields — byte-identity with the flag unset).
      response_format,
      // M5 CI-4 (2026-06-13): the re-examination affordance — { prior_loop_id,
      // prior_depth_tier, adopted_correction? }. Read ONLY when
      // SUBSTRATE_REASON_LOOP_CLOSURE_ENABLED is on; ignored entirely otherwise
      // (byte-identity with the flag unset).
      prior_feedback,
      // Mechanism-correction Part A (ADR-008 §A, 2026-06-18): the typed answer
      // channel for a Tier 1 force-clarification continuation. Read ONLY when
      // SUBSTRATE_TIER1_CONTINUATION_ENABLED is on; ignored entirely otherwise
      // (byte-identity with the flag unset). Carried alongside a byte-identical
      // `input` + the `continuation_token` (the input hash binding is preserved
      // — Design A; the answer is NOT folded into `input`).
      clarification_response,
    } = body

    // Validate required input
    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return await respond({
        body: { error: 'Input is required. Provide the decision, action, or situation to reason about.' },
        status: 400,
        headers: {},
        isBillable: false,  // Pre-substrate validation error — no LLM cost incurred.
      })
    }

    // Validate text lengths
    const inputErr = validateTextLength(input, 'Input', TEXT_LIMITS.medium)
    if (inputErr) return await respond({ body: { error: inputErr }, status: 400, headers: {}, isBillable: false })
    const contextErr = validateTextLength(context, 'Context', TEXT_LIMITS.medium)
    if (contextErr) return await respond({ body: { error: contextErr }, status: 400, headers: {}, isBillable: false })
    const domainErr = validateTextLength(domain_context, 'Domain context', TEXT_LIMITS.medium)
    if (domainErr) return await respond({ body: { error: domainErr }, status: 400, headers: {}, isBillable: false })

    // Mechanism-correction Part A (ADR-008 §A.3 step 1): when the continuation
    // flag is on and clarification_response is present, type- + length-validate
    // it before it reaches the distress classifier (below) or the engine.
    // Flag off → never read (byte-identical; an unknown over-long field is
    // ignored exactly as today).
    const tier1ContinuationEnabled = isTier1ContinuationEnabled()
    if (
      tier1ContinuationEnabled &&
      clarification_response !== undefined &&
      clarification_response !== null
    ) {
      if (typeof clarification_response !== 'string') {
        return await respond({
          body: { error: 'clarification_response must be a string.' },
          status: 400,
          headers: {},
          isBillable: false,  // Pre-substrate validation error — no LLM cost incurred.
        })
      }
      const clarificationErr = validateTextLength(
        clarification_response,
        'Clarification response',
        TEXT_LIMITS.medium,
      )
      if (clarificationErr) {
        return await respond({
          body: { error: clarificationErr },
          status: 400,
          headers: {},
          isBillable: false,  // Pre-substrate validation error — no LLM cost incurred.
        })
      }
    }

    // R20a — Vulnerable user detection (before any LLM call)
    // enforceDistressCheck() returns a SafetyGate — compile-time proof that
    // the distress classifier has been awaited before any reasoning proceeds.
    //
    // M1-CP4e (2026-05-06): R20a runs on EVERY turn — including second-turn
    // re-submissions with a continuation_token. The continuation token does
    // NOT bypass the perimeter (per ADR-008 §6). A second-turn distress fire
    // takes precedence over the token: the token is discarded; the practitioner
    // sees the redirect.
    //
    // Mechanism-correction Part A (ADR-008 §A.3 step 2): in Design A the
    // practitioner's answer is the SEPARATE field `clarification_response`, not
    // an augmented `input`. The perimeter must therefore distress-check
    // `input + clarification_response` so distress in the answer cannot escape
    // it (AC5). composeContinuationDistressText returns `input` alone unless the
    // flag is on AND a non-empty answer is present — so flag-off is byte-
    // identical. Token presence is NOT required: any practitioner-authored
    // clarification text runs the perimeter before any engine work or structural
    // rejection.
    const distressSubjectText = tier1ContinuationEnabled
      ? composeContinuationDistressText(
          input,
          typeof clarification_response === 'string' ? clarification_response : undefined,
        )
      : input
    const gate = await enforceDistressCheck(detectDistressTwoStage(distressSubjectText))
    if (gate.shouldRedirect) {
      // S4 (D-R20A-OPTIONA-S4-AUDIENCE-RENDERING-WIRED-2026-05-28): route the
      // redirect response through the audience-correct render helper. Per
      // /drafts/2026-05-28-r20a-single-catch-contract.md §3.4 — closes the
      // Finding 2 gap (today's API path receives the human-framed pass-through).
      //
      // Flag-gating posture: SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED gates
      // the agent_developer branch only. When the flag is UNSET (steady-state
      // production at S4 close), the effective audience is 'human_user' for
      // both web AND API callers — byte-identical to pre-S4 wire shape (the
      // Finding 2 bug is preserved; the fix lives in code; activation is a
      // future Critical session). When the flag is ON, the route's r20aAudience
      // (derived from auth.user?.id) drives the form.
      const effectiveAudience: R20aAudience = isR20aAudienceRenderingEnabled()
        ? r20aAudience
        : 'human_user'
      const redirectPayload = renderR20aRedirectResponse({
        audience: effectiveAudience,
        severity: gate.result.severity,
        redirect_message: gate.result.redirect_message ?? '',
      })
      return await respond({
        body: redirectPayload,
        status: 200,
        headers: corsHeaders(),
        isBillable: true,  // Substrate engaged via R20a perimeter — billed at base rate per R9.
      })
    }

    // M1-CP4e (2026-05-06): Continuation-token validation. Runs AFTER the
    // R20a perimeter and BEFORE the engine is called. Per ADR-008 §4.4 +
    // §5 step 3 + §6.
    //
    // When `continuation_token` is present, the request is a second-turn
    // re-submission after a Tier 1 force-clarification. The token is a
    // stateless HMAC signature (not a session credential — AC7 NOT engaged).
    // On any validation failure: return HTTP 400 with the specific error
    // code per ADR-008 §4.4. On success: extract `previous_trigger` for
    // downstream meta logging.
    //
    // When `continuation_token` is absent, the request is a fresh first-turn
    // request and validation is skipped.
    let previousTrigger: 'ELEMENT_FUSION' | 'SCOPE_AMBIGUITY' | 'TEMPORAL_AMBIGUITY' | null = null
    if (continuation_token !== undefined && continuation_token !== null) {
      const tokenResult = validateContinuationToken(continuation_token, input)
      if (!tokenResult.ok) {
        // Map error codes to HTTP responses per ADR-008 §4.4.
        if (tokenResult.error_code === 'continuation_token_secret_missing') {
          // The TRANSLATION_SANDWICH_TIER1_SECRET env var is not set on this
          // deployment. Fail-closed: the engine cannot validate tokens. Return
          // 503 (engine misconfigured) rather than 400 (client error) because
          // the client did everything right; the server is misconfigured.
          // This path should only fire pre-Sub-session-M1-CP4e-B (env var
          // provision); after that, the secret is always set.
          console.error(
            '[/api/reason] Tier 1 continuation token presented but ' +
              'TRANSLATION_SANDWICH_TIER1_SECRET is not set. The engine cannot ' +
              'validate the token. Set the env var per ADR-008 §4.2.'
          )
          return await respond({
            body: {
              error: 'continuation_token_engine_unavailable',
              detail:
                'Tier 1 force-clarification is not available on this deployment. ' +
                'Submit your input again as a fresh request.',
            },
            status: 503,
            headers: corsHeaders(),
            isBillable: false,  // Server misconfig (env var missing) — not customer fault.
          })
        }
        // All other validation failures are 400.
        const errorBody: Record<string, unknown> = { error: tokenResult.error_code }
        if (tokenResult.error_code === 'continuation_token_expired' && tokenResult.expired_at !== undefined) {
          errorBody.expired_at = tokenResult.expired_at
        }
        return await respond({
          body: errorBody,
          status: 400,
          headers: corsHeaders(),
          isBillable: true,  // Client error post-perimeter — billed at base rate per R9.
        })
      }
      // Token validated. Extract previous trigger code for meta logging.
      previousTrigger = tokenResult.payload.trigger_code
    }
    // previousTrigger is integrated into the response meta below (Branch 3 — happy path)
    // when non-null. M1-CP6 cutover (2026-05-08) — was diagnostic-only during parallel-run;
    // is now load-bearing for second-turn meta logging.

    // Mechanism-correction Part A (ADR-008 §A.3 step 4 + §A.4): the
    // clarification-continuation contract. Flag-gated; byte-identical when off
    // (tier1SuppressTrigger + clarificationAnswer stay undefined → the engine
    // suppression + the context fold below are no-ops, and the runSandwich call
    // is byte-identical).
    //   - valid token + answer  → suppress the answered trigger (engine) + fold
    //                             the answer into the examination context.
    //   - valid token, NO answer → 400 (a continuation without an answer is
    //                             meaningless — the same trigger would re-fire).
    //   - answer, NO token       → 400 (the answer is only valid when resuming a
    //                             force-clarification with its continuation_token).
    let tier1SuppressTrigger:
      | 'ELEMENT_FUSION' | 'SCOPE_AMBIGUITY' | 'TEMPORAL_AMBIGUITY' | undefined
    let clarificationAnswer: string | undefined
    if (tier1ContinuationEnabled) {
      const hasAnswer =
        typeof clarification_response === 'string' && clarification_response.trim() !== ''
      if (previousTrigger !== null) {
        if (!hasAnswer) {
          return await respond({
            body: {
              error: 'clarification_response_required',
              detail:
                'A continuation_token resumes a force-clarification; provide ' +
                'clarification_response (your answer to the clarification question) ' +
                'alongside the original input.',
            },
            status: 400,
            headers: corsHeaders(),
            isBillable: true,  // Client error post-perimeter — billed at base rate per R9.
          })
        }
        // Mechanism-correction Part A — pre-activation review finding CF-2
        // (2026-06-18): the clarification answer informs server-side Layer-1
        // RE-EXTRACTION (it is folded into the extraction context below). A
        // caller who supplied a precomputed layer1_schema has bypassed
        // server-side extraction entirely (runSandwichInner skips extractFeatures
        // when preExtractedLayer1Schema is set — parallel-run.ts ~633), so the
        // answer would be silently dropped while the trigger is still suppressed
        // — the engine would return a full assessment on the caller's still-
        // ambiguous schema AS IF the question were answered (a false success).
        // Refuse the combination honestly: an l1_supply / plugin caller resolves
        // a Tier-1 clarification by re-supplying a DISAMBIGUATED layer1_schema
        // (the trigger then simply does not fire), not via clarification_response.
        // Distress in the answer was already perimeter-checked above
        // (composeContinuationDistressText) — this is a structural rejection,
        // never a safety bypass.
        if (preExtractedLayer1Schema !== undefined) {
          return await respond({
            body: {
              error: 'clarification_response_with_supplied_layer1_schema',
              detail:
                'clarification_response informs server-side Layer-1 re-extraction, ' +
                'which is bypassed when you supply a precomputed layer1_schema. To ' +
                'resume a force-clarification on the supplied-schema path, re-submit ' +
                'a disambiguated layer1_schema instead (the answered trigger then ' +
                'does not re-fire).',
            },
            status: 400,
            headers: corsHeaders(),
            isBillable: false,  // Pre-substrate structural error — no engine work performed.
          })
        }
        tier1SuppressTrigger = previousTrigger
        clarificationAnswer = clarification_response as string
      } else if (hasAnswer) {
        return await respond({
          body: {
            error: 'clarification_response_without_token',
            detail:
              'clarification_response is only valid when resuming a force-clarification ' +
              'with its continuation_token. Submit a fresh request without it.',
          },
          status: 400,
          headers: corsHeaders(),
          isBillable: false,  // Pre-substrate structural error — no engine work performed.
        })
      }
    }

    // Validate depth parameter. `let` (not `const`) because the M5 CI-4
    // same-depth rule (below) carries the prior examination's depth on a
    // prior_feedback re-submission; the flag-off path never reassigns it.
    let depth: ReasonDepth = requestedDepth || 'standard'
    if (!VALID_DEPTHS.includes(depth)) {
      return await respond({
        body: { error: `Invalid depth. Must be one of: ${VALID_DEPTHS.join(', ')}` },
        status: 400,
        headers: {},
        isBillable: false,  // Pre-substrate validation error — no LLM cost incurred.
      })
    }

    // M1 CI-1 (2026-06-12): response_format validation — flag-gated. With the
    // flag unset the field is never read (byte-identity); with the flag on, an
    // unknown value 400s honestly rather than silently serving 'full'.
    const l3DeferEnabled = isL3DeferEnabled()
    if (
      l3DeferEnabled &&
      response_format !== undefined &&
      response_format !== null &&
      response_format !== 'full' &&
      response_format !== 'assessment_first'
    ) {
      return await respond({
        body: { error: "Invalid response_format. Must be one of: full, assessment_first" },
        status: 400,
        headers: {},
        isBillable: false,  // Pre-substrate validation error — no LLM cost incurred.
      })
    }
    const deferRequested = l3DeferEnabled && response_format === 'assessment_first'

    // M5 CI-4 (2026-06-13): the re-examination affordance — flag-gated. With
    // SUBSTRATE_REASON_LOOP_CLOSURE_ENABLED unset, prior_feedback is never read
    // and no markers / examination_open emit (byte-identity — proven by the
    // CI-4 flag-off test). With it on:
    //   - a present-but-malformed prior_feedback 400s honestly;
    //   - a valid prior_feedback CARRIES the original examination's depth (the
    //     Q4 same-depth rule — re-examine at the original depth, not quick-by-
    //     default) and links the loop via prior_feedback_ref;
    //   - every examination carries ref + depth_tier markers (inside the signed
    //     assessment) so a redirection is closeable by the M3 write boundary.
    // No new DB write on this route (KG1 not engaged) — response-shape only.
    const reasonLoopClosureEnabled = isReasonLoopClosureEnabled()
    let loopClosure: ExaminationMarkers | undefined
    let effectiveContext = context
    if (reasonLoopClosureEnabled) {
      const pf = parsePriorFeedback(prior_feedback)
      if (!pf.ok) {
        return await respond({
          body: { error: pf.error },
          status: 400,
          headers: {},
          isBillable: false,  // Pre-substrate validation error — no LLM cost incurred.
        })
      }
      // Same-depth rule: a re-submission runs at the original examination's
      // depth tier, not the requested/default depth.
      if (pf.value !== null) {
        depth = pf.value.prior_depth_tier
      }
      loopClosure = buildExaminationMarkers({
        ref: correlationId,
        depthTier: depth,
        priorFeedback: pf.value,
      })
      // Note-A intent: the adopted correction is folded into the examination
      // context so the re-examination is genuinely informed (no-op when there
      // is no prior_feedback / no adopted_correction → byte-identical context).
      effectiveContext = composeReExaminationContext(context, pf.value)
    }
    // Mechanism-correction Part A (ADR-008 §A.1 step 3 / §A.4): fold the
    // clarification answer into the examination context so the second-turn
    // Layer-1 re-extraction is informed by the answer (composes on top of any
    // CI-4 fold above). clarificationAnswer is set only on a validated
    // token + answer continuation; undefined otherwise → byte-identical context.
    if (clarificationAnswer !== undefined) {
      effectiveContext = composeClarificationContext(effectiveContext, clarificationAnswer)
    }

    // Per-request cache for D6 retrievals (KG1 rule 4 — never module-level).
    const ragCache = new Map<string, RetrieveResult>()

    // Load Layer 1 (Stoic Brain via D6/D7), Layer 2 (practitioner context), and
    // Layer 3 (project context) in parallel to avoid sequential latency.
    //
    // Stage 1 A2 (D-A2-INPUT-VALIDATION-SURFACE-2026-05-10): when a
    // pre-computed Layer1Schema was supplied (plugin-auth path), server-side
    // Layer 1 extraction is skipped, so the Stoic Brain RAG context is
    // unused. Skip loadLayer1WithFallback in that case to avoid unnecessary
    // RAG retrieval work (DB + possible LLM cost). The Promise.resolve
    // fallback shape matches loadLayer1WithFallback's success-shape contract
    // so the destructure below remains type-safe.
    const [layer1, practitionerContext, projectContext] = await Promise.all([
      preExtractedLayer1Schema !== undefined
        ? Promise.resolve({ stoicBrainContext: '', retrievedPassages: [] })
        : loadLayer1WithFallback(input, depth, ragCache, '/api/reason'),
      auth.user?.id ? getPractitionerContext(auth.user.id) : Promise.resolve(null),
      getProjectContext('condensed'),
    ])

    // -------------------------------------------------------------------------
    // M1-CP6 cutover (2026-05-08): translation-sandwich is the sole user-facing
    // path on /api/reason. Bundled engine no longer called from this route
    // (per ADR-004 §10 CP6 + design choice 2A — parallel-run retired).
    //
    // Failure isolation per ADR-004 §9 + design choice 1C:
    //   - Layer 1/2 throws → deterministic minimal fallback shape (200 status,
    //     fallback flag in meta). No bundled call.
    //   - Layer 3 LLM throw with fallback success → composed sandwich output
    //     with deterministic fallback prose (handled inside runSandwich).
    //   - Layer 3 LLM AND fallback both failing → deterministic minimal fallback.
    //
    // Tier 1 force-clarification surfacing per ADR-008 §2 + design choice 3A:
    //   When sandwich emits a Tier 1 trigger, the route issues the continuation
    //   token, splices it into the orchestrator's Tier 1 response shape, and
    //   returns to the user. First-turn surfacing.
    //
    // R20a perimeter at line 173 unchanged — runSandwich sits AFTER it.
    // AC4 + AC5 + AC8 + PR1 + PR6 preserved.
    // -------------------------------------------------------------------------

    const sandwichResult = await withSubstrateRootSpan(correlationId, 'api_reason', () => runSandwich({
      // A12: correlation id stamped on the OTel layer spans + carried to the audit row.
      correlationId,
      input,
      // M5 CI-4: effectiveContext === context unless the flag is on AND a valid
      // prior_feedback carried an adopted_correction (then it is folded in).
      context: effectiveContext,
      domain_context,
      urgency_context,
      stoicBrainContext: layer1.stoicBrainContext,
      retrievedPassages: layer1.retrievedPassages,
      practitionerContext,
      projectContext,
      // Stage 1 A2 (D-A2-INPUT-VALIDATION-SURFACE-2026-05-10): when defined,
      // runSandwich skips server-side extractFeatures and uses this schema
      // directly. Undefined for user-auth + API-key paths (existing behaviour).
      preExtractedLayer1Schema,
      // Stage 1 A7 (D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13): pass
      // the route-level SafetyGate (already awaited at line 544) so A7
      // inside runSandwichInner can REUSE the gate's result without making
      // a new classifier call. This is the latency-zero path for /api/reason.
      // Future substrate consumers without their own route-level perimeter
      // would omit this and A7 would run a fresh classifier call inheriting
      // the AC2 ~500ms budget.
      safetyGate: gate,
      // M1 CI-1 (2026-06-12): a REQUEST to defer prose, not a guarantee — the
      // orchestrator applies the structural distress guard (shouldDeferProse)
      // and reports the actual outcome on sandwichResult.prose_deferred.
      // false here (flag unset / 'full') leaves the legacy path untouched.
      deferProse: deferRequested,
      // M5 CI-4 (2026-06-13): loop-closure markers — undefined unless the flag
      // is on (byte-identical when off). runSandwichInner attaches them inside
      // the signed assessment + surfaces examination_open on the composed output.
      loopClosure,
      // Mechanism-correction Part A (ADR-008 §A.4): the answered Tier 1 trigger
      // to suppress on this continuation turn — undefined unless
      // SUBSTRATE_TIER1_CONTINUATION_ENABLED is on AND a continuation_token
      // validated (byte-identical engine behaviour when undefined). The answer
      // itself reaches Layer 1 via effectiveContext (folded above) — guaranteed
      // because the supplied-schema case (which would skip re-extraction) is
      // rejected at the continuation block (CF-2), so server-side extraction
      // always runs on this path.
      tier1SuppressTrigger,
    }))

    // Option D metering — populate loopAccumulator with the per-layer Anthropic
    // cost from SandwichRunResult's microcents fields. 1 microcent = 0.0001
    // cents (i.e., divide microcents by 10000 to get cents). Both layers use
    // Sonnet per AC1 of the manifest. Layer 1's microcents will be 0 when
    // preExtractedLayer1Schema was supplied (plugin-auth path) or null/0 if
    // Layer 1 short-circuited (Tier 1 ELEMENT_FUSION). Layer 3 microcents
    // will be null if Layer 3 wasn't called (Tier 1, A7 redirect, layer throws).
    // Token counts are not exposed by SandwichRunResult — left at 0 in the
    // accumulator (loop_billing_events.total_input_tokens / total_output_tokens
    // will be 0 for /api/reason loops; design's accepted scope per PR7).
    if (loopAccumulator) {
      if (sandwichResult.layer1_cost_usd_microcents !== null && sandwichResult.layer1_cost_usd_microcents > 0) {
        loopAccumulator.addPrecomputedCall(
          'claude-sonnet-4-6',
          sandwichResult.layer1_cost_usd_microcents / 10000
        )
      }
      if (sandwichResult.layer3_cost_usd_microcents !== null && sandwichResult.layer3_cost_usd_microcents > 0) {
        loopAccumulator.addPrecomputedCall(
          'claude-sonnet-4-6',
          sandwichResult.layer3_cost_usd_microcents / 10000
        )
      }
    }

    // ========================================================================
    // M1 CI-1 + CI-17 (2026-06-12): narrative retention + deferral hand-off.
    // Election 4d: EVERY examination is retained when the flag is on (inline
    // and deferred). Runs before the A12 audit write so narrative_status lands
    // in the audit row. Entirely skipped when SUBSTRATE_L3_DEFER_ENABLED is
    // unset (production) — byte-identical behaviour.
    // ========================================================================
    let narrativeStatus: 'inline' | 'deferred' | undefined
    // M1 CI-1 (FH-1, 2026-06-15): tracks whether the INLINE one-shot retention
    // write actually landed, so the A12 audit row cannot claim retention that
    // silently failed. Undefined on the deferred-success path ('deferred'
    // already implies the pending row landed) and when the flag is unset
    // (omitted from the audit facts → byte-identical).
    let narrativeRetained: boolean | undefined
    if (
      l3DeferEnabled &&
      sandwichResult.error === null &&
      sandwichResult.tier1_trigger === null &&
      sandwichResult.output !== null &&
      sandwichResult.layer2_assessment !== null
    ) {
      const bareAssessment = sandwichResult.layer2_assessment
      const composedOutput = sandwichResult.output as Record<string, unknown>
      // The retained artifact is whatever the wire carries: the signed wrapper
      // when signing is enabled (the R18f audit-pairing form), bare otherwise.
      const retainableAssessment = composedOutput.assessment as RetainableAssessment
      const narrativeAgentId = loopAccumulator?.agentId ?? null

      if (sandwichResult.prose_deferred) {
        // Deferred path: the pending row is written AWAITED before the
        // response (KG1 rule 2). Generation then completes via waitUntil;
        // the narrative-sweep cron is the guarantee backstop.
        const pending = await insertPendingNarrative({
          correlationId,
          agentId: narrativeAgentId,
          assessment: retainableAssessment,
        })
        if (pending.ok) {
          narrativeStatus = 'deferred'
          // Election 3 metering posture: the deferred L3 cost lands on the
          // narrative row against this same correlation/loop id — the
          // Option-D billing ledger (written once at respond()) is never
          // mutated. The loop's full cost is reconstructable by join.
          waitUntil(
            completeNarrative({
              correlationId,
              assessment: bareAssessment,
              mode: 'deferred',
            })
          )
        } else {
          // CI-17 existence guarantee: the pending row did not land, so
          // deferral is withdrawn — generate inline exactly as today.
          const outcome = await generateNarrativeForAssessment(bareAssessment)
          if (outcome !== null) {
            composedOutput.prose = outcome.prose
            const composedMeta =
              (composedOutput.meta as Record<string, unknown>) ?? {}
            composedMeta.layer3_latency_ms = outcome.latencyMs
            composedOutput.meta = composedMeta
            sandwichResult.prose_deferred = false
            narrativeStatus = 'inline'
            // Billing parity: this L3 call ran BEFORE the response, so its
            // cost joins the loop accumulator exactly like the orchestrator's
            // inline path.
            if (
              loopAccumulator &&
              outcome.costMicrocents !== null &&
              outcome.costMicrocents > 0
            ) {
              loopAccumulator.addPrecomputedCall(
                'claude-sonnet-4-6',
                outcome.costMicrocents / 10000
              )
            }
            const retained = await insertRetainedNarrative({
              correlationId,
              agentId: narrativeAgentId,
              assessment: retainableAssessment,
              prose: outcome.prose,
              proseSource: outcome.source,
              layer3CostMicrocents: outcome.costMicrocents,
              layer3LatencyMs: outcome.latencyMs,
            })
            // FH-1: the consumer got inline prose, but record honestly whether
            // the retention row landed — the A12 row is the CI-17 observability.
            narrativeRetained = retained.ok
          } else {
            // Both generation paths threw AND the pending row failed —
            // surface the same minimal fallback the orchestrator's inline
            // path would (ADR-004 §9.3 semantics preserved).
            sandwichResult.error = 'layer3_throw'
          }
        }
      } else {
        // Inline path ('full' under the flag, or the distress guard forced
        // inline): the prose was generated in the orchestrator; retain it
        // one-shot. A failure here never fails the response — the narrative
        // exists client-side; the retention gap stays visible in logs + A12.
        const inlineProse = composedOutput.prose as Layer3Prose | null
        if (inlineProse !== null) {
          narrativeStatus = 'inline'
          const retained = await insertRetainedNarrative({
            correlationId,
            agentId: narrativeAgentId,
            assessment: retainableAssessment,
            prose: inlineProse,
            proseSource: inlineProse.source,
            layer3CostMicrocents: sandwichResult.layer3_cost_usd_microcents,
            layer3LatencyMs: sandwichResult.layer3_latency_ms,
          })
          // FH-1: record honestly whether the retention row landed.
          narrativeRetained = retained.ok
        }
      }
    }

    // A12: record one append-only call-grain audit event for this run (DPIA
    // evidence / behavioural-baseline source / AP2 provenance — AC10 / F4).
    // No-op when SUBSTRATE_OTEL_ENABLED is unset; isolated (never throws into
    // the response). Reads ONLY structural fields of sandwichResult — not the
    // prose output, and not the R20a classifier (PR6 boundary preserved).
    await recordSubstrateAuditEvent({
      correlationId,
      agentId: loopAccumulator?.agentId ?? null,
      surface: 'api_reason',
      inputCharCount: typeof input === 'string' ? input.length : 0,
      modelsUsed:
        sandwichResult.layer1_latency_ms !== null ||
        sandwichResult.layer3_latency_ms !== null
          ? ['claude-sonnet-4-6']
          : [],
      facts: {
        error: sandwichResult.error,
        tier1TriggerCode: sandwichResult.tier1_trigger?.trigger_code ?? null,
        layer1LatencyMs: sandwichResult.layer1_latency_ms,
        layer2LatencyMs: sandwichResult.layer2_latency_ms,
        layer3LatencyMs: sandwichResult.layer3_latency_ms,
        layer1CostMicrocents: sandwichResult.layer1_cost_usd_microcents,
        layer3CostMicrocents: sandwichResult.layer3_cost_usd_microcents,
        gateSeverity:
          ((sandwichResult.substrate_r20a_gate_output as { severity?: string } | null)
            ?.severity as SeverityBand | undefined) ?? null,
        hasLayer3Response: sandwichResult.substrate_layer3_response !== null,
        outputPresent: sandwichResult.output !== null,
        // M1 CI-1: structural enum; key omitted entirely when the flag is
        // unset, so production audit rows are unchanged until activation.
        ...(narrativeStatus !== undefined ? { narrativeStatus } : {}),
        // M1 CI-1 (FH-1): whether the inline retention write actually landed —
        // omitted on the deferred path + when the flag is unset (byte-identical).
        ...(narrativeRetained !== undefined ? { narrativeRetained } : {}),
      },
    })

    // Mechanism-correction M7 (CI-5 read half, 2026-06-14): read the consulting
    // credential's OWN windowed assessment history (D17 90d/last-30) and project
    // it into an honest trajectory overlay, surfaced on the happy-path response
    // (Branch 3, meta.trajectory). READ-AND-OVERLAY (founder election): the engine
    // is NOT modified — the deterministic Layer2Assessment is byte-identical
    // regardless of the trajectory ("supplies evidence, does not move grades
    // directly"; hysteresis stays the Assent engine's). Determinism: the overlay
    // is a pure function of the stored window (computeTrajectoryOverlay reads no
    // clock; the aggregator's computed_at is never surfaced).
    //
    // Placed BEFORE the M6 write so the current consult's row is not yet in the
    // table → prior_instances counts PRIOR consults only. Same happy-path guard as
    // the M6 write (real examination: assessment produced, no Tier-1, no error) so
    // redirect/Tier-1/fallback paths read nothing. Entirely skipped (zero new DB
    // reads, no overlay) when SUBSTRATE_TRAJECTORY_READ_ENABLED is unset →
    // byte-identical to pre-M7. Awaited (KG1 rule 2 — one indexed windowed query);
    // fail-honest (a read error is logged; the response proceeds with no overlay).
    // R17a: scoped to this credential's own rows; user-JWT consults carry no
    // credential_ref → no overlay (as they write no M6 row).
    let trajectoryOverlay: TrajectoryOverlay | undefined
    // AE-1 (KG1): when the delta block resolves the credential context, the M6
    // write block below REUSES it instead of issuing a second PK read. Null
    // whenever the delta path did not run (any flag off / non-api_key auth) —
    // the write block then behaves exactly as pre-AE-1.
    let sharedCredCtx: { owner_user_id: string | null; agent_id: string | null } | null =
      null
    if (
      isTrajectoryReadEnabled() &&
      sandwichResult.error === null &&
      sandwichResult.tier1_trigger === null &&
      sandwichResult.layer2_assessment !== null
    ) {
      let readCredentialRef: string | null = null
      if (apiKey && apiKey.valid) {
        readCredentialRef = `api_key:${apiKey.api_key_id}`
      } else if (installAuth && installAuth.valid) {
        readCredentialRef = `install:${installAuth.install_id}`
      }
      if (readCredentialRef !== null) {
        const windowResult = await getTrajectoryWindow({ credentialRef: readCredentialRef })
        if (windowResult.ok) {
          trajectoryOverlay = computeTrajectoryOverlay(windowResult.value)
          // AE-1 (ADR-014 §3.1): the practice-delta block, attached ONLY when
          // SUBSTRATE_TRAJECTORY_DELTA_ENABLED is on (absent ⇒ the overlay is
          // byte-identical to M7). Reuses the SAME window (no second windowed
          // query); adds ONE flag-gated indexed PK read (resolveCredentialContext
          // — the M6 write path's own precedent) so the identity module can
          // resolve the canonical (owner_user_id, agent_id) pair. Pure + MEASURE:
          // the block recommends nothing and the engine assessment is untouched.
          // Fail-honest: a context/compute failure omits the delta, never the
          // response (mirrors the overlay posture).
          if (isTrajectoryDeltaEnabled()) {
            try {
              let deltaOwnerUserId: string | null = null
              let deltaAgentId: string | null = null
              if (apiKey && apiKey.valid) {
                sharedCredCtx = await resolveCredentialContext(apiKey.api_key_id)
                deltaOwnerUserId = sharedCredCtx.owner_user_id
                deltaAgentId =
                  sharedCredCtx.agent_id !== null && isAcceptedAgentId(sharedCredCtx.agent_id)
                    ? sharedCredCtx.agent_id
                    : null
              } else if (installAuth && installAuth.valid) {
                deltaOwnerUserId = installAuth.owner_user_id
              }
              trajectoryOverlay.delta = computeTrajectoryDelta(windowResult.value, {
                identity: resolveLongitudinalIdentity({
                  credentialRef: readCredentialRef,
                  ownerUserId: deltaOwnerUserId,
                  agentId: deltaAgentId,
                }),
                layer1Sources: windowResult.value.readRows?.map(
                  (r) => r.layer1_source ?? null,
                ),
              })
            } catch (deltaErr) {
              console.warn(
                '[/api/reason] trajectory delta computation failed (delta omitted, response unaffected):',
                deltaErr instanceof Error ? deltaErr.message : deltaErr,
              )
            }
          }
        } else {
          console.warn(
            '[/api/reason] trajectory window read failed (overlay omitted, response unaffected):',
            windowResult.error,
          )
        }
      }
    }

    // Mechanism-correction M6 (CI-5 schema + write half, 2026-06-14): persist the
    // per-consult agent trajectory keyed to the consulting credential. WRITE-ONLY
    // — the engine does NOT read this back (determinism untouched); M7 wires the
    // windowed read. Awaited (KG1 rule 2 — no fire-and-forget; Vercel terminates
    // after the response). Fail-honest: a write failure is logged and the response
    // proceeds unchanged (the guarantee never rides on a write that didn't land —
    // the M1 election). Entirely skipped (incl. the credential-context lookup) when
    // SUBSTRATE_TRAJECTORY_WRITE_ENABLED is unset → byte-identical, zero new reads.
    // Only a real examination writes a row (assessment produced; no Tier-1
    // short-circuit, no error); user-JWT consults carry no agent identity → no row.
    if (
      isTrajectoryWriteEnabled() &&
      sandwichResult.error === null &&
      sandwichResult.tier1_trigger === null &&
      sandwichResult.layer2_assessment !== null
    ) {
      let credentialRef: string | null = null
      let ownerUserId: string | null = null
      let declaredAgentId: string | null = null

      if (apiKey && apiKey.valid) {
        credentialRef = `api_key:${apiKey.api_key_id}`
        // The sr_live_ credential's operator + declared agent identity live on its
        // api_keys row (validateApiKey does not surface them). One gated, indexed
        // PK read — only when the flag is on, so flag-off adds no DB read.
        // AE-1 (KG1): when the delta block already resolved this consult's
        // context, reuse it — never two PK reads for one consult.
        const credCtx =
          sharedCredCtx ?? (await resolveCredentialContext(apiKey.api_key_id))
        ownerUserId = credCtx.owner_user_id
        declaredAgentId =
          credCtx.agent_id !== null && isAcceptedAgentId(credCtx.agent_id)
            ? credCtx.agent_id
            : null
      } else if (installAuth && installAuth.valid) {
        // A10 per-install path: the operator (owner_user_id) + install_id are on
        // the validated credential; no declared K1 agent_identity today.
        credentialRef = `install:${installAuth.install_id}`
        ownerUserId = installAuth.owner_user_id
      }

      if (credentialRef !== null) {
        const evaluatedAction = mapLayer2AssessmentToEvaluatedAction(
          sandwichResult.layer2_assessment,
          {
            // The K1 declared identity when present, else the stable credential
            // handle (the row stores credential_ref + agent_id as separate
            // columns; this projected agent_id is not the persisted windowing key
            // — M7 windows by credential_ref / agent_id columns).
            agent_id: declaredAgentId ?? credentialRef,
            evaluated_at: new Date().toISOString(),
            skill_id: 'api_reason',
            // receipt_id derives from this; correlation_id is the per-consult
            // unique handle (no signed-assessment dependency on this path).
            signature: correlationId,
            candidates_considered: 1,
          },
        )
        const trajectoryWrite = await persistAssessmentHistory({
          correlationId,
          credentialRef,
          ownerUserId,
          agentId: declaredAgentId,
          depthTier: depth,
          surface: 'api_reason',
          action: evaluatedAction,
          // AE-1 (election E-AE1-1): the Layer-1 provenance stamp — passed ONLY
          // when SUBSTRATE_TRAJECTORY_DELTA_ENABLED is on (the activation walk
          // applies the layer1_source migration BEFORE the flag; flag-off sends
          // no such column key, so a pre-migration deployment cannot PGRST204).
          // TRUE provenance, not meta.layer1_source's flag-gated emission:
          // preExtractedLayer1Schema is set on BOTH supplied paths — the plugin
          // path (which supplies its schema regardless of the key-path flag)
          // and the flag-gated key path — and whenever it is set, server-side
          // Layer-1 extraction was skipped. 'supplied' iff set.
          ...(isTrajectoryDeltaEnabled()
            ? {
                layer1Source: (preExtractedLayer1Schema !== undefined
                  ? 'supplied'
                  : 'server') as 'supplied' | 'server',
              }
            : {}),
        })
        if (!trajectoryWrite.ok) {
          console.warn(
            '[/api/reason] trajectory history write failed (response unaffected):',
            trajectoryWrite.error,
          )
        }
      }
    }

    // Branch 1 — Tier 1 force-clarification fired (3A surfacing).
    if (sandwichResult.tier1_trigger !== null && sandwichResult.output) {
      let token: string
      try {
        token = issueContinuationToken(input, sandwichResult.tier1_trigger.trigger_code)
      } catch (err) {
        if (err instanceof Tier1SecretMissingError) {
          console.error(
            '[/api/reason] Tier 1 fired but TRANSLATION_SANDWICH_TIER1_SECRET unset; ' +
            'cannot issue continuation token. Set the env var per ADR-008 §4.2.'
          )
          return await respond({
            body: {
              error: 'continuation_token_engine_unavailable',
              detail:
                'Tier 1 force-clarification is not available on this deployment. ' +
                'Submit your input again as a fresh request.',
            },
            status: 503,
            headers: corsHeaders(),
            isBillable: false,  // Server misconfig — not customer fault (even though Layer 1 ran).
          })
        }
        throw err  // outer catch returns 500
      }
      const tier1Output = sandwichResult.output as Record<string, unknown>
      tier1Output.continuation_token = token
      tier1Output.disclaimer = EVALUATIVE_DISCLAIMER
      return await respond({
        body: tier1Output,
        status: 200,
        headers: corsHeaders(),
        isBillable: true,  // Layer 1 ran — bill at base rate + any Layer 1 cost.
      })
    }

    // Branch 1.7 — A7 server-side R20a gate REDIRECT (D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13).
    //
    // A7 (inside runSandwichInner) detected moderate/acute distress and
    // short-circuited Layer 2 + Layer 3. The substrate produced a redirect
    // shape on `output` carrying the user-facing redirect_message.
    //
    // For /api/reason today this branch is mostly defence-in-depth: the
    // route-level perimeter at line 544 handles MODERATE/ACUTE before
    // runSandwich is called, so A7's REDIRECT branch should not fire in
    // steady-state /api/reason traffic. If it does fire (line 544
    // regressed, or A7 made an independent decision via fresh classifier
    // call on a future code path), the redirect surfaces here.
    //
    // The response shape matches the line 547-549 route-level redirect
    // shape so clients see consistent redirect behaviour regardless of
    // which layer caught the distress signal.
    if (sandwichResult.error === 'r20a_gate_redirect') {
      const gateOutput = sandwichResult.output as Record<string, unknown>
      // S4 (D-R20A-OPTIONA-S4-AUDIENCE-RENDERING-WIRED-2026-05-28): same
      // audience-correct rendering as the route-guard branch above. The
      // wire shape matches the route-guard branch's shape (modulo audience-
      // correct form) so clients see consistent redirect behaviour regardless
      // of which layer caught the distress signal.
      //
      // Flag-gating posture identical to the route-guard branch: flag UNSET
      // → effective audience is 'human_user' (byte-identical to pre-S4); flag
      // ON → respects r20aAudience derived from auth.user?.id.
      const effectiveAudience: R20aAudience = isR20aAudienceRenderingEnabled()
        ? r20aAudience
        : 'human_user'
      const redirectPayload = renderR20aRedirectResponse({
        audience: effectiveAudience,
        severity: gateOutput.severity as 'none' | 'mild' | 'moderate' | 'acute',
        redirect_message: String(gateOutput.redirect_message ?? ''),
      })
      return await respond({
        body: redirectPayload,
        status: 200,
        headers: corsHeaders(),
        isBillable: true,  // Layer 1 ran (A7 fires after Layer 1) — billed.
      })
    }

    // Branch 1.5 — A3 signing failure (fail-closed per ADR-layer2-signing-infrastructure §"Critical Change Protocol responses").
    //
    // When SUBSTRATE_LAYER2_SIGNING_ENABLED is 'true' on this deployment but
    // SUBSTRATE_LAYER2_SIGNING_KEY is unset/malformed (or canonicalisation
    // rejected a value), the substrate MUST NOT return an unsigned
    // assessment. The orchestrator surfaces error='signing_throw'; this
    // branch translates that into a 503 user-facing response.
    //
    // Recovery (operational): rollback Path A is to flip
    // SUBSTRATE_LAYER2_SIGNING_ENABLED=false in Vercel; existing pipeline
    // resumes immediately on the next redeploy. Path C (env var loss) is
    // restoring SUBSTRATE_LAYER2_SIGNING_KEY from the founder's three-copy
    // backup per ADR §Decision 4 Option 4A.
    //
    // Per /adopted/ADR-layer2-signing-infrastructure.md §"Critical Change
    // Protocol responses" — fail-closed posture is non-negotiable when
    // signing is enabled.
    if (sandwichResult.error === 'signing_throw') {
      console.error(
        '[/api/reason] Layer 2 signing failed; SUBSTRATE_LAYER2_SIGNING_KEY ' +
        'env var likely unset or malformed. Per ADR-layer2-signing-infrastructure §Decision 1.'
      )
      return await respond({
        body: {
          error: 'substrate_signing_unavailable',
          detail:
            'The substrate cannot produce a signed assessment on this deployment. ' +
            'This is an operational issue. If the issue persists, contact support.',
        },
        status: 503,
        headers: corsHeaders(),
        isBillable: false,  // Server misconfig (signing key) — not customer fault.
      })
    }

    // Branch 2 — Layer 1/2 throw OR Layer 3 LLM+fallback both failed (1C minimal fallback).
    if (
      sandwichResult.error === 'layer1_throw' ||
      sandwichResult.error === 'validation_throw' ||
      sandwichResult.error === 'layer3_throw'
    ) {
      return await respond({
        body: buildMinimalFallback(sandwichResult.error),
        status: 200,
        headers: corsHeaders(),
        isBillable: true,  // Whatever cost was incurred up to the throw is in the accumulator; billed.
      })
    }

    // Branch 3 — happy path: composed sandwich output. Add R3 disclaimer + previousTrigger meta.
    const output = sandwichResult.output as Record<string, unknown>
    output.disclaimer = EVALUATIVE_DISCLAIMER
    if (previousTrigger !== null) {
      const meta = (output.meta as Record<string, unknown>) ?? {}
      meta.previous_trigger = previousTrigger
      output.meta = meta
    }
    // M1 CI-1 (2026-06-12): deferred-response affordances. Absent entirely
    // when SUBSTRATE_L3_DEFER_ENABLED is unset (byte-identity).
    if (l3DeferEnabled && narrativeStatus !== undefined) {
      const meta = (output.meta as Record<string, unknown>) ?? {}
      meta.narrative_status = narrativeStatus
      output.meta = meta
      if (sandwichResult.prose_deferred) {
        // The retrieval pointer: the narrative is being generated and retained
        // server-side against this id (CI-17 — it WILL exist; waitUntil now,
        // the narrative-sweep backstop otherwise). The retrieval surface in M1
        // is the audit query; a public GET is a later session (R17a auth).
        output.narrative = {
          status: 'deferred',
          correlation_id: correlationId,
        }
      }
    }
    // M1 CI-2 (2026-06-12): Layer-1 source honesty. Absent entirely when
    // SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED is unset (byte-identity).
    if (keyPathSchemaEnabled) {
      const meta = (output.meta as Record<string, unknown>) ?? {}
      meta.layer1_source =
        preExtractedLayer1Schema !== undefined ? 'supplied' : 'server'
      output.meta = meta
    }
    // M5 CI-13 (2026-06-13): the reflect-at-close practice hint on the completed
    // consult. Absent entirely when SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED is
    // unset (byte-identity). Discoverability only — no server-side reflect call.
    if (isPracticeCycleHintEnabled()) {
      output.practice = PRACTICE_CYCLE_HINT
    }
    // M7 CI-5 (2026-06-14): the honest trajectory overlay under meta.trajectory.
    // Absent entirely when SUBSTRATE_TRAJECTORY_READ_ENABLED is unset
    // (trajectoryOverlay undefined → byte-identity). prior_instances / window /
    // confidence_weighted ride alongside the existing layer-latency meta;
    // sparse-evidence-honest (single_snapshot/low on a fresh or near-fresh
    // credential). typical_proximity here is CI-15's proximity-calibration input
    // (the agent applies the published two-gate depth rule — no server-side depth
    // override; the engine output above is unchanged).
    if (trajectoryOverlay !== undefined) {
      const meta = (output.meta as Record<string, unknown>) ?? {}
      meta.trajectory = trajectoryOverlay
      output.meta = meta
    }
    return await respond({
      body: output,
      status: 200,
      headers: corsHeaders(),
      isBillable: true,
    })
  } catch (error) {
    console.error('sage-reason API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    // Catch-all 500 — emit X-Loop-* headers if metering was set up but skip the
    // ledger write (uncertain whether the failure was customer-side or server-side;
    // fail-open on the bill rather than charging for a server error).
    if (loopAccumulator && loopId && apiKey && apiKey.valid) {
      const state = loopAccumulator.getState()
      return NextResponse.json(
        { error: message },
        {
          status: 500,
          headers: {
            ...buildLoopHeaders({ loopId, state }),
          },
        }
      )
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * 1C deterministic minimal fallback shape (M1-CP6 design choice 1C, 2026-05-08).
 * Returned when Layer 1/2 throws or Layer 3 LLM AND deterministic fallback both fail.
 * Honest about the failure; no bundled call (parallel-run retired per 2A); structured
 * per ADR-004 §2.1 shape so consumers parsing the new schema don't break on null fields.
 *
 * R3 evaluative disclaimer included.
 */
function buildMinimalFallback(
  reason: 'layer1_throw' | 'validation_throw' | 'layer3_throw'
): Record<string, unknown> {
  return {
    version: 'translation-sandwich-v1',
    extraction: null,
    assessment: null,
    prose: {
      philosophical_reflection:
        'The reasoning engine could not complete an evaluation for this input. ' +
        'The framework itself is unaffected — the limitation is in this single processing run. ' +
        'Stoic practice asks us to engage with what is within our control: this temporary ' +
        'limitation is one such case.',
      improvement_guidance:
        'Please try again. If the issue persists, consider rephrasing the input or shortening it. ' +
        'Direct reflection or human counsel may also serve well — algorithmic analysis is one tool ' +
        'among several.',
      summary:
        'Evaluation unavailable for this run; the framework remains available on retry.',
    },
    meta: {
      engine_attribution: 'translation-sandwich',
      fallback: true,
      fallback_reason: reason,
    },
    disclaimer: EVALUATIVE_DISCLAIMER,
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}
