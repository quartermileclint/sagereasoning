# Findings Memo — What Changed Since the Pre-Pivot Inputs, and Why It Matters to P1 (Leg B, harnessed)

**Produced:** 2026-06-11, leg B. Twelve findings, each consulted through `/api/reason` before writing (incorporation log, consults #3–#8 and #12). Sources cited inline; pre-pivot claims quoted from the `/business` documents directly.

---

## A. The pre-pivot pack itself

**F1 — The revenue model is obsolete in structure, not just in numbers.** The pre-pivot pack prices **29 paid skills per-call** at competitor-anchored rates ($0.0025–$0.50/call) and builds every downstream figure on that catalog (`SageReasoning_BreakEven_Investment_Analysis.docx`, 3 April). The adopted, built, and metering model is **Option D per-loop billing** ($0.02 base + token-cost overage; `D-BILLING-MODEL-LOCKED-2026-05-17`), and the product surface consolidated from a skill catalog to a substrate contract. The M12 figures ($9,117/mo API revenue, $10,329/mo total, break-even M2–3, $8,818/mo net) cannot be carried forward **even as anchors** — they price a product that no longer exists. *Why it matters: P1 cannot "review" the old plan; it needs this rebuilt pack as its input basis (R1).*

**F2 — The pre-pivot pack contradicts itself, and carries an arithmetic error (error caught).** `SageReasoning_Legal_Revenue_Business_Plan.docx` states subscription models are "completely removed" and revenue is "entirely per-call API usage plus voluntary tidings donations" — yet quotes the $10,329/mo M12 total from the break-even doc, **whose composition includes $490/month of Prokoptos subscription revenue** (and a 43-subscriber break-even floor in its Scenario A). The plan's own components ($9,117 + ~$211) sum to ≈ **$9,328**, not $10,329. Verified by direct extraction from both documents this session. *Why it matters: beyond staleness, the pack is internally unreliable — supersede, don't patch (R1).*

**F3 — The "revenue diversity" argument is void.** The pre-pivot case leaned on 29 skills across 7 categories ("no single skill dominates"). The live agent contract is **one consultation surface + one gate + one accreditation write**. Concentration risk must be argued on the substrate's actual surfaces, not a retired catalog. *Why it matters: the diversification claim was a load-bearing risk-mitigation argument in the investment case.*

## B. What the evidence now says

**F4 — Observed unit economics exist, and the realized price is 2× Anthropic cost, not the 2¢ headline.** May ledger (n=23, verification traffic): mean Anthropic cost 0.26¢/loop, overage fired 2/23. **This run's live consults (n=10 metered): overage fired on every call** — quick depth bills 6–8¢, standard 8–10¢, i.e. exactly 2× the 3–5¢ Anthropic cost, because real `/api/reason` consultations always exceed the 1¢ overage trigger. The design's "typical loop ~0.5¢" assumption (billing design §Decision B) does not describe consultation-grade traffic. Caveats: small samples, no external customers, `models_used` empty on 16/23 ledger rows, token columns zero. *Why it matters: the "two cents per task" marketing sentence is not what an agent integrator will experience; the R4 re-tune window has its first real data.*

**F5 — The substrate's speed claim is observable; its cost advantage is not yet provable.** Parallel-run table (May 5–7, n=61): bundled prose path mean 42.5s vs sandwich L1 13.4s + L2 ~1ms + L3 14.6s; with agent-supplied Layer 1 the observed end-to-end is ~13–18s (S8a: 13.1s; this run: 13.8–18.4s). But `bundled_depth_cost_usd_microcents` was **never populated (n=0)** — the sandwich-vs-bundled cost comparison cannot be quantified from production data (measurement gap). *Why it matters: rec 3.2 names the "translation-sandwich double-LLM cost model" as a P1 input; honesty requires stating it as latency-proven, cost-unproven.*

**F6 — The comparison data dates from the substrate's unstable period.** 25/61 sandwich runs in that May window errored (pre-A7-cutover). Current production behaviour is verified (S8a; this run's 12 consecutive 200s). *Why it matters: the investment case should cite the maturation honestly rather than presenting May error rates or May latencies as current.*

**F7 — The business plan must speak per audience.** Human practitioners buy the prose-path product today; agent developers buy the substrate contract today; the founder-elected A8 migration (status Scoped) converges them pre-launch. *Why it matters: a single product story would misdescribe what each customer class buys at launch; pricing, positioning, and risk differ per audience until A8 completes.*

## C. Schedule and context (split per consult #7: founder-actionable vs external)

**F8 — Founder-actionable now:** none of FPE-1..5 (incorporation, GST, insurance quote, coverage audit, ToS-with-lawyer) is started; incorporation gates the Stripe account and changes privacy wording. **External and fixed:** EU AI Act Article 50 applies **2026-08-02**; APP 1.7 ADM wording binding 10 Dec 2026. The pre-pivot plan carried none of these. *Why it matters: the plan's schedule spine is now compliance-driven, not build-driven.*

**F9 — The Stripe launch-criterion tension is a decision, not a build item.** Criterion 2 ("Stripe handles paid-tier billing") vs production `not_configured` (deliberate) vs a completion plan that defers activation to the first paying consumer. *Why it matters: P1 must resolve it on the record either way (R3).*

**F10 — Market context shifted in the agent-consumer thesis's favour.** Anthropic's June-15 credit-pool change sanctions third-party agents under $20–$200/month caps — agents now have sanctioned budgets that a 6–10¢/consult service fits comfortably; it also puts the founder's own Claude costs on the R5 watch list. *Why it matters: first genuine external tailwind for the agent-developer funnel; belongs in the refreshed sizing (R8).*

## D. Found by this run's own credential usage (live product evidence)

**F11 — The agent onboarding funnel fragments across three credential classes, and the funnel's first credential is meter-blind.** Observed live this session: `sr_inst_` (consultation) is rejected by `/api/guardrail` (401 — `sr_live_` only), so one harnessed loop needs two credential classes plus `sr_assent_` to close the accreditation loop; and the per-install path emits **no cost or usage headers** (metering binds to API-key identity), so the intended first credential of a new agent customer shows them no meter at all. Two prompt-pack mint bodies also 400'd on a missing `purpose` field (PF-1, incorporation log). *Why it matters: this is onboarding friction on the exact funnel the revenue model depends on — and it was invisible until a real agent ran the full contract.*

**F12 — Free-tier mint defaults drift from adopted policy (error caught, live).** The admin mint route hard-codes `monthly_limit = 667, daily_limit = 50, max_chain_iterations = 20` ([route.ts:112](../../../website/src/app/api/admin/api-keys/route.ts)), overriding the schema default of 30/1 (`api/api-keys-schema.sql:84,88`) that the March free-tier restructure adopted (STATUS doc Task 4, marked DONE) and the Option D design's 30 loops/month / 1 per day. **Proven by this session's live key row** (667/50/20 on a key minted today). Per-install keys mint at 100/100/1 — a third, different free tier. *Why it matters: the free tier is the top of the funnel and currently three different products depending on mint surface; one of them resurrects the "too generous" tier the restructure explicitly retired.*

---

**Errors caught in this leg (attributed):** F2 (pre-pivot internal subscription contradiction + $9,328-vs-$10,329 arithmetic carry-over); F12 (live mint-defaults drift, 667/50/20 vs adopted 30/1/1). Measurement gaps surfaced: F4 (`models_used`/token columns), F5 (bundled-cost column never populated).

*Memo ends. Recommendation set follows in `recommendations.md`.*
