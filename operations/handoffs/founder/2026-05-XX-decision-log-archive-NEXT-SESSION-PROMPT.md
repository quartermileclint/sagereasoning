# Next-Session Prompt — Decision-log archive (governance cleanup)

**Stream:** founder.
**Tier:** governance — Elevated risk under 0d-ii (per cache row "Move file from `/drafts/` to `/adopted/` or to `/archive/`").
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor decision-log entries:** N/A (this is a one-time governance action; the policy itself is the entry's subject).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-04-sub-session-D-close.md` (the session in which this work was deferred).
**Risk classification:** Elevated. AC7 NOT engaged. PR6 NOT engaged. Critical Change Protocol NOT engaged.

## Why this session matters

The active decision-log (`/operations/decision-log.md`) currently sits at ~600KB and ~3800 lines. Today's friction is small (grep + targeted reads work fine), but two things create real cost: (a) the Read tool's 256KB limit is already routinely hit and routed around with grep + offset reads; (b) reasoning over the log during session-open and cross-reference resolution burns context window. The growth rate is ~50–100 lines per session — within ~6 months the file will be 1MB+ and friction compounds.

This session does a one-time cut: move pre-1 May 2026 entries to a dated archive file, reducing the active log to ~5–7 May-onwards entries (~10–15% of current size). It also decides + documents a recurring cadence so the question doesn't recur every quarter.

## Pre-conditions

1. Sub-session D's nine artefacts pushed via GitHub Desktop. Working tree clean at session open. Vercel green (no application-code change in this session, so deploy is a no-op).
2. Founder availability for ~30–45 min.
3. No other in-flight work on the decision-log (this session is the only writer).

## Part A — Open under the protocol (cache-driven)

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection N/A, risk class).
2. `/operations/handoffs/founder/2026-05-04-sub-session-D-close.md` (~2 min — predecessor close; cross-references the deferred archive question).
3. The decision-log's table of contents — produced via grep at session open: `grep -nE "^## [0-9]{4}-[0-9]{2}-[0-9]{2}" /operations/decision-log.md`. Identifies the boundary line for the 1 May cut.

Confirm at session open per cache:

- **Tier:** governance.
- **Hold-point:** P0 0h still active.
- **Model selection (PR4):** N/A — no LLM calls.
- **Status vocabulary targets:** decision-log split into active + archive files; archive policy reaches **Adopted** (governance entry); reduces context cost for future sessions.
- **KGs engaged:** none directly. Indirectly: KG7 if the archive policy ever needs JSONB encoding (it shouldn't).

## Part B — Procedure

### Step 1 — Identify the boundary

Use grep to locate the first entry dated 2026-05-01 or later:

```
grep -nE "^## 2026-05-" /operations/decision-log.md | head -3
```

Confirm with the founder which entry is the first one to remain in the active log. Recommendation: keep all 2026-05 entries in the active log; archive everything dated 2026-04-30 and earlier.

### Step 2 — Create the archive file

Two options for archive granularity:

- **Option A — single archive file** (`/operations/decision-log-archive-pre-2026-05.md`). One file holding everything before 1 May. Simplest.
- **Option B — monthly archive files** (`/operations/decision-log-archive-2026-04.md`, `/operations/decision-log-archive-2026-03.md`, etc.). More files, finer slicing for future grep precision.

The AI presents both with reasoning; founder confirms. **Recommendation: Option A** for the one-time pass (~3800 lines into one archive); switch to Option B-style monthly slices for future archives if maintenance reveals friction.

Move the pre-1-May lines verbatim to the chosen archive file. Add a header at the top of the archive file noting:
- Source file (`/operations/decision-log.md`)
- Cutoff date (everything dated < 2026-05-01)
- Move date (today)
- The active log's INDEX-style header points here

### Step 3 — Reduce the active log + add INDEX header

Truncate `/operations/decision-log.md` to keep only May-onwards entries. Add an INDEX header at the top:

```
# Decision Log (active — May 2026 onwards)

This file contains decision-log entries dated 2026-05-01 and later. Earlier
entries are in the archive(s) listed below.

## Archives

- /operations/decision-log-archive-pre-2026-05.md — entries dated < 2026-05-01

## Archive policy

- Archive cadence: <to be decided in Step 4>
- Boundary criterion: by date (calendar quarter / month / etc.)
- Cross-reference IDs remain stable across archive boundaries — IDs are the canonical references; physical file location is operational

[Active entries follow below this line.]

---
```

### Step 4 — Decide + document the recurring archive cadence

Three patterns to consider:

- **Quarterly** (every 3 months: 1 Jul, 1 Oct, 1 Jan, 1 Apr). Predictable; ~150–300 lines per archive.
- **Monthly** (every month). Aggressive; smaller archives; more files to maintain.
- **Threshold-based** (archive when active log > 500KB or > 2000 lines). Reactive; less predictable.

The AI presents all three with reasoning; founder confirms. **Recommendation: Quarterly** — predictable cadence, modest file count, aligns with quarterly compliance review patterns the project already has.

### Step 5 — Append governance entry

Pattern: per cache §"Lean decision-log entry". Entry name: `D-DECISION-LOG-ARCHIVE-POLICY-ADOPTED-2026-05-XX`. Records:
- The one-time cut performed today (boundary date; archive file path; line counts before/after)
- The recurring cadence chosen in Step 4
- The INDEX-header pattern + cross-reference invariants
- Rollback path (revert the split via git)

### Step 6 — Update the standing-protocol cache

Per cache §"Cache update discipline": when project instructions or process rules change, update the cache in the same session. The archive policy is a new operational pattern that should be referenced in the cache so future sessions know the active log isn't the whole log. Add a one-line cross-reference under `/adopted/standing-protocol-cache.md` §"Cross-references".

### Step 7 — Session close

Pattern: per cache §"Lean session close". Updates: active decision-log line-count reduced; archive policy Adopted; future session-open protocol unchanged structurally (still reads "the last 2-3 entries of the active log" per cache).

### Step 8 — Next-session prompt

The founder's choice — typically Sub-session E1 (if not already done) or whatever the next product-level session is. This archive session has no follow-on of its own.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + grep boundary | 5–10 min |
| Step 1 + Step 2 (archive file creation) | 5–10 min |
| Step 3 (truncate + INDEX header) | 5–10 min |
| Step 4 (cadence decision) | 5–10 min |
| Step 5 + Step 6 + Step 7 + Step 8 | 10–15 min |
| **Total** | **~30–45 min** |

## Rollback path

`git revert` of this session's commit restores the original decision-log file (single file; no archive). The archive file is removed. Cross-references that pointed to the archive file are now stale (but the IDs they reference still resolve to the original file's restored entries).

## Forecast

**On clean completion:** active decision-log shrinks from ~3800 lines to ~150–200 lines (everything from 2026-05 onwards). Archive file holds the rest. INDEX header in active log + governance entry document the policy. Future sessions see materially less context cost during decision-log reads. Recurring cadence decided so this session doesn't repeat ad-hoc.

End of prompt.
