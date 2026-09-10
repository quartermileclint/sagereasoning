# SESSION PASTE — Cognitive OS: walk the second migration (TEST then production)

**Paste this as the FIRST message of a FRESH session.**

**Open the standing opener first** (`STANDING-SESSION-OPENER-grounded-foundations.md`, most recent
version), then this. **EVERY NUMBER IN THIS FILE IS A CLAIM TO RE-DERIVE, NOT A FACT TO QUOTE** —
the session that authored this migration found its own SECURITY DEFINER cross-check had gone stale
inside the same file it was written into, caught only by an independent review re-running the
command rather than trusting the comment.

---

## 0. Where the prior session left things

**The second Cognitive OS migration is AUTHORED, PR19-reviewed, and its findings FOLDED. NOTHING is
applied to any database. Nothing was pushed.** Full record:
`operations/cognitive-os-2026-09/2026-09-10-SECOND-MIGRATION-AUTHORED-CLOSE.md`. **Read it in
full before doing anything** — §7 is the walk this session runs.

Four new tables: `cognitive_decisions`, `cognitive_handoffs`, `cognitive_dependency_nodes`,
`cognitive_dependency_edges`. All FK into the core slice (already live), and two of them carry a
**composite foreign key** into `cognitive_belief_states`' unique key — this is the load-bearing
property of the whole migration (see the close §1 and §3), and `§PRE` step P2/P3 exist specifically
to check the pre-condition it depends on.

---

## 1. Your task, precisely

Walk `website/supabase-cognitive-os-second-migration.sql`, TEST then production, exactly as its own
`§PRE` / `§APPLY` / `§VERIFY` / `§VERIFY-BEHAVIOURAL` (TEST-only) / `§INVERSE` sections specify.
**The close's §7 is the checklist; the migration file's own comments are the authority on every SQL
statement and expected result.** Read every output. Do not proceed on an unexplained difference.

**Tier: `code-critical`. AC7 ENGAGES.** Full Critical Change Protocol. The founder runs every live
Supabase step; the AI prepares exact SQL blocks (extracted from the file, SHA-checksummed, never
retyped) and confirms each result against the file's own stated expectations.

### Order, inviolable

1. `§PRE` on TEST — read P1–P5. **P1 must be zero rows** (a partial prior application is a different
   situation and must be diagnosed, not overwritten). **P2 must be exactly 4** (the core slice is
   live). **P3 must be exactly 1** (the composite FK target exists).
2. `§APPLY` on TEST.
3. `§VERIFY` V1–V9 on TEST. Read every output. **V3 is a NEGATIVE check** — zero rows is the pass.
4. `§VERIFY-BEHAVIOURAL` B1–B6 on TEST **only**. Destructive; never run on production. **B1** proves
   the composite FK rejects an unpersisted belief-state version (23503) — this is the migration's
   central property, proven rather than assumed. **B2c is EXPECTED TO SUCCEED** — it demonstrates the
   disclosed top-level-only limit of the internal-scalar guard; if it fails instead, stop and read the
   close's §5 finding 1 before proceeding, because the guard has changed shape. **B6** proves the
   cascade. Then teardown, then the count query — **"Success. No rows returned" on the teardown
   DELETE is not evidence of anything**; only the count query that follows it is.
5. Only when TEST is fully green: `§PRE` → `§APPLY` → `§VERIFY` V1–V9 on **production**.
   `§VERIFY-BEHAVIOURAL` is TEST-only — do not run it on production.
6. **The sweep flag (`SUBSTRATE_COGNITIVE_OS_SWEEP_ENABLED`) stays unset** unless you are separately
   deciding to activate it this session — that is its own decision, not implied by this walk. If you
   do activate it, read the close's §5 finding 3 first: the sweep's returned per-table counts can
   under-report real cascade-caused deletions, disclosed in `purgeExpiredCognitive`'s own docstring.
7. **Push is path-scoped to exactly three files**: `website/supabase-cognitive-os-second-migration.sql`,
   `website/src/lib/cognitive-os-store/store.ts`,
   `website/src/lib/cognitive-os-store/__tests__/store.test.ts`, plus this session's own new record
   files. **Check `git status` for peer-session files before committing** — the authoring session's
   own tree carried live, unrelated changes from other peers to `CLAUDE.md`,
   `operations/decision-log.md`, `operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md`,
   and several `condition-3-*` files. None of those are this migration's; do not stage them.

### Post-deploy checks (the pattern from the core slice, adapted)

1. Confirm the four new tables via a Supabase dashboard query or an authenticated
   `GET /api/user/access` — **read `src/app/api/user/access/route.ts` FIRST** to confirm the exact
   response shape before writing any probe. The core slice's own founder smoke failed its first
   attempt for exactly this reason (assumed top-level, actually nested under `personal_data`).
2. Confirm `getCognitiveDataForOwner` returns all eight arrays (contexts, events, claims,
   belief_states, decisions, handoffs, dependency_nodes, dependency_edges), all empty, no `error` key.
3. **Remember rate limits**: `RATE_LIMITS.dataRights` is 5/hour on `/api/user/access` and
   `/api/user/export`. A wasted probe costs one of five.

---

## 2. What NOT to do this session

- **Do not build Phase 2.** The Epistemic Debt service, debt calculation, and the decision-readiness
  gate remain NOT LICENSED. This migration is storage, not the service.
- **Do not instantiate an actor.** Still gated (Q-R2).
- **Do not "fix" the disclosed sweep-counting limit (close §5, finding 3) as part of this walk.**
  It is a named, deliberate disclosure, not an open bug for this session to close. If you want to
  close it, that is its own scoped session (a post-loop reconciliation pass), not a walk-time patch.
- **Do not touch `Q-PREFLIP-REPORTS`, the session-opener `cat >` addition, or the manifest amendment
  owed before Phase 3.** Unchanged, unrelated to this walk.
- **Do not assume a response shape without reading the route source first.**

---

## 3. Practice discipline this session must carry

1. **Re-derive window + baseline health at OPEN and again at CLOSE.** Do not quote the authoring
   session's figures — they are stale by the time you read them.
2. **Run the byte-identity guard at open and after any commit-shaped moment.** Both SHA pins
   (`layer2-mechanisms.ts`, `stoic-brain.ts`) must be unchanged before and after.
3. **`git status` whole, never truncated. `ListAgents` at open.**
4. **Re-run all gates before AND after the founder walk**: `tsc --noEmit`, `npm run build`, the
   Phase-1 battery, the critical scenario, the store battery. All should read identically before and
   after a clean apply (schema changes on an empty table do not change any code-level test result;
   if one DOES change, that is itself worth stopping on).
5. **Never place executable DDL in a runnable code block during a live SQL-editor walk.** Extract
   exact byte ranges from the migration file (`sed -n`), SHA-checksum the extraction.
6. **Disclose the tool-mode effect** in the close, as every prior session in this arc has.

---

## 4. If you hit a conflict

**Route it; do not resolve it.** If any part of this touches a governed surface, a settled
constraint, or a `GUARD_RE` file, stop and flag it. The founder is the decision authority.

**The S11 flip remains REFUSED; weights remain BLOCKED; the 0h call remains the founder's.**
