# Next-Session Prompt — Phase 1 Alt-3 Session 3 (Remaining 13 Deliverables: ADR + Index/Retrieval/Re-rank + Strict Prompting + Score-in-Reply + Progression Delta + Verification + Residual Seams + Cost Model + Migration Plan + Test Plan + Open-Questions Register)

**Stream:** founder. **Tier:** founder/tech, governance scope.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-02-rag-phase1-alt3-session2-close.md`.
**Architecture brief:** `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (Adopted — alt 3 is the foundational architecture).

This session is **design only**. No code. The deliverable is the remaining 13 Phase-1 design documents the founder reviews and approves before Phase 2 (build) begins.

---

## Pre-conditions for this session opening

This session does not begin until the following are settled:

1. **Founder push of 2026-05-02 commits via GitHub Desktop per D-PR8-PUSH-2026-04-26.** The eight Phase-1 session 2 deliverables, two decision-log entries, the session close, and this next-session prompt must be committed and pushed before the next session begins.
2. **Founder review of the eight Phase-1 session 2 deliverables.** D4 (corpus inventory), D9 (rule dependency map), D10 (Layer 1 translation), D11 (Layer 3 translation), D13 (three-tier intake), D14a (daily-reflection ritual endpoint), D14b (deferral-resolution surface), D15 (long-deferred questions). The founder reviews each; approval can be batched or per-document.
3. **Optional — D2 / D3 / D8 file move from `/drafts/` to `/adopted/`** (separate Elevated-risk action surfaced in the session close §"Founder Verification" Step 5). Two options: (a) execute the move as a focused housekeeping session before Phase-1 session 3; (b) defer the move until Phase-1 session 3's eventual approval batch (when all 23 deliverables move together). Founder calls. If option (a), session 3's read sequence reads D2 / D3 / D8 from `/adopted/` rather than `/drafts/`.

Approval paths for the eight session-2 deliverables:

- **(a)** Approved as drafted → proceed to this session's full scope.
- **(b)** Approved with founder direction questions resolved (D14a own-page vs embedded; D14a `mentor_observation` visibility; D14b route + page names) → record the founder calls in deliverables and decision log; proceed.
- **(c)** Send back specific deliverables for redesign → those deliverables redraft before this session begins.
- **(d)** Defer → no session.

If preconditions are not met at session open, the agent's first action is to ask which path applies. Do not proceed to design new deliverables on top of unresolved questions.

---

## Part A — Open the session under the protocol

Per `/adopted/session-opening-protocol.md` Part A elements 1–8, do the full read sequence. Tier: founder/tech, governance scope. Read:

1. `/manifest.md`
2. (Project instructions — already in system prompt)
3. **`/operations/handoffs/founder/2026-05-02-rag-phase1-alt3-session2-close.md`** — the session-2 close. Required context. Read in full.
4. **`/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md`** — the alt-3 architecture brief with Validation Addendum. Required context.
5. **`/operations/decision-log.md`** — at minimum the last 6 entries (D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29, D-REGISTRY-UPDATE-v1.3.0-2026-05-02, D-RAG-MENTOR-ALT3-CRITICAL-PATH-APPROVED-2026-05-02, D-RAG-MENTOR-ALT3-PHASE1-SESSION2-DRAFTS-2026-05-02, plus any approval entries for the session-2 deliverables, plus any move-to-/adopted/ entries from option (a) above).
6. **The eight Phase-1 session 2 deliverables** (or their `/adopted/`-version if option (a) of the preconditions was taken). Read in full:
   - `/drafts/rag-mentor-alt3/corpus-inventory.md` (D4) — the tagging schema this session's D5 (index schema) materialises into storage.
   - `/drafts/rag-mentor-alt3/rule-dependency-map.md` (D9) — the engine sequencing this session's D21 (migration plan) sequences Phase-2 build against.
   - `/drafts/rag-mentor-alt3/layer-1-translation.md` (D10).
   - `/drafts/rag-mentor-alt3/layer-3-translation.md` (D11) — D12 (strict inclusion + exclusion design) packages the inclusion + exclusion rules from D11 into a paraphrase prompt template.
   - `/drafts/rag-mentor-alt3/three-tier-intake.md` (D13) — D18 (verification design) verifies the three-tier dispatch behaves correctly post-build.
   - `/drafts/rag-mentor-alt3/reflect-endpoint-14a-daily-ritual.md` (D14a).
   - `/drafts/rag-mentor-alt3/reflect-endpoint-14b-deferral-resolution.md` (D14b) — D21's migration plan reads D14b as the load-bearing Phase-2 pass-1 surface per AC-19.
   - `/drafts/rag-mentor-alt3/long-deferred-questions.md` (D15) — D19 (residual seams handling) implements the AC-17 flag specifications that interact with D15's domain-match algorithm.
7. **`/drafts/rag-mentor-alt3/canonical-framework.md`** (D2 — approved per Path A; possibly under `/adopted/` per option (a)) and **`/drafts/rag-mentor-alt3/passion-taxonomy.md`** (D3) — the canonical mechanism taxonomy and passion vocabulary D5 (index schema) consumes as the index's structural fields.
8. **`/drafts/rag-mentor-alt3/operationalised-rules.md`** (D8 — approved as v1.0.0 with Validation Addendum). The 10 rules whose execution D21 sequences.
9. **`/drafts/rag-mentor-alt3/consumer-workflow-audit.md`** (D24 — reviewed). The audit's findings inform D20 (cost model — observed costs across the perimeter routes), D21 (migration plan — the per-route migration ordering), and D22 (test plan — verification methods per route).
10. `/operations/knowledge-gaps.md` — scan KG1–KG7. KG1, KG2, KG6 are most relevant for this session (KG1 rules for Phase-2 implementation; KG2 model selection in D5 / D6; KG6 composition order in D5's index design).
11. **Code surfaces (read-only — for D5 / D6 / D20 / D21 reference):**
    - `/website/src/lib/sage-reason-engine.ts` — the current engine entry point; D21's migration plan replaces this.
    - `/website/src/lib/context/stoic-brain-loader.ts` — the current corpus loader; D5's index schema replaces / augments this.
    - `/website/public/component-registry.json` — for D20's cost model reference (LLM token-cost observations across the perimeter routes).

Confirm: tier, hold-point status (still active per P0 0h), model selection (no code expected; flag if changes), status-vocabulary readiness, signals/risk-classification readiness.

---

## Part B — Verify state

Quick check with the founder:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git status -s
```

Expected: empty (no modifications) unless option (a) of the preconditions executed the D2 / D3 / D8 move (in which case the moves are committed before session 3 begins) or unless founder direction questions surfaced changes to the eight session-2 deliverables.

---

## Part C — Run alt-3 Phase-1 session 3

Thirteen deliverables this session, recommended sequencing:

1. **Deliverable 5 — Index schema** (`/drafts/rag-mentor-alt3/index-schema.md`). Materialises D4's tagging schema into a Supabase pgvector + tsvector storage shape. Specify: per-passage table schema (the columns, types, constraints, indexes); the embedding model choice (with cost / quality table); the tsvector configuration for BM25; the chunk-size policy (per AC-4 small chunks); the per-passage uniqueness key; the migration shape from today's `stoic-brain-compiled.ts` constants to the indexed table; RLS policies (the index is read-only at request time; write-time access is Phase-2 build operator only). Resolve the storage decision (single pgvector + tsvector table per AC-2 hybrid retrieval, vs separate vector store and full-text-search index).

2. **Deliverable 6 — Retrieval interface** (`/drafts/rag-mentor-alt3/retrieval-interface.md`). Specify the hybrid retrieve function signature: input parameters (query, mechanism filter, passion filter, top-K, etc.), output shape (the retrieved passages with their tags), the BM25 + vector fusion via Reciprocal Rank Fusion (per AC-2), error modes (empty result, retrieval timeout, embedding failure), and the cache strategy (per-query short-lived cache for repeated retrievals within a request). Include the schema for the intermediate retrieve-result that the re-ranker consumes.

3. **Deliverable 7 — Re-rank design** (`/drafts/rag-mentor-alt3/re-rank-design.md`). Cross-encoder vs LLM-as-reranker vs heuristic, with cost / quality table. Per AC-3 (top ~20 retrieved → re-rank → top ~3–5 to prompt). Specify the chosen approach and the rationale; specify the re-rank input shape (the retrieved passages plus the original query); specify the re-rank output shape (the top-K with relevance scores). Include the per-mechanism re-rank policy (some mechanisms benefit from heuristic re-rank, e.g., direct mechanism-tag match; others benefit from cross-encoder).

4. **Deliverable 12 — Strict inclusion + exclusion design** (`/drafts/rag-mentor-alt3/strict-prompting.md`). Packages the inclusion + exclusion rules from D11 into a single paraphrase prompt template. Specify: the inclusion clause structure (what the prose must include from upstream rule outputs); the exclusion clause structure (what the prose must not include — Stoic inference originating from Claude); the slot-fill mechanics consolidated from D11 §"Slot-fill mechanics" and from D13's question stems; the prompt template formatting per AC6 (system block carries inclusion + exclusion rules; user message carries per-request engine output). Worked examples drawn from D11 worked examples.

5. **Deliverable 16 — Score-in-reply design** (`/drafts/rag-mentor-alt3/score-in-reply.md`). Per AC-9 (score in the conversation reply — structured score fields + narrative prose). Specify the conversation surface response payload shape: the structured score fields the conversation surface returns alongside the narrative prose. Include: the proximity / passions / virtue / kathekon structured fields on the response envelope (per the existing `/api/founder/hub` mentor pipeline shape that the conversation surface uses); the proximity ring data contract per AC-11 (Phase-1 wired; Phase-2 UI rendered). Cross-reference D14a's preserved-output specification — the conversation surface and the daily-reflection ritual surface have different visible-output shapes but consume the same canonical engine output.

6. **Deliverable 17 — Progression delta design** (`/drafts/rag-mentor-alt3/progression-delta.md`). Comparison logic across instances. Specify: the prior-state read (which historic instances inform the delta — windowing per practitioner profile); the signal definition (which mechanisms' outputs change between instances and what change indicates progression); the delta vocabulary (improving / stable / declining per Mechanism 10; per-mechanism deltas where available); the AC-17 `CONFIDENCE_WEIGHTED` interaction (single-instance deltas are low-confidence; multi-instance trends raise confidence). Cross-reference D15's domain-match algorithm — domain-matched deferrals are part of the progression context.

7. **Deliverable 18 — Verification design** (`/drafts/rag-mentor-alt3/verification.md`). Per AC-12's commitment that no Stoic inference originates from Claude. Two verification dimensions:
   - **Narrative trace verification.** Verifies that every Stoic claim in Layer 3's prose traces to a retrieved passage or to an upstream rule output. The verification reads the prose, identifies Stoic claims, and confirms the trace.
   - **Score consistency verification.** Verifies that the structured score in the response is consistent with the retrieved evidence. The verification reads the score and the retrieved passages and confirms consistency.
   Specify the verification function signatures, the canonical test inputs, the pass / fail criteria, and the founder-performable verification protocol.

8. **Deliverable 19 — Residual seams handling** (`/drafts/rag-mentor-alt3/residual-seams.md`). Per AC-17. Specify the `SELF_REPORT_DEPENDENT` flag's complete behaviour: when it fires (per Mechanism 10's logic in D8 Rule 10), how it's projected by Layer 3 per surface (per D11 Refinement 3), how it interacts with Mechanism 5's `refinement_source` (PROFILE / DERIVED). Specify the `CONFIDENCE_WEIGHTED` flag's complete behaviour: the three confidence levels (low / medium / high), the longitudinal evidence threshold per level, the eupatheia-boundary application, the Senecan grade application. Cross-reference D11 Refinement 5 (Validation Addendum Adjustment 1 prose projection) and D15 Principle 3 (long-deferred observation language) — both depend on AC-17 flag specifications.

9. **Deliverable 20 — Cost model** (`/drafts/rag-mentor-alt3/cost-model.md`). Per-turn cost across both surfaces (deferral-resolution surface from D14b; daily-reflection ritual surface from D14a; conversation surface — implicit in D11 / D16); comparison to current baseline. Specify: the LLM token costs per request (Layer 1 + engine + Layer 3 + retrieval embeddings); the storage costs per practitioner (the index size, the practitioner profile size, the OPEN_DEFERRAL flags); the operational costs (Vercel function execution, Supabase queries); the R5 free-tier cost bound (100 calls per month at the per-call cost). Surface the observed cost data from D24 audit (per-route latency observations) plus any operational data the founder has on hand. Surface the R5 amendment (paid-tier revenue must cover at least 2x the LLM API costs incurred by that tier) — the cost model informs pricing.

10. **Deliverable 21 — Migration plan** (`/drafts/rag-mentor-alt3/migration-plan.md`). **The load-bearing build-sequencing deliverable.** Per AC-19 — reflect-endpoint-first build order. Specify Phase-2 build sequencing in full:
    - **Phase 2 pass 1 — Deferral-resolution surface (D14b).** PR1 single-endpoint proof discipline. Critical Change Protocol per PR6 + AC5 + R17. Env flag `MENTOR_RAG_V1=true`. Schema migrations (`open_deferrals` + `deferral_resolutions` tables). Encryption wiring (P2 task 2c coordination). Founder verification per D14b's eight verification protocols. **Single-endpoint proof must reach Verified status before any further alt-3 work proceeds (per PR1).**
    - **Phase 2 pass 2 — Daily-reflection ritual surface (D14a) engine substitution.** Critical Change Protocol per PR6. Env flag (same `MENTOR_RAG_V1=true`). Snapshot of current `/api/mentor/private/reflect` ritual flow. Engine implementation (shared with pass 1). Layer 3 Table 4a projection. Page move (own-page or embedded — per D14a founder direction). Verification per D14a's six verification protocols.
    - **Phase 2 pass 3 — Conversation surface migration.** Per AC-7 (Phase-1 conversation surface scope). The conversation surface migrates to consume the deterministic engine via the same Layer 1 → engine → Layer 3 sandwich, with the conversation-specific projection per D2 Table 1 / 2 / D16 score-in-reply.
    - **Phase 3+ — Score-family endpoint migrations.** Per route (Routes 1, 2, 3, 4, 5 from D24 — `/api/score`, `/api/score-decision`, `/api/score-document`, `/api/score-scenario`, `/api/score-social`). Each migration per D24's Phase-3+ migration projection sections. Snapshots before migration per D24's recommendation.
    - **Rollback paths per pass.** Each pass's rollback is named explicitly (env flag false; schema reverts; etc.).
    - **AC4 invocation testing per pass.** Phase-2 build's CI runs invocation tests for each route's R20a wiring.
    - **D-A16 catalogue promotion as Phase-2 build precondition** (per D4 Gap 1 + D11 / D13 dependencies).
    - **The two snapshots before Phase-2 begins** (per D24 audit): `/api/reason` snapshot; `/api/mentor/private/reflect` snapshot.

11. **Deliverable 22 — Test plan** (`/drafts/rag-mentor-alt3/test-plan.md`). Structural, behavioural, purity, founder-performable verification per 0c. Specify:
    - **Structural tests** — index schema integrity; retrieve-then-rerank pipeline integrity; engine sequencing integrity (the 12 positions execute in canonical order; back-edge fires correctly with loop guard).
    - **Behavioural tests** — engine produces canonical output for the named anchor patterns (philodoxia, orge with children, six procedural reports, bus story, agonia in catastrophising); Tier 1 / Tier 2 / Tier 3 dispatch fires correctly per D13.
    - **Purity tests (AC-12 verification)** — Layer 1's output never contains Stoic inference; Layer 3's output never contains Stoic inference originating from Claude (every claim traces to upstream rule output). Per D18 verification design.
    - **Founder-performable verification per 0c** — the consolidation of D14a and D14b verification protocols plus the new verifications for D5, D6, D7, D16, D17, D18, D19.
    - **R20a invocation tests per AC4** — distress detection invocation on every R20a perimeter route including the new ninth route (D14b's `/api/mentor/private/deferral-resolve`).
    - **Eval suite per ES1, ES2, ES3** — Zone 2 eval inputs include founder-profile inputs; eval suite gates phase transitions; results recorded in safety signal audit.

12. **Deliverable 23 — Open-questions register** (`/drafts/rag-mentor-alt3/open-questions.md`). Catalogue of unresolved Phase-1 questions and deferred decisions per PR7. Each entry: question text, why it's deferred, what condition triggers revisit. Categories:
    - **Architectural commitments deferred** — Graph RAG (AC-6 outline only); Phase-3+ migration of score-family endpoints; corpus expansion (D-A10) as parallel track; D-A16 focus-question stems catalogue promotion.
    - **Founder direction deferred** — D14a own-page vs embedded; D14a `mentor_observation` visibility (recorded post-founder-call); D14b route + page names.
    - **Working-value parameters deferred** — long-deferred threshold N=7 days (D15); back-edge loop guard threshold = 1 (D9); cleanliness rating thresholds.
    - **Phase-2 build precondition** — D-A16 promotion; the two snapshots; encryption wiring (P2 task 2c).
    - **Future revision pass** — D8 v1.1.0 transcript-faithful redo; D2 amendments per D24 coverage gaps (5 small additions).
    - **Cross-cutting limitations** — Validation Addendum scope (philodoxia calibration; recalibration needed for other practitioner profiles per ES1).

13. **Deliverable 1 — ADR (translation-sandwich + deterministic engine)** (`/drafts/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md`). **Written last** because the design is now sufficiently settled for the ADR to be authored against the actual deliverables. Documents AC-1 through AC-19 with cross-references to all 23 deliverables. ADR structure per `/adopted/` ADR conventions. Status: **Drafted — under founder review** (ADR adoption is Elevated risk; happens at its own time in a focused approval session).

For each deliverable, follow the format established in session-1 and session-2 deliverables:

- Plain-language explanations; technical terms defined first time they appear (BM25, vector embedding, RRF, cross-encoder, top-K, sparse vs dense retrieval, Graph RAG, slot-filling, kathekon, katorthoma, hegemonikon, prohairesis, eupatheia, oikeiosis, neuro-symbolic, deterministic vs interpretive, OPEN_DEFERRAL, kairos, retrospective score update, env flag, rollback path).
- Worked examples drawn from the named anchor patterns where applicable (philodoxia patterns, orge with children, six consecutive procedural reports, bus story, agonia in catastrophising). Do not invent new example patterns unless a deliverable specifically requires a pattern not in the catalogue.
- Explicit interpretive moves named where they exist.
- Cleanliness rating per applicable component (HIGH / PARTIAL / INTERPRETIVE).
- Cross-reference to architectural commitments (AC-1 through AC-19) where relevant.

---

## Part D — Decision-log entry

Append to `/operations/decision-log.md`:

`D-RAG-MENTOR-ALT3-PHASE1-SESSION3-DRAFTS-YYYY-MM-DD` — Status: Drafted — under founder review. Cross-references: D-RAG-MENTOR-ALT3-PHASE1-SESSION2-DRAFTS-2026-05-02 (the eight session-2 deliverables this session builds on); D-RAG-MENTOR-ALT3-CRITICAL-PATH-APPROVED-2026-05-02 (the precondition approval); D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29 (the validation findings honoured); the thirteen new deliverable files; this next-session prompt; the session-3 close.

---

## Part E — Session close + Phase-1 completion preparation

Produce a session close at `/operations/handoffs/founder/YYYY-MM-DD-rag-phase1-alt3-session3-close.md` per protocol Part C. Include the standard 0b minimum (Decisions Made / Status Changes / Next Session Should / Blocked On / Open Questions) plus the extensions (Verification Method Used / Risk Classification Record / PR5 / Founder Verification).

The "Next Session Should" section recommends a **Phase-1 completion review session** (not Phase 2 directly):

- All 23 deliverables exist as drafts.
- Founder review of the 13 session-3 deliverables (or batched approval per session 3 close's recommendations).
- D2 / D3 / D8 / D24 / D4 / D9 / D10 / D11 / D13 / D14a / D14b / D15 / D1 / D5 / D6 / D7 / D12 / D16 / D17 / D18 / D19 / D20 / D21 / D22 / D23 — full set of 23.
- Move-to-`/adopted/` housekeeping (Elevated risk; separate decision-log entry per the deliverables' approval-gate footers).
- D1 ADR adoption — Elevated risk; separate decision-log entry.
- After Phase-1 completion: Phase-2 pass 1 begins per D21's migration plan.

---

## Important context (preserved from session 2 prompt)

- **Founder is a non-coder.** Plain-language explanations of every design decision. Define every technical term the first time it appears. Show concrete worked examples in every deliverable that defines a mechanism — at least three examples drawn from the named anchor patterns where applicable.

- **Founder decides direction.** AI surfaces options with reasoning. AC-1 through AC-19 are pre-committed and not re-debated.

- **Phase 1 is design only.** No edits to `/website/src/`, no edits to `/api/`, no edits to the database, no edits to any adopted document (manifest, project instructions, decision log entries already adopted). All design lives under `/drafts/rag-mentor-alt3/` and `/drafts/` (D1 ADR). A draft ADR is still a draft until the founder approves and it moves to `/adopted/`.

- **Honest disclosure throughout.** Where a deliverable depends on the architecture-exercise transcript that may not be in front of the agent, name the dependency explicitly (re-derivation status, etc.). Pre-D-A16 transitional behaviours flagged.

- **No-shareable-artifact constraint is non-negotiable on the deferral-resolution surface (AC-18).** D14b is the architectural specification; D21 (migration plan) preserves AC-18 across Phase-2 pass 1; D22 (test plan) verifies AC-18 holds end-to-end at deployment time. Any proposed feature that would produce a shareable artefact at the deferral-resolution surface is rejected at design stage.

- **Reflect-endpoint-first build order is non-negotiable (AC-19).** D21 (migration plan) sequences Phase-2 pass 1 as the deferral-resolution surface (D14b). Phase-2 pass 2 is the ritual surface (D14a). Phase-2 pass 3 is the conversation surface. Score-family migrations are Phase 3+.

- **Worked examples drawn from architecture-exercise patterns.** Reuse the named anchors (philodoxia patterns, orge with children, six consecutive procedural reports, bus story, agonia in catastrophising) for consistency. Do not invent new example patterns unless a deliverable specifically requires a pattern not in the catalogue.

- **Risk classification:** every Phase-1 session-3 deliverable is Standard under 0d-ii (drafts in `/drafts/`, no live-system effect). The eventual ADR adoption (D1 move-to-`/adopted/` after founder approval) is Elevated. Phase-2 pass 1 (D14b's deferral-resolution surface build) is Critical under PR6 + AC5 + R17.

- **D24 audit refinements deferred from session 2 to session 3** (per D24 audit recommendations §"Coverage gaps in D2 mapping tables"):
  - **D2 amendment for the 5 coverage gaps** (per D24): `prior_feedback` projection note for Route 1; aggregate-across-options note for Route 2; policy-mode-specific Table 6 for Route 3; quick-depth Table 0 / 1a for Route 6; Table 4a dual applicability for Routes 7 + 8 ritual flow. The amendment can be folded into D5 (index schema)'s mapping work or into D2 directly. Recommendation: D2 amendment as a separate decision-log entry (Elevated risk per the deliverable being approved-as-drafted — amendment requires re-approval). Founder calls.

---

## Standing reminders

- Single source of truth for the alt-3 design: `/drafts/rag-mentor-alt3/`. Cross-reference, don't duplicate, content between deliverables.
- Decision-log entry per session per PR7 — including for explicitly deferred decisions.
- Provide the founder with verification methods (URLs, expected results, copy-paste commands) for any work that touches a live surface. Phase 1 should not touch live surfaces; if any Phase-1 work would, surface it as a scope question and pause.
- Do not propose changes to the founder-hub flow during Phase 1. Founder-hub is parked and out of scope.
- Do not migrate score-family endpoints during Phase 1. Phase 1 designs the index to support migration; the migration itself is Phase 3+.
- Do not propose corpus expansion during Phase 1. D-A10 is logged as open question.
- Do not commingle the alt-3 design with prior alternatives. Their handoffs are the reasoning trail; deliverables under `/drafts/rag-mentor-alt3/` must be self-contained.
- Do not propose features that produce shareable artefacts at the deferral-resolution surface. AC-18 is binding.
- Do not propose build sequencing that builds the conversation surface or the ritual surface before the deferral-resolution surface. AC-19 is binding.

---

## Phase-1 completion forecast

After Phase-1 session 3, the full set of 23 deliverables exists as drafts:

| # | Deliverable | Source session | Critical path? |
|---|---|---|---|
| 1 | ADR (translation-sandwich + deterministic engine) | Session 3 (last) | No |
| 2 | Canonical mechanism framework | Session 1 (approved) | Yes |
| 3 | Passion taxonomy | Session 1 (approved) | Yes |
| 4 | Corpus inventory | Session 2 | No |
| 5 | Index schema | Session 3 | No |
| 6 | Retrieval interface | Session 3 | No |
| 7 | Re-rank design | Session 3 | No |
| 8 | Operationalised scoring rules (with Validation Addendum) | Session 1 (approved v1.0.0) | Yes |
| 9 | Rule dependency map and engine sequencing | Session 2 | No |
| 10 | Layer 1 translation specification | Session 2 | No |
| 11 | Layer 3 translation specification | Session 2 | No |
| 12 | Strict inclusion + exclusion design | Session 3 | No |
| 13 | Three-tier intake clarification specification | Session 2 | No |
| 14a | Daily-reflection ritual endpoint design | Session 2 | No |
| 14b | Deferral-resolution surface design | Session 2 | **Phase-2 pass 1 load-bearing** |
| 15 | Long-deferred questions handling | Session 2 | No |
| 16 | Score-in-reply design | Session 3 | No |
| 17 | Progression delta design | Session 3 | No |
| 18 | Verification design | Session 3 | No |
| 19 | Residual seams handling | Session 3 | No |
| 20 | Cost model | Session 3 | No |
| 21 | Migration plan | Session 3 | **Phase-2 build-sequencing load-bearing** |
| 22 | Test plan | Session 3 | No |
| 23 | Open-questions register | Session 3 | No |
| 24 | Consumer workflow audit (R20a perimeter) | Audit session 2026-05-01 (reviewed) | No |

After all 23 deliverables are approved and moved to `/adopted/`, Phase 2 begins per D21's migration plan. The first build pass is D14b (deferral-resolution surface) per AC-19.

---

End of prompt. Confirm receipt and full Part A read before proceeding to Part B.
