# Session Close — 2026-04-24 (Protocol adoption + hub extract wiring)

**Stream:** founder
**Duration:** Single session with one Claude desktop restart mid-session (after project-instructions amendments applied at the Cowork UI).
**Scope:** D17 Track B from `/operations/discrepancy-sort-2026-04-23.md` — Session Opening Protocol adoption, canonical-sources list promotion, hub-route extract wiring. Plus KG11 promotion under PR5.

---

## Decisions Made

- **Decision 1 (amendments — founder-applied outside my change surface):** Three project-instructions amendments (D8 handoff format, D9 PR5 wording, D14 dual status taxonomy) applied at the Cowork project-instructions UI. Founder confirmed applied. Verification limitation: the project-instructions block loaded into this session's system prompt still showed the pre-amendment wording; verification requires the next session's system-prompt load.
- **Decision 2 (protocol adoption — DD-2026-04-24-09):** `/operations/outbox/session-opening-protocol-DRAFT.md` promoted to `/adopted/session-opening-protocol.md`. 21 procedural elements across Parts A/B/C. Now governs how an AI agent opens, conducts, and closes sessions in this project.
- **Decision 3 (hub wiring — Elevated, DD-2026-04-24-09):** `SESSION_OPENING_PROTOCOL_EXTRACT` constant added to `/website/src/app/api/founder/hub/route.ts` at line 63; prepended to `session_prompt` on both return branches of `getOpsRecommendedAction` (lines 756 and 766). Founder verified in production after deployment.
- **Decision 4 (canonical-sources promotion — DD-2026-04-24-09, paired with decision 2):** `/outbox/2026-04-24_canonical-sources-for-protocol.md` promoted to `/adopted/canonical-sources.md`. Paired with decision 2 to avoid a forward-dated reference churn.
- **PR5 third-recurrence promotion (KG11):** FUSE sandbox deletion permission added as a permanent entry in `/operations/knowledge-gaps.md`. Three recurrences cited (V3 `.docx` cleanup, prior session governance pass, this session's canonical-sources archival).

## Status Changes

- `/operations/outbox/session-opening-protocol-DRAFT.md`: Drafted → Archived (`/archive/2026-04-24_session-opening-protocol-DRAFT_applied.md`).
- `/operations/outbox/session-opening-protocol-hub-extract.md`: Drafted → Archived (`/archive/2026-04-24_session-opening-protocol-hub-extract_applied.md`).
- `/outbox/2026-04-24_canonical-sources-for-protocol.md`: Drafted → Archived (`/archive/2026-04-24_canonical-sources-for-protocol_applied.md`).
- `/adopted/session-opening-protocol.md`: Did not exist → Adopted (10,221 bytes).
- `/adopted/canonical-sources.md`: Did not exist → Adopted (4,709 bytes).
- `/website/src/app/api/founder/hub/route.ts`: Scaffolded for extract → Wired → Verified in production (founder-observed `session_prompt` output begins with the extract block after deployment).
- `/operations/knowledge-gaps.md`: KG1–KG10 → KG1–KG11.
- `/operations/decision-log.md`: 30 dated entries → 31 dated entries (DD-2026-04-24-09 appended).
- D17 Track B: Scheduled → Complete (both the adoption step and the hub wiring step landed this session).

## Next Session Should

1. Open `/adopted/session-opening-protocol.md` and `/adopted/canonical-sources.md` to confirm both files exist and cross-reference correctly (protocol points at `/adopted/canonical-sources.md` in two places; canonical-sources points back at the protocol in §"What this list replaces").
2. Verify the project-instructions amendments by quoting back the three amended passages from the next session's system-prompt load: 0b (5-section minimum + defined extensions), PR5 (Candidate / 2nd recurrence / Entry states), 0a (dual status taxonomy paragraph). If the system prompt still shows pre-amendment wording, flag that the Cowork UI apply did not propagate to the project-instructions context.
3. Operate under the Session Opening Protocol from session open (Part A 1–8) through to session close (Part C 19–21). This session was the protocol's first live application; the next is the first session governed by it from open.
4. If any protocol element feels awkward, friction-heavy, or missing something important, surface it as a candidate amendment. The protocol is under 24 hours old and will benefit from early friction reports.
5. No outstanding Track A or Track B work. D17 closed. The discrepancy register `/operations/discrepancy-sort-2026-04-23.md` is fully resolved.

## Blocked On

- Nothing currently blocks new work. All commitments from this session landed.

## Open Questions

- The knowledge-gaps register in `/operations/knowledge-gaps.md` now has KG1–KG11 entries, but the manifest's Knowledge Gaps Register section (`/manifest.md` §"Knowledge Gaps Register") names only KG1–KG7 permanent slots with KG3 and KG7 as TBD placeholders. Two numbering schemes coexist. This is a D12-adjacent drift that did not surface in the 2026-04-23 sort. Flagging for a future discrepancy pass; does not block any work.
- The adopted protocol's "How this protocol relates to the hub route" section still describes the hub-extract file with conditional wording ("see `/operations/outbox/...` until the hub is wired, then `/archive/...` after"). Now that both conditions have resolved (wired and archived), the text is accurate retrospectively but could be rewritten as past-tense for clarity. Minor housekeeping; not urgent.
- The draft files referenced the function as `getRecommendedAction`; the actual function is `getOpsRecommendedAction`. The drafts are now archived with the wrong name preserved for historical fidelity. If the naming becomes a recurring source of confusion, consider a follow-up that regenerates the archived drafts with corrected names, or simply note this in the KG register.

---

## Verification Method Used (0c Framework)

- **Adopted files (governance docs):** founder opens the two files at `/adopted/session-opening-protocol.md` and `/adopted/canonical-sources.md` in the next session and reads them. Cross-reference check: `grep "/adopted/canonical-sources.md" /Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/adopted/session-opening-protocol.md` should return two matches (Part A element 1, §"Canonical-sources reference"). I ran this check in-session and it passed.
- **Decision log:** new entry DD-2026-04-24-09 at lines ~1390+ of `/operations/decision-log.md`. Total dated entries: 31. Pre-edit archive at `/archive/2026-04-24_decision-log_pre-DD-09.md`.
- **Code change (wiring):** four automated checks in the same session — (a) constant defined once at line 63, (b) two references at lines 756 and 766 both inside `getOpsRecommendedAction` body, (c) file grew from 1,504 to 1,536 lines exactly (+32 matches the added block), (d) `npx tsc --noEmit` exited 0 with no errors. Production verification: founder triggered the hub's recommended-action step and confirmed `session_prompt` output begins with `--- Session Opening Protocol (extract) ---`.
- **KG11 promotion:** entry present in `/operations/knowledge-gaps.md` between KG10 and the closing "living document" note. Pre-edit archive at `/archive/2026-04-24_knowledge-gaps_pre-KG11.md`.

## Risk Classification Record (0d-ii)

- **Decision 1 (amendments):** Standard for me (drafting in `/outbox/` from the prior session); founder applied at UI, which is outside my change surface.
- **Decision 2 (protocol adoption):** Standard. New file creation under `/adopted/`; no code, no deployment, no live-system effect. D6-A compliance: no pre-edit archive needed because the target path was new.
- **Decision 4 (canonical-sources promotion):** Standard. Same reasoning as decision 2.
- **Decision log append (DD-09):** Standard. D6-A pre-edit archive captured before the append.
- **Decision 3 (hub wiring):** **Elevated.** Affects every future session's opening behaviour because every hub recommended-action call now prepends the protocol extract. Critical Change Protocol (0c-ii) followed in full — all 5 steps (what changes, what could break, existing sessions, rollback, verification) stated in the conversation before deployment, explicit approval obtained. Not reclassified upward.
- **KG11 addition:** Standard. Append-only entry to a governance doc with D6-A pre-edit archive.
- **Outbox cleanup (DRAFT + hub-extract + canonical-sources drafts):** Standard. Source files archived, source files removed after archive confirmed present.

## PR5 — Knowledge-Gap Carry-Forward

- **Promoted to KG11 this session:** FUSE sandbox deletion permission. Three recurrences cited. Resolution: call `mcp__cowork__allow_cowork_file_delete` proactively at session start for sessions expecting archive/move work.
- **New candidate (first observation):** Edit tool requires a Read on the file's specific region within the same conversation turn before the first edit lands, even if an earlier Read of a different region of the same file already occurred. Observed once this session (first edit on hub route, line 57 area, after prior Read of lines 654+). Cumulative count: 1. Candidate status per PR5. Promotion trigger: third recurrence across future sessions.
- **New candidate (first observation):** Cowork desktop restart as the mechanism for reloading amended project-instructions into an active session's system prompt. The amend → save → restart cycle is plausible but not documented in the project yet. Cumulative count: 1. Candidate status. Promotion trigger: third recurrence.

## Founder Verification (Between Sessions)

Open each of the following and confirm:

1. `/adopted/session-opening-protocol.md` — file exists, starts with "# Session Opening Protocol", status line reads "Adopted 2026-04-24 under D17", contains Parts A/B/C with 21 numbered elements.
2. `/adopted/canonical-sources.md` — file exists, starts with "# Canonical Sources — Session Opening Protocol reference list", status line reads "Adopted 2026-04-24 under D10-B", lists 9 sources in numbered order.
3. `/operations/decision-log.md` — newest entry title reads "DD-2026-04-24-09: Session Opening Protocol + Canonical Sources adopted". Total dated entries: 31.
4. `/operations/knowledge-gaps.md` — KG11 entry present, titled "KG11 — Sandbox File Deletion Permission (FUSE virtiofs)", three re-explanation sessions cited.
5. `/operations/outbox/` — empty (the two protocol drafts archived).
6. `/outbox/` — the date-prefixed canonical-sources file is gone; other files (e.g., `Flow_Path_Efficiency_Audit.md`, `2026-04-24_next-session-prompt.md`) remain untouched.
7. `/archive/` — five new entries from this session: `2026-04-24_decision-log_pre-DD-09.md`, `2026-04-24_canonical-sources-for-protocol_applied.md`, `2026-04-24_hub-route_pre-protocol-extract.ts.md`, `2026-04-24_session-opening-protocol-DRAFT_applied.md`, `2026-04-24_session-opening-protocol-hub-extract_applied.md`, `2026-04-24_knowledge-gaps_pre-KG11.md`. (That's six; count correction.)
8. Production hub — already verified in-session. Observed `session_prompt` output includes the extract block.

---

## Orchestration Reminder (Part C element 21)

This session was the first to operate under the Session Opening Protocol, but only partially — the adoption itself happened mid-session, so:

- **Pre-adoption portion (decisions 2 + 4):** governed by the pre-existing project-instructions frame plus the operating rules listed in the next-session prompt at session open (D6-A, 0d-ii, 0c-ii, PR1, PR2, PR7, communication signals). These rules are duplicated inside the now-adopted protocol but were already operating.
- **Post-adoption portion (decision 3 hub wiring + outbox cleanup + KG11 + this handoff):** first live application of the adopted protocol. The 21 elements were followed. Specifically: tier declaration at session open (Tier 1+2+3+4+5+6+8+9 read list stated); canonical-source read sequence respected; knowledge-gaps scan performed; risk classification stated (Elevated) with Critical Change Protocol steps all visible before deployment; single-endpoint proof (hub route is the single endpoint); verification immediate (grep + tsc in same session + founder production check); deferred decisions are logged (none deferred this session); tacit-knowledge promotion (KG11 under PR5); stewardship tiering (no F-series findings this session); scope caps respected; stabilised before close (all commitments landed); handoff in required-minimum + extensions format (this file); orchestration reminder (this section).
- **Elements skipped or not applicable:** Element 5 (hold-point status) — I did not explicitly name whether P0 hold-point is still active at session open; the work undertaken was protocol-level and did not trigger any hold-point prohibition, but the element should have been named explicitly. Minor protocol drift to flag in next session's opening.
- **Forward:** from the next session's open, the full protocol applies without the mid-session adoption asymmetry.
