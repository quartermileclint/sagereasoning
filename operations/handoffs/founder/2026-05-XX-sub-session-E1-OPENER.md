# Session Opener — Sub-session E1: Second consumer-route wiring (PR1 rollout begins)

**Stream:** founder.
**Tier:** code-elevated by default. Reclassifies to code-critical if Step 1 selects Candidate B (V3 mentor reflection — R20a perimeter; PR6 + AC5 engage).
**Governing frame:** `/adopted/standing-protocol-cache.md`.

## Context for this session

The full procedural body for this session lives in `/operations/handoffs/founder/2026-05-XX-sub-session-E1-NEXT-SESSION-PROMPT.md` and is **the source of truth for what to do.** Read that file in full as Part A's deliverable-of-the-day. This opener exists only to flag what changed between when that prompt was drafted (Sub-session D, 2026-05-04) and now.

## Predecessor sessions (read in reverse chronological order)

1. **Most recent — `/operations/handoffs/founder/2026-05-04-decision-log-archive-close.md`** (decision-log archive cleanup; governance/Elevated; no application code touched). What changed:
   - `/operations/decision-log.md` is now the **active** log (May 2026 onwards only). Earlier entries are in `/operations/decision-log-archive-2026-03.md` and `/operations/decision-log-archive-2026-04.md`.
   - `/adopted/standing-protocol-cache.md` §"Cross-references" updated to reflect the active/archive split.
   - One new entry in active log: `D-DECISION-LOG-ARCHIVE-POLICY-ADOPTED-2026-05-04`.
2. **Second most recent — `/operations/handoffs/founder/2026-05-04-sub-session-D-close.md`** (the predecessor that the E1 prompt was written against). Read this in full per the E1 prompt's Part A.

## Pre-conditions update vs the E1 prompt as drafted

The E1 prompt's Pre-condition #1 names "Sub-session D's nine artefacts pushed". This is satisfied. Additionally:

- The decision-log archive session (2026-05-04) is also pushed; Vercel green confirmed by founder.
- `/operations/decision-log.md` is now ~282 KB / ~1471 lines (down from 622 KB / 3863 lines). The E1 prompt's instruction to read "last 2 entries" of the decision log will now pick up `D-DECISION-LOG-ARCHIVE-POLICY-ADOPTED-2026-05-04` as the most recent entry — read past it to find `D-INTERNAL-RETRIEVE-ROUTE-VERIFIED-2026-05-04` and `D-RETRIEVAL-RERANK-IMPLEMENTED-2026-05-04` which are E1's actual procedural predecessors.
- Working tree should be clean at session open. Confirm via `git status` before any edits.

## Read sequence at session open

Per the cache (governance/code-elevated path):

1. `/adopted/standing-protocol-cache.md` (~3 min — the cross-references section now mentions the archive split; everything else unchanged).
2. **This opener** (already done — you're reading it).
3. `/operations/handoffs/founder/2026-05-04-decision-log-archive-close.md` (~3 min — most recent predecessor).
4. `/operations/handoffs/founder/2026-05-04-sub-session-D-close.md` (~5 min — Sub-session D close; the substrate this session builds on).
5. `/operations/handoffs/founder/2026-05-XX-sub-session-E1-NEXT-SESSION-PROMPT.md` (~10 min — **the procedural body. Follow this.**).
6. `/adopted/adr/2026-05-04-d6-d7-consumer-wiring.md` — ADR-001 in full (per E1 prompt Part A step 3).
7. The chosen consumer route's existing source file (per E1 prompt Step 1 + Step 2).
8. `/adopted/rag-mentor-alt3/retrieval-interface.md` — re-read §"Per-mechanism call patterns" only.
9. `/operations/decision-log.md` entries `D-INTERNAL-RETRIEVE-ROUTE-VERIFIED-2026-05-04` and `D-RETRIEVAL-RERANK-IMPLEMENTED-2026-05-04` (skip past `D-DECISION-LOG-ARCHIVE-POLICY-ADOPTED-2026-05-04` — it's governance, not relevant to E1's procedure).

Confirm at session open per cache: tier (code-elevated by default; code-critical if Candidate B); hold-point (P0 0h still active); model selection per AC1 row matching the chosen consumer; status vocabulary; signals + risk class.

## What to do

Follow the E1 prompt's Part B (Step 1 through Step 7) verbatim. Surface the Step 1 (consumer choice) and Step 2 (wiring pattern) decisions to the founder before writing code. The AI's recommendation per the E1 prompt is Candidate A (`/api/reason` quick-depth) + Pattern A1 (passages as system block content) — present these with reasoning and wait for founder confirmation.

## Files this opener may need committed

If this opener was created in the archive session and not yet committed, add it to E1's first commit:

- `/operations/handoffs/founder/2026-05-XX-sub-session-E1-OPENER.md` (this file)

End of opener. The E1 prompt is the source of truth; this opener only updates predecessors and read sequence.
