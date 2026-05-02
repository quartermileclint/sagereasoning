# Next-Session Prompt — Phase-1 Completion Review (review the 13 session-3 deliverables; call founder direction questions per D14a / D14b; approve the Phase-1 design batch; move-to-/adopted/ housekeeping; D-A16 catalogue planning; pre-Phase-2 housekeeping)

**Stream:** founder. **Tier:** founder/governance scope.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-02-rag-phase1-alt3-session3-close.md`.
**Architecture brief:** `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (Adopted — alt-3 architecture; Validation Addendum on it).
**Phase-1 design status at session open:** 23 of 23 deliverables drafted/adopted (D2/D3/D8 already in `/adopted/rag-mentor-alt3/`; the remaining 20 are drafts awaiting approval).

This session is the **Phase-1 completion review**. No code. No live-system effect. The deliverable is the founder's review of the 13 session-3 design documents, calls on the three founder direction questions deferred to D14a / D14b, and approval of the Phase-1 design batch — with subsequent housekeeping (move-to-/adopted/; D2 amendment for D24 coverage gaps; component registry update; D-A16 catalogue planning; /api/reason snapshot scheduling; Validation Addendum third-recurrence promotion per PR8).

After this session lands, **Phase 2 commences** per D21's migration plan. Phase-2 pass 1 is D14b (deferral-resolution surface) per AC-19.

---

## Pre-conditions for this session opening

This session does not begin until the following are settled:

1. **Founder push of 2026-05-02 session-3 commits via GitHub Desktop per D-PR8-PUSH-2026-04-26.** The 13 session-3 deliverables, the decision-log entry, this next-session prompt, and the session-3 close must be committed and pushed before the next session begins.

2. **Founder review of the 13 session-3 deliverables** — at least the plain-language summaries; the full bodies are recommended for D21 (migration plan, load-bearing for Phase-2) and D1 (ADR, foundational architectural commitment documentation). The 13 deliverables:
   - D1 ADR (`/drafts/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md`)
   - D5 index schema (`/drafts/rag-mentor-alt3/index-schema.md`)
   - D6 retrieval interface (`/drafts/rag-mentor-alt3/retrieval-interface.md`)
   - D7 re-rank design (`/drafts/rag-mentor-alt3/re-rank-design.md`)
   - D12 strict prompting (`/drafts/rag-mentor-alt3/strict-prompting.md`)
   - D16 score-in-reply (`/drafts/rag-mentor-alt3/score-in-reply.md`)
   - D17 progression delta (`/drafts/rag-mentor-alt3/progression-delta.md`)
   - D18 verification (`/drafts/rag-mentor-alt3/verification.md`)
   - D19 residual seams (`/drafts/rag-mentor-alt3/residual-seams.md`)
   - D20 cost model (`/drafts/rag-mentor-alt3/cost-model.md`)
   - D21 migration plan (`/drafts/rag-mentor-alt3/migration-plan.md`)
   - D22 test plan (`/drafts/rag-mentor-alt3/test-plan.md`)
   - D23 open-questions register (`/drafts/rag-mentor-alt3/open-questions.md`)

The founder review can be batched (one approval covering all 13) or per-deliverable (more granular).

If pre-conditions are not met at session open, the agent's first action is to confirm with the founder which path applies. Do not proceed to housekeeping or move-to-/adopted/ on top of unresolved approvals.

---

## Part A — Open the session under the protocol

Per `/adopted/session-opening-protocol.md` Part A elements 1–8, do the full read sequence. Tier: founder/governance scope. Read:

1. `/manifest.md`
2. (Project instructions — already in system prompt)
3. **`/operations/handoffs/founder/2026-05-02-rag-phase1-alt3-session3-close.md`** — the session-3 close. Required context.
4. **`/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md`** — the alt-3 architecture brief with Validation Addendum. Required context.
5. **`/operations/decision-log.md`** — at minimum the last 8 entries (D-RAG-MENTOR-ALT3-VALIDATED, D-REGISTRY-UPDATE-v1.3.0, D-RAG-MENTOR-ALT3-CRITICAL-PATH-APPROVED, D-RAG-MENTOR-ALT3-PHASE1-SESSION2-DRAFTS, D-MENTOR-PRIVATE-REFLECT-PRE-ALT3-SNAPSHOT, D-RAG-MENTOR-ALT3-CRITICAL-PATH-MOVED-TO-ADOPTED, D-RAG-MENTOR-ALT3-PHASE1-SESSION3-DRAFTS).
6. **The 13 session-3 deliverables** (per the list in the pre-conditions section above) — at minimum the plain-language summaries. Read D21 (migration plan) and D1 (ADR) in full because their content informs the Phase-2 build sequencing decisions in this session's housekeeping.
7. **The eight session-2 deliverables** (`/drafts/rag-mentor-alt3/corpus-inventory.md` D4, `rule-dependency-map.md` D9, `layer-1-translation.md` D10, `layer-3-translation.md` D11, `three-tier-intake.md` D13, `reflect-endpoint-14a-daily-ritual.md` D14a, `reflect-endpoint-14b-deferral-resolution.md` D14b, `long-deferred-questions.md` D15). At minimum the headers and approval-gate footers; D14a / D14b in full because their founder direction questions are called in this session.
8. **D2 / D3 / D8 from `/adopted/rag-mentor-alt3/`** (canonical-framework.md, passion-taxonomy.md, operationalised-rules.md). At minimum the headers; D8's Validation Addendum in full because the third-recurrence promotion candidate is called in this session per PR8.
9. **`/drafts/rag-mentor-alt3/consumer-workflow-audit.md`** (D24) — at minimum §"Findings" and §"Recommendations". Confirms the D2 amendment scope decision.
10. **`/operations/knowledge-gaps.md`** — KG1–KG7 scan; particularly KG2 (model selection — relevant if the founder revisits embedding model choice in D5).
11. **`/operations/handoffs/founder/2026-05-02-rag-phase1-alt3-session3-NEXT-SESSION-PROMPT.md`** — the predecessor next-session prompt (this session's input was its session-3 prompt; the session-3 close summarises what was produced).

Confirm: tier, hold-point status (still active per P0 0h), model selection (no code expected; flag if changes), status-vocabulary readiness, signals/risk-classification readiness.

---

## Part B — Verify state

Quick check with the founder:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git status -s
```

Expected: empty (no modifications) — the session-3 commits are pushed; the working tree is clean.

If the working tree is not clean, surface the modifications to the founder before proceeding.

---

## Part C — Run the Phase-1 completion review

The session has multiple work streams. Founder calls the order. Recommended sequencing:

### Stream 1 — Founder direction questions (call before approval)

Three founder direction questions are deferred to D14a / D14b approval review per D23 §O2.1, O2.2, O2.3. Surface as multiple-choice via AskUserQuestion at session open (or per founder preference, in conversation):

**Question 1 — D14a daily-reflection ritual surface:**
- Recommendation: **own page** (e.g., `/private-mentor/ritual` or `/daily-reflection`).
- Alternative: embedded view preserved on `/private-mentor`.
- Other (founder names a third option).

**Question 2 — D14a `mentor_observation` visibility:**
- Recommendation: **visible** (the practitioner sees the developmental observation alongside the ritual response).
- Alternative: hidden (logged to backend pipeline only).
- Alternative: opt-in (practitioner setting controls visibility).

**Question 3 — D14b route + page names:**
- Recommendation: **`/api/mentor/private/deferral-resolve` (route) + `/private-mentor/deferred-questions` (page)**.
- Alternative: `/api/mentor/private/sit-with` (route).
- Alternative: `/api/mentor/private/return` (route).
- Other (founder names alternatives).

The founder calls each. The calls update D14a / D14b (header + relevant sections) before the deliverables move to `/adopted/`. Decision-log entry records the calls.

### Stream 2 — Approval of the Phase-1 design batch

Three approval paths the founder may take:

- **(a) Approved as drafted** — all 13 session-3 deliverables (and the eight session-2 deliverables and D24) approved in a single batch. Founder direction calls per Stream 1 fold into D14a / D14b before the move. **Recommended path.**
- **(b) Approved with revision** — specific deliverables need amendments before move-to-/adopted/. Founder names which. The amendments land in this session or in a focused follow-up session.
- **(c) Send back for redesign** — specific deliverables need redrafting. Founder names which. The redrafting is a focused follow-up session.
- **(d) Defer** — no approval this session. The deliverables remain drafts.

If path (a): proceed to Stream 3 (move-to-/adopted/).
If path (b): execute amendments in this session if scope allows; otherwise schedule follow-up.
If path (c): the deliverables stay in `/drafts/`; redrafting is its own session.
If path (d): no further action.

### Stream 3 — Move-to-/adopted/ housekeeping (Elevated risk)

If path (a) was taken in Stream 2, execute the move per the deliverables' own approval-gate footers. The move is **Elevated risk** under 0d-ii (each deliverable's footer specifies this).

Two sub-options for the move:

- **(i) Single batched move** of all 21 remaining deliverables (the 13 session-3 plus the eight session-2 plus D24 plus the ADR D1) at once, with a single decision-log entry. **Recommended.** Cleaner audit trail; fewer move-related risks compounded across multiple sessions.
- **(ii) Per-deliverable moves** with per-deliverable decision-log entries. More granular audit; more sessions required.

If (i):

1. **Move the 13 session-3 deliverables** from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` via `git mv`. Update each file's status header (Status line + cross-reference paths from `/drafts/` to `/adopted/`).
2. **Move the 8 session-2 deliverables** similarly. Update cross-references in each file (the session-2 deliverables' D2/D3/D8 cross-references currently point to `/drafts/`; post-move they should point to `/adopted/rag-mentor-alt3/`).
3. **Move D24** (consumer-workflow-audit.md) similarly.
4. **Move the ADR (D1)** from `/drafts/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md` to `/adopted/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md` (or to `/adopted/rag-mentor-alt3/` if the founder prefers the alt-3 grouping).
5. **Single decision-log entry** recording the batched move with rollback path (`git mv` reverse), founder approval reference (Stream 2 path (a)), and stale-reference cleanup follow-ups.

The move is reversible via `git mv` reverse. The Critical Change Protocol is **not** engaged because no code / auth / encryption / session / redirect surface is touched — the move is governance-document housekeeping.

### Stream 4 — D2 amendment for D24 coverage gaps (Elevated risk)

Per D24 §"Coverage gaps in D2 mapping tables" + D23 §O5.2, five small additions to D2 are deferred:

1. `prior_feedback` projection note for Route 1.
2. Aggregate-across-options note for Route 2.
3. Policy-mode-specific Table 6 for Route 3.
4. quick-depth Table 0 / 1a for Route 6.
5. Table 4a dual applicability for Routes 7 + 8 ritual flow.

D2 is now in `/adopted/rag-mentor-alt3/`. Amending it is **Elevated risk** per D2's approval-gate footer.

Three sub-options:

- **(a) Amend D2 in this session** — add the 5 small additions; update D2's version (v1.0.1 or v1.1.0); separate decision-log entry. Risk-classify as Elevated.
- **(b) Schedule a focused D2 amendment session** — separate session post-this-session; the founder reviews the amendments before they land.
- **(c) Defer further** — log in D23 (as it already is) and revisit when downstream consumers actually need the Table 6 / Table 0 / dual-applicability content.

**Recommendation: (b)** — focused amendment session. Keeps this session's Elevated-risk surface bounded to the move-to-/adopted/ work (Stream 3); the D2 amendment lands as its own session with its own founder review.

### Stream 5 — D-A16 catalogue planning

Per D4 Coverage Gap 1 + D5 §"Migration shape" + D14b §"Pre-build prerequisites" + D23 §O4.1, the focus-question-stem catalogue must be promoted before Phase-2 pass 1 reaches operational completeness.

The catalogue assembly process per D5 §"Step 2 — D-A16 catalogue promotion":

1. Extract current `mentor-knowledge-base.ts` question patterns and `REFLECTION_PROMPT` evening-prompt patterns.
2. Decompose each into stem with `[VARIABLE]` placeholders + `slot_fields[]` JSONB structure per D13.
3. Tag with `passage_type: focus_question_stem`, `trigger_condition`, `intake_tier`, `slot_fields`.
4. Insert into `corpus_passages` (or a transitional file pre-Phase-2 schema) with `source_file: 'focus-questions'` (or `source_file: 'scoring'` per founder direction).
5. Founder review of the catalogue's stems before insertion.
6. Phase-2 pass 1 minimum: EUPATHEIA_BOUNDARY and PRAXIS_MOTIVATION_AMBIGUITY trigger code stems.

Surface as scope question to founder:

- **(a) Catalogue assembly happens this session** — labour-intensive (extracting from `mentor-knowledge-base.ts` and `REFLECTION_PROMPT`; per-pattern decomposition).
- **(b) Schedule a focused D-A16 catalogue assembly session** — separate session before Phase-2 pass 1 commences.
- **(c) Phase-2 build incorporates the catalogue assembly** — folds into Phase-2 pass 1's build scope.

**Recommendation: (b)** — focused session. The catalogue's quality affects Phase-2 pass 1's outputs; founder review of the stems before insertion is appropriate.

### Stream 6 — `/api/reason` snapshot scheduling (Standard risk)

Per D24 §"Snapshots needed" + D23 §O4.2, the `/api/reason` snapshot is the second of the two "snapshots before Phase-2 begins" — needed before Phase-2 pass 3 (conversation surface migration) commences.

Surface as scope question to founder:

- **(a) Snapshot this session** — produce a documentary snapshot of `/api/reason` at git ref. Standard risk (new `/archive/` document).
- **(b) Schedule for later session** — lands before Phase-2 pass 3 commences (i.e., during or after Phase-2 pass 2 verification).
- **(c) Defer until Phase-2 pass-3 planning explicitly schedules it.**

**Recommendation: (a) or (b)** — depending on session-time budget. The snapshot itself is small (similar shape to the `/api/mentor/private/reflect` snapshot already produced); option (a) is feasible if session time allows.

### Stream 7 — Component registry update (Standard risk)

Per `D-RAG-MENTOR-ALT3-CRITICAL-PATH-MOVED-TO-ADOPTED-2026-05-02` + D23 §O6.6, the component registry's `path` fields for D2/D3/D8/D24 are stale after the 2026-05-02 move. With this session's move-to-/adopted/ for the remaining deliverables (Stream 3), additional path fields become stale.

Phase-2 work item: a registry update (v1.3.1 or v1.4.0) updates the path fields. The update follows the standard registry-update skill (`/.claude/skills/sage-registry-update/SKILL.md`).

Surface as scope question to founder:

- **(a) Registry update this session** — invoke the registry-update skill against the current state.
- **(b) Schedule a focused registry-update session** — separate session post-batched move; the registry-update skill's four-pass discipline runs.

**Recommendation: (b)** — focused session. The registry-update skill is itself elaborate (Pass 1 source scan; Pass 2 code-grep verification; Pass 3 transitive impact; Pass 4 internal consistency); running it in this session compounds with the move-to-/adopted/ work.

### Stream 8 — Validation Addendum third-recurrence promotion per PR8

Per the session-3 close §"PR5 — Knowledge-Gap Carry-Forward", the Validation Addendum content (Rule 9 unstable vs false phronesis; Rule 8 compound severity; Rule 7 operative-circle dependency; description correction) reached the 3-recurrence promotion threshold per PR8 (first observation: 2026-05-02 morning when the addendum was added; second: session 2; third: session 3 cross-references in D17 / D19 / D1 ADR).

Surface as scope question to founder:

- **(a) Promote to KG candidate** — add an entry to `/operations/knowledge-gaps.md`. The entry would describe the architectural pattern of "the rule book has named adjustments that propagate to multiple downstream deliverables; promotion candidate at third recurrence" or similar.
- **(b) Promote to a separate alt-3 architectural-conventions catalogue** — under `/adopted/rag-mentor-alt3/` (e.g., `architectural-conventions.md`). The catalogue would document the Validation Addendum content as the canonical reference for future rule book revisions.
- **(c) Defer further** — Validation Addendum remains in D8 v1.0.0 + decision log only; promotion lands at next-recurrence opportunity.

**Recommendation: (b)** — separate alt-3 architectural-conventions catalogue. The Validation Addendum's role across multiple deliverables (D8 / D9 / D11 / D17 / D19 / D1) suggests it's a load-bearing architectural pattern that benefits from a dedicated home.

### Stream 9 — Plan Phase-2 pass 1 commencement

Once Streams 1–4 are settled (founder direction; approval; move-to-/adopted/; D2 amendment plan), Phase 2 commences per D21's migration plan. This session does NOT execute Phase-2 build; it confirms Phase-2 pass 1 is unblocked.

Phase-2 pass 1 preconditions per D21 §"Phase-2 preconditions":

1. ✅ All 23 Phase-1 deliverables approved and moved (after Stream 3).
2. ⚠️ D-A16 catalogue minimum population (EUPATHEIA_BOUNDARY + PRAXIS_MOTIVATION_AMBIGUITY stems) — pending Stream 5.
3. ✅ `/api/mentor/private/reflect` snapshot (already produced); ⚠️ `/api/reason` snapshot — pending Stream 6 (not pass 1 blocking).
4. ⚠️ Encryption wiring (P2 task 2c) coordination — separate Critical task per project instructions Priority 2.
5. ⚠️ Founder approval of Phase-2 commencement (the Critical Change Protocol's explicit approval) — separate decision when pass 1 commences.

Surface as scope question to founder:

- **(a) Phase-2 pass 1 commencement scheduling** — when does the founder want to begin pass 1's build sequence? After D-A16 catalogue assembly + P2 task 2c encryption wiring + founder review of D14b's full Critical Change Protocol responses.
- **(b) Defer the scheduling discussion** — set aside until D-A16 / P2 task 2c land.

**Recommendation: (b)** — the scheduling discussion is appropriate after the immediate Phase-2 preconditions land (D-A16; P2 task 2c). The session that commences Phase-2 pass 1 will be a Critical-risk session in its own right.

---

## Part D — Decision-log entry

Append per the session's actual work. Likely entries (depending on which streams executed):

- `D-RAG-MENTOR-ALT3-PHASE1-APPROVED-YYYY-MM-DD` — founder approval of the Phase-1 design batch (Stream 2 path).
- `D-RAG-MENTOR-ALT3-PHASE1-MOVED-TO-ADOPTED-YYYY-MM-DD` — batched move-to-/adopted/ (Stream 3, Elevated risk).
- `D-RAG-MENTOR-ALT3-D14A-DIRECTION-CALLED-YYYY-MM-DD` and/or `D-RAG-MENTOR-ALT3-D14B-DIRECTION-CALLED-YYYY-MM-DD` — Stream 1 founder direction calls (may be folded into the approval entry).

If Streams 4–8 land, additional entries per stream.

Each entry follows the standard 0f format (Decision / Reasoning / Files touched / Risk classification / Rules served / Status / Cross-references).

---

## Part E — Session close + Phase-2 commencement preparation

Produce a session close at `/operations/handoffs/founder/YYYY-MM-DD-rag-phase1-completion-review-close.md` per protocol Part C. Include the standard 0b minimum (Decisions Made / Status Changes / Next Session Should / Blocked On / Open Questions) plus the extensions (Verification Method Used / Risk Classification Record / PR5 / Founder Verification).

The "Next Session Should" section recommends one of:

- **D-A16 catalogue assembly session** (per Stream 5 path (b)) — produces the focus-question-stem corpus content for Phase-2 pass 1.
- **D2 amendment session** (per Stream 4 path (b)) — adds the 5 D24 coverage gap additions to D2.
- **Component registry update session** (per Stream 7 path (b)) — runs the registry-update skill against the post-move state.
- **`/api/reason` snapshot session** (per Stream 6 path (b)) — produces the documentary snapshot before Phase-2 pass 3.
- **P2 task 2c encryption wiring session** (per Stream 9) — separate Critical-risk task per project instructions Priority 2.
- **Phase-2 pass 1 build session** — once Streams 5, P2 task 2c, and founder approval of pass 1's Critical Change Protocol all land.

Founder calls the next session's scope based on observed time budget and priority.

---

## Important context

- **Founder is a non-coder.** Plain-language explanations of every decision. Define every technical term the first time it appears.
- **Founder decides direction.** AI surfaces options with reasoning. Recommendations preserved per Stream — the recommendations are the AI's read of "best path"; the founder may take other paths.
- **This session is governance-only — no code, no live-system effect.** All work is in `/drafts/`, `/adopted/`, `/operations/`. Phase-2 build (when it commences) is a separate session under the Critical Change Protocol.
- **Honest disclosure throughout.** The Phase-1 design's open questions (D23) are the architectural acknowledgement of what is not yet decided. The session's housekeeping does not pretend to close questions that are explicitly deferred.
- **Risk classification:**
  - Stream 1 (founder direction calls): N/A — discovery only.
  - Stream 2 (approval): Standard — the approval itself is governance-document update (status-line edits).
  - Stream 3 (move-to-/adopted/): Elevated — governance-document location change. Per the deliverables' approval-gate footers.
  - Stream 4 (D2 amendment): Elevated — D2 is in `/adopted/`; amending requires re-approval per D2's approval-gate footer.
  - Streams 5, 6, 7, 8: Standard — documentation / catalogue / registry / archive work.
  - Stream 9 (Phase-2 pass 1 commencement scheduling): N/A — planning only.

---

## Standing reminders

- Single source of truth for the alt-3 design: `/drafts/rag-mentor-alt3/` (transitioning to `/adopted/rag-mentor-alt3/` with this session's move). Cross-reference, don't duplicate.
- Decision-log entry per session per PR7 — including for explicitly deferred decisions.
- Provide the founder with verification methods (URLs, expected results, copy-paste commands) for any work that touches a live surface. This session should not touch live surfaces; if any work would, surface it as a scope question and pause.
- Do not propose changes to the founder-hub flow during this session. Founder-hub is parked and out of scope.
- Do not migrate score-family endpoints during this session. Phase 3+ is the migration scope.
- Do not propose corpus expansion (D-A10) during this session. D-A10 is logged as open question per D23 §O1.3.
- Do not propose features that produce shareable artefacts at the deferral-resolution surface. AC-18 is binding.
- Do not commence Phase-2 build during this session. Phase-2 commences as its own Critical-risk session per D21's migration plan.

---

## Phase-1 completion forecast (post-this-session)

If Streams 1–3 land per the recommended paths:

- 23 of 23 deliverables Adopted (status: Adopted in `/adopted/rag-mentor-alt3/` and `/adopted/`).
- D14a / D14b reflect the founder direction calls.
- The Phase-1 design batch is complete.
- Phase-2 is unblocked subject to:
  - D-A16 catalogue assembly (next session candidate).
  - P2 task 2c encryption wiring (separate Critical-risk task).
  - `/api/reason` snapshot (before Phase-2 pass 3).
  - Component registry update (recommended Phase-2 housekeeping).

The architecture is ready to build.

---

End of prompt. Confirm receipt and full Part A read before proceeding to Part B.
