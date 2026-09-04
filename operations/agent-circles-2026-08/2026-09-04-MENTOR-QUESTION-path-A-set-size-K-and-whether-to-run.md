# Mentor question — Path A: a set-size conflict with the record, the measurement K, a design change already made, and whether the run is still worth its purpose

**Authored 2026-09-04.** `governance`, documents only. **Nothing here is a build, an activation, a
production read, or a spend.** Option S is built and unpopulated; **no live call has been made**;
`runs/` is empty; no credential exists for it. Weights remain BLOCKED, GS-CYB-1's two conditions are
untouched, the Q1 hard constraint holds, and the M/W/S election and R8-D7's sampling policy remain
deferred in writing.

**What this asks.** Four things, all about **Path A** — the route the 2026-09-04 ruling recommended
for satisfying the Option S gate on its two dependent items. **None of them reopens that ruling.**
Three are questions the ruling could not have anticipated because the facts were found afterwards;
one is a design change the founder has already elected and which we are disclosing for confirmation
or correction rather than presenting as settled.

---

## Three disclosures made up front, because each bears on how much weight this document deserves

**1. One of these questions says a figure in the ruling disagrees with our own primary record.** We
state it because it is checkable and because acting on the wrong number would waste the run — not to
relitigate the ruling. We have deliberately **not** picked a side, and the resolution we recommend is
a production query, not an argument.

**2. We have a stake in Q-S3, and the recommendation there is ours.** The forward-looking design
change in Q-S3 was proposed by this session and adopted by the founder the same day. It makes our
own prior work look better than it was. We have tried to state what it does *not* fix as prominently
as what it does.

**3. A repo session cannot read production.** The set-size question (Q-S1) is therefore **unresolved
from here** and is stated as a conflict between two documents, not as a finding about the data. The
SQL that settles it is authored and not run.

---

## PART 1 — The mechanism facts (PR20; each verified at source 2026-09-04, not inherited from a summary)

**M1 — The S6 report's own outcome table says the run produced 15 winners, not 20.**
`2026-08-16-idea-loop-S6-report.md` §2: `winner` **15 (75%)**, across cycles 1, 2, 4, 7, 8, 9, 10,
11, 12, 13, 14, 17, 18, 19, 20. Five cycles produced no winner — `dependency_unavailable` on 3, 5, 6;
`null_cycle` on 15, 16. The same report (§ near line 179) confirms **120 candidates** and **9
guardrail rejections**. **15 + 9 = 24.**

**M2 — The 2026-09-04 ruling states 29.** Verbatim: *"the closed run's persisted candidates (M8's 29
decision-bearing candidates — 20 cycle winners plus the 9 guardrail rejections)"*, and the cost
figure *"approximately 87 calls at approximately $1.24"* is 29 × 3. The **rejections agree** at 9;
the conflict is entirely in the winner count.

**M3 — The c11 re-submission experiment already exists, at K=10, and we found it before spending
anything.** `2026-08-30-c11-rerun-experiment-record.md`: ten calls, 2026-08-29, on the byte-exact
c11 text with a **minimal payload** (`{"action": <stored proposed_action>}` — no wrapper, no
`agent_id`, server default band). **9/10 `deliberate`/proceed, 1/10 `reflexive`/blocked.**
p̂_floor = **0.10**; Wilson 95% ≈ 2–40%. The record's own framing: *n=10 is "a rate demonstration,
not a rate measurement."*

**M4 — That experiment localized the mechanism, and it is not the deterministic layer.** On
identical text the Layer-1 extractor assigned the same grave-act indicator to **four different
states** — absent ×4, `phantasia` ×2, `synkatathesis` ×3, `praxis` ×1 — and **only the `praxis`
reading fires** the ADR-010 §4 andreia floor. Layer 2 computes faithfully from what it is given;
what varies is what it is given.

**M5 — The examination engine changed after the run closed.** The run closed 2026-08-16. Commit
`f7619d9` (2026-08-24) replaced `ruling_faculty_state`'s deliberation proxy **inside
`layer2-mechanisms.ts`** — the deterministic Layer 2 itself. Verified by reading the commit's own
file list. The c11 record names this in its §5(a): it *"speaks for the instrument the standing runner
would live on, and only approximately for August 10–16."*

**M6 — Cost is now measured, not estimated.** $0.142215 across the c11 record's ten responses =
**$0.014222/call**. So 24×3 ≈ $1.02; 29×3 ≈ $1.24 (which is where the ruling's figure comes from);
**24×10 ≈ $3.41; 29×10 ≈ $4.12.**

**M7 — D6a's 12% was measured on synthetic probes, and its own metadata says the consult path is
unmeasured.** We reproduced its published interval independently (`wilson_interval(12,100)` →
0.070–0.198 = the published 7.0–19.8%).

**M8 — A schema fact that would have silently corrupted the run.** Our first extraction SQL filtered
`cycle_outcome = 'selected'`. That is **not a legal value** — the CHECK admits `winner`. It would
have returned **zero winners** without erroring. Found by independent review; corrected. We mention
it because it is the same class as M1: a checkable fact about the set that nobody had checked.

---

## PART 2 — The four questions

### Q-S1 — The decision-bearing set is 24 or 29. Which governs, and does the ruling's figure need a correction note?

The ruling says 29 (20 winners + 9 rejections). The S6 report says 15 winners (M1), giving 24. The
rejections agree.

**We do not resolve this and recommend it not be resolved by argument.** `EXTRACTION.sql` §0/§PRE is
authored to settle it against production, scoped by `loop_id`, counted with the exact predicate the
extraction uses. **Our recommendation: carry whatever production returns, and carry the discrepancy
with it** — if production returns 24, the ruling's "20 cycle winners" is a figure worth correcting in
the record rather than quietly overwriting, since it also sets the ruling's cost estimate.

**What we are asking:** is the production count authoritative for defining the set, or does "29"
carry a definition of *decision-bearing* we have not reconstructed — for instance one that counts the
five no-winner cycles' best candidates, or `not_selected` rows, as decision-bearing?

### Q-S2 — What K should the measurement use? R8 rules K=3 as a policy parameter; it was never ruled as a measurement K.

R8 §5.3 rules `K = 3` as the **operating parameter of median-of-3**. Our first build silently
inherited it as the **measurement** K. D6a chose **K=10** with a stated power rationale.

At K=3 a per-input floor estimate takes values in **{0, ⅓, ⅔, 1}** only. The c11 record calls its own
n=10 *"a rate demonstration, not a rate measurement"* (M3). Cost (M6) makes the difference **~$3**.

**Our recommendation: K=10.** It is D6a-comparable, gives a usable per-input p̂, and the cost argument
for K=3 has collapsed now the per-call figure is measured. **We ask whether K is ours to elect as
measurement design, or whether — because it determines what the M/W/S election can be ruled on — it
belongs with the deferred items.**

### Q-S3 — We have already made a design change to Path A. Is it within the ruling's terms?

**The change, founder-elected 2026-09-04:** Option S no longer compares a resampled verdict against
the candidate's **recorded** verdict. It measures **today's gate on real candidate texts**, and
`recorded_proximity` is retained only as inert provenance.

**Why.** Two limits bit only on the comparison, and both dissolve without it: whether August's call
sent the stored text or a per-cycle wrapper (the 2026-08-29 §7(1) assumption), and the engine change
at M5. A comparison across an unverified payload *and* a changed engine measures little.

**Why we think it is within Path A's terms, and not a workaround:** the ruling asks for *"the
per-input disagreement rate"* on the closed run's **candidates**, and never required comparing to
their recorded verdicts. Further, the ruling's own Q2 says what the existing measurement lacks is
*"the live decision-bearing rate — the rate on real candidate texts produced by the loop in
operation, not on frozen synthetic probes or a single repeated candidate."* Real candidate texts
examined on **the engine any M or W policy would actually operate** is that object, and it is exactly
the marginal value over D6a (M7).

**What it does not fix, stated because the change is ours:** the set-size question (Q-S1); no
counterfactual re-election is attempted; variance is multi-channel, so a floor count does not
identify which floor fired; and the sample remains **unrepresentative of a future candidate stream**
— the rejection stratum is *enriched* for floor-prone texts, which makes it the right population for
the floor-borderline question and the wrong one for a general rate.

**What we are asking:** confirm the forward-looking reading is within Path A, or correct it. If the
ruling intended the resampled-vs-recorded comparison specifically, we have changed the instrument's
object and should be told so.

### Q-S4 — Given M3 and M4, is the run still worth its purpose — and should it wait on the M/W/S election rather than precede it?

The gate's stated purpose was the live decision-bearing rate. But since the ruling:

- the **mechanism** is localized (M4) — the run would not discover *why* the gate varies;
- **c11 already has K=10** (M3), so one input's rate is in hand;
- **D6a has n=100** (M7) on synthetic probes.

Path A's remaining contribution is **prevalence across the decision-bearing population on real
texts** — genuinely what Q2 named as missing, and genuinely not yet measured. So our answer leans
*yes*.

**But we notice a sequencing question we cannot answer.** The data exists to serve the M/W/S
election. Whether a per-input floor rate on 24–29 closed-run texts, at whatever K, is the evidence
that election actually needs is a question about the election — which is deferred, and yours.

**Our recommendation: rule Q-S1–Q-S3 together with a statement of what the M/W/S election needs from
this data**, so the run is specified by its consumer rather than by our reconstruction of it. If the
answer is that the election needs something this instrument does not produce, that is far cheaper to
learn now than after the run.

---

## PART 3 — The counter-case against our own recommendations

**Against Q-S2's K=10:** it quadruples the calls, and if the true per-input floor rate is near zero
across most inputs, K=10 buys precision on a quantity that is uninteresting for the winner stratum.
K=3 on the **rejection** stratum plus K=10 on nothing may be the efficient design. We recommend K=10
anyway because the cost is ~$3 and because an underpowered result that cannot discriminate is the
more expensive outcome.

**Against Q-S3's forward-looking change:** it was proposed by the session whose earlier design the
change repairs, and it dissolves two limits that were embarrassing to that design. A reader is
entitled to discount it on that basis. Our defence is that the ruling's own Q2 language supports it
independently of who proposed it — but we would rather have that tested than assumed.

**Against Q-S4's "yes":** if the mechanism is known and the direction is known, a prevalence figure
may change no decision. The honest test is the one we cannot apply: would a rate of 4% versus 15%
change the M/W/S ruling? If not, the run is measurement for its own sake.

---

*Nothing here is licensed to build, spend, activate or publish. The Option S instrument is built,
unpopulated, and has made no call. The founder has elected the forward-looking design and holds the
run.*
