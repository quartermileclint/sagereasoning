# Close — curiosity/taxonomy stubs + guide-circle governance record

**Session date:** 2026-08-19. **Stream:** founder. **Tier:** `code-elevated`.
**Decision:** `D-CURIOSITY-TAXONOMY-STUBS-BUILT-GUIDE-CIRCLE-RECORDED-2026-08-19`.
**Prompt:** `2026-08-18-curiosity-taxonomy-stubs-NEXT-SESSION-PROMPT.md` — now **SPENT**.
**Opened at HEAD `026ec0a`** (`main`), matching the named predecessor.

---

## Production state at session close

**Production is unchanged and nothing was deployed.** No migration, no CHECK widening, no flag, no
credential, no mint, no route added, no schema touched, no live operation of any kind. The AI ran no
Supabase, Vercel, git-push, or mint command. Every flag named in `CLAUDE.md` is in the state it was in
at session open.

On the founder's push, the only live delta is **one wrapped call inside `/api/practice/fresh`** that
returns its argument by identity and writes one console line per genuinely-novel candidate (bounded at
`MAX_CANDIDATES` = 32 per request). **No response byte changes** — pinned end-to-end against the pure
function, and by reference-identity across all four result branches.

**Byte-identity guard posture, verified first-hand at open:** `GATE1_FALSE_HOLD_CAPTURE` is absent from
both the process env and `.claude/settings.local.json` — the false-hold observation window is **not**
running. Independently, nothing in this diff reaches `/api/reason` or the guard channel: PR19 verified
measurement neutrality by reading the import graph rather than trusting the battery pin.

---

## What was built

| Item | State |
|---|---|
| **1 — puzzle-taxonomy stub** | `PuzzleType` + `PuzzleTaxonomyEntry` in `idea-loop-types.ts`. Four scoped members; `origin` a discriminated union. No schema, route, population, or persistence. Both RL-addendum design-grounding quotes carried **verbatim** (PR19 compared character-by-character). The "placeholder for a richer standard" note added to `assessStructuralNovelty` with its behaviour unchanged. |
| **2 — curiosity-trigger stub** | `noteCuriosityTrigger` beside the taxonomy stub (the ruled placement), wired at the confirmation point in `fresh/handler.ts`. Logs, passes through, nothing else. Future function and the Q5 carry-forward recorded on-block. |
| **3 — governance record** | `operations/agent-circles-2026-08/2026-08-19-guide-agent-circle-governance-record.md`. |
| **4 — `taxonomy_question`** | **Code-only constant. No migration. No CHECK widening. No DB change.** Containment pinned executably in both directions. |

---

## The two things worth carrying forward from this session

**1. The Q5 ruling rested on a mechanism fact that was false — and it changed the risk, not the ruling.**
The FOR-RULING document told the mentor `assessStructuralNovelty` was *"committed-but-dark."*
`/api/practice/fresh` has been **live in production since 2026-08-10**. The ruling's direction is
unaffected (its reasoning was that the only live home is server-side — *more* true if the endpoint is
live), but item 2 therefore lands in live code, which is why PR19 was run rather than skipped. Four
files carried the stale "DARK" claim; three were corrected, and PR19 caught the fourth.

**2. `assessStructuralNovelty` returns `novel: true` on three grounds and only one is evidence.**
The other two — a starved window and an axis-free friction candidate — are honest *no-basis* passes.
A trigger firing on them would manufacture curiosity from absence of evidence, which that function's
own docstring exists to refuse. The trigger fires on genuine confirmations only. This is a
**build-time judgement, not a ruling**, labelled as such in the code.

---

## PR19 — independent adversarial review

Six dimensions, **25 agents, 0 errors, ~7.18M tokens**, fully completed (no spend-limit outage).
**18 raised → 5 upheld (1 low, 4 nit), 13 refuted with cited reasoning. Zero critical/high/medium.**
All five folded and mutation-verified. The two most useful:

- §5.5c's design-principle guard read only the **first** `PuzzleTaxonomyEntry` declaration, so
  TypeScript **interface declaration merging** could smuggle in a conclusions field. Now scans all
  declarations — mutation-verified against that exact evasion.
- §9.4's wiring pin was comment-satisfiable and was the sole guard on the ruled placement, and a pure
  pass-through cannot be caught by its output. Replaced with a **behavioural** pin capturing the log
  through the real handler (unwiring now yields `got 0`), plus a comment-stripped structural pin.

**Two of my own errors, both caught and both recorded rather than smoothed over:** my first §7.4 pin
walked `__tests__` and tripped on the sibling batteries' own assertion labels (caught by my control
run); and my first PR19 launch told the mutating agent to restore with `git checkout`, which against
uncommitted work reverts to HEAD and destroys the build (caught on re-reading my own prompt; the run
was stopped, the work backed up, integrity re-verified, and the review relaunched with `cp`-based
restore and the mutating dimension serialised). Nothing was lost. The lesson is in memory.

---

## Verified

| Gate | Before | After |
|---|---|---|
| `idea-loop-types` battery | 20/0 | **55/0** |
| `fresh-handler` battery | 61/0 | **69/0** |
| `watching-handler` battery | 70/0 | **72/0** |
| `tsc --noEmit` | 0 | **0** |
| `npm run build` | ✓ | **✓** (`/api/practice/fresh`, `/api/practice/watching` registered) |

Seven mutations run and reverted, each tripping its intended pin; controls green after every one.

**Founder-performable verification:**
```
cd website
npx tsx src/lib/substrate/__tests__/idea-loop-types.test.ts
npx tsc --noEmit && npm run build
```

**Rollback:** `git revert` the commit. No migration to reverse, no flag to unset, no live op to undo.

---

## Carried

**From this session:**
- **The Q5 carry-forward.** When the standing-runner design opens, trigger placement must be revisited
  **explicitly**, and the mentor's own note is that the honest answer may be **both** — server-side as
  the seam that confirms novelty, runner-side as the mechanism that acts on it. Recorded on-block, in
  the governance record, and in the decision-log entry.
- **`watching/handler.ts:10-14` carries the identical stale "DARK … UNSET everywhere" claim**, both
  halves false, activated by the same 2026-08-10 decision. PR19 refuted attributing it to this build,
  so it was **deliberately left** as out of scope. Named for whoever next opens that file.
- **Line-citation drift this build caused:** the placeholder note moves `assessStructuralNovelty` from
  `idea-loop-types.ts:222` to `:241`, invalidating `:222` citations in
  `D-RL-PASSAGE-ADDENDUM-RECORDED-2026-08-19` and in the addendum record. Both sit in another
  session's uncommitted work; left untouched rather than edited.
- **Item 4's migration remains deferred** to the standing-runner design, with the standing-runner's
  own rationale — not the expired bounded-run one.

**Not this session's, unchanged, and not chased:**
- The founder's two outstanding actions: relaying the **epistemic status framework** (zero repo hits,
  so the GS-ATRF-1 session cannot carry in a framework it cannot read), and deciding whether
  `manifest.md`'s Consciousness and Continuity Obligation should carry a pointer to the addendum.
- The positioning review, GS-ATRF-1, and the hexis open question — all record entries for other
  sessions; untouched.
- From the perimeter session: the empty-subject billed-call defect in the 17 routes; no per-route
  runtime invocation tests for the 3; PR24 retention parity for `agent_hold_observations`; M-4
  obligations 1 and 4; the RLS survey remainder. **M-5 ("nothing happens afterwards") remains P0 and
  is not discharged by anything here.**

**Untouched and confirmed so:** the Q1 hard constraint (the loop proposes; it never executes), the Q11
binding sequence, GS-ATRF-1/2/3, the ATRF, the Consciousness and Continuity Obligation, the surface
name register, the runner agent identity, `/limitations`, the R20a perimeter, auth, and
`manifest.md`. Weights BLOCKED; the P0 0h hold stands; **the 0h call remains the founder's.**
