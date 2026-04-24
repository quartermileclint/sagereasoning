# Support Wiring Fix — New Session Prompt

**Paste everything between the two fences below into a fresh Claude session.**
Keep this file as the canonical record of what the next session was asked to do.

---

```
You are picking up the SageReasoning build. Follow the project instructions and the manifest.

**First action, before anything else:**
Read `operations/handoffs/support-wiring-fix-handoff.md` end to end. That handoff
contains the findings, the Scoped + Designed status of both channels, the full
Critical Change Protocol for Channel 1, the Elevated classification for
Channel 2, and the four choice points the founder will pick from at session open.
Do not skip it.

Then scan `operations/knowledge-gaps.md` for any concept relevant to:
  (a) Supabase reads against support_interactions and vulnerability_flag,
  (b) the SafetyGate branded-type pattern from website/src/lib/constraints.ts,
  (c) KG10 (JSONB storage format) if ring_evaluation JSONB is read during synthesis.
Read any relevant entries before wiring.

---

## Primary task for this session

Complete the Support agent channel wiring fix scoped in the handoff file.

Two channels are broken and need wiring:

1. **Channel 1 — Distress Pre-Processing (R20a, Critical under PR6 + 0c-ii).**
   Port the proven mentor pattern (detectDistressTwoStage + enforceDistressCheck
   + SafetyGate) to Support. Pre-process every inbox item synchronously before
   drafting. If moderate/acute distress is detected, Support does not draft —
   it escalates with crisis resources. Also surface a 90-day prior-flag
   baseline so R20's "sudden drastic change" indicator can fire.

2. **Channel 2 — Support Interaction History / Synthesis (Elevated).**
   Read support_interactions for the customer over a 30-day rolling window,
   compute category frequency, open issues, trend, and prior distress flags.
   Inject as a history_context block into buildDraftPrompt.

Full design, types, file layout, and signature changes are in the handoff file.
Do not redesign — the handoff is already Designed status.

---

## Step-by-step

**Step A — Read the handoff in full.** Pay attention to:
- The four choice points in "Choice points for the next session".
- The three failure modes in the Critical Change Protocol.
- The PR6 + 0c-ii discipline for Channel 1.
- The "Files that will be touched" list — do not expand beyond it.

**Step B — Ask founder which choice point to adopt.** Present all four
with reasoning, not a prescription. Wait for explicit answer before any code.
The default recommendation is option 1 ("proceed as designed") because Support
is not live and a dark-flag adds complexity with low marginal safety.

**Step C — Announce classification under 0d-ii.**
- Channel 1 wiring: Critical (PR6 — distress-classifier touch).
- Channel 2 wiring: Elevated (new read path, non-safety-critical).
- Signature change on processInboxItem: Critical by inheritance.

Wait for founder "proceed" before scaffolding.

**Step D — Scaffold → Wire → Verify in the same session.** Respect PR2
(no build-to-wire gap). Order:

  1. Scaffold `sage-mentor/support-distress-preprocessor.ts` (types first,
     then function skeleton, then implementation referencing the mentor
     pattern in website/src/lib/constraints.ts and website/src/lib/r20a-classifier.ts).
  2. Scaffold `sage-mentor/support-history-synthesis.ts` the same way.
  3. Update `sage-mentor/support-agent.ts` — new imports, new processInboxItem
     signature (async, accepts deps), new SupportSafetyGate parameter, new
     return fields, new buildDraftPrompt inputs.
  4. Update `sage-mentor/index.ts` exports.
  5. Write `scripts/support-wiring-verification.mjs` — founder-runnable
     harness with three test messages (clean, acute distress, returning
     customer). Print the resolved SupportDistressSignal and
     SupportInteractionHistory shapes.
  6. Grep for every processInboxItem call site in the repo. Confirm each
     one constructs a SafetyGate. If any call site cannot be updated in
     this session, flag it and stop.

**Step E — Founder verifies.** Provide:
  (a) The exact command to run the .mjs harness locally.
  (b) The expected output for each of the three test messages (verbatim
      or near-verbatim — founder is non-technical and will not infer it).
  (c) What to check if the output does not match.

**Step F — Close the session.** Produce:
  - `operations/handoffs/support-wiring-fix-close.md` — handoff for the next
    session in the same format as session-13-close.
  - Decision log entries for the two choice-point decisions (PR7).
  - Knowledge-gap promotion notes if any concept hit its third observation
    during the session (PR5).
  - Status vocabulary update: Channel 1 and Channel 2 move from Designed
    to Wired (not Verified — Verified requires the harness to pass; record
    whichever outcome is true).

---

## Working agreements

- Founder has zero coding experience. Use plain language. Exact paths, exact
  commands, exact copy-paste text. "Vercel Green" is the type-check — say
  "push and wait for Vercel Green", not "type-check on your side".
- Founder decides scope. If wiring reveals a bigger structural problem
  mid-session, say so once clearly, then wait.
- Classify every code change under 0d-ii before execution. State the risk
  level, name rollback, get approval before deploy.
- Deferred decisions go in the decision log with reasoning (PR7). Do not
  drop them silently.
- Manual verification method per work type (0c) — founder verifies by
  running the .mjs harness and reading its printed output, not by reading
  TypeScript.
- Give the exact wording of test inputs the founder will feed into the
  harness. Do not say "try a few test messages" — give verbatim strings.
- If founder signals "I'm done for now" or similar, stabilise to known-good
  state and close. Do not propose additional fixes.

---

## Scope (bounded)

**In scope:**
- The two channels exactly as designed in the handoff.
- Files listed in "Files that will be touched" in the handoff.
- Decision log and handoff close at session end.
- Knowledge-gap promotions (PR5) if any concept hits its third observation.

**Out of scope — do not expand:**
- Activating the Support run loop.
- Any change to detectDistressTwoStage, Zone 2 classification, Zone 3
  redirection, or their wrappers (PR6 — always Critical, apply 0c-ii if
  one appears).
- Any website/src/* file changes.
- Any Supabase migration.
- Any API route change.
- Any auth / session / cookie / deploy-config change (AC7 / PR1
  standing-Critical surface).
- Extending the pattern to other agents (orchestrator, operator, whichever
  else) in the same session. PR1 — one rollout per session.

If you notice something else that should change, flag it with "I'd push back
on this" or "this is a limitation" — do not silently expand the work.

---

## Risk classification — apply 0d-ii at session open

- Channel 1 wiring: **Critical** (PR6 by inheritance — distress-classifier touch).
- Channel 2 wiring: **Elevated** (new read path, non-safety-critical).
- processInboxItem signature change: **Critical** (Channel 1 inheritance).
- .mjs verification harness: **Standard** (read-only, test-harness only).
- index.ts export updates: **Standard** (type re-exports only).

Classification is set by the AI before execution. Founder can reclassify
upward at any time per 0d-ii. Safety-critical surfaces are the reason
Channel 1 is Critical — not the deployability of the code.

---

## Success for this session

- Choice points 1–4 from the handoff are resolved explicitly at session open.
- Critical Change Protocol is acknowledged and the founder gives explicit
  approval naming the specific risks.
- Both channels scaffolded, wired, and verified in-session (PR2).
- Verification harness runs and founder confirms expected output.
- support-wiring-fix-close.md is written in the same format as session-13-close.
- Decision log updated for the two choice-point decisions.
- Status vocabulary updated: Channel 1 and Channel 2 move to Wired (and
  Verified if the harness passes).

If the wiring cannot be completed cleanly in one session, say so clearly,
stabilise to known-good, and close. Do not iterate under time pressure.

If the session ends early with capacity remaining, ask the founder whether
to continue or close. Do not prescribe additional work.
```

---

## Notes for the human reading this file

- This prompt assumes the handoff file `support-wiring-fix-handoff.md` is in
  place and unchanged. If the handoff has been edited since it was written
  (20 April 2026), read the current version, not the memory of the previous
  session.
- The highest-risk moment in the next session is the signature change to
  processInboxItem. Every call site must be updated in the same session —
  partial wiring leaves the distress check bypassable.
- The verification harness is the founder's independent check. If the harness
  is not written or not runnable, the wiring is not Verified, regardless of
  what the AI claims about correctness.
- No auth, cookie, or deploy-config change is in scope. If one appears,
  the next session should stop and apply 0c-ii Critical Change Protocol
  before proceeding.
