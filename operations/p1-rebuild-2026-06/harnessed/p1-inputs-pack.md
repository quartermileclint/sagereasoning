# P1 Inputs Pack — Rebuilt from Current Verified State (Leg B, harnessed)

**Produced:** 2026-06-11, P1-comparison leg B (harnessed run, Fable 5, baseline `a3db4c7`).
**Method:** every figure below carries its source; nothing is taken from summary blocks (PR18 discipline). Pre-pivot `/business` documents are referenced only as the superseded baseline — none of their projections carry forward.
**Replaces (proposed, P1 decision):** the eight `/business/*` files (March–April, pre-pivot; see findings memo F1–F2).

---

## 1. Product — what exists today

**Source:** `/operations/capability-inventory-2026-06-10.md` (S8a, per-line decision-log citations); `website/public/component-registry.json` v1.6.0.

- **Registry v1.6.0 (2026-06-10):** 214 components — **48 Live, 36 Verified, 124 Wired, 5 Designed, 1 Scaffolded** (queried from the registry JSON this session).
- **Human practitioner product (Live):** sign-in → nine tool surfaces (`/score`, `/score-document`, `/score-social`, `/scenarios`, `/journal`, `/premeditatio`, `/oikeiosis`, `/baseline`, mentor) on production; `/score` verified end-to-end at S8a on a real founder decision, value affirmed (n=1). Safety floor: R20a distress detection + audience-correct redirect, all four flags `true` since 2026-05-31.
- **Agent developer product (Live):** discovery (`llms.txt` v3.1, agent-card, OpenAPI) → per-install credential mint (`sr_inst_`, A10) → schema-validated substrate consultation (`/api/reason`, translation sandwich, Ed25519-signed Layer-2 assessments) → guardrail gate (`/api/guardrail`, `sr_live_`) → accreditation write (Sage Assent, `sr_assent_`) → revocation. Mint→use→revoke verified S5, re-verified S8a, **exercised again live in this run** (12 consults, telemetry in `leg-b-metrics.md`).
- **Architecture truth (load-bearing for the plan):** the human tools run the **original prose paths**; the deterministic substrate is Live on **`/api/reason` only** (PR1 single-endpoint proof). The founder elected the migration (staging item A8, status **Scoped** — `/adopted/substrate-plugin-staging-plan.md` line 45) as **pre-launch** work, parallel with the lawyer engagement (S8a adjudication). Until it completes, the two audiences buy **different engines under one brand** (findings memo F7).
- **Operations floor (Live):** OTel + masked call-grain audit (A12); cost-health detection with daily cron→Slack delivery (A13, S7b); SLO tracker (A14, provisional); abuse detection ×3 detectors, detection-only (A19); GDPR access/rectify/delete/export (S1); injection defence (A11b).
- **Built but inert (by decision):** Layer 3 standalone (out of launch scope, S7); R20b coaching; key-rotation overlap vars; **Stripe billing `not_configured`** (see §2 and recommendation R3).

## 2. Economics — adopted model + observed data

**Sources:** `/adopted/billing-model-design.md` (`D-BILLING-MODEL-LOCKED-2026-05-17`); production tables `loop_billing_events` (23 rows pre-this-run, queried 2026-06-11) and `translation_sandwich_comparisons` (61 rows, queried 2026-06-11); this run's live response headers.

**Adopted model (Option D, built and metering):** one loop = one wrapper invocation; **$0.02/loop base** + overage of 2× the Anthropic cost above a $0.01 trigger; R5's 2× revenue/cost floor holds **by construction** when overage fires. Headline: "two cents per task."

**Observed (May 17–22 ledger, verification traffic, n=23):**
- Surfaces: 20 `wrapper_internal`, 3 `api_reason`. Mean Anthropic cost **0.26¢/loop** (sum 6¢); billed total 50¢ (base 46¢ + overage 4¢); overage fired **2/23 (8.7%)**; realized revenue/cost on the window ≈ 8.3×.
- Telemetry gaps: `models_used` empty on 16/23 rows; token columns all zero (findings memo F4 caveats).

**Observed (this run, live `/api/reason` consults, n=10 metered, 2026-06-11):**
- Quick depth: 6–8¢ billed (Anthropic 3–4¢). Standard depth: 8–10¢ billed (Anthropic 4–5¢). **Overage fired on every metered consult** — at real consultation depths the realized price is exactly **2× Anthropic cost**, not the 2¢ headline (findings memo F4; recommendation R4 carries the re-tune).
- Latency: 13.8–18.4s per consult observed (Layer-2 deterministic step ≤2ms; the prose render dominates).

**Substrate vs prose-path economics (May 5–7 parallel-run table, n=61):** bundled prose path mean **42.5s**; sandwich layers L1 13.4s / L2 0.6ms / L3 14.6s; sandwich cost ≈ 2.06¢ (L1) + 1.61¢ (L3) per call at that period. The bundled path's **cost column was never populated (n=0)** — the double-LLM-vs-bundled cost comparison rec 3.2 asks for cannot be quantified from this table (findings memo F5). 25/61 early sandwich runs errored (pre-A7-cutover instability; current behaviour verified S8a — F6).

**Cost base (structurally unchanged from the pre-pivot doc, source `business/SageReasoning_BreakEven_Investment_Analysis.docx` §Investment Case):** upfront **$5,674** (ASIC $576 + name $98 + legal $3,500 + PI/cyber insurance $1,500); fixed **$279/month**. Caveat: legal estimate predates the actual 7-item Lawyer Review Queue; treat as floor, not quote. **None of the FPE items (incorporation, GST, insurance, coverage audit, ToS) are started** (review §3.7) — founder-actionable now.

**No revenue projections appear in this pack.** Observed unit economics above are facts; demand evidence is **zero external customers** to date. See recommendation R2 (evidence-gated investment case).

## 3. Market and context

**Sources:** review rec 3.2 (PR11 note); pre-pivot market research (context only); `/adopted/substrate-plugin-staging-plan.md`.

- **Two audiences, two contracts:** human practitioners (web product, prose paths today) and agent developers (substrate API contract). The agent side is the priced, metered funnel; the human side's billing is deliberately deferred (no subscription product exists in the adopted model — the pre-pivot Prokoptos subscription floor is void; F2).
- **Anthropic credit-pool change (June 15):** third-party agents sanctioned under $20–$200/month caps — mildly strengthens the agent-consumer thesis (agents have sanctioned budgets to spend) and adds a watch item on the founder's own Cowork/Claude Code costs under R5 (rec 3.2 PR11 note).
- **Competitor anchors** (pre-pivot research, directionally useful): guardrail calls ~$0.005 (Guardrails AI), enrichment ~$0.36, personality assessment ~$1.00. Option D's realized 6–10¢/consult sits above the guardrail anchor and far below the assessment anchor; positioning work belongs in the refreshed market sizing (R8).
- **Distribution surface:** plugin marketplaces (staging plan Stages 3–4, licensing gate between; ~48–77 build sessions estimated across all stages — most post-launch).

## 4. Scope and launch state

**Sources:** review §6 launch-criteria table; CLAUDE.md production-state block (as-of 2026-06-11, PR18 close-time artifact); `D-0H-MAIN-BLOCKER-VALUE-DEMONSTRATION-2026-06-10`.

- **0h HELD.** Main blocker: this comparison pair (leg A complete; **this leg B**; verdict memo next). Supporting blockers: founder post-deploy spot-check; brand/presentation W1–W4; `/api/score-conversation` distress-check wiring (Critical, pre-launch).
- **Launch criteria status:** criterion 2 (Stripe) **not met — decision needed** (R3); criterion 6 (business-plan review) is **this work's destination** (P1 runs on this pack if adopted).
- **Pre-launch work elected:** A8 substrate migration mapping + per-endpoint rollout (parallel with lawyer wall-clock); score-conversation perimeter wiring; npm vulnerability remediation before external exposure.

## 5. Risk and compliance

**Sources:** review §3.2, §3.4, §3.7; `/operations/tech-known-issues.md`.

- **EU AI Act Article 50 applies 2026-08-02** (~7.4 weeks from this pack's date) — the single most acute external deadline; lawyer engagement is the week's founder wall-clock item. APP 1.7 ADM wording due 10 Dec 2026.
- **Privacy/ToS wording is placeholder by design** pending the lawyer (honestly labelled in production).
- **Privacy-by-design posture is strong** (R17b encryption at intimate-data writes; genuine deletion verified; masked audit). Known gaps: single `MENTOR_ENCRYPTION_KEY` (no rotation), export-logic duplication — both logged, deferred.
- **Product-contract risks found by this run** (live evidence, this session): credential fragmentation (`sr_inst_` rejected by `/api/guardrail`); no cost/usage headers on the per-install path; **free-tier mint-defaults drift** — the admin mint route hard-codes 667/50/20, overriding the adopted 30/1/1 policy (proven by this session's live key row; findings memo F11–F12; recommendation R5).

---

*Pack ends. Companion documents: `findings-memo.md` (what changed and why it matters), `recommendations.md` (the P1 recommendation set). Consultation trail: `incorporation-log.md` + `raw/`.*
