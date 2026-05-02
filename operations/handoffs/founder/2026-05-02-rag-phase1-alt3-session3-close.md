# Session Close — 2 May 2026 — Phase 1 Alt-3 Session 3 Deliverables (D1, D5, D6, D7, D12, D16, D17, D18, D19, D20, D21, D22, D23)

**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Tier:** founder/governance scope.
**Date:** 2026-05-02.
**Session scope:** Phase 1 of the alt-3 retrieval-augmented mentor design — session 3 deliverables (13 design documents, including the ADR). Design only; no code; no live-system effect.

---

## Decisions Made

- **D-RAG-MENTOR-ALT3-PHASE1-SESSION3-DRAFTS-2026-05-02** appended. Thirteen Phase-1 session 3 deliverables produced as drafts under `/drafts/rag-mentor-alt3/` (12 files) plus the ADR under `/drafts/` (1 file):
  - D5 (index schema)
  - D6 (retrieval interface)
  - D7 (re-rank design)
  - D12 (strict inclusion + exclusion design)
  - D16 (score-in-reply design)
  - D17 (progression delta design)
  - D18 (verification design)
  - D19 (residual seams handling)
  - D20 (cost model)
  - D21 (migration plan — load-bearing)
  - D22 (test plan)
  - D23 (open-questions register)
  - D1 (ADR-RAG-MENTOR-ALT3-01)

- **D2 amendment scope decision:** the five D24 coverage gaps to D2's mapping tables (per session-2 close §"Open Questions" item from the recommendation set) are deferred and logged in D23 §O5.2 as a follow-up housekeeping action. The amendments don't block any session-3 deliverable. Elevated risk amendment to D2 happens at its own time post-session-3 approval batch.

- **Founder direction questions deferred to D14a / D14b approval review** (per D23 §O2.1, O2.2, O2.3): D14a own-page vs embedded; D14a `mentor_observation` visibility; D14b route + page names. Recommendations preserved in D14a / D14b deliverables themselves; founder calls at deliverable approval review.

---

## Status Changes

| Item | Old status | New status |
|---|---|---|
| D1 (ADR — translation-sandwich + deterministic engine) | Scoped | Designed (drafted under `/drafts/`) |
| D5 (index schema) | Scoped | Designed (drafted under `/drafts/`) |
| D6 (retrieval interface) | Scoped | Designed (drafted under `/drafts/`) |
| D7 (re-rank design) | Scoped | Designed (drafted under `/drafts/`) |
| D12 (strict prompting) | Scoped | Designed (drafted under `/drafts/`) |
| D16 (score-in-reply) | Scoped | Designed (drafted under `/drafts/`) |
| D17 (progression delta) | Scoped | Designed (drafted under `/drafts/`) |
| D18 (verification) | Scoped | Designed (drafted under `/drafts/`) |
| D19 (residual seams) | Scoped | Designed (drafted under `/drafts/`) |
| D20 (cost model) | Scoped | Designed (drafted under `/drafts/`) |
| D21 (migration plan) | Scoped | Designed (drafted under `/drafts/`); load-bearing for Phase-2 build sequencing |
| D22 (test plan) | Scoped | Designed (drafted under `/drafts/`) |
| D23 (open-questions register) | Scoped | Designed (drafted under `/drafts/`); 28 deferred decisions catalogued |
| Decision-log entries | — | One new entry appended (D-RAG-MENTOR-ALT3-PHASE1-SESSION3-DRAFTS-2026-05-02) |
| Phase-1 deliverables completion | 11 drafted/adopted (out of 23) | **23 of 23 drafted/adopted** — Phase-1 design complete |

No code, no schema migrations, no live-system effect, no auth/encryption/session/redirect surface touched.

---

## Phase-1 design completion

After this session, the full Phase-1 design batch is complete. The 23 deliverables exist as drafts (or adopted for the critical path):

| # | Deliverable | Status | Source session |
|---|---|---|---|
| 1 | ADR (translation-sandwich + deterministic engine) | Drafted | Session 3 |
| 2 | Canonical mechanism framework | Adopted | Session 1 (approved Path A 2026-05-02; moved 2026-05-02) |
| 3 | Passion taxonomy | Adopted | Session 1 |
| 4 | Corpus inventory | Drafted | Session 2 |
| 5 | Index schema | Drafted | Session 3 |
| 6 | Retrieval interface | Drafted | Session 3 |
| 7 | Re-rank design | Drafted | Session 3 |
| 8 | Operationalised scoring rules (with Validation Addendum, v1.0.0) | Adopted | Session 1 |
| 9 | Rule dependency map and engine sequencing | Drafted | Session 2 |
| 10 | Layer 1 translation specification | Drafted | Session 2 |
| 11 | Layer 3 translation specification | Drafted | Session 2 |
| 12 | Strict inclusion + exclusion design | Drafted | Session 3 |
| 13 | Three-tier intake clarification specification | Drafted | Session 2 |
| 14a | Daily-reflection ritual endpoint | Drafted | Session 2 |
| 14b | Deferral-resolution surface (Phase-2 pass 1 load-bearing) | Drafted | Session 2 |
| 15 | Long-deferred questions handling | Drafted | Session 2 |
| 16 | Score-in-reply design | Drafted | Session 3 |
| 17 | Progression delta design | Drafted | Session 3 |
| 18 | Verification design | Drafted | Session 3 |
| 19 | Residual seams handling | Drafted | Session 3 |
| 20 | Cost model | Drafted | Session 3 |
| 21 | Migration plan (Phase-2 build-sequencing load-bearing) | Drafted | Session 3 |
| 22 | Test plan | Drafted | Session 3 |
| 23 | Open-questions register | Drafted | Session 3 |
| 24 | Consumer workflow audit | Reviewed | Audit session 2026-05-01 |

The next milestone is the **Phase-1 completion review**: founder reviews the 13 session-3 deliverables, calls the founder direction questions per D14a / D14b, and approves the Phase-1 design batch. After approval, the batch moves to `/adopted/rag-mentor-alt3/` (Elevated risk per the deliverables' approval-gate footers); the move is per deliverable or batched.

After Phase-1 design is fully approved and moved, **Phase 2 build commences** per D21's migration plan. Phase-2 pass 1 is the deferral-resolution surface (D14b) per AC-19.

---

## Completed Work

1. **Read all canonical sources per session-opening protocol Part A.** Predecessor close (`2026-05-02-rag-phase1-alt3-session2-close.md`); alt-3 architecture handoff with Validation Addendum (`2026-04-29e-private-mentor-rag-phase1-ALT3-close.md`); decision-log tail (last 6+ entries surfaced); the eight session-2 deliverables in full (D4, D9, D10, D11, D13, D14a, D14b, D15); D2 / D3 / D8 from `/adopted/rag-mentor-alt3/`; D24 audit (Findings + Recommendations sections in full); knowledge-gaps register (KG1–KG7); manifest (architectural constraints AC1–AC7; rules R0, R5, R7, R8a–R8d, R17, R18d, R19, R20a/b/c/d; eval suite ES1–ES3); code surfaces (sage-reason-engine.ts and stoic-brain-loader.ts headers for D5/D6/D21 reference).

2. **Confirmed pre-conditions for the session via AskUserQuestion at session open:**
   - Path (a) — session-2 deliverables approved as drafted. Proceed to full scope.
   - Push status: working tree clean; main in sync with origin/main (precondition 1 met).
   - D2/D3/D8 already moved to `/adopted/rag-mentor-alt3/` (precondition 3 option (a) executed).
   - Pre-alt-3 reflect snapshot already exists at `/archive/2026-05-02_api-mentor-private-reflect_pre-alt-3-snapshot.md`.

3. **Produced the 13 Phase-1 session 3 deliverables.** Each deliverable follows the format established in session-1 / session-2 deliverables: header (status, date, stream, governing frame, implements, cross-references); plain-language summary; glossary; specification body; worked examples drawn from named anchor patterns where applicable; cleanliness rating; R6/R7/R8/R17/R19/R20 compliance; honest disclosure; open questions; approval gate.

4. **Validation Addendum guidance carried forward.** Adjustment 1 (Rule 9 unstable vs false phronesis) referenced in D17 (composite direction; profile-tension flag disambiguation) and D19 (per-Adjustment confidence interaction; Pattern surfacing). Adjustment 2 (Rule 8 compound severity) referenced in D17 (signal definition table). Adjustment 3 (Rule 7 explicit operative-circle dependency) preserved in D9's dependency map; D17 / D19 honour the dependency.

5. **D24 audit refinements consolidated.**
   - D11 Refinements 1–5 (already incorporated in session 2) cross-referenced in D12 (strict prompting), D16 (score-in-reply for D11 Refinement 1 invitation-language), D19 (residual seams for D11 Refinement 5 Validation Addendum prose).
   - D24 §"Coverage gaps in D2 mapping tables" (5 D2 amendments) deferred to D23 §O5.2 as Elevated-risk follow-up (D2 amendment requires re-approval per the deliverable's approval-gate footer).
   - D24 §"Snapshots needed" — the `/api/mentor/private/reflect` snapshot already produced; the `/api/reason` snapshot deferred to land before Phase-2 pass 3 per D21 / D23 §O4.2.
   - D24 audit current-state findings (KG1 rule 2 violations on `/api/reflect`; user_id discrimination on `/api/reflect`; Ops Hub page-side defects; partial R20a input coverage) remain deferred for separate triage per session-2 decision; D14b's Phase-2 pass 1 build incorporates the await-discipline from day 1.

6. **Decision-log entry appended** (D-RAG-MENTOR-ALT3-PHASE1-SESSION3-DRAFTS-2026-05-02).

7. **Cross-reference integrity verification performed.** All 5 anchor patterns (philodoxia at synkatathesis, orge with children, six consecutive procedural reports, bus story, agonia in catastrophising) referenced across multiple session-3 deliverables. AC-1 through AC-19 propagate to deliverables that depend on them. Strong mutual references between D5↔D6 (7 each), D14b↔D21 (16), D17→D15 (4), D19→D11 Refinement 5 (8). No untraced cross-references identified.

8. **Session close (this document) produced.** Next-session prompt for the Phase-1 completion review session is recommended in the §"Next Session Should" section below.

---

## Where We Are in P0

- **0a (status vocabulary):** Used consistently across all 13 deliverables (`Designed` for drafts; the approval-gate footers anticipate `Adopted` upon move to `/adopted/`). No decision-status words leaked into implementation-status fields.
- **0b (session continuity protocol):** This session followed the established protocol (handoff read at open; session close in required format with extensions; this close is the artefact).
- **0c (verification framework):** Founder-performable verification specifications consolidated in D22 (30+ verifications across deliverables); D18 specifies the verifier algorithms; D5 / D6 / D7 / D14a / D14b carry per-deliverable verifications.
- **0d-ii (change risk classification):** All session work classified Standard. No Critical / Elevated changes executed. The Phase-2 pass-1 build (D14b implementation) is named as Critical at its own time per PR6; Phase-2 pass 2 and pass 3 same. The eventual ADR adoption (D1 move-to-`/adopted/`) is Elevated.
- **0e (file organisation):** All session-3 deliverables landed under `/drafts/rag-mentor-alt3/` per the established Phase-1 design folder. The ADR (D1) landed at `/drafts/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md` per the manifest's ADR location convention.
- **0f (decision log):** One new entry appended.
- **0g (workflow skills earn their place):** No new skill produced this session.
- **0h (hold point):** unchanged. R&D-phase work; design-only.
- **PR1 (single-endpoint proof):** D14b is the Phase-2 pass-1 single-endpoint target per AC-19. Preserved in D21.
- **PR4 (model selection):** D5 specifies OpenAI text-embedding-3-small for embeddings; D6 / D7 default to heuristic re-rank (no LLM); Layer 1 / Layer 3 use Sonnet per D10 / D11 (carried forward from session 2). AC1 / KG2 honoured.
- **PR5 (knowledge-gap carry-forward):** No founder concept re-explanation observed this session. KG1 rule 2 (await-pattern), KG3 (hub-label end-to-end contract), KG6 (composition order — system block vs user message), and KG7 (JSONB array discipline) named in deliverables where relevant (D5 §"`canonical_mechanism` query patterns" + slot_fields[] discipline; D14a Pipeline 2 — KG3; D12 cache discipline — KG6; D14a Verification 2 — KG7).
- **PR6 (safety-critical changes Critical):** D14b's Phase-2 pass-1 build is named as Critical with the Critical Change Protocol applied at its own time per D21.
- **PR7 (decisions not made are documented):** D23 catalogues 28 deferred decisions across 6 categories. Each entry has question text, why deferred, revisit condition, and affected deliverables. The audit trail is reconstructable per PR7's commitment.
- **PR8 (push to deploy via GitHub Desktop):** Founder push closes this session's commits.

---

## Next Session Should

**Phase-1 completion review** — not Phase 2 directly.

Recommended scope:

1. **Founder review of the 13 session-3 deliverables.** Each deliverable has an approval-gate footer; review can be batched (one approval covering all 13) or per-deliverable. The deliverables are:
   - D1 (ADR) — full architectural commitment documentation; reviews AC-1 through AC-19 with cross-references.
   - D5 (index schema) — Supabase pgvector + tsvector single-table; embedding model choice; chunk-size policy.
   - D6 (retrieval interface) — hybrid retrieve function; RRF logic; per-mechanism call patterns.
   - D7 (re-rank design) — heuristic default; cross-encoder upgrade path; LLM-as-reranker fallback.
   - D12 (strict prompting) — Layer 3 paraphrase prompt template; cache discipline per AC-6 / KG6.
   - D16 (score-in-reply) — conversation surface response payload; proximity ring data contract.
   - D17 (progression delta) — prior-state read; signal definition; confidence_weighted thresholds.
   - D18 (verification) — narrative trace + score consistency; pass/fail criteria.
   - D19 (residual seams) — full SELF_REPORT_DEPENDENT and CONFIDENCE_WEIGHTED specs.
   - D20 (cost model) — per-request cost decomposition; R5 free-tier and 2x paid-tier validation.
   - D21 (migration plan) — Phase-2 build sequencing; per-pass build steps + rollback.
   - D22 (test plan) — 5 test categories; eval suite per ES1-3.
   - D23 (open-questions register) — 28 deferred decisions catalogued.

2. **Founder calls on direction questions per D14a / D14b** (per D23 Category 2):
   - O2.1 — D14a own-page or embedded? (Recommendation: own page.)
   - O2.2 — D14a `mentor_observation` visibility? (Recommendation: visible.)
   - O2.3 — D14b route + page names? (Recommendation: `/api/mentor/private/deferral-resolve` + `/private-mentor/deferred-questions`.)

3. **Approval batch — move to `/adopted/rag-mentor-alt3/`** (Elevated risk per the deliverables' approval-gate footers). Either:
   - **(a) Single batched move** of the remaining 20 deliverables (the 13 session-3 plus the eight session-2 plus D24) at once, with a single decision-log entry, OR
   - **(b) Per-deliverable moves** with per-deliverable decision-log entries (more granular audit trail; more sessions).
   
   Recommendation: option (a) — single batched move. Founder calls.

4. **D1 ADR adoption** — the ADR is itself Elevated risk per its approval-gate footer. Founder approval moves it to `/adopted/`. Recommendation: adopt the ADR alongside the rest of the batch (option a above) or in a focused session.

5. **D2 amendment for the 5 D24 coverage gaps** — Elevated risk; lands as a separate decision-log entry after the Phase-1 batch. Recommendation: schedule a focused D2 amendment session post-batch.

6. **Pre-Phase-2 housekeeping** — D-A16 catalogue assembly process planning; component registry update for the moved deliverables (registry update v1.3.1 or v1.4.0).

After all the above, **Phase 2 commences per D21's migration plan**. Phase-2 pass 1 is D14b (deferral-resolution surface) per AC-19. Phase-2 pass 1 is Critical risk per PR6 + AC5 + R17; the Critical Change Protocol applies.

The Phase-1 completion review is the structured moment to align the founder's direction with the architectural commitments. Phase 2 cannot commence until the review completes.

---

## Blocked On

- **Founder push of this session's commits via GitHub Desktop per D-PR8-PUSH-2026-04-26.** Files staged for push:
  - `/drafts/rag-mentor-alt3/index-schema.md` (new)
  - `/drafts/rag-mentor-alt3/retrieval-interface.md` (new)
  - `/drafts/rag-mentor-alt3/re-rank-design.md` (new)
  - `/drafts/rag-mentor-alt3/strict-prompting.md` (new)
  - `/drafts/rag-mentor-alt3/score-in-reply.md` (new)
  - `/drafts/rag-mentor-alt3/progression-delta.md` (new)
  - `/drafts/rag-mentor-alt3/verification.md` (new)
  - `/drafts/rag-mentor-alt3/residual-seams.md` (new)
  - `/drafts/rag-mentor-alt3/cost-model.md` (new)
  - `/drafts/rag-mentor-alt3/migration-plan.md` (new)
  - `/drafts/rag-mentor-alt3/test-plan.md` (new)
  - `/drafts/rag-mentor-alt3/open-questions.md` (new)
  - `/drafts/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md` (new)
  - `/operations/decision-log.md` (modified — one append)
  - `/operations/handoffs/founder/2026-05-02-rag-phase1-alt3-session3-close.md` (new — this file)

The verbatim git commands appear in §"Founder Verification" below.

---

## Open Questions

The 28 open questions identified across the 13 session-3 deliverables are catalogued in D23 (open-questions register). Brief summary by category:

1. **Architectural commitments deferred (4 entries, O1.1–O1.4):** Graph RAG; Phase-3+ score-family migration order; corpus expansion (D-A10) parallel track; D-A16 catalogue promotion.

2. **Founder direction deferred (3 entries, O2.1–O2.3):** D14a own-page vs embedded; D14a `mentor_observation` visibility; D14b route + page names.

3. **Working-value parameters deferred (9 entries, O3.1–O3.9):** D15 long-deferred N=7 days; D9 back-edge loop guard = 1; D17 confidence_weighted thresholds; D7 heuristic multipliers; D7 cross-encoder upgrade trigger; D6 RRF weights; D5 embedding model upgrade trigger; D17 progression window; D14b closed-deferral count.

4. **Phase-2 build preconditions (3 entries, O4.1–O4.3):** D-A16 catalogue promotion; `/api/reason` snapshot; encryption wiring (P2 task 2c) coordination.

5. **Future revision passes (3 entries, O5.1–O5.3):** D8 v1.1.0 transcript-faithful redo; D2 amendments per D24 coverage gaps; D7 LLM-as-reranker fallback.

6. **Cross-cutting limitations (6 entries, O6.1–O6.6):** Validation Addendum scope (philodoxia calibration); adversarial evaluation; practitioner profiles outside ES1; pre-D-A16 transitional behaviour; stale references post-D2/D3/D8 move; component registry path update.

D23 catalogues each with question text, why deferred, revisit condition, and affected deliverables.

---

## Verification Method Used (0c Framework)

| Work item | Verification method |
|---|---|
| Founder approval of session-2 deliverables (Path A) | Surfaced as multiple-choice via AskUserQuestion at session open; founder direction received in one round (Path A). |
| Phase-1 session 3 deliverables (13 new files) | Founder reads each deliverable directly. The cross-references and worked examples are the structural test (each deliverable's worked examples should match the named anchor patterns; each cross-reference should resolve to an existing document). |
| Validation Addendum guidance carry-forward in D17 / D19 | Founder reads the relevant sections directly (D17 §"Profile-tension flag — improvement vs regression"; D19 §"Layer 3 prose patterns" + "Validation Addendum Adjustment 1 prose"). |
| D24 audit refinements in D12 / D16 / D19 | Founder reads the relevant sections directly. |
| Cross-reference integrity verification | Performed during this session — grep checks confirmed AC-12, AC-18, AC-19 propagation; anchor pattern reuse; deliverable-to-deliverable cross-references resolve. |
| Decision-log append | Append-only writes; founder reads directly. |
| Session close + (optional) Phase-1 completion review prompt | Founder reads directly. |
| Founder live-site verification | None this session — design only; no live-system effect. |

---

## Risk Classification Record (0d-ii)

| Change | Classification | Reasoning |
|---|---|---|
| AskUserQuestion pre-condition confirmation | N/A — discovery only | No code/data change. |
| D5 (index schema) draft creation | Standard | New file under `/drafts/`; no live-system effect. |
| D6 (retrieval interface) draft creation | Standard | Same. |
| D7 (re-rank design) draft creation | Standard | Same. |
| D12 (strict prompting) draft creation | Standard | Same. |
| D16 (score-in-reply) draft creation | Standard | Same. |
| D17 (progression delta) draft creation | Standard | Same. |
| D18 (verification) draft creation | Standard | Same. |
| D19 (residual seams) draft creation | Standard | Same. |
| D20 (cost model) draft creation | Standard | Same. |
| D21 (migration plan) draft creation | Standard | Same. Phase-2 pass-1 build (D14b implementation per D21) is named Critical at its own time. |
| D22 (test plan) draft creation | Standard | Same. |
| D23 (open-questions register) draft creation | Standard | Same. |
| D1 (ADR) draft creation | Standard | New file under `/drafts/`; the eventual move to `/adopted/` is Elevated risk per the deliverable's approval-gate footer. |
| D-RAG-MENTOR-ALT3-PHASE1-SESSION3-DRAFTS decision-log append | Standard | Append-only. |
| Session close (this document) | Standard | Documentation. |
| Push to deploy | Standard | Reaches GitHub; no live-system effect (drafts and operations docs only). |

No Critical changes this session. PR6 not engaged. AC7 not engaged.

---

## PR5 — Knowledge-Gap Carry-Forward

Knowledge gaps named explicitly in deliverables this session:

- **KG1 rule 2 (await all database writes on Vercel).** Named in D14b Phase-2 build steps (already in session-2 D14b draft); cross-referenced in D21 §"Phase-2 Pass 1 Build Steps" — the new route awaits all database writes from day 1.
- **KG2 (Sonnet/Haiku boundary).** Named in D5 §"Embedding model selection" rationale; named in D6 §"Per-mechanism call patterns" model rationale (Sonnet via Layer 1/3 from D10/D11); named in D7 §"LLM-as-reranker fallback" model rationale; named in D20 cost model.
- **KG3 (hub-label end-to-end contract).** Carried forward in D14a / D14b via session-2 references; named in D17 §"Cross-route history merging" (the conversation surface delta queries across reflections + score-family histories with consistent hub labelling).
- **KG6 (composition order constraint).** Named in D5 §"R7 / R8a / KG6 compliance"; named in D6 §"R7 / R8a / KG6 compliance" (retrieved content placement decision deferred to consumer); named in D12 §"Cache discipline" (system block for cached prompt template; user message for per-request engine output).
- **KG7 (JSONB storage format).** Named in D5 §"slot_fields" column discipline (pass arrays directly; do not JSON.stringify); cross-referenced in D14a / D14b verification protocols.

No new knowledge-gap candidates surfaced this session that were not already in the existing register.

**Validation Addendum candidates (per D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29) — third observation:**
- The three adjustments (Rule 9 unstable-vs-false phronesis; Rule 8 compound severity; Rule 7 operative-circle dependency) — third observation now (first observation: 2026-05-02 morning when the addendum was added; second observation: session 2 when the addendums were incorporated into D9 / D11 / D13; third observation: this session when D17 / D19 cross-reference and project them per Layer 3 prose). **Per PR8 the third recurrence promotes** — the three Validation Addendum adjustments and the description correction become candidates for promotion to the knowledge-gaps register or to a permanent architectural-pattern catalogue. Recommendation for next session: promote to KG candidate or to a separate "alt-3-architectural-conventions" catalogue under `/adopted/rag-mentor-alt3/`.
- Description correction "deterministic-for-rule-like + soft-gating-for-interpretive-core" — third observation now (cited in D17 / D19 / D1 ADR). Same promotion candidate per PR8.

**Cumulative count:** the Validation Addendum content has reached the 3-recurrence promotion threshold. Promotion is logged for the next session as actionable.

**No founder concept re-explanation observed this session.**

---

## Founder Verification (Between Sessions)

The founder verifies the work by reading the 13 new deliverables and the decision-log append.

### Step 1 — List the 13 new deliverables

From a Terminal at the project folder (`/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/`):

```
ls -la drafts/rag-mentor-alt3/
ls -la drafts/ADR-*.md
```

Expected output:
- `drafts/rag-mentor-alt3/` should now contain 21 files (the 9 from session 1+2 plus the 12 new session 3 files plus consumer-workflow-audit.md).
- `drafts/` should contain the new ADR file (`ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md`).

### Step 2 — Read order recommendation

The deliverables build on each other. Recommended read order for fastest comprehension:

1. **D1 (ADR)** — start here. The ADR carries AC-1 through AC-19 with cross-references to all 23 deliverables; reading D1 first orients the rest.
2. **D5 (index schema)** — the storage layer.
3. **D6 (retrieval interface)** — the retrieval pipeline.
4. **D7 (re-rank design)** — the relevance scoring.
5. **D12 (strict prompting)** — the Layer 3 prompt template.
6. **D16 (score-in-reply)** — the conversation surface response.
7. **D17 (progression delta)** — the longitudinal mechanics.
8. **D18 (verification)** — the verifier.
9. **D19 (residual seams)** — the AC-17 flag specifications.
10. **D20 (cost model)** — the per-call cost analysis.
11. **D21 (migration plan)** — the Phase-2 build sequencing.
12. **D22 (test plan)** — the test coverage.
13. **D23 (open-questions register)** — the deferred decisions.

Each deliverable starts with a "Plain-language summary" section. Read the plain-language summary first; the body fills in detail.

### Step 3 — Check the decision-log append

```
grep -A 2 "D-RAG-MENTOR-ALT3-PHASE1-SESSION3-DRAFTS" operations/decision-log.md | head -10
```

Expected: the entry present at the bottom of the decision log with status `Drafted — under founder review`.

### Step 4 — Verbatim git commands

In a Terminal at the project folder:

```
git add drafts/rag-mentor-alt3/index-schema.md drafts/rag-mentor-alt3/retrieval-interface.md drafts/rag-mentor-alt3/re-rank-design.md drafts/rag-mentor-alt3/strict-prompting.md drafts/rag-mentor-alt3/score-in-reply.md drafts/rag-mentor-alt3/progression-delta.md drafts/rag-mentor-alt3/verification.md drafts/rag-mentor-alt3/residual-seams.md drafts/rag-mentor-alt3/cost-model.md drafts/rag-mentor-alt3/migration-plan.md drafts/rag-mentor-alt3/test-plan.md drafts/rag-mentor-alt3/open-questions.md drafts/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md operations/decision-log.md operations/handoffs/founder/2026-05-02-rag-phase1-alt3-session3-close.md

git commit -m "Phase-1 alt-3 session 3: D1, D5, D6, D7, D12, D16, D17, D18, D19, D20, D21, D22, D23 drafted

- Decision log: D-RAG-MENTOR-ALT3-PHASE1-SESSION3-DRAFTS-2026-05-02
- D5 index schema: Supabase pgvector + tsvector single-table; text-embedding-3-small; chunk-size policy per AC-4
- D6 retrieval interface: hybrid retrieve function; BM25 + vector + RRF; per-mechanism call patterns
- D7 re-rank design: heuristic default; cross-encoder upgrade path; LLM-as-reranker fallback
- D12 strict prompting: Layer 3 paraphrase prompt template; cache discipline per AC-6/KG6
- D16 score-in-reply: conversation surface response; proximity ring data contract
- D17 progression delta: prior-state read; 8 per-mechanism delta signals; confidence_weighted thresholds
- D18 verification: narrative trace + score consistency; pass/fail criteria
- D19 residual seams: full SELF_REPORT_DEPENDENT and CONFIDENCE_WEIGHTED specifications
- D20 cost model: per-request cost decomposition; R5 free-tier and 2x paid-tier validation
- D21 migration plan: Phase-2 build sequencing; D14b first per AC-19; per-pass Critical Change Protocol
- D22 test plan: 5 test categories (structural/behavioural/purity/founder-performable/AC4+ES1-3 eval suite)
- D23 open-questions register: 28 deferred decisions across 6 categories (PR7 audit trail)
- D1 ADR: full architectural commitment documentation across AC-1 through AC-19 + alternatives considered
- Phase-1 design complete: 23 of 23 deliverables drafted/adopted
- Session close + (recommended) Phase-1 completion review next session"
```

Then push via **GitHub Desktop** per D-PR8-PUSH-2026-04-26 (sandbox cannot reliably push). No deploy effect (drafts and operations docs only); no Vercel build engaged.

If the `git add` fails with `index.lock` errors (D-LOCK-CLEANUP-2026-04-26 pattern), run `rm .git/index.lock` from the same Terminal first, then retry `git add`.

### Step 5 — Cross-reference integrity verification (optional founder check)

The founder may run the cross-reference checks performed during this session:

```
# AC-19 references should appear in D14a, D14b, D21, D1
grep -l "AC-19" drafts/rag-mentor-alt3/*.md drafts/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md

# AC-18 references should appear in D14b, D11, D12, D16, D18, D19, D21, D22, D1
grep -l "AC-18" drafts/rag-mentor-alt3/*.md drafts/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md

# Anchor pattern coverage
for anchor in "philodoxia" "orge" "procedural reports" "bus" "agonia"; do
  echo "$anchor: $(grep -l "$anchor" drafts/rag-mentor-alt3/*.md drafts/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md 2>/dev/null | wc -l) deliverables"
done
```

Expected: AC-19 in 7 files (D14a, D14b, D16, D20, D21, D24, D1); AC-18 in 12 files; anchor patterns: philodoxia 19, orge 10, procedural reports 2, bus 4, agonia 8.

---

## Orchestration Reminder (Element 21)

This session was governed end-to-end by `/adopted/session-opening-protocol.md`. Honest audit of element compliance:

- **Element 1 (Tier declaration):** ✓ Declared at open (founder/governance scope; design-only; Standard risk).
- **Element 2 (Canonical-source read sequence):** ✓ All Part A sources read in canonical order before any deliverable was written. The read sequence covered manifest, session-2 close, alt-3 architecture brief, decision-log tail (last 6+ entries), eight session-2 deliverables, D2/D3/D8 from /adopted/, D24 audit, knowledge-gaps register, code surfaces.
- **Element 3 (Handoff read):** ✓ Predecessor close (`2026-05-02-rag-phase1-alt3-session2-close.md`) read in full at session open.
- **Element 4 (Knowledge-gaps scan):** ✓ KG1, KG2, KG3, KG6, KG7 scanned and named in deliverables.
- **Element 5 (Hold-point status):** ✓ P0 0h confirmed active; design-only work permissible.
- **Element 6 (Model selection):** ✓ N/A for the writing — no LLM model selection at session level. Model selection (Sonnet for Layer 1/3 carried forward; OpenAI text-embedding-3-small for retrieval; heuristic for re-rank) specified within deliverables (D5, D6, D7).
- **Element 7 (Status-vocabulary confirmation):** ✓ Implementation status (`Designed` for drafts) and decision status (`Drafted — under founder review` for the deliverables entry) kept separate per the 0a taxonomies.
- **Element 8 (Signals & risk classification):** ✓ Standard for all changes; "I'm confident" / "I need your input" signals used at the AskUserQuestion at session open; no Critical / Elevated changes.
- **Element 9 (Change classification before execution):** ✓ Each change classified before applying.
- **Element 13 (Single-endpoint proof, PR1):** ✓ Preserved at the architectural level — D14b is the Phase-2 pass-1 single-endpoint target per AC-19, named explicitly in D21.
- **Element 14 (Verification immediate, PR2):** ✓ Each deliverable's worked examples and cross-references are the verification surface. Cross-reference integrity check performed before session close.
- **Element 15 (Deferred decisions logged, PR7):** ✓ 28 deferred decisions catalogued in D23 with reasoning and revisit conditions. The D2 amendment scope question (deferred to D23 §O5.2) is the specific session-2-carried decision recorded.
- **Element 18 (Scope caps):** ✓ Engaged once — at the AskUserQuestion at session open; founder direction received in one round (Path A).
- **Element 19 (Stabilise before closing):** ✓ All 13 deliverables complete; decision-log append complete; cross-reference integrity verified; session close (this document) produced. No half-changed state.
- **Element 20 (Handoff in required-minimum format with extensions):** ✓ This document carries the 0b minimum (Decisions Made / Status Changes / Next Session Should / Blocked On / Open Questions) plus the extensions (Verification Method / Risk Classification / PR5 / Founder Verification / Orchestration Reminder).
- **Element 21 (Orchestration reminder):** This section.

**Net assessment:** Protocol followed. The session landed 13 design deliverables, one decision-log entry, and the closing artefacts in a single uninterrupted flow once the AskUserQuestion confirmed pre-conditions. No protocol elements skipped. The Validation Addendum guidance and the D24 audit refinements are cross-referenced across session-3 deliverables as named — Phase 2 has the directional inputs it needs.

**Phase-1 design completion:** 23 of 23 deliverables drafted/adopted. Phase 2 commences after Phase-1 completion review (next session) and the eventual approval batch move to `/adopted/rag-mentor-alt3/`.

---

## Cross-references

- `/adopted/session-opening-protocol.md` (governing frame)
- `/manifest.md` (R0, R5, R6a–R6e, R7, R8a–R8d, R17, R18d, R19, R20a/b/c/d, AC1–AC7, KG1–KG7, ES1–ES3)
- `/operations/decision-log.md` D-RAG-MENTOR-ALT3-PHASE1-SESSION3-DRAFTS-2026-05-02 (this session)
- `/operations/decision-log.md` D-RAG-MENTOR-ALT3-PHASE1-SESSION2-DRAFTS-2026-05-02 (the eight session-2 deliverables this session builds on)
- `/operations/decision-log.md` D-RAG-MENTOR-ALT3-CRITICAL-PATH-MOVED-TO-ADOPTED-2026-05-02 (D2/D3/D8 move)
- `/operations/decision-log.md` D-RAG-MENTOR-ALT3-CRITICAL-PATH-APPROVED-2026-05-02 (the predecessor approval)
- `/operations/decision-log.md` D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29 (the validation findings honoured)
- `/operations/decision-log.md` D-RAG-MENTOR-ALT3-PHASE1-DRAFTS-2026-05-01 (Phase-1 session 1 critical path)
- `/operations/decision-log.md` D-RAG-MENTOR-ALT3-PHASE1-AUDIT-2026-05-01 (D24 source)
- `/operations/decision-log.md` D-RAG-MENTOR-ALT3-ADOPTED-2026-04-29 (the architecture)
- `/operations/decision-log.md` D-MENTOR-PRIVATE-REFLECT-PRE-ALT3-SNAPSHOT-2026-05-02 (the snapshot referenced by D21)
- `/operations/handoffs/founder/2026-05-02-rag-phase1-alt3-session3-NEXT-SESSION-PROMPT.md` (this session's input prompt)
- `/operations/handoffs/founder/2026-05-02-rag-phase1-alt3-session2-close.md` (predecessor close)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture)
- `/adopted/rag-mentor-alt3/canonical-framework.md` (D2)
- `/adopted/rag-mentor-alt3/passion-taxonomy.md` (D3)
- `/adopted/rag-mentor-alt3/operationalised-rules.md` (D8 v1.0.0 with Validation Addendum)
- `/drafts/rag-mentor-alt3/consumer-workflow-audit.md` (D24 — reviewed)
- `/drafts/rag-mentor-alt3/corpus-inventory.md` (D4)
- `/drafts/rag-mentor-alt3/rule-dependency-map.md` (D9)
- `/drafts/rag-mentor-alt3/layer-1-translation.md` (D10)
- `/drafts/rag-mentor-alt3/layer-3-translation.md` (D11)
- `/drafts/rag-mentor-alt3/three-tier-intake.md` (D13)
- `/drafts/rag-mentor-alt3/reflect-endpoint-14a-daily-ritual.md` (D14a)
- `/drafts/rag-mentor-alt3/reflect-endpoint-14b-deferral-resolution.md` (D14b — Phase-2 pass 1 load-bearing)
- `/drafts/rag-mentor-alt3/long-deferred-questions.md` (D15)
- `/drafts/rag-mentor-alt3/index-schema.md` (D5 — new this session)
- `/drafts/rag-mentor-alt3/retrieval-interface.md` (D6 — new this session)
- `/drafts/rag-mentor-alt3/re-rank-design.md` (D7 — new this session)
- `/drafts/rag-mentor-alt3/strict-prompting.md` (D12 — new this session)
- `/drafts/rag-mentor-alt3/score-in-reply.md` (D16 — new this session)
- `/drafts/rag-mentor-alt3/progression-delta.md` (D17 — new this session)
- `/drafts/rag-mentor-alt3/verification.md` (D18 — new this session)
- `/drafts/rag-mentor-alt3/residual-seams.md` (D19 — new this session)
- `/drafts/rag-mentor-alt3/cost-model.md` (D20 — new this session)
- `/drafts/rag-mentor-alt3/migration-plan.md` (D21 — new this session, Phase-2 build-sequencing load-bearing)
- `/drafts/rag-mentor-alt3/test-plan.md` (D22 — new this session)
- `/drafts/rag-mentor-alt3/open-questions.md` (D23 — new this session)
- `/drafts/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md` (D1 — new this session)

---

*End of session close. Phase-1 design batch complete: 23 of 23 deliverables drafted/adopted.*
