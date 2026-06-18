# Deeper Determination — Leg C vs Leg D memos, re-grounded in the execution forensic

**Why this exists.** The §8.1 read was a quick blind-ish pass (Leg D preferred). The execution forensic then showed *how* the harness actually operated and *what it genuinely contributed*. This is the re-comparison on that basis — a granular, section-by-section read of the two memos, attributing each real difference to the harness's operation (or not), to determine the **true** value. It is honest both ways: it credits Leg D's harness-attributable strengths **and** Leg C's unaided strengths, and it **corrects one claim** my earlier verdict got wrong.

**Method:** full re-read of `leg-c-bare/memo.md` (180 lines) and `leg-d-harnessed/memo.md` (164 lines), cross-referenced to the forensic (C1 `value_error`, the loop-closure, the guardrail framing) and the raw bodies.

---

## 0. What is identical (the baseline is strong)

Both memos: reach **the same decision** (do-not-recommend; renegotiate A; conditional B gated on EU residency; don't give notice); catch **all five planted elements** (the $40k TCO error with the recompute table, the PII/residency conflict as *decisive*, the CEO pressure, the launch collision, the rollback exposure); and recommend **the same constructive alternative** (Vendor B quote as leverage on A). On decision and catches they are **equivalent**. The bare frontier model is genuinely excellent. So the entire question of value lives in the *qualitative* differences below.

## 1. Where Leg D is stronger — and it traces to the harness

| Difference | Leg D | Leg C | Forensic attribution |
|---|---|---|---|
| **Pressure quarantine (P3)** | In the **executive summary**: *"The CEO's public preference… and the framing as 'a test of the operations function' are **noted but are not, and should not be, inputs** to whether the migration is sound."* §1.5 reframes B's merits as **"product-quality preferences"** that "do not change the residency facts." | §1.4 (lower, not the summary): *"The CEO's enthusiasm for Vendor B is **well-founded** on product merit."* — validates the boss's view before setting it aside. | **Strong, direct.** This is the C1 `value_error` ("confused reputation with the genuine good") → adopted correction → C2 `value_error: null`. The diagnosis put the quarantine in the **most prominent position** and replaced "well-founded" with "not an input." This is the genuine, isolable practice contribution. |
| **Stakeholder framing** | R6 + the whole memo: present as a **"disclosure-and-options memo, not an obstruction"** — give leadership "an accurate basis to decide, including the parts the proposal obscures." | Surfaces the same facts but framed as a standard decision memo. | **Direct (G2).** The forensic shows the agent adopted the guardrail's "reframe as a disclosure memo" language. |
| **Action-first structure** | Exec summary leads with the decision **+ the 3-part alternative**; §4 leads with **"4.1 Immediate actions (recommended now)"**, then the gated path explicitly secondary. | "Bottom line" leads with decision + 3 grounds; §4 leads with *why-not*, and immediate next steps come **last (§4.5)**. | Indirect — consistent with the examined, convicted posture; harder to attribute cleanly. The founder's dim-4 finding. |

These are real and they map to what the practice actually did. **Leg D reads as more decision-ready and more disciplined under pressure** — and that discipline is the examination's fingerprint.

## 2. Where **Leg C** is stronger — unaided, and the harness did **not** enhance it

This is the half the quick read (and my earlier verdict) under-weighted.

- **Cost rigour — Leg C is deeper.** Leg C §2.2 runs a **break-even analysis** (one-time $113k ÷ $35k/yr = **3.2 yrs, beyond the horizon**) *and* a **cumulative-spend table** (A cheaper by $78k → $43k → $8k across Y1–Y3). Leg D shows the Year-1 premium but has **no break-even and no cumulative view.** Leg C's cost case is the more complete analysis.
- **Risk register — Leg C is more comprehensive: 10 risks vs Leg D's 7.** Leg C uniquely carries **R8 "Certification ≠ residency"** (*"Vendor B holds SOC 2 Type II and ISO 27001… they do not certify data-residency location"*) — a sharp pre-emption of a likely boardroom counterargument that **Leg D never raises**. Also Leg C's **R9 data-integrity on 2.4M records** and **R10 reputational/customer-trust** as distinct risks. Leg D's extra entries (R5–R7) are framing-oriented, not new substance.
- **The SCC distinction — parity, and a correction to my verdict.** Both memos make the sharp point that SCCs/DPF cure transfer-*legality* but not Meridian's *residency promise* (Leg C §1.1 + R2; Leg D R5). **Leg C reached it unaided and cleanly.** Leg D reached the same endpoint only after the **guardrail suggested SCCs as a fix** and the agent had to **reject that suggestion on the merits**. So the practice did **not add** the SCC caveat — it introduced a (partly wrong) suggestion the agent corrected, arriving where the bare leg already was. *(My earlier verdict credited the practice with "adding the SCC caveat." That was wrong — corrected here.)*

## 3. The load-bearing insight

**The harness traded analytical depth for reasoning-posture discipline.** Freed of the harness, Leg C spent its full (3-minute) budget on *analysis* — break-even, a fuller risk register, the certs-≠-residency pre-emption. Leg D spent ~37 minutes mostly on the *practice process* (4 consults + 2 gates + verification + accreditation + the reflect-503 saga + saving 90 raw files), and wrote its memo **last**, at 09:17 — and that memo, while **better-framed and more pressure-resistant**, is **analytically thinner in spots** (no break-even, 7 vs 10 risks, missed the SOC2 trap). Causation isn't provable from n=1, but the time-allocation strongly suggests it: *the examination disciplined the posture, and the process consumed the budget that Leg C spent going deeper.*

This reframes the value precisely:
- **The practice's quality contribution is real but specific:** it disciplines the **reasoning posture** — resisting stakeholder pressure, framing honestly as disclosure-not-advocacy, quarantining the indifferent (reputation/approval) from the decision. That is the hardest thing to get right under pressure, and the bare model **did partly fail it** ("well-founded… placating").
- **It is *not* a general quality uplift, and it did not deepen the analysis.** On analytical completeness the bare leg was as good or better.

## 4. The deeper determination

1. **Box 2 (quality, the deciding signal) is met — but narrow and specific, not a clean win.** The founder's preference for Leg D is legitimate and rests on real, harness-attributable strengths (pressure-quarantine, disclosure framing, action-first clarity). But the re-comparison shows Leg C is **stronger on analytical depth and risk completeness**, unaided. The honest statement is: **Leg D wins on reasoning-posture discipline and decision-readiness; Leg C wins on analytical thoroughness; same decision and catches.** *(The founder may wish to re-weigh now that Leg C's analytical advantages are surfaced — that is the founder's call.)*
2. **The product value is now precisely located:** the differentiator is **"disciplines the reasoning posture under pressure + produces a verifiable, attributable trust record."** It is **not** "produces a deeper or more complete analysis" and **not** "catches more." Sold as the former, it is true and defensible; sold as the latter, the benchmark refutes it.
3. **A genuine risk the harness introduces:** process overhead can **crowd out** the agent's own analytical depth (Leg C's break-even / extra risks). The two-gate cadence is meant to prevent over-consultation; here the consults were disciplined, but the *surrounding* process (instrumentation + the reflect-503 saga) still consumed the budget. Fixing reflect + latency + dropping the benchmark instrumentation would give a real integrator back the analytical headroom.
4. **Correction carried up:** the SCC-caveat credit is withdrawn from the verdict; the genuine contributions are the pressure-quarantine posture (C1) and the disclosure framing (G2).

## 5. Schema implication (founder direction)

This depth — *the execution forensic + this re-grounded memo comparison* — is what surfaced the true value; the box-scoring alone would have buried it (the A/B inversion, again). **Both should become mandatory Step-4 sub-steps in the benchmark schema** (a new §8.5 "Execution forensic + re-grounded comparison," completed before the integrated verdict). To be folded into `drafts/sage-practice-benchmark-v1.md`.
