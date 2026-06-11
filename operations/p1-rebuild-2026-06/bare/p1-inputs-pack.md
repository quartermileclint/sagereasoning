# P1 Business-Plan Review — Refreshed Inputs Pack (Leg A, bare run)

**Produced:** 2026-06-11, P1-comparison leg A (bare). **Baseline commit:** `a3db4c7` (`main`, post-S8b push).
**Method:** every figure below is cited to a decision-log entry, an adopted design document, a verified session close, or a read-only production-database query performed this session. Nothing is carried from the pre-pivot `/business` pack except where explicitly marked "pre-pivot figure, unvalidated." Per PR18 discipline, state claims carry their as-of dates.
**Replaces (for P1 purposes):** the seven pre-pivot `/business` documents (Mar–Apr 2026) and the superseded Tasks 4+5 of `business/STATUS-REVENUE-MODEL.md`. The companion findings memo (`findings-memo.md`) records what changed and why it matters; the recommendation set (`recommendations.md`) carries the P1 judgement items.

---

## 1. What the product is (as of 2026-06-11)

**SageReasoning is a Character Kernel** — a Stoic reasoning substrate offering philosophical companionship to two audiences from one backend:

- **Human practitioners** use free tools at `www.sagereasoning.com` (`/score`, `/score-document`, `/score-social`, `/scenarios`, `/journal`, `/premeditatio`, `/oikeiosis`, `/baseline`, mentor surfaces).
- **Agent developers** call the reasoning substrate (`POST /api/reason`) under per-install credentials (`sr_inst_`), with audience-correct safety behaviour and a documented public contract (llms.txt v3.1; agent-card with `safety-redirect/v1`).

The substrate is a **translation sandwich**: Layer 1 (text → structured features, planned open-source), Layer 2 (deterministic mechanism evaluation, zero LLM cost, closed), Layer 3 (prose generation, closed). The category label "Character Kernel" is adopted (J1 ADR, 2026-05-12) and sits in an emerging peer cluster — ANCHOR (Cognitive Middleware), AEGIS (constitutional reasoning layers), VIGIL (runtime governance kernels), distinct from guardrail-only validators (Guardrails AI, Patronus, Lakera) and memory-only continuity layers (MemGPT/Letta). It is explicitly **not** therapy and not an employment evaluator (R1/R2), and the public materials say so.

**Architecture truth (S8a/S8b verified):** the human tools still run the original prose paths; the deterministic substrate is Live on `/api/reason` only. The founder-elected migration of human tools to the substrate (A8 vehicle + per-endpoint rollout, coupled with the W3/W4 presentation work) is **pre-launch scope, in progress conceptually, not started in code** — it blocks launch, not the lawyer engagement.

## 2. Verified product state (registry v1.6.0 + S8a/S8b evidence)

| Dimension | State | Evidence |
|---|---|---|
| Component registry | **v1.6.0, 214 components: 48 Live, 36 Verified, 124 Wired, 5 Designed, 1 Scaffolded** — every Wired+ claim evidence-cited | `D-REGISTRY-UPDATE-v1.6.0` (2026-06-10); re-counted from the JSON this session |
| Human e2e | Real founder decision through `/score` on production: all 4 stages + R3 disclaimer + reflection, ~36 s; founder: "very good and detailed and provided guidance to decision making" | S8a close (n=1 — the founder) |
| Agent e2e | `sr_inst_` mint → authenticated `/api/reason` (200, assessment payload, 13.1 s) → revoke → 401 | S8a close |
| Safety floor | All four R20a flags Live since 2026-05-31; both audience branches production-verified (S6); Haiku classifier leg 6/6 Zone-2 domains engaged, 0/6 wrongly redirected (S8a) | S6/S8a closes + audit file |
| Security/abuse | A10 per-install auth Live (S5); A11b injection defence Live (S4); A19 abuse detection Live (3 detectors, detection-only); 75/75 tables RLS-enabled | S4/S5 closes; 2026-06-10 review §3.1 |
| Privacy/GDPR | AES-256-GCM at intimate-data write paths; access/rectify/delete/export Live | S1 close; review §3.4 |
| Observability | OTel + call-grain audit Live; A13 cost-health detection + daily Slack delivery Live (S7b); A14 SLO tracker Live (provisional) | S7b close |
| Billing mechanism | Option D per-loop metering **implemented and emitting** (23 `loop_billing_events` rows from verification traffic); **Stripe `not_configured` by decision** | review §3.8; DB query this session |
| Inert by decision | Layer 3 standalone (out of launch scope); R20b independence coaching; Layer-2 rotation overlap vars | S6/S7 closes |
| External traffic | **Zero.** Founder is the only human user; no agent traffic | review §1 |

## 3. Economics — the locked billing model (replaces all pre-pivot pricing)

**Adopted:** `D-BILLING-MODEL-LOCKED-2026-05-17`; built and emitting since ~2026-05-17 (first `loop_billing_events` rows). The per-call competitor-anchored model (29 skills, $0.0025–$0.50/call) is **retired**.

| Element | Value |
|---|---|
| Unit | **1 loop = 1 wrapper invocation** (regardless of internal call count); `X-Loop-Id` correlation |
| Base rate | **$0.02/loop**, uniform across surfaces ("two cents per task") |
| Overage | Fires when a loop's Anthropic cost > 50% of base ($0.01); excess billed at ×2 — **R5's 2× revenue:cost floor holds on every loop by construction** |
| Free tier | 30 loops/month (≈1/day), rate-limited |
| Visibility | Six `X-Loop-*` response headers per call (cost meter visible in real time) + Stripe month-end invoices |
| Stripe | `not_configured` in production; activation deliberately deferred (launch-criterion tension → P1 decision, see recommendations item 2) |

**Observed cost data (all verification traffic — n is tiny, no external load):**

- `loop_billing_events` (23 rows, 2026-05-17 → 05-22, read this session): Anthropic cost 0–2¢/loop; billed 2–4¢/loop; **overage fired on 2 of 23** (both early `/api/reason` two-call loops at 2¢ Anthropic cost → billed 4¢ at exactly the 2.0× floor). The formula behaves as designed.
- `translation_sandwich_comparisons` (61 rows; the 24 costed rows are 2026-05-05→07 **parallel-run test traffic, pre-cutover**): combined Layer 1+3 cost median ≈ $0.0003/request on short test inputs. Treat as a lower bound only.
- Design-basis estimates (billing design appendix, still governing until real distribution exists): quick-depth ~$0.001–0.002; standard ~$0.005–0.010; heavy 3-iterate chain ~$0.020–0.040. Base-rate re-tune is permitted (Elevated) in the first 2–4 weeks post Stripe activation.
- **Observed latencies (production, 2026-06-10):** agent `/api/reason` with pre-computed schema **13.1 s**; human standard-depth **~36 s**; substrate decomposition L1 0 ms (pre-extracted) / L2 1 ms / L3 10.7 s. The April "~2–4 s" claims were corrected on the public surfaces at S8b (R18 pass).

**Margin shape:** typical loop ≈ 4× revenue:cost (2¢ vs ~0.5¢); plugin-path traffic (Stage 3+, Layer 1 run on the developer's substrate) drops SageReasoning's cost per request to Layer 3 only — margins improve structurally as the plugin path grows (R5 assessment, 2026-05-14).

## 4. Cost base (current + entity formation)

| Item | Figure | Status |
|---|---|---|
| Fixed monthly ops (Vercel, domain, accounting, insurance amortised, misc) | **~$279/mo — pre-pivot figure, unvalidated since April** | Needs re-validation at P1 (Supabase tier, Vercel plan in actual use) |
| Upfront entity formation: ASIC Pty Ltd $576 + business name $98 + legal review ~$3,500 + PI/cyber insurance yr-1 ~$1,500 | **~$5,674 — pre-pivot estimate, structure still applicable** | FPE-1 (Pty Ltd) + FPE-3 (insurance quote) start this week (founder wall-clock, per S8b close); lawyer engaged this week with the readiness statement as cover note |
| Anthropic LLM spend | Effectively $0 at zero external traffic; per-loop pass-through by construction once billed | A13 cost-health watches it daily, alerts to Slack |
| Founder working costs | **New input (PR11):** from June 15 the Anthropic credit-pool change may alter the founder's own Cowork/Claude-Code costs — watch under R5 | review §3.10 |

## 5. Market context (June 2026 — replaces the April competitive framing)

1. **Sanctioned third-party agents.** From **June 15, 2026**, programmatic/agent use of Claude subscriptions moves to monthly credit pools (Pro $20 / Max $100–$200); third-party agent tools are re-permitted under those caps. More sanctioned agents = more potential substrate consumers. Mildly strengthens the agent-consumer thesis (PR11/PR13 assessment, 2026-06-10).
2. **Managed Agents** now support self-hosted sandboxes + private MCP servers (public beta); dynamic multi-agent workflows in research preview — the addressable integration surface for a judgment substrate is growing.
3. **Marketplace strategy (locked):** Cowork first → `anthropics/skills` second → Claude Code Plugins third (Stage 4 G1). Stage 3 plugin internals re-scoped onto the Anthropic Plugin spec + MCP rather than bespoke.
4. **Verified constraint with product implications:** the Cowork sandbox **cannot reach `www.sagereasoning.com`** (egress blocked; re-verified 2026-06-10). A Cowork-resident agent cannot integrate directly today — strengthens the Stage-3 MCP-connector path as the actual delivery vehicle (`D-0H-MAIN-BLOCKER-VALUE-DEMONSTRATION-2026-06-10`).
5. **Competitive category:** the relevant comparison set is the Character Kernel / normative-cognitive-middleware cluster (J1 ADR peer landscape), **not** the April anchors (Guardrails AI / Clearbit / Crystal Knows — those benchmarked a per-call skill catalog that no longer exists as the product surface). Agentic-commerce protocols (ACP, UCP, AP2, …) are adjacent, not competing: the kernel sits upstream as the judgment primitive.
6. **Demand evidence: none yet.** Zero external agent installs; zero human users beyond the founder. The value demonstration to a working agent is the 0h main blocker, under test in this comparison pair.

## 6. Revenue structure — honest unit-economics statement (not projections)

The pre-pivot M12 projections ($9,117/mo API + $211 tidings; break-even month 2–3; $105,821/yr annualised) are **void**: they price a retired model over a retired product surface (see findings memo F1–F2). No replacement point-projection is honest at zero traffic. What can be stated:

- **Unit economics:** $0.02/loop at ≥2× cost floor by construction; ~4× on typical loops; structurally improving on plugin-path traffic.
- **Reference arithmetic (illustrative only, NOT a forecast):** an agent consulting at 50 loops/day ≈ $30/mo; 10 such agents ≈ $300/mo against ~$279/mo fixed costs. Adoption volume is the entire open question, and there is no adoption data.
- **Auxiliary streams from the pre-pivot pack (tidings/donations, virtue-badge merchandise, enterprise licensing, patronage)** are neither built nor decided post-pivot — P1 should re-elect or retire each explicitly (recommendations item 6).
- **Human side is free** (no subscriptions; the April plan removed them and nothing reinstated them). Human tools are mission + funnel + dogfood surface, carried by the fixed-cost base.

## 7. Staged scope ahead (adopted plan)

~48–77 build sessions total (staging plan, ST2-revised). Position: **Stage 1 (A10–A19) effectively complete and Live**; Stage 2 K-category migration — the human-tools subset (A8) founder-elected **pre-launch**; Stage 3 Layer-1 hardening + plugin internals (re-scoped on Plugin spec + MCP); licensing gate; Stage 4 first listing (Cowork; G4 gated on FPE-1…5 complete + substrate Verified); Stage 5 Layer 1 open-source release; Stage 6 multi-marketplace. The pre-launch remainder before the launch decision: P1 comparison pair + verdict → A8 mapping → migration + presentation arc (W3/W4) → `score-conversation` distress wiring (Critical) → supporting-blocker clears → 0h declaration → P1 review.

## 8. Launch criteria status (from the readiness statement, 2026-06-10)

Met: 3 (human tools), 4 (discovery files), 7 (R17 protections), 8 (R18 pass, S8b), 9 (R19 limitations + mirror), 10 (R20 detection, fully tested), 11 (R5 alerts). Partially met: 1 (auth+revocation Live; per-install metering enforcement deferred to first paid onboard, recorded). Open: 2 (Stripe — the P1 tension, recommendations item 2), 5 (lawyer wording — engaged this week), 6 (the P1 review itself — this pack is its input).

## 9. Compliance clock

- **EU AI Act Article 50 applies 2026-08-02** — ~7.4 weeks from this pack's date. Whether it strictly binds a pre-launch no-EU-users product is LRQ-3 territory; posture honestly MONITORING.
- APP 1.7 ADM binding wording due 10 Dec 2026.
- Quarterly compliance review due **2026-07-06** (includes the AC1 model-table re-confirmation now that the Fable/Mythos tier exists, released June 9).

## 10. Risk register (current, replaces the April registers)

| Risk | Status / mitigation |
|---|---|
| **No demand evidence** (the central business risk) | Under direct test: the P1 comparison pair (this leg = baseline); then first listing telemetry. Investment case must be evidence-gated (recommendations item 1) |
| Value-prop latency (13.1 s agent-side) | Positions the kernel as a deliberative consult, not an inline guardrail; decision-point-class fit is part of the comparison test's task-fit analysis |
| LLM cost variance / model-tier change (Fable/Mythos, June 9) | Overage formula passes variance through at ≥2×; AC1 review at 2026-07-06 quarterly |
| Solo-founder bus factor | `.env.example` 58-var census done (S7b); no CI (deferred); registry now honest (v1.6.0) |
| npm vulnerabilities (3 moderate, 10 high) | Own Elevated session before external exposure (carried) |
| `score-conversation` distress wiring (inside perimeter, S8a ruling) | Own Critical session before launch; blocks 0h exit |
| Pricing-copy drift across ≥5 surfaces | PR5 candidate-rule watch (S8b); pricing restructure is a P1 item |
| Entity/insurance not yet formed | FPE-1/FPE-3 start this week; G4 hard-gates the marketplace listing on them |
| Regulatory (Art-50/APP 1.7) | Lawyer packet ships this week; honest MONITORING posture |

---

*Sources: `D-BILLING-MODEL-LOCKED-2026-05-17` + `/adopted/billing-model-design.md`; `D-REGISTRY-UPDATE-v1.6.0`; `D-PRELAUNCH-S8A/S8B` closes; `/operations/capability-inventory-2026-06-10.md`; `/operations/pre-lawyer-readiness-statement-2026-06-10.md`; `/operations/reviews/2026-06-10-multidisciplinary-review.md`; `/operations/r5-cost-shape-impact-assessment-2026-05-14.md`; `/adopted/substrate-plugin-staging-plan.md`; `/adopted/adr/2026-05-12-substrate-category-character-kernel.md`; read-only production queries (loop_billing_events, translation_sandwich_comparisons) 2026-06-11.*
