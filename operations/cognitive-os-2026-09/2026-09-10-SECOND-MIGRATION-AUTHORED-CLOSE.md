# Cognitive OS — the SECOND MIGRATION: authored, PR19-reviewed, folded, FOUNDER-WALKED, LIVE.

**Session date: 2026-09-10 AEST**, dated from `date`.

**UPDATE (same day, post-close): FOUNDER-WALKED ON BOTH ENVIRONMENTS, COMMITTED, PUSHED, DEPLOYED,
AND LIVE-VERIFIED.** The founder ran the full `§PRE`/`§APPLY`/`§VERIFY` (V1–V9) sequence on TEST,
then all six `§VERIFY-BEHAVIOURAL` probes (B1–B6, TEST-only, destructive) — every result read and
confirmed, including B1 (the composite FK's 23503 rejection) and B2c (the JSONB guard's disclosed
top-level-only limit, proven by a SUCCEEDING insert as designed) — then teardown, confirmed by
count query rather than by the DELETE's own "Success" message. The identical
`§PRE`/`§APPLY`/`§VERIFY` sequence then ran on **production** (P5 = 113 tables before; V9 = 117
after, matching exactly).

**⚠ CORRECTION — Commit `75b35a9` was NOT path-scoped to this session's five files, contrary to
what this record first said here.** `git show --stat 75b35a9` shows **18 files**, not 5. The
original wording ("path-scoped… confirmed by `git log` against the pushed tip") checked the wrong
thing — that this session's five files were present and correctly named — without checking that
*only* those five were present. They were not.

**What actually happened, mechanically.** The local pre-commit guard (the same byte-identity
battery this session ran throughout) correctly BLOCKED the first commit attempt, because a **peer
session's** own work — substantive, functional changes to `classifyCaller`'s signature, a new
`readClientContext` export, and matching edits across `at-action-hook.mjs`,
`false-hold-capture.mjs` + its test, `negative-battery.mjs`, and `false-hold-observation-report.ts`
+ its test — was **already staged** in the shared working tree at that moment (visible in `git
status --porcelain` as `M `/`A ` entries before this session touched anything). This session ran
`git add <its own five paths>`, which correctly *added* those five to the index — but `git add`
only adds; it does not restrict what a subsequent bare `git commit` includes. The retry (run after
the peer's side resolved whatever was blocking the guard) was a **bare `git commit -F <message>`
with no pathspec**, which committed the *entire index* — this session's five files plus the peer's
thirteen, none of the latter mentioned anywhere in the commit message. **The fix that would have
prevented this was `git commit -- <five explicit paths>`, which restricts a commit to named paths
regardless of what else sits staged; that was never used.** Pushed; Vercel confirmed green by the
founder; the post-push byte-identity guard re-run **250/0** (it checks the working tree and two
fixed SHA pins, neither of which this incident touches — it cannot see that a functional edit to
`GUARD_RE`-matched files already landed in history without a recorded waiver cited anywhere in the
commit that carried it).

**Disposition, per the founder (2026-09-10, same day):** the founder confirmed directly with the
peer session that its inclusion reflects real, intended work on its own track (the caller-class /
Q-CALLER-C3 line), and directed that session to record the fact in its own close and continue from
there. **This record does not characterise that work's licensing status** — it has no visibility
into that session's own governance record — and defers entirely to whatever that session's own
close states. What this record states with certainty, from its own side: the harness files listed
above genuinely changed, functionally, inside a commit this session made, during an active
false-hold observation window, without any waiver citation in the commit this session authored.
**Any session that next assesses the observation window's integrity needs to know this** — a
functional change to `classifyCaller`/`false-hold-capture.mjs` landed mid-window via `75b35a9`,
and whether that changes what the window measures going forward is a question for whoever owns
that assessment, not settled by this correction.

**Standing lesson, recorded because it will recur in any multi-agent-shared-checkout commit:**
staging one's own files with `git add <paths>` proves nothing about what a subsequent bare `git
commit` will contain if anything else is already staged. **Verify the commit's actual scope
(`git show --stat <sha>` or `git diff --cached --stat` before committing), never just that your
own files are present in it — check that nothing else is.** `git commit -- <paths>` restricts a
commit to named paths and leaves everything else staged for its own commit; a bare `git commit`
does not.

**Post-deploy live-verified, R17 read path, `GET /api/user/access`:** all eight
`personal_data.cognitive_os` arrays present and empty — `contexts, events, claims, belief_states,
decisions, handoffs, dependency_nodes, dependency_edges` — confirmed against the actual deployed
build, not merely the local one, the same discipline the core slice's own post-deploy check used.
A useful intermediate observation on the way there: immediately after the DB migration landed on
production but *before* the code was pushed, the identical probe correctly returned only the
original four arrays — the deployed application code lagging the applied schema by design, and a
concrete illustration of why "the schema is live" and "the code that reads it is live" are two
separate, sequenced claims, never conflated.

**Production is now genuinely at the state this record's body describes below** — read the rest of
this file as the as-applied build report, not as a plan.

---

**Tier: `code-critical`. AC7 ENGAGED AND DISCHARGED** at the founder walk described above — full
Critical Change Protocol; the founder ran every live Supabase step and the push; the AI prepared
exact SQL blocks (extracted from the file, SHA-checksummed, never retyped) and confirmed each
result against the file's own stated expectations.

---

## 0. What this session did, in one paragraph

Read the deferred set fresh from the library (per §3 of the handoff prompt), found it is four
tables not three (`dependency-graph.ts` has nodes AND edges), found a second open-ended JSONB
container the prior reconciliation had not named (`DecisionRecord.stoic_evaluation`), took three
founder elections, authored the migration and extended the store and battery to match, ran an
independent PR19 review (sonnet, low effort, worktree-isolated, founder-authorized model drop for
adversarial passes), verified and folded all three of its findings, and re-ran every gate green.
**Nothing was applied. Nothing was pushed.**

---

## 1. What was inspected, and what it changed about the plan

The handoff prompt named three deferred shapes: decisions, handoffs, the dependency graph. Reading
`dependency-graph.ts` fresh found `DependencyNode` and `DependencyEdge` are two separate persisted
things, not one — `addEdge()` **throws** on an unknown endpoint ("a dependency on an unknown node
would make impact analysis silently incomplete, which is the failure mode this whole component
exists to prevent"), which is a foreign-key relationship, not a convention. So the migration has
**four tables**, not three.

Reading `handoff-envelope.ts` and `belief-revision.ts` together found a **second** open-ended JSONB
container beyond the one the R9/R10 reconciliation's §5.6(i) named
(`HandoffEnvelope.payload`): `DecisionRecord.stoic_evaluation` is the identical
`Readonly<Record<string, unknown>>` shape, and both bypass the store battery's `§7` column-name pin
identically, since a score nested inside a JSONB document is invisible to a check that reads column
names.

Reading `cognitive_belief_states`' own migrated shape (already live) found it is **versioned**
(`UNIQUE (context_id, belief_state_id, version)`), which is the fact that makes the no-score-column
rule genuinely satisfiable here rather than merely aspirational: both `DecisionRecord` and
`HandoffEnvelope` carry `belief_state_id` + `belief_state_version`, joining exactly to that key.

---

## 2. The three founder elections (2026-09-10)

| Question | Election |
|---|---|
| Debt-score recovery | **Composite FOREIGN KEY** `(context_id, belief_state_id, belief_state_version)` → `cognitive_belief_states`' unique key, `ON DELETE CASCADE`. A decision/handoff whose score could not be re-derived is UNSTORABLE, not silently score-less. Cost, stated: writers must persist the belief-state version first. |
| The two JSONB containers (`payload`, `stoic_evaluation`) | **Persist both, with a top-level-only CHECK**, and NARROW §5.6(i) rather than close it. A CHECK cannot contain an aggregate, so the deep case is closed at the store write boundary instead, by reusing the library's existing `scanForEgress`. |
| Migration scope | **One migration, four tables** — same size as the core slice, one founder walk. |

---

## 3. What was built

**Authored, not applied:** `website/supabase-cognitive-os-second-migration.sql` — four tables
(`cognitive_decisions`, `cognitive_handoffs`, `cognitive_dependency_nodes`,
`cognitive_dependency_edges`) in the project's `§PRE` / `§APPLY` / `§VERIFY` / `§VERIFY-BEHAVIOURAL`
(TEST-only, destructive) / `§INVERSE` form. Additive, idempotent, reversible.

**Rulings encoded structurally:**

| Ruling | How the schema enforces it |
|---|---|
| Q9 / Q-R7 — no score column | No `epistemic_debt_score` anywhere; recovered via the composite FK. |
| C6 / Q8 — unmeasured must not read as measured | No `identity_state_id` / `identity_coherence_score` / `adversarial_test_results`; OMITTED, not null-filled. |
| No stored decision status | `deriveDecisionStatus` reads the event log; `cognitive_events` already persists `decision_id`, so the derivation survives persistence with nothing added here. |
| C7 / Q10 — no score in the dependency graph | Neither node nor edge table carries any scalar; routing figures stay derived from structure on demand. |
| `addEdge()` throws on an unknown endpoint | Both edge endpoints are FOREIGN KEYs into the node table; storage cannot hold a graph the library would refuse to build. |
| `supersedes` needs no FK, and every ON DELETE action is wrong for it | Plain indexed column, deliberately not an FK — SET NULL in particular would silently derive a SUPERSEDED decision as COMMITTED. |
| The two JSONB containers | A new plain, IMMUTABLE, NOT SECURITY DEFINER function (`cognitive_os_jsonb_has_internal_scalar`) CHECKs both at the top level; the deep case closed at the write boundary (see §4 below, and the PR19 fold in §5). |
| 2026-08-16 RLS lessons | RLS enabled, ZERO policies, explicit REVOKE + GRANT, on all four tables. |

**Code:** `website/src/lib/cognitive-os-store/store.ts` — `CHILD_TABLES` extended to seven with a
load-bearing ordering comment (decisions/handoffs before belief_states; edges before nodes, so a
cascade never zeroes a count that should have been reported); `CognitiveExport` and
`CognitiveDeletion` both widened to eight fields; the prior `else`-fallthrough in `deleteContext`
(which would have mis-attributed four of seven tables to `belief_states`) replaced with an explicit
`DELETION_FIELD` map that fails loudly on an unmapped table rather than under-reporting silently;
`purgeExpiredCognitive`'s return shape widened to match; a new `assertNoInternalScalarAtRest`
(reusing `permissions.ts`'s `scanForEgress`, PR15) for the deep JSONB case.

**Battery:** `website/src/lib/cognitive-os-store/__tests__/store.test.ts` — new `§13` (17 sub-pins,
`§13.0`–`§13.16`), `§1.13f` strengthened (comment-stripped rather than filename-allowlisted, so it
cannot be defeated by a growing exclusion list), `§6.9` replaced (a bare table-count pin, which
would have silently discharged by bumping a number, replaced with the ordering pins that state and
prove WHY the order matters). **269/0.**

---

## 4. A vacuous pin caught by its own mutation test, mid-session, before any review

`§13.14c` originally checked for the literal string `else states = r.deleted` — the exact text of
the fall-through this session's own edit had already renamed to `tally`. A mutation reintroducing the
same defect under the new variable name (`else tally.belief_states = r.deleted`) passed the pin
silently. Caught by running the mutation myself, before PR19 saw the file: the pin was rewritten to
check the PROPERTY (no bare `else` assignment of any shape inside `deleteContext`; the assignment
goes THROUGH `DELETION_FIELD[table]`) rather than a specific string, then re-mutated and confirmed
RED. Two other load-bearing pins (`§13.4`, the composite FK; `§13.2`, the score-column check) were
also mutation-tested this way before review, both proven RED-then-restored, SHA-verified.

---

## 5. PR19 independent review — three dimensions, `sonnet`, low effort, worktree-isolated

Run per the founder's standing permission to drop the review tier for adversarial passes and return
it afterward. **Cap: 10 findings per dimension. Did not bind in any dimension** — the reviewer
reported 3 confirmed findings total (well under 10×3) and stated explicitly it had reported
exhaustively.

**3 findings; 3 confirmed; 3 folded; 0 refuted.** Every one verified first-hand against source
before folding — not taken on the reviewer's word.

| # | Sev | Finding | Verified how | Fold |
|---|---|---|---|---|
| 1 | **HIGH** | The migration header's "THE DEEP CASE IS CLOSED AT THE WRITE BOUNDARY" claim overstated the present state — `store.ts` has no insert function anywhere, so `assertNoInternalScalarAtRest` is correct but genuinely unwired. | `grep -rn "assertNoInternalScalarAtRest" src/` confirmed zero callers outside the battery; `grep -n "\.insert(" store.ts` confirmed zero writes anywhere in the file. | Both the migration header and `store.ts`'s own docstring reworded to present tense — correct, staged, but not yet enforcing anything, because there is no writer to enforce it against. |
| 2 | **MEDIUM** | The migration's SECURITY DEFINER cross-check quoted "25 hits across 13 files... the third command returns only the core migration itself" — a claim that does not reproduce against the finished file. | Re-ran the exact three commands from repo root: **33 hits / 14 files**; command 3 returns **both** migration files, not one — confirmed exactly. Root cause: the numbers were computed BEFORE this file existed and never re-derived after the file grew around them. | Header rewritten with the corrected, reproducing figures, and an honest explanation of why BOTH migration files legitimately match a raw grep (each discusses SECURITY DEFINER in its own prose) — with the real enforcement pointed at the battery's comment-stripped check, which correctly returns zero real definitions on both files. |
| 3 | **MEDIUM** | `purgeExpiredCognitive`'s per-table counts can under-report: a belief-state row expiring later in the same sweep pass can cascade-delete a decision/handoff row whose OWN `retain_until` had not yet passed, and that row was already visited (and read as zero) earlier in the loop. | Re-read the full function; confirmed the count-then-delete-then-recount discipline is per-table-at-time-of-visit, with no post-loop reconciliation pass. Real, not speculative. | Disclosed in the function's own docstring — retention IS enforced correctly (nothing expired survives), but the returned breakdown can be strictly less than what was actually removed. Not restructured to close it (would need a second post-loop pass, out of scope for a disclosure fold); named as a deliberate limit, not silently accepted or half-fixed. |

This is worth stating plainly: **this session's own first attempt at the SECURITY DEFINER
cross-check reproduced the exact class of defect it was written to prevent** — a verification claim
in a comment, quoted rather than re-run, going stale as the file it described kept changing under
it. PR19 caught it. The corrected header now explains why, rather than just fixing the number.

---

## 6. Verification — run, not quoted, before AND after the PR19 fold

| Gate | Before fold | After fold |
|---|---|---|
| Store battery (new §13 + amended §1.13f/§6.9) | 269/0 | **269/0** |
| Cognitive OS battery (Phase 1, untouched) | 149/0 | **149/0** |
| Critical scenario | 30/0 | **30/0** |
| Byte-identity guard | 250/0 | **250/0** |
| `tsc --noEmit` | 0 | **0** |
| `npm run build` | exit 0 | **exit 0** |
| `layer2-mechanisms.ts` SHA pin | `60cefedb…` | **unchanged** |
| `stoic-brain.ts` SHA pin | `fa8895ec…` | **unchanged** |
| SECURITY DEFINER sweep, re-run from repo root | — | **33 hits / 14 files; both cognitive-os migration files match the raw grep for prose reasons; zero real SECURITY DEFINER functions on any cognitive_ table (comment-stripped check)** |

**Mutation verification, this session's own build:** 3 load-bearing pins proven RED-then-restored
(`§13.4` composite FK, `§13.2` score column, `§13.14c` deletion fall-through — the last one caught
vacuous by its own mutation test and fixed before it ever reached PR19). Every SHA-checked restore
confirmed clean.

---

## 7. ⛔ THE FOUNDER WALK — NOT YET RUN

**Nothing below has been done. The AI performs none of it.**

**Pre-condition, checked and green:** the core slice (`cognitive_contexts`, `cognitive_events`,
`cognitive_claims`, `cognitive_belief_states`) must already be live on the target environment — this
migration FKs into it. §PRE steps P2 and P3 check this explicitly and STOP if it is not so.

**Standing correction, binding here as it was for the core slice:** *never place executable DDL in a
runnable code block during a live SQL-editor walk.* This close deliberately contains no runnable SQL.
Every statement lives in the migration file's own sections; run them from there.

1. **`§PRE` on TEST.** Read all five outputs (P1–P5). **P1 must return ZERO rows.** **P2 must return
   exactly 4 rows** (the core slice) — if fewer, STOP. **P3 must return exactly 1 row** (the
   composite FK target exists as a unique constraint) — if zero, the core migration was applied in a
   modified form; STOP.
2. **`§APPLY` on TEST.**
3. **`§VERIFY` V1–V9 on TEST.** Read every output. **V3 is a negative check** (zero rows is the
   pass, per the core slice's own corrected convention). **V8 is a count you should independently
   re-derive if it surprises you** — the comment explains exactly why it counts constraint rows, not
   allowed values, and why `cognitive_dependency_edges` correctly returns NO row.
4. **`§VERIFY-BEHAVIOURAL` B1–B6 on TEST ONLY** — six behavioural probes. **B1 is the load-bearing
   one**: it proves the composite FK actually rejects an unpersisted belief-state version (23503).
   **B2c is expected to SUCCEED** — it proves the disclosed top-level-only limit rather than merely
   stating it; if it ever fails, the guard function has been widened to recurse and the header comment
   describing the limit is now stale. **B6 proves the cascade** rather than assuming it. Then the
   teardown, and confirm the count query — **"Success. No rows returned" is NOT evidence on a
   DELETE.**
5. **Only when TEST is fully green: `§PRE` → `§APPLY` → `§VERIFY` V1–V9 on production.**
   `§VERIFY-BEHAVIOURAL` is destructive and TEST-only; do not run it on production.
6. **Retention.** These four tables are swept by the EXISTING sweep, behind the EXISTING
   `SUBSTRATE_COGNITIVE_OS_SWEEP_ENABLED` flag (still unset). No third flag was added — reasoning
   stated in the migration header. **Read §5 above before trusting the sweep's returned counts under
   real cascade conditions** (the disclosed limit).
7. **Push is yours.** The commit must be path-scoped: at this writing the tree also carries
   peer-session changes to `CLAUDE.md`, `operations/decision-log.md`,
   `operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md`,
   `website/src/data/environmental-context.json`, and several
   `operations/trust-layer-2026-07/2026-09-1*-condition-3-*` files — **none of these were touched by
   this session and none should be in this session's commit.** This session's own files are exactly
   three: `website/supabase-cognitive-os-second-migration.sql`,
   `website/src/lib/cognitive-os-store/store.ts`,
   `website/src/lib/cognitive-os-store/__tests__/store.test.ts`.

**Rollback:** `§INVERSE` (children before their parents, function last). Safe while the four new
tables are empty and inert; after real data exists it destroys that data, a deliberate act needing
its own decision. The core slice is untouched by `§INVERSE` — it drops only the four new tables.

---

## 8. Practice discipline

**Window re-derived at open and at close, first-hand, never quoted.**

| | Open | Close |
|---|---|---|
| Buffer | 399 | **re-derive at your own close; not re-checked in this record after the PR19 fold, since no further consult/guard-relevant work followed it** |
| Window population | 260 (219 guard + 41 consult) | — |
| Consult-bearing days | 4 of 5 (09-06 ·3, 09-07 ·17, 09-08 ·6, 09-09 ·15) | — |

**TOOL-MODE DISCLOSURE (standing obligation).** Mixed: **Write** for the migration file (long,
`$$`-quoted SQL, best authored directly rather than heredoc-escaped); **Bash with Python heredocs**
for every mechanical edit to `store.ts`/`store.test.ts` (anchored, asserted-count-of-one per
replacement, per the recorded shell-escaping and `git commit -m` nested-quote hazards) and for
every gate run. The effect is disclosed, not sought.

**Guard behaviour observed, grounds read each time rather than classified by habit:** every `cat >`
/ Python-heredoc Bash call drew CAUTION with *"no kathekon factors were extracted"* — the measured
sparse-extraction false-positive class, correctly identified as such by reading each caution's stated
grounds rather than the session's running pattern. One at-action examination returned
**UNAVAILABLE** (*"timeout after 55000ms"*) — an outage, not a deny; the write proceeded deliberately
with the frame absent, recorded honestly rather than silently retried.

**A genuine gap in this discipline, found at the close-hook's own prompting, not self-initiated:**
the `rm -rf` used to remove a stray scratchpad directory (created by this session's own UUID typo
while writing the battery's §13 block) did not receive the same individual read-the-grounds scrutiny
as the Python-heredoc cautions — it was let ride on the pattern the other cautions had established,
when a command on the guard's own irreversible-action allowlist is categorically different from the
sparse-extraction class and needed its own read. The deletion itself was safe (verified via `find`
that the directory held only the stray file before removing it), but that is not the same as having
engaged with the signal at the time. Recorded as a standing lesson for future sessions: a caution on
an allowlisted irreversible-action command needs its own read every time, never inherited from a
run of prior cautions reading the same other way.

---

## 9. Carried forward

1. ~~The founder walk (§7)~~ — **DONE, same day.** Both migrations are live on TEST and
   production; see the postscript at the top of this record.
2. **The commit-scope correction above** — carried as a standing lesson, not a further action;
   no revert or follow-up commit is implied by it. Whoever next assesses the false-hold
   observation window's integrity should read it.
3. **The library placement question (Q4)** — still not architecturally settled; `cognitive-os-store/`
   now has a second-migration extension whose placement inherited the same constraint-driven
   reasoning. Post-window review, per the core close.
4. **`SUBSTRATE_COGNITIVE_OS_SWEEP_ENABLED`** — its own activation decision, unchanged by this
   session; now governs seven tables' worth of retention rather than four, with the disclosed
   cascade-counting limit named in §5/§8.
5. **The sweep's cascade-counting gap (§5, finding 3)** — disclosed, not closed. A future session
   that wants exact per-table counts under real cascade conditions needs a post-loop reconciliation
   pass; not built here.
6. **Phase 2 remains NOT LICENSED.** This migration persists storage for `DecisionRecord` and
   `HandoffEnvelope`; it builds no Epistemic Debt service, no debt calculation, no decision-readiness
   gate, and instantiates no actor. Nothing here opens Phase 2.
7. Unchanged and untouched: `Q-PREFLIP-REPORTS`; the session-opener `cat >` addition; the
   cap-transparency fold into the project-instructions snapshot; the manifest amendment owed before
   Phase 3.

**Phase 2 remains NOT LICENSED. The S11 flip remains REFUSED; weights remain BLOCKED; the 0h call
remains the founder's.**
