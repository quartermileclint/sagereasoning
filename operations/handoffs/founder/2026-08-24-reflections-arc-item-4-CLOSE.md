# Close — Reflections Arc, Item 4 (combined scoping: IW-2 route (c) + IW-7 reflect cadence)

**Date:** 2026-08-24 · **Stream:** founder · **Arc:** reflections
**Tier:** `governance`. **AC7 not engaged.** No code, schema, flag, credential, migration, or live operation. **Production untouched.** No harness file was modified — the mechanism facts below were established by reading, not editing.

**This closes the reflections-examination arc. All five work items are complete.**

---

## What landed

**The shared answer.** Both surfaces reduce to one question — how a party recognises a trigger moment without having already diagnosed the thing the trigger exists to catch. The proposal: **key on exposure, not on failure.** Detect a surface event present in both the failing and the succeeding case, observable without any diagnosis, and let the trigger's content do the diagnostic work after it fires. The cost is named rather than hidden — an exposure-keyed trigger fires when nothing was wrong, which is exactly what eroded the at-action advisory (IW-4). **It is paid for with occasion-varied content.**

**Route (c) — adopted and live.** A fifth row in the standing cache's failure-mode table:

> **Lesson cited, not tested (KG-EX2)** · *"I asked whether something holds. I was told what a document says."* · **"That's the rule — what did the check return?"**

You can use it from now. It concedes the citation and asks for the one thing a citation cannot supply. It fires on correct citations too, by design — a genuine check answers it in one sentence.

**IW-7 — scoped, not built.** The design finding that matters: **constraint (a) dissolves.** Rather than teaching the session to recognise a phase boundary, move the recognition to the harness — which already does it. Verified first-hand: H3 already fires `PreToolUse` on every consequential action, already carries a once-per-session cached advisory with per-session state files, `framing-core.mjs` exports a general fire-once helper, and **`GATE1_REFLECT_INITIATE_MODE` already accepts a soft `'context'` mode.** So IW-7 needs **no new hook and no session judgment** — a boundary predicate on H3, firing soft.

**Files:**
- `operations/reflections-examination-2026-08/2026-08-24-item4-trigger-legibility-combined-scope.md` — new; doubles as the mentor brief per your election
- `adopted/standing-protocol-cache.md` — fifth failure-mode row + Sources line
- `operations/knowledge-gaps.md` — KG-EX2's placeholder replaced with the live phrase
- `operations/decision-log.md` — two entries at the physical tail
- this close — new

---

## What is yours next

**The mentor question, stated plainly in §5 of the scope:** is *exposure-keyed trigger plus occasion-varied content* the right general answer — and if so, does §4.3's content-variation mechanism actually pay for it, or does adding a **second** exposure-keyed instrument to a loop that already carries an eroded one simply relocate the erosion? §5 names the architectural surfaces per PR20: H3 and the guard path it shares, `close-hook.mjs`/`GATE1_REFLECT_INITIATE_MODE`, the trust record's per-session counting, PR21, and IW-4's false-positive rate.

**Left open deliberately.** The PR21 interaction — four of eight harvested decision-log findings have no reflect turn behind them, so the discipline outruns the instrument — was named as the mentor's to say and is **not** pre-answered here.

**No build is authorised by any of this.** The trial in §4.4 would be its own session, and it is specified so it can fail: a mechanically computable habituation measure (if successive fires say the same thing, the design failed constraint (b)), the coverage measure, and **a named null result** — if mid-session fires produce nothing the close turn would not have, revert.

---

## Honest limits

- **§4.3 is the weakest part and is flagged, not smoothed.** The entire habituation-resistance claim rests on occasion-varied content, and there is no evidence yet that it works.
- **Route (c)'s residual risk is not designed away:** the phrase depends on you hearing the difference between "the rule says X" and "I checked and found Y". Audible, but not automatic.
- **The 58% coverage baseline** in §4.4 is carried from the findings record and was **not** independently re-derived here.
- **The false-hold window's stopped state** — the nearest precedent for a measured trial — is taken from `CLAUDE.md` and marked **recorded-but-not-independently-verified**, since the flag lives in your local environment. Named because inheriting a status claim from `CLAUDE.md` is precisely this arc's IW-3.
- **Not independently reviewed.** PR19 does not engage a governance session.
- **The at-action guardrail timed out repeatedly** across today's sessions (28s, fail-open-honest). One fire did return a `reflexive` verdict with justice engaged, and it was read rather than pattern-discounted — recorded because AP-5 is the failure of discounting a correct warning habitually.

---

## Arc state — complete

| # | Item | Status |
|---|---|---|
| 1 | PR-series rule text (IS-1 encoding) | complete 2026-08-24 |
| 2 | First letter ("On writing before knowing") | complete 2026-08-24 |
| 3 | IW-2 routes (a) tooling + (b) KG-EX tracking | complete 2026-08-24 |
| 4 | Combined scoping (reflect-cadence + IW-2 route (c)) | **complete** 2026-08-24 |
| 5 | JSON schema + dashboard design | complete 2026-08-23 |

**What the arc produced, end to end:** one adopted process rule (PR25), one permanent register entry (KG-EX2), one founder redirect phrase now live, one structural check in the pre-commit gate, one letter, one schema and dashboard design, and four scoped-but-unbuilt candidates each with its blocking question named.

**What it deliberately did not produce:** any claim that these close the weaknesses they address. The arc's own central finding is that rules are scaffolding for sustained attention, not a substitute for it — and the strongest evidence for that remains what happened inside the arc itself: its own misfiled entries were found by a peer session, not by the author, and the explanation handed over for them was wrong too.

**Successors, none of them this arc's:** letters 2–8 remain unwritten (ordering ruled, only the first exists); the IW-7 trial; the three named-not-taken checks from item 3; and the empty-frontmatter memory.

---

## Commit

Committed, **not pushed** — you push. `website/src/data/environmental-context.json` remains excluded.
