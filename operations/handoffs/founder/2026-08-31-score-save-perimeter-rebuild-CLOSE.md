# Close — the `/api/score/save` R20a perimeter rebuild

**Date:** 2026-08-31. **Tier:** `code-critical` (AC5 + PR6). **AC7:** NOT engaged — nothing was
deployed, no flag was set, no production or TEST operation was performed.
**Production state:** unchanged. The work is committed locally and **not pushed**.
**Session model:** `claude-opus-5`, effort high. **Peers at open:** 22 (path-scoped commits only).

**Commits (six, in order, none pushed):** `299c3e9` rebuild → `3068868` a self-caught miscount →
`1907be4` a CRITICAL fix (separator inflation) → `a23511b` a second CRITICAL fix (depth bypass) plus
two vacuous pins → `38d12ed` gate all new validation behind the flag (a HIGH — the byte-identity
claim was false) → `355ea75` three claim corrections. See §10 for the full PR19 record; §9 for what
each fix addressed.

---

## 1. Status in one paragraph

The mentor's corrected ruling of 2026-08-31 is **executed**. `/api/score/save` screens ten
caller-supplied fields, refuses to persist a record carrying acute or moderate distress, returns
**422** rather than 200, and the calling page now renders crisis resources instead of the word
"saved". The exhaustiveness backstop is **green** — both previously-unclassified routes are
registered. The rebuild is **dark** behind a dedicated flag and **not activated**; activation is a
founder-walked step. **Two decisions are the founder's and are named in §6 — one of them should be
taken before activation, and the other is a finding this ruling produced rather than a pre-existing
carry.**

---

## 2. §0 re-derived at open, and four corrections to the prompt's own framing

Everything in §0 was confirmed from source: `git log origin/main..HEAD` empty, tree clean, HEAD
`41fa4c1`, no `MERGE_MSG`/`REVERT_HEAD`, guard **689/2 RED**, wiring **885/0 GREEN**.

The prompt is reliable, but four of its statements did not survive first-hand derivation. Recording
them because the next session should not inherit them:

1. **"Flag-gated floor → 31 (it is stale at `>= 30`)".** Post-revert the array holds **30** entries
   against a `>= 30` floor — *tight*, not stale. It becomes stale only once the entry is added. The
   register's H4 observed the post-build state (31 vs 30). The instruction is right; the diagnosis
   was of a state that no longer existed.
2. **"§1g — name the flag choice either way".** The choice is more constrained than that implies:
   `extractFlagBlocks` in the wiring battery **hardcodes** `isR20aGapClosureEnabled`, so a dedicated
   flag is invisible to the `ROUTE_WIRING` machinery — i.e. choosing a dedicated flag would have
   forfeited the register's single highest-value pin unless the battery were extended. It was
   extended (§4).
3. **The mandated `ROUTE_WIRING` row pins nothing about the HTTP status.** `assertRedirectAndMild`
   asserts only that the redirect `return NextResponse.json`s. The ruling's central requirement
   would have shipped completely unasserted had the row been added as-is.
4. **`FLAG_GATED_ROUTE_LEVEL_ROUTES` is not part of `registeredRoutes`.** A flag entry never
   classifies a route for the backstop, and a route can sit in `FLAG_GATED` *and*
   `PERIMETER_EXCLUSIONS` simultaneously with nothing objecting. That is register H8's actual
   mechanism, and it is why H8 needed a semantic answer rather than a bigger integer (§4).

Also derived rather than quoted: `HUMAN_FACING_POST_ROUTES` = 42 → score/save is the **43rd**
(the register's LOW about "fifteenth" confirmed).

---

## 3. The screened set — ten, re-enumerated from schema

Derived from the route's destructure against `website/supabase-v3-migration.sql`, per the ruling's
"enumerate these from the route's actual schema, not from a criterion that the code does not
enforce". It agrees with the prompt's table.

| Screened (10) | Type | Note |
|---|---|---|
| `action`, `context`, `relationships`, `emotional_state` | TEXT | practitioner-typed |
| `philosophical_reflection`, `improvement_path`, `oikeiosis_context` | TEXT | engine-authored, caller-supplied here |
| `ruling_faculty_state` | TEXT | **not named by the ruling** — caught by enumeration |
| `false_judgements` | JSONB | the ruling's "most likely to carry the material" |
| `passions_detected` | JSONB | **not named by the ruling** — caught by enumeration |

**Excluded (3), each on a ground THIS ROUTE now enforces.** The prompt's ground for excluding
`katorthoma_proximity` and `kathekon_quality` was the DB CHECK constraint. That is a criterion
enforced *in a different file* — which is the same shape of reasoning the mentor rejected for the
seven-field scope. Checked at each enforcement point: `is_kathekon` was genuinely route-enforced
(`typeof`), `katorthoma_proximity` was checked only as a non-empty string (so `"I want to kill
myself"` passed the route and was stopped only by Postgres), and `kathekon_quality` had **no route
validation at all**. The route now validates both enums itself, and
`action-evaluations-v3-schema-drift.test.ts` machine-checks its literal lists against the migration
so the ground cannot silently become false.

No schema change was made. Nothing in this rebuild touches the database.

---

## 4. What was built

- **`route.ts`** — the perimeter block runs after auth and body-parse, **before** the null-body
  guard, field validation and the insert, reading `body?.x` so distress in an otherwise-invalid body
  still catches. Two local `function` declarations: `collectScoreSaveJsonbText` (a shape-agnostic
  recursive walk that also collects **object keys**, since a key persists verbatim and can itself be
  the prose) and `scoreSaveDistressSubject` (all ten fields, ordered most-distress-bearing first).
  Redirect at **422**. Mild folds `buildMildSupportResources('practice')` onto the success response.
- **`r20a.ts`** — a **dedicated** flag, `SUBSTRATE_SCORE_SAVE_R20A_ENABLED`, colocated per the
  `/impulse` precedent (route.ts cannot export non-handlers; `next build` catches it and neither
  `tsc` nor `tsx` does). Chosen over the shared gap-closure flag on two grounds from the register:
  the shared flag is already live so deploy would equal activation with no dark window (M6), and
  unsetting it to mitigate an incident here would strip screening from 25 other routes including
  the most distress-likely tools (M2 — the documented rollback lever was safety-inverting).
- **`score-save-response.ts` + its test** — the response discrimination as a pure, separately-tested
  function. It keys on the **body**, not the status: if a future change moved the status, keying on
  status would silently resume showing a scoring card to someone in crisis, whereas body-keying
  degrades to `error`, which is wrong but safe.
- **`score/page.tsx`** — reads the body once, classifies, and on distress sets the crisis redirect,
  **clears `result`**, suppresses `saved`/`errorMsg`/`stageCrossing`, clears the spinner and returns
  — placed before the generic error line so `setSaved(true)` and the milestones POST are
  *structurally* unreachable. The mild support message is rendered (the `/impulse` and `/stoa`
  precedent), so the fold is not a dead path.
- **Registry** — score/save added as the 43rd member and as a flag-gated entry;
  `/api/practice/completion-signal` registered as a reasoned exclusion on the mentor's corrected ST4
  ground, with the false "no free-text field" fact named in place and the **non-self-sealing**
  revisit trigger. Four floors bumped in the same edit (42→43, 30→31, 25→26, 32→33).
- **Two new pins.** `RULED_PERIMETER_MEMBERS` asserts *membership specifically* for routes placed in
  the perimeter by a binding ruling, plus the existence of the governing record — this is the
  semantic defeat of H8, whose mutation stays "classified" and so is invisible to the backstop. An
  assertion-total floor catches catastrophic reduction; its comment states plainly that it does
  **not** catch H8's narrow −7, because a floor tight enough to do so goes stale on the next
  legitimate addition, which is the drift that produced H8.
- **Wiring battery extended** three ways, all optional and defaulted so the 25 existing rows are
  byte-identical: `flagFn`, `redirectStatus`, and a status assertion bound to the argument span of
  the `NextResponse.json` call that carries the payload (never a file-wide `includes`, which is the
  H6 pin-false-pass class).

---

## 5. Verification

| Battery | Before | After PR19 folds |
|---|---|---|
| `r20a-invocation-guard` | **689 / 2 RED** | **715 / 0** |
| `r20a-gap-closure-route-wiring` | 885 / 0 | **936 / 0** |
| `perimeter-functional` (new) | — | **109 / 0** |
| `score-save-response` (new) | — | **35 / 0** |
| `action-evaluations-v3-schema-drift` | 71 / 0 | **75 / 0** |
| `score/save route.test` | 33 / 0 | 33 / 0 |
| `r20a-gap-closure` | 64 / 64 | 64 / 64 |
| `r20a-audience-rendering` | 66 / 66 | 66 / 66 |
| `tsc --noEmit` · `npm run build` | 0 · 0 | **0 · 0** (`ƒ /api/score/save` registered) |

Counts above are final, after all PR19 folds — see §10 for the full review record, including two
CRITICAL findings the review caught that self-verification did not.

**The functional battery is the load-bearing deliverable, and it was written BEFORE the route
change** (§1e). It executes `POST` with a stubbed classifier and a DB spy and asserts on outcomes.
Against the un-rebuilt route it failed **58** assertions while its non-vacuity control passed,
proving the harness genuinely observes inserts.

**Mutation-tested, not assumed** — the register's own standard, since ten mutations left every
battery green last time:

| Mutation | Result |
|---|---|
| C4 `severity !== 'mild'` → `===` | 51 failures |
| C5 whole block dead (`if (false && …)`) | 63 failures |
| C1 empty composed subject | 63 failures |
| C3 delete the redirect's `return` | 48 failures |
| collector stops reading object keys | 1 failure (precisely targeted) |
| status 422 → 200 | wiring battery red |
| status moved out of the payload call, decoy 422 elsewhere | wiring battery red (H6 class closed) |
| drop one screened field from the composer | wiring battery red |
| drop a value from the route's enum list | drift battery red |

No production credential was used and no live operation was performed; this environment holds none.

---

## 6. TWO DECISIONS THAT ARE THE FOUNDER'S

**(a) The mild-variant copy — should be settled before activation.**
The mild path folds `buildMildSupportResources('practice')`, whose opening reads *"Your entry is
saved, and working through this deliberately was the right thing to do…"*. That sentence is **true
here** (mild does not block; the row is written). But `r20a-gap-closure.ts:601-605` carries an
explicit FOUNDER-SIGNED WORDING notice, the battery permits exactly one variant per file, and
choosing the variant chooses which founder-signed string a flagged practitioner reads. `'practice'`
is the best fit of the three available and is what shipped, but **selecting it was a builder's call
on crisis-adjacent copy, and it is offered here for confirmation rather than presented as settled.**

**(b) The perimeter is bypassed entirely by a browser preference — and this is a consequence of the
ruling, not a pre-existing carry.**
Verified first-hand: `score/page.tsx:312-314` — `else if (user && storageMode === 'local') {
setSaved(true) }`. The local-storage branch **never calls `/api/score/save`**, so nothing in this
rebuild touches it. And `api/score/route.ts:154` screens `detectDistressTwoStage(action)` — the bare
`action` alone. So a practitioner on local mode who writes acute distress into `emotional_state`,
`relationships` or `context` is screened by **nothing**, and receives the exact outcome this ruling
was raised to prevent. Which practitioners this ruling protects is currently decided by a
`localStorage` value.

The durable fix is upstream — extending `/api/score`'s own screening from `action` to all four
submitted fields. That was **deliberately not done here**: `/api/score` is engine-adjacent and
outside the ruling's scope, and quietly widening scope into it in the same session is the kind of
move this project's process rules exist to prevent. The mentor's A2b reasoning — that the route
cannot enforce a distinction about a client it does not control — **applies with equal force to a
page that can route around the route**, which is why this belongs in front of the founder (and
plausibly in front of the mentor) rather than in a follow-up list.

---

## 7. Activation (founder-walked; nothing here pre-approves it)

1. Push `299c3e9` + `3068868`; confirm Vercel green. **Deploy is not activation** — the flag is
   unset, so the deployed route is byte-identical in behaviour on the screening path.
2. Set `SUBSTRATE_SCORE_SAVE_R20A_ENABLED=true` in Vercel Production; redeploy.
3. Live smoke, **both directions**, on a throwaway practitioner account:
   - acute text in `emotional_state` → **422**, crisis resources rendered on `/score`, **row count
     unchanged**;
   - benign evaluation → 200, row written, normal result card.
   The row-count check is the one that matters: it is the assertion the reverted build would have
   failed.
4. Tear down the test account/rows.

**Rollback:** unset `SUBSTRATE_SCORE_SAVE_R20A_ENABLED` and redeploy (flag-off asserted
byte-identical by `perimeter-functional` §6), **or** `git revert` the two commits.
**It is NOT the shared `SUBSTRATE_R20A_GAP_CLOSURE_ENABLED`** — unsetting that to mitigate an
incident here would strip screening from 25 other routes.

---

## 8. Named follow-ups (not done, deliberately)

- **`/api/score` field coverage** — §6(b). The durable fix for the local-mode bypass. Confirmed by
  three independent PR19 reviewers as well as first-hand.
- **`userId` is still not passed to the classifier**, so a `vulnerability_flag` written from this
  route is unattributed. Perimeter-wide (~40 sites), not introduced or worsened here — every
  reviewer who checked confirmed this — and **the wiring battery's pinned call shape forbids adding
  a third argument without changing the battery** — so it stays open by construction and should be
  fixed perimeter-wide, not per route.
- **Every cloud-mode save now makes a real billed Haiku call** when stage-1 finds nothing — new,
  unconditional, on the practitioner's critical path. Bounded by the `scoring` rate limit and by the
  per-field caps, but it is a steady-state cost change and belongs in the record rather than in a
  bill. PR19 additionally quantified this route's worst-case subject as the largest of any perimeter
  member (10 fields vs. the next-largest at 4).
- **`PERIMETER_EXCLUSIONS` gained a count floor** (it had none); the in-scope floor was left at 65
  deliberately, per that floor's own documented discipline.
- **Response-handling execution coverage.** §10, the not-yet-closed HIGH: the pins on
  `score/page.tsx`'s distress branch are source-index assertions, not execution. A browser-level or
  DOM-execution test harness would close this properly; this session's `tsx` harness cannot reach it.
- **Two stale line-number citations** in code comments, made stale by this session's own later edits.

---

## 9. Honest limits

- **Nothing was verified live.** Every result above is repo-local. The perimeter's real behaviour on
  production is unverified until the §7 smoke runs.
- **A green perimeter is not coverage.** The ceiling is the classifier's recall — a regex stage 1
  and a Haiku stage 2. Nothing here raises it, and a fully-pinned, fully-green perimeter around a
  classifier that misses reads as safety and is not.
- **A miscount shipped in `299c3e9` and was corrected in `3068868`.** Three comments said "62
  distress redirects"; 62 was a grep of `distress_detected: true` *occurrences*, not redirects. The
  true figure, derived by parsing the argument span of every `NextResponse.json` call containing the
  flag, is **45 calls — 44 at 200, one (this route) at 422**. The substance was right and no
  assertion depended on it, but it was a secondary characterisation restated as primary data, taken
  from a subagent's grep rather than measured. Found by checking my own claims before review.
- **The first PR19 attempt was launched against inconsistent trees** (worktrees pinned at the
  pre-commit HEAD carrying a half-applied mid-build state) and was **killed rather than reported**.
  The relaunch (`git archive` extracts, no `.git`, `node_modules` symlinked) then hit the session's
  own usage limit with all seven agents mid-flight and needed a second relaunch from the saved
  script before it ran to completion.
- **The self-verification before review missed two CRITICAL defects** that PR19 caught — a depth
  bypass and a separator-inflation bypass, both in the JSONB collector, both fixed at the root (see
  §10). One of the two the author found independently, in parallel with three reviewers finding the
  same thing, by testing the claimed invariant rather than trusting it — the other was found only by
  review. The "flag-off is byte-identical" claim in the original close was also **false** and is
  corrected in §10; every number in this document reflects the state after all PR19 folds.
- **Every count in §2, §3 and elsewhere was accurate AT THE TIME OF WRITING** but this document was
  written before the PR19 folds landed, and several battery totals moved (guard/wiring/functional
  counts grew as pins were added and corrected). §5's table carries the final, post-fold numbers;
  treat any count elsewhere in this document as a snapshot of the state at that point in the session,
  not as the final figure.

---

## 10. PR19 independent adversarial review

**All seven dimensions complete.** Two false starts, both recorded rather than hidden: the first
launch used per-agent git worktrees that turned out to be pinned at the pre-commit HEAD and carrying
a half-applied mid-build state — killed, not reported. The relaunch (`git archive` extracts, one per
dimension, no `.git`, `node_modules` symlinked) then hit the session's own usage limit with all seven
agents mid-flight and had to be relaunched a second time from the saved script. The review that
actually landed ran against `299c3e9` — the pre-fix commit — on genuinely isolated copies.

**Two CRITICAL findings, both reported independently by multiple dimensions:**

1. **JSONB prose nested deeper than 6 levels was never screened and persisted.**
   `collectScoreSaveJsonbText` returned silently past its depth bound. A caller controls the
   nesting entirely, so this was a general bypass of the JSONB half of the ruling. One reviewer
   demonstrated it against the real handler using the genuine stage-1 regex as oracle — a strictly
   better harness than the author's severity-scripted stub, which is exactly why the author missed
   it and the reviewer did not.
2. **Separator inflation in the same collector** — independently found by the author (before review
   returned) and by three review dimensions. The collector bounded raw prose characters; what
   actually gets capped is the *joined* string, inflated by the collector's own separators. A
   padded JSONB array could pass the persistence size check while its joined form silently
   truncated the acute tail out of the screened text.

Both are **fixed at the root** (`1907be4`, `a23511b`): a walk that stops on any bound now reports
`bounded: true` and the route **refuses** the write rather than persisting an incomplete screen.
Mutation-verified.

**HIGH findings, all confirmed and folded:**
- `setDistressRedirect(payload)` — the one line that renders crisis resources — had zero coverage;
  removing it left every battery green. Now pinned, scoped to the branch body (not file-wide).
- The author's own `§5-6` pin (`result` clearing) was **vacuous** — satisfied by an unrelated reset
  114 lines away. Mutation-proven by two independent reviewers before the author found it too.
- "Flag-off is byte-identical" was **false**: 11 of 13 differential probes diverged from the
  pre-rebuild route, 9 of them turning a previously-accepted, persisted save into a permanent 400 —
  on deploy, flag unset, with the close telling the founder deploy was a no-op. **All new validation
  is now gated behind the same flag activation as the perimeter itself.**
- The H3 "screened ≥ persisted" invariant was unpinned from a third leg (`TEXT_LIMITS.medium`); a
  one-token mutation reopened it with every battery green. The author's own first fix pinned only
  two of the three coupled constants and was caught by mutation-testing it against the reviewer's
  exact mutation.
- A classifier **construction** throw (missing/invalid API key) sat outside the classifier's
  internal fail-open and escaped as an uncaught 500. Now caught and fails **closed** (503, refuses
  the write) — the one route where a screening outage failing open means a durable unscreened write.
- The response-handling layer's structural pins are **source-index assertions, not execution**. A
  reviewer removed the live distress branch, changed the page's discriminator to also treat 422 as
  `ok`, and reproduced the reverted defect — a scoring card with no crisis resources — with every
  battery green. **Not closed this session.** This project's `tsx` harness has no DOM/React
  execution path; closing it fully needs a browser-level test. Recorded here rather than silently
  absorbed — see §9's honest limits and the follow-ups below.

**MEDIUM, folded:** the page discarded the server's actionable 400 message (defeating the stated
premise of a 400-you-can-act-on policy) — now surfaced. A wiring-battery extractor limitation (an
inline object return type is mis-parsed as a function body) was found, worked around with a named
type, and documented so the next local composer doesn't hit it blind.

**LOW/NIT, folded:** three factual overclaims in `r20a.ts` — "26 routes" (measured: 25), "every
prior perimeter member took its own flag" (the decision log records the shared flag as deliberate
for its 25 routes, not an exception), and "no added latency" flag-off (module-load cost is
measurably +100–155ms per cold start, though not request-path latency or a behavioural difference).

**Not folded, and not silently dropped:**
- `userId` still not passed to the classifier — perimeter-wide (~40 sites unaffected by this
  commit), the wiring battery's pinned call shape forbids a third argument without extending it, and
  every reviewer who checked confirmed it is unchanged, not worsened, by this rebuild.
- storageMode `'local'` bypasses the perimeter entirely — three reviewers found this independently
  of the author; already recorded as founder decision (b) in §6, above.
- Two stale line-number citations in comments, made stale by this session's own later edits. Cosmetic.

**Verification of the author's claimed results:** every battery count was reproduced independently,
exactly, by every dimension that checked. `npm run build` could not be run in one review copy
(a Turbopack panic on the `node_modules` symlink, an artifact of that copy, not the code); `tsc`
reproduced clean and the author's own `build 0` was independently re-confirmed after every fold in
this repo.

**Final state, all green:** guard 715/0 · wiring 936/0 · functional 109/0 · response 35/0 ·
drift 75/0 · route 33/0 · gap-closure 64/64 · audience 66/66 · tsc 0 · build 0.

**Commits (in order, none pushed):** `299c3e9` rebuild → `3068868` a self-caught miscount →
`1907be4` the separator-inflation CRITICAL → `a23511b` the depth-bypass CRITICAL + two vacuous pins
→ `38d12ed` gate all new validation behind the flag (the "byte-identical" HIGH) + the H3 third leg +
fail-closed on classifier-construction throw → `355ea75` three claim corrections.

**PR19's own lesson, once more, with a twist:** every substantive finding this round was reproduced
by at least two independent dimensions, and in one case — the separator-inflation CRITICAL — the
author found and fixed it independently, in parallel with three reviewers finding the same thing.
Independent review is not needed because self-review is careless; it is needed because a single
perspective's blind spots are structural, and this session's own self-caught fixes still left two
CRITICALs, several vacuous pins, and a false byte-identity claim for review to catch.

**Recommendation to the founder:** the rebuild is ready for the two decisions in §6 and for the
activation walk in §7. The response-handling execution-coverage gap (this section, HIGH,
not-yet-closed) should be weighed alongside them — it does not block activation (the property it
concerns is still true, just not machine-verified at that layer), but it is a real gap in what this
session's batteries can prove about the layer that caused the original revert.
