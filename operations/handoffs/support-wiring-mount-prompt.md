# Support Wiring — Mount on Run-Loop — New Session Prompt

**Paste everything between the two fences below into a fresh Claude session.**
Keep this file as the canonical record of what the next session was asked to do.

---

```
You are picking up the SageReasoning build. Follow the project instructions and the manifest.

**First action, before anything else:**
Read `operations/handoffs/support-wiring-fix-close.md` end to end. That close
handoff contains everything the previous session produced: the three files
created, the two files modified, the breaking change to processInboxItem,
the 30/30 unit-level harness pass, and the exact work remaining to reach
Verified status on Channel 1 and Channel 2.

Then read, in this order:
  1. `sage-mentor/support-distress-preprocessor.ts` (Channel 1 — top to bottom)
  2. `sage-mentor/support-history-synthesis.ts` (Channel 2 — top to bottom)
  3. `sage-mentor/support-agent.ts` lines 700–900 (new deps, signature,
     processInboxItem, processInboxItemWithGuard)
  4. `website/src/lib/r20a-classifier.ts` — specifically the exported
     `detectDistressTwoStage` function. PR6: DO NOT touch this file.
     Read to confirm its signature matches `SupportDistressDeps.classify`.

Then scan `operations/knowledge-gaps.md` for any concept relevant to:
  (a) Vercel serverless execution model (KG1 — important if the Support
      run-loop is a cron or an API route),
  (b) Haiku reliability under load (KG2 — now actually live),
  (c) the Build-to-wire gap pattern (KG3 / KG7),
  (d) JSONB storage format (KG10 — only if a write path to ring_evaluation
      is in scope).
Read any relevant entries before wiring.

---

## Primary task for this session

Mount the Support distress gate on the real Support run-loop and move
Channel 1 and Channel 2 from 0a status **Wired → Verified**.

The previous session built the modules (support-distress-preprocessor.ts,
support-history-synthesis.ts) and changed processInboxItem's signature to
require a SupportSafetyGate. It also wrote processInboxItemWithGuard as the
convenience entry point. None of this is being called by a run-loop yet —
Vercel is green because zero external code calls processInboxItem. The gate
exists but is not live on any inbox item.

This session's job is to find the Support run-loop caller (wherever it lives
in the repo), change it to call processInboxItemWithGuard with real
dependencies, and verify on a real deploy that the three canonical cases
behave correctly end-to-end.

---

## Step-by-step

**Step A — Locate the Support run-loop caller.**
Grep the repo for places that would plausibly drive the Support agent:
  - `grep -rn "initialiseSupportAgent\|parseInboxFile\|searchKnowledgeBase" .`
  - `grep -rn "support_interactions" api/ website/ scripts/ 2>/dev/null`
  - Check `api/`, `website/src/app/api/`, `scripts/`, and any cron/worker
    config in `vercel.json` or similar.

If you find a caller that already imports `processInboxItem`: this is the
file to update.

If you find NO caller at all: the run-loop has not been wired yet, and this
session's task becomes scoping + building the thinnest possible caller, not
mounting. Flag this to the founder immediately with "I'd push back on this"
and wait before building anything new. A new run-loop is a bigger scope
than this session was framed for.

**Step B — Announce classification under 0d-ii.**
- Mounting `processInboxItemWithGuard` on the Support run-loop: **Critical**
  (PR6 by inheritance — the gate becomes live on real user data).
- Injecting `detectDistressTwoStage` as deps.classify: **Critical** by
  inheritance (safety-critical function invocation).
- Injecting Supabase admin client as deps.supabase: **Elevated** (new read
  path to vulnerability_flag + support_interactions from a new call site).
- Live test on a deploy with synthetic messages: **Standard** (no prod
  write, synthetic inputs only) — but announce it before doing it.

Wait for founder "proceed" before any code change. Complete the Critical
Change Protocol (0c-ii) visibly in the conversation:
  (a) What is changing (plain language).
  (b) What could break — name the three inherited failure modes:
      fail-closed on Haiku outage; mis-wired gate bypasses distress check;
      cross-context vulnerability_flag matches. Also name one new failure
      mode specific to this session: the injected classifier and the
      injected supabase client must come from the same auth context as
      the inbox item owner, or the baseline read will miss or over-match.
  (c) What happens to existing sessions — typically none if the run-loop
      is a scheduled job, but confirm before claiming so.
  (d) Rollback plan — exact revert path the founder can perform from
      GitHub Desktop without a coding tool.
  (e) Verification step — what the founder checks after deploy.
  (f) Explicit approval from founder.

**Step C — Wire the caller.** Order:

  1. Modify the Support run-loop caller to import from '../sage-mentor'
     (or the project's equivalent path) and call `processInboxItemWithGuard`
     instead of the old `processInboxItem`.
  2. Inject real dependencies:
       deps.supabase  → the existing supabaseAdmin client the caller
                        already uses, or the nearest equivalent.
       deps.classify  → detectDistressTwoStage from
                        website/src/lib/r20a-classifier. If the caller
                        lives outside website/, adopt the DI pattern
                        already used for sage-mentor/sync-to-supabase.ts
                        (narrow structural type declared locally). DO NOT
                        vendor the classifier into sage-mentor.
       deps.userId    → the authenticated user id owning the inbox item.
       deps.sessionId → the caller's session/run identifier for cost
                        tracking.
  3. Handle the ProcessInboxItemResult return shape:
       - If result.shouldEscalate === true → persist
         result.crisisRedirectDraft as the outbound draft, mark the
         inbox item as escalated, STOP the drafter path.
       - Else → proceed with the LLM draft using result.history in the
         prompt (already wired inside processInboxItemWithGuard; the
         caller does not need to pass it explicitly).
  4. Grep again for any remaining reference to the old processInboxItem
     signature. There should be zero.

**Step D — Push and wait for Vercel Green.**
Announce the push. Wait for Vercel to report green before proceeding
to Step E. If Vercel reports red, stop and diagnose before any live test.

**Step E — Live test three canonical cases on the deploy.**
Provide the founder with three verbatim test messages to put through
the real Support inbox. Use the same shapes as the unit-harness in
`scripts/support-wiring-verification.mjs`:

  1. CLEAN: "Hi team, I was double-charged last Tuesday. Could you refund
     one of the invoices?"
     Expected: a normal support draft with a HISTORY CONTEXT block noting
     "this appears to be the customer's first recent contact".

  2. ACUTE DISTRESS: [provide the founder with the exact synthetic text
     to paste into the test inbox — do NOT ask the founder to write this
     themselves; use a recognisable synthetic string that the regex
     stage will hit, e.g. the same phrasing used in the unit harness
     Case B. Keep it synthetic — never route a real user message as a test.]
     Expected: the drafter short-circuits; the outbound draft equals
     `buildCrisisRedirectDraft(gate)` with the crisis resources inline;
     a row is written to `vulnerability_flag` with severity=3 (acute);
     the inbox item status is set to 'escalated'.

  3. RETURNING CUSTOMER: seed 3–4 prior `support_interactions` rows for
     one test user (exact SQL will be supplied by the AI, copy-paste
     ready), then send a clean follow-up message. Expected: the drafter
     prompt contains a HISTORY CONTEXT block with `trend: frequent`,
     `category frequency (30d): billing (N)`, and the relevant open
     issue line.

For each case, tell the founder: the exact test input, the URL or
command to submit it, the Supabase SQL to inspect the result, and the
verbatim markers to look for.

**Step F — Promote status vocabulary.**
If all three canonical cases pass end-to-end:
  Channel 1: Wired → **Verified**
  Channel 2: Wired → **Verified**
If any case fails:
  Stop. Do not claim Verified. Diagnose root cause. Respect PR2 —
  partial wiring is a build-to-wire gap.

**Step G — Close the session.**
Produce:
  - `operations/handoffs/support-wiring-mount-close.md` in the same
    format as `support-wiring-fix-close.md`.
  - Decision log entries for the mounting decision and the Verified
    promotion (PR7).
  - Knowledge-gap promotion notes if any concept hit its third
    observation during the session (PR5). KG2 (Haiku reliability under
    load) is a candidate if anything fails under real invocation.

---

## Flagged items from the previous session (PR7 deferred decisions)

These were observed during the wiring-fix session and explicitly not
touched under PR6 (no classifier surface change). If they surface during
this session's live tests, they MUST be handled under 0c-ii before
proceeding. If they do not surface, leave them alone — they carry
forward.

1. **classifier_down marker insert path column mismatch.**
   `website/src/lib/r20a-classifier.ts` inserts into `vulnerability_flag`
   using `flag_type` / `metadata` columns that do not exist on that table
   (see `supabase/migrations/20260416_r20a_vulnerability_flag.sql`). The
   real columns are `severity`, `triggered_rules`, `reviewer_notes`.
   If Haiku times out during a live test and the fail-open path fires, the
   insert will throw. Mitigation: revisit with a migration or an insert
   rewrite. Classification if it surfaces: **Critical** (schema-layer
   change touching a safety-critical write path).

2. **`vulnerability_flag.session_id NOT NULL` constraint.**
   Support-originated flags may not carry a session_id in the same sense
   the mentor does. This session's mount path only READS vulnerability_flag
   (90-day baseline), so the constraint does not fire. If this session
   ends up adding a Support-side WRITE path for vulnerability_flag, the
   constraint must be relaxed via migration first. Classification: **Critical**.

---

## Working agreements

- Founder has zero coding experience. Use plain language. Exact paths,
  exact commands, exact copy-paste text. "Push from GitHub Desktop and
  wait for Vercel Green" — not "deploy" or "build".
- Founder decides scope. If mounting reveals a bigger structural problem
  (e.g. the run-loop does not exist), say so once clearly, then wait.
- Classify every code change under 0d-ii before execution. State the
  risk level, name rollback, get approval before deploy.
- Deferred decisions go in the decision log with reasoning (PR7). Do
  not drop them silently.
- Manual verification method per work type (0c) — founder verifies by
  submitting the three canonical test inputs and reading the resulting
  Supabase rows and outbound drafts, not by reading TypeScript.
- Synthetic test inputs only. Never route a real user message as a test,
  especially for the acute-distress case. Tag the test messages with a
  recognisable synthetic marker.
- If founder signals "I'm done for now" or similar, stabilise to
  known-good state and close. Do not propose additional fixes.

---

## Scope (bounded)

**In scope:**
- Mounting `processInboxItemWithGuard` on the existing Support run-loop
  caller.
- Injecting `supabaseAdmin` as `deps.supabase` and `detectDistressTwoStage`
  as `deps.classify`.
- Handling `ProcessInboxItemResult.shouldEscalate` / `crisisRedirectDraft`
  on the caller side (crisis short-circuit).
- Live testing three canonical cases on a Vercel deploy.
- Promoting Channel 1 and Channel 2 to Verified if tests pass.
- Close handoff, decision log, knowledge-gap promotions.
- Handling the two flagged items above IF AND ONLY IF they surface
  during live tests.

**Out of scope — do not expand:**
- Any change to `sage-mentor/support-distress-preprocessor.ts`,
  `sage-mentor/support-history-synthesis.ts`, `processInboxItem`, or
  `processInboxItemWithGuard`. These were Verified at the unit level
  in the previous session. If a change is needed mid-session, stop
  and apply PR6 + 0c-ii before touching.
- Any change to `detectDistressTwoStage`, Zone 2 classification,
  Zone 3 redirection, or their wrappers (PR6 — always Critical).
- Publishing a shared `@sage/safety` package (PR7 — deferred; revisit
  condition is a second cross-module safety function, not this session).
- Extending the pattern to other agents (orchestrator, operator,
  whichever else) in the same session. PR1 — one rollout per session.
- Any change to the baseline-assessment, score, scenarios, or mentor
  surfaces.
- Any auth / session / cookie / deploy-config change (AC7 / PR1
  standing-Critical surface). If one appears, stop and apply 0c-ii.

If you notice something else that should change, flag it with "I'd push
back on this" or "this is a limitation" — do not silently expand the work.

---

## Risk classification — apply 0d-ii at session open

- Mounting `processInboxItemWithGuard` on the Support run-loop: **Critical**
  (PR6 inheritance — the gate goes live on real inbox items).
- Injecting `detectDistressTwoStage` at the caller: **Critical**
  (safety-critical invocation from a new surface).
- Injecting `supabaseAdmin`: **Elevated** (new read site).
- Live testing with synthetic inputs: **Standard** (read-only observation
  of the deployed system) — but announce before doing it.
- Close handoff, decision log, index.ts hygiene: **Standard**.
- Migration or insert rewrite for the classifier_down column mismatch
  (if it surfaces): **Critical**.
- Migration to relax `vulnerability_flag.session_id NOT NULL` (if it
  surfaces): **Critical**.

Classification is set by the AI before execution. Founder can reclassify
upward at any time per 0d-ii. Safety-critical surfaces are the reason
the mount is Critical — not the code shape.

---

## Success for this session

- Support run-loop caller located and named in the conversation.
- Critical Change Protocol acknowledged with the four named failure modes,
  founder gives explicit approval naming the specific risks.
- Caller updated to use `processInboxItemWithGuard` with real deps.
- Push completes and Vercel reports green.
- Three canonical live tests run end-to-end on the deploy. Each is
  recorded with the exact SQL used and the exact Supabase row shown.
- Channel 1 and Channel 2 promoted Wired → Verified in the close handoff
  and decision log.
- `support-wiring-mount-close.md` is written in the same format as
  `support-wiring-fix-close.md`.

If the mount cannot be completed cleanly in one session, say so clearly,
stabilise to known-good, and close. Do not iterate under time pressure.

If the session ends early with capacity remaining, ask the founder
whether to continue or close. Do not prescribe additional work.
```

---

## Notes for the human reading this file

- This prompt assumes `support-wiring-fix-close.md` is in place and
  unchanged since 20 April 2026. If the close handoff has been edited,
  read the current version, not the memory of the previous session.
- The highest-risk moment is the mount itself — once deployed, the gate
  runs on every Support inbox item. A mis-wired gate silently skips the
  distress check. The harness from the previous session is already there;
  the Critical Change Protocol plus the three live tests are the runtime
  backstop.
- No auth, cookie, or deploy-config change is in scope. If one appears,
  stop and apply 0c-ii Critical Change Protocol before proceeding.
- The two flagged items (classifier_down column mismatch,
  vulnerability_flag.session_id constraint) were observed last session
  and deferred under PR6. If they surface during live testing, treat as
  Critical and handle before continuing. If they do not surface, carry
  forward.
- The unit-level harness (`scripts/support-wiring-verification.mjs`) is
  orthogonal to this session but remains the fastest regression check
  if anything in the two new modules needs to change mid-session.
