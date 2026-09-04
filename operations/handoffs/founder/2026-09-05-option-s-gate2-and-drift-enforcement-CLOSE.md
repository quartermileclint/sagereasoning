# Session close — Option S / Path A, the Gate-2 diagnosis, and drift enforcement

**2026-09-04 → 09-05.** Tier: `code-elevated` (one test file; everything else `governance`).
**Nothing live changed.** No production read, migration, credential, flag, activation, deploy or
spend. `.claude/settings.local.json` untouched. Option S has **never made a call**; `runs/` is empty.

## Production state at close

**Byte-equivalent to session open.** The only code touched was
`website/src/lib/__tests__/r20a-invocation-guard.test.ts` (a test file, not in the byte-identity
guard's measured set). Everything else is documents. The S11 flip remains **REFUSED**; weights remain
**BLOCKED**; GS-CYB-1's two conditions untouched; the Q1 hard constraint holds; the M/W/S election
and R8-D7's sampling policy remain **deferred**.

## What was done

1. **Option S built, PR19-reviewed by three blind agents (6 HIGH, none refuted), and rebuilt.** The
   first version was *"a well-disciplined shell around a metric that does not answer the question it
   is gating"* — plus no writer, and SQL filtering a `cycle_outcome` value that does not exist.
2. **The c11 data was found in-repo before any quota was spent** — K=10, p̂_floor 0.10, mechanism
   already localized to Layer-1 stage assignment. It produced the measured cost ($0.014222/call) and
   surfaced **instrument drift** (`f7619d9` changed `layer2-mechanisms.ts` after the run closed).
3. **The instrument was made forward-looking** on the founder's election; the mentor confirmed it
   within Path A's terms and declined to discount it for having been proposed by the session it
   repairs.
4. **Two mentor rulings adopted and executed** — Path A (set size, K=10, forward-looking, run
   precedes election) and guard availability / lean-mode doctrine.
5. **Gate-2 diagnosed:** the guard is chronically unavailable **11–32%** of the time, 60% on
   2026-09-04. Concurrency ruled out by the data. Now **bound B4** on the S11 flip.
6. **RA-2 closed by enforcement, not warning** — a perimeter count stale three times *despite its own
   warning* is now an assertion (717/0, mutation-verified). Three CLAUDE.md drifts corrected,
   including the **Prerequisite Criterion** missing from the reading list since 2026-08-29.

## Three things worth carrying that were not asked for

- **Cross-track ruling contamination.** Two rulings issued to two tracks on one day shared a
  condition belonging to only one. Caught by checking provenance at source rather than absorbing it;
  confirmed by the mentor. **The A8 bound was accepted anyway** (independently verified true).
- **Publication semantics.** On this shared checkout **a peer's push publishes your commits**. The
  commit, not the push, is the point of no return. Two prior "unexplained" instances now explained.
- **A discrepancy named and deliberately not escalated** — Q-G1(b) is answered in the same ruling
  that says it is unruled. Both readings converge on one action, so no question was manufactured. It
  goes live the moment lean mode is wanted.

## Founder-walked items, none started

**F1 — the Gate-2 remedy is unapplied and is the highest-value.** Hook `30→60 s` **and**
`GATE1_TIMEOUT_MS`→~55000 **together**. Three commits this session proceeded with the guard timed
out, including the one recording the ruling about the guard timing out.

**F2 — Path A has one precondition left:** run `EXTRACTION.sql` against production. If it returns
**24**, correct the ruling's figure **with a note naming the mechanism** (a reconstruction that
missed the five no-winner cycles). Then elect and size the credential: K=10, ~240–290 calls,
**≈$3.41–4.12**, quota units = calls × 2.

**F3/F4 — held, mentor-confirmed:** the `agent_hold_observations` sweep (138 live vs 130 frozen is
live evidence) and the `stoic-brain.json` citations (byte-identity guard; P6's call).

## Honest session notes

- **The Gate-2 guard was unavailable on most of this session's own actions** (28 s timeouts), and
  the Gate-1 frame was unavailable for the review launch. Recorded in the commits rather than
  glossed. The session's diagnosis of the guard was produced under the condition it diagnoses.
- **The decision-log entries this session's verbatim records name were missing** until the close —
  the records said *"Recording entry: D-…"* while nothing had been appended. Six entries were written
  at close. A real omission, fixed rather than left.
- **A peer session worked `operations/trust-layer-2026-07/` (P6) throughout.** Left untouched
  except the mentor-mandated B4 addition to the S11 register's §B; Q-G1(c) was **routed** to that
  track rather than written into its row.

## Next session

`operations/handoffs/founder/2026-09-05-post-ruling-autonomous-work-NEXT-SESSION-PROMPT.md` —
ordered so everything the session can finish alone comes first.
