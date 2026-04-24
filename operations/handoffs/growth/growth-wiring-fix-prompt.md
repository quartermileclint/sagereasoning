# Growth Wiring Fix — New Session Prompt

**Paste everything between the two fences below into a fresh Claude session.**
Keep this file as the canonical record of what the next session was asked to do.

---

```
You are picking up the SageReasoning build. Follow the project instructions and the manifest.

**First action, before anything else:**
Read `operations/handoffs/growth-wiring-fix-handoff.md` end to end. That
handoff contains the findings, the Scoped + Designed status of both
channels, the Standard classification, the five choice points the founder
will pick from at session open, the file layout, and the verification plan.
Do not skip it.

Then scan `operations/knowledge-gaps.md` for any concept relevant to:
  (a) File-based context loaders (third observation in this session — see
      PR5 / PR8 promotion path in the handoff §10),
  (b) Chat-persona system-prompt composition order in /api/founder/hub,
  (c) Sparse-state disclosure as a loader pattern (first observation — log
      if needed).
Read any relevant entries before wiring.

---

## Primary task for this session

Complete the Growth agent channel wiring fix scoped in the handoff file.

Two channels are broken and need wiring:

1. **Channel 1 — Growth Interaction Signals (Standard).**
   Create `operations/growth-actions-log.md` as the single source of truth
   for growth-domain actions taken. Build a loader at
   `website/src/lib/context/growth-actions-log.ts` that reads the file
   at request time, returns a 90-day rolling window of entries. Inject
   into the Growth persona prompt in `/api/founder/hub/route.ts` `case
   'growth'`.

2. **Channel 2 — Growth Observation Synthesis (Standard).**
   Create `operations/growth-market-signals.md` as the single source of
   truth for market / content / community signals. Build a loader at
   `website/src/lib/context/growth-market-signals.ts` that parses four
   sections, returns a 120-day rolling window, and explicitly discloses
   sparse state to the agent when signals are absent. Inject into the
   Growth persona prompt.

Full design, types, file layout, injection order, and failure-mode
handling are in the handoff file. Do not redesign — the handoff is
already Designed status.

---

## Step-by-step

**Step A — Read the handoff in full.** Pay attention to:
- The five choice points in "Choice points for the next session".
- The sparse-at-P0 expectation for Channel 2 — empty is correct, not
  a bug.
- The "Files that will be touched" list — do not expand beyond it.
- The out-of-scope guardrails in §8, specifically: no back-fill, no
  AI-written market signals, no analytics_events query.

**Step B — Ask founder which choice point options to adopt.** Present
all five with reasoning, not a prescription. Wait for explicit answer
before any code. Default recommendations are Option A on each:
  1. Actions-log starting state: seed one back-dated entry (the wiring
     fix itself).
  2. Market-signals starting state: empty stub, exercise the sparse
     state on first run.
  3. Analytics-events Supabase query: defer.
  4. Pattern extension to Ops persona: no — single-persona proof (PR1).
  5. Rolling-window defaults: 90 days / 120 days as designed.

**Step C — Announce classification under 0d-ii.**
- Channel 1 wiring: Standard.
- Channel 2 wiring: Standard.
- Injection into `case 'growth'` branch: Standard.
- Verification harness: Standard.
- Markdown stub files: Standard.

No Elevated or Critical sub-items. No distress-classifier touch. No
auth surface. No drift-detection dependency. Wait for founder
"proceed" before scaffolding.

**Step D — Scaffold → Wire → Verify in the same session.** Respect
PR2 (no build-to-wire gap). Order:

  1. Scaffold `operations/growth-actions-log.md` — front-matter
     (updated / maintainer) + one seeded entry if Choice 1 Option A
     is taken. Exact wording of the seed entry in the handoff §4.
  2. Scaffold `operations/growth-market-signals.md` — front-matter
     + the four empty sections with "no signal yet (as of [date])"
     placeholders. Exact wording in the handoff §3.2.
  3. Scaffold `website/src/lib/context/growth-actions-log.ts` —
     types first, then parser, then `getGrowthActionsLog()`. Must
     handle missing-file case with self-disclosing stub (per handoff
     §3.1).
  4. Scaffold `website/src/lib/context/growth-market-signals.ts` —
     types first, then parser for the four sections, then
     `getGrowthMarketSignals()`. Must handle sparse state explicitly
     (per handoff §3.2) — `is_sparse: true` produces a block that
     tells Growth "data expected to be absent at P0."
  5. Update `website/src/app/api/founder/hub/route.ts` — new imports
     at top; in the `case 'growth'` branch, `await` both loaders and
     inject their `formatted_context` as new system-block strings
     in the order specified in handoff §3.3 (persona prompt → 7
     growth upgrades → actions log → market signals → growth brain).
     Do not touch other branches. PR1.
  6. Write `scripts/growth-wiring-verification.mjs` — founder-runnable
     harness with two checks: Channel 1 parse (prints action count
     and the formatted block), Channel 2 parse (prints signal count,
     `is_sparse` flag, and the formatted block).
  7. Grep `/api/founder/hub/route.ts` and anywhere else that imports
     from `website/src/lib/context/` to confirm no other call site
     needs updating. The new loaders should only be called from the
     `case 'growth'` branch.

**Step E — Founder verifies.** Provide:
  (a) Exact command to push to Vercel and confirm Vercel Green.
  (b) Exact command to run the .mjs harness locally:
      `node scripts/growth-wiring-verification.mjs`
  (c) Expected output for each of the two harness checks — verbatim
      for the structural parts, approximate for the freeform content.
      Call out that Channel 2's expected output includes
      "is_sparse: true" and the sparse-state message — that is the
      harness working correctly, not a bug.
  (d) A live probe: the exact message to paste into /private-mentor
      with the Growth persona selected. Expected reply shape.
  (e) What to check if output does not match — specifically, Growth
      must reference the seeded entry (Channel 1) and the sparse
      state (Channel 2) in its reply. If Growth answers in generic
      positioning language without citing either, the wiring is
      not Verified.

**Step F — Close the session.** Produce:
  - `operations/handoffs/growth-wiring-fix-close.md` — handoff for
    the next session in the same format as session-13-close.
  - Decision log entries for the five choice-point decisions
    (D-Growth-1 through D-Growth-5, per handoff §9).
  - Knowledge-gap promotion notes (PR5). If this session is the
    third observation of the file-based context loader pattern,
    promote it to a permanent KG entry with the three recurrence
    sessions cited (Tech Channel 1, Tech Channel 2, Growth). First
    observation of the sparse-state disclosure pattern — log without
    promotion unless it recurs in Ops.
  - Status vocabulary update: Channel 1 and Channel 2 move from
    Designed to Wired (not Verified — Verified requires the harness
    to pass and the live probe to return the structured reply;
    record whichever outcome is true).
  - Flag Ops as the last chat-persona to receive the pattern — add
    to the close handoff's Next Session Should menu as the default
    next option.

---

## Working agreements

- Founder has zero coding experience. Use plain language. Exact paths,
  exact commands, exact copy-paste text. "Vercel Green" is the type-check
  — say "push and wait for Vercel Green", not "type-check on your side".
- Founder decides scope. If wiring reveals a bigger structural problem
  mid-session, say so once clearly, then wait.
- Classify every code change under 0d-ii before execution. State the
  risk level, name rollback, get approval before deploy.
- Deferred decisions go in the decision log with reasoning (PR7). Do
  not drop them silently.
- Manual verification method per work type (0c) — founder verifies by
  running the .mjs harness and reading its printed output, plus the
  live probe against Growth persona, not by reading TypeScript.
- Give the exact wording of the live-probe message the founder will
  paste into the chat. Do not say "ask it about positioning" — give
  verbatim text.
- If founder signals "I'm done for now" or similar, stabilise to
  known-good state and close. Do not propose additional fixes.
- No AI-written market signals. If the founder has not observed it,
  it does not go in operations/growth-market-signals.md. The AI may
  propose entries only for actions the session itself produces
  (e.g., "this wiring change shipped today").

---

## Scope (bounded)

**In scope:**
- The two channels exactly as designed in the handoff.
- Files listed in "Files that will be touched" in the handoff.
- Decision log and handoff close at session end.
- Knowledge-gap promotions (PR5 / PR8) — file-based context loader
  pattern is a third-observation candidate for promotion.

**Out of scope — do not expand:**
- Extending the pattern to Ops persona. PR1 — one persona per session.
  Ops is the natural next session.
- Any change to `growth-brain-loader.ts` or `growth-brain-compiled.ts`.
- Any `sage-mentor/` file change.
- Any new Supabase table, migration, or RLS change.
- Any `analytics_events` query in Channel 2 (Choice 3, default Option A).
- Any change to `runSageReason` or `sage-reason-engine.ts`.
- Any auth / session / cookie / deploy-config change (AC7 / PR1
  standing-Critical surface — if one appears, stop and apply 0c-ii).
- Any change to the distress classifier, Zone 2 classification, Zone 3
  redirection, or their wrappers (PR6 — always Critical).
- Retrospective back-fill of the actions log (Choice 1 default is a
  single seed entry, not a historical pass).
- AI-written market signals (see working agreements).

If you notice something else that should change, flag it with "I'd push
back on this" or "this is a limitation" — do not silently expand the
work.

---

## Risk classification — apply 0d-ii at session open

- Channel 1 wiring: **Standard** (additive read path, file-only
  dependency).
- Channel 2 wiring: **Standard** (additive read path, sparse at P0).
- Injection into `case 'growth'` branch: **Standard** (additive system
  blocks, no change to existing prompt or brain).
- Verification harness (.mjs): **Standard** (read-only, harness only).
- Markdown stub files: **Standard** (new content files, no code path).

Classification is set by the AI before execution. Founder can
reclassify upward at any time per 0d-ii. No Elevated or Critical
sub-items — Growth persona is not a safety-critical surface. No auth
change. No distress-classifier touch. Growth is the cleanest of the
three wiring fixes completed so far.

---

## Success for this session

- Choice points 1–5 from the handoff are resolved explicitly at
  session open.
- Risk classification is acknowledged and the founder gives explicit
  "proceed" before scaffolding.
- Both channels scaffolded, wired, and verified in-session (PR2).
- Verification harness runs and founder confirms expected output —
  including the expected sparse-state message on Channel 2.
- Live probe against Growth persona returns a structured reply that
  demonstrably uses the injected blocks (references both the seeded
  action and the sparse market-signals state).
- growth-wiring-fix-close.md is written in the same format as
  session-13-close.
- Decision log updated for the five choice-point decisions.
- Knowledge-gap promotion decision recorded: either promote
  "file-based context loader pattern" to a permanent entry (if this
  session is the third observation), or log as second observation of
  sparse-state disclosure if that pattern is the one that hits
  threshold instead.
- Status vocabulary updated: Channel 1 and Channel 2 move to Wired
  (and Verified if the harness passes and the live probe confirms
  injection).

If the wiring cannot be completed cleanly in one session, say so
clearly, stabilise to known-good, and close. Do not iterate under
time pressure.

If the session ends early with capacity remaining, ask the founder
whether to continue or close. Do not prescribe additional work.
```

---

## Notes for the human reading this file

- This prompt assumes the handoff file `growth-wiring-fix-handoff.md`
  is in place and unchanged. If the handoff has been edited since it
  was written (20 April 2026), read the current version, not the
  memory of the previous session.
- The highest-risk moment in this session is small by design — Growth
  is the cleanest wiring of the three (Support: Critical, Tech:
  Elevated, Growth: Standard). The change is live as soon as it
  deploys, but it is strictly additive to the persona prompt with
  clear rollback.
- Channel 2 is expected to be sparse at P0. The `is_sparse: true` path
  is the first real exercise of sparse-state disclosure as a loader
  pattern. If the founder finds the sparse-state message unhelpful in
  the live probe, that is wording feedback, not a wiring bug — handle
  with a one-line copy change, not a redesign.
- If this is the third time the file-based context loader pattern has
  been used in a session (Tech Channel 1, Tech Channel 2, Growth ×2),
  promote it to a permanent knowledge-gap entry per PR8. Don't defer.
- No auth, cookie, or deploy-config change is in scope. If one
  appears, the next session should stop and apply 0c-ii Critical
  Change Protocol before proceeding.
- No safety-critical surface is in scope. If one appears (distress
  classifier, Zone 2/3, SafetyGate), PR6 applies and the change
  becomes Critical.
- Ops is the last persona awaiting the same wiring pattern. If
  Growth lands cleanly, Ops is the natural next session.
