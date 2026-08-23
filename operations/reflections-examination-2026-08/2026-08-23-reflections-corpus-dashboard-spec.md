# Reflections-Corpus Dashboard — Specification

**Date:** 2026-08-23 · **Arc:** reflections (item 5 of 5) · **Tier:** `governance`, design output only. **No build is licensed by this document.**

A read surface for the founder. Displays actionable items and project state; takes no actions. Queries the schema defined in the companion document (`2026-08-23-reflections-corpus-json-schema-design.md`) — every field named below is defined there.

---

## Panel 1 — Work item status

**Source:** record type 5 (work items), reflections-arc rows only (`arc: "reflections"`).

**Sort order:** in-progress first; then cleared (oldest `date_cleared` first); then blocked (blockers named); then complete last.

**Per-row display:** item ID, description, arc, status, date cleared or started, `days_in_current_status`, blocked-by list (`""` if empty).

**Flag:** any row with `status: "cleared"` and `days_in_current_status > 14` — displayed as its own alert line, not folded into the row: *"Item [ID] has been cleared for [N] days — no start recorded."*

**Worked read, against real current data:** WI-001 (this document's own work item) would render `status: complete`, `days_in_current_status: 0`, no flag. The four other reflections-arc items are not yet in `work-items.json` (none has been formally entered as a record) — a build session should backfill items 1–4 from the arc-plan sequencing before this panel is first queried, or Panel 1 will under-report the arc's actual state on day one.

---

## Panel 2 — Governance health

**Source:** record type 4 (governance rules).

**Per-row display:** rule ID, `rule_text_summary`, `last_verified_at`, staleness indicator.

**Staleness indicator (derived, per the schema's derivation logic):** green ≤30 days; amber 31–60 days; red >60 days or `last_verified_at` is null. Null displays as *"never verified — flag for immediate attention."*

**Named open item — corrected against real current data.** The brief for this panel specified a persistent alert for AC5: *"AC5: stated route count (13/16) does not match derived count (44). Correction cleared; not yet applied."* **That claim is stale.** The correction was applied in this same session — `manifest.md` and `CLAUDE.md` both corrected, committed (`7c77123`), pushed, Vercel green, confirmed by the founder before this document was drafted. AC5's `open_corrections` array (schema record type 4) is now empty; `last_verified_at` is `2026-08-23`, giving it a **green** staleness indicator with no persistent alert. **This panel's own named example, as specified, would have shipped a false alert on day one had it been transcribed unverified — which is the exact pattern this whole arc exists to catch, caught here instead of in a future build.** The panel's *mechanism* (a named alert driven by a non-empty `open_corrections` array) is sound and unchanged; only the AC5-specific instance is corrected.

---

## Panel 3 — Pattern activity

**Source:** record type 2 (reasoning patterns), all 25.

**Per-row display:** pattern ID, name, session count (`session_instances.length`), last session date, `governance_routing.status`, trend indicator.

**Trend indicator:** *"improving" / "stable" / "declining" / "insufficient data"*, with the session counts shown, e.g. *"declining: 8 of last 20 vs 3 of prior 20."* **Named gap, disclosed rather than silently built around:** this comparison requires each pattern's `session_instances` to be orderable against the corpus's most-recent-20/prior-20 window, which in turn requires every pattern record to carry a complete, up-to-date `session_instances` list. As of this design, the pattern records exist only as prose lists inside the findings record (§1), not as the schema's structured `session_instances` arrays — a build session must populate them before this panel's trend column can compute anything beyond `"insufficient data"` for every row.

**Priority flags:** IW-2 and IS-1 display *"Priority — active work item in reflections arc."* — driven by `priority_flag: true` on those two pattern records (see the schema worked example for IW-2).

---

## Panel 4 — Ruling tracker

**Source:** record type 3 (rulings).

**Per-row display:** ruling ID, date, `question_addressed` (summary), status, downstream work items unlocked (from `downstream_dependencies` where `item_type: "work_item"`).

**Flag:** any ruling `status: "pending"` for >7 days — *"Ruling [ID] has been pending for [N] days."*

**Sort:** active, then pending, then superseded.

**Worked read, against real current data:** every ruling produced in this arc so far (Q1–Q6 of the first round, the four follow-up questions of the second round, the two founder approvals) has `status: "active"` and none is `"pending"` — the arc has, as of this design, zero rulings that would trigger this panel's flag. This is worth stating because a panel spec with no live example of its own flag condition is easy to leave subtly wrong; the build session should construct a synthetic `pending` fixture to test the flag before relying on a real one appearing.

---

## Panel 5 — ATRF open questions

**Source:** record type 6 (ATRF questions), all rows.

**Per-row display:** question ID, `question_summary`, status, `ruling_reference` if ruled, `resolution_path`, `days_since_update`.

**Flag:** `days_since_update > 14` — *"GS-ATRF-[N] has not been updated in [N] days — resolution path: [path]."*

**Fixed panel note (verbatim from the brief, unchanged — it is correct as given):** *"These questions belong to the SageReasoning ATRF arc. They are displayed here for founder visibility only. No reflections arc work item addresses them."*

**Correction to the brief's framing, not to the panel itself:** the brief describes this record type as holding *"ATRF open questions"* and names GS-ATRF-1 through GS-ATRF-4 as the set. **As of this design, GS-ATRF-4 is not open — it was ruled 2026-08-19** (see the schema document's worked example, which flags this explicitly). The panel's status column already accommodates this (`status` includes `"ruled"`), so no panel redesign is needed — but the panel should not be read, at build time, as displaying four *open* items; it should be built to display whatever ATRF questions exist at whatever status they actually hold, verified at build time rather than assumed from this brief.

---

## Panel 6 — Arc summary

**Source:** record type 5, `arc: "reflections"` only, all five sequence positions.

**Display, in order:**
1. PR-series rule text (IS-1 encoding) — status, date cleared, days in status
2. First letter ("On writing before knowing") — status, date cleared, days in status
3. IW-2 routes (a) and (b) — status, date cleared, days in status
4. Combined scoping session (reflect-cadence + IW-2 route (c)) — status, blocked by items 1–3 until complete
5. JSON schema and dashboard — status, date cleared, days in status

**Arc health indicator:** *"On track"* if no item has been cleared >14 days without starting; *"Attention needed"* otherwise.

**Worked read, against real current data:** item 5 (`WI-001`) is `complete` as of today. Items 1–3 are `cleared` as of the founder's sequencing approval (2026-08-23) with `date_cleared: "2026-08-23"` and, as of this document, `days_in_current_status: 0` — none has yet started. Item 4 is correctly `blocked` (blocked_by: ["WI-002", "WI-003", "WI-004"] or equivalent, once those IDs exist). **Arc health today: "On track"** — nothing has sat cleared past 14 days, because nothing was cleared before today. This reading will need re-querying the day this document is actually loaded into the schema; it is not a live value, only what the state should compute to at time of writing.

**Boundary, unchanged from the brief and correct:** SageReasoning arc sequencing (ATRF, standing-runner, epistemic status, O-C Gate-3) is not displayed in this panel. Those arcs have their own governance surfaces; this panel is reflections-arc-only.

---

## Panel 7 — Last updated

**Single header line, compact, one line per record type:**

```
Schema v[X] · imported [date time] · sessions: N · patterns: N · rulings: N · rules: N · work items: N · ATRF questions: N
```

**Staleness flag:** if any record type has not been updated in >7 days, append a named alert for that type.

**Worked read, against real current data (as of this document's authoring — a snapshot, not a live value):** session reflections **105**, reasoning patterns **25**, rulings **~12** (the Q1–Q6 first round, the four second-round follow-ups, the two founder approvals — an exact count depends on whether each is entered as one record or several; the build session should fix this convention before import, since it changes what this line reports), governance rules — at minimum AC5 plus every PR/R/AC rule cited across the findings record's §4, count not yet fixed, work items **1** (only WI-001 exists as a populated record today), ATRF questions **1** (GS-ATRF-4, the only one worked in this design). Every count above except session reflections and reasoning patterns is provisional, because most record types have not yet been populated from the findings-record prose into the schema's structured form — that population is itself a build-session task, not something this design document performs.

---

## One cross-cutting note, not assigned to any single panel

Two of the seven panels (2 and 5) were specified in the brief with content that has already gone stale or was already imprecise by the time this document was written — AC5's correction status, and GS-ATRF-4's open/ruled status. Both are corrected above, not silently, and both are named here together because the pattern is the same one twice in one brief: **a claim about current state, inherited into a design document, not re-checked against its source before being written down.** This document is itself part of the reflections arc that exists to diagnose exactly that pattern. Catching it here, in the document specifying the dashboard meant to surface it, is either a good sign (the discipline is being applied) or a small irony worth naming plainly rather than passing over — it is named here as both.
