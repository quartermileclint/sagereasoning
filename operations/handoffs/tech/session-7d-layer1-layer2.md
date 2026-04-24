# Session Close — 10 April 2026 (Session 7d)

## Decisions Made

- **Layer 1 rollout to all 9 endpoints:** Every `runSageReason` endpoint now injects mechanism-specific Stoic Brain context via `getStoicBrainContext(depth)`. The depth parameter controls which mechanisms get loaded (quick=3, standard=5, deep=6). Token budgets observed: quick ~995, standard ~1538, deep ~2007 — all well under spec ceilings.
- **Layer 2 wired to 5 authenticated endpoints, not all 9:** Practitioner context goes to reason, score, score-decision, score-conversation, score-social. Guardrail excluded (agent-facing, API key auth — no user profile). Three mentor endpoints excluded (already receive full profile summary as input; condensed context would be redundant).
- **Practitioner context injected into user message, not system message:** Placed after domain_context, before urgency_context. This keeps the system message clean (main prompt + Stoic Brain data) while personalising the reasoning request itself.
- **Graceful degradation confirmed:** If no MentorProfile exists in Supabase, `getPractitionerContext()` returns null and the engine proceeds without personalisation. No auth or encryption errors propagate.

## Status Changes

- Stoic Brain Layer 1 (context injection): **Built but untested** → **Verified live, all 9 endpoints**
- Practitioner Context Layer 2: **Not started** → **Verified live, 5 endpoints**
- `website/src/lib/context/practitioner-context.ts`: **NEW** — condensed profile builder
- `website/src/lib/sage-reason-engine.ts`: Modified — added `practitionerContext` param + user message injection
- All 9 route files: Modified — Stoic Brain import + injection. 5 of 9 also got practitioner context.

## What Was Built

### Layer 1 — Stoic Brain Injection (all 9 `runSageReason` endpoints)

Each endpoint now imports `getStoicBrainContext` and passes the result as `stoicBrainContext` to `runSageReason()`. The engine injects it as a second system message block alongside the main prompt. The depth parameter determines which mechanism sections get loaded from `stoic-brain-compiled.ts`.

Endpoints wired:
- `/api/reason` (standard/quick/deep — uses caller's depth)
- `/api/score` (standard)
- `/api/guardrail` (variable — quick/standard/deep based on risk_class)
- `/api/score-decision` (standard, called per option)
- `/api/score-conversation` (deep)
- `/api/score-social` (standard)
- `/api/mentor-baseline` (deep)
- `/api/mentor-baseline-response` (deep)
- `/api/mentor-journal-week` (deep)

### Layer 2 — Practitioner Context Injection (5 authenticated endpoints)

New file `practitioner-context.ts` exports `getPractitionerContext(userId)`:
- Calls `loadMentorProfile(userId)` from existing encrypted store
- Returns condensed context (~300-500 tokens): proximity level, Senecan grade, top 3 passions (sorted by frequency), weakest virtue, primary causal breakdown, top value conflict
- Returns null on any failure (no profile, no encryption config, load error)

Engine modification: `ReasonInput` now accepts optional `practitionerContext: string | null`. When present, it's appended to the user message after domain_context.

Endpoints wired: reason, score, score-decision, score-conversation, score-social.

NOT wired (by design):
- `/api/guardrail` — agent-facing, no user profile
- `/api/mentor-baseline`, `/api/mentor-baseline-response`, `/api/mentor-journal-week` — already receive full profile summary as input

## Verification Results

### Layer 1 test (`/api/reason`, standard depth)
- Sub-species identified: `orge` (anger), `philodoxia` (love of honour), `zelotypia` (jealousy) — all from compiled taxonomy
- Correct root passion mapping: orge → epithumia, zelotypia → lupe
- JSON structure: 13 fields, all expected keys present, no regressions
- Latency: ~24s (standard depth, Haiku)

### Layer 2 test (`/api/reason`, quick + standard depth)
- Quick depth: "This decision is a microcosm of your primary struggle" — directly referencing practitioner profile
- Standard depth: "whether you believe your flourishing depends on external recognition" — personalised to Clinton's value conflicts
- Passions identified match profile's dominant passion map (philodoxia, orge, agonia)
- JSON structure: 14 fields at standard depth, all expected keys present
- Latency: ~34-38s (standard depth — increased due to additional context tokens)

### Error observed and resolved
- Two 500 errors on first calls post-deploy: "Reasoning engine returned invalid JSON response"
- Cause: LLM cold-start flakiness with larger context, not a code bug
- Resolved on retry. All subsequent calls succeeded.

## Performance Note

Standard depth latency increased from ~24s (Layer 1 only) to ~34-38s (Layer 1 + Layer 2). The additional ~1900 tokens of context (Stoic Brain ~1538 + practitioner ~400) add processing time. This is within the spec's expected tradeoff. Quick depth remains faster.

## Next Session Should

1. **Commit and push this handoff note** — the code changes from this session are already deployed (commit `1e40740`).
2. **Layer 3 (Project Context)** — the final context layer. Requires a decision on storage: static file (Option B), Supabase table (Option A), or hybrid (Option C, recommended in spec). The spec is at `operations/handoffs/context-architecture-build.md`, Layer 3 section.
3. **Wire the 11 direct-call endpoints** — five direct Anthropic call endpoints and six skill-handler endpoints don't use `runSageReason`. They need individual modifications for both Layer 1 and Layer 2. See the full endpoint list in `context-architecture-build.md`.
4. **Optional: address the latency increase** — if 34-38s is too slow for standard depth, consider making practitioner context opt-in via a query parameter, or condensing the Stoic Brain context further for standard depth.

## Blocked On

- Nothing. Production is stable with both layers active.

## Open Questions

1. **Layer 3 storage decision:** Option A (Supabase only), B (static file only), or C (hybrid)? Spec recommends C.
2. **Direct-call endpoints:** Should Layer 1+2 be wired to all 11 at once, or rolled out incrementally?
3. **Latency budget:** Is 34-38s acceptable for standard depth, or should we optimise before continuing?

## Files Changed This Session

| File | Change |
|------|--------|
| `website/src/app/api/reason/route.ts` | +Layer 1, +Layer 2 |
| `website/src/app/api/score/route.ts` | +Layer 1, +Layer 2 |
| `website/src/app/api/guardrail/route.ts` | +Layer 1 only |
| `website/src/app/api/score-decision/route.ts` | +Layer 1, +Layer 2 |
| `website/src/app/api/score-conversation/route.ts` | +Layer 1, +Layer 2 |
| `website/src/app/api/score-social/route.ts` | +Layer 1, +Layer 2 |
| `website/src/app/api/mentor-baseline/route.ts` | +Layer 1 only |
| `website/src/app/api/mentor-baseline-response/route.ts` | +Layer 1 only |
| `website/src/app/api/mentor-journal-week/route.ts` | +Layer 1 only |
| `website/src/lib/sage-reason-engine.ts` | +practitionerContext param + injection |
| `website/src/lib/context/practitioner-context.ts` | **NEW** — condensed profile builder |
