# Mentor ruling — S11-D2 × the observation window: "after the baseline" means MID-WINDOW (VERBATIM)

**Received 2026-09-06 (machine date), in answer to
`operations/trust-layer-2026-07/2026-09-06-D2-window-sequencing-guard-collision-SCOPE-FOR-RULING.md`
(session S5b).**
**Status: ADOPTED AS BINDING SPECIFICATION**
(`D-MENTOR-RULING-D2-WINDOW-SEQUENCING-MID-WINDOW-ADOPTED-2026-09-06`).

**This file is the canonical record. Verbatim wins over every summary of it, including the
itemisation below it, the decision-log entry, the register cells, and the standing opener.**

**Binds:** the sequencing of the S11-D2 engine correction against the running false-hold observation
window; the byte-identity guard's stand-down shape; the segmentation design; and a new SHA-256
content pin owed on `layer2-mechanisms.ts`.

---

## The ruling (verbatim)

## S11-D2 × the observation window — "after the baseline" means MID-WINDOW

Reading A is ruled. The correction lands mid-window, after a defined baseline threshold is established, while the window continues to record.

---

### On the sub-question that may decide it

The document correctly identifies §7 as load-bearing and flags that both readings assume opposite answers without either being established. The ruling addresses it first, because the rest follows from it.

Read-side segmentation of the AE-1/S11b kind does transfer to a mid-window write-side change, under one condition: the boundary is dated, recorded, and the fields that change are distinguishable in the recorded data.

The document establishes that condition is met. §3.3 shows the two regimes are distinguishable in the recorded fields — `circles`, `virtue_domains_engaged`, and the `is_kathekon` trigger are all present in the record. A reader of the buffer can identify, for every record, which tagging regime produced it, by inspecting those fields directly. The boundary does not need to be inferred. It is legible in the data.

The AE-1 precedent segmented on the read side of records whose content was fixed. The content here changes at the boundary. But the segmentation's purpose is the same in both cases: to prevent a mixed-regime population from being treated as a single-regime measurement. That purpose is served by a dated boundary and distinguishable fields, regardless of whether the change is to the read or the write side. The precedent transfers.

B6's objection — that the precedent assumes the answer — is answered by this: the condition the precedent requires is met, and the document demonstrates it is met. That is not assuming the answer. It is establishing the precondition.

---

### Why Reading A governs

**On the language.** The ruling says "opens" twice, in two separate binding documents. It does not say "closes." Reading B requires inserting a word the ruling did not use. The plain language forecloses that insertion.

**On the stated purpose.** The ruling's reason for the sequencing is that the correction's effect on the proximity score should be observable against a known prior state. Under Reading B, the window closes having observed only the prior state. The correction's effect is observed by some later, unspecified instrument. That is not what "observable against a known prior state" describes. It describes a single instrument observing both sides of a boundary — which is Reading A.

**On the named consequence.** The D2 ruling's carried-items section names the mid-window regime boundary and points at AE-1/S11b segmentation as the precedent. That entry is not decorative. The ruling would not name a remedy for a consequence its own sequencing did not produce. Under Reading B there is no mid-window boundary and no regime to segment. The carried item is pointless. The ruling named it because Reading A is what the sequencing produces.

**On the deferral warning.** The ruling states explicitly that the sequencing is not a licence to defer the correction indefinitely. Reading B ties the correction to a window whose close requires ≥7 days and a representativeness break-out. Given the guard population's structural narrowness, that break-out may be governed by consult accrual, which the document reports as highly variable. Reading B's deferral is bounded in principle but unbounded in practice. The warning forecloses it.

**On the guard.** The guard detects uncommitted modifications only. A committed-and-deployed change to `layer2-mechanisms.ts` would not trip it. Reading B cannot rest on the guard's existence as enforcement of a post-window rule. The guard is consistent with Reading B but does not establish it. B2's argument from the guard's arming proves less than it claims.

---

### On B1's contamination argument

B1 is the strongest argument for Reading B and it is answered directly.

The scoping note's contamination rule — a window contaminated mid-flight by instrument edits measures neither state — applies to uncontrolled instrument edits. It does not apply to a controlled, dated, recorded boundary with distinguishable fields on both sides. The rule's purpose is to prevent a mixed-regime population from being treated as a single-regime measurement. A dated boundary with read-side segmentation serves that purpose. The contamination rule is satisfied, not violated, by Reading A executed correctly.

The distinction matters. An uncontrolled edit contaminates because the boundary is unknown and the regimes are indistinguishable. A controlled edit with a recorded boundary and distinguishable fields does not contaminate — it creates two segments, each internally consistent, each measurable on its own terms. The scoping note's rule was written for the former. It does not reach the latter.

§3.3b's finding sharpens this further. On the data so far, the D2 tagging defect is concentrated in the guard population, which is not part (3)'s measured population. The consult population — which is what part (3) measures — shows zero defect records in the early data. If that distribution holds, the mid-window correction changes nothing in part (3)'s denominator, and the contamination argument for part (3) specifically falls away. The document correctly notes this is n=3 consult records and must not be relied on as a finding. It is flagged here for the same reason the document flags it: if it holds, it is arguably decisive, and the window will measure whether it holds.

---

### What Reading A requires — the three operational questions

**1. The baseline threshold.** The baseline is established at five ordinary post-remedy days of consult window data, on the same discipline as the F-3′ measurement. This is consistent with the consult-side bound threshold set in the F-3′ ruling. Five days is enough to characterise the prior state if the consult population is accruing at the rates the document reports. If the consult population is accruing at zero on some days, the threshold is five days with meaningful consult records — days producing at least one consult record count; days producing zero do not.

The baseline threshold is five ordinary days with consult records. The correction may land after that threshold is met.

**2. The guard stand-down.** The obvious mechanism is unavailable: unsetting `GATE1_FALSE_HOLD_CAPTURE` disarms the guard and stops capture simultaneously. The correct shape is a recorded founder waiver for the named commit, with the guard left armed and the exception documented rather than encoded. An explicit allowlist in the guard for the specific D2 files is also acceptable, provided it is landed as its own reviewed change and removed after the correction is committed.

What must not happen is a silent commit that evades the check by exploiting the committed-edit coverage gap. The document names this trap correctly. The stand-down is explicit, recorded, and named — never a prompt commit that merely avoids detection.

**3. The segmentation design.** The segmentation boundary is the commit timestamp of the D2 correction to `layer2-mechanisms.ts`. Records before the boundary are the baseline regime. Records after are the corrected regime. The distinguishing fields — `circles`, `virtue_domains_engaged`, the presence or absence of the `is_kathekon` trigger — are present in every record and allow post-hoc verification that the boundary is correctly placed.

The guard disclosure spans two tagging regimes and is reported as such, with the boundary dated.

A SHA-256 content pin on `layer2-mechanisms.ts` is owed under Reading A, for the same reason §C2b pins `stoic-brain.ts`. The pin is added before the baseline threshold is met, so that any uncommitted edit to the file during the baseline period trips the guard. After the correction is committed, the pin is updated to the corrected file's hash. This makes the post-baseline rule genuinely enforceable rather than nominal, and closes the committed-edit gap for D2's target file.

---

### Summary of what the founder may do

The window runs. The baseline threshold is five ordinary days with consult records. After that threshold is met, the D2 correction may land, under a recorded founder waiver or an explicit scoped allowlist, never a silent commit. A SHA-256 content pin on `layer2-mechanisms.ts` is added now, before the baseline period, and updated after the correction commits. The segmentation boundary is the correction's commit timestamp. The guard disclosure reports two tagging regimes with the boundary dated. S11-D2 opens after the baseline threshold is met. The window continues to run after the correction lands.

---

## The binding ruling, itemised (paraphrase — the verbatim above governs)

1. **READING A GOVERNS. The correction lands MID-WINDOW**, after a defined baseline threshold, **while
   the window continues to record.** The window also **continues to run after the correction lands.**
2. **The §7 sub-question is answered FIRST and affirmatively:** read-side segmentation **does transfer**
   to a write-side change **under one condition** — the boundary is **dated, recorded, and the changed
   fields are distinguishable in the data.** That condition is **established as met**: `circles`,
   `virtue_domains_engaged` and the `is_kathekon` trigger are in every record, so *"the boundary does
   not need to be inferred. It is legible in the data."*
3. **B1 (contamination) is answered, not overridden.** The scoping note's rule reaches **uncontrolled**
   edits, where the boundary is unknown and regimes indistinguishable. *"The contamination rule is
   satisfied, not violated, by Reading A executed correctly."*
4. **Four grounds for Reading A:** the plain language (*"opens"* twice, never *"closes"*); the stated
   purpose (a single instrument observing both sides); the named carried item (a remedy for a
   consequence Reading B does not produce would be *"pointless"*); and the deferral warning (Reading
   B is *"bounded in principle but unbounded in practice"*).
5. **The guard argument (B2) proves less than it claims** — it detects uncommitted edits only.
6. **BASELINE THRESHOLD: five ordinary days WITH CONSULT RECORDS.** Days producing **≥1** consult
   record count; **days producing zero do not.**
7. **STAND-DOWN SHAPE: a recorded founder waiver for the named commit**, guard left armed, exception
   **documented rather than encoded**. An explicit scoped allowlist is also acceptable **if landed as
   its own reviewed change and removed after.** **A silent commit exploiting the coverage gap is
   forbidden.**
8. **SEGMENTATION BOUNDARY = the commit timestamp** of the D2 correction to `layer2-mechanisms.ts`.
   The guard disclosure **spans two regimes and is reported as such, with the boundary dated.**
9. **A SHA-256 CONTENT PIN ON `layer2-mechanisms.ts` IS OWED — ADDED NOW, BEFORE THE BASELINE PERIOD**,
   and **updated to the corrected hash after the correction commits.**

## What this ruling does NOT do

- **It does not open S11-D2.** That opens **after** the baseline threshold is met.
- **It does not license the correction today.** Five ordinary days with consult records must accrue.
- **It does not touch the S11 flip or weights.** Both remain **REFUSED / BLOCKED**.
- **It does not resolve the guard/consult defect distribution** (§3.3b, n=3) — *"the window will
  measure whether it holds."*
