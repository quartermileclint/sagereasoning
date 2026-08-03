# Session Close — 2026-08-03 — Stoa ST6: the optional draft mirror reading (Q12's one exception)

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md; the Stoa build plan §3 ST6 (`operations/connective-layer-2026-08/2026-08-02-stoa-build-plan.md`); the mentor consultation verbatim Q12 (`operations/connective-layer-2026-08/2026-08-02-mentor-consultation-connective-layer-verbatim.md`).
**Tier:** `code-elevated` (dark throughout — both `SUBSTRATE_STOA_ENABLED` and the new `SUBSTRATE_STOA_DRAFT_REFLECT_ENABLED` required; the second is UNSET everywhere, so production is byte-equivalent on push). **Date:** 2026-08-03. **Model:** Sonnet 5 (`claude-sonnet-5`).
**Honesty notes:** the Gate-1/Gate-2 hooks ran intermittently framed this session — several at-action consults timed out fail-open-honest (the known transient class), several genuine frames landed and were engaged, including multiple open-loop re-examinations on mid-session edits that closed cleanly on re-examination at the same depth.

## What happened

Q12 is the one deliberate exception to "the connective layer stays entirely plain": at the declarer's own request, before publishing, the platform's examination instrument may read a **draft** declaration and reflect it back — never a verdict, never a grade, on the mirror register only. This session built that exception as its own route, `POST /api/mentor/stoa/draft-reflect`, dark behind a dedicated sub-flag AND'd with the base Stoa flag.

Three design forks were settled with the founder at open (all recommended defaults): **no persistence** (the reflection exists only in the HTTP response), **human-only** (no agent equivalent — Q12's "the declarer decides" framing doesn't extend to the credential-authenticated agent surface), and a **dedicated sub-flag** (rather than riding the already-live base flag, since this is a new LLM-cost surface worth rolling out on its own schedule).

The route runs the identical AC5-mandated R20a distress check the twelfth route (`/api/mentor/stoa`) already carries — reused via the same `stoa-r20a.ts` helpers, never re-implemented — before the mirror-reading LLM call ever fires. This makes it the **thirteenth route-level member** of the R20a perimeter. The mirror reading itself is one bounded Sonnet (`MODEL_DEEP`) call under a system prompt that explicitly forbids score/grade/rank/verdict vocabulary, and it fails **honest** on outage (a 502, never a fabricated reflection) — deliberately not fail-open, since there is no safe substitute for a self-examination the declarer explicitly asked for.

**PR19 (an independent adversarial review by a fresh agent with no prior involvement):** no CRITICAL/HIGH. Two MEDIUM + one LOW-MEDIUM finding, all folded — the module's header overstated its "no persistence" claim (a disclosed, content-free `route_errors` audit-log write happens on LLM outage via the site-wide `logRouteError` convention; verified by a second independent check that the row never carries draft text, only corrected the header's wording); MR-1's forbidden-vocabulary check on the response shape was narrower than MR-2's check on the system prompt (widened to match); MR-6 (outage-fails-honest) was a whole-file substring check satisfiable by an unrelated branch (rescoped to the catch block specifically). Full disposition: `D-STOA-ST6-DRAFT-MIRROR-READING-BUILT-DARK-2026-08-03`.

## Decisions Made
- `D-STOA-ST6-DRAFT-MIRROR-READING-BUILT-DARK-2026-08-03` appended (all three elections + the full PR19 disposition).

## Status Changes
| Item | Old | New |
|---|---|---|
| ST6 (draft mirror reading) | Scoped | **Verified (build-level; new test 56/0 · guard registry 115/0 · sibling regression 42/0 unchanged · tsc 0 · build ✓ · PR19 folded) — dark, activation not scoped this session** |
| R20a perimeter | 12 route-level + 2 substrate-gate = 14 | **13 route-level + 2 substrate-gate = 15** |
| Stoa plan §3 | ST1–ST5 done, ST6 scoped | **ST1–ST6 all done; ST7 remains deferred/unscoped** |

## Verification Method Used
The new per-route test extends the twelfth route's INV/FT/RH structure with two new categories built specifically for this route's constraints: NP-* (no-persistence — comment-stripped source greps for forbidden DB-client tokens across both new files) and MR-* (mirror-register — the system prompt's forbidden vocabulary, the response shape's field names, the engine-boundary discipline against the full evaluative pipeline, and the outage-fails-honest guarantee). All three PR19 folds were verified non-vacuous before landing: the persistence-exception claim was independently re-checked against the actual `logRouteError`→`recordRouteError` source (not just re-asserted); MR-1's widened word list was checked against route.ts's actual body for false positives before landing; MR-6's rescoped catch-block check was confirmed to still pass against the real (honest) catch block and would fail against a hypothetical fabricated one.

## Risk Classification Record
Elevated per 0d-ii; the R20a perimeter addition is **Critical per 0d-ii (AC5)** — 0c-ii addressed (what changes, what could break, existing sessions unaffected, rollback, verification — see the decision-log entry). AC7 NOT engaged: no flag set, no schema, no mint, no deploy this session. Rollback: `git revert` the session commit — every new file is additive, the new flag is unchanged (unset), nothing else in the Stoa or elsewhere is touched.

## Blocked On
**Production state at session close (PR18, as of 2026-08-03):** production is byte-equivalent on push — the new route registers but 503s before any work (either flag being unset is a structural early-return; neither flag is set anywhere). No flag, schema, credential, or deploy action was taken this session.

**Files remaining uncommitted (this session's — stage ONLY these; the tree carries other sessions' strays, untouched):** see the Founder Verification block.

## Open Questions
None new. The three ST5-carried disclosed limitations (the row-level reactivation guard, the q-filter pagination bound, the anonymous-sign-ins-OFF check) are untouched by this session — the founder declined to bundle them in at open, and they weren't raised again.

## Next Session Should
This closes the last **scoped** Stoa BUILD item (§3 ST1–ST6 all done). Two paths forward, neither urgent: (1) activate `SUBSTRATE_STOA_DRAFT_REFLECT_ENABLED` whenever the founder wants the draft mirror reading reachable — `operations/handoffs/founder/2026-08-03-stoa-ST6-activation-NEXT-SESSION-PROMPT.md` (a small founder-walked `code-critical` 0c-ii, much lighter than ST5's full activation walk); (2) open one of ST7's four deliberately deferred threads (subscriptions, blocked on the email/Resend decision; the Q5c/Q13a trust-event machinery, its own future `code-critical` session(s); the map-into-Stoa fold election; nav+glossary placement) whenever it matters next — none scoped, all founder-sequenced.

## Founder Verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx src/app/api/mentor/stoa/draft-reflect/__tests__/r20a-invocation.test.ts
npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts
npx tsx src/app/api/mentor/stoa/__tests__/r20a-invocation.test.ts
npx tsc --noEmit && npm run build
```
Expected: 56/0 · 115/0 · 42/0 · tsc silent · ✓ Compiled successfully.

**Files to stage (this session only):**
```
git add website/src/lib/stoa/stoa-draft-reflect.ts
git add website/src/app/api/mentor/stoa/draft-reflect/route.ts
git add website/src/app/api/mentor/stoa/draft-reflect/__tests__/r20a-invocation.test.ts
git add website/src/lib/__tests__/r20a-invocation-guard.test.ts
git add operations/connective-layer-2026-08/2026-08-02-stoa-build-plan.md
git add operations/decision-log.md
git add operations/handoffs/founder/2026-08-03-stoa-ST6-draft-mirror-reading-CLOSE.md
git add operations/handoffs/founder/2026-08-03-stoa-ST6-draft-mirror-reading-NEXT-SESSION-PROMPT.md
git add operations/handoffs/founder/2026-08-03-stoa-ST6-activation-NEXT-SESSION-PROMPT.md
```
Do NOT `git add -A` — the tree carries other sessions' unrelated strays (brand assets, an SDK lockfile, agent-card.json/llms.txt/api-docs edits from another in-flight session, a superseded docx).
