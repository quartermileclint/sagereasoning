# Session Close — 2026-04-24 (Governance cleanup + Session Opening Protocol draft)

**Stream:** founder
**Duration:** Single session continued across a compaction boundary.
**Scope:** Track A (governance discrepancy resolution D5, D8, D9, D10–D12, D14–D16 + D13 Minor) + Track B (Session Opening Protocol draft, not yet adopted or wired).

---

## Decisions Made

- **D5 resolution (Option B):** `TECHNICAL_STATE.md` retired to `/archive/2026-04-11_TECHNICAL_STATE_retired.md` → Removes stale-doc drift; addendum + tech guide remain canonical for technical state.
- **D8 resolution (Option C):** 0b handoff format amended to minimum + defined extensions → Amendment drafted to `/outbox/2026-04-24_project-instructions-amendments.md` (Amendment 1). Founder applies via Cowork project-instructions UI.
- **D9 resolution (Option A):** PR5 amended to recognise Candidate / 2nd recurrence / Entry states with explicit pre-population authorisation → Amendment 2 in same outbox file.
- **D10 resolution (Option B):** Canonical sources list drafted once at `/outbox/2026-04-24_canonical-sources-for-protocol.md` → Feeds Track B protocol and will be pointed to by any doc currently carrying its own reading list.
- **D11 resolution (Option B):** Tech guide documentation amended to match actual library layout → Six [DIVERGENCE] tags removed from §1.2, §1.3, §1.5.
- **D12 resolution (Option A):** All [TBD] markers cleared from tech guide and addendum in one pass → Grep confirms zero remaining tags.
- **D13 resolution (Option A):** "1,505 lines" references replaced with descriptor "~1,500 lines, single-file orchestration endpoint" → Removes drift surface permanently.
- **D14 resolution (Option A):** Both status taxonomies documented → Amendment 3 to project instructions (0a paragraph) explicitly separates implementation status (0a) from decision status (0f).
- **D15 resolution (Option B):** Tech guide §5 re-framed as tactical actions inside P0–P2 with "Serves priority" column mapping each of 10 steps to P0–P7 → Two-view reconciliation preserved.
- **D16 resolution (Option B):** R20a-on-hub deferral + Ask-the-Org feature both backfilled to decision log (DD-2026-04-24-07, -08) → Closes two known PR7 gaps at once.
- **D17 Track B protocol drafted:** Full protocol at `/operations/outbox/session-opening-protocol-DRAFT.md` (21 elements across Parts A, B, C) + distilled hub extract at `/operations/outbox/session-opening-protocol-hub-extract.md` (~380 words between fences) → Hub-route change NOT applied; awaiting founder approval of the two draft files first.

## Status Changes

- `/operations/discrepancy-sort-2026-04-23.md`: Partially resolved → Track A complete (only D17 open, and D17 is Track B which now has draft outputs).
- `/TECHNICAL_STATE.md`: Live → Archived (superseded by tech guide + addendum).
- `/INDEX.md`: Stale → Governance-navigator only (trimmed under D4-D earlier this session).
- `/summary-tech-guide.md`: Contains [DIVERGENCE] and [TBD] tags → Clean.
- `/summary-tech-guide-addendum-context-and-memory.md`: Contains [TBD] and line-count drift → Clean.
- Session Opening Protocol: Undrafted → Drafted in outbox (not yet Adopted).
- Hub route `getRecommendedAction` extract wiring: Scoped → Scoped (no code change landed; plan documented in extract file).

## Next Session Should

1. Open the three amendments file (`/outbox/2026-04-24_project-instructions-amendments.md`) and the two protocol drafts (`/operations/outbox/session-opening-protocol-DRAFT.md` + `/operations/outbox/session-opening-protocol-hub-extract.md`). Read them.
2. Decide on the three project-instructions amendments. Apply them at the Cowork project-instructions UI (cannot be applied from a repo file). Confirm in the following session by asking me to quote back the new wording.
3. Decide on the Session Opening Protocol draft. If approved: move the draft to `/adopted/session-opening-protocol.md` via D6-A archive protocol (pre-edit copy first).
4. Decide on the hub-route change. If approved: I will prepare the exact diff against `/website/src/app/api/founder/hub/route.ts` `getRecommendedAction`, with rollback plan, for Elevated-risk review before deployment.
5. Once the protocol is adopted and the hub is wired, consider moving the two outbox files to `/archive/2026-04-24_...-applied.md` per the outbox convention.

## Blocked On

- Founder review of the three amendments and the two protocol drafts. No further AI action on those items until approved, amended, or rejected.
- Hub-route edit requires founder approval of the extract text first, because the extract drives the edit.

## Open Questions

- Should the canonical-sources list itself be promoted to `/adopted/` (alongside the protocol) rather than living in `/outbox/`? Arguments either way: the list is pointed-to by the protocol and is reference material, not procedural — `/outbox/` is not the right long-term home.
- Should the hub-route change be classified Critical rather than Elevated? My classification is Elevated (no safety-critical functions touched; orchestration behaviour change is significant but reversible). Founder may reclassify upward per 0d-ii.

---

## Verification Method Used (0c Framework)

- Discrepancy-sort file: after each edit, founder can read the updated entry's resolution block and confirm it matches the option chosen.
- Decision log: new entries DD-2026-04-24-04 through -08 are appended; founder reads top of log to see the day's additions.
- Tech guide + addendum: `grep -n "\[TBD\]\|\[DIVERGENCE\]\|1,505"` across both files should return zero matches.
- Protocol drafts: founder reads the two outbox files directly.

## Risk Classification Record (0d-ii)

- All Track A edits (discrepancy-sort, decision log, tech guide, addendum, INDEX earlier): **Standard**. Documentation-only, additive or corrective, no code or deployment surface.
- File retirement (TECHNICAL_STATE.md, V3 docx companions): **Standard**. Move-to-archive operations with `.md` or equivalent content preserved.
- Project-instructions amendments (outbox file only): **Standard** for drafting; the actual apply step at the Cowork UI is a founder action outside my change surface.
- Session Opening Protocol draft (outbox only, not adopted): **Standard**. No governance change yet; adoption is the change.
- Hub-route change (not applied): **Elevated**. Affects orchestration for every future session. Not applied this session — awaiting founder approval of the extract text first.

## PR5 — Knowledge-Gap Carry-Forward

- FUSE sandbox deletion permission (required `allow_cowork_file_delete` tool). Observed 2nd time this session. Cumulative count: 2. Will be logged as a permanent KG entry on third recurrence per PR5.
- Project-instructions-are-at-Cowork-project-level (not editable as a repo file). Observed for the first time this session. Cumulative count: 1. Candidate status.

## Founder Verification (Between Sessions)

- Discrepancy-sort status: open `/operations/discrepancy-sort-2026-04-23.md` — top status block should read "Track A complete" with D17 scheduled as Track B.
- Summary table: every row D1–D16 should show "✅ Resolved".
- Decision log: newest five entries should be DD-2026-04-24-04 through -08. Total dated entries: 31 (matches addendum §E.2 count).
- Tech guide: grep `[TBD]` or `[DIVERGENCE]` or `1,505` across both tech-guide files — expected: 0 matches.
- Protocol drafts: open `/operations/outbox/session-opening-protocol-DRAFT.md` and `/operations/outbox/session-opening-protocol-hub-extract.md`. The first has 21 numbered elements across Parts A/B/C. The second has a fenced extract block ~380 words.
- Amendments: open `/outbox/2026-04-24_project-instructions-amendments.md`. Three amendments, each with "existing text" and "replace with" blocks for copy-paste at the Cowork UI.

---

## Orchestration reminder

This session was not conducted under the Session Opening Protocol (it was the session that drafted it). Track A resolutions and Track B drafts were produced under the existing project-instructions frame + the operating rules named in the next-session prompt. The protocol drafted here is intended to govern sessions from adoption onward, not retroactively.

One protocol-like obligation was honoured throughout: D6-A archive protocol. Pre-edit copies were made for every governing-document change: `/archive/2026-04-24_*_pre-D3-docx-followthrough.md`, `_pre-D4-trim.md`, `_pre-D4-resolution.md`, `_pre-DD-04-05.md`, `_pre-Notable-pass.md` (x4). Eight archive files created this session.
