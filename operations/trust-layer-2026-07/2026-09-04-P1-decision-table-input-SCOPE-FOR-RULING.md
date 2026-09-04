# P1 — What the decision table reads when it fires (SCOPE, FOR RULING)

**Status:** Authored 2026-09-04. **`governance` — documents only.** No code, schema, flag, credential or
public-surface change; nothing built, activated, or pre-approved. This is the "its own design step" the
S11 register names for P1. It does not license the flip and makes no claim about readiness.

**Routing recommendation: MENTOR RULING, not founder election.** The question turns on reconciling two
passages of an already-binding ruling (the 2026-07-12 S11 verdict, Q2 and Q3) against a build seam
authored independently of it. Interpreting a binding ruling's own words is not the AI's to settle and is
not a preference the founder can elect. **§6 states what I would recommend, disclosed as a
recommendation.**

---

## 1. The question, as the register states it

> The at-action verdict and the accumulated trust state currently produce different recommendations on
> the same action class. The mentor: *"That divergence is not a minor implementation detail. It is the
> question of what the decision table is actually reading when it fires."*

Over the frozen 130-record buffer:

| Reading | Result |
|---|---|
| 1. At-action verdict, Arm 1's justice-surface reduction | **129 do-not-proceed**, 1 pause |
| 2. `justiceSurface: 'none'` (the §4 scorer's reading) | **130 proceed** |
| 3. Accumulated trust state (the live harness advisory) | **proceed / log** |

---

## 2. Finding A — readings 1 and 2 are not competing implementations

Verified first-hand this session. **`recommendIntervention` has exactly one live caller in the entire
codebase**: `readTrustVerdict` (`website/src/lib/substrate/trust-core/harness-integration.ts:563`),
which feeds it through `interventionInputFromS3`. That function's own docstring states the design
intent: *"Map S3 combiner outputs to an intervention input (the consumption seam — S4 consumes S3, never
re-derives)."*

Readings 1 and 2 are **reconstructions** — the F2 briefing fed at-action signals into the engine to see
what the table would say. The briefing discloses this in its own §9: *"It is a reconstruction, not an
observation of the live path."*

So the register's "three readings" is not three wired paths competing for primacy. It is **one wired
path and two hypotheticals about what the flip would use.** That does not dissolve P1 — §4 below is why —
but it changes what the question is asking. It is not "which of three implementations is correct?" It is
**"is the wired seam the right one, given that the mentor's Q3 points somewhere else?"**

## 3. Finding B — reading 3 is not currently a candidate (a live MEASURE-honesty defect)

`readTrustVerdict` takes `taskHasJusticeSurface?: boolean` and defaults it to `false`
(`harness-integration.ts:566`). **No caller anywhere passes it.** Verified by grep across
`website/src` and `harness/`: the only occurrences are the parameter definitions themselves and the
call sites, none of which supply it —

- `harness-integration.ts:566` — the default
- `api/practice/discernment/handler.ts:191` — `readTrustVerdict(agentId)`, no opts
- `api/trust-record/[agent_id]/handler.ts:152` — passes `strictStore` only
- **CORRECTION (2026-09-04, found by `tsc` at the build):** a FOURTH non-supplying caller exists at
  `website/scripts/false-hold-observation-report.ts:358` (passes `client` only). The grep above
  covered `website/src` and `harness/`, not `website/scripts` — my omission. The finding's
  conclusion is unchanged (no caller supplies the flag); the count as first written was wrong.

`interventionInputFromS3` gates the entire justice branch on that flag (`intervention-engine.ts:786`),
so the wired path's `justiceSurface` is **unconditionally `'none'` by omission**.

**Consequence:** reading 3 does not report `proceed/log` as a judgement that no justice surface was
engaged. It reports it because **the justice question is never asked.** Reading 3, as wired, *is*
reading 2 — arrived at accidentally rather than by design.

This is a MEASURE-mode honesty defect standing on its own, independent of how P1 is ruled: the live
harness advisory currently gives an answer to a question it did not put. It should be named and fixed
whichever reading wins, and it means **the register's characterisation of reading 3 as a distinct third
reading should be corrected.**

## 4. Finding C — why P1 survives Finding A: the two readings answer different questions

The engine's designed seam and the mentor's Q3 point at different objects.

- **The seam** (`interventionInputFromS3`) consumes the **weighted aggregate** — the agent's accumulated
  per-domain trust across sessions. It answers: *what does this agent's practice history warrant?*
- **Q3** specifies that G6(a) binds on *"the verdict that opened the loop"* — the **at-action** verdict.
  That answers: *was this action's justice surface resolved?*

These are genuinely different objects, and **the decision table's own rows mix the two idioms.**
`Deliberate + justice surface unevaluated → do not proceed` is a per-action reading. `Habitual → pause`,
and the A8 two-then-escalate bound, read naturally as longitudinal. The table was authored (S4,
2026-07-08) before anything forced the distinction, so it does not say which object it ranges over.

**That is the real content of P1**, and no amount of code reading settles it — it is a question about
what the table means.

## 5. Finding D — the stakes are retroactive, which is why this is mentor-shaped

Q2's staging premise, already adopted, is:

> A benign action that engages no kathekon factors cannot trigger a do-not-proceed row. The
> do-not-proceed class therefore has a structural false-positive floor of zero on genuinely
> kathekon-free actions.

That premise is **true** under reading 2 and **false** under reading 1 — where the class fires on 129 of
130 kathekon-free actions. So the choice does not merely configure a future flip; it retro-validates or
invalidates a ruling already in force, and Q2 staged the do-not-proceed class *first* precisely because
it was believed the safe one to bind.

## 6. The candidate resolution I would recommend, and its ground

**Recommendation: the at-action verdict is the table's input for the per-action rows, filtered by Q3's
kathekon-engagement threshold before any justice surface is reported.**

The ground is that **the mentor appears to have already answered this in Q3, for the G6 path**, and the
answer reconciles readings 1 and 2 rather than choosing between them. Q3's build specification:

> G6(a) does not bind when: the correction loop was opened by a verdict that found contrary to
> appropriate action with no kathekon factors detected... In the non-binding case: the open loop is
> logged as a developmental flag, the action proceeds under log-and-continue, **consistent with the
> deliberate-proximity-without-justice-surface row of the decision table.**

That last clause maps the false-positive class **onto the table's `justiceSurface: 'none'` row by name.**
On that reading, readings 1 and 2 are not rivals: **reading 2 is what reading 1 becomes once Q3's filter
is applied.** The 129 figure is what you get by feeding the at-action verdict in *unfiltered* — which is
the composition Q3 exists to forbid.

If that is right, then:

1. The table's per-action rows read the **at-action verdict** (honouring Q3's "the verdict that opened
   the loop").
2. A verdict meeting **no** kathekon-engagement condition reports `justiceSurface: 'none'` — not
   `'unevaluated'`. Q2's zero-false-positive floor is restored, and its staging premise stands.
3. The **aggregate trust state** is not the per-action table input. Its consumer is **depth calibration**
   (Q7's aggregate-keyed conservative form) — a different question, already ruled, already aggregate-keyed.
4. `interventionInputFromS3` is not wrong; it is **wired to the wrong consumer**. It would keep serving
   the trust-record surface, and a sibling seam would serve the enforce path.

**Disclosed against my own recommendation:** Q3 is written about G6(a) — the open-correction-loop bound —
not about the decision table's input in general. Reading its "consistent with" clause as settling the
table's input for *all* rows is an extension of its stated scope. That extension is exactly what I am
asking be ruled on rather than assumed. A reasonable contrary reading is that Q3 qualifies only G6 and
leaves the table's input genuinely open.

## 7. Build consequences if §6 is ruled correct (not built here)

- A sibling seam (`interventionInputFromAtAction`) mapping an at-action assessment + its kathekon
  engagement into `InterventionInput`. Pure, `code-elevated`, dark.
- The kathekon-engagement threshold is **already implemented** — `assessKathekonEngagement`
  (`kathekon-engagement.ts`), the canonical shared predicate the register's P2 records as landed, and the
  one the flip was always specified to bind on. No new predicate.
- `readTrustVerdict`'s role narrows to depth calibration + the public trust record; its intervention
  recommendation is either removed from the harness advisory or re-labelled to say what it ranges over.
- Finding B's fix (supply `taskHasJusticeSurface`, or remove the parameter as unreachable) — owed
  regardless of the ruling.
- The 130-record reclassification re-runs under the filtered reading, as evidence, not as readiness.

## 8. What this scope does NOT claim

- **Not** that P1 is discharged. It is scoped and a resolution is recommended; discharge is the ruling.
- **Not** that the flip is nearer. P4 fails independently (one cardinal domain at 0.42 confidence); P5's
  denominator is still unsourced; P6's window has not started. Ruling P1 moves none of them.
- **Not** a re-opening of Q2's staging or the four-part standard. Both stand as given.
- **Not** verified against production. Findings A and B are first-hand reads of the repository at HEAD.

---

*Sources read first-hand this session: `intervention-engine.ts` (§§ input shape, SECTION F seam),
`harness-integration.ts:503-580`, the three `readTrustVerdict` call sites,
`2026-07-12-mentor-consultation-s11-enforce-gate-verdict-verbatim.md` (Q2, Q3, Q7),
`2026-07-17-F2-mentor-briefing.md` §9, `S11-FLIP-PREREQUISITES-REGISTER.md` §A.*
