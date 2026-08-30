# Next-session prompt — PR19 the revised verdict-variance wording, then apply it

**Paste this as the task after the standing session opener.** Authored 2026-08-30 after the first
D6a sweep and the mentor's rate-presentation ruling. **Authoring this prompt licensed nothing.**

## Tier

**`code-elevated`.** Live public-contract surfaces plus the battery-locked `TRUST_RECORD_ENVELOPE`.
No auth, perimeter, encryption, or schema surface; **no flag is flipped; no behaviour changes.**
**AC7 is NOT engaged.**

## Two gates before anything reaches a surface

**1. The founder's signature on the REVISED wording.** The mentor's ruling changed what the
disclosure claims, so the pre-sweep signature does not carry over.
`operations/agent-circles-2026-08/2026-08-30-verdict-variance-disclosure-REVISED-WORDING-FOR-SIGNATURE.md`
— **DRAFT, UNSIGNED.** Read it against the binding verbatim before signing.

**2. PR19 on the revised text.** Not run. **Tell the reviewer the D6a sweep ran on 2026-08-30 and
hand it `operations/agent-circles-2026-08/d6a/runs/2026-08-30/d6a-rate.json`.** A claims-vs-source
pass against the 2026-08-29 sources cannot see a defect created after sign-off — that is exactly how
the four false assertions in the original package survived review-readiness. **This arc's inherited
prompt warns the mandatory re-run "has been missed once already"; do not make it twice.**

## Read at open — the verbatims win over this prompt

- `2026-08-30-mentor-ruling-verdict-variance-rate-presentation-verbatim.md` (**governs the wording**)
- `2026-08-30-mentor-ruling-verdict-variance-disclosure-verbatim.md` (the original ruling)
- `2026-08-30-mentor-ruling-verdict-variance-rate-location-verbatim.md` (path specificity)
- `D-VERDICT-VARIANCE-RATE-PRESENTATION-RULED-ADOPTED-WORDING-REVISED-FOR-SIGNATURE-2026-08-30`
- `D-R8-D6A-FIRST-LIVE-SWEEP-...-2026-08-30` **and its addendum** (why the wording went stale)
- `2026-08-30-verdict-variance-disclosure-R18-SIGNOFF-PACKAGE.md` — **§3/§6a/§6b/§6c must NOT be
  applied**; its §"Ordering", battery pins and sequencing are unaffected and still govern.

## What is settled and must not be re-litigated

| Ruled | Effect |
|---|---|
| Publish **once**, carrying the rate | The interim "rate unknown" language is **never published** |
| Rate **decomposed by direction** | Event counts, explicit precision caveat, **no derived intervals on n=3** |
| **Interval rides** the point estimate | `12% (Wilson 95% CI: 5.6–23.8%, n=50 outcomes, 6 disagreements)` |
| Class label **survives** the anchor falsification | Named on the surface, **never repaired by re-partitioning** |
| **Primary claim changed** | Variance is scale-wide; the borderline class is distinguished by variance **crossing the proceed/block boundary** |

## Ordering — from the signed package's own §"Ordering", unchanged

1. **Edit 1, one commit:** `TRUST_RECORD_ENVELOPE` (`website/src/lib/substrate/trust-core/trust-record-payload.ts`)
   + the ADR-013 §8 dated amendment + battery pins **S2-48/S2-49/S2-50**, together.
2. Then the three R18 surfaces (`llms.txt`, `agent-card.json`, api-docs).
3. **Re-derive the agent-card extension count** from the file; do not re-quote "24 → 25".
4. Live-verify by `curl` after the founder's push, as this arc's prior disclosure applications did.

## Carried items — none blocking

| # | Item | Recommendation | Whose |
|---|---|---|---|
| 1 | `llms.txt:118` — *"identical inputs produce identical assessments"* | **Fix in this same pass.** Mentor confirmed it is surface-accuracy, not doctrine. It borrows `/api/reason`'s own request-field name while the three sibling claims are each explicitly scoped | Founder |
| 2 | **Complete the balanced second sweep** — p4, p5, p6, p7 ONLY | **Attempted 2026-08-30 and ABORTED at 3 of 7 on the daily quota cap.** 40 calls / 80 units on a later day balances the design at 2 series x 7 probes and gives a poolable n=100. **Do NOT re-run p1/p2/p3** — they already have two series and re-running them deepens the imbalance | Founder |
| 2b | **QUOTA — corrected** | **The daily cap is 200 units = ONE sweep per day** (70 calls x 2 = 140). An earlier version of this prompt said "~3 sweeps remain", which was monthly-true and daily-false, and is what caused the abort. Monthly stands at ~200 of 600 | — |
| 3 | **Calibration-block balance check** (NEW, from the abort) | **Needs its own PR19 before any further sweep.** The block cannot see an unbalanced design: it reported 7.5% from 3-probes-x2 + 2-probes-x1 with `all_borderline_series_complete: true` and no warning. `borderline_probes_measured` counts series, not probes. Add a balance warning and count probes | Founder |
| 3b | Directional split inside the runner | **Not without its own PR19**, and bundle it with item 3 if both are done. Currently hand-computed from the records; the runner emits only the aggregate | Founder |
| 4 | The supersession banner on the signed package | The executing session inserted 21 lines into a founder-signed artifact on its own judgement, and disclosed it. `git checkout` that one file to revert | Founder |
| 5 | `runs/` size | Recorded correction: **1.3MB**/sweep, not the recorded ~300KB. Archive, never delete | — |

## Standing constraints — unchanged

- **Weights-BLOCKED.** No weighting function may be designed, sketched, or evaluated. Nothing in the
  sweep, the ruling, or the revised wording bears on the deferred M-vs-W ruling in either direction.
- **Q1 — the loop proposes; it never executes.** D6a is not in the loop's path.
- **The §A boundary.** Nothing consumes D6a's output as a signal into generation or election.
- **Path-specificity is binding.** The rate is `/api/guardrail` ONLY; `/api/reason` is unmeasured and
  must be stated as unknown wherever the rate appears.
- **Concurrency:** `ListAgents` at open; `git status` twice; path-scoped commits; never `git add -A`;
  append shared records at the physical tail.
- Nothing here bears on the 0h call, which remains the founder's.

## State at authoring

- Committed at `350dd29` (sweep + evidence + predecessor build) and `64639d9` (brief + successor).
  This session's adoption commit follows.
- **Nothing is applied to any public surface.** Verified first-hand 2026-08-30, not inherited.
- Probe credential: **~200 of 600 monthly units** consumed, and the **daily 200 cap was reached on 2026-08-30** by a second sweep that aborted at 3 of 7 probes.
- **`runs/2026-08-30/` now holds three rate files.** `d6a-rate.json` is the **balanced sweep-1 result (12%, 6/50)** — the publishable one, and the figure the revised wording carries. `d6a-rate-sweep1-only.json` is its snapshot. `d6a-rate-UNBALANCED-DO-NOT-PUBLISH.json` is the composition-biased 7.5% pooled figure, retained **only** as evidence of the calibration defect at item 3. **The three sweep-2 series in the per-probe JSONL are valid data and are simply not poolable until the design is balanced.**
- **Session honesty note:** at-action Gate-2 checks were UNAVAILABLE on a 28s timeout for most of the
  authoring session; one later check returned `deliberate` with a `pause_for_review` caution and fired
  the G3 elicitation, answered genuinely in-conversation — the answers named a real prior preference
  (the decision to banner rather than leave the signed package alone was made before it was examined
  whether editing a signed artifact was the session's to make) and a real stake (completion, and work
  that reads as finished).

## What "done" looks like

The revised wording signed; PR19 run against it with the reviewer told about the sweep; the four
surfaces updated in the ruled order with the battery pins; `llms.txt:118` fixed in the same pass;
live-verified by `curl` after the push; a decision-log entry at the tail; a lean close. **The
disclosure goes up once, already carrying the rate. The interim "rate unknown" wording is never
published.**

End of prompt.
