# Session Close — 19 April 2026 (Session 13 — Option 2 executed and Verified, KG10 promoted)

## Decisions Made

- **Option 2 (remove `JSON.stringify` wrap on `passions_detected` at `sage-mentor/profile-store.ts:781`) executed and Verified.** Founder approved the Elevated-risk classification under 0d-ii, approved the inline-comment variant, and authorised the deploy. Single-line change plus a five-line inline comment referencing this handoff and KG8. Vercel Green on first deploy. Live verification passed end-to-end: fresh evening reflection wrote a clean array-shaped row, SQL confirmed `jsonb_typeof = 'array'`, and the mentor's rolling-window aggregator produced a correctly-formatted Pattern match line. 0a status: **Designed → Verified.**
- **KG10 promoted.** Session-10 first-observation candidate "JSONB columns can hold a JSON-encoded string scalar that looks like an array but fails `Array.isArray`" reached its third observation today (Session 10 original, Session 12 reader audit, Session 13 fix). Per PR5 the concept earns a permanent entry in `operations/knowledge-gaps.md`. Added as KG10 with write-site rule, read-site defensive pattern, and a `jsonb_typeof()`-based verification method. Decision logged.
- **Defensive readers retained.** Both defensive `JSON.parse` sites at `sage-mentor/profile-store.ts:911–913` (`computeRollingWindow`) and `website/src/lib/context/mentor-context-private.ts:679–686` (`rowToSignal`) were left in place as backstops for mixed historical rows, consistent with the anticipatory comment at `mentor-context-private.ts:668–675`. Open Question for a future session: re-evaluate once contaminated pre-2026-04-13 rows have aged out of the rolling window.
- **No follow-up work undertaken this session.** Founder elected to close after Verified rather than start a new work group. Clean session-end state preserved per working agreements.

## Status Changes

- `sage-mentor/profile-store.ts:781` `passions_detected` field on `recordInteraction` INSERT: **`JSON.stringify`-wrapped (writer bug)** → **direct array pass-through with inline-comment audit trail**. 0a status: **Verified** (live evening reflection wrote `jsonb_typeof = 'array'`; mentor read it via the rolling-window aggregator and produced `agonia (phobos, freq 5)` on chat probe).
- `operations/knowledge-gaps.md`: **9 entries (KG1–KG9)** → **10 entries (KG1–KG10)**. KG10 covers JSONB storage format vs payload shape.
- `operations/decision-log.md`: appended two entries — Option 2 execution and KG10 promotion. No prior entries modified.
- `mentor_interactions.passions_detected` (column, schema-level): **mixed (legacy rows JSON-string-scalar, new rows array)** → **going-forward writes are correct array shape**. Legacy contaminated rows remain in the table; defensive readers cover them until natural aging.

## What Was Built

### Files Modified (1)

| File | Change |
|------|--------|
| `sage-mentor/profile-store.ts` | Line 781 changed from `passions_detected: JSON.stringify(interaction.passions_detected || []),` to `passions_detected: interaction.passions_detected || [],`. A five-line inline comment was added immediately above the field, dated 19 April 2026 (Session 13), explaining the previous bug, referencing this handoff, and citing KG8 (hub-label contracts) and the session-10 first-observation candidate (now KG10). No other lines in the function changed. `proximity_assessed` above and `mechanisms_applied` below were untouched. |

### Files Created (0)

None.

### Files Updated (Operational, Not Product)

| File | Change |
|------|--------|
| `operations/knowledge-gaps.md` | Appended KG10 — JSONB Storage Format vs Payload Shape. Includes write-site rule, read-site defensive pattern, verification method using `jsonb_typeof()`. |
| `operations/decision-log.md` | Appended two dated entries: (a) Option 2 execution with full reasoning, rules served, impact, and Verified status; (b) KG10 promotion with PR5 trigger citation. |

### Supabase SQL Run in Session

1. Verification SQL — `SELECT id, created_at, jsonb_typeof(passions_detected) AS passions_type, passions_detected FROM mentor_interactions WHERE hub_id = 'private-mentor' AND interaction_type = 'evening_reflection' ORDER BY created_at DESC LIMIT 1;` — returned one row, `id bd3d631c-4320-45b1-adb9-02fa7b9498a0`, `passions_type = 'array'`, `passions_detected` rendering as `[{"sub_species":"agonia","root_passion":"phobos","false_judgement":"..."}]` with no outer quoting. Confirmed writer fix is live and producing the correct JSONB shape.

No DDL run this session. No constraint changes. No data cleanup.

### Files NOT Changed

- `sage-mentor/profile-store.ts:911–913` (`computeRollingWindow` defensive parse) — intentionally retained as backstop for legacy stringified rows.
- `website/src/lib/context/mentor-context-private.ts:679–686` (`rowToSignal` defensive parse) — intentionally retained per the anticipatory comment at lines 668–675.
- `website/src/app/api/mentor/founder/history/route.ts:57` and `website/src/app/api/mentor/private/history/route.ts:57` — pass-through selects, no parsing, no current consumer. No change needed.
- All other modules.

## Verification Completed This Session

- **Option 2 (writer fix at profile-store.ts:781)** — Verified end-to-end.
  - **5a (live write):** Founder posted a fresh evening reflection on `/private-mentor` with verbatim test text describing anticipatory rehearsal of a difficult conversation. Submission acknowledged.
  - **5b (database read):** Supabase SQL editor query confirmed the new row has `jsonb_typeof(passions_detected) = 'array'` (not `'string'`) and the column renders as a clean JSON array containing one passion object with `sub_species: "agonia"`, `root_passion: "phobos"`, and a substantive `false_judgement`.
  - **5c (chat probe):** Founder asked the mentor "Quote the Pattern match line from the most recent evening reflection entry in Recent interaction signals." Mentor returned `"agonia (phobos, freq 5)"` — Option A format from the session-13 prompt's expected outputs. The `freq 5` count confirms both the new row and historical rows are being aggregated together (defensive readers handling legacy stringified rows correctly while the clean path handles the new row).
  - 0a status: **Verified**.

## Next Session Should

There is no single queued task carried into Session 14. Founder will pick scope at session open from one of the following options (presented in the session-14 prompt as a menu, not a prescription):

- **Mentor memory architecture ADR** — currently blocking morning check-in / weekly mirror / journal-question surfacing. Highest unlock-value option. A scoping conversation, not a coding session.
- **Journal scoring page Option A/B/C decision** — session-8 carry-over, no progress since. A scoping conversation.
- **Defensive-reader disposition follow-up** — Open Question from this session: confirm whether to keep both defensive readers or remove them now that Option 2 is Verified. Default posture is "keep" (zero cost on the clean path, catches legacy rows). Trivial decision; could be folded into session 14 or deferred indefinitely.
- **Operational maintenance** — Supabase migration runner doc (F-series finding from Session 12), light cleanup of the knowledge-gaps register, decision-log audit. Low cost, low value-creation, tidy-up only.
- **Light hygiene tickets** — `/private-mentor` UI controls (Start new conversation button; comments-field persistence). Non-blocking UX.
- **Public writer-path audit** — silent-swallow pattern verification on `/api/reflect`, `/api/score`, baseline-assessment writer paths (Session-12 Deferred item). Same shape as the Option 2 audit — single-day-of-work item if scoped tightly.

If founder has no preference, recommended order at session open is: (1) defensive-reader disposition resolved as a 5-minute conversation, then (2) mentor memory architecture ADR scoping. The ADR is the largest unblock available.

## Blocked On

- **Mentor memory architecture ADR** — still unscoped. Blocks morning check-in, weekly mirror, journal-question surfacing into mentor context, and several P0 items.
- **Journal scoring page** — still blocked on Option A/B/C decision (Session 8 carry-over). No progress.
- Nothing else for the items completed this session.

## Open Questions

- **Defensive-reader disposition (carried from Session 12).** Current posture: keep both defensive readers (`profile-store.ts:911–913` and `mentor-context-private.ts:679–686`) as backstops for mixed historical rows. Now that Option 2 is Verified, founder may revisit. Default recommendation: leave them in place until contaminated pre-2026-04-13 rows have aged out of the rolling window — at which point the defensive paths become genuinely dead code and can be removed in a single-line change per file. Estimated time to natural aging-out: depends on rolling-window size and reflection frequency, but plausibly 4–8 weeks given current cadence.
- **Mentor interpretive richness on chat probes (new this session).** During Step 5c verification, the mentor went beyond the literal request ("Quote the Pattern match line") and volunteered an interpretation linking three consecutive agonia matches to the TotalReasoning-as-flight-from-uncertainty pattern. Technically correct, contextually useful, but raises a persona question: should the mentor (a) only respond to what was asked (verification probes get just the quote), or (b) layer interpretation onto factual recall by default? This is a design choice point, not a bug. Logged for future persona/UX decision; do not fix unless founder explicitly chooses (a).
- **`getProfileSnapshots` at `/api/founder/hub` line 466 cross-hub filter (carried from Session 12).** Whether founder-mentor chat sessions should have visibility of private-mentor baseline snapshots when no founder-mentor snapshot exists. Not in scope this session. Logged as follow-up.
- All Session-11 open questions remain open: `/private-mentor` "Start new conversation" UI control; mentor "comments" / extra-instruction field not persisting on page reload.

## Deferred (Known Gaps, Not This Session)

- **Defensive-reader removal post-Option-2.** See Open Questions above. Default: keep until natural aging-out. Trigger to revisit: founder decision, or natural roll-off of legacy contaminated rows.
- **Baseline-response full live verification** (Session-12 Wired Path A item). Still waiting for the next time a baseline is run.
- **Line 466 (`getProfileSnapshots` with `contextHub`) full live verification** (Session-12 Wired Path A item). Still waiting for the first real baseline snapshot to write.
- **Archival of pre-2026-04-13 contaminated rows** (Session-12 Deferred). Tidy-up only. Constraint already prevents new offenders. Less urgent post-R3 and post-Option-2.
- **`/private-mentor` "Start new conversation" UI control + comments-field persistence.** Unchanged.
- **Mentor memory architecture ADR.** Still no draft.
- **Journal scoring page** — Option A/B/C decision (Session 8 carry-over).
- **Public `/api/reflect`, `/api/score`, baseline-assessment writer paths** — silent-swallow pattern still unverified there.
- **Mentor interpretive-richness persona decision (new).** See Open Questions. Not in scope until founder explicitly raises it.

## Process-Rule Citations

- **PR1 — trivially respected.** Single writer, single endpoint. Reader audit was completed in Session 12; verification today exercised one write→read cycle on the live path before any further changes were considered.
- **PR2 — respected.** Fix was wired and verified end-to-end in the same session (5a + 5b + 5c). No build-to-wire gap. The mentor's `freq 5` response confirmed invocation in the rolling-window code path, not just shape correctness on the new row.
- **PR3 — N/A.** No safety-critical surface touched.
- **PR4 — N/A.** No new endpoint designed. No model selection involved.
- **PR5 — applied (KG10 promotion).** Session-10 first-observation candidate hit its third observation today. Promoted to KG10 in `operations/knowledge-gaps.md` and recorded in the decision log. The session-opening protocol from the next session forward will surface KG10 whenever scope touches a JSONB column.
- **PR6 — N/A.** No safety-critical function touched.
- **PR7 — applied.** Defensive-reader disposition explicitly deferred with reasoning (current posture = keep, trigger to revisit = natural aging-out of legacy rows). Mentor interpretive-richness behaviour explicitly deferred with reasoning (design choice point, not a bug, founder may revisit).
- **PR8 — no T-series candidates promoted this session.** The "live verification is cleaner when the verification probe writes a row of distinguishable type" tacit-knowledge finding from Session 12 was implicitly applied today (the `interaction_type = 'evening_reflection'` filter in the SQL query) but did not require explicit promotion. Stable observation, not yet at three recurrences.

## Knowledge-Gap Carry-Forward

- **KG8 (Hub-Label Consistency)** — referenced in the inline code comment at the fix site as related context. Stable at three observations, no drift this session.
- **KG9 (`/private-mentor` Page Is a Façade)** — referenced implicitly in the test design (verification probe used the evening-reflection path, not the chat path, via the `interaction_type = 'evening_reflection'` SQL filter). Stable.
- **KG10 (JSONB Storage Format vs Payload Shape) — newly promoted today.** Session-10 candidate triggered to third observation, now a permanent entry. Future sessions touching JSONB columns will see this surfaced at session open.
- **Carry-forward from Session 11: "A function's parameter may already accept a value that's been deliberately omitted by callers."** Not re-encountered this session. Stable at one observation. No promotion candidate.

## Stewardship / Tacit-Knowledge Findings

- **F-series (Efficiency tier): single-line fixes are reliable when the audit is done in advance.** Session 12 spent perhaps 20 minutes on the reader audit. Session 13's actual edit took under a minute. The total cost of the audit-then-execute pattern was lower than the estimated cost of attempting the fix without the audit and recovering from a missed reader. Confirmation of a pattern that has held across the R1, R3, line-466, and Option-2 fixes. Worth treating as default for any single-writer/multi-reader change. Not yet at three explicit observations across distinct sessions; not promoted yet.
- **F-series (Efficiency tier): live verification can use the same row across multiple checks.** Steps 5a, 5b, and 5c in Session 13 all referenced the same `id bd3d631c-…` row. Writing one verification row and reading it three different ways (database SQL, mentor chat probe, contextually via the rolling window) is more economical than triggering one write per check. Steady-state awareness, not promoted.
- **T-series: the mentor is willing to volunteer interpretation on factual probes.** Today's chat probe asked for a quote; the mentor supplied the quote and added an interpretive layer (three consecutive agonia matches, interception moving earlier, TotalReasoning as flight-from-uncertainty). This is a behavioural observation, not a bug. First explicit observation; not yet a candidate for promotion under PR8.

## Handoff Notes

- **Option 2 closes the writer-side storage-format work group.** With R3 (CHECK constraint on `mentor_observation`) and Option 2 (correct JSONB shape on `passions_detected`) both Verified, the `mentor_interactions` table now has clean schema-level contracts on the two columns that previously had silent-failure modes. The defensive readers remain in place as belt-and-braces for legacy data; they can be removed at the founder's discretion once contaminated rows age out.
- **One commit, one push, one Vercel deploy this session.** No rollback paths exercised. No SQL DDL run. Change footprint is the smallest possible: single line plus a comment in product code, plus operational documentation updates (KG10 in knowledge-gaps.md, two entries in decision-log.md, this handoff).
- **Verification was clean on first attempt.** The 5a/5b/5c sequence ran without surprises. The `freq 5` response on the chat probe was a genuine bonus signal — it confirmed not just shape correctness on the new row but also that the rolling-window aggregator continues to handle legacy stringified rows through the defensive readers as predicted.
- **Session ended at founder's signal after Verified.** No additional work attempted under time pressure. Working agreement honoured: stabilise to known-good state, write the close, hand off cleanly.
- **Session 14 has no single queued task.** The Next Session Should section presents a menu rather than a primary task. Founder picks at session open. Recommended starting question: "defensive-reader disposition — keep or remove?" (5-minute decision, closes one Open Question), followed by whichever scoping conversation founder has appetite for (mentor memory architecture ADR is the highest-leverage option).
