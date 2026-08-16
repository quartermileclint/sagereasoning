# Spec 4 (B/M-B) — the AE-1 delta dispersion member: implementation record

**Date:** 2026-08-17 · **Session:** concurrent-arc R2b · **Tier:** `code-elevated`, dark.
**Governing records (each wins over this one):** Ruling Set B
(`operations/agent-circles-2026-08/2026-08-15-mentor-rulings-C2-scope-documents-verbatim.md`,
R-3 and R-5 and the "Sequencing for Ruling Set B" paragraph); the staged Spec 4
(`2026-08-16-post-run-edit-specs-STAGED.md:251-327`); the scope document
(`2026-08-15-SCOPE-DOCUMENT-hegemonikon-drift-melete-FOR-RULING.md`, §2.2/§2.4/§2.5/§2.6).

---

## 1. The flag-discipline statement — STATED HERE BEFORE THE EDIT

The mentor's sequencing paragraph requires this, verbatim: *"Flag discipline: a new member
riding SUBSTRATE_TRAJECTORY_DELTA_ENABLED is live the moment it deploys; per-feature darkness
needs its own flag. **This must be stated in the implementation record before the edit is
made.**"*

Reproducing the staged spec's §4.1 statement, which is the form that requirement takes:

> **Flag discipline (Ruling Set B, B/M-B — stated in this record BEFORE the edit, per the
> ruling's requirement):** the dispersion member lands inside `meta.trajectory.delta`
> (`TrajectoryDeltaBlock`, schema `agent-trajectory-delta-v1` —
> `website/src/lib/substrate/trajectory-delta.ts:300-301`), which is gated by
> `SUBSTRATE_TRAJECTORY_DELTA_ENABLED` (`agent-assessment-history-store.ts:111`
> `TRAJECTORY_DELTA_ENV_VAR`), **LIVE in production since 2026-07-18**. A new member riding
> this flag is **live the moment it deploys** — there is no dark state on the existing flag.
> Per-feature darkness needs its own flag. The founder's election on this was made before the
> edit: **election (b), a dedicated flag** (resolved 2026-08-16, founder: "approved as
> recommended" on the staged spec; suggested name `SUBSTRATE_TRAJECTORY_DISPERSION_ENABLED`,
> UNSET everywhere ⇒ byte-identical, battery-asserted; activation is its own founder-walked R4
> step with a live smoke and the one-line rollback: unset + redeploy).

**Schema version — resolved and recorded at the edit, as §4.3 requires:** the member keeps
`agent-trajectory-delta-v1`. Ground: it is an additive-optional member carrying its own
evidence floor, which is the delta's own internal precedent (its members landed additively
under v1) rather than the loop-fold's v1→v2 case, where the *meaning of existing buckets*
changed. Founder-approved 2026-08-16; not re-opened here.

---

## 2. What the specs do NOT contain, and what this session therefore authored

**No governing document names the statistic or the disclosure wording.** Spec 4 is the
flag-discipline statement plus the two resolved elections; R-3 rules the signal legitimate and
fixes the landing surface; the scope document establishes what is computable. The statistic and
the wording are authored here, and are recorded as *this session's* choices rather than as
inherited requirements.

### 2.1 The statistic

Population **standard deviation of `PROXIMITY_RANK[proximity]`** over the active regime
segment, reported with the distinct level count, the per-level counts, and the observed span.

Grounds: proximity is the field R-3 and the scope document both speak about; it is the only
field in the persisted row with a defined ordinal scale (`PROXIMITY_RANK`), so a dispersion
over it is meaningful where a dispersion over, say, domain mix would need an invented metric.
The level counts and span ride alongside because a bare stddev is not interpretable on a
5-point ordinal scale — "0.47" says nothing without knowing whether that is two adjacent
levels or a bimodal split.

### 2.2 THE DESIGN FORK THAT MATTERS, and why it is answered the way it is

**A variance signal already exists, and it is the one the ruling calls defective.**
`computeDispositionStability` (`window-aggregator.ts:535-575`) already computes a population
stddev of proximity ranks AND a between-half stddev trend, and the delta already surfaces both
through `dimension_trends.disposition_stability`. Its levels certify **stddev < 0.4 as
`advanced`**, with the indicator strings *"Highly consistent proximity across actions"* and
*"Disposition approaching hexis"*, and its trend reads `improving` when the recent half's
stddev **falls**.

So the pipeline does not merely fail to measure discriminative range: **its one
variance-reading signal certifies zero variance as the top level and calls it approaching
hexis.** A thirty-identical-`deliberate` profile reads as the strongest possible endorsement.

The doctrinal precision that keeps this honest (scope document §2.2): stability-as-hexis is
genuinely Stoic — the dimension is not simply wrong. The conflation is between **stability
under perturbation** (Seneca, *Letters* 75.8-9, where the grades are distinguished by
relapse-resistance) and **absence of perturbation**. A standard deviation over an unperturbed
window cannot tell "tested and held" from "never varied."

**Consequence for the design:** the member is a **whole-segment reading**, NOT a between-half
trend. A between-half dispersion trend would be a near-duplicate of the very signal the ruling
names as conflated, and would inherit its inverted valence. The member therefore reports the
dispersion as an observation and carries a disclosure naming exactly what it cannot
distinguish — rather than grading it, which is what `disposition_stability` already does
wrongly.

**The member deliberately does NOT grade.** No level, no band, no `advanced`. Adding a second
graded variance signal beside the defective one would double the error rather than correct it.

### 2.3 The evidence floor

Reuses `makeBasis(...)` + `meetsFloorBothHalves`, structurally identical to
`kathekon_quality_basis`. This keeps one floor discipline across the block and requires ≥6
segment rows in practice (≥3 per half). R-5's "inherits the evidence floors by construction"
does not itself resolve whole-segment vs between-half; reusing the between-half floor for a
whole-segment reading is the conservative choice — it demands MORE evidence than a
whole-segment floor would.

**Named alternative, weighed and not taken:** a dedicated higher floor, on the ground that 6
rows is a thin base for a dispersion estimate. Not taken because inventing a second floor
constant would put this member out of step with every sibling, and R-5 explicitly leaves the
window standing. The thinness is disclosed in the member's own wording instead.

---

## 3. The ruled constraints, and where each is held

| Constraint (Ruling Set B) | Where it is held |
|---|---|
| Served **only** inside the AE-1 delta, on credential-bearing `/api/reason` consults | The member is a field of `TrajectoryDeltaBlock`; `computeTrajectoryDelta` has exactly one production consumer (`api/reason/route.ts`) |
| **Never** on the public trust record | True by construction — `trust-record-payload.ts` has no trajectory import — and now pinned, so it cannot drift |
| The two named honest limits carried in its own disclosure | `DISPERSION_DELIVERY_BOUND`, quoting R-3's two limits and its consequence sentence |
| The M7 window stands (R-5) | Untouched: `TRAJECTORY_DEFAULT_WINDOW_DAYS = 90`, `TRAJECTORY_DEFAULT_MAX_INSTANCES = 30` |
| MEASURE-only, evaluative-never-predictive, weights BLOCKED | No recommendation field; the block is already MEASURE-pinned |

**The purity constraint that shapes the implementation:** `trajectory-delta.ts` is PURE and its
battery ENFORCES it by source-grep (`!src.includes('process.env')`). So the flag **cannot** be
read inside the module — it is threaded in as an option from the caller, exactly as the
narrowing option was threaded in item 1.

**Deliberately NOT done — cross-pinning against the envelope item.** Spec 1's `does_not_attest`
item (live at `trust-record-payload.ts:65`) and this member are two halves of one ruling, and
their wordings could drift apart. A pin asserting both share a phrase would catch that — but
placing it in either battery creates exactly the cross-surface reference the never-on-public-
record separation exists to prevent. Each is pinned independently in its own battery instead,
and the duplication is recorded here so the omission is a decision rather than an oversight.

**R18 deferred to R4:** agent-card extension #18 (`trajectory-delta/v1`) enumerates the delta's
members and will need this one added. Documenting a member no consult can receive would be a
false public claim, so it waits for activation. Carried, named here so it does not go quiet.
