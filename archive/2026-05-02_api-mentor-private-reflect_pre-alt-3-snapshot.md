# Snapshot — `/api/mentor/private/reflect` Pre-Alt-3 As-Built Behaviour

**Status:** Snapshot (documentary).
**Date:** 2026-05-02.
**Stream:** founder.
**Purpose:** Per D24 §"As-built rollback baseline pointer" (Route 8) — a documentary record of the daily-reflection ritual surface as it stands today, before the alt-3 engine substitution lands in Phase-2 pass 2 (D14a). This snapshot is the comparison reference for post-build verification per D14a §"Founder-performable verification specification" §"Verification 1 — Visible output preserved."

**Route source as of this snapshot:** `/website/src/app/api/mentor/private/reflect/route.ts` at git ref `1e7cffa` (commit "translation and ritual"). Page-side caller: `/website/src/app/private-mentor/page.tsx` at the same ref.

**Cross-references:**
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture; AC-12 / AC-19 — the substitution this snapshot precedes).
- `/drafts/rag-mentor-alt3/reflect-endpoint-14a-daily-ritual.md` (D14a — the alt-3 design that replaces this pre-alt-3 behaviour at Phase-2 pass 2).
- `/drafts/rag-mentor-alt3/consumer-workflow-audit.md` (D24 — Route 8 §"Server-side workflow" + §"As-built rollback baseline pointer", which recommended this snapshot).
- `/archive/2026-04-29_end-to-end-mentor-pipeline_snapshot.md` (the existing conversation-surface snapshot — partial coverage of the founder-hub mentor pipeline; this snapshot covers the ritual surface specifically).
- `/manifest.md` AC1, AC2, AC4, AC5 (R20a perimeter — this route is the eighth route), AC6 (four-layer context), KG1 (Vercel rules), KG3 (hub-label end-to-end contract), KG7 (JSONB storage format), R3, R7, R17, R20a, R20d.

---

## Plain-language summary

The current daily-reflection ritual surface on `/private-mentor` is a founder-only morning check-in and evening reflection flow. Practitioner clicks into MorningView or EveningView, types a reflection, submits via `submitRitual('morning' | 'evening')`. The route `/api/mentor/private/reflect` validates and authenticates, runs R20a distress detection, loads the rich Layer 2 (practitioner profile) + Layer 3 (project context) + Layer 5 (mentor knowledge base) context, calls Claude Sonnet directly with `REFLECTION_PROMPT`, parses the JSON response, persists to the `reflections` table, logs `structured_observation` to `mentor_observations_structured`, runs the pattern-engine pass per ADR-PE-01 (cache-hit / recompute-on-bypass), updates the practitioner's mentor profile via the self-improving feedback loop (`updateProfileFromReflection`), and returns the formatted response which the page renders as a message bubble (`**proximity** — sage_perspective` plus optionally `*evening_prompt*`).

This snapshot is the documentary record of that end-to-end behaviour. After Phase-2 pass 2 substitutes the deterministic engine for the direct Claude call (per D14a), this snapshot is the reference for verifying the substitution preserves visible output (Verification 1) and the persistence pipelines (Verifications 2–5).

## Server-side workflow (`/api/mentor/private/reflect/route.ts`)

### Step 1 — Rate-limit gate

`checkRateLimit(request, RATE_LIMITS.scoring)`. Standard scoring rate limit (per `/lib/security`).

### Step 2 — Authentication gate

`requireAuth(request)`. User-auth only. Plus founder-only enforcement: `if (!founderId || auth.user.id !== founderId) return 403`. Restricted to the `FOUNDER_USER_ID` env var.

### Step 3 — Body parse

Required: `what_happened` (string).
Optional: `how_i_responded` (string), `user_id` (string), `bypass_pattern_cache` (boolean per ADR-PE-01 Session 6 — strict typeof check; non-boolean returns 400).

Length validation: both `what_happened` and `how_i_responded` (if present) bounded to `TEXT_LIMITS.medium`. Plus minimum 10 characters on `what_happened`.

### Step 4 — R20a vulnerable-user detection

`const combinedInput = '${what_happened} ${how_i_responded || ""}'`
`const gate = await enforceDistressCheck(detectDistressTwoStage(combinedInput))`

If `gate.shouldRedirect`:
- `analytics_events` row inserted (awaited per the route's existing implementation; correctly broad input scope per D24 Route 8 §"AC-13 / AC-17 shape").
- 200 response with `distress_detected: true`, severity, redirect_message.
- No reflection saved.
- No engine called.

R20a perimeter conformance: this is the canonical reference pattern for distress detection on a perimeter route. The combined-input scope is the most defensively-wired distress check among the eight perimeter routes (per D24 §"Route 8" and the comparison to other routes' partial input coverage).

### Step 5 — Context-layer loading (rich Layer 2 + L3 + L5)

Six parallel loads via `Promise.all`:

- `getProjectedPractitionerContext(auth.user.id, topicForProjection)` — when `MENTOR_CONTEXT_V2=true` (the projection path).
- `getFullPractitionerContext(auth.user.id)` — when projection is off (the legacy full-profile path).
- `loadMentorProfile(auth.user.id)` — canonical loader (per ADR-Ring-2-01 Session 4–5); flows to `getRecentInteractionsAsSignals`.
- `getProjectContext('minimal')` — Layer 3 at minimal depth.
- `getMentorObservationsWithParallelLog(auth.user.id, PRIVATE_MENTOR_HUB, 'private-reflect')`.
- `getJournalReferences(auth.user.id, extractTopicHints(...), PRIVATE_MENTOR_HUB)`.
- `getProfileSnapshots(auth.user.id, PRIVATE_MENTOR_HUB)`.
- `getBaselineAppendixContext(auth.user.id)`.

Plus Layer 1 (Stoic Brain) at scoped two-mechanism depth: `getStoicBrainContextForMechanisms(['passion_diagnosis', 'oikeiosis'])`.

KG3 conformance: hub label `PRIVATE_MENTOR_HUB = 'private-mentor'` is the canonical hardcoded constant; same value used at the cache-read site, the loader call site, and the writer site.

### Step 6 — Pattern-engine pass (per ADR-PE-01 Session 3 + Session 6)

Two-branch logic:

- **Cache-hit branch:** if `useProjection && storedProfile?.profile.pattern_analyses?.[PRIVATE_MENTOR_HUB]` exists AND `bypass_pattern_cache !== true` → use persisted analysis directly. `patternSource: 'persisted'`. Loader does not fire.
- **Recompute branch:** on cache miss OR `bypass_pattern_cache: true` → load `ring = await loadRingFunctions()`; lookup profile_id from `mentor_profiles`; live loader `loadMentorInteractionsAsRecords(profileId, PRIVATE_MENTOR_HUB, { windowDays: 90, limit: 100 })`; run `ring.analysePatterns(profile, interactions, null)`. `patternSource: 'recomputed'`; `interactionsSource: 'live_loader'`; `interactionsCount: <count>`.

Worst cases A/B/C/D/E/G/I/L/N mitigated per ADR-PE-01 documentation (graceful fall-through to 2A-skip behaviour on any failure).

### Step 7 — Pattern-analysis persistence

Read-modify-write discipline (ADR §6.3): spread the loaded profile, overlay `pattern_analyses[PRIVATE_MENTOR_HUB] = patternAnalysis`. `saveMentorProfile(auth.user.id, mutatedProfile)` awaited (KG1 rule 2).

Q-Empty-Recompute-Posture (i): skip persistence when `patternSource === 'recomputed' && interactionsCount === 0` (preserves any existing useful entry).

### Step 8 — User-message construction

```
Daily reflection:

What happened: ${what_happened.trim()}
${how_i_responded?.trim() ? `How I responded: ${how_i_responded.trim()}` : ''}

Score my actions and give me the sage perspective.

[plus appended sections for: practitioner context (or projected); recent interaction signals (if projection on); ring summary if persisted (RECURRING PATTERNS DETECTED block); baseline appendix; mentor observations; journal references; profile snapshots; project context; mentor knowledge base]
```

### Step 9 — Token-count logging + session-context-snapshot

- Log `[mentor-context-tokens]` with per-section token estimates (chars/4 approximation per KG5).
- If `useProjection`: `await recordSessionContextSnapshot(auth.user.id, summary, hash)` (audit trail; awaited per Vercel termination rule).

### Step 10 — Anthropic call

```
client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  temperature: 0.3,
  system: [
    { type: 'text', text: REFLECTION_PROMPT, cache_control: { type: 'ephemeral' } },
    { type: 'text', text: stoicBrainContext },
  ],
  messages: [{ role: 'user', content: userMessage }],
})
```

Direct Claude call (bypasses `runSageReason`). This is the path Phase-2 pass 2 replaces with Layer 1 → engine → Layer 3.

### Step 11 — Response parse

`extractJSON(responseText)` parses the response (markdown-fence-stripping fallback per the helper).

**Parse failure handling (graceful degradation):** rather than 500, the route logs the full raw response, inserts `analytics_events` with `event_type: 'daily_reflection'` and `obs_log_status: 'json_parse_failed'`, and returns 200 with a degraded result (`katorthoma_proximity: 'unknown'`, generic `sage_perspective` prose, `passions_detected: []`). The practitioner sees a "please try again" message rather than a hard error.

### Step 12 — Validation

`katorthoma_proximity` must be one of `['reflexive', 'habitual', 'deliberate', 'principled', 'sage_like']`. Invalid returns 500.

### Step 13 — Reflections table insert (awaited — KG1 rule 2)

```
supabaseAdmin.from('reflections').insert({
  user_id: effectiveUserId,
  what_happened, how_responded,
  katorthoma_proximity, passions_detected, sage_perspective, evening_prompt,
})
```

JSONB columns (per KG7): `passions_detected` is passed as an array directly to the Supabase client — not stringified. `jsonb_typeof` should return `'array'`.

### Step 14 — Reasoning receipt

`extractReceipt({ skillId: 'sage-reflect', input: what_happened.trim(), evalData: {...}, mechanisms: ['passion_diagnosis', 'oikeiosis'] })`.

### Step 15 — Structured observation extraction

The LLM returns `structured_observation: { observation, category, confidence }` as part of the response. The route extracts it for:
- The API response (`mentor_observation: structuredObs?.observation || null`).
- The `mentor_observations_structured` table via `logMentorObservation(profile_id, { date, observation, category, confidence, source_context: 'evening_reflection' }, PRIVATE_MENTOR_HUB)`.

Status field captured for diagnostics: `obsLogStatus: 'logged' | 'no_profile' | 'validation_rejected' | 'exception' | 'llm_missing_field' | 'not_attempted' | 'profile_found'`.

### Step 16 — Result assembly

```
{
  katorthoma_proximity, passions_detected, what_you_did_well, sage_perspective,
  mentor_observation: structuredObs?.observation || null,
  evening_prompt, reasoning_receipt, disclaimer, reflected_at,
  mentor_mode: 'private',
  pattern_source, pattern_persistence,
  interactions_source, interactions_count, bypass_pattern_cache_used, pattern_engine_error,
}
```

### Step 17 — Analytics insert (awaited)

`analytics_events` row with `event_type: 'daily_reflection'` and metadata covering proximity, passions count, mentor_mode, structured_observation_logged status.

### Step 18 — Self-improving feedback loop (awaited)

Dynamic import: `const { updateProfileFromReflection } = await import('../../../../../../../sage-mentor/profile-store')`. Awaited per KG1 rule 2.

```
updateProfileFromReflection(
  supabaseAdmin,
  effectiveUserId,
  { katorthoma_proximity, passions_detected, what_you_did_well, sage_perspective },
  what_happened.trim(),
  PRIVATE_MENTOR_HUB,
  validatedObservation
)
```

R3 conformance: `validatedObservation` is passed only when `obsLogStatus === 'logged'` (validated through the observation logger). Never raw LLM text.

Wrapped in try/catch; failure is non-blocking (the reflection still returns success even if the profile update fails).

### Step 19 — Response envelope build

```
buildEnvelope({
  result, endpoint: '/api/mentor/private/reflect', model: 'claude-sonnet-4-6',
  startTime, maxTokens: 1024,
  composability: {
    next_steps: ['/api/mentor/private/reflect', '/api/score'],
    recommended_action: 'Reflection findings fed back into Mentor profile (passion map, rolling window). The next interaction benefits from this reflection.',
  },
})
```

### Step 20 — Response return

`NextResponse.json(envelope, { headers: corsHeaders() })`. Plus OPTIONS export for CORS preflight.

## Page-side workflow (`/private-mentor/page.tsx` `submitRitual`)

### Step 1 — View selection

Practitioner navigates to `MorningView` or `EveningView` on `/private-mentor`. The view renders the appropriate textareas:
- MorningView: one textarea (`#morningInput`).
- EveningView: two textareas (`#eveningInput` for `what_happened`, `#eveningResponseInput` for optional `how_i_responded`).

### Step 2 — `submitRitual('morning' | 'evening')` invocation

```
const textarea = document.querySelector(type === 'morning' ? '#morningInput' : '#eveningInput')
const reflection = textarea?.value.trim()
if (!reflection) { showToast('Please share your reflection first'); return; }

let howResponded: string | undefined
if (type === 'evening') {
  const responseTextarea = document.getElementById('eveningResponseInput')
  const responseText = responseTextarea?.value.trim()
  howResponded = responseText && responseText.length > 0 ? responseText : undefined
}
```

### Step 3 — Outbound POST

```
authFetch('/api/mentor/private/reflect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ what_happened: reflection, how_i_responded: howResponded }),
})
```

### Step 4 — Response handling and distress branch

```
if (data.distress_detected || data?.result?.distress_detected) {
  const redirectData = data.distress_detected ? data : data.result
  // Append support message bubble (heart icon + redirect_message)
  // Clear textarea; setIsLoading(false); return
}
```

### Step 5 — Render the formatted bubble

```
const result = data?.result || data
const content = result?.sage_perspective
  ? `**${result.katorthoma_proximity || 'Assessed'}** — ${result.sage_perspective}${result.evening_prompt ? `\n\n*${result.evening_prompt}*` : ''}`
  : result?.evaluation || 'Your reflection has been recorded and analyzed by the mentor.'

const insightMsg: Message = { id: `msg-${Date.now()}`, type: 'insight', content, timestamp: formatTime() }
setMessages(prev => [...prev, insightMsg])
```

### Step 6 — Cleanup

- Clear the textarea (`textarea.value = ''`).
- Clear `eveningResponseInput` if evening.
- `showToast(type === 'morning' ? 'Morning check-in shared with mentor' : 'Evening reflection shared with mentor')`.

### Step 7 — Proximity ring refresh

`await fetchProximityScore()` — calls `/api/reason` with `depth: 'quick'` and updates the proximity ring widget. Per the existing snapshot at `/archive/2026-04-29_end-to-end-mentor-pipeline_snapshot.md` step 24, the ring widget's displayed values are partly hard-coded in `fetchProximityScore` rather than derived from the response — known issue, not in scope for this snapshot.

## REFLECTION_PROMPT (full text)

The system prompt that drives the direct Claude call (preserved verbatim from the route source at git ref `1e7cffa`):

> You are the Stoic Sage reflection companion for sagereasoning.com. A user is reflecting on their day — what happened and how they responded. Your role is to evaluate their alignment with right reason (katorthoma), identify what they did well, and show what a Stoic sage would have done differently.
>
> Use 4-stage evaluation to assess their reflection:
>
> **STAGE 1: Is the action aligned with right reason at all?**
> - Reflexive (reactive, unconsidered): Acts from habit or impulse without examination
> - Habitual (customary): Follows patterns, social norms, or established practices
> - Deliberate (considered): Thinks through the action, questions assumptions, chooses consciously
> - Principled (reasoned): Acts from explicit understanding of virtue and alignment with nature
> - Sage-like (exemplary): Demonstrates wisdom, justice, courage, and temperance integrated
>
> **STAGE 2: Identify any passions detected.**
> For each significant emotional response in their reflection, extract `root_passion`, `sub_species`, `false_judgement`.
>
> **STAGE 3: What did they do well?**
> Identify specific actions or virtues they expressed.
>
> **STAGE 4: Sage perspective.**
> What would right reason (katorthoma) suggest differently, if anything? Be specific to their situation.
>
> Return ONLY valid JSON with the response schema (`katorthoma_proximity`, `passions_detected[]`, `what_you_did_well`, `sage_perspective`, `evening_prompt`, `structured_observation`, `disclaimer`).

## Schema reference (current `reflections` table)

```
reflections (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  what_happened TEXT,
  how_responded TEXT,
  katorthoma_proximity VARCHAR(32),
  passions_detected JSONB,
  sage_perspective TEXT,
  evening_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

`mentor_observations_structured` per the existing schema; pattern_analyses persisted within the encrypted profile blob in `mentor_profiles`.

## Architectural facts captured for post-build comparison

1. **Visible output shape:** `katorthoma_proximity` (canonical 5-level), `passions_detected[]` (with root_passion/sub_species/false_judgement per item), `what_you_did_well` prose, `sage_perspective` prose, `evening_prompt` prose, `mentor_observation` (optional surface field — extracted from structured_observation; today rendered as the message bubble's italicised sub-line).
2. **Page-side rendering pattern:** formatted message bubble with `**proximity** — sage_perspective` plus italicised `*evening_prompt*` when present. Appended to the conversation surface message stream.
3. **Persistence shapes:** `reflections` table (one row per submission); `mentor_observations_structured` (one row per structured_observation that passes validation); `mentor_profiles.pattern_analyses[private-mentor]` (cached pattern analysis); profile passion_map / rolling_window updates via `updateProfileFromReflection`.
4. **Diagnostic fields surfaced:** `pattern_source` (`'persisted'` | `'recomputed'` | `'absent'`), `pattern_persistence` (attempted/ok/version/error), `interactions_source` (`'live_loader' | null`), `interactions_count`, `bypass_pattern_cache_used`, `pattern_engine_error`.
5. **Latency profile:** dominated by the Sonnet call (~1024 max_tokens); R20a two-stage classifier adds ~500ms for borderline inputs (per AC2); context loading is parallel; persistence is sequential and awaited.
6. **R20a perimeter compliance:** `enforceDistressCheck(detectDistressTwoStage(combinedInput))` is the call pattern; AC4 invocation testing covers this route.

## Verification of this snapshot

This is a documentary snapshot. Verification is the founder reading the snapshot and confirming it captures observable behaviour from a recent ritual submission. To verify:

1. Submit a morning reflection on `/private-mentor` MorningView. Note the formatted response bubble, the proximity, the evening_prompt.
2. Submit an evening reflection on EveningView with both fields. Same observation.
3. Compare to the Page-side workflow Step 5 rendering pattern above.
4. Query the `reflections` table for the most recent rows; compare to Schema reference above.
5. Check `mentor_observations_structured` for the structured observations logged.

If any divergence appears between the snapshot text and observed behaviour, the snapshot is updated (or annotated) before Phase-2 pass 2 begins. Phase-2 pass 2's verification protocols (D14a §"Founder-performable verification specification") use this snapshot as the comparison reference.

## Comparison reference for D14a Verification 1

D14a's Verification 1 procedure (post-Phase-2-pass-2 build with `MENTOR_RAG_V1=true`):

1. With flag false (today's behaviour reproduced) → submit a reflection → record output. Output should match this snapshot.
2. With flag true (engine path) → submit the same reflection → record output. Output should produce all five visible fields with semantically equivalent content; wording may differ (engine path's prose comes from Layer 3's Table 4a projection).

Pass criterion: all five visible fields populated in both runs; structural fields canonical; semantic equivalence (no false judgement detected in one and not the other for the same input).

If the engine path's output diverges in structural shape (missing fields; incorrect proximity values; absent pass-2 enrichment of correct_judgement), Phase-2 pass 2 has a regression. Rollback: set the env flag to false; the route reverts to today's behaviour as documented in this snapshot.

---

*End of snapshot. Documentary record only — preserved at `/archive/2026-05-02_api-mentor-private-reflect_pre-alt-3-snapshot.md` for reference during Phase-2 pass 2 verification.*
