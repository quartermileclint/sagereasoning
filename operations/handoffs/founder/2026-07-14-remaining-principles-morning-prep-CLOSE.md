# Session Close — 2026-07-14 — Remaining Principles: the morning-preparation tool (#8)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (opened under `STANDING-SESSION-OPENER-grounded-foundations.md`).
**Tier:** `code-elevated` + `schema` — **Elevated** risk overall, with **one Critical-classified edit** (the `/api/user/delete` data-rights addition, 0d-ii). **AC7/PR17 engage** at the migration + the delete edit + the deploy.
**Date:** 2026-07-14.
**Governing plan:** `operations/trust-layer-2026-07/2026-07-13-remaining-stoic-principles-build-plan.md` §3(#8)/§4/§5/§8 · **binding verdict:** mentor **D6** (`…decision-points-verdict-verbatim.md`).

## What was built (repo-only; nothing deployed by the AI)

A net-new, boundary-verified human-practitioner tool to ship **during** the false-hold observation window (mentor D6). It is **measurement-neutral** — the git-guard confirms NONE of the change touches the `/api/reason` import graph or the frozen capture set (confirmed by the adversarial review *and* first-hand), so the 7-day assessment is undisturbed.

**#8 morning-preparation:** a net-new `/morning` tool ("Morning Preparation") + `/api/mentor/morning`, modelled on the just-shipped `/view-from-above` template. The **morning pole** of the daily practice — the Stoic orientation of the ruling faculty (*hegemonikon*) **before** the day's impressions arrive (Marcus's morning preparation), distinct from the premeditatio of specific adversities and from the evening review. The **mentor-verbatim three questions**, each a required field, the three answers together being the daily orientation record (the row): (1) the roles active today + the kathekonta they generate; (2) the impressions likely to arrive + which risk hasty assent; (3) the virtue response to have prepared. Shorter than the full reflect sequence. New `morning_preparation_entries` table wired into data-rights (access/export/delete, missing-table-benign); linked from `/welcome`. **The evening-reference is page prose only** — no `sage-reflect` coupling (the #8-specific trap).

## Decisions Made
- **D-REMAINING-PRINCIPLES-MORNING-PREP-8-BUILT-REVIEW-CLEAN** appended. Built, adversarially reviewed (0 findings raised, 0 confirmed; non-vacuity verified), boundary-verified **before** shipping.
- **Design decisions (decided at open, within scope; prompt left them to the session):** route/table name = **`/morning`** (the prompt's recommended clean name); a **quality gate IS warranted** for this declarative tool (not cargo-culted — the mentor's whole point is *concrete* orientation, and the evening pole assesses whether a concrete intention held), realised as a **light, classification-only** `prepared`/`vague` gate on the prepared virtue response (premeditatio's concrete-vs-generic precedent, view-from-above's deterministic-message + revise-in-place style, fail-open, `MODEL_FAST`); **no `sage-reflect` import** (the evening pairing is conceptual prose only); R20a = **proceed matching precedent**, log the perimeter question standing (*less* sharp than view-from-above — forward-looking, not grief-facing).

## Status Changes
| Item | Old | New |
|---|---|---|
| #8 morning-preparation tool | Scoped | Verified (repo); Live-carried (founder deploy) |
| `morning_preparation_entries` data-rights coverage | — | Wired (additive, missing-table-benign) |
| Daily-practice cycle (morning + evening poles) | evening-only | complete end-to-end in the instrument (on deploy) |

## Verification (all green)
- Boundary test (route + page + layout; forbidden list incl. `sage-reflect`): **368/0**.
- `tsc --noEmit` **0**; `npm run build` **✓** (`ƒ /api/mentor/morning`, `○ /morning` registered).
- Byte-identity git-guard: **NONE** of the change is in the `/api/reason` graph or the frozen capture set (confirmed first-hand: the 4 edited files are not imported by `/api/reason`; the new route/page import only the safe shared libs).
- Migration ↔ route parity: the column set + the `('prepared','vague')` CHECK exactly match what the route writes. Delete-route FK-independence confirmed (only an `auth.users` FK → safe in the FK-independent `tablesToDelete` group).
- Adversarial review Workflow `wf_b16c25d3-263` (7 agents, 0 errors, ~1.53M tokens, 53 tool-uses; 7 dimensions, find → adversarially-verify each): **0 findings raised, 0 confirmed.** Non-vacuity verified from the journal + agent transcripts — every finder read the real files; the measurement-neutrality finder traced the transitive `sage-reason-engine → reasoning-receipt → stoic-brain` chain and independently judged the read-only 2nd-hop import **not a defect** (matching the first-hand adjudication + the shipped `/view-from-above` + `/premeditatio` siblings).

---

## Founder-walked deploy runbook (PR17/AC7 — you perform every live step; the AI performs none)

**The order is load-bearing: migration BEFORE code.** The new route reads/writes `morning_preparation_entries` on every request — deploying the code before the migration would 400 every insert (the build-dark-migrate-later-breaks-writes class).

### Pre-flight (already done this session, re-runnable)
```
cd website
node_modules/.bin/tsx src/app/api/mentor/morning/__tests__/human-practitioner-boundary.test.ts   # expect 368/0
node_modules/.bin/tsc --noEmit -p tsconfig.json                                                   # expect exit 0
npm run build                                                                                      # expect ✓ Compiled (ƒ /api/mentor/morning, ○ /morning)
git status --short | grep -iE "api/reason|translation-sandwich|/substrate/|trust-core|kathekon-engagement|false-hold|harness/gate1" || echo NONE
```

### Deploy
1. **Migration first.** In the Supabase SQL Editor, run `website/supabase-morning-preparation-migration.sql` on **TEST**, then the §VERIFY block (expect the 7 columns — id, user_id, roles_active, expected_impressions, prepared_virtue_response, preparation_quality, created_at — RLS true, the 5 policies, and the `preparation_quality` CHECK constraint). Then repeat on **Production**.
   - *The data-rights edits are missing-table-benign*, so they are safe to deploy before this migration; but running it first is cleanest.
2. **Then push the code** (see Founder Verification below) and confirm Vercel green.
3. **Live smoke:** open `/morning` while signed in → fill the three questions → submit → confirm it saves and appears in the feed. Try a deliberately generic prepared response ("be virtuous today") → confirm it flags "A general aspiration, not yet anchored" with a **Revise** button, and that Revise updates the same row (no duplicate). Confirm the `/welcome` link resolves.

### Post-deploy byte-identity confirmation (measurement-neutrality gate, §5)
The source-level proof is already in hand (git-guard NONE + boundary test + first-hand + review). Belt-and-braces: confirm the deployed `/api/reason` behaviour is unchanged (a benign consult returns the same shape) and that `GATE1_FALSE_HOLD_CAPTURE` capture is still writing — the window is undisturbed.

---

## Blocked On
**Files remaining uncommitted (this session's work):**
- `website/supabase-morning-preparation-migration.sql`
- `website/src/app/api/mentor/morning/` (route + `__tests__`), `website/src/app/morning/` (page + layout)
- `website/src/lib/user-data-gathering.ts`, `website/src/app/api/user/export/route.ts`, `website/src/app/api/user/delete/route.ts`, `website/src/app/welcome/page.tsx`
- `operations/decision-log.md`, `CLAUDE.md` (Live-list refresh + this session's dated block), this close.
- **Exclude from the commit:** `website/src/data/environmental-context.json` (pre-existing session-start modification — the weekly environmental scan; stage separately) and the other pre-existing `M`/`??` tree entries (`.claude/settings.local.json.bak`, the 07-12/07-13 handoff prompts, the inbox RTF, the STANDING opener, the view-from-above NEXT-SESSION-PROMPT) — none are this session's build.

**Production state at session close:** byte-equivalent to session open. No migration applied, no deploy, no flag/credential change performed by the AI. The observation window + `SUBSTRATE_TRUST_CORE_ENABLED` (MEASURE) + the S11 enforce posture (DEFERRED) are untouched.

## Open Questions
- **R20a perimeter (founder call — *less* sharp than for view-from-above).** The `/api/mentor/*` practitioner tools sit **outside** the distress perimeter by existing precedent (premeditatio/oikeiosis/passion-log/hupexairesis/view-from-above). This tool is forward-looking daily orientation (not grief-facing), so the standing "should the family join the perimeter?" question is *less* pressing here — the R20a §4 `SupportFooter` renders on the page as the visible crisis exit, and adding the substrate R20a gate would breach the plan's `@/lib/substrate/*` boundary + perturb the window. It remains a deliberate, perimeter-wide **Critical/AC5** decision, not a same-session add. Logged for a future call.

## Next Session Should
The next **window-safe** tool at your tempo (mentor: build as capacity allows, batch deploys, hold the window clean) — **#6/#15 oikeiosis circle-extension + cosmopolitan check** (enhance the live `/oikeiosis`), **#14 sage-compass** (net-new), or **#12 logos teaching module** (net-new static page; read-only `stoic-brain.ts` import only). Separately, before the return-with-record session: the **D2 justice-arm narrowing** (`code-elevated`, report-side). The agent halves of #7/#10 + the kathekon pair (#4/#11) wait for the S11 flip.

## Founder Verification (commit — one standalone PR)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# The morning-preparation tool (+ its data-rights coverage + welcome link)
git add website/supabase-morning-preparation-migration.sql \
        website/src/app/api/mentor/morning/ \
        website/src/app/morning/ \
        website/src/lib/user-data-gathering.ts \
        website/src/app/api/user/export/route.ts \
        website/src/app/api/user/delete/route.ts \
        website/src/app/welcome/page.tsx
git commit -m "#8: morning-preparation tool (three-question daily orientation, concreteness gate, revise-in-place) + data-rights coverage + welcome link, boundary-verified"

# Records
git add operations/decision-log.md CLAUDE.md operations/handoffs/founder/2026-07-14-remaining-principles-morning-prep-CLOSE.md
git commit -m "records: D-REMAINING-PRINCIPLES-MORNING-PREP-8-BUILT-REVIEW-CLEAN + close + CLAUDE.md refresh"
```
Stage the paths **explicitly** (as above) — do **not** `git add .` (it would sweep the unrelated `environmental-context.json` weekly-scan change into the build commit). Then push via GitHub Desktop. **Apply the migration BEFORE the deploy takes live traffic** (see the runbook above). Vercel: the human page/route + additive data-rights coverage go live on push; `/api/reason` is byte-identical.

## Cross-references
- `operations/trust-layer-2026-07/2026-07-13-remaining-stoic-principles-build-plan.md` (§3/§4/§5/§8)
- `operations/trust-layer-2026-07/2026-07-13-mentor-consultation-remaining-principles-decision-points-verdict-verbatim.md` (D6)
- `inbox/Mentor answer to remaining principles question.rtf` (§8 the evening→morning examination — the design source)
- `operations/handoffs/founder/2026-07-14-remaining-principles-morning-prep-NEXT-SESSION-PROMPT.md` (this session's prompt)
- `operations/handoffs/founder/2026-07-14-remaining-principles-view-from-above-CLOSE.md` (the prior sibling build)
- Decision-log entry `D-REMAINING-PRINCIPLES-MORNING-PREP-8-BUILT-REVIEW-CLEAN`

*End of close. One measurement-neutral human tool built, verified, and boundary-proven before shipping; the window stays clean; the daily-practice cycle is complete — morning and evening poles.*
