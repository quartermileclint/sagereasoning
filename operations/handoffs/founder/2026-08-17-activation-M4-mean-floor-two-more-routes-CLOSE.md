# Session Close — 2026-08-17 — R20a gap closure ACTIVATED, two more routes found, M-4 mean-floor

**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md` (cached via `/adopted/standing-protocol-cache.md`).
**Tier:** `code-critical` throughout — R20a perimeter activation (AC5), live public copy (R18), a
grade-engine change. **AC7 engaged and discharged.** PR19 discharged.
**Date:** 2026-08-17 (successor to the same day's R2b session).
**Decision-log entry:** `D-R20A-GAP-CLOSURE-ACTIVATED-LIVE-PLUS-TWO-MORE-ROUTES-M4-MEAN-FLOOR-PR19-FOLDED`.
**Commit:** `2fe6cb7` (10 files, pre-commit hooks passed). **NOT PUSHED — see Founder Verification.**

## What changed in production

**One thing, and it is live: six routes that screened nothing now screen practitioner distress.**
`SUBSTRATE_R20A_GAP_CLOSURE_ENABLED=true` in Vercel Production, founder-set and founder-redeployed.

Everything else in this session either ships on the next push (code + copy, behaviour-neutral until
deployed) or was deliberately withheld.

## Decisions Made

- **Activated** the six-route gap closure; smoked 14 probes both directions, no sampling.
- **Closed two more unprotected routes** PR19 found (`gap4`, `founder-facts`) — plus a third surface
  (`founder-facts` PUT) the builder found while wiring PR19's finding.
- **Applied M-4's mean-floor correction** (obligation 3 of 4).
- **Held M-4's grade-gate retirement** for a new mentor question rather than shipping it.
- **Corrected three live false public claims**; **withheld a fourth** for the mentor.

## Status Changes

| Item | Old | New |
|---|---|---|
| Six-route gap closure | Built dark | **LIVE, smoke-verified** |
| R20a perimeter | 20 route-level + 2 gate | **22 route-level + 2 gate** (8 gap-closure routes) |
| `gap4`, `founder-facts` | Unprotected, unknown | **Wired, registry-registered, mutation-verified** |
| M-4 obligation 3 (mean-floor) | Not started | **DONE** — 15/0, mutation-verified |
| M-4 obligation 2 (retirement) | Not started | **Built → reverted → held for mentor** |
| M-4 obligations 1, 4 | Not started | Unchanged |
| ops-hub ×2, transparency ×2 | Live false claims | **Corrected** (founder-signed wording) |
| `/limitations` disclosure | Signed, unapplied | **Returned to mentor** — signed wording contains a false clause |
| `r20a-invocation-guard` | 186/0 | **206/0**, floors bumped 20→22 and 11→13 |

## The two things withheld, and why

**M-4's grade-gate retirement.** PR19 found, and I confirmed directly against the threshold table,
that excluding the dimension shrinks the shared pool 4 → 3 — which silently tightens
`deliberate_to_principled` from **3-of-4 (75%) to 3-of-3 (100%)**. The mentor ruled on the top rung
only. My own comment saying "lower rungs are unaffected" was false. Compensating it means retuning a
threshold, which is the category the mentor named as dishonest — just on a rung they were not asked
about. Reverted to HEAD (zero diff verified), work preserved in scratchpad. **Nothing was pushed, so
there is nothing to unwind.**

**The `/limitations` crisis disclosure.** R18 re-derivation found the founder-signed Option A says a
crisis redirect happens "automatically, **every time**". It does not — six practice routes sit outside
the perimeter by recorded precedent, including the grief-facing `/view-from-above`. Publishing it
would put a new false claim on the honesty page. Brief authored (PR20-compliant), bundling the two
adjacent perimeter questions so they do not return separately.

## Three PRE-EXISTING defects the smoke surfaced — none caused by this work

1. **`mentor_profiles` decrypt failure** — the founder's single profile row cannot be decrypted by the
   deployed key. 7 `loadMentorProfile` call sites affected: two hard-500, **`practitioner-context`
   catches and degrades silently** (the private mentor may be reasoning without the profile context it
   believes it has), five unverified. Attribution proven (81 insertions / 0 deletions; the failing
   frame is unreachable from the distress block). **Recoverability not investigated** — if the prior
   key is gone, that row's contents are gone with it.
2. **`/api/skill/sage-classify`** — `"Classification engine returned invalid response"` on the
   default-categories path. Distinct from both the decrypt failure and the credit exhaustion.
3. **Anthropic credit exhaustion** mid-session — which also left parts of this session's **own Gate-2
   harness unframed**. Credits topped up; worth knowing the harness was intermittently blind.

## Verification

`tsc` **0** — caught a real bad import in the new battery that `tsx` hid at runtime ·
`npm run build` **exit 0**, both new routes registered ·
`r20a-invocation-guard` **206/0** · `disposition-stability-mean-floor` **15/0** · `r20a-gate` 33/0 ·
both new routes and both new batteries **independently mutation-verified**, tree byte-clean after each.

**PR19:** 7 dimensions, 8 agents, 0 errors, ~2.25M subagent tokens. 13 findings — 8 CONFIRMED, 4
plausible, 1 likely-false-positive. Two cross-dimension convergences (genuine independence signal).
Every CONFIRMED finding re-verified first-hand before action.

## Blocked On

**Committed but NOT pushed:** `2fe6cb7`.
**Deliberately uncommitted:** `website/src/data/environmental-context.json` (pre-existing stale scan).

## Next Session Should

Take the two mentor questions (the `deliberate_to_principled` tightening; the `/limitations` wording)
if answers have returned, then **build the exhaustiveness backstop** — the count has now moved four
times (2→4→6→8) and nothing structural prevents a ninth. Then M-4 obligations 1 and 4.

## Founder Verification

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git log --oneline -1        # expect 2fe6cb7
git status --short          # expect only environmental-context.json modified
```

Then push via GitHub Desktop. **Vercel WILL rebuild** (route + page files). The flag is already live,
so **routes 7 and 8 become protected the moment this deploys** — that is the intended effect, and it
is the one behaviour change the push carries.

## Cross-references

- `D-R20A-GAP-CLOSURE-ACTIVATED-LIVE-PLUS-TWO-MORE-ROUTES-M4-MEAN-FLOOR-PR19-FOLDED`
- `operations/trust-layer-2026-07/2026-08-17-limitations-crisis-disclosure-FOR-RULING.md`
- `operations/trust-layer-2026-07/2026-08-17-public-honesty-batch-signoff-package.md`
- `operations/handoffs/founder/2026-08-17-R2b-successor-M4-returned-M5-scoped-CLOSE.md` (predecessor)

*End of close. Six routes stopped being blind to distress, two more were found and closed behind them,
and the two things that could not be made honest today were returned rather than shipped.*
