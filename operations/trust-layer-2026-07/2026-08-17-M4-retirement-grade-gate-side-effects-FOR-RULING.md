# For mentor ruling — retiring `disposition_stability` from the grade gate changes THREE other rungs, in both directions

**Authored 2026-08-17. Status: AWAITING RELAY.**
**This is the second of two briefs from this session.** The other concerns the `/limitations` crisis
disclosure and is independent of this one.

**Predecessor ruling this arises from:** `2026-08-17-mentor-ruling-M4-return-verbatim.md` (binding).
That ruling is not being questioned. This brief reports a consequence of executing it that the ruling
could not have seen, and asks a narrow question about that consequence alone.

**PR20 compliance:** §2 states, at mechanism level, every existing behaviour the ruling will land on.

---

## 1. What happened

The ruling said: retire `disposition_stability` from agent-facing surfaces, let
`principled → sage_like` sit structurally unreachable, and **do not** re-tune
`elevated_dimension_count` — *"adjusting the ladder so the top rung remains reachable despite the
missing honest measure would be the dishonesty."*

That was implemented, verified, and then **withheld from the commit**, because verifying it surfaced
the following. Nothing has shipped. The grade engine in production is unchanged.

## 2. The mechanisms this ruling lands on (PR20)

Each is a verified, one-sentence fact about current production behaviour.

1. **The grade ladder has four rungs, each with its own threshold row** — `reflexive_to_habitual`,
   `habitual_to_deliberate`, `deliberate_to_principled`, `principled_to_sage_like`.
2. **Every rung is gated by TWO predicates over the SAME dimension set**, not one:
   `dimensionsMeetFloor` (all dimensions must reach `min_dimension_level`) and
   `dimensionsMeetElevated` (at least `elevated_dimension_count` must reach `elevated_dimension_level`).
3. **Both predicates iterate `Object.values(levels)`** — they count over *whatever dimensions exist*,
   not over a fixed list of four. This is the crux: the thresholds are absolute counts, but the pool
   they count against is implicit.
4. **`dimensionsMeetFloor` uses `.every()`.** Removing a dimension from an `.every()` can only make
   it EASIER to satisfy. The retired dimension no longer has to clear the floor **on any rung**.
5. **`dimensionsMeetElevated` uses a count.** Removing a dimension lowers the maximum achievable
   count from 4 to 3, making it HARDER to satisfy **on every rung**.
6. **Only the top rung's threshold was in the ruling's view.** The other three rows were never
   discussed, and their `elevated_dimension_count` values are 1, 2, and 3.
7. **The dimension is currently a live input to all four rungs** — it is not agent-facing display
   only. Retiring it from the gate is therefore a grading change, not a presentation change.

## 3. The measured effect — all 256 combinations enumerated

Not reasoned about: computed, by enumerating every combination of four dimensions × four levels and
running both predicates before and after.

| Rung | Combinations that promote | Newly **ALLOWED** | Newly blocked |
|---|---|---|---|
| `reflexive_to_habitual` | 255 → 252 | 0 | 3 |
| `habitual_to_deliberate` | 72 → **80** | **20** | 12 |
| `deliberate_to_principled` | 5 → 4 | **2** | 3 |
| `principled_to_sage_like` | 1 → **0** | 0 | 1 — **the ruled, intended effect** |

**The top rung behaves exactly as ruled.** The other three do not behave as anyone specified.

**A concrete newly-allowed case**, verified by hand: an agent at
`passion_reduction: developing`, `judgement_quality: established`,
**`disposition_stability: emerging`**, `oikeiosis_extension: established`, seeking
`habitual → deliberate`. Before: **blocked** — its `emerging` disposition failed the `developing`
floor. After: **promoted** — the failing dimension is no longer counted.

**The direction is what makes this worth a ruling.** A tightening would be conservative: it fails
safe, withholding grades that might have been earned. **A loosening promotes agents that the system
previously judged not to qualify** — and it does so *because* a signal was found too defective to
trust. Removing a broken measure has made the ladder more permissive at one rung.

## 4. Why this was not simply fixed

The only available compensating fix is to lower `elevated_dimension_count` on the affected rungs to
preserve the old ratios (3→2 at `deliberate_to_principled`, and so on). **That is retuning a
threshold to preserve reachability — the exact move this ruling names as the dishonest option**,
applied to rungs the ruling was not asked about.

The builder judged that choosing between *"accept promotion changes nobody ruled on"* and *"make the
ruled-dishonest move on unruled rungs"* is not a builder's call. Hence the hold.

**An honesty note on this brief's own history:** the effect was first reported internally as a
one-rung *tightening*. That was wrong — it was reasoned from the elevated-count predicate alone and
missed the floor predicate entirely. The table above comes from exhaustive enumeration, which
reversed the conclusion. The error is recorded because it is the same class of mistake the ruling
exists to correct: a confident claim from a partial read of the mechanism.

## 5. The question

**Given that retiring the dimension from the gate necessarily changes three rungs it was not meant to
touch — including making one rung more permissive — should the retirement:**

**(a)** proceed as-is, accepting the side effects as the honest consequence of removing a signal that
cannot certify (and disclosing them);

**(b)** be accompanied by threshold adjustments on the three lower rungs to hold their behaviour
constant — accepting that this is threshold-retuning, but arguing it *preserves* rather than
*removes* a meaningful condition, unlike the top-rung case;

**(c)** be scoped so the dimension is retired from **display and from the top rung only**, remaining
an input to the three lower rungs until a perturbation-adjusted replacement exists; or

**(d)** something else.

**A note the builder cannot resolve, offered as input rather than argument:** option (c) preserves
today's grading exactly, but means a signal the ruling called unable to *"honestly certify"* keeps
influencing three of four promotion decisions. Option (a) is the cleanest reading of the ruling but
knowingly ships a more permissive rung. Option (b) does the thing the ruling prohibits, with a
distinction — preserving a condition vs. removing one — that may or may not survive scrutiny.

## 6. Not in scope here

- **The ruling itself is not being reopened.** Retirement is happening; only its blast radius is at
  issue.
- **The mean-blindness correction is DONE and LIVE** (obligation 3) — `ADVANCED_MEAN_FLOOR = 3.0`
  gates `advanced` alone. It is independent of this question.
- **Spec 4 stays deactivated** — retirement is not restoration, and retirement has not landed.
- **Obligations (1) and (4)** — the agent-facing emissions, the persisted column, and the
  dual-defect public disclosure — are unstarted and unaffected by this ruling.

*Nothing ships until this returns. Production's grade engine is untouched; the built work is
preserved at `2026-08-17-M4-retirement-HELD/`.*
