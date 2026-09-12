Read `operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md` first, then
CLAUDE.md's session-open reading list in order, then this prompt in full.

# W2 — merge the built record machinery under a waiver, and walk its schema step

**Tier:** founder-walked `code-critical` (a `GUARD_RE` merge under a per-commit waiver, then a
production CHECK-widening migration). Nothing here sets the new flag; activation is a later,
separate step coupled to the S11 flip per the register (§F W3-d).

**What exists already (do not rebuild — verify):**
- The W2 enforcement-class record machinery is BUILT, battery-proven and PR19-reviewed on the git
  branch **`w2-record-honesty`**, whose worktree sits at
  `/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning-w2-worktree` (a sibling of the repo).
  The measured checkout on `main` carries none of its `GUARD_RE` files. Design of record:
  `operations/agent-circles-2026-08/2026-09-12-W2-record-honesty-DESIGN.md`. The build close:
  `operations/handoffs/founder/2026-09-12-W2-record-honesty-build-CLOSE.md` (read it in full —
  it carries the PR19 findings and what was folded).
- The migration is already on `main`:
  `website/supabase-agent-trust-events-enforcement-vocabulary-migration.sql` (21 → 22 event types,
  adds `enforcement-outcome`).
- The record-level compliance-not-virtue clause is STAGED, not applied:
  `operations/agent-circles-2026-08/2026-09-12-W2-compliance-not-virtue-clause-STAGED-R18.md`.

## Step 1 — the waiver and the merge (founder decision first)

1. Re-derive the window state (buffer size, both SHA pins, guard battery) before anything.
2. The founder grants (or refuses) a **per-commit waiver** for the merge commit. Record it in the
   decision-log entry by commit hash. Without it, stop here.
3. Confirm the branch is exactly what the close describes: `git -C <worktree> log --oneline main..w2-record-honesty`
   should show ONE build commit (plus any PR19 fold commits named in the close). `git diff main..w2-record-honesty --stat`
   should list only the twelve files the close names.
4. Re-run in the worktree before merging: `npx tsc --noEmit -p tsconfig.json`; the W2 battery;
   S10, orientation, S9b, S4, trust-core, emission-hooks, stoa suites; guardrail-sandwich.
   Counts must match the close.
5. Merge onto `main` with a fast-forward or a `--no-ff` merge commit (path-scoped is automatic here
   because the branch touches only its own files). **Both SHA pins must be unchanged after the merge**
   (`layer2-mechanisms.ts`, `stoic-brain.ts` — W2 touches neither; verify, don't assume).
6. Run `npm run build` on `main` after the merge (route.ts changed — the standing rule: a route
   change is gated by `next build`, not `tsc`).
7. Remove the worktree: `git worktree remove <path>`; delete the branch only after the merge is
   pushed.
8. The deploy is the founder's push. Flag-off, the guardrail route is byte-identical in behaviour
   (the seam is skipped entirely) — this is stated and pinned, but the founder should still smoke a
   benign and a deny probe after the deploy and confirm no `enforcement-outcome` row appears
   (the flag is unset, so none can).

## Step 2 — the schema walk (migration BEFORE flag, always)

1. TEST project first. Run the migration's §PRE. It expects 0, AND it instructs you to re-derive
   the live constraint with `pg_get_constraintdef` and compare to the 21-value list in the file.
   If the live constraint differs, STOP — a later widening has landed and the file is stale against
   it (the 2026-08-12 Stoa lesson).
2. Apply §A on TEST; run §VERIFY (22 values, last = `enforcement-outcome`); run the commented
   behavioural probe on TEST ONLY, one statement at a time — never paste DDL/DML as a runnable block
   into a live editor (the 2026-08-31 near-miss).
3. Then production: §PRE, §A, §VERIFY. No probe on production.
4. Record: `D-W2-ENFORCEMENT-VOCABULARY-MIGRATION-APPLIED-<date>`. The flag stays UNSET.

## Step 3 — what this session must NOT do

- Do not set `SUBSTRATE_ENFORCEMENT_RECORD_ENABLED` anywhere. Activation is its own step, and the
  register ties it to the flip.
- Do not apply the staged record-level clause to the envelope, ADR-013 §8, llms.txt, agent-card or
  api-docs — that is an R18 sign-off step with its own founder signature.
- Do not build the first-circle event class (the original C1c) or the accreditation-row regime
  column; both are named follow-ons in the design (§3, §6).
- Nothing here licenses building or discussing the S11 flip, or any accreditation write.

## Standing constraints

Path-scoped commits; PR19 already ran on the build (see the close) — a merge needs no second review
unless the merge itself resolves conflicts; re-derive every number you cite from source; date
artifacts from `date`, never the context.
