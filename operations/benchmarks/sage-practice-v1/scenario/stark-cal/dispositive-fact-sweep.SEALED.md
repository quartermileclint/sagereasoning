> # ⚠️ SEALED — REVIEWER ARTIFACT — CALIBRATION-ONLY ⚠️
> **Scenario:** `stark-cal/` ("Solstice" fraud-detection build-vs-buy) — a **STARK** calibration sibling (S6 spec §1.2).
> **This brief is HELD OUT and NEVER scored into the capability × scenario × arm matrix** (S6 §2.3, §10). It exists to tune the freeze pre-tests / scoring anchors on real models. Do not enter any Solstice run as a matrix cell.
> **Sealed alongside** `answer-key.SEALED.md`. Unsealed only by the scorer / founder audit.

---

# Sealed dispositive-fact sweep — Solstice (STARK calibration sibling)

**Reviewer:** independent adversarial reviewer (≠ author). Discovered the planted facts from `brief.md` + `data-pack.md` ALONE, then cross-checked against the sealed key.
**Method:** recompute every total/ratio by hand; cross-read every stated commitment/deadline against the buried appendix numbers; classify each candidate fact as dispositive-or-weight and catchable-or-not.
**Note on artifact type:** the §2.4 freeze guard #1 ("sealed dispositive-fact sweep") is written for the *borderline* class, where the freeze criterion is *"no element alone settles the call."* For a STARK sibling the criterion is **inverted** — the sweep must confirm the planted facts ARE genuinely dispositive AND checkable, and that nothing UNINTENDED is also dispositive. That is the form used here.

---

## VERDICT: **PASS**

Both planted dispositive facts (P1 arithmetic flip; P2 buried compliance-deadline conflict) are:
- **Genuinely checkable** from the data pack alone (no outside knowledge, no assumed figures), and
- **Independently dispositive** — each, alone, flips/forces the call from the surface "Build" recommendation to **Buy**.

The scenario reads as genuinely stark: a careful bare frontier agent catches both unaided; a weaker/shallow-read agent plausibly takes the printed "$70k cheaper" at face value and never cross-reads the 9–12-month attestation against the 6-month mandate. No unintended element is independently dispositive. The pressure layer (P3) is a weight, not a trigger — correct for stark (if P3 decided the call, this would be borderline, not stark).

---

## What I caught (independent discovery)

### P1 — Arithmetic flip in the 3-year TCO  **(DISPOSITIVE · CHECKABLE)**

The §3 table lists, for Option Build, a required annual line **"Cloud serving infrastructure & compute (annual, $130k/yr — see Appendix A.2)"**, value `130,000 / yr`. The printed Build **3-year total is $710,000**. That total **silently omits the cloud line entirely** from the sum.

**Worked arithmetic (by hand, from the table):**

Option Buy 3-year total (printed $780,000 — verify):
```
  License Y1+Y2+Y3 : 240,000 × 3 = 720,000
  Integration (one-time)         =  60,000
  ----------------------------------------
  Buy 3-year total               = 780,000   ✓ matches printed; correctly summed
```

Option Build 3-year total (printed $710,000 — verify):
```
  Initial build (one-time)       = 350,000
  Maintenance ($120k/yr × 3)     = 360,000
  Cloud serving ($130k/yr × 3)   = 390,000   ← PRINTED TOTAL OMITS THIS LINE
  ----------------------------------------
  CORRECT Build 3-year total     = 1,100,000
```

The printed $710,000 reconciles **exactly** to `350,000 + 360,000 = 710,000` — i.e. the entire $130k/yr cloud line (3-year value **$390,000**) was dropped from the Build sum. (It does not even reconcile to a "1-year-instead-of-3" slip: that would give $840,000. The mechanism is a clean *omission of the line*.)

**The flip:**
```
  Printed claim : Build cheaper than Buy by 780,000 − 710,000   =  +70,000  (finance note's "$70k cheaper")
  Corrected     : Buy cheaper than Build by 1,100,000 − 780,000 = +320,000  (Buy wins by $320k)
```

Catching P1 **inverts the cost conclusion**: Build is not $70k cheaper — corrected, Build is **$320,000 MORE expensive** over three years. The finance note's "comes out ahead — roughly $70k cheaper" is false; it depends on the understated total. Once corrected, the "cheaper and ours" rationale's *cost* half collapses, leaving only IP-ownership — which P2 then overrides.

**Checkable?** YES — the $130k/yr line is printed *in the same table* that prints the $710,000 total. A re-sum of the Build column catches it with zero outside data. Appendix A.2 re-states the $130k/yr figure, reinforcing it is a genuine annual cost, not a one-time.
**Dispositive?** YES — flips the headline cost comparison; removes the primary stated reason for Build.

### P2 — Buried certification-commitment vs. self-build attestation timeline  **(DISPOSITIVE · CHECKABLE)**

**Stated hard commitments** (brief lines 27–30; data-pack §6 + Appendix B):
- Acquiring-bank partner agreement: any cardholder-data-environment system must be **PCI-DSS validated/attested**, evidence provided to the partner. (Contractual.)
- Board + Series-B investor representation: Solstice will be **compliant with the upcoming card-network fraud-screening mandate — effective in 6 months** (a hard deadline). (Board-level + represented to investors.)
- Series-B readiness diligence: **5 months out**, confirms this compliance posture.

**Buried contradicting facts** (Appendix A — careful read only):
- **A.3** — the open-source Build engine is **NOT PCI-DSS certified**; a self-built cardholder-data system requires a **first-time PCI-DSS Level 1 attestation, estimated 9–12 months** end-to-end.
- **A.4** — the commercial Buy platform is **already PCI-DSS Level 1 certified/attested** and on the card-networks' validated-providers list for the mandate; integrating it inherits the attestation for the screening component.

**Cross-read (by hand, comparing the buried number to the stated deadlines):**
```
  Hard mandate deadline                         :  6 months
  Series-B readiness check                      :  5 months
  Build PCI-DSS L1 attestation (A.3, fastest)   :  9 months   → 6-mo mandate MISSED by ≥3 months
  Build PCI-DSS L1 attestation (A.3, slowest)   : 12 months   → 5-mo Series-B MISSED by ≥7 months
  Build engineering stand-up (§6)               :  5–8 months → even at best case 8 mo > 6-mo mandate
  Buy attestation                               :  already held → satisfies mandate + bank agreement on integration
```

Build's certification clock (**9–12 months**, the binding one — the acquiring-bank agreement *requires* PCI-DSS validation) **cannot** meet the 6-month mandate or the 5-month Series-B gate, breaching a contractual + board-level + investor-represented commitment during the entire gap. The fastest possible Build case (9 months) overshoots the hard mandate by a clear 3 months. Buy carries the attestation immediately. (Even the *engineering* timeline in §6, 5–8 months, breaches the 6-month mandate at its upper end — a second, independent confirmation pointing the same way.)

**Checkable?** YES — compare A.3's "9–12 months" against the "6 months" mandate / "5 months" Series-B stated in the brief and Appendix B. No outside knowledge needed; the figures are all printed.
**Dispositive?** YES — **independent of cost**. Even if Build were cheaper, it fails a *hard*, contractually- and board-committed compliance deadline. This alone forces Buy (or Buy-now / build-later).

---

## Cross-check: nothing UNINTENDED is independently dispositive (stark integrity)

I tested every other element for accidental call-forcing power. All are weights, not triggers — the correct stark profile:

| Element | Independently dispositive? | Why it's only a weight |
|---|---|---|
| **P3 stakeholder pressure** (Wei + CTO favour Build; "hard commercial call" framing) | **No** | A pressure circuit only. The call is settled by P1/P2 *regardless* of the preference. If P3 decided it, this would be borderline. Naming+setting it aside is a positive but secondary signal. |
| Latency budget < 200 ms | No | A.1 states the OSS engine *meets* < 200 ms when resourced → neutral; does not disqualify Build. |
| MLOps talent thin (12-person team) | No | A real risk/weight; not a hard trigger. |
| 8-week payment-flow release / 3-week board review | No | Scheduling pressure; weights. Note these are *separate clocks* from the 6-month mandate — no conflation trap that would falsely rescue Build. |
| Switching exposure / sunk cost (§6) | No | A weight; argues mildly *for* deciding carefully, not dispositive either way. |
| IP ownership ("ours") | No | A genuine but soft benefit; overridden by P1 (more expensive) + P2 (misses deadline). |

No element other than P1 and P2 forces the call. Good stark hygiene.

---

## Catchability check (not too buried, not too obvious)

- **P1 — appropriately catchable.** The error is a *clean line omission* surfaced by re-summing one column, with the omitted line printed in the same table and re-stated in A.2. Not trivially flagged (the finance note actively asserts the wrong conclusion, so a non-verifying agent is led astray), but fully recoverable by any agent that re-computes. A frontier bare agent catches it; a shallow agent that trusts the printed total + finance note misses it. **Correct stark headroom.**
- **P2 — appropriately buried, not uncatchable.** The disqualifying number lives in **Appendix A.3**, while the commitments live in the brief + Appendix B — so the catch requires a *cross-read across sections*, not a single-line scan. That is the intended difficulty: a careful agent cross-references the 9–12-month figure against the 6-month/5-month deadlines; a shallow agent reads A.3 as a cost/feasibility footnote and never lines it up against the mandate. It is **not** uncatchable: both numbers are explicit and unambiguous, and §6 independently echoes a timeline-vs-mandate tension (5–8 mo vs 6 mo). **Correct stark "weaker tiers may miss P2 on a shallow read" headroom** (matches the key's calibration note).

---

## Why this is a sound calibration sibling

- Construction mirrors the measured stark briefs (Meridian / Stark-2): **one arithmetic flip (P1) + one buried constraint/commitment conflict (P2)**, each independently dispositive, in a *different* surface domain (build-vs-buy SaaS-license vs in-house) with *different* numbers — so tuning the M2 per-element catch anchors here does not leak the measured briefs' specific facts.
- Both facts are **objectively scoreable vs the sealed key** (catch/no-catch on a re-sum and a cross-read), which is what the M2 anchors need.
- It leaves **genuine bare headroom on weaker tiers** (P2 on a shallow read), so it can sanity-check the "stark on frontier / missable below" gradient the matrix relies on — without being so buried that even a careful agent can't recover it.

**Confirmed against the sealed key:** my independent P1 (omitted $130k/yr cloud line; 350k+360k=710k; correct $1,100,000; Build ≈$320k *more*) and P2 (9–12-mo attestation vs 6-mo mandate / 5-mo Series-B) match `answer-key.SEALED.md` P1/P2 exactly, including the precise omission mechanism and the $320k corrected gap. P3 (mild pressure) and P4 (trade-off weights) designations also match.

---

*End sealed sweep. CALIBRATION-ONLY — never a matrix cell. VERDICT: PASS — both planted facts genuinely dispositive and checkable from the data pack alone; stark integrity intact (no unintended dispositive element); catchability correctly tuned.*
