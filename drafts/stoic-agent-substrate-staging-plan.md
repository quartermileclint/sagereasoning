# Stoic Agent Substrate — Staged Build Plan (v1 — options-form, SUPERSEDED)

**Status:** Superseded 2026-05-09 by `/drafts/stoic-agent-substrate-build-plan.md` (recommendation-only, session-shaped form requested by founder). Preserved here for the alternative-options framing it carries (v1 § 17 budget options A/B/C, full open-question catalogue) which the recommendation-only successor does not duplicate.
**Date:** 2026-05-09.
**Stream:** founder.
**Tier:** governance.
**Risk classification:** Standard under 0d-ii (drafts only; no production touch; no code).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-09-substrate-architecture-explore-close.md`.
**Predecessor next-session prompt:** `/operations/handoffs/founder/2026-05-09-substrate-build-staging-NEXT-SESSION-PROMPT.md`.
**Source materials:** the predecessor close, the five inbox files (`Layer A/B/C/D` + `sage-intuit.txt`), the founder's six original-question positions and seven open questions on record.

---

## 1. Executive summary

This document orders the work that gets the Stoic Agent Substrate from concept to a live, open-source, signed, credentialled offering.

**What is being staged:** the eight-cluster inventory (A–H) the predecessor session surfaced, expanded into eight build stages spanning Foundations through Public Engagement. Each item carries a description, importance rating, dependencies, session-count estimate, risk class, and stage assignment.

**What is out of scope for this plan:** code execution, ADR drafting other than the staging plan itself, licence selection, lawyer engagement, cryptographer engagement, and any decision the planning surfaces but does not pre-resolve. Items the founder has already declared (the open-source decision, three-mode foundational status, mode-separation as separate products, the unified-architecture finding) are taken as inputs, not revisited.

**What this plan does not do:** lock the build. Stages 1–3 are detailed enough to execute. Stages 4–5 are detailed enough to begin once Stage 3 is in flight. Stages 6–8 are described at lower resolution because the right depth depends on what Stages 1–5 reveal — they will be re-planned closer to execution.

**Estimated total session count:** 106–173 sessions across all eight stages, materially higher than the predecessor prompt's 30–60 forecast. The discrepancy is real and surfaced for founder attention. Three options for absorbing it are named in §17.

**Calendar estimate:** at four to eight sessions per month, the plan as written runs 13–43 months end-to-end. Phased v1-then-v2 deliverable scoping (described in §17) can compress v1 to 6–14 months.

---

## 2. Scope confirmation

**Founder positions taken as inputs (not re-debated):**

1. The three ideas (Layer-2-only product, Layer A–D wrapper, sage-intuit) are one architecture — the Stoic Agent Substrate.
2. Three-mode access (pure structured, hybrid, pure text) is foundational, not optional.
3. Configurable / evaluative / prescriptive / combo modes are separate products with shared infrastructure, not one configurable surface.
4. Layer 1 and Layer 3 are open-sourced. Layer 2 stays server-side authoritative.
5. The next session — this one — is dedicated to detailed planning only. No execution.

**P0 hold-point relationship:** P0 0h is active. Substrate planning happens in parallel with the hold-point assessment per the predecessor close. Substrate *execution* — Stage 1 onward — is gated on P0 0h exit AND on this plan being approved AND on whatever stage-gates the founder elects to insert.

**P1+ relationship:** the substrate work is a major thread that runs alongside the existing P1–P7 sequence in the project instructions. The plan does not replace P1–P7; it sits beside them. Where the substrate work intersects P1 (business plan review), P2 (R17/R19/R20 ethical safeguards), P3 (Agent Trust Layer), or P4 (Stripe + cost health), those intersections are flagged in the relevant stage.

---

## 3. Inventory pass — additions, removals, confirmations

The predecessor prompt listed 47 items across clusters A–H. I confirm 46 of them and propose four additions and one consolidation. Founder approves at review.

**Confirmed without change (43 items):** A1, A2, A3, A4, A5, A6, B1, B2, B3, B4, B5, B6, B7, B8, C1, C2, C3, C4, C5, C6, C7, D1, D2, D3, D4, D5, E1, E2, E3, E4, E5, E6, F1, F2, F3, F4, F5, F6, G1, G2, G3, G4, G5, G6, G7.

**Consolidated:** H2 (ADR for licensing) is folded into B1 (licensing decision) — the ADR is the artefact of the decision; treating them as separate items doubles the row without doubling the work.

**Proposed additions:**

- **A7 — Layer 2 metering and rate-limiting infrastructure.** Once Layer 1 is open-source and Layer 2 is the only cost-bearing surface, every authoritative call must be metered for billing and protected from abuse. Stage 1; depends on A1; Critical risk; 2–3 sessions. Rationale: surfaced by H5 (cost assessment) — without metering, the open-source shift defeats its own cost projection.
- **D6 — Wiki-as-translator-source for the open-source Layer 1 reference.** The wiki's patterns become the canonical documentation of what the open-source Layer 1 implements. Stage 4; depends on D2 and B3; Standard risk; 1–2 sessions. Rationale: closes the loop between wiki content and reference implementation; the predecessor inventory has D5 (wiki as test corpus) but not D6 (wiki as documentation source).
- **G8 — Substrate adoption playbook for AI-assisted-startup founders.** Echoes the P0 0h startup-preparation toolkit theme: a published guide for non-technical founders building agent products with AI collaborators on what running an authoritative-judgement service looks like operationally. Stage 7; lighter detail; 2–4 sessions. Rationale: the SageReasoning founder's own context positions this as an outsized-impact deliverable for an under-served audience.
- **H8 — Substrate–manifest reconciliation pass.** A formal review where the manifest (R0–R20 + AC1–AC8 + KG1–KG7 + PR1–PR9) is read end-to-end against the substrate architecture and amendments are batched. Stage 1 close-out; depends on H6; Elevated risk; 2–3 sessions. Rationale: avoids manifest drift across Stage 1's many Critical changes.

**Proposed removals:** none. Every item in the predecessor inventory earned its place.

**Total inventory after additions:** 50 items. The four additions are reflected in the stage detail below.

---

## 4. Importance criteria

The plan orders items by these criteria, in priority order. The defaults below match the predecessor prompt; deviations are flagged in the stage detail with reasoning.

1. **Items that block other work.** Anything in the critical path — its delay delays everything downstream.
2. **Items that preserve safety.** R20a perimeter handover (A5) is non-negotiable before any open-source publication; signing infrastructure (A2) is non-negotiable before any credential.
3. **Items that establish moat.** Server-side auth (A1), signing (A2), key management (A3), metering (A7) — without these the open-source decision drops the moat to zero.
4. **Items that unlock community work.** Open-source publication (B3, B4) and the wiki (D1–D6) let external contributors invest.
5. **Items that serve specific agent uses.** Action scorer (E1), verifier (E2), credential (F-cluster). Concrete agent functionality.
6. **Items that polish and extend.** Domain adapters, calibration tools, build-your-own assistant.

**Importance-rating scale used in this plan:**

- **Critical** — blocks the architecture's coherence or its safety. Stage 1 work is overwhelmingly Critical-importance.
- **High** — blocks subsequent stages OR is a load-bearing public artefact.
- **Medium** — important but not blocking; supports adoption rather than enabling it.
- **Lower** — polish or extend; valuable but deferrable.

(Note: importance rating is distinct from risk classification. An item can be Critical importance and Standard risk — H1 the substrate ADR is exactly that. Or Lower importance and Critical risk — none in this plan, but the categories are independent.)

---

## 5. Stage 1 — Foundations and blocking decisions

**Purpose:** land every decision and infrastructure piece that, if delayed, delays everything else. This stage produces the substrate's safety floor, its moat, its licence posture, its migration path, and its governance update. After Stage 1, the substrate is *defined*; before Stage 1, it is *described*.

**Items in this stage:**

| ID | Item | Importance | Risk | Sessions | Depends on |
|---|---|---|---|---|---|
| H1 | ADR — unified Stoic Agent Substrate concept | Critical | Standard | 1–2 | This plan approved |
| B1 | Licensing decision (+ ADR) | Critical | Standard | 2–3 | H1 |
| A6 | `/api/reason` and V3 endpoint family migration | Critical | Elevated | 2–3 | H1 |
| A5 | R20a perimeter handover | Critical | **Critical** | 2–3 | H1, A6 |
| A1 | Layer 2 server-side authentication | Critical | **Critical** | 3–5 | A5, A6 |
| A2 | Layer 2 signing | Critical | **Critical** | 3–5 | A1 |
| A3 | Key management | Critical | **Critical** | 2–4 | A2 |
| A7 | Layer 2 metering and rate-limiting *(new)* | Critical | **Critical** | 2–3 | A1 |
| A4 | Layer 2 input validation surface | High | Elevated | 2–3 | A1, C1 cross-stage |
| H5 | R5 cost-as-health-metric impact assessment | High | Standard | 1–2 | H1, H6 |
| H6 | Manifest amendments for the substrate | High | Elevated | 1–2 | H1, A5, A6 decisions made |
| H8 | Substrate–manifest reconciliation pass *(new)* | High | Elevated | 2–3 | H6 |

**Stage 1 estimated sessions:** 23–38.

**Risk profile:** dominated by Critical-tier work. Five of the twelve items (A5, A1, A2, A3, A7) are Critical risk and require the full Critical Change Protocol per 0c-ii on every change. Two are Elevated (A6, H6, H8). The rest are Standard.

**Success criteria for stage exit:**

- H1 ADR adopted in `/adopted/`; substrate concept canonically defined.
- B1 licence chosen, ADR adopted, lawyer review complete.
- A6 migration ADR adopted; V3 endpoint family disposition recorded.
- A5 R20a handover ADR adopted; perimeter posture recorded; Critical Change Protocol executed.
- A1, A2, A3, A7 wired and Verified on at least one pilot endpoint; key rotation rehearsal completed.
- A4 validation surface live with golden-path test suite.
- H5 updated cost projections in `/business/`.
- H6 manifest amendments adopted; cache updated per cache-update discipline (D-CACHE-DRIFT-... entry appended).
- H8 reconciliation pass complete; no orphaned manifest sections.

**External-engagement requirements:** lawyer review for B1 (licensing) and B6 (brand/trademark — Stage 3 but begin engagement here); optional cryptographer review for A2 and A3.

**Parallel-work opportunities within Stage 1:** H1 must land first. After H1, B1 and A6 can run in parallel. After A6, A5 (Critical Change Protocol) and B1 can both progress — though A5 is on the critical path and B1's calendar time is mostly external lawyer work. After A5, A1 begins; A2 follows A1; A3 and A7 run in parallel after A2. A4 runs in parallel with A3/A7 once A1 lands. H5, H6, H8 are mostly governance work and can interleave with the auth/signing work in any session that has spare capacity.

**Stage gate before Stage 2:** founder explicit approval, citing each success criterion.

---

## 6. Stage 2 — Input contract foundation

**Purpose:** publish the Layer1Schema as a real, machine-readable, documented public artefact. Every subsequent stage that touches the schema (Stages 3, 4, 5) depends on Stage 2 being stable.

**Items in this stage:**

| ID | Item | Importance | Risk | Sessions | Depends on |
|---|---|---|---|---|---|
| C1 | Layer1Schema as JSON Schema, OpenAPI, TypeScript types | Critical | Standard | 2–3 | H1, A6 |
| C2 | Schema documentation (full corpus) | Critical | Standard | 4–6 | C1 |
| H3 | ADR — three-mode access design | High | Standard | 1 | H1 |
| C3 | Three-mode access reference document | High | Standard | 1–2 | H3 |
| C5 | Validation-as-teaching error messages | Med-High | Standard | 2–3 | C1, C2 |
| C6 | Schema linter / draft-validation surface | Med-High | Standard | 1–2 | C1, C5 |

**Stage 2 estimated sessions:** 11–17.

**Risk profile:** entirely Standard. New modules and documentation; no auth/encryption/safety surface touched in this stage (those landed in Stage 1). The validation surface A4 from Stage 1 is the wired path; Stage 2 builds the published artefacts that feed it.

**Success criteria for stage exit:**

- C1 schemas in repo with version contracts; published to a public spec location (URL TBD; likely `schema.sagereasoning.com` or a GitHub Pages route).
- C2 documentation site live; coverage of every schema field with Greek term, primary-source citation, when-to-use, examples, counter-examples.
- H3 ADR adopted.
- C3 reference doc published.
- C5 error message catalogue published; integrated with A4 validation surface.
- C6 linter as library AND as endpoint.

**External-engagement requirements:** philosopher-of-Stoicism review of C2 (primary-source curation) is recommended but not required for stage exit; can be deferred to Stage 4 wiki work where the corpus material lives.

**Parallel-work opportunities:** C1 first; then C2, H3, C3, C5, C6 in parallel — these are mostly independent docs and schemas. C2 is the longest single item and benefits from being broken into per-mechanism passes.

**Stage gate before Stage 3:** founder explicit approval AND at least one external developer (Anthropic developer ecosystem or invited beta) successfully running C1+C5+C6 against a sample input. Without external validation, the schema is unproven.

---

## 7. Stage 3 — Open-source publication of Layer 1 and Layer 3

**Purpose:** the open-source decision becomes real. Layer 1 and Layer 3 ship as public, hardened, licensed code with day-one community governance. After Stage 3, anyone in the world can run the open SageReasoning translation layers and call our authoritative Layer 2 — the moat is the signed authoritative endpoint, not the algorithm.

**Items in this stage:**

| ID | Item | Importance | Risk | Sessions | Depends on |
|---|---|---|---|---|---|
| B2 | Repository structure | High | Standard | 1–2 | B1, H1, A6 |
| B3 | Reference Layer 1 implementation hardening | Critical | Elevated | 4–6 | B2, A5, A6 |
| B4 | Reference Layer 3 implementation hardening | Critical | Elevated | 3–5 | B2, A6 |
| B5 | Open-source R20a reference *(conditional on A5)* | Critical | **Critical** | 2–3 | A5 = "include", B3 |
| B6 | Brand and trademark posture | High | Elevated | 2–3 | B1 |
| B7 | Community governance day-one minimum | High | Standard | 2–3 | B2 |
| C4 | Developer guide with worked examples | High | Standard | 3–4 | C1, C2, B3 |
| C7 | Test fixtures and reference inputs | Med-High | Standard | 2–3 | C1, C2 |

**Stage 3 estimated sessions:** 19–29 (B5 included), 17–26 if A5 path makes B5 unnecessary.

**Risk profile:** mixed. B3 and B4 are Elevated because they extract and harden production-adjacent code. B5 is Critical (R20a perimeter, conditional). B6 involves trademark filings — Elevated and calendar-heavy. The rest are Standard.

**Success criteria for stage exit:**

- B2 repo structure ADR; repo created or restructured.
- B3 Layer 1 code published with documentation; external developer runs it locally without SageReasoning support.
- B4 Layer 3 code published; external developer composes Layer 1 → Layer 2 → Layer 3 end-to-end.
- B5 (if triggered) R20a reference visible and tested in open Layer 1.
- B6 brand posture document; trademark filings initiated.
- B7 `CONTRIBUTING.md`, `MAINTAINERS.md`, `CODE_OF_CONDUCT.md` in repo; first PR review policy documented.
- C4 guide published with 5–10 worked examples.
- C7 fixtures published; integrated with C6 linter.

**External-engagement requirements:** lawyer for B6 (trademark); lawyer review for licence-text-in-repo (B1's deliverable applied here); optional invited-beta of 3–5 external developers to validate B3/B4 by running locally.

**Parallel-work opportunities:** B2 first. Then B3 and B4 in parallel (different code paths). B5 begins once B3's R20a-bearing portion is staged. B6 and B7 run in parallel with B3/B4. C4 and C7 begin once C2 (Stage 2) is complete and B3 has produced the Layer 1 reference.

**Stage gate before Stage 4:** founder explicit approval; first external Pull Request received and either merged or rejected with documented reasoning (proves B7 governance functions).

---

## 8. Stage 4 — Translation pattern wiki

**Purpose:** the corpus of how text-in-the-world maps to Layer1Schema becomes a public, contributable, version-controlled artefact. The wiki is the substrate's epistemic infrastructure — agents and developers find patterns rather than rediscovering them. Without Stage 4, every adopter of Layer 1 reinvents the same mappings privately.

**Items in this stage:**

| ID | Item | Importance | Risk | Sessions | Depends on |
|---|---|---|---|---|---|
| D1 | Wiki structure and pattern format | High | Standard | 1–2 | B2 |
| D2 | Initial pattern corpus | High | Standard | 4–6 | D1, B3 |
| D3 | Wiki governance | Med-High | Standard | 1–2 | D1, B7 |
| D4 | Wiki ↔ code linkage | Medium | Standard | 2–3 | D2, B3 |
| D5 | Wiki as test corpus | Medium | Standard | 1–2 | D4 |
| D6 | Wiki as documentation source for B3 *(new)* | Medium | Standard | 1–2 | D2, B3 |

**Stage 4 estimated sessions:** 10–17.

**Risk profile:** entirely Standard. Wiki content + linkage; no live-system effect.

**Success criteria for stage exit:**

- D1 pattern format documented; first 10 patterns drafted in the format.
- D2 initial corpus of ~50–100 patterns published, drawn from existing Layer 1 implementation and primary sources.
- D3 wiki governance documented; first community contribution accepted.
- D4 every published pattern links to the extractor logic in B3 that implements it.
- D5 patterns serve as automated validation set for any translator implementation; CI runs them.
- D6 B3's documentation references the wiki rather than duplicating content.

**External-engagement requirements:** philosopher-of-Stoicism review of D2's corpus is high-value here; can be a single calendar engagement covering both this stage's corpus and Stage 2's C2 documentation.

**Parallel-work opportunities:** D1 first. D2 is the longest single item and benefits from per-mechanism breakdown — passion patterns, kathekonta patterns, indifferent patterns, oikeiosis patterns. D3, D4, D5, D6 run in parallel after D2 is partially populated.

**Stage gate before Stage 5:** founder explicit approval; at least three community contributions accepted into the wiki (proves D3 governance and the wiki's value as a contribution surface).

---

## 9. Stage 5 — Decision-path mechanisms (the substrate proper)

**Purpose:** the substrate starts being what it exists to be — the deterministic Stoic moral substrate addressable at every moment of the agent's causal sequence. Pre-decision (action scorer), at-decision (assent verification), post-decision (subagent handoff and concern-radius). This is the stage where developers can build agents whose decisions go through the Stoic causal sequence end-to-end.

**Items in this stage:**

| ID | Item | Importance | Risk | Sessions | Depends on |
|---|---|---|---|---|---|
| E1 | Action-scorer interface (sage-intuit) | High | **Critical** | 3–5 | A4, C1, A2 (signed score outputs) |
| E2 | Verification interface (Layer B alignment) | High | **Critical** | 3–4 | C1, A2 |
| E3 | Subagent handoff payload (Layer C) | High | **Critical** | 3–5 | A2, E1, E2 |
| E4 | Concern-radius credential (Layer D) | High | **Critical** | 2–4 | A2, A3, F1 cross-stage |
| E5 | Mode separation (evaluative / prescriptive / configurable / combo) | High | **Critical** | 4–6 | H3, C3, E1, E2 |
| E6 | Acceptance/rejection audit trail | Med-High | Elevated | 2–3 | E5 |

**Stage 5 estimated sessions:** 17–27.

**Risk profile:** dominated by Critical-tier work. Every E-cluster item touches the substrate's authoritative path and is Critical risk per AC7 and PR6. E6 is Elevated — it's the audit trail capture, not a safety surface.

**Success criteria for stage exit:**

- E1 action-scorer endpoint live; signed `kathekon_assessment` output verifiable.
- E2 verification endpoint live; alignment metric computable and signed.
- E3 subagent handoff payload format published; reference verifier for receiving agents.
- E4 concern-radius credential issued from at least one mode (evaluative or prescriptive); integration with F-cluster credential infrastructure designed but credential format choice (F1) is Stage 6.
- E5 four mode-separated endpoints live (or whichever subset the founder elects to ship in v1 — see §17 v1-scoping).
- E6 acceptance/rejection audit trail wired into combo mode; queryable by agent developers.

**External-engagement requirements:** cryptographer review of E1, E2, E3, E4 signing surfaces; security review of E5's mode-separation perimeter (each mode is its own attack surface).

**Parallel-work opportunities:** E1 and E2 can run in parallel after the Stage 1/2 dependencies are met. E3 builds on E1+E2. E4 begins when F1 lands (Stage 6) — note this is a cross-stage dependency; either E4 waits for Stage 6, OR Stage 5 ships without E4 and E4 lands in Stage 6 alongside the credential infrastructure (recommended). E5 and E6 are end-of-stage; E5 is the largest single item.

**Stage gate before Stage 6:** founder explicit approval; at least one external agent successfully running an end-to-end Stoic causal sequence (impression → examined judgement → action scoring → action → verification) against the substrate.

**Cross-stage observation:** E4 is more naturally part of Stage 6 (credentials) than Stage 5 (decision-path). The plan keeps it in Stage 5 to honour the predecessor inventory, but flags this as a candidate move during stage 5 detailed planning. If E4 moves to Stage 6, Stage 5's session count drops by 2–4.

---

## 10. Stage 6 — Credential infrastructure *(lighter detail)*

**Purpose:** the trust signal becomes portable. A signed substrate credential that captures concern-radius movement, that other systems can read, verify, and act on. Without Stage 6, the trust the substrate generates is only legible to systems that can read SageReasoning's own format.

**Items in this stage:** F1 credential format choice (with H4 ADR) — JWT minimal vs W3C Verifiable Credentials with selective disclosure vs progression. F2 credential issuance. F3 credential verification library. F4 living-trail mechanism. F5 revocation model. F6 cross-platform readability — engagement with MCP, A2A, and adjacent agent-protocol communities.

**Estimated sessions:** 15–25. Risk profile: predominantly Critical (F1, F2, F3, F4, F5 all touch signing/encryption surfaces). F6 is Elevated.

**Why lighter detail at this stage of planning:** the right credential format depends on what Stage 5's mode-separation work reveals about how credentials are actually consumed. Detailed Stage 6 planning happens at Stage 5 close, when the consumption pattern is known.

**Open question that surfaces here:** whether to ship a SageReasoning-only credential format in v1 and migrate to a standards-based format (W3C VC) in v2, or pay the standards-engagement cost up front. Founder decides at Stage 6 detailed planning.

**Stage gate before Stage 7:** founder explicit approval; at least one external system (an MCP-using agent, an A2A-using agent, or an Anthropic ecosystem consumer) verifying a substrate credential and acting on the verification.

---

## 11. Stage 7 — Ecosystem offerings *(lighter detail)*

**Purpose:** the substrate stops being a thing developers integrate against and starts being a thing developers compose with. SDKs, MCP server packaging, domain adapters, calibration tools, and the published artefacts that make adoption easy.

**Items in this stage:** G1 SDK design and language(s). G2 MCP server packaging. G3 domain-specific adapters — code review, customer service, content moderation, healthcare, others — with versioning policy and community-vs-in-house split. G4 build-your-own-translator assistant. G5 calibration tools (drift detection, self-classification feedback). G6 process narrative — published artefact of how the founder built Layer 1 with an AI collaborator. G7 examples-as-data — published dataset of (text, Layer1Schema) pairs for few-shot prompting and fine-tuning. G8 substrate adoption playbook for AI-assisted-startup founders *(new)*.

**Estimated sessions:** 17–29. Risk profile: mostly Standard-to-Elevated. G2 (MCP) and G3 (domain adapters in regulated domains) carry Elevated risk; the rest are Standard.

**Why lighter detail:** Stage 7 is highly elective. The founder's market posture and the v1 scoping decision (§17) determine which G-items ship and in what order. The plan reserves Stage 7 detailed planning for after Stage 5 close, when the substrate's actual adoption signal is known.

**Stage gate before Stage 8:** founder explicit approval; at least three external agent products built on the substrate using SDK or MCP packaging.

---

## 12. Stage 8 — Public engagement and standards formation *(lighter detail)*

**Purpose:** the substrate enters the broader agent ecosystem. Public announcement, standards-formation engagement, final manifest amendments, and any ADRs that didn't land earlier.

**Items in this stage:** B8 public announcement strategy — when, how, where. H7 standards-formation engagement plan — Anthropic developer ecosystem, MCP, A2A, philosophy communities, agent-protocol communities. Final manifest amendments and ADRs accumulated across the stages.

**Estimated sessions:** 5–10. Risk profile: Standard (governance and communications). The substantive work happens before Stage 8; this stage formalises and announces.

**Why lighter detail:** Stage 8 is mostly communications work whose right form depends on what the substrate actually is at that point. Detailed planning here would be premature.

**Stage exit:** the substrate is publicly engaged and the SageReasoning founder's vision — "principled reasoning accessible to every rational agent" — has visible community presence.

---

## 13. Dependency map

The full dependency graph at item level. Read top-to-bottom; an item cannot start until all its predecessors are complete.

```
[This plan approved]
        ↓
       H1 (substrate ADR)
        ↓
    ┌───┴───┐
    ↓       ↓
   B1      A6
   ↓        ↓
  H2*     [V3 disposition]
           ↓
          A5 (R20a handover)
           ↓
          A1 (auth)
           ↓
          A2 (signing)
        ┌──┼──┐
        ↓  ↓  ↓
       A3  A7  A4 ← C1 (cross-stage)
        ↓
   ┌────┼────┐
   ↓    ↓    ↓
   H5   H6   H8
        ↓
     [Stage 1 exit]
        ↓
     ┌──┴──┐
     ↓     ↓
    C1    H3
     ↓     ↓
    C2    C3
     ↓
   ┌─┴─┐
   ↓   ↓
   C5  C6
        ↓
     [Stage 2 exit]
        ↓
       B2
   ┌────┼────┐
   ↓    ↓    ↓
   B3   B4   B7
   ↓    ↓
   B5*  B6 (parallel)
   ↓
   C4 ← C2
   C7 ← C2
        ↓
     [Stage 3 exit]
        ↓
       D1
        ↓
       D2 ← B3
   ┌────┼────┐
   ↓    ↓    ↓
   D3   D4   D6
        ↓
       D5
        ↓
     [Stage 4 exit]
        ↓
   ┌────┼────┐
   ↓    ↓    ↓
   E1   E2   (E4 → Stage 6)
   ↓    ↓
   E3 ← E1+E2
        ↓
       E5 ← H3, C3, E1, E2
        ↓
       E6
        ↓
     [Stage 5 exit]
        ↓
       F1 (+ H4)
        ↓
       F2
   ┌────┼────┐
   ↓    ↓    ↓
   F3   F4   F5
        ↓
       F6
        ↓
     [Stage 6 exit]
        ↓
   [Stage 7: G1–G8 in elective order]
        ↓
   [Stage 8: B8, H7, final amendments]
```

`*` = conditional. H2 folded into B1. B5 conditional on A5 path.

---

## 14. Critical path

The longest dependency chain — the items whose delay delays the whole plan:

**H1 → A6 → A5 → A1 → A2 → C1 → C2 → B2 → B3 → D2 → E1 → E5 → F1 → F2 → public release.**

Sessions on the critical path: ~32–48 of the total 106–173. Roughly 30% of total work is on the critical path; the rest is parallelisable.

**Items NOT on the critical path** (can run in calendar parallel without delaying release):

- B1 (licensing) — calendar-bound by lawyer, not by sessions
- A3, A7 (key management, metering) — Stage 1 parallel after A2
- A4 — Stage 1 parallel after A1 + C1
- H5, H6, H8 — Stage 1 governance work
- H3, C3, C5, C6 — Stage 2 parallel after C1
- B4, B6, B7, C4, C7 — Stage 3 parallel
- D1, D3, D4, D5, D6 — Stage 4 parallel
- E2, E3, E4, E6 — Stage 5 parallel after E1
- F3, F4, F5, F6 — Stage 6 parallel after F1+F2
- All of Stage 7 (elective order)
- All of Stage 8 except final-amendments dependency on prior stages

---

## 15. Parallel-work opportunities

**External-engagement parallelism.** Lawyer review (B1, B6) and cryptographer review (A2, A3, F-cluster) and philosopher review (C2, D2) all happen on calendar time, not session time. Engaging them in Stage 1 buys parallel calendar progress for Stages 2–4 work. Recommended: schedule lawyer engagement at Stage 1 open; schedule cryptographer engagement at Stage 1 mid-point; schedule philosopher engagement at Stage 2 open.

**Within-stage parallelism.** Identified per stage above. The largest opportunity is in Stage 1 (where A3, A4, A7, H5, H6, H8 can interleave) and Stage 3 (where B3, B4, B6, B7, C4, C7 can run in parallel with each other).

**Cross-stage parallelism.** Once Stage 2 is in flight, Stage 3 preparation work (B2, B7) can begin without waiting for Stage 2 exit. Once Stage 3 is in flight, Stage 4 wiki structure (D1) can begin. The plan's stage-gate discipline says no Stage N+1 *exit* until Stage N exits, but Stage N+1 *preparation* can begin earlier.

---

## 16. Open questions surfaced during planning

These are decisions the planning surfaced that need founder input before the relevant stage begins.

**Stage 1 open questions:**

1. **Which licence?** Permissive (MIT/Apache), copyleft (AGPL), custom (Layer-2-API requirement), or dual-licence. Affects everything downstream. Needs lawyer review. *Position to take at Stage 1 open.*

2. **R20a perimeter handover path?** Replicate in open Layer 1, enforce server-side at Layer 2 as precondition, or combination. Affects whether B5 ships and how. *Position to take at Stage 1 mid-point.*

3. **`/api/reason` and V3 endpoint family disposition?** Coexist, deprecate, or rewire. Affects how much of B3/B4 is "extract from existing code" vs "write fresh". *Position to take at Stage 1 open.*

4. **External-engagement budget?** Lawyer time and cryptographer time are real costs. R5 cost cap implications. *Position to take at Stage 1 open.*

**Stage 2 open questions:**

5. **Schema versioning policy?** Semver, date-based, or stages-based. Affects how breaking changes are communicated. *Position to take at Stage 2 open.*

6. **Documentation hosting?** Own subdomain (`schema.sagereasoning.com`), GitHub Pages, ReadTheDocs, or third-party. Affects R5 cost and brand posture. *Position to take at Stage 2 open.*

**Stage 3 open questions:**

7. **Repo structure: monorepo or multi-repo?** Affects B7 governance model, B8 announcement, and contributor experience. *Position to take at Stage 3 open.*

8. **Trademark scope?** Only "SageReasoning"? Also "Stoic Agent Substrate"? Also "Layer 2 Authoritative"? Affects B6 budget and brand defence. *Position to take at Stage 3 mid-point.*

9. **Beta cohort?** Closed invitation to selected developers vs public-from-day-one. Affects B7 governance load and Stage 3 stage-gate. *Position to take at Stage 3 open.*

**Stage 4 open questions:**

10. **Wiki technology?** GitHub wiki, custom static site, MediaWiki, or third-party. *Position to take at Stage 4 open.*

11. **Wiki contribution model?** Pull request only, web-form submission, both. Affects D3 governance. *Position to take at Stage 4 open.*

**Stage 5 open questions:**

12. **Mode separation v1 scope?** Ship all four modes (evaluative, prescriptive, configurable, combo) or a subset? See §17 v1-scoping. *Position to take at Stage 5 open.*

13. **E4 — keep in Stage 5 or move to Stage 6?** See §9 cross-stage observation. *Position to take at Stage 5 detailed planning.*

**Stage 6 open questions:**

14. **Credential format: SageReasoning-only v1 → standards v2, or standards from v1?** See §10. *Position to take at Stage 6 detailed planning.*

15. **Revocation model?** Active revocation list, time-bounded credentials with reissuance, or a combination. Affects F4 (living trail) and F5 (revocation). *Position to take at Stage 6 detailed planning.*

**Stage 7 open questions:**

16. **First SDK language?** TypeScript (likely), Python (high agent-developer overlap), Rust (performance), or two of those. *Position to take at Stage 7 detailed planning.*

17. **Domain adapter priority?** Which 2–3 domains ship first. Affects G3 budget and audience. *Position to take at Stage 7 detailed planning.*

**Stage 8 open questions:**

18. **Announcement venue priority?** Anthropic developer ecosystem, MCP community, A2A community, philosophy communities, or simultaneous. *Position to take at Stage 8 open.*

19. **Standards-formation depth?** Engage as a participant, propose new standards, or remain consumer-of-standards. Affects calendar load by orders of magnitude. *Position to take at Stage 8 detailed planning.*

**Cross-cutting open questions (revisit at any stage gate):**

20. **Stage-gate strictness?** Strict (no Stage N+1 work begins until Stage N exits) or loose (preparation work for Stage N+1 begins inside Stage N). The plan as written is loose; founder may strict-it.

21. **Per-stage approval threshold?** Verbal approval, written decision-log entry, or an external review milestone. Plan as written defaults to written decision-log entry per success criteria; founder may strengthen or weaken.

22. **Total session budget?** The 106–173 estimate is honest. Founder may cap, in which case §17 v1-scoping becomes mandatory.

---

## 17. Recommended first three stages — and total-budget options

### Recommended first three stages

Per the prompt's request, the first three stages with reasoning:

**Stage 1 — Foundations and blocking decisions** (estimated 23–38 sessions). Reasoning: every other stage depends on Stage 1's decisions and infrastructure. Skipping Stage 1 or partially completing it is the failure mode that leads to Session-7b-style multi-session recoveries (see PR1 + AC7). Stage 1 honesty is the discipline that makes the rest of the plan possible.

**Stage 2 — Input contract foundation** (estimated 11–17 sessions). Reasoning: the schema is the substrate's public face. Until C1 and C2 are stable, every subsequent stage carries schema-instability risk. Stage 2 is short and almost entirely Standard risk — it's the cleanest stage in the plan.

**Stage 3 — Open-source publication of Layer 1 and Layer 3** (estimated 17–29 sessions). Reasoning: the open-source decision was declarative; Stage 3 makes it real. Until Stage 3 exits, the substrate exists internally but not externally. This is the stage where the project's public posture is established.

### Total-budget options

The plan as written estimates 106–173 sessions across all eight stages. Three options for absorbing this:

**Option A — Plan as written.** All eight stages execute. v1 ships with full mode separation, full credential infrastructure, full ecosystem offerings. Calendar: 13–43 months. Suitable if external funding lengthens the runway and the founder values comprehensive v1 over speed.

**Option B — v1-scoping (recommended).** Define a minimum viable substrate that ships earlier; defer non-essentials to v2. Concrete suggestion:

- **v1 = Stages 1, 2, 3, 4 + selective Stage 5 (E1, E2, E5 evaluative mode only)** = ~70–105 sessions = ~9–26 months.
- **v2 = Stage 5 remainder (E3, E4, E5 other modes, E6) + Stage 6 + Stage 7 + Stage 8** = remainder.

This delivers a publicly running open-source substrate with authoritative Layer 2 and one mode of decision-path support in 9–26 months, with credentials and ecosystem following.

**Option C — research-first scoping.** Stages 1–2 ship; Stages 3+ are deferred until v1 evidence is gathered. Calendar to v1: 4–8 months. Suitable if the open-source decision warrants more validation before publication.

**My recommendation: Option B.** v1-scoping is the discipline that matches the project's R&D-phase posture (P0 0h) and gives the substrate concrete external evidence within a year. Founder decides.

---

## 18. Total estimated session count (with calendar)

| Stage | Sessions (low) | Sessions (high) | Months @4/mo (low) | Months @8/mo (high) |
|---|---|---|---|---|
| 1 — Foundations | 23 | 38 | 5.8 | 4.8 |
| 2 — Input contract | 11 | 17 | 2.8 | 2.1 |
| 3 — OS publication | 17 | 29 | 4.3 | 3.6 |
| 4 — Wiki | 10 | 17 | 2.5 | 2.1 |
| 5 — Decision-path | 17 | 27 | 4.3 | 3.4 |
| 6 — Credentials | 15 | 25 | 3.8 | 3.1 |
| 7 — Ecosystem | 17 | 29 | 4.3 | 3.6 |
| 8 — Public engagement | 5 | 10 | 1.3 | 1.3 |
| **Total** | **115** | **192** | **29 mo** | **24 mo** |

(Note: the row totals above use the wider session-count ranges including the new items A7, D6, G8, H8. The original §1 estimate of 106–173 used pre-additions ranges; this table is the authoritative range after additions.)

Calendar arithmetic: at four sessions per month and the low-end estimate, the plan runs ~29 months end-to-end. At eight sessions per month and the high-end estimate, the plan runs ~24 months. The high-end is shorter despite more work because the per-month rate is higher.

These numbers are honest but conservative. They assume:
- Founder is the sole executor with AI collaboration, no engineering team
- External engagements (lawyer, cryptographer, philosopher) run on calendar parallel
- Stage gates are honoured (no shortcuts)
- v1 scoping is NOT applied (Option B compresses by ~35–45%)

If v1 scoping (Option B) is adopted, v1 timeline is 9–26 months and v2 follows.

---

## 19. Next step after plan approval

If founder approves the plan as written:

1. Move this document from `/drafts/` to `/adopted/` (Elevated risk per cache; archive entry).
2. Append `D-SUBSTRATE-STAGING-PLAN-ADOPTED-YYYY-MM-DD` to the decision log.
3. Update the standing protocol cache to reference the staging plan as a substrate-work governing document.
4. Open the next session as Stage 1 Step 1: drafting H1 (the substrate ADR).

If founder requests revisions:

1. Document the revisions as comments or edits to this draft.
2. Re-draft as needed.
3. Re-submit for review.

If founder rejects the plan:

1. Document the rejection reason in the decision log.
2. Return to design exploration in the next session.
3. The substrate work itself is not rejected — the plan's *form* is. The founder's open-source declaration and unified-architecture finding remain on record.

---

*End of staging plan. This document is a draft. No code touched; no production change; no manifest amendment; nothing in `/adopted/` modified. Founder reviews, edits, requests changes, or approves before any execution begins.*
