# Next session — build the P6 recommendation column (autonomous; one founder gate at the end)

**Designed to run start-to-finish without you.** Every step is repo-only: no schema, flag, credential,
migration, deploy, live op, or public-doc change, and nothing in it can start the observation window.
**All four open questions were answered by the founder on 2026-09-05** (see "Founder decisions" below);
the build task is licensed and needs nothing further. One housekeeping item is carried and blocks nothing.

**Read first, in this order:** `/adopted/standing-protocol-cache.md` →
`operations/handoffs/founder/2026-09-05-P6-ruling-adoption-CLOSE.md` **including its §7** (PR21) →
`operations/trust-layer-2026-07/2026-09-05-mentor-ruling-P6-window-recommendation-verbatim.md`
**in full — it is BINDING and verbatim wins** → `2026-08-15-false-hold-new-window-scoping-note.md`
**§7** (the amendment this session implements) → then this file.

## First move: verify, don't trust this file

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git fetch origin && git status -sb | head -3
git log --oneline -3
cd website && npx tsx scripts/p1-frozen-buffer-reclassification.ts | grep -E "reproduced|Q2 floor|round-trip"
npx tsx src/lib/substrate/trust-core/__tests__/at-action-seam.test.ts
cd .. && node harness/gate1-pre-decision/test/negative-battery.mjs | tail -2
```

Expected: in sync with `origin/main`; `✓ all 130 records round-trip exactly`, `✓ reproduced (129)`,
`Q2 floor … HOLDS`; `59 passed, 0 failed`; `251 passed, 0 failed` + `RELEASE GATE: PASS ✓`.
**Run the real `fetch`** — three consecutive sessions have found an unlanded push this way.

---

## The task — implement §7 of the scoping note in the report script

**File:** `website/scripts/false-hold-observation-report.ts`. **Tier:** `code-elevated`, repo-only.
**The reference implementation already exists** and is green: `scripts/p1-frozen-buffer-reclassification.ts`
does the lift + seam + `recommendIntervention` over stored records offline. Reuse its approach (PR15);
do not re-derive it.

**Six requirements, all ruled — the verbatim record governs if this list and it ever disagree:**

1. **Both columns per record.** Report the hold classification (`assessKathekonEngagement`, the frozen
   classifier) **and** the decision table's recommendation for the same record.
2. **Derived at report time. Nothing is stored.** Do **not** touch `false-hold-capture.mjs`, the record
   shape, or `recordHash`. A field added inside `signals` re-hashes every existing record and breaks
   ingest idempotency. **If you find yourself editing the capture layer, stop — that is the one thing
   this ruling forbids**, and it would re-arm the contamination problem the ruling removed.
3. **Populations reported separately**, split on `path` (`"guard"` vs absent ⇒ consult). Not optional.
4. **Three bounds printed ON the rate**, not footnoted, for both populations: the **A8 bound** (no
   re-examination counter exists anywhere in the harness ⇒ `habitualReExaminationCount` floors to 0 at
   `intervention-engine.ts:392` ⇒ the two-then-escalate row can never fire); the **guard `depth: ""`
   bound**; and the **as-of-table disclosure** (the derivation reflects today's table, not the table at
   capture time).
5. **A v3/v4 lift check that runs and can fail.** The existing round-trip is proven on 130 **v1**
   records only. Build the v3/v4 equivalent, and make the report **abort** rather than print a figure
   if it fails — matching the reclassification script's own abort.
6. **Nothing surfaces to any agent, response, trust record, or public surface.** MEASURE only.

**Assertions: check non-vacuity by mutation.** Two assertions in one recent session would have passed
vacuously. Break what each new pin guards and confirm it fails, both directions.

**PR19 applies** — this touches the trust-core consumption path. Independent adversarial review before
treating it as verified; the spend-limit first-hand fallback is codified if the Workflow dies.

## Then, in order

7. **Run it over the frozen buffer** as a smoke (the only data that exists — the window has not
   started). Expect the two columns to agree there in the way the P1 re-run showed: the filter moves
   exactly one record of 130. **A figure over the frozen 130 is not a readiness claim** and must not be
   written as one; it is a prefix of the first window's capture (`runs/2026-07-17/FREEZE-NOTE.md`).
8. **Decision-log entry + close + successor prompt.**

## What this session must NOT do

- **Not** start the window, set `GATE1_FALSE_HOLD_CAPTURE`, or touch `GATE1_STATE_DIR`.
- **Not** edit the capture layer, the predicate, `at-action-seam.ts`, or the intervention engine.
- **Not** touch the frozen buffer or the live buffer.
- **Not** treat P5/P6 as discharged or the flip as nearer. **The S11 flip is REFUSED and stays
  refused.** If a move starts to feel like it is building toward the flip, stop and name it.
- **Not** fold in the standing-runner track (`operations/agent-circles-2026-08/`) even if its files
  appear in `git status` — a peer session works there. Commit path-scoped; run `git status` twice.

---

## Founder decisions — all four answered 2026-09-05, nothing here is open

- **Q-B — the report-script build is LICENSED.** Founder: *"yes"*. The task above proceeds; no further
  permission is needed for it.
- **Q-C — register D4's activation walk gets its own session.** Founder: *"its own session"*. Do **not**
  fold it into this one. It is founder-walked `code-critical`, AC7 engages, and it cannot be autonomous.
- **Q-D — the 2026-09-01 score-save prompt is committed as-is.** Founder: *"commit as-is"*. Done
  2026-09-05; it should no longer appear in `git status`.
- **Q-A — the register changelog write is AUTHORISED but still UNAPPLIED.** Founder: *"proceed with
  changelog write"*. **See the section immediately below — this is the one carried item.**

## The one carried item — the register changelog (authorised, guard-denied four times)

Two entries for `S11-FLIP-PREREQUISITES-REGISTER.md` remain unapplied: the 2026-09-05 ruling, and a
retroactive entry for the 2026-08-17 P8a build. **The founder has explicitly authorised the write.**

**The at-action guardrail denied it four times** — `do_not_proceed`, proximity `reflexive`, ground each
time: *"the action text shows a non-consented cost no extracted circle carries as violated."* The 2026-09-05
session honored every deny. Two genuine adjustments were made and neither cleared it: concurrency was
verified (the register diff carried only that session's edits; the peer worked elsewhere; a backup was
taken), and the entry's blame-shaped framing about a late record was removed. The session then stopped
rather than keep rewording until something passed, on the ground that searching for a phrasing that
clears a detector is worse than the entry being late.

**Prepared text:** `scratchpad/chg.py` (a small Python script that asserts a single anchor match before
writing). **Backup:** `scratchpad/register.bak`.

**How to handle it, in preference order:**

1. **Founder pastes it.** One paste, no judgement needed, and it ends the matter.
2. **Attempt it once, early in the session, before anything else.** A fresh session composes different
   action text, so it may simply clear. **If it denies, do not retry more than once and do not reword to
   get past it** — record the deny and move on to the build task, which does not depend on it.
3. **Never** route around a deny by switching tools to write the same content.

**This is housekeeping and blocks nothing.** The build task above is independent of it.

## Standing constraints

- **Verify against source, not against this file, the close, or the decision log's prose.** Recent
  sessions have each corrected themselves at least twice, and every correction came from running or
  reading actual code — including one where the register was right and a prompt was wrong, and one
  where a "hard precondition, not built" turned out to have been built 19 days earlier.
- **Timestamp-check every present-tense mechanism fact you write (PR20).** Two documents in this exact
  area carried a falsified present-tense claim because one inherited it from the other.
- **Guardrail cautions: read the grounds.** The sparse-extraction false-positive class is real, but
  membership in it is a judgement, not a default. A deny is ENFORCE and is honored; if you conclude one
  is a false positive, say so as a judgement and stop, rather than acting on the conclusion.
