# Five Stoic principles examined against the architecture — verdicts

**Date:** 2026-08-12. **Tier:** `governance` / analysis. **Status:** analysis for the mentor — not a
ruling, not a build authorisation, not a scope amendment.

**The question, verbatim, is recorded at
`2026-08-12-mentor-consultation-five-stoic-principles-verbatim.md`.** Five principles, each arrived at
from practice recognition rather than doctrinal extraction; for each, a verdict — *already encoded* /
*names a gap* / *collapses into an existing carried item* — with the architectural location named.

**Constraints observed throughout, and stated here so a reader can check compliance rather than trust
it:** primary Stoic sources only for doctrinal claims; every architectural claim references a named
component, endpoint, or governing document, verified at source this session (PR20 — nothing inherited
from a summary); **no open question's scope is expanded**; and **GS-ATRF-1, GS-ATRF-2 and GS-ATRF-3
are not pre-answered.** Where a principle bears on one of them, the bearing is stated as a *boundary*
— what the principle is not — rather than as an answer.

---

## Summary of verdicts

| # | Principle | Verdict | Location / home |
| --- | --- | --- | --- |
| 1 | Prohairesis as the only locus of agency | **Names a gap** — supplies GS-ATRF-3's *object of measurement*, and grounds Q1 doctrinally. Does **not** collapse into the control filter. | ATRF scoping session (same home as today's routing 1) |
| 2 | Kathêkon as role- and circumstance-relative | **Names a gap** — verified: `/api/guardrail` takes **no role input at all**. The loop evaluates against an abstract standard. | **Warrants its own scoping session** (`governance`) |
| 3 | Sympatheia | **Already encoded** — `logos-teaching.ts:275`, live at `/logos`. Doctrinal clarification; **no architectural addition**. One carried citation defect becomes load-bearing. | No new item; connects an existing carried fix |
| 4 | Melete | **Already encoded on the human surface** (three live tools); its disposition-formation half **collapses into principle 5's gap**. | Folds into #5's session |
| 5 | Hegemonikon habituation drift | **Names a gap**, and a precise one: **uniformity reads as `stable`** — the healthy value. | **Warrants its own scoping session** (`governance`), jointly with #4 |

---

## 1. Prohairesis as the only genuine locus of agency

**Verdict: NAMES A GAP — but not the one the framing proposes. It corrects a category error, and the
correction is the useful part.**

### The premise needs inverting

The question states: *"The proposal is the assent."* On the primary sources, this is **inverted**.

Epictetus's sequence is **phantasia** (an impression is presented) → **synkatathesis** (assent is
given or withheld) → **hormê** (impulse to act). What is "up to us" is precisely the middle term:
*Discourses* 1.1.7–12 ("the faculty which makes use of impressions"), and 1.28.1–2 — assent follows
upon what appears, and withholding it is the act that is ours.

Under the Q1 hard constraint the loop **proposes and never executes**. A proposal presented to a human
or agent for election is therefore a **phantasia** — an impression offered — and the **assent is the
election**, performed by the recipient. The loop does not assent. It *presents*.

### Why the correction is architecturally load-bearing, not a quibble

It makes **Q1 a doctrinal necessity rather than a policy choice.** If the loop executed its own
proposal, it would be collapsing phantasia and synkatathesis into a single act — committing without a
preceding assent stage.

**That is the exact failure `mapTraceFeaturesToL4Signals`'s Q4.3 `resolutionBeforeComplete` detects**
(`website/src/lib/substrate/trust-core/l4-passion-audit.ts`): *"the trace's causal chain reached a
COMMITMENT / ACTION stage (horme / praxis) WITHOUT a preceding ASSENT/DELIBERATION stage
(synkatathesis)."* **The Q1 hard constraint and Q4.3's early-resolution check are the same principle
at two scales** — one architectural, one per-trace. Neither the loop's governing documents nor the L4
audit's own header currently names the connection.

### Does it collapse into the control filter? No — different objects

The control filter is real and live: `sage-prioritise.ts:171` (*"CONTROL FILTER (prohairesis): Is this
item within the agent's power to affect?"*), `deliberation.ts:229`
(`within_prohairesis`/`outside_prohairesis`), `agent-baseline.ts:101`. It **sorts subject matter by
controllability**.

The principle here is about **the assent act itself** — not which topics are controllable, but what
the thing that is ours *is*. A system could sort every item correctly by the control filter and still
have no account of where its own agency sits. Different objects; no collapse.

### What it gives GS-ATRF-3 — stated as an object, not an answer

Generation-step scope §2.12 (B1) already requires that the completion signal *carry examination
evidence rather than a binary flag*. This principle supplies **what that evidence is evidence
about**: the signal reports on a **prohairetic act belonging to the executing agent** — its assent and
its use of the impression — not on the outcome, which was never up to it (`heimarmene`, as
`logos-teaching.ts`'s own background doctrine already states: *"the outcome was never yours to
guarantee, because it was never yours alone to produce"*).

**This does not pre-answer GS-ATRF-3.** It names the signal's object. It says nothing about what
fields it carries, how it returns, or where it is stored — the three things B1 explicitly reserved to
the ATRF session.

**Home:** the ATRF scoping session, alongside today's routing 1
(`D-SUFFICIENCY-EXAMINATION-TRIGGER-ROUTED-2026-08-12`). **No separate session needed** — same
session, same document, and the two are complementary: routing 1 says what the examination should
*ask*; this says what it is *about*.

---

## 2. Kathêkon as action appropriate to role and circumstance

**Verdict: NAMES A GAP. Verified at source, and the gap is total rather than partial.**

### The architectural fact

**`website/src/app/api/guardrail/route.ts` contains no `role`, no `purpose`, and no
`orchestrator_profile` — grep returns nothing.** The IDEA loop's candidate filtering pass calls
`/api/guardrail` for every candidate, receiving proximity plus engaged virtue domains. **It assesses
each proposal with no knowledge of whose proposal it is or what role that agent occupies.** That is
evaluation against an abstract standard.

### The contrast is inside the same project, on the human side

Role is encoded — twice, live, and neither reaches the candidate path:

- **`/morning`** (`src/app/morning/page.tsx:174`): *"Before the day's impressions arrive, orient the
  ruling faculty. Name the roles active today and their kathekonta."* Explicitly role-indexed.
- **The calling gate** (`orchestrator_profile.purpose`, Trust Layer G1, live since S9b) declares an
  agent's role at session start — this session's own opening frame is an instance of it firing.

### The doctrine is unambiguous on this point

Kathêkon is role-relative by definition, not incidentally. Cicero, *De Officiis* 1.107–115 — the
four-*personae* doctrine: what is appropriate is determined jointly by universal rational nature,
individual nature, circumstance, and chosen role. Diogenes Laertius 7.107–108 defines kathêkon as
what is *"consistent in life"*, and every standard example is role-indexed (honouring parents,
serving country). **An assessment of appropriate action blind to role is assessing something other
than kathêkon** — it is assessing conformity to a general standard, which is a different thing and
should not carry the same name.

### Its bearing on GS-ATRF-1 — stated as a boundary, deliberately not as an answer

The question asks whether blast radius is *partly* a kathêkon question. **The honest answer available
without pre-answering GS-ATRF-1 is that the two are distinct, and folding one into the other would be
a category merge, not a refinement:**

- **Blast radius asks: how far does this reach?** A magnitude.
- **Kathêkon-appropriateness asks: is this mine to do, here, now?** A relation between action and
  role.

These come apart in both directions. An action can be **low blast radius and still not the agent's to
take** (trivial in reach, outside its remit). It can be **high blast radius and squarely appropriate**
(far-reaching and exactly what this role exists to do). A measure that conflated them would report the
same value for two situations calling for opposite dispositions.

**So: this does not answer GS-ATRF-1, and it argues against answering GS-ATRF-1 by absorbing it.** It
should be resolved as its own question, and the four ruled dimensions left as they are.

### WARRANTS ITS OWN SCOPING SESSION

**Tier: `governance`** (the scoping; any resulting build would be `code-elevated` at minimum and
touches a ruled seam).

**The specific question it would answer:** *Should the IDEA loop's candidate evaluation be
role-relative — and if so, by what mechanism, given that `/api/guardrail` takes no role input and the
ruled winner rule is "highest proximity among novelty-passers"?*

**Why it is genuinely mentor territory and not an engineering call:** QG-D's ruling already rejected a
selection-time weight for heuristic 5 on the ground that it *"would modify the ruled winner rule"*.
Any role-relative evaluation faces the same objection and must be ruled, not assumed. There is also a
live constraint from C6: the generation step's signal sources are *"bounded to the runner's own
state — explicitly not `getProjectContext`"*, so a role signal would need to be shown to sit inside
that boundary.

---

## 3. Sympatheia

**Verdict: ALREADY ENCODED. A doctrinal clarification that strengthens existing reasoning without
requiring any architectural addition — with one carried defect that this elevates in importance.**

### Where it already lives

`website/src/lib/logos-teaching.ts:275`, `BACKGROUND_DOCTRINES`, id `sympatheia` — live at `/logos`
since 2026-07-16, and already doing precisely the load-bearing work the question asks about:

> *"This is why an action is never assessed only by its local effect, and why the question 'who else
> is touched by this?' is not an optional courtesy but part of the assessment itself."*

It is one of the three background doctrines the module states *"generate no exercise of their own.
The exercises do not hang together without them."* — i.e. already positioned as foundational rather
than as a practice.

### Does it ground the moral-community extension better than oikeiosis alone? No — and using it that way would be weaker

They answer different questions, and **neither is the ground of membership**:

- **Oikeiosis** (Hierocles's circles; Cicero, *De Finibus* 3.62–63) is **developmental** — how concern
  extends outward from self. A psychological mechanism.
- **Sympatheia** (Marcus 7.9; DL 7.140 on the cosmos as a unified whole) is **cosmological** — the
  whole is one interconnected rational body. A fact about the world.
- **Membership in the moral community** turns on **participation in logos** — which is what
  `manifest.md`'s *Moral Community Boundary* section (added 2026-08-12, S5) already turns on.

**The decisive objection to using sympatheia as the membership ground: it proves too much.**
Sympatheia holds of the *whole* causal order, including everything non-rational in it. A membership
criterion built on interconnection would extend the moral community to anything causally
connected — which is not the Stoic position and not this project's. Rational participation is the
boundary; sympatheia explains the **stakes** of crossing it, not **who** is inside.

So: sympatheia strengthens the *reasoning* around the extension (it is why effects propagate and why
"who else is touched?" is mandatory rather than optional) and should be cited that way — but it does
not do, and should not be asked to do, the boundary work. **No architectural addition. No new carried
item.**

### One existing carried defect this elevates

The `/logos` PR19 review (2026-07-16) found that **the project's own corpus mis-cites the Marcus
interweaving line** — `stoic-brain/stoic-brain.json:151` gives **4.26**; the line is **7.9** (4.26 is
the distinct *spun-for-you* fate chapter), and the same entry's `DL 7.38` cite is also off. The
`/logos` page was corrected at the time (it carries 7.9 today, verified above); **the corpus root was
named as a carried follow-up "for after the window" and remains open.** That entry is the sympatheia
entry. If sympatheia is now to carry explicit doctrinal weight in the moral-community reasoning, its
corpus citation being wrong stops being cosmetic.

**Constraint on fixing it, already recorded:** `stoic-brain.json`'s path matches the `/api/reason`
byte-identity guard, so the fix is gated on the measurement window rather than freely available.

---

## 4. Melete

**Verdict: ALREADY ENCODED on the human-practitioner surface — the premise that the pipeline is
"oriented entirely toward reactive examination" does not hold. Its remaining half COLLAPSES INTO
principle 5's gap.**

### Three live tools are proactive, not reactive

- **`/morning`** — *"The Stoic orientation of the ruling faculty (hegemonikon) before the day's
  impressions arrive"* (`src/app/morning/page.tsx:11`). This is melete in Marcus's own form, and it is
  live.
- **`/premeditatio`** — carries a net-new *"Prepare a disposition"* exercise (added 2026-07-13),
  deliberately distinct from the pre-existing weekly reflection.
- **`/sage-compass`** — run **before** a difficult decision; produces a *bearing*, not a verdict.

`/logos` states the melete/technique distinction explicitly (`logos-teaching.ts:102`): *"the practices
still work. But they work as techniques, and a technique is something you perform. What the Stoics
were after was a disposition: something you become."*

So the reactive/proactive gap is **closed on the human surface**, by three named tools plus the
governing prose.

### What remains is not a melete gap — it is a hexis gap, and principle 5 owns it

Melete's distinctive feature in the sources is **repetition toward settled disposition** — Epictetus,
*Discourses* 2.9.13–14 (*"nothing is formed except by habit"*) and 2.18.1–5 (a faculty is *maintained
and increased by the corresponding actions*).

Both surfaces have **moments** of proactive orientation. **Neither tracks the arc** — whether repeated
rehearsal is producing a settled disposition. And that is exactly principle 5's object, approached
from the opposite sign:

- **Melete** asks: is repeated rehearsal **building** discrimination?
- **Habituation drift** asks: is repeated assent **eroding** it?

**Same axis, opposite directions.** They should be scoped together or the resulting design will
measure one and not the other. **Folded into §5's proposed session; no separate session.**

---

## 5. Hegemonikon habituation drift

**Verdict: NAMES A GAP — and a precise, checkable one. Drift detection is not absent, but the thing
the principle names is invisible to every existing signal.**

### What exists (verified)

- **`agent_trust_state`** — a materialised **current** fold: earned level, profile prior, volatility,
  last activity, justice latch, coverage.
- **A3 decay** (`trust-core/constants.ts:42`) — decline by **inactivity**, volatility-rated onsets.
  This is decay-from-disuse, a different mechanism from drift-from-repetition.
- **AE-1 trajectory delta** (`substrate/trajectory-delta.ts`) — the closest thing present:
  `FrequencyDelta = 'fading' | 'recurring' | 'new' | 'stable'` for sub-species passions
  (`:122`), `persisting_passions` (`:660`, the aggregator's >20% rule), per-dimension trends,
  `direction_of_travel`.
- **B5 session-decline signal** — `declining` across positively **declared** session boundaries.
- **C2 orientation readings** — per-examination `toward` / `away` / `indeterminate`.

`recurring` and `persisting_passions` genuinely measure **recurrence of the same class**, which is
adjacent to the principle. So the honest verdict is not "drift detection is absent."

### The precise gap: uniformity reads as `stable` — the healthy value

Every signal above measures **change in level or rate**. **None measures variance, dispersion, or
discriminative range.**

Consider an agent whose last thirty examinations all return `deliberate`, in the same domain, with the
same sub-species, oriented `toward` each time. Under the current vocabulary that profile produces:
`direction_of_travel: stable`; every `FrequencyDelta: 'stable'`; **no** B5 decline (non-increasing,
but not strictly-lower-final, so the predicate correctly does not fire); orientation readings
uniformly `toward`; `agent_trust_state` steady at its earned level.

**Every signal reads healthy. That profile is also exactly what narrowed discrimination looks like** —
an agent assenting identically to an entire class of impressions, no longer distinguishing cases it
once distinguished.

**This is the inverse of the F-Q43 lesson.** F-Q43 was a *detector* that fired on everything and so
discriminated nothing. This is a *subject* that is everything-alike, and the detectors read it as
steadiness. The project has already paid for the first lesson; the second is its mirror and is
currently unmeasured.

### Doctrinal grounding

Epictetus, *Discourses* 2.18.1–5 is the locus: *"every habit and faculty is maintained and increased
by the corresponding actions"* — and the passage's own application is to the erosion case, that
repeated assent to an impression-class strengthens the disposition to assent to it again. Also 1.27 on
impressions gaining their force through repetition. The claim is not that the faculty is destroyed but
that its **discrimination narrows** — which is precisely a variance claim, not a level claim.

### WARRANTS ITS OWN SCOPING SESSION (jointly with principle 4)

**Tier: `governance`.** Deliberately not `code-elevated`, because the first question is not *can we
build it* but *may the record honestly claim it* — ADR-013 §8's honest-claims envelope territory. (A
resulting build would be `code-elevated` and, notably, **needs no schema**: variance over the existing
M7 window is computable from rows already persisted, the same posture AE-1 took.)

**The specific question it would answer:** *Does the trust record attest anything about
discriminative range — and if not, should ADR-013 §8's `does_not_attest` list say so explicitly? Is a
variance/dispersion signal over the existing M7 window a legitimate addition, or does it fall outside
what the record may honestly claim?*

**Two constraints the session inherits, named now:** **weights remain BLOCKED**, so any such signal is
MEASURE-only and carries no weights-tier claim; and principle 4's disposition-formation half is the
same axis with the opposite sign, so the session scopes **both directions or neither**.

---

## What this analysis does not do

- **Does not pre-answer GS-ATRF-1, GS-ATRF-2, or GS-ATRF-3.** Principle 1 names GS-ATRF-3's *object*,
  not its content, shape, or return path (B1's reservation is untouched). Principle 2 explicitly
  **declines** to fold kathêkon-appropriateness into GS-ATRF-1's four ruled dimensions, and argues
  that doing so would be a category merge.
- **Does not expand any open question's scope.** Two *new* items are proposed (principles 2 and 5);
  neither is an expansion of an existing question, and both are named as separate sessions precisely
  so they are not absorbed into one.
- **Licenses no build, schema, flag, credential, route, or corpus edit** — including the
  `stoic-brain.json` citation fix named in §3, which remains gated on the byte-identity window.
- **Does not re-open** any ruled item: the four QG rulings, B1's §2.12 requirement, GS-ATRF-1's ruled
  four-virtue answer, the S6 frozen null result, and the `high|medium|low` blast-radius vocabulary all
  stand untouched.

*End of analysis.*
