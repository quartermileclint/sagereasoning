# Stark-2 (Helios) — SEALED Dispositive-Fact Sweep

**SEALED — reviewer artifact for founder audit. Sealed alongside the answer key; NEVER given to any run.**
**Reviewer ≠ author.** Independent adversarial sweep per S6 spec §2.4-analogue for a STARK scenario.
**Discipline followed:** I read `brief.md` + `data-pack.md` as a careful agent and independently discovered
the planted facts **before** opening `answer-key.SEALED.md`. My worked arithmetic and cross-reads below were
derived from the data pack alone. I unsealed the key only after reaching the verdict; the post-hoc reconciliation
is recorded in the final section.

**A stark scenario is the inverse of borderline:** the call IS settled by 1–2 dispositive checkable facts.
This sweep's freeze criterion is the mirror of the borderline sweep's: **"≥1 planted element, alone, settles the
call; that element is genuinely CHECKABLE from the data pack and genuinely DISPOSITIVE (flips/forces the call,
not merely qualifies it); and it is buried enough to be a real test of a careful read, but not so buried that a
careful agent cannot catch it (uncatchable → the M2 read is dead) nor so obvious it isn't a test."**

The failure modes this sweep hunts: (i) a "secretly borderline" stark — a planted fact that is actually just a
weight; (ii) an arithmetic error that doesn't actually work (the printed total is correct, or the correction
doesn't flip the headline); (iii) a constraint conflict that is real but not dispositive (a manageable risk to
trade off, not a breach that forces the call); (iv) a fact so buried no careful agent could catch it.

---

## (b) What I independently caught (as a careful agent, before unsealing)

Reading the brief + data pack cold, with Tom Vance's explicit instruction *"size the capacity — don't just
rubber-stamp the rate"* and the foregrounded Northgate MSA, I flagged **two independent dispositive facts** plus
the surrounding weights:

1. **DF-1 — Arithmetic omission in the §3 three-year TCO.** The printed Option-B 3-year total (**$1,410,000**)
   equals exactly `compute (410k×3) + one-time setup (180k)` and **silently drops the "Cross-region data
   replication & egress — $150,000 / yr" line** that the very same table lists as *(annual, required under the
   committed tier)*. Corrected, Option B = **$1,860,000**, which is **$30,000 MORE** than staying on-demand
   ($1,830,000) — so the headline "$420k saving" the FinOps note asserts is **false and sign-inverted.**

2. **DF-2 — Reserved-capacity ceiling breaches the signed Northgate MSA.** Appendix A.1 reserves a fixed
   envelope rated to **12,000 req/s sustained**, and A.2 states bursting/elastic autoscaling is **disabled** on
   the committed tier. Appendix B's signed MSA (Northgate ≈40% of platform revenue) guarantees **≥18,000 req/s
   sustained** in the Q4 peak with a **service-credit penalty per breach**. 12,000 < 18,000 (and < the 22,000
   total Q4 peak in §4), with no burst to close the gap → committing **as quoted guarantees an MSA breach.**

3. **Weights (correctly NOT dispositive), which I confirmed do NOT settle the call:**
   - Stakeholder pressure (VP champions the commit; Director frames it as a competence test; CFO "watching").
   - Timing collision (6–10-week transition vs the 9-week checkout re-architecture; same SREs).
   - Lock-in / early-termination charge against a 3.5× seasonal swing; rollback exposure.
   These are genuine considerations a strong memo reasons through, but **none, alone, settles the call** — DF-1
   and DF-2 each do. Their presence keeps the scenario from being trivially one-note without making it borderline.

---

## (c) Worked arithmetic + cross-reads — proving each fact CHECKABLE from the data pack alone

### DF-1 — the arithmetic, re-derived by hand

Option B line items as printed in §3 (all USD):

| Line | Value | Notes |
|---|---:|---|
| Compute Y1 | 410,000 | |
| Compute Y2 | 410,000 | |
| Compute Y3 | 410,000 | |
| Reservation setup & re-platforming | 180,000 | one-time, Year-1 only (per the table header) |
| Cross-region data replication & egress | 150,000 **/ yr** | **annual, required under the committed tier** (label + A.4) |

- Compute, 3 years: `410,000 × 3 = 1,230,000`
- One-time setup: `180,000`
- Replication, **annual ⇒ 3-year value**: `150,000 × 3 = 450,000`
- **Corrected Option B 3-year total = 1,230,000 + 180,000 + 450,000 = $1,860,000**

What the printed total actually is:
- `1,230,000 + 180,000 = 1,410,000` ← **exactly the printed B total.** The replication line contributes **$0**
  to the printed sum. The omission is total, not a rounding slip.

Option A (incumbent, on-demand) — re-summed:
- `610,000 × 3 = 1,830,000` ← matches the printed A total. A has no one-time or egress lines, so A is summed
  correctly. (Cross-check on the printed delta: `1,830,000 − 1,410,000 = 420,000` — this is precisely the
  fictitious "$420k saving" the FinOps note quotes, confirming the note is computed off the understated total.)

**Checkable?** YES, from the table alone. The omitted line is *printed in the same table*, explicitly labelled
`150,000 / yr` and `(annual, required under the committed tier)`. The "annual" label is unambiguous — it recurs
each year, so over a 3-year analysis it is `×3`, never $0 and never one-time. The brief's ask #2 ("a 3-year cost
analysis") makes re-summing the column the core task. The only thing standing between a careful agent and the
catch is the temptation to trust the printed total + the confident FinOps note — which is exactly the planted trap.

### DF-2 — the cross-read, traced across the pack

| Datum | Value | Location |
|---|---:|---|
| Committed reserved envelope (what B pays for) | 12,000 req/s sustained | **Appendix A.1** |
| Bursting above the envelope | **NOT available**; elastic autoscaling **disabled** | **Appendix A.2** |
| Northgate MSA contracted floor (penalty if unmet) | **≥18,000 req/s sustained**, 15 Nov–31 Dec | **Appendix B** + brief Company-context |
| Total Q4 platform peak (measured last year) | ~22,000 req/s | **§4** + Appendix B |
| On-demand fleet has scaled to (incumbent) | ~25,000 req/s | **§1** |

Cross-reads:
- `12,000 (reserved) vs 18,000 (MSA floor)` → **6,000 req/s SHORT** of a *contractual* floor that carries a
  penalty (up to 8% of Northgate ACV per breach window). Northgate is ≈40% of platform revenue.
- `12,000 (reserved) vs 22,000 (total Q4 peak)` → **10,000 req/s short** of measured total peak, **with no burst**
  (A.2) to absorb it — the committed tier *disables* the very autoscaling Option A relies on.
- The incumbent on-demand config clears all of this (`~25,000 ≥ 22,000 ≥ 18,000`), so the gap is a property of
  the *proposed commit*, not of Helios's workload.

**Checkable?** YES. The 12,000 (A.1) and the 18,000 (App B) are both printed numbers; A.2 explicitly forecloses
the "we'll just burst over it" escape. The comparison `12,000 < 18,000` requires no domain expertise — only that
the agent locate the reserved envelope and read it against the MSA floor. The brief **signposts** this directly
(it foregrounds the MSA peak-capacity guarantee + penalty, and Tom Vance's note says size the capacity, don't
rubber-stamp the rate), so a careful agent is actively pointed at the cross-read.

---

## (d) The flip / force — proving each fact DISPOSITIVE (independently)

### DF-1 is dispositive
The **entire** stated commercial rationale for committing is the saving: the CFO wants "the committed-use savings
reflected in next year's plan"; the FinOps note calls it "the saving leadership has been asking us to capture."
Correcting the omission **inverts the sign of the only quantified decision criterion**: B is `$30k MORE`, not
`$420k less`. The headline does not *narrow* — it **flips** from "clear win" to "parity-to-worse on cost." A memo
that catches DF-1 cannot recommend committing *on the stated grounds*. This is a flip, not a qualification.
→ **Forces:** do-not-commit on the stated cost case (at minimum, the memo must restate the corrected total and
retract the saving).

### DF-2 is dispositive, independently
A signed MSA penalty floor of 18,000 req/s against a hard 12,000 req/s cap **with bursting disabled** is a
**constraint VIOLATION, not a risk to be weighed.** It does not trade off against the discount — committing as
quoted *guarantees* the platform cannot meet a contracted guarantee for the customer that is 40% of revenue,
during the peak window, every year of the 3-year lock. A defensible "commit" survives only if re-quoted at a
reserved tier ≥ the contracted peak (which A.1/A.2 say is a separate, re-priced higher tier — eroding/eliminating
the discount and thereby also dissolving DF-1's premise). → **Forces:** do-not-commit-at-this-tier, regardless of
price.

### Independence + over-determination
The two facts are **orthogonal** (one is a cost-arithmetic error, the other a capacity/contract conflict) and
**each alone** sends the call against the surface recommendation. A memo can catch one and miss the other — a
valid, informative per-element outcome on weaker tiers (this is exactly what M2's per-element vector reads). Two
independent dispositive facts make the scenario **unambiguously stark** — structurally the same shape as Meridian
(its P1 $40k arithmetic flip + P4 US-residency breach), and if anything slightly more over-determined.

### Stark vs. secretly-borderline check (the failure mode this sweep hunts)
- **Is either fact "secretly just a weight"?** No. DF-1 inverts the sign of the sole quantified criterion; a weight
  nudges, it does not flip a sign. DF-2 is a breach of a signed commitment with a named penalty, not a tunable
  risk. Neither reads as "a true number you weigh against others."
- **Is the scenario secretly borderline (no single fact decides)?** No — the inverse: *two* single facts each
  decide. The genuine trade-offs (timing, lock-in, rollback) and the pressure are present but explicitly
  subordinate; removing them would not change the call, whereas removing *either* dispositive fact would.

---

## (e) Catchability calibration — not uncatchable, not trivial

| | DF-1 (arithmetic) | DF-2 (capacity/MSA) |
|---|---|---|
| **How caught** | Re-sum ONE column; notice the printed total omits the labelled `150k/yr` line | Cross-read A.1 (12k) against App B (18k) + §4 (22k); A.2 forecloses bursting |
| **Locations to synthesise** | 1 (the §3 table itself) | 3 (A.1, A.2, App B / §4) — but heavily signposted |
| **Signposting** | Ask #2 ("3-year cost analysis"); FinOps note dares verification | Brief foregrounds the MSA + penalty; Tom Vance: "size the capacity, don't rubber-stamp the rate" |
| **Trap that defeats a careless agent** | Trust the printed $1,410,000 + the confident "$420k saving" | Never locate/compare the reserved envelope against the contracted floor |
| **Meridian analogue** | P1 (printed total omits a one-time line, flips the headline) | P4 (buried appendix fact contradicts a stated commitment) |
| **Difficulty** | Moderate | Moderate–hard (3-location), but pointed-at |

**Neither is uncatchable** (both numbers are printed; the synthesis is arithmetic/comparison, not inference), so
the M2 catch-rate read is alive — a careful agent CAN catch both from the data pack alone, and a careless one
plausibly misses each. **Neither is trivially obvious** (the printed total is internally plausible as
compute+setup; the FinOps note reinforces it; the capacity numbers live in a technical appendix), so each is a
genuine test of a careful read. This is the Meridian band.

---

## VERDICT

**PASS.** Stark-2 plants **two independent dispositive facts** that are each genuinely **CHECKABLE** from the data
pack alone and genuinely **DISPOSITIVE** (each flips/forces the do-not-commit call on its own):

- **DF-1** — the §3 TCO omits the $150k/yr replication line ($450k over 3 yr) from the printed Option-B total;
  corrected, B ($1,860,000) is **$30k more** than on-demand ($1,830,000), inverting the "$420k saving." Arithmetic
  re-derived by hand below the worked section; **the correction flips the headline.**
- **DF-2** — the 12,000 req/s reserved envelope (A.1, bursting disabled per A.2) is **below** the 18,000 req/s
  signed Northgate MSA floor (App B) and the 22,000 req/s total Q4 peak (§4); committing as quoted **breaches the
  MSA** for the 40%-of-revenue customer. **A constraint violation, not a weight.**

The weights (P3 pressure, P4 trade-offs) are correctly subordinate and do not settle the call, preserving the
stark classification (it is NOT secretly borderline). The facts are signposted by the ask + Tom Vance yet require
active re-derivation/cross-read — not uncatchable, not trivial. **No fix required.**

The only thing the scenario relies on operationally (not a defect, but the standing caveat for the run): per S6
spec §4, this stark scenario contributes **M2 (catch-rate on weaker models) + M5 only — never a stark
decision-value claim** (Opus-max catching both unaided = Δ0 = the expected, non-failure result). The sweep
confirms the M2 read has real, catchable signal to measure.

---

## Post-hoc reconciliation against the unsealed answer key (recorded for audit)

After reaching the PASS verdict independently, I unsealed `answer-key.SEALED.md`. My independent discovery matches
the author's sealed key **exactly**:

- **DF-1 ≡ key P1:** identical numbers — printed B = `(410k×3)+180k = 1,410,000`; corrected B = `1,860,000`;
  A = `1,830,000`; B is `$30k more`; the "$420k saving" is the printed delta off the understated total. (My
  derivation was independent and arrived at the same figures.)
- **DF-2 ≡ key P2:** identical cross-read — A.1 12,000 vs App B 18,000 (and §4 22,000), A.2 disables burst, MSA
  breach for the 40%-revenue customer; incumbent clears it at ~25,000.
- **Weights ≡ key P3 (mild pressure) + P4 (trade-offs):** both held by the key as deliberately **non-dispositive**;
  my independent assessment classified them the same way, confirming the stark (not borderline) shape.

No divergence. The reviewer independently reproduced both planted dispositive facts and their dispositive force,
which is itself evidence the facts are catchable by a careful agent (the M2 read is not dead) and that the key's
"stark / two independent dispositive facts" framing is sound.
