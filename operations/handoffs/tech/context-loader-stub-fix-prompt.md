# Context Loader Stub-Fallback Fix — New Session Prompt (Tech + Growth Sweep)

**Paste everything between the two fences below into a fresh Claude session.**
Keep this file as the canonical record of what the next session was asked to do.

**Supersedes:** `operations/handoffs/tech-stub-fix-prompt.md` (Tech-only scope, 20 April 2026 morning). That earlier prompt is left in place for audit but is no longer the canonical next-session brief — this one is.

---

```
You are picking up the SageReasoning build. Follow the project instructions and the manifest.

**First action, before anything else:**

Read these three files end to end, in this order:

  1. `operations/handoffs/tech-wiring-fix-close.md` — in particular the
     "Addendum — Post-Close Verification Outcome (20 April 2026, same
     session)" section at the bottom. That addendum diagnoses the
     Vercel `process.cwd()` failure, names the three fix options
     (path-fix, file-move, `outputFileTracingIncludes`), and records
     the D-Tech-5 "stabilise now, fix next session" decision.

  2. `operations/handoffs/growth-wiring-fix-close.md` — including its
     own post-close addendum recording the same failure mode on the
     two Growth loaders. The Growth session closed with the same
     corrected status ("Wired-but-stub-on-Vercel") for both loaders
     and the same expected fix path as Tech.

  3. Decision log entries **D-Tech-5** (2026-04-20) and
     **D-Growth-1 through D-Growth-6** (2026-04-20). D-Tech-5 sets
     the posture (disciplined diagnosis first, fix second).
     D-Growth-6 confirms the Growth session reached the same
     corrected status and defers the fix to this session.

Then scan `operations/knowledge-gaps.md` for entries relevant to:
  (a) Next.js / Vercel serverless runtime path resolution.
  (b) File bundling in serverless deploys (outputFileTracingIncludes).
  (c) Context loader failure modes.
The Growth close handoff recorded KG1 as a "second observation" of the
`process.cwd()`-on-Vercel pattern. If this session's fix reaches a
clean Verified outcome, KG1 gains a third observation and graduates
to a full resolution entry. Plan for that at session close.

---

## Current state — what is on disk and what is broken

From the two previous sessions (20 April 2026):

**Tech persona (morning session):**
- `operations/tech-known-issues.md` — exists at repo root. Empty dated
  stub. **Unchanged. Correct.**
- `TECHNICAL_STATE.md` — exists at repo root. **Unchanged. Correct.**
- `website/src/lib/context/tech-system-state.ts` — Channel 1 loader.
  Uses `path.join(process.cwd(), 'operations', 'tech-known-issues.md')`.
  **Returns stub on Vercel.**
- `website/src/lib/context/tech-endpoint-inventory.ts` — Channel 2
  loader. Uses `path.join(process.cwd(), 'TECHNICAL_STATE.md')`.
  **Returns stub on Vercel.**
- `website/src/app/api/founder/hub/route.ts` `case 'tech':` — calls
  both loaders, injects both into `primaryText`. **Code correct.**
- `scripts/tech-wiring-verification.mjs` — harness. Passes in sandbox
  (CHECK 1+2 GREEN, CHECK 3 reports DRIFT as designed). Does NOT
  catch the Vercel runtime divergence.

**Growth persona (afternoon session):**
- `operations/growth-actions-log.md` — exists at repo root. Contains
  one seeded back-dated entry (20 April 2026 positioning decision
  referencing the Growth wiring handoff). **Unchanged. Correct.**
- `operations/growth-market-signals.md` — exists at repo root. Four
  sections, all with dated "no signal yet" placeholders. **Unchanged.
  Correct.**
- `website/src/lib/context/growth-actions-log.ts` — Channel 1 loader.
  Uses `path.join(process.cwd(), 'operations', 'growth-actions-log.md')`.
  **Returns stub on Vercel.**
- `website/src/lib/context/growth-market-signals.ts` — Channel 2
  loader. Uses
  `path.join(process.cwd(), 'operations', 'growth-market-signals.md')`.
  **Returns stub on Vercel.**
- `website/src/app/api/founder/hub/route.ts` `case 'growth':` — calls
  both loaders, injects both into `primaryText`. **Code correct.**
- `scripts/growth-wiring-verification.mjs` — harness. Passes in
  sandbox (CHECK 1+2 GREEN, 16/16 assertions). Does NOT catch the
  Vercel runtime divergence.

**All four loaders use the same `process.cwd()` pattern and all four
have the same expected failure mode on Vercel.** The close handoffs
for both sessions state this explicitly and scope this session as the
single fix pass that sweeps all four.

Current behaviour on `/founder-hub`:
  - Tech persona: discloses honestly that both source files are
    "unavailable in my loaded context".
  - Growth persona: discloses honestly that both source files are
    unavailable. Names both file paths verbatim. Refuses to invent
    market signals or prior actions.

Production is in a known-good failure state for both personas, not a
dangerous one.

---

## Primary task for this session

Fix the Vercel stub-fallback failure on all four file-based context
loaders (Tech Channel 1 + Channel 2, Growth Channel 1 + Channel 2) so
every loader reads its source file on Vercel runtime and the two
personas answer with real data instead of the "unavailable"
disclosure.

This is a seven-sub-step job. Do not skip sub-step 1 (diagnostic
first, fix second). The diagnostic runs once; the fix applies to all
four loaders in one pass; the verification runs on both personas.

---

## Step-by-step

**Step A — Read the two close-handoff addenda, D-Tech-5, and
D-Growth-6 in full.**

Do not re-design the fix approach from scratch. The Tech addendum
already names the three fix options (path-fix, file-move,
`outputFileTracingIncludes`) and the diagnosis path. Your job is to
execute that plan with scope expanded to cover all four loaders.

**Step B — Run the diagnostic first. No fix attempt before
diagnosis.**

Add a temporary diagnostic endpoint (or a one-shot `console.log`
guarded by an env flag) that returns/logs the following on Vercel
runtime:

  - `process.cwd()` — the actual working directory on the serverless
    function.
  - The result of `fs.existsSync()` (or `fs.access`) on each of:
      - `path.join(process.cwd(), 'operations', 'tech-known-issues.md')`
      - `path.join(process.cwd(), 'TECHNICAL_STATE.md')`
      - `path.join(process.cwd(), 'operations', 'growth-actions-log.md')`
      - `path.join(process.cwd(), 'operations', 'growth-market-signals.md')`
      - `path.join(process.cwd(), '..', 'operations', 'tech-known-issues.md')`
      - `path.join(process.cwd(), '..', 'TECHNICAL_STATE.md')`
      - `path.join(process.cwd(), '..', 'operations', 'growth-actions-log.md')`
      - `path.join(process.cwd(), '..', 'operations', 'growth-market-signals.md')`
      - `path.join(process.cwd(), 'operations')` (directory existence)
      - `path.join(process.cwd(), '..', 'operations')` (directory existence)
  - `__dirname` where available (or the ESM equivalent via
    `fileURLToPath(import.meta.url)` + `path.dirname`).
  - A directory listing of `process.cwd()` via
    `fs.readdirSync(process.cwd())` (first 20 entries).
  - If the `..` directory is accessible, a directory listing of
    `path.join(process.cwd(), '..')` (first 20 entries) to confirm
    whether the repo root is reachable.

Suggested home: a new throwaway endpoint at
`website/src/app/api/debug/loader-cwd/route.ts` gated by the
founder's session cookie (same auth gate pattern as other
founder-only endpoints). Do not expose unauthenticated.

Risk classification for the diagnostic endpoint: **Standard** under
0d-ii (new read-only endpoint, gated, temporary, no state change).
State the classification before deploy.

Deploy. Founder hits the endpoint (or reads the Vercel function log).
Read the output. Record verbatim in the session transcript.

**Step C — Choose the fix approach based on the diagnostic.**

The Tech close-handoff addendum lays out three options. Present them
to the founder with reasoning grounded in the Step B output — not a
prescription:

  - **Option A — path-fix.** If `process.cwd()` resolves to
    `.../website` and `path.join(process.cwd(), '..', 'operations',
    ...)` reaches the source files, update all four loaders to use
    parent-traversal paths. Cheapest fix, smallest diff, applies
    uniformly to Tech C1+C2 and Growth C1+C2. Risk: parent traversal
    may not work if the bundler has not tracked those files — an
    ENOENT on the `..` paths in Step B rules this option out.
  - **Option B — file-move.** Copy the four source files into
    `website/` (e.g. `website/operations/tech-known-issues.md`,
    `website/TECHNICAL_STATE.md`,
    `website/operations/growth-actions-log.md`,
    `website/operations/growth-market-signals.md`). Update all four
    loaders to read from the new paths. Introduces a source-of-truth
    question for any file referenced from outside the loaders —
    `TECHNICAL_STATE.md` is referenced by documentation; the two
    Growth files are referenced only by their loaders and their
    maintenance contracts. Resolve by moving (not copying), then
    updating any external reference.
  - **Option C — `outputFileTracingIncludes` in `next.config.js`.**
    Add the four file paths to Next.js's bundle-tracing config so
    Vercel ships them explicitly. Keep all four loaders pointing at
    repo-root paths via an absolute resolve that survives bundling
    (e.g. `path.join(process.cwd(), '..', 'operations', ...)` with
    the tracing config ensuring the files are shipped). Most robust
    to source-of-truth concerns; slightly more Next.js plumbing.

Wait for explicit founder choice before implementing. Default
recommendation depends on Step B output — state the recommendation
with reasoning once you have it.

**Step D — Classify the fix under 0d-ii and get explicit "proceed".**

- Option A (path-fix): **Elevated** — changes the production read
  path on four live loaders. Rollback: single-line revert per loader
  (four-line diff).
- Option B (file-move): **Elevated** — moves files referenced from
  multiple documents; all four loaders change; any external reference
  to moved files breaks until updated. Rollback: restore file
  locations and revert loader paths.
- Option C (`outputFileTracingIncludes`): **Elevated** — touches
  `next.config.js`, deployment configuration. Rollback: revert config
  edit and any loader-path changes.

No Critical sub-items. No auth surface. No distress-classifier touch.
No safety-critical function change (PR6 not triggered).

Name the rollback plan out loud before any deploy. Wait for founder
"proceed".

**Step E — Implement → Deploy → Re-probe in the same session.**

Respect PR2 (no build-to-wire gap). Order:

  1. Implement the chosen fix across all four loaders in a single
     commit (one of A, B, or C).
  2. Push and wait for Vercel Green.
  3. Re-run both harnesses in the sandbox to confirm parse still
     passes:
       - `node scripts/tech-wiring-verification.mjs` — expect CHECK 1
         and CHECK 2 GREEN; CHECK 3 will still report DRIFT until
         TECHNICAL_STATE.md §2 is reconciled (that reconciliation is
         next session after this one).
       - `node scripts/growth-wiring-verification.mjs` — expect all
         16 assertions GREEN; `is_sparse: true` remains the correct
         outcome until market signals are actually recorded.
  4. **Live probe at `/founder-hub` with Tech persona.** Use the
     exact message:
       `Can you tell me what endpoints exist right now and whether any are flagged as a known issue?`
     Expected reply shape: references to actual endpoint routes from
     `TECHNICAL_STATE.md` §2/§3, acknowledgement that no issues are
     currently recorded (because `tech-known-issues.md` is empty),
     mention of an as-of date. **No "unavailable" markers.**
  5. **Live probe at `/founder-hub` with Growth persona.** Use the
     exact message:
       `What have we already decided about growth positioning, and what do you know about how the market has responded so far?`
     Expected reply shape: reference to the seeded 20 April 2026
     positioning decision from the actions log, acknowledgement that
     market signals are sparse (because the file is empty by design)
     with an explicit "do not invent" discipline, mention of an
     as-of date. **No "unavailable" markers.** If the reply invents
     market signals or competitor moves despite the sparse-state
     disclosure reaching the prompt, flag it — this would be the
     first test of whether the sparse-state disclosure language is
     strong enough to actually prevent hallucination (see the Growth
     close handoff's Open Questions).
  6. If either live probe still says "unavailable": the chosen fix
     did not work. Do NOT iterate under time pressure. Stabilise,
     log the result, defer to the following session.
  7. Remove the diagnostic endpoint from Step B. Commit. Push.
     Vercel Green.

**Step F — Close the session.** Produce:

  - `operations/handoffs/context-loader-stub-fix-close.md` — handoff
    in the same format as session-13-close /
    tech-wiring-fix-close / growth-wiring-fix-close. Covers both
    personas' verification outcome.
  - Decision log entries recording (a) the fix option chosen and
    why (call it D-Tech-6 and D-Growth-7 if both personas move to
    Verified in the same entry, or split if helpful), (b) the
    diagnostic output, (c) the verification outcome on each
    persona, (d) status change from "Wired-but-stub-on-Vercel" to
    "Verified" (only if the live probes came back clean).
  - Knowledge-gap promotion review (PR5). The
    "Vercel serverless `process.cwd()` ≠ repo root for Next.js apps"
    observation reaches its third session this session. Promote to
    a full resolution entry in `operations/knowledge-gaps.md` with
    the chosen fix as the documented resolution.
  - The sparse-state disclosure pattern (Growth Channel 2) reached
    its first live-probe test this session. Record whether the
    disclosure held or whether it needed hardening. This does NOT
    promote under PR8 this session (first live observation only) —
    log it for the next session that adds a sparse-state channel.
  - Status vocabulary update: if both live probes return clean, all
    four loaders move from **Wired-but-stub-on-Vercel** to
    **Verified**. If only one persona clears, update that one and
    record the other as still-broken with specific diagnosis.
  - Flag the next queued task in the close handoff's Next Session
    Should menu. Top candidates:
      1. **TECHNICAL_STATE.md §2 reconciliation** (Tech's drift is
         bigger than originally stated: 7 routes to add to §2 plus 4
         to investigate-and-probably-remove; see Tech close
         handoff's addendum for the full list).
      2. **Rolling the Channel 1 + Channel 2 pattern out to Ops chat
         persona** (both D-Tech-4 and D-Growth-4 unblocked by a
         clean Verified outcome this session).
      3. Carry-forwards: mentor memory architecture ADR, journal
         scoring page Option A/B/C, defensive-reader disposition.

---

## Working agreements

- Founder has zero coding experience. Use plain language. Exact
  paths, exact commands, exact copy-paste text. "Vercel Green" is the
  deployment success signal — say "push and wait for Vercel Green",
  not "type-check on your side".
- Founder does not have Node installed and cannot run harnesses
  locally. AI runs harnesses in its sandbox (Node 22.22.0 available,
  repo mounted at the session's sandbox path). Do not ask the
  founder to `node scripts/...` themselves.
- Tech persona and Growth persona both live at `/founder-hub`, NOT
  `/private-mentor`. The persona selector switches between them.
  Do not confuse the two paths.
- Founder decides scope. If the diagnostic reveals a bigger
  structural problem (e.g. bundler excluding a whole directory
  tree), say so once clearly and wait.
- Classify every code change under 0d-ii before execution. State the
  risk level, name rollback, get approval before deploy.
- Deferred decisions go in the decision log with reasoning (PR7).
  Do not drop them silently.
- Manual verification method per work type (0c) — founder verifies by
  reading harness output (AI-produced) plus the two live probes at
  `/founder-hub`, not by reading TypeScript.
- If founder signals "I'm done for now" or similar, stabilise to
  known-good state and close. Do not propose additional fixes.

---

## Scope (bounded)

**In scope:**

- Diagnostic endpoint (temporary, gated, removed at session close).
- Exactly one fix approach (A, B, or C) chosen by the founder based
  on Step B output.
- Updates to all four loaders as required by the chosen fix:
    - `website/src/lib/context/tech-system-state.ts`
    - `website/src/lib/context/tech-endpoint-inventory.ts`
    - `website/src/lib/context/growth-actions-log.ts`
    - `website/src/lib/context/growth-market-signals.ts`
- File moves (only if Option B chosen) — all four source files in one
  pass, with any external reference updates in the same commit.
- `next.config.js` edit (only if Option C chosen) — all four file
  paths registered in the same entry.
- Re-run of both existing harnesses against disk state (no harness
  code changes).
- Live probes at `/founder-hub` with Tech and Growth personas.
- Decision log entry (D-Tech-6 and/or D-Growth-7) and close handoff
  at session end.
- Knowledge-gap promotion of KG1 (Vercel `process.cwd()` resolution)
  to a full resolution entry.
- Diagnostic endpoint removal at session close.

**Out of scope — do not expand:**

- TECHNICAL_STATE.md §2 reconciliation. Known drift. Queued as next
  session after this one.
- Extending Channel 1 + Channel 2 pattern to Ops / Support / Mentor
  personas. Contingent on Tech and Growth reaching Verified;
  revisit after that (D-Tech-4, D-Growth-4).
- Adding a CHECK 4 to either harness (live probe against Vercel).
  Worth doing eventually, not this session.
- Wiring an analytics-events error signal as a second Channel 1
  source for Tech (D-Tech-3, still deferred).
- Wiring automatic analytics / agent-discovery signals as a second
  Channel 2 source for Growth (D-Growth-3, still deferred).
- Any change to `tech-brain-loader.ts`, `tech-brain-compiled.ts`,
  `growth-brain-loader.ts`, or equivalent static-brain files.
- Any `sage-mentor/` file change.
- Any new Supabase table, migration, or RLS change.
- Any change to `runSageReason` or `sage-reason-engine.ts`.
- Any auth / session / cookie change (AC7 / PR1 standing-Critical
  surface — if one appears, stop and apply 0c-ii).
- Any change to the distress classifier, Zone 2 classification, Zone
  3 redirection, or their wrappers (PR6 — always Critical).
- Hardening the sparse-state disclosure language in Growth Channel 2.
  Leave alone unless Step E(5) demonstrates the disclosure failed to
  prevent hallucination. First live-probe observation only at this
  stage; promotion decision under PR8 requires more observations.

If you notice something else that should change, flag it with "I'd
push back on this" or "this is a limitation" — do not silently
expand the work.

---

## Risk classification — apply 0d-ii at session open

- Diagnostic endpoint (Step B): **Standard**.
- Loader path change, if Option A chosen: **Elevated** (four loaders
  in one pass).
- File move, if Option B chosen: **Elevated** (four source files in
  one pass).
- `next.config.js` edit, if Option C chosen: **Elevated** (deployment
  configuration).
- Harness re-runs: **Standard** (read-only, no deploy).
- Diagnostic endpoint removal at close: **Standard**.

No Critical sub-items — neither Tech nor Growth is a safety-critical
surface, no auth change, no distress-classifier touch.

---

## Success for this session

- Step B diagnostic runs and returns actual `process.cwd()` value
  and existence-check results for all candidate paths across both
  personas. Recorded verbatim in the session transcript.
- One fix option chosen by the founder based on the diagnostic
  evidence.
- Fix implemented across all four loaders in a single commit.
  Deployed. Vercel Green.
- Both harnesses re-run in the sandbox, parse still passes
  (CHECK 1 + CHECK 2 GREEN on Tech; all 16 assertions GREEN on
  Growth; CHECK 3 still DRIFT on Tech by design until the §2
  reconciliation session).
- Live probe at `/founder-hub` with Tech persona returns a reply
  that references actual endpoints and known-issues state — no
  "unavailable" markers.
- Live probe at `/founder-hub` with Growth persona returns a reply
  that references the seeded 20 April 2026 positioning entry and
  the sparse-state of market signals — no "unavailable" markers
  and no invented market signals.
- Diagnostic endpoint removed, committed, Vercel Green.
- All four loaders moved from **Wired-but-stub-on-Vercel** to
  **Verified**.
- KG1 promoted from carry-forward note to full resolution entry in
  `operations/knowledge-gaps.md`.
- `context-loader-stub-fix-close.md` written in the same format as
  session-13-close / tech-wiring-fix-close / growth-wiring-fix-close.
- Decision log updated.
- Next session queued tasks flagged: TECHNICAL_STATE.md §2
  reconciliation, then Ops persona wiring.

If the fix cannot be completed cleanly in one session (first fix
option doesn't work and time is tight for a second attempt), say so
clearly, stabilise to known-good, and close. Do not iterate under
time pressure. The current "Wired-but-stub-on-Vercel" state is safe
to remain in indefinitely — both personas disclose honestly.

If the session ends early with capacity remaining, ask the founder
whether to continue (TECHNICAL_STATE.md §2 reconciliation is the
natural follow-on, or Ops persona wiring if both Verified outcomes
are clean) or close. Do not prescribe additional work.
```

---

## Notes for the human reading this file

- This prompt assumes all of the following files are in place and
  unchanged since 20 April 2026:
    - `operations/handoffs/tech-wiring-fix-close.md` (including its
      Post-Close Verification Outcome addendum)
    - `operations/handoffs/growth-wiring-fix-close.md` (including
      its Post-Close Verification Outcome addendum)
    - `operations/decision-log.md` entries D-Tech-1..5 and
      D-Growth-1..6
    - The four loader files listed under Current State
    - The two harness scripts
    - The four source data files (`tech-known-issues.md`,
      `TECHNICAL_STATE.md`, `growth-actions-log.md`,
      `growth-market-signals.md`)
  If any have been edited since, the next AI should read the current
  version, not the memory of the closing sessions.

- The highest-risk moment is the implementation of whichever fix
  option is chosen in Step C. All three options are Elevated, none
  Critical. Rollback is small in every case. The fix touches four
  loaders at once because the root cause is shared — iterating
  persona-by-persona would double the verification burden for no
  benefit.

- The diagnostic endpoint in Step B is the single most important
  step. Do not skip it. Choosing a fix approach without knowing the
  actual `process.cwd()` value risks implementing the wrong fix and
  absorbing a second iteration cost across four loaders. The Tech
  session's original verification failure was caused by a similar
  "untested assumption" pattern — do not repeat it.

- The harnesses from the two previous sessions stay as-is this
  session. They do not need modification. They continue to run in
  the AI's sandbox, not the founder's terminal.

- No auth, cookie, or deploy-config change is in scope except for
  the `next.config.js` edit if Option C is chosen. That change is
  Elevated (not Critical) because it does not affect authentication
  or session handling.

- No safety-critical surface is in scope. If one appears (distress
  classifier, Zone 2/3, SafetyGate, auth, session, redirect),
  PR6/AC7 applies and the change becomes Critical.

- The session ends when all four loaders are Verified, or when the
  founder signals "done for now". Do not propose extending to other
  personas (Ops is the natural next) or reconciling
  TECHNICAL_STATE.md within this session — both are explicitly
  next-session work.

- This prompt supersedes `tech-stub-fix-prompt.md`. That earlier
  Tech-only prompt should not be used for the next session — use
  this one.
