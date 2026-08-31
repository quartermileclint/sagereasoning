# Next session — S7: `/impulse` migration + R20a activation (founder-walked)

**Paste this as the first message of a new session, beneath the standing session opener.**

**Tier: `code-critical`.** Two Critical surfaces in one session: a new schema (a founder-walked
migration, TEST then prod) and an R20a perimeter flag flip on a live public route. AC7 engages at both
steps. PR6 engaged throughout. PR19 already discharged for the build itself (see below) — this session
does not re-review the code, only walks the founder-performed steps and live-verifies them.

---

## 0. Where this picks up

**The build is done, reviewed, mentor-cleared, and committed.** Nothing in this session designs or
writes application code. Read, in order:

1. `operations/primal-substrate-2026-08/2026-08-12-MENTOR-BRIEF-S7-build-summary.md` — the full build
   report: what was built, how each of the five S7 rulings (B2/B3/B4/C1/C12/C13) was implemented, the
   PR19 independent review's findings and dispositions, and the verification performed.
2. `operations/decision-log.md` — the two entries `D-S7-PRIMAL-SUBSTRATE-IMPULSE-TOOL-BUILT-DARK`,
   `D-S7-IMPULSE-PR19-INDEPENDENT-REVIEW-CLEAN`, and `D-S7-IMPULSE-MENTOR-CLEARANCE-AND-FOLLOW-THROUGH`
   — the mentor's clearance is quoted verbatim in the third: *"The build is clean. Cleared for the
   founder-walked migration sequence."*
3. `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` — the "S7 — what is DONE and what is
   CARRIED" section, which this session discharges items 1–2 of.
4. `git show 98716d4 --stat` — the commit that landed the build. **Do not re-derive what changed; read
   the commit.**

**IDEA-loop parallel window:** re-read
`operations/handoffs/founder/2026-08-10-idea-loop-parallel-window-NEXT-SESSION-PROMPT.md` fresh (it is
a standing prompt, re-checked every session). This session touches no flag, route, credential, or table
the validation run depends on — but confirm the pre-flight check rather than assume, same as the build
session did.

---

## 1. What this session does — in order

**Step 1 — the migration, TEST then production.**

File: `website/supabase-impulse-migration.sql`. Additive, idempotent, reversible (a single `DROP TABLE`
at the foot). Run its `§VERIFY` block in full on **both** environments — six checks: columns (15, with
the correct NOT NULL set), RLS enabled, the 5 policies, 7 CHECK constraints, the FK cascade
(`confdeltype='c'`), and — **TEST only, do not run V6 on production** — the two behavioural probes
confirming the mode-fields CHECK genuinely rejects a malformed row (a reciprocity row carrying a
sub-species; a diagnostic row missing the correct judgement). Confirm both statements fail with a
check-violation on TEST before touching production.

**Step 2 — `SUBSTRATE_IMPULSE_R20A_ENABLED` activation, with a live distress smoke.**

Set the flag in Vercel Production, redeploy, confirm green, then run the live smoke pattern every
sibling R20a activation has used (see `D-R20A-SCORE-CONVERSATION-ELEVENTH-ROUTE-ACTIVATION-LIVE` in the
decision log for the reference shape): at minimum, one benign submission (confirms the flag took effect
with no behavior change on clean input), and one that should trip the acute/moderate path (confirms the
human-audience crisis redirect renders and **nothing is saved** — the build's own verification traced
this in code; this step confirms it live). Do **not** skip the negative case — a flag that "activates"
but never actually triggers the redirect on a real input has not been verified, only deployed.

**Step 3 — confirm reachability, by query, not assumption.**

Per the build's own §6 discipline (data-rights and nav wiring "verified by query, not assumption, on
both environments"): confirm `impulse_entries` is reachable via `/api/user/access`, `/api/user/export`,
and `/api/user/delete` on production with a real (or disposable test) row, and confirm `/impulse` is
reachable from both the header Practice dropdown and the footer Practice column on the live site.

---

## 2. What this session does NOT do

- **Does not touch the RLS-vs-route-enforcement gap.** Named, unscoped, mentor-confirmed as its own
  future founder-elected session — and the mentor specifically ordered that when that session opens,
  `impulse_entries` should be the FIRST table it addresses, not one of several. This session does not
  pre-empt that by attempting a local RLS tightening on this one table (the build's own reasoning: a
  local fix here would be a false guarantee while every sibling table stays exposed the same way).
- **Does not touch CLAUDE.md's stale perimeter count.** Outside the S7 permitted-paths discipline that
  governed the build; a future re-grounding session's job.
- **Does not re-run the PR19 review or re-litigate the build's design.** That happened; read it, don't
  redo it. If activation surfaces a genuine NEW defect (not a design question — an actual bug found
  live), treat it as its own finding: fix at the root, re-verify, record it — don't silently patch and
  move on.
- **Does not build the agent-side analogue** (the ATRF's primal-impulse surfacing). That's the ATRF
  scoping session, explicitly post-validation-run, per the mentor's own sequencing. Not this.

---

## 3. Verification before you close

1. Both `§VERIFY` blocks green on TEST; the four VERIFY checks + the FK cascade + policy count green on
   **production** (V6's destructive probes are TEST-only — do not run them against production data).
2. The live distress smoke's negative case (an acute/moderate submission) confirmed to redirect AND
   confirmed to leave no row behind (a direct row-count check before/after, not just the HTTP response).
3. The live distress smoke's positive case (benign submission) confirmed to save normally with no
   behavior change from the pre-flag-flip state.
4. `impulse_entries` confirmed present in a real `/api/user/access` or `/api/user/export` response body
   (not just present in the source list).
5. `/impulse` confirmed reachable by clicking through the live header dropdown and the live footer
   column — not just confirmed present in `NavBar.tsx`'s source.
6. `git log origin/main` shows the deploy commit reachable, Vercel green.

---

## 4. Close with

- A decision-log entry, house shape, recording both Critical steps (the migration application + the
  flag activation) with their live-verification evidence, per PR6/AC7.
- `00-PRIORITY-INDEX.md`: S7 fully live; carried items 1–2 struck through as done; items 3–4 (the stale
  CLAUDE.md count, the RLS gap) remain, unchanged, for their own future sessions.
- A clear statement of whether anything found during activation deviated from what the build report
  claimed — and if so, what.

---

## 5. If something is wrong

If either `§VERIFY` block fails, or the live smoke does not behave as the build report claims (e.g. an
acute submission that still saves a row, or a benign submission that behaves differently post-flag),
**stop and do not proceed to the next step.** That is evidence the build report or the PR19 review
missed something, not a reason to work around it. Roll back the completed step (`DROP TABLE` if the
migration itself is at fault and unapplied elsewhere; unset the flag + redeploy if activation is at
fault — both are byte-identical rollbacks, test-asserted in the build) and report the discrepancy
honestly rather than continuing past it.

---

Nothing here bears on the 0h call. Nothing here touches the IDEA-loop validation run.
