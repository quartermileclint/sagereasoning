# SCOPING SESSION RECORD — Hegemonikon habituation drift + melete (jointly)

**Status: OPEN — awaiting ruling.** **Tier: `governance`.** Opened 2026-08-12 by mentor ruling on
principles 4 and 5 of `2026-08-12-five-stoic-principles-architectural-examination.md`, and **amended
the same day** by the mentor's ruling on finding 3 of
`2026-08-12-guide-function-agent-vs-human-practitioner.md` (which added the Seneca criterion and the
hysteresis conflation warning below).

**This record opens a session. It does not run it.** **None of the three scope items below is
pre-answered**, and **no build is authorised**.

**Why `governance` and not `code-elevated`:** the first question is not *can this be built* but *may
the record honestly claim it* — ADR-013 §8 honest-claims territory. (A resulting build would be
`code-elevated` and, notably, would need **no schema**: variance over the existing M7 window is
computable from rows already persisted, the same posture AE-1 took.)

---

## Scope item 1 — the session question, verbatim as ruled

> Does the trust record attest anything about discriminative range — and if not, should ADR-013 §8's
> `does_not_attest` list say so explicitly? Is a variance/dispersion signal over the existing M7 window
> a legitimate addition?

## Scope item 2 — melete's disposition-formation half (same axis, opposite sign)

Principle 4's verdict was **already encoded** on the human-practitioner surface — three live proactive
tools confirmed: `/morning` (*"the Stoic orientation of the ruling faculty (hegemonikon) before the
day's impressions arrive"*, `src/app/morning/page.tsx:11`), `/premeditatio`'s net-new *"Prepare a
disposition"* exercise (2026-07-13), and `/sage-compass` (run before a difficult decision). The premise
that the pipeline is *"oriented entirely toward reactive examination"* does not hold there.

What remains is a **hexis** question, and it is **the same axis as scope item 1 with the opposite
sign**:

- **Melete asks:** is repeated rehearsal **building** discrimination?
- **Habituation drift asks:** is repeated assent **eroding** it?

**Ruled inherited constraint: these must be scoped in the same session or neither.** A design that
measured one and not the other would be measuring half an axis.

## Scope item 3 — is the M7 window the right measurement window? (ADDED by ruling)

Added to this session's scope by the mentor's principle-5 ruling, verbatim in substance:

> the session must also examine whether the M7 window is the right measurement window for a variance
> signal — **this is a measurement-honesty question, not a build question, and belongs in the
> governance session before any build is authorised.**

**Not pre-answered.** The M7 window (D17: 90 days / last 30 rows) was sized for the trajectory
overlay's own purposes; whether a window sized for *level and rate* is the right window for *variance*
is exactly the open question, and it is to be settled before, not during, any build.

## Framing question — is the proposal RANGE narrowing? (ADDED 2026-08-13)

**Added to this session's scope by the idea-creation research findings**
(`2026-08-13-idea-creation-research-stoic-connections.md`, Connection 5). **A framing question for the
session's examination — not a build proposal, and not a pre-answer to scope items 1–3.**

The alternative-uses task is **a direct measure of discriminative range** — how many non-habitual uses
can be generated for a fixed object. Carried across:

> Not just whether the same sub-species passion appears repeatedly in an agent's trace history, but
> **whether the agent's proposal range is narrowing — whether it is seeing fewer and fewer distinct
> types of impression as worth examining.**

**Why this is a second axis and not a restatement of the gap.** Scope item 1's finding is that
**uniformity reads as `stable`** — no signal measures variance or dispersion of the *reading*. This
adds the dispersion of the *subject matter*: not only *"is the verdict always the same?"* but *"is the
set of things being examined shrinking?"* **An agent could show varied proximity readings across a
narrowing set of impression types and pass both checks taken separately** — which is the shape of a
measurement gap that survives a partial fix, and precisely why this belongs in the session's framing
rather than arriving after a build.

**This is a measurement-honesty question**, in the same class as scope item 3's M7-window question,
and it is to be examined in the same session.

**The correction that governs it, carried from the source record and binding here:** the research it
derives from is oriented toward *more and more original ideas*; **the practice is oriented toward
examining accurately, which sometimes means generating fewer responses and sometimes withholding
assent entirely.** A session that read "narrowing range" as "should produce more varied proposals"
would have inverted the instrument. **The loop is not trying to generate the most creative proposals;
it is trying to generate proposals that survive examination** — and the ruled **null cycle** is a
legitimate outcome, not a failure to be optimised away.

---

## The finding that opened this session — gap confirmed, precise and checkable

**The gap is not that drift detection is absent.** Verified live signals:

- **AE-1's practice-delta layer** (`website/src/lib/substrate/trajectory-delta.ts`, Live MEASURE since
  2026-07-18) — between-half deltas over the M7 window: sub-species passion frequency
  (`FrequencyDelta = 'fading' | 'recurring' | 'new' | 'stable'`, `:122`), kathekon-quality trend,
  first-circle obligation trend, per-domain engagement, four dimension trends, `persisting_passions`
  (`:660`, the aggregator's >20% rule).
- **B5's session-decline signal** (Live since 2026-07-30) — `declining` across positively *declared*
  session boundaries.
- **A3 decay** (`website/src/lib/substrate/trust-core/constants.ts:42`) — volatility-rated onsets by
  **inactivity** (decay-from-disuse, a different mechanism from drift-from-repetition).

`recurring` and `persisting_passions` genuinely measure **recurrence of the same class**.

**The gap is that uniformity reads as `stable` — the healthy value.** Every signal above measures
**change in level or rate**. **None measures variance, dispersion, or discriminative range.**

An agent whose last thirty examinations all return `deliberate`, same domain, same sub-species,
oriented `toward` each time, produces: `direction_of_travel: stable`; every `FrequencyDelta: 'stable'`;
**no** B5 decline (non-increasing but not strictly-lower-final, so the predicate correctly does not
fire); orientation readings uniformly `toward`; `agent_trust_state` steady at its earned level.
**Every signal reads healthy — and that profile is exactly what narrowed discrimination looks like.**

**This is the inverse of the F-Q43 lesson.** F-Q43 was a *detector* that fired on everything and so
discriminated nothing (S9b calibration: the original Q4.3 predicate fired on *any* horme/praxis stage,
*"zero discrimination on the operative input class"*). This is a *subject* that is everything-alike,
read by the detectors as steadiness.

---

## The criterion this session is to use — Seneca, *Letters* 75.8–9 (ADDED by ruling)

Added by the mentor's guide-function finding-3 ruling. Seneca grades the *proficientes* by
**relapse-resistance, not by current level**: the second class *"have laid aside the greatest ills of
the mind and their passions, but not so securely that they cannot relapse"*; the third are secure but
*"not yet confident."* **The distinguishing property between grades is stability under perturbation** —
which is what a hexis is, and precisely what no current signal measures.

**The Senecan frame is live on both surfaces**, so this criterion has somewhere to land: human side
`baseline-assessment.ts:63-68` (`SENECAN_GRADE_ENGLISH`, R8c); **agent side**
`sage-assent-wrapper.ts:120,144,290` (`SenecanGradeId`, `DEFAULT_STARTING_GRADE: 'pre_progress'`) and
`agent-hand-back-report.ts:694,780`.

---

## ⚠ A conflation risk this session MUST guard against (named by ruling)

**The grade engine's hysteresis stabilises the grade *assignment* against noisy input. It does not
measure the *practitioner's* stability.**

These are easy to conflate, and the mentor's ruling names the failure mode explicitly: **a session that
conflated them would report the smoothing of its own measurement as evidence of the subject's
steadiness.** A trust record that looked steady *because its own smoothing suppressed variation* would
be the exact opposite of the honest signal this session exists to consider.

This warning is recorded at the session's opening, not left to be rediscovered.

---

## Inherited constraints — binding on this session

1. **Weights remain BLOCKED.** Any signal contemplated here is **MEASURE-only** and carries no
   weights-tier claim. (Standing since the gaming-robustness bar; unaffected by anything in the
   rulings that opened this session.)
2. **Scope items 1 and 2 are one axis** — scoped together or not at all (above).
3. **Scope item 3 precedes any build** — the window-honesty question is settled first, by ruling.

---

## What this session does NOT do

- **Does not build**, and does not authorise a schema change (none would be needed — variance is
  computable over rows already persisted).
- **Does not touch GS-ATRF-1, GS-ATRF-2, or GS-ATRF-3**, all of which remain open. This is
  trust-record scope, not generation-step scope.
- **Does not re-open** the four QG rulings, B1's §2.12 requirement, GS-ATRF-1's ruled four-virtue
  answer, the S6 frozen null result, or the `high|medium|low` blast-radius vocabulary.
- **Is not absorbed into any existing open question** — a separate item, by ruling.

## Sources

- `2026-08-12-five-stoic-principles-architectural-examination.md` §§4–5 (the findings).
- `2026-08-12-guide-function-agent-vs-human-practitioner.md` §3 (the Seneca criterion + the
  hysteresis warning).
- Both companion verbatim records of the same date.
- ADR-013 §8 (the honest-claims envelope this session's item 1 tests).
- `trajectory-delta.ts`; `trust-core/constants.ts:42`; `sage-assent-wrapper.ts`;
  `agent-hand-back-report.ts`; `baseline-assessment.ts`.

*Status at close of this record: **OPEN — awaiting ruling.** No work has been done against any of the
three scope items.*
