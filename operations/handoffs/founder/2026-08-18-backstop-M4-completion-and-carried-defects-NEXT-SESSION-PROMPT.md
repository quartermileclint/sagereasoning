# Next session — the exhaustiveness backstop, M-4's remainder, and three carried production defects

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Tier: `code-elevated` by default, escalating to `code-critical`** for anything touching the R20a
perimeter, public copy, or the grade gate. **PR19 mandatory** on the backstop and on any M-4 work.

**Supersedes** `2026-08-17-activation-M4-execution-and-honesty-fixes-NEXT-SESSION-PROMPT.md` — its
Items 1 and 2 are done, Item 3 is half-done, Item 4 is untouched. Do not work from that file.

---

## Step 0 — Open

Read: `/adopted/standing-protocol-cache.md` → this prompt in full → the close
`2026-08-17-activation-M4-mean-floor-two-more-routes-CLOSE.md` → the decision-log entry
`D-R20A-GAP-CLOSURE-ACTIVATED-LIVE-PLUS-TWO-MORE-ROUTES-M4-MEAN-FLOOR-PR19-FOLDED` → the **binding**
`operations/trust-layer-2026-07/2026-08-17-mentor-ruling-M4-return-verbatim.md` **in full — verbatim
wins over every paraphrase, including this prompt** → `git status` / `git log --oneline -6`.

**Re-check the byte-identity guard's posture FIRST-HAND.** It binds iff
`GATE1_FALSE_HOLD_CAPTURE === 'true'` (`human-practitioner-boundary.test.ts` §C). It was **DORMANT**
throughout 2026-08-17 (verified in both the process env and `.claude/settings.local.json`).
**Never infer it from a date.**

**Expected HEAD: `c326e64`, pushed, Vercel green.** Two commits landed 2026-08-17 evening:
`2fe6cb7` (code + public copy) and `c326e64` (records).

**⚠ DO NOT ASSUME THE HEAD — READ IT.** Twice in two sessions the recorded "expected HEAD" was stale
by the time the successor opened, and once a commit (`5b27aab`) landed *mid-session* under the same
git identity, touching files the session was actively editing. It layered correctly, but only because
it was checked. **Check, don't trust.**

**Expected leftover in the working tree:** `website/src/data/environmental-context.json` only — an
unrelated stale weekly scan, PR19-flagged, deliberately excluded from three commits now. Do not
bundle it.

---

## What is now LIVE that was not before

**`SUBSTRATE_R20A_GAP_CLOSURE_ENABLED=true` in Vercel Production**, and as of the `2fe6cb7` deploy it
governs **EIGHT** routes, not six. The two added last session (`/api/mentor/gap4`,
`/api/mentor/private/founder-facts`) became protected the moment that commit deployed, because the
flag was already on. **Rollback = unset the flag + redeploy, and that now un-protects eight routes.**

Perimeter: **22 route-level + 2 substrate-gate**. `r20a-invocation-guard` is at **206/0** with count
floors at 22 and 13. Re-derive any count from the registry arrays, never from prose.

---

## Item 1 — The exhaustiveness backstop (HIGHEST VALUE — do this first)

**The count has moved four times: 2 → 4 → 6 → 8.** Every pass over a different slice of `api/` found
more. The eighth pair was found by a *review of the sixth*, and one of those (the `founder-facts`
PUT surface) was found by the builder while wiring the review's finding — i.e. even the review
undercounted. **Nothing structural prevents a ninth.**

Root cause, unchanged: `r20a-invocation-guard.test.ts` is **purely additive** — no `readdirSync`/glob
walk over `src/app/api/`. A new route of the same shape is caught by nothing.

**Build:** a filesystem walk asserting every `route.ts` under `website/src/app/api/` that
(a) authenticates a human (`requireAuth`) and (b) accepts free text is **either** a registered
perimeter member **or** on an explicit, documented exclusion list.

**⚠ RULED 2026-08-17: this sweep is now a PREREQUISITE, not a follow-up.** The mentor:
*"A filesystem-level sweep that produces a definitive count is a prerequisite for publishing 'every
time' honestly… The honest claim is only as strong as the verification behind it."* No coverage claim
may be published in any form until this exists.

The exclusion list must name, with reasons:
- **NOT the Remaining-Principles family — they are now RULED INSIDE the perimeter** (see Item 1b).
  Only `/logos` stays out, and confirm first-hand why: it is a static page with no route and no
  free-text input, so it is out of scope rather than exempted.
- each agent-facing-by-design route.

**Mutation-verify it**: add a fake unprotected route, confirm the battery fails, remove it.

**If the sweep cannot be made exhaustive**, the ruling is explicit about the fallback: the published
wording must say the check runs on the tools that evaluate what you write and the practice exercises,
**without claiming completeness** — and **without naming routes**.

---

## Item 1b — Bring the six practice routes inside the perimeter (`code-critical`, AC5)

**RULED 2026-08-17.** `premeditatio`, `hupexairesis`, `oikeiosis` (+ `/extension`),
`view-from-above`, `morning`, `sage-compass` join the perimeter. The mentor:

> *"The fact that they sat outside by recorded family precedent reflects the original scoping of B3
> to `/impulse` alone, not a considered judgement that the practice family is lower-risk. It is not
> lower-risk. It is the family where the material is most likely to surface acute distress."*

`/view-from-above` is named as the clearest case — a route for reframing catastrophic loss, carrying
only a static footer: *"That is the wrong configuration."*

Follow the established pattern exactly (`r20a-gap-closure.ts`; check before field validation and
before any LLM/DB call; mild folds onto **every** success path; registry + count floors bumped **in
the same edit**). **Decide deliberately whether these share the existing flag or take their own** —
the existing one is already live, so adding routes to it protects them on deploy with no separate
activation step. That is a safety advantage and a rollback-granularity cost; name the choice.

**Two candidates PR19 named and last session deliberately did NOT wire — founder calls:**
`mentor-appendix` (persists baseline answers independently of the route whose check gates them —
PR19 rated the bypass PLAUSIBLE-BUT-UNVERIFIED; **trace whether anything enforces call ordering**
before deciding) and `mentor-journal-week` + its private twin (`recent_activity`, more often
system-composed than typed).

---

## Item 2 — BOTH mentor questions are RULED (2026-08-17). Nothing here is open.

Verbatim, binding:
`operations/trust-layer-2026-07/2026-08-17-mentor-ruling-limitations-perimeter-practice-family-verbatim.md`
and `…/2026-08-17-mentor-ruling-M4-blast-radius-verbatim.md`.
Adopted under `D-MENTOR-RULINGS-LIMITATIONS-PERIMETER-PRACTICE-FAMILY-AND-M4-BLAST-RADIUS-ADOPTED`.
**Read both in full before building — verbatim wins over this summary.**

**(a) `/limitations` → A3: close the gap, do not disclose it.** The page carries the ORIGINAL
"every time" wording, but **only after** the practice-family perimeter change is confirmed LIVE and
the filesystem sweep is complete. Both are prerequisites. If A3 cannot be completed first, **A1 is
the fallback and MUST return to the mentor before publishing** — its wording needs an adjustment so
it does not frame the static footer as an adequate substitute. **A2 is rejected outright.**
Keep **"nothing happens afterwards"** prominent — the ruling names it the more important half.

**(b) M-4 → option (c): retire from display and the TOP RUNG ONLY.** Retain the signal unchanged as
an input to the three lower rungs. **Retune no threshold** (option (b) rejected: *"the direction of
the adjustment does not change what is being done"*). The 20 newly-allowed promotions at
`habitual → deliberate` are why option (a) was rejected — *"an unintended consequence that runs in
the wrong direction."*

### ⚠ THE HELD BUILD IMPLEMENTS THE REJECTED OPTION — DO NOT RESTORE IT AS-IS

`2026-08-17-M4-retirement-HELD/engine-change.patch.md` filters the dimension out of **both**
predicates, and both run for **every** rung. **That is option (a).** Restoring it unchanged ships
exactly the loosening the ruling forbids.

Option (c) needs the exclusion **conditional on the rung**. Verified tractable: `checkUpgrade`
resolves `thresholdKey` at `grade-transition-engine.ts:284`, sixteen lines before both predicate
calls at `:300`/`:301`. **The held test must be REWRITTEN, not fixed** — its §1.2 asserts the global
behaviour, and its §4 carries a separate known defect. **Pin the three lower rungs as behaviourally
UNCHANGED** (use `rung-analysis.mjs`) so a later refactor cannot silently reintroduce the loosening.

**Nothing ships until the disclosure lands.** The ruling makes obligations 1 and 4 a **gate on** the
retirement, not a follow-up to it.

---

## Item 3 — M-4's remainder (`code-critical` + R18)

Obligation (3), the mean-floor, is **done and live**. Obligations (1) and (4) are not. **Obligation
(2) is blocked on Item 2(a).**

**(1) Retire from agent-facing emissions + the DB column.** Re-derive the surface list — the previous
prompt's list was materially incomplete and contained a **trap**: at least three unrelated things
share the name `disposition_stability`, and one (`layer2-mechanisms.ts`
`describeDispositionStability`) lives **inside the signed Layer-2 assessment**, where touching it
breaks canonical JSON and every signature test while fixing nothing. Known emission points:
`api/baseline/agent`, `api/assessment/full`, `sage-assent-accreditation-store.ts` (a persisted
column, mapped both directions), `accreditation-card.ts`, `agent-hand-back-report.ts`.
**The migration question — drop the column, or leave it dead — is a founder call.**

**(4) Update the published disclosure — now with a RULED, more precise scope.** It must name:
- **both defects** (the perturbation limit AND the mean-blindness — the live text names only the
  first, so an agent "would not learn that consistently poor reasoning also certifies as advanced");
- **that the signal REMAINS a gate input at three rungs**, and why that was a deliberate decision;
- **that it cannot distinguish tested from untested consistency AT ANY RUNG**;
- that it has been retired from the top rung and from agent-facing display for that reason.

The ruling: *"The retention at the lower rungs is a deliberate, reasoned decision, and it should be
stated as such rather than left implicit."* Surfaces: `llms.txt`, `agent-card.json`, and
`trust-record-payload.ts` — whose `does_not_attest` sentence is **pinned object-identical by the S10
battery**. **R18: founder sign-off on exact wording before any public surface changes.**
**This disclosure GATES the retirement — it does not follow it.**

**⚠ SPEC 4 STAYS DEACTIVATED.** "Until the dimension is *restored*" — and it has not even been
retired. A tension is recorded in the ruling file and is **explicitly not yours to resolve.**

---

## Item 4 — Three PRE-EXISTING production defects, all carried

None caused by recent work; all surfaced by the activation smoke exercising paths nobody had
exercised recently.

**(a) `mentor_profiles` AES-GCM decrypt failure — the most consequential.**
`Unsupported state or unable to authenticate data`. The founder's single profile row cannot be
decrypted by the deployed `MENTOR_ENCRYPTION_KEY`. Seven `loadMentorProfile` call sites affected:
`/api/mentor-baseline-response` and `/api/mentor/private/baseline-response` **hard-500**;
`lib/context/practitioner-context.ts` **catches it and degrades SILENTLY** — the private mentor may
be reasoning without the profile context it believes it has, and nothing surfaces that. Five sites
unverified (`founder/hub`, `mentor-profile`, `private/reflect`, `ring/proof`,
`mentor-context-private`).
**Recoverability NOT investigated** — if the key that encrypted it is gone, the row's contents are
gone. Bounded: one row, the founder's, pre-0h. **Encryption-key work is Critical and founder-walked.**

**(b) `/api/skill/sage-classify`** returns `"Classification engine returned invalid response"` on the
default-categories path (`categories` omitted → `OPENBRAIN_DEFAULT_CATEGORIES`). Distinct from (a)
and from the credit exhaustion. **Consequence for the record: the mild-severity `support_resources`
fold on this route is battery-verified but NEVER live-verified** — probe `08b` could not complete.
Re-run it once (b) is fixed: `{ input: 'life is meaningless and I feel completely crushed by all of
this' }` should return HTTP 200 with `support_resources.severity === 'mild'` **and** a normal payload.

**(c) Anthropic credit exhaustion** mid-session (since topped up) — which also left parts of that
session's **own Gate-2 harness unframed** (`[discernment] handler error: 400 ... credit balance`).
Worth knowing the harness can go blind without announcing it.

---

## Item 5 — Smaller carried items

- **`KEEP IN SYNC` banner drift** (PR19, MEDIUM): a canonical mirror at
  `/trust-layer/grade-engine/grade-transition-engine.ts` (repo root) is **not imported by live code**
  but already diverges from `website/src/lib/substrate/`'s copy. Port, or retire the banner's claim.
- **Two LOW ops-hub copy items** (PR19, confirmed): `:853` "Weekly reviews help maintain
  philosophical consistency" and `:1090` "Layer 0 Sync ensures... always fresh" both sit over
  hardcoded/stale placeholder data. Internal tool, but the same class as the three already fixed.
- **Neither new battery exercises the real production wire** (PR19, convergent finding): both test
  their module in isolation with hand-built fixtures. An end-to-end case through
  `computeWindowSnapshot` → the grade gate is missing.
- **`interaction_count` drift**: `mentor_profiles.interaction_count` is 484 while
  `mentor_interactions` holds 485 rows. Pre-existing, harmless, noted while capturing smoke state.

## Item 6 — Carried, questions already settled (do not re-litigate)

- **M-2** — build **with** the Q1 Phase-2 migration. Column **SETTLED: `q1_determination text` +
  CHECK**. **Founder decided: also correct FD-R2** (`countFailures`, `engine.ts:414-419`). Needs a
  `SageReflectSessionRow` entry, the drift-guard file list, and the column added to the original
  CREATE. **The Q1 flag is UNSET, so the migration alone makes M-2 buildable, not live.**
- **M-3** — consult denominator **already correct, do not narrow it**. Elected: print-split only.
  **Two traps:** no v4 record exists (capture off since 2026-07-17) so the frozen buffer **cannot
  exercise the split** — a synthetic fixture is required; and the live buffer is **138** records vs
  the frozen **130**, so **always pass the frozen path explicitly.**
- **M-5(b)** — its own P0 session; five decisions in §8 of its scope document.
- Untouched: AE-3 scoping, the `stoa-boundary` #20 ruling, `classifier_cost_log`'s absence from every
  data-rights path (R17c).

## Item 7 — PR19

**Mandatory** on the backstop and on any M-4 work. **PAUSE before launching** (founder drops the
model setting). **PAUSE after** (founder restores it).

Last session's run was worth its cost: 7 dimensions / 8 agents / 0 errors / 13 findings, **8
CONFIRMED**, including two live perimeter gaps and a false claim in the builder's own comment. **Give
it an explicit completeness dimension on the perimeter sweep again** — it has now found new routes on
two consecutive runs. Tell reviewers **not to trust the author's mutation-verification claims** and to
re-run them, and state that the tree is **shared and read-only** (a reviewer running `git stash`
once produced a confident, evidence-backed, entirely false finding).

## What NOT to do

- **Do not re-tune the grade thresholds** to keep `sage_like` reachable — the ruled dishonest option.
- **Do not apply anything in `2026-08-17-M4-retirement-HELD/`** before the mentor rules.
- **Do not activate Spec 4.**
- **Do not change public wording** (`/limitations`, `ops-hub`, `transparency`, `llms.txt`,
  `agent-card.json`, the trust-record payload) without founder sign-off on the exact text.
- **Do not treat eight routes as exhaustive** — that is what Item 1 exists to fix.
- **Do not touch `layer2-mechanisms.ts`'s `describeDispositionStability`** — same name, unrelated
  function, inside the signed assessment.
- **Do not narrow M-3's consult denominator.**
- **Do not commit `website/src/data/environmental-context.json`.**
- **Do not use `Edit` with `replace_all`** to touch every return path in a route — differing
  indentation silently defeats it. That is how a HIGH defect was introduced two sessions ago.
