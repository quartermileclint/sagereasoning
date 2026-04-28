# Registry Update Proposal — 2026-04-28 (run -b, REVISED after Pass 1 lookback fix)

**Skill:** `sage-registry-update` (redesigned 2026-04-28 under D-REGISTRY-UPDATE-SKILL-REDESIGNED; Pass 1 lookback rule patched 2026-04-28 under D-REGISTRY-UPDATE-SKILL-PASS1-FIX).
**Run identifier:** First successful invocation of the redesigned-and-patched skill. PR1 single-endpoint proof.

**Registry version:** v1.2.1
**Registry lastUpdated:** 2026-04-28
**Lookback range (Pass 1 anchor):** 2026-04-08 → 2026-04-28 (founder-confirmed anchor for this run; no prior non-superseded `D-REGISTRY-UPDATE-vX.Y.Z` entry exists, so the founder-confirmed default was used)
**Components audited (Pass 4):** 163 (all)
**Handoffs scanned (Pass 1):** 81 since 2026-04-08
**Decision-log entries scanned (Pass 1):** all entries since 2026-04-08

**Pass 1 redundancy metric (founder-requested):**
- REDUNDANT (all mentioned components already in audit's v1.2.1 set): **3 handoffs** ← non-zero, confirms audit's coverage of those rows
- NO_COMPONENTS (no per-component claims in standard sections): 59 handoffs
- HAS_NEW (mentions components beyond audit's set): 19 handoffs

After investigation of HAS_NEW handoffs, **one** substantive Pass 1 finding emerged. The other HAS_NEW mentions either described already-correct registry state (engine-trust-layer, infra-resend, engine-proactive — all isolated as their blockers say) or were tool-* mentions in early-April test sessions without status-change claims.

**Components proposed for update:** 17 rows (1 Pass 1 + 3 Pass 4 notes + 13 Pass 4 Q3) + 0–5 Q2 depending on founder direction
**New components proposed:** 0
**Ambiguous matches needing founder input:** 0
**Q2 empty-blocker findings flagged for founder review:** 28

---

## Reading the proposal — context

Pass 1 with the corrected lookback (anchor 2026-04-08) added one substantive finding — `engine-mentor-ledger` blocker rewrite per D-PE-LEDGER-WIRING-REDIRECTED — that the audit could not apply because that change had been part of the rolled-back v1.3.0.

Pass 4 (internal consistency) findings are unchanged from the previous proposal: 3 rows with stale `notes`, 13 components needing Q3 `na` reclassification, 28 Verified rows with empty `blocker` flagged for Q2 review.

Pass 2 and Pass 3 unchanged: 0 new corrections proposed.

---

## 1. Source-scan findings (Pass 1, anchor 2026-04-08)

### `engine-mentor-ledger` — Mentor Ledger

**Current state:**
- `status`: `wired`
- `blocker`: "Isolated. Part of Sage Mentor. Not integrated."
- `notes`: "Part of isolated Sage Mentor. Not integrated."

**Proposed change:**
- `blocker` (replace): "Wiring approach redirected to ADR-PE-01 per D-PE-LEDGER-WIRING-REDIRECTED (2026-04-26). Module is the journal-extraction accountability layer (six entry kinds: aim/commitment/realisation/question/tension/intention) — NOT a session-outcome write-side as the prior session brief had assumed. Read-and-report confirmed zero Supabase calls, zero callers in /website/src, zero migration references. ADR-PE-01 §13 names ledger persistence as out of scope. Next: a separate ADR if/when ledger persistence is pursued."
- `notes` (replace): "Journal-extraction accountability layer (not a write-side). Pattern-engine output persists under ADR-PE-01 in the encrypted profile blob, separate from this ledger. Ledger persistence is out of scope of ADR-PE-01."

**Evidence:**
- Source: `/operations/handoffs/tech/2026-04-26-mentor-ledger-wiring-redirected-to-ADR-PE-01-close.md` (Status Changes + Decisions Made sections)
- Quoted (Status Changes): "`sage-mentor/mentor-ledger.ts` | Capability inventory: not-ready (Isolated, not integrated) | **Status unchanged.** Brief premise corrected; this session did not move the item. The module is correctly described as a pure journal-extraction layer with no DB write-side."
- Quoted (Decisions): "Engine-mentor-ledger capability item does not move today. The capability inventory line for `engine-mentor-ledger` (Isolated → Wired) does not progress in this session. Pursuing ledger persistence is out of scope of ADR-PE-01 and would be a separate ADR if undertaken. Named in the ADR's §13 summary table as 'out of scope.'"
- Cross-reference: D-REGISTRY-AUDIT-v1.2.1 cross-references explicitly note `D-PE-LEDGER-WIRING-REDIRECTED (2026-04-26, the redirect whose outcome was already reflected via the prior session's edit #7 but is preserved here as cross-reference)` — but that 'edit #7' was in the rolled-back v1.3.0, so the audit could not apply it. This Pass 1 finding lands what was rolled back.
- Reasoning: The current blocker text "Isolated. Part of Sage Mentor. Not integrated." is technically true (the module IS isolated) but factually incomplete — it doesn't capture the architectural correction (the ledger is not what we thought it was) or the redirect outcome. Per Q2 rule: blocker carries a remaining-work note ("separate ADR if/when ledger persistence is pursued").

---

## 2. Code-grep findings (Pass 2)

**No corrections proposed.** Same as previous run. 8 components with 'isolated' blocker confirmed actually isolated (consistent). 1 false positive (`engine-trust-layer` directory-path match). 1 discrepancy noted (`engine-progression`) — leave as is.

---

## 3. Transitive impact findings (Pass 3)

**No findings.** The audit's blocker rewrites already absorbed related-row implications.

Note: the Pass 1 engine-mentor-ledger change does not trigger Pass 3 either — its `connects` and `deps` arrays don't reach rows whose blocker text references mentor-ledger by name in a stale way.

---

## 4. Internal consistency findings (Pass 4)

### 4a. Notes-field drift (3 rows — propose `notes` updates)

**Same as previous run.** The audit corrected `blocker` text on `agent-private-mentor`, `engine-pattern-engine`, and `engine-ring-wrapper` but did not touch `notes`. All three still read 'Not integrated' / 'isolated' in `notes` while their `blocker` reflects Verified end-to-end state. Proposed: replace `notes` with text matching the corrected `blocker`.

#### `agent-private-mentor` — Private Mentor (Intimate Data Boundary)

**Current state:**
- `status`: `wired`
- `notes`: "Part of isolated Sage Mentor subsystem. Journal interpreter has 25 TODOs (layers 9-10 incomplete). Not integrated."

**Proposed change:** `notes` (replace) → "Security boundary for intimate data, with /api/mentor/private/reflect Verified end-to-end on 2026-04-26 (canonical-MentorProfile loader + per-consumer 2A-recompute + live mentor_interactions loader). Layers 9-10 of journal interpreter remain stub state (25 TODOs). /private-mentor page chat-thread UX limitation remains outstanding (O-S5-A)."

#### `engine-pattern-engine` — Pattern Recognition Engine

**Current state:**
- `status`: `verified`
- `notes`: "Part of isolated Sage Mentor. Not integrated."

**Proposed change:** `notes` (replace) → "Live integration Verified end-to-end per ADR-PE-01 (Sessions 1-6, 2026-04-26). Pattern-engine output persists in encrypted form and feeds /api/mentor/private/reflect via per-consumer 2A-recompute and /api/founder/hub via 2A-skip. §8 founder-hub switch is the next named step."

#### `engine-ring-wrapper` — Ring Wrapper (BEFORE/AFTER)

**Current state:**
- `status`: `verified`
- `notes`: "Internally complete and sophisticated but part of isolated Sage Mentor. Not integrated into website."

**Proposed change:** `notes` (replace) → "Verified across three proof endpoints (mentor-ring, support-agent, founder-hub-ring) per D-RING-1 (2026-04-25) and canonical-MentorProfile migration per D-RING-2-S4C (2026-04-26). Eight callers consume canonical MentorProfile."

---

### 4b. Q3 convention — `na` for pipeline-internal components (13 components × 2 fields)

**Same as previous run.** Per Q3 rule: components with `journey: internal` should read `humanReady: na` and `agentReady: na` rather than `not-ready`.

**Proposed change (batch):** For each component below, change `humanReady` and `agentReady` from `not-ready` to `na`.

| Component ID | Name | Current humanReady / agentReady | Proposed |
|---|---|---|---|
| `agent-private-mentor` | Private Mentor (Intimate Data Boundary) | `not-ready` / `not-ready` | `na` / `na` |
| `agent-sage-ops` | Sage Ops (AI Cofounder) | `not-ready` / `not-ready` | `na` / `na` |
| `agent-session-bridge` | Session Bridge (Cowork Link) | `not-ready` / `not-ready` | `na` / `na` |
| `engine-authority-mgr` | Authority Manager | `not-ready` / `not-ready` | `na` / `na` |
| `engine-embedding` | Embedding Pipeline (pgvector) | `not-ready` / `not-ready` | `na` / `na` |
| `engine-mentor-ledger` | Mentor Ledger | `not-ready` / `not-ready` | `na` / `na` |
| `engine-pattern-engine` | Pattern Recognition Engine | `not-ready` / `not-ready` | `na` / `na` |
| `engine-proactive` | Proactive Scheduler | `not-ready` / `not-ready` | `na` / `na` |
| `engine-profile-store` | Profile Store | `not-ready` / `not-ready` | `na` / `na` |
| `engine-ring-wrapper` | Ring Wrapper (BEFORE/AFTER) | `not-ready` / `not-ready` | `na` / `na` |
| `infra-resend` | Email (Resend) | `not-ready` / `not-ready` | `na` / `na` |
| `reasoning-journal-layers` | Journal Interpretation (10 Layers) — Implementation | `not-ready` / `not-ready` | `na` / `na` |
| `reasoning-sanitise` | Prompt Injection Defence | `not-ready` / `not-ready` | `na` / `na` |

**Total:** 13 components, 26 field changes.

---

### 4c. Q2 convention — empty `blocker` on Verified rows (28 rows — needs founder review)

**Same categorisation as previous run.**

**Likely genuinely complete — leave blocker empty (recommendation: no action) — 23 rows:**

- `doc-cofounder-blueprint` — Sage Cofounder Blueprint
- `doc-journal-layers` — Journal Interpretation (10 Layers) — Spec Document
- `doc-license` — Proprietary License
- `doc-mentor-arch` — Mentor Claude Integration Architecture
- `doc-setup-plan` — Setup Plan (Original)
- `doc-sources-index` — Sources Index (9 Texts)
- `doc-trust-framework` — Agent Trust Layer Framework
- `doc-v3-adoption` — V3 Adoption Scope (Complete)
- `engine-agent-assessment` — Agent Assessment Framework (55)
- `engine-stoic-brain-v3` — Stoic Brain v3 (8-File Dataset)
- `gov-draft-amendments` — DRAFT Manifest Amendments
- `gov-draft-instructions` — DRAFT Project Instructions
- `gov-draft-priorities` — DRAFT Revised Build Priorities
- `gov-ethical-analysis` — Ethical Analysis (R17-R20 Source)
- `governance-knowledge-gaps` — Knowledge Gaps Reference (KG1-KG7)
- `governance-safety-signal-audit` — Safety Signal Audit (Zone 2 Clinical Adjacency)
- `reasoning-kathekon` — Kathekon Assessment
- `reasoning-katorthoma` — Katorthoma Proximity Scale
- `reasoning-oikeiosis` — Oikeiosis Developmental Sequence
- `reasoning-passion-diagnosis` — Passion Diagnosis
- `reasoning-prohairesis` — Prohairesis Filter
- `reasoning-senecan` — Senecan Progress Tracking
- `reasoning-virtue-unity` — Unified Virtue Assessment

**Worth a remaining-work note (recommendation: add note as proposed) — 5 rows:**

- `infra-constraints` — Compile-Time Safety Constraints (constraints.ts)
  - **Proposed remaining-work note:** "constraints.ts AC1 thresholds adopted as working values; revisit if operational evidence shifts."
- `infra-eslint-config` — ESLint Safety-Critical Configuration
  - **Proposed remaining-work note:** "ESLint safety-critical rules Verified; rule set reviewed alongside any AC4 invocation-test changes."
- `infra-husky-precommit` — Husky Pre-Commit Hook
  - **Proposed remaining-work note:** "Pre-commit hook Verified; revisit if AC4 test surface expands."
- `infra-r20a-classifier` — R20a Distress Classifier (Two-Stage)
  - **Proposed remaining-work note:** "Two-stage distress classifier Verified at AC2 latency budget; ES1 founder-profile inputs must be in Zone 2 eval suite before P1 transition."
- `reasoning-guardrails` — AI Safety Guardrails
  - **Proposed remaining-work note:** "AI safety guardrails — Verified at current scope; ongoing review under R14 quarterly compliance pipeline."

**Founder decision needed:** Reply with one of:
- 'Q2 batch: leave all empty' — adopt the convention that empty blocker on Verified is acceptable when work is complete with no named next step; no action this run.
- 'Q2 batch: apply my recommendations' — add the 5 proposed remaining-work notes; leave the rest empty.
- 'Q2 per-row instructions follow:' — give per-row instructions.
- 'Q2 defer' — leave for a future session; no Q2 changes this run.

---

## 5. New component proposals (Pass 1 + codebase-walk)

**No new components proposed this run.** The 62 Class A candidates from `/operations/registry-updates/audit-2026-04-28.md` Section 6a remain available for a dedicated session.

---

## 6. Ambiguous matches requiring founder decision

**None this run.**

---

## 7. No-change findings (transparency)

- 163 components audited under Pass 4.
- 8 components with 'isolated' blocker confirmed isolated (Pass 2 consistent).
- 0 transitive-impact findings (Pass 3).
- 81 handoffs scanned under Pass 1; 3 redundant (audit-covered), 59 carry no per-component claims, 19 mention components beyond audit set but only 1 (engine-mentor-ledger) carries a substantive registry change.

---

## Apply summary (if all sections approved)

- **Section 1 (Pass 1):** 1 row update (engine-mentor-ledger blocker + notes).
- **Section 4a (notes drift):** 3 row updates.
- **Section 4b (Q3 batch):** 13 row updates × 2 fields = 26 field changes.
- **Section 4c (Q2):** 0 / 5 / per-row depending on founder direction.

**Total rows touched:** 17 (1 + 3 + 13 non-overlapping). If 4c with recommendations is applied, +5 rows for blocker-only update.

**Version bump:** Patch (v1.2.1 → v1.2.2). No new components, no schema changes.
**Pre-edit backup target:** `/archive/component-registry/component-registry.json.backup-2026-04-28-HHMM` (no `-audit-` infix).

---

## Founder review prompt

Please reply with one of:
- 'Apply all sections' (Section 1 + 4a + 4b + 4c with my recommendations)
- 'Apply sections [N, N]' (e.g., 'apply 1 + 4a + 4b only; defer 4c')
- 'Per-section instructions follow:' (then your direction per section)
- 'Reject and re-propose' (if the shape is wrong)