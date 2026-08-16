# Next session — the R2b mentor-rulings successor (M-2 · M-3 · M-4 · M-5)

**Paste this as the first message of a new session, in the `sagereasoning` repo root.**

**Tier: mixed — `code-elevated` for M-3, `code-critical`+`schema` for M-2, `code-critical` for M-4,
and M-5 splits into an R18 documents step + a P0 build.** Founder presence: **required** for the
M-5(a) wording sign-off and any migration. **No flag is set in this session unless the founder
elects it.**

---

## Step 0 — Open

Read: `/adopted/standing-protocol-cache.md` → this prompt in full → **the binding verbatim record
`operations/trust-layer-2026-07/2026-08-16-mentor-rulings-M1-M5-r2b-verbatim.md` IN FULL — it wins
over every paraphrase here** → the R2b decision-log entry
`D-CONCURRENT-ARC-R2B-GUARD-BUNDLE-BUILT-PR19-FOLDED-MENTOR-M1-CORRECTED` → the arc plan's R2b
block → `git status` and `git log --oneline -12`.

**Re-check the byte-identity guard's posture at THIS session's open, not from this prompt.** It is
window-conditional — it binds iff `GATE1_FALSE_HOLD_CAPTURE === 'true'`
(`human-practitioner-boundary.test.ts` §C, the M1 ruling). It was **DORMANT** throughout R2b,
verified first-hand in both the process env and `.claude/settings.local.json`. **Do not infer its
state from a calendar date** — a PR19 review agent did exactly that in R2a and got the right answer
for the wrong reason.

**Expected HEAD at authoring:** `a256b59`. Nothing is pushed.

---

## Part A — Why this session matters

R2b built the guard bundle and then put five questions of principle to the mentor. **One ruling
(M-1) overturned a decision already committed and was corrected same-day.** The other four are
carried, and two of them are load-bearing in ways that constrain R4:

- **M-4 BLOCKS Spec 4's activation.** R4 cannot flip `SUBSTRATE_TRAJECTORY_DISPERSION_ENABLED`
  until this is resolved.
- **M-5 is a P0 obligation on the R20a safety perimeter**, with a claims-honesty half that
  explicitly **does not wait** on the build half.

**Do not treat these as four independent chores.** M-2 is coupled to the Q1 Phase-2 migration;
M-4 gates an R4 activation; M-5's two halves are sequential, not alternatives.

---

## Part B — The four items

### M-2 — the repeated-inability examination (`code-critical` + `schema`)

**The ruling, in short:** withholding the FD-R1 *fabrication* probe on an honest "I cannot
determine" is correct; withholding **all** examination is not. Repeated inability is itself a
prosoche signal — *"The Stoic account of the ruling faculty (hegemonikon) is that it can always
examine its own impressions — that is what makes it the ruling faculty."* An agent consistently
reporting it cannot determine is *"either reporting honestly on a genuine limitation of its
self-access, or it has developed a habit of non-examination that presents as inability. Both
warrant examination; neither warrants silence."*

**Required:** a **distinct** flag — not `null_reflection`, not the FD-R1 probe — that examines
*the pattern of the inability itself*. The mentor is explicit that the examination question is
**not** "what was the impression?" (the agent has said it cannot determine) but *"what is the
pattern of this inability, and what does it indicate about the agent's prosoche practice?"*
**Implementation shape is the builder's call; the ruling is that silence is wrong.**

**THE COUPLING THAT DECIDES THE SEQUENCING:** detecting *repeated* inability needs **prior-session**
state, and the Q1 third state is **not persisted** — `prior_sessions[].q1_clean` is derived at read
time from `arrLen(phantasia_distortion_log) === 0` (`session-store.ts`), and both states produce an
empty array. **So M-2 requires the Q1 Phase-2 column, and gives that migration a second purpose.
Build them together.**

**The migration cannot ship dark ahead of itself:** a new key in `deriveCrossSessionScalars` without
the column existing makes PostgREST reject the WHOLE completion UPDATE (PGRST204) — a 503 on every
reflect completion. Founder-walked, migration BEFORE code, TEST then prod.

**Decide and record:** the column shape (`q1_undetermined boolean` nullable, mirroring the
`a1-columns` precedent — minimal; vs `q1_determination text` with a CHECK matching the TS union —
more expressive and closer to this table's four existing enum-guard constraints). Re-walking a
founder-walked migration is expensive, so settle this before authoring the SQL.

### M-3 — split part (3) into two never-pooled rates (`code-elevated`, repo-only)

**The ruling:** *"two separate rates, reported separately, with the denominator for each drawn from
its own population."* The guard-path rate compares **false denies to correct denies**; the
consult-path rate compares **false advisories (advisories that opened correction loops on actions
that turned out to be kathekon-free) to correct advisories.** Part (3) is then reported as **two
ratios, not one, with the populations named explicitly.** *"The two denominators should never be
pooled."*

**Confirmed correct as already built, do not re-open:** excluding caution/pause verdicts from the
guard denominator. *"A caution is not a deny, and the guard denominator should contain only denies."*

**What changes:** `website/scripts/false-hold-observation-report.ts`. The guard records now carry
`path: 'guard'` and `guardHold`, so the split is available in the data. **The consult denominator
must be NARROWED** to advisories that opened correction loops — check whether the current
`isHoldLoopEvent` reading (`opened`/`reopened`) already gives exactly that, or whether it is wider.

**Run the frozen buffer before and after** (`operations/trust-layer-2026-07/runs/2026-07-17/`,
expect `n=130, 129 FP / 0 CH` on the consult side) — a changed number there means the *classifier*
moved, which this item must not do.

### M-4 — correct or retire `disposition_stability` (`code-critical` — a LIVE agent-facing signal)

**This gates Spec 4's activation.** The block is stated on `isTrajectoryDispersionEnabled()` itself.

**The mechanism:** `computeDispositionStability` (`window-aggregator.ts`) certifies **stddev < 0.4
as `advanced`**, with the indicators *"Highly consistent proximity across actions"* and
*"Disposition approaching hexis"*; its trend reads `improving` when stddev **falls**. It is LIVE and
already surfaced through the AE-1 delta's `dimension_trends`.

**The ruling:** *"Carrying both is not a safe interim posture."* Adding an ungraded honest reading
beside a graded defective one does not neutralise it — *"the defective signal will dominate
precisely in the cases where it is most wrong."*

**Preference order the ruling sets:** **correct** it if tractable — *"replace the stddev < 0.4
certification with a perturbation-adjusted measure that distinguishes low variance under
perturbation from low variance in the absence of perturbation."* If not tractable in this build,
**retire it from agent-facing surfaces until it is.**

**The hard question to answer honestly and early:** *is* a perturbation-adjusted measure tractable?
The scope document's own §2.9 finding was that **no current signal introduces or conditions on
perturbation** — which is why the Senecan criterion *"has nowhere to bind today."* If that is still
true, correction may not be tractable and retirement is the ruled fallback. **Establish this
first**; do not start building a perturbation measure before checking whether perturbation is
observable at all.

### M-5 — the R20a escalation claim + write path (**P0**)

**(a) The claims half — does NOT wait on the build.** *"A public posture that describes human
escalation as part of the R20a perimeter, when no flag has ever been written for a real detection
… is a false claim."* The ruled interim wording: *"the classifier detects distress signals and
routes them; the human escalation queue exists in the schema but has no live write path for real
detections."*

**R18 applies: founder sign-off on the exact wording BEFORE any public surface changes.** Draft
first, sign, then apply to `llms.txt` / `agent-card.json` / api-docs / any R20a-claiming page.
**First task: find every public surface that makes the escalation claim** — do not assume it is only
`llms.txt`.

**(b) The build half — P0.** *"Building the write path for genuine distress detections is a P0
obligation, not a sequencing question for the standing-runner design session or any later phase.
It should be scoped and built before any agent-facing surface that carries the R20a perimeter claim
is expanded further."*

The design question this needs, which is why it was not absorbed into R2b: `vulnerability_flag`
requires `user_id UUID NOT NULL REFERENCES auth.users`, `session_id UUID NOT NULL`, and
`severity INTEGER NOT NULL CHECK (1..3)`. The three genuine-detection branches
(`r20a-classifier.ts` — regex hit at moderate/acute; Haiku detection at moderate/acute; non-JSON
treated as distress) currently call **no insert at all**. So this needs an `auth.users` id plumbed
from the calling routes and a severity mapping from the classifier's own levels.

**And in the same change:** *"the finding that classifier_cost_log.flag_written is a false fact on
every row is a named integrity failure in the trust-event record. It should be corrected at the
same time the write path is built — not by retroactively writing flags for past sessions (which
would be fabrication), but by marking the field's historical values as reflecting the
outage-branch-only write path."*

---

## Part C — Session-open decisions (the founder's)

1. **Scope.** All four in one session is likely too much — M-2 carries a migration and M-5(b)
   carries a P0 build. **Recommendation: M-5(a) + M-4 first** (the claims fix does not wait, and
   M-4 unblocks an R4 activation), then M-5(b), then M-2+Phase-2, then M-3. State the split.
2. **M-4's fallback.** If a perturbation-adjusted measure is not tractable, does the founder accept
   **retiring** `disposition_stability` from agent-facing surfaces — i.e. removing it from the AE-1
   delta's `dimension_trends` — as the ruled interim? That is a live-surface removal.
3. **M-2's column shape** (see above).
4. **Whether M-5(b) preempts R4 entirely.** The ruling says the write path should be built *"before
   any agent-facing surface that carries the R20a perimeter claim is expanded further."* R4 expands
   agent-facing surfaces. **The founder should decide whether M-5(b) blocks R4, or only blocks
   R20a-claiming expansions specifically.** This is the single sharpest sequencing question here.

---

## Part D — Adversarial review (PR19)

**PR19 is mandatory** — M-2 touches a live trust-event elicitation path and a schema; M-4 changes a
LIVE agent-facing signal; M-5(b) touches the R20a safety perimeter (an explicitly PR19-scoped
surface since 2026-08-10). **PAUSE before launching** — founder drops the model setting. **PAUSE
after it returns** — founder restores it.

## Part E — Close

Decision-log entry (full form); update the M-1..M-5 verbatim record's execution-status table; tick
the arc plan; state plainly which rulings remain carried and why.

## What NOT to do

- **Do not activate Spec 4's flag.** M-4 blocks it; the block is on the flag helper itself.
- **Do not change any public R20a wording without founder sign-off** (R18).
- **Do not retroactively write `vulnerability_flag` rows** for past sessions — the ruling names that
  as fabrication.
- **Do not re-open** the guard-denominator decision (denies only) — M-3 confirms it correct.
- **Do not "fix" the predicate/reducer divergence on self-only `violated`** — it is deliberate and
  ruled (engagement ≠ emission), and pinned §8.9e.

## Rollback path

M-3 is repo-only and `git revert`-able. M-2's migration is founder-walked with its own reversal.
M-4 changes a live signal — its rollback is a code revert plus redeploy. M-5(a) is a docs revert.
