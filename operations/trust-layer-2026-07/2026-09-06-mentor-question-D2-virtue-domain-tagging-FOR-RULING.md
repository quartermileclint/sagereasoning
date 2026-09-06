# Mentor question — does the self-circle ruling reach the *domain tag*, as well as the justice emission?

**For the founder to relay. Authored 2026-09-06.** Documents only; nothing built, nothing changed.
Full trace: `operations/trust-layer-2026-07/2026-09-06-D2-virtue-domain-tagging-SCOPE-FOR-RULING.md`.
Register row: `S11-FLIP-PREREQUISITES-REGISTER.md` §D, **D2**.

**Nothing here unblocks the S11 flip or the weights question. Both remain refused/blocked whatever
the answer.** This is a live-ledger accuracy question.

---

## What you have already ruled, and what it fixed

**2026-07-19:** the `self_preservation` circle standing alone is not a justice surface; dikaiosyne
is other-directed; self-regarding action is governed by phronesis and sophrosyne.

**M-1, 2026-08-16:** that logic applies symmetrically, including to a *violated* obligation —
*"the evidence is not being dropped; it is being correctly attributed"*, and preserving the
mis-attribution is *"preserving a category error in the direction that hard-floors the wrong
domain."* You added: if the implementation cannot route to phronesis/sophrosyne, **withhold**
rather than preserve the mis-attribution.

Both were built. The reducer that emits `justice-surface-*` events now withholds them for a
self-only action. That went live 2026-09-05 and was proven to have taken effect.

## What the proof then found — a second surface, unreached

The engine has **two different tests for "is dikaiosyne engaged?"**, in the same file.

- One was narrowed to your ruling in August: it excludes the self circle. It governs the proximity
  floor and the classification routing.
- The other was not. It tags dikaiosyne whenever there is **any circle at all** — including the
  self circle alone — **or** whenever the kathekon assessment is non-null. It has **no test of who
  the circle is**. Its output is the `virtue_domains_engaged` field on the signed assessment.

That field is what the trust ledger reads to mint a **`credential-completed`** event per engaged
domain — a **positive** event that raises the earned level. So on a purely self-regarding action,
dikaiosyne is still tagged, and now **accrues credit** where before your correction it accrued a
cap. Observed on a real production consult: dikaiosyne rose from `habitual` to `deliberate` on an
action with no other party at any circle.

**We are not asking you to revisit M-1 — it is right, and the remedy is not to restore a
mis-attributed cap.** We are asking whether the ruling reaches this second surface.

## Four things the trace turned up that bear on your answer

**1. You have already ruled that an accumulation surface and a verdict surface are governed by
different principles — and we nearly failed to put it in front of you.** From the Q4-residual
consultation of 2026-08-02:

> The Arm-2 asymmetry … was adjudicated for a **trust-ledger surface** where the governing principle
> is: adverse evidence is never silently dropped … **the ledger's job is to accumulate what
> happened, not to produce a verdict.**

> `computeDikaiosyneFloor` is not an accumulation surface. It is a **verdict surface** … **These are
> different principles serving different functions, and they produce different answers to the same
> question.** … **It does not transfer to the verdict layer. The two surfaces have different
> governing principles, and the answer that is right for one is wrong for the other.**

This matters two ways and we take neither. **Toward "no change is owed":** `credential-completed` is
an *accumulation* surface, and the narrowed test we keep pointing at was built for, and ruled on as,
a *verdict* surface — so importing it is exactly the transfer you declined to make automatic.
**Toward "a change is owed":** the same passage says a self-only violation still enters the ledger
as adverse **phronesis/sophrosyne** evidence — the ledger accumulating in the *correct* domain, not
in dikaiosyne. *(An earlier draft of this question omitted this ruling entirely. That omission made
the question look more open than your own rulings leave it, in the direction of a change being
owed. Restored after independent review.)*

**2. The destination you named already exists at this layer.** M-1 said: *"**If** the implementation
cannot yet route to those domains, the correct interim posture is to withhold…"* — a **conditional**
about "the implementation", not an assertion about any particular component. Our build judged the
condition satisfied for the reducer and took the withhold branch. What we can now report is that at
the **engine** layer a routing built to your Q2 ruling of 2026-08-02 **already adds phronesis and
sophrosyne** when no justice surface is engaged — **fourteen days before M-1**, in the same file.
Whether that means the condition was not satisfied, or whether "the implementation" was rightly read
as the reducer alone, is **Q3** below and is yours to say.

Note also a difference of register we should not paper over. Your Q2 wording was about
**engagement** — *"it said **dikaiosyne stops engaging** and the assessment routes elsewhere"*;
*"it has **moved** to the right one"*. The implementation is **additive**: its own code comment says
it deliberately **does not remove** the dikaiosyne tag. So a self-only action today tags
**phronesis, sophrosyne and dikaiosyne** — it adds the two domains your 2026-07-19 ruling names for
self-regarding action, and retains the third. The destination exists; only the removal is missing.
**Whether the removal is owed is exactly Q1, and we do not assume it.**

**3. The tag fires on zero evidence, but not on one piece of it.** The second trigger
(`is_kathekon !== null`) tags dikaiosyne when the kathekon assessment finds **3, 2, or 0** factors —
but **not** when it finds exactly 1 (that reads `null`). So an action with *no* kathekon factors
extracted tags dikaiosyne, while an action with one does not. The zero-factor case is the dominant
class for ordinary routine work. **A related route out of this same tag was already closed on your
R11 ruling in July** — the zero-circle case no longer emits `justice-surface-unevaluated`, because
it latched a public cap off ordinary file writes. The positive-credit route out of the same tag was
never closed.

**4. Nothing here touches the guardrail verdict.** The tagged field is not read by the proximity
computation or by the live `/api/guardrail` gate. It reaches the trust ledger, a score bonus, and
the public trust record — not the gate.

## The questions

**Q1.** Is domain **tagging** the same question your rulings answered, or a different one? You
ruled on *emission* of justice events. This is a different event type with the **opposite**
direction of effect — credit rather than cap. Does *"dikaiosyne is not in play"* govern the tag as
well, or does a positive-credit surface need its own principle?

**Q2.** Does the **zero-circle** case reach the same answer as the **self-only-circle** case? R11
said zero-circle is not a justice surface, for one surface. Does that reach this one?

**Q3.** Given item 2 above — that phronesis/sophrosyne routing already exists at this layer — is your
carried "withhold rather than mis-attribute" note **half-discharged** (destination built, removal
outstanding), or is engine-layer classification a different surface from the ledger emission you
were ruling on, leaving the note fully open?

**Q4 — location, if a change is owed.** Two places, stated with what each gains and costs, and we
have deliberately **not** chosen. *(An earlier draft of this list gave the second option its
advantages and the first only its costs. Rebalanced after independent review; the asymmetry was not
intended but it was there.)*

- **At the engine**, correcting the tag at source. **Gains:** it is the only option that actually
  resolves the divergence — one rule, seen identically by every consumer, so the signed assessment
  says what the ledger acts on. **Costs:** it moves `/api/reason` scoring output, lowers a live
  score bonus for self-only actions, touches roughly a dozen consumers including the very predicate
  the eventual flip binds on and a live bucket carrying a **published** public claim, and interacts
  with the false-hold observation window, which has not yet started.
- **At the trust-core boundary**, filtering the domain list where it becomes a ledger event.
  **Gains:** a narrower blast radius — no scoring movement, no window interaction — and a precedent
  already in that file. **Costs:** the signed assessment would keep saying dikaiosyne is engaged
  while the ledger says it is not; the two rules would still coexist rather than be reconciled; and
  the narrowed predicate is **not exported**, so this option must either export a scoring-engine
  symbol onto the trust-core's import surface or restate the rule — re-creating the drift.

Is one of these right in principle, or is the choice an implementation matter for us?

**And a third disposition, which on the sources has the strongest prior-ruling support of the
three:** that the tag is **correct as it stands** — `credential-completed` is an accumulation
surface, item 1 above says accumulation and verdict surfaces are governed by different principles,
the Q2 code comment argues the resulting accrual is *"a foreseeable, intended consequence of
correctly classifying the action … not a leak"*, and the engagement-vs-emission distinction is
already this codebase's working reading, deliberately held and test-pinned. On this disposition D2
closes with no build. Its cost is that the two coexisting rules persist, and that the oddity in
item 3 (no factors tags, one factor does not) stands unexplained. **We flag that we initially gave
this option two lines and no argument while developing three findings against it; that imbalance
was a defect in our drafting, not a judgement about the answer.**

## What is and is not established

**Observed:** the two definitions and every mechanism above, read from source; the single-event
rise from `habitual` to `deliberate` on a real self-only production consult.

**Reasoned, not measured:** that the level can rise *past* `deliberate` over several such events.
The mechanism supports it (one rank per event, bounded by each assessment's own proximity) and we
have deliberately kept it labelled as inference.

**No live agent's ledger is affected today.** The one live harness identity has received **no**
`credential-completed` event in seven weeks — its close hook can only send a "seed" write, and the
record already exists, so the route refuses it before any event is minted. The exposure is
prospective: it begins with the next genuine accreditation update.
