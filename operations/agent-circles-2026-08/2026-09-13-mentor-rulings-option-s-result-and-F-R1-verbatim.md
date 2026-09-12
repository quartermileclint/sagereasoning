# Mentor rulings — Option S's result (Q-R1…Q-R3), the brief (Q-S1/Q-S2), and F-R1's elected path (verbatim)

**Relayed by the founder 2026-09-13**, in three exchanges across one day, in response to
`2026-09-13-MENTOR-QUESTIONS-option-s-result-and-what-the-election-turns-on.md`,
`2026-09-13-RELAY-option-s-brief-and-open-questions.md`, and
`2026-09-13-RELAY-F-R1-cannot-execute-as-ruled.md`.

**Status: ADOPTED AS BINDING on relay. This verbatim record wins over every summary of it.**

**Recording entry:** `D-OPTION-S-RUN-COMPLETE-RULINGS-ADOPTED-2026-09-13`.

**Headlines (the verbatim governs).** **Q-R1** — the determinism finding changes what the election
turns on: **YES**; read both figures, the **variable fraction is decision-relevant**, the rate is
context. **Q-R2** — the **rejection-stratum rate is operative**; the pooled rate is disclosed and
explicitly not used; selecting a pre-declared stratum after seeing the split is *"applying the
pre-declared structure to the data"*, not cherry-picking. **Q-R3** — c11: **disclose, do not
re-measure.** **Q-S1** — the gate is **discharged**; the **M/W/S election and R8-D7's sampling policy
PROCEED**. **Q-S2** — the near-boundary gap is **NOT closed**; do not publish 0.536 against it.
**F-R1 — PATH 1 ELECTED: accept and disclose.** Path 2 (correcting `complete_series()`) is
**NOT taken** and is recorded as a **named defect reserved to a session that does not know which
input it affects**.

---

## Exchange 1 — the result (Q-R1, Q-R2, Q-R3)

> **Q-R1 — Does the determinism finding change what the election turns on?**
>
> Yes. The recommendation is accepted and sharpened into a ruling. The election should read both figures, with the variable fraction named as the decision-relevant one and the rate reported as context.
>
> The reasoning is this: the election between M, W, and S is a policy choice about how to handle uncertainty in the engine's verdicts. Where the engine is deterministic, there is no uncertainty to handle — M, W, and S are identical by construction. The policy choice only has content where the engine varies. On this population, that is 3 of 24 inputs.
>
> The practical content of the election is therefore: on the two inputs where M and W differ (c6 and c9, each blocked on 1 of 10 draws), does the project prefer to permit or block? W blocks both. M and S permit both. That is the entire decision.
>
> The rate summarises a population that is 87.5% deterministic, and the pooled rate of 0.197 describes no actual input in the set — it is a weighted average over a distribution that does not exist as a coherent population.
>
> The honest framing for the election: the variable fraction is 3/24 = 0.125 [0.043, 0.310] — directional, not precise, on a thin basis. Of the three variable inputs, two show M/W divergence, both in the same direction (1/10 blocked: W blocks, M permits). The election turns on whether the project wants a policy that blocks on any adverse draw or one that blocks only when the majority of draws are adverse. That is a values question, not a rate question, and the data now makes it visible as such.
>
> The four limits named in the relay ride this framing as they ride every figure: the sample is not representative of a future candidate stream, the strata were selected on the variable being measured, variance is multi-channel, and the texts were produced under the older engine. The framing is directional. It is not a measurement.
>
> **Q-R2 — Which figure is "the" rate?**
>
> The rejection-stratum rate is the operative figure for the election. The pooled rate is reported and explicitly not used as the election's input.
>
> The ruling's reasoning: the strata were declared before the run. Selecting which stratum the election reads after seeing the split is not post-hoc cherry-picking — it is applying the pre-declared structure to the data. The D6a class-freeze discipline exists to prevent the *classes themselves* from being redefined after seeing the data. The classes here (winners / guardrail rejections) were defined before the run. Choosing to read the rejection stratum is choosing to read the population the election was designed to characterise: the floor-borderline inputs where M and W actually differ.
>
> The pooled rate of 0.197 is arithmetically dominated by 144 winner draws that never once blocked. Including them in the headline figure would be the composition artefact the 2026-09-05 removal of the directional decomposition anticipated.
>
> The rejection-stratum rate of 0.536 [0.430, 0.638] is the figure the election reads. The pooled rate is disclosed alongside it, with the explicit statement that it describes no input in the set and is not the operative figure.
>
> **Q-R3 — c11 did not reproduce. Disclose, re-measure, or set aside?**
>
> Disclose as a limit. Do not re-measure. The recommendation is correct.
>
> At p = 0.1, drawing 0/10 has probability 0.35 — a third of the time this result appears with nothing having changed. Two K=10 runs cannot separate drift from noise. A third K=10 run applies the same logic and resolves nothing. If c11's stability matters for the election, it needs a different design — a much larger K on c11 alone — and that is its own question, not a rider on this one.
>
> The disclosure rides the result as stated: c11 showed 1/10 blocked on 2026-08-29 and 0/10 blocked on 2026-09-12, byte-identical text, same K, with the L6 engine change predating both measurements. The difference is within the noise envelope for p = 0.1 at K = 10. No conclusion about drift is warranted. The result is reported with this limit named.
>
> **Founder item F-R1 — c15 lost 6 of 10 draws to outages**
>
> Re-run c15 at K=10. The recommendation is correct and the reasoning is sound: 10 calls at approximately $0.17 restores the intended K and removes the one input whose weight is materially thinner than its siblings. The credential is live with quota unused. Run it, recompute, then revoke per F-R2.
>
> This is the founder's call, not a ruling. The alternative — accept and disclose — is also defensible. The re-run is cheap enough that it is the recommended path, but the election is not blocked on it. If the founder accepts and discloses, the disclosure states that c15's rejection-stratum contribution rests on 4 draws rather than 10, and the Wilson interval for the rejection stratum carries that limit.

---

## Exchange 2 — the brief (Q-S1, Q-S2)

> **Q-S1 — Do the M/W/S election and R8-D7's sampling policy now proceed?**
>
> Yes. The gate condition is discharged. Both items proceed.
>
> The election is now askable in the form the ruling established: not "what is the rate" but a concrete choice on two named inputs. The framing for the election is confirmed as stated in the brief — the doctrinal question does not need a larger n, and the empirical fraction is carried as directional context, not as the election's basis.
>
> The election question, stated precisely so it can be put directly: when the engine returns a block verdict on 1 of 10 draws on an input that is otherwise permitted, does the project prefer a policy that blocks on any adverse draw (W), or one that blocks only when a majority of draws are adverse (M/S)?
>
> That is the entire practical content of the election on this population. The answer is a values judgement about what a floor is for — whether it is a ceiling on permitted risk (any adverse draw is disqualifying) or a majority signal about the input's character (one adverse draw in ten is noise, not signal).
>
> The recommendation offered in the brief — make the election on the doctrine, carry the empirical fraction as directional context — is correct and is confirmed as the governing framing. R8 named this as doctrine, not statistics. The data has now made the doctrinal question concrete and visible. The election can proceed on that basis.
>
> R8-D7's sampling policy proceeds on the same discharge. The gate was the disagreement-rate data. The data exists and has been ruled on. Nothing else was gated on it.
>
> **Q-S2 — Does this measurement fill the "near-boundary inputs" gap the live R18 disclosure names as unmeasured?**
>
> No. The recommendation is correct and is confirmed as the ruling. The gap is not closed.
>
> The rejection stratum is not a clean near-boundary set. Four of its nine inputs are stably blocked across all ten draws; two are stably permitted. Only three sit anywhere near a boundary in the behavioural sense the disclosure's language requires. Publishing 0.536 against the disclosure's "near-boundary inputs" sentence would substitute a provenance category — rejected in August — for a behavioural one — sits near the boundary today. That is the same category error the disclosure's own two-population split exists to prevent.
>
> What the measurement does warrant disclosing is what the brief recommends: that a 24-input measurement on real candidate texts now exists, with its strata and per-input distributions, and that the winner stratum showed zero boundary crossings in 144 draws while 10 of 15 winners varied on proximity.
>
> That last finding is the measurement's most useful contribution to the R18 disclosure — it is a clean empirical demonstration of the proximity-versus-decision distinction the disclosure already draws with its benign control. The proximity score moves; the block-or-permit decision does not. That is worth disclosing precisely because it is what the disclosure's existing framing predicts, and the data now confirms it on real candidate texts.
>
> The R18 update requires founder sign-off on three live public surfaces. The ruling does not pre-empt that. It confirms what the update should and should not claim.
>
> **Founder items**
>
> **F-R1:** Run c15. The recommendation is confirmed. Ten calls at approximately $0.17 restores the intended K and removes the one input whose weight is materially thinner than its siblings. The election is not blocked on it, but the re-run is cheap enough that accept-and-disclose is the weaker path. Run it, recompute the rejection-stratum figures, then proceed to the election with the corrected numbers.
>
> **F-R2:** Keep the credential until F-R1 is decided, then revoke immediately. The credential has no further purpose after F-R1 is resolved. Every day it exists beyond that point is exposure with no benefit.

---

## Exchange 3 — F-R1 cannot execute as ruled; Path 1 elected

> **F-R1 cannot execute as ruled — path elected**
>
> Path 1. Accept and disclose. The ruling already named this defensible. It is now the elected path, and the reasoning is worth stating precisely so it does not need to be re-derived.
>
> The re-run cannot move the figures under the present rules. The instrument's `complete_series()` counts records, not counted outcomes. c15's series holds 10 records against `intended_k = 10` and therefore registers as complete. A new series would be written, be complete, and lose to the old one under the earliest-is-operative rule. The $0.17 would buy a record nothing reads. The ruling's intent — "restores the intended K" — cannot be executed without changing the instrument's definition of completeness.
>
> Path 2 is not taken. Changing `complete_series()` to count counted outcomes rather than records is arguably the rule that should always have applied. But it is a rule change made with knowledge of which input it affects and which way the change cuts. The D6a class-freeze discipline exists precisely to forbid that move. Taking Path 2 would route around the earliest-is-operative safeguard to obtain a preferred number — which is what the safeguard exists to prevent. The executing session's instinct to put the change rather than take it is correct, and that instinct is confirmed here.
>
> Path 3 adds a data point that resolves nothing about weighting and costs $0.17. It is not taken.
>
> **The disclosure that rides the result:** c15's rejection-stratum contribution rests on 4 draws, not 10. The other 6 calls returned `engine_unavailable`. The rejection-stratum Wilson interval of [0.430, 0.638] carries this limit. The election's practical content — c6 and c9, each blocked on 1 of 10 draws — is untouched, since neither is c15.
>
> **The instrument defect is named for the record, not corrected now.** A series in which most calls failed registers as a complete measurement and thereby blocks its own repair. This is general — any outage-riddled series behaves this way. The correct fix is to count counted outcomes in `complete_series()`, but that fix should be made in a session that does not know which input it affects. It is recorded here as a named defect for a future waived session, not taken now.
>
> **The credential:** keep until the election is concluded, then revoke immediately. No further purpose exists after that point.
>
> **The election proceeds** on the figures as they stand, with the c15 limit disclosed. The M/W/S election's practical content is two inputs — c6 and c9 — and c15 is neither.

---

## Executing-session notes (not the mentor's text)

### What was executed on relay

- This verbatim record (NEW).
- **Path 1 applied in the instrument, computed rather than hardcoded:** a
  `thin_series_disclosure` block per stratum flags any input whose operative series holds fewer
  **verdicts** than its intended K, with its outage count.
- **The named defect recorded at top level** (`NAMED_DEFECT_series_completeness`) so it rides every
  summary and cannot be lost with the strata.
- The executing session's own owed correction: a test invariant written the same day was
  **file-level** where the data model is **series-level**; corrected to per-series.
- `option-s-runner-test.py` **45/45**.

**Nothing else.** No re-run, no spend, no change to `complete_series()`, no R18 surface touched. The
credential remains live per F-R2 until the election concludes.

### ⚠ A SECOND thin input was found applying the ruling, and the ruling could not have known

The ruling addresses **c15** as *"the one input whose weight is materially thinner than its
siblings."* Applying the disclosure as a computed predicate surfaced **two**:

| input | stratum | verdicts | outages |
|---|---|---|---|
| `ee81ffd6` (**c15**) | guardrail_rejection | **4 / 10** | 6 |
| `77586556` (**cycle 17**) | **winner** | **4 / 10** | 6 |

**The 12 `engine_unavailable` outcomes were not scattered across the sweep — they fell entirely on
two inputs, six draws each.** One is c15; the other is a **winner** no one knew was thin.

**It does not move the winner figure** (the winner stratum recorded 0 floors across 144 verdicts;
a thin winner contributing 4 permitting verdicts changes nothing), and it does not touch c6 or c9, so
**the election's practical content is unaffected**. It is recorded because the ruling's phrase *"the
one input"* is now known to be one of two, and because a computed disclosure caught what a hardcoded
one would have missed.

### A predicate error caught in build, before publication

The thin-series predicate was first written against `n_counted`, which **includes outages** — c15's
4 verdicts + 6 outages summed to its intended 10, and the disclosure reported **zero thin inputs
while the very input the ruling is about sat in the set**. Corrected to `n_verdicts`, which is the
evidence the floor rate is computed over. Third defect this session caught by the executing session
before anything was published; the first two are recorded in the decision-log entry.

### Cross-references

`2026-09-13-MENTOR-QUESTIONS-option-s-result-and-what-the-election-turns-on.md` ·
`2026-09-13-RELAY-option-s-brief-and-open-questions.md` ·
`2026-09-13-RELAY-F-R1-cannot-execute-as-ruled.md` ·
`option-s/` (the instrument; `runs/` now holds 24 series) ·
`2026-09-05-option-s-PR19-REVIEW-FINDINGS.md` (the four pre-run blockers, fixed before the run) ·
`2026-09-05-mentor-rulings-five-relays-verbatim.md` Part 1 (the decomposition removal).

*End of record. Verbatim wins.*

---

## Exchange 4 — the correction: the election's terms re-ruled THREE-WAY

**Relayed 2026-09-13**, in response to `2026-09-13-RELAY-CORRECTION-what-S-actually-did.md`.
**The prior framing's pairing of M and S is CORRECTED.** The doctrinal question is untouched.

> **Correction received — election terms re-ruled**
>
> The correction is accepted in full. The prior ruling's pairing of M and S rested on a false characterisation of what S does, supplied by the session and adopted without independent verification. The ruling is corrected on the terms of the election. The doctrinal question is untouched.
>
> **Question 1 — Is the election three-way (W / M / S) rather than two-way (W / M-S)?**
>
> Yes. The election is three-way. The pairing rested on the claim that M and S permit both c6 and c9. That claim is now known to be false on this population. S blocked c9 — the input whose first draw was the single blocking one — and permitted c16 — the input whose first draw was the single permitting one. M and S disagreed on 2 of the 3 variable inputs. They are not a pair. The election presents three genuinely different behaviours and must be stated as such.
>
> The corrected statement of the election's practical content, read from the stored sequences:
>
> On c6 (first draw permits, 1 of 10 blocks): W blocks, M permits, S permits. All three agree on the outcome here — W blocks, M and S both permit — so this input does produce a W versus M/S divergence, but S's permit is coincidental with M's, not structural.
>
> On c9 (first draw blocks, 1 of 10 blocks): W blocks, M permits, S blocks. W and S agree; M diverges.
>
> On c16 (first draw permits, 9 of 10 blocks): W blocks, M blocks, S permits. S alone diverges from both.
>
> The election's practical content is therefore not a single two-way choice. It is three distinct policy behaviours across three variable inputs, with no two policies agreeing on all three. The election document must present all three.
>
> **Question 2 — Does S's draw-order dependence bear on the election, or is it out of scope?**
>
> It bears on the election. It is not out of scope.
>
> The session offers no recommendation between W, M and S, per R8's reservation. But the question of whether S's draw-order dependence is a relevant property of S as a candidate policy is a framing question, not a doctrinal one, and it can be ruled on without pre-empting the election.
>
> S's draw-order dependence is relevant because it changes what S is. S was characterised in the original design as a conservative baseline — the status quo, the safe option to build, the policy that changes no gate behaviour. The data shows that on variable inputs S is not conservative in any meaningful sense. It is a lottery whose outcome is the first sample. On this population it returned the minority outcome twice out of three times — blocking an input that 9 of 10 draws permit, then permitting an input that 9 of 10 draws block. On c16 it disagreed with both M and W.
>
> Whether that is acceptable is the doctrinal question R8 reserved. But the election cannot be conducted without the parties knowing what S actually does. The draw-order dependence is a property of S that the election's framing must carry, not a property to be set aside as out of scope.
>
> The election document should state it plainly: S is first-verdict-operative; on variable inputs its outcome is determined by draw order, not by the weight of the evidence; on this population it returned the minority outcome on 2 of 3 variable inputs.
>
> **On the disclosure**
>
> The disclosure is accepted and recorded. The error originated in the session's relay and propagated into a binding ruling before being caught. It was found while preparing the election document — the first task that required reading the operative field per input rather than the distributions the session had been quoting. Had the document been written without that read, the error would have reached the election itself.
>
> The pattern the disclosure names — four defects found in the session's own work, three caught before publication, one not — is worth naming precisely because it connects to something the observation history has been tracking across this week. The observation history records a consistent pattern: find the gap, name it honestly, do not paper over it. The pre-flip report named four PR19 findings against its own first draft. The relay on the window's composition stopped before the write. The F-R1 relay named the instrument defect rather than routing around it. This correction names an error that reached a binding ruling before being caught, and names it on the same footing as the errors caught earlier. That is the right response.
>
> The Stoics were precise about the difference between the person who avoids error and the person who finds and names it honestly when it occurs. The sage avoids error through perfected understanding. The progressor finds it and names it — and the naming is itself the practice. The fourth defect is named. The ruling is corrected. The election proceeds on accurate terms.
>
> **Credential**
>
> Held. The ruling's condition was keep until the election concludes. This correction reopens the election. Revocation remains irreversible. Hold until the corrected election document is complete and the election is concluded.

### Executing-session note on Exchange 4

**One drafting slip, named and NOT escalated.** The c6 line reads *"All three agree on the outcome
here — W blocks, M and S both permit"*, which is self-contradictory on its face: if W blocks and M
and S permit, the three do not agree. **The substance is unambiguous from the second half of the same
sentence and matches the stored sequences** (W blocks, M permits, S permits), and the ruling's own
summary table treats c6 as a W-versus-M/S divergence. Recorded rather than put back as a fifth
question, on the precedent that a drafting slip with no substantive consequence is named, not
escalated — manufacturing a question where both readings converge would be pattern-following.

**Executed on relay:** this capture; the corrected **election document**
(`2026-09-13-M-W-S-ELECTION-DOCUMENT.md`), presenting all three policies across all three variable
inputs and stating S's draw-order dependence plainly as ruled. **The credential is HELD, not
revoked.** No spend, no re-run, no R18 surface touched.
