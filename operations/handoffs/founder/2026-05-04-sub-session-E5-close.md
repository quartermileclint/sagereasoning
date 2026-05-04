# Session Close — 2026-05-04 — Sub-session E5: /api/score-document deep-depth wiring via Pattern A1 (Group B first consumer)

**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md` (cached via `/adopted/standing-protocol-cache.md`).
**Tier:** code-elevated — Elevated risk under 0d-ii (highest-risk action: changes to existing user-facing functionality on `/api/score-document`; ADR-001 amendment; new sibling wrapper).
**Date:** 2026-05-04.

## Decisions Made

- **D-PATTERN-A1-INTRODUCED-AND-WIRED-2026-05-04** appended to active log (~95 lines). Combined entry covering four interlocking changes from this session: (1) ADR-001 amended in-session to specify Pattern A1 (route-managed; manual injection) and retrospectively name Pattern A2; (2) new sibling wrapper `loadLayer1BlockWithFallback` adopted at `/website/src/lib/rag/`; (3) `/api/score-document` deep-depth Layer 1 wired via Pattern A1 (first Group B consumer); (4) harness Phase G added (G3 = G1 substrate-continuity + G2 Pattern-A1 wrapper-surface; total checks 75 → 107).

## Status Changes

| Item | Old status | New status |
|---|---|---|
| ADR-001 (`/adopted/adr/2026-05-04-d6-d7-consumer-wiring.md`) | Adopted with Pattern A2 documented; Pattern A1 deferred | **Amended in-session** — Pattern A1 specification added (six-point spec + risk-classification subsection); Pattern A2 retrospectively named; strike-through correction in "What this ADR does not decide"; changelog entry "2026-05-04 (in-session amendment, Sub-session E5)" appended. ADR remains **Adopted** under 0f decision-status vocabulary. |
| `/website/src/lib/rag/load-layer1-block-with-fallback.ts` | Did not exist | **Wired** pre-run as a new file (~108 lines); reaches Verified-in-place on founder harness pass. Sibling to `load-layer1-with-fallback.ts`; signature `(input, depth, cache, routeName) => Promise<string>`; success returns `formatRetrievedPassagesAsBlock(top)`; fallback (catch-all + empty-result guard) returns `getStoicBrainContext(depth)`. |
| `/api/score-document` deep-depth Layer 1 wiring | static `getStoicBrainContext('deep')` (compiled-string path; module-loaded synchronously at line 126) | **Wired** pre-run with Pattern A1 — sibling wrapper invoked inside `Promise.all` alongside L2 + L3 loads; per-request `Map<string, RetrieveResult>` cache (KG1 rule 4); the `client.messages.create` system array shape is unchanged (only the second-block text source changes); R20a distress check unchanged at line 114; reaches Verified on founder harness pass. |
| `/website/scripts/verify-reason-rag.ts` | 75 checks across phases A/B/C/D/E/F | **Wired** at 107 checks via Phase G added (G1 = 16 via `runConsumerWiringPhase('G', 'deep', …)`; G2 = 16 via bespoke `loadLayer1BlockWithFallback` assertions: non-empty + header + bracketed citation + ceiling + parity-with-direct-format per fixture, plus 1 cache replay); reaches Verified on founder harness pass. |
| Phase-2 pass-1 rollout inventory | five consumers Verified (Group A complete) | **Six rollout consumers Verified-in-place on founder harness pass** (above five + `/api/score-document` deep-depth via Pattern A1); Group A complete + Group B first member wired; both pattern dimensions now proven on real consumers — Pattern A2 (engine-managed; four user-facing consumers) + Pattern A1 (route-managed; one user-facing consumer); the sibling wrapper substrate added to the inventory as a new "E5 substrate" item. |

## Next Session Should

**Sub-session E6 — `/api/score-scenario` deep-depth wiring via Pattern A1 (Group B second consumer).** No ADR amendment work — the Pattern A1 specification was completed at E5 and the sibling wrapper substrate is in place. The session shape mirrors E4 in scope (single-consumer wiring) but the wiring goes through Pattern A1 rather than Pattern A2 — i.e., the route calls `loadLayer1BlockWithFallback` directly and injects the returned string into its own `client.messages.create` system array's second block (replacing the predecessor `getStoicBrainContext(depth)` call site at whatever depth `/api/score-scenario` currently runs). Estimated 1.5–2.5 hours (lighter than E5; no governance-document edits and no new substrate). Pre-conditions for E6: founder commits + pushes this session's six artefacts before E6 opens; founder runs the E5 harness independently and confirms 107/107 PASS before E6 begins (verifies E5 introduced no regression on the shared substrate and that Pattern A1's first surface is solid before the second is added).

Next-session prompt: `/operations/handoffs/founder/2026-05-XX-sub-session-E6-NEXT-SESSION-PROMPT.md`.

## Blocked On

**Files remaining uncommitted at session close:**

- `/adopted/adr/2026-05-04-d6-d7-consumer-wiring.md` (modified — Pattern A1 section + strike-through + changelog)
- `/website/src/lib/rag/load-layer1-block-with-fallback.ts` (new file)
- `/website/src/app/api/score-document/route.ts` (modified — Pattern A1 wiring)
- `/website/scripts/verify-reason-rag.ts` (modified — Phase G added; 107 checks total)
- `/operations/decision-log.md` (one entry appended, ~95 lines)
- `/operations/handoffs/founder/2026-05-04-sub-session-E5-close.md` (this file)
- `/operations/handoffs/founder/2026-05-XX-sub-session-E6-NEXT-SESSION-PROMPT.md` (next-session prompt)

**Production state at session close:**

- Vercel deployment: unchanged from E4 at the moment of session close. The new wiring deploys on the founder's push. Public-facing surface change: `/api/score-document` deep-depth now reads Layer 1 from the indexed corpus instead of compiled-string constants. If retrieval fails at runtime, the route silently falls back to the compiled-string path — users see a working response either way. No other surfaces touched this session. The route's R20a distress check + auth + rate-limit + DB writes + envelope are all unchanged.
- Supabase `supabase-us`: unchanged; no DDL or data writes this session.
- AC7 standing constraint: NOT engaged at any edit this session.

## Open Questions

1. **Character-count gap likely repeats at deep depth on this consumer.** Same structural pattern as E1–E4 (3-5× shrinkage from compiled to retrieved). Mitigations identical to predecessor sessions. Phase-2 production observation candidate.

2. **Pattern A1's fallback runtime path is not exercised by the harness.** G2 covers the success-path contract (parity with `formatRetrievedPassagesAsBlock(top)`); the catch branch + empty-result guard fire only on an actual D6/D7 failure. Same pattern as `loadLayer1WithFallback` — also not exercised by the harness in the catch branch. Phase-2 production observation candidate.

3. **`/api/reason/helpers.ts` shim is removable but retained.** Continuity item from E3 + E4. Eligible for removal after E6 confirms no stale imports across all wired consumers.

4. **`/api/score-social` route metadata inconsistency** (open question #2 from `D-SCORE-SOCIAL-RAG-WIRED-2026-05-04`). Out of scope for E5; a future Standard-risk session can fix the metadata report.

5. **Group B second consumer (`/api/score-scenario`) wiring scheduled for E6.** Same pattern, same substrate; lighter session than E5.

6. **`/api/score-decision` loop-pattern remains separately deferred.** Multi-option design dimension not in scope for E5–E6.

*Findings #1 + #3 + #6 are continuity items from E1–E4; #2 + #5 are new/updated this session; #4 is carried forward from E4. None session-blocking.*

## Founder Verification

Open Terminal, paste this exact block, press **Enter** (one combined command — adds all seven files and commits):

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git add adopted/adr/2026-05-04-d6-d7-consumer-wiring.md website/src/lib/rag/load-layer1-block-with-fallback.ts website/src/app/api/score-document/route.ts website/scripts/verify-reason-rag.ts operations/decision-log.md operations/handoffs/founder/2026-05-04-sub-session-E5-close.md operations/handoffs/founder/2026-05-XX-sub-session-E6-NEXT-SESSION-PROMPT.md && git commit -m "session close: /api/score-document wired with D6/D7 at deep depth via Pattern A1 — 2026-05-04 (Sub-session E5)

- D-PATTERN-A1-INTRODUCED-AND-WIRED-2026-05-04 — ADR-001 amended; sibling wrapper adopted; first Group B consumer wired
- adr/2026-05-04-d6-d7-consumer-wiring.md — Pattern A1 spec (six points + risk class) inserted; Pattern A2 retrospectively named; strike-through correction; changelog entry
- /lib/rag/load-layer1-block-with-fallback.ts — new sibling wrapper (Promise<string>); shared helpers + formatter; identical fallback semantics to load-layer1-with-fallback
- /api/score-document/route.ts — D6/D7 wired at deep depth via Pattern A1; second system block source swapped from getStoicBrainContext('deep') to wrapper output; per-request Map cache; client.messages.create shape unchanged
- verify-reason-rag.ts — Phase G added (G3 = G1 substrate continuity + G2 wrapper surface); total 75 → 107 checks
- Engine signature unchanged; tsc --noEmit -p . clean (exit 0)
- Elevated risk; AC7 NOT engaged; PR6 NOT engaged; Critical Change Protocol NOT engaged
- Phase-2 pass-1 readiness inventory: six rollout consumers Verified (Candidate C + 4 Pattern A2 + 1 Pattern A1); Group A complete; Group B first member wired; both pattern dimensions proven on real consumers; E6 = /api/score-scenario via Pattern A1 (Group B second consumer; no ADR amendment)"
```

Then push via **GitHub Desktop**: open GitHub Desktop → select sagereasoning repo → click **Push origin**. Vercel auto-redeploys on push to main. Public-facing change: `/api/score-document` deep-depth now reads Layer 1 from the indexed corpus.

If `git add` fails with `index.lock` errors (D-LOCK-CLEANUP-2026-04-26 pattern), paste this in Terminal first then retry:

```
rm "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"
```

**Independent verification of the wiring** (re-run any time after deploy):

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx -y tsx scripts/verify-reason-rag.ts 2>&1 | tee ../operations/migrations/2026-05-04-verify-reason-rag-output-E5.log
```

Expected: `SUMMARY: 107 / 107 checks passed` followed by `ALL CHECKS PASSED`. (E4 was 75/75; Phase G adds 32 at deep depth — G1 contributes 16 via `runConsumerWiringPhase`, G2 contributes 16 via the bespoke wrapper assertions: 5 per fixture × 3 fixtures + 1 cache replay.) Latencies will vary 700–4000ms cold; G2 cache replay should be under 200ms. The Phase B + D + E + F re-runs verify the shared Pattern A2 substrate continues to serve all four predecessor consumers without regression.

## Cross-references

- `/operations/handoffs/founder/2026-05-04-sub-session-E4-close.md` (predecessor — Sub-session E4: `/api/score-social` standard-depth Pattern A2 wiring; Group A complete)
- `/operations/handoffs/founder/2026-05-XX-sub-session-E5-NEXT-SESSION-PROMPT.md` (this session's opening prompt)
- `/operations/handoffs/founder/2026-05-XX-sub-session-E6-NEXT-SESSION-PROMPT.md` (next session — `/api/score-scenario` deep-depth via Pattern A1; Group B second consumer; no ADR amendment)
- `/operations/decision-log.md` `D-PATTERN-A1-INTRODUCED-AND-WIRED-2026-05-04` (this session's entry)
- `/operations/decision-log.md` `D-SCORE-SOCIAL-RAG-WIRED-2026-05-04` (E4 — Group A second consumer)
- `/operations/decision-log.md` `D-CONSUMER-WIRING-LIFT-2026-05-04` (E3 — substrate origin)
- `/operations/decision-log.md` `D-SCORE-RAG-WIRED-2026-05-04` (E2 — third consumer)
- `/operations/decision-log.md` `D-REASON-RAG-WIRED-2026-05-04` (E1 — second consumer; pattern source)
- `/operations/decision-log.md` `D-INTERNAL-RETRIEVE-ROUTE-VERIFIED-2026-05-04` (Sub-session D — first consumer + ADR-001 origin)
- `/operations/decision-log.md` `D-RETRIEVAL-RERANK-IMPLEMENTED-2026-05-04` (D6 + D7 modules)
- `/adopted/adr/2026-05-04-d6-d7-consumer-wiring.md` (ADR-001 — amended this session; Pattern A1 specified, Pattern A2 retrospectively named)
- `/adopted/standing-protocol-cache.md` (operative governing frame)
- `/adopted/rag-mentor-alt3/retrieval-interface.md` (D6 — contract used)
- `/adopted/rag-mentor-alt3/re-rank-design.md` (D7 — heuristic policy invoked)
- `/website/src/lib/rag/helpers.ts` (S2 lift — unchanged this session; consumed via the sibling wrapper)
- `/website/src/lib/rag/load-layer1-with-fallback.ts` (Pattern A2 wrapper — unchanged this session; sibling)
- `/website/src/lib/rag/load-layer1-block-with-fallback.ts` (Pattern A1 wrapper — new this session)
- `/website/src/app/api/score-document/route.ts` (the consumer wired this session)
- `/website/src/app/api/score-conversation/route.ts` (E3 consumer — Pattern A2 deep-depth twin for substrate continuity)
- `/website/src/lib/sage-reason-engine.ts` (engine — unchanged this session; `formatRetrievedPassagesAsBlock` exported and consumed by both Pattern A1 wrapper + harness G2)
- `/website/scripts/verify-reason-rag.ts` (verification harness — Phase G added; 107 checks total)

*End of session close. PR1 rollout phase: sixth consumer Wired-pre-run; reaches Verified on founder harness pass. Group A complete + Group B first member wired. Both pattern dimensions proven on real consumers — Pattern A2 (engine-managed; four user-facing consumers via the original wrapper) + Pattern A1 (route-managed; one user-facing consumer via the new sibling wrapper). E6 = `/api/score-scenario` via Pattern A1 (Group B second consumer; no ADR amendment work).*
