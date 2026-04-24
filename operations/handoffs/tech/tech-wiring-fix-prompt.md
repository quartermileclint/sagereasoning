# Tech Wiring Fix — New Session Prompt

**Paste everything between the two fences below into a fresh Claude session.**
Keep this file as the canonical record of what the next session was asked to do.

---

```
You are picking up the SageReasoning build. Follow the project instructions and the manifest.

**First action, before anything else:**
Read `operations/handoffs/tech-wiring-fix-handoff.md` end to end. That handoff
contains the findings, the Scoped + Designed status of both channels, the
Elevated classification for both, the four choice points the founder will
pick from at session open, the file layout, and the verification plan.
Do not skip it.

Then scan `operations/knowledge-gaps.md` for any concept relevant to:
  (a) File-based context loaders (new pattern — first instance here),
  (b) Chat-persona system-prompt composition order in /api/founder/hub,
  (c) TECHNICAL_STATE.md maintenance contract (no entry yet — likely first
      observation).
Read any relevant entries before wiring.

---

## Primary task for this session

Complete the Tech agent channel wiring fix scoped in the handoff file.

Two channels are broken and need wiring:

1. **Channel 1 — Live System State / Known Issues (Elevated).**
   Create `operations/tech-known-issues.md` as the single source of truth
   for current and recently-resolved system issues. Build a loader at
   `website/src/lib/context/tech-system-state.ts` that reads the file at
   request time and returns a structured block. Inject into the Tech
   persona prompt in `/api/founder/hub/route.ts` `case 'tech'`.

2. **Channel 2 — Endpoint Inventory Map (Elevated).**
   Build a loader at `website/src/lib/context/tech-endpoint-inventory.ts`
   that parses the existing `/TECHNICAL_STATE.md` at repo root into a
   structured inventory (family, route, auth, depth, model, context
   layers, status). Inject into the Tech persona prompt. Add a drift
   check in the verification harness that compares the inventory against
   a grep of the actual route files.

Full design, types, file layout, injection order, and failure-mode
handling are in the handoff file. Do not redesign — the handoff is
already Designed status.

---

## Step-by-step

**Step A — Read the handoff in full.** Pay attention to:
- The four choice points in "Choice points for the next session".
- The 9-vs-10 endpoint-count drift noted in §11 "Today's verified facts".
  This is real drift — expect the harness to report it on first run.
- The "Files that will be touched" list — do not expand beyond it.
- The out-of-scope guardrails in §8.

**Step B — Ask founder which choice point options to adopt.** Present all
four with reasoning, not a prescription. Wait for explicit answer before
any code. Default recommendations are Option A on each:
  1. Known-issues file: start empty with a dated header.
  2. TECHNICAL_STATE.md reconciliation: wire first, reconcile later.
  3. Analytics-events error signal: defer.
  4. Pattern extension to other personas: no — single-endpoint proof (PR1).

**Step C — Announce classification under 0d-ii.**
- Channel 1 wiring: Elevated.
- Channel 2 wiring: Elevated.
- Injection into `case 'tech'` branch: Elevated.
- Verification harness: Standard.
- Known-issues stub file: Standard.

No Critical sub-items. No distress-classifier touch. No auth surface.
Wait for founder "proceed" before scaffolding.

**Step D — Scaffold → Wire → Verify in the same session.** Respect PR2
(no build-to-wire gap). Order:

  1. Scaffold `operations/tech-known-issues.md` — a short stub with the
     dated header, "No known issues at [date]", and the empty two
     sections described in the handoff §3.1.
  2. Scaffold `website/src/lib/context/tech-system-state.ts` — types
     first, then parser, then exported `getTechSystemState()`. Must
     handle the missing-file case with a stub and a self-disclosing
     message (per handoff §3.1).
  3. Scaffold `website/src/lib/context/tech-endpoint-inventory.ts` —
     types first, then parser for /TECHNICAL_STATE.md §2 and §3, then
     exported `getEndpointInventory()`.
  4. Update `website/src/app/api/founder/hub/route.ts` — new imports at
     top; in the `case 'tech'` branch, call both loaders and inject
     their `formatted_context` as new system message blocks in the
     order specified in handoff §3.1 (persona prompt → technical
     upgrades → system state → endpoint inventory → tech brain).
     Do not touch other branches. PR1.
  5. Write `scripts/tech-wiring-verification.mjs` — founder-runnable
     harness with three checks: Channel 1 parse, Channel 2 parse,
     drift detection (grep actual route files vs inventory, print
     GREEN or DRIFT with set diff).
  6. Grep `/api/founder/hub/route.ts` and anywhere else that imports
     from `website/src/lib/context/` to confirm no other call site
     needs updating. The new loaders should only be called from the
     `case 'tech'` branch.

**Step E — Founder verifies.** Provide:
  (a) Exact command to push to Vercel and confirm Vercel Green.
  (b) Exact command to run the .mjs harness locally:
      `node scripts/tech-wiring-verification.mjs`
  (c) Expected output for each of the three harness checks — verbatim
      for the structural parts, approximate for the list contents.
      Founder is non-technical and will not infer it.
  (d) A live probe: the exact message to paste into /private-mentor
      with the Tech persona selected. Expected reply shape.
  (e) What to check if output does not match — specifically, that the
      first run is expected to show DRIFT on Channel 2 because
      TECHNICAL_STATE.md §2 is already out of sync with the codebase
      (9 listed, 10 actual). Drift reported = harness working
      correctly. Drift absent = harness broken.

**Step F — Close the session.** Produce:
  - `operations/handoffs/tech-wiring-fix-close.md` — handoff for the
    next session in the same format as session-13-close.
  - Decision log entries for the four choice-point decisions
    (D-Tech-1 through D-Tech-4, per handoff §9).
  - Knowledge-gap promotion notes if any concept hit its third
    observation during the session (PR5).
  - Status vocabulary update: Channel 1 and Channel 2 move from
    Designed to Wired (not Verified — Verified requires the harness
    to pass and the live probe to return the structured reply;
    record whichever outcome is true).
  - Flag the TECHNICAL_STATE.md reconciliation as the next queued
    task in the close handoff's Next Session Should menu.

---

## Working agreements

- Founder has zero coding experience. Use plain language. Exact paths,
  exact commands, exact copy-paste text. "Vercel Green" is the type-check
  — say "push and wait for Vercel Green", not "type-check on your side".
- Founder decides scope. If wiring reveals a bigger structural problem
  mid-session, say so once clearly, then wait.
- Classify every code change under 0d-ii before execution. State the
  risk level, name rollback, get approval before deploy.
- Deferred decisions go in the decision log with reasoning (PR7). Do not
  drop them silently.
- Manual verification method per work type (0c) — founder verifies by
  running the .mjs harness and reading its printed output, plus the
  live probe against Tech persona, not by reading TypeScript.
- Give the exact wording of the live-probe message the founder will
  paste into the chat. Do not say "ask it something about endpoints" —
  give verbatim text.
- If founder signals "I'm done for now" or similar, stabilise to
  known-good state and close. Do not propose additional fixes.

---

## Scope (bounded)

**In scope:**
- The two channels exactly as designed in the handoff.
- Files listed in "Files that will be touched" in the handoff.
- Decision log and handoff close at session end.
- Knowledge-gap promotions (PR5) if any concept hits its third
  observation.
- TECHNICAL_STATE.md as a read-only source — **not** edited inside this
  session (Choice 2, default Option A).

**Out of scope — do not expand:**
- Reconciling TECHNICAL_STATE.md §2 against the actual codebase. Drift
  is expected on first harness run. Reconciliation is the next
  session's task.
- Extending the pattern to ops / growth / support chat personas. PR1 —
  one persona per session.
- Any change to `tech-brain-loader.ts` or `tech-brain-compiled.ts`.
- Any `sage-mentor/` file change.
- Any new Supabase table, migration, or RLS change.
- Any `analytics_events` query in Channel 1 (Choice 3, default Option A).
- Any change to `runSageReason` or `sage-reason-engine.ts`.
- Any auth / session / cookie / deploy-config change (AC7 / PR1
  standing-Critical surface — if one appears, stop and apply 0c-ii).
- Any change to the distress classifier, Zone 2 classification, Zone 3
  redirection, or their wrappers (PR6 — always Critical).

If you notice something else that should change, flag it with "I'd push
back on this" or "this is a limitation" — do not silently expand the
work.

---

## Risk classification — apply 0d-ii at session open

- Channel 1 wiring: **Elevated** (new read path, new file dependency).
- Channel 2 wiring: **Elevated** (new read path, file-parse dependency
  on /TECHNICAL_STATE.md).
- Injection into `case 'tech'` branch: **Elevated** (changes live chat
  persona system prompt composition).
- Verification harness (.mjs): **Standard** (read-only, harness only).
- Known-issues stub file: **Standard** (new content file, no code
  path).

Classification is set by the AI before execution. Founder can
reclassify upward at any time per 0d-ii. No Critical sub-items
— Tech persona is not a safety-critical surface. No auth change. No
distress-classifier touch.

---

## Success for this session

- Choice points 1–4 from the handoff are resolved explicitly at
  session open.
- Risk classification is acknowledged and the founder gives explicit
  "proceed" before scaffolding.
- Both channels scaffolded, wired, and verified in-session (PR2).
- Verification harness runs and founder confirms expected output —
  including the expected DRIFT report on Channel 2's first run.
- Live probe against Tech persona returns a structured reply that
  demonstrably uses the injected blocks.
- tech-wiring-fix-close.md is written in the same format as
  session-13-close.
- Decision log updated for the four choice-point decisions.
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

- This prompt assumes the handoff file `tech-wiring-fix-handoff.md` is
  in place and unchanged. If the handoff has been edited since it was
  written (20 April 2026), read the current version, not the memory
  of the previous session.
- The highest-risk moment in the next session is the change to the
  `case 'tech'` branch of `/api/founder/hub/route.ts`. The change is
  Elevated, not Critical, but it is live — it affects the Tech chat
  persona as soon as it deploys. Founder verifies by live probe before
  calling it Verified.
- The first run of the verification harness is expected to show DRIFT
  on Channel 2 (TECHNICAL_STATE.md §2 lists 9 endpoints; the codebase
  has 10). That is not a bug — it is the channel working as designed.
  Reconciling TECHNICAL_STATE.md is the next session's task, not this
  one's.
- No auth, cookie, or deploy-config change is in scope. If one appears,
  the next session should stop and apply 0c-ii Critical Change
  Protocol before proceeding.
- No safety-critical surface is in scope. If one appears (distress
  classifier, Zone 2/3, SafetyGate), PR6 applies and the change
  becomes Critical.
