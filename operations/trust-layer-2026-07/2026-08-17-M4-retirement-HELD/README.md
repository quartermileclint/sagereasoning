# M-4 grade-gate retirement — BUILT, VERIFIED, HELD FOR A MENTOR RULING

**Status: NOT APPLIED. Held 2026-08-17 by founder election.**
**Do not apply any of this until the mentor rules on the question in §2.**

This directory preserves work that was built, tested, mutation-verified, and then **deliberately
reverted** — because verifying it surfaced a consequence nobody had ruled on. It is kept here so the
successor session restores rather than rebuilds it, and so the reasoning is not lost with the
session that produced it.

---

## 1. What this was

M-4 obligation (1): retire `disposition_stability` from the agent grade gate, per the binding ruling
at `../2026-08-17-mentor-ruling-M4-return-verbatim.md`.

The implementation added, to
`website/src/lib/substrate/trust-layer/grade-engine/grade-transition-engine.ts`:

- an exported `DIMENSIONS_RETIRED_FROM_GATE = ['disposition_stability']`
- an exported `gateEvaluatedLevels(levels)` helper filtering retired dimensions out
- both `dimensionsMeetFloor` and `dimensionsMeetElevated` reading through that helper
- a long comment block recording the ruling, the intended unreachability, and the prohibition on
  re-tuning thresholds

Deliberately NOT done, and still the right call: the dimension was **not** deleted from the shared
`DimensionScores` type, because (a) that type is shared with the human mentor-profile surface
(`mentor-profile-adapter.ts`, `/baseline`, `/dashboard`, `/private-mentor`) which the ruling does not
touch, and (b) both gate predicates iterate `Object.values(levels)`, so a missing key would make
`DIMENSION_LEVEL_RANK[undefined] >= n` false and **freeze every grade rung**, not merely the top one.

It verified green: `grade-gate-retirement.test.ts` 11/0, mutation-verified (emptying the retirement
list produced 5 failures including both load-bearing ones), and the full trust-layer battery stayed
green — 360+ assertions across 6 suites, zero failures.

## 2. Why it was held — the question for the mentor

**That clean sweep was itself the warning sign.** Nothing failed when the top grade rung was made
unreachable, which meant no existing test had ever asserted a `principled → sage_like` promotion.
PR19 then found what the green batteries had not:

Both gate predicates count **how many of the remaining dimensions** meet a level. Retiring one
dimension shrinks the evaluated pool from 4 to 3 **everywhere**, not only at the rung the ruling
addressed. Verified directly against the threshold table:

```
'deliberate_to_principled': {
  elevated_dimension_count: 3,
  elevated_dimension_level: 'advanced',
  ...
}
```

- **Before:** 3 of 4 dimensions at `advanced` — 75%.
- **After:** 3 of 3 — **100%**. Every remaining dimension must be `advanced`.

**The mentor ruled on the top rung only.** This is an undisclosed tightening of a *middle* rung.
The builder's own code comment claiming "lower rungs are unaffected" was **false** and is one of the
things this hold exists to avoid shipping.

**Why it was not simply fixed:** compensating it means lowering `deliberate_to_principled`'s
`elevated_dimension_count` from 3 to 2 to preserve the old ratio. That is *retuning a threshold to
preserve reachability* — the precise category the mentor named as the dishonest option, merely
applied to a rung they were not asked about. Choosing between "accept a tightening nobody ruled on"
and "make the ruled-dishonest move on an unruled rung" is a ruling-shaped decision, not a builder's
call.

## 3. What is in this directory

| File | What it is |
|---|---|
| `grade-gate-retirement.test.ts.draft` | The 11-assertion battery, mutation-verified. **`.draft` extension is deliberate** — as `.ts` it would fail `tsc` (it imports exports that no longer exist) and break the pre-commit hook. |
| `engine-change.patch.md` | The exact `grade-transition-engine.ts` change, reconstructed. The original was discarded by `git checkout` and exists nowhere in git history — this file is the only copy. |

## 4. How to restore, once ruled

1. Apply `engine-change.patch.md` to `grade-transition-engine.ts`.
2. Move `grade-gate-retirement.test.ts.draft` to
   `website/src/lib/substrate/trust-layer/grade-engine/__tests__/grade-gate-retirement.test.ts`.
3. **Fix the known defect in §4 of that test before trusting it:** it asserts
   `deliberate_to_principled` "needs 3 dimensions at `established`" — the code actually requires
   `elevated_dimension_level: 'advanced'`. PR19 caught this; it means §4 never exercised the real
   threshold and would not have caught the tightening above.
4. Add the assertion neither new battery has: an end-to-end case driving
   `computeWindowSnapshot` → `gateEvaluatedLevels` → `dimensionsMeetFloor`/`dimensionsMeetElevated`
   through the real production wire. Both current batteries test their own module in isolation with
   hand-built fixtures, so a combined regression across both defences would slip through.
5. Re-run: the new battery, plus `sage-assent-*`, `score-architecture`, `agent-hand-back-report`
   (the two `accreditation-*` suites need `npx tsx --env-file=.env.local`).
6. Note the **`KEEP IN SYNC` banner drift** PR19 flagged: a canonical mirror exists at
   `/trust-layer/grade-engine/grade-transition-engine.ts` (repo root, not imported by live code) and
   already diverges. Decide whether to port or to retire the banner's claim.

## 5. Still outstanding on M-4 regardless of this ruling

Obligation (3) — the mean-floor correction — **is done and live in `c326e64`**. Obligations (1) and
(4) are not:

- **(1)** the agent-facing *emissions* (`api/baseline/agent`, `api/assessment/full`, the accreditation
  store/card, `agent-hand-back-report.ts`) and the persisted DB column — a public-contract change with
  a migration question (drop, or leave dead?).
- **(4)** the published disclosure naming **both** defects on `llms.txt`, `agent-card.json`, and
  `trust-record-payload.ts` (whose `does_not_attest` sentence is pinned object-identical by the S10
  battery). **R18: founder sign-off on exact wording before any public surface changes.**

**Spec 4 (`SUBSTRATE_TRAJECTORY_DISPERSION_ENABLED`) stays deactivated** — the ruling says until the
dimension is *restored*, and retirement is not restoration. It has not even been retired yet.
