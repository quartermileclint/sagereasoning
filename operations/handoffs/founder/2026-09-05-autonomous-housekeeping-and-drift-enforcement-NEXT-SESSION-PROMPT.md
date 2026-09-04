# NEXT SESSION PROMPT — autonomous housekeeping, drift enforcement, and two small builds

**Paste into a fresh session. Tier: `code-elevated`** (one item touches an always-on 400 boundary;
everything else is `governance`). **No founder-walked step is required to fill this session** — that
is the point of it. Every item below can be completed, verified and committed without a live
operation, a credential, a migration, a flag flip, or a production read.

**Written 2026-09-04** at the close of the session that built Option S and ran the drift audit.
HEAD at writing: `cb5e25c`.

---

## 0. Open

1. Read `/adopted/standing-protocol-cache.md`; `/CLAUDE.md` (the 2026-09-03 block + its 2026-09-04
   addendum + the **count-discipline note** added 2026-09-04); `/manifest.md` targeted only.
2. **`ListAgents` at open, `git status` at open and before every staging.** Peers have been active
   on this repo continuously. **A peer session is currently working the false-hold window / P6**
   (`operations/trust-layer-2026-07/` — a 2026-09-05 mentor ruling, a FREEZE-NOTE, the S11
   register). **Do not touch anything under `operations/trust-layer-2026-07/`.**
3. **Standing fact, learned 2026-09-04:** on this shared checkout **a peer's push publishes your
   commits too**. The commit, not the push, is the point of no return. Do not tell the founder
   something is "committed but not published" as though that were enforceable.

## 1. The theme: replace written instructions with executing checks

This project has now been bitten **four separate times** by the same failure — a count written into
prose going stale, with an instruction not to hand-maintain it failing to prevent recurrence:

| Count | Times stale | Fixed how |
|---|---|---|
| R20a perimeter, `manifest.md` §AC5 | 3 | stopped enumerating; points at the arrays |
| R20a perimeter, the guard test's own docstring | 3 | **now an assertion** (2026-09-04) |
| PR house rules, `CLAUDE.md` | 1 | corrected 2026-09-04 |
| un-numbered manifest sections, `CLAUDE.md` | 1 | corrected 2026-09-04 |
| `agent-card.json` extensions, `CLAUDE.md` | ~20 stale statements | standing note 2026-09-04 |

**The 2026-09-04 session's finding:** the guard test's header carried an emphatic *"⚠ THIS LINE HAS
NOW BEEN STALE TWICE — DO NOT MAINTAIN THIS NUMBER BY HAND"* **and went stale a third time anyway.**
It is now enforced by `docstring carries no hand-maintained perimeter count` (mutation-verified;
suite 717/0).

**This session's job is to finish that sweep.** Prefer an executing check to a written instruction
everywhere it is cheap.

---

## 2. Autonomous items, in recommended order

### A. Finish the count-discipline sweep (`governance` + test) — RECOMMENDED FIRST
Audit every governing surface for hand-maintained counts that can go stale, and enforce the cheap
ones. Known candidates, not exhaustive — **find the rest by grep, do not trust this list**:
- `llms.txt` and `api-docs/page.tsx` — do they state an extension count, a perimeter count, or a
  route count anywhere? These are **public** surfaces (R18), so a stale count there is worse than
  one in CLAUDE.md.
- The registry (`component-registry.json`) — does anything restate a count it could derive?
- Any test docstring stating a figure its own arrays hold (the pattern just fixed).
**Deliverable:** the drift list, the fixes, and an assertion wherever one is cheap. **Do not rewrite
dated historical bullets** — each was correct when written; annotate or add a standing note instead,
per the 2026-09-04 precedent.

### B. `/api/score-conversation` — the `format` field has no length validation (`code-elevated`)
Named as a follow-up at the 2026-07-07 eleventh-route activation and never done. Confirmed at source
2026-09-04: `format` is destructured (`route.ts:108`) and used (`:201`) but has **no length check at
the 400 boundary**, while `conversation`/`context` are capped. The R20a distress composition already
caps each field at 15,000 chars (`:146`, `:170`) so the *perimeter* is not exposed — this is an
input-validation gap, not a safety gap.
**Why it was deferred:** it changes **always-on** behaviour (a new 400 path), so it is not flag-off
safe and needs its own review. **It is still repo-only** — no migration, no flag.
**Required:** a test that fails before the fix; the existing route battery green after; PR19
independent review (the route is inside the R20a perimeter, so PR19's widened scope binds).

### C. Diagnose the `/api/community-map` 42703 (`governance` — diagnosis only)
CLAUDE.md carries this as a pre-existing error (`community_map_pins.show_on_map` missing). **Partly
stale already:** the column exists in `supabase-location-migration.sql`, and
`api/community-map/route.ts:10` says the gate *"lives INSIDE the view."* So the failure is most
likely a **view** that predates the column or the ST1 degrade migration
(`supabase-community-map-degrade-migration.sql`), not a missing base column.
**Deliverable:** a root-cause note and, if the fix is a migration, an authored-not-applied migration
with `§PRE`/`§APPLY`/`§VERIFY`/`§INVERSE`. **Do not apply it.**

### D. PR19 retroactive review of the Option S instrument's *second* version (`governance`)
The 2026-09-04 rebuild folded 6 HIGH findings but **was itself reviewed only once, in its first
form.** R9 and R10 both record that a second, independent pass finds what the first missed. The
rebuilt `option-s-runner.py` has had **no** independent review of its new logic — the floor-count
estimator, the direction classifier, the M/W recovery fields, the strata blocks.
**Recommended:** three blind reviewers as before, briefed on the rebuilt artifact only.

### E. Refresh `/CLAUDE.md`'s production-state block (`governance`) — LAST, and only if time
The block is dated 2026-09-03 and the 2026-09-04 addendum has since grown long. **PR18 governs:**
this is a close-time artifact, rewritten from the decision log, carrying its as-of date. **Do not
start this before A–D**; a half-done refresh is worse than a stale one.

---

## 3. Questions holding things up — with recommendations

> **⚖ FOUNDER ELECTION 2026-09-04 — ALL FIVE RECOMMENDATIONS ADOPTED AS RECOMMENDED.** Consequences,
> so a later session does not re-litigate them:
> - **Q1, Q2, Q3 → put to the mentor.** Done same day:
>   `agent-circles-2026-08/2026-09-04-MENTOR-QUESTION-path-A-set-size-K-and-whether-to-run.md`,
>   which asks four questions (the set size; the measurement K, recommending 10; whether the
>   founder-elected forward-looking design is within Path A's terms; and whether the run is worth its
>   purpose given the mechanism is now localized). **Path A does not proceed pending that ruling** —
>   no extraction, no credential, no spend.
> - **Q4 → `agent_hold_observations` sweep NOT activated.** The flag stays unset until the
>   false-hold-window / P6 work confirms the frozen buffer is not evidence a 90-day sweep would
>   purge. **Do not flip it in this session.**
> - **Q5 → the `stoic-brain` citation defects stay unfixed** (Meditations **7.9** cited as 4.26; the
>   entry's `DL 7.38` also off). Blocked by the byte-identity guard; the window's status is the
>   peer's P6 decision. Re-raise after that lands. **Do not edit `stoic-brain.json`.**


**None of these blocks §2.** They block *other* tracks, and each needs a founder decision.

### Q1 — Path A: the decision-bearing set is 24 or 29, and the record disagrees with the ruling
The 2026-09-04 ruling says **29** (20 winners + 9 rejections). The **S6 report's own outcome table**
says `winner` = **15** (cycles 1,2,4,7–14,17–20; five cycles produced no winner), giving **24**.
**Recommendation:** run `EXTRACTION.sql` §0/§PRE against production and carry whatever production
says, *plus* the discrepancy. Do not silently adopt either number. If production gives 24, the
ruling's "20 winners" needs a correction note — a mentor-facing observation, not a repo edit.

### Q2 — Path A: what K, given the cost case for K=3 has collapsed
K=3 is R8's **policy** parameter for median-of-3; it was **never ruled** as the measurement K, and
the first build inherited one for the other silently. Measured cost is **$0.014222/call**, so
K=10 across the set is **~$3.41–4.12**, not prohibitive. The c11 record calls its own n=10 *"a rate
demonstration, not a rate measurement."*
**Recommendation: K=10.** It is D6a-comparable, gives a usable per-input p̂ (K=3 yields only
{0, ⅓, ⅔, 1}), and the cost difference is ~$3. Record the reason either way.

### Q3 — Path A: is it still worth running at all?
The mechanism is already localized by the c11 experiment (Layer-1 stage assignment, four states on
identical text) and D6a already measured 12% on synthetic probes. Path A's remaining contribution is
**prevalence on real candidate texts** — which is exactly what the ruling's Q2 said was missing, so
the answer is probably yes, but the value is narrower than the original framing implied.
**Recommendation:** put Q1–Q3 to the mentor **together**, alongside the M/W election, rather than
spending the run first. The election is the thing the data serves; asking whether this data serves it
is cheaper than producing it and discovering it does not.

### Q4 — `agent_hold_observations` retention sweep: activate?
**Status verified 2026-09-04:** the sweep is **built, unit-tested, and registered in `vercel.json`**
— but **dark** (`SUBSTRATE_HOLD_OBSERVATIONS_SWEEP_ENABLED` unset). So PR24's gap here is half
closed; only a flag flip remains. The table currently holds the frozen 130-record buffer.
**Recommendation: DO NOT activate yet, and this is a caution rather than a deferral.** A peer session
is actively working the false-hold window and P6 right now, and that buffer is the frozen evidence
those sessions rest on. A 90-day `retain_until` sweep against a table holding evidence from
2026-07-12→17 would purge it. **Confirm with the P6 work first**; then flip.

### Q5 — the corpus citation defects (`stoic-brain.json`)
Marcus's interweaving line is cited as *Meditations* 4.26; it is **7.9**. The same entry's `DL 7.38`
is also off. **Blocked:** `stoic-brain` matches the byte-identity `GUARD_RE`, so editing it turns the
guard red. The guard is *window-conditional* per the 2026-08-15 M1 ruling.
**Recommendation:** leave it. The window's status is precisely what the peer's P6 work is deciding —
**do not pre-empt it.** Re-raise once that lands. A wrong citation on an internal corpus entry is a
real but low-severity defect; racing a peer on a guarded file to fix it is not worth it.

---

## 4. What this session does NOT do

Does not run Option S, mint or size a credential, read production, apply a migration, flip a flag, or
push. Does not open R11 or any design sitting. Does not touch `operations/trust-layer-2026-07/`
(peer-active), `operations/agent-circles-2026-08/d6a/` (frozen instrument), or any file matching the
byte-identity `GUARD_RE`. Does not rewrite dated historical bullets to make counts current.

## 5. Verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git log --oneline -5
cd website && npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts | tail -1   # expect 717 passed, 0 failed
python3 -c "import json;d=json.load(open('public/.well-known/agent-card.json'));print(len(d['capabilities']['extensions']))"  # derive, never quote
```

*This prompt self-starts nothing, but unlike its predecessors it does not need the founder to start
either — §2 is four sessions' worth of work that needs no live operation.*
