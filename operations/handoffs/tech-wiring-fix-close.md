# Session Close — 20 April 2026 (Tech Chat Persona — Channel 1 + Channel 2 Wired, Verification Deferred to Founder)

## Decisions Made

- **Tech persona wired with two new context channels in a single session.** Channel 1 (Live System State) reads `operations/tech-known-issues.md`. Channel 2 (Endpoint Inventory) reads `/TECHNICAL_STATE.md`. Both injected into `website/src/app/api/founder/hub/route.ts` `case 'tech':` only. No other persona branch touched. PR1 (single-persona proof before surface rollout) respected.
- **D-Tech-1 adopted — known-issues file starts empty with a dated header (Option A).** Founder elected to start from a clean baseline rather than seed with historical incidents. The file's maintenance contract is written into the top of the file and references PR9 severity tiers. Trigger to revisit: first time the Tech persona is asked about a live symptom and the file is still empty — at that moment, record the symptom as the first real entry rather than as a backfill.
- **D-Tech-2 adopted — TECHNICAL_STATE.md reconciliation deferred (Option A).** Drift is known and bounded: §2 lists 9 runSageReason endpoints, the codebase has 10. The harness's drift-detection step surfaces the exact gap. Reconciling the file is the first queued task for the next session. Rationale: fixing the inventory now would remove the demonstration value of the drift-detection check on first run.
- **D-Tech-3 adopted — analytics-events error signal deferred (Option A).** No Supabase error log table exists and no `website/src/lib/logging/` directory exists. Wiring an analytics channel would have required building the signal source first. Channel 1 (the hand-maintained known-issues file) is sufficient for the Tech persona's current scope. Trigger to revisit: first time the founder wants Tech to answer questions about error rates or request volumes.
- **D-Tech-4 adopted — pattern not extended to Ops/Growth/Support chat personas this session (Option A).** Tech is the single-persona proof required by PR1. Extending the pattern to other personas is contingent on Tech reaching Verified status (harness GREEN on CHECK 1 + CHECK 2, live probe returns the structured reply). Trigger to revisit: after Step E verification lands clean.
- **No mid-session scope changes.** Four choice-point decisions recorded. Risk classification (Elevated under 0d-ii) accepted without override. Session ran Scaffold → Wire → Verify-on-disk-level end-to-end. Live verification (Vercel deploy + harness run + chat probe) is the founder's next action.

## Status Changes

- `operations/tech-known-issues.md`: **does not exist** → **Scaffolded (file-level, header + contract + empty sections)**. 0a status: **Scaffolded**. Will become **Wired** the first time an entry is added; **Verified** when the entry is surfaced by the Tech persona in a live probe.
- `website/src/lib/context/tech-system-state.ts`: **does not exist** → **Wired**. Exports `getTechSystemState()` which reads the known-issues file, parses front-matter and both sections, returns a structured block plus a ready-to-inject `formatted_context` string. Stub fallback self-discloses when the file is unreadable. 0a status: **Wired** (call site exists; live load not yet tested against a Vercel deploy). Moves to **Verified** when CHECK 1 of the harness passes on the founder's machine.
- `website/src/lib/context/tech-endpoint-inventory.ts`: **does not exist** → **Wired**. Exports `getEndpointInventory()` which reads `/TECHNICAL_STATE.md`, parses §2 prose blocks and §3 markdown table, returns a structured inventory plus a `formatted_context` string. No recursive route-file globbing in the hot path — drift detection is the harness's job per PR1. 0a status: **Wired**. Moves to **Verified** when CHECK 2 of the harness passes.
- `website/src/app/api/founder/hub/route.ts`: **unchanged Tech branch** → **Tech branch wrapped in block scope with two new `await`s and both formatted contexts appended to `primaryText`**. Two imports added at the top. Five non-Tech persona branches (ops, growth, support, mentor, default) untouched. 0a status: **Wired**. Moves to **Verified** when the live probe returns a reply that references current-issues state and endpoint inventory wording.
- `scripts/tech-wiring-verification.mjs`: **does not exist** → **Scaffolded (on disk, not yet run)**. Founder-runnable harness with three checks (Channel 1 parse, Channel 2 parse, drift detection). Exit codes documented. 0a status: **Scaffolded**. Moves to **Verified** when the founder executes `node scripts/tech-wiring-verification.mjs` at least once and reads the output.
- `operations/decision-log.md`: appended four entries — D-Tech-1, D-Tech-2, D-Tech-3, D-Tech-4. No prior entries modified.

## What Was Built

### Files Created (4)

| File | Purpose |
|------|---------|
| `operations/tech-known-issues.md` | Hand-maintained known-issues log. YAML front-matter (`updated`, `maintainer`). Two sections: Current Issues, Recently Resolved (last 30 days). Both start empty with "No known issues at 20 April 2026." placeholders. Maintenance contract at the top: who updates it (founder), when (at session close if any live-system issue was encountered), and the PR9 severity tiers. |
| `website/src/lib/context/tech-system-state.ts` | Channel 1 loader. Read-only at request time. Parses front-matter (regex anchored on `---...---` delimiter), splits sections by `## ` headers, parses top-level bullets with indented `key: value` children. Produces a `LIVE SYSTEM STATE — KNOWN ISSUES` block with source, as-of date, maintainer, and either "none recorded" or a formatted issue list. Stub on unreadable file carries a self-disclosing message telling the persona it is answering blind. |
| `website/src/lib/context/tech-endpoint-inventory.ts` | Channel 2 loader. Read-only at request time. Parses `**Last updated:** DD Month YYYY` header. §2 parser splits on `### ` headings, extracts per-endpoint bolded fields (Purpose, Auth, Rate limit, Depth, Model, Context layers, Status, Note, Side effects). §3 parser handles the mentor-family markdown table. No filesystem globbing in the hot path. Stub on unreadable file self-discloses. |
| `scripts/tech-wiring-verification.mjs` | Founder-runnable harness. Node 22.6+ required (native TypeScript import support). Three checks: (1) Channel 1 parse, (2) Channel 2 parse, (3) drift detection — walks `website/src/app/api/**/route.ts` for every `runSageReason(` call and compares the set against the inventory's §2 entries. Exit codes: 0 = all pass + no drift, 1 = assertion failure, 2 = parse passes but drift detected (expected on first run). |

### Files Modified (2)

| File | Change |
|------|--------|
| `website/src/app/api/founder/hub/route.ts` | Two imports added at the top: `import { getTechSystemState } from '@/lib/context/tech-system-state'` and `import { getEndpointInventory } from '@/lib/context/tech-endpoint-inventory'`. The `case 'tech':` body wrapped in a block scope `{ ... }`. Inside the block: `const techSystemState = await getTechSystemState()` and `const techEndpointInventory = await getEndpointInventory()`. The existing 10-bullet upgrade list in the persona prompt was left untouched. Both `formatted_context` strings appended to `primaryText` between the persona upgrades and `brainContext`. No other case branch modified. |
| `operations/decision-log.md` | Appended four dated entries: D-Tech-1 (empty-file baseline), D-Tech-2 (TECHNICAL_STATE.md reconciliation deferral), D-Tech-3 (analytics-events signal deferral), D-Tech-4 (single-persona proof before rollout). Each entry carries Decision, Reasoning, Alternatives considered, Revisit condition, Rules served, Impact, Status: Adopted. |

### Files NOT Changed

- `website/src/app/api/founder/hub/route.ts` `case 'ops'`, `case 'growth'`, `case 'support'`, `case 'mentor'`, `default:` — all intentionally left untouched per PR1 (Tech is the single-persona proof).
- `TECHNICAL_STATE.md` — intentionally left at its 11 April 2026 state. Reconciliation is the next session's first queued task. The drift between §2 (9 runSageReason endpoints) and the codebase (10) is the signal the harness is designed to surface.
- `website/src/lib/context/tech-brain-loader.ts` — unchanged. The existing Tech brain continues to sit in the system prompt; the two new channels compose in alongside it.
- No Supabase changes. No SQL run this session. No DDL. No RLS.
- No changes to any other persona, route, or context loader.

## Verification Completed This Session

Verification in this session is **on-disk, not live**. The founder's Step E actions will take it to live.

- **Founder-visible file-level checks.** All four created files exist at their intended paths. Both edits to `website/src/app/api/founder/hub/route.ts` applied cleanly (imports + `case 'tech':` block scope).
- **Build-to-wire check (KG3 / KG7, PR2).** Grep confirmed both loaders are imported and called exactly once in production code, at the intended site in `hub/route.ts`. No dangling imports. No other production call site. The `.mjs` harness uses its own dynamic filesystem-path import (separate test-only entry point), not the `@/lib/context/` alias — so a grep on `@/lib/context/tech-system-state` or `@/lib/context/tech-endpoint-inventory` returns exactly one hit each, both in `hub/route.ts`.
- **Block-scope correctness.** The two new `const` declarations inside `case 'tech': { ... }` do not leak to other cases. `primaryText` remains the outer-scope `let` declared earlier in the function; assignment inside the block mutates the outer binding as intended. `break` inside the block still exits the switch cleanly.
- **Async propagation.** The enclosing `getPrimaryAgentResponse` is already `async`, so the two new `await` calls inside `case 'tech':` are valid without further change.

### What Verification Has NOT Yet Covered

- **No Vercel deploy run this session.** The changes are committed to disk only. The founder's first action is to push and confirm Vercel Green.
- **No harness run this session.** `node scripts/tech-wiring-verification.mjs` has not been executed. Founder runs it locally.
- **No live probe run this session.** The Tech persona has not been asked a question against the new context channels.
- **0a status for all five artefacts therefore tops out at Wired.** Verified status requires the founder's Step E actions to come back clean.

## Founder's Step E — Verification Sequence

Five actions, in order. Each has an exact command and an expected outcome.

### (a) Deploy to Vercel

From the repo root:

```
git add operations/tech-known-issues.md website/src/lib/context/tech-system-state.ts website/src/lib/context/tech-endpoint-inventory.ts website/src/app/api/founder/hub/route.ts scripts/tech-wiring-verification.mjs operations/decision-log.md operations/handoffs/tech-wiring-fix-close.md
git commit -m "Wire Tech persona Channel 1 + Channel 2 (20 April 2026)"
git push
```

Then: open Vercel dashboard → Deployments → confirm the new build goes Green. Expected duration: 1–3 minutes.

If Vercel goes red: do not attempt fixes yourself. Message the build failure and I will diagnose.

### (b) Run the harness

From the repo root:

```
node scripts/tech-wiring-verification.mjs
```

Requires Node 22.6 or later (native TypeScript import support). Confirm your node version with `node --version` before running if you are not sure.

### (c) Expected harness output (three checks)

The harness prints three sections separated by banner lines. Verbatim for the structural parts, approximate for list contents.

**CHECK 1 — Channel 1 parse**

Expected on first run:

```
source:         file
as_of:          2026-04-20
maintainer:     founder
current issues: 0
resolved:       0

formatted_context (first 400 chars):
LIVE SYSTEM STATE — KNOWN ISSUES
Source: operations/tech-known-issues.md (hand-maintained)
As of: 2026-04-20   Maintainer: founder

Treat this block as the only authoritative signal about what is
currently broken, degraded, or under remediation. ...

  ✓ loader returned an object with a formatted_context string
  ✓ source === 'file' (the known-issues file is readable)
  ✓ current_issues is an array
  ✓ recently_resolved is an array
  ✓ formatted_context mentions LIVE SYSTEM STATE header
```

All five ticks green = CHECK 1 GREEN.

**CHECK 2 — Channel 2 parse**

Expected on first run:

```
source:                   file
as_of:                    11 April 2026
runSageReason endpoints:  9
mentor endpoints:         [non-zero, likely 3–6]
total endpoints:          [≥ 12]

runSageReason routes (parsed):
  [9 routes listed, each in the form METHOD /api/... [Status]]

mentor routes (parsed):
  [routes from §3 markdown table]

  ✓ loader returned an object with a formatted_context string
  ✓ source === 'file' (TECHNICAL_STATE.md is readable)
  ✓ at least one runSageReason endpoint parsed
  ✓ at least one mentor endpoint parsed
  ✓ as_of is non-unknown (header date captured)
```

All five ticks green = CHECK 2 GREEN.

**CHECK 3 — Drift detection**

Expected on first run — **DRIFT is the correct outcome, not a failure.**

```
codebase runSageReason routes (grep of website/src/app/api/**/route.ts):
  [10 routes listed]

inventory runSageReason routes (from TECHNICAL_STATE.md §2):
  [9 routes listed]

RESULT: DRIFT — TECHNICAL_STATE.md §2 is out of date. Update before proceeding.

Routes in code but NOT in inventory:
  + [the one extra route in the codebase]

Note: first-run drift is expected. The drift itself is the signal
      Channel 2 was wired to surface. Reconciliation is the next session.
```

Exit code: **2** (parse passes + drift detected). This is correct. Reconciling `TECHNICAL_STATE.md` §2 is the first queued task for the next session.

**What to do if output does not match:**

- If CHECK 1 fails with `source === 'stub'`: `operations/tech-known-issues.md` was not readable. Confirm the file exists at that path.
- If CHECK 2 fails with `source === 'stub'`: `TECHNICAL_STATE.md` at repo root was not readable. Should not happen — it exists.
- If CHECK 3 reports GREEN on first run (no drift): the harness is broken, because §2 and the codebase are known to differ by exactly one endpoint. Message me with the output.
- If CHECK 3 reports DRIFT but the set difference is empty: same — harness is misreporting. Message me.

### (d) Live probe

After Vercel Green, open `/private-mentor` (logged in), switch the persona selector to **Tech**, and paste this exact message:

```
Can you tell me what endpoints exist right now and whether any are flagged as a known issue?
```

**Expected reply shape (not verbatim, but this shape must be present):**

- A reference to the endpoint inventory by name or by the §2 structure (mentions of `runSageReason` endpoints and/or a count of endpoints, or a list of some of them).
- An acknowledgement of the current known-issues state — because the file is empty on 20 April 2026, the Tech persona should say something equivalent to "no issues are currently recorded" or "the known-issues file shows none at the moment".
- An as-of date for either or both signals (e.g. "as of 20 April 2026" for Channel 1, "as of 11 April 2026" for Channel 2).

**If the reply instead says the Tech persona does not have access to live state or endpoint information:** the context injection is not reaching the prompt. Message me with the exact reply text.

**If the reply invents issues that are not in the file:** the persona is hallucinating past the honest-limits instruction. Message me with the reply text.

### (e) Outcome recording

- **All three harness checks structurally correct + drift reported on CHECK 3 + live probe reply matches the expected shape** = Channel 1 and Channel 2 move from **Wired** to **Verified** in the status register. Record in the next session's opening note.
- **Anything else** = stop. Do not deploy further work on top. Report the output back to me.

## Next Session Should

The single queued task for the next session is:

**1. Reconcile `TECHNICAL_STATE.md` §2 against the codebase.** The drift-detection check has already identified the exact gap (9 listed vs 10 in code). The one missing endpoint will be in the harness's "Routes in code but NOT in inventory" output. Add the missing entry to §2 in the same bolded-fields format as its siblings, re-run the harness, confirm CHECK 3 now reports GREEN.

If founder has appetite for more after that, the Next Session Should menu is:

- **2. Extend the Channel 1 + Channel 2 pattern to the next persona.** Tech is the single-persona proof. With Verified status, PR1 permits rollout. Ops is the most natural next candidate (has the most overlap with system-state questions). D-Tech-4's revisit condition is satisfied once Tech is Verified.
- **3. Record the first real known-issue entry.** Nothing to record as of 20 April 2026. Trigger: first time a live-system issue is encountered, record it in `operations/tech-known-issues.md` and re-run the harness to confirm it surfaces.
- **4. Wire the analytics-events error signal into Channel 1 as a second source.** D-Tech-3's revisit condition. Requires either wiring a Supabase error log table or a `website/src/lib/logging/` directory first. Non-trivial — probably its own scoped session.
- **5. Mentor memory architecture ADR** — still unscoped, still blocking morning check-in / weekly mirror / journal-question surfacing. Carried forward from Session 13. Highest unlock-value option after the reconciliation.
- **6. Journal scoring page Option A/B/C decision** — carried forward. Still unresolved.
- **7. Defensive-reader disposition follow-up** — carried forward from Session 13. 5-minute conversation.

Recommended opening: task (1) first (15-minute reconciliation, closes the drift loop, takes Tech to Verified on the drift dimension). Then founder picks from the rest.

## Blocked On

- **Step E verification by founder.** Everything from this session is Wired, not Verified. Until the harness runs and the live probe returns, nothing here is confirmed working. This is the only thing blocking the transition to Verified.
- **`TECHNICAL_STATE.md` reconciliation.** Blocks CHECK 3 from going GREEN. Not urgent — drift is the expected first-run state and is a feature, not a bug — but sits at the top of the next-session queue.
- All prior blocks from Session 13 remain: mentor memory architecture ADR, journal scoring page Option A/B/C decision.

## Open Questions

- **Should the Tech persona's upgrade list mention Channel 1 and Channel 2 explicitly?** The 10-bullet upgrade list in the persona prompt describes what Tech can and cannot do, but does not currently reference the two new context channels by name. Two postures: (a) leave the upgrades list untouched — the channels are described in the formatted-context headers themselves, so the persona learns about them in context rather than in the prompt; (b) add an eleventh bullet calling out the two channels so the persona knows to look for them. Default recommendation: (a), on the ground that the headers are self-describing. Revisit if the live probe shows the persona ignoring the channels.
- **Is the stub's self-disclosing message strong enough?** If `tech-known-issues.md` or `TECHNICAL_STATE.md` becomes unreadable, the stub says "Tech is answering without current-issues context" (Channel 1) and equivalent for Channel 2. The persona is not forced to repeat this to the user. If the message lands silently and the user is misled, the self-disclosure fails its purpose. Tested shape only — not tested under actual file corruption. Logged for future hardening.
- **Drift detection only covers the `runSageReason` family.** CHECK 3 compares `runSageReason(` call sites in code against §2 entries in the inventory. Mentor endpoints (§3 table) are not drift-checked. If a new mentor endpoint is added and §3 is not updated, the harness will not catch it. Current scope decision: out-of-scope for this session; revisit if mentor endpoints start churning.
- **`process.cwd()` assumption.** Both loaders use `path.join(process.cwd(), 'operations', 'tech-known-issues.md')` and `path.join(process.cwd(), 'TECHNICAL_STATE.md')`. On Vercel serverless runtime, `process.cwd()` should resolve to the repo root, but this has not been verified in production yet. CHECK 1 / CHECK 2 of the harness will confirm local-file read; live probe in Step E will confirm Vercel-runtime read. If the live probe returns stub text, this is the first thing to check.

## Deferred (Known Gaps, Not This Session)

- **TECHNICAL_STATE.md §2 reconciliation.** D-Tech-2. Queued for next session.
- **Analytics-events error signal as Channel 1 second source.** D-Tech-3. Requires infrastructure not yet built.
- **Rolling the pattern out to Ops / Growth / Support / Mentor personas.** D-Tech-4. Conditional on Tech reaching Verified.
- **Mentor endpoint drift detection.** Not in scope. Logged above under Open Questions.
- **Tech persona upgrade-list expansion to reference the two new channels by name.** Not in scope. Logged above.
- **Stub-path live hardening (fault injection of the two source files).** Not in scope.
- **Mentor memory architecture ADR** — carried forward, still unscoped.
- **Journal scoring page Option A/B/C decision** — carried forward.
- **Defensive-reader disposition** — carried forward from Session 13.
- **Public `/api/reflect`, `/api/score`, baseline-assessment writer paths** — silent-swallow pattern audit still outstanding.

## Process-Rule Citations

- **PR1 — respected in full.** Single persona (Tech) wired. Other four personas (ops, growth, support, mentor) and the default branch untouched. D-Tech-4 records the deliberate decision to withhold rollout until Tech reaches Verified.
- **PR2 — respected.** Both loaders were wired into the single production call site (`hub/route.ts` `case 'tech':`) in the same session they were scaffolded. No build-to-wire gap. Grep confirmed invocation exactly once per loader in production code. Verification at the unit-file level completed in-session; live verification is the founder's Step E action.
- **PR3 — N/A.** No safety-critical surface touched. No distress classifier, Zone 2 classification, Zone 3 redirection, or wrapper changed.
- **PR4 — respected.** No new endpoint was designed this session. Model selection was confirmed as out-of-scope at session open.
- **PR5 — scan performed at session open, no third-observation promotions.** `operations/knowledge-gaps.md` was scanned for relevant entries. KG3 / KG7 (build-to-wire gap) and KG6 (composition order constraint) were identified as relevant and applied actively during implementation — see below under Knowledge-Gap Carry-Forward. No knowledge gap reached its third observation this session. No new permanent entries added.
- **PR6 — N/A.** No safety-critical function touched.
- **PR7 — applied four times.** D-Tech-1, D-Tech-2, D-Tech-3, D-Tech-4 are all deferred-decision records in the decision log. Each carries the alternatives considered, the reasoning for the current choice, and the explicit revisit condition.
- **PR8 — no T-series candidates reached third recurrence.** Two tacit-knowledge observations from this session are logged below under Stewardship Findings. Neither is a promotion candidate yet.
- **PR9 — applied in the file-level contract.** The maintenance contract at the top of `operations/tech-known-issues.md` references the three-tier severity system (Catastrophic / Long-term regression / Efficiency & stewardship). This ensures future entries are classified at time of logging, not retrospectively.

## Knowledge-Gap Carry-Forward

- **KG3 / KG7 (Build-to-Wire Gap) — actively applied.** Grep of both loaders in production code confirmed exactly one call site each (`hub/route.ts` `case 'tech':`). Not just that the imports resolve — that `getTechSystemState()` and `getEndpointInventory()` are actually invoked in the execution path. The harness's `.mjs` dynamic-import test-only entry is separate and does not count toward the production call-site check. Stable at prior observation count.
- **KG6 (Composition Order Constraint) — considered and resolved.** Session-open scan flagged a potential tension: system state and endpoint inventory are per-request context, not foundational expertise, and per KG6 per-request context belongs in the user message, not the system prompt. On inspection, the existing Tech brain loader already sits in the system prompt (it is foundational expertise that changes daily but at build-time, not at user-message time), so adding state and inventory alongside it is consistent with the established pattern for this persona. Resolved as "not a violation" and noted as a first observation of a pattern that may itself be worth formalising: **"per-persona context that is foundational-but-daily" is a recognised shape in the composition order rule.** Not promoted (first observation only).
- **KG1–KG5, KG8–KG10 — not relevant this session.** No JSONB columns touched. No Supabase writes. No writer-silent-swallow patterns. No hub-label contracts exercised. No `/private-mentor` façade assumptions re-examined.
- **Session 13 carry-forwards — not re-encountered.** Neither "A function's parameter may already accept a value deliberately omitted by callers" nor the mentor interpretive-richness observation came up this session.

## Stewardship / Tacit-Knowledge Findings

- **F-series (Efficiency tier): on-disk Scaffold → Wire → file-level Verify in a single session is reliable when the Scoped+Designed handoff is comprehensive.** This session's handoff document (`tech-wiring-fix-handoff.md`) was 435 lines of pre-decided structure — file layout, injection order, parser expectations, drift-detection spec, risk classification table, and four explicit choice points for the founder. The implementation phase was mechanical once the four choice points were answered. Total time from "proceed" to on-disk completion: measured in minutes per file rather than per feature. Worth treating as default for any module of this complexity: **comprehensive Scoped+Designed handoff is a prerequisite, not an overhead.** First clean observation this session; the pattern has held across the support-wiring, ops-wiring, and growth-wiring build cycles too. Not yet explicitly promoted. Candidate for PR8 promotion after one more clean observation.
- **F-series (Efficiency tier): drift detection as a separate harness layer is cheap and high-signal.** The drift-detection step in CHECK 3 of the harness took perhaps 20 lines of code and produces a signal that would otherwise require a human to remember to cross-check `TECHNICAL_STATE.md` against reality. The first-run DRIFT outcome is both the expected result and the proof that the check works. Worth keeping as a pattern for any future "inventory file vs codebase" relationship. Steady-state awareness, not promoted.
- **T-series: "header-describes-itself" documents reduce prompt-engineering drift in the persona.** Both Channel 1 and Channel 2 open their `formatted_context` with a clearly-named header (`LIVE SYSTEM STATE — KNOWN ISSUES` and `ENDPOINT INVENTORY`-equivalent) and a source line. The persona can be instructed to treat those blocks as authoritative without needing prompt text describing them in abstract. First explicit observation of the pattern in this project. Not yet a promotion candidate under PR8.

## Handoff Notes

- **One session, two new context channels, five new/modified files, no live verification yet.** The surface area is small and the boundaries are clean: `case 'tech':` only, two new loaders, one known-issues file, one harness, one decision-log append, one close handoff. Rollback, if it were ever needed, is a four-file revert plus the `hub/route.ts` diff.
- **Drift is the expected first-run outcome on CHECK 3.** This is the single most important piece of context for the founder's Step E run. Drift being reported = harness is working correctly. Drift not being reported on the first run = harness is broken. If in doubt, treat the DRIFT banner as a green flag.
- **The known-issues file is the one operational touchpoint the founder owns day-to-day.** Whenever a live-system issue arises, the expected workflow is: observe the issue → add an entry to `operations/tech-known-issues.md` with the date → commit → Vercel Green → the Tech persona can now answer questions about the issue. When the issue is resolved, move the entry from Current Issues to Recently Resolved. Thirty days later, delete it.
- **Session closes at Wired, not Verified, on purpose.** Verified status is gated on the founder's Step E sequence. This is the cleanest boundary between "in-session work" and "founder-in-the-loop verification" we have. It also keeps the session's stop-point clean and well-defined, in line with the working agreements.
- **Four deferred decisions recorded.** D-Tech-1, D-Tech-2, D-Tech-3, D-Tech-4 each carry an explicit revisit condition. The decision log now documents what we chose not to do this session and what would trigger revisiting, not just what we built.
