# The reverted `grade-transition-engine.ts` change — reconstructed

**This is the only copy.** The original was uncommitted and discarded by `git checkout`; it exists in
no git object. Reconstructed verbatim from the session that wrote it.

Target file:
`website/src/lib/substrate/trust-layer/grade-engine/grade-transition-engine.ts`

**Do not apply until the mentor rules** — see `README.md` §2.

---

## The change

`dimensionsMeetFloor` and `dimensionsMeetElevated` (immediately after the
`DIMENSION_LEVEL_RANK` table) were REPLACED in full by the block below.

```ts
/**
 * Dimensions RETIRED from grade evaluation (M-4, mentor ruling 2026-08-17).
 *
 * `disposition_stability` cannot honestly certify. It carries two independent
 * defects: it cannot distinguish a disposition tested under varied conditions
 * from one never tested at all (the perturbation defect, UNFIXED), and until
 * 2026-08-17 it certified consistently poor reasoning as `advanced` because it
 * consulted variance but not the mean (the mean-blindness defect, now fixed in
 * window-aggregator.ts but NOT a restoration).
 *
 * ⚠ THE CONSEQUENCE IS INTENDED, NOT A BUG. The top rung
 * (`principled → sage_like`) requires `elevated_dimension_count: 4`. With three
 * dimensions evaluated, that count can never be met, so the rung is
 * STRUCTURALLY UNREACHABLE. The mentor ruled exactly this, verbatim:
 *
 *   "A grade rung that cannot be reached because the required certification
 *    cannot be made honestly is not a broken ladder; it is a ladder that
 *    accurately reflects what has not yet been demonstrated. The alternative —
 *    adjusting the ladder so the top rung remains reachable despite the missing
 *    honest measure — would be the dishonesty."
 *
 * ⚠ DO NOT "FIX" THIS BY LOWERING `elevated_dimension_count` TO 3. The mentor
 * named that as THE dishonest option: it "would preserve reachability by
 * removing the condition that made reachability meaningful." The threshold
 * stays at 4 deliberately. Lower rungs are unaffected — `principled` needs 3 of
 * the 3 remaining dimensions and remains reachable.
 *
 * WHY AN EXPLICIT LIST rather than deleting the key from `DimensionScores`:
 *   1. `DimensionScores` is SHARED with the human mentor profile
 *      (mentor-profile-adapter.ts) and rendered on /baseline, /dashboard and
 *      /private-mentor. The ruling retires the dimension from AGENT-facing
 *      surfaces; deleting the key would strip a human feature nobody ruled on.
 *   2. Both gate functions iterate `Object.values(levels)`. A missing key would
 *      yield `DIMENSION_LEVEL_RANK[undefined] === undefined`, and
 *      `undefined >= n` is false — so `dimensionsMeetFloor` would reject EVERY
 *      rung and freeze all agent grades, not merely the top one.
 *
 * Restoration (once a perturbation-adjusted measure exists) = remove the entry
 * below. `SUBSTRATE_TRAJECTORY_DISPERSION_ENABLED` (Spec 4) stays deactivated
 * until then — retirement is NOT restoration.
 */
export const DIMENSIONS_RETIRED_FROM_GATE: readonly string[] = ['disposition_stability']

/**
 * The dimension levels the grade gate actually evaluates, retired ones removed.
 * Both gate predicates MUST read through this — evaluating different dimension
 * sets in the floor check and the elevated check would be incoherent.
 */
export function gateEvaluatedLevels(levels: DimensionScores): DimensionLevel[] {
  return Object.entries(levels)
    .filter(([dimension]) => !DIMENSIONS_RETIRED_FROM_GATE.includes(dimension))
    .map(([, level]) => level as DimensionLevel)
}

function dimensionsMeetFloor(
  levels: DimensionScores,
  floor: DimensionLevel
): boolean {
  const floorRank = DIMENSION_LEVEL_RANK[floor]
  return gateEvaluatedLevels(levels).every(level => DIMENSION_LEVEL_RANK[level] >= floorRank)
}

function dimensionsMeetElevated(
  levels: DimensionScores,
  requiredCount: number,
  elevatedLevel: DimensionLevel
): boolean {
  const elevatedRank = DIMENSION_LEVEL_RANK[elevatedLevel]
  const count = gateEvaluatedLevels(levels).filter(
    level => DIMENSION_LEVEL_RANK[level] >= elevatedRank
  ).length
  return count >= requiredCount
}
```

---

## ⚠ ONE LINE ABOVE IS KNOWN-FALSE — fix it before applying

> `* stays at 4 deliberately. Lower rungs are unaffected — `principled` needs 3 of`
> `* the 3 remaining dimensions and remains reachable.`

**"Lower rungs are unaffected" is false**, and it is exactly what the hold is about. Shrinking the
pool 4 → 3 tightens `deliberate_to_principled` from 3-of-4 (75%) to 3-of-3 (100%). The second
sentence accidentally *states* the new behaviour ("3 of the 3 remaining") while the first sentence
denies there is any change — the drift is visible within a single comment.

Whatever the mentor rules, that wording must be replaced with an accurate statement of the effect on
`deliberate_to_principled`.

## For reference — the original code this replaced

```ts
function dimensionsMeetFloor(
  levels: DimensionScores,
  floor: DimensionLevel
): boolean {
  const floorRank = DIMENSION_LEVEL_RANK[floor]
  return Object.values(levels).every(
    level => DIMENSION_LEVEL_RANK[level as DimensionLevel] >= floorRank
  )
}

function dimensionsMeetElevated(
  levels: DimensionScores,
  requiredCount: number,
  elevatedLevel: DimensionLevel
): boolean {
  const elevatedRank = DIMENSION_LEVEL_RANK[elevatedLevel]
  const count = Object.values(levels).filter(
    level => DIMENSION_LEVEL_RANK[level as DimensionLevel] >= elevatedRank
  ).length
  return count >= requiredCount
}
```

This is the state currently live at `c326e64` — confirm with
`git diff HEAD -- website/src/lib/substrate/trust-layer/grade-engine/grade-transition-engine.ts`
returning empty before applying anything.
