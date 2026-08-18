# Session Close — 2026-08-18 — R20a Perimeter Completion (sweep GREEN, PR19 folded)

**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md` (cached via `/adopted/standing-protocol-cache.md`).
**Tier:** `code-critical` — Critical risk (R20a perimeter, AC5).
**Date:** 2026-08-18.
**Predecessor:** `2026-08-18-perimeter-completion-CONTINUATION-PROMPT.md`
(decision `D-R20A-EXHAUSTIVENESS-SWEEP-BUILT-PRACTICE-FAMILY-WIRED-EVALUATE-GATED`).

---

## What this session was for

The predecessor left the perimeter **partially closed and the battery deliberately RED** (20
unclassified routes), with registration batched behind the floor bump. This session closed it,
and — critically — **ran the PR19 review the predecessor explicitly recorded as NOT yet run**, so
this work is now verified to the project's standard where the predecessor's was not.

## Decisions Made

- `D-R20A-PERIMETER-COMPLETION-SWEEP-GREEN-PR19-FOLDED` appended (+~125 lines).

## Status Changes

| Item | Old | New |
|---|---|---|
| R20a route-level perimeter | 22 registered | **42 registered** |
| R20a substrate-gate perimeter | 2 | 2 (unchanged) |
| Flag-gated route-level pairs | 13 | **30** |
| Perimeter exclusions | 25 | **29** |
| Exhaustiveness sweep | RED — 20 unclassified | **GREEN — 0 unclassified** |
| `mentor-appendix` / `mentor-profile` / `founder/hub` | Unwired | Wired (Verified, dark) |
| PR19 on the perimeter work | Not run | **Run — 9/9 CONFIRMED, folded** |
| Sweep walk | route.ts only (blind to handler.ts) | route.ts **+ sibling handler.ts** |

## The three real defects PR19 found, and what changed

1. **HIGH — handler.ts blind spot.** The sweep read only `route.ts`; six live routes put
   `await request.json()` in a sibling `handler.ts`, so they were silently out of scope with the
   battery green. Fixed at the walk; 4 routes became newly visible and each was read and excluded
   with reasons.
2. **MEDIUM — `collectMentorProfileText`** omitted `persisting_passions`,
   `preferred_indifferents`, `current_prescription.rationale`. Fixed, runtime-verified.
3. **MEDIUM — billed Haiku call on an empty subject** (`{}` body). `hasScreenableSubject` added.

## The most important thing in this close

**A mutation test passed while the fix under test was undone.** Reverting the handler.ts fix dropped
in-scope 73 → 69, still above the `>= 65` floor, so the battery stayed green. A floor sized to catch
a catastrophic collapse cannot catch a narrow four-route regression.

A **positive pin** now names those four routes and asserts each is detected in scope; re-mutating
goes RED on all four. **This retires the earlier floor-raising judgement** (40 → 60, which the prior
close flagged for outside scrutiny): the floor was the wrong instrument, the pin does the real work,
and the floor now sits at 65 deliberately un-pinned to any last-measured value — because the "true"
in-scope figure moved twice inside a single session (48 → 69 → 73).

## Verification

```
cd website
npx tsc --noEmit                                            # exit 0
npm run build                                               # exit 0
npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts      # 689 passed, 0 failed
```
Sweep counts, re-derived by instrumenting the real file (not transcribed):
**124** route.ts walked · **73** in scope · **44** registered (42+2) · **29** excluded ·
44+29=73, **zero unclassified**.

Boundary suites all green: hupexairesis 697 · impulse 260 · morning 635 · oikeiosis 754 ·
passion-log 1041 · practice-status 626 · premeditatio 712 · sage-compass 789 · view-from-above 697.
Sibling R20a suites: r20a-gate 33/33 · score-conversation 57/57 · impulse 55/55.

Six mutations run, tree byte-restored after each.

## Blocked On

**Files committed this session (5):**
- `website/src/app/api/mentor-appendix/route.ts`
- `website/src/app/api/mentor-profile/route.ts`
- `website/src/app/api/founder/hub/route.ts`
- `website/src/lib/r20a-gap-closure.ts`
- `website/src/lib/__tests__/r20a-invocation-guard.test.ts`
- plus `operations/decision-log.md` and this close.

**Deliberately NOT committed:** `website/src/data/environmental-context.json` (pre-existing stale
weekly-scan diff, dirty at session open, unrelated to this work — PR19 independently flagged it as
diff-hygiene). All other untracked files predate this session.

**Production state at session close:** **unchanged.** No Vercel, Supabase, flag, credential, schema
or deploy operation was performed; AC7 not engaged. `SUBSTRATE_R20A_GAP_CLOSURE_ENABLED` was
**already live before this session**, so on the founder's push the newly wired routes begin
screening. That is real protection — and it is **not** the same claim as the perimeter being
confirmed live.

## Open Questions / Carried

- **The empty-subject billed-call defect is present in the 17 routes wired in the PRIOR session.**
  Not touched here (files this session did not build). Recorded in-code at `hasScreenableSubject`.
- **No per-route runtime invocation tests** for the 3 routes wired here — the registry check is
  source-text only and cannot catch a check made unreachable by control flow.
- `mentor-appendix`'s `refinement: {}` ordering bypass — founder elected screen-only; the safety half
  is closed, the integrity hole stands.
- `/api/guardrail` perimeter membership — deferred founder election (2026-06-19).
- M-4 obligations 1 and 4.

## `/limitations` — still gated

**Unchanged, deliberately.** The mentor's ruled prerequisite (a filesystem sweep producing a
definitive count) is now **discharged** — the sweep is green and re-run on the corrected predicate,
"to confirm no eighth surface exists on the same terms." But the ruling also requires the perimeter
change be **confirmed LIVE** before publication, and this session built rather than activated.
Publication remains blocked on that step.

## Next Session Should

**HELD at the founder's direction** — the founder has mentor-relayed information from an exploratory
session to introduce before the successor prompt is authored. No next-session prompt written.

## Cross-references

- `operations/handoffs/founder/2026-08-18-perimeter-completion-CONTINUATION-PROMPT.md`
- `operations/trust-layer-2026-07/2026-08-17-mentor-ruling-limitations-perimeter-practice-family-verbatim.md`
- `operations/trust-layer-2026-07/2026-08-18-mentor-ruling-unauthenticated-public-surface-verbatim.md`
- `operations/decision-log.md` — `D-R20A-PERIMETER-COMPLETION-SWEEP-GREEN-PR19-FOLDED`

*End of session close. The perimeter is closed and the sweep is green; the claim it licenses is
"verifiably complete", not "live" — and `/limitations` stays unchanged until it is.*
