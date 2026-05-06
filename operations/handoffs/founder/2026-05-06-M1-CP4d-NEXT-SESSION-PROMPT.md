# Next-Session Prompt — M1-CP4d: Multi-turn input flow design ADR for AC-13 Tier 1

**Stream:** founder.
**Tier:** governance.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverable-of-the-day named below).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-06-sub-session-M1-CP4c-close.md`.
**Predecessor decision-log entries:** `D-M1-CP4c-LAYER-MODULES-AC14-TIER2-IMPLEMENTED-2026-05-06` (M1-CP4c — the modules + harness this session does NOT touch); `D-M1-CP4b-AC14-TIER2-ADR-AMENDMENTS-2026-05-06` (M1-CP4b — the ADR amendments this session does NOT touch); `D-M1-AC13-AC14-WIRING-REQUIRED-BEFORE-CUTOVER-2026-05-05` (parent scope decision; names the M1-CP4d scope).
**Risk classification:** **Standard** under 0d-ii. Critical Change Protocol NOT engaged. Documentation-only — design ADR drafted in `/drafts/adr/`; no code; no production touch. The session's load-bearing decision (server-side ephemeral session vs client-renders-form stateless protocol vs Tier 1 deferred) has Critical-tier downstream implications at M1-CP4e if the founder selects an in-scope option, but the design call itself is Standard.

## Why this session matters

M1-CP4c implemented the AC-14 + Tier 2 triggers in code (EUPATHEIA_BOUNDARY, PRAXIS_MOTIVATION_AMBIGUITY, STATED_OPERATIVE_CONFLICT, STATED_EQUANIMITY_UNVERIFIED). Tier 1 (force-clarification) remains unscoped. Tier 1's three triggers — ELEMENT_FUSION at Layer 1, SCOPE_AMBIGUITY at Position 6 oikeiosis, TEMPORAL_AMBIGUITY at Position 2 passion_diagnosis — require the engine to *stop* and force a clarifying question before producing any assessment. That requires a multi-turn input flow, which the current `/api/reason` shape (single request → single response) cannot support. The design call is the founder's: how should `/api/reason` handle a forced clarification? Without this design, M1-CP4e (Critical-tier route updates) cannot proceed and Tier 1 cannot ship at M1.

## Pre-conditions

1. The four module/harness updates from M1-CP4c are committed + pushed (per the predecessor session's Step A).
2. Founder spot-check confirmed the harness reproduces 198 / 198 (per the predecessor session's Step B).
3. Founder is ready for a 1–3 hour governance session (no code; ADR drafting + design decision + decision-log entry + close).
4. Vercel deployment + Supabase state unchanged from M1-CP4c close (no production touch this session either).

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier `governance`, lean form applies; Standard default risk).
2. `/operations/handoffs/founder/2026-05-06-sub-session-M1-CP4c-close.md` (~5 min — predecessor close).
3. `/adopted/rag-mentor-alt3/three-tier-intake.md` — focus on Tier 1 (force-clarification) sections; the canonical specification of the three Tier 1 triggers (ELEMENT_FUSION / SCOPE_AMBIGUITY / TEMPORAL_AMBIGUITY) and the architectural intent.
4. `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` §2 (current `/api/reason` request/response shape) + §6.3 (failure-isolation guarantee — the constraint that the design must preserve) + §10 (checkpoint table — confirms M1-CP4d scope).
5. `/adopted/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md` AC-13 (the architectural commitment this ADR realises).
6. `/operations/decision-log.md` last 2 entries (D-M1-CP4c + D-M1-CP4b — full implementation context).

Confirm at session open per cache:

- Tier: **`governance`** — design ADR drafted; no code.
- Hold-point: P0 0h active.
- Status vocabulary: at session close, the new ADR moves from Designed (this session, in `/drafts/adr/`) to **Adopted** (founder approval signal at session close); ADR-005 + ADR-006 + ADR-007 implementation status unchanged.
- Risk class: **Standard** under 0d-ii.
- Model selection per cache Element 6: N/A — no LLM call.
- AC1 + AC4 + AC5 + AC6 + AC7 + KG1 + KG2 + KG6 + PR1 + PR3 + PR4 + PR6: NOT engaged this session (governance only — same posture as M1-CP4b).
- AC8: ENGAGED at the architectural-thinking level (the ADR specifies how the translation-sandwich engine extends to multi-turn) but no code added under `/website/src/lib/translation-sandwich/`.
- PR5 watch-status: PRESERVED from M1-CP4c.

## Part B — Procedure

### Step 1 — Surface the load-bearing design decision to the founder

At session open, AI surfaces the three options for the multi-turn input flow shape:

- **Option A — Server-side ephemeral session.** Engine holds in-memory state between the clarifying question turn and the practitioner's reply. Implications: AC7 cookie or session-token surface engaged; Vercel serverless function memory does not persist across invocations, so state must be in Supabase or Redis (new external dependency); per-call cost increased by the storage round-trip; rollback complexity increased (state cleanup needed). Aligns most naturally with the engine's existing architectural shape (the engine is already the source of truth).
- **Option B — Client-renders-form stateless protocol.** Engine returns a Tier 1 force-clarification response shape (typed form spec: question text + slot variables + valid-value sets + opaque continuation token); the client (sagereasoning.com or external API consumer) renders the form, the practitioner fills it, the client re-submits with the original input + the answers. Implications: no AC7 surface engaged; no new external dependency; per-call cost unchanged; rollback is `git revert`; the response shape is a public API change (R10 announcement implications at cutover); the engine is stateless. Aligns with the existing single-request/single-response shape; extends rather than breaks the API contract.
- **Option C — Tier 1 deferred to a later milestone.** AC-13 Tier 2 + AC-14 Tier 3 ship at M1; Tier 1 is designed in this ADR but not built. M1-CP4e is then collapsed into M1-CP4f (no separate Critical-tier route session needed at M1). Implications: M1-CP6 cutover ships without Tier 1; the engine cannot force-clarify at cutover; the architectural commitment in `/adopted/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md` AC-13 is partially honoured (Tier 2 + Tier 3 only); founder accepts the deferral with explicit reasoning in the decision log.

AI states recommendation with reasoning. Founder selects (a / b / c) before drafting begins.

### Step 2 — Draft the ADR in `/drafts/adr/`

Path: `/drafts/adr/2026-05-06-multi-turn-input-flow-tier-1.md` (or equivalent ADR number — current series is ADR-007; this would be ADR-008).

Include the standard ADR sections per the existing `/adopted/adr/` precedents:

- **Status / Date / Stream / Decided by / Governing frame / Predecessor decision-log entries / Related deliverables / Engages**
- **Context** — what this ADR resolves; what it does not resolve; founder-confirmed decisions surfaced before drafting (Step 1 above).
- **Decision** — depending on Step 1's selection: (a) server-side ephemeral session architecture; (b) client-renders-form stateless protocol; (c) deferral with explicit reasoning. For (a) or (b): full per-trigger specification of the three Tier 1 triggers (ELEMENT_FUSION / SCOPE_AMBIGUITY / TEMPORAL_AMBIGUITY) including detection logic, force-clarification stem text, slot specifications, response shape, validator changes, harness changes. For (c): named conditions for revisiting at a future milestone.
- **Consequences** — positive / negative / risks named / what this ADR is not.
- **Approval** — founder approval signal moves draft from `/drafts/adr/` to `/adopted/adr/`.
- **Changelog** — initial Adoption entry dated 2026-05-06.

If Step 1 selected (a) or (b), the draft also names the companion ADR-005 + ADR-006 amendments needed for Tier 1 trigger fields. These amendments may be deferred to M1-CP4e (where they accompany the route + module + perimeter changes) or collapsed into this checkpoint depending on the founder's preference.

### Step 3 — Founder review + approval

Founder reads the draft. Three outcomes:

- **Approve as drafted** → move from `/drafts/adr/` to `/adopted/adr/`; advance status to Adopted.
- **Approve with edits** → AI applies edits in session; founder re-reads; approval as above.
- **Reject / defer** → draft remains in `/drafts/adr/`; decision-log entry records the deferral with revisit conditions per PR7.

### Step 4 — Append decision-log entry (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry".

ID suggestion: `D-M1-CP4d-MULTI-TURN-INPUT-FLOW-DESIGN-ADR-2026-MM-DD`. Cross-references: `D-M1-CP4c-LAYER-MODULES-AC14-TIER2-IMPLEMENTED-2026-05-06` + `D-M1-CP4b-AC14-TIER2-ADR-AMENDMENTS-2026-05-06` + the new ADR + the three-tier-intake reference deliverable + the parent scope decision.

### Step 5 — Session close (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". The next-session prompt names either:

- **M1-CP4e** (Critical-tier route updates for AC-13 Tier 1) — if Step 1 selected option (a) or (b) and Tier 1 is in scope; OR
- **M1-CP4f** (parallel-run.ts orchestrator + comparison-table baseline reset + per-layer cost capture + admin/test-reason fixtures) — if Step 1 selected option (c) and Tier 1 is deferred (M1-CP4e is collapsed into M1-CP4f or skipped per the founder's preference).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + reference deliverables read | 25-40 min |
| Step 1 — Surface load-bearing decision; founder selects | 15-30 min |
| Step 2 — Draft ADR in `/drafts/adr/` | 30-90 min (smaller for option c; larger for options a/b) |
| Step 3 — Founder review + approval | 15-45 min |
| Step 4 — Decision-log entry | 15-25 min |
| Step 5 — Session close + next-session prompt | 20-30 min |
| **Total (option c — deferral)** | **~1.5-2.5 hours** |
| **Total (option a or b — full design)** | **~2-3.5 hours** |

If option (a) or (b) requires substantial back-and-forth on architectural details (e.g., AC7 cookie surface implications under option a, or response-shape / continuation-token mechanics under option b), the session may benefit from being split: design discussion in this session; ADR drafting in a follow-up. The founder decides at session midpoint.

## Rollback path

`git revert` of this session's commit. The new ADR reverts to absent (or to its `/drafts/adr/` state if it didn't move). No production effect — documentation-only change. The decision-log entry remains in place per the append-only discipline.

## Forecast

If M1-CP4d lands clean with option (a) or (b): M1-CP4e is the next session — Critical-tier route updates for AC-13 Tier 1, including R20a perimeter handling for the new force-clarification path, and (under option a) AC7 cookie/session surface engagement. Critical Change Protocol applies. M1-CP4f follows after M1-CP4e.

If M1-CP4d lands clean with option (c) — Tier 1 deferred: M1-CP4e is collapsed into M1-CP4f or skipped entirely. M1-CP4f becomes the next session — Elevated-tier orchestrator + cost-capture + admin-fixture work. M1-CP6 cutover ships with Tier 2 + Tier 3 only; Tier 1 is documented but unbuilt at M1; revisit conditions named in the ADR.

If M1-CP4d surfaces architectural complexity that requires more than one session to design: the session pauses at Step 2 (or Step 3) with a clear handoff to M1-CP4d-followup. The architectural intent is preserved — Tier 1 is the most operationally complex of the three tiers; design care here pays compound interest at M1-CP4e and M1-CP6.

End of prompt.
