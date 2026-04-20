# Ops Wiring Follow-Up — New Session Prompt (Two Upstream Fixes)

**Paste everything between the two fences below into a fresh Claude session.**
Keep this file as the canonical record of what the next session was asked to do.

**Note:** This prompt does not prescribe which upstream fix to do first. Two independent fixes are queued and the founder picks the order at session open. Do not bundle them into a single session.

---

```
You are picking up the SageReasoning build. Follow the project instructions and the manifest.

**First action, before anything else:**

Read `operations/handoffs/ops-wiring-fix-close.md` end to end. That close
handoff documents:
  (1) The completed Ops Channel 1 + Channel 2 wiring (40/40 harness pass,
      Vercel Green, live probe outcome).
  (2) Two upstream issues surfaced at live probe:
      - Supabase: `cost_health_snapshots` table missing from production.
      - Vercel: `process.cwd()` resolves to `website/`, not repo root
        (third observation across Tech, Growth, Ops).
  (3) Seven drafted decision-log entries (D-Ops-0 through D-Ops-6)
      pending founder approval.
  (4) Four proposed knowledge-gap register updates pending founder
      approval — including a PR5/PR8 promotion of KG1 (Vercel
      serverless execution model) at its third recurrence.

Then scan `operations/knowledge-gaps.md` for entries relevant to:
  (a) Next.js / Vercel serverless runtime path resolution (KG1, likely
      third recurrence — confirm current status).
  (b) Supabase migrations in production.
  (c) The Critical Change Protocol (0c-ii) application to schema changes.
Read any relevant entries before acting.

Also read `operations/handoffs/context-loader-stub-fix-prompt.md` in
full. That prompt was written after Tech and Growth and is already
scoped for four loaders. If the founder chooses the Vercel fix first,
you will expand that prompt's scope by one loader (Ops Channel 2) and
run it.

---

## Two queued upstream fixes — founder picks the order

This session has two independent follow-up tasks. Both were surfaced
at the Ops live probe on 20 April 2026. Neither is urgent — the
stub-fallback discipline is holding in production and the Ops persona
discloses honestly on every reply. The founder chooses which to tackle
first; do not do both in the same session.

---

### Track A — Vercel path-resolution fix (Elevated, unblocks 5 loaders)

**Scope:** Extend `operations/handoffs/context-loader-stub-fix-prompt.md`
to cover Ops Channel 2 (one additional loader) and then run it. The
existing prompt is already scoped for Tech C1 + C2 and Growth C1 + C2.
Adding Ops `ops-continuity-state.ts` brings the total to five
file-based loaders in a single fix pass.

**What to change in `context-loader-stub-fix-prompt.md` at session
open:**
  - In §"Current state", add a new block for the Ops session naming
    `website/src/lib/context/ops-continuity-state.ts` and noting that
    the five sources inside it (handoffs, decision log, knowledge
    gaps, compliance register, D-register) all ENOENT on Vercel
    runtime via the same `process.cwd()` failure mode.
  - In §"In scope", add Ops C2 to the loaders list. Note that Ops
    Channel 1 is NOT in scope for this track — Channel 1 is a
    Supabase-read-path loader, not a filesystem loader, and its
    failure mode is different (track B).
  - In §"Files that will be touched", add
    `website/src/lib/context/ops-continuity-state.ts` to the
    modify list.

**Risk classification under 0d-ii: Elevated.** Touches deployment
configuration (`next.config.js` `outputFileTracingIncludes`, or the
loader path construction, or file moves into `website/`). Apply the
standard Elevated protocol: name what could break, provide a rollback
path, founder approval before deploy, verification step.

**Fix family (from prior diagnosis):** Three options — path-fix (parent-
directory traversal), file-move (copy source files under `website/`),
or `outputFileTracingIncludes` (Next.js bundler plumbing). The
diagnostic step in the prompt determines the cheapest correct fix.

**KG1 promotion:** At third recurrence, KG1 (Vercel serverless
execution model) promotes under PR5 and PR8. If the founder approves
the proposed knowledge-gap updates in the Ops close (§"Knowledge-Gap
Register Updates — Proposed"), KG1 graduates from a knowledge-gap note
to a full resolution entry when this track completes. Plan the
register update at session close.

**Unblocks:**
  - Ops Channel 2 → Verified.
  - Tech Channels 1 + 2 → Verified.
  - Growth Channels 1 + 2 → Verified.

**Does NOT unblock:**
  - Ops Channel 1 (Supabase read path — that is Track B).

---

### Track B — `cost_health_snapshots` migration to production Supabase (Critical, unblocks 1 loader)

**Scope:** Apply the Supabase migration that creates the
`cost_health_snapshots` table in production. Likely source:
`api/migrations/stripe-billing-schema.sql` — confirm path and
contents at session open before doing anything else.

**Risk classification under 0d-ii: Critical.** Changes to deployment
configuration (schema migration to the live Supabase instance). PR6
does not apply (no safety-critical function touched) but the full
Critical Change Protocol (0c-ii) DOES apply:

  1. **What is changing** — plain language, no jargon. What this does
     from the founder's perspective.
  2. **What could break** — the specific worst case. For schema
     changes: "If the migration has side effects on existing tables,
     data could be affected. Confirm the migration is additive-only
     and names no DROP / ALTER on existing tables."
  3. **What happens to existing sessions** — does this affect users
     who are currently signed in? Does it invalidate stored sessions?
     For an additive migration with no impact on existing tables, the
     answer should be "no existing data or sessions affected."
  4. **Rollback plan** — exact SQL to revert. For a CREATE TABLE of
     a never-populated table, rollback is `DROP TABLE IF EXISTS
     public.cost_health_snapshots CASCADE;` — name this explicitly.
     Must be something the founder can run independently.
  5. **Verification step** — after migration, what the founder checks.
     Open Supabase dashboard → Table Editor → confirm
     `cost_health_snapshots` appears. Then run a live probe against
     the Ops persona on `/founder-hub` with the Channel 1 diagnostic
     message (see Ops close §Verification).
  6. **Explicit approval** — founder says "OK" or "go ahead." Critical
     changes require specific approval to the named risks.

Do not proceed to the SQL editor until all six steps are visible in the
conversation and the founder has given explicit approval.

**If the migration source turns out to include DROP / ALTER / RLS
changes on existing tables, STOP.** That is a second-order Critical
change that must be reviewed and scoped in its own step. Do not execute.

**Unblocks:**
  - Ops Channel 1 → Verified (once table exists and the first snapshot
    row lands).

**Does NOT unblock:**
  - Ops Channel 2 (filesystem read path — that is Track A).

**Caveat:** An empty `cost_health_snapshots` table does not produce a
live reading on its own. Channel 1's stub will still fire with a
"snapshot row not found" disclosure until the first snapshot is
written. This is expected and correct. A separate question — what job
writes snapshots, and on what schedule — is outside the scope of this
track and should be logged for a future session if not already queued.

---

### Recommendation (not prescription)

Run Track A first. Reasoning:
  - Track A is Elevated; Track B is Critical. Running the lower-risk
    fix first keeps blast-radius bounded while the pattern is still
    familiar.
  - Track A unblocks four loaders across three personas (Tech C1+C2,
    Growth C1+C2, Ops C2). Track B unblocks one loader (Ops C1).
  - Track A has an existing queued prompt (`context-loader-stub-fix-
    prompt.md`) and a diagnosed fix family. Track B has neither — the
    Critical Change Protocol applies fresh.
  - Track A promotes KG1 under PR5 and PR8 at third recurrence, which
    is a governance milestone worth completing before opening a new
    Critical change.

If founder prefers Track B first — accept the decision, apply 0c-ii
from a clean slate, do not re-argue.

---

## Step-by-step (independent of which track is chosen)

**Step 1 — Load context.** Read the Ops close handoff, the
context-loader-stub-fix-prompt, and any KG entries flagged by the PR5
scan. Confirm the current state of production (has anything moved
since 20 April 2026?).

**Step 2 — Founder approval for pending decision-log appends (one-time).**
Before any track runs, offer the founder the drafted D-Ops-0 through
D-Ops-6 entries from the Ops close as a single copy-paste block. These
are non-urgent but should not drift further. Paste, amend and paste,
or skip — founder's call.

**Step 3 — Founder approval for pending knowledge-gap register
updates (one-time).** Same discipline: present the four proposed
updates from the Ops close as a single copy-paste block. The KG1
promotion specifically should be applied before or after Track A
completes, not during.

**Step 4 — Announce which track.** Founder names Track A or Track B.
Announce the risk classification under 0d-ii (Track A = Elevated;
Track B = Critical). Wait for explicit "proceed" before acting.

**Step 5 — Execute.**
  - **If Track A:** follow `context-loader-stub-fix-prompt.md` with
    the expanded scope. Diagnostic first (the prompt specifies a
    temporary debug endpoint or a one-shot console log to capture
    `process.cwd()`, `__dirname`, and `fs.access()` on all five
    expected source paths). Choose fix family based on diagnostic
    output. Implement. Deploy. Re-run all three harnesses (Tech,
    Growth, Ops — ops-wiring-verification.mjs). Re-run live probes
    at `/founder-hub` against Tech, Growth, and Ops personas. Confirm
    replies now cite actual source-file content.
  - **If Track B:** follow the Critical Change Protocol verbatim.
    Read the migration SQL in full. Name what it does, what could
    break, rollback command. Get explicit approval. Apply via
    Supabase SQL editor. Re-run Ops live probe. Confirm Channel 1
    returns a "snapshot row not found" disclosure (expected — table
    exists, no data yet) rather than the "table not in schema cache"
    error (previous state).

**Step 6 — Status update.** Record the new 0a status for each loader
affected. Track A takes Ops C2 from "Wired-but-stub-on-Vercel" to
"Verified" (and Tech C1+C2, Growth C1+C2 similarly). Track B takes
Ops C1 from "Wired-but-stub-on-production" to "Wired-with-empty-table"
(or to Verified if the first snapshot has been written).

**Step 7 — Close the session.** Produce:
  - `operations/handoffs/context-loader-stub-fix-close.md` (Track A)
    or `operations/handoffs/cost-health-migration-close.md` (Track B).
  - Any new decision-log entries drafted for founder approval.
  - Any new knowledge-gap register updates drafted for founder
    approval. If KG1 was promoted at Track A close, record it
    explicitly.
  - Next-session prompt if more follow-up is queued.

---

## Working agreements

- Founder has zero coding experience. Use plain language. Exact paths,
  exact commands, exact copy-paste text. "Vercel Green" is the type-check
  — say "push and wait for Vercel Green", not "type-check on your side".
- Founder decides scope. If the diagnostic in Track A reveals a
  different pattern than the three-option fix family, stop and
  re-scope — do not rationalise the original design.
- Classify every code change under 0d-ii before execution. State the
  risk level, name rollback, get approval before deploy.
- For Track B, the full Critical Change Protocol (0c-ii) runs visibly
  in the conversation before any SQL is executed. No shortcuts.
- Deferred decisions go in the decision log with reasoning (PR7). Do
  not drop them silently.
- Manual verification method per work type (0c) — founder verifies by
  running the harness and reading its printed output, plus live probes
  against the affected personas, not by reading TypeScript.
- Never edit `operations/decision-log.md`, `operations/knowledge-gaps.md`,
  or any governing document without explicit approval. Draft in the
  close handoff; let the founder paste.
- If founder signals "I'm done for now" or similar, stabilise to
  known-good state and close. Do not propose additional fixes.
- If either track's execution reveals a third upstream issue not
  anticipated at session open, log it and stop — do not expand scope.

---

## Scope (bounded)

**In scope for Track A:**
- Five file-based context loaders (Tech C1+C2, Growth C1+C2, Ops C2).
- The chosen fix family across `next.config.js`, loader path
  construction, or file moves — whichever the diagnostic selects.
- Re-running all three harnesses and three live probes at
  `/founder-hub`.
- KG1 promotion at close (if founder approved the proposed KG update
  from Ops close).

**In scope for Track B:**
- One Supabase migration: create `cost_health_snapshots` table.
- Critical Change Protocol runbook visible in the conversation.
- Live probe against Ops persona to confirm Channel 1 advances from
  "table missing" to "table present, no data yet."

**Out of scope for both tracks — do not expand:**
- Any change to `ops-brain-loader.ts`, `ops-brain-compiled.ts`, or
  any `sage-mentor/` file.
- Any RLS change on `cost_health_snapshots` or any other table.
- Any change to the snapshot-writer job schedule, frequency, or
  content (separate follow-up session).
- Any per-endpoint concentration instrumentation (D-Ops-1 / D-Ops-2
  deferral holds).
- Any runway-field schema change (D-Ops-6 deferral holds).
- Any `runSageReason` or `sage-reason-engine.ts` change.
- Any auth / session / cookie change (AC7 / PR1 standing-Critical
  surface — if one appears, stop and apply 0c-ii fresh).
- Any change to the distress classifier, Zone 2 classification, Zone 3
  redirection, or their wrappers (PR6 — always Critical).
- Reconciliation of `operations/handoffs/` vs
  `operations/session-handoffs/` directory duplication (flagged for
  its own session).
- Extending the chat-persona wiring pattern to the mentor persona
  (D-Ops-5 — different architecture).

If something else appears that seems like it should change, flag it
with "I'd push back on this" or "this is a limitation" — do not
silently expand the work.

---

## Risk classification — apply 0d-ii at session open

- Loading context and reading handoffs: **Standard** (read-only).
- Founder approval passes for decision log / KG register: **Standard**
  (drafting text for founder paste).
- **Track A diagnostic step:** Standard (read-only probe or
  console.log).
- **Track A fix implementation:** Elevated (deployment configuration
  or file-path changes).
- **Track B migration execution:** Critical (schema change to live
  Supabase).
- Any 0a status update at close: Standard.

Classification is set by the AI before execution. Founder can
reclassify upward at any time per 0d-ii. The Critical Change Protocol
(0c-ii) runs for Track B regardless of the AI's initial framing.

---

## Success for this session

- Founder chose Track A or Track B explicitly.
- Risk classification acknowledged and founder gave explicit
  "proceed" before each irreversible step.
- The chosen track completed cleanly:
    - **Track A:** five loaders return live source-file content on
      Vercel. All three harnesses GREEN. Live probes at
      `/founder-hub` against Tech, Growth, Ops personas cite actual
      source content, not stub disclosures.
    - **Track B:** `cost_health_snapshots` table exists in production
      Supabase. Ops Channel 1 stub disclosure changes from
      "table not in schema cache" to "snapshot row not found"
      (correct interim state).
- Close handoff written in the established format.
- Any new decisions drafted for founder paste (PR7).
- Any new knowledge-gap updates drafted for founder paste (PR5 /
  PR8).
- Status vocabulary updated: affected loaders move to Verified (Track
  A) or to Wired-with-empty-table (Track B).

If the chosen track cannot be completed cleanly in one session, say so
clearly, stabilise to known-good, and close. Do not iterate under time
pressure.

If the diagnostic in Track A reveals the fix is larger than the three
known options, do not press on with a guess. Document the finding and
close for re-scoping.

If the migration SQL in Track B contains unexpected content (DROP /
ALTER / RLS), do not execute. Document and close.

If the session ends early with capacity remaining, ask the founder
whether to continue with the other track or close. Do not prescribe
additional work.
```

---

## Notes for the human reading this file

- This prompt does not carry forward the Ops channel design — that
  work is done. Both channels are Wired. The only remaining work to
  reach Verified is the two upstream fixes.
- Track A is the natural extension of the context-loader-stub-fix
  work that was queued at the Tech and Growth sessions. The prompt
  for that is at `operations/handoffs/context-loader-stub-fix-prompt.md`
  and it is already written — this prompt simply tells the next
  session to expand its scope by one loader before running it.
- Track B is the first time in this build that the Critical Change
  Protocol has been applied to a Supabase schema migration. If the
  founder takes Track B first, expect the session to feel slower than
  Track A — the Critical Change Protocol is deliberate by design.
- The two tracks are independent. Completing one does not unblock the
  other. The Ops persona will still be partially-degraded after
  either track runs alone; only both tracks complete take Ops Channel 1
  and Channel 2 both to Verified.
- If the founder never comes back to Track B (for whatever reason),
  that is a clean outcome — the Ops Channel 1 stub disclosure is an
  honest steady-state that does not mislead the persona. The cost-
  threshold reading simply never lights up. The value-add of Channel
  1 only arrives when both Track B and the snapshot-writer job are
  running.
- The D-Ops-0 through D-Ops-6 entries drafted in the Ops close should
  be pasted into the decision log before this session starts the
  chosen track — otherwise the governance chain is incomplete. Same
  for the KG register updates. Step 2 and Step 3 are there for that
  reason.
