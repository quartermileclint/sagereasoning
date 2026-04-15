# Architectural Decisions Extract
# Source: Sage Stenographer Logs (session-handoffs/ and handoffs/)
# Extracted: 15 April 2026
# Purpose: Source material for comprehension block backfill on foundational context files.
# Do not modify code files based on this document.

This file records the "why" — decisions, constraints, reasoning — extracted
verbatim or lightly paraphrased from session handoff notes. Each entry cites
the session it came from so the future comprehension session can trace it back.
Inferences and gaps are flagged explicitly; nothing has been fabricated.

Source sessions prioritised:

- `operations/handoffs/context-architecture-build.md` (9 April 2026, Session 6 close — the original three-layer spec)
- `operations/handoffs/session-7-close.md` (9 April 2026 — Layer 1 built)
- `operations/handoffs/session-7b-context-architecture-debug.md` (10 April 2026 — Layer 1 production debug)
- `operations/handoffs/session-7d-layer1-layer2.md` (10 April 2026 — Layer 2 wired)
- `operations/handoffs/session-7e-layer3-direct-endpoints.md` (10 April 2026 — Layer 3 built, direct-call endpoints wired)
- `operations/session-handoffs/2026-04-11-session-13-handoff.md` (R20a gap identified)
- `operations/session-handoffs/2026-04-11-session-14-handoff.md` (detectDistress wired to 6 endpoints)
- `operations/session-handoffs/2026-04-15-layer3-wiring.md` (Layer 3 completed on 9 public engine endpoints)
- `operations/decision-log.md` (cross-reference)

---

## sage-reason-engine.ts

### Decision: Three-layer context architecture

- Source session: 9 April 2026 — `context-architecture-build.md`
- Decision: Adopt a three-layer context architecture injected into every LLM call
  made via the engine: Layer 1 (Stoic Brain), Layer 2 (Practitioner Context),
  Layer 3 (Project Context).
- Reasoning: Prior to this change, 23 endpoints called the LLM with none of the
  following available: structured Stoic Brain data (only paraphrased in
  hardcoded system prompts), the authenticated practitioner's profile (only
  `/api/mentor-baseline` received a summary), or the project's situational state
  (no endpoint knew what SageReasoning is, what phase it is in, or what
  decisions had been made). The engine operated "context-blind". Each layer
  was scoped to solve one of these specific blindnesses.
- Applies to: `sage-reason-engine.ts`, `getStoicBrain`, `getPractitionerContext`,
  `getProjectContext`.

### Decision: Layer 1 (Stoic Brain) injected at the system level

- Source session: 9 April 2026 — `session-7-close.md`
- Decision: Stoic Brain context is injected as a second system message block
  (not appended to the user message). Engine auto-generates the block from
  the depth parameter unless the caller overrides or disables it.
- Reasoning (quoted from session 7 close): "keeps system prompt and knowledge
  base structurally separate" and "all 9 engine endpoints benefit immediately
  with zero per-endpoint changes" because auto-generation happens inside the
  engine. Rules served: R4 (centralised reasoning), R12 (2+ mechanisms enforced
  from one place).
- Applies to: `sage-reason-engine.ts` (system message array construction),
  `stoic-brain-loader.ts`.

### Decision: Layer 2 (Practitioner Context) injected in the user message, not the system message

- Source session: 10 April 2026 — `session-7d-layer1-layer2.md`
- Decision: Practitioner context is placed in the user message, after
  domain_context and before urgency_context. It is NOT added to the system
  message.
- Reasoning (quoted from 7d close): "This keeps the system message clean
  (main prompt + Stoic Brain data) while personalising the reasoning request
  itself." The mental model: the system message holds *framework* (the Stoic
  Brain and the reasoning instructions); the user message holds the *request*
  (including who is asking and their profile). Treating the practitioner
  profile as part of the request, not the framework, is a deliberate
  separation.
- Applies to: `sage-reason-engine.ts` (user message assembly),
  `practitioner-context.ts`.

### Decision: Layer 3 (Project Context) added to engine

- Source session: 10 April 2026 — `session-7e-layer3-direct-endpoints.md`
- Decision: `ReasonInput` accepts an optional `projectContext: string | null`.
  When present, the engine injects it into the user message after practitioner
  context and before urgency context. Injection is auto-wired for all engine
  endpoints that pass the param.
- Reasoning: Layer 3 completes the three-layer stack — Layer 1 gives the LLM
  the philosophical framework, Layer 2 gives it who is asking, Layer 3 gives
  it the situational frame (what project this is, what phase it is in, what
  decisions have recently been made). Without Layer 3, the mentor could not
  distinguish impatience-while-debugging-auth from impatience-in-a-personal-
  relationship — fundamentally different Stoic diagnoses requiring different
  guidance.
- Applies to: `sage-reason-engine.ts`.

### Decision: Three layers composed in a fixed order inside the engine

- Source session: 9 April 2026 — `context-architecture-build.md` ("Integration
  Architecture Summary"); confirmed in 7d and 7e closes.
- Decision: The engine composes the LLM call as follows:
  - System message array: [0] Main system prompt (depth-based or override),
    [1] Stoic Brain context (Layer 1).
  - User message: existing input + domain_context, then Practitioner context
    (Layer 2), then Project context (Layer 3), then urgency_context, then
    stage scoring instruction, then "Return only the JSON evaluation object."
- Reasoning: Order matters. Stoic Brain belongs in the system message because
  it is stable framework the LLM should treat as authoritative knowledge.
  Practitioner + Project context belong in the user message because they
  describe the specific request being evaluated. Urgency context follows the
  three layers because it modulates *this particular evaluation's scrutiny
  level* — it is a per-call parameter, not framework or identity.
- Applies to: `sage-reason-engine.ts`.

### Decision: Compiled TypeScript for Stoic Brain data, not runtime JSON loading

- Source session: 9 April 2026 — `context-architecture-build.md` line 61-66;
  confirmed implemented in `session-7-close.md`.
- Decision: Stoic Brain JSON files (8 files, ~83K) are compiled into a
  TypeScript constants file (`stoic-brain-compiled.ts`) rather than loaded
  from disk at runtime.
- Reasoning: Stoic Brain files live at repo root under `stoic-brain/`, not
  inside `website/`. At Vercel build time, only `website/` is deployed, so
  runtime JSON loading from `stoic-brain/` would not work in serverless.
  Two options were considered: (a) copy JSON into `website/src/data/` at
  build time, or (b) inline the data as TypeScript constants. The spec
  (context-architecture-build.md) chose (b) because "TypeScript constants is
  more reliable for Vercel serverless" — no file-system dependency, imports
  are statically analysed, and tree-shaking is possible. Session 7 close also
  notes the data was "compiled as condensed TypeScript constants (not full
  JSON) to stay within token budgets."
- Applies to: `stoic-brain-compiled.ts`, `stoic-brain-loader.ts` (which imports
  the compiled constants rather than reading files).

### Decision: Urgency context follows the three layers rather than preceding them

- Source session: 9 April 2026 — `context-architecture-build.md` (Integration
  Architecture Summary, lines 192-204).
- Decision: In the user message assembly, urgency_context comes AFTER
  practitioner context and project context, and BEFORE the stage scoring
  instruction and the final JSON return instruction.
- Reasoning: Urgency modulates scrutiny for *this* evaluation. The three
  context layers establish what the LLM should know (framework, who, where).
  Urgency then says: given all of the above, apply extra hasty-assent checks
  because this particular decision is being made under pressure. Placing
  urgency last-but-before-the-schema keeps it co-located with the scoring
  instruction it influences.
- Applies to: `sage-reason-engine.ts` (user message assembly order).

### Decision: Graceful degradation if any layer fails to load

- Source session: 10 April 2026 — `session-7d-layer1-layer2.md` ("Graceful
  degradation confirmed").
- Decision: If a context layer returns null or an empty string, the engine
  proceeds without that layer. No auth or encryption errors propagate to the
  caller. For Layer 2 specifically: "If no MentorProfile exists in Supabase,
  `getPractitionerContext()` returns null and the engine proceeds without
  personalisation. No auth or encryption errors propagate."
- Reasoning: The engine is called from many endpoints, some authenticated and
  some not. An unauthenticated call should still get philosophical framework
  and project context even if practitioner context is unavailable. This keeps
  the failure mode "less personalised" rather than "broken".
- Applies to: `sage-reason-engine.ts`, `practitioner-context.ts`,
  `project-context.ts`.

### Decision: runSageReason signature shape

- Source session: 10 April 2026 — `session-7d-layer1-layer2.md` +
  `session-7e-layer3-direct-endpoints.md`.
- Decision: `ReasonInput` was extended across sessions:
  - Session 7: `stoicBrainContext?: string` added (Layer 1).
  - Session 7d: `practitionerContext?: string | null` added (Layer 2).
  - Session 7e: `projectContext?: string | null` added (Layer 3).
  - 2026-04-15 confirms: `projectContext?: string | null` at line 80 of
    sage-reason-engine.ts, auto-injection at lines 409-410.
- Reasoning: The signature was grown additively, one param per layer, to keep
  the change non-breaking. All new params are optional. Per-endpoint changes
  are one-line additions: import the loader, call it, pass the result. This
  kept Layer rollout "centralised — one modification to the engine, all 9
  endpoints benefit" (context-architecture-build.md line 116).
- Applies to: `sage-reason-engine.ts` (`ReasonInput` interface and
  `runSageReason` function).

### Decision: Risk classification for engine changes

- Source session: 9 April 2026 — `session-7-close.md`.
- Decision: Layer 1 engine changes classified as Standard risk ("additive,
  non-breaking").
- Reasoning: New optional parameter, no behaviour change for existing callers.
  The founder's Change Risk Classification (0d-ii) was followed — the engine
  is not auth/access control, so Critical classification did not apply.
- Applies to: `sage-reason-engine.ts` (informs the comprehension block's
  "what breaks if this goes wrong" section — answer: existing callers are
  unaffected; new callers get additional context or graceful degradation).

---

## getProjectContext (context loader)

### Decision: Project context exists as its own loader separate from engine

- Source session: 9 April 2026 — `context-architecture-build.md` Layer 3.
- Decision: A dedicated loader (`website/src/lib/context/project-context.ts`)
  exposes `getProjectContext(level)` returning a structured text block. Not
  embedded in the engine.
- Reasoning: Project context has different lifecycle, storage, and audience
  from the other two layers. It is the only layer with a dynamic component
  (recent decisions, active tensions) that updates as the project progresses.
  It is the only layer consumed by tools that are NOT the reasoning engine
  (Sage Ops is an "Ops mentor" that will use `getProjectContext('full')`
  directly without ever calling `runSageReason`). Keeping it as a standalone
  loader keeps Sage Ops's future wiring trivial.
- Applies to: `project-context.ts`.

### Decision: Four levels — full, summary, condensed, minimal

- Source session: 10 April 2026 — `session-7e-layer3-direct-endpoints.md`
  (the levels were defined when the loader was built).
- Decision: `getProjectContext(level)` supports 4 levels:
  - `full` (~500 tokens): Everything — identity + mission + phase + all
    decisions + tensions + ethics. Used by Sage Ops (P7).
  - `summary` (~250 tokens): Identity + phase + recent decisions + founder
    role. Used by Mentor endpoints.
  - `condensed` (~150 tokens): Phase + recent decisions only. Used by
    Operational endpoints (reason, score, score-decision, score-social,
    score-conversation, score-document, score-scenario, score-iterate).
  - `minimal` (~200 tokens): Identity + ethical commitments only. Used by
    Human-facing tools and the guardrail.
- Reasoning: The four levels implement the context matrix from
  `context-architecture-build.md` — different endpoint groups have different
  context appetites. Sage Ops needs the full operational picture; mentor
  endpoints need enough to interpret development in situational frame;
  operational endpoints need only current phase + decisions to ground
  reasoning; human-facing tools need the mission and ethical commitments but
  not internal project state. This is a deliberate token-budget-shaped
  response: rather than pass everything everywhere, each endpoint pays for
  only what it uses.
- Applies to: `project-context.ts`.

### Decision: 'condensed' chosen for evaluative engine endpoints, 'minimal' chosen for the guardrail

- Source session: 15 April 2026 — `2026-04-15-layer3-wiring.md`.
- Decision (quoted): "Chose `'minimal'` level for /guardrail, `'condensed'`
  for all others. Minimal is identity + ethical commitments only — appropriate
  for a safety gate. Condensed adds phase + recent decisions — appropriate
  for evaluative endpoints."
- Reasoning: The guardrail is a safety gate. It needs to know what SageReasoning
  stands for (so it enforces ethical commitments) but does not need to know
  what phase the project is in or what decisions have been made — those would
  be noise for a yes/no gate decision. Evaluative endpoints (reason, score,
  score-decision, etc.) are giving situational advice: "given the current
  phase and recent decisions, here is what this action amounts to". They
  benefit from phase + decisions context.
- Applies to: `project-context.ts` (level definitions), `guardrail/route.ts`
  and the nine evaluative endpoints (which call `getProjectContext` with the
  matching level).

### Decision: Hybrid storage — static baseline + Supabase dynamic overlay (Option C)

- Source session: 10 April 2026 — `session-7e-layer3-direct-endpoints.md`.
- Decision: Layer 3 data is stored hybrid: a static `project-context.json`
  for identity, mission, and ethical commitments (rarely change), plus a
  Supabase `project_context` table for dynamic state (current phase, recent
  decisions, active tensions). The loader merges them.
- Reasoning: Option A (Supabase only) would add a Supabase read to every LLM
  call. Option B (static file only) would require redeployment to update
  project state. Option C gives: near-zero runtime cost on baseline (static
  import), one-hour-cached Supabase read for dynamic state, and redeployment
  only when the baseline (mission, ethics) changes. Spec recommendation in
  `context-architecture-build.md` line 164-168 called this the recommended
  option and 7e adopted it.
- Applies to: `project-context.ts` (merger logic), `project-context.json`
  (static baseline), `supabase-project-context-migration.sql` (dynamic table —
  prepared but not yet executed as of 7e close).

### Decision: Static baseline fallback

- Source session: 10 April 2026 — `session-7e-layer3-direct-endpoints.md`.
- Decision: The static `project-context.json` includes a `dynamic_defaults`
  section containing placeholder values for phase, decisions, and tensions.
  Until the Supabase `project_context` table is populated, the loader returns
  these defaults. "loader falls back to static defaults gracefully."
- Reasoning: This avoids blocking Layer 3 rollout on a Supabase migration.
  Endpoints can receive Layer 3 context immediately; the dynamic overlay can
  be turned on later without changing any endpoint code. Same graceful-
  degradation principle applied across all three layers: a failure in one
  dimension should degrade context richness, not break the endpoint.
- Applies to: `project-context.ts`, `project-context.json`.

---

## getPractitionerContext (context loader)

### Decision: Practitioner context exists as its own loader

- Source session: 9 April 2026 — `context-architecture-build.md` Layer 2.
- Decision: `website/src/lib/context/practitioner-context.ts` exposes
  `getPractitionerContext(userId: string): Promise<string | null>`, separate
  from project context and from the engine.
- Reasoning: Practitioner context has different constraints from project
  context: it requires authentication (userId), it reads encrypted data from
  Supabase, it needs to handle the "no profile exists yet" case gracefully,
  and it has a different cache TTL (5 minutes instead of 1 hour — see
  context-architecture-build.md line 279-280, because a profile updates
  mid-session should be visible). Keeping it separate from project context
  keeps each loader single-purpose.
- Applies to: `practitioner-context.ts`.

### Decision: Injected in the user message rather than the system message

- Source session: 10 April 2026 — `session-7d-layer1-layer2.md`.
- Decision (quoted): "Practitioner context injected into user message, not
  system message: Placed after domain_context, before urgency_context."
- Reasoning (quoted): "This keeps the system message clean (main prompt +
  Stoic Brain data) while personalising the reasoning request itself." The
  separation also matters for the LLM's treatment: the system message is
  authoritative framework; the user message is the request being evaluated.
  Who the practitioner is belongs with the request, not with the framework.
- Applies to: `practitioner-context.ts`, `sage-reason-engine.ts` (injection
  site).

### Decision: Contents of the condensed profile

- Source session: 10 April 2026 — `session-7d-layer1-layer2.md` ("What Was
  Built — Layer 2").
- Decision: `getPractitionerContext(userId)` returns a condensed context
  (~300-500 tokens) containing: proximity level, Senecan grade, top 3 passions
  (sorted by frequency), weakest virtue, primary causal breakdown stage, top
  value conflict.
- Reasoning: These fields were chosen because they are the highest-signal
  inputs for Stoic reasoning about a specific action. The full profile
  summary (~7,500 chars) is already injected into mentor endpoints separately;
  non-mentor endpoints need enough signal to personalise without bloating
  every call with the full profile. Each field maps to one of the Stoic
  Brain's core mechanisms: passions for passion diagnosis, weakest virtue
  for virtue domain engagement, causal breakdown for intervention point,
  value conflict for value assessment. Rule served: R0 — the loader exists
  so that reasoning about a practitioner's situation can consider that
  specific practitioner, not a generic one.
- Applies to: `practitioner-context.ts`.

### Decision: Wired only to 5 of 9 engine endpoints

- Source session: 10 April 2026 — `session-7d-layer1-layer2.md`; confirmed
  and corrected in `2026-04-15-layer3-wiring.md`.
- Decision: Practitioner context wired to `reason`, `score`, `score-decision`,
  `score-conversation`, `score-social`. Excluded from `guardrail` and
  `score-iterate` (API-key endpoints with no user auth, so not applicable —
  not "missing"). Excluded from the three mentor endpoints because they
  already receive the full profile summary as input; condensed context would
  be redundant.
- Reasoning: The 2026-04-15 session corrected an earlier mistaken claim that
  Layer 2 was "missing" on /guardrail and /score-iterate — those are
  `validateApiKey`-only endpoints and have no userId to load a profile for.
  Practitioner context is a user-identity-bearing concept; applying it where
  no user identity exists is a category error.
- Applies to: `practitioner-context.ts`, per-endpoint integration.

### Decision: Graceful null return on any failure

- Source session: 10 April 2026 — `session-7d-layer1-layer2.md`.
- Decision: "Returns null on any failure (no profile, no encryption config,
  load error)."
- Reasoning: The engine's failure mode for Layer 2 is "proceed without
  personalisation". This requires the loader to fail silently — a thrown
  exception would propagate to the endpoint and break the call. Returning
  null lets the engine's null-check fall through to the unpersonalised path.
  This is the graceful degradation principle applied at the Layer 2
  boundary.
- Applies to: `practitioner-context.ts`.

---

## getStoicBrain / Stoic Brain data loader

### Decision: Compiled TypeScript over runtime JSON

- Source session: 9 April 2026 — `context-architecture-build.md` line 61-66,
  `session-7-close.md`.
- Decision: 8 Stoic Brain JSON files in the repo root are compiled into
  `website/src/data/stoic-brain-compiled.ts` as TypeScript constants.
  `stoic-brain-loader.ts` imports from the compiled file, never from disk.
- Reasoning: Vercel serverless deploys only `website/`. The Stoic Brain JSON
  lives outside `website/`. Runtime disk reads would fail in production.
  Compiled TypeScript constants are statically imported, tree-shakeable,
  and guaranteed available at build time. Same pattern as
  `mentor-profile.json` (per context-architecture-build.md line 64). Also
  session 7 close noted "compiled as condensed TypeScript constants (not
  full JSON) to stay within token budgets" — the compile step is also the
  condensation step.
- Applies to: `stoic-brain-compiled.ts`, `stoic-brain-loader.ts`.

### Decision: Loader is separate from the engine

- Source session: 9 April 2026 — `context-architecture-build.md` Layer 1;
  `session-7b-context-architecture-debug.md` (where a circular-dependency
  bug between loader and engine was found and fixed).
- Decision: Six mechanism-specific context builders plus two composite
  builders (`getStoicBrainContext(depth)`, `getStoicBrainContextForMechanisms
  (mechanisms[])`) live in `stoic-brain-loader.ts`, not in the engine. The
  loader defines `ReasonDepth` locally (not imported from the engine) to
  avoid circular dependency.
- Reasoning: The engine should be domain-agnostic — it runs a reasoning
  pipeline. The loader is domain-specific — it assembles Stoic Brain
  knowledge. Separating them lets the engine stay focused on the system/user
  message composition and LLM call, while the loader handles the knowledge
  selection and token budgeting. Session 7b documents the cost of this
  separation: the original code imported `ReasonDepth` from the engine, and
  the engine imported from the loader, creating a circular dependency that
  broke the build. The fix was to duplicate the tiny `ReasonDepth` type in
  the loader. Cost: two tiny type definitions. Benefit: engine and loader
  remain decoupled.
- Applies to: `stoic-brain-loader.ts`, `sage-reason-engine.ts`.

### Decision: Data structure — per-mechanism context builders

- Source session: 9 April 2026 — `context-architecture-build.md` Layer 1.
- Decision: The loader exposes:
  - `getControlFilterContext()` → psychology.json sections
  - `getPassionDiagnosisContext()` → passions.json
  - `getOikeioisContext()` → progress.json (oikeiosis circles, proximity)
  - `getValueAssessmentContext()` → value.json
  - `getKathekonContext()` → action.json
  - `getIterativeRefinementContext()` → scoring.json + progress.json
  - composite `getStoicBrainContext(depth)` — selects the right set
    for a given depth.
- Reasoning: The Stoic Brain has ~83K of JSON data — too much to inject
  wholesale. Each mechanism has its own relevant data slice. Per-mechanism
  builders let the engine assemble only the slices needed for the mechanisms
  being applied at the current depth. Quick depth loads 3 mechanisms (target
  ~995 observed tokens), standard 5 (~1538), deep 6 (~2007) — all well under
  the ceilings (3000 for quick, 6000 for deep).
- Applies to: `stoic-brain-loader.ts`.

### Decision: Auto-generation from depth, with disable/override hook

- Source session: 9 April 2026 — `session-7-close.md`; corrected in
  `session-7b-context-architecture-debug.md`.
- Decision: The engine generates Stoic Brain context automatically from the
  depth parameter unless the caller explicitly overrides or disables it.
  Note: auto-injection was initially enabled in session 7, then disabled
  in session 7b after a production incident, then re-enabled after the
  client-side crash was traced to an unrelated `virtue_quality` nesting
  issue. Current state is auto-generation enabled.
- Reasoning: Auto-generation means "all 9 engine endpoints benefit
  immediately with zero per-endpoint changes" (session 7 close). The
  disable/override hook preserves optionality for endpoints that need
  different behaviour (e.g. the override pattern already existed for
  systemPromptOverride at line 375).
- Applies to: `sage-reason-engine.ts`, `stoic-brain-loader.ts`.

### Decision: Token budgets by depth

- Source session: 10 April 2026 — `session-7d-layer1-layer2.md` (observed
  token counts after Layer 1 rollout).
- Decision: Observed token counts for Stoic Brain context: quick ~995,
  standard ~1538, deep ~2007. Spec ceilings: 3000 for quick, 6000 for deep
  (context-architecture-build.md line 59).
- Reasoning: The budget guides the condense step in the compile and the
  selection step in the loader. As long as observed tokens stay well under
  ceiling, there is room to expand the Stoic Brain corpus. If the corpus
  grows, the loader must condense further before approaching the ceiling.
- Applies to: `stoic-brain-loader.ts`, `stoic-brain-compiled.ts`.

---

## R20-adjacent logic (distress detection)

### Decision: Distress detection is architecturally separate from the engine

- Source session: 11 April 2026 — `2026-04-11-session-13-handoff.md` (gap
  identified), `2026-04-11-session-14-handoff.md` (wired).
- Decision: `detectDistress(text)` lives in `website/src/lib/guardrails.ts`,
  not in the engine. Each human-facing endpoint calls it BEFORE any LLM
  call. If distress is detected at 'acute' or 'moderate' severity, the
  endpoint returns immediately with a redirect message; no LLM call is
  made. Mild severity proceeds but appends crisis resources.
- Reasoning: R20a mandates "language pattern detection in all human-facing
  tools for indicators of acute psychological distress" and "a redirection
  protocol to appropriate professional support resources". The function
  had to run before the LLM because the LLM's content safety layer was
  returning plain text (not JSON) for crisis language, causing parser
  throws and 500 errors (session 13 finding). Pattern-matching is not
  diagnosis — the detector returns structured severity + indicators and
  lets the caller decide how to handle them. Rules served: R20a (vulnerable
  user detection), R20d (keep framework from being used where it doesn't
  apply — crisis language needs professional support, not Stoic scoring).
- Applies to: `guardrails.ts` (the `detectDistress` function), plus the 6+
  endpoints that import and call it before LLM invocation.

### Decision: Three-tier severity classification

- Source session: Code evidence in `guardrails.ts` lines 122-136, wired
  in `2026-04-11-session-14-handoff.md`.
- Decision: The classifier bucket-matches input against regex patterns
  tagged at three severities:
  - Acute: suicidal ideation, self-harm, hopelessness, crisis planning.
  - Moderate: perceived burdensomeness, extreme isolation/despair,
    basic-needs neglect.
  - Mild: severe emotional distress ("broken", "meaningless").
  The maximum severity observed wins. Acute and moderate return a block
  message (no LLM call). Mild proceeds with resources appended.
- Reasoning: Severity determines the intervention. Acute crisis language
  requires immediate pause and redirection — evaluating such an action
  Stoically is both unhelpful and possibly harmful. Moderate also blocks
  because the situation warrants professional support before any
  philosophical scoring. Mild does not block because the person is
  articulating difficulty but not in crisis; the evaluation may still be
  useful, and appending resources avoids ignoring signals.
- Applies to: `guardrails.ts` — `DISTRESS_PATTERNS` array and the severity
  selection logic.

### Decision: Redirection message content and resource list

- Source session: Code evidence in `guardrails.ts` lines 138-148, wired
  2026-04-11.
- Decision: On distress detection, the redirect includes: a brief
  acknowledgement, the CRISIS_RESOURCES block (Lifeline AU 13 11 14,
  Beyond Blue AU 1300 22 4636, National Suicide Prevention Lifeline US
  988, Crisis Text Line US/UK/CA, Samaritans UK 116 123 — all 24/7), and
  a closing that states "SageReasoning is a philosophical reasoning tool,
  not a mental health service."
- Reasoning: The closing sentence is the mirror-principle honest-positioning
  commitment applied at the point where a user is most likely to mistake
  Stoic framework for professional support. R19c/R19d — the product must
  not present itself as something it is not, especially where the user is
  vulnerable.
- Applies to: `guardrails.ts` (`CRISIS_RESOURCES` constant and `redirect_message`
  assembly in `detectDistress`).

### Decision: Wired to 6+ human-facing endpoints (not to engine itself)

- Source session: 11 April 2026 — `2026-04-11-session-14-handoff.md`;
  code evidence shows 8 endpoints currently import detectDistress.
- Decision: Each human-facing endpoint imports and calls detectDistress
  individually, before invoking the engine or the direct Anthropic client.
  The engine does not call detectDistress; it is called upstream at the
  route layer.
- Reasoning: Distress detection is a per-request gate, not a reasoning
  step. Placing it at the route layer means: (a) the LLM is never invoked
  for crisis language, which prevents the 500-error failure mode observed
  in session 13; (b) agent-facing endpoints (which don't take user-authored
  natural language) don't need the gate; (c) the engine remains
  single-purpose (reasoning), the route remains single-purpose (request
  handling including safety gating). This matches the R20a specification
  from the manifest: "in all human-facing tools" — the tool, not the
  engine.
- Applies to: route files (`reason`, `score`, `score-decision`,
  `score-social`, `score-document`, `reflect`, `score-scenario`,
  `mentor/private/reflect`), and the imported `detectDistress` from
  `guardrails.ts`.

---

## Cross-cutting constraint: Critical Change Protocol context

### Decision: Engine changes and context changes classified at Standard risk

- Source session: 8 April 2026 — `decision-log.md` entry "Post-Incident
  Protocol Additions (Auth Middleware Debrief)", plus subsequent session
  closes.
- Decision: Project instructions now require every code change to be risk-
  classified (0d-ii). Three tiers: Standard / Elevated / Critical. Critical
  triggers the Critical Change Protocol (0c-ii) — written rollback plan,
  verification step, explicit founder approval.
- Reasoning: The 7 April auth middleware incident exposed that the AI would
  skip verify-decide-execute under urgency. The risk classification system
  forces a conscious classification before any change. For the context
  architecture: all three layers were classified Standard (additive, optional
  params, graceful degradation). No classification gap — the protocol did
  its job on these changes.
- Applies to: All files in this extract. The comprehension blocks should
  note for each file: its risk classification when modified, and the
  reasoning that gave it that classification.

---

## Unresolved questions

These gaps in the logs will need founder input (or code-level inspection)
before complete comprehension blocks can be written.

1. **Exact current contents of `stoic-brain-compiled.ts`.** Logs specify 8
   exported constants but the session handoffs don't capture the per-constant
   token counts or the condensation rules used during compile. The
   comprehension block for this file will need a quick read to enumerate
   exported constants accurately.

2. **Exact current field list in the condensed practitioner profile.** Logs
   list "proximity level, Senecan grade, top 3 passions, weakest virtue,
   primary causal breakdown stage, top value conflict" (session 7d), but
   the field ordering and the formatter output are not specified in the
   logs. Code read needed before writing the comprehension block.

3. **Exact structure of `project-context.json`.** Spec in
   `context-architecture-build.md` defines fields; session 7e confirms it was
   implemented with "identity + mission + founder context + 4 ethical
   commitments" plus a `dynamic_defaults` section. Code read needed to
   enumerate the actual JSON shape.

4. **Supabase `project_context` table migration — is it run in production
   yet?** Session 7e says "migration prepared but not yet run — loader falls
   back to static defaults gracefully". 2026-04-15 Layer 3 wiring handoff
   does not mention running the migration. If still not run, the comprehension
   block should say: "dynamic overlay is designed but falls back to
   static defaults in production as of this file's last modification."

5. **Whether the score-scenario generation call deliberately omits Layer 3
   is documented at the endpoint level or the engine level.** 2026-04-15
   handoff says it was a per-endpoint choice (manual injection only on the
   scoring call, not the generation call). The comprehension block for the
   engine should clarify this is a caller-level decision, not an engine-level
   rule.

6. **Whether `detectDistress` has been extended to mentor endpoints after
   session 14.** Code evidence shows 8 endpoints currently import it
   (reason, score, score-decision, score-social, score-document, reflect,
   score-scenario, mentor/private/reflect), but the session 14 handoff
   mentions only 6. Either the list grew after session 14 (unlogged) or the
   count was not precise in the handoff. Comprehension block for
   `guardrails.ts` should list endpoints by reading current imports, not
   by trusting the session 14 count.

7. **Architectural question flagged 2026-04-15 re agent-facing endpoints
   receiving Layer 3.** /guardrail and /score-iterate now inject
   SageReasoning project state on every external-agent call. This is a
   known accepted risk, deferred to P3. Future comprehension blocks for
   those two route files should flag the tension explicitly.

8. **Urgency context's original introduction.** The decision log entry for
   8 April 2026 ("Second Implementation Batch") says urgency_context was
   added to the engine in that batch. The handoff note sequencing in the
   three-layer spec assumes urgency_context was already in place before
   the three layers were composed. The comprehension block for
   sage-reason-engine.ts should note that urgency_context predates the
   three-layer architecture; the three layers were composed around it.
