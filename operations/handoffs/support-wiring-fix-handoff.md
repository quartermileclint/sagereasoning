# Support Wiring Fix — Handoff

**Created:** 20 April 2026
**Author session:** scoping session only (no code written)
**Status of this document:** Scoped and Designed. Awaiting founder approval of the Critical Change Protocol before any scaffolding, wiring, or verification happens.
**Successor session:** open a fresh session and paste `support-wiring-fix-prompt.md` as the opening message.

---

## Purpose

Fix two broken dynamic input channels on the Support agent. The pattern has already been proven on the private mentor (PR1 satisfied). Support is the second endpoint to receive the pattern.

- **Channel 1 — Distress Pre-Processing** (R20a, safety-critical, PR6 → Critical under 0d-ii)
- **Channel 2 — Support Interaction History / Synthesis** (Elevated under 0d-ii)

---

## Findings — current state of Support wiring

Status vocabulary (0a): both channels are today at `scaffolded`. The Support agent file exists and parses tickets, but neither channel gets processed input. Every inbox item goes to the drafter raw.

### Channel 1 — Distress Pre-Processing is missing entirely

- `sage-mentor/support-agent.ts → processInboxItem()` only calls `detectGovernanceFlags()`, a keyword matcher for R1/R2/R9 (therapeutic, employment, outcome promises).
- The proven R20a two-stage classifier — `detectDistressTwoStage()` in `website/src/lib/r20a-classifier.ts`, wrapped by `enforceDistressCheck()` in `website/src/lib/constraints.ts` — is used on `/api/mentor/private/reflect` and other public endpoints. It is **not called from Support at all**.
- No prior-session baseline is queried. The `vulnerability_flag` table exists (`supabase/migrations/20260416_r20a_vulnerability_flag.sql`) but Support never reads it, so R20's "sudden drastic change" indicator is blind.

### Channel 2 — Support Interaction History Synthesis is missing entirely

- The `support_interactions` table exists (`api/migrations/support-agent-schema.sql`) with user_id, customer_id, subject, status, resolved_at, created_at, ring_evaluation, etc.
- It is written to by `sage-mentor/sync-to-supabase.ts` on resolution.
- Nothing reads from it during `processInboxItem`. Every customer is treated as first-time. No category frequency, no 30-day rolling window, no open-issues lookup. The 20% category threshold for the feedback loop is therefore also blind.

### Proven mentor pattern (PR1 evidence)

The private mentor's `reflect` route (`website/src/app/api/mentor/private/reflect/route.ts`) awaits `enforceDistressCheck(detectDistressTwoStage(combinedInput))` at pipeline entry and returns early if `gate.shouldRedirect` is true. Synthesis (`getMentorObservations`, `getJournalReferences`, `getProfileSnapshots`, `getRecentInteractionsAsSignals`) runs in parallel and is appended to the user message. That is the pattern being ported to Support.

---

## Design — both channels

### Channel 1 — `sage-mentor/support-distress-preprocessor.ts` (new file)

Exports:

```ts
type SupportDistressSignal = {
  current: DistressDetectionResult           // from detectDistressTwoStage
  prior_flags: PriorDistressFlag[]           // last 90 days, from vulnerability_flag
  baseline_severity: 'none'|'mild'|'moderate'|'acute'  // modal prior severity
  sudden_change: boolean                     // baseline none/mild, current moderate/acute
  source_stage: 'regex'|'haiku'|'none'
  processed_at: string
}

type PriorDistressFlag = {
  flag_id: string|null
  interaction_id: string|null
  severity: 'mild'|'moderate'|'acute'
  detected_at: string
  source: 'vulnerability_flag' | 'support_interaction_metadata'
}

async function preprocessSupportDistress(
  supabase: SupabaseClient,
  userId: string|null,
  customerId: string|null,
  text: string,
  sessionId?: string,
): Promise<SupportDistressSignal>
```

The preprocessor is **synchronous w.r.t. the rest of the pipeline** (PR3): `processInboxItem` awaits it before anything else runs. No background, no fire-and-forget.

`processInboxItem` becomes `async` and takes a branded `SupportSafetyGate` parameter (same shape as `SafetyGate` in `constraints.ts`). A caller cannot produce a gate without awaiting the preprocessor — type-enforced, same discipline as the mentor.

If `gate.shouldRedirect` is true, the Support agent does **not draft**. It sets status to `escalated`, writes the crisis-resource redirect message into the inbox file's Draft Response section, adds `R20a` to `governance_flags`, and returns. No LLM draft is ever generated for an acute or moderate distress input. This matches the mentor's behaviour.

### Channel 2 — `sage-mentor/support-history-synthesis.ts` (new file)

Exports:

```ts
type SupportInteractionHistory = {
  prior_contact_count: number
  last_contact_at: string|null
  open_issues: OpenIssueRef[]
  category_frequency_30d: Record<string, number>
  trend: 'new'|'returning'|'frequent'|'escalating'
  prior_distress_flags: PriorDistressFlag[]   // re-used from Channel 1
  synthesized_at: string
}

async function synthesiseSupportHistory(
  supabase: SupabaseClient,
  userId: string,
  customerId: string|null,
  windowDays: number = 30,
): Promise<SupportInteractionHistory>
```

Reads `support_interactions` (user_id + customer_id + created_at ≥ now−30d), plus `vulnerability_flag` for distress cross-reference. Derives trend from count + recency. Surfaces the 20% category threshold computation as `category_frequency_30d` (the feedback loop consumes this downstream).

The history is passed into `processInboxItem` and then into `buildDraftPrompt` as a new `history_context` block so the drafter sees "this is customer X's third contact this week, two about billing, one open issue still pending".

### Wiring point — `sage-mentor/support-agent.ts`

`processInboxItem` signature changes (breaking change to the module API):

```ts
async function processInboxItem(
  item: InboxItem,
  profile: MentorProfile,
  knowledgeBaseArticles: KBArticle[],
  deps: {
    supabase: SupabaseClient,
    userId: string,
    sessionId?: string,
  },
  _config = DEFAULT_RUN_LOOP_CONFIG,
): Promise<{
  ringTask, beforeResult, draftPrompt,
  relevantArticles, governanceCheck,
  distress: SupportDistressSignal,         // new
  history: SupportInteractionHistory,      // new
  shouldEscalate: boolean,
  escalationReason: string|null,
}>
```

The two channel calls run in parallel (`Promise.all`) — they are independent. `buildDraftPrompt` gets both as new inputs.

### Status after wiring (target)

| Item | Before | After this change |
|---|---|---|
| Channel 1 preprocessor module | not present | wired |
| Channel 2 synthesis module | not present | wired |
| `processInboxItem` signature | sync, no deps | async, supabase + userId required |
| Distress gate on Support drafts | **absent** | enforced (SafetyGate) |
| Prior-flag baseline lookup | absent | present (90-day window) |
| 30-day category frequency | absent | present |
| Live production Support agent | not live | still not live (run loop is scaffolded but not yet dispatched) |

The Support agent's run loop is not yet invoked from production, so this change lands in scaffolded code, not a running pipeline. That is why this change does not affect any live user session — but PR6 still makes it Critical because the distress classifier is being touched.

---

## Critical Change Protocol (0c-ii) — Channel 1

**1. What is changing — plain language.** Adding a distress preprocessor to the Support agent's inbox-item flow. Every customer message will be run through the same two-stage classifier (regex then Haiku) that already runs on the private mentor. If it detects moderate or acute distress, Support will refuse to draft a response and will escalate with crisis resources. Support will also check whether this customer has had prior distress flags in the last 90 days, so R20's "sudden drastic change" rule can fire.

**2. What could break — specific worst case.** Three failure modes:

  (a) If the preprocessor throws (network failure on Haiku) and fails-closed rather than fail-open, every inbox item escalates and no drafts ever go out. Mitigation: the existing `evaluateBorderlineDistress` already fails open with a `classifier_down` marker row — preserve that behaviour, do not change it.

  (b) If the SafetyGate is mis-wired so that `processInboxItem` can still be called without awaiting the preprocessor, the distress check is silently skipped. Mitigation: the brand type makes this a compile error; add a grep assertion in the verification step (PR2).

  (c) If the `vulnerability_flag` read by user_id returns a row from an unrelated context (e.g., a mentor-side flag), Support will treat that customer as a sudden change when they are not. Mitigation: for Phase 1 include mentor-side flags in the baseline — they are still real distress signals for that user, just from a different surface. Founder can override: scope to Support-originated flags only.

**3. What happens to existing sessions.** No existing user session is affected. The Support agent's run loop does not touch any live human session. No cookies, no auth state, no deployed API route changes in this patch. Founder's ability to sign in and use the private mentor is not affected.

**4. Rollback plan.** Two files are net-new (`support-distress-preprocessor.ts`, `support-history-synthesis.ts`) plus one signature change in `support-agent.ts`. Rollback is `git revert <commit>` then push. Safer variant available on request: gate the new channels behind an env flag (`SUPPORT_DISTRESS_V1=true`) so the change is dark-deployed and the founder flips it on after inspecting the code.

**5. Verification step.** After wiring:

  (a) Grep for every call site of `processInboxItem` and confirm each one is constructing a SafetyGate — not just defining one (PR2).

  (b) A short `.mjs` harness the founder can run that feeds three test messages (clean, acute distress, returning customer) through the new path and prints the resolved `SupportDistressSignal` and `SupportInteractionHistory` shape.

  Expected output: clean → `shouldRedirect: false`; acute → `shouldRedirect: true` with crisis-resource message; returning → non-zero `prior_contact_count`.

**6. Explicit approval — what founder needs to decide.** Three choice points:

  (a) The SafetyGate-enforced async signature on `processInboxItem` (breaking change to the module).

  (b) Including mentor-side vulnerability flags in the Support baseline, or scoping to Support-originated flags only.

  (c) Whether to wire this straight in or gate behind `SUPPORT_DISTRESS_V1`. Default recommendation: straight in, because Support is not yet live.

---

## Channel 2 risk classification

Classified **Elevated** under 0d-ii (adds a new read path; does not touch safety-critical logic). Rollback is the same revert. Worst case: the `support_interactions` query is slow and adds latency to the inbox loop; mitigation is the index `idx_support_interactions_created` which already exists.

---

## Choice points for the next session

Four options the founder can pick from when the new session opens:

1. **"Proceed as designed"** — wire both channels straight in, no env flag, mentor-side flags included in baseline. Recommended default.
2. **"Proceed but gate Channel 1 behind SUPPORT_DISTRESS_V1"** — dark deploy, founder flips the flag after inspection.
3. **"Scope the prior-flag query to Support-originated flags only"** — exclude mentor-side flags from the baseline.
4. **"Push back on something else"** — founder names the bit to rework before coding.

---

## Out of scope for the wiring session

- Activating the Support run loop (not part of this task).
- Changing `detectDistressTwoStage` or any Zone 2 / Zone 3 classifier logic (PR6 — always Critical; separate session if ever needed).
- Touching the mentor wiring (that is already the proof).
- Migration of existing `support_interactions` rows (there are currently only local markdown files in `support/inbox/` from 4 April 2026 — all historic, none affected by a read-path-only change).
- Any auth, cookie, or deploy-config change (AC7 / PR1 standing-Critical surface).

---

## Decision-log entries to produce at wiring session close

Two entries (PR7 — documented decisions, including any non-decisions):

1. Adopted/deferred: mentor-side flags in Support baseline (choice point a).
2. Adopted/deferred: SUPPORT_DISTRESS_V1 env flag vs straight-wire (choice point c).

Plus whichever other Elevated/Critical decisions the session surfaces.

---

## Files that will be touched at the wiring session

Net-new:
- `sage-mentor/support-distress-preprocessor.ts`
- `sage-mentor/support-history-synthesis.ts`
- `scripts/support-wiring-verification.mjs` (harness the founder runs)

Modified:
- `sage-mentor/support-agent.ts` (signature change on `processInboxItem`; new imports)
- `sage-mentor/index.ts` (new exports)
- `operations/decision-log.md` (entries above)
- `operations/handoffs/support-wiring-fix-close.md` (session close note)

No website/src/* files are touched. No Supabase migrations. No API route changes.

---

## Knowledge-gap flags for the wiring session

- **PR5 scan:** `operations/knowledge-gaps.md` for concepts relevant to Supabase reads, SafetyGate pattern, and type-branded tokens. Read resolutions before wiring.
- **KG10** (JSONB storage format) applies if `ring_evaluation` JSONB is read during Channel 2 synthesis.

---

## Guardrails the wiring session must respect

- **PR1** satisfied: mentor is the proof; Support is the rollout. Do not add a third endpoint in the same session.
- **PR2**: wire and verify in the same session. Grep for call sites (not definitions) as the invocation check.
- **PR3**: preprocessor runs synchronously before the draft path. No fire-and-forget.
- **PR4**: confirm model selection for the Haiku classifier against `website/src/lib/constraints.ts` before wiring (it is already constrained — just confirm, do not change).
- **PR6**: any touch of distress logic is Critical. The signature change is Critical by inheritance. Announce the classification at session open.
- **PR7**: deferred decisions go in the decision log with the condition that would trigger revisiting.
