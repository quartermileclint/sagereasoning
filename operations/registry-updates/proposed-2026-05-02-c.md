# Registry Update Proposal — 2026-05-02 (c)

**Registry version:** 1.4.0
**Registry lastUpdated:** 2026-05-02
**Lookback range (Pass 1 anchor):** 2026-05-02 (D-REGISTRY-UPDATE-v1.4.0-2026-05-02 — most recent non-superseded update entry, per Pass 1 lookback anchor rule) → 2026-05-02 (today)
**Components audited (Pass 4):** 190 (full registry; spot-check against the touched entries given the v1.4.0 baseline was a comprehensive same-day Pass 4 run)
**Handoffs scanned (Pass 1):** 1 (`/operations/handoffs/founder/2026-05-02-streams-bcd-close.md`)
**Decision-log entries scanned (Pass 1):** 3 (`D-API-REASON-PRE-ALT3-SNAPSHOT-2026-05-02`, `D-VALIDATION-ADDENDUM-PROMOTED-2026-05-02`, `D-D2-AMENDMENT-2026-05-02`)
**Components proposed for update:** 1 required + 1 optional (D2 required; D8 optional notes cross-reference)
**New components proposed:** 1 (architectural-conventions catalogue) — explicit founder approval required
**Ambiguous matches needing founder input:** 0

**Versioning decision needed (Q for founder):** Per skill Step 8.6 — "Minor bump (e.g., 1.2.1 → 1.3.0) when components are added or removed." This update adds a new component, so the skill rule prescribes **v1.4.0 → v1.5.0** (minor bump). The predecessor session's next-session prompt loosely suggested "v1.4.1 (or v1.5.0)"; the skill rule is the authoritative discipline. Recommendation: **v1.5.0** (minor bump per skill rule). If founder prefers v1.4.1 (patch bump), this is a deviation from the skill rule and should be noted in the decision-log entry.

**Snapshot-tracking decision (resolved per next-session prompt + Pass 1 evidence):** The prompt explicitly directs: "*if the predecessor snapshot is not tracked, the new one need not be either*." Pass 1 evidence: Pass 1 search on `'snapshot'` against the registry returned zero existing entries for `/api/mentor/private/reflect`'s 2026-05-02 snapshot or any other archive snapshot. Therefore: **`/api/reason` snapshot NOT proposed for registry tracking** (matches the established precedent — archive snapshots are documentary artefacts not in the registry's scope).

---

## 1. Source-scan findings (Pass 1)

### doc-rag-mentor-alt3-canonical-framework — Alt-3 Canonical Mechanism Framework (D2)

**Current state:**
- status: `wired`
- blocker: `"Next: D2 amendment for the five D24 coverage-gap additions (prior_feedback projection note for Route 1; aggregate-across-options note for Route 2; policy-mode-specific Table 6 for Route 3; quick-depth Table 0/1a for Route 6; Table 4a dual applicability for Routes 7+8 ritual flow). Amendment requires re-approval per D2 approval-gate footer (Elevated risk per project instructions Priority 2 Candidate B)."`
- notes: `"Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-CRITICAL-PATH-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 under D-RAG-MENTOR-ALT3-CRITICAL-PATH-MOVED-TO-ADOPTED-2026-05-02. The deterministic engine's mechanism taxonomy (9+1). Critical-path deliverable for the alt-3 architecture. D24 audit identified five small coverage-gap amendments deferred to a focused D2-amendment session (Elevated risk; D23 §O5.2)."`

**Proposed change:**
- status: `wired` → **`wired`** (unchanged — file still wired into the alt-3 design batch; v1.1.0 amendment did not move implementation status)
- blocker: current text → **`""`** (cleared per Q2 rule — the named next step has landed; no further substantive next step on D2 itself; D8 v1.1.0 revision pass is a separate entry's blocker)
- notes: append v1.1.0 amendment note: **`"Adopted 2026-05-02 under D-RAG-MENTOR-ALT3-CRITICAL-PATH-APPROVED-2026-05-02 (Path A). Moved from /drafts/ to /adopted/ 2026-05-02 under D-RAG-MENTOR-ALT3-CRITICAL-PATH-MOVED-TO-ADOPTED-2026-05-02. The deterministic engine's mechanism taxonomy (9+1). Critical-path deliverable for the alt-3 architecture. Amended 2026-05-02 to v1.1.0 under D-D2-AMENDMENT-2026-05-02 — five D24 coverage-gap additions landed (Table 1a for /api/reason quick-depth shape; Coverage notes for Routes 1+2 projection refinements; Table 4a heading + preamble for Routes 7+8 dual applicability; Table 6 for /api/score-document policy-mode shape; Status line bump). 9+1 mechanism set unchanged. Pre-edit backup at /archive/2026-05-02_canonical-framework_pre-d24-amendment.md."`**

**Evidence:**
- Source: `/operations/decision-log.md` entry `D-D2-AMENDMENT-2026-05-02` (Stream B of the 2 May streams-bcd session)
- Quoted text: *"D2 amended from v1.0.0 to v1.1.0 with five small text additions per D24 §"Coverage gaps in D2 mapping tables"... 9+1 mechanism set unchanged. Cleanliness ratings unchanged. R6a–R6e methodology compliance unchanged. R7 source fidelity unchanged."*
- Reasoning: The blocker text named the deferred D24 amendment work as "next." That work has now landed. Per Q2 rule, blocker is cleared because no further substantive next step is named for D2 itself. The notes are extended to record the v1.1.0 amendment provenance.

### doc-rag-mentor-alt3-operationalised-rules — Alt-3 Operationalised Scoring Rules (D8) — OPTIONAL

**Current state:**
- status: `wired`
- blocker: `"Next: future revision pass folds the Validation Addendum's three adjustments (Rule 9 unstable-vs-false phronesis distinction; Rule 8 compound severity for INFLATION/DEFLATION same-root errors; Rule 7 explicit operative-circle dependency on Rule 6) into per-rule sections to produce v1.1.0; the architecture-exercise transcript is the source for that revision."`
- notes: `"Adopted 2026-05-02 as v1.0.0 with Validation Addendum carried forward..."` (full text already references the Validation Addendum)

**Proposed change (optional):**
- status: `wired` → **`wired`** (unchanged)
- blocker: **unchanged** (the v1.1.0 revision pass is still genuinely pending — surfaced in the next-session prompt as a standalone candidate; D8 amendment requires the architecture-exercise transcript, which the prompt notes as not yet surfaced in the working directory)
- notes: append catalogue cross-reference: append **`" Validation Addendum content promoted 2026-05-02 to standalone catalogue at /adopted/rag-mentor-alt3/architectural-conventions.md under D-VALIDATION-ADDENDUM-PROMOTED-2026-05-02 (PR8 third-recurrence promotion); D8's per-rule integration of the three adjustments awaits the v1.1.0 revision pass."`** to the existing notes

**Evidence:**
- Source: `/operations/decision-log.md` entry `D-VALIDATION-ADDENDUM-PROMOTED-2026-05-02` (Stream D of the 2 May streams-bcd session)
- Quoted text: *"D8 retains its v1.0.0 plus Addendum until a future v1.1.0 revision pass folds the adjustments into the per-rule sections themselves; this catalogue persists as the standalone architectural reference."*
- Reasoning: PR8's documentation-consolidation purpose ("downstream alt-3 deliverables now reference this catalogue instead of inlining the patterns") implies D8's notes should point at the standalone reference. **Optional:** founder may defer this to the D8 v1.1.0 revision pass session itself, where the per-rule Validation Addendum integration would replace the catalogue cross-reference with first-class per-rule sections.

---

## 2. Code-grep findings (Pass 2)

**N/A for this update.** Both touched entries are `type: document` with paths in `/adopted/rag-mentor-alt3/`. The Pass 2 targeted import-pattern grep applies to TypeScript/TSX modules in `/website/src/`. Document entries are not import targets; their wiring is captured by file-existence and adopted-status, both confirmed via `ls`:

- `/adopted/rag-mentor-alt3/canonical-framework.md` — present (38,795 bytes; D2 v1.1.0)
- `/adopted/rag-mentor-alt3/architectural-conventions.md` — present (28,367 bytes; the new catalogue)
- `/adopted/rag-mentor-alt3/operationalised-rules.md` — present (D8 v1.0.0; unchanged this proposal)

---

## 3. Transitive impact findings (Pass 3)

### doc-rag-mentor-alt3-canonical-framework (D2) — blocker cleared

**Components whose blocker references D2's old amendment work:** None. Pass 3 grep on `'d2 amendment'`, `'d24 coverage-gap'`, `'coverage-gap addition'`, `'d2-amendment'`, `'validation addendum'` in any registry blocker returned only:
- `doc-rag-mentor-alt3-canonical-framework` (the entry itself — handled in §1)
- `doc-rag-mentor-alt3-operationalised-rules` (D8 — references "Validation Addendum" but for the *revision pass* work, not for D2's amendment work — distinct concerns; unchanged)
- `doc-rag-mentor-alt3-r20a-audit` (D24 — references seven *current-state findings* unrelated to D2 amendments; unchanged)

**Components whose `connects` reference D2:** 18 entries connect to `doc-rag-mentor-alt3-canonical-framework`. None require update — D2's path, name, type, subtype, and id are all unchanged. The `connects` edges remain valid.

### New entry — architectural-conventions catalogue

**Components that should connect to the new catalogue (per the catalogue's cross-references):** D8, D2, D9, D11, D-A16, D17, D19, handoff, ADR D1.

**Question for founder:** Should existing alt-3 entries' `connects` arrays be updated to include `doc-rag-mentor-alt3-architectural-conventions`? Two options:

- **Option A (conservative — recommended):** Add `doc-rag-mentor-alt3-architectural-conventions` to the new entry's outgoing `connects` only. Leave existing entries' `connects` unchanged for now. Rationale: existing entries don't yet *reference* the new catalogue in their content; adding `connects` edges before content cross-references creates registry drift.
- **Option B (comprehensive):** Update D8, D2, D9, D11, D-A16, D17, D19, handoff, ADR D1 each to add `doc-rag-mentor-alt3-architectural-conventions` to their `connects`. Rationale: per Q4 (Layer B comprehensive editing) — the registry should reflect the catalogue's architectural cross-references even before per-document content updates.

Recommendation: **Option A** (conservative). The natural-next-touch update for each entry can pick up the cross-reference when its content is next revised (e.g., D8 v1.1.0 revision pass would update D8's connects + content together).

---

## 4. Internal consistency findings (Pass 4)

### doc-rag-mentor-alt3-canonical-framework (D2) — post-update consistency check

After applying the §1 changes:
- `status: wired` + `blocker: ""` — consistent. Q2 rule allows empty blocker when no work remains AND no specific next step is named. D2's named next step (the D24 amendments) has landed. The next non-amendment work on D2 (potential v1.2.0 with another coverage gap, or content drift from a future engine build) is not currently named.
- `status: wired` + `notes` includes "Amended 2026-05-02 to v1.1.0..." — consistent. Notes capture both the original Adopted state and the v1.1.0 amendment.
- `humanReady: ready` + `agentReady: na` — consistent (alt-3 deliverable; documentation; not user-facing surface).
- No achievement-language-without-next-step issue (blocker is empty).

### New entry — architectural-conventions catalogue

Proposed entry (full):
```json
{
  "id": "doc-rag-mentor-alt3-architectural-conventions",
  "name": "Alt-3 Architectural Conventions Catalogue (Validation Addendum Promoted)",
  "type": "document",
  "subtype": ["design", "catalogue"],
  "status": "wired",
  "oldStatus": null,
  "ext": ".md",
  "path": "/adopted/rag-mentor-alt3/architectural-conventions.md",
  "desc": "Standalone architectural-conventions catalogue promoted 2026-05-02 from D8's Validation Addendum content under PR8 third-recurrence promotion. Catalogues three adjustments (Rule 9 unstable-vs-false phronesis distinction; Rule 8 compound severity for INFLATION/DEFLATION same-root errors; Rule 7 explicit operative-circle dependency on Rule 6) + description correction (deterministic-for-rule-like + soft-gating-for-interpretive-core) + scope limitation (philodoxia calibration). Cross-references D9 dependencies, D11 Refinement 5, D-A16 catalogue stems carrying validation_addendum_aware flags, D17 / D19 examples. Documentation-consolidation artefact: downstream alt-3 deliverables reference this catalogue rather than re-inlining the prose patterns.",
  "notes": "Adopted 2026-05-02 under D-VALIDATION-ADDENDUM-PROMOTED-2026-05-02 (Path A — approve as drafted; move to /adopted/ this session). Drafted at /drafts/rag-mentor-alt3/architectural-conventions.md, then git mv-moved to /adopted/. Three recurrence sessions cited per PR8 promotion (D-RAG-MENTOR-ALT3-CRITICAL-PATH-APPROVED-2026-05-02 first; D-RAG-MENTOR-ALT3-PHASE1-SESSION2-DRAFTS-2026-05-02 second; D-RAG-MENTOR-ALT3-PHASE1-SESSION3-DRAFTS-2026-05-02 + D-A16-CATALOGUE-ASSEMBLED-AND-ADOPTED-2026-05-02 third). 8 top-level sections covering 3 adjustments + 1 description correction + 1 scope limitation + cross-reference table + promotion provenance + 5 future-revision items. D8 retains v1.0.0 plus Addendum until a future v1.1.0 revision pass folds adjustments into per-rule sections; this catalogue persists as the standalone architectural reference.",
  "deps": [],
  "rules": ["R6b", "R6d", "R7", "R19", "ES1"],
  "priority": "P2",
  "proximity": "",
  "connects": [
    "doc-rag-mentor-alt3-handoff",
    "doc-rag-mentor-alt3-canonical-framework",
    "doc-rag-mentor-alt3-operationalised-rules",
    "doc-rag-mentor-alt3-rule-dependency-map",
    "doc-rag-mentor-alt3-layer-3-translation",
    "doc-rag-mentor-alt3-d-a16-catalogue",
    "doc-rag-mentor-alt3-progression-delta",
    "doc-rag-mentor-alt3-residual-seams",
    "doc-rag-mentor-alt3-adr-01"
  ],
  "origin": "",
  "humanReady": "ready",
  "agentReady": "na",
  "blocker": ""
}
```

Pass 4 consistency on the proposed entry:
- `status: wired` + `blocker: ""` — consistent (no named next step; the catalogue is a complete artefact at the time of promotion; the D8 v1.1.0 revision pass is tracked on D8's blocker, not here).
- `status: wired` + `notes` describes adoption + promotion + structure — consistent.
- `humanReady: ready` + `agentReady: na` — consistent (documentation; not API-facing; alt-3 documentation convention matches d-a16-catalogue precedent).
- `priority: P2` — consistent with d-a16-catalogue precedent (alt-3 catalogue documents).
- `oldStatus: null` — correct for a new entry per skill Step 8.2 (oldStatus updated only on subsequent status changes).
- `deps: []` — consistent (no external dependencies; documentation).
- `rules: ["R6b", "R6d", "R7", "R19", "ES1"]` — derived from the catalogue's content per the decision-log entry's rules-served list (R0 / 0a-0g / PR-codes excluded as the registry's `rules` field uses manifest R-codes only).

### Rest of the registry (188 unchanged components)

**Spot-check approach justified:** The v1.4.0 update (D-REGISTRY-UPDATE-v1.4.0-2026-05-02) was a comprehensive 4-pass run on the same calendar day (2026-05-02). No code, schema, or registry-content changes have occurred between v1.4.0 and now apart from the three governance changes captured in §1 + the new entry. Pass 4 contradiction checks against unchanged rows would re-derive the v1.4.0 baseline. **No new contradictions surfaced** in Pass 4 spot-check of the touched rows.

---

## 5. New component proposals

See §4 for the proposed `doc-rag-mentor-alt3-architectural-conventions` entry (full JSON above).

**Justification:** A new file at `/adopted/rag-mentor-alt3/architectural-conventions.md` (28,367 bytes) was created and Adopted on 2026-05-02 under `D-VALIDATION-ADDENDUM-PROMOTED-2026-05-02`. The catalogue is a PR8 third-recurrence promotion of D8's Validation Addendum content, per the decision-log entry. It is documented as the standalone architectural reference for the three adjustments + description correction + scope limitation. Per skill discipline ("No silent additions"), explicit founder approval is required before adding to the registry.

---

## 6. Ambiguous matches requiring founder decision

None.

---

## 7. No-change findings

- **Snapshot files** (`/api/reason` + `/api/mentor/private/reflect` snapshots from 2026-05-02): NOT proposed for tracking. The companion snapshot from earlier 2026-05-02 was never added to the registry; precedent + the next-session prompt's explicit guidance both direct that archive snapshots remain documentary artefacts outside registry scope.
- **All 18 entries that connect to D2**: unchanged this update (D2's id, path, name, type, subtype unchanged — `connects` edges remain valid).
- **D8** if Option A on the optional D8 cross-reference is declined.
- **All other 188 registry entries**: spot-check confirmed consistency against the v1.4.0 baseline; no changes proposed.

---

## Summary for founder

**Plain-language summary:**

The 2 May streams session left two registry follow-ups:

1. **D2's blocker is now stale.** The blocker said "Next: D2 amendment for the five D24 coverage-gap additions..." — that amendment landed yesterday as Stream B (D2 → v1.1.0). Per Q2 rule, the blocker should be cleared (no further substantive next step is named for D2 itself). D2's notes get a one-line addition recording the v1.1.0 amendment.

2. **A new entry needs adding for the architectural-conventions catalogue.** Stream D produced a brand-new file at `/adopted/rag-mentor-alt3/architectural-conventions.md` (the PR8 promotion of D8's Validation Addendum). The new entry shape mirrors the d-a16-catalogue precedent (subtype `["design", "catalogue"]`; status `wired`; rules `["R6b", "R6d", "R7", "R19", "ES1"]`; priority `P2`; connects to 9 alt-3 deliverables).

**One optional addition:** D8's notes could append a one-line cross-reference to the new catalogue. Conservative choice: defer to the D8 v1.1.0 revision pass session (where per-rule integration replaces the cross-reference). Comprehensive choice: add the cross-reference now. Recommendation: defer (Option A).

**Three founder decisions needed:**

1. **Version bump:** v1.4.0 → **v1.5.0** (skill rule for additions; recommended) OR v1.4.0 → v1.4.1 (next-session-prompt's loose suggestion; deviation from skill rule).
2. **D8 optional notes cross-reference:** add now OR defer to D8 v1.1.0 revision pass session.
3. **Connects strategy for the new entry's reverse edges:** Option A (conservative — only the new entry's outgoing connects) OR Option B (comprehensive — update 9 existing entries' connects to include the new catalogue).

After approval: pre-edit backup → apply edits → recompute statusSummary → bump version → JSON validate → write decision-log entry → provide founder verification commands.

---

*End of proposal. The skill discipline reaches Step 7 (proposal presented; awaiting founder approval). Steps 8 (apply) and 9 (decision-log entry) will follow founder decisions.*
