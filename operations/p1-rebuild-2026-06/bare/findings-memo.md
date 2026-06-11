# Findings Memo — What Changed Since the Pre-Pivot P1 Inputs, and Why It Matters (Leg A, bare run)

**Produced:** 2026-06-11, P1-comparison leg A (bare). **Baseline commit:** `a3db4c7`.
**Inputs compared:** the seven pre-pivot `/business` documents (27 Mar – 5 Apr 2026: Revenue Strategy Research; Legal/Revenue Business Plan V3; Break-Even & Investment Analysis; Market Research & Pricing Report; Growth Strategy; two spreadsheets) + `STATUS-REVENUE-MODEL.md` — against the current verified state per the refreshed inputs pack (`p1-inputs-pack.md`, same directory).
**Findings are numbered F1–F11 for the comparison-test metric.** Errors/overclaims caught in source documents are marked **[ERROR CAUGHT]**.

---

## F1 — The revenue model the pack prices no longer exists. All headline projections are void.

Every pre-pivot financial document prices a **per-call, competitor-anchored, 29-skill catalog** ($0.0025 sage-guard … $0.50 sage-diagnose; "half the cheapest competitor in each category"). That model was retired by `D-BILLING-MODEL-LOCKED-2026-05-17`: the unit is now the **loop** at **$0.02 base + token-cost overage**, uniform across surfaces, with the free tier redefined as 30 loops/month. Consequences for P1:

- The M12 projections — **$9,117/mo API revenue, $10,329/mo total, $8,818/mo net profit, break-even month 2–3, $105,821/yr annualised** — are derived per-skill × per-call arithmetic over a catalog that is no longer the product surface. They cannot be rescued by adjustment; they must be formally superseded.
- The five "agent archetype" revenue figures ($120.50–$470.55/mo) embed per-call rates and call-volume mixes that have no mapping to loops.
- The "90% weighted average margin" claim is replaced by a different (and honest) construction: ≥2× revenue:cost on every loop by formula, ~4× typical, structurally improving on plugin-path traffic.

**Why it matters:** the old pack's investment case ("robustly profitable under every scenario tested") rests entirely on these numbers. P1 cannot affirm/reject the business plan against figures that describe a discontinued model.

## F2 — The product surface pivoted: from a skills catalog to a Character Kernel substrate.

The pre-pivot pack sells "29 paid skills + 1 free endpoint." The current product is a **substrate contract**: per-install credentials, one reasoning endpoint (`/api/reason`, translation sandwich), a planned plugin family (Stage 3, re-scoped onto the Anthropic Plugin spec + MCP), Layer 1 open-source at Stage 5, marketplace listings Cowork-first. The category positioning ("Character Kernel," J1 ADR) and the peer landscape (ANCHOR, AEGIS, VIGIL, ResontoLogic) did not exist in the April documents. **Why it matters:** market sizing, competitive anchors, and the GitHub/MCP go-to-market sections of the pre-pivot pack all describe a different product; the P1 review's strategy questions should be asked of the kernel, not the catalog.

## F3 — [ERROR CAUGHT] The pre-pivot pack contradicts itself on subscriptions.

The April Legal/Revenue plan states "Previous subscription models have been **completely removed**. … NO Subscriptions." Yet the same-vintage Break-Even Analysis carries **Scenario A: "Prokoptos Subscriptions Only … 43 paying Prokoptos subscribers"** as the fallback floor, and its Month-12 base case adds **"$490 in Prokoptos subscriptions"** to total revenue. The March research document recommends the $7/mo Prokoptos tier the April documents claim removed. The pack's own base-case revenue therefore double-counts a stream its governing document abolished. **Why it matters:** even taken on its own terms, the pre-pivot base case is internally inconsistent by ~$490/mo; any P1 reviewer using the old pack would inherit the error. Current truth: the human side is free, no subscription mechanism exists or is planned.

## F4 — [ERROR CAUGHT] `billing-model-design.md` carries a stale implementation-status header.

The adopted billing design still reads "**Implementation status: Designed — … specified, not built**." The Option D build in fact happened: the 2026-06-10 review verified the formula implemented in code, consistent across stripe.ts/llms.txt/agent-card, and this session read **23 `loop_billing_events` rows (2026-05-17 → 05-22)** from production, including two overage events billed at exactly the 2.0× floor. **Why it matters:** a P1 reviewer reading the design doc would understand billing as unbuilt; it is built, metering, and awaiting only Stripe activation. (Same drift class as PR18 was adopted to prevent; fix is a one-line dated annotation.)

## F5 — A compliance/safety build-out the old plan never priced is now the bulk of the delivered product.

The April plan's compliance posture was disclaimers + ToS (~$500–1,000 legal). Since then: the R20a two-stage distress perimeter (Live, both audiences, Zone-2 calibrated), GDPR rights endpoints, field-level encryption, injection defence, abuse detection, OTel audit, cost-health alerting with Slack delivery, SLO tracking, 75/75 RLS — and a 7-item lawyer review queue with DPIA, sub-processor register, and an Article-50 posture, engaging counsel this week at ~$3,500 (est.). **Why it matters two ways:** (a) the cost base and timeline of the old plan understate what responsible operation of a distress-adjacent product requires; (b) the safety/compliance layer is now a genuine differentiator the old positioning never claimed — auditable safety behaviour is disclosed in the public contract (llms.txt v3.1 Safety Behaviour section, S8b).

## F6 — Observed performance contradicts the old latency assumptions; the value proposition shifts from "inline gate" to "deliberative consult."

April materials assumed ~2–4 s responses and positioned sage-guard as an every-decision inline gate at $0.0025. Observed production reality (S8a): **13.1 s** agent-side, **~36 s** human standard-depth, with Layer 3 prose generation (10.7 s) dominating. The S8b R18 pass already corrected the public claims. **Why it matters:** at 13 s and $0.02, the kernel is a *considered-judgment consult at meaningful decision points*, not a high-frequency guardrail. This reframes which decision-point classes the product targets, the realistic loop volumes per agent, and therefore any revenue arithmetic. (The comparison test's §4 decision-point classes embody exactly this framing.)

## F7 — The competitive anchors are obsolete; the relevant market context is the June-2026 agent ecosystem.

Competitor-anchored pricing benchmarked Guardrails AI ($0.005/call), Clearbit ($0.36/lookup), Crystal Knows (~$1/profile) — guardrail/enrichment/personality categories the product no longer competes in. Current context: the **June 15 Anthropic credit-pool change** sanctions third-party agent tools under $20–$200/mo caps (more potential substrate consumers); Managed Agents gain self-hosted sandboxes + private MCP servers; the Character Kernel peer cluster exists and is named. **Verified constraint:** the Cowork sandbox cannot reach production directly (2026-06-10) — the MCP-connector path (Stage 3) is the actual delivery vehicle for Cowork-resident agents. **Why it matters:** P1's market section should be rebuilt on the agent-ecosystem thesis with the credit-pool tailwind, not on price-undercutting categories the product left.

## F8 — Entity, insurance, and legal formation: unchanged in structure, now on the critical path.

The pre-pivot upfront budget (~$5,674: ASIC $576 + name $98 + legal ~$3,500 + PI/cyber ~$1,500) remains the best available estimate — but in April these were "Month 1–3" intentions, and they are still not started. They are now hard gates: G4 (marketplace listing) requires FPE-1…5 complete, and the Art-50 clock (~7.4 weeks) presses the lawyer engagement that started this week. **Why it matters:** the timeline risk has inverted — formation lead time, not build pace, is the longest pole.

## F9 — Revenue diversity claims need explicit re-election or retirement.

The pre-pivot pack carried five auxiliary streams: tidings/donations (Wikipedia model, ~$211/mo at 1,000 users), virtue-badge merchandise, enterprise licensing, structured patronage, plus cost optimisation. None has been built, decided, or repriced post-pivot; none appears in the adopted billing design. **Why it matters:** P1 should either re-elect them with current-product framing or retire them on the record, so the business plan stops carrying ghost streams (R19 honesty applies to internal projections feeding public claims).

## F10 — Evidence of value: the single strongest input change.

The April pack had zero usage evidence. Current evidence: **n=1 human** (the founder's real decision through `/score`, value affirmed verbatim) and **n=0 external agents** — and the founder has named the agent-side value demonstration as the 0h main blocker, now under pre-registered test (this comparison pair; verdict memo to follow leg B). **Why it matters:** P1 convenes with the verdict memo as a direct input. The review's affirm/reject should weight demonstrated value over projected value — which the old pack could not offer at all.

## F11 — Cost reality at zero traffic is benign; the watch item is the founder's own working costs.

Fixed costs (~$279/mo, pre-pivot figure, unvalidated) remain the only material burn; LLM spend is near-zero and per-loop pass-through-protected once billed. The new R5 watch item (PR11, 2026-06-10) is the founder's own Cowork/Claude-Code costs under the June-15 credit-pool regime. A13 delivers daily cost-health signals to Slack. **Why it matters:** capital at risk remains small and the bear case is structurally survivable — the business question is purely adoption, not burn.

---

## Summary for the P1 reviewer

The pre-pivot pack describes a different product (skills catalog), a different price (per-call), a different market (guardrail/enrichment anchors), and a different risk profile (no safety/compliance layer, no formation gates) — and contains at least one internal contradiction (F3) and one stale governing header (F4). What survives: the fixed-cost frugality, the formation budget structure, the no-dark-patterns growth posture (re-affirmed in the current brand work), and the "AI agents are the scalable customer" thesis — now sharpened by the loop model, the Character Kernel category, the June-15 credit-pool tailwind, and a pre-registered value test whose verdict P1 should read before deciding.

*Companion documents: `p1-inputs-pack.md` (the refreshed inputs), `recommendations.md` (the P1 judgement items).*
