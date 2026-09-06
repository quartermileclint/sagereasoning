# D2 — What tags a virtue domain as engaged (SCOPE, FOR RULING)

> **⚠ RULED 2026-09-06, THE SAME DAY. THIS DOCUMENT IS THE PRE-RULING STATE AND IS DELIBERATELY NOT
> REWRITTEN** — it is the document the mentor actually ruled from, so amending its argument would
> falsify the record of what was put. **Read the ruling first:**
> `2026-09-06-mentor-ruling-D2-virtue-domain-tagging-verbatim.md` (binding; verbatim wins).
> **Disposition: a change IS owed** — at the **engine** (`computeVirtueDomains`), with the
> over-broad `is_kathekon !== null` trigger corrected **in the same pass**, and **sequenced AFTER the
> false-hold observation window opens**. **§10's Option 3 is ruled against BY NAME**: the
> accumulation/verdict distinction *"governs how evidence is treated once correctly attributed. It
> does not govern whether the attribution is correct in the first place."* So **§10's claim that
> Option 3 has the strongest prior-ruling support did not survive** — the mentor engaged that
> support directly and explained why it does not carry. **One question here was never relayed and is
> therefore UNRULED: §9's Q-D2-4** (`\|\| hasNaturalRelationship` on a credit surface) — a defect in
> the relay, not a mentor omission.

**Status:** Authored 2026-09-06 (from `date`; HEAD `793e493`). **`governance` — documents only.**
No code, schema, flag, credential or public-surface change; nothing built, activated, or
pre-approved. This is the "its own design step" the S11 register's D2 row leaves undecided.
It does not license the flip and makes no claim about readiness.

**Routing recommendation: MENTOR RULING, not founder election.** The question is whether two
already-binding rulings (2026-07-19 §1/§3/§6, and M-1 of 2026-08-16) reach a surface neither was
put against. That is an interpretive question about the rulings' scope, not a preference.

**DIFFERENCE FROM THE P1 PRECEDENT, DELIBERATE.** P1's scope document (`2026-09-04-P1-…`) closed
with a §6 stating a recommended resolution, disclosed as a recommendation. **This document states
none, and elects no remedy** — the commissioning prompt for this session forbids both explicitly.
Where a candidate is set out below it is set out with its costs and its counterpart, never ranked.

---

## 1. The question, as the register states it

The register's D2 row (`S11-FLIP-PREREQUISITES-REGISTER.md` §D), verbatim:

> **The two "engaged" definitions** — `computeVirtueDomains` (`circles ≥ 1 || is_kathekon !== null`)
> vs `computeDikaiosyneFloor` (`circles ≥ 1 || hasNaturalRelationship`). **R3: the newer, more
> precise one governs.** Whether the older tag is reconciled at the root or left divergent is
> undecided.

D4's took-effect proof (2026-09-05) gave that row evidence and raised its priority. The register's
D4 row records the consequence:

> `credential-completed` is emitted **one per engaged domain straight from `virtue_domains_engaged`,
> with no circle test** … and its effect is **`'increase'`** … **M-1's correction reached the
> justice-surface EMISSION but not the domain TAGGING** … the same mis-attribution now yields an
> **increase instead of a cap**.

---

## 2. The mechanism, traced from source

All line numbers re-derived by `grep -n` at HEAD `793e493` on 2026-09-06. Every claim in this
section is **OBSERVED** (read directly from source) unless marked otherwise.

### 2.1 The two definitions, side by side

Both live in `website/src/lib/translation-sandwich/layer2-mechanisms.ts`.

**The narrowed one** — `isDikaiosyneEngaged` (`:1688`), over `dikaiosyneEngagedCircles` (`:1676`):

```
:1681   return circles.filter((c) => c.circle !== SELF_PRESERVATION_CIRCLE)   // flag-on
:1693   return dikaiosyneEngagedCircles(circles, agentCircles).length >= 1 || hasNaturalRelationship
```

Its own docstring (`:1684`) calls it *"THE ONE shared engagement predicate … so the two can never
drift on what 'no circle' means."* It governs `computeDikaiosyneFloor` (`:1702`, the ADR-010 §4
proximity floor) and Q2's first-circle routing (`:2996`). It was narrowed by **Q4, 2026-08-02**,
explicitly *"mirroring `kathekon-engagement.ts`'s Arm-1 narrowing (2026-07-19 mentor ruling)
exactly: dikaiosyne is other-directed, so the self circle standing alone is not a justice surface."*

**The un-narrowed one** — `computeVirtueDomains` (`:1995`):

```
:2008   if (oik.relevant_circles.length >= 1 || kathekon.is_kathekon !== null) {
:2009     domains.push('dikaiosyne')
```

**No circle-identity test at all.** Its output is `virtue_domains_engaged` on the signed assessment
(`:3043`).

### 2.2 The path from the tag to an `increase`

1. `derive-trust-events.ts:89` iterates `v.assessment.virtue_domains_engaged` and pushes one
   `credential-completed` per domain (`:100`). **No circle test on this loop.**
2. `trust-transition.ts:41` maps `'credential-completed' → 'increase'`.
3. `trust-transition.ts:173` (`case 'increase'`) raises the earned rank **by at most one per
   event**, bounded above by the event's `demonstratedProximity` (= that assessment's own
   `katorthoma_proximity`), and **only when `coverageContinuous === true`**.
4. The `coverageContinuous` gate is **not a barrier on the live path.**
   `derive-trust-events.ts:79` reads `input.coverageStatus === undefined ? true : … === 'continuous'`,
   and the one live caller — `emission-hooks.ts:169` — **does not pass `coverageStatus` at all**.
   So it defaults to `true` and **this gate does not block the rise**. *(Stated because the gate's
   existence might otherwise be read as making the rise unreachable. It does not. Stated as the
   gate's behaviour, which is observed — that a level actually accumulates past `deliberate` over
   several events remains the REASONED claim of §8 and §12; this item does not establish it.)*

**Observed at D4's took-effect proof, on a real production consult with a self-only circle set:**
`dikaiosyne: earned_level 'deliberate', profile_prior 'habitual', justice_floor_active false`.

### 2.3 Which flag state this describes

The narrowed predicate is gated: `agentCircles = options?.agentCircles ?? isAgentCirclesEnabled()`
(`:2856`), reading `SUBSTRATE_AGENT_CIRCLES_ENABLED` (`reasoning-integrity.ts:80`).

**REASONED, not directly verified:** a repo session cannot read Vercel. But
`emission-hooks.ts:521` refuses to mint an orientation-reading event unless
`isAgentCirclesEnabled()` is true, and the register's own D1 ledger query (2026-09-05) found
**1,356 + 786 orientation-reading rows** on `sagereasoning:s9-loop@v1`. Those rows cannot exist
with the flag off. **The narrowed path is therefore live**, and the divergence in §2.1 is a
live divergence, not a latent one.

---

## 3. Finding A — a narrowed predicate already exists in the same file, a few hundred lines above

**The register's framing understates what is available.** The D4 row says `credential-completed`
is emitted "with no circle test", which is true. Neither row says that **the correctly narrowed
test already exists, is live, and sits in the same module** — `isDikaiosyneEngaged`
at `:1688`, 307 lines above the un-narrowed tag at `:1995`.

That changes the question the mentor is being asked. It is **not** "invent a rule for when
dikaiosyne is engaged" — the project already has one, built to the 2026-07-19 ruling, with a
docstring claiming it is *"THE ONE shared engagement predicate."* The question is **why two rules
coexist, whether the docstring's claim is true, and which governs the trust-ledger surface.**

**The docstring's claim is narrower than it reads.** "THE ONE shared engagement predicate" is true
of the two consumers it names — the dikaiosyne floor and Q2's routing. It is **not** true of
`computeVirtueDomains`, which answers what is textually the same question ("is dikaiosyne
engaged?") by a different rule, in the same file, and whose answer is the one that reaches the
ledger.

## 4. Finding B — the register's own D2 row is stale, pre-Q4

The row names the counterpart as `computeDikaiosyneFloor` with the formula
`circles ≥ 1 || hasNaturalRelationship`. **That was the code before Q4 (2026-08-02).** Today the
disjunct's first term is `dikaiosyneEngagedCircles(circles, agentCircles).length >= 1` — self-filtered
when the flag is on — and the predicate has been factored out into `isDikaiosyneEngaged`.

So the row as written describes a divergence about the `natural_relationship` term. **The live
divergence is about circle identity**, which is a different and larger thing, and is the one both
binding rulings speak to. The row predates the ruling that made it matter.

*Correction to make in the register: the D2 row's formula, and the absence of Finding A.*

## 5. Finding C — Q2 already routes the destination, additively, and deliberately does not remove dikaiosyne

The prompt for this session asks whether Q2's first-circle routing already answers "where should a
self-only action tag instead?" **It answers half, and its own docstring says which half.**

**What the mentor said, and what the build did, are in different registers — both are given here.**
Q2's own words (`operations/agent-circles-2026-08/2026-08-02-mentor-consultation-q4-residual-verbatim.md`)
are *engagement* language, not floor language:

> It said **dikaiosyne stops engaging** and the assessment routes elsewhere.

> A self-regarding action with no justice surface still has a virtue surface — **it has moved to the
> right one**.

*"Stops engaging"* and *"moved"* are the register Q-D2-1 asks about, and they read as relocation
rather than addition. **The implementation is additive.** `applyFirstCircleRouting` (`:2072`) fires
when `isDikaiosyneEngaged` is false and **adds** `phronesis` and `sophrosyne`. Its docstring
(`:2048`) states the limit verbatim:

> ADDITIVE + IDEMPOTENT: it never removes a domain `computeVirtueDomains` produced
> (**including a `dikaiosyne` entry pushed by that function's own separate `is_kathekon !== null`
> trigger — Q2 does not touch that**), never duplicates a domain already present …

So on a self-only action with the flag on, the assessment tags **`phronesis`, `dikaiosyne`,
`sophrosyne`** — it adds the two domains the 2026-07-19 ruling names for self-regarding action, and
**retains** dikaiosyne. Q2 supplies the destination; nothing removes the existing tag. *(Whether
retaining it is an error is Q-D2-1 and is not assumed here. An earlier draft of this sentence called
the retained tag "the mis-attributed one", which decided the question in the prose — corrected at
independent review.)*

**And the consequence for the ledger was foreseen and disclosed at Q2's build**, in the same
docstring (`:2060`), which is worth putting before the mentor in full because it shows the project
saw the mechanism and consciously scoped it out:

> DISCLOSED, PRE-EXISTING, NOT A VIOLATION OF THE ABOVE … `virtue_domains_engaged` DOES have
> downstream reach beyond the verdict surfaces named above — `derive-trust-events.ts` mints a
> `credential-completed` trust event per domain it contains, and `score-architecture.ts`'s
> `computeVirtueBonus` sums a score bonus over it. **Neither is a "verdict" or "gate" in the sense
> this routing must avoid, and both consumers are untouched, pre-existing code** — but once this
> flag is live, a self-only action will newly accrue phronesis/sophrosyne trust-core credit and
> score bonus it did not accrue before. This is a foreseeable, intended consequence of correctly
> classifying the action **(per Q2's own language, the domains "do not stop being relevant"), not a
> leak into the proximity/gate verdict** — but it should be named, not silently discovered, at
> activation time.

*(Quoted at full length deliberately. An earlier draft elided the two bolded clauses, and both
elisions removed the comment's own argument that the accrual is correct — the exculpatory half.
Restored at independent review.)*

**M-1's carried note and this docstring are two halves of one unclosed item — stated carefully,
because the mentor's words here are conditional and an earlier draft rendered them as an assertion.**
M-1 says: *"**If** the implementation cannot yet route to those domains, the correct interim posture
is to withhold the dikaiosyne emission rather than preserve a known mis-attribution."* That is a
**conditional about "the implementation"**, not a factual premise about the reducer, and the mentor
asserted nothing about which surfaces can route. What happened next is the build's doing: it
determined the condition was satisfied *for the reducer* and took the withhold branch.

The fact now available is that **Layer 2 already routes** — Q2 built that routing **fourteen days
before M-1**, in the same file. Whether that means the condition was not satisfied after all, or
whether "the implementation" was rightly read as the reducer alone, is **Q-D2-3** and is the
mentor's to say. *(The earlier draft said "the mentor's premise was true of the reducer and false of
the engine", which attributes a claim the mentor never made and frames the mentor as partly wrong.
Corrected at independent review.)*

## 6. Finding D — the second disjunct's real shape: it fires on *zero* kathekon factors, not on *one*

`is_kathekon !== null` reads, in the prompt's own summary, as "any non-null kathekon assessment".
Traced to source it is sharper and stranger:

| kathekon factors present | quality (`:871`) | `is_kathekon` (`:878`) | tags dikaiosyne? |
|---|---|---|---|
| 3 | `strong` | `true` | **yes** |
| 2 | `moderate` | `true` | **yes** |
| 1 | `marginal` | `null` | **no** |
| 0 | `contrary` | `false` | **yes** |

**The tag is non-monotone in the evidence.** *Holding the first disjunct false — i.e. on an action
with no circles at all* — an action with *no* kathekon factors extracted tags dikaiosyne, while an
action with *one* does not. (The qualifier matters: `:2008` is a disjunction, so any action with
≥1 circle tags dikaiosyne regardless of the kathekon count. The table's last column should be read
as "tags dikaiosyne **on this trigger alone**".) The zero-factor case is not a corner: it is the
project's own documented dominant class for routine build actions (*"No kathekon factors were
extracted from the submitted text; on that basis, the engine reads the action as contrary to
appropriate action"* — the EE-C1 wording, `:1298`).

**This is the same class R11 already ruled on, at a different surface.** The reducer's own comment
at `derive-trust-events.ts:313` names it by name:

> The zero-circle case — a dikaiosyne tag resting solely on `is_kathekon===false` (the
> `computeVirtueDomains` `is_kathekon !== null` tag, which fires on essentially every examined
> action) — is NOT a justice surface (the F2 exclusion-clause ruling) and no longer emits
> `justice-surface-unevaluated`; pre-narrowing it latched a public deliberate cap off ordinary
> file writes (the s9-loop cap …).

So the project has known this exact tag's behaviour since 2026-07-18 and **closed one route out of
it (`justice-surface-unevaluated`, by adding `circles.length >= 1`) without touching the tag.**
`credential-completed` is the route that was not closed.

## 7. Finding E — the reducer reads the same field, so the two surfaces are already entangled

`derive-trust-events.ts:250`: `const dikaiosyneEngaged = a.virtue_domains_engaged.includes('dikaiosyne')`.

The justice reducer **consumes the un-narrowed tag** as a gate: `met` (`:303`) and `unevaluated`
(`:321`) require it; `violated` and `indeterminate` do not. So the tag is load-bearing inside the
very reducer M-1 corrected.

**REASONED (from source, not measured) — the justice path would not move under a narrowing that
mirrors `isDikaiosyneEngaged`, *while D4's flag is on*.** The set of assessments whose tag would
flip true→false is contained in `{beyondSelfCircleCount === 0}`; for exactly those, D4's `selfOnly`
(`:248`) is already true and gates all four branches. **Conditional on D4 staying on** — with that
flag unset, the same narrowing *would* silently remove `met` and `unevaluated` for those
assessments, which is a live trust-event change reached by an engine edit.

*One-directional, and completed at independent review:* the argument above covers only true→false
flips. A narrowing that mirrors `isDikaiosyneEngaged` also inherits its `|| hasNaturalRelationship`
term, which can flip a tag **false→true** — zero circles plus a lone `natural_relationship` factor
gives a kathekon count of 1 ⇒ `marginal` ⇒ `is_kathekon === null` ⇒ untagged today, tagged after.
The justice path still does not move in that direction either (`unevaluated` requires
`circles.length >= 1`, `met` requires a non-empty `statuses` — both unreachable at zero circles),
but that is an **independent** reason the first draft did not give.

**But the predicate is a different story, and this is the sharper half.** `kathekon-engagement.ts:198`
feeds the stored `virtue_domains_engaged` (projected at `:318`) into the *same* reducer, in a call
spanning `:195`–`:211` that passes **no** `opts` and so runs **without**
`requireBeyondSelfCircle` (the predicate must not pass it — `derive-trust-events.ts:209`, a
coupling D4's build deliberately guarded). Its `selfCircleOnlySuppression` (`kathekon-engagement.ts:255`)
has `justice !== null` as its first conjunct. So:

- for a self-only circle carrying `indeterminate` **or** `violated`, those branches are ungated by
  `dikaiosyneEngaged` (`:289`, `:288`), so `justice` stays non-null and the suppression diagnostic
  **survives** a narrowing;
- for a self-only circle carrying **no status**, the `unevaluated` branch (`:321`) is the only
  producer and it *is* gated on `dikaiosyneEngaged` — so a narrowing makes `justice` null, collapses
  `selfCircleOnlySuppression`, and drops that loop out of `loop_fold`'s live `self_regarding` bucket;
- **and for a self-only circle carrying `met` and only `met`** — the `met` branch (`:303`) is
  **also** gated on `dikaiosyneEngaged`, so this case collapses too. *(Added at independent review:
  the first draft presented the two bullets above as a complete partition and they are not. "Carrying
  an obligation status" is not the complement of "carrying no status" — `met`-only sits in neither.
  The exposure is correspondingly wider than the draft stated.)*

**That partial collapse is the outcome D4's build refused to cause deliberately, and it carries a
published claim.** `llms.txt:548` describes the `self_regarding` bucket as *"loops whose justice arm
was suppressed only because every identified circle was `self_preservation`"* — the D4 row records
that narrowing the predicate's delegation *"would not merely regress a battery, it would make a
PUBLISHED claim false on the next deploy."* **An engine-side narrowing of the tag reaches the same
coupling by a different door, for the subset of self-only loops with no obligation status.**
Partial, not total — stated that way rather than as a blanket blocker.

## 8. Finding F — what the rise actually requires

The register marks the multi-event rise **REASONED, not measured**, and this document does not
upgrade it. What §2.2 adds is the conditions, from source:

1. **Multiple qualifying accreditation writes** (one rank per event).
2. **Each assessment's own `katorthoma_proximity` above the current rank** — the rise is bounded by
   `demonstratedProximity`.
3. `coverageContinuous` — **satisfied by default on the live path** (§2.2 item 4).

**A coupling worth naming, which nothing on record states.** Condition 2 is made *more* reachable by
Q4 itself. Before Q4, a self-only circle produced a dikaiosyne floor via `computeDikaiosyneFloor`,
which pulled the assessment's overall proximity down and so capped `demonstratedProximity`. Q4
correctly removed that floor. **The same narrowing that removed the mis-attributed floor also
removed the incidental ceiling that was holding the dikaiosyne tag's rise down.** Both effects
are correct in isolation; together they are why D2 is sharper after Q4 and D4 than before. **This is
REASONED from source, not measured.**

## 8b. Finding G — the mentor has already ruled that a LEDGER surface and a VERDICT surface have different governing principles

**Added at independent review. Its omission was the most serious defect in the first draft**, because
it is the prior ruling closest to Q-D2-1 and it was not in front of the mentor. The reviewer's
observation on how it went missing is worth recording: §2.1 quotes `layer2-mechanisms.ts:1643–1646`
verbatim and **stops immediately before the next paragraph of the same comment block**, which states
this distinction in the code itself.

The source is `operations/agent-circles-2026-08/2026-08-02-mentor-consultation-q4-residual-verbatim.md`
— the Q4-residual ruling, verbatim:

> The Arm-2 asymmetry in `kathekon-engagement.ts` was adjudicated for a **trust-ledger surface**
> where the governing principle is: adverse evidence is never silently dropped from the measurement
> record. That principle is epistemic — it concerns what the record honestly shows. A violated
> obligation on the self circle alone still enters the trust ledger as adverse **phronesis/sophrosyne**
> evidence, because **the ledger's job is to accumulate what happened, not to produce a verdict.**

> `computeDikaiosyneFloor` is not an accumulation surface. It is a **verdict surface** … The
> governing principle here is not "never drop adverse evidence" — it is "the verdict must be
> grounded in the correct virtue domain for the failure being assessed." **These are different
> principles serving different functions, and they produce different answers to the same question.**

> The Arm-2 asymmetry remains in place at the trust-ledger layer where it was adjudicated. **It does
> not transfer to the verdict layer. The two surfaces have different governing principles, and the
> answer that is right for one is wrong for the other.**

**This bears on the question in two opposite directions, and this document takes neither.**

**It cuts toward "no change is owed" — and this is the reading the first draft suppressed by
omission.** `credential-completed` is an **accumulation** surface, not a verdict surface. The ruling
says explicitly that an answer right for one surface can be wrong for the other, and that the
transfer does not run automatically. **Finding A invites exactly such a transfer** — it observes that
a narrowed predicate exists and asks why two rules coexist — **but the narrowed predicate
(`isDikaiosyneEngaged`) was built for, and ruled on as, a VERDICT surface.** On this ruling, its
governing principle ("the verdict must be grounded in the correct virtue domain") is not
automatically the ledger's. Finding A's framing should be read subject to that, and the first draft
did not say so.

**It cuts toward "a change is owed."** The same passage says a self-only violation *"still enters
the trust ledger as adverse **phronesis/sophrosyne** evidence"* — i.e. the ledger accumulates it in
the **correct** domain, not in dikaiosyne. On that reading the ledger's epistemic principle governs
*whether* evidence is recorded, not *which domain* it is recorded against — and on that reading
"accumulate what happened" does not license recording it against the wrong domain. M-1 points the same way for the emission half.

**A sequencing fact the mentor may want, stated without interpretation:** the Q4-residual ruling is
2026-08-02; M-1 is 2026-08-16. M-1 addressed the reducer's dikaiosyne emission and ordered withhold;
the Q4-residual ruling addressed the floor and the ledger/verdict distinction. **Neither was put
against `credential-completed`.**

## 9. The question of principle — put, and NOT answered

**Q-D2-1. Is domain TAGGING the same question as justice-surface EMISSION?**
M-1 ruled on emission. `credential-completed` is a different event type with the **opposite**
direction of effect (`increase` vs `cap`/`decrease`). The 2026-07-19 ruling's §1/§3 speak about
*engagement* in general terms (*"dikaiosyne is not in play"*), not about a particular event type.
Does the ruling reach the tag, or is a positive-credit tag a distinct question requiring its own
principle?

**Two facts the mentor should have in hand before answering, both of which the first draft left out
of this section:**

- **This project already holds a load-bearing position on exactly this distinction, and pins it.**
  `derive-trust-events.ts:282–287` records that the predicate's Arms 2–4 still ENGAGE on a self-only
  violated obligation while the reducer withholds — *"Engagement … and emission … are different
  questions; the 2026-07-19 ruling left Arms 2-4 unchanged and M-1 rules only on emission"* — and the
  register's D4 row calls that divergence **deliberate and "must not be 'fixed'"**, held by batteries
  §8.9d/§8.9e. So the answer "tagging and emission are different questions" is **already operative
  elsewhere in this codebase**, on the mentor's own 2026-07-19 ruling read narrowly (Arm 1 only).
  Whether that reading extends to the tag is the question; that it is already the working reading is
  a fact.
- **And the ledger/verdict ruling of Finding G bears directly** — the mentor has held that an
  accumulation surface and a verdict surface have *different governing principles* and that the right
  answer for one can be the wrong answer for the other.

**Q-D2-2. Does the *zero-circle* case reach the same answer as the *self-only-circle* case?**
Finding D shows the tag fires on assessments with **no circles at all** whenever
`is_kathekon !== null` — including `is_kathekon === false`. R11 ruled the zero-circle tag is not a
justice surface **for the predicate**, and S11b closed the `unevaluated` route on that ground. Does
the same reasoning reach the positive-credit route? A separate consideration the mentor may want to
weigh: the non-monotonicity in Finding D (0 factors tags, 1 factor does not) is at least an
**anomaly** whichever way Q-D2-1 goes — but whether an anomaly is a defect, and what the correct
rule would be, are both the mentor's to say and are not assumed here. *(An earlier draft called it
"on its face a defect", which contradicts this document's own §13. Corrected at independent
review.)*

**Q-D2-3. Does Q2's routing discharge M-1's carried note, or is it a different surface?**
M-1's interim "withhold" posture rested on the premise that the implementation *"cannot yet route"*
to phronesis/sophrosyne. Finding C shows Layer 2 already routes there — additively, live, and
deliberately without removing dikaiosyne. Is the carried note therefore **half-discharged** (the
destination exists; only the removal is missing), or is Layer-2 classification a different surface
from the trust-ledger emission M-1 was ruling on, leaving the note fully open?

**Q-D2-4. Is `hasNaturalRelationship` the right second disjunct for the tag?**

> **⚠ NEVER RELAYED — and this framing OVERSTATED the stake. Annotated 2026-09-06, not rewritten.**
> The relay renumbered and spent its Q4 on the location question, so this went unasked and unruled.
> It is now put on its own:
> `2026-09-06-mentor-question-D2-natural-relationship-disjunct-FOR-RULING.md`. **The correction:**
> this question is framed below as a *credit* concern, but a circle-free natural-relationship input
> floors the whole assessment to `reflexive` (`computeDikaiosyneFloor` — *"unidentified affected
> party ⇒ obligation necessarily unresolved"*), the ledger event carries that floored value, and
> `increase` raises only when the carried value **exceeds** the current level. **`reflexive` is rank
> 0, so a tag arising this way cannot raise anything.** The stake is not an undeserved rise; it is
> whether a row asserting *"dikaiosyne engaged"* should exist at all — which is the ruling's own
> ground. **Two things this framing also missed, both sharper than what it did say:** a mirrored
> predicate would still tag dikaiosyne on a **self-only** action whenever a natural-relationship
> factor was extracted, **partially defeating the correction the mentor ordered**; and the ruled
> kathekon-trigger fix does **not** close this route, since `natural_relationship` is also one of
> the three kathekon factors.

If the tag were aligned to `isDikaiosyneEngaged`, it would inherit that predicate's
`|| hasNaturalRelationship` term — under which *"a relationship claimed with NO identified party"*
floors to `reflexive` on the verdict surface (`:1702` docstring). On a *credit* surface that same
term admits a domain tag on an unidentified party. Is alignment-to-the-existing-predicate the right
frame, or does a credit surface need its own condition?

## 10. The disposition — three options, symmetrically stated. Not chosen.

**This section ranks none of them**, and the sub-questions in §9 may be answered in ways that make
any of them wrong. Two are remedy *locations*; the third is a ruling that no remedy is owed.

> **STRUCTURAL NOTE, added at independent review.** The first draft gave both options a list headed
> "Costs" but filled Option 2's with two costs and two *advantages*, while Option 1's genuine
> advantage appeared only as an italic subtitle. A reader scanning saw four harms against two harms
> and two benefits — **ranking by composition, under a heading that promised none.** A disclaimer on
> one bullet did not fix it. Both options now carry the same two headings, and Option 1's advantage
> is stated as a bullet like any other.

### Option 1 — at the engine (`computeVirtueDomains`, `layer2-mechanisms.ts:2008`)

**What it gets you:**
- **It is the only option that actually resolves the divergence this whole document is about.** One
  rule, at the source, seen identically by every consumer — the condition Finding A observes is
  missing and which `isDikaiosyneEngaged`'s own docstring claims ("THE ONE shared engagement
  predicate").
- The signed assessment then *says* what the ledger *acts on*, so no downstream consumer has to
  know about a correction applied elsewhere.

**Costs, from source:**
- **It moves `/api/reason` scoring output.** This is why D4's row **deliberately excluded** it —
  verbatim: *"a scoring-engine change that would pull `/api/reason` determinism into a trust-ledger
  step."* `code-critical`, founder-walked, flag-gated by precedent.
- **`virtue_domains_engaged` has at least twelve consumers beyond the ledger**, enumerated by grep
  at HEAD: `score-architecture.ts:599` (`computeVirtueBonus` — **a live score bonus**, so a
  narrowing lowers scores for self-only actions), `loop-fold.ts:611` (live MEASURE),
  `kathekon-engagement.ts:318` (**the predicate the flip binds on**), `trajectory-delta.ts:559,738`
  (live, `meta.trajectory.delta`), `agent-assessment-history-store.ts` (a **persisted `text[]`
  column** — historical rows keep the old value, so the corrected and uncorrected coexist in one
  table), `philosophical-mode-service.ts`, `agent-mode-service.ts`, `sage-assent-bridge.ts`,
  `window-aggregator.ts:767`, `agent-hand-back-report.ts:538`, `layer3-prose.ts:1090`,
  `at-action-seam.ts:74`, `idea-loop-types.ts:347`.
- **The `self_regarding`/`llms.txt:548` coupling of Finding E** — partial, for self-only loops with
  no obligation status and for those carrying `met` only.
- **A window-sequencing consequence.** The false-hold capture stores the *already-computed* field
  (`false-hold-capture.mjs:63`), so the **frozen 130-record buffer is insulated** — its
  classification cannot move. But the *next* window's records would be captured under a different
  tag. An engine change landing **before** the window starts means the new window measures a
  different predicate than the frozen buffer did; landing **during** it means mid-window drift.
  The next queued session (S4) asks, in its own words, to *"confirm … S5 needs no engine edit."*
  **This document does not answer that** — it states the coupling and leaves the ordering call to
  the founder and to whatever §9 is ruled.

### Option 2 — at the trust-core boundary (`derive-trust-events.ts`, the `credential-completed` loop)

**What it gets you:**
- **A narrower blast radius.** No `/api/reason` determinism change, no score-bonus movement, no
  window coupling — `code-critical` by D3 (the reducer is a live emitter) but contained to it.
- **A precedent already in the same file.** D4's `requireBeyondSelfCircle` opt-in is precisely a
  boundary-located, flag-gated circle test; a second would follow its shape.

**Costs, from source:**
- **The scoring engine and every non-ledger consumer keep reading the un-narrowed value** — so the
  divergence Finding A describes is not resolved, it is *localised*. Two rules would still coexist;
  the signed assessment would still say dikaiosyne is engaged while the ledger says it is not.
- **A signed-artifact honesty question.** `virtue_domains_engaged` rides inside the Ed25519-signed
  assessment. A boundary filter means the ledger deliberately disagrees with a signed claim it
  re-verified. Whether that is a defect or the correct division of labour is a judgement, not a
  fact — and it is arguably the same shape as the predicate/reducer divergence M-1's own execution
  left standing on purpose. The wording is *"Engagement (should this be held and examined?) and
  emission (does this become a dikaiosyne ledger event?) are different questions"* — **and its
  source is this project's own code comment at `derive-trust-events.ts:284–286`, not a mentor
  ruling.** It is the builder's reading of M-1's scope, and the distinction it draws (predicate vs
  reducer) is not the distinction Option 2 proposes (signed assessment vs ledger), so "the same
  shape" is an analogy and not more than that.
- **`isDikaiosyneEngaged` is NOT exported** (`layer2-mechanisms.ts:1688` — no `export` keyword, and
  zero references outside its own module; its sibling `dikaiosyneEngagedCircles` at `:1676` *is*
  exported, which the first draft confused it with). So a boundary filter cannot reuse the narrowed
  predicate as it stands: it must either export it — putting a scoring-engine symbol on the
  trust-core's import surface — or restate the rule, which re-creates the very drift Finding A is
  about.

### Option 3 — rule that the tag is correct as it stands, and close D2 with no build

**Not a placeholder. It has the strongest prior-ruling support of the three, and the first draft
gave it two lines with no argument** — a defect found at independent review, sharpened by the fact
that the material supporting it was in hand and omitted (Finding G).

**The support, from the sources:**
- **Finding G's ledger/verdict ruling.** `credential-completed` is an accumulation surface. The
  mentor has held that accumulation and verdict surfaces have *different governing principles* and
  that *"the answer that is right for one is wrong for the other."* Narrowing the tag by importing
  a **verdict-surface** predicate is precisely the transfer that ruling declines to make
  automatically.
- **The Q2 docstring's own argument**, quoted in full in §5: the two ledger consumers are *"neither
  a 'verdict' nor a 'gate' in the sense this routing must avoid"*, and the resulting accrual is
  *"a foreseeable, intended consequence of correctly classifying the action … not a leak."*
- **The engagement/emission distinction is already the working reading** (§9, Q-D2-1), deliberate
  and battery-pinned, on the same 2026-07-19 ruling read narrowly.

**Costs:** the divergence Finding A names persists, and Finding D's non-monotonicity (0 factors tag,
1 factor does not) stands unexplained — a mentor electing this option may wish to say whether that
is acceptable or a separate defect.

---

## 11. What is at stake for the flip

**Stated plainly, and it is less than the surrounding urgency might suggest.**

- **What it affects:** `dikaiosyne` earned levels in `agent_trust_state` can rise — one rank per
  accreditation write, bounded by each assessment's own proximity — on evidence from actions with
  **no other party identified at any circle**. Downstream, that dikaiosyne level feeds the
  minimum-domain aggregate on the **public** trust record (`GET /api/trust-record/{agent_id}`), and
  the same field carries a live score bonus (`score-architecture.ts:599`).
- **What it does NOT affect:** the verdict surfaces. `computeProximity` never reads
  `virtue_domains_engaged`, and `deriveGuardrailVerdict` never reads it — Q2's docstring states
  this and the 2026-08-02 review re-confirmed it by grep. **The live `/api/guardrail` gate is not
  in this question's blast radius.**
- **Direction of error:** trust reads **higher** than the evidence warrants, which is the direction
  this project does not take by default. That is why D4's activation raised the row: before D4 the
  same mis-attribution produced a *cap*, and a mis-attributed cap errs safe.
- **Weights remain BLOCKED and the S11 flip remains REFUSED regardless of how this is answered.**
  This question unblocks neither. It is a live-ledger accuracy question, not a readiness question.
- **R18 disposition, stated rather than left silent** (the register's D4 row required an explicit
  R18 decision on this same public surface rather than an assumed silence, and that precedent is
  followed here): **ruling on §9 creates no R18 obligation** — no public claim changes because
  nothing changes. A *build* would carry its own R18 decision, and Finding E names the specific
  published sentence (`llms.txt:548`) that an engine-side build would put at risk.

## 12. Honest limits

**Measured / observed:**
- Every line and formula in §2 and §§3–8 — read directly from source at HEAD `793e493`, line
  numbers re-derived by `grep -n` on 2026-09-06, **with one disclosed exception, corrected**: the
  `llms.txt` locus in §7/§10 was **inherited from the register rather than re-derived**, and was
  wrong by 130 lines (the register's D4 row cites `:418`; the sentence is at `:548`, and `:418` is
  an unrelated closing brace). Found at independent review, corrected here. **The register's own
  mis-citation is still there and is carried as a finding in the D2 annotation** — note that it
  travels with the words *"verified verbatim 2026-08-17"*, which is exactly how a stale citation
  survives a re-read. The quoted sentence itself is verbatim-accurate at `:548`.
- The single-event state (`earned_level 'deliberate'`, `profile_prior 'habitual'`) — observed by
  the D4 took-effect session on 2026-09-05, quoted from the register, **not re-observed here.**

**Corrected at independent review (PR19 — three blind reviewers on separate dimensions: source
fidelity; ruling fidelity + neutrality; register corrections + epistemic labelling + completeness).
All findings were folded; none was refuted. They are named individually because a scope document's
defects are invisible once it becomes a ruling.**

*Source fidelity (each understated something this document exists to weigh):* the `llms.txt` locus
above; a claim that `isDikaiosyneEngaged` is exported (it is **not** — a real cost of Option 2, now
in its cost list); "four months" for the Q2→M-1 gap (it is **fourteen days**, which weakens a point
this document was making and is stated as fourteen); and a two-case partition of the
`selfCircleOnlySuppression` collapse that omitted the `met`-only case (§7, third bullet). Four
further line-number corrections and §6's table qualifier changed no conclusion.

*Ruling fidelity + neutrality — the most serious group, and they ran in one direction.* **The
2026-08-02 ledger/verdict ruling was omitted entirely** (now §8b/Finding G) — the prior ruling
closest to Q-D2-1, and the strongest support for the disposition this document was least developing.
**Q2's own mentor wording was replaced by the builder's implementation docstring** on the precise
question being re-put (now both are quoted, §5). **M-1's conditional was rendered as an asserted
premise** and as a claim about "the reducer" when the mentor wrote "the implementation" — which
framed the mentor as partly wrong about a matter on which the mentor said nothing (§5). **§10's two
"Costs" lists were structurally asymmetric** — four harms against two harms and two benefits — so
the section ranked by composition under a heading promising it did not; both options now carry the
same two headings and Option 3 is developed rather than named. **Two quoted elisions both removed
the same exculpatory clause** (restored, §5). **"The correct two domains plus the mis-attributed
one" decided Q-D2-1 in the prose**, and "on its face a defect" in Q-D2-2 contradicted §13; both
rewritten descriptively. *Every direct quotation was verified verbatim; nothing was fabricated.*

*Register + epistemic labelling:* §12's own heading claimed "any live agent" where the evidence
covers one identity (narrowed); one quotation lacked the locus every other quotation carries (added,
and it turns out to be this project's own code comment rather than a ruling — now labelled as such);
§2.2's tense outran its REASONED label; the already-ruled engagement-vs-emission distinction was
present only as an Option-2 aside and is now a fact under Q-D2-1; and no R18 disposition was stated
either way (now stated, §11). Findings A and B were independently confirmed, B strengthened by git:
the register row was written 2026-07-17 (`94ba579`) and `isDikaiosyneEngaged` introduced 2026-08-02
(`aac6442`) — sixteen days later, so the staleness is datable, not merely arguable.

**Reasoned, not measured:**
- The multi-event rise past `deliberate` (the register's own label, deliberately not upgraded).
- That `SUBSTRATE_AGENT_CIRCLES_ENABLED` is on in production (§2.3 — inferred from orientation-reading
  rows that cannot exist otherwise; a repo session cannot read Vercel).
- Finding E's "the justice path would not move" result, and its stated conditionality on D4's flag.
- Finding F's ceiling-removal coupling.

**Whether THE ONE LIVE HARNESS IDENTITY's ledger is affected today — checked, and the answer is no,
for a reason that is itself on record.** *(An earlier draft headed this "whether any live agent's
ledger is affected" — a scope the caveat at the end of this paragraph withdraws two sentences later.
Other agent ids exist on this project. Corrected at independent review.)* This session has **no database access** (repo-only; the standing opener
records Supabase state as unverified from here), so this rests on the register's own D1 query of
2026-09-05: a grouped, unlimited scan of `agent_trust_events` for `sagereasoning:s9-loop@v1` since
2026-07-18 returned **four event types, all `virtue_domain: null`** — orientation readings (1,356 +
786) and reflects (165 + 107) — and **no `credential-completed` at all.** The cause is recorded and
structural: the harness close hook sends only `kind: "seed"` (`close-hook.mjs:168`), the row already
exists, so the route returns **409 before any emission**. **No accreditation write has landed on the
one live identity in seven weeks, so D2's increase path has not fired there.** The exposure is
prospective — it begins with the next genuine `update`-kind accreditation write. *(That is the same
fact that keeps D1's re-latch watch open; it is not new here, and it is quoted rather than re-derived.)*

**Not checked:** whether any *other* agent id carries `credential-completed` rows — the D1 query was
scoped to `s9-loop`. A ledger query across all agents would settle it and is not run here.

## 13. What this scope does NOT claim

- It does not decide any question in §9, and does not elect between the options in §10.
- It does not claim the tag is a defect. §9 puts that as the question; Finding D observes an
  anomaly (non-monotonicity) without ruling that the correct rule is the narrowed one.
- It does not re-open D4, which is ruled, live and proven.
- It does not claim the multi-event rise has occurred, or that any production trust record is
  currently overstated.
- It does not propose a build, a flag, a battery, or a sequence. If §9 is ruled such that a change
  is owed, the build is its own session under D3 (`code-critical`, founder-walked).
