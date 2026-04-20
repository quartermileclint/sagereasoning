# Support Wiring Mount — Close Handoff

**Created:** 20 April 2026
**Author session:** Support wiring mount session (prompted by `operations/handoffs/support-wiring-mount-prompt.md`).
**Status of this document:** Closes the mount session. **No code was changed.** Session stopped at Step A per the prompt's own branch instruction when no Support run-loop caller was found in the repo. Channels 1 and 2 remain at status **Wired** (from the prior session); they do **not** advance to **Verified** this session. The Support run-loop caller is deferred to a dedicated future session.

---

## Decisions Made

- **Stopped at Step A (scope finding).** The mount-session prompt frames the session as "find the Support run-loop caller, update it to use `processInboxItemWithGuard`, inject real deps, live-test three canonical cases on a Vercel deploy, promote Wired → Verified." Step A is "Locate the Support run-loop caller." The grep sweep returned zero external callers. The prompt's own branch instruction covers exactly this case: *"If you find NO caller at all: the run-loop has not been wired yet, and this session's task becomes scoping + building the thinnest possible caller, not mounting. Flag this to the founder immediately with 'I'd push back on this' and wait before building anything new. A new run-loop is a bigger scope than this session was framed for."*
- **Founder chose option A — close to known-good.** Three options were presented:
  - **A.** Close this session here; record PR7 deferral; Channels 1 and 2 remain Wired; future session scopes + builds the caller.
  - **B.** Keep session open but re-scope to "decide where the Support run-loop lives" — no code, one-page ADR output.
  - **C.** Expand scope to build the thinnest-possible caller now (flagged as against PR1 and against the founder's "fast, bounded phases" working pace).
  Founder selected **A** without re-debate. Acted on immediately.
- **No Critical Change Protocol announced.** 0d-ii classification was not triggered this session because no code was changed. The risk classifications pre-announced in the mount-session prompt (Critical on mount, Critical on classifier injection, Elevated on supabaseAdmin injection, Standard on live test) are **not** consumed — they carry forward to whichever future session actually performs the mount.

## Status Changes (0a vocabulary)

| Thing | Before | After |
|---|---|---|
| Channel 1 — Support distress pre-processing | Wired (unit-verified) | **Wired** — no change |
| Channel 2 — Support interaction history / synthesis | Wired (unit-verified) | **Wired** — no change |
| Support run-loop caller | Did not exist | **Scoped only as "absent"** — no module created, no status claimed. PR7 deferred decision. |
| `processInboxItem` / `processInboxItemWithGuard` | Wired (unit-verified) | **Wired** — no change |
| Verification harness `scripts/support-wiring-verification.mjs` | Wired (30/30 assertions green) | **Wired** — no change, not re-run |

**No module advanced to Verified this session.** Verified for Channels 1 and 2 still requires a live end-to-end test on a Vercel deploy — which requires a caller — which does not exist. The status definition in 0a is honoured: Verified means "Tested and confirmed working by both parties," and there was nothing to test against a real system.

## What Was Built

**Nothing.** No files created. No files modified. No commits. No pushes. No deploys.

### Files Read (reading list per prompt)

| File | Why |
|---|---|
| `operations/handoffs/support-wiring-fix-close.md` | Full prior-session context |
| `sage-mentor/support-distress-preprocessor.ts` | Channel 1 (top to bottom) |
| `sage-mentor/support-history-synthesis.ts` | Channel 2 (top to bottom) |
| `sage-mentor/support-agent.ts` L700–900 | `ProcessInboxItemDeps`, `ProcessInboxItemResult`, `processInboxItem`, `processInboxItemWithGuard` |
| `website/src/lib/r20a-classifier.ts` (signature only) | Confirmed `detectDistressTwoStage(text: string, sessionId?: string) => Promise<DistressDetectionResult>` matches `SupportDistressDeps.classify` |
| `operations/knowledge-gaps.md` | KG1 (Vercel serverless), KG2 (Haiku reliability), KG3/KG7 (build-to-wire), KG10 (JSONB — not applicable here) |

### Greps Run (scope assessment)

| Query | Result |
|---|---|
| `processInboxItem` across all `.ts`/`.tsx`/`.mjs`/`.js` | One call site: `support-agent.ts:898`, inside `processInboxItemWithGuard`. Zero external callers. |
| `initialiseSupportAgent`, `parseInboxFile`, `searchKnowledgeBase` | Exported from `sage-mentor/index.ts`. Not imported by any file outside `sage-mentor` or `scripts/support-wiring-verification.mjs`. |
| `support_interactions` / `support-agent` imports | No importer in `website/`, `api/`, or `scripts/`. The only cross-boundary consumer of sage-mentor is `website/src/lib/sage-mentor-bridge.ts`, which re-exports `buildMentorPersona` and `loadProfile` only. |
| `api/functions/` contents | Empty directory. |
| `vercel.json` | Does not exist anywhere in the repo (excluding `node_modules`). |
| `inbox|runLoop|runSupport|supportLoop|supportRun` across code files | No match outside `sage-mentor/` or the Stripe webhook. |
| `/support/inbox/` directory | Exists as a file drop (markdown files). No code reads it into the agent. |

**Conclusion:** The Support run-loop caller does not exist. The `support/inbox/` folder is a file convention with no runner attached. The mount session cannot proceed because there is nothing to mount on.

## Verification Completed This Session

**None was required, and none was attempted.** The prior session's 30-assertion unit harness was not re-run — no change was made that could have invalidated it. The live integration harness (the three canonical cases on a Vercel deploy) was not attempted because the prerequisite (a run-loop caller) is absent.

## Next Session Should

This is a fork. The founder picks the prompt shape for the next session; this handoff does **not** prescribe one.

1. **Dedicated scoping session for the Support run-loop caller.** The output is a one-page ADR (use the `engineering:architecture` skill) that decides the five questions below. No code written in that session.
   - **Where does the caller live?** Options: a Vercel API route (e.g. `/api/support/run`) triggered on-demand; a `vercel.json` cron; a local `scripts/` runner executed by the founder; a webhook on inbound email; a file watcher over `support/inbox/`. KG1 (Vercel serverless) constrains three of those five.
   - **What triggers it?** Manual invocation, schedule, webhook, file event?
   - **What is an "inbox item" in production?** The current markdown file format that `parseInboxFile` consumes, or a new `support_interactions` row shape, or both?
   - **Where do `userId` and `sessionId` come from?** Auth session (requires the caller to be user-authenticated), a service-role invocation against a per-user queue (requires a user-id column on the inbox-item source), or a constant for a single-tenant MVP?
   - **Where does the outbound draft go?** Back to the markdown file's "Draft Response" section, email out, a `support_interactions.draft_response` column, or split (draft in DB, crisis redirect also in DB with `status='escalated'`)?
2. **After the ADR, a separate implementation session** builds the thinnest caller that satisfies the ADR. That session's risk classification is pre-set by the ADR: any hosting surface that touches auth, session, cookie, or deploy-config is standing-Critical (AC7 / PR1). A new API route that does none of those is Elevated.
3. **After the implementation session, a separate mount session** does the live integration: inject `supabaseAdmin`, inject `detectDistressTwoStage`, run the three canonical cases, promote Wired → Verified. This is the session the current prompt was trying to be — it will succeed once its prerequisite exists.

Do not collapse steps 1–3 into a single session. The reason this session closed early is exactly that the prompt assumed the prerequisite for step 3 was already in place. PR1's discipline applies: prove one small thing, then the next.

## Blocked On

- **Step 3 (mount + live test) is blocked on step 2 (caller exists).** Step 2 is blocked on step 1 (ADR answers the five decisions).
- **Nothing about the two channels shipped last session is blocked.** They remain Wired + unit-verified, ready for the caller to be built around them. The branded `SupportSafetyGate` and the `processInboxItemWithGuard` entry point make the caller's job small: construct the deps, call the function, handle `ProcessInboxItemResult.shouldEscalate` / `crisisRedirectDraft`. No further work on sage-mentor is needed to unblock the caller.

## Open Questions / Deferred Decisions (PR7)

- **Support run-loop caller design.** Not scoped in this session's prompt; acknowledged absent; explicitly deferred to a dedicated ADR session. Revisit condition: founder drafts a new session prompt scoped to "decide where the Support run-loop lives" and the five sub-questions above. Entered in the decision log.
- **Classifier_down marker insert path column mismatch in `r20a-classifier.ts`.** Carried forward unchanged from the prior close handoff. Did not surface this session (no live run). Revisit condition: surfaces as a real error on the next live run; or the next mount session schedules it proactively before going live.
- **`vulnerability_flag.session_id NOT NULL` constraint.** Carried forward unchanged. Does not affect read-path; affects any future Support-side write path. Revisit condition: when the Support-side write path for `vulnerability_flag` is scoped (not this session's scope).
- **Published shared `@sage/safety` package.** Carried forward. Revisit condition: a second cross-module safety function needs DI; one function still uses DI alone (this session adds no new cross-module safety function, so the condition is unchanged).

## Knowledge Gaps Touched (PR5 scan)

- **KG1 (Vercel serverless execution model):** Directly relevant to step 1's hosting-surface decision. No re-explanation required this session — the prompt already scopes model choice as an open design decision. No promotion condition met.
- **KG2 (Haiku reliability under load):** Relevant to any future live run on the classifier. Not exercised this session. No re-explanation required. No promotion condition met.
- **KG3 / KG7 (Build-to-wire gap):** Directly addressed — the session stopped precisely because the wire (caller → `processInboxItemWithGuard`) does not exist. The branded-gate type that prevents bypass is already in place. No re-explanation required. No promotion condition met.
- **KG10 (JSONB storage format):** Checked and does not apply (no JSONB writes in scope, none attempted).

**No new knowledge-gap entries promoted this session.** The core lesson of this session — "before committing to mount, verify the caller exists" — is a process rule that already lives in the manifest (PR2: build-to-wire verification is immediate). The session honoured PR2 by checking first and stopping when the precondition failed.

## Decision-Log Entries Appended

One entry appended to `operations/decision-log.md`, dated 20 April 2026:

1. **Support Run-Loop Caller Deferred (Mount Session Closed Early)**

## Working Agreements — Honoured

- Plain language, exact paths, exact commands. Founder not asked to read TypeScript.
- Founder decides scope. "I'd push back on this" was the signal used. Founder replied "A". Acted on immediately without re-debating.
- Classified every proposed code change under 0d-ii **before execution**. No code changed because no change was authorised.
- Deferred decision (Support run-loop caller) entered in the decision log with reasoning and revisit condition — not dropped silently (PR7).
- Session stabilised to known-good state before close. No additional fixes proposed. (Founder preference: when I signal done, stabilise and close.)

---

**End of close handoff.** Session closed in a known-good state. Channels 1 and 2 remain at status **Wired**. The 30-assertion unit harness (`node scripts/support-wiring-verification.mjs`) can still be re-run at any time to confirm the pipeline shape is intact. Nothing was pushed, deployed, or merged.
