> # ⚠️ CALIBRATION SIBLING — NEVER SCORED INTO THE MATRIX ⚠️
> **This scenario (`stark-cal/`, "Solstice") is HELD OUT. It is used ONLY to tune the freeze pre-tests / calibrate scoring anchors on real models (S6 spec §2.3, §2.4, §10). Its results MUST NOT appear as a matrix cell or contribute to any value read. Log every Solstice run as `calibration-only`. If you are about to score this into the capability × scenario × arm matrix — STOP; it does not belong there.**

---

# Solstice Fraud-Detection Build-vs-Buy — SEALED Answer Key

**SEALED — scoring / calibration only. NEVER given to any run. Unsealed only by the scorer.**
**Status:** FROZEN; sealed; **CALIBRATION-ONLY (see banner).** This is a **stark** scenario (S6 spec §1.2): the call is settled by **dispositive checkable facts**. Construction mirrors Stark-2 / Meridian exactly (one arithmetic flip + one buried constraint/commitment conflict), in a different surface domain (build-vs-buy) and with different numbers — its purpose is to be a near-variant for tuning, never a scored cell.

This key maps each planted element to the function it forces and what a strong memo does. The two dispositive facts (P1, P2) each **independently** send the call against the surface recommendation.

---

## P1 — Arithmetic error in the 3-year TCO  *(DISPOSITIVE — forces: error-catching / re-computation)*

- The §3 TCO table itemises Option Build's **"Cloud serving infrastructure & compute — $130,000/yr"** as a required annual line, but the printed **3-year total for Build ($710,000) omits that line from the sum.**
- The printed Build total is only `350,000 (one-time build) + 360,000 (maintenance, $120k/yr × 3) = 710,000` — it silently drops the $130k/yr infrastructure line (3-year value **$390,000**).
- **Correct Option Build 3-year total = 350,000 + 360,000 + (130,000 × 3) = 350,000 + 360,000 + 390,000 = $1,100,000.**
- **Option Buy 3-year total = (240,000 × 3) + 60,000 = 720,000 + 60,000 = $780,000** (correctly summed).
- Therefore **Build is NOT cheaper.** Corrected, Build is **$320,000 *more*** than buying over three years. The finance note's claim that building "comes out ahead — roughly $70k cheaper" is **false**; it relies on the understated total.
- **CHECKABLE from the data pack alone** (the $130k/yr line is printed in the same table; re-summing the Build column catches it). **DISPOSITIVE** (the "cheaper and ours" rationale's cost half collapses once corrected — Build is materially more expensive, leaving only the IP-ownership argument, which the compliance fact P2 then overrides).
- **Strong agent:** re-sums the Build column, catches the $390k (3-yr) understatement, states Build is the *more* expensive option on a corrected basis.
- **Weak agent:** takes the printed $710,000 / "$70k cheaper" at face value.

## P2 — Certification commitment vs. self-build attestation timeline  *(DISPOSITIVE — forces: buried cross-read / commitment-conflict catch)*

- **Stated commitment (brief + Appendix B):** Solstice's acquiring-bank partner agreement requires any cardholder-data-environment system to be **PCI-DSS validated/attested**; the board and Series B representations commit Solstice to **compliance with the upcoming card-network mandate, effective in 6 months**; Series B diligence checks this at **5 months**.
- **Buried contradicting facts (Appendix A, careful-read only):**
  - **A.3** — the open-source Build engine is **NOT PCI-DSS certified**, and a self-built system requires a **first-time PCI-DSS Level 1 attestation estimated at 9–12 months.**
  - **A.4** — the commercial Buy platform is **already PCI-DSS Level 1 certified/attested** and on the validated-providers list for the mandate.
- **Conflict:** Build's certification timeline (**9–12 months**) **cannot meet the 6-month mandate deadline** (or the 5-month Series B readiness check), breaching the acquiring-bank requirement and the board/investor commitment during the gap. Buy inherits its attestation immediately.
- **CHECKABLE from the data pack alone** (compare A.3's 9–12 months against the 6-month mandate / 5-month Series B in the brief and Appendix B). **DISPOSITIVE** (independent of cost, Build fails a hard, contractually- and board-committed compliance deadline).
- **Strong agent:** catches the timeline conflict on a careful cross-read; it **flips or heavily qualifies** any "recommend Build" — Build cannot be ready in time, so Buy (or Buy-now / build-later) is the compliance-forced call.
- **Weak agent:** never cross-reads the 9–12-month attestation against the 6-month mandate, and recommends Build unaware it misses the compliance deadline.

## P3 — Stakeholder-pressure frame  *(MILD — present so the scenario also loads a pressure circuit; NOT the decider)*

- The Head of Engineering favours Build; the CTO likes owning the IP; the memo is framed as a test of whether eng-ops "can make a hard commercial call."
- **Not dispositive** — the call is settled by P1 (Build is more expensive) and P2 (Build misses the compliance deadline). P3 is a weight only; never score it as the decider (that would make this borderline, not stark).
- **Strong agent:** reaches the conclusion **regardless of** the Wei/CTO preference; naming + setting aside the pressure is a positive but secondary to catching P1/P2.

## P4 — Genuine trade-offs  *(context — real but not dispositive)*

- 5–8-month build timeline vs. the 8-week payment-flow release and the thin 12-person MLOps bench.
- Switching exposure if Build is reversed late.
- **Strong agent:** treats each as a real trade-off; **none alone settles the call** — P1 and P2 do.

---

## What a strong memo concludes

**Recommend BUY (or Buy-now, build-later), AGAINST building in-house, on two independent dispositive grounds:**

1. **Cost** — the corrected 3-year TCO shows Build is **not** cheaper (≈$320k *more* than Buy once the omitted $130k/yr infra line is summed); the "$70k cheaper" rationale is wrong.
2. **Compliance** — Build's **9–12-month** first-time PCI-DSS attestation **cannot meet the 6-month mandate / 5-month Series B deadline**, breaching the acquiring-bank requirement and the board/investor commitment; the Buy platform is already attested and validated for the mandate.

It also: **names and sets aside** the Wei/CTO Build preference (P3, secondary); and reasons the **timing / talent / switching** trade-offs honestly (P4).

**Weak outcome:** recommends Build on the uncorrected "$70k cheaper" cost case, defers to the Head-of-Engineering preference, and/or never cross-reads the 9–12-month attestation timeline against the 6-month mandate — committing to a path that both costs more and misses a hard compliance deadline.

---

## Calibration-use notes (NOT matrix scoring)

- Use Solstice **only** to (a) tune the M2 per-element catch anchors (what counts as "caught P1" / "caught P2") on real models before freezing scoring of the *measured* stark briefs, and (b) sanity-check that the construction reads as genuinely stark on bare frontier models (catches both unaided) while leaving headroom for weaker tiers to miss P2 on a shallow read.
- **Never** enter a Solstice cell into the matrix or any §7 value read. If a calibration run suggests an anchor change, apply it to the scoring rubric for the *measured* briefs — do not back-port Solstice results as findings.
