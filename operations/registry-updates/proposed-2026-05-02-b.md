# Registry Update Proposal — 2026-05-02 (b)

**Registry version:** 1.3.0
**Registry lastUpdated:** 2026-05-02
**Lookback range (Pass 1 anchor):** 2026-05-02 (D-REGISTRY-UPDATE-v1.3.0-2026-05-02 — most recent non-superseded update entry) → 2026-05-02 (today)
**Components audited (Pass 4):** 168 existing + 22 proposed new = 190
**Handoffs scanned (Pass 1):** 8 (2026-05-02 only)
**Decision-log entries scanned (Pass 1):** 8 (2026-05-02 only)
**Components proposed for update:** 4 (existing alt-3 entries)
**New components proposed:** 22 (alt-3 deliverables not previously in registry — explicit founder approval required per skill discipline)
**Ambiguous matches needing founder input:** 0

**Founder scope direction at session open (Option B — Comprehensive):** confirmed via AskUserQuestion 2026-05-02. Update existing 4 alt-3 entries (path/status/blocker/notes) AND add 22 new entries for the alt-3 deliverables that are now Adopted but not yet tracked in the registry.

**Risk classification:** Standard under 0d-ii. JSON content edits to `/website/public/component-registry.json`; pre-edit backup; rollback via restore-from-backup. No code; no auth/encryption/session/redirect surface; no schema migrations; no live-system effect beyond dashboard rendering.

**Version bump rationale:** Minor bump (1.3.0 → 1.4.0). 22 new components added; per skill semver rules — minor when components added or removed.

---

## 1. Source-scan findings (Pass 1)

Pass 1 scans `/operations/handoffs/**/*.md` and `/operations/decision-log.md` from the lookback anchor. Lookback window is same-day (2026-05-02), so the scan covers everything that landed since v1.3.0 was applied earlier today.

Source decision-log entries:
- D-RAG-MENTOR-ALT3-CRITICAL-PATH-MOVED-TO-ADOPTED-2026-05-02 (D2/D3/D8 moved)
- D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (22-file move + Path A approval)
- D-A16-CATALOGUE-ASSEMBLED-AND-ADOPTED-2026-05-02 (new D-A16 file)

Source session-closes:
- 2026-05-02-rag-phase1-completion-review-close.md
- 2026-05-02-d-a16-catalogue-assembly-close.md

### 1.1 doc-rag-mentor-alt3-canonical-framework (D2)

**Current state:**
- status: `designed`
- oldStatus: `""`
- path: `/drafts/rag-mentor-alt3/canonical-framework.md`
- blocker: `"Next: founder review/approval (with D24 coverage-gap amendments incorporated); on approval, move from /drafts/ to /adopted/ as Elevated change."`
- notes: `"Drafted 2026-05-01 under D-RAG-MENTOR-ALT3-PHASE1-DRAFTS. Critical-path: must be founder-approved before downstream Phase-1 deliverables proceed. D24 audit identified five small coverage-gap recommendations for Phase-1 session 2 amendment (none require redesigning the 9+1 set)."`

**Proposed change:**
- status: `designed` → **`wired`** (status promotion)
- oldStatus: `""` → `"designed"` (capture prior status per Step 8.2 rule)
- path: `/drafts/rag-mentor-alt3/canonical-framework.md` → **`/adopted/rag-mentor-alt3/canonical-framework.md`**
- blocker: rewrite to `"Next: D2 amendment for the five D24 coverage-gap additions (prior_feedback projection note for Route 1; aggregate-across-options note for Route 2; policy-mode-specific Table 6 for Route 3; quick-depth Table 0/1a for Route 6; Table 4a dual applicability for Routes 7+8 ritual flow). Amendment requires re-approval per D2 approval-gate footer (Elevated risk per project instructions Priority 2 Candidate B)."`
- notes: rewrite to `"Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-CRITICAL-PATH-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 under D-RAG-MENTOR-ALT3-CRITICAL-PATH-MOVED-TO-ADOPTED-2026-05-02. The deterministic engine's mechanism taxonomy (9+1). Critical-path deliverable for the alt-3 architecture. D24 audit identified five small coverage-gap amendments deferred to a focused D2-amendment session (Elevated risk; D23 §O5.2)."`

**Evidence:**
- Source: `/operations/decision-log.md` D-RAG-MENTOR-ALT3-CRITICAL-PATH-APPROVED-2026-05-02 (Path A approval) + D-RAG-MENTOR-ALT3-CRITICAL-PATH-MOVED-TO-ADOPTED-2026-05-02 (move executed).
- Quoted text: *"Founder approved the three Phase-1 critical-path deliverables (D2 — canonical mechanism framework; D3 — passion taxonomy; D8 — operationalised scoring rules with Validation Addendum) as drafted. Path A under the Phase-1 session 2 prompt's pre-condition options."*
- Reasoning: Approval moves D2 from "drafted under review" to Adopted; move executes the file relocation. Status promotion `designed` → `wired` matches the convention used by `doc-rag-mentor-alt3-handoff` (status `wired` = active governance document). Blocker rewrite removes the satisfied conditions ("founder review/approval", "move from /drafts/ to /adopted/") and surfaces the actual remaining work (D2 amendment per D24 coverage gaps — Project Instructions Priority 2 Candidate B — Elevated risk).

### 1.2 doc-rag-mentor-alt3-passion-taxonomy (D3)

**Current state:**
- status: `designed`
- oldStatus: `""`
- path: `/drafts/rag-mentor-alt3/passion-taxonomy.md`
- blocker: `"Next: founder review/approval; on approval, move from /drafts/ to /adopted/ as Elevated change."`
- notes: `"Drafted 2026-05-01 under D-RAG-MENTOR-ALT3-PHASE1-DRAFTS. Critical-path: must be founder-approved before downstream Phase-1 deliverables proceed. AC3 (Zone 2 domains) and R20d (relationship asymmetry) compliance preserved."`

**Proposed change:**
- status: `designed` → **`wired`**
- oldStatus: `""` → `"designed"`
- path: `/drafts/rag-mentor-alt3/passion-taxonomy.md` → **`/adopted/rag-mentor-alt3/passion-taxonomy.md`**
- blocker: clear to `""` (no remaining work named; per Q2 rule, empty blocker only when no work remains AND no specific next step is named)
- notes: rewrite to `"Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-CRITICAL-PATH-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 under D-RAG-MENTOR-ALT3-CRITICAL-PATH-MOVED-TO-ADOPTED-2026-05-02. The deterministic engine's passion vocabulary that Rules 2, 3, 5 of D8 consume. AC3 (Zone 2 domains) and R20d (relationship asymmetry) compliance preserved."`

**Evidence:** Same source decision-log entries as 1.1.

### 1.3 doc-rag-mentor-alt3-operationalised-rules (D8)

**Current state:**
- status: `designed`
- oldStatus: `""`
- path: `/drafts/rag-mentor-alt3/operationalised-rules.md`
- blocker: `"Next: founder review/approval (with Validation Addendum incorporated); subsequent revision pass folds the three adjustments into per-rule sections before the rule book moves from /drafts/ to /adopted/ as Elevated change."`
- notes: long current text — preserves Validation Addendum context.

**Proposed change:**
- status: `designed` → **`wired`**
- oldStatus: `""` → `"designed"`
- path: `/drafts/rag-mentor-alt3/operationalised-rules.md` → **`/adopted/rag-mentor-alt3/operationalised-rules.md`**
- blocker: rewrite to `"Next: future revision pass folds the Validation Addendum's three adjustments (Rule 9 unstable-vs-false phronesis distinction; Rule 8 compound severity for INFLATION/DEFLATION same-root errors; Rule 7 explicit operative-circle dependency on Rule 6) into per-rule sections to produce v1.1.0; the architecture-exercise transcript is the source for that revision."`
- notes: rewrite to `"Adopted 2026-05-02 as v1.0.0 with Validation Addendum carried forward, under D-RAG-MENTOR-ALT3-CRITICAL-PATH-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 under D-RAG-MENTOR-ALT3-CRITICAL-PATH-MOVED-TO-ADOPTED-2026-05-02. The deterministic engine's per-instance scoring logic — 10 rules (PROHAIRESIS-FILTER-001 through KATORTHOMA-PROXIMITY-001). All ten rules PARTIAL cleanliness with small named interpretive sub-steps mostly resolved by structured intake (AC-13 Tier 1) and AC-17 named flags. Validation Addendum (2026-05-02 under D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29) names three adjustments + description correction (deterministic-for-rule-like + soft-gating-for-interpretive-core) + scope limitation (philodoxia calibration; recalibration needed for other primary passions). Phase-1 session 2 deliverables built against the addendum-only state per D-RAG-MENTOR-ALT3-PHASE1-SESSION2-DRAFTS-2026-05-02."`

**Evidence:** Same source entries plus D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29 (Validation Addendum context preserved).

### 1.4 doc-rag-mentor-alt3-r20a-audit (D24)

**Current state:**
- status: `designed`
- oldStatus: `""`
- path: `/drafts/rag-mentor-alt3/consumer-workflow-audit.md`
- blocker: long substantive blocker text naming seven current-state findings + Phase-1 session 2 scope refinements.
- notes: drafted state.

**Proposed change:**
- status: `designed` → **`wired`**
- oldStatus: `""` → `"designed"`
- path: `/drafts/rag-mentor-alt3/consumer-workflow-audit.md` → **`/adopted/rag-mentor-alt3/consumer-workflow-audit.md`**
- blocker: rewrite to `"Next: founder triage of seven current-state findings (Ops Hub malformed body to /api/score-decision; missing distress handling on Ops Hub callers; KG1 rule 2 candidate violations on Routes 2, 3, 7; fire-and-forget on safety-relevant distress-event log at /api/reflect; user_id vs auth.user.id at /api/reflect — Critical under PR6/R17; partial R20a input coverage on Routes 1, 2, 6). The five D2 coverage-gap amendments are now logged as a separate D2-amendment session per D23 §O5.2 (Project Instructions Priority 2 Candidate B)."`
- notes: rewrite to `"Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 (same entry). End-to-end workflow audit of the eight R20a perimeter routes per AC5. Headline findings: AC-18 Option 1 (no-shareable-artifact constraint scoped to deferral-resolution) is sufficient as written; two snapshots recommended (/api/mentor/private/reflect already produced 2026-05-02 per D-MENTOR-PRIVATE-REFLECT-PRE-ALT3-SNAPSHOT-2026-05-02; /api/reason snapshot deferred per D21/D23 §O4.2 to land before Phase-2 pass 3); seven current-state findings span Standard to Critical classifications; D11/D13/D14a/D14b refinements incorporated in Phase-1 session 2 deliverables."`

**Evidence:**
- Source: `/operations/decision-log.md` D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A approval covers D24 reviewed and accepted as found) + D-MENTOR-PRIVATE-REFLECT-PRE-ALT3-SNAPSHOT-2026-05-02 (one of D24's two recommended snapshots already produced).

### 1.5 doc-rag-mentor-alt3-handoff (existing entry — Pass 4 internal-consistency check only)

**Current state:** status `wired`; path correct (`/operations/handoffs/founder/2026-04-29e-...md`); notes mention Validation Addendum added 2026-05-02; blocker empty.

**Pass 4 check:** Internal consistency confirmed. Status × blocker × notes are mutually consistent. The notes reference the Validation Addendum scope limitation (philodoxia calibration). No update proposed; the entry remains as v1.3.0 set it.

---

## 2. Code-grep findings (Pass 2)

For each component with a `path` field, run targeted import-pattern grep against `/website/src/` to check integration consistency.

### 2.1 All alt-3 governance documents

**Targeted grep result:** 0 distinct files in `/website/src/` reference any alt-3 deliverable's path (verified by `grep -r "rag-mentor-alt3" website/src/` and `grep -r "ADR-RAG-MENTOR-ALT3" website/src/` — both empty).

**Reasoning:** Per Pass 2 table — alt-3 deliverables are governance documents, not code-consumed data. Status `wired` (or proposed `wired` for the 4 promotions) reflects "active governance reference" not "imported by code". Zero code refs is the consistent expected state per the convention used for `doc-rag-mentor-alt3-handoff`. No flags. No path corrections needed.

### 2.2 ADR (D1) — to be added

**Path:** `/adopted/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md`
**Targeted grep result:** 0 distinct files in `/website/src/` reference this path. Consistent with proposed status `wired` (active architectural reference, not imported by code).

---

## 3. Transitive impact findings (Pass 3)

Pass 3 walks `connects` and `deps` arrays for components changed in Pass 1 / Pass 2, plus any registry entries whose `blocker` or `notes` text references the changed components' old state.

### 3.1 9 tool-sage-* entries — no transitive update needed

The following entries reference "alt-3 future-phase block" / "Phase-3+ migration to alt-3 deterministic-engine consumer pattern" in their `notes` and `blocker`:

- `agent-private-mentor`
- `tool-sage-decide`
- `tool-sage-score`
- `tool-sage-score-document`
- `tool-sage-score-social`
- `tool-sage-iterate`
- `tool-sage-converse`
- `tool-sage-reason`
- `tool-sage-reflect`
- `tool-sage-scenario`
- `tool-sage-audit`
- `tool-sage-filter`

These references cite the architecture (D-RAG-MENTOR-ALT3-ADOPTED-2026-04-29) and audit (D24) by decision-log ID, not by deliverable path or ID. Their text remains accurate after the moves. No update needed.

### 3.2 Existing 4 alt-3 doc entries — connects[] arrays remain valid

The 4 existing alt-3 doc entries cross-reference each other in `connects[]` by ID:
- `doc-rag-mentor-alt3-canonical-framework` connects to `[doc-rag-mentor-alt3-handoff, doc-rag-mentor-alt3-passion-taxonomy, doc-rag-mentor-alt3-operationalised-rules]`.
- `doc-rag-mentor-alt3-passion-taxonomy` connects to `[doc-rag-mentor-alt3-handoff, doc-rag-mentor-alt3-canonical-framework, doc-rag-mentor-alt3-operationalised-rules]`.
- `doc-rag-mentor-alt3-operationalised-rules` connects to `[doc-rag-mentor-alt3-handoff, doc-rag-mentor-alt3-canonical-framework, doc-rag-mentor-alt3-passion-taxonomy, engine-sage-reason-engine]`.
- `doc-rag-mentor-alt3-r20a-audit` connects to `[doc-rag-mentor-alt3-handoff, tool-sage-reflect, tool-sage-reason, agent-private-mentor]`.

These IDs all remain valid. Connects use IDs (not paths), so the file-move does not break the references. No update needed to the existing 4 entries' `connects[]` arrays.

**Note for new entries:** with 22 new alt-3 doc entries proposed, the existing 4 entries' `connects[]` arrays could be expanded to reference the new entries — but the minimum-surprise approach is to keep existing connects as-is and have the 22 new entries populate their own connects with the relevant alt-3 IDs (including the existing 4). The cross-reference graph remains symmetric for human navigation purposes; programmatic walks see the same edges from at least one side.

---

## 4. Internal consistency findings (Pass 4)

Pass 4 walks every row (168 existing + 22 proposed = 190) checking the Q1–Q5 conventions.

### 4.1 168 existing components

**Status × blocker, status × notes, blocker × notes, humanReady/agentReady, journey × status:** Pass 4 conventions verified clean across all 168 existing rows in the 2026-04-28 v1.2.2 audit (Q3 batch) and 2026-04-29 v1.2.3 enhancement (achievement-language pare-down, Q5 ⚠ prefix). The 2026-05-02 v1.3.0 update added 5 new entries that passed the proposal's Pass 4 sweep (per D-REGISTRY-UPDATE-v1.3.0 reasoning). No drift introduced this session. **No flags.**

### 4.2 4 existing alt-3 doc entries — post-update consistency

Post-Pass-1 update, each entry has:
- status: `wired`
- blocker: either empty (D3 — no remaining work) or substantive next-step text (D2, D8, D24)
- notes: describes Adopted state with date and decision-log entry IDs
- connects: ID-based, all valid
- humanReady: `ready`, agentReady: `na` — matches handoff convention for governance docs

**Q2 check:** Verified rows have remaining-work blocker text where work exists (D2 amendment; D8 v1.1.0 revision; D24 founder triage of seven findings). D3 has no named next step → blocker empty per Q2 rule.

**Q5 ⚠ prefix check:** Not engaged for these rows — D3's empty blocker is a "no remaining work AND no named follow-up" case, not a "conditional review" case.

No internal inconsistencies introduced. ✓

### 4.3 22 proposed new entries — Q1–Q5 design

Each new entry designed to comply with Q1–Q5:
- **Q1 (one comprehensive skill):** This proposal runs all four passes per the redesigned skill — confirmed.
- **Q2 (preserve remaining-work note):** Each new entry's `blocker` either describes the next work step or is empty per the rule. Most new entries have empty blockers (the deliverables are now Adopted; the next action is Phase-2 build at its own time, named at the deliverable level not the registry level).
- **Q3 (na for pipeline-internal):** `humanReady` and `agentReady` set to `ready` and `na` respectively — matching the convention for governance documents (handoff entry pattern). Documents are human-readable; not directly invoked by external agents.
- **Q4 (edit both Layer A and Layer B):** All Layer A and Layer B fields populated for new entries.
- **Q5 (⚠ prefix for cleared-blocker conditional reviews):** Not engaged in any new entry — none have conditional review triggers.

---

## 5. New component proposals (22 entries)

Each proposal includes the full JSON entry. All entries follow the established conventions for governance/document entries (no `journey` field; `priority: "P3"`; `proximity: ""`; `humanReady: "ready"`; `agentReady: "na"`; `origin: ""`; `oldStatus: null` for new components).

### 5.1 doc-rag-mentor-alt3-adr-01 (D1 ADR)

**Justification:** Top-level architectural decision record documenting AC-1 through AC-19 with cross-references to all 23 deliverables. Adopted 2026-05-02 per D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02. Mirrors the role of `doc-rag-mentor-alt3-handoff` but as the formal ADR rather than the architecture-brief handoff.

```json
{
  "id": "doc-rag-mentor-alt3-adr-01",
  "name": "Alt-3 ADR-01 (Translation-Sandwich + Deterministic Engine + Three-Tier Clarification + Reflect-Endpoint-First Build Order)",
  "type": "governance",
  "subtype": ["architecture"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md",
  "desc": "Architectural Decision Record documenting AC-1 through AC-19 — passion-indexed retrieval, hybrid retrieval, re-ranking, small chunks, strict prompting, Phase-1 conversation-only surface, single canonical mechanism framework, score-in-reply, slot-filled focus questions, proximity ring wired, translation-sandwich, three-tier intake clarification, withholding as deterministic kathekon, sub-option 1b structured intake at reflect endpoint, three principles for long-deferred questions, two residual seams, no-shareable-artifact constraint, reflect-endpoint-first build order. Cross-references all 23 Phase-1 deliverables.",
  "notes": "Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 (same entry). Top-level architectural commitment record — alternatives considered (alt 1, alt 2 progression) and consequences (positive/negative/neutral) documented. Companion to doc-rag-mentor-alt3-handoff (the architecture brief).",
  "deps": [],
  "rules": ["R0", "R6a", "R6b", "R6c", "R6d", "R6e", "R7", "R17", "R19", "R20"],
  "priority": "P3",
  "proximity": "",
  "connects": ["doc-rag-mentor-alt3-handoff", "doc-rag-mentor-alt3-canonical-framework", "doc-rag-mentor-alt3-passion-taxonomy", "doc-rag-mentor-alt3-operationalised-rules", "doc-rag-mentor-alt3-r20a-audit"],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

### 5.2 doc-rag-mentor-alt3-corpus-inventory (D4)

```json
{
  "id": "doc-rag-mentor-alt3-corpus-inventory",
  "name": "Alt-3 Corpus Inventory (D4)",
  "type": "document",
  "subtype": ["design"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/rag-mentor-alt3/corpus-inventory.md",
  "desc": "Phase-1 Deliverable 4 — tagging schema (passage_id, source_file, source_citation, passage_type, canonical_mechanism, passion, sub_passion, audience_tier) and per-file structural inventory across 8 source files. Identifies coverage gaps (D-A16 focus-question stems; D-A10 corpus expansion limits). The corpus is the rule book the deterministic engine reads.",
  "notes": "Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 (same entry).",
  "deps": [],
  "rules": ["R6a", "R6b", "R6c", "R6d", "R6e", "R7", "R8a"],
  "priority": "P3",
  "proximity": "",
  "connects": ["doc-rag-mentor-alt3-handoff", "doc-rag-mentor-alt3-canonical-framework", "doc-rag-mentor-alt3-passion-taxonomy", "doc-rag-mentor-alt3-operationalised-rules", "doc-rag-mentor-alt3-index-schema", "doc-rag-mentor-alt3-r20a-audit"],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

### 5.3 doc-rag-mentor-alt3-index-schema (D5)

```json
{
  "id": "doc-rag-mentor-alt3-index-schema",
  "name": "Alt-3 Index Schema (D5)",
  "type": "document",
  "subtype": ["design", "schema"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/rag-mentor-alt3/index-schema.md",
  "desc": "Phase-1 Deliverable 5 — Supabase pgvector + tsvector single-table storage; embedding model selection (text-embedding-3-small); chunk-size policy per AC-4; RLS read-only at request time; migration shape from stoic-brain-compiled.ts; Graph RAG extensibility per AC-6. Implements AC-1 / AC-2 / AC-4 / AC-6 / AC-12 / R7 / R8a / R17b.",
  "notes": "Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 (same entry). KG7 (JSONB array discipline) named in slot_fields specifications. The corpus_passages table specification that the D-A16 catalogue's entries materialise into.",
  "deps": [],
  "rules": ["R7", "R8a", "R17"],
  "priority": "P3",
  "proximity": "",
  "connects": ["doc-rag-mentor-alt3-handoff", "doc-rag-mentor-alt3-canonical-framework", "doc-rag-mentor-alt3-passion-taxonomy", "doc-rag-mentor-alt3-operationalised-rules", "doc-rag-mentor-alt3-corpus-inventory", "doc-rag-mentor-alt3-retrieval-interface", "doc-rag-mentor-alt3-re-rank-design", "doc-rag-mentor-alt3-three-tier-intake", "doc-rag-mentor-alt3-d-a16-catalogue", "doc-rag-mentor-alt3-migration-plan", "doc-rag-mentor-alt3-cost-model", "doc-rag-mentor-alt3-test-plan"],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

### 5.4 doc-rag-mentor-alt3-retrieval-interface (D6)

```json
{
  "id": "doc-rag-mentor-alt3-retrieval-interface",
  "name": "Alt-3 Retrieval Interface (D6)",
  "type": "document",
  "subtype": ["design", "interface"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/rag-mentor-alt3/retrieval-interface.md",
  "desc": "Phase-1 Deliverable 6 — hybrid retrieve function signature; BM25 + vector + Reciprocal Rank Fusion; per-mechanism call patterns; per-request cache; error modes (timeout, embedding failure, both-channels-failed) with engine fallback paths. Implements AC-1 / AC-2 / AC-3 / AC-4 / AC-12 / R7.",
  "notes": "Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 (same entry). KG6 (composition order) applies to retriever output flow to system vs user blocks.",
  "deps": [],
  "rules": ["R5", "R7"],
  "priority": "P3",
  "proximity": "",
  "connects": ["doc-rag-mentor-alt3-handoff", "doc-rag-mentor-alt3-index-schema", "doc-rag-mentor-alt3-re-rank-design", "doc-rag-mentor-alt3-operationalised-rules", "doc-rag-mentor-alt3-rule-dependency-map", "doc-rag-mentor-alt3-three-tier-intake", "doc-rag-mentor-alt3-cost-model"],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

### 5.5 doc-rag-mentor-alt3-re-rank-design (D7)

```json
{
  "id": "doc-rag-mentor-alt3-re-rank-design",
  "name": "Alt-3 Re-Rank Design (D7)",
  "type": "document",
  "subtype": ["design"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/rag-mentor-alt3/re-rank-design.md",
  "desc": "Phase-1 Deliverable 7 — heuristic default with multiplicative tag-match boosts; cross-encoder upgrade path (Cohere or self-hosted); LLM-as-reranker fallback; per-mechanism re-rank policy. Top ~20 retrieved → re-rank → top ~3–5 to prompt per AC-3. Implements AC-3 / AC-12 / R5.",
  "notes": "Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 (same entry). KG2 (Sonnet/Haiku boundary) informs LLM-as-reranker model selection.",
  "deps": [],
  "rules": ["R5"],
  "priority": "P3",
  "proximity": "",
  "connects": ["doc-rag-mentor-alt3-handoff", "doc-rag-mentor-alt3-retrieval-interface", "doc-rag-mentor-alt3-index-schema", "doc-rag-mentor-alt3-operationalised-rules", "doc-rag-mentor-alt3-cost-model"],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

### 5.6 doc-rag-mentor-alt3-rule-dependency-map (D9)

```json
{
  "id": "doc-rag-mentor-alt3-rule-dependency-map",
  "name": "Alt-3 Rule Dependency Map and Engine Sequencing (D9)",
  "type": "document",
  "subtype": ["design"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/rag-mentor-alt3/rule-dependency-map.md",
  "desc": "Phase-1 Deliverable 9 — six structural dependencies between the 10 operationalised rules in D8. Canonical engine sequencing 1 → 2 → 3 → 4 → 5(p) → 6 → 7(p) → 8 → 9 → 5(e) → 7(c) → 10; conditional back-edge from Rule 8 to Rules 2/3 with value_error_without_passion_flag trigger and 1-re-run loop guard; Validation Addendum guidance incorporated for Rule 7 / Rule 8 / Rule 9. Implements AC-12 / AC-13 / AC-14.",
  "notes": "Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 (same entry). The deterministic engine's execution order.",
  "deps": [],
  "rules": ["R6b", "R7"],
  "priority": "P3",
  "proximity": "",
  "connects": ["doc-rag-mentor-alt3-handoff", "doc-rag-mentor-alt3-operationalised-rules", "doc-rag-mentor-alt3-canonical-framework", "doc-rag-mentor-alt3-passion-taxonomy", "doc-rag-mentor-alt3-corpus-inventory", "doc-rag-mentor-alt3-three-tier-intake", "doc-rag-mentor-alt3-r20a-audit"],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

### 5.7 doc-rag-mentor-alt3-layer-1-translation (D10)

```json
{
  "id": "doc-rag-mentor-alt3-layer-1-translation",
  "name": "Alt-3 Layer 1 Translation (D10)",
  "type": "document",
  "subtype": ["design"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/rag-mentor-alt3/layer-1-translation.md",
  "desc": "Phase-1 Deliverable 10 — narrow-scope specification for Claude's input translation task (entities, temporal/evaluative axes, scope markers, target identifiers, indifferents); controlled vocabulary from D3 + value.json; prompt template with cache discipline per AC6; ELEMENT_FUSION + empty-schema-with-reason + validation-failure error handling; worked examples for all named anchor patterns. Claude is restricted to Layer 1 input translation under AC-12; no Stoic inference originates from Claude. Implements AC-12 / AC-13 / R7 / R8a / R8d.",
  "notes": "Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 (same entry). KG2 (model selection — Sonnet, not Haiku, due to multi-step reasoning) named.",
  "deps": ["claude-api"],
  "rules": ["R7", "R8a", "R8d", "R20"],
  "priority": "P3",
  "proximity": "",
  "connects": ["doc-rag-mentor-alt3-handoff", "doc-rag-mentor-alt3-canonical-framework", "doc-rag-mentor-alt3-passion-taxonomy", "doc-rag-mentor-alt3-operationalised-rules", "doc-rag-mentor-alt3-rule-dependency-map", "doc-rag-mentor-alt3-three-tier-intake", "doc-rag-mentor-alt3-r20a-audit"],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

### 5.8 doc-rag-mentor-alt3-layer-3-translation (D11)

```json
{
  "id": "doc-rag-mentor-alt3-layer-3-translation",
  "name": "Alt-3 Layer 3 Translation (D11)",
  "type": "document",
  "subtype": ["design"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/rag-mentor-alt3/layer-3-translation.md",
  "desc": "Phase-1 Deliverable 11 — inclusion + exclusion strict prompting; per-consumer projection rules covering D2 Tables 1, 2, 4a, 4b, 5; AC-10 slot-fill mechanics for focus questions; D24 audit refinements 1-5 incorporated (reader_triggered_passions invitation-language; institutional-distance soft clarification; AC-17 flag projection; Table 4a dual applicability; Validation Addendum Adjustment 1 prose projection); R20d second-person passion attribution prohibited. Implements AC-5 / AC-10 / AC-12 / AC-17 / AC-18 / R7 / R8a-d / R20d.",
  "notes": "Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 (same entry). The output-side translator; companion to D10 Layer 1.",
  "deps": ["claude-api"],
  "rules": ["R7", "R8a", "R8b", "R8c", "R8d", "R19", "R20"],
  "priority": "P3",
  "proximity": "",
  "connects": ["doc-rag-mentor-alt3-handoff", "doc-rag-mentor-alt3-canonical-framework", "doc-rag-mentor-alt3-passion-taxonomy", "doc-rag-mentor-alt3-operationalised-rules", "doc-rag-mentor-alt3-rule-dependency-map", "doc-rag-mentor-alt3-layer-1-translation", "doc-rag-mentor-alt3-three-tier-intake", "doc-rag-mentor-alt3-corpus-inventory", "doc-rag-mentor-alt3-r20a-audit", "doc-rag-mentor-alt3-strict-prompting", "doc-rag-mentor-alt3-d-a16-catalogue"],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

### 5.9 doc-rag-mentor-alt3-strict-prompting (D12)

```json
{
  "id": "doc-rag-mentor-alt3-strict-prompting",
  "name": "Alt-3 Strict Inclusion + Exclusion Prompting (D12)",
  "type": "document",
  "subtype": ["design"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/rag-mentor-alt3/strict-prompting.md",
  "desc": "Phase-1 Deliverable 12 — Layer 3 paraphrase prompt template with cached system block (inclusion + exclusion rules; per-consumer projection schemas; AC-17 flag projection; refusal protocol) and per-request user message; slot-fill mechanics flow. Packages D11's specification as a runtime prompt. Implements AC-5 / AC-6 / AC-10 / AC-12 / AC-17 / AC-18 / R7 / R8a-d / R20d.",
  "notes": "Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 (same entry). KG6 (composition order) applied at the system-vs-user-block boundary.",
  "deps": ["claude-api"],
  "rules": ["R7", "R8a", "R8b", "R8c", "R8d", "R20"],
  "priority": "P3",
  "proximity": "",
  "connects": ["doc-rag-mentor-alt3-handoff", "doc-rag-mentor-alt3-layer-3-translation", "doc-rag-mentor-alt3-three-tier-intake", "doc-rag-mentor-alt3-canonical-framework", "doc-rag-mentor-alt3-passion-taxonomy", "doc-rag-mentor-alt3-operationalised-rules", "doc-rag-mentor-alt3-index-schema", "doc-rag-mentor-alt3-retrieval-interface", "doc-rag-mentor-alt3-score-in-reply", "doc-rag-mentor-alt3-verification", "doc-rag-mentor-alt3-residual-seams"],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

### 5.10 doc-rag-mentor-alt3-three-tier-intake (D13)

```json
{
  "id": "doc-rag-mentor-alt3-three-tier-intake",
  "name": "Alt-3 Three-Tier Intake Clarification (D13)",
  "type": "document",
  "subtype": ["design"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/rag-mentor-alt3/three-tier-intake.md",
  "desc": "Phase-1 Deliverable 13 — Tier 1 force / Tier 2 soft / Tier 3 deterministic-withhold model; engine-level vs surface-level trigger distinction; full trigger catalogue (7 engine-level + 12 surface-level codes per D24 audit); OPEN_DEFERRAL data structure; timestamping logic; interaction with engine sequencing per D9. The de facto stem source for D-A16 catalogue assembly. Implements AC-13 / AC-14 / AC-15.",
  "notes": "Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 (same entry). The intake-tier dispatch logic.",
  "deps": [],
  "rules": ["R6d", "R7", "R8", "R20"],
  "priority": "P3",
  "proximity": "",
  "connects": ["doc-rag-mentor-alt3-handoff", "doc-rag-mentor-alt3-canonical-framework", "doc-rag-mentor-alt3-passion-taxonomy", "doc-rag-mentor-alt3-operationalised-rules", "doc-rag-mentor-alt3-rule-dependency-map", "doc-rag-mentor-alt3-layer-1-translation", "doc-rag-mentor-alt3-layer-3-translation", "doc-rag-mentor-alt3-long-deferred-questions", "doc-rag-mentor-alt3-r20a-audit", "doc-rag-mentor-alt3-corpus-inventory", "doc-rag-mentor-alt3-d-a16-catalogue"],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

### 5.11 doc-rag-mentor-alt3-reflect-14a-daily-ritual (D14a)

```json
{
  "id": "doc-rag-mentor-alt3-reflect-14a-daily-ritual",
  "name": "Alt-3 Daily-Reflection Ritual Endpoint (D14a)",
  "type": "document",
  "subtype": ["design"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/rag-mentor-alt3/reflect-endpoint-14a-daily-ritual.md",
  "desc": "Phase-1 Deliverable 14a — daily-reflection ritual endpoint design. Visible-output preservation per D2 Table 4a; own page (founder direction); morning/evening symmetry with ritual_type parameter; persistence pipeline preserved; pattern-engine pass per ADR-PE-01 preserved; Phase-2 build sequence (snapshot → engine implementation → env-flag deployment → verification → page move → mentor_observation surfacing → audit-finding integration). Phase-2 pass 2 target. Implements AC-12 / AC-13 / D2 Table 4a / R3 / R7 / R8c / R20a / R20d.",
  "notes": "Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A) with founder direction calls resolved (own page; mentor_observation visible). Moved from /drafts/ to /adopted/ 2026-05-02 (same entry). Phase-2 pass 2 deliverable target. /api/mentor/private/reflect snapshot already produced 2026-05-02 per D-MENTOR-PRIVATE-REFLECT-PRE-ALT3-SNAPSHOT-2026-05-02.",
  "deps": [],
  "rules": ["R3", "R7", "R8c", "R20"],
  "priority": "P3",
  "proximity": "",
  "connects": ["doc-rag-mentor-alt3-handoff", "doc-rag-mentor-alt3-canonical-framework", "doc-rag-mentor-alt3-passion-taxonomy", "doc-rag-mentor-alt3-operationalised-rules", "doc-rag-mentor-alt3-rule-dependency-map", "doc-rag-mentor-alt3-layer-1-translation", "doc-rag-mentor-alt3-layer-3-translation", "doc-rag-mentor-alt3-three-tier-intake", "doc-rag-mentor-alt3-reflect-14b-deferral-resolution", "doc-rag-mentor-alt3-long-deferred-questions", "doc-rag-mentor-alt3-r20a-audit", "agent-private-mentor"],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

### 5.12 doc-rag-mentor-alt3-reflect-14b-deferral-resolution (D14b — Phase-2 pass-1 load-bearing)

```json
{
  "id": "doc-rag-mentor-alt3-reflect-14b-deferral-resolution",
  "name": "Alt-3 Deferral-Resolution Surface (D14b — Phase-2 pass-1 load-bearing)",
  "type": "document",
  "subtype": ["design"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/rag-mentor-alt3/reflect-endpoint-14b-deferral-resolution.md",
  "desc": "Phase-1 Deliverable 14b — deferral-resolution surface design. Load-bearing per AC-19 reflect-endpoint-first build order. New route /api/mentor/private/deferral-resolve (founder direction); new page /private-mentor/deferred-questions (founder direction); structured intake form shape; deferred-question presentation logic (engine-composed at scoring time, presented verbatim at resolution time); reflection content processing through Tier 1/2/3; retrospective score update mechanism with new open_deferrals and deferral_resolutions schema tables; AC-18 architectural specification (no shareable artefact); R17 intimate data protection conformance (RLS, application-level encryption per R17b, cascade deletion per R17c); AC5 ninth-route discipline. Implements AC-12 / AC-13 / AC-14 / AC-15 / AC-16 / AC-18 / AC-19 / PR1 / PR6 / R3 / R7 / R17 / R20a / R20d.",
  "notes": "Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A) with founder direction calls resolved (route name + page name confirmed). Moved from /drafts/ to /adopted/ 2026-05-02 (same entry). Phase-2 pass 1 builds this surface first per AC-19. Pass-1 build is Critical risk per PR6 + AC5 + R17 — the Critical Change Protocol applies at deployment time.",
  "deps": ["claude-api", "supabase"],
  "rules": ["R3", "R7", "R17", "R20"],
  "priority": "P2",
  "proximity": "",
  "connects": ["doc-rag-mentor-alt3-handoff", "doc-rag-mentor-alt3-canonical-framework", "doc-rag-mentor-alt3-passion-taxonomy", "doc-rag-mentor-alt3-operationalised-rules", "doc-rag-mentor-alt3-rule-dependency-map", "doc-rag-mentor-alt3-layer-1-translation", "doc-rag-mentor-alt3-layer-3-translation", "doc-rag-mentor-alt3-three-tier-intake", "doc-rag-mentor-alt3-reflect-14a-daily-ritual", "doc-rag-mentor-alt3-long-deferred-questions", "doc-rag-mentor-alt3-r20a-audit", "doc-rag-mentor-alt3-d-a16-catalogue", "agent-private-mentor"],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

### 5.13 doc-rag-mentor-alt3-long-deferred-questions (D15)

```json
{
  "id": "doc-rag-mentor-alt3-long-deferred-questions",
  "name": "Alt-3 Long-Deferred Questions Handling (D15)",
  "type": "document",
  "subtype": ["design"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/rag-mentor-alt3/long-deferred-questions.md",
  "desc": "Phase-1 Deliverable 15 — three principles operationalised: Principle 1 (engine doesn't nag); Principle 2 (OPEN_DEFERRAL flags visible in scoring record but not celebratory); Principle 3 (mentor names pattern at next natural opportunity — domain-match algorithm across four axes; long-deferred threshold N=7 days; observation language constraints; worked example). Implements AC-14 / AC-16 / AC-18 / R6d / R20d.",
  "notes": "Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 (same entry).",
  "deps": [],
  "rules": ["R6d", "R7", "R20"],
  "priority": "P3",
  "proximity": "",
  "connects": ["doc-rag-mentor-alt3-handoff", "doc-rag-mentor-alt3-canonical-framework", "doc-rag-mentor-alt3-operationalised-rules", "doc-rag-mentor-alt3-three-tier-intake", "doc-rag-mentor-alt3-reflect-14a-daily-ritual", "doc-rag-mentor-alt3-reflect-14b-deferral-resolution", "doc-rag-mentor-alt3-layer-3-translation"],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

### 5.14 doc-rag-mentor-alt3-score-in-reply (D16)

```json
{
  "id": "doc-rag-mentor-alt3-score-in-reply",
  "name": "Alt-3 Score-in-Reply Design (D16)",
  "type": "document",
  "subtype": ["design"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/rag-mentor-alt3/score-in-reply.md",
  "desc": "Phase-1 Deliverable 16 — conversation surface response payload (narrative + structured score + proximity_ring_data + ac_17 + open_deferrals_referenced); pre-migration vs post-migration aliases; per-consumer mapping per D2 Tables 1+2. Implements AC-9 / AC-11 / AC-12 / R8a / R8c / R20d.",
  "notes": "Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 (same entry). Phase-2 pass 3 deliverable target (conversation surface migration).",
  "deps": [],
  "rules": ["R8a", "R8c", "R20"],
  "priority": "P3",
  "proximity": "",
  "connects": ["doc-rag-mentor-alt3-handoff", "doc-rag-mentor-alt3-canonical-framework", "doc-rag-mentor-alt3-passion-taxonomy", "doc-rag-mentor-alt3-operationalised-rules", "doc-rag-mentor-alt3-layer-3-translation", "doc-rag-mentor-alt3-strict-prompting", "doc-rag-mentor-alt3-reflect-14a-daily-ritual", "doc-rag-mentor-alt3-progression-delta", "doc-rag-mentor-alt3-residual-seams", "doc-rag-mentor-alt3-r20a-audit"],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

### 5.15 doc-rag-mentor-alt3-progression-delta (D17)

```json
{
  "id": "doc-rag-mentor-alt3-progression-delta",
  "name": "Alt-3 Progression Delta Design (D17)",
  "type": "document",
  "subtype": ["design"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/rag-mentor-alt3/progression-delta.md",
  "desc": "Phase-1 Deliverable 17 — prior-state read with windowing (90 days / 30 instances default); 8 per-mechanism delta signals; composite direction with confidence_weighted thresholds (3/10 instances; 14/60 days); profile-tension flag disambiguation (breakthrough vs regression vs lateral movement); 4 worked scenarios. Implements AC-12 / AC-17 / AC-18 / R0 / R6c / R6d.",
  "notes": "Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 (same entry).",
  "deps": [],
  "rules": ["R0", "R6c", "R6d", "R20"],
  "priority": "P3",
  "proximity": "",
  "connects": ["doc-rag-mentor-alt3-handoff", "doc-rag-mentor-alt3-canonical-framework", "doc-rag-mentor-alt3-operationalised-rules", "doc-rag-mentor-alt3-long-deferred-questions", "doc-rag-mentor-alt3-score-in-reply", "doc-rag-mentor-alt3-residual-seams", "doc-rag-mentor-alt3-reflect-14a-daily-ritual", "doc-rag-mentor-alt3-reflect-14b-deferral-resolution"],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

### 5.16 doc-rag-mentor-alt3-verification (D18)

```json
{
  "id": "doc-rag-mentor-alt3-verification",
  "name": "Alt-3 Verification Design (D18)",
  "type": "document",
  "subtype": ["design"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/rag-mentor-alt3/verification.md",
  "desc": "Phase-1 Deliverable 18 — narrative trace verification + score consistency verification; algorithm specifications; pass/fail criteria; 5 founder-performable verifications per 0c framework. Confirms AC-12 (no Stoic inference originates from Claude) at runtime. Implements AC-5 / AC-12 / AC-17 / AC-18 / 0c.",
  "notes": "Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 (same entry).",
  "deps": [],
  "rules": ["R7", "R19", "R20"],
  "priority": "P3",
  "proximity": "",
  "connects": ["doc-rag-mentor-alt3-handoff", "doc-rag-mentor-alt3-layer-3-translation", "doc-rag-mentor-alt3-strict-prompting", "doc-rag-mentor-alt3-canonical-framework", "doc-rag-mentor-alt3-operationalised-rules", "doc-rag-mentor-alt3-score-in-reply", "doc-rag-mentor-alt3-residual-seams", "doc-rag-mentor-alt3-test-plan", "doc-rag-mentor-alt3-migration-plan"],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

### 5.17 doc-rag-mentor-alt3-residual-seams (D19)

```json
{
  "id": "doc-rag-mentor-alt3-residual-seams",
  "name": "Alt-3 Residual Seams Handling (D19)",
  "type": "document",
  "subtype": ["design"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/rag-mentor-alt3/residual-seams.md",
  "desc": "Phase-1 Deliverable 19 — full SELF_REPORT_DEPENDENT and CONFIDENCE_WEIGHTED specifications; per-surface projection rules (4 surface categories); 4 named interaction cases with worked examples; integration with Validation Addendum Adjustment 1 prose; integration with D5 Rule 5's refinement_source. Implements AC-12 / AC-17 / AC-18 / R6d / R19c.",
  "notes": "Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 (same entry).",
  "deps": [],
  "rules": ["R6d", "R19", "R20"],
  "priority": "P3",
  "proximity": "",
  "connects": ["doc-rag-mentor-alt3-handoff", "doc-rag-mentor-alt3-operationalised-rules", "doc-rag-mentor-alt3-layer-3-translation", "doc-rag-mentor-alt3-strict-prompting", "doc-rag-mentor-alt3-long-deferred-questions", "doc-rag-mentor-alt3-score-in-reply", "doc-rag-mentor-alt3-progression-delta", "doc-rag-mentor-alt3-reflect-14a-daily-ritual", "doc-rag-mentor-alt3-reflect-14b-deferral-resolution", "doc-rag-mentor-alt3-three-tier-intake", "doc-rag-mentor-alt3-verification"],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

### 5.18 doc-rag-mentor-alt3-cost-model (D20)

```json
{
  "id": "doc-rag-mentor-alt3-cost-model",
  "name": "Alt-3 Cost Model (D20)",
  "type": "document",
  "subtype": ["design"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/rag-mentor-alt3/cost-model.md",
  "desc": "Phase-1 Deliverable 20 — per-request cost decomposition by surface (~$0.030 deferral-resolution; ~$0.036 ritual; ~$0.046 conversation); free-tier R5 budget validated ($4.50/practitioner/month); paid-tier 2x revenue analysis; cost-as-health-metric alert specifications. Implements R5 / AC-1 / AC-2 / AC-12.",
  "notes": "Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 (same entry).",
  "deps": [],
  "rules": ["R5"],
  "priority": "P3",
  "proximity": "",
  "connects": ["doc-rag-mentor-alt3-handoff", "doc-rag-mentor-alt3-index-schema", "doc-rag-mentor-alt3-retrieval-interface", "doc-rag-mentor-alt3-re-rank-design", "doc-rag-mentor-alt3-layer-1-translation", "doc-rag-mentor-alt3-layer-3-translation", "doc-rag-mentor-alt3-strict-prompting", "doc-rag-mentor-alt3-reflect-14a-daily-ritual", "doc-rag-mentor-alt3-reflect-14b-deferral-resolution", "doc-rag-mentor-alt3-score-in-reply", "doc-rag-mentor-alt3-r20a-audit"],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

### 5.19 doc-rag-mentor-alt3-migration-plan (D21 — load-bearing)

```json
{
  "id": "doc-rag-mentor-alt3-migration-plan",
  "name": "Alt-3 Migration Plan (D21 — load-bearing for Phase-2 build sequencing)",
  "type": "document",
  "subtype": ["design", "migration-plan"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/rag-mentor-alt3/migration-plan.md",
  "desc": "Phase-1 Deliverable 21 — Phase-2 build sequencing with 5 preconditions; 3 passes (D14b first per AC-19; D14a second; conversation surface third); per-pass build steps + founder verification + rollback paths; Phase-3+ score-family migrations per D24 projections; Critical Change Protocol per pass per PR6 + AC5 + R17. Implements AC-19 / AC-7 / PR1 / PR2 / PR6 / AC4 / AC5 / AC7.",
  "notes": "Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 (same entry). Load-bearing for Phase-2 build sequencing. Phase-2 pass 1 (D14b deferral-resolution) is Critical risk per PR6 + AC5 + R17.",
  "deps": [],
  "rules": ["R5", "R17", "R20"],
  "priority": "P2",
  "proximity": "",
  "connects": ["doc-rag-mentor-alt3-handoff", "doc-rag-mentor-alt3-reflect-14b-deferral-resolution", "doc-rag-mentor-alt3-reflect-14a-daily-ritual", "doc-rag-mentor-alt3-score-in-reply", "doc-rag-mentor-alt3-index-schema", "doc-rag-mentor-alt3-retrieval-interface", "doc-rag-mentor-alt3-re-rank-design", "doc-rag-mentor-alt3-strict-prompting", "doc-rag-mentor-alt3-verification", "doc-rag-mentor-alt3-test-plan", "doc-rag-mentor-alt3-r20a-audit"],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

### 5.20 doc-rag-mentor-alt3-test-plan (D22)

```json
{
  "id": "doc-rag-mentor-alt3-test-plan",
  "name": "Alt-3 Test Plan (D22)",
  "type": "document",
  "subtype": ["design", "test-plan"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/rag-mentor-alt3/test-plan.md",
  "desc": "Phase-1 Deliverable 22 — 5 test categories (structural / behavioural / purity / founder-performable / R20a invocation + eval suite per ES1-3); 5 canonical anchor patterns from architecture exercise; 30+ founder verifications consolidated across deliverables; CI integration per Phase-2 pass. Implements AC-12 / AC-4 / AC-5 / 0c / ES1 / ES2 / ES3.",
  "notes": "Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 (same entry).",
  "deps": [],
  "rules": ["R20"],
  "priority": "P3",
  "proximity": "",
  "connects": ["doc-rag-mentor-alt3-handoff", "doc-rag-mentor-alt3-verification", "doc-rag-mentor-alt3-migration-plan", "doc-rag-mentor-alt3-index-schema", "doc-rag-mentor-alt3-retrieval-interface", "doc-rag-mentor-alt3-re-rank-design", "doc-rag-mentor-alt3-strict-prompting", "doc-rag-mentor-alt3-score-in-reply", "doc-rag-mentor-alt3-progression-delta", "doc-rag-mentor-alt3-residual-seams", "doc-rag-mentor-alt3-reflect-14a-daily-ritual", "doc-rag-mentor-alt3-reflect-14b-deferral-resolution", "doc-rag-mentor-alt3-three-tier-intake", "doc-rag-mentor-alt3-long-deferred-questions", "doc-rag-mentor-alt3-rule-dependency-map"],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

### 5.21 doc-rag-mentor-alt3-open-questions (D23)

```json
{
  "id": "doc-rag-mentor-alt3-open-questions",
  "name": "Alt-3 Open-Questions Register (D23)",
  "type": "document",
  "subtype": ["design", "register"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/rag-mentor-alt3/open-questions.md",
  "desc": "Phase-1 Deliverable 23 — 28 open questions across 6 categories (architectural commitments deferred, founder direction deferred, working-value parameters, build preconditions, future revisions, cross-cutting limitations); summary table; PR7-compliant audit trail. The single catalogue of unresolved Phase-1 questions and deferred decisions.",
  "notes": "Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 (same entry).",
  "deps": [],
  "rules": ["R0"],
  "priority": "P3",
  "proximity": "",
  "connects": ["doc-rag-mentor-alt3-handoff", "doc-rag-mentor-alt3-canonical-framework", "doc-rag-mentor-alt3-passion-taxonomy", "doc-rag-mentor-alt3-operationalised-rules", "doc-rag-mentor-alt3-r20a-audit"],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

### 5.22 doc-rag-mentor-alt3-d-a16-catalogue (D-A16)

```json
{
  "id": "doc-rag-mentor-alt3-d-a16-catalogue",
  "name": "Alt-3 Focus-Question-Stem Catalogue (D-A16)",
  "type": "document",
  "subtype": ["design", "catalogue"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/rag-mentor-alt3/d-a16-catalogue.md",
  "desc": "Deliverable A16 — 27 focus-question stem entries across 21 distinct trigger codes (19 from D13's catalogue + 2 ritual codes introduced by this catalogue) with full slot_fields metadata, source citations, trigger_condition / intake_tier tagging, and three catalogue analytics flags (eupatheia_boundary_relevant, praxis_motivation_relevant, validation_addendum_aware). Phase-2 pass-1 blocking minimum (T3-001 EUPATHEIA_BOUNDARY + T3-002 PRAXIS_MOTIVATION_AMBIGUITY) met. Implements AC-10 / AC-13 / AC-14 / R7 / R8c / R20d.",
  "notes": "Adopted 2026-05-02 under D-A16-CATALOGUE-ASSEMBLED-AND-ADOPTED-2026-05-02 (Path B equivalent — accept-as-drafted-with-philodoxia-variant + immediate move to /adopted/). RIT-E-001b philodoxia variant added per founder direction. Schema seam (ritual stems vs D5 intake_tier ∈ {1,2,3} constraint) documented with three resolution paths (Path B — synthetic intake_tier:1 with trigger_condition carrying semantic distinction — is the catalogue's documentation default). Phase-2 build inserts T3-001 + T3-002 minimum at pass 1; additional stems land at passes 2 and 3+ per D21.",
  "deps": [],
  "rules": ["R7", "R8c", "R17", "R20"],
  "priority": "P2",
  "proximity": "",
  "connects": ["doc-rag-mentor-alt3-handoff", "doc-rag-mentor-alt3-canonical-framework", "doc-rag-mentor-alt3-passion-taxonomy", "doc-rag-mentor-alt3-operationalised-rules", "doc-rag-mentor-alt3-three-tier-intake", "doc-rag-mentor-alt3-layer-3-translation", "doc-rag-mentor-alt3-reflect-14a-daily-ritual", "doc-rag-mentor-alt3-reflect-14b-deferral-resolution", "doc-rag-mentor-alt3-index-schema", "doc-rag-mentor-alt3-r20a-audit"],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

---

## 6. Ambiguous matches requiring founder decision

None. All component-mention extractions matched cleanly via path or by deliverable ID (D1, D4–D24, D-A16) per the explicit decision-log entry naming.

---

## 7. No-change findings (transparency)

The following 168 existing components were scanned by Pass 4 (internal consistency) and Pass 2 (where they have a `path`) but flagged for no change:

- All `agent-*` entries (5): `agent-private-mentor`, `agent-mentor`, `agent-sage-ops`, `agent-session-bridge`, `agent-support`. The `agent-private-mentor` entry already references "alt-3 future-phase block" in notes/blocker via v1.3.0 update; the reference is by decision-log ID, not by path or deliverable ID, so no transitive update needed.
- All `tool-sage-*` entries (10+): `tool-sage-decide`, `tool-sage-score`, `tool-sage-score-document`, `tool-sage-score-social`, `tool-sage-iterate`, `tool-sage-converse`, `tool-sage-reason`, `tool-sage-reflect`, `tool-sage-scenario`, `tool-sage-audit`, `tool-sage-filter`. Same pattern — alt-3 references are by decision-log ID; no transitive update needed.
- All `engine-*`, `data-*`, `infra-*`, `gov-*`, `reasoning-*`, `mcp-*` entries. None reference the alt-3 deliverables by path or deliverable ID.
- The `doc-rag-mentor-alt3-handoff` entry already at status `wired` with correct path and notes that include the Validation Addendum reference; no update needed.

---

## 8. Header recompute targets

After applying the proposed changes:

- `version`: `"1.3.0"` → **`"1.4.0"`** (minor bump — 22 components added per skill semver rules).
- `lastUpdated`: `"2026-05-02"` → **`"2026-05-02"`** (today; same date as v1.3.0 since both updates land same day).
- `totalComponents`: `168` → **`190`** (168 + 22 new).
- `statusSummary`:
  - Existing: `{wired: 121, verified: 30, designed: 14, live: 2, scaffolded: 1}` (sum 168)
  - Proposed: 4 entries promoted designed → wired (decreases designed by 4, increases wired by 4); 22 new entries all status `wired` (increases wired by 22).
  - **Result:** `{wired: 147, verified: 30, designed: 10, live: 2, scaffolded: 1}` (sum 190). ✓

---

## 9. Apply step preview (per SKILL.md Step 8)

Once approved:

1. **8.1 Pre-edit backup.** Copy registry to `/archive/component-registry/component-registry.json.backup-2026-05-02-HHMM` (no `-audit-` infix per skill convention).
2. **8.2 Apply field updates.** 4 existing entries: update `path`, `oldStatus`, `status`, `blocker`, `notes` per §1.1–§1.4.
3. **8.3 Apply 22 new components.** Append per §5.1–§5.22 in JSON form. Insertion point: end of `components` array (after the existing `doc-rag-mentor-alt3-r20a-audit` entry).
4. **8.4 Recompute statusSummary.** Per §8 above.
5. **8.5 Update lastUpdated.** Set to today (2026-05-02).
6. **8.6 Increment version.** 1.3.0 → 1.4.0.
7. **8.7 Update totalComponents.** Set to 190.
8. **8.8 JSON validation.** Parse the result. Abort and restore from backup if parse fails.
9. **8.9 Write the file.**

Then append decision-log entry `D-REGISTRY-UPDATE-v1.4.0-2026-05-02` (Step 9) and provide git commands (Step 10).

---

## 10. Approval gate

The skill discipline requires explicit founder approval before any edit. Founder responses I'll accept:
- **"apply all"** — execute every section above.
- **"apply sections [N, N, ...]"** — execute named sections only (e.g., "apply sections 1.1, 1.2, 1.3, 1.4, 5.1, 5.2, 5.22" if you want path updates + ADR + D4 + D-A16 only and defer the rest).
- **per-edit instructions** — explicit modifications to specific sections.
- **"reject"** or **"rework"** with specific guidance — discard the proposal or revise.

If approved, I'll execute Steps 8.1–8.9, append the decision-log entry, and provide the git commands.
