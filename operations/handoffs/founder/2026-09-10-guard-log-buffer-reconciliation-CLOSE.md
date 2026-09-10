# Session close — guard population reconciliation, mentor ruling adopted, retroactive check run

**Thu Sep 10 17:49:38 AEST 2026** (from `date`). Session `8fe3a6ae-dcb1-4324-846d-631d51336dc4`.
Tier: read-only diagnostic analysis. **AC7 not engaged.**

## Status: COMPLETE. Nothing built, nothing activated, no production surface touched.

Opened under `2026-09-10-cognitive-os-standing-close-NEXT-SESSION-PROMPT.md`, whose §0 states that
track has no work licensed. Took the item the mentor had explicitly carried forward and left open,
relayed three questions arising from it, and executed the one obligation the ruling licensed.

## What was done, in order

1. **Closed the GUARD-CAUTION log-vs-buffer non-reconciliation.** Guard **population count**
   reconciles exactly — 258 = 258, zero session mismatches, zero strict token failures, max |Δt|
   11 ms. Never a data discrepancy: three compounding measurement errors.
   Record: `operations/trust-layer-2026-07/2026-09-10-guard-log-buffer-RECONCILIATION.md`.
2. **PR19 — two blind reviewers (Sonnet), both folded.** One upheld a **real defect** (the window
   anchor off by one — TRAP-3), verified first-hand before folding.
3. **Relayed three questions to the mentor** rather than answering them for itself.
   Relay: `…/2026-09-10-guard-reconciliation-RELAY.md`.
4. **Ruling received, recorded verbatim, adopted in full.**
   Verbatim: `…/2026-09-10-mentor-ruling-guard-reconciliation-three-questions-verbatim.md`.
5. **Ran the retroactive check the ruling licensed and owed.** Result: **CLEAN**, structurally.
6. **Found a second off-by-one — this one inside the ruling itself.** Surfaced, not corrected.

## The rulings, in force

- **Q1 — "ordinary" does independent work. D2 IS NOT UNBLOCKED.** Counting completion (5 of 5) is
  **necessary but not sufficient**. The pre-flip report must carry the instrument-change disclosure
  **explicitly, not as a footnote** — schema distribution, the edit-window anomaly and its
  explanation, and that **`live_agent` was not a possible emission for days 1 through most of day
  4**. Whether that suffices for the flip is **the 0h call, the founder's**; the ruling declines to
  pre-empt it.
- **Q2 — a retroactive check IS owed** (the prior no-retroactive-pass ruling does **not** extend:
  *"a false negative in an obligated disclosure is not the same as an absent signal"*). **Run this
  session — see below.**
- **Q3 — the F-3′ claim is UPHELD.** Guard-side **denominator** established; the **rate remains
  uncomputed and unclaimed**. Correct partial discharge.

## The retroactive check — CLEAN, and why that is structural rather than lucky

**No published figure was computed with a `tool=`-keyed regex, because no published figure is
computed from `gate1.log` at all.**

1. `website/scripts/false-hold-observation-report.ts` — the sole producer of published figures —
   **never reads the log**; its only mention sits inside a `console.log` string that itself states
   the limitation. It reads exactly one file, the buffer.
2. Every other file naming `gate1.log` is a **writer** (`appendFileSync`) or a comment.
3. **No `tool=`-keyed parse exists anywhere in the codebase** — the sole hit is a test assertion on
   a buffer record field.

**TRAP-1 is a trap for ad-hoc session analyses — including this session's own — not for the report
pipeline. Obligation discharged with a negative finding.**

**Residual, at honest confidence:** the 2026-09-09 register row's published cross-check
(`GUARD-*` 203=203) came from an **uncommitted ad-hoc script that cannot be re-read**. Its exactness
is *evidence against* the bug (a `tool=`-keyed regex would have dropped the single in-window
`GUARD-OUTAGE` record → 202 vs 203, and that session reported exactly one unmatched **log line** and
no unmatched buffer record) — inference from the result, **not** verification of the method.

## ⚠ A FIGURE IN THE RULING IS OFF BY ONE — founder/mentor decision, not corrected here

The ruling designates the schema distribution as **required pre-flip content** and states
*"v3=47, v4=96, v5=135, v6=6"*. **`v4=96` is wrong; it is `v4=97`** — provable by arithmetic: the
buffer is append-only, so its first 423 rows are that state (v1=138 · v3=47 · **v4=97** · v5=135 ·
v6=6) and **sum to exactly 423**; the ruling's set sums to **422**.

**Provenance traced:** the 09-10 verification session's **close (§4b) had 97** (correct); its
**register row had 96**; the ruling adopted the register row. Because the ruling designates these as
required pre-flip content, the error would have propagated into the pre-flip report.

**The verbatim ruling is NOT edited** — it is canonical and not a session's to amend.
All four counts are stale regardless (450 lines at 2026-09-10T07:49:38Z) and **must be re-derived when written**.

## Two off-by-ones in one session, same failure mode

TRAP-3 (this session's own draft, caught by PR19) and the `v4` figure (caught at close). Both are a
number **transcribed forward instead of re-derived**, travelling a records chain. The project's
standing instruction already says to re-derive every number; both instances show the instruction does
not arrest the drift on its own.

## Verified at close, run not quoted

| Check | Result |
|---|---|
| `/logos` byte-identity guard | **250 passed, 0 failed** |
| `layer2-mechanisms.ts` / `stoic-brain.ts` SHA pins | `60cefedb5f4f…` / `fa8895ec949b…` unchanged |
| `GUARD_RE` files modified in tree | **none** |
| Buffer refreshed / truncated / written | **no** |
| Production surface touched | **none** |

Re-derived at open: `tsc` 0 · `npm run build` ✓ · cognitive-os 149/0 · critical scenario 30/0 ·
store 269/0 · R20a **43 + 2 = 45** · agent-card extensions **26**.

## ⚠ COMMIT SCOPING

`operations/decision-log.md` and `S11-FLIP-PREREQUISITES-REGISTER.md` **already carried UNCOMMITTED
content from the closed peer session** before this session appended. This session's writes were
**strictly append-only at the physical tail** — `git diff --numstat` shows **zero deletions** on both
— so nothing of the peer's was removed or reordered. **But a commit of either file carries BOTH
sessions' content, and the commit message for this session names that explicitly** rather than
describing only its own work. That is the correction to the scoping incident this session opened
under: the failure was never *including* another session's work, it was **not describing it**.

**Every other peer file in the tree was left untouched and uncommitted.**

## Carried — the state the next session inherits

- **D2 REMAINS BLOCKED** (Q1: counting condition met, "ordinary" condition not).
- **`Q-PREFLIP-REPORTS` — unbuilt, needs a founder waiver.** The ruling **adds required content** to
  it but does **not** license building it.
- **The mentor's other carried item — the *"51 guard records, 1 consult record, a full build
  session"* figure — is STILL NOT RE-DERIVED BY ANYONE.** It is now the only one of the mentor's two
  carried items still open.
- **The standing opener is stale and the mentor called its regrounding overdue** — three of its
  facts are false (baseline "2 of 5"; `classifyCaller` byte-unchanged; `caller_class` measures null).
  **A founder act, to happen before the next session opens under it.**
- **F-K resolved in recommendation:** do **not** extend the window for more v6 consult days —
  *"adjusting the measurement to look cleaner."* Tool-mode routing, if wanted, should be *"a
  deliberate founder-visible setting, not an auto-mode outcome."*
- The three stale `~/.sage-gate1/*-stdin.json` files remain on disk, inert. Founder `rm` still owed.

## Disclosure — measurement composition

This session was **Bash-authored** (auto mode): it contributed **guard records but zero consult
records** and **could not advance the baseline counter**. Tool mode was set by the harness, not
chosen for its measurement effect. This is a live instance of the dependency F-K concerns.

**D2 REMAINS BLOCKED. The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the
founder's.**
