# Recommendation Set for the P1 Review Session (Leg A, bare run)

**Produced:** 2026-06-11, P1-comparison leg A (bare). **Baseline commit:** `a3db4c7`.
**Status:** all items **Under review** until the founder elects them at P1 (PR7 discipline; nothing here is executed). The judgement-laden items the comparison brief names — investment-case framing and the Stripe criterion tension (review rec 3.3) — are R1 and R2 below.
**Inputs:** `p1-inputs-pack.md` + `findings-memo.md` (same directory).

---

## R1 — Investment-case framing (judgement item)

**Recommend: reframe from "projected profitability" to "evidence-gated staged validation."**

The pre-pivot case ("$8,818/mo net profit at M12; robustly profitable under every scenario") is void (findings F1–F2) and was never evidence-based. The honest current case has three legs:

1. **Downside is small and bounded.** Upfront ~$5,674 formation + ~$279/mo fixed (re-validate the figure); LLM cost is pass-through-protected by the loop formula; the bear case is survivable indefinitely on founder time.
2. **Unit economics are sound by construction** — ≥2× revenue:cost per loop, ~4× typical, improving on plugin-path traffic — but **volume is entirely unproven** (zero external agents).
3. **The thesis tailwind is real but untested:** June-15 credit pools sanction third-party agents; Cowork-first listing; named Character Kernel category.

So frame the investment case as **stage-gated evidence triggers, not point projections**:

| Gate | Evidence trigger | Investment released |
|---|---|---|
| Now → 0h | P1 comparison verdict (benefit shown per the frozen §6 thresholds: ≥2 decisions/errors, ≤50% wall-clock, ≤$5) | Continue pre-launch arc (migration + presentation + Critical wiring) |
| 0h → first listing | Lawyer turnaround + FPE-1…5 complete | Formation spend (~$5,674) committed |
| Listing → traction | First external installs; loop-volume distribution; first paid onboard | Stripe activation + metering enforcement; base-rate re-tune from real data |
| Traction → scale | Retention + per-agent loop volumes supporting >fixed-cost revenue | Stage 5/6 (open-source L1, multi-marketplace) |

Publish **unit economics, not projections**, anywhere external (R19). If the comparison verdict is "no benefit," the pre-named outcome stands: scope correction in R&D — the task-fit analysis (which decision-point classes showed value) becomes the P1 strategy input, not a failure to bury.

## R2 — Stripe launch-criterion tension (rec 3.3; judgement item)

**Recommend: amend launch criterion 2** from "Stripe handles paid-tier billing pre-launch" to **"billing mechanism proven; Stripe activation triggered by the first paying consumer."**

Grounds: the mechanism *is* proven (Option D implemented; 23 ledger rows; overage maths verified at the 2.0× floor; headers emitting); activation with zero customers adds operational surface (webhooks, live keys, invoice rendering paths) with no one to bill, and the completion plan already treats activation as demand-triggered. The alternative — scheduling an activation session pre-launch — buys criterion-compliance at the cost of unexercised production billing code sitting live. Whichever way the founder elects, **decide once, on the record at P1**, and note the per-install metering-enforcement deferral (first paid onboard) alongside it so criterion 1 and 2 dispositions are recorded together.

## R3 — Formally supersede the pre-pivot `/business` pack

Mark the five docx + two xlsx **Superseded** (archive with pointer stubs per 0e — same pattern as PROJECT_STATE at S8b), with this leg's pack as the replacement input set. `STATUS-REVENUE-MODEL.md` already carries the partial (Tasks 4+5) supersession header; extend its header to point here for the business-plan inputs. Without this, every future reviewer re-inherits F1–F3.

## R4 — Fix the stale billing-design status header (findings F4)

One-line dated annotation to `/adopted/billing-model-design.md`: implementation status Designed → Built/metering-Live-inert-pre-Stripe, citing the build evidence. Standard risk, minutes of work, prevents a P1 reviewer mis-reading the billing layer as unbuilt. (PR18 drift class — same discipline, adopted surface.)

## R5 — Rebuild the market section on the agent-ecosystem thesis (findings F7)

Replace the guardrail/enrichment/personality competitive framing with: (a) the Character Kernel peer cluster (J1 ADR landscape) and the differentiation claim (judgment primitive, identity continuity, normative grounding, auditable safety); (b) the June-15 credit-pool change as the demand-side tailwind; (c) the MCP-connector path as the verified delivery vehicle for Cowork-resident agents; (d) honest acknowledgement that category-level willingness-to-pay data does not yet exist — the first listing is the experiment.

## R6 — Re-elect or retire the auxiliary revenue streams (findings F9)

One-line founder elections at P1, each recorded: tidings/donations (the only stream consistent with the current free human side — candidate: keep, post-launch); virtue-badge merchandise (candidate: park to a wall-clock backlog); enterprise licensing (candidate: defer to first inbound); structured patronage (candidate: fold into tidings or retire). The point is the record, not the choices — the plan should stop carrying ghost streams.

## R7 — Re-validate the cost base before P1 closes

The ~$279/mo fixed figure is April-vintage. Pull the actual Vercel plan, Supabase tier, domain, and any new line items (Slack webhook is free; OTel is in-house) into a dated one-table refresh. Cheap, and the break-even arithmetic in R1's gate table depends on it.

## R8 — Price/position around the observed latency truth (findings F6)

The P1 plan should state the product's performance envelope as observed (13.1 s agent / ~36 s human standard; L3-dominated) and position accordingly: a deliberative consult at material decision points, ~tens of loops/day per agent, not thousands. If leg B's task-fit analysis shows value concentrated in specific decision-point classes (plan adoption, scope judgements), fold that into the listing copy and the depth-tier guidance. Defer any latency-engineering investment until demand data justifies it (L3 streaming/caching are known options, unscheduled).

## R9 — Keep the pricing-copy single-source-of-truth rule moving (PR5/PR8 watch)

Tier/pricing copy lives on ≥5 surfaces (llms.txt, agent-card, api-docs, marketplace, mcp-contracts) with two drift incidents recorded (S8b). At the second recurrence the candidate rule ("pricing copy changes name all five surfaces") is one strike from promotion; the marketplace/pricing restructure P1 elects (rec 3.3 family) should designate the single source.

## R10 — P1 convening order

Convene P1 only after: the comparison verdict memo exists (either outcome); the founder's reconcile spot-check (supporting blocker a) is done; and R7's cost refresh is in hand. Read order for the session: verdict memo → inputs pack → findings memo → this set. The review then decides: affirm/amend the business plan, the Stripe criterion (R2), the auxiliary streams (R6), and the investment gates (R1) — all on the record per PR7.

---

*All items Under review. Cross-references: `/drafts/2026-06-10-p1-comparison-test-design.md` (frozen); `D-0H-MAIN-BLOCKER-VALUE-DEMONSTRATION-2026-06-10`; `D-BILLING-MODEL-LOCKED-2026-05-17`; review recs 3.2/3.3 (`/operations/reviews/2026-06-10-recommended-actions-and-priorities.md`).*
