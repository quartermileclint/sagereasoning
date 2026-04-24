# Canonical Sources — Session Opening Protocol reference list

**Status:** Adopted 2026-04-24 under D10-B (promoted alongside the Session Opening Protocol, same session). See decision-log DD-2026-04-24-09.
**Source:** `/outbox/2026-04-24_canonical-sources-for-protocol.md` (archived at `/archive/2026-04-24_canonical-sources-for-protocol_applied.md`).
**Referenced by:** `/adopted/session-opening-protocol.md` Part A elements 1 and 2.
**Purpose:** Single source of truth for "what an agent must read at session open, and where to find it." Any doc that currently names its own list of canonical sources should point to this file instead.

---

## The canonical sources (ordered by session-open read sequence)

1. **Manifest** — `/manifest.md`. Master governance. R0–R20. Read before every task. Current version: CR-2026-Q2-v4 (Apr 18 2026).

2. **Project instructions** — configured at the Cowork project level (not a repo file). Pinned in the session system prompt. Covers priorities P0–P7, process rules PR1–PR9, the 0a–0h P0 items, communication signals, risk classification.

3. **Most recent handoff in the relevant stream** — `/operations/handoffs/[stream]/` where `[stream]` is the session's intended focus (founder, ops, tech, growth, support, mentor). Read the most recent close or handoff file. If uncertain which stream applies, read founder/.

4. **Decision log** — `/operations/decision-log.md`. Scan the most recent entries relevant to the session's scope. Specifically relevant entry IDs should be named by the handoff or by the founder.

5. **Active discrepancy register** — `/operations/discrepancy-sort-[latest-date].md`. Shows open governance-corpus discrepancies by severity. Read if the session touches governance, or if you need to confirm the corpus's current reconciliation state.

6. **Knowledge gaps register** — `/operations/knowledge-gaps.md`. Scan for any KG entry whose concept is relevant to the session's scope. Read the resolution before beginning work.

7. **Project state** — `/PROJECT_STATE.md`. Current project status narrative (what's in flight, what's just shipped, what's queued). Read if the session needs "where are we now" context.

8. **Technical state** — `/summary-tech-guide.md` and `/summary-tech-guide-addendum-context-and-memory.md`. Current technical-state reference. Read sections relevant to the session's scope (e.g., if touching orchestration, read addendum §D.6; if touching safety, read §D.6 [GAP] list).

9. **Verification framework** — `/operations/verification-framework.md`. Reference for how to verify work. Read when planning verification steps for this session's work.

---

## Tier assignment

- **Every session:** 1, 2, 3.
- **Sessions touching governance:** add 4, 5, 6.
- **Sessions touching code:** add 8, 9.
- **Sessions needing orientation:** add 7.

The protocol instructs the agent to state which tier it is reading at session open, so the founder can confirm the right context is being loaded (Session Opening Protocol Part A element 1).

---

## What this list replaces

Historically:
- `INDEX.md` was a source-finding layer. After the D4-D trim it is a governance-navigator only — it tells you where governance documents live but does not tell you which to read for a given session.
- Tech guide §5 listed a 10-step sequence that served as a de facto session-opening checklist. After D15-B it is re-framed as tactical actions inside P0–P2, not a session-opening list.
- The hub route's `getRecommendedAction` system prompt names "specific files, endpoints, or decisions" but does not point at a canonical-sources list. Under D17 Track B the hub is updated (separately, Elevated-risk change) to prepend a distilled protocol extract that references this file.

This list is now:
- The authoritative list an agent reads at session open.
- Referenced by the Session Opening Protocol (`/adopted/session-opening-protocol.md`).
- Distilled into the hub's prepended extract.
- Pointed to by any doc that previously carried its own reading list.

---

## Maintenance

When a new persistent reference is added (or an existing one retired), the list above is updated first. Every doc pointing to this list gets the update for free — no manual propagation.

Any edit to this file follows D6-A archive protocol: pre-edit copy to `/archive/[date]_canonical-sources_pre-[change-id].md`, then edit, then reference the change in the decision log.

Revisit condition: if a session opens without one of these sources being read and the result is a re-explanation of a concept the source would have covered, the list needs a clearer tier assignment or the source itself needs work. Logged as a KG candidate per PR5.
