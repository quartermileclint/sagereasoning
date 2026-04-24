# Ops Wiring Fix — New Session Prompt

**Paste everything between the two fences below into a fresh Claude session.**
Keep this file as the canonical record of what the next session was asked to do.

---

```
You are picking up the SageReasoning build. Follow the project instructions and the manifest.

**First action, before anything else:**
Read `operations/handoffs/ops-wiring-fix-handoff.md` end to end. That
handoff contains the findings, the **likely** Scoped + Designed status of
both channels (pending diagnostic confirmation), the Elevated classification,
the five choice points, the mandatory diagnostic step, the file layout, and
the verification plan. Do not skip it.

Then scan `operations/knowledge-gaps.md` for any concept relevant to:
  (a) File-based context loaders for chat-persona agents (fourth observation
      if already promoted at Growth close — otherwise third; see PR5 / PR8),
  (b) Supabase-read-path loaders for chat-persona agents (first observation —
      Ops Channel 1 is the first instance),
  (c) Multi-source synthesis loaders (first observation — Ops Channel 2),
  (d) Chat-persona system-prompt composition order in /api/founder/hub.
Read any relevant entries before wiring.

---

## Primary task for this session

Complete the Ops agent channel wiring fix — **but only after confirming
the diagnostic**. This session differs from Support / Tech / Growth in
that the founder has explicitly asked you to first confirm or correct
the channel-gap diagnosis before executing the design.

Two likely channels are broken:

1. **Channel 1 — Live Cost / Spend Feed (Elevated).**
   Build a loader at `website/src/lib/context/ops-cost-state.ts` that
   reads `cost_health_snapshots` (latest) and `classifier_cost_log`
   (30-day aggregate), computes the four documented threshold statuses
   (revenue-to-cost ratio, ops pipeline vs $100/month cap, single-
   endpoint concentration, runway), and returns a structured block.
   Inject into the Ops persona prompt in `/api/founder/hub/route.ts`
   `case 'ops'`.

2. **Channel 2 — Operational Continuity / Session State Synthesis
   (Elevated).**
   Build a loader at `website/src/lib/context/ops-continuity-state.ts`
   that reads five sources (recent close handoffs, decision log,
   knowledge gaps, compliance register, D-register) and synthesises
   active workstreams, open blockers, pending decisions, compliance
   posture, and in-flight knowledge gaps. Inject into the Ops persona
   prompt.

Full design, types, failure modes, threshold definitions, and
injection order are in the handoff file. Do not redesign — the handoff
is already Designed status, contingent on diagnostic confirmation.

---

## Step-by-step

**Step A — Read the handoff in full.** Pay attention to:
- §3 "Diagnostic step — REQUIRED before any code".
- The five choice points in §5.
- The failure-mode coverage for both loaders (§4.1, §4.2).
- The 9-upgrades persona prompt composition order (§4.2 Injection point).
- The "Files that will be touched" list — do not expand beyond it.
- The out-of-scope guardrails in §8, specifically: no schema change,
  no write-path change, no legacy-handoff-directory reconciliation.

**Step B — Run the diagnostic.** Before any code, any choice-point
discussion, and any scaffolding:

  1. Open `/private-mentor`, pick the Ops persona, and ask verbatim:
     `What is your foundation info based on, which input channels do
     you actively draw from, and what triggers when you receive them?`
  2. Record Ops's reply in full.
  3. Compare against the handoff §2. Name the outcome:
     - **Confirmed:** Ops's reply aligns with the diagnosis. Proceed.
     - **Partially confirmed:** Ops identifies one channel but not the
       other, or names a different gap. Re-scope: take the confirmed
       channel forward, log divergence in the decision log, defer the
       other.
     - **Corrected:** Ops's reply contradicts the diagnosis. Stop. Do
       not execute this design. Write a revised handoff based on
       Ops's self-report.
  4. Log the outcome as D-Ops-0 in the decision log with Ops's reply
     cited.

**Step C — Ask founder which choice point options to adopt.** Present
choices 2–5 with reasoning, not a prescription (Choice 1 "diagnostic
first" is effectively decided by Step B). Wait for explicit answer
before any code. Default recommendations are Option A on each:
  2. Channel 1 data sources: wire cost_health_snapshots + classifier
     30-day aggregate. Defer per-endpoint concentration (returns
     'unknown' with reason).
  3. Channel 2 source filtering: all five sources.
  4. Snapshot freshness policy: warning after 7 days, do not block.
  5. Mentor persona extension: no — different architecture, out of
     scope.

**Step D — Announce classification under 0d-ii.**
- Diagnostic step: Standard (read-only chat probe).
- Channel 1 wiring: Elevated (Supabase read in live request path).
- Channel 2 wiring: Elevated (five-file parse surface).
- Injection into `case 'ops'` branch: Elevated.
- Verification harness: Standard.

No Critical sub-items. No distress-classifier touch. No auth surface.
No schema change. Wait for founder "proceed" before scaffolding.

**Step E — Scaffold → Wire → Verify in the same session.** Respect
PR2 (no build-to-wire gap). Order:

  1. Scaffold `website/src/lib/context/ops-cost-state.ts` — types
     first, then the threshold helpers (ratio, cap, concentration,
     runway), then `getOpsCostState()`. Must use service-role
     Supabase client. Must handle read-error and stale-snapshot
     cases with self-disclosing stubs (per handoff §4.1).
  2. Scaffold `website/src/lib/context/ops-continuity-state.ts` —
     types first, then five source-parsers (handoff close parser,
     decision-log parser, KG register parser, compliance register
     parser, D-register parser), then `getOpsContinuityState()`.
     Must handle each source independently (one failing source
     does not break the loader) and enforce the truncation order
     in handoff §4.2.
  3. Update `website/src/app/api/founder/hub/route.ts` — new imports
     at top; in the `case 'ops'` branch, `await` both loaders and
     inject their `formatted_context` as new system-block strings
     in the order specified in handoff §4.2 (persona prompt → 9 ops
     upgrades → cost state → continuity state → ops brain). Do
     not touch other branches. PR1.
  4. Write `scripts/ops-wiring-verification.mjs` — founder-runnable
     harness with three checks: Channel 1 parse (prints threshold
     statuses + snapshot age + classifier 30-day aggregate),
     Channel 2 parse (prints counts + one sample per field),
     integration check (total chars + estimated token count for
     the composed system prompt).
  5. Grep `/api/founder/hub/route.ts` and anywhere else that imports
     from `website/src/lib/context/` to confirm no other call site
     needs updating. The new loaders should only be called from the
     `case 'ops'` branch.

**Step F — Founder verifies.** Provide:
  (a) Exact command to push to Vercel and confirm Vercel Green.
  (b) Exact command to run the .mjs harness locally:
      `node scripts/ops-wiring-verification.mjs`
  (c) Expected output for each of the three harness checks — verbatim
      for the structural parts, approximate for numeric values (the
      harness reports live Supabase data). Call out any threshold
      status that may show 'unknown' if Choice 2 Option A was taken.
  (d) A live probe: exact message to paste into /private-mentor with
      the Ops persona selected:
      `What is our current cost posture against the four thresholds,
      and what are the top three active workstreams right now?`
      Expected reply shape: numeric values (or 'unknown' with reason)
      for each of the four thresholds; three specific workstreams
      named from the continuity block.
  (e) What to check if output does not match — specifically, Ops must
      cite the **live values** for at least the thresholds where data
      is available, and must name **specific** workstreams from the
      synthesised block. Generic threshold language or generic
      workstream names = wiring not Verified. Revert.

**Step G — Close the session.** Produce:
  - `operations/handoffs/ops-wiring-fix-close.md` — handoff for the
    next session in the same format as session-13-close.
  - Decision log entries for the six decisions
    (D-Ops-0 through D-Ops-5, per handoff §9). D-Ops-0 is the
    diagnostic outcome with Ops's reply cited.
  - Knowledge-gap promotion notes (PR5 / PR8). This session
    produces:
      - Fourth (or third) observation of the file-based context
        loader pattern. If not already promoted at Growth close,
        promote now with the four recurrence sessions cited
        (Tech C1, Tech C2, Growth, Ops C2).
      - First observation of the Supabase-read-path loader pattern
        (Ops C1). Log without promotion.
      - First observation of the multi-source synthesis loader
        pattern (Ops C2). Log without promotion.
  - Status vocabulary update: Channel 1 and Channel 2 move from
    Designed to Wired (and Verified if harness passes and live
    probe confirms live-data citation).
  - Flag that Ops is the final chat-persona wiring in the series.
    Mentor branch architecture is distinct and is not queued as a
    follow-up unless founder raises it.

---

## Working agreements

- Founder has zero coding experience. Use plain language. Exact paths,
  exact commands, exact copy-paste text. "Vercel Green" is the type-check
  — say "push and wait for Vercel Green", not "type-check on your side".
- Founder decides scope. If the diagnostic reveals a different gap,
  stop and re-scope — do not rationalise the original design.
- Classify every code change under 0d-ii before execution. State the
  risk level, name rollback, get approval before deploy.
- Deferred decisions go in the decision log with reasoning (PR7). Do
  not drop them silently.
- Manual verification method per work type (0c) — founder verifies by
  running the .mjs harness and reading its printed output, plus the
  live probe against Ops persona, not by reading TypeScript.
- Give the exact wording of the diagnostic question and the live-probe
  message — they are in the prompt verbatim. Do not paraphrase.
- If founder signals "I'm done for now" or similar, stabilise to
  known-good state and close. Do not propose additional fixes.
- If the diagnostic outcome is "Corrected" (Ops contradicts the
  diagnosis), do not press on. Write a revised handoff and close.
  That is a clean close, not a failure.

---

## Scope (bounded)

**In scope:**
- The two channels exactly as designed in the handoff, contingent on
  diagnostic confirmation.
- Files listed in "Files that will be touched" in the handoff.
- Decision log and handoff close at session end.
- Knowledge-gap promotions (PR5 / PR8) — see Step G.
- The diagnostic question to Ops, in full, before any code.

**Out of scope — do not expand:**
- Extending the pattern to the mentor persona (different architecture,
  handoff §Choice 5, default Option A).
- Any change to `ops-brain-loader.ts` or `ops-brain-compiled.ts`.
- Any `sage-mentor/` file change.
- Any new Supabase table, migration, or RLS change.
- Any cost_health_snapshots write-path change.
- New instrumentation for per-endpoint LLM-spend attribution (Choice
  2, default Option A — concentration status returns 'unknown').
- Any change to `runSageReason` or `sage-reason-engine.ts`.
- Any auth / session / cookie / deploy-config change (AC7 / PR1
  standing-Critical surface — if one appears, stop and apply 0c-ii).
- Any change to the distress classifier, Zone 2 classification, Zone 3
  redirection, or their wrappers (PR6 — always Critical).
- Reconciliation of `operations/handoffs/` vs
  `operations/session-handoffs/` directory duplication (flagged for a
  later session).

If you notice something else that should change, flag it with "I'd push
back on this" or "this is a limitation" — do not silently expand the
work.

---

## Risk classification — apply 0d-ii at session open

- Diagnostic step: **Standard** (read-only chat probe).
- Channel 1 wiring: **Elevated** (Supabase read in live request
  path, cost data is operationally sensitive).
- Channel 2 wiring: **Elevated** (five-file parse surface requires
  coverage of each failure mode).
- Injection into `case 'ops'` branch: **Elevated** (changes live
  chat persona's system prompt composition).
- Verification harness (.mjs): **Standard** (read-only, harness
  only).

Classification is set by the AI before execution. Founder can
reclassify upward at any time per 0d-ii. No Critical sub-items — Ops
persona is not a safety-critical surface. No auth change. No
distress-classifier touch. No schema change. Elevated is higher than
Growth because Channel 1 reads Supabase in the request path and
Channel 2 parses five sources.

---

## Success for this session

- **Diagnostic confirmed, partially confirmed, or corrected** — with
  Ops's reply cited verbatim in D-Ops-0.
- Choice points 2–5 resolved explicitly at session open (Choice 1 is
  decided by Step B).
- Risk classification acknowledged and founder gives explicit
  "proceed" before scaffolding.
- Both channels (or the subset the diagnostic confirmed) scaffolded,
  wired, and verified in-session (PR2).
- Verification harness runs and founder confirms expected output —
  including any 'unknown' threshold statuses where data is absent.
- Live probe against Ops persona returns a structured reply that
  demonstrably uses the injected blocks (live values for thresholds,
  specific workstreams named from the continuity block).
- ops-wiring-fix-close.md is written in the same format as
  session-13-close.
- Decision log updated for D-Ops-0 through D-Ops-5.
- Knowledge-gap promotion decisions recorded (file-based loader
  pattern promoted at fourth observation if not already; Supabase-
  read-path loader pattern logged as first observation; multi-source
  synthesis loader pattern logged as first observation).
- Status vocabulary updated: Channel 1 and Channel 2 move to Wired
  (and Verified if harness passes and live probe confirms live-data
  citation).

If the wiring cannot be completed cleanly in one session, say so
clearly, stabilise to known-good, and close. Do not iterate under
time pressure.

If the diagnostic returns "Corrected", close cleanly with a revised
handoff. Do not press on with the original design.

If the session ends early with capacity remaining, ask the founder
whether to continue or close. Do not prescribe additional work.
```

---

## Notes for the human reading this file

- This prompt differs from Support / Tech / Growth in one important way:
  the execution session is required to run the diagnostic question to
  Ops **before** any code. The other three agents' own self-reports
  were the ground truth for their channel maps. Ops hasn't been asked
  yet. Skipping this step would violate the principle that produced
  the other three wiring fixes successfully.
- This prompt assumes the handoff file `ops-wiring-fix-handoff.md` is
  in place and unchanged. If the handoff has been edited since it was
  written (20 April 2026), read the current version, not the memory
  of the previous session.
- Ops is the final chat-persona wiring in the series. Support, Tech,
  Growth are already designed in parallel handoff files. Mentor uses
  a different architecture and is not a continuation of this series.
- The highest-risk moment in this session is the Supabase read in
  Channel 1. If the Supabase client fails, the loader must return a
  self-disclosing stub, not throw. Confirm this behaviour in the
  harness before the live probe.
- If Ops's diagnostic reply reveals a third or fourth channel the
  designer didn't anticipate, that is a good outcome — not a
  complication. Log the additional channel in the decision log and
  leave it for a follow-up session. Do not try to design and build it
  in the same session.
- No auth, cookie, or deploy-config change is in scope. If one
  appears, the next session should stop and apply 0c-ii Critical
  Change Protocol before proceeding.
- No safety-critical surface is in scope. If one appears (distress
  classifier, Zone 2/3, SafetyGate), PR6 applies and the change
  becomes Critical.
