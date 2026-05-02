# Next-Session Prompt — Streams B + C + D (Three Bounded Tasks; C → D → B Sequencing)

**Stream:** founder. **Tier:** founder/governance scope.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-02-component-registry-update-close.md`.
**Predecessor decision-log entry:** `D-REGISTRY-UPDATE-v1.4.0-2026-05-02`.

This session covers three of the bounded next-session candidates surfaced in the predecessor session close §"Next Session Should":

- **Stream C — `/api/reason` snapshot session** (Standard risk; documentary).
- **Stream D — Validation Addendum third-recurrence promotion** (Standard risk; new governance document).
- **Stream B — D2 amendment session for the 5 D24 coverage gaps** (Elevated risk; D2 re-approval required).

**Recommended sequencing: C → D → B** — Standard → Standard → Elevated; momentum-building; B's Elevated risk last when the day's foundation is set. The founder can call a different order or pause after any stream cleanly. Each stream is internally bounded with its own verification step; the session can stabilise and close after any one of them if the founder signals "done for now".

---

## Why this session matters

The predecessor session brought the component registry to v1.4.0 with comprehensive alt-3 Phase-1 tracking. The Phase-2 pass-1 readiness inventory now reads:

| Precondition | Status |
|---|---|
| All 26 Phase-1 + D-A16 deliverables Adopted | ✅ Complete |
| D-A16 catalogue minimum (T3-001 + T3-002 stems) | ✅ Complete |
| `/api/mentor/private/reflect` snapshot | ✅ Complete |
| Component registry up-to-date | ✅ Complete (v1.4.0) |
| **`/api/reason` snapshot** | ⚠️ **Pending — Stream C of this session** |
| **P2 task 2c encryption wiring** | ⚠️ Pending — Critical-risk; future Candidate E session |
| Founder approval of pass-1 Critical Change Protocol responses | ⚠️ Pending — at pass-1 commencement |

Three additional improvements remain logged from the predecessor sessions and benefit from landing before Phase-2 pass-1 commencement:

- **Stream B (D2 amendment).** D24 audit identified five small coverage-gap additions D2 needs. D23 §O5.2 logs them as deferred. They are surfaced explicitly in the new D2 blocker text (added in v1.4.0). D2 is in `/adopted/`; amendment requires re-approval per D2's approval-gate footer (Elevated risk).
- **Stream C (`/api/reason` snapshot).** D24 audit recommended this snapshot before Phase-2 pass 3 (conversation surface migration). Documentary snapshot at git ref. Same shape as the `/api/mentor/private/reflect` snapshot already produced (D-MENTOR-PRIVATE-REFLECT-PRE-ALT3-SNAPSHOT-2026-05-02). Not pass-1 or pass-2 blocking; pass-3 blocking.
- **Stream D (Validation Addendum third-recurrence promotion).** The Validation Addendum content (Rule 9 unstable-vs-false phronesis; Rule 8 compound severity; Rule 7 operative-circle dependency; description correction; scope limitation) reached the 3-recurrence promotion threshold per PR8. Recommended path per the prior session close: separate alt-3 architectural-conventions catalogue under `/adopted/rag-mentor-alt3/`. Three D-A16 stems carry `validation_addendum_aware: true` flags; this catalogue would host the prose patterns these flags reference.

None of these unblocks Phase-2 pass 1 directly (that needs Candidate E — encryption wiring). They consolidate the Phase-1 design's internal consistency before pass 1 commences.

---

## Pre-conditions for this session opening

This session does not begin until:

1. **Founder push of the v1.4.0 registry commits via GitHub Desktop per D-PR8-PUSH-2026-04-26.** The 5 files staged at the close of the predecessor session (registry, decision-log, proposal, backup, session close) plus the predecessor session's input prompt and this prompt must be committed and pushed before this session begins. Verbatim git commands appear in the predecessor session close §"Founder Verification" Step 6.
2. **Vercel green confirmation.** Founder confirmed Vercel deployed v1.4.0 cleanly.
3. **Founder readiness for a multi-stream session.** Three streams totalling Standard / Standard / Elevated risk; no Critical surface touched.

If pre-conditions are not met at session open, the agent's first action is to confirm with the founder which path applies. Do not proceed to stream work on top of unpushed prior work.

---

## Part A — Open the session under the protocol

Per `/adopted/session-opening-protocol.md` Part A elements 1–8, do the full read sequence. Tier: founder/governance scope. Read:

1. **`/manifest.md`** — particularly R0 (oikeiosis), R6a–R6e (methodology — relevant to D2 amendment), R7 (source fidelity), R8a–R8d (audience-tier glossary), R20a (perimeter — D24 audit context), AC4 (invocation testing — Stream C snapshot), AC5 (R20a perimeter), AC7 (Session 7b — Stream C must not engage), KG1 (Vercel rules — Stream C documentation), KG3 (hub-label consistency — Stream C documentation).
2. (Project instructions — already in system prompt.)
3. **`/operations/handoffs/founder/2026-05-02-component-registry-update-close.md`** — the predecessor session close. Required context. Particularly §"Next Session Should" for the candidate definitions and §"Founder Verification" for the post-deploy state.
4. **`/operations/decision-log.md`** — read at minimum the last 5 entries:
   - `D-REGISTRY-UPDATE-v1.4.0-2026-05-02` (the prior baseline)
   - `D-A16-CATALOGUE-ASSEMBLED-AND-ADOPTED-2026-05-02`
   - `D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02`
   - `D-RAG-MENTOR-ALT3-PHASE1-SESSION3-DRAFTS-2026-05-02` (D24 source)
   - `D-MENTOR-PRIVATE-REFLECT-PRE-ALT3-SNAPSHOT-2026-05-02` (the snapshot Stream C mirrors)
   - `D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29` (the Validation Addendum source for Stream D)
5. **Stream-specific reads (do all three before any stream begins, so the session has full context):**

   **For Stream C (`/api/reason` snapshot):**
   - **`/archive/2026-05-02_api-mentor-private-reflect_pre-alt-3-snapshot.md`** — the existing snapshot. Stream C mirrors this shape against `/api/reason` instead of `/api/mentor/private/reflect`.
   - **`/website/src/app/api/reason/route.ts`** — the route to be snapshotted (read-only).
   - **`/adopted/rag-mentor-alt3/consumer-workflow-audit.md`** (D24) — particularly §"Route 6 — /api/reason" for the dual-auth pattern named as canonical KG4 example.
   - **`/adopted/rag-mentor-alt3/migration-plan.md`** (D21) — particularly the Phase-2 pass 3 commencement section that the snapshot supports.

   **For Stream D (Validation Addendum promotion):**
   - **`/adopted/rag-mentor-alt3/operationalised-rules.md`** (D8 v1.0.0) — particularly the Validation Addendum section. The addendum's three adjustments + description correction + scope limitation are the source content for the new architectural-conventions catalogue.
   - **`/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md`** — the alt-3 architecture handoff with the Validation Addendum section. The handoff's addendum text is the canonical source.
   - **`/adopted/rag-mentor-alt3/d-a16-catalogue.md`** (D-A16) — particularly the three entries with `validation_addendum_aware: true` (T3-002 PRAXIS_MOTIVATION_AMBIGUITY; T2E-001 STATED_OPERATIVE_CONFLICT; RIT-E-003 evening-virtue-deficiency-pattern). The new catalogue's prose patterns live in Layer 3's Refinement 5 projection per D11 — Stream D's catalogue is a separate document hosting the patterns the flags reference.
   - **`/adopted/rag-mentor-alt3/layer-3-translation.md`** (D11) — Refinement 5 specifies the Validation Addendum Adjustment 1 prose projection. Stream D's catalogue references D11's Refinement 5 as the runtime mechanism.

   **For Stream B (D2 amendment):**
   - **`/adopted/rag-mentor-alt3/canonical-framework.md`** (D2) — the document to be amended. Read in full. Particularly Tables 1, 2, 4a, 4b, 5, 6 and the eight perimeter routes' projection mappings. D2's approval-gate footer at the end specifies the re-approval requirement.
   - **`/adopted/rag-mentor-alt3/consumer-workflow-audit.md`** (D24) — particularly §"Coverage gaps in D2 mapping tables". The five amendments are catalogued there in full with reasoning.
   - **`/adopted/rag-mentor-alt3/open-questions.md`** (D23) — particularly §O5.2 logging the five amendments as deferred.

6. **`/operations/knowledge-gaps.md`** — scan KG1–KG7 for relevance. KG1 rule 2 (await all database writes) and KG3 (hub-label consistency) are referenced in the existing snapshot — Stream C will reference these at parity. KG2 (Sonnet/Haiku boundary) is named as a `/api/reason` constraint in D24 — Stream C captures the dual model selection on the route. KG4 (cell vocabulary) is N/A this session.

Confirm: tier, hold-point status (still active per P0 0h), model selection (no LLM model selection at session level — design / documentation only; Stream C documents the route's existing model selections but doesn't change them), status-vocabulary readiness, signals/risk-classification readiness.

---

## Part B — Verify state

Quick check:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git status -s
git log --oneline -3
```

Expected: `git status -s` empty (working tree clean). Latest commit should be the v1.4.0 registry update commit ("registry update v1.4.0: comprehensive alt-3 Phase-1 tracking" or whatever the founder named it).

If the working tree is not clean, surface the modifications to the founder before proceeding. If `index.lock` errors appear (D-LOCK-CLEANUP-2026-04-26 pattern), call `mcp__cowork__allow_cowork_file_delete` for the lock file, then retry.

---

## Stream C — `/api/reason` snapshot session

**Order in this session: 1st (recommended).**
**Risk classification:** Standard under 0d-ii. Documentary file under `/archive/`; no live-system effect.

### Why first

C is the simplest of the three. Documentary work; mirrors the existing `/api/mentor/private/reflect` snapshot. No re-approval gate; no new governance document. Builds momentum for D and B.

### What to produce

A new file at **`/archive/2026-05-03_api-reason_pre-alt-3-snapshot.md`** (use today's date; if the session opens on a different date, name accordingly) capturing `/api/reason`'s end-to-end behaviour at the current git ref.

### Reference template

The new snapshot mirrors `/archive/2026-05-02_api-mentor-private-reflect_pre-alt-3-snapshot.md`. Read that file in full at session open (Part A element 5). Use its structure as the template:

- **Header** — git ref, date, route name, route file path, page-side caller (if any).
- **Server-side workflow** — step-by-step from request entry to response: rate limit, auth, body parse, R20a check, context loading, model invocation(s), response parse, persistence, analytics, response envelope. For `/api/reason` specifically: capture the dual-auth pattern (canonical KG4 example per D24) and the depth-based model selection (Haiku for quick depth — KG2 boundary; Sonnet for standard / deep depths).
- **Page-side flow** — if `/api/reason` is invoked from one or more pages, capture the typed-state, request shape, response handling, rendering. If it is engine-only / API-only, document that explicitly.
- **Full prompt text** — the actual system + user prompts the route assembles. Per R7 (source fidelity).
- **Database schema reference** — any tables the route writes to (`reasoning_results`, `reasoning_evaluations`, etc.).
- **Architectural facts captured for post-build comparison:**
  - Visible output shape (what the consumer sees in the response).
  - Persistence shapes (which fields written to which tables).
  - Diagnostic fields (analytics, telemetry).
  - Latency profile (rough — quick / standard / deep depth ranges).
  - R20a perimeter compliance (`detectDistressTwoStage` + `enforceDistressCheck` invocation pattern; AC4 invocation test reference).
  - KG1 rule 2 conformance (all DB writes awaited).
  - KG2 boundary (model-per-depth selection).
  - KG3 hub-label compliance (if hub-scoped data is read or written).

### Verification step (founder-performable)

```
ls archive/2026-05-03_api-reason_pre-alt-3-snapshot.md
head -20 archive/2026-05-03_api-reason_pre-alt-3-snapshot.md
```

Expected: file exists; header shows route path, git ref, date.

```
grep -c "## " archive/2026-05-03_api-reason_pre-alt-3-snapshot.md
```

Expected: number of sections matches the template structure (typically 8–12 sections).

### Decision-log entry

Append to `/operations/decision-log.md`:

`D-API-REASON-PRE-ALT3-SNAPSHOT-2026-05-03` (or session-open date). Structure mirrors `D-MENTOR-PRIVATE-REFLECT-PRE-ALT3-SNAPSHOT-2026-05-02`. Cross-references: that predecessor entry; D-RAG-MENTOR-ALT3-PHASE1-AUDIT-2026-05-01 (D24 source); D-RAG-MENTOR-ALT3-PHASE1-SESSION3-DRAFTS-2026-05-02 (D21 § Precondition 3 — pass 3 reference).

### Pause point

After Stream C lands and is verified, this is a clean pause point. If the founder signals "done for now", stabilise (the snapshot file landed; decision-log entry appended) and close the session per Part E. Streams D and B remain queued.

---

## Stream D — Validation Addendum third-recurrence promotion

**Order in this session: 2nd (recommended).**
**Risk classification:** Standard under 0d-ii. New governance document under `/adopted/rag-mentor-alt3/`; no live-system effect.

### Why second

D is similar in shape to the predecessor D-A16 catalogue session — write a new governance file under `/adopted/rag-mentor-alt3/`, append a decision-log entry. Familiar pattern; bounded scope.

### What to produce

A new file at **`/adopted/rag-mentor-alt3/architectural-conventions.md`** (recommended filename — adjustable per founder direction) capturing the Validation Addendum's three adjustments + description correction + scope limitation as a permanent alt-3 architectural-conventions catalogue. The catalogue documents the patterns once; D8 retains its v1.0.0 plus addendum; D17 / D19 / D11 / D9 / D-A16 reference the new catalogue rather than re-inlining the addendum prose.

### Recommended structure

- **Header** — Status (Adopted upon founder approval); Date; Stream; Governing frame; Implements (D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29 promoted under PR8); Cross-references.
- **Plain-language summary** — what this catalogue is and why it exists (the Validation Addendum's content reached the 3-recurrence promotion threshold per PR8).
- **§1 Adjustment 1 — Rule 9 unstable-vs-false phronesis distinction.** Full prose pattern; the runtime projection rule (per D11 Refinement 5); examples; what flags it interacts with (`SELF_REPORT_DEPENDENT`, `CONFIDENCE_WEIGHTED`).
- **§2 Adjustment 2 — Rule 8 compound severity for INFLATION/DEFLATION same-root errors.** Full prose pattern; the engine-sequencing dependency interaction (per D9 Dependency 4); examples.
- **§3 Adjustment 3 — Rule 7 explicit operative-circle dependency on Rule 6.** Full prose pattern; the engine-sequencing dependency (per D9 Dependency 5b); examples; how Layer 3 translates the operative-circle distinction (per D11).
- **§4 Description correction** — deterministic-for-rule-like + soft-gating-for-interpretive-core. The architectural framing convention applied across the rule book.
- **§5 Scope limitation** — philodoxia calibration; recalibration needed for other primary passions. ES1 (founder profile) is the current reference; future passion-set expansion requires recalibration.
- **§6 Where these patterns surface at runtime** — cross-reference table mapping each Adjustment to D11 Refinement 5 (Layer 3 prose); D9 Dependency map; D-A16 catalogue's three `validation_addendum_aware: true` stems; D17 progression-delta interaction.
- **§7 Promotion provenance** — three recurrence sessions cited (per PR8 promotion rule). Per the predecessor session-3 close PR5 entry, the threshold has been observed across multiple post-validation sessions.
- **§8 Open questions / future revisions** — D8 v1.1.0 revision pass remains pending (per D8's blocker); the architecture-exercise transcript is the source for that revision when it lands.

### Approval gate

The catalogue file is drafted at `/drafts/rag-mentor-alt3/architectural-conventions.md` first; founder approval (via AskUserQuestion) is the trigger for moving to `/adopted/`. Two approval-pathway options to surface (matching the precedent of D-A16):

- **Path A — Approve as drafted; move to `/adopted/` this session.** Familiar Path-B-equivalent operational signal.
- **Path B — Approve as drafted; move to `/adopted/` at a separate session.** More cautious; same as the original D2/D3/D8 batched move precedent.

Recommendation: Path A (matches the operational precedent set by D-A16).

### Verification step (founder-performable)

```
ls adopted/rag-mentor-alt3/architectural-conventions.md
head -10 adopted/rag-mentor-alt3/architectural-conventions.md
```

Expected: file exists in `/adopted/`; Status line shows Adopted (post-founder-approval).

```
grep -c "^## " adopted/rag-mentor-alt3/architectural-conventions.md
```

Expected: 8 top-level sections (per the recommended structure).

### Decision-log entry

`D-VALIDATION-ADDENDUM-PROMOTED-2026-05-03` (or session-open date). Cross-references: D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29 (the original validation); D-A16-CATALOGUE-ASSEMBLED-AND-ADOPTED-2026-05-02 (the catalogue's three flagged stems that this catalogue's prose patterns serve); D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (Phase-1 design batch this catalogue extends).

### Component registry impact

A new entry should be proposed for the registry — `doc-rag-mentor-alt3-architectural-conventions` — type `document`, subtype `["design", "catalogue"]`, status `wired`, similar shape to `doc-rag-mentor-alt3-d-a16-catalogue`. **Do NOT update the registry in this session.** Log the new entry as a follow-up registry-update item; bundle it with any other Phase-1 tail-end registry changes for a future v1.4.1 (or v1.5.0) registry-update session per the operative skill discipline.

### Pause point

After Stream D lands and is verified, this is a clean pause point. If the founder signals "done for now", stabilise (catalogue file under `/adopted/`; decision-log entry appended) and close. Stream B remains queued.

---

## Stream B — D2 amendment for the 5 D24 coverage gaps

**Order in this session: 3rd (recommended).**
**Risk classification:** Elevated under 0d-ii. D2 is in `/adopted/`; amendment requires re-approval per D2's approval-gate footer.

### Why third

B is the most consequential — it amends an Adopted governing document. Doing it last means the operator is warm and the day's foundation (snapshot + Validation Addendum catalogue) is set. The Elevated change is the single biggest move of the session and benefits from the focus.

### What to amend

D2 (`/adopted/rag-mentor-alt3/canonical-framework.md`) gains five small additions per D24 §"Coverage gaps in D2 mapping tables". The amendments do **not** redesign the 9+1 mechanism set; they fill in coverage gaps the audit identified. Per D24:

1. **`prior_feedback` projection note for Route 1** (`/api/score`). D2's Table 1 projection rule currently does not call out the `prior_feedback` field handling for Route 1; D24 confirms it should.
2. **Aggregate-across-options note for Route 2** (`/api/score-decision`). D2's mapping for Route 2 should explicitly note the aggregate-across-options behaviour D24 documents.
3. **Policy-mode-specific Table 6 for Route 3** (`/api/score-document`). When `/api/score-document` runs in policy mode, the D2 projection should reference a policy-mode-specific Table 6 (currently implicit).
4. **quick-depth Table 0 / 1a for Route 6** (`/api/reason`). D2 should explicitly include a quick-depth projection (Table 0 / 1a) per Route 6's depth-based behaviour D24 documents.
5. **Table 4a dual applicability for Routes 7 + 8 ritual flow.** D2's Table 4a currently scopes to one route; D24 confirms it applies to both `/api/reflect` (Route 7) and `/api/mentor/private/reflect` ritual flow (Route 8 first flow).

Each amendment is a localised text change to D2. None redesigns the 9+1 mechanism set.

### Recommended workflow

1. **Read D2 in full** at session open (Part A element 5). Understand the Tables 1, 2, 4a, 4b, 5, 6 structure and the per-route projection rules.
2. **Read D24 §"Coverage gaps in D2 mapping tables" in full** to surface the exact text of the five amendments.
3. **Surface the approval pathway via AskUserQuestion.** D2 is in `/adopted/`; amendment requires re-approval per the approval-gate footer. Two approval-pathway options:
   - **Path A — Apply amendments + bump D2 to v1.1.0 in same session.** Founder reviews each of the 5 proposed amendments; approves; agent applies; D2 header updates to v1.1.0.
   - **Path B — Apply amendments to D2 directly + record re-approval in decision log.** Cleaner if D2 doesn't currently carry a version number.
   - **Path C — Defer.** D2 retains v1.0.0; amendments wait for a focused session.
   - Recommendation: Path A or Path B per founder discretion (functionally equivalent if D2 currently has no version number).
4. **Pre-edit backup.** Copy D2 to `/archive/2026-05-03_canonical-framework_pre-d24-amendment.md` before any edit.
5. **Apply each amendment as a localised text change.** Per D6-A archive protocol — backup first, edit, reference in decision log.
6. **Founder approval per amendment** via a single AskUserQuestion if the amendments are presented as a batch, or per-amendment if granularity is needed.
7. **Update D2's Status line** to capture the amendment (e.g., "Adopted with v1.1.0 amendment — D-D2-AMENDMENT-2026-05-03 — incorporating five D24 coverage-gap additions").
8. **Append decision-log entry** `D-D2-AMENDMENT-2026-05-03` (or session-open date) capturing all five amendments with the D24 source citations.

### What this amendment does NOT do

- Does NOT redesign the 9+1 mechanism set.
- Does NOT change D8 (the rule book) — D8 remains v1.0.0 with its own Validation Addendum (whose promotion is Stream D).
- Does NOT change D11 (Layer 3 translation) — D11 already incorporates D24 Refinements 1–5 per the Phase-1 session 2 deliverables.
- Does NOT change the 8 perimeter routes' R20a behaviour — perimeter discipline preserved.

### Verification step (founder-performable)

```
ls adopted/rag-mentor-alt3/canonical-framework.md
head -10 adopted/rag-mentor-alt3/canonical-framework.md
```

Expected: Status line reflects v1.1.0 amendment.

```
grep -c "Coverage gaps" adopted/rag-mentor-alt3/canonical-framework.md
```

Expected: at least 1 match (the amendment may add a "Coverage gaps incorporated" section or inline notes).

```
diff archive/2026-05-03_canonical-framework_pre-d24-amendment.md adopted/rag-mentor-alt3/canonical-framework.md | head -80
```

Expected: shows the five amendment localised text changes; no other content changed.

### Decision-log entry

`D-D2-AMENDMENT-2026-05-03` (or session-open date). Cross-references: D-RAG-MENTOR-ALT3-CRITICAL-PATH-APPROVED-2026-05-02 (the original D2 Path A approval); D-RAG-MENTOR-ALT3-CRITICAL-PATH-MOVED-TO-ADOPTED-2026-05-02 (the move into `/adopted/`); D-RAG-MENTOR-ALT3-PHASE1-AUDIT-2026-05-01 (D24 source); D-RAG-MENTOR-ALT3-PHASE1-SESSION3-DRAFTS-2026-05-02 (D23 §O5.2 — the deferral); D-REGISTRY-UPDATE-v1.4.0-2026-05-02 (the new D2 blocker text naming the five amendments).

### Component registry impact

The D2 entry's `blocker` field — currently naming the five D24 coverage-gap amendments as the next work — should be cleared (or rewritten if there's still a remaining-work item) post-amendment. **Do NOT update the registry in this session.** Log this as a follow-up registry-update item; bundle with Stream D's new architectural-conventions entry for a future v1.4.1 (or v1.5.0) registry update.

### No clean pause point during Stream B

Stream B should land in one bounded execution (read → propose → apply → verify → close). If the founder needs to pause mid-stream, restore from the pre-edit backup and close cleanly. Do not leave D2 in a half-amended state.

---

## Part E — Session close + next-session preparation

After all engaged streams land (whichever subset of {C, D, B} the founder chose), produce a session close at `/operations/handoffs/founder/[YYYY-MM-DD]-streams-bcd-close.md` (or per-stream filenames if the founder prefers granular closes) per protocol Part C. Include the standard 0b minimum (Decisions Made / Status Changes / Next Session Should / Blocked On / Open Questions) plus the extensions (Verification Method Used / Risk Classification Record / PR5 / Founder Verification).

The "Next Session Should" section recommends one of the remaining candidates from the predecessor session close §"Next Session Should":

- **Candidate E** — P2 task 2c encryption wiring session (Critical-risk; Phase-2 pass-1 precondition). ADR-style preparation.
- **Candidate F** — Phase-2 pass 1 commencement (Critical-risk; pending Candidate E).
- **Registry update v1.4.1** — bundle new entries from Streams D (architectural-conventions) and Stream B's D2 blocker change.

Founder calls the next session's scope based on observed time budget and priority.

---

## Important context

- **Founder is a non-coder.** Plain-language explanations of every decision. Define every technical term the first time it appears.
- **Founder decides direction.** Where any stream surfaces ambiguity, the agent surfaces options with reasoning; the founder calls.
- **Streams are bounded.** Pause cleanly between streams. Respect "done for now" immediately.
- **Risk classifications:** Stream C — Standard. Stream D — Standard. Stream B — Elevated.
- **No Critical surface engaged.** No code touched on engine, database, auth/encryption/session/redirect surfaces. AC7 not engaged. PR6 not engaged. Critical Change Protocol not engaged.
- **The registry is NOT updated this session.** New entries for Stream D (architectural-conventions catalogue) and any Stream B blocker-text changes are logged for a future v1.4.1 registry update per the `sage-registry-update` skill discipline.
- **No founder concept re-explanation expected.** If a concept does need re-explanation, flag it for PR5.

---

## Standing reminders

- Single source of truth for governance metadata: `/website/public/component-registry.json`. The registry was updated in v1.4.0 to reflect the alt-3 deliverables; this session does not touch it.
- Decision-log entry per stream per PR7 — including for explicitly deferred decisions.
- Provide the founder with verification methods (URLs, expected results, copy-paste commands) for any work that touches a live surface. None of the three streams touches live surfaces.
- Do not propose changes to any /adopted/ governance document beyond what each stream specifies. Substantive edits to other documents are separate decisions.
- Do not commence Phase-2 build during this session. Phase-2 commences as its own Critical-risk session per D21's migration plan after Candidate E (encryption wiring) lands.
- If any stream's work surfaces a need that exceeds the stream's scope, surface it as a scope question for the founder before proceeding.

---

## Forecast

After all three streams land:

- **`/archive/2026-05-03_api-reason_pre-alt-3-snapshot.md`** — new (Stream C). The Phase-2 pass-3 verification reference; same shape as the existing `/api/mentor/private/reflect` snapshot.
- **`/adopted/rag-mentor-alt3/architectural-conventions.md`** — new (Stream D). The Validation Addendum content promoted to a permanent alt-3 architectural-conventions catalogue per PR8. Three D-A16 stems' `validation_addendum_aware: true` flags now reference this catalogue's prose patterns.
- **`/adopted/rag-mentor-alt3/canonical-framework.md`** — amended (Stream B). Five D24 coverage-gap additions incorporated; D2 v1.1.0 status; the registry's D2 blocker text is now satisfied.
- **3 new decision-log entries** appended.
- **3 verification steps** specified for the founder to perform between sessions.
- **Pre-edit backups** for any Adopted document touched (D2 only — Streams C and D add new files; no existing-document overwrites).

Phase-2 pass-1 readiness inventory after this session:

| Precondition | Status |
|---|---|
| All Phase-1 deliverables Adopted | ✅ Complete |
| D-A16 catalogue minimum | ✅ Complete |
| `/api/mentor/private/reflect` snapshot | ✅ Complete |
| Component registry up-to-date | ✅ Complete (v1.4.0; new entries for Stream D + Stream B logged for v1.4.1) |
| **`/api/reason` snapshot** | ✅ **Complete (Stream C)** |
| D2 internally consistent with D24 | ✅ **Complete (Stream B)** |
| Validation Addendum promoted | ✅ **Complete (Stream D)** |
| P2 task 2c encryption wiring | ⚠️ Pending — Candidate E (Critical-risk) |
| Founder approval of pass-1 Critical Change Protocol responses | ⚠️ Pending — happens at pass-1 commencement |

After Candidate E (encryption wiring) lands, Phase-2 pass 1 is unblocked subject only to founder approval at the commencement session.

---

End of prompt. Confirm receipt and full Part A read before proceeding to Part B.
