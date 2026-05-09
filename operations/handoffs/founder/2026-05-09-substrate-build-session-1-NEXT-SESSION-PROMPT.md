# Next-Session Prompt — Build Session 1 (Phase B): Foundational ADRs

**Stream:** founder.
**Tier:** governance.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverable-of-the-day is the build plan + the five ADRs).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-09-substrate-build-plan-v1.2-approval-close.md`.
**Predecessor decision-log entries:** `D-SUBSTRATE-BUILD-PLAN-ADOPTED-2026-05-09` (build plan adopted as v1.2; all ten §4 decisions locked).
**Risk classification:** Standard under 0d-ii. Critical Change Protocol NOT engaged. No live-system touch.

> **Note on this prompt's history:** the prior version of this file framed the session as Phase A (plan approval) → Phase B (drafting six foundational ADRs). Phase A was completed in the predecessor session and the build plan was revised v1.0 → v1.1 → v1.2 with §4.4 (B1 licensing) deferred to Session 17.5. This prompt is the v1.2 form — Phase A is removed; Phase B now drafts five ADRs (H1, A6, A5, H3, H5; B1 deferred). The prior content is preserved in git history.

## Why this session matters

This session takes the substrate work from "planned" to "started". Phase A (plan approval) was completed in the predecessor session: the build plan is adopted as v1.2; all ten §4 decisions are locked; B1 licensing is deferred to Session 17.5. **This session is Phase B only — drafting the five foundational ADRs that govern the substrate build from Session 3 onwards.**

The session is AI-led, packed to ~90% capacity, with no founder mid-session touch points. The five ADRs are drafted sequentially in one pass.

## Pre-conditions

1. **Standing protocol cache opened** — read at session open per the cache's standing answers (~3 min).
2. **Predecessor close re-read** — `/operations/handoffs/founder/2026-05-09-substrate-build-plan-v1.2-approval-close.md` (~5 min).
3. **Build plan v1.2 referenced** — `/drafts/stoic-agent-substrate-build-plan.md` (founder has already read end-to-end; AI references during ADR drafting).
4. **Decision-log last 2 entries scanned** — `/operations/decision-log.md` (most recent: `D-SUBSTRATE-BUILD-PLAN-ADOPTED-2026-05-09`).
5. **B1 licensing ADR is not in scope this session.** Deferred to Session 17.5 per v1.2 §4.4. Do not draft it. Do not reference it as a current task.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, risk class, signals)
2. `/operations/handoffs/founder/2026-05-09-substrate-build-plan-v1.2-approval-close.md` (~5 min)
3. `/drafts/stoic-agent-substrate-build-plan.md` — re-reference §5 Stream A Session 1 for the ADR list and §3 / §4 for cross-references during drafting
4. `/operations/decision-log.md` last 2 entries — particularly `D-SUBSTRATE-BUILD-PLAN-ADOPTED-2026-05-09`

Confirm at open: tier (governance, Standard); hold-point status (P0 0h still active); model selection (N/A — no LLM calls; documentation drafting only); status vocabulary (implementation: Scoped → Designed → … ; decision: Adopted / Under review / Superseded); signals + risk classification (Standard; Critical NOT engaged).

## Part B — Procedure

Drafts the five ADRs sequentially in `/drafts/adr/`. Each ADR is one section below; the AI drafts them in order, packing to ~90% context capacity. Incomplete ADRs roll to Build Session 2.

### ADR 1 — H1 Substrate Concept

**File:** `/drafts/adr/H1-substrate-concept.md`.

**Content:**

- Title; status (Drafted, under review); date; stream.
- Context: the predecessor architecture-exploration session's three-ideas-are-one-architecture finding. References to the explore-close at `/operations/handoffs/founder/2026-05-09-substrate-architecture-explore-close.md` and the five inbox files.
- Decision: the substrate is a single architecture — Layer 1 (open translation in), Layer 2 (authoritative deterministic judgement, server-side, signed), Layer 3 (open translation out) — addressable at every Stoic causal-sequence moment (phantasia, synkatathesis, hormē, praxis).
- Consequences: open-source posture for Layers 1 and 3 (private through Session 17 per v1.2 private-build-phase model); signed authoritative API for Layer 2; substrate as the canonical name; mode separation as separate products with shared infrastructure.
- Alternatives considered: parallel work streams (rejected — predecessor session showed the three ideas converge); single-product configurable surface (rejected — founder's position).
- Cross-references: explore-close; build plan §1, §3.

### ADR 2 — A6 V3 Endpoint Family Migration

**File:** `/drafts/adr/A6-v3-migration.md`.

**Content (per founder's §4.5 position — approve as written):**

- Six-month coexist then deprecate `/api/reason` and the V3 endpoint family in favour of the substrate. Coexistence: both endpoints live; substrate carries the new schema; `/api/reason` re-implemented internally as a substrate consumer. Deprecation announcement at v2.
- Migration steps for sagereasoning.com consumers: documented per surface (the eight R20a perimeter routes named in AC5 and the V3 endpoint family).
- Rollback: revert each migration step independently; substrate and existing endpoints designed to coexist throughout the window.
- Alternatives considered: immediate cutover; permanent coexistence.
- Cross-references: H1 ADR; consumer-workflow-audit (`/drafts/rag-mentor-alt3/consumer-workflow-audit.md`); build plan §4.5.

### ADR 3 — A5 R20a Perimeter Handover

**File:** `/drafts/adr/A5-r20a-handover.md`.

**Content (per founder's §4.6 position — approve as written, belt-and-braces):**

- R20a distress detection replicated in open Layer 1 (B5 ships) AND enforced server-side at Layer 2 as a precondition for every authoritative call. Forks of Layer 1 that remove R20a are disqualified from the SageReasoning brand under B6.
- Implementation steps: Layer 2 server-side enforcement designed in this ADR; B5 reference design referenced (full B5 ADR comes in Stream C / Build Session 11).
- Risk classification: this ADR is Standard (governance). The execution sessions (Session 10 server-side enforcement, Session 16 open-source reference) are Critical per AC5 + PR6.
- Alternatives considered: server-side-only; open-Layer-1-only.
- Cross-references: H1 ADR; manifest AC5; PR6; build plan §4.6.

### ADR 4 — H3 Three-Mode Access

**File:** `/drafts/adr/H3-three-mode-access.md`.

**Content:**

- The input contract supports three modes — Mode 1 (pure structured: agent submits Layer1Schema directly), Mode 2 (hybrid: agent submits hints, Layer 1 extracts), Mode 3 (pure text: current `/api/reason` path, full Layer 1 extraction).
- Modes form a developmental sequence for agent Stoic literacy. The mode an agent uses is itself a trust signal (Mode 1 = highest demonstrated literacy).
- Each mode has its own contract documented in C3 reference (drafted Build Session 4).
- Alternatives considered: single-mode (rejected — barrier to entry); two-mode without hybrid (rejected — no developmental path).
- Cross-references: H1 ADR; predecessor explore-close decision 2; build plan §3.

### ADR 5 — H5 Cost Impact Preliminary Update

**File:** `/business/substrate-cost-impact-preliminary.md` (note: lives under `/business/`, not `/drafts/adr/`, because it's an analysis document, not an ADR).

**Content:**

- Existing R5 cost-as-health-metric projections re-stated (current state).
- Substrate impact: Layer 1 and Layer 3 compute shifts off SageReasoning infrastructure (open-source; runs in adopters' environments). Layer 2 compute remains on SageReasoning infrastructure.
- New cost surface: Layer 2 metering (A7) handles per-call billing infrastructure; cost-to-serve per Layer 2 call depends on authentication, signing, and assessment compute.
- Preliminary projection: cost-to-serve per Layer 2 call estimated at $X (placeholder; refined at Build Session 8 when A7 is wired and observed costs are real).
- Revenue model implication: per-call billing for Layer 2 is the v1 model; v2 may add subscription tiers per F1 credential infrastructure.
- Cross-references: existing break-even analysis in `/business/`; build plan §3 v1 scope.

### Phase B close-out (~30 min)

When the five ADRs are drafted (or as many as fit in the session's remaining capacity — incomplete ADRs roll to Build Session 2):

1. **Append `D-SUBSTRATE-BUILD-SESSION-1-COMPLETE-YYYY-MM-DD` to the decision log** (lean form per cache). Captures: which ADRs were drafted; status of each (all `Drafted — under review`); reference to the build plan; risk class (Standard); rollback path (revert files in `/drafts/adr/` and `/business/`).
2. **Update implementation status** in any tracking deliverable that exists for the substrate: H1 / A6 / A5 / H3 / H5 move from Scoped → Designed.
3. **Write Build Session 2's next-session prompt** at `/operations/handoffs/founder/YYYY-MM-DD-substrate-build-session-2-NEXT-SESSION-PROMPT.md`. Build Session 2 drafts the remaining ADRs per build plan §5: B2 repo structure, A1+A2+A3+A7 unified Critical infrastructure, A4 input validation, H6 manifest amendments draft. Pre-conditions named.
4. **Write this session's close** at `/operations/handoffs/founder/YYYY-MM-DD-substrate-build-session-1-close.md` per the lean session-close template in the cache.
5. **Founder verification commands** included in the close: paths of the drafted files; commit command; expected GitHub Desktop view.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + build plan re-reference | 10–15 min |
| H1 ADR draft | 30–40 min |
| A6 ADR draft | 30–40 min |
| A5 ADR draft | 30–40 min |
| H3 ADR draft | 25–30 min |
| H5 cost analysis | 25–35 min |
| Decision-log + close + Build Session 2 prompt | 30–40 min |
| **Total** | **~3.5–5 hours** |

The session runs to ~90% context capacity per the operational model. If capacity is reached before all five ADRs are drafted, the session closes at a stable state with whichever are complete; the rest roll to Build Session 2's pre-conditions.

## Rollback path

All drafts in `/drafts/adr/` and `/business/`. Decision-log entry appended to active log. Revert via `git revert` of the commits or `rm` of the new files. No production touch; no `/adopted/` change in this session.

## Forecast

**Most-likely path:** all five ADRs drafted in one session. Build Session 2 opens with H1, A6, A5, H3, H5 drafted and ready for founder review; Build Session 2 drafts the remaining ADRs (B2, A1+A2+A3+A7 unified, A4, H6 manifest amendments).

**Alternative paths:**
- **Capacity exhausted before five complete.** Most likely 3–4 ADRs drafted; remaining 1–2 roll to Build Session 2. The close documents which rolled and updates Build Session 2's pre-conditions.
- **An ADR surfaces a question that requires founder input mid-draft.** "I need your input" signal raised; the close documents the open question and the next session opens with founder direction at the top.

End of prompt.
