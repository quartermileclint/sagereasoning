/**
 * /api/mentor/ring/proof — Ring Wrapper single-endpoint proof (PR1)
 *
 * PURPOSE: Proof that the Ring Wrapper (sage-mentor/ring-wrapper.ts) can run
 * end-to-end inside the live website. PR1 says prove an architectural pattern
 * on a single endpoint before rolling out — this is that single endpoint.
 *
 * This route is INTENTIONALLY a proof, not a permanent feature:
 *   - Founder-only (FOUNDER_USER_ID gate)
 *   - Uses the live profile store (loadMentorProfile), with hand-constructed
 *     fixture profile as fallback when the live profile is absent
 *     (post-ADR-Ring-2-01 Session 1, 25 April 2026)
 *   - Uses the live mentor_interactions loader, with PROOF_INTERACTIONS fixture
 *     as fallback when no live rows exist (post-ADR-PE-01 Session 5, 26 April 2026)
 *   - Does NOT write to mentor_interactions (avoids KG3 hub-label surface)
 *   - Returns the full ring trace in the JSON response for verification
 *
 * Risk: Elevated (per project instructions §0d-ii).
 * Approved: Founder, 25 Apr 2026.
 *
 * Rules served:
 *   R20a (distress classifier invoked via SafetyGate, AC4 invocation pattern)
 *   PR1 (single-endpoint proof before rollout)
 *   PR2 (verified in same session)
 *   KG1 rule 2 (Supabase writes — none here)
 *   KG2 (model selection via constraints + ring's selectModelTier)
 *   KG3 (no mentor_interactions write — out of scope for this proof)
 *
 * Rollback: delete this file, the bridge, and the fixture file. Revert the
 * commit. Rollback steps documented in the session-close handoff.
 */

import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import {
  checkRateLimit,
  RATE_LIMITS,
  requireAuth,
  validateTextLength,
  TEXT_LIMITS,
  corsHeaders,
  corsPreflightResponse,
} from '@/lib/security'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import { enforceDistressCheck } from '@/lib/constraints'
import { extractJSON } from '@/lib/json-utils'
import { loadRingFunctions } from '@/lib/sage-mentor-ring-bridge'
import type {
  BeforeResult,
  AfterResult,
  PatternAnalysis,
  MentorProfile,
} from '@/lib/sage-mentor-ring-bridge'
import { PROOF_PROFILE, PROOF_INTERACTIONS } from '@/lib/mentor-ring-fixtures'
import { loadMentorProfile, saveMentorProfile } from '@/lib/mentor-profile-store'
import {
  loadMentorInteractionsAsRecords,
  type InteractionsHubId,
} from '@/lib/mentor-interactions-loader'
import type { InteractionRecord } from '@/lib/sage-mentor-ring-bridge'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const PROOF_INNER_AGENT_ID = 'ring-proof-reflector'
const PROOF_INNER_AGENT_NAME = 'Stoic Reflection Inner Agent'

/**
 * The "inner agent" for the proof: a simple Stoic reflection LLM call.
 * Produces a short reasoned response to the task description, which the
 * AFTER phase then evaluates.
 *
 * Kept deliberately small — the proof is about the ring, not the inner
 * agent's quality.
 */
const INNER_AGENT_PROMPT = `You are a Stoic reflection assistant. The user describes a task they are considering. Respond in 2-4 sentences with a brief reasoned reflection on the task: what is in the user's control, what is not, and a practical first step.

Be plain. Do not preach. Do not claim authority. This is the inner agent's output — the Sage Mentor ring will evaluate it after.`

// =============================================================================
// CORS
// =============================================================================

export async function OPTIONS() {
  return corsPreflightResponse()
}

// =============================================================================
// POST — Run a task through the Ring Wrapper
// =============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  // Rate limit (admin-tier — proof endpoint, low traffic expected)
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  // Auth required
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  // FOUNDER-ONLY GATE — proof endpoint, not for general users
  const founderId = process.env.FOUNDER_USER_ID
  if (!founderId || auth.user.id !== founderId) {
    return NextResponse.json(
      { error: 'This endpoint is restricted to the founder (proof endpoint).' },
      { status: 403, headers: corsHeaders() },
    )
  }

  try {
    const body = await request.json().catch(() => ({}))
    const taskDescription: unknown = body?.task_description

    if (!taskDescription || typeof taskDescription !== 'string' || taskDescription.trim().length < 5) {
      return NextResponse.json(
        { error: 'task_description is required (string, min 5 characters)' },
        { status: 400, headers: corsHeaders() },
      )
    }

    const lengthError = validateTextLength(taskDescription, 'task_description', TEXT_LIMITS.medium)
    if (lengthError) {
      return NextResponse.json({ error: lengthError }, { status: 400, headers: corsHeaders() })
    }

    // ─── HUB_ID PARAMETER (ADR-PE-01 Session 3.5, 26 April 2026) ─────────
    // Optional `hub_id` on the request body. Defaults to 'private-mentor'
    // for back-compat with Sessions 1/2 (every existing probe call without
    // this field continues to behave exactly as before). Allowed values:
    // 'private-mentor', 'founder-mentor'. Any other value returns 400 — the
    // explicit allowlist prevents writing pattern_analyses under an arbitrary
    // label that no reader would ever look for (KG3 discipline at the writer).
    //
    // The validated value (`proofHubId`) is used at both the reader site
    // (~line 240) and writer site (~line 300) of this route. Single local
    // variable — no drift surface within the route. KG3 (hub-label end-to-
    // end contract): every consumer reading pattern_analyses[label] must
    // use a label from the same allowlist.
    //
    // Seeding role: the 'founder-mentor' branch lets this proof endpoint
    // act as the seed source for /api/founder/hub Session 4 (Adopted 26
    // April 2026). One probe with hub_id: 'founder-mentor' populates the
    // entry from the PROOF_INTERACTIONS fixture; founder-hub then reads
    // that entry under per_request cadence + 2A-skip on absence.
    const VALID_PROOF_HUBS = ['private-mentor', 'founder-mentor'] as const
    type ProofHubId = typeof VALID_PROOF_HUBS[number]
    const requestedHubId: unknown = body?.hub_id
    let proofHubId: ProofHubId
    if (requestedHubId === undefined || requestedHubId === null) {
      proofHubId = 'private-mentor'
    } else if (
      typeof requestedHubId === 'string' &&
      (VALID_PROOF_HUBS as readonly string[]).includes(requestedHubId)
    ) {
      proofHubId = requestedHubId as ProofHubId
    } else {
      return NextResponse.json(
        {
          error: `hub_id must be one of: ${VALID_PROOF_HUBS.join(', ')}. Received: ${JSON.stringify(requestedHubId)}.`,
        },
        { status: 400, headers: corsHeaders() },
      )
    }

    // ─── BYPASS_PATTERN_CACHE PARAMETER (ADR-PE-01 Session 5, 26 Apr 2026) ─
    // Optional `bypass_pattern_cache` boolean on the request body. When true,
    // the read site below skips the cache-precedence short-circuit and forces
    // the recompute branch (live loader on live profile; fixture on fallback).
    // Default false — back-compat with all existing probes (Sessions 1, 2, 3,
    // 3.5, 4 verifications all assume false).
    //
    // Verification role: this is the deterministic mechanism for exercising
    // the live mentor_interactions loader on cache-warm labels (worst case J,
    // accepted at session open). Without bypass, the founder's existing
    // pattern_analyses['founder-mentor'] and ['private-mentor'] entries would
    // never cache-miss under normal traffic, so the loader could not be
    // verified live. Side effect: when bypass is true and the persistence
    // block fires, the persisted entry is overwritten by the recomputed
    // result. Q-Backfill posture: opt-in only; the founder controls when
    // overwrites happen.
    //
    // Risk classification (worst case F): optional field, default false,
    // strict type check. Anything other than `undefined`, `true`, or `false`
    // returns 400. Back-compat preserved for absent / null fields.
    const requestedBypass: unknown = body?.bypass_pattern_cache
    let bypassPatternCache: boolean
    if (requestedBypass === undefined || requestedBypass === null) {
      bypassPatternCache = false
    } else if (typeof requestedBypass === 'boolean') {
      bypassPatternCache = requestedBypass
    } else {
      return NextResponse.json(
        {
          error: `bypass_pattern_cache must be a boolean. Received: ${JSON.stringify(requestedBypass)}.`,
        },
        { status: 400, headers: corsHeaders() },
      )
    }

    // R20a — distress check via SafetyGate (AC4 invocation pattern)
    const gate = await enforceDistressCheck(detectDistressTwoStage(taskDescription))
    if (gate.shouldRedirect) {
      // Log distress detection (no ring trace stored)
      await supabaseAdmin
        .from('analytics_events')
        .insert({
          event_type: 'distress_detected',
          user_id: auth.user.id,
          metadata: {
            severity: gate.result.severity,
            indicators: gate.result.indicators_found,
            mentor_mode: 'proof',
            endpoint: '/api/mentor/ring/proof',
          },
        })

      return NextResponse.json(
        {
          distress_detected: true,
          severity: gate.result.severity,
          redirect_message: gate.result.redirect_message,
        },
        { status: 200, headers: corsHeaders() },
      )
    }

    // Load the ring functions through the bridge
    const ring = await loadRingFunctions()
    if (!ring) {
      return NextResponse.json(
        { error: 'Ring Wrapper module unavailable in build context.' },
        { status: 500, headers: corsHeaders() },
      )
    }

    // ─── PROFILE SOURCE ──────────────────────────────────────────────────
    // ADR-Ring-2-01 Session 1 (Adopted 25 Apr 2026). Use the canonical
    // loader for live data; fall back to the existing PROOF_PROFILE fixture
    // if no profile is persisted for this user (founder choice at session
    // open: "(a) PROOF_PROFILE fallback").
    //
    // Risk: Elevated. Encryption-adjacent (canonical loader sits next to
    // the encryption pipeline) and on the production request path. No
    // safety surface modified — distress classifier above is unchanged.
    let profile: MentorProfile = PROOF_PROFILE
    let profileSource: 'live_canonical' | 'fixture_fallback' = 'fixture_fallback'
    let profileLoaderError: string | null = null
    try {
      const loaded = await loadMentorProfile(auth.user.id)
      if (loaded) {
        profile = loaded.profile
        profileSource = 'live_canonical'
      }
    } catch (loaderErr) {
      profileLoaderError =
        loaderErr instanceof Error ? loaderErr.message : 'unknown loader error'
      console.error('[mentor/ring/proof] Canonical loader error:', loaderErr)
      // Continue with PROOF_PROFILE — proof endpoint must remain exercisable
      // even if the live loader degrades.
    }

    // Get-or-register the inner agent (idempotent across requests)
    let innerAgent = ring.getInnerAgent(PROOF_INNER_AGENT_ID)
    if (!innerAgent) {
      innerAgent = ring.registerInnerAgent(
        PROOF_INNER_AGENT_ID,
        PROOF_INNER_AGENT_NAME,
        'assistant',
      )
    }

    const task = {
      task_id: `proof-${Date.now()}`,
      inner_agent_id: PROOF_INNER_AGENT_ID,
      task_description: taskDescription,
      timestamp: new Date().toISOString(),
    }

    // Start a ring session — collects token usage across phases
    const session = ring.startRingSession(task, innerAgent)

    // ─── PATTERN-ENGINE PASS ─────────────────────────────────────────────
    // PR1 single-endpoint proof of pattern-engine wiring (added 25 Apr 2026).
    // Deterministic — no LLM call. Wrapped in try/catch so an engine failure
    // cannot break the existing ring trace.
    //
    // ADR-PE-01 Session 2, Option 2A (Adopted 26 Apr 2026): prefer the
    // persisted analysis from profile.pattern_analyses[proofHubId] when
    // present; fall back to recompute when absent. The persistence block
    // below still fires per_request when profile_source === 'live_
    // canonical', so the persisted entry is rewritten on every probe with
    // the same content (only `version` bumps — `computed_at` freezes by
    // design under 2A + per_request, see CCP worst case B, 26 Apr 2026).
    //
    // ADR-PE-01 Session 3.5 (Adopted 26 Apr 2026): the hardcoded
    // 'private-mentor' literal on this read site has been replaced with
    // the validated `proofHubId` local variable derived from the request
    // body's `hub_id` field (default 'private-mentor'). Allows the proof
    // endpoint to seed pattern_analyses['founder-mentor'] for the Session 4
    // founder-hub consumer.
    //
    // ADR-PE-01 Session 5 (Adopted 26 Apr 2026): the recompute branch now
    // uses live mentor_interactions data via loadMentorInteractionsAsRecords
    // when profileSource === 'live_canonical', falling back to PROOF_INTERACTIONS
    // when fixture_fallback. The cache read is gated on !bypassPatternCache
    // so verification probes can force the recompute branch on cache-warm
    // labels — the deterministic mechanism for exercising the live loader
    // (worst case J accepted at session open). Q-Loader-Scope hub-scoped,
    // Q-Loader-Cadence per-consumer-request, Q-Loader-Source last 90 days +
    // limit 100. The diagnostic field `interactions_source` on the response
    // surfaces which path fired (live_loader vs fixture_fallback vs null on
    // cache hit).
    //
    // KG3 (hub-label end-to-end): the read site here uses `proofHubId`,
    // which is the same local variable used at the writer site
    // (~line 380 below) and at the loader call (just below). Single local
    // variable — no drift surface within this route. Any future consumer
    // route reading pattern_analyses[label] must use a label from the same
    // allowlist (VALID_PROOF_HUBS) or the canonical mapper
    // (mapRequestHubToContextHub in /api/founder/hub).
    let patternAnalysis: PatternAnalysis | null = null
    let patternSource: 'persisted' | 'recomputed' | null = null
    let patternEngineError: string | null = null
    let interactionsSource: 'live_loader' | 'fixture_fallback' | null = null
    let interactionsCount: number | null = null
    try {
      const persisted = profile.pattern_analyses?.[proofHubId] ?? null
      if (persisted && !bypassPatternCache) {
        // Cache hit — short-circuit. Loader does not fire. interactionsSource
        // stays null on the response (diagnostic: cache-hit branch).
        patternAnalysis = persisted
        patternSource = 'persisted'
      } else {
        // Recompute branch — fires on cache miss (no persisted entry for
        // this hub) OR on bypass_pattern_cache=true.
        let interactions: InteractionRecord[] = PROOF_INTERACTIONS
        interactionsSource = 'fixture_fallback'
        if (profileSource === 'live_canonical') {
          // Profile_id lookup for the loader's hub-scoped query. The proof
          // endpoint only enters this branch after a successful
          // loadMentorProfile(), which implies a row exists; this lookup
          // gets the row's `id` separately. Worst case E mitigation: on null
          // (lookup race / RLS regression / concurrent delete), fall through
          // to fixture rather than throwing.
          const { data: profileRow, error: profileLookupErr } = await supabaseAdmin
            .from('mentor_profiles')
            .select('id')
            .eq('user_id', auth.user.id)
            .single()
          if (profileLookupErr) {
            console.error(
              '[mentor/ring/proof] profile_id lookup error (loader fallback to fixture):',
              profileLookupErr,
            )
          }
          const profileId = (profileRow as { id?: string } | null)?.id ?? null
          if (profileId) {
            // Live loader: hub-scoped, last 90 days, limit 100 most recent.
            // Worst cases A/B/C/D mitigated inside the loader (try/catch +
            // defensive row mapping). Returns [] on any error — recompute
            // proceeds with empty input and produces a structurally valid
            // empty PatternAnalysis. KG3 hub-label drift mitigated by the
            // shared `proofHubId` cast to InteractionsHubId (the two types
            // are structurally identical; the cast documents intent).
            interactions = await loadMentorInteractionsAsRecords(
              profileId,
              proofHubId as InteractionsHubId,
              { windowDays: 90, limit: 100 },
            )
            interactionsSource = 'live_loader'
          }
        }
        interactionsCount = interactions.length
        patternAnalysis = ring.analysePatterns(profile, interactions, null)
        patternSource = 'recomputed'
      }
    } catch (engineErr) {
      patternEngineError = engineErr instanceof Error ? engineErr.message : 'unknown error'
      console.error('[mentor/ring/proof] Pattern-engine error:', engineErr)
    }
    const ringSummary = patternAnalysis?.ring_summary ?? null

    // ─── PATTERN-ANALYSIS PERSISTENCE ────────────────────────────────────
    // ADR-PE-01 Session 1, Option 1A (Adopted 26 April 2026). Read-modify-
    // write of the encrypted profile blob: the pattern_analyses sub-key is
    // updated for hub `proofHubId` and the full profile is re-encrypted
    // and re-saved. Critical risk under PR6 (encryption pipeline blast
    // radius). Founder-only traffic via the gate above.
    //
    // Cadence: per-request (founder selection at Session 1 plan walk,
    // 26 April 2026). Every probe writes when profile loaded live. ADR §7.2
    // O-PE-01-D — revisit at Session 2 once read side is wired and write-
    // load picture is clearer. Resolved for Sessions 1, 2, 3 — per_request.
    //
    // ADR-PE-01 Session 3.5 (Adopted 26 April 2026): the hardcoded
    // 'private-mentor' literal at the writer site has been replaced with
    // the validated `proofHubId` local variable. The hub_id field in the
    // patternPersistence diagnostic also reflects the validated value, so
    // probes can confirm round-trip correctness for both labels.
    //
    // Hub-key (KG3): both the reader (~line 240 above) and the writer
    // (below) use the same `proofHubId` local variable. Single source of
    // truth within this route. The canonical mapper is
    // mapRequestHubToContextHub (used in /api/founder/hub for request-
    // derived hub_ids); any future endpoint that takes hub_id from the
    // request must use that mapper or its own equivalent allowlist before
    // writing pattern_analyses[hub_id]. Allowed labels at the writer
    // (VALID_PROOF_HUBS): 'private-mentor', 'founder-mentor'.
    //
    // Read-modify-write discipline (ADR §6.3): the loaded `profile` object
    // is spread into the writeable shape with only pattern_analyses set;
    // every other field round-trips unchanged because we hand back the
    // exact object loadMentorProfile returned, plus the new field.
    //
    // Skip conditions:
    //   - profile_source === 'fixture_fallback' — no real profile to write to
    //   - patternAnalysis === null — engine failed; nothing to persist
    let patternPersistence: {
      attempted: boolean
      ok: boolean
      version: number | null
      error: string | null
      hub_id: string
      cadence_used: 'per_request' | 'throttled' | 'lazy'
    } = {
      attempted: false,
      ok: false,
      version: null,
      error: null,
      hub_id: proofHubId,
      cadence_used: 'per_request',
    }
    if (profileSource === 'live_canonical' && patternAnalysis) {
      patternPersistence.attempted = true
      try {
        const mutatedProfile: MentorProfile = {
          ...profile,
          pattern_analyses: {
            ...(profile.pattern_analyses ?? {}),
            [proofHubId]: patternAnalysis,
          },
        }
        // KG1 rule 2: awaited. No fire-and-forget on Vercel.
        const saveResult = await saveMentorProfile(auth.user.id, mutatedProfile)
        patternPersistence.ok = saveResult.success
        patternPersistence.version = saveResult.version
        patternPersistence.error = saveResult.error ?? null
      } catch (saveErr) {
        patternPersistence.error =
          saveErr instanceof Error ? saveErr.message : 'unknown save error'
        console.error('[mentor/ring/proof] Pattern-analysis save error:', saveErr)
      }
    }

    // ─── BEFORE PHASE ─────────────────────────────────────────────────────
    const before = ring.executeBefore(profile, task, innerAgent)
    let beforeResult: BeforeResult = before.result
    let beforeRawLlmJson: unknown = null
    // Track whether the BEFORE prompt was augmented with the pattern summary,
    // so the verification step can confirm the architectural pattern fired.
    let augmentedPromptIncludesPatterns = false

    if (before.needsLlmCheck && before.llmPrompt) {
      // Append the pattern summary to the BEFORE prompt as a new section.
      // Composition order (KG6): user-message zone, after the existing
      // structured prompt — same authority level as profile context.
      let llmPromptToSend = before.llmPrompt
      if (ringSummary) {
        llmPromptToSend = `${before.llmPrompt}\n\nRECURRING PATTERNS DETECTED ACROSS PRIOR INTERACTIONS:\n${ringSummary}\n\n(These are deterministic aggregations from this practitioner's recent interaction history — diagnostic, not punitive. Reference them where relevant; do not repeat verbatim.)`
        augmentedPromptIncludesPatterns = true
      }

      const beforeMessage = await client.messages.create({
        model: ring.MODEL_IDS[before.modelTier],
        max_tokens: 800,
        temperature: 0.2,
        messages: [{ role: 'user', content: llmPromptToSend }],
      })

      ring.addSessionTokenUsage(
        session,
        beforeMessage.usage.input_tokens,
        beforeMessage.usage.output_tokens,
        before.modelTier,
        'before',
      )

      const beforeText =
        beforeMessage.content[0]?.type === 'text' ? beforeMessage.content[0].text : ''
      try {
        const parsed = extractJSON(beforeText) as Record<string, unknown>
        beforeRawLlmJson = parsed
        // Merge LLM observations onto the locally-derived BeforeResult.
        // Local fields (journal_reference object, mechanisms_applied) win;
        // LLM fields fill in narrative slots.
        beforeResult = {
          ...beforeResult,
          concerns:
            Array.isArray(parsed.concerns) && parsed.concerns.length > 0
              ? [...beforeResult.concerns, ...(parsed.concerns as string[])]
              : beforeResult.concerns,
          enrichment_suggestion:
            typeof parsed.enrichment_suggestion === 'string'
              ? parsed.enrichment_suggestion
              : beforeResult.enrichment_suggestion,
          mentor_note:
            typeof parsed.mentor_note === 'string'
              ? parsed.mentor_note
              : beforeResult.mentor_note,
          proceed:
            typeof parsed.proceed === 'boolean' ? parsed.proceed : beforeResult.proceed,
        }
      } catch (parseErr) {
        console.error('[mentor/ring/proof] BEFORE LLM JSON parse error:', parseErr)
        // Non-fatal — keep the locally-derived BeforeResult.
      }
    }

    // ─── INNER AGENT ─────────────────────────────────────────────────────
    // Runs Sonnet to produce a Stoic reflection on the task.
    // The ring then evaluates this output in the AFTER phase.
    const innerMessage = await client.messages.create({
      model: ring.MODEL_IDS.deep,
      max_tokens: 400,
      temperature: 0.4,
      system: INNER_AGENT_PROMPT,
      messages: [{ role: 'user', content: taskDescription }],
    })

    ring.addSessionTokenUsage(
      session,
      innerMessage.usage.input_tokens,
      innerMessage.usage.output_tokens,
      'deep',
      'before', // No 'inner' phase exists in the type — log under 'before' adjacency
    )

    const innerOutput =
      innerMessage.content[0]?.type === 'text' ? innerMessage.content[0].text : ''

    // ─── AFTER PHASE ─────────────────────────────────────────────────────
    const after = ring.executeAfter(
      profile,
      task,
      innerOutput,
      innerAgent,
      beforeResult.concerns.length > 0,
    )

    let afterRawLlmJson: unknown = null
    let afterResult: AfterResult = {
      reasoning_quality: profile.proximity_level,
      passions_detected: [],
      pattern_note: null,
      journal_reference: null,
      mentor_observation: null,
      record_to_profile: false,
      mechanisms_applied: ['control_filter', 'value_assessment'],
    }

    if (after.needsLlmCheck && after.llmPrompt) {
      const afterMessage = await client.messages.create({
        model: ring.MODEL_IDS[after.modelTier],
        max_tokens: 1000,
        temperature: 0.2,
        messages: [{ role: 'user', content: after.llmPrompt }],
      })

      ring.addSessionTokenUsage(
        session,
        afterMessage.usage.input_tokens,
        afterMessage.usage.output_tokens,
        after.modelTier,
        'after',
      )

      const afterText =
        afterMessage.content[0]?.type === 'text' ? afterMessage.content[0].text : ''
      try {
        const parsed = extractJSON(afterText) as Record<string, unknown>
        afterRawLlmJson = parsed
        afterResult = {
          reasoning_quality:
            (typeof parsed.reasoning_quality === 'string'
              ? parsed.reasoning_quality
              : afterResult.reasoning_quality) as AfterResult['reasoning_quality'],
          passions_detected: Array.isArray(parsed.passions_detected)
            ? (parsed.passions_detected as AfterResult['passions_detected'])
            : afterResult.passions_detected,
          pattern_note:
            typeof parsed.pattern_note === 'string' ? parsed.pattern_note : null,
          journal_reference: null, // LLM returns a string summary, not a JournalReference
          mentor_observation:
            typeof parsed.pattern_note === 'string' ? parsed.pattern_note : null,
          record_to_profile:
            typeof parsed.record_to_profile === 'boolean'
              ? parsed.record_to_profile
              : false,
          mechanisms_applied: ['control_filter', 'value_assessment'],
        }
      } catch (parseErr) {
        console.error('[mentor/ring/proof] AFTER LLM JSON parse error:', parseErr)
      }
    }

    // Complete the ring session and assemble the trace
    const result = ring.completeRingSession(session, beforeResult, innerOutput, afterResult)
    const totalDurationMs = Date.now() - startTime

    return NextResponse.json(
      {
        ok: true,
        proof_endpoint: '/api/mentor/ring/proof',
        task: {
          task_id: task.task_id,
          task_description: taskDescription,
        },
        inner_agent: {
          id: innerAgent.id,
          name: innerAgent.name,
          authority_level: innerAgent.authority_level,
          actions_completed: innerAgent.actions_completed,
        },
        before: {
          result: beforeResult,
          needsLlmCheck: before.needsLlmCheck,
          modelTier: before.modelTier,
          raw_llm_json: beforeRawLlmJson,
          augmented_prompt_includes_patterns: augmentedPromptIncludesPatterns,
        },
        inner_output: innerOutput,
        after: {
          result: afterResult,
          needsLlmCheck: after.needsLlmCheck,
          modelTier: after.modelTier,
          side_effects: after.sideEffects,
          critical_category: after.criticalCategory,
          raw_llm_json: afterRawLlmJson,
        },
        pattern_analysis: patternAnalysis,
        pattern_source: patternSource,
        pattern_engine_error: patternEngineError,
        pattern_persistence: patternPersistence,
        // ADR-PE-01 Session 5 diagnostics. interactions_source: which input
        // path fired on the recompute branch ('live_loader' / 'fixture_fallback'
        // / null on cache hit). interactions_count: row count fed into
        // analysePatterns on the recompute branch (null on cache hit).
        // bypass_pattern_cache_used: echoes the request body field for
        // verification round-trip.
        interactions_source: interactionsSource,
        interactions_count: interactionsCount,
        bypass_pattern_cache_used: bypassPatternCache,
        profile_source: profileSource,
        profile_loader_error: profileLoaderError,
        token_summary: result.token_summary,
        total_duration_ms: totalDurationMs,
        notes: [
          'This endpoint is a PR1 single-endpoint proof of the Ring Wrapper.',
          'Profile source: live canonical loader (loadMentorProfile) when a',
          'persisted profile exists for the founder; falls back to PROOF_PROFILE fixture otherwise.',
          'Interactions source: hand-constructed fixture (PROOF_INTERACTIONS).',
          'Pattern-engine runs deterministically (no LLM) on the fixture interactions.',
          'When the BEFORE LLM check fires, the BEFORE prompt is augmented with pattern_analysis.ring_summary.',
          'Pattern-analysis persistence: ADR-PE-01 Session 1, Option 1A (Adopted 26 Apr 2026).',
          'Pattern-analysis read precedence: ADR-PE-01 Session 2, Option 2A (Adopted 26 Apr 2026).',
          'Hub_id parameterisation: ADR-PE-01 Session 3.5, Option 3.5-α (Adopted 26 Apr 2026).',
          'Optional hub_id field on the request body, default \'private-mentor\' (back-compat).',
          'Allowed values: \'private-mentor\', \'founder-mentor\'. Any other value returns 400.',
          'When profile_source === "live_canonical" and patternAnalysis is non-null,',
          'pattern_analyses[proofHubId] is written to the encrypted blob (per_request cadence).',
          'Critical risk under PR6 (encryption pipeline). Read-modify-write per ADR §6.3.',
          'When profile.pattern_analyses[proofHubId] is present AND bypass_pattern_cache is false,',
          'the route uses it directly (pattern_source: "persisted") and skips the deterministic',
          'recompute. When absent OR when bypass_pattern_cache is true, falls back to',
          'ring.analysePatterns (pattern_source: "recomputed"). Under 2A + per_request cadence,',
          'computed_at freezes after first hit; version bumps every probe.',
          'Live mentor_interactions loader: ADR-PE-01 Session 5, Q-Loader-* (Adopted 26 Apr 2026).',
          'When recompute fires AND profile_source === "live_canonical", the recompute branch',
          'reads mentor_interactions rows scoped to (profile_id, proofHubId), last 90 days,',
          'limit 100, mapped through loadMentorInteractionsAsRecords. interactions_source field',
          'on the response surfaces "live_loader" vs "fixture_fallback" vs null (on cache hit).',
          'Optional bypass_pattern_cache request-body boolean (default false): when true, the',
          'cache-precedence short-circuit is skipped and the recompute branch fires unconditionally',
          '— the deterministic mechanism for exercising the live loader on cache-warm labels.',
          'No write to mentor_interactions — KG3 hub-label surface still deferred for that table.',
          'Canonical-loader transition: ADR-Ring-2-01 Session 1 (25 Apr 2026, Adopted).',
        ],
      },
      { status: 200, headers: corsHeaders() },
    )
  } catch (err) {
    console.error('[mentor/ring/proof] Unhandled error:', err)
    return NextResponse.json(
      {
        error: 'Ring proof endpoint failed.',
        message: err instanceof Error ? err.message : 'unknown error',
      },
      { status: 500, headers: corsHeaders() },
    )
  }
}
