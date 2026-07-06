# Next-Session Prompt — /api/score-conversation Distress Wiring (Foundation Completion, Session 2)

**For the founder. Paste as the first message of a fresh session.** (Rename the date prefix to the actual session date.)

**Stream:** founder.
**Tier:** **`code-critical` (full 0c-ii)** — wires the R20a human-distress check into a live human-facing route. Build **dark + flag-gated** (repo-only; production byte-identical flag-off, test-asserted); the **activation is founder-walked** (Vercel flag + redeploy + live smoke; AC7 engaged at activation, not at build).
**Governing decisions:** R20a (the safety floor) + the S8b 0h-exit blocker (c) (`D-PRELAUNCH-S8B-...`, decision-log ~10585) + the founder-approved foundation-completion plan (2026-07-07, Session 2 of 2).
**Predecessor:** `D-FOUNDATION-COMPLETION-SESSION1-RECORD-CATCHUP-CRISIS-LINES-KEY-DEFAULTS` (Session 1 — commits `fed98eb`/`3ca5e5e`/`3b6b835`).

## Why this session
`website/src/app/api/score-conversation/route.ts` is the **last unwired S8b 0h-exit blocker**: it is a human-facing tool route with **zero** distress/R20a hits, while the rest of the human perimeter is gated (four R20a flags live since 2026-05-31). S8a named it the "inside-perimeter exception". Until this lands, a human in distress can submit a conversation for scoring and receive a philosophical evaluation instead of the crisis redirect.

## Part A — Open under the protocol
Read: `/adopted/standing-protocol-cache.md` (failure modes; tier confirm); the S8a/S8b closes + the decision-log blocker (c) entry for the named exception's exact intent; the existing R20a wiring pattern — the `SUBSTRATE_CALLING_R20A_ENABLED` / `SUBSTRATE_REFLECT_R20A_ENABLED` routes, `website/src/lib/r20a-classifier.ts` (two-stage detect + `buildRedirectMessage`), `website/src/lib/guardrails.ts` (`detectDistress`, `CRISIS_RESOURCES` — note the 2026-07-07 7-line list), and the audience-correct rendering suite (`src/app/api/reason/__tests__/r20a-audience-rendering.test.ts`). Memories: `nextjs-route-export-validation` (any route.ts change is gated by `npm run build`, not just tsc), `tsx-tests-setinterval-keepalive-hang`.

## Part B — What to build (dark, flag-gated)
1. A new flag `SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED` (UNSET everywhere ⇒ the route byte-identical, **test-asserted**).
2. Flag-on: run the established two-stage distress check over the submitted conversation input **before** any evaluation; on `acute`/`moderate` → the **human-audience** crisis rendering (this is a human tool route — the human crisis message, not the developer-form payload); `mild` → resources folded into the response without blocking, matching the existing perimeter semantics.
3. Reuse the shared helpers — do NOT re-implement detection or rendering (PR15; the perimeter routes are the pattern).
4. Mind the conversation shape: the route scores a multi-turn conversation — decide (and record) whether the check runs over the full transcript or the user-authored turns; the perimeter intent is the human's words.

## Part C — Verify
- Unit battery: flag-off byte-identity; flag-on acute/moderate/mild/benign paths; audience-correct rendering (human message, never the developer form). Run the r20a suites + the new tests; `tsc` 0; **`npm run build` 0** (route file).
- Adversarial pre-activation review per the Critical Change Protocol (focused subagent fan-out; fail-open/fail-closed posture explicitly checked — an outage of the stage-2 evaluator must not silently drop the floor below the regex stage).

## Part D — Founder-walked activation (AC7)
Set `SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED=true` in Vercel Production + redeploy → live smoke: a distress probe returns the crisis redirect (with the 7-line resource list incl. Shout UK + 988 CA); a benign probe returns a normal score. Rollback = unset the flag + redeploy (byte-identical). Publish nothing new (R20a wiring is internal); update the S8b blocker record + decision log + CLAUDE.md production state.

## Forecast
Ends with the last S8b 0h-exit safety blocker closed and the foundation complete — the founder then requests the **new build plan** (where the corroboration-check fork, decided build-near-term on 2026-06-27, is weighed per the 2026-07-07 scope election). The **0h call remains the founder's.**

End of prompt.
