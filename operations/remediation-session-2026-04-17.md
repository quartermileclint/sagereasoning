# Remediation Session — 17 April 2026

**Source:** Contextual Stewardship Audit (same date)
**Scope:** Findings F1-F3, F5-F7 (Tier 1 + top Tier 2)
**Findings F4, F8-F16:** Deferred — see end of document.

---

## BLOCK 1 — F1: Distress Detection (Tier 1)
**Status:** Complete — code produced, not yet wired to routes
**Changes produced:**
- `website/src/lib/r20a-classifier.ts` — NEW FILE: Two-stage distress classifier
- `website/src/lib/__tests__/r20a-classifier-eval.ts` — NEW FILE: Evaluation test suite
**Risk classification:** Critical — touches vulnerable user protection (R20)

### What was built

**1. Haiku evaluator (`evaluateBorderlineDistress`)**

- **Prompt:** Minimal safety classifier prompt. Haiku evaluates whether text contains distress indicators. Returns `{ distress_detected, severity, reasoning }`.
- **Input:** The raw user text (same string that was checked by regex).
- **Output schema:** `{ distress_detected: boolean, severity: 'none'|'mild'|'moderate'|'acute', reasoning: string }`
- **Threshold:** Any severity ≥ moderate triggers the redirect message (blocks evaluation). Mild adds resources to response without blocking.
- **Content safety net:** If Haiku's content safety layer returns non-JSON (the session 13 failure mode), the classifier treats that as a `moderate` distress signal — not a parse error. This was the specific gap identified in F1.

**2. Combined function (`detectDistressTwoStage`)**

Drop-in replacement for `detectDistress()` in route files:
- Stage 1: Regex (existing `detectDistress()` from guardrails.ts) — fast, zero cost
- Stage 2: If regex finds nothing → Haiku evaluator
- Returns the same `DistressDetectionResult` type

**3. Alerting mechanism**

When the Haiku call fails (network, timeout, parse):
- `console.warn('[R20a ALERT] Classifier failed open...')` — visible in Vercel function logs
- Writes a `classifier_down` marker row to `vulnerability_flag` Supabase table with `needs_rescoring: true`
- These marker rows enable post-hoc rescoring when the classifier recovers (ADR-R20a-01 D6-c)
- Fail-open: the user's input proceeds to evaluation. The alert is for founder review, not blocking.

**4. Cost tracking integration**

Every classifier run (regex-only, Haiku success, Haiku failure) calls `logClassifierRun()` from `r20a-cost-tracker.ts`. The cost tracker was scaffolded — this is what activates it.

**5. Test suite**

- 5 inputs the regex misses that Haiku should catch (Group A: `REGEX_FALSE_NEGATIVES`)
- 5 inputs that should correctly pass through (Group B: `CORRECT_PASS_THROUGHS`)
- 1 content safety edge case (Group C)

### What still needs doing (not in this session)

- **Wire `detectDistressTwoStage` into all 8 route files + context-template.ts.** Currently they call `detectDistress()` directly. The change is mechanical: replace `import { detectDistress }` with `import { detectDistressTwoStage }`, make the call `await` (it's now async), and pass the session ID.
- **Run the eval suite against live Haiku** to confirm the 5 false-negative inputs are caught and the 5 pass-throughs aren't flagged.
- **Confirm `vulnerability_flag` table schema** has a `metadata` JSONB column and a `flag_type` text column. The Phase B deployment (16 April) created this table — verify the columns match.

### Verification step
After wiring to routes: submit each of the 5 Group A inputs through the `/api/score` endpoint. Confirm each returns `distress_detected: true` with severity ≥ moderate. Then submit each Group B input and confirm all return a normal evaluation (no distress block).

### Rollback
Delete `r20a-classifier.ts`. Revert any route changes that import from it. The system falls back to regex-only detection (the current live behavior).

### Open questions
None — founder decided inline Haiku evaluation at session start.

---

## BLOCK 2 — F2: LLM Retry Path (Tier 1)
**Status:** Complete — proposal produced, code change required in sage-reason-engine.ts
**Changes produced:** Proposal below (code not yet applied to engine)
**Risk classification:** Elevated — changes existing error handling on live endpoints

### Proposal: Unified retry wrapper

**Current state:**
- `quick` depth: Has Haiku→Sonnet retry (lines 494-514). Works but bypasses cache/cost tracking (F4).
- `standard`/`deep` depth: Hard throw → 500. No retry. No structured error.

**Proposed change (in sage-reason-engine.ts):**

Replace the current try/catch block (lines 487-514) with:

```typescript
// Parse JSON response — with retry on failure
let evalData
let actualModel = config.model
let retried = false

try {
  evalData = extractJSON(responseText)
} catch {
  // Retry once: same model, same prompt. If it's a transient parse failure,
  // a second attempt often succeeds (LLM output is non-deterministic).
  console.warn(
    `sage-reason-engine: Parse failed at depth '${depth}' (${config.model}). Retrying.`,
    `Input length: ${params.input.length}, response length: ${responseText.length}`
  )

  try {
    const retryMessage = await client.messages.create({
      model: depth === 'quick' ? MODEL_DEEP : config.model, // quick: escalate to Sonnet
      max_tokens: config.maxTokens,
      temperature: 0.2,
      system: systemMessages,
      messages: [{ role: 'user', content: userMessage }],
    })
    const retryText = retryMessage.content[0].type === 'text' ? retryMessage.content[0].text : ''
    evalData = extractJSON(retryText)
    actualModel = depth === 'quick' ? MODEL_DEEP : config.model
    retried = true
  } catch (retryError) {
    // Second failure — return structured error, NOT a 500
    console.error(
      `sage-reason-engine: Retry also failed at depth '${depth}'.`,
      `Model: ${config.model}. Input length: ${params.input.length}.`,
      retryError instanceof Error ? retryError.message : retryError
    )
    // Return a structured error response instead of throwing
    return {
      result: {
        error: 'reasoning_parse_failure',
        error_detail: 'The reasoning engine could not produce a valid evaluation for this input. Please try rephrasing or using a different depth level.',
        depth,
        model: config.model,
        input_length: params.input.length,
        disclaimer: EVALUATIVE_DISCLAIMER,
      },
      meta: {
        endpoint: '/api/reason',
        depth,
        mechanisms_applied: DEPTH_MECHANISMS[depth],
        mechanism_count: DEPTH_MECHANISMS[depth].length,
        ai_generated: false,
        ai_model: config.model,
        latency_ms: Date.now() - startTime,
      },
    }
  }
}

// Log retry for cost visibility (F4)
if (retried) {
  console.warn(
    `sage-reason-engine: Retry succeeded. depth=${depth}, original_model=${config.model}, ` +
    `retry_model=${actualModel}, input_length=${params.input.length}`
  )
}
```

### Should F4 retry cost tracking be unified with this?

**Recommendation: Yes, unify.** Reasoning:
- F2 (retry path) and F4 (retry cost invisibility) are the same code path.
- The retry wrapper above already includes the `retried` flag and logs model/depth.
- When the cost tracking infrastructure activates (r20a-cost-tracker pattern), the retry log gives enough data to track 2x cost.
- Keeping them separate means two different retry implementations, which is the F5 problem (duplication without sync) in a new location.
- The unified approach: one retry block, one log line, one place to add cost tracking later.

### Verification step
After applying: Send 3 complex multi-stakeholder inputs at `standard` depth. If any fail to parse, confirm: (a) the retry fires (check Vercel logs for the warn), (b) the response is a structured `{ error: 'reasoning_parse_failure' }` object, not a 500.

### Rollback
`git revert` the commit that modifies the try/catch block in sage-reason-engine.ts.

### Open questions
None.

---

## BLOCK 3 — F3: project-context.json Staleness (Tier 1)
**Status:** Complete
**Changes produced:**
- `website/src/data/project-context.json` — MODIFIED: `last_updated` set to 2026-04-17, `recent_decisions` updated with audit and remediation decisions
**Risk classification:** Standard — content update to a static file

### Supabase migration: Deferred

**Decision:** Defer the Supabase `project_context` migration.

**Trigger condition:** Run the migration when ANY of:
1. A second person (collaborator, tester, or agent) needs to update project state without access to the git repo
2. The manual update cadence falls behind (>14 days stale on two consecutive sessions)
3. The sage-stenographer skill is built and needs a write target

**Why defer:** The static file works for a solo founder. The overhead of maintaining a Supabase table (migration, RLS, admin client, cache invalidation) adds complexity with no current benefit. The file gets committed with every deploy, which is the right cadence for P0.

### Process note (for Contextual Stewardship Playbook)

**project-context.json update process:**
At the end of every session that makes decisions, update `recent_decisions` in `project-context.json`. Keep the 5 most recent entries. Set `last_updated` to today's date. At session open, check: if `last_updated` is more than 7 days old, update it before doing anything else. This is a founder responsibility — the AI flags staleness but the founder decides what the recent decisions are. Verification: open the file, confirm `last_updated` matches today and the decisions reflect what actually happened.

### Verification step
Open `website/src/data/project-context.json`. Confirm `last_updated` is `2026-04-17` and `recent_decisions` includes the audit completion and remediation entries.

### Rollback
`git revert` the commit.

### Open questions
None.

---

## BLOCK 4 — F5: DEPTH_MECHANISMS Sync (Tier 2)
**Status:** Complete — new file created, engine and loader need import changes
**Changes produced:**
- `website/src/lib/depth-constants.ts` — NEW FILE: Single source of truth for ReasonDepth and DEPTH_MECHANISMS
**Risk classification:** Elevated — touches type definitions used across core reasoning files

### Single source of truth

`depth-constants.ts` exports:
- `ReasonDepth` type (was duplicated in engine line 42 and loader line 30)
- `DEPTH_MECHANISMS` constant (was duplicated in engine lines 129-133 and loader lines 209-213)

### What still needs doing

Replace the duplicated definitions in both files:

**In `sage-reason-engine.ts`:**
```typescript
// DELETE lines 42 and 129-133, REPLACE with:
import { type ReasonDepth, DEPTH_MECHANISMS } from '@/lib/depth-constants'
// SOURCE OF TRUTH: depth-constants.ts. Do not define ReasonDepth or DEPTH_MECHANISMS here.
```

**In `stoic-brain-loader.ts`:**
```typescript
// DELETE lines 30 and 209-213, REPLACE with:
import { type ReasonDepth, DEPTH_MECHANISMS } from '@/lib/depth-constants'
// SOURCE OF TRUTH: depth-constants.ts. Do not define ReasonDepth or DEPTH_MECHANISMS here.
```

### Compile-time check

After both files import from `depth-constants.ts`, TypeScript enforces the sync automatically:
- If you add a mechanism to `DEPTH_MECHANISMS` in `depth-constants.ts`, both files see the change.
- If you add a new depth level to `ReasonDepth`, both files see the change.
- There is no duplication to drift.

The circular dependency that originally caused the duplication (session 7b) is broken because `depth-constants.ts` imports nothing from either file.

A `npx tsc --noEmit` check catches any type mismatch at build time.

### Verification step
After applying the import changes: run `npx tsc --noEmit` in the website directory. If it compiles clean, the types are in sync. Then grep for `DEPTH_MECHANISMS` — it should appear only in `depth-constants.ts` (definition) and in the two consumer files (import).

### Rollback
Delete `depth-constants.ts`, revert the import changes. Both files fall back to their current local definitions.

### Open questions
None.

---

## BLOCK 5 — F6: Crisis Resource Update Schedule (Tier 2)
**Status:** Complete
**Changes produced:**
- `website/src/lib/guardrails.ts` — MODIFIED: Comment block above CRISIS_RESOURCES with verification metadata. US hotline name corrected.
**Risk classification:** Standard — comment addition and content correction

### Verification results

All 5 numbers verified against official sources on 17 April 2026:

| Resource | Number | Status | Source |
|----------|--------|--------|--------|
| Lifeline (AU) | 13 11 14 | Current | lifeline.org.au |
| Beyond Blue (AU) | 1300 22 4636 | Current | beyondblue.org.au |
| 988 Suicide & Crisis Lifeline (US) | 988 | Current | 988lifeline.org |
| Crisis Text Line | Text HOME to 741741 | Current | crisistextline.org |
| Samaritans (UK) | 116 123 | Current | samaritans.org |

**Name correction applied:** "National Suicide Prevention Lifeline (US)" → "988 Suicide & Crisis Lifeline (US)". The name was officially changed in July 2022 when the 988 number launched.

### Calendar reminder specification

Add to your calendar:

```
Title: [SageReasoning] Quarterly crisis resource verification
Date: 30 June 2026 (then repeat quarterly: 30 Sep, 31 Dec, 31 Mar...)
Duration: 30 minutes
Description:
  Verify all 5 crisis hotline numbers in guardrails.ts are current.
  Check each against the organisation's official website:
  - lifeline.org.au → 13 11 14
  - beyondblue.org.au → 1300 22 4636
  - 988lifeline.org → 988
  - crisistextline.org → Text HOME to 741741
  - samaritans.org → 116 123
  If any number has changed:
  1. Edit CRISIS_RESOURCES in website/src/lib/guardrails.ts
  2. Update the "Last verified" date in the comment block
  3. Deploy
  If all numbers are current:
  1. Update only the "Last verified" date in the comment block
  2. No deploy needed unless other changes are pending
```

### Verification step
Open `guardrails.ts`. Confirm the comment block above `CRISIS_RESOURCES` shows `Last verified: 17 April 2026` and `Next verification due: 30 June 2026`. Confirm the US line name reads "988 Suicide & Crisis Lifeline (US)".

### Rollback
`git revert` the commit. The old name was technically outdated but functional.

### Open questions
None.

---

## BLOCK 6 — F7: stoic-brain-compiled.ts Compile Script (Tier 2)
**Status:** Complete
**Changes produced:**
- `scripts/compile-stoic-brain.ts` — NEW FILE: Compile script
**Risk classification:** Standard — new script, no changes to existing files

### How it works

1. Reads all 8 JSON files from `/stoic-brain/`
2. Writes TypeScript constants to `website/src/data/stoic-brain-compiled.ts`
3. Adds a `COMPILED_AT` timestamp constant
4. Reports per-constant character count and token estimate

### Usage

```bash
cd /path/to/sagereasoning
npx ts-node scripts/compile-stoic-brain.ts
```

To add as npm script in `website/package.json`:
```json
"compile-stoic-brain": "npx ts-node ../scripts/compile-stoic-brain.ts"
```

### Trigger condition

Run this script when:
- Any file in `/stoic-brain/*.json` is modified
- A new mechanism is added to the Stoic Brain taxonomy
- Token budget ceilings are changed

### Session handoff addition

Add to the session handoff template:
```
[ ] stoic-brain-compiled.ts current? Last compiled: [date]
```

### Limitation

The current compile script does a direct JSON→TypeScript conversion. It does NOT reproduce the condensed format of the existing `stoic-brain-compiled.ts` exactly — the existing file was hand-compiled with some fields selectively included. Running the script will produce a file with ALL fields from each JSON source, which may exceed the token budget.

**Before running in production:** Compare the script output against the existing file. If token counts are significantly higher, the script needs field-level filtering rules added. This is the "condensation rules" gap flagged in the audit (architectural decisions extract, line 576-577).

### Verification step
Run the script. Diff the output against the existing `stoic-brain-compiled.ts`. Check the token estimate report — totals should be within the 3000/6000 ceilings.

### Rollback
Delete the script. The existing hand-compiled file remains unchanged.

### Open questions
The condensation rules (which fields to include/exclude) are undocumented. The founder needs to decide whether to accept full-field compilation or specify a condensation mapping.

---

## DEFERRED FINDINGS

| Finding | One-line deferral note | Recommended next session |
|---------|----------------------|--------------------------|
| **F4** | Retry cost invisibility — addressed by unified retry wrapper in F2. Apply F2 code to close F4 simultaneously. | Same session as F2 code application. |
| **F8** | Silent Supabase fallback — add `console.warn` to catch block in `project-context.ts`. 2-line change. | Next routine session. |
| **F9** | User message composition order unenforced — needs integration test with mock LLM. | Dedicated testing session. |
| **F10** | Default depth cost implication — needs JSDoc update to `ReasonInput` interface. | Next session touching engine types. |
| **F11** | Session 7b stewardship lesson — process improvement, no code change. Already captured in playbook. | No dedicated session needed. |
| **F12** | R20a interim vs ADR status gap — update compliance register status field. | Next compliance review session. |
| **F13** | `minimal` > `condensed` naming inversion — needs rename + new `identity_only` level. | Session scoped for project-context.ts refactor. |
| **F14** | Proximity levels as free strings — add `ProximityLevel` union type, validate in engine. | Next session touching guardrails types. |
| **F15** | No runtime token budget enforcement — add character-count check in `getStoicBrainContext`. | Next session touching stoic-brain-loader. |
| **F16** | score-document bypasses engine — migrate to `runSageReason()`. | P1 task list (already flagged as tech debt). |

---

## UPDATED CONTEXTUAL STEWARDSHIP PLAYBOOK

```
CONTEXTUAL STEWARDSHIP PLAYBOOK — SageReasoning
Version: 2.0 — 17 April 2026
Updated: Remediation session 17 April 2026

════════════════════════════════════════════════════════════════

EVAL PATTERNS (run before every non-trivial agent action):

  [ ] CONTEXT FRESHNESS
      - Is project-context.json last_updated within 7 days?
      - Is the Supabase project_context migration run? (Currently: NO — deferred)
      - Trigger for migration: second collaborator, >14-day staleness on 2 sessions,
        or sage-stenographer build.
      - Are recent_decisions current or frozen from a past session?

  [ ] COMPOSITION ORDER
      - Does this change touch the six-layer user message order?
      - Order: domain → practitioner → project → urgency → stage_scoring → JSON instruction
      - Source of truth: architectural-decisions-extract.md, section "Three layers
        composed in a fixed order"

  [ ] TOKEN BUDGET
      - Does this change add tokens to any layer?
      - Current totals per depth:
          quick:    ~995 (Stoic Brain) + ~400 (practitioner) + ~139 (project) = ~1534
          standard: ~1538 + ~400 + ~139 = ~2077
          deep:     ~2007 + ~400 + ~139 = ~2546
      - Ceilings: quick 3000, deep 6000 (per context-architecture-build.md line 59)
      - WARNING: These are Layer-level ceilings, NOT total prompt ceilings.
        Total prompt includes system prompt + user input + all layers.

  [ ] DISTRESS DETECTION (R20a)
      - Is detectDistressTwoStage() wired for ALL human-facing endpoints?
      - Current two-stage design: regex (guardrails.ts) + Haiku (r20a-classifier.ts)
      - If Haiku fails, does it fail open with alerting? Check for classifier_down
        marker rows in vulnerability_flag table.
      - Test: submit Group A eval inputs after any change to detection logic.

  [ ] COMPLIANCE REGISTER
      - Does this change affect R17–R20 implementation status?
      - Check the deployed code, not the decision log. The decision log records
        intent; the code is the truth.
      - Key gap: R20a is "interim (regex-only)" until Phase D classifier is
        wired to all routes. ADR-R20a-01 Phases C-H status tracked separately.

  [ ] ROLLBACK
      - If this fails, what is the exact revert step?
      - For engine changes: git revert [commit]. Graceful degradation means
        removing a layer degrades context, doesn't break the endpoint.
      - For schema changes: DROP TABLE IF EXISTS [table] CASCADE.
      - For auth/access changes: CRITICAL CHANGE PROTOCOL required (0c-ii).

  [ ] DUAL VERIFICATION (learned from session 7b incident)
      - API test: Does the endpoint return valid JSON with expected fields?
      - Client test: Does every page that consumes this endpoint render correctly?
      - If you changed the response schema, grep for every client-side reference
        to the changed fields.

════════════════════════════════════════════════════════════════

CONTEXT DOCUMENTATION TEMPLATE (for every new module):

  Purpose:              [one sentence]
  Risk classification:  [standard / elevated / critical — per 0d-ii]
  Rules served:         [R-numbers]
  Architectural tensions: [list or "none"]
  What breaks if this file is deleted: [specific downstream effects]
  What breaks if this file returns wrong data: [silent failure modes]
  Duplicated constants:  [list files that must stay in sync, or "none"]
  Last verified:        [date + method]
  Update trigger:       [what event requires this file to be updated]

════════════════════════════════════════════════════════════════

GUARDRAIL CHECKLIST (before every deployment):

  [ ] Auth handled before engine call?
  [ ] detectDistressTwoStage() wired for ALL human-facing endpoints?
      Current list: reason, score, score-decision, score-social,
      score-document, reflect, score-scenario, mentor/private/reflect
      + 12 marketplace skills (via context-template.ts)
  [ ] Output validated against expected schema?
      (katorthoma_proximity present AND value is valid ProximityLevel)
  [ ] Retry logic has a defined failure path (not infinite)?
      Current: all depths get 1 retry. Quick escalates to Sonnet.
      Standard/deep retry same model. Second failure returns structured error.
  [ ] Cost impact estimated and within budget?
      Quick (Haiku): ~$0.001/call. Standard/Deep (Sonnet): ~$0.015/call.
      Retry doubles cost for failed calls. Classifier adds ~$0.00001/call.
  [ ] Crisis resources current?
      Last verified: 17 April 2026
      Next verification: 30 June 2026

════════════════════════════════════════════════════════════════

PROJECT CONTEXT UPDATE PROCESS (F3):

  WHO:  Founder
  WHEN: End of every session that makes decisions
  WHAT: Update recent_decisions (keep 5 most recent), set last_updated to today
  CHECK AT SESSION OPEN: If last_updated > 7 days old, update before other work
  VERIFY: Open the JSON file, confirm dates and decisions match reality
  SUPABASE: Deferred. Trigger: second collaborator, 14-day staleness x2, or
            sage-stenographer build.

════════════════════════════════════════════════════════════════

DECISION LOG FORMAT (for every session):

  Date:
  Decision made:
  Why (not just what):
  What was rejected and why:
  Risk classification: [standard / elevated / critical]
  Rollback path: [exact command or steps]
  Open questions deferred:
  Root cause confirmed: [yes/no — if this closes an incident, document the evidence]

════════════════════════════════════════════════════════════════

KNOWN SYNC POINTS (files that must stay in sync):

  1. DEPTH_MECHANISMS + ReasonDepth:
     SOURCE OF TRUTH: depth-constants.ts
     Consumers: sage-reason-engine.ts, stoic-brain-loader.ts
     Enforcement: TypeScript imports — no duplication possible after F5 fix applied.

  2. Proximity scale: guardrails.ts (rank mapping) ↔ sage-reason-engine.ts
     (system prompt JSON schema) ↔ score/page.tsx (client display)
     Values must be identical strings across all three.

  3. Crisis resources: guardrails.ts ↔ distress-signal-taxonomy.md
     Hotline numbers must match. guardrails.ts is the runtime source.
     Quarterly verification schedule set (next: 30 June 2026).

  4. Context levels: project-context.ts (level definitions) ↔
     each route file (level parameter passed to getProjectContext)
     Must use valid level names.

  5. Stoic Brain compiled ↔ source JSON:
     SOURCE: /stoic-brain/*.json (8 files)
     COMPILED: website/src/data/stoic-brain-compiled.ts
     Compile script: scripts/compile-stoic-brain.ts
     Trigger: any change to source JSON files.

════════════════════════════════════════════════════════════════

RECURRING CHECKS:

  QUARTERLY: Verify crisis resource phone numbers (F6)
             Next due: 30 June 2026
  MONTHLY:   Check Vercel logs for:
             - Supabase fallback warnings (F8)
             - '[R20a ALERT] Classifier failed open' entries
             - 'sage-reason-engine: Retry succeeded' frequency
  PER-SESSION: Update project-context.json recent_decisions (F3)
               Session handoff: [ ] stoic-brain-compiled.ts current?
  PER-DEPLOY: Run dual verification — API + client rendering (F11)
  PER-NEW-ENDPOINT: Set depth explicitly, wire detectDistressTwoStage if
                    human-facing, choose project context level by
                    actual token count not name (F13)
```
