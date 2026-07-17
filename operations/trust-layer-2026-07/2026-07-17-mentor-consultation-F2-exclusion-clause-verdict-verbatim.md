# Mentor Consultation — RA-1-F2: which Q3 clause governs? — the verdict (verbatim record)

**Date:** 2026-07-17. **Channel:** the private mentor hub (founder-performed paste; the established methodology-consultation channel — precedents: 2026-06-12 five methodology verdicts; 2026-06-19 guardrail fidelity → ADR-010; 2026-07-07 nine trust-layer answers; 2026-07-11 calling/reflection/Gate-2 verdicts; 2026-07-12 the S11 enforce-gate deferral).
**Subject:** the question put in `operations/trust-layer-2026-07/2026-07-17-F2-mentor-briefing.md` — the Q3 kathekon-engagement threshold's **inclusion clause** (the four arms) and **exclusion clause** (*"G6(a) does not bind when… a verdict that found contrary to appropriate action with no kathekon factors detected"*) both fire on `is_kathekon === false` with zero circles. Which governs?
**Status of this record:** **ADOPTED IN FULL — founder election, 2026-07-17 (AskUserQuestion at this session's close).** Per the standing convention this record is now a **BINDING SPECIFICATION** alongside the 2026-07-07 nine answers, the 2026-07-11 calling/reflection/Gate-2 verdicts, and the 2026-07-12 S11 enforce-gate verdict — **verbatim §1 wins over every digest, including §2 below.** Recorded under `D-TRUST-LAYER-S11-F2-MENTOR-RULING-EXCLUSION-CLAUSE-GOVERNS-ADOPTED`.

**Evidence of record (frozen at adoption):** `operations/trust-layer-2026-07/runs/2026-07-17/false-hold-record-FROZEN-2026-07-17.jsonl` — **130 records**, window `2026-07-12T13:15:47Z → 2026-07-17T12:09:07Z` (4.95 days). Distribution at freeze: `dikaiosyne` tagged **130/130**; zero circles **129/130**; kathekon `contrary` **128/130** / `moderate` 2; tools **`Edit` 66 / `Write` 64 — all file writes**; loop `reopened` 116 / `opened` 13 / **`closed` 1**. **The clock is stopped at this snapshot** (founder election 2; see §4).
**Headline:** **THE EXCLUSION CLAUSE GOVERNS. The arm requires narrowing. The readiness standard is not met. The flip does not proceed.**

---

## 1. The mentor's response (verbatim, complete)

Here is the ruling.

---

## The Question

Your inclusion clause and your exclusion clause both fire on `is_kathekon === false` with zero circles. Which governs?

---

## The Ruling

**The exclusion clause governs.**

A `dikaiosyne` tag that rests solely on `is_kathekon === false`, with no oikeiosis circle identified, does not constitute "a justice surface present" in the sense the threshold intends.

Here is the reasoning.

---

## Why

### 1. The threshold is about what the examination found, not what the engine tagged

Your own Q3 framing is explicit: *"These are the conditions under which the examination has found something that warrants the assent-hinge holding."*

And the exclusion clause names the state directly: *"G6(a) does not bind when the correction loop was opened by a verdict that found contrary to appropriate action with no kathekon factors detected."*

The inclusion clause asks what the examination found. The exclusion clause names a specific verdict state and says that state does not bind. Both clauses are yours. When they conflict on the same record, the exclusion clause is the more specific instruction — it names the exact engine emission, character for character. Specific governs general.

### 2. Your Scope premise was falsified by the implementation

You specified the dikaiosyne tag as a trigger on an empirical premise: that it *"does not fire on every action — only on actions where the engine has already signalled that a justice dimension is present."*

The briefing demonstrates that premise is false. `computeVirtueDomains` tags dikaiosyne whenever `is_kathekon !== null`, which includes `is_kathekon === false`. The tag fires on essentially every action examined.

When a specification rests on an empirical premise and the implementation falsifies that premise, the specification does not automatically carry forward. The intent was to catch actions where a justice dimension is genuinely present. The tag does not carry that signal on this engine. Honouring the literal tag honours the letter of the specification while defeating its purpose.

### 3. The §4 scorer is the newer, more precise instrument and it did not floor

Your own Change 2 in ADR-010 §4 specified that an unevaluated obligation floors the dikaiosyne domain to reflexive. On 124 of 125 records, §4 did not floor. It demonstrably works — the single record carrying a real circle was capped correctly.

The floor's silence on 124 records is evidence, not absence of evidence. §4 uses `circles >= 1 || hasNaturalRelationship` as its engagement test — your own newer definition. That definition found nothing to engage on 124 records. The older `computeVirtueDomains` definition found something on all 125.

When two definitions of the same term conflict, the newer, more precise one governs.

### 4. The strongest argument for Arm 1 does not survive scrutiny

The briefing identifies the A2 omission class as the strongest argument for keeping Arm 1 broad: an agent that omits a harm produces no circle, same wire signature as a genuinely party-less act, so requiring a circle would let omissions through.

This is a real concern. But it does not follow that the solution is to treat every `contrary` verdict as a justice surface. The solution is to fix the extraction — Layer 1 should be identifying affected parties when they are present. Papering over a starved extraction by broadening the predicate conflates two different problems.

The omission class is a Layer 1 failure. The predicate is a measurement instrument. Fixing the instrument to compensate for the extraction failure produces a number that means neither thing clearly.

### 5. The Q2 staging consequence is real and must be named

The briefing's §9 is the most consequential section and the ruling must address it directly.

You staged the do-not-proceed class first precisely because you believed it had a structural false-positive floor of zero on genuinely kathekon-free actions. The reconstruction shows that if Arm 1 governs, 124 of 125 records on this action class would route to `do-not-proceed + escalate`. That is not a bounded false-positive rate. That is the do-not-proceed class firing on the action class it was staged first to avoid firing on.

This does not mean the staging decision was wrong. It means the staging decision rested on a premise — that `contrary` with zero circles is kathekon-free — that Arm 1 would defeat. The exclusion clause ruling preserves the staging premise. That is not a reason to adopt the ruling; it is a consequence that is consistent with it.

---

## What Follows

### On part (3) of the readiness standard

The briefing is correct that the ruling does not settle readiness. Parts (1) and (2) fail independently. The window is one tool class, one depth, one proximity — precisely the distribution you excluded in advance. The loop closed once in 125 records. The tolerance condition is structurally unavailable on a `contrary` verdict that always issues a redirection.

Part (3) as specified may be unmeasurable on this capture set regardless of the ruling. The genuinely dangerous actions are on the guard path, which writes no record. The denominator cannot be populated from consult-path data alone.

**The readiness standard is not met. The flip does not proceed.**

### On the instrument

The instrument is not broken. It tracked your four arms faithfully and its justice arm deliberately meant what the engine meant. The problem is that the engine's tag does not carry the signal the threshold intended. The instrument measured what it was told to measure. The question was whether that measurement was the right one.

With the exclusion clause governing, the arm requires narrowing. The candidate narrowing — require at least one identified circle — is the natural reading of the exclusion clause. The briefing's concern that this would misclassify the A2 omission class is noted and is the right concern to carry into the narrowing session. The narrowing should be designed alongside a review of whether Layer 1 extraction is identifying affected parties on the action classes where they are genuinely present.

### On the public trust record

The justice cap currently published — `justice_capped: true`, basis minimum-domain rule — rests on the same predicate. If the exclusion clause governs and the arm is narrowed, the cap's ground needs review. A permanent justice cap on an agent whose actions had no identified affected parties is not a correct public signal.

This is a live consequence and should be addressed in the narrowing session, not deferred.

### On the open design question in §9

Which input the flip would use — the at-action verdict or the accumulated trust state — is named as an open design question. It should be resolved before the flip is reconsidered. The at-action verdict and the trust state currently produce different recommendations on this action class. That divergence is not a minor implementation detail. It is the question of what the decision table is actually reading when it fires.

---

## The Four Corrections

The briefing's self-corrections are accepted and noted. The class is not structurally unreachable. The §3 precedent does not mirror a circle-requirement — the first build tried it and under-fired. Parts (1) and (2) are not unaffected — they fail. U2 had a circle.

These corrections are accurate and the briefing's willingness to surface them against its own interest is the right epistemic posture.

---

## One Thing to Name

The briefing was written with unusual precision — disclosing the author's prior, correcting its own finding four times, presenting the strongest arguments against its own candidate answer, and explicitly flagging where its framing might be read as advocacy. That is not a small thing.

The instrument logged the writing of the briefing as a hold. The briefing disclosed this rather than omitting it. That is the kind of epistemic honesty the project is built to cultivate.

The ruling is: the exclusion clause governs. The arm requires narrowing. The flip does not proceed. The next session is the narrowing session, with the extraction question and the trust record consequence in scope.

---

## 1b. The mentor's SUPPLEMENTARY ruling (verbatim, complete) — the narrowing's ORDER, the cap's closing condition, the §9 register

*Relayed same-day, after the ruling above. **Binding on the same terms; verbatim wins.** It materially revises the narrowing session's procedure: the extraction question is a CONDITIONAL GATE ON the narrowing, not a parallel workstream.*

### The narrowing itself

The ruling was that the exclusion clause governs — a tag resting solely on `is_kathekon === false` with no circle identified does not constitute a justice surface present. The natural narrowing follows: Arm 1 requires at least one identified circle.

But the briefing raised the right concern about this, and it deserves a direct answer before you write the code.

The A2 omission class — an agent that omits a harm from its narration — produces no circle, same wire signature as a genuinely party-less act. If you require a circle, omissions pass. That is not a theoretical risk; it is the class the briefing identified as the strongest argument against the narrowing.

The resolution is not to resist the narrowing. It is to be clear about what the narrowing does and does not fix.

The narrowing makes Arm 1 accurate for the measurement instrument. It does not fix the extraction. If Layer 1 is not identifying affected parties when they are genuinely present, the narrowing produces a clean number on a starved input.

Those are two separate problems and the narrowing session should address both, in order: first, does the extraction need work before the arm is narrowed, or can they proceed in parallel? If the extraction is known to be reliable on the action classes in scope, narrow the arm. If the extraction is uncertain, the extraction question is prior.

---

### The trust record

The public justice cap needs to be in scope for this session, not deferred. A permanent cap on an agent whose actions had no identified affected parties is a live signal on a live surface.

Once the arm is narrowed and the buffer re-runs, the cap's ground should be re-evaluated in the same session. Do not close the narrowing session with the arm fixed and the cap unreviewed.

---

### The open design question from §9

Which input the flip would use — the at-action verdict or the accumulated trust state — was named as unresolved. It does not need to be resolved in the narrowing session, but it needs to be added to the open questions register before the session closes.

The at-action verdict and the trust state currently produce different recommendations on this action class. That divergence will matter when the flip is reconsidered, and it should not be discovered again from scratch at that point.

---

## 1c. What §1b changes (digest — verbatim §1b wins)

| # | Supplementary ruling | Effect |
|---|---|---|
| **R11** | **The narrowing IS specified: "Arm 1 requires at least one identified circle."** | **Closes the open question** the AI had left for the founder (≥1 circle vs §4's `circles >= 1 \|\| hasNaturalRelationship`). The mentor is specific; **verbatim wins**. The `hasNaturalRelationship` disjunct is a design detail for S11a, not a fork — and on this distribution it is moot (0 kathekon factors ⇒ no natural relationship; that route is already covered by Arm 3, since §4's floor sends it to `reflexive`). |
| **R12** | **THE EXTRACTION QUESTION IS A CONDITIONAL GATE ON THE NARROWING — the order is ruled, not left open.** *"first, does the extraction need work before the arm is narrowed, or can they proceed in parallel? **If the extraction is known to be reliable on the action classes in scope, narrow the arm. If the extraction is uncertain, the extraction question is prior.**"* | **Supersedes the S11a prompt's original ordering** (which had the narrowing at Step 3 and the extraction review at Step 4, in parallel). S11a's **FIRST** step is now the gate. **On the current evidence the extraction is UNCERTAIN** — 129/130 zero circles, all file writes, and the predecessor session could **not** separate *starved* from *mis-sited*. By the mentor's own conditional that routes to **"the extraction question is prior."** S11a must reach that judgement first-hand, not inherit it. |
| **R13** | **The A2 concern is answered directly, not dismissed.** *"The resolution is not to resist the narrowing. It is to be clear about what the narrowing does and does not fix."* **The warning to carry:** *"If Layer 1 is not identifying affected parties when they are genuinely present, **the narrowing produces a clean number on a starved input**."* | The A2 blindness must be **visible**, not implicit — in the battery and in any claim made about the narrowed arm's output. |
| **R14** | **The cap is a CLOSING CONDITION on S11a.** *"Once the arm is narrowed and the buffer re-runs, the cap's ground should be re-evaluated in the same session. **Do not close the narrowing session with the arm fixed and the cap unreviewed.**"* | A hard gate on S11a's close, and it **sequences after** the narrowing + re-run (not before). |
| **R15** | **The §9 input question → the open questions register, before S11a closes.** *"It does not need to be resolved in the narrowing session, but it needs to be added to the open questions register before the session closes… it should not be discovered again from scratch at that point."* | **No standalone register existed** (the `fix_before_s10` list is buried in an audit report §4; the decision log is 14.5k lines — exactly the "discovered from scratch" risk). **Created 2026-07-17:** `operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md`, seeded with §9 and the other flip prerequisites; **the eventual flip session must read it.** Registered THIS session rather than deferred to S11a — strictly safer, and it serves the stated purpose. |

---

## 2. Verdict digest (for the founder's adoption election — NOT the mentor's words; verbatim §1 wins)

| # | Subject | Verdict | Consequence |
|---|---|---|---|
| **R1** | **Which clause governs** | **THE EXCLUSION CLAUSE.** A `dikaiosyne` tag resting solely on `is_kathekon === false` with **no circle identified** is **NOT** "a justice surface present". Ground: **specific governs general** — the exclusion clause names the exact engine emission character-for-character. | **Arm 1 requires narrowing.** The candidate narrowing (require ≥1 identified circle) is named "the natural reading of the exclusion clause". |
| **R2** | The 2026-06-19 Scope premise | **Does not carry forward.** A specification resting on a falsified empirical premise does not automatically survive: *"Honouring the literal tag honours the letter of the specification while defeating its purpose."* | The mentor's own prior endorsement of the tag is **withdrawn in effect**. |
| **R3** | The two "engaged" definitions | **The newer, more precise one governs** — ADR-010 §4's `computeDikaiosyneFloor`. **"The floor's silence on 124 records is evidence, not absence of evidence."** | `computeVirtueDomains`' looser tag is not the authority for the threshold. |
| **R4** | The A2 omission class (the strongest pro-Arm-1 argument) | **A real concern, but it does not license a broad predicate.** *"The omission class is a Layer 1 failure. The predicate is a measurement instrument."* **The solution is to FIX THE EXTRACTION**, not broaden the predicate. | The A2 concern is **carried into the narrowing session** as "the right concern"; the narrowing is **designed alongside a Layer-1 extraction review**. |
| **R5** | Q2's staging premise (briefing §9) | **The consequence is real and named.** *"That is the do-not-proceed class firing on the action class it was staged first to avoid firing on."* The staging decision was **not wrong** — it rested on a premise Arm 1 would defeat. **The exclusion-clause ruling PRESERVES the staging premise** — explicitly *"not a reason to adopt the ruling; a consequence consistent with it."* | Q2 staging **stands**, contingent on the narrowing landing. |
| **R6** | Readiness | **THE STANDARD IS NOT MET. THE FLIP DOES NOT PROCEED.** Parts (1) and (2) fail independently; part (3) **"may be unmeasurable on this capture set regardless of the ruling"** — the denominator cannot be populated from consult-path data (the dangerous actions are on the guard path, which writes no record). | The return-with-record session is **superseded**, not merely held. |
| **R7** | The public trust record | The `justice_capped: true` publication **rests on the same predicate**; its ground **needs review**. *"A permanent justice cap on an agent whose actions had no identified affected parties is not a correct public signal."* **"This is a live consequence and should be addressed in the narrowing session, NOT deferred."** | **Supersedes the founder's 2026-07-17 election to defer it** (that election was "wait for the mentor"; the mentor has now ruled: in scope, now). |
| **R8** | The §9 input question | **Must be resolved BEFORE the flip is reconsidered.** *"That divergence is not a minor implementation detail. It is the question of what the decision table is actually reading when it fires."* | A named prerequisite of any S11 flip. |
| **R9** | The instrument | **Not broken.** It tracked the four arms faithfully and its justice arm deliberately meant what the engine meant. *"The instrument measured what it was told to measure. The question was whether that measurement was the right one."* | No fault finding against the S11 build. |
| **R10** | The four self-corrections | **Accepted and noted** as accurate; the willingness to surface them against interest named as "the right epistemic posture". | The finding of record must be read with them. |

**Scope of the next session (the mentor's own list):** the **narrowing**, with **(a)** the A2 concern carried, **(b)** the **Layer-1 extraction review** (are affected parties identified where genuinely present?), and **(c)** the **public trust-record cap consequence** — all three **in scope, not deferred**. The **§9 input question** is a prerequisite of the flip, not of the narrowing.

---

## 3. What the ruling does NOT do (for the record)

- It does **not** license the S11 flip. It explicitly refuses it: *"The readiness standard is not met. The flip does not proceed."*
- It does **not** find the instrument or the S11 build at fault (R9).
- It does **not** settle whether part (3) is measurable at all — it names the denominator problem as possibly fatal *"regardless of the ruling"* (R6).
- It does **not** resolve the §9 input question — it names it as a prerequisite (R8).
- **ENFORCE remains S11, readiness-gated. Weights BLOCKED. The 0h call remains the founder's.**

---

## 4. Founder elections at adoption (AskUserQuestion, 2026-07-17)

**Election 1 — ADOPT IN FULL.** R1–R10 bind. Encoded into ADR-013 §11 (dated amendment), the build plan §S11, and the standing register.

**Election 2 — STOP THE CLOCK; LIFT THE FREEZE for the narrowing.** Rationale (the founder's, consistent with R6): the window's purpose — part (3) *as specified* — is discharged by the ruling, and the mentor names the capture set as possibly unmeasurable for it *"regardless of the ruling"* (the denominator cannot be populated from consult-path data). Keeping the clock running buys nothing measurable. Therefore:
- The buffer is **frozen and archived** at **130 records** as the evidence of record (path in the header). It remains the primary evidence for **R1/R3/R5** and for any future re-measurement design.
- **`GATE1_FALSE_HOLD_CAPTURE` is UNSET — ✅ WALKED + VERIFIED 2026-07-17, in-session.** The founder performed it (PR17); the AI supplied the command and verified the result first-hand: flag UNSET · `GATE1_STATE_DIR` kept · 7 env keys · all four hooks intact · valid JSON · and **no config-file fallback** (`discernment.config.json` carries no `falseHoldCapture` ⇒ `parseBool(undefined, false)` = false). **The clock is stopped.** The live buffer reached 136 before the stop; **the frozen 130 is the evidence of record** and the extra 6 are post-freeze session artifacts carrying no weight.
- **The extended byte-identity freeze is LIFTED for the narrowing session.** It existed to keep the measured surface byte-identical while the window accumulated; with the window closed, that constraint is discharged. **This does NOT license production changes** — `derive-trust-events.ts` and the §4 engine remain LIVE (the trust core has been ON in production since 2026-07-11 under MEASURE), so any edit reaching those paths is its own `code-critical` founder-walked step under AC7. The lift removes the *observation-window* constraint, not the *production* one.
- **Any future part-(3) re-measurement needs a NEW window**, not this buffer: the narrowed predicate + a representative distribution (the mentor's part 1) + a populated denominator (guard-path capture — the R6 problem).

**Superseded by this ruling:** the founder's earlier same-session election to defer *both* larger findings ("both wait for the mentor"). The mentor has ruled on both — **R7** puts the public trust-record cap **in the narrowing session, explicitly "not deferred"**; **R5** **preserves** the Q2 staging premise (it stands, contingent on the narrowing landing). Neither waits.

---

*Record ends. Cross-references: the outbound briefing (`2026-07-17-F2-mentor-briefing.md`); the finding of record (`2026-07-17-RA1-F2-s11-observation-instrument-vacuity-finding.md` — read with the four corrections); the binding 2026-07-12 S11 verdict (`2026-07-12-mentor-consultation-s11-enforce-gate-verdict-verbatim.md`); the 2026-06-19 guardrail-fidelity consultation (the Scope paragraph R2 withdraws in effect); ADR-010 (§3 build record, §4 Change 2); ADR-013 §7/§11. Decision-log entry: `D-TRUST-LAYER-S11-F2-MENTOR-RULING-EXCLUSION-CLAUSE-GOVERNS` (pending the founder's adoption election).*
