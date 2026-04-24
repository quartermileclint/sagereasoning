# Session Close — D1 Journey-Classifications Second Pass

**Date:** 25 April 2026
**Stream:** Ops
**Governing frame:** `/adopted/session-opening-protocol.md` (adopted 24 April under DD-2026-04-24-09), with `/adopted/canonical-sources.md` as the canonical-sources reference.
**Scope adopted at open:** D1 — second-pass journey classification over the 19 blocker-carrying registry items, with a mid-session expansion (code sync) approved explicitly.

---

## Decisions Made

- **Adopted D1 at session open.** Founder directive: "D1 — all reviewed, option (b) new `deprecated` value permitted, batch logs at end, table format for review."
- **Approved all 11 proposed journey moves en-bloc** after reviewing the full proposal table. Founder directive: "approve all 11 proposed moves."
- **Introduced `deprecated` as a sixth journey value**, used on exactly one registry entry (`engine-llm-bridge`). Its own blocker text named it as a deprecation candidate; no other component met that bar in this pass.
- **Mid-session scope expansion — code sync approved.** Founder directive after Vercel-green + Ops-verify: "fix ops-continuity state with new 'deprecated' value now, then close." This moved the ops-continuity-state.ts comment drift (originally flagged as out-of-D1-scope) into the session, plus promoted `JOURNEY_ORDER` to include `deprecated` as an explicit last-position member.
- **All 12 decision-log entries (D-D1-1 through D-D1-12) appended in-session as a single batch** at the end, per founder's choice (batch, not per-move). Matches D3 Lesson 1 (in-session, not deferred) while honouring the founder's batch-timing preference.

## Status Changes

- `website/public/component-registry.json` — 11 `journey` field edits applied; all 11 guarded by pre-flight current-value asserts. Total entries unchanged (163); duplicate ids unchanged (0); blocker count unchanged (19). **Status: Verified** (JSON parses, Python distribution probe matches expectation, tsc clean).
- `website/src/lib/context/ops-continuity-state.ts` — 5 edit sites (4 comment sites + 1 enum constant with its preceding order-comment). Behaviour unchanged — the loader already handled unknown journey keys gracefully via `compareJourneyKeys`; the edit promotes `deprecated` from "gracefully-handled unknown" to "documented first-class enumeration member." **Status: Verified** (`tsc --noEmit` returned exit 0).
- `operations/decision-log.md` — 12 D-D1-n entries appended as a batch. Line count 1538 → 1722. **Status: Verified** (grep confirms exactly 12 `## 2026-04-25 — D-D1-` headers present).

## What Was Done

1. **Session opening protocol executed.** Tier declared (Ops; sources 1, 2, 3, 5, 6). Read: manifest, session-opening-protocol.md, canonical-sources.md, D3 ops close note (including Post-close amendment), discrepancy-sort-2026-04-23.md, knowledge-gaps.md. Hold-point status confirmed (P0 §0h still active; D1 within the 0h-permissible set). PR4 N/A (no new LLM calls).
2. **Safety check on new `deprecated` value.** Grepped `compareJourneyKeys` (line 885 of ops-continuity-state.ts): sort handles unknown keys gracefully (unknowns rank `JOURNEY_ORDER.length` and sort alphabetically among themselves). Grepped `journey` enumeration throughout the file: no closed-set switch/match; loader accepts any string. Pushed back honestly on the forward-prompt's pre-classification of "new value = Elevated" — the actual risk is Standard.
3. **Proposal table produced for all 19 blocker-carrying items.** Extracted id + current journey + blocker text for each. Classified into 11 moves and 8 keeps, with three ⚠️-flagged items where reasonable people could disagree (engine-ring-wrapper, infra-stripe, reasoning-sanitise) and one item deliberately left unchanged (agent-support). Rationale cited explicitly for each.
4. **En-bloc approval received.** Founder: "approve all 11 proposed moves."
5. **Backup taken first.** `website/public/component-registry.json.backup-2026-04-25-d1` (128,994 bytes) parked alongside live file. Prior D3 backup preserved.
6. **11 journey-field edits applied via guarded Python.** Pre-flight asserted current journey on each id against expectation (all 11 matched). Edits applied; `json.dump(..., indent=2)` with trailing newline.
7. **Registry-integrity verification.** Total entries = 163 (unchanged). Duplicate ids = 0 (unchanged). Blocker count = 19 (unchanged). Per-journey distribution over blocker-carrying items: `{paid_api: 4, free_tier: 1, internal: 13, deprecated: 1}` — matches projected post-move state exactly. `both` journey now has 0 items (all three moved). Post-move assertion: all 11 moves landed at their proposed target values.
8. **TypeScript check (pre-code-edit).** `cd website && npx --no-install tsc --noEmit`: exit 0.
9. **Founder signalled Vercel green + Ops verified.** Confirmed the registry change deployed cleanly.
10. **Mid-session code sync on ops-continuity-state.ts.** Backup taken: `website/src/lib/context/ops-continuity-state.ts.backup-2026-04-25-d1`. Five Edit-tool invocations applied the six edit sites: line 20 comment, line 104 type comment, line 151 interface comment, line 653 inline comment, and lines 881–883 (order-comment + `JOURNEY_ORDER` array combined). Verified: no stale "5-value" journey-value lists remain.
11. **TypeScript check (post-code-edit).** `npx --no-install tsc --noEmit`: exit 0.
12. **Decision-log batch append.** Backup taken: `operations/decision-log.md.backup-2026-04-25-d1`. 12 entries appended via heredoc. Grep confirmed 12 `## 2026-04-25 — D-D1-` headers present.

## Verification Method Used (0c Framework)

| Work Type | Method | Result |
|---|---|---|
| Registry integrity | Python probe: total count, duplicate-id Counter, blocker count, per-journey Counter | PASS — 163 entries, 0 duplicates, 19 blockers, distribution `{paid_api: 4, free_tier: 1, internal: 13, deprecated: 1}` |
| 11 journey moves landed | Python assertion: each id's new journey matches proposed target | PASS — zero mismatches |
| TypeScript (post-registry edit) | `cd website && npx --no-install tsc --noEmit -p tsconfig.json` | PASS — exit 0 |
| TypeScript (post-code edit) | Same as above, re-run after ops-continuity-state.ts edits | PASS — exit 0 |
| Code-comment edits landed | `grep -n "deprecated\|'unknown'\|\| unknown" ops-continuity-state.ts` | PASS — all five comment sites and the JOURNEY_ORDER array carry `deprecated`; no stale 5-value references remain for journey-value enumerations |
| Decision-log appends | `wc -l` before/after (1538 → 1722) + grep count of `^## 2026-04-25 — D-D1-` headers | PASS — 12 headers present |

## Risk Classification Record (0d-ii)

- **Task 1 (11 journey-field edits to component-registry.json):** Standard. Registry data edit only; no consumer schema change; pre-flight asserts on current values; backup taken first. No safety surface touched. PR6 not engaged.
- **Task 2 (code sync on ops-continuity-state.ts — 4 comment sites + JOURNEY_ORDER + order-comment):** Standard. Pure documentation plus one enum-constant extension. No logic change; the sort function's behaviour on `deprecated` is unchanged (was handled as unknown-alphabetical; now explicitly positioned last). No safety surface; no authentication or session effect; no external dependency change. tsc clean.
- **Task 3 (12 decision-log entries appended):** Standard. Additive text to a non-executable audit document; backup taken first.
- **No Elevated or Critical changes this session.** PR6 does not apply.
- **Notable classification judgement call:** the forward prompt pre-classified "adding a new journey value" as Elevated. Pushed back with grep evidence that `compareJourneyKeys` handles unknown keys gracefully. Founder chose option (b) at session open, explicitly accepting Standard classification. Documented here so the pre-vs-post classification difference is visible in the audit trail.

## PR5 — Knowledge-Gap Carry-Forward

- **Register scanned at open.** Post-reconciliation KG1–KG7 (DD-2026-04-25-03). None of KG1, KG2, KG3, KG4, KG6, KG7 relevant to a registry-field reclassification. KG5 (token budgets) flagged as potentially relevant if the session produced a new taxonomy value that changed rendered volume — it did (one new `deprecated` group), but the added rendered volume is negligible (a one-item group).
- **No re-explanations needed.** No new KG entries warranted.
- **PR8 candidate patterns from D3 (1 observation each) remain at 1 observation after this session.** Neither "Frankenstein duplicate" nor "type-prefix naming invariant" recurred in D1 scope.
- **Candidate pattern — first observation.** "Graceful-unknown-handling in sort functions enables safe new-enum-value introduction." The `compareJourneyKeys` pattern (known keys by index, unknown keys after-and-alphabetical) meant that adding `deprecated` was Standard risk rather than Elevated. The pattern is reusable: any future sort function built in this project that ranks by a closed enumeration should use the same fall-through pattern for unknowns so future additions remain non-breaking. Logged for PR8 tracking; promotion triggers on third recurrence.

## Founder Verification (Between Sessions)

Once deployed, verify independently:

| Check | Method | Expected |
|---|---|---|
| `deprecated` journey group renders | In an Ops chat: *"List the non-Ready items in the `deprecated` journey group."* | One item: `engine-llm-bridge — LLM Bridge (Claude Wrapper)`, with its deprecation-candidate blocker. |
| `both` journey group is empty | In an Ops chat: *"List the non-Ready items in the `both` journey group."* | Empty (or "none grouped") — all three previous `both` items moved. |
| `internal` journey group populated | In an Ops chat: *"Show the `internal` journey group."* | 13 items (up from 4). Includes all Mentor subsystem components, `agent-sage-ops`, `agent-session-bridge`, `infra-resend`, `reasoning-journal-layers`, `reasoning-sanitise`. |
| `paid_api` journey group updated | In an Ops chat: *"Show the `paid_api` journey group."* | 4 items: `engine-accred-card`, `engine-trust-layer`, `engine-progression`, `infra-stripe`. |
| Render order is correct | In an Ops chat: *"List all non-Ready journey groups in order."* | Order: `paid_api`, `free_tier`, `internal`, `deprecated` (with `both` and `unknown` omitted because they have zero items — they sort in position 2 and 5 respectively if non-empty). |
| TypeScript clean in CI | Vercel deploy pipeline | Zero TS errors. |

If any Ops answer references `both` as non-empty, the deployed bundle hasn't picked up the registry change — diagnose: confirm Vercel rebuilt, confirm deployed `component-registry.json` carries the new journey values.

## Blocked On

- Nothing. D1 is self-contained.

## Open Questions

- **3 of 11 moves flagged at proposal time as defensible in either direction.** Each has a "Revisit condition" clause in its D-D1-n entry: D-D1-9 (`engine-ring-wrapper`) reverts to `both` if Mentor becomes a product. D-D1-10 (`infra-stripe`) stays `paid_api` unless free-tier gets a paid add-on path. D-D1-11 (`reasoning-sanitise`) moves back to `both` once mounted on any public-facing endpoint. No action this session.
- **1 item kept at `free_tier` but flagged.** `agent-support` (current `free_tier`) was kept because the website is currently free-tier only. When paid-tier launches, consider moving to `both`. No decision-log entry for a non-move; noting here as the handoff's forward-looking prompt.
- **Graceful-unknown-handling pattern logged for PR8.** First observation of the pattern in this session. Track recurrence; promote on third.

## Files Changed

- `website/public/component-registry.json` — edited (11 journey fields)
- `website/public/component-registry.json.backup-2026-04-25-d1` — new (pre-edit backup)
- `website/src/lib/context/ops-continuity-state.ts` — edited (4 comment sites + JOURNEY_ORDER array + order-comment)
- `website/src/lib/context/ops-continuity-state.ts.backup-2026-04-25-d1` — new (pre-edit backup)
- `operations/decision-log.md` — edited (12 D-D1-n entries appended at lines 1539–1722)
- `operations/decision-log.md.backup-2026-04-25-d1` — new (pre-edit backup)
- `operations/handoffs/ops/sage-ops-d1-journey-second-pass-close.md` — new (this file)

## Approximate Budget Impact

Negligible. The `formatted_context` adds one new group header (`deprecated: ...`) with one line of content. Total addition ~80–120 characters at the rendering surface. Well within noise.

## Orchestration Reminder (Protocol Element 21)

The `/adopted/session-opening-protocol.md` was the governing frame for this session. All 8 Part A elements executed at open. Part B conduct: element 9 (classification) applied explicitly to all three tasks; element 13 (single-endpoint proof) effectively carried from D3 — the registry-edit pattern was proven there; element 14 (verification immediate) applied to both registry and code edits; element 15 (deferred decisions logged) applied for the three ⚠️-flagged items via "Revisit condition" clauses; element 18 (scope caps) respected — the mid-session code sync was an explicit founder scope expansion, not drift.

No elements skipped.

## Next Session Should

1. Read this close note first (particularly the Founder Verification table and the three ⚠️-flagged items in Open Questions).
2. If any founder-verification check fails, diagnose before starting new work.
3. Only if all pass: pick a follow-on from the available candidates. Natural next:
   - **D2 (B4 flow-step descriptions)** — bounded, pending the budget-headroom decision.
   - **D4 (0h Hold-Point assessment)** — the P0 → P1 gate. Multi-session.
   - **D5 (move to P1 or P2)** — leave P0/0h and start the next build priority.
   - **Registry hygiene follow-on (optional)** — the "Frankenstein duplicate," "type-prefix naming invariant," and "graceful-unknown-handling" candidate patterns. Low urgency.
