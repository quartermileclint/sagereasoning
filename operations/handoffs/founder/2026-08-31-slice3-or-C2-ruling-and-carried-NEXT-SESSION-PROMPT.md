# Next-session prompt — slice 3, and the carried tail (C2 is closed)

**Paste this as the task after the standing session opener.** Authored 2026-08-30, **rewritten the
same day** after the C2 ruling arrived and its premise was found wrong. **Authoring this prompt
licensed nothing.**

## Push state

The predecessor's two commits are **pushed and live-verified** — `curl … | grep -ci borderline`
returns **0**. This session added three more (`cd52dbd`, `8a34e18`, `4f92030`); **check whether they
are pushed** before anything else.

```
git log origin/main..HEAD --oneline      # expect empty
```

## C2 is DISCHARGED — settled 2026-08-30, do not reopen it

The premise correction was raised, **accepted**, the original discharge **withdrawn**, and a **revised
conditional ruling** issued. The condition was verified under four independent lines and holds, so
**C2 is discharged on SCOPE's pre-ledger exclusion — NOT on the C1 empty-population precedent.**

Read `2026-08-30-mentor-ruling-provenance-ledger-C2-reachability-verbatim.md` **§ Revised ruling**.
**Nothing about C2's discharge needs re-deriving.** What remains from it:

- **The switch-on re-check is a HARD C2 obligation** — carry it into slice-5's prerequisites.
- **Open, named for the mentor, not blocking:** under SCOPE's literal per-identity reading, an
  identity the ledger never recorded for is excluded outright — which at switch-on could exclude an
  agent that simply never consulted. The current conclusion does not depend on it.
- **Open, small:** the Q5c teardown covered three tables and **missed `agent_accreditation`**; that
  leftover row was load-bearing on a readiness threshold.

**Switch-on scoreboard: C1 ✅ · C2 ✅ · C3 ~4/90 days · C4 = slice 3.**

## A standing methodological fact this session established — worth more than the finding

**Neither obvious observable for "did an agent write an accreditation" is sound alone:**

- `credential-completed` trust events **UNDER-report** — the rows are deletable and **smoke teardowns
  delete them**. An absent event is *not* evidence of an absent write.
- `agent_accreditation.updated_at` **OVER-reports** — the Sage Reflect feed calls the same
  `upsertAccreditationRecord` chokepoint (`sage-reflect/sage-assent-feed.ts:177`), so it bumps at
  **every harness session close** with no write occurring.

The sound seed signal is `created_at`. **Any future session reasoning about accreditation-write
history must not use either signal alone.**

## Candidate tasks

### A — Slice 3 (the recommended build, unchanged and unblocked)

`code-elevated`. The served `provenance_gaps` field plus the **§10 attestation amendment**. Governed
by `2026-08-25-extraction-provenance-and-independent-extractor-SCOPE.md` and the slice-2 close's
**§"What is inherited by slice 3 and slice 5"**.

**Its §10 amendment should now say more than "empty until slice 5":** the table is empty **and** the
pipeline that would fill it has never run (the classifier sits behind a route branch that 409s the
harness's seed writes before reaching it). That is available only because of this arc's finding.

**Standing caution, now at five:** slice 3 amends `TRUST_RECORD_ENVELOPE`, which took **four separate
edits on 2026-08-30**. **Every blocking defect in that arc was coverage, and coverage risk compounds
with passes.** Deferring remains legitimate.

### B — The carried tail

| # | Item | Tier |
|---|---|---|
| 1 | **The residual smoke row** — the Q5c teardown covered `agent_trust_events`, `agent_trust_state` and `stoa_entries` but **missed `agent_accreditation`**, and that leftover is now load-bearing on a readiness threshold. Raised in the correction as its own question | records / `code-standard` |
| 2 | **`api/mentor/private/reflect/route.ts:660`** — the body-supplied `user_id` on a reflections insert; the only live **security** surface in the named-and-unbuilt list, founder-elected first of that list | `code-critical`, PR19 |
| 3 | **The RLS backlog remainder** — carrying the standing warning that a table-level RLS fix is **invisible** to a `SECURITY DEFINER` function writing the same table | `code-critical` |
| 4 | **The p5-force probe-set redesign**, governed by A5 Q2 — selection basis frozen **in advance**, **never** chosen by observed variance; and by Q3/Q4, a differently-defined sweep publishes **beside** the n=100 record, not over it | founder's call |
| 5 | Register D4, AE-3, P1/P6/P7/P8, C1c, the `/api/reason` status-masking fix, the reflect-path `loop_id` UUID bug, the `target_circle` gap, Resend provisioning, `agent_hold_observations` retention, the two LOW `founder_conversations` findings | various |

**Routed and NOT to be opened here** — **A2**, **A3**, **A4** and **D** belong to the
**standing-runner design session**, gated on the bounded validation run's §6 report. **D1** and **D2**
remain blocked. **The A0 register entry is still stale** — the asymmetry is real, open and
instrumented; do not re-scope it.

## Standing obligations that must not be lost

- **The re-check at switch-on is a HARD C2 obligation, not a courtesy** — carry it into the slice-5
  prerequisites.
- **C2 does not discharge C3 or C4.** C3 (90-day soak) is at ~4 days. C4 is slice 3's job.
- **The tally must never be put on a schedule.** Recurring it reinstates exactly the sync-drift shape
  the round-6 ruling rejected.

## What keeps going wrong — read before drafting anything

**Ten rounds now. Not one found a wrong number. Every defect was coverage — and the newest one was a
signal that was *silently incomplete* rather than wrong.** The C2 population error was not a
miscount; it was counting the right thing with an instrument that had been quietly emptied by an
unrelated teardown.

**Therefore:** apply by quoted first/last words against the live file; **sweep case-insensitively**;
diff every surface; verify **order**, not only presence; **count rather than estimate**; **ask what
could have deleted or inflated your evidence before trusting its absence**; and **never let the
verification method share an assumption with the edit method.**

## Standing constraints — unchanged

- **Weights-BLOCKED.** Nothing in the C2 arc bears on it.
- **Q1 — the loop proposes; it never executes.** **The §A boundary** holds.
- **Path-specificity is binding.** The rate is `/api/guardrail` ONLY; `/api/reason` unmeasured, at all
  seven places, pinned (S2-52).
- **The class split is binding.** **Grave-vocabulary traffic** was measured; **near-boundary inputs**
  has never been measured. Do not reintroduce the old term.
- **Concurrency:** `ListAgents` at open; `git status` twice; path-scoped commits; never `git add -A`.
- **Nothing bears on the 0h call, which remains the founder's.**

## State at authoring

- Ledger **187 rows**, span 2026-08-26 → 2026-08-30; `credential` 187/187; **structurally resolvable
  0 / unresolvable 187**; `agent_provenance_gaps` **0**. Baseline artifact:
  `agent-circles-2026-08/runs/2026-08-30/c2-discharge-baseline.json`.
- The tally script is at `website/scripts/provenance-c2-discharge-tally.ts` — read-only, `tsc` clean,
  run twice against production this session.
- Battery **156/0** and build-compiles are **inherited from 2026-08-29, not re-run** — this session
  added only a standalone script outside the build graph and changed no measured file.
- **Pins S2-58 through S2-68 mutation-verified. S2-64 is an ORDERING pin** — re-verify against an
  **actual re-inversion**, never merely re-run. **S2-54 has survived four revisions — leave it alone.**

End of prompt.
