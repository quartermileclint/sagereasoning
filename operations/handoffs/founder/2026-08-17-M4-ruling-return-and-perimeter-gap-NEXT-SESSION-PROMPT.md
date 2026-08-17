> # ⚠ SPENT / SUPERSEDED — 2026-08-17, same day it was authored. DO NOT WORK FROM THIS FILE.
>
> Both items it queued were resolved in the same sitting:
> - **M-4 was RULED** (`D-MENTOR-RULING-M4-RETURN-ADOPTED`; verbatim
>   `operations/trust-layer-2026-07/2026-08-17-mentor-ruling-M4-return-verbatim.md`). The ruling
>   confirmed retirement as given, added the mean-floor correction, and required a dual-defect
>   disclosure. Execution is carried and unstarted.
> - **The perimeter gap was BUILT DARK — for SIX routes, not four**
>   (`D-R20A-PERIMETER-GAP-CLOSURE-SIX-ROUTES-BUILT-DARK-PR19-FOLDED`). PR19 found two more routes
>   and two HIGH defects the build introduced; all folded.
>
> **The live successor is
> `operations/handoffs/founder/2026-08-17-activation-M4-execution-and-honesty-fixes-NEXT-SESSION-PROMPT.md`.**
>
> Retained unaltered below as the arc's record of what was queued and why.

---

# Next session — the M-4 ruling return + the four-route R20a perimeter gap

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Tier: mixed — `code-critical` for the perimeter gap (R20a, AC5), `code-critical` for M-4's execution
if the mentor's answer licenses it.** Founder presence **required**. **No flag is set unless the
founder elects it.**

---

## Step 0 — Open

Read: `/adopted/standing-protocol-cache.md` → this prompt in full → the close
`operations/handoffs/founder/2026-08-17-R2b-successor-M4-returned-M5-scoped-CLOSE.md` → the decision-log
entry `D-R2B-SUCCESSOR-M4-RETURNED-M5A-CORRECTED-M5B-SCOPED-PR19-FOLDED` → the binding verbatim
`operations/trust-layer-2026-07/2026-08-16-mentor-rulings-M1-M5-r2b-verbatim.md` (§M-4, §M-5, plus its
updated execution-status table) → `git status` and `git log --oneline -8`.

**Re-check the byte-identity guard's posture at THIS session's open, first-hand.** It binds iff
`GATE1_FALSE_HOLD_CAPTURE === 'true'` (`human-practitioner-boundary.test.ts` §C). It was **DORMANT**
throughout 2026-08-17, verified in both the process env and `.claude/settings.local.json`. **Do not
infer it from a calendar date** — a PR19 agent did that in R2a and was right for the wrong reason.

**Expected HEAD at authoring:** `17fda7e` plus the 2026-08-17 records commit, if pushed.

---

## Part A — What this session is for, and the order

Two items, and **the second is more urgent than the first** even though the first is the one with a
mentor ruling attached.

### 1. ⚠ THE FOUR-ROUTE R20a PERIMETER GAP — recommended FIRST

**Four routes accept human free text with no distress check at all**, verified first-hand 2026-08-17
and detailed in §6 of `operations/trust-layer-2026-07/2026-08-17-M5b-vulnerability-flag-write-path-SCOPE.md`:

| Route | Auth | Free text | Distress check | In `HUMAN_FACING_POST_ROUTES`? |
|---|---|---|---|---|
| `/api/skill/sage-classify` | `requireAuth` | `TEXT_LIMITS.medium` (5000) | **none** | **no** |
| `/api/skill/sage-prioritise` | `requireAuth` | `TEXT_LIMITS.medium` | **none** | **no** |
| `/api/mentor/passion-classify` | `requireAuth` | `TEXT_LIMITS.medium` | **none** | **no** |
| `/api/mentor/passion-log` | `requireAuth` | `TEXT_LIMITS.medium` | **none** | **no** |

A logged-in practitioner can write acute distress into any of them and get **no redirect, no crisis
resources**. Same class as the `/api/score-conversation` gap that needed its own Critical session
(S8b blocker (c), closed 2026-07-07) — except all four are **absent from the registry**, so the guard
battery cannot see them. The 13 sibling skill routes DO get a check, at `context-template.ts:112`.

**Unlike the six Remaining Principles tools**, whose exclusion from the perimeter is a *recorded design
decision* in CLAUDE.md, **none of these four has any recorded exclusion** — and `/passion-log` is on
record as a promoted, nav-linked feature. This reads as oversight, not choice. **Confirm that reading
with the founder before building** — if any of the four is deliberately excluded, that is a founder
fact the repo does not carry.

**Two things this session must NOT assume:**
- **The sweep is not proven exhaustive.** It went from two routes to four on a second, independent
  pass. **Re-run an independent sweep before treating four as the final count.** The 2026-08-17 sweep
  covered `api/mentor/` and `api/skill/` only.
- **`passion-classify` / `passion-log` handle exactly the content R20a is written for** — fear, anger,
  grief, craving. The AC5 question ("should this route be in the perimeter?") is not close for these.

**Tier: `code-critical`** (R20a perimeter extension, AC5 + AC7). Precedent to follow exactly: the
`/api/score-conversation` eleventh-route wiring — route-level
`await enforceDistressCheck(detectDistressTwoStage(...))` **before any LLM call**, a dedicated
`SUBSTRATE_*_R20A_ENABLED` flag so flag-off is byte-identical, registry additions to
`HUMAN_FACING_POST_ROUTES`, and a live smoke on **both** directions (acute redirects with zero write;
benign saves).

### 2. M-4 — execute whatever the mentor's answer licenses

The brief is `operations/trust-layer-2026-07/2026-08-17-M4-disposition-stability-mechanism-facts-FOR-RULING.md`.

**Read §4 before doing anything.** It states plainly that **retirement is already licensed by M-4's own
conditional** ("if that correction is not tractable in the current build, the signal should be retired")
and that the brief's own §3 satisfies that condition. The narrowed question put to the mentor is
whether the newly-surfaced grade-gate coupling changes **what** gets retired, not **whether**:

- **(a)** retire from agent-facing surfaces as originally ruled, leaving `principled → sage_like`
  structurally unreachable as an honest record that the measure is missing; **or**
- **(b)** re-tune the ladder as part of the retirement (e.g. a three-dimension elevated-count for the
  top rung), because an unreachable top rung is a different dishonesty than the one M-4 named.

**The brief commits us: if the answer is (a), execute on that answer alone and do not return a third
time.**

**Separately and independently: mean-blindness.** Thirty consecutive `reflexive` readings certify
`advanced`/"Disposition approaching hexis" at maximum confidence, because `computeDispositionStability`
computes `mean` (`window-aggregator.ts:541`) and never uses it for the level. This is correctable with
**no new channel** and does not depend on the mentor's answer to (1). Ask the founder whether to take
it here.

**Retirement blast radius, already established — re-derive, do not trust this list:** six agent-facing
surfaces; published claims at `llms.txt` lines 324 / 682 / 982 and `agent-card.json:312`; a
`does_not_attest` sentence in `trust-record-payload.ts` **pinned object-identical by the S10 battery**;
three further producers of a same-named field including the agent-facing `/api/baseline/agent`. So
retirement is **also an R18 wording change requiring founder sign-off**.

**And the live consequence, stated once more because it is easy to lose:** `dimensionsMeetFloor` uses
`.every()` over all four dimensions, so capping this one below `advanced` makes the top grade rung
unreachable — and the grade sets `authority_level`, published on the accreditation card.
**Spec 4's activation stays BLOCKED until M-4 is resolved**; the block is stated on
`isTrajectoryDispersionEnabled()` itself.

---

## Part B — Also awaiting the founder (not this session's build work)

- **The R18 sign-off package** —
  `operations/trust-layer-2026-07/2026-08-17-M5a-r18-public-disclosure-signoff-package.md`. Three options
  for disclosing, on `/limitations`, that a crisis detection produces **no follow-up of any kind**.
  Recommendation: Option A. **Do not apply any of it without a ticked box** (R18).
- **Two adjacent public-honesty items**, both flagged and unedited: `transparency/page.tsx:172-173`
  promises "you can always contact a human at support@sagereasoning.com" against a channel CLAUDE.md
  records as unwatched (go-live #11, OPEN); and `ops-hub/page.tsx:638` commits to a 2-hour alert
  acknowledgment on a page whose auth gating **was not verified against production** — that check is
  outstanding, and no conclusion should be drawn until it is done first-hand.

---

## Part C — Carried, with their questions already settled (do not re-litigate)

- **M-2** — build **with** the Q1 Phase-2 migration. Column shape **SETTLED: `q1_determination text` +
  CHECK**, not a boolean (the Q1 activation flag is UNSET, so a boolean permanently conflates
  pre-activation rows with genuinely-determined ones). **Open design question to settle BEFORE
  authoring the SQL:** whether to also correct **FD-R2** — `countFailures` (`engine.ts:414-419`) reads
  `q1.assessment.distortions.length` directly and `prior_sessions[].total_failures` sums an array that
  is empty for both a clean answer and an "I cannot determine", so an undetermined session counts as
  zero-failure and, as a *prior* session, can **suppress a legitimate progress hold** — the unsafe
  direction. Re-walking a founder-walked migration is expensive; decide first.
  Also required: an entry in `SageReflectSessionRow`, the drift-guard file list, and (house style) the
  column added to the original CREATE as well as the standalone migration.
- **M-3** — the consult denominator is **already exactly correct**; do not narrow it. Elected:
  **print-split only** (repo-only). The carried question is whether "never pooled" must reach the
  durable `agent_hold_observations` ledger, which has **no `path` column** — a guard deny persists
  there as `is_hold=true, loop_event='none'`, contradicting the table's own documented invariant in
  three places. That would be its own founder-walked migration. **Two traps:** no v4 record exists
  anywhere (capture off since 2026-07-17), so the frozen buffer **cannot exercise the split** — a
  synthetic fixture is required; and the live buffer is **138** records against the frozen **130**,
  with `GATE1_STATE_DIR` set, so **always pass the frozen path explicitly** or a run reads as a
  classifier move.
- **M-5(b)** — its own P0 session; does not block R4 (founder-resolved 2026-08-17). Five decisions
  listed in §8 of its scope document.
- Untouched: the AE-3 scoping step, the `stoa-boundary` #20 ruling, `classifier_cost_log`'s absence
  from every data-rights path (R17c).

---

## Part D — Adversarial review (PR19)

**Mandatory** — the perimeter item is R20a safety code (explicitly PR19-scoped since 2026-08-10), and
M-4 changes a live agent-facing signal that gates published authority. **PAUSE before launching** —
founder drops the model setting. **PAUSE after it returns** — founder restores it.

**Give the review an explicit completeness dimension on the perimeter sweep.** The 2026-08-17 sweep
went from two routes to four on independent re-check; that is exactly the failure PR19 exists to catch,
and it should be assumed to recur.

## Part E — Close

Decision-log entry (full form — Critical if anything is activated); update the M-1..M-5 verbatim
record's execution-status table; tick the arc plan; state plainly which rulings remain carried and why.

## What NOT to do

- **Do not activate Spec 4's flag** until M-4 is resolved. The block is on the flag helper itself.
- **Do not change any public R20a or `disposition_stability` wording without founder sign-off** (R18).
- **Do not treat the four-route count as exhaustive** without an independent re-sweep.
- **Do not narrow M-3's consult denominator** — confirmed already correct.
- **Do not retroactively write `vulnerability_flag` rows** — the ruling names that fabrication.
- **Do not "fix" the predicate/reducer divergence on self-only `violated`** — deliberate, ruled, pinned §8.9e.
