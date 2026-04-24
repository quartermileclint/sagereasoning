# Tech Channel 1 + Channel 2 Stub-Fallback Fix — New Session Prompt

**Paste everything between the two fences below into a fresh Claude session.**
Keep this file as the canonical record of what the next session was asked to do.

---

```
You are picking up the SageReasoning build. Follow the project instructions and the manifest.

**First action, before anything else:**

Read `operations/handoffs/tech-wiring-fix-close.md` end to end, paying
particular attention to the "Addendum — Post-Close Verification Outcome
(20 April 2026, same session)" section at the bottom. That addendum
contains the failure diagnosis, the corrected status of both channels
(Wired-but-stub-on-Vercel), the three fix options, and the scoped
step-by-step for this session. Do not skip it.

Then read decision-log entry **D-Tech-5** (2026-04-20) for the reasoning
behind the decision to stabilise the previous session rather than fix
at the tail. That reasoning sets the posture for this session:
disciplined diagnosis first, fix second.

Then scan `operations/knowledge-gaps.md` for any entry relevant to:
  (a) Next.js / Vercel serverless runtime path resolution,
  (b) File bundling in serverless deploys (outputFileTracingIncludes),
  (c) Context loader failure modes.
If nothing matches (first observation of this specific failure shape),
flag it — it will be a knowledge-gap candidate at session close.

---

## Current state — what is on disk and what is broken

From the previous session (20 April 2026):

- `operations/tech-known-issues.md` — exists at repo root. Contains the
  YAML front-matter (`updated: 2026-04-20`, `maintainer: founder`), the
  maintenance contract, and empty `## Current Issues` and
  `## Recently Resolved (last 30 days)` sections. **Unchanged. Source
  file is correct.**
- `website/src/lib/context/tech-system-state.ts` — Channel 1 loader.
  Exports `getTechSystemState()`. Uses
  `path.join(process.cwd(), 'operations', 'tech-known-issues.md')`.
  **Returns stub on Vercel. The problem is on this read path.**
- `website/src/lib/context/tech-endpoint-inventory.ts` — Channel 2
  loader. Exports `getEndpointInventory()`. Uses
  `path.join(process.cwd(), 'TECHNICAL_STATE.md')`. **Returns stub on
  Vercel. Same root cause.**
- `website/src/app/api/founder/hub/route.ts` — `case 'tech':` calls
  both loaders and injects their `formatted_context` into `primaryText`.
  **Code is correct. Unchanged.**
- `scripts/tech-wiring-verification.mjs` — harness with three checks.
  Passes in the sandbox (10 assertions green, CHECK 3 reports DRIFT as
  designed). Does NOT catch the Vercel runtime divergence.
- `operations/handoffs/tech-wiring-fix-close.md` — close handoff plus
  addendum.
- `operations/decision-log.md` — four D-Tech entries + D-Tech-5.

Current behaviour on `/founder-hub` Tech persona:
  - Persona discloses honestly that both source files are "unavailable
    in my loaded context" — this is the stub-fallback message firing.
  - No hallucination. No silent failure. But no channel value either.

Production is in a known-good failure state, not a dangerous one.

---

## Primary task for this session

Fix the Vercel stub-fallback failure on Channel 1 and Channel 2 so
both loaders successfully read their source files on Vercel runtime
and the Tech persona answers with real inventory + issues data instead
of the "unavailable" disclosure.

This is a five-sub-step job. Do not skip sub-step 1 (diagnostic first,
fix second).

---

## Step-by-step

**Step A — Read the close-handoff addendum and D-Tech-5 in full.**
Do not re-design the fix approach from scratch. The addendum already
names the three fix options (path-fix, file-move,
`outputFileTracingIncludes`) and the diagnosis that determines which
applies. Your job is to execute that plan.

**Step B — Run the diagnostic first. No fix attempt before diagnosis.**

Add a temporary diagnostic endpoint (or a one-shot `console.log` guarded
by an env flag) that returns/logs the following on Vercel runtime:

  - `process.cwd()` — the actual working directory on the serverless
    function.
  - The result of `fs.access()` (or `fs.existsSync()`) on each of:
      - `path.join(process.cwd(), 'operations', 'tech-known-issues.md')`
      - `path.join(process.cwd(), 'TECHNICAL_STATE.md')`
      - `path.join(process.cwd(), '..', 'operations', 'tech-known-issues.md')`
      - `path.join(process.cwd(), '..', 'TECHNICAL_STATE.md')`
      - `path.join(process.cwd(), 'operations')` (directory, for existence)
  - `__dirname` where applicable (may not exist in ESM — log the
    equivalent via `fileURLToPath(import.meta.url)` + `path.dirname`).
  - A directory listing of `process.cwd()` via `fs.readdirSync(process.cwd())`,
    limited to the first 20 entries to keep the output small.

Suggested home for the diagnostic: a new throwaway endpoint at
`website/src/app/api/debug/tech-cwd/route.ts` gated by the founder's
session cookie (same gate as other founder-only endpoints). Do not
expose unauthenticated.

Deploy. Founder hits the endpoint (or reads the Vercel function log).
Read the output. Record verbatim in the session transcript.

Risk classification for the diagnostic endpoint: **Standard** under
0d-ii (new read-only endpoint, gated, temporary, no state change). State
the classification before deploy.

**Step C — Choose the fix approach based on the diagnostic.**

The close-handoff addendum lays out three options. Present them to the
founder with reasoning, not a prescription:

  - **Option A — path-fix.** If `process.cwd()` resolves to
    `.../website` and `path.join(process.cwd(), '..', 'operations', ...)`
    reaches the source files, update both loaders to use that
    parent-traversal path. Cheapest fix, smallest diff. Risk: parent
    traversal may not work if the bundler hasn't tracked those files —
    `fs.access` returning ENOENT on the `..` paths in Step B rules this
    option out.
  - **Option B — file-move.** Copy the two source files into `website/`
    (e.g. `website/operations/tech-known-issues.md` and
    `website/TECHNICAL_STATE.md`). Update both loaders to read from the
    new path. Introduces a source-of-truth question for
    `TECHNICAL_STATE.md` if the repo-root copy stays — resolve that at
    decision time (move, not copy).
  - **Option C — `outputFileTracingIncludes` in `next.config.js`.** Add
    the two file paths to Next.js's bundle-tracing config so Vercel ships
    them explicitly. Keep both loaders pointing at repo-root paths via
    an absolute resolve that survives bundling. Most robust; slightly
    more Next.js plumbing.

Wait for explicit founder choice before implementing. Default
recommendation depends on Step B output — state the recommendation with
reasoning once you have it.

**Step D — Classify the fix under 0d-ii and get explicit "proceed".**

- Option A (path-fix): **Elevated** — changes the production read path
  on two live loaders. Rollback: single-line revert per loader.
- Option B (file-move): **Elevated** — moves files referenced from
  multiple documents; both loaders change; any external reference to
  `TECHNICAL_STATE.md` at repo root breaks. Rollback: restore file
  location and revert loader paths.
- Option C (`outputFileTracingIncludes`): **Elevated** — touches
  `next.config.js`, which is deployment configuration. Rollback: revert
  config edit and loader paths if also changed.

No Critical sub-items. No auth surface. No distress-classifier touch.
No safety-critical function change (PR6 not triggered).

Name the rollback plan out loud before any deploy. Wait for founder
"proceed".

**Step E — Implement → Deploy → Re-probe in the same session.**

Respect PR2 (no build-to-wire gap). Order:

  1. Implement the chosen fix (one of A, B, or C).
  2. Push and wait for Vercel Green.
  3. Re-run the harness in the sandbox to confirm parse still passes
     (CHECK 1 and CHECK 2 should remain GREEN; CHECK 3 will still
     report DRIFT until TECHNICAL_STATE.md §2 is reconciled, which is
     next session's task).
  4. **Live probe at `/founder-hub` with Tech persona selected.** Use
     the exact message:
       `Can you tell me what endpoints exist right now and whether any are flagged as a known issue?`
     Expected reply shape: references to actual endpoint routes from
     `TECHNICAL_STATE.md` §2/§3, acknowledgement that no issues are
     currently recorded (because `tech-known-issues.md` is still empty),
     mention of an as-of date. **No "unavailable" markers in the reply.**
  5. If the reply still says "unavailable": the chosen fix didn't work.
     Do NOT iterate under time pressure. Stabilise, log the result in
     the close handoff, and defer to the following session.
  6. Remove the diagnostic endpoint from Step B. Commit. Push. Vercel
     Green.

**Step F — Close the session.** Produce:

  - `operations/handoffs/tech-stub-fix-close.md` — handoff in the same
    format as session-13-close / tech-wiring-fix-close.
  - Decision log entry **D-Tech-6** recording (a) the fix option chosen
    and why, (b) the diagnostic output, (c) the verification outcome,
    (d) status change from "Wired-but-stub-on-Vercel" to "Verified"
    (only if the live probe came back clean).
  - Knowledge-gap promotion review (PR5). The
    "Vercel serverless process.cwd() ≠ repo root for Next.js apps"
    observation from the previous session is the first. This session
    is the second. Not yet at three — not a promotion, but a
    candidate. Record in the handoff.
  - Status vocabulary update: if the live probe returns clean,
    Channel 1 and Channel 2 move from **Wired-but-stub-on-Vercel** to
    **Verified**. Record honestly either way.
  - Flag the TECHNICAL_STATE.md §2 reconciliation as the next queued
    task in the close handoff's Next Session Should menu. The drift
    reconciliation is bigger than originally stated: 7 routes to add
    to §2 (the six mentor-family routes plus `/api/score-conversation`),
    4 routes in §2 to investigate and probably remove (`/api/evaluate`,
    `/api/score-document`, `/api/score-iterate`, `/api/score-scenario`).

---

## Working agreements

- Founder has zero coding experience. Use plain language. Exact paths,
  exact commands, exact copy-paste text. "Vercel Green" is the
  deployment success — say "push and wait for Vercel Green", not
  "type-check on your side".
- Founder does not have Node installed and cannot run the harness
  locally. AI runs the harness in its sandbox (Node 22.22.0 available,
  repo mounted at `/sessions/charming-gifted-clarke/mnt/sagereasoning`).
  Do not ask the founder to `node scripts/...` themselves.
- Correct the Step E(d) URL from the previous session: Tech persona is
  on `/founder-hub`, NOT `/private-mentor`. Do not repeat that mistake.
- Founder decides scope. If the diagnostic reveals a bigger structural
  problem (e.g. bundler is excluding a whole directory tree), say so
  once clearly and wait.
- Classify every code change under 0d-ii before execution. State the
  risk level, name rollback, get approval before deploy.
- Deferred decisions go in the decision log with reasoning (PR7). Do
  not drop them silently.
- Manual verification method per work type (0c) — founder verifies by
  reading harness output (AI-produced) plus the live probe at
  `/founder-hub`, not by reading TypeScript.
- If founder signals "I'm done for now" or similar, stabilise to
  known-good state and close. Do not propose additional fixes.

---

## Scope (bounded)

**In scope:**

- Diagnostic endpoint (temporary, gated, removed at session close).
- Exactly one fix approach (A, B, or C) chosen by the founder based on
  Step B output.
- Updates to `website/src/lib/context/tech-system-state.ts` and
  `website/src/lib/context/tech-endpoint-inventory.ts` as required by
  the chosen fix (path change).
- File moves (only if Option B chosen) and/or `next.config.js` edit
  (only if Option C chosen).
- Re-run of the existing harness against disk state (no harness code
  changes).
- Live probe at `/founder-hub` with Tech persona.
- Decision log entry D-Tech-6 and close handoff at session end.
- Diagnostic endpoint removal at session close.

**Out of scope — do not expand:**

- TECHNICAL_STATE.md §2 reconciliation. Known drift. Queued as next
  session after this one.
- Extending Channel 1 + Channel 2 pattern to ops / growth / support /
  mentor personas. Contingent on Tech reaching Verified; revisit after
  that (D-Tech-4).
- Adding CHECK 4 to the harness (live probe against Vercel). Worth
  doing eventually, not this session.
- Wiring an analytics-events error signal as a second Channel 1 source
  (D-Tech-3, still deferred).
- Any change to `tech-brain-loader.ts` or `tech-brain-compiled.ts`.
- Any `sage-mentor/` file change.
- Any new Supabase table, migration, or RLS change.
- Any change to `runSageReason` or `sage-reason-engine.ts`.
- Any auth / session / cookie change (AC7 / PR1 standing-Critical
  surface — if one appears, stop and apply 0c-ii).
- Any change to the distress classifier, Zone 2 classification, Zone 3
  redirection, or their wrappers (PR6 — always Critical).

If you notice something else that should change, flag it with "I'd
push back on this" or "this is a limitation" — do not silently expand
the work.

---

## Risk classification — apply 0d-ii at session open

- Diagnostic endpoint (Step B): **Standard** (new read-only endpoint,
  gated, temporary).
- Loader path change, if Option A chosen: **Elevated**.
- File move, if Option B chosen: **Elevated**.
- `next.config.js` edit, if Option C chosen: **Elevated** (deployment
  configuration).
- Harness re-run: **Standard** (read-only, no deploy).
- Diagnostic endpoint removal at close: **Standard**.

Classification is set by the AI before execution. Founder can
reclassify upward at any time per 0d-ii. No Critical sub-items
— Tech persona is not a safety-critical surface. No auth change. No
distress-classifier touch.

---

## Success for this session

- Step B diagnostic runs and returns actual `process.cwd()` value and
  the existence-check results for all candidate paths, recorded in the
  session transcript verbatim.
- One fix option chosen by the founder based on diagnostic evidence.
- Fix implemented, deployed, Vercel Green.
- Live probe at `/founder-hub` with Tech persona returns a reply that
  references actual endpoints and known-issues state — no
  "unavailable" markers.
- Diagnostic endpoint removed, committed, Vercel Green.
- Channel 1 and Channel 2 status moved from **Wired-but-stub-on-Vercel**
  to **Verified**.
- `tech-stub-fix-close.md` written in the same format as
  session-13-close / tech-wiring-fix-close.
- Decision log updated with D-Tech-6.
- Next session queued task: TECHNICAL_STATE.md §2 reconciliation
  (7 add, 4 investigate-then-remove).

If the fix cannot be completed cleanly in one session (for example,
the first fix option chosen doesn't work and time is tight for a
second attempt), say so clearly, stabilise to known-good, and close.
Do not iterate under time pressure. The current "Wired-but-stub-on-
Vercel" state is safe to remain in indefinitely — the persona
discloses honestly.

If the session ends early with capacity remaining, ask the founder
whether to continue (TECHNICAL_STATE.md §2 reconciliation is the
natural follow-on) or close. Do not prescribe additional work.
```

---

## Notes for the human reading this file

- This prompt assumes `operations/handoffs/tech-wiring-fix-close.md`
  (including its addendum) and the D-Tech-5 decision log entry are in
  place and unchanged. If either has been edited since 20 April 2026,
  read the current version, not the memory of the previous session.
- The highest-risk moment in this session is the implementation of
  whichever fix option is chosen in Step C. All three options are
  Elevated, none Critical. Rollback is small in every case.
- The diagnostic endpoint in Step B is the single most important step.
  Do not skip it. Choosing a fix approach without knowing the actual
  `process.cwd()` value risks implementing the wrong fix and absorbing
  a second iteration cost. The previous session's verification failure
  was caused by a similar "untested assumption" pattern — do not
  repeat it.
- The harness from the previous session stays as-is this session. It
  does not need modification. It continues to run in the AI's sandbox,
  not the founder's terminal.
- No auth, cookie, or deploy-config change is in scope except for the
  `next.config.js` edit if Option C is chosen, and that change is
  Elevated (not Critical) because it does not affect authentication or
  session handling.
- No safety-critical surface is in scope. If one appears (distress
  classifier, Zone 2/3, SafetyGate), PR6 applies and the change
  becomes Critical.
- The session ends when Channel 1 and Channel 2 are Verified, or when
  the founder signals "done for now". Do not propose extending to
  other personas or reconciling TECHNICAL_STATE.md within this session
  — both are explicitly next-session work.
