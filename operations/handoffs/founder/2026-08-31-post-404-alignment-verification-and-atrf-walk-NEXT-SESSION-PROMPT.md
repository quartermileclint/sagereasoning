# Next-session prompt — verify the 404 alignment live, then the ATRF-EE walk

**Founder: paste this file as the first message of a new session.**

Open under the standing opener first —
`operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md` (Version 2026-08-29).
**That opener predates this window. Where it conflicts with §0 below on any fact in §0, this file
wins.** Everything else in it stands.

---

## §0 — What changed on 2026-08-31, and what to re-derive yourself

**Re-derive at open. Do not trust either document:**

```
git log origin/main..HEAD --oneline      # expect EMPTY if the founder pushed as intended
git status --short
```

**The predecessor prompt said "expect empty" and it was NOT empty** — two records-only commits were
found trailing. Run the check; do not read the expectation.

**1. The slice-3 tail is done, signed, and committed — and was NOT one string.** The obvious fix
(append the missing clause to the 404 body) **reintroduces the fault it exists to remove**: flag-off
the provenance-gaps read never runs, so an unconditional clause asserts an absence nothing checked,
on a response cached five minutes. The clause is emitted **iff the read ran**; `S2-103b` fails the
naive fix.

**2. Independent review found the published contract was itself wrong.** All three R18 surfaces said
a 404 means *"no provenance-gap entry EXISTS"*; the gate counts only the **servable** set. Corrected
under founder-signed wording to *"no provenance-gap entry the record can surface"*, with the 200
clause tightened in the same breath because it inherited the same error. **The mismatch had survived
the fix, inverted.**

**3. `/limitations` gained a section** — the 404's only pointer, and it previously carried zero
mention of the trust record or provenance. `documentation_url` was deliberately **not** re-pointed
(it is shared by all nine responses on that surface).

**4. Four commits were pushed as ONE deploy** (option B: the push IS the activation; the ledger flag
has been live since 2026-08-26). `7facbe5`, `d08c6b9`, `0b3f826`, `5416749`.

**Rollback is `git revert` only. Unsetting `SUBSTRATE_PROVENANCE_LEDGER_ENABLED` is NOT a rollback
path** — it would also stop the live ledger write, a standing production change.

### The switch-on scoreboard

| | Condition | Status |
|---|---|---|
| **C1** | Every agent coheres on identity | ✅ (empty population; **re-check at switch-on is a HARD obligation**) |
| **C2** | 100% ledger-eligible artifact resolution | ✅ discharged 2026-08-30 |
| **C3** | 90-day soak | ⏳ **~5 of 90 days**, began 2026-08-26 |
| **C4** | The `provenance_gaps` surface live | ✅ discharged 2026-08-30 |

**C3 is the only remaining gate and it is a clock. Slice 5 cannot happen before late November. Do
NOT open it.** There is nothing to do in this arc but not-perturb it.

---

## §1 — FIRST TASK: verify the deploy live. Non-optional.

**Three of the last four defects in this arc — and the previous session's headline defect — were
found only by a live `curl`, never by a local sweep.** Do this before anything else.

Against `https://www.sagereasoning.com`:

| # | Check | Expected |
|---|---|---|
| 1 | `GET /api/trust-record/test:definitely-unknown@v1` | **404**, and the body message names **BOTH** halves — it must contain `available to surface` |
| 2 | Same response | `documentation_url` present, pointing at `/limitations` |
| 3 | `GET /api/trust-record/sagereasoning:s9-loop@v1` | **200**, `provenance_gaps: []`, `total_provenance_gaps_count: 0` |
| 4 | `curl -s .../llms.txt \| grep -c "provenance-gap entry exists"` | **0** |
| 5 | `curl -s .../llms.txt \| grep -c "the record can surface"` | **2** (the 404 clause and the 200 clause) |
| 6 | `curl -s .../.well-known/agent-card.json` | parses; **26** extensions; `the record can surface` appears **twice**; `provenance-gap entry exists` **zero** |
| 7 | `GET /api-docs` | the corrected 404 clause serves |
| 8 | `GET /limitations` | the new section **"A trust record can say less than it appears to"** renders |

**If check 1 shows the clause on a 404 while the ledger flag were somehow off, stop** — that is the
exact unverified-absence fault the design prevents. (It cannot happen with the flag live; the check
exists because the failure mode is silent.)

Record the outcome in the decision log as a live-verification entry, in the shape of
`D-PROVENANCE-LEDGER-SLICE3-LIVE-VERIFIED-C4-DISCHARGED` (2026-08-30) — a table of checks with actual
results, not prose.

---

## §2 — THEN: the ATRF-EE founder walk (the recommended larger item)

`operations/handoffs/founder/2026-08-23-atrf-ee-production-wave-FOUNDER-WALK.md` — **`code-critical`
throughout; AC7 engages at Step 1 and stays engaged.**

**A Step 0 now exists and did not before.** The walk's blocker was that **no decision-log entry
records any of its four migration steps being applied, in either direction** — production schema
state is genuinely unknown, and that is the most uncomfortable open item in the queue.

**Run Step 0 first.** `website/supabase-atrf-ee-wave-step0-state-determination-READONLY.sql` — four
read-only queries returning computed `APPLIED` / `NOT APPLIED` / `PARTIAL -- STOP` verdicts. It
creates, alters and drops nothing.

**What was checked 2026-08-31 and what it does NOT establish:** all four migration files exist and
**none carries an APPLIED marker.** That is *consistent with* unapplied and **proves nothing about
the database.** The Q5c precedent is exactly this — production found **already at target** from an
unrecorded partial application while the file's comments described a different world.

**A `PARTIAL` verdict on Q2 stops the walk.** A half-applied additive migration is a third situation
and must be understood before anything else runs.

Two disciplines are already baked into Step 0: Q4 re-derives the CHECK via `pg_get_constraintdef`
rather than trusting migration comments, and Q3's expected column count (17) was derived by
enumerating the `CREATE TABLE` body, not read from the comment beside it.

---

## §3 — Carried from 2026-08-31, none blocking

**3a. The row cap — carried to slice 5, deliberately.** The 404 gate reads only `.entries` and
ignores `capped`/`totalCount`, so its absence claim covers only the newest 50 rows. **Not reachable
today** (zero rows; classification has never executed). Both candidate fixes — 503 on `capped`, or
disclose truncation in the message — are design choices with public-contract consequences. Named
in-code with its check.

**3b. The predicate-wording residual — settled, do not re-raise.** Served says *"available to
surface"*; the contract says *"the record can surface."* Synonymous. PR19's actual complaint (a
qualifier appearing on no published surface) is closed. **The founder elected to ship what was
signed.** Recorded so a reviewer does not re-open it as a finding.

**3c. A mentor note is owed and is not urgent.** SCOPE §6.5.6's *instruction* was followed; its
*stated reason* — *"the change is inert until the ledger itself ships"* — expired when the ledger
shipped four days later. PR20-class stale premise, not a challenge to the ruling.

**3d. `readProvenanceGaps` still has no behavioural coverage** — two source-greps only (S2-89/S2-99).
The store is where a fabricated count or wrong ordering would originate. Pin work, not production
risk.

---

## §4 — Two process corrections. Read before launching any review.

Both were earned expensively, one in each of the last two sessions. Memory:
`review-isolation-must-cover-filesystem`.

- **One copy per MUTATING review agent.** The 08-30 session learned that a mutating reviewer must not
  touch the shared checkout. The 08-31 session then gave **three reviewers the same copy** with one
  licensed to mutate — **a copy shared by N agents is not isolation.** It produced a false **HIGH**
  ("the tree doesn't match the diff, the fix is broken") that took three independent checks on the
  real tree to dispose of. `git archive HEAD | tar -x -C /tmp/review-<n>` **per agent.**
- **Treat a "code doesn't match the diff" HIGH during a fan-out as probably contaminated — but
  check, never assume.** Dispose of it with independent signals (grep the construct; `tsc` with
  `noUnusedLocals`; the pin that only passes on the correct form), not with one grep.
- **A mutation harness must assert its mutation applied exactly once and exit non-zero otherwise.** A
  mutation that fails to apply prints a green battery indistinguishable from a passing pin.
- **Verify a fold by RUNNING the battery, never by grepping the source** — the phrases you grep for
  also appear in the doc comments describing them.
- **Two-directional mutation testing is not the same as testing the invariant you wrote down.** The
  08-31 session mutation-tested in both directions it had thought of and still shipped a pin set that
  proved *"clause iff FLAG"* while the code said *"clause iff READ."* **Derive mutations from the
  written invariant, not from the branches you happen to be looking at.**

---

## §5 — The election. Nothing self-starts; the founder sequences.

**Do §1 first regardless** — it verifies a live public-surface change already deployed.

Then elect one:

1. **The ATRF-EE walk** (§2) — recommended; the only item where production state is unknown.
2. **Housekeeping — fold 08-17 → 08-31 into `CLAUDE.md`.** Substantially stale (last content edit
   2026-08-23, perimeter paragraph only): carries nothing of the R20a perimeter completion, the
   practice-family RLS lockdown, M-4/M-5, the ATRF/EE wave, the extraction-provenance thread, or the
   provenance ledger and its three slices. Cheap; compounds if deferred.
3. **The R4 activation batch** — R2b flags in the ruled order (Q1 determination → classifier shaping
   → the D4 reducer walk **last**, beginning with a founder `SELECT` of `justice_floor_active`); the
   new false-hold observation window **LAST**; `SUBSTRATE_TRAJECTORY_DISPERSION_ENABLED` excluded
   (M-4-blocked).
4. **The standing-runner design session (R8)** — licensed; heaviest named-input load; **completing
   the ATRF row of the named-input register is owed before it opens.**
5. **The O-C Gate-3 design session** — licensed 2026-08-23, ruled agenda order in hand.
6. **The RLS backlog** — the view-grants remediation live-apply, plus a decision on the **escalated
   `vulnerability_flag_owner_view`** (plausible full-table read on the R20a vulnerable-user flags
   table; latent, 0 rows). Class-B `§APPLY` if not folded into item 1.
7. **M-5(b) identity threading** + the `triggered_rules` encryption migration (Critical+schema); and
   the **discernment-route 503-rate diagnosis** (named, unstarted, founder-prioritised — elicitation
   completion fell 29.2% → 7.0% Jul→Aug, traced to 63 identical `ELICIT-OUTAGE`s).

**Held / do not open:** slice 5 (C3, ~late November); IW-7 opening 2 (signal-quality gap, by ruling);
Spec 4 dispersion (M-4 restoration); the hegemonikon uniformity family (unruled); the Prudence
Stage-3 scoping session; Layer 3 activation; Resend/ST7; the S11 flip; the 0h call; **weights**
(GS-CYB-1's two-condition gate).

---

## §6 — Standing constraints, unchanged

- **Weights-BLOCKED.** **Q1 — the loop proposes; it never executes.** **The §A boundary holds.**
- **PR19 is not a formality here.** In this window independent review has caught what first-hand
  review missed, repeatedly — including, on 2026-08-31, falsifying the session's own claim that its
  mutation verification was rigorous.
- **Concurrency:** `ListAgents` at open (12 interactive peers is normal); `git status` twice;
  **path-scoped commits — never `git add -A`.** `website/src/data/environmental-context.json` is a
  pre-existing weekly-scan stray: **leave it alone.**
- **Founder-walked discipline:** commit and push BEFORE any flag flip; this environment holds no
  production admin credential, so prod mints go through the founder's browser-session JWT.
- **Bare-SQL verification blocks**, pure-ASCII payloads, `chr()` for typography, length-count
  verification. **Re-derive any CHECK constraint via `pg_get_constraintdef`** — never from a
  migration file's comments.
- **Nothing bears on the 0h call, which remains the founder's.**

---

## §7 — State at authoring (2026-08-31, before the push)

- S10 battery **198/0**; pins through **S2-103d**; **next free is S2-104**. `tsc` clean;
  `npm run build` exit 0. `agent-card.json` **26 extensions**.
- Ledger **~187+ rows**, span from 2026-08-26; `agent_provenance_gaps` **0 rows**, and stays 0 until
  slice 5.
- The read-only C2 tally script `website/scripts/provenance-c2-discharge-tally.ts` is point-in-time
  and **must NEVER be scheduled**.
- Two small open items from 08-30, neither blocking: the **per-identity exclusion loophole** (named
  for the mentor) and the **Q5c teardown gap** (`agent_accreditation` was missed).

**End of prompt.**
