# Session Close — 2026-07-13 — Remaining Principles: the first generative build (#7-human premeditatio + #10-human reserve-clause)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (opened under `STANDING-SESSION-OPENER-grounded-foundations.md`).
**Tier:** `code-elevated` + `schema` — **Elevated** risk overall, with **one Critical-classified edit** (the `/api/user/delete` data-rights addition, 0d-ii). **AC7/PR17 engage** at the two migrations + the delete edit + the deploy.
**Date:** 2026-07-13.
**Governing plan:** `operations/trust-layer-2026-07/2026-07-13-remaining-stoic-principles-build-plan.md` §3/§4/§5/§8 · **binding verdict:** mentor **D6** (`…decision-points-verdict-verbatim.md`).

## What was built (repo-only; nothing deployed by the AI)

Two standalone, boundary-verified human-practitioner PRs to ship **during** the false-hold observation window (mentor D6). Both are **measurement-neutral** — the git-guard confirms NONE of the change touches the `/api/reason` import graph or the frozen capture set, so the 7-day assessment is undisturbed.

**PR 1 — #7-human (premeditatio "Prepare a disposition"):** extends the LIVE `/premeditatio` page + `/api/mentor/premeditatio` with a second exercise mode alongside the weekly reflection — name a future adversity → the control filter (what *is* / *is not* up to me) → the virtue it calls for + how to embody it → a prepared-disposition record ("not a plan; a disposition"). Additive nullable columns on `premeditatio_entries`; the weekly path is behaviourally preserved.

**PR 2 — #10-human (the reserve clause):** a net-new `/hupexairesis` tool ("The Reserve Clause") + `/api/mentor/hupexairesis` — a single structured prompt: *"What is the outcome you are pursuing, and what is your prepared response if that outcome does not occur?"* New `reserve_clause_entries` table; the new PII table is wired into data-rights (access/export/delete, missing-table-benign); linked from `/welcome`.

## Decisions Made
- **D-REMAINING-PRINCIPLES-HUMAN-HALVES-7-10-BUILT-REVIEW-FOLDED** appended. Both human halves built, adversarially reviewed (1 finding raised, 0 confirmed, 1 refuted-then-folded), boundary-verified before shipping.
- Design fork (AskUserQuestion at open): PR 2 = **net-new standalone page** (no human decision/assent flow exists to host it; the standalone family pattern is the cleanest boundary).

## Status Changes
| Item | Old | New |
|---|---|---|
| #7-human premeditatio enhancement | Scoped | Verified (repo); Live-carried (founder deploy) |
| #10-human reserve-clause tool | Scoped | Verified (repo); Live-carried (founder deploy) |
| `reserve_clause_entries` data-rights coverage | — | Wired (additive, missing-table-benign) |

## Verification (all green)
- Boundary tests: `premeditatio` **353/0**, `hupexairesis` **368/0** (guards route + page + layout).
- `tsc --noEmit` **0**; `npm run build` **✓ Compiled** (`ƒ /api/mentor/hupexairesis`, `○ /hupexairesis` registered).
- Byte-identity git-guard: **NONE** of the change is in the `/api/reason` graph or the frozen capture set.
- Adversarial review Workflow `wf_2072486e-fd6` (7 agents, 0 errors, ~1.51M tokens): 1 finding, 0 confirmed, 1 refuted (folded anyway).

---

## Founder-walked deploy runbook (PR17/AC7 — you perform every live step; the AI performs none)

**The order is load-bearing: migration BEFORE code, per PR.** The new premeditatio route writes `entry_kind` (+ the new columns) on *every* insert — deploying the code before the migration would 400 every live premeditatio insert (the build-dark-migrate-later-breaks-writes class, in reverse).

### Pre-flight (already done this session, re-runnable)
```
cd website
node_modules/.bin/tsx src/app/api/mentor/premeditatio/__tests__/human-practitioner-boundary.test.ts   # expect 353/0
node_modules/.bin/tsx src/app/api/mentor/hupexairesis/__tests__/human-practitioner-boundary.test.ts    # expect 368/0
node_modules/.bin/tsc --noEmit -p tsconfig.json                                                        # expect exit 0
npm run build                                                                                          # expect ✓ Compiled
```

### PR 1 — premeditatio
1. **Migration first.** In the Supabase SQL Editor, run `website/supabase-premeditatio-prepared-disposition-migration.sql` on **TEST**, then the §VERIFY block (expect the 6 new columns nullable + `false_impression`/`correct_judgement` now nullable + both CHECK constraints). Then repeat on **Production**.
   - *Safe between migration and code deploy:* the OLD live route never writes `entry_kind` and the new columns are nullable, so the currently-deployed premeditatio route keeps working.
2. **Then push the code** (see Founder Verification below) and confirm Vercel green.
3. **Live smoke:** open `/premeditatio` while signed in → toggle "Prepare a disposition" → submit → confirm it saves and appears in the feed; submit a weekly reflection → confirm the existing path still works.

### PR 2 — reserve clause
1. **Migration first.** Run `website/supabase-reserve-clause-migration.sql` on **TEST**, then §VERIFY (7 columns, RLS true, 5 policies), then **Production**.
   - *The data-rights edits are missing-table-benign*, so they are safe to deploy before this migration; but running it first is cleanest.
2. **Then push the code** and confirm Vercel green.
3. **Live smoke:** open `/hupexairesis` → submit a reserve clause → confirm it saves and appears; confirm the `/welcome` link resolves.

### Post-deploy byte-identity confirmation (measurement-neutrality gate, §5)
The source-level proof is already in hand (git-guard NONE + boundary tests). If you want the belt-and-braces bundle check: confirm the deployed `/api/reason` behaviour is unchanged (a benign consult returns the same shape) and that `GATE1_FALSE_HOLD_CAPTURE` capture is still writing — the window is undisturbed.

---

## Blocked On
**Files remaining uncommitted (this session's work):**
- `website/supabase-premeditatio-prepared-disposition-migration.sql`, `website/supabase-reserve-clause-migration.sql`
- `website/src/app/api/mentor/premeditatio/route.ts`, `website/src/app/premeditatio/page.tsx`, `website/src/app/api/mentor/premeditatio/__tests__/human-practitioner-boundary.test.ts`
- `website/src/app/api/mentor/hupexairesis/` (route + `__tests__`), `website/src/app/hupexairesis/` (page + layout)
- `website/src/lib/user-data-gathering.ts`, `website/src/app/api/user/export/route.ts`, `website/src/app/api/user/delete/route.ts`, `website/src/app/welcome/page.tsx`
- `operations/decision-log.md`, this close.
- **Exclude from the commit:** `website/src/data/environmental-context.json` (pre-existing session-start modification, not this session's).

**Production state at session close:** byte-equivalent to session open. No migration applied, no deploy, no flag/credential change performed by the AI. The observation window + `SUBSTRATE_TRUST_CORE_ENABLED` (MEASURE) + the S11 enforce posture (DEFERRED) are untouched.

## Open Questions
- **R20a perimeter (founder call).** The `/api/mentor/*` practitioner tools sit **outside** the distress perimeter by existing precedent (premeditatio/oikeiosis/passion-log). The new reserve-clause tool matches that precedent. Whether the family should join the perimeter is a separate decision: it would be **Critical/AC5**, and importing the substrate R20a gate would itself breach the plan's `@/lib/substrate/*` boundary — so it is a deliberate perimeter-wide choice, not a same-session add.

## Next Session Should
The next **window-safe** tool at your tempo (mentor: build as capacity allows, batch deploys, hold the window clean) — **#9 view-from-above + #13 fate-acceptance** (net-new Zone-2 calibration), or **#8 morning-prep**, or **#6/#15 oikeiosis circle-extension**. Separately, before the return-with-record session: the **D2 justice-arm narrowing** (`code-elevated`, report-side). The agent halves of #7/#10 wait for the flip.

## Founder Verification (commit — two standalone PRs)
Commit each PR separately so they revert independently (they share no runtime imports):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# PR 1 — #7-human premeditatio enhancement
git add website/supabase-premeditatio-prepared-disposition-migration.sql \
        website/src/app/api/mentor/premeditatio/route.ts \
        website/src/app/premeditatio/page.tsx \
        website/src/app/api/mentor/premeditatio/__tests__/human-practitioner-boundary.test.ts
git commit -m "#7-human: premeditatio 'prepare a disposition' exercise (control filter + virtue + prepared disposition), boundary-verified"

# PR 2 — #10-human reserve-clause tool (+ its data-rights coverage + welcome link)
git add website/supabase-reserve-clause-migration.sql \
        website/src/app/api/mentor/hupexairesis/ \
        website/src/app/hupexairesis/ \
        website/src/lib/user-data-gathering.ts \
        website/src/app/api/user/export/route.ts \
        website/src/app/api/user/delete/route.ts \
        website/src/app/welcome/page.tsx
git commit -m "#10-human: reserve-clause (hupexairesis) tool + missing-table-benign data-rights coverage + welcome link, boundary-verified"

# Records
git add operations/decision-log.md operations/handoffs/founder/2026-07-13-remaining-principles-human-halves-CLOSE.md
git commit -m "records: D-REMAINING-PRINCIPLES-HUMAN-HALVES-7-10-BUILT-REVIEW-FOLDED + close"
```
Then push via GitHub Desktop. **Apply the migrations BEFORE the deploy takes live traffic** (see the runbook above). Vercel: the human pages/routes + additive data-rights coverage go live on push; `/api/reason` is byte-identical.

## Cross-references
- `operations/trust-layer-2026-07/2026-07-13-remaining-stoic-principles-build-plan.md` (§3/§4/§5/§8)
- `operations/trust-layer-2026-07/2026-07-13-mentor-consultation-remaining-principles-decision-points-verdict-verbatim.md` (D6)
- `operations/handoffs/founder/2026-07-13-remaining-principles-FIRST-BUILD-NEXT-SESSION-PROMPT.md` (this session's prompt)
- Decision-log entry `D-REMAINING-PRINCIPLES-HUMAN-HALVES-7-10-BUILT-REVIEW-FOLDED`

*End of close. Two measurement-neutral human tools built and verified; the window stays clean; the founder-walked deploy carries.*
